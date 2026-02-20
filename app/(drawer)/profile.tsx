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
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { useAuthStore } from '../../store/authStore';
import {
  User,
  Mail,
  Lock,
  Sparkles,
  LogOut,
  ChevronRight,
  Briefcase,
  MapPin,
  Phone,
  Building2,
  AtSign,
  CreditCard,
  Link,
  Image as LucideImage,
  Camera,
  X,
  Globe,
  ChevronDown,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GenericModal, ModalType } from '../../components/ui/GenericModal';
import * as ImagePicker from 'expo-image-picker';
import { CountryPicker } from '../../components/ui/CountryPicker';
import { getCountryByName, Country } from '../../api/countries';
import { BackgroundGradientOnboarding } from 'components/ui/BackgroundGradientOnboarding';

export default function ProfileScreen() {
  const router = useRouter();
  const {
    user,
    updateAiProfile,
    changePassword,
    logout,
    isLoading,
  } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);

  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [professionalEmail, setProfessionalEmail] = useState(user?.professionalEmail || '');
  const [professionalAddress, setProfessionalAddress] = useState(user?.professionalAddress || '');
  const [city, setCity] = useState(user?.city || '');
  const [postalCode, setPostalCode] = useState(user?.postalCode || '');
  const [country, setCountry] = useState(user?.country || 'France');
  const [professionalPhone, setProfessionalPhone] = useState(user?.professionalPhone || '');
  const [professionalPhone2, setProfessionalPhone2] = useState(user?.professionalPhone2 || '');
  const [siret, setSiret] = useState(user?.siret || '');
  const [vatNumber, setVatNumber] = useState(user?.vatNumber || '');
  const [websiteUrl, setWebsiteUrl] = useState(user?.websiteUrl || '');
  const [logoUrl, setLogoUrl] = useState(user?.logoUrl || '');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Feedback Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ type: ModalType; title: string; message: string }>({
    type: 'info', title: '', message: '',
  });

  const getLocalNumber = (phone: string, phoneCode?: string) => {
    if (!phone) return '';
    if (!phoneCode) return phone;
    if (phone.startsWith(phoneCode)) return phone.replace(phoneCode, '').trim();
    return phone.trim();
  };

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setProfessionalEmail(user.professionalEmail || '');
      setProfessionalAddress(user.professionalAddress || '');
      setCity(user.city || '');
      setPostalCode(user.postalCode || '');
      setCountry(user.country || 'France');
      setSiret(user.siret || '');
      setVatNumber(user.vatNumber || '');
      setWebsiteUrl(user.websiteUrl || '');
      setLogoUrl(user.logoUrl || '');

      const userCountry = user.country;
      const initialCountry = userCountry ? getCountryByName(userCountry) : getCountryByName('France');
      setSelectedCountry(initialCountry);
      setProfessionalPhone(getLocalNumber(user.professionalPhone || '', initialCountry?.phoneCode));
      setProfessionalPhone2(getLocalNumber(user.professionalPhone2 || '', initialCountry?.phoneCode));
    }
  }, [user]);

  const showFeedback = (type: ModalType, title: string, message: string) => {
    setModalConfig({ type, title, message });
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const fullPhone1 = professionalPhone && selectedCountry
        ? `${selectedCountry.phoneCode} ${professionalPhone.trim()}`.replace(/\s+/g, ' ')
        : professionalPhone;
      const fullPhone2 = professionalPhone2 && selectedCountry
        ? `${selectedCountry.phoneCode} ${professionalPhone2.trim()}`.replace(/\s+/g, ' ')
        : professionalPhone2;

      await updateAiProfile({
        name, professionalEmail, professionalAddress, city, postalCode, country,
        professionalPhone: fullPhone1, professionalPhone2: fullPhone2,
        siret, vatNumber, websiteUrl, logoUrl,
      });
      setIsEditing(false);
      showFeedback('success', 'Succès', 'Profil mis à jour avec succès.');
    } catch {
      showFeedback('error', 'Erreur', useAuthStore.getState().error || 'Une erreur est survenue.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setName(user.name || '');
      setProfessionalEmail(user.professionalEmail || '');
      setProfessionalAddress(user.professionalAddress || '');
      setCity(user.city || '');
      setPostalCode(user.postalCode || '');
      setCountry(user.country || 'France');
      const savedCountry = user.country ? getCountryByName(user.country) : null;
      setSelectedCountry(savedCountry);
      setProfessionalPhone(getLocalNumber(user.professionalPhone || '', savedCountry?.phoneCode));
      setProfessionalPhone2(getLocalNumber(user.professionalPhone2 || '', savedCountry?.phoneCode));
      setSiret(user.siret || '');
      setVatNumber(user.vatNumber || '');
      setWebsiteUrl(user.websiteUrl || '');
      setLogoUrl(user.logoUrl || '');
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
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      showFeedback('success', 'Succès', 'Mot de passe modifié avec succès.');
    } catch {
      showFeedback('error', 'Erreur', useAuthStore.getState().error || 'Impossible de modifier le mot de passe.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        showFeedback('info', 'Upload...', 'Mise à jour de votre image de marque...');
        await useAuthStore.getState().uploadLogo(user!.id, result.assets[0].uri);
        showFeedback('success', 'Succès', 'Image mise à jour avec succès.');
      }
    } catch {
      showFeedback('error', 'Erreur', "Impossible d'importer l'image.");
    }
  };

  const handleCountrySelect = (countryData: Country) => {
    setSelectedCountry(countryData);
    setCountry(countryData.name);
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <BackgroundGradientOnboarding darkOverlay={true} >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronRight size={20} color={colors.text.primary} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Mon Profil Pro</Text>
              <Text style={styles.subtitle}>Gérez vos informations professionnelles</Text>
            </View>
          </View>

          {/* Hero Identity Card */}
          <View style={styles.heroCard}>
            <View style={styles.heroAccent} />
            <View style={styles.heroAvatarWrapper}>
              <View style={styles.heroAvatarRing}>
                {user?.logoUrl || user?.avatarUrl ? (
                  <Image source={{ uri: `https://hipster-api.fr${user.logoUrl || user.avatarUrl}` }} style={styles.heroAvatar} />
                ) : (
                  <View style={styles.heroAvatarPlaceholder}>
                    <Briefcase size={52} color={colors.primary.main} />
                  </View>
                )}
              </View>
              {isEditing && (
                <TouchableOpacity style={styles.heroCameraButton} onPress={pickImage}>
                  <Camera size={16} color="#000" />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.heroName}>{user?.name || 'Nom / Entreprise'}</Text>
            <Text style={styles.heroEmail}>{user?.email || ''}</Text>

            <View style={styles.heroPlanBadge}>
              <Sparkles size={12} color={colors.primary.main} />
              <Text style={styles.heroPlanText}>
                {user?.planType === 'studio' || user?.planType === 'agence' ? 'Hipster Premium' : 'Hipster Gratuit'}
              </Text>
            </View>
          </View>

          {/* Main Content Card */}
          <View style={styles.mainCard}>
            <View style={styles.form}>
              <InputField
                label="Nom complet / Nom de l'entreprise"
                icon={<Briefcase size={16} color={colors.text.muted} />}
                value={name}
                onChangeText={setName}
                placeholder="Ex: Hipster Marketing"
                editable={isEditing}
              />
              <InputField
                label="Email de connexion (lecture seule)"
                icon={<Lock size={16} color={colors.text.muted} />}
                value={user?.email || ''}
                editable={false}
                dimmed
              />
              <InputField
                label="Email professionnel / Contact"
                icon={<Mail size={16} color={colors.text.muted} />}
                value={professionalEmail}
                onChangeText={setProfessionalEmail}
                placeholder="email@contact.com"
                editable={isEditing}
                keyboardType="email-address"
              />
              <InputField
                label="Adresse professionnelle"
                icon={<MapPin size={16} color={colors.text.muted} />}
                value={professionalAddress}
                onChangeText={setProfessionalAddress}
                placeholder="Votre adresse"
                editable={isEditing}
                multiline
              />

              <View style={styles.inputRow}>
                <View style={{ flex: 2 }}>
                  <InputField
                    label="Ville"
                    value={city}
                    onChangeText={setCity}
                    placeholder="Ville"
                    editable={isEditing}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <InputField
                    label="Code postal"
                    value={postalCode}
                    onChangeText={setPostalCode}
                    placeholder="CP"
                    editable={isEditing}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Pays</Text>
                <TouchableOpacity
                  style={[styles.inputContainer, isEditing && styles.activeInput]}
                  onPress={() => isEditing && setShowCountryPicker(true)}
                  disabled={!isEditing}
                >
                  <Globe size={16} color={colors.text.muted} />
                  <Text style={[styles.input, { marginLeft: 12, color: colors.text.primary }]}>
                    {selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : country || 'Sélectionner un pays'}
                  </Text>
                  {isEditing && <ChevronDown size={14} color={colors.text.muted} />}
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Téléphone principal</Text>
                <View style={[styles.inputContainer, isEditing && styles.activeInput]}>
                  {selectedCountry && (
                    <View style={styles.inlinePrefix}>
                      <Text style={styles.prefixFlag}>{selectedCountry.flag}</Text>
                      <Text style={styles.prefixCode}>{selectedCountry.phoneCode}</Text>
                    </View>
                  )}
                  <Phone size={16} color={colors.text.muted} />
                  <TextInput
                    style={styles.input}
                    value={professionalPhone}
                    onChangeText={setProfessionalPhone}
                    placeholder="Téléphone 1"
                    placeholderTextColor={colors.text.muted}
                    editable={isEditing}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Téléphone secondaire</Text>
                <View style={[styles.inputContainer, isEditing && styles.activeInput]}>
                  {selectedCountry && (
                    <View style={styles.inlinePrefix}>
                      <Text style={styles.prefixFlag}>{selectedCountry.flag}</Text>
                      <Text style={styles.prefixCode}>{selectedCountry.phoneCode}</Text>
                    </View>
                  )}
                  <Phone size={16} color={colors.text.muted} />
                  <TextInput
                    style={styles.input}
                    value={professionalPhone2}
                    onChangeText={setProfessionalPhone2}
                    placeholder="Téléphone 2"
                    placeholderTextColor={colors.text.muted}
                    editable={isEditing}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {selectedCountry?.name === 'France' && (
                <>
                  <InputField
                    label="Numéro SIRET"
                    icon={<Building2 size={16} color={colors.text.muted} />}
                    value={siret}
                    onChangeText={setSiret}
                    placeholder="14 chiffres"
                    editable={isEditing}
                    keyboardType="numeric"
                  />
                  <InputField
                    label="Numéro TVA"
                    icon={<AtSign size={16} color={colors.text.muted} />}
                    value={vatNumber}
                    onChangeText={setVatNumber}
                    placeholder="FR00123456789"
                    editable={isEditing}
                    autoCapitalize="characters"
                  />
                </>
              )}

              <InputField
                label="Site Web"
                icon={<Link size={16} color={colors.text.muted} />}
                value={websiteUrl}
                onChangeText={setWebsiteUrl}
                placeholder="www.monsite.com"
                editable={isEditing}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            {/* Action Buttons */}
            {isEditing ? (
              <View style={styles.editActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isLoading}>
                  <Text style={styles.saveButtonText}>{isLoading ? 'Enregistrement...' : 'Enregistrer'}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                <Text style={styles.editButtonText}>Modifier le profil pro</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Subscription Section */}
          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planName}>
                  {user?.planType
                    ? `Hipster ${user.planType.charAt(0).toUpperCase() + user.planType.slice(1)}`
                    : 'Hipster Gratuit'}
                </Text>
                <Text style={styles.planDescription}>
                  {user?.planType === 'studio' || user?.planType === 'agence' ? 'Accès illimité' : 'Pack de base'}
                </Text>
              </View>
              <View style={[styles.planBadge, user?.subscriptionStatus === 'active' && styles.planBadgeActive]}>
                <Text style={styles.planBadgeText}>
                  {user?.subscriptionStatus === 'active' ? 'Actif' : 'Gratuit'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.upgradeButton} onPress={() => router.push('/(drawer)/subscription')}>
              <Sparkles size={18} color="#000" />
              <Text style={styles.upgradeButtonText}>Gérer l'abonnement</Text>
            </TouchableOpacity>
          </View>

          {/* Security & Logout */}
          <View style={styles.securitySection}>
            <TouchableOpacity style={styles.menuItem} onPress={() => setShowPasswordModal(true)}>
              <Lock size={18} color={colors.text.muted} />
              <Text style={styles.menuItemText}>Modifier le mot de passe</Text>
              <ChevronRight size={18} color={colors.text.muted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={18} color={colors.status.error} />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>

      {/* Password Modal */}
      <Modal visible={showPasswordModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sécurité</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <X size={22} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <InputField label="Mot de passe actuel" icon={<Lock size={16} color={colors.text.muted} />}
                value={oldPassword} onChangeText={setOldPassword} placeholder="••••••••" secureTextEntry editable />
              <InputField label="Nouveau mot de passe" icon={<Lock size={16} color={colors.text.muted} />}
                value={newPassword} onChangeText={setNewPassword} placeholder="••••••••" secureTextEntry editable />
              <InputField label="Confirmer le mot de passe" icon={<Lock size={16} color={colors.text.muted} />}
                value={confirmPassword} onChangeText={setConfirmPassword} placeholder="••••••••" secureTextEntry editable />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowPasswordModal(false)}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword} disabled={isLoading}>
                <Text style={styles.saveButtonText}>{isLoading ? '...' : 'Modifier'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CountryPicker
        visible={showCountryPicker}
        onClose={() => setShowCountryPicker(false)}
        onSelect={handleCountrySelect}
        selectedCountry={selectedCountry}
      />

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

/* ─── Reusable InputField component ─── */
function InputField({
  label, icon, value, onChangeText, placeholder, editable = true, dimmed = false,
  keyboardType, autoCapitalize, secureTextEntry, multiline = false,
}: {
  label: string; icon?: React.ReactNode; value: string; onChangeText?: (v: string) => void;
  placeholder?: string; editable?: boolean; dimmed?: boolean;
  keyboardType?: any; autoCapitalize?: any; secureTextEntry?: boolean; multiline?: boolean;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.inputContainer,
        editable && !dimmed && styles.activeInput,
        dimmed && styles.dimmedInput,
        multiline && { height: 'auto', minHeight: 80, alignItems: 'flex-start', paddingVertical: 12 }
      ]}>
        {icon}
        <TextInput
          style={[styles.input, dimmed && { opacity: 0.5 }, multiline && { textAlignVertical: 'top' }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.muted}
          editable={editable && !dimmed}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 80 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 28, gap: 16 },
  backButton: {
    width: 44, height: 44,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  headerTextContainer: { flex: 1 },
  title: { fontSize: 28, fontWeight: '800', color: colors.text.primary, marginBottom: 2 },
  subtitle: { fontSize: 14, color: colors.text.secondary },
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 28,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24, marginBottom: 20, overflow: 'hidden',
  },
  heroAccent: {
    position: 'absolute', top: -60, left: -60, width: 200, height: 200,
    borderRadius: 100, backgroundColor: colors.primary.main, opacity: 0.08,
  },
  heroAvatarWrapper: { position: 'relative', marginBottom: 16 },
  heroAvatarRing: {
    width: 120, height: 120, borderRadius: 60, padding: 4,
    backgroundColor: colors.primary.main + '30', borderWidth: 2, borderColor: colors.primary.main, overflow: 'hidden',
  },
  heroAvatar: { width: '100%', height: '100%', borderRadius: 56 },
  heroAvatarPlaceholder: {
    width: '100%', height: '100%', borderRadius: 56,
    backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center',
  },
  heroCameraButton: {
    position: 'absolute', bottom: 2, right: 2, width: 34, height: 34, borderRadius: 17,
    backgroundColor: colors.primary.main, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#0a0a0a',
  },
  heroName: { fontSize: 24, fontWeight: '800', color: colors.text.primary, marginBottom: 4, textAlign: 'center' },
  heroEmail: { fontSize: 14, color: colors.text.secondary, marginBottom: 14, textAlign: 'center' },
  heroPlanBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6,
    backgroundColor: colors.primary.main + '25', borderRadius: 20, borderWidth: 1, borderColor: colors.primary.main + '50',
  },
  heroPlanText: { fontSize: 12, fontWeight: '700', color: colors.primary.main },
  mainCard: {
    backgroundColor: 'rgba(255,255,255,0.09)', borderRadius: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', padding: 20, marginBottom: 20,
  },
  form: { gap: 14, marginBottom: 20 },
  inputRow: { flexDirection: 'row', gap: 12 },
  inputGroup: { gap: 7 },
  label: { fontSize: 12, color: colors.text.secondary, fontWeight: '600', marginLeft: 2, letterSpacing: 0.3 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 13, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)', height: 50,
  },
  activeInput: { borderColor: colors.primary.main + '70', backgroundColor: 'rgba(255,255,255,0.09)' },
  dimmedInput: { opacity: 0.6 },
  input: { flex: 1, color: colors.text.primary, fontSize: 15, marginLeft: 10 },
  editActions: { flexDirection: 'row', gap: 12 },
  cancelButton: {
    flex: 1, paddingVertical: 14, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  cancelButtonText: { color: colors.text.secondary, fontSize: 15, fontWeight: '600' },
  saveButton: { flex: 1, paddingVertical: 14, borderRadius: 13, backgroundColor: colors.primary.main, alignItems: 'center' },
  saveButtonText: { color: '#000', fontSize: 15, fontWeight: '700' },
  editButton: { alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)' },
  editButtonText: { color: colors.primary.main, fontSize: 15, fontWeight: '700' },
  inlinePrefix: {
    flexDirection: 'row', alignItems: 'center', paddingRight: 10,
    borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.12)', marginRight: 6, gap: 4,
  },
  prefixFlag: { fontSize: 16 },
  prefixCode: { fontSize: 13, color: colors.text.secondary, fontWeight: '600' },
  planCard: {
    backgroundColor: 'rgba(255,255,255,0.09)', borderRadius: 24, padding: 20,
    borderWidth: 1.5, borderColor: colors.primary.main + '50', marginBottom: 20,
  },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  planName: { fontSize: 20, fontWeight: '800', color: colors.text.primary, marginBottom: 4 },
  planDescription: { fontSize: 13, color: colors.text.secondary },
  planBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)' },
  planBadgeActive: { backgroundColor: colors.primary.main + '30' },
  planBadgeText: { fontSize: 11, fontWeight: '800', color: colors.text.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  upgradeButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 13,
    backgroundColor: colors.primary.main,
  },
  upgradeButtonText: { color: '#000', fontSize: 15, fontWeight: '700' },
  securitySection: { gap: 12 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.09)',
    padding: 16, borderRadius: 16, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  menuItemText: { flex: 1, fontSize: 15, color: colors.text.primary, fontWeight: '500' },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 16, borderRadius: 16,
    backgroundColor: 'rgba(255,59,48,0.10)', borderWidth: 1, borderColor: 'rgba(255,59,48,0.3)',
  },
  logoutText: { color: colors.status.error, fontSize: 15, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: {
    width: '100%', maxWidth: 400, backgroundColor: '#1a1a1a', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text.primary },
  modalBody: { gap: 16, marginBottom: 24 },
  modalActions: { flexDirection: 'row', gap: 12 },
});