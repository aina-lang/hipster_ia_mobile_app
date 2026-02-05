import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { ChevronRight, LogOut, Crown, Shield, Zap, Edit3, Mail, Phone, Building } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const getPlanInfo = () => {
    const planType = user?.aiProfile?.planType?.toLowerCase() || 'curieux';
    const planInfoMap: Record<string, { name: string; color: string; icon: any }> = {
      curieux: { name: 'Pack Curieux', color: '#60A5FA', icon: Shield },
      atelier: { name: 'Atelier', color: '#34D399', icon: Edit3 },
      studio: { name: 'Studio', color: '#FBBF24', icon: Zap },
      agence: { name: 'Agence', color: '#F87171', icon: Crown },
      basic: { name: 'Gratuit', color: '#9CA3AF', icon: Shield },
      pro: { name: 'Pro', color: '#60A5FA', icon: Zap },
      enterprise: { name: 'Enterprise', color: '#A78BFA', icon: Crown },
    };
    return planInfoMap[planType] || planInfoMap.curieux;
  };

  const handleLogout = async () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', onPress: () => {}, style: 'cancel' },
      {
        text: 'Déconnecter',
        onPress: async () => {
          setLoading(true);
          try {
            await logout();
            router.replace('/(auth)/login');
          } catch (error) {
            Alert.alert('Erreur', 'Impossible de se déconnecter');
          } finally {
            setLoading(false);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const planInfo = getPlanInfo();
  const PlanIcon = planInfo.icon;

  return (
    <BackgroundGradient>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Mon Profil</Text>
            <Text style={styles.subtitle}>Gérez vos paramètres et votre compte</Text>
          </View>

          {/* Plan Card */}
          <View style={[styles.card, styles.planCard]}>
            <View style={styles.planHeader}>
              <View style={[styles.planIconContainer, { backgroundColor: planInfo.color + '22' }]}>
                <PlanIcon size={32} color={planInfo.color} />
              </View>
              <View style={styles.planInfo}>
                <Text style={styles.planLabel}>Abonnement actuel</Text>
                <Text style={styles.planName}>{planInfo.name}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.planChangeButton}
              onPress={() => router.push('/(drawer)/subscription')}
              activeOpacity={0.7}
            >
              <Text style={styles.planChangeButtonText}>Modifier</Text>
              <ChevronRight size={16} color={colors.primary.main} />
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informations Personnelles</Text>
            
            <View style={styles.infoCard}>
              <Mail size={20} color={colors.text.secondary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
              </View>
            </View>

            {user?.firstName && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>Nom</Text>
                <Text style={styles.infoValue}>
                  {user.firstName} {user.lastName || ''}
                </Text>
              </View>
            )}

            {user?.aiProfile?.companyName && (
              <View style={styles.infoCard}>
                <Building size={20} color={colors.text.secondary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Entreprise</Text>
                  <Text style={styles.infoValue}>{user.aiProfile.companyName}</Text>
                </View>
              </View>
            )}

            {user?.aiProfile?.professionalPhone && (
              <View style={styles.infoCard}>
                <Phone size={20} color={colors.text.secondary} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Téléphone</Text>
                  <Text style={styles.infoValue}>{user.aiProfile.professionalPhone}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Account Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Paramètres du Compte</Text>

            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push('/(drawer)/profile')}
              activeOpacity={0.7}
            >
              <Text style={styles.settingLabel}>Éditer le Profil</Text>
              <ChevronRight size={20} color={colors.text.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingRow, styles.lastRow]}
              onPress={() => Alert.alert('À venir', 'La modification du mot de passe sera bientôt disponible')}
              activeOpacity={0.7}
            >
              <Text style={styles.settingLabel}>Modifier le Mot de Passe</Text>
              <ChevronRight size={20} color={colors.text.muted} />
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <LogOut size={20} color="#FFF" />
                  <Text style={styles.logoutButtonText}>Déconnexion</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Spacing */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 16,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  planIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planLabel: {
    fontSize: 12,
    color: colors.text.muted,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  planChangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  planChangeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.main,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.text.muted,
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  lastRow: {
    marginBottom: 0,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: '#EF4444',
    borderRadius: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
