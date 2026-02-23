// --- VERSION OPTIMISÉE DU DRAWER --- //

import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList, useDrawerStatus } from '@react-navigation/drawer';
import { colors } from '../../theme/colors';
import {
  Home,
  History as HistoryIcon,
  User,
  Sparkles,
  FileText,
  Image as ImageIcon,
  MessageCircle, // Social
  Mail, // Email
  Megaphone, // Ad
  Video, // Video
  Briefcase, // Job fallback
  LayoutTemplate, // Flyer/Poster
} from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { AiService } from '../../api/ai.service';
import { GenericModal } from '../../components/ui/GenericModal';
import { LogOut, Trash2, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';

dayjs.extend(relativeTime);
dayjs.locale('fr');

interface HistoryItem {
  id: string;
  type: string;
  title: string;
  date: string;
  preview: string;
  imageUrl?: string;
  attributes?: any; // Keep attributes for smart label logic
}

function CustomDrawerContent(props: any) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [history, setHistory] = useState<any[]>([]);
  const [allHistory, setAllHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(20);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Delete Logic
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace('/(auth)/login');
  };

  const handleDeleteItem = async () => {
    console.log('[Drawer] handleDeleteItem triggered. itemToDelete:', itemToDelete);
    if (itemToDelete) {
      try {
        console.log('[Drawer] Calling AiService.deleteGeneration with ID:', itemToDelete);
        const result = await AiService.deleteGeneration(itemToDelete);
        console.log('[Drawer] Deletion result from API:', result);
        setAllHistory((prev) => prev.filter((i) => i.id !== itemToDelete));
        setHistory((prev) => prev.filter((i) => i.id !== itemToDelete));
      } catch (e) {
        console.error('[Drawer] Failed to delete item', e);
        alert("Erreur lors de la suppression. Veuillez réessayer.");
      } finally {
        setShowDeleteModal(false);
        setItemToDelete(null);
      }
    }
  };

  const loadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setDisplayedCount((prev) => Math.min(prev + 15, allHistory.length));
      setLoadingMore(false);
    }, 300);
  };

  /** ============================
   *   FETCH HISTORY
   * ============================ */
  const isDrawerOpen = useDrawerStatus() === 'open';

  useEffect(() => {
    if (user?.type === 'ai' && isDrawerOpen) {
      loadHistory();
    }
  }, [user, isDrawerOpen]);

  const generateTitle = (item: any): string => {
    // Priority 1: explicit title (if exists and not "Sans titre")
    if (item.title && item.title.trim() && item.title !== 'Sans titre') {
      return item.title;
    }

    // Priority 2: Use prompt (main source for new data)
    let textToProcess = (item.prompt || item.result || '').trim();

    // JSON Handling for unified chat
    if (textToProcess.startsWith('[') || textToProcess.startsWith('{')) {
      try {
        const parsed = JSON.parse(textToProcess);
        if (Array.isArray(parsed)) {
          const firstUser = parsed.find((m: any) => m.role === 'user');
          if (firstUser) textToProcess = firstUser.content;
          else if (parsed.length > 0) textToProcess = parsed[0].content;
        }
      } catch (e) { /* fallback */ }
    }

    if (textToProcess && textToProcess.length > 0) {
      // Extract meaningful phrase - respect original case and language
      const cleaned = textToProcess.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
      const maxLength = 50;
      if (cleaned.length > maxLength) {
        return cleaned.substring(0, maxLength).trim() + '...';
      }
      return cleaned;
    }

    // Priority 3: Fallback to attributes for old data without prompt
    let attrs = item.attributes;
    if (typeof attrs === 'string') {
      try {
        attrs = JSON.parse(attrs);
      } catch (e) {
        attrs = {};
      }
    }

    // Try to construct a title from attributes
    const funcLabel = attrs?.function?.split('(')?.[0]?.trim() || '';
    const jobLabel = attrs?.job?.trim() || '';
    const style = attrs?.selectedStyle?.trim() || '';
    const userQuery = attrs?.userQuery?.trim() || '';

    if (userQuery) {
      const cleaned = userQuery.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
      const maxLength = 50;
      if (cleaned.length > maxLength) {
        return cleaned.substring(0, maxLength).trim() + '...';
      }
      return cleaned;
    }

    if (funcLabel) {
      if (style) {
        return `${funcLabel} • ${style}`;
      }
      if (jobLabel) {
        return `${jobLabel} • ${funcLabel}`;
      }
      return funcLabel;
    }

    if (jobLabel && style) {
      return `${jobLabel} • ${style}`;
    }

    if (style) {
      return style;
    }

    return 'Sans titre';
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      setHistoryError(null);
      const data = await AiService.getGroupedConversations();
      console.log('[DRAWER] Conversations loaded:', data?.length, 'items');
      if (data && Array.isArray(data)) {
        const mappedData: HistoryItem[] = data.map((item: any) => ({
          id: item.id.toString(),
          type: 'chat',
          title: item.title || 'Sans titre',
          date: dayjs(item.date).fromNow(),
          preview: `${item.count || item.items?.length || 1} message${(item.count || item.items?.length || 1) > 1 ? 's' : ''}`,
          imageUrl: item.imageUrl,
          attributes: item,
        }));
        setAllHistory(mappedData);
        setHistory(mappedData.slice(0, 20));
        setDisplayedCount(20);
        console.log('[DRAWER] Displayed:', mappedData.slice(0, 20).length, 'conversations');
      }
    } catch (err: any) {
      console.error('Failed to fetch drawer history', err);
      const errorMsg = err?.response?.data?.message || err?.message || 'Impossible de charger l\'historique';
      setHistoryError(errorMsg);
      setAllHistory([]);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  // Update displayed history when displayedCount changes
  useEffect(() => {
    if (allHistory.length > 0) {
      setHistory(allHistory.slice(0, displayedCount));
    }
  }, [displayedCount, allHistory]);

  /** ============================
   *   USER SAFE DATA
   * ============================ */


  const userName = user?.name || 'Utilisateur';

  const userAvatar = (user?.logoUrl || user?.avatarUrl)
    ? `https://hipster-api.fr${user.logoUrl || user.avatarUrl}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;

  console.log(userAvatar);

  return (
    <View style={{ flex: 1, backgroundColor: "#0d0d0d" }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0, backgroundColor: "#0d0d0d" }}>
        {/* ============================
            HEADER
        ============================ */}
        <View style={styles.headerContainer}>
          {/* USER */}
          <View style={styles.userColumn}>
            <Image source={{ uri: userAvatar }} style={styles.avatar} />
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
              <Text style={styles.userEmail} numberOfLines={1}>{user?.email}</Text>
            </View>
          </View>

        </View>

        <View style={styles.separator} />

        {/* ============================
            NAVIGATION
        ============================ */}
        <View style={styles.menuContainer}>
          <DrawerItemList {...props} />

          <TouchableOpacity
            style={styles.newChatButton}
            onPress={() => {
              props.navigation.closeDrawer();
              router.push({
                pathname: '/(drawer)',
                params: { reset: 'true' }
              });
            }}>
            <Plus size={20} color={colors.primary.main} />
            <Text style={styles.newChatText}>Nouvelle discussion</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        {/* ============================
            RECENT HISTORY
        ============================ */}
        {/* ============================
            RECENT HISTORY (AI ONLY)
        ============================ */}
        {user?.type === 'ai' && (
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Récemment</Text>
              <TouchableOpacity onPress={() => router.push('/(drawer)/history')}>
                <Text style={styles.historySeeAll}>Voir tout</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="small" color={colors.text.muted} style={{ marginTop: 20 }} />
            ) : historyError ? (
              <View style={{ marginTop: 20, padding: 12, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, borderLeftWidth: 3, borderLeftColor: colors.status.error }}>
                <Text style={{ fontSize: 12, color: colors.status.error, fontWeight: '500' }}>
                  {historyError}
                </Text>
              </View>
            ) : (
              <View style={{ marginTop: 10, width: '100%' }}>
                {history.map((item, index) => {
                  const attr = item.attributes || {};

                  // For grouped conversations, the label is the title
                  const label = item.title || 'Sans titre';

                  // All items are now chats (conversations), so use MessageCircle icon
                  const IconComponent = MessageCircle;

                  return (
                    <View key={item.id || index} style={styles.historyRowContainer}>
                      <TouchableOpacity
                        style={styles.historyItem}
                        onPress={() =>
                          router.push({
                            pathname: '/(drawer)',
                            params: { conversationId: item.id },
                          })
                        }>
                        <View style={{ width: 24, alignItems: 'center' }}>
                          <IconComponent size={16} color={colors.text.muted} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text numberOfLines={1} style={styles.historyItemText}>
                            {label}
                          </Text>
                          <Text numberOfLines={1} style={styles.historyItemSubtext}>
                            {item.preview} • {item.date}
                          </Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteMiniButton}
                        onPress={() => {
                          setItemToDelete(item.id);
                          setShowDeleteModal(true);
                        }}>
                        <Trash2 size={16} color={colors.text.muted} />
                      </TouchableOpacity>
                    </View>
                  );
                })}

                {displayedCount < allHistory.length && (
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={loadMore}
                    disabled={loadingMore}>
                    <Text style={styles.loadMoreText}>
                      {loadingMore ? 'Chargement...' : 'Charger plus'}
                    </Text>
                  </TouchableOpacity>
                )}

                {!history.length && <Text style={styles.emptyHistory}>Aucun historique récent</Text>}
              </View>
            )}
          </View>
        )}

        {/* Footer Logout */}
        <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}>
          <TouchableOpacity style={styles.logoutButton} onPress={() => setShowLogoutModal(true)}>
            <LogOut size={20} color={colors.status.error} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>

      <GenericModal
        visible={showLogoutModal}
        type="confirmation"
        title="Déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        confirmText="Se déconnecter"
        cancelText="Annuler"
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />

      <GenericModal
        visible={showDeleteModal}
        type="warning"
        title="Supprimer"
        message="Voulez-vous vraiment supprimer cet élément de l'historique ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteItem}
      />
    </View>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerContentContainerStyle: { backgroundColor: '#0d0d0d' },
        drawerStyle: {
          backgroundColor: '#0d0d0d',
          borderRightWidth: 1,
          borderRightColor: 'rgba(255,255,255,0.08)',
          width: '80%',
        },
        drawerActiveBackgroundColor: 'rgba(255,255,255,0.08)',
        drawerActiveTintColor: colors.primary.main,
        drawerInactiveTintColor: colors.text.secondary,
        drawerLabelStyle: {
          marginLeft: 15,
          fontSize: 15,
          fontWeight: '600',
        },
      }}>
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Accueil',
          drawerIcon: ({ color }) => <Home size={22} color={color} />,

        }}
      />

      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: 'Mon Profil',

          drawerIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />

      <Drawer.Screen
        name="history"
        options={{
          drawerLabel: 'Historique',
          drawerIcon: ({ color }) => <HistoryIcon size={22} color={color} />,
        }}
      />

      <Drawer.Screen
        name="subscription"
        options={{
          drawerLabel: 'Abonnement',
          drawerIcon: ({ color }) => <Sparkles size={22} color={color} />,
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  /* ----- HEADER ----- */
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 35,
    marginTop: 40,
    alignItems: 'center',
  },
  userColumn: {
    alignItems: 'center',
    gap: 12,
  },
  userInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  avatar: {
    width: 180,
    height: 180,
    borderRadius: 140,
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary,
  },
  userEmail: {
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 2,
  },

  /* ----- COMPANY ----- */
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  logoContainer: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyLogo: {
    width: '100%',
    height: '100%',
  },
  companyName: {
    fontSize: 15,
    color: colors.text.secondary,
    fontWeight: '500',
  },

  /* ----- MENU ----- */
  menuContainer: {
    paddingVertical: 10,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 10,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  newChatText: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },

  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: 5,
  },

  /* ----- HISTORY ----- */
  historySection: {
    padding: 20,
    paddingBottom: 40,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTitle: {
    color: colors.text.secondary,
    fontWeight: '700',
    letterSpacing: 0.8,
    fontSize: 13,
    textTransform: 'uppercase',
  },
  historySeeAll: {
    color: colors.primary.main,
    fontWeight: '500',
    fontSize: 12,
  },
  historyRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    paddingRight: 10,
  },
  deleteMiniButton: {
    padding: 10,
  },
  historyItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  historyItemText: {
    color: colors.text.primary,
    fontSize: 14,
    flex: 1,
  },
  emptyHistory: {
    marginTop: 15,
    color: colors.text.muted,
    fontSize: 13,
    fontStyle: 'italic',
  },
  historyItemSubtext: {
    color: colors.text.muted,
    fontSize: 12,
    marginTop: 2,
  },
  loadMoreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  loadMoreText: {
    color: colors.primary.main,
    fontWeight: '600',
    fontSize: 13,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  logoutText: {
    color: colors.status.error,
    fontSize: 15,
    fontWeight: '600',
  },
});
