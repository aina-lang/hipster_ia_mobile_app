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
  MessageCircle,
  Plus,
  LogOut,
  Trash2,
  Zap,
  Layout,
  Cpu,
  GalleryHorizontal,
  Users,
} from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { AiService } from '../../api/ai.service';
import { GenericModal } from '../../components/ui/GenericModal';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { NeonButton } from '../../components/ui/NeonButton';
import { useChatStore } from '../../store/chatStore';
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
  attributes?: any;
}

const CreditsDisplay = ({ user }: { user: any }) => {
  // Credits display hidden in drawer
  return null;
};

function CustomDrawerContent(props: any) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [history, setHistory] = useState<any[]>([]);
  const [allHistory, setAllHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(5);
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

        // If the deleted conversation is the currently active one in the chat screen,
        // navigate to index with reset=true to clear it
        const activeConversationId = useChatStore.getState().conversationId;
        console.log('[Drawer] Active conversationId in store:', activeConversationId, '| Deleted:', itemToDelete);
        if (activeConversationId === itemToDelete) {
          console.log('[Drawer] Deleted active conversation, resetting chat screen...');
          props.navigation.closeDrawer();
          router.push({ pathname: '/(drawer)', params: { reset: 'true' } });
        }
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
        setHistory(mappedData.slice(0, 5));
        setDisplayedCount(5);
        console.log('[DRAWER] Displayed:', mappedData.slice(0, 5).length, 'conversations');
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
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0, backgroundColor: colors.background.primary }}>
        {/* ============================
            HEADER
        ============================ */}
        <View style={styles.headerWrapper}>
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.15)', 'transparent']}
            style={styles.headerGradient}
          />
          <View style={styles.headerContainer}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarGlow} />
              <Image source={{ uri: userAvatar }} style={styles.avatar} />
              <View style={styles.statusBadge} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
              <Text style={styles.userEmail} numberOfLines={1}>{user?.email}</Text>
            </View>
          </View>

          <CreditsDisplay user={user} />
        </View>

        <View style={styles.separator} />

        {/* ============================
            NAVIGATION
        ============================ */}
        <View style={styles.menuContainer}>
          <DrawerItemList {...props} />

          <NeonButton
            title="Nouveau Projet"
            icon={Plus}
            variant="premium"
            onPress={() => {
              props.navigation.closeDrawer();
              router.push({
                pathname: '/(drawer)',
                params: { reset: 'true' }
              });
            }}
            style={styles.newChatNeonButton}
          />
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
                    onPress={loadMore}>
                    <Text style={styles.loadMoreText}>
                      Voir plus
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

import { usePathname } from 'expo-router';

