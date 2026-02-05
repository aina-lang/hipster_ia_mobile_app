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
import {
  User,
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
  Check,
  AlertCircle,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GenericModal, ModalType } from '../../components/ui/GenericModal';
import * as ImagePicker from 'expo-image-picker';
import { CountryPicker } from '../../components/ui/CountryPicker';
import { getCountryByName, Country } from '../../api/countries';

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

  // Profile Info State
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState('https://hipster-api.fr' + user?.avatarUrl || '');
  const [isEditing, setIsEditing] = useState(false);
  const [professionalEmail, setProfessionalEmail] = useState(
    user?.aiProfile?.professionalEmail || ''
  );
  const [professionalAddress, setProfessionalAddress] = useState(
    user?.aiProfile?.professionalAddress || ''
  );
  const [city, setCity] = useState(user?.aiProfile?.city || '');
  const [postalCode, setPostalCode] = useState(user?.aiProfile?.postalCode || '');
  const [country, setCountry] = useState(user?.aiProfile?.country || 'France');
  const [professionalPhone, setProfessionalPhone] = useState(
    user?.aiProfile?.professionalPhone || ''
  );
  const [professionalPhone2, setProfessionalPhone2] = useState(
    user?.aiProfile?.professionalPhone2 || ''
  );
  const [siret, setSiret] = useState(user?.aiProfile?.siret || '');
  const [vatNumber, setVatNumber] = useState(user?.aiProfile?.vatNumber || '');
  const [bankDetails, setBankDetails] = useState(user?.aiProfile?.bankDetails || '');
  const [websiteUrl, setWebsiteUrl] = useState(user?.aiProfile?.websiteUrl || '');
  const [logoUrl, setLogoUrl] = useState('https://hipster-api.fr' + user?.aiProfile?.logoUrl || '');
  const [isEditingPro, setIsEditingPro] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);

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

  // Animation
  const [saveButtonScale] = useState(new Animated.Value(1));

  const getLocalNumber = (phone: string, phoneCode?: string) => {
    if (!phone) return '';
    if (!phoneCode) return phone;
    if (phone.startsWith(phoneCode)) {
      return phone.replace(phoneCode, '').trim();
    }
    return phone.trim();
  };

  useEffect(() => {
    const userCountry = user?.aiProfile?.country;
    const initialCountry = userCountry ? getCountryByName(userCountry) : getCountryByName('France');

    setSelectedCountry(initialCountry);
    setCountry(initialCountry?.name || 'France');

    setProfessionalPhone(
      getLocalNumber(user?.aiProfile?.professionalPhone || '', initialCountry?.phoneCode)
    );
    setProfessionalPhone2(
      getLocalNumber(user?.aiProfile?.professionalPhone2 || '', initialCountry?.phoneCode)
    );
  }, [user]);

  const showFeedback = (type: ModalType, title: string, message: string) => {
    setModalConfig({ type, title, message });
    setModalVisible(true);
  };

  const animateSaveButton = () => {
    Animated.sequence([
      Animated.timing(saveButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(saveButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSavePersonal = async () => {
    if (!name.trim()) {
      showFeedback('warning', 'Champs requis', 'Veuillez remplir votre nom.');
      return;
    }

    animateSaveButton();

    try {
      let finalAvatarUrl = avatarUrl;

      if (avatarUrl && avatarUrl.startsWith('file://')) {
        finalAvatarUrl = await useAuthStore.getState().uploadAvatar(avatarUrl);
      }

      const updateData = { name, avatarUrl: finalAvatarUrl };

      await updateProfile(updateData);
      setIsEditing(false);
      showFeedback('success', 'Parfait !', 'Votre profil a été mis à jour avec succès.');
    } catch (err) {
      const errorMessage = useAuthStore.getState().error;
      showFeedback('error', 'Erreur', errorMessage || 'Une erreur est survenue.');
    }
  };

  const handleSaveProfessional = async () => {
    // Simplified: No companyName check needed

    animateSaveButton();

    try {
      let finalLogoUrl = logoUrl;

      if (logoUrl && logoUrl.startsWith('file://')) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser?.aiProfile?.id) {
          finalLogoUrl = await useAuthStore
            .getState()
            .uploadLogo(currentUser.aiProfile.id, logoUrl);
        }
      }

      const fullPhone1 =
        professionalPhone && selectedCountry
          ? `${selectedCountry.phoneCode} ${professionalPhone.trim()}`.replace(/\s+/g, ' ')
          : professionalPhone;

      const fullPhone2 =
        professionalPhone2 && selectedCountry
          ? `${selectedCountry.phoneCode} ${professionalPhone2.trim()}`.replace(/\s+/g, ' ')
          : professionalPhone2;

      await updateAiProfile({
        professionalEmail,
        professionalAddress,
        city,
        postalCode,
        country,
        professionalPhone: fullPhone1,
        professionalPhone2: fullPhone2,
        siret,
        vatNumber,
        bankDetails,
        websiteUrl,
        logoUrl: finalLogoUrl,
      });
      setIsEditingPro(false);
      showFeedback('success', 'Parfait !', 'Votre profil professionnel a été mis à jour.');
    } catch (err) {
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

  const pickImage = async (type: 'avatar' | 'logo') => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showFeedback('warning', 'Permission requise', "Veuillez autoriser l'accès à la galerie.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        if (type === 'avatar') {
          setAvatarUrl(imageUri);
        } else {
          setLogoUrl(imageUri);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      showFeedback('error', 'Erreur', "Impossible de sélectionner l'image.");
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

  const resetPersonalForm = () => {
    setIsEditing(false);
    setName(user?.name || '');
    setAvatarUrl(user?.avatarUrl || '');
  };

  const resetProfessionalForm = () => {
    setIsEditingPro(false);
    const profile = user?.aiProfile;
    const savedCountry = profile?.country ? getCountryByName(profile.country) : null;

    setProfessionalEmail(profile?.professionalEmail || '');
    setProfessionalAddress(profile?.professionalAddress || '');
    setCity(profile?.city || '');
    setPostalCode(profile?.postalCode || '');
    setCountry(profile?.country || 'France');
    setSelectedCountry(savedCountry);
    setProfessionalPhone(
      getLocalNumber(profile?.professionalPhone || '', savedCountry?.phoneCode)
    );
    setProfessionalPhone2(
      getLocalNumber(profile?.professionalPhone2 || '', savedCountry?.phoneCode)
    );
    setSiret(profile?.siret || '');
    setVatNumber(profile?.vatNumber || '');
    setBankDetails(profile?.bankDetails || '');
    setWebsiteUrl(profile?.websiteUrl || '');
    setLogoUrl(profile?.logoUrl || '');
  };

  return (
    <BackgroundGradient>
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

          {/* Personal Profile Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconBadge}>
                <User size={18} color={colors.primary.main} />
              </View>
              <Text style={styles.sectionTitle}>Profil Personnel</Text>
              {!isEditing && (
                <TouchableOpacity
                  style={styles.quickEditButton}
                  onPress={() => setIsEditing(true)}>
                  <Text style={styles.quickEditText}>Modifier</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.card}>
              {/* Avatar avec amélioration visuelle */}
              <View style={styles.avatarSection}>
                <View style={styles.avatarWrapper}>
                  {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <User size={36} color={colors.text.muted} />
                    </View>
                  )}
                  {isEditing && (
                    <TouchableOpacity
                      style={styles.cameraButton}
                      onPress={() => pickImage('avatar')}
                      activeOpacity={0.8}>
                      <Camera size={14} color="#000" />
                    </TouchableOpacity>
                  )}
                </View>
                {avatarUrl && isEditing && (
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setAvatarUrl('')}>
                    <X size={12} color={colors.status.error} />
                    <Text style={styles.removeImageText}>Retirer</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nom Complet *</Text>
                  <View style={[styles.inputContainer, isEditing && styles.activeInput]}>
                    <User size={16} color={colors.text.secondary} />
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      editable={isEditing}
                      placeholder="Votre nom"
                      placeholderTextColor={colors.text.muted}
                    />
                    {isEditing && name && (
                      <Check size={16} color={colors.primary.main} />
                    )}
                  </View>
                </View>

                {isEditing && (
                  <View style={styles.editActions}>
                    <TouchableOpacity style={styles.cancelButton} onPress={resetPersonalForm}>
                      <Text style={styles.cancelButtonText}>Annuler</Text>
                    </TouchableOpacity>
                    <Animated.View style={{ flex: 1, transform: [{ scale: saveButtonScale }] }}>
                      <TouchableOpacity
                        style={[styles.saveButton, isLoading && styles.disabledButton]}
                        onPress={handleSavePersonal}
                        disabled={isLoading}
                        activeOpacity={0.8}>
                        <Check size={18} color="#000" />
                        <Text style={styles.saveButtonText}>
                          {isLoading ? 'Sauvegarde...' : 'Enregistrer'}
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Professional Profile Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconBadge}>
                <Briefcase size={18} color={colors.primary.main} />
              </View>
              <Text style={styles.sectionTitle}>Profil Professionnel</Text>
              {!isEditingPro && (
                <TouchableOpacity
                  style={styles.quickEditButton}
                  onPress={() => setIsEditingPro(true)}>
                  <Text style={styles.quickEditText}>Modifier</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.card}>
              <View style={styles.form}>
                {/* Logo Section */}
                {logoUrl ? (
                  <View style={styles.logoPreviewContainer}>
                    <Image source={{ uri: logoUrl }} style={styles.logoPreview} />
                    {isEditingPro && (
                      <TouchableOpacity
                        style={styles.changeLogoButton}
                        onPress={() => pickImage('logo')}>
                        <Camera size={12} color={colors.primary.main} />
                        <Text style={styles.changeLogoText}>Changer</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  isEditingPro && (
                    <TouchableOpacity
                      style={styles.addLogoButton}
                      onPress={() => pickImage('logo')}>
                      <LucideImage size={20} color={colors.primary.main} />
                      <Text style={styles.addLogoText}>Ajouter un logo</Text>
                    </TouchableOpacity>
                  )
                )}

                {/* Form Fields */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email professionnel</Text>
                  <View style={[styles.inputContainer, isEditingPro && styles.activeInput]}>
                    <AtSign size={16} color={colors.text.secondary} />
                    <TextInput
                      style={styles.input}
                      value={professionalEmail}
                      onChangeText={setProfessionalEmail}
                      editable={isEditingPro}
                      placeholder="contact@entreprise.com"
                      placeholderTextColor={colors.text.muted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Address Row */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Adresse</Text>
                  <View style={[styles.inputContainer, isEditingPro && styles.activeInput]}>
                    <MapPin size={16} color={colors.text.secondary} />
                    <TextInput
                      style={styles.input}
                      value={professionalAddress}
                      onChangeText={setProfessionalAddress}
                      editable={isEditingPro}
                      placeholder="Rue, numéro"
                      placeholderTextColor={colors.text.muted}
                    />
                  </View>
                </View>

                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 2 }]}>
                    <Text style={styles.label}>Ville</Text>
                    <View style={[styles.inputContainer, isEditingPro && styles.activeInput]}>
                      <TextInput
                        style={[styles.input, { marginLeft: 12 }]}
                        value={city}
                        onChangeText={setCity}
                        editable={isEditingPro}
                        placeholder="Paris"
                        placeholderTextColor={colors.text.muted}
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>CP</Text>
                    <View style={[styles.inputContainer, isEditingPro && styles.activeInput]}>
                      <TextInput
                        style={[styles.input, { marginLeft: 12 }]}
                        value={postalCode}
                        onChangeText={setPostalCode}
                        editable={isEditingPro}
                        placeholder="75001"
                        placeholderTextColor={colors.text.muted}
                        keyboardType="numeric"
                        maxLength={5}
                      />
                    </View>
                  </View>
                </View>

                {/* Country Picker */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Pays</Text>
                  <TouchableOpacity
                    style={[
                      styles.countryPickerButton,
                      !isEditingPro && styles.disabledButton,
                    ]}
                    onPress={() => isEditingPro && setShowCountryPicker(true)}
                    disabled={!isEditingPro}>
                    <Globe size={16} color={colors.text.secondary} />
                    <Text style={styles.countryPickerText}>
                      {selectedCountry
                        ? `${selectedCountry.flag} ${selectedCountry.name}`
                        : country || 'Sélectionner'}
                    </Text>
                    <ChevronRight size={14} color={colors.text.muted} />
                  </TouchableOpacity>
                </View>

                {/* Phone Numbers */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Téléphone principal</Text>
                  <View style={[styles.inputContainer, isEditingPro && styles.activeInput]}>
                    <Phone size={16} color={colors.text.secondary} />
                    {selectedCountry && (
                      <View style={styles.inlinePrefix}>
                        <Text style={styles.prefixFlag}>{selectedCountry.flag}</Text>
                        <Text style={styles.prefixCode}>{selectedCountry.phoneCode}</Text>
                      </View>
                    )}
                    <TextInput
                      style={styles.input}
                      value={professionalPhone}
                      onChangeText={setProfessionalPhone}
                      editable={isEditingPro}
                      placeholder="6 12 34 56 78"
                      placeholderTextColor={colors.text.muted}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Téléphone secondaire</Text>
                  <View style={[styles.inputContainer, isEditingPro && styles.activeInput]}>
                    <Phone size={16} color={colors.text.secondary} />
                    {selectedCountry && (
                      <View style={styles.inlinePrefix}>
                        <Text style={styles.prefixFlag}>{selectedCountry.flag}</Text>
                        <Text style={styles.prefixCode}>{selectedCountry.phoneCode}</Text>
                      </View>
                    )}
                    <TextInput
                      style={styles.input}
                      value={professionalPhone2}
                      onChangeText={setProfessionalPhone2}
                      editable={isEditingPro}
                      placeholder="Optionnel"
                      placeholderTextColor={colors.text.muted}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                {/* SIRET & TVA (France uniquement) */}
                {selectedCountry?.name === 'France' && (
                  <View style={styles.inputRow}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>SIRET</Text>
                      <View style={[styles.inputContainer, isEditingPro && styles.activeInput]}>
                        <TextInput
                          style={[styles.input, { marginLeft: 12, fontSize: 13 }]}
                          value={siret}
                          onChangeText={setSiret}
                          editable={isEditingPro}
                          placeholder="14 chiffres"
                          placeholderTextColor={colors.text.muted}
                          keyboardType="numeric"
                          maxLength={14}
                        />
                      </View>
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>N° TVA</Text>
                      <View style={[styles.inputContainer, isEditingPro && styles.activeInput]}>
                        <TextInput
                          style={[styles.input, { marginLeft: 12, fontSize: 13 }]}
                          value={vatNumber}
                          onChangeText={setVatNumber}
                          editable={isEditingPro}
                          placeholder="FR..."
                          placeholderTextColor={colors.text.muted}
                        />
                      </View>
                    </View>
                  </View>
                )}

                {/* Bank & Website */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>IBAN / BIC</Text>
                  <View style={[styles.inputContainer, isEditingPro && styles.activeInput]}>
                    <CreditCard size={16} color={colors.text.secondary} />
                    <TextInput
                      style={styles.input}
                      value={bankDetails}
                      onChangeText={setBankDetails}
                      editable={isEditingPro}
                      placeholder="Coordonnées bancaires"
                      placeholderTextColor={colors.text.muted}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Site Web</Text>
                  <View style={[styles.inputContainer, isEditingPro && styles.activeInput]}>
                    <Link size={16} color={colors.text.secondary} />
                    <TextInput
                      style={styles.input}
                      value={websiteUrl}
                      onChangeText={setWebsiteUrl}
                      editable={isEditingPro}
                      placeholder="www.votre-site.com"
                      placeholderTextColor={colors.text.muted}
                      autoCapitalize="none"
                      keyboardType="url"
                    />
                  </View>
                </View>

                {isEditingPro && (
                  <View style={styles.editActions}>
                    <TouchableOpacity style={styles.cancelButton} onPress={resetProfessionalForm}>
                      <Text style={styles.cancelButtonText}>Annuler</Text>
                    </TouchableOpacity>
                    <Animated.View style={{ flex: 1, transform: [{ scale: saveButtonScale }] }}>
                      <TouchableOpacity
                        style={[styles.saveButton, isLoading && styles.disabledButton]}
                        onPress={handleSaveProfessional}
                        disabled={isLoading}
                        activeOpacity={0.8}>
                        <Check size={18} color="#000" />
                        <Text style={styles.saveButtonText}>
                          {isLoading ? 'Sauvegarde...' : 'Enregistrer'}
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
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
                    {user?.aiProfile?.planType
                      ? `Hipster ${user.aiProfile.planType.charAt(0).toUpperCase() + user.aiProfile.planType.slice(1)}`
                      : 'Hipster Gratuit'}
                  </Text>
                  <Text style={styles.planDescription}>
                    {user?.aiProfile?.planType === 'premium'
                      ? 'Accès illimité à tout'
                      : 'Fonctionnalités de base'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.planBadge,
                    user?.aiProfile?.subscriptionStatus === 'active' && styles.planBadgeActive,
                  ]}>
                  <Text style={styles.planBadgeText}>
                    {user?.aiProfile?.subscriptionStatus === 'active' ? 'Actif' : 'Gratuit'}
                  </Text>
                </View>
              </View>
              <View style={styles.planAction}>
                <Text style={styles.planActionText}>
                  {user?.aiProfile?.planType === 'premium' ? 'Gérer' : 'Passer Premium'}
                </Text>
                <ChevronRight size={18} color={colors.primary.main} />
              </View>
            </TouchableOpacity>
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

      {/* Country Picker Modal */}
      <CountryPicker
        visible={showCountryPicker}
        onClose={() => setShowCountryPicker(false)}
        onSelect={handleCountrySelect}
        selectedCountry={selectedCountry}
      />

      {/* Feedback Modal */}
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