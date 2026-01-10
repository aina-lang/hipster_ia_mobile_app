import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { Text, View, StyleSheet } from 'react-native';
import { Home, History, User, LogOut } from 'lucide-react-native';
import { GenericModal } from '../../components/ui/GenericModal';

function CustomDrawerContent(props: any) {
  const { logout, user } = useAuthStore();

  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  return (
    <>
      <DrawerContentScrollView
        {...props}
        style={{ backgroundColor: colors.background.dark }}
        contentContainerStyle={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.firstName?.[0] || 'U').toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{user?.firstName || 'Utilisateur'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <DrawerItemList {...props} />

        <View style={styles.footer}>
          <DrawerItem
            label="Déconnexion"
            icon={({ color, size }) => <LogOut size={size} color={colors.status.error} />}
            labelStyle={{ color: colors.status.error }}
            onPress={() => setShowLogoutModal(true)}
          />
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
    </>
  );
}

export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
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
        {/* Placeholder for future screens */}
        {/* <Drawer.Screen
          name="history"
          options={{
            drawerLabel: 'Historique',
            title: 'Historique',
            drawerIcon: ({ color, size }) => <History size={size} color={color} />,
          }}
        /> */}
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary.main + '33',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  avatarText: {
    color: colors.primary.main,
    fontSize: 24,
    fontWeight: 'bold',
  },
  name: {
    color: colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 10,
  },
});
