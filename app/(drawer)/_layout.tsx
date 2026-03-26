import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, ActivityIndicator,
  StyleSheet, Animated as RNAnimated, Easing, Pressable,
} from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList, useDrawerStatus } from '@react-navigation/drawer';
import { useRouter, usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Home, History as HistoryIcon, User, Sparkles, MessageCircle,
  Plus, LogOut, Trash2, Users,
} from 'lucide-react-native';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';

import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { AiService } from '../../api/ai.service';
import { useWelcomeVideoStore } from '../../store/welcomeVideoStore';
import { GenericModal } from '../../components/ui/GenericModal';

dayjs.extend(relativeTime);
dayjs.locale('fr');

const NEON_BLUE  = colors.neonBlue;
const NEON_BLUE_DARK = colors.neonBlueDark;
const AVATAR_SIZE = 190;

interface HistoryItem {
  id: string;
  title: string;
  date: string;
  preview: string;
}

function AvatarNeonBorder({ children, size }: { children: React.ReactNode; size: number }) {
  const translateX = useRef(new RNAnimated.Value(0)).current;
  const TRACK_W    = size * Math.PI;
  const outer      = size + 6;
  const BORDER     = 2;

  useEffect(() => {
    const loop = RNAnimated.loop(
      RNAnimated.timing(translateX, {
        toValue: -TRACK_W,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { resetBeforeIteration: true }
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={{ width: outer, height: outer, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{ position: 'absolute', top: 0, left: 0, width: outer, height: outer, borderRadius: outer / 2, overflow: 'hidden' }}
        pointerEvents="none"
      >
        <RNAnimated.View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: TRACK_W * 2, transform: [{ translateX }] }}>
          <LinearGradient
            colors={['transparent', NEON_BLUE, NEON_BLUE_DARK, 'transparent', 'transparent', NEON_BLUE, NEON_BLUE_DARK, 'transparent']}
            locations={[0.05, 0.2, 0.3, 0.45, 0.55, 0.7, 0.8, 0.95]}
            start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
            style={{ width: TRACK_W * 2, height: '100%' }}
          />
        </RNAnimated.View>
        <View style={{ position: 'absolute', top: BORDER, left: BORDER, right: BORDER, bottom: BORDER, borderRadius: (outer - BORDER * 2) / 2, backgroundColor: colors.background.premium }} />
      </View>
      <View
        style={{ position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: (outer + 8) / 2, backgroundColor: 'transparent', shadowColor: NEON_BLUE, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 8 }}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

function NouveauProjetButton({ onPress }: { onPress: () => void }) {
  const scale    = useRef(new RNAnimated.Value(1)).current;
  const pressIn  = () => RNAnimated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40 }).start();
  const pressOut = () => RNAnimated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20 }).start();

  return (
    <RNAnimated.View style={[s.nouveauBtnWrapper, { transform: [{ scale }] }]}>
      <Pressable onPress={onPress} onPressIn={pressIn} onPressOut={pressOut} style={s.nouveauBtnPressable}>
        <LinearGradient
          colors={['#264F8C', '#0a1628', '#040612']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          locations={[0, 0.46, 1]}
          style={s.nouveauBtnGradient}
        >
          <Plus size={16} color="#fff" />
          <Text style={s.nouveauBtnText}>Nouveau Projet</Text>
        </LinearGradient>
      </Pressable>
    </RNAnimated.View>
  );
}

function CustomDrawerContent(props: any) {
  const { user, logout }  = useAuthStore();
  const router            = useRouter();
  const isDrawerOpen      = useDrawerStatus() === 'open';

  const [history, setHistory]               = useState<HistoryItem[]>([]);
  const [allHistory, setAllHistory]         = useState<HistoryItem[]>([]);
  const [loading, setLoading]               = useState(false);
  const [historyError, setHistoryError]     = useState<string | null>(null);
  const [displayedCount, setDisplayedCount] = useState(5);
  const [showLogoutModal, setShowLogoutModal]   = useState(false);
  const [showDeleteModal, setShowDeleteModal]   = useState(false);
  const [itemToDelete, setItemToDelete]         = useState<string | null>(null);

  useEffect(() => {
    if (user?.type === 'ai' && isDrawerOpen) loadHistory();
  }, [user, isDrawerOpen]);

  useEffect(() => {
    if (allHistory.length > 0) setHistory(allHistory.slice(0, displayedCount));
  }, [displayedCount, allHistory]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setHistoryError(null);
      const data = await AiService.getGroupedConversations();
      if (data && Array.isArray(data)) {
        const mapped: HistoryItem[] = data.map((item: any) => ({
          id: item.id.toString(),
          title: item.title || 'Sans titre',
          date: dayjs(item.date).fromNow(),
          preview: `${item.count || item.items?.length || 1} message${(item.count || item.items?.length || 1) > 1 ? 's' : ''}`,
        }));
        setAllHistory(mapped);
        setHistory(mapped.slice(0, 5));
        setDisplayedCount(5);
      }
    } catch (err: any) {
      setHistoryError(err?.response?.data?.message || err?.message || "Impossible de charger l'historique");
      setAllHistory([]);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setShowLogoutModal(false);
    useWelcomeVideoStore.getState().setIsReturningFromBack(true);
    await logout();
    router.replace('/welcome');
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      await AiService.deleteGeneration(itemToDelete);
      setAllHistory(prev => prev.filter(i => i.id !== itemToDelete));
      setHistory(prev => prev.filter(i => i.id !== itemToDelete));
      if (useChatStore.getState().conversationId === itemToDelete) {
        props.navigation.closeDrawer();
        router.push({ pathname: '/(drawer)', params: { reset: 'true' } });
      }
    } catch {
      alert('Erreur lors de la suppression. Veuillez réessayer.');
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const userName   = user?.name || 'Utilisateur';
  const userAvatar = (user?.logoUrl || user?.avatarUrl)
    ? `https://hipster-api.fr${user.logoUrl || user.avatarUrl}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`;

  return (
    <View style={{ flex: 1, backgroundColor: '#0f172ae6' }}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0, backgroundColor: 'rgba(15, 23, 42, 0.9)' }}>

        <View style={s.headerWrapper}>
          <LinearGradient colors={[colors.primary.main + '14', 'transparent']} style={s.headerGradient} />
          <View style={s.headerContainer}>
            <AvatarNeonBorder size={AVATAR_SIZE}>
              <Image source={{ uri: userAvatar }} style={s.avatar} />
              <View style={s.statusBadge} />
            </AvatarNeonBorder>
            <View style={s.userInfo}>
              <Text style={s.userName} numberOfLines={1}>{userName}</Text>
              <Text style={s.userEmail} numberOfLines={1}>{user?.email}</Text>
            </View>
          </View>
        </View>

        <View style={s.separator} />

        <View style={s.menuContainer}>
          <DrawerItemList {...props} />
          <NouveauProjetButton
            onPress={() => {
              props.navigation.closeDrawer();
              router.push({ pathname: '/(drawer)', params: { reset: 'true' } });
            }}
          />
        </View>

        <View style={s.separator} />

        {user?.type === 'ai' && (
          <View style={s.historySection}>
            <View style={s.historyHeader}>
              <Text style={s.historyTitle}>Récemment</Text>
              <TouchableOpacity onPress={() => router.push('/(drawer)/history')}>
                <Text style={s.historySeeAll}>Voir tout</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="small" color={NEON_BLUE} style={{ marginTop: 20 }} />
            ) : historyError ? (
              <View style={s.historyErrorBox}>
                <Text style={s.historyErrorText}>{historyError}</Text>
              </View>
            ) : (
              <View style={{ marginTop: 10 }}>
                {history.map((item, index) => (
                  <View key={item.id || index} style={s.historyRowContainer}>
                    <TouchableOpacity
                      style={s.historyItem}
                      onPress={() => router.push({ pathname: '/(drawer)', params: { conversationId: item.id } })}
                    >
                      <View style={{ width: 24, alignItems: 'center' }}>
                        <MessageCircle size={16} color={colors.text.muted} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={s.historyItemText}>{item.title}</Text>
                        <Text numberOfLines={1} style={s.historyItemSubtext}>{item.preview} • {item.date}</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={s.deleteMiniButton}
                      onPress={() => { setItemToDelete(item.id); setShowDeleteModal(true); }}
                    >
                      <Trash2 size={16} color={colors.text.muted} />
                    </TouchableOpacity>
                  </View>
                ))}

                {displayedCount < allHistory.length && (
                  <TouchableOpacity style={s.loadMoreButton} onPress={() => setTimeout(() => setDisplayedCount(prev => Math.min(prev + 15, allHistory.length)), 300)}>
                    <Text style={s.loadMoreText}>Voir plus</Text>
                  </TouchableOpacity>
                )}

                {!history.length && (
                  <Text style={s.emptyHistory}>Aucun historique récent</Text>
                )}
              </View>
            )}
          </View>
        )}

        <View style={s.logoutWrapper}>
          <TouchableOpacity style={s.logoutButton} onPress={() => setShowLogoutModal(true)}>
            <LogOut size={20} color={colors.status.error} />
            <Text style={s.logoutText}>Se déconnecter</Text>
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
  const { user } = useAuthStore();
  const router   = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) return;
    const planType  = user.planType || 'curieux';
    const subStatus = user.subscriptionStatus;
    const isActive  = subStatus === 'active' || subStatus === 'trialing' || subStatus === 'trial';
    const endDate   = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
    const isExpired = endDate && new Date() > endDate;

    const exhausted = (used: number, limit: number) => limit > 0 && limit !== 999999 && used >= limit;
    const isFullyExhausted =
      exhausted(user.promptsUsed || 0, user.promptsLimit || 0) &&
      exhausted(user.imagesUsed  || 0, user.imagesLimit  || 0) &&
      exhausted(user.videosUsed  || 0, user.videosLimit  || 0) &&
      exhausted(user.audioUsed   || 0, user.audioLimit   || 0) &&
      exhausted(user.threeDUsed  || 0, user.threeDLimit  || 0);

    const isCritical     = !isActive || (planType === 'curieux' && isExpired);
    const isBlockedHome  = isFullyExhausted && (pathname === '/' || pathname === '/(drawer)/' || pathname === '/(drawer)');
    const onSubPage      = pathname === '/subscription' || pathname === '/(drawer)/subscription';

    if ((isCritical || isBlockedHome) && !onSubPage && planType !== 'curieux') router.replace('/subscription');
  }, [user, pathname]);

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: colors.background.primary,
          borderRightWidth: 1,
          borderRightColor: colors.border,
          width: '80%',
        },
        drawerActiveBackgroundColor: colors.primary.main + '14',
        drawerActiveTintColor: colors.neon.primary,
        drawerInactiveTintColor: colors.text.muted,
        drawerLabelStyle: {
          marginLeft: 8,
          fontSize: 15,
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
     <Drawer.Screen
        name="index"
        options={{
          drawerIcon: ({ color, focused }) => (
            <Home size={20} color={focused ? '#ffffff' : color} style={focused ? { shadowColor: '#00eaff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4 } : undefined} />
          ),
          drawerLabel: ({ focused, color }) => (
            <Text style={{ fontFamily: 'Arimo-Bold', fontSize: 15, letterSpacing: 0.3, color: focused ? '#ffffff' : color, textShadowColor: focused ? '#00eaff' : 'transparent', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: focused ? 3 : 0 }}>
              Accueil
            </Text>
          ),
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          drawerIcon: ({ color, focused }) => (
            <User size={20} color={focused ? '#ffffff' : color} style={focused ? { shadowColor: '#00eaff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4 } : undefined} />
          ),
          drawerLabel: ({ focused, color }) => (
            <Text style={{ fontFamily: 'Arimo-Bold', fontSize: 15, letterSpacing: 0.3, color: focused ? '#ffffff' : color, textShadowColor: focused ? '#00eaff' : 'transparent', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: focused ? 3 : 0 }}>
              Mon Profil
            </Text>
          ),
        }}
      />
      <Drawer.Screen
        name="history"
        options={{
          drawerIcon: ({ color, focused }) => (
            <HistoryIcon size={20} color={focused ? '#ffffff' : color} style={focused ? { shadowColor: '#00eaff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4 } : undefined} />
          ),
          drawerLabel: ({ focused, color }) => (
            <Text style={{ fontFamily: 'Arimo-Bold', fontSize: 15, letterSpacing: 0.3, color: focused ? '#ffffff' : color, textShadowColor: focused ? '#00eaff' : 'transparent', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: focused ? 3 : 0 }}>
              Historique
            </Text>
          ),
        }}
      />
      <Drawer.Screen
        name="subscription"
        options={{
          drawerIcon: ({ color, focused }) => (
            <Sparkles size={20} color={focused ? '#ffffff' : color} style={focused ? { shadowColor: '#00eaff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4 } : undefined} />
          ),
          drawerLabel: ({ focused, color }) => (
            <Text style={{ fontFamily: 'Arimo-Bold', fontSize: 15, letterSpacing: 0.3, color: focused ? '#ffffff' : color, textShadowColor: focused ? '#00eaff' : 'transparent', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: focused ? 3 : 0 }}>
              Abonnement
            </Text>
          ),
        }}
      />
      <Drawer.Screen
        name="referral"
        options={{
          drawerIcon: ({ color, focused }) => (
            <Users size={20} color={focused ? '#ffffff' : color} style={focused ? { shadowColor: '#00eaff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4 } : undefined} />
          ),
          drawerLabel: ({ focused, color }) => (
            <Text style={{ fontFamily: 'Arimo-Bold', fontSize: 15, letterSpacing: 0.3, color: focused ? '#ffffff' : color, textShadowColor: focused ? '#00eaff' : 'transparent', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: focused ? 3 : 0 }}>
              Parrainage
            </Text>
          ),
        }}
      />
    </Drawer>
  );
}

const s = StyleSheet.create({
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
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.background.tertiary,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 18, right: 28,
    width: 16, height: 16,
    borderRadius: 8,
    backgroundColor: colors.status.success,
    borderWidth: 3,
    borderColor: colors.background.primary,
    zIndex: 2,
  },
  userInfo: {
    alignItems: 'center',
    marginTop: 14,
  },
  userName: {
    fontFamily: 'Brittany-Signature',
    fontSize: 28,
    color: '#ffffff',
    textShadowColor: NEON_BLUE,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
    marginBottom: 10,
  },
  userEmail: {
    fontFamily: 'Arimo-Regular',
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 8,
    marginHorizontal: 20,
  },
  menuContainer: {
    paddingVertical: 8,
  },
  nouveauBtnWrapper: {
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
    letterSpacing: 0.4,
    color: '#ffffff',
  },
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
    fontFamily: 'Arimo-Regular',
    fontSize: 11,
    fontWeight: '800',
    color: colors.text.muted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  historySeeAll: {
    fontFamily: 'Arimo-Bold',
    fontSize: 12,
    color: '#ffffff',
    textShadowColor: NEON_BLUE,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  historyErrorBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.status.error,
  },
  historyErrorText: {
    fontFamily: 'Arimo-Regular',
    fontSize: 12,
    color: colors.status.error,
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
    fontFamily: 'Arimo-Bold',
    fontSize: 13,
    color: colors.text.primary,
  },
  historyItemSubtext: {
    fontFamily: 'Arimo-Regular',
    fontSize: 11,
    color: colors.text.muted,
    marginTop: 2,
  },
  deleteMiniButton: {
    padding: 10,
    opacity: 0.45,
  },
  emptyHistory: {
    fontFamily: 'Arimo-Regular',
    fontSize: 13,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: 20,
  },
  loadMoreButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 5,
    marginTop: 8,
  },
  loadMoreText: {
    fontFamily: 'Arimo-Bold',
    fontSize: 12,
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: NEON_BLUE,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  logoutWrapper: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 14,
    backgroundColor: 'rgba(239,68,68,0.05)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.12)',
  },
  logoutText: {
    fontFamily: 'Arimo-Bold',
    fontSize: 15,
    color: '#f87171',
  },
});