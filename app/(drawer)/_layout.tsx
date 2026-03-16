// --- VERSION OPTIMISÉE DU DRAWER v2 --- //

import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, Image, TouchableOpacity, ActivityIndicator,
  StyleSheet, Animated as RNAnimated, Easing, Pressable, Platform,
} from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList, useDrawerStatus } from '@react-navigation/drawer';
import { colors } from '../../theme/colors';
import {
  Home, History as HistoryIcon, User, Sparkles, MessageCircle,
  Plus, LogOut, Trash2, Users,
} from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { AiService } from '../../api/ai.service';
import { GenericModal } from '../../components/ui/GenericModal';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useChatStore } from '../../store/chatStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';

dayjs.extend(relativeTime);
dayjs.locale('fr');

/* ─── CONSTANTS (identiques à packs + accueil) ─── */
const NEON_BLUE  = '#00d4ff';
const NEON_GLOW  = '#0099ff';
const NEON_LIGHT = '#1e9bff';
const AVATAR_SIZE = 190;
const CARD_W = 260; // largeur approximative du drawer pour le trail

interface HistoryItem {
  id: string;
  type: string;
  title: string;
  date: string;
  preview: string;
  imageUrl?: string;
  attributes?: any;
}

/* ─────────────────────────────────────────────
   NEON BORDER AVATAR  (même logique que NeonBorderCard dans packs)
   - Fine bordure circulaire avec un "trail" lumineux qui tourne
───────────────────────────────────────────── */
function AvatarNeonBorder({ children, size }: { children: React.ReactNode; size: number }) {
  const translateX = useRef(new RNAnimated.Value(0)).current;
  const loopRef    = useRef<RNAnimated.CompositeAnimation | null>(null);

  // Circonférence ≈ π * diamètre → on anime sur cette distance
  const TRACK_W = size * Math.PI;

  useEffect(() => {
    loopRef.current?.stop();
    translateX.setValue(0);
    loopRef.current = RNAnimated.loop(
      RNAnimated.timing(translateX, {
        toValue: -TRACK_W,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { resetBeforeIteration: true }
    );
    loopRef.current.start();
    return () => { loopRef.current?.stop(); };
  }, []);

  const outer   = size + 6;   // conteneur légèrement plus grand
  const BORDER  = 2;           // épaisseur de la bordure

  return (
    <View style={{ width: outer, height: outer, alignItems: 'center', justifyContent: 'center' }}>
      {/* ── Couche neon qui tourne ── */}
      <View
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: outer, height: outer,
          borderRadius: outer / 2,
          overflow: 'hidden',
        }}
        pointerEvents="none"
      >
        <RNAnimated.View
          style={{
            position: 'absolute',
            top: 0, bottom: 0,
            left: 0,
            width: TRACK_W * 2,
            transform: [{ translateX }],
          }}
        >
          <LinearGradient
            colors={[
              'transparent',
              NEON_BLUE,
              NEON_LIGHT,
              'transparent',
              'transparent',
              NEON_BLUE,
              NEON_LIGHT,
              'transparent',
            ]}
            locations={[0.05, 0.2, 0.3, 0.45, 0.55, 0.7, 0.8, 0.95]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ width: TRACK_W * 2, height: '100%' }}
          />
        </RNAnimated.View>
        {/* masque intérieur pour créer l'anneau */}
        <View
          style={{
            position: 'absolute',
            top: BORDER,
            left: BORDER,
            right: BORDER,
            bottom: BORDER,
            borderRadius: (outer - BORDER * 2) / 2,
            backgroundColor: '#0d0d0d',
          }}
        />
      </View>

      {/* ── Bloom / glow ── */}
      <View
        style={{
          position: 'absolute',
          top: -4, left: -4, right: -4, bottom: -4,
          borderRadius: (outer + 8) / 2,
          backgroundColor: 'transparent',
          shadowColor: NEON_BLUE,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.45,
          shadowRadius: 14,
          elevation: 8,
        }}
        pointerEvents="none"
      />

      {/* ── Avatar enfant centré ── */}
      {children}
    </View>
  );
}

/* ─────────────────────────────────────────────
   BOUTON "NOUVEAU PROJET"  (même style que ContinuerButton dans packs)
───────────────────────────────────────────── */
function NouveauProjetButton({ onPress }: { onPress: () => void }) {
  const scale    = useRef(new RNAnimated.Value(1)).current;
  const pressIn  = () => RNAnimated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40 }).start();
  const pressOut = () => RNAnimated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();

  return (
    <RNAnimated.View style={[styles.nouveauBtnWrapper, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        style={styles.nouveauBtnPressable}
      >
        <LinearGradient
          colors={['#264F8C', '#0a1628', '#040612']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0, 0.46, 1]}
          style={styles.nouveauBtnGradient}
        >
          <Plus size={16} color="#ffffff" />
          <Text style={styles.nouveauBtnText}>Nouveau Projet</Text>
        </LinearGradient>
      </Pressable>
    </RNAnimated.View>
  );
}

/* ─────────────────────────────────────────────
   CUSTOM DRAWER CONTENT
───────────────────────────────────────────── */
function CustomDrawerContent(props: any) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const [history, setHistory]           = useState<any[]>([]);
  const [allHistory, setAllHistory]     = useState<any[]>([]);
  const [loading, setLoading]           = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [displayedCount, setDisplayedCount]   = useState(5);
  const [historyError, setHistoryError] = useState<string | null>(null);
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
        setAllHistory(prev => prev.filter(i => i.id !== itemToDelete));
        setHistory(prev => prev.filter(i => i.id !== itemToDelete));
        const activeConversationId = useChatStore.getState().conversationId;
        if (activeConversationId === itemToDelete) {
          props.navigation.closeDrawer();
          router.push({ pathname: '/(drawer)', params: { reset: 'true' } });
        }
      } catch {
        alert('Erreur lors de la suppression. Veuillez réessayer.');
      } finally {
        setShowDeleteModal(false);
        setItemToDelete(null);
      }
    }
  };

  const loadMore = () => {
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + 15, allHistory.length));
    }, 300);
  };

  const isDrawerOpen = useDrawerStatus() === 'open';

  useEffect(() => {
    if (user?.type === 'ai' && isDrawerOpen) loadHistory();
  }, [user, isDrawerOpen]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setHistoryError(null);
      const data = await AiService.getGroupedConversations();
      if (data && Array.isArray(data)) {
        const mapped: HistoryItem[] = data.map((item: any) => ({
          id: item.id.toString(),
          type: 'chat',
          title: item.title || 'Sans titre',
          date: dayjs(item.date).fromNow(),
          preview: `${item.count || item.items?.length || 1} message${(item.count || item.items?.length || 1) > 1 ? 's' : ''}`,
          imageUrl: item.imageUrl,
          attributes: item,
        }));
        setAllHistory(mapped);
        setHistory(mapped.slice(0, 5));
        setDisplayedCount(5);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Impossible de charger l'historique";
      setHistoryError(msg);
      setAllHistory([]);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allHistory.length > 0) setHistory(allHistory.slice(0, displayedCount));
  }, [displayedCount, allHistory]);

  const userName   = user?.name || 'Utilisateur';
  const userAvatar = (user?.logoUrl || user?.avatarUrl)
    ? `https://hipster-api.fr${user.logoUrl || user.avatarUrl}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;

  return (
    <View style={{ flex: 1, backgroundColor: '#0d0d0d' }}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 0, backgroundColor: '#0d0d0d' }}
      >
        {/* ── HEADER ── */}
        <View style={styles.headerWrapper}>
          <LinearGradient
            colors={['rgba(0,212,255,0.08)', 'transparent']}
            style={styles.headerGradient}
          />
          <View style={styles.headerContainer}>

            {/* Avatar avec bordure neon animée */}
            <AvatarNeonBorder size={AVATAR_SIZE}>
              <Image source={{ uri: userAvatar }} style={styles.avatar} />
              <View style={styles.statusBadge} />
            </AvatarNeonBorder>

            {/* Infos user */}
            <View style={styles.userInfo}>
              {/* Nom en Brittany-Signature comme packs */}
              <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
              <Text style={styles.userEmail} numberOfLines={1}>{user?.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.separator} />

        {/* ── NAVIGATION ── */}
        <View style={styles.menuContainer}>
          <DrawerItemList {...props} />

          {/* Bouton style packs, aligné à gauche */}
          <NouveauProjetButton
            onPress={() => {
              props.navigation.closeDrawer();
              router.push({ pathname: '/(drawer)', params: { reset: 'true' } });
            }}
          />
        </View>

        <View style={styles.separator} />

        {/* ── HISTORY (AI only) ── */}
        {user?.type === 'ai' && (
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Récemment</Text>
              <TouchableOpacity onPress={() => router.push('/(drawer)/history')}>
                <Text style={styles.historySeeAll}>Voir tout</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="small" color={NEON_BLUE} style={{ marginTop: 20 }} />
            ) : historyError ? (
              <View style={styles.historyErrorBox}>
                <Text style={styles.historyErrorText}>{historyError}</Text>
              </View>
            ) : (
              <View style={{ marginTop: 10, width: '100%' }}>
                {history.map((item, index) => (
                  <View key={item.id || index} style={styles.historyRowContainer}>
                    <TouchableOpacity
                      style={styles.historyItem}
                      onPress={() =>
                        router.push({
                          pathname: '/(drawer)',
                          params: { conversationId: item.id },
                        })
                      }
                    >
                      <View style={{ width: 24, alignItems: 'center' }}>
                        <MessageCircle size={16} color={colors.text.muted} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={styles.historyItemText}>{item.title || 'Sans titre'}</Text>
                        <Text numberOfLines={1} style={styles.historyItemSubtext}>{item.preview} • {item.date}</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteMiniButton}
                      onPress={() => { setItemToDelete(item.id); setShowDeleteModal(true); }}
                    >
                      <Trash2 size={16} color={colors.text.muted} />
                    </TouchableOpacity>
                  </View>
                ))}

                {displayedCount < allHistory.length && (
                  <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
                    <Text style={styles.loadMoreText}>Voir plus</Text>
                  </TouchableOpacity>
                )}

                {!history.length && (
                  <Text style={styles.emptyHistory}>Aucun historique récent</Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* ── LOGOUT ── */}
        <View style={styles.logoutWrapper}>
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

/* ─────────────────────────────────────────────
   DRAWER LAYOUT
───────────────────────────────────────────── */
import { usePathname } from 'expo-router';

export default function DrawerLayout() {
  const { user } = useAuthStore();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) return;
    const planType  = user.planType || 'curieux';
    const subStatus = user.subscriptionStatus;
    const stripeId  = user.stripeCustomerId;
    const isSubscriptionActive = subStatus === 'active' || subStatus === 'trialing' || subStatus === 'trial';
    const isPackCurieux        = planType === 'curieux';
    const now     = new Date();
    const endDate = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
    const isExpired          = endDate && now > endDate;
    const isTrialButNoCard   = isPackCurieux && !stripeId;
    const promptsLimit = user.promptsLimit || 0;
    const imagesLimit  = user.imagesLimit  || 0;
    const videosLimit  = user.videosLimit  || 0;
    const audioLimit   = user.audioLimit   || 0;
    const threeDLimit  = user.threeDLimit  || 0;
    const isTextExhausted   = promptsLimit > 0 && promptsLimit !== 999999 && (user.promptsUsed || 0) >= promptsLimit;
    const isImagesExhausted = imagesLimit  > 0 && imagesLimit  !== 999999 && (user.imagesUsed  || 0) >= imagesLimit;
    const isVideosExhausted = videosLimit  > 0 && videosLimit  !== 999999 && (user.videosUsed  || 0) >= videosLimit;
    const isAudioExhausted  = audioLimit   > 0 && audioLimit   !== 999999 && (user.audioUsed   || 0) >= audioLimit;
    const isThreeDExhausted = threeDLimit  > 0 && threeDLimit  !== 999999 && (user.threeDUsed  || 0) >= threeDLimit;
    const isFullyExhausted  = isTextExhausted && isImagesExhausted && isVideosExhausted && isAudioExhausted && isThreeDExhausted;
    const isCriticalInvalid = !isSubscriptionActive || isTrialButNoCard || (isPackCurieux && isExpired);
    const shouldBlockHome   = isFullyExhausted && (pathname === '/' || pathname === '/(drawer)/' || pathname === '/(drawer)');
    if ((isCriticalInvalid || shouldBlockHome) && pathname !== '/subscription' && pathname !== '/(drawer)/subscription') {
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
          borderRightColor: 'rgba(255,255,255,0.06)',
          width: '80%',
        },
        drawerActiveBackgroundColor: 'rgba(0,212,255,0.08)',
        drawerActiveTintColor: NEON_BLUE,
        drawerInactiveTintColor: 'rgba(255,255,255,0.55)',
        drawerLabelStyle: {
          marginLeft: 8,
          fontSize: 15,
          fontWeight: '600',
          fontFamily: 'Arimo-Bold',
          letterSpacing: 0.3,
        },
        drawerItemStyle: {
          borderRadius: 12,
          marginHorizontal: 10,
          marginVertical: 2,
        },
      }}
    >
      <Drawer.Screen name="index"        options={{ drawerLabel: 'Accueil',    drawerIcon: ({ color }) => <Home         size={20} color={color} /> }} />
      <Drawer.Screen name="profile"      options={{ drawerLabel: 'Mon Profil', drawerIcon: ({ color }) => <User         size={20} color={color} /> }} />
      <Drawer.Screen name="history"      options={{ drawerLabel: 'Historique', drawerIcon: ({ color }) => <HistoryIcon  size={20} color={color} /> }} />
      <Drawer.Screen name="subscription" options={{ drawerLabel: 'Abonnement', drawerIcon: ({ color }) => <Sparkles     size={20} color={color} /> }} />
      <Drawer.Screen name="referral"     options={{ drawerLabel: 'Parrainage', drawerIcon: ({ color }) => <Users        size={20} color={color} /> }} />
    </Drawer>
  );
}

/* ─────────────────────────────────────────────
   STYLES
───────────────────────────────────────────── */
const styles = StyleSheet.create({

  /* ── HEADER ── */
  headerWrapper: {
    paddingBottom: 10,
    overflow: 'hidden',
  },
  headerGradient: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 320,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },

  /* ── AVATAR ── */
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.background.tertiary,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.status.success,
    borderWidth: 3,
    borderColor: '#0d0d0d',
    zIndex: 2,
  },

  /* ── USER INFO ── */
  userInfo: {
    alignItems: 'center',
    marginTop: 14,
  },
  userName: {
    // Brittany-Signature comme dans packs + glow neon comme accueil
    fontFamily: 'Brittany-Signature',
    fontSize: 28,
    color: '#ffffff',
    textShadowColor: '#00d4ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    lineHeight: 38,
    marginBottom : 10,
    includeFontPadding: false,
  },
  userEmail: {
    fontSize: 12,
    fontFamily: 'Arimo-Regular',
    color: colors.text.muted,
    marginTop: 2,
  },

  /* ── SEPARATOR ── */
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 8,
    marginHorizontal: 20,
  },

  /* ── MENU ── */
  menuContainer: {
    paddingVertical: 8,
  },

  /* ── BOUTON NOUVEAU PROJET (style packs, aligné gauche) ── */
  nouveauBtnWrapper: {
    // aligné à gauche avec le même indent que les items de menu
    marginHorizontal: 14,
    marginTop: 12,
    alignSelf: 'stretch',
  },
  nouveauBtnPressable: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
  },
  nouveauBtnGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 18,
      minHeight: 44,
  },
  nouveauBtnText: {
    fontFamily: 'Arimo-Bold',
    fontSize: 14,
    fontWeight: '600',
    textAlign : 'center',
    letterSpacing: 0.4,
    color: '#ffffff',
  },

  /* ── HISTORY ── */
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
    fontFamily : 'Arimo-regular'
  },
  historySeeAll: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
    textShadowColor: '#00d4ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  historyErrorBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.status.error,
  },
  historyErrorText: {
    fontSize: 12,
    color: colors.status.error,
    fontWeight: '500',
  },
  historyRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.02)',
    paddingRight: 4,
  },
  historyItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
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
  deleteMiniButton: {
    padding: 10,
    opacity: 0.45,
  },
  emptyHistory: {
    marginTop: 20,
    color: colors.text.muted,
    fontSize: 13,
    textAlign: 'center',
    fontFamily : 'Arimo-Regular'
  },
  loadMoreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  loadMoreText: {
    color: colors.text.muted,
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  /* ── LOGOUT ── */
  logoutWrapper: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.12)',
  },
  logoutText: {
    color: colors.rose?.[400] ?? '#f87171',
    fontSize: 15,
    fontWeight: '700',
    fontFamily : 'Arimo-Regular'
  },
});