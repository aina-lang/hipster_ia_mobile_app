import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { NeonButton } from '../../components/ui/NeonButton';
import { useAuthStore } from '../../store/authStore';
import { User, Mail, Lock, Sparkles, LogOut, ChevronRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GenericModal, ModalType } from '../../components/ui/GenericModal';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, changePassword, logout, isLoading, error, clearError } =
    useAuthStore();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isEditing, setIsEditing] = useState(false);

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

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      showFeedback('warning', 'Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      await updateProfile({ firstName, lastName });
      setIsEditing(false);
      showFeedback('success', 'Succès', 'Profil mis à jour avec succès.');
    } catch (err) {
      // Use getState to get the freshest error message set by the store
      const errorMessage = useAuthStore.getState().error;
      showFeedback('error', 'Erreur', errorMessage || 'Une erreur est survenue.');
    }
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

    try {
      await changePassword({ oldPassword, newPassword });
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showFeedback('success', 'Succès', 'Mot de passe modifié avec succès.');
    } catch (err) {
      // Use getState to get the freshest error message set by the store
      const errorMessage = useAuthStore.getState().error;
      showFeedback('error', 'Erreur', errorMessage || 'Impossible de modifier le mot de passe.');
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <BackgroundGradient>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Mon Profil</Text>
            <Text style={styles.subtitle}>Gérez vos informations et votre abonnement</Text>
          </View>

          {/* Profile Card */}
          <View style={styles.section}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(user?.firstName?.[0] || 'U').toUpperCase()}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
              </View>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Prénom</Text>
                <View style={[styles.inputContainer, isEditing && styles.activeInput]}>
                  <User size={20} color={colors.text.secondary} />
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    editable={isEditing}
                    placeholder="Votre prénom"
                    placeholderTextColor={colors.text.muted}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom</Text>
                <View style={[styles.inputContainer, isEditing && styles.activeInput]}>
                  <User size={20} color={colors.text.secondary} />
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    editable={isEditing}
                    placeholder="Votre nom"
                    placeholderTextColor={colors.text.muted}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={[styles.inputContainer, styles.disabledInput]}>
                  <Mail size={20} color={colors.text.muted} />
                  <TextInput
                    style={[styles.input, { color: colors.text.muted }]}
                    value={user?.email}
                    editable={false}
                  />
                </View>
              </View>

              {isEditing ? (
                <View style={styles.editActions}>
                  <NeonButton
                    title="Annuler"
                    onPress={() => setIsEditing(false)}
                    variant="ghost"
                    size="sm"
                  />
                  <NeonButton
                    title={isLoading ? 'Enregistrement...' : 'Enregistrer'}
                    onPress={handleSave}
                    size="sm"
                    disabled={isLoading}
                  />
                </View>
              ) : (
                <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                  <Text style={styles.editButtonText}>Modifier mes informations</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Subscription Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Sparkles size={24} color={colors.primary.main} />
              <Text style={styles.sectionTitle}>Abonnement</Text>
            </View>

            <View style={styles.planCard}>
              <View style={styles.planInfo}>
                <Text style={styles.planName}>Hipster Gratuit</Text>
                <Text style={styles.planStatus}>Actif</Text>
              </View>
              <Text style={styles.planDescription}>Accès limité aux fonctionnalités de base.</Text>
              <View style={{ width: '100%' }}>
                <NeonButton
                  title="Passer Premium"
                  onPress={() => {}}
                  icon={<Sparkles size={18} color="#000" />}
                  variant="premium"
                />
              </View>
            </View>
          </View>

          {/* Security Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Lock size={24} color={colors.text.primary} />
              <Text style={styles.sectionTitle}>Sécurité</Text>
            </View>

            <TouchableOpacity style={styles.menuItem} onPress={() => setShowPasswordModal(true)}>
              <Text style={styles.menuItemText}>Modifier mon mot de passe</Text>
              <ChevronRight size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={colors.status.error} />
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {/* Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier le mot de passe</Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.label}>Mot de passe actuel</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color={colors.text.secondary} />
                <TextInput
                  style={styles.input}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry
                  placeholder="********"
                  placeholderTextColor={colors.text.muted}
                />
              </View>
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.label}>Nouveau mot de passe</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color={colors.text.secondary} />
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholder="8 caractères min."
                  placeholderTextColor={colors.text.muted}
                />
              </View>
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color={colors.text.secondary} />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="********"
                  placeholderTextColor={colors.text.muted}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <NeonButton
                title="Annuler"
                onPress={() => setShowPasswordModal(false)}
                variant="ghost"
              />
              <NeonButton
                title={isLoading ? 'Modification...' : 'Modifier'}
                onPress={handleChangePassword}
                disabled={isLoading}
              />
            </View>
          </View>
        </View>
      </Modal>

      <GenericModal
        visible={modalVisible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalVisible(false)}
      />
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary.main + '33',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary.main,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    height: 50,
  },
  activeInput: {
    borderColor: colors.primary.main,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  disabledInput: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 16,
    marginLeft: 12,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  editButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  editButtonText: {
    color: colors.primary.main,
    fontSize: 14,
    fontWeight: '600',
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  planInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  planStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    backgroundColor: colors.primary.main,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    padding: 16,
  },
  logoutText: {
    color: colors.status.error,
    fontSize: 16,
    fontWeight: '600',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.background.secondary,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.primary.main + '40',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalInputGroup: {
    marginBottom: 16,
    gap: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 16,
  },
});
