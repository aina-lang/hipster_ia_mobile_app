import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { Text, View, StyleSheet } from 'react-native';
import {
  Home,
  History,
  User,
  LogOut,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  ChevronRight,
} from 'lucide-react-native';
import { GenericModal } from '../../components/ui/GenericModal';
import { TouchableOpacity } from 'react-native-gesture-handler';

// Mock recent history for drawer
const RECENT_HISTORY = [
  { id: '1', title: 'Post Instagram - Noël', type: 'text', date: '2h' },
  { id: '2', title: 'Affiche Publicitaire', type: 'image', date: 'Hier' },
  { id: '3', title: 'Rapport Mensuel', type: 'document', date: '2j' },
];

function CustomDrawerContent(props: any) {
  const { logout, user } = useAuthStore();

  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText size={16} color={colors.text.secondary} />;
      case 'image':
        return <ImageIcon size={16} color={colors.text.secondary} />;
      case 'document':
        return <FileSpreadsheet size={16} color={colors.text.secondary} />;
      default:
        return <FileText size={16} color={colors.text.secondary} />;
    }
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

        {/* Recent History Section */}
        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Récents</Text>
          {RECENT_HISTORY.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.recentItem}
              onPress={() => props.navigation.navigate('index', { chatId: item.id })}>
              <View style={styles.recentIconRow}>
                {getIcon(item.type)}
                <Text style={styles.recentItemText} numberOfLines={1}>
                  {item.title}
                </Text>
              </View>
              <Text style={styles.recentItemDate}>{item.date}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => props.navigation.navigate('history')}>
            <Text style={styles.seeAllText}>Voir tout l'historique</Text>
            <ChevronRight size={16} color={colors.primary.main} />
          </TouchableOpacity>
        </View>

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
        <Drawer.Screen
          name="profile"
          options={{
            drawerLabel: 'Mon Profil',
            title: 'Mon Profil',
            drawerIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
        {/* Placeholder for future screens */}
        <Drawer.Screen
          name="history"
          options={{
            drawerLabel: 'Historique',
            title: 'Historique',
            drawerIcon: ({ color, size }) => <History size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="subscription"
          options={{
            drawerLabel: 'Abonnement',
            title: 'Abonnement',
            drawerItemStyle: { display: 'none' }, // Hide from drawer menu if preferred, but keep it accessible via navigation
          }}
        />
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
  recentSection: {
    marginTop: 20,
    paddingHorizontal: 16,
    flex: 1, // Take available space before footer
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.muted,
    marginBottom: 8,
    marginLeft: 4,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  recentIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  recentItemText: {
    color: colors.text.secondary,
    fontSize: 14,
    flex: 1,
  },
  recentItemDate: {
    color: colors.text.muted,
    fontSize: 12,
    marginLeft: 8,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 8,
    gap: 4,
  },
  seeAllText: {
    color: colors.primary.main,
    fontSize: 14,
    fontWeight: '600',
  },
});