export default function DrawerLayout() {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) return;

    // Subscription Guard
    const planType = user.planType || 'curieux';
    const subStatus = user.subscriptionStatus;
    const stripeId = user.stripeCustomerId;
    const isSubscriptionActive = subStatus === 'active' || subStatus === 'trialing' || subStatus === 'trial';
    const isPackCurieux = planType === 'curieux';

    const now = new Date();
    const endDate = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
    const isExpired = endDate && now > endDate;

    const isTrialButNoCard = isPackCurieux && !stripeId;

    // Credit limits for ALL plans (block index only)
    const promptsLimit = user.promptsLimit || 0;
    const imagesLimit = user.imagesLimit || 0;
    const videosLimit = user.videosLimit || 0;
    const audioLimit = user.audioLimit || 0;
    const threeDLimit = user.threeDLimit || 0;

    // Check if limits are defined (not 999999) and exceeded
    const isTextExhausted = promptsLimit > 0 && promptsLimit !== 999999 && (user.promptsUsed || 0) >= promptsLimit;
    const isImagesExhausted = imagesLimit > 0 && imagesLimit !== 999999 && (user.imagesUsed || 0) >= imagesLimit;
    const isVideosExhausted = videosLimit > 0 && videosLimit !== 999999 && (user.videosUsed || 0) >= videosLimit;
    const isAudioExhausted = audioLimit > 0 && audioLimit !== 999999 && (user.audioUsed || 0) >= audioLimit;
    const isThreeDExhausted = threeDLimit > 0 && threeDLimit !== 999999 && (user.threeDUsed || 0) >= threeDLimit;

    // A user is fully exhausted if they reached the limit for ALL their available credit types
    const isFullyExhausted = isTextExhausted && isImagesExhausted && isVideosExhausted && isAudioExhausted && isThreeDExhausted;

    // Critical block (expired trial or inactive sub) -> Global
    const isCriticalInvalid = !isSubscriptionActive || isTrialButNoCard || (isPackCurieux && isExpired);

    // If critical invalid OR (exhausted AND on Home) -> Redirect
    const shouldBlockHome = isFullyExhausted && (pathname === '/' || pathname === '/(drawer)/' || pathname === '/(drawer)');
    const isGlobalBlock = isCriticalInvalid;

    if ((isGlobalBlock || shouldBlockHome) && pathname !== '/subscription' && pathname !== '/(drawer)/subscription') {
      console.log('[DrawerLayout] Blocking access - redirecting to /subscription. Reason: ', { isGlobalBlock, shouldBlockHome });
      router.replace('/subscription');
    }
  }, [user, pathname]);

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

      <Drawer.Screen
        name="referral"
        options={{
          drawerLabel: 'Parrainage',
          drawerIcon: ({ color }) => <Users size={22} color={color} />,
        }}
      />

    </Drawer>
  );
}

const styles = StyleSheet.create({
  /* ----- HEADER ----- */
  headerWrapper: {
    paddingBottom: 10,
    overflow: 'hidden',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    padding: 3,
  },
  avatarGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 170,
    backgroundColor: colors.primary.main,
    opacity: 0.2,
    transform: [{ scale: 1.1 }],
  },
  avatar: {
    width: 190,
    height: 190,
    borderRadius: 145,
    borderWidth: 2,
    borderColor: colors.primary.main,
    backgroundColor: colors.background.tertiary,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 10,
    right: 15,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.status.success,
    borderWidth: 3,
    borderColor: colors.background.primary,
  },
  userInfo: {
    alignItems: 'center',
    marginTop: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 13,
    color: colors.text.muted,
    marginTop: 2,
  },

  /* ----- CREDITS ----- */
  creditsContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  creditsBlur: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  creditsGradient: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  creditItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  creditIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  creditValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  creditLabel: {
    fontSize: 10,
    color: colors.text.muted,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: -2,
  },
  creditDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  /* ----- MENU ----- */
  menuContainer: {
    paddingVertical: 10,
    gap: 5,
  },
  newChatNeonButton: {
    marginHorizontal: 15,
    marginTop: 10,
  },

  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 8,
    marginHorizontal: 20,
  },

  /* ----- HISTORY ----- */
  historySection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 40,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  historyTitle: {
    color: colors.text.muted,
    fontWeight: '800',
    letterSpacing: 1.5,
    fontSize: 11,
    textTransform: 'uppercase',
  },
  historySeeAll: {
    color: colors.primary.main,
    fontWeight: '700',
    fontSize: 12,
  },
  historyRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    paddingRight: 5,
  },
  deleteMiniButton: {
    padding: 10,
    opacity: 0.5,
  },
  historyItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  historyItemText: {
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  historyItemSubtext: {
    color: colors.text.muted,
    fontSize: 11,
    marginTop: 2,
  },
  emptyHistory: {
    marginTop: 20,
    color: colors.text.muted,
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadMoreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 10,
  },
  loadMoreText: {
    color: colors.text.muted,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 15,
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.1)',
  },
  logoutText: {
    color: colors.rose[400],
    fontSize: 15,
    fontWeight: '700',
  },
});
