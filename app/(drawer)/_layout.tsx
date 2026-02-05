// --- VERSION OPTIMISÉE DU DRAWER --- //

import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
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
import { LogOut, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';

function CustomDrawerContent(props: any) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Delete Logic
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace('/(auth)/login');
  };

  const handleDeleteItem = async () => {
    if (itemToDelete) {
      try {
        await AiService.deleteGeneration(itemToDelete);
        setHistory((prev) => prev.filter((i) => i.id !== itemToDelete));
      } catch (e) {
        console.error('Failed to delete item', e);
      } finally {
        setShowDeleteModal(false);
        setItemToDelete(null);
      }
    }
  };

  /** ============================
   *   FETCH HISTORY
   * ============================ */
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await AiService.getHistory();
      if (Array.isArray(data)) {
        setHistory(data.slice(0, 10));
      }
    } catch (err) {
      console.error('Failed to fetch drawer history', err);
    } finally {
      setLoading(false);
    }
  };

  /** ============================
   *   USER SAFE DATA
   * ============================ */

  const companyName = user?.aiProfile?.companyName || null;
  const companyLogo = user?.aiProfile?.logoUrl
    ? `https://hipster-api.fr${user.aiProfile.logoUrl}` // <-- sécurise l’URL relative
    : null;

  const userName =
    user?.firstName && user.firstName.trim() !== ''
      ? user.firstName
      : user?.lastName || 'Utilisateur';

  const userAvatar = user?.avatarUrl
    ? `https://hipster-api.fr${user.avatarUrl}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;

  console.log(userAvatar);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.dark }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
        {/* ============================
            HEADER
        ============================ */}
        <View style={styles.headerContainer}>
          {/* USER */}
          <View style={styles.userRow}>
            <Image source={{ uri: userAvatar }} style={styles.avatar} />
            <View>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userRole}>
                {user?.aiProfile?.profileType === 'entreprise' ? 'Entreprise' : 'Particulier'}
              </Text>
            </View>
          </View>

          {/* COMPANY */}
          {companyName && (
            <View style={styles.companyRow}>
              <View style={styles.logoContainer}>
                {companyLogo ? (
                  <Image source={{ uri: companyLogo }} style={styles.companyLogo} />
                ) : (
                  <Sparkles size={14} color={colors.primary.main} />
                )}
              </View>
              <Text numberOfLines={1} style={styles.companyName}>
                {companyName}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.separator} />

        {/* ============================
            NAVIGATION
        ============================ */}
        <View style={styles.menuContainer}>
          <DrawerItemList {...props} />
        </View>

        <View style={styles.separator} />

        {/* ============================
            RECENT HISTORY
        ============================ */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Récemment</Text>
            <TouchableOpacity onPress={() => router.push('/(drawer)/history')}>
              <Text style={styles.historySeeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={colors.text.muted} style={{ marginTop: 20 }} />
          ) : (
            <View style={{ marginTop: 10 }}>
              {history.map((item, index) => {
                const attr = item.attributes || {};

                // Smart Label: "Immobilier • Post Insta"
                let label = item.title || 'Sans titre';
                if (attr.job && attr.function) {
                  const cleanFunc = attr.function.split('(')[0].trim();
                  label = `${attr.job} • ${cleanFunc}`;
                } else if (attr.function) {
                  label = attr.function.split('(')[0].trim();
                }

                // Smart Icon
                let IconComponent = FileText;
                if (item.type === 'image') IconComponent = ImageIcon;

                const funcLower = (attr.function || '').toLowerCase();
                const catLower = (attr.category || '').toLowerCase();

                if (funcLower.includes('social') || catLower.includes('social'))
                  IconComponent = MessageCircle;
                else if (funcLower.includes('email') || catLower.includes('email'))
                  IconComponent = Mail;
                else if (funcLower.includes('publicité') || catLower.includes('ad'))
                  IconComponent = Megaphone;
                else if (funcLower.includes('vidéo') || catLower.includes('video'))
                  IconComponent = Video;
                else if (funcLower.includes('flyer')) IconComponent = LayoutTemplate;

                return (
                  <View key={item.id || index} style={styles.historyRowContainer}>
                    <TouchableOpacity
                      style={styles.historyItem}
                      onPress={() =>
                        router.push({
                          pathname: '/(drawer)',
                          params: { chatId: item.id },
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
                          {item.type === 'chat' || item.type === 'text'
                            ? (item.result || item.prompt || '').replace(/\s+/g, ' ')
                            : (item.prompt || '').replace(/\s+/g, ' ')}
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

              {!history.length && <Text style={styles.emptyHistory}>Aucun historique récent</Text>}
            </View>
          )}
        </View>

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
        drawerStyle: {
          backgroundColor: colors.background.dark,
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
    marginTop: 60,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  userRole: {
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
