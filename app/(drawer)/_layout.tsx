import React, { useEffect, useRef } from 'react';
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, Animated as RNAnimated, Easing,
} from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList, useDrawerStatus } from '@react-navigation/drawer';
import { useRouter, usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Home, History as HistoryIcon, User, LogOut, Users,
  Bell,
} from 'lucide-react-native';

import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useWelcomeVideoStore } from '../../store/welcomeVideoStore';
import { GenericModal } from '../../components/ui/GenericModal';

const NEON_BLUE = colors.neonBlue;
const NEON_BLUE_DARK = colors.neonBlueDark;
const AVATAR_SIZE = 190;

function AvatarNeonBorder({ children, size }: { children: React.ReactNode; size: number }) {
  const translateX = useRef(new RNAnimated.Value(0)).current;
  const TRACK_W = size * Math.PI;
  const outer = size + 6;
  const BORDER = 2;

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

function CustomDrawerContent(props: any) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  // Protect against null user during logout
  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    setShowLogoutModal(false);
    useWelcomeVideoStore.getState().setIsReturningFromBack(true);
    await logout();
    router.replace('/welcome');
  };

  const userName = user?.name || 'Utilisateur';
  const userAvatar = (user?.logoUrl || user?.avatarUrl)
    ? `https://hipster-api.fr${user?.logoUrl || user?.avatarUrl}`
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
        </View>

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
    </View>
  );
}

export default function DrawerLayout() {
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!user) return;
    const planType = user.planType || 'curieux';
    const subStatus = user.subscriptionStatus;
    const isActive = subStatus === 'active' || subStatus === 'trialing' || subStatus === 'trial';
    const endDate = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
    const isExpired = endDate && new Date() > endDate;

    const exhausted = (used: number, limit: number) => limit > 0 && limit !== 999999 && used >= limit;
    const isFullyExhausted =
      exhausted(user.promptsUsed || 0, user.promptsLimit || 0) &&
      exhausted(user.imagesUsed || 0, user.imagesLimit || 0) &&
      exhausted(user.videosUsed || 0, user.videosLimit || 0) &&
      exhausted(user.audioUsed || 0, user.audioLimit || 0) &&
      exhausted(user.threeDUsed || 0, user.threeDLimit || 0);

    const isCritical = !isActive || (planType === 'curieux' && isExpired);
    const isBlockedHome = isFullyExhausted && (pathname === '/' || pathname === '/(drawer)/' || pathname === '/(drawer)');
    const onSubPage = pathname === '/subscription' || pathname === '/(drawer)/subscription';

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
            <Bell size={20} color={focused ? '#ffffff' : color} style={focused ? { shadowColor: '#00eaff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 8, elevation: 4 } : undefined} />
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
      <Drawer.Screen
        name="freetext"
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="impression-hd-history"
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="impression-hd-create"
        options={{
          drawerItemStyle: { display: 'none' },
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