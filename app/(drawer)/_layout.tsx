import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { colors } from '../../theme/colors';
import { Home, History as HistoryIcon, User } from 'lucide-react-native';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: colors.background.dark,
          borderRightColor: 'rgba(255,255,255,0.1)',
          borderRightWidth: 1,
        },
        drawerActiveBackgroundColor: colors.primary.dark,
        drawerActiveTintColor: colors.primary.main,
        drawerInactiveTintColor: colors.text.secondary,
      }}>
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Accueil',
          title: 'Accueil',
          drawerIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: 'Mon Profil',
          title: 'Mon Profil',
          drawerIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="history"
        options={{
          drawerLabel: 'Historique',
          title: 'Historique',
          drawerIcon: ({ color, size }) => <HistoryIcon size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="subscription"
        options={{
          drawerLabel: 'Abonnement',
          title: 'Abonnement',
          drawerItemStyle: { display: 'none' },
        }}
      />
    </Drawer>
  );
}
