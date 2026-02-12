import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/client';
import {
  Briefcase,
  AtSign,
  Sparkles,
  LogOut,
  ChevronRight,
  CreditCard,
  XCircle,
  X,
  Check,
  User,
  Lock,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GenericModal, ModalType } from '../../components/ui/GenericModal';
import { BackgroundGradientOnboarding } from 'components/ui/BackgroundGradientOnboarding';

export default function ProfileScreen() {
  const router = useRouter();
  const {
    user,
    updateProfile,
    updateAiProfile,
    changePassword,
    logout,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Feedback Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    type: ModalType;
    title: string;
    message: string;
  }>({
    type: 'info',
    title: '',
    message: '',
  });

  const showFeedback = (type: ModalType, title: string, message: string) => {
    setModalConfig({ type, title, message });
    setModalVisible(true);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showFeedback('warning', 'Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }

    if (newPassword !== confirmPassword) {
      showFeedback('warning', 'Erreur', 'Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    if (newPassword.length < 8) {
      showFeedback('warning', 'Mot de passe trop court', 'Minimum 8 caractères requis.');
      return;
    }

    try {
      await changePassword({ oldPassword, newPassword });
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showFeedback('success', 'Sécurisé !', 'Votre mot de passe a été modifié avec succès.');
    } catch (err) {
      const errorMessage = useAuthStore.getState().error;
      showFeedback('error', 'Erreur', errorMessage || 'Impossible de modifier le mot de passe.');
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const handleCancelSubscription = async () => {
    if (!user?.stripeSubscriptionId) {
      showFeedback('warning', 'Aucun abonnement', 'Vous n\'avez pas d\'abonnement actif à annuler.');
      return;
    }

    try {
      const response = await api.post('/ai/payment/cancel');
      const cancelAt = response.data?.cancelAt ? new Date(response.data.cancelAt).toLocaleDateString('fr-FR') : 'la fin de la période';

      showFeedback(
        'success',
        'Abonnement annulé',
        `Votre abonnement sera annulé le ${cancelAt}. Vous conservez l'accès jusqu'à cette date.`
      );

      // Refresh user data
      await useAuthStore.getState().aiRefreshUser();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Impossible d\'annuler l\'abonnement.';
      showFeedback('error', 'Erreur', errorMsg);
    }
  };

  return (
    <BackgroundGradientOnboarding blurIntensity={90}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

          {/* Header Compact */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronRight
                size={20}
                color={colors.text.primary}
                style={{ transform: [{ rotate: '180deg' }] }}
              />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Mon Profil</Text>
              <Text style={styles.subtitle}>
                {user?.email || 'Gérez vos informations'}
              </Text>
            </View>
          </View>

          {/* Account Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconBadge}>
                <User size={18} color={colors.primary.main} />
              </View>
              <Text style={styles.sectionTitle}>Détails du Compte</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Adresse Email</Text>
                  <View style={[styles.inputContainer, styles.disabledInput]}>
                    <AtSign size={16} color={colors.text.secondary} />
                    <TextInput
                      style={styles.input}
                      value={user?.email || ''}
                      editable={false}
                    />
                  </View>
                </View>

                {user?.job && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Métier / Secteur</Text>
                    <View style={[styles.inputContainer, styles.disabledInput]}>
                      <Briefcase size={16} color={colors.text.secondary} />
                      <TextInput
                        style={styles.input}
                        value={user.job}
                        editable={false}
                      />
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Subscription Section Compacte */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconBadge}>
                <Sparkles size={18} color={colors.primary.main} />
              </View>
              <Text style={styles.sectionTitle}>Abonnement</Text>
            </View>

            <TouchableOpacity
              style={styles.planCard}
              onPress={() => router.push('/(drawer)/subscription')}
              activeOpacity={0.9}>
              <View style={styles.planContent}>
                <View style={styles.planInfo}>
                  <Text style={styles.planName}>
                    {user?.planType
                      ? `Hipster ${user.planType.charAt(0).toUpperCase() + user.planType.slice(1)}`
                      : 'Hipster Gratuit'}
                  </Text>
                  <Text style={styles.planDescription}>
                    {user?.planType === 'studio' || user?.planType === 'agence'
                      ? 'Accès Creatif Illimité'
                      : 'Pack Curieux'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.planBadge,
                    (user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'trialing') && styles.planBadgeActive,
                  ]}>
                  <Text style={styles.planBadgeText}>
                    {user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'trialing' ? 'Actif' : 'Gratuit'}
                  </Text>
                </View>
              </View>
              <View style={styles.planAction}>
                <Text style={styles.planActionText}>
                  Gérer mon abonnement
                </Text>
                <ChevronRight size={18} color={colors.primary.main} />
              </View>
            </TouchableOpacity>

            {/* Cancel Subscription Button - Only for active paid plans */}
            {user?.stripeSubscriptionId && (user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'trialing') && user?.planType !== 'curieux' && (
              <TouchableOpacity
                style={styles.cancelSubscriptionButton}
                onPress={handleCancelSubscription}
                activeOpacity={0.8}>
                <XCircle size={18} color={colors.status.warning} />
                <Text style={styles.cancelSubscriptionText}>Annuler mon abonnement</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Security Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconBadge}>
                <Lock size={18} color={colors.primary.main} />
              </View>
              <Text style={styles.sectionTitle}>Sécurité</Text>
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowPasswordModal(true)}
              activeOpacity={0.7}>
              <Lock size={18} color={colors.text.secondary} />
              <Text style={styles.menuItemText}>Modifier le mot de passe</Text>
              <ChevronRight size={18} color={colors.text.muted} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.8}>
              <LogOut size={18} color={colors.status.error} />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Password Modal Amélioré */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Modifier le mot de passe</Text>
                <Text style={styles.modalSubtitle}>Minimum 8 caractères requis</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowPasswordModal(false)}
                style={styles.closeButton}>
                <X size={22} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mot de passe actuel</Text>
                <View style={styles.inputContainer}>
                  <Lock size={16} color={colors.text.secondary} />
                  <TextInput
                    style={styles.input}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    secureTextEntry
                    placeholder="••••••••"
                    placeholderTextColor={colors.text.muted}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nouveau mot de passe</Text>
                <View style={styles.inputContainer}>
                  <Lock size={16} color={colors.text.secondary} />
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    placeholder="Minimum 8 caractères"
                    placeholderTextColor={colors.text.muted}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmer le mot de passe</Text>
                <View style={styles.inputContainer}>
                  <Lock size={16} color={colors.text.secondary} />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    placeholder="••••••••"
                    placeholderTextColor={colors.text.muted}
                  />
                </View>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowPasswordModal(false)}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveButton, isLoading && styles.disabledButton]}
                onPress={handleChangePassword}
                disabled={isLoading}>
                <Check size={16} color="#000" />
                <Text style={styles.modalSaveText}>
                  {isLoading ? 'Modification...' : 'Modifier'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>



      {/* Feedback Modal */}
      <GenericModal
        visible={modalVisible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalVisible(false)}
      />
    </BackgroundGradientOnboarding>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.primary.main + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  quickEditButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary.main + '30',
  },
  quickEditText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary.main,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: colors.primary.main,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background.primary,
  },
  removeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,59,48,0.1)',
    borderRadius: 8,
  },
  removeImageText: {
    fontSize: 11,
    color: colors.status.error,
    fontWeight: '600',
  },
  form: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  label: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    height: 44,
  },
  activeInput: {
    borderColor: colors.primary.main + '60',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 14,
    marginLeft: 10,
  },
  disabledInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    opacity: 0.7,
  },
  editActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.primary.main,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.5,
  },
  typeToggleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    padding: 3,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  typeOptionActive: {
    backgroundColor: colors.primary.main,
  },
  typeOptionText: {
    fontSize: 13,
    color: colors.text.muted,
    fontWeight: '600',
  },
  typeOptionTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  logoPreviewContainer: {
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  logoPreview: {
    width: 70,
    height: 70,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  changeLogoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary.main + '30',
  },
  changeLogoText: {
    fontSize: 11,
    color: colors.primary.main,
    fontWeight: '600',
  },
  addLogoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary.main + '30',
    marginBottom: 12,
  },
  addLogoText: {
    fontSize: 13,
    color: colors.primary.main,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.main,
    gap: 10,
    marginBottom: 6,
  },
  infoText: {
    color: colors.text.primary,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  infoTextSecondary: {
    color: colors.text.secondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.primary.main + '30',
    gap: 12,
  },
  planContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 2,
  },
  planDescription: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  planBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  planBadgeActive: {
    backgroundColor: colors.primary.main + '30',
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  planActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.main,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 14,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 10,
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,59,48,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.3)',
  },
  logoutText: {
    color: colors.status.error,
    fontSize: 14,
    fontWeight: '700',
  },
  cancelSubscriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,159,10,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,159,10,0.3)',
    marginTop: 12,
  },
  cancelSubscriptionText: {
    color: colors.status.warning,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    gap: 14,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalCancelText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary.main,
  },
  modalSaveText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  countryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    height: 44,
    gap: 10,
  },
  countryPickerText: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 14,
  },
  inlinePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 4,
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 6,
  },
  prefixFlag: {
    fontSize: 14,
  },
  prefixCode: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
});