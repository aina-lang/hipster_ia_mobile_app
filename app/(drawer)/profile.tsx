import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Switch,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { NeonButton } from '../../components/ui/NeonButton';
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

  // Personal Info State
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isEditing, setIsEditing] = useState(false);

  // Professional Profile State
  const [profileType, setProfileType] = useState<'particulier' | 'entreprise'>(
    user?.aiProfile?.profileType || 'particulier'
  );
  const [companyName, setCompanyName] = useState(user?.aiProfile?.companyName || '');
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
  const [logoUrl, setLogoUrl] = useState(user?.aiProfile?.logoUrl || '');
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

  const getLocalNumber = (phone: string, phoneCode?: string) => {
    if (!phone) return '';
    if (!phoneCode) return phone;
    // Remove prefix and any leading/trailing spaces
    if (phone.startsWith(phoneCode)) {
      return phone.replace(phoneCode, '').trim();
    }
    return phone.trim();
  };

  useEffect(() => {
    // Si utilisateur n'a pas de pays défini
    const userCountry = user?.aiProfile?.country;
    const initialCountry = userCountry ? getCountryByName(userCountry) : getCountryByName('France');

    setSelectedCountry(initialCountry);
    setCountry(initialCountry?.name || 'France');

    // Strip le préfixe si déjà dans le numéro
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

  const handleSavePersonal = async () => {
    if (!lastName.trim()) {
      showFeedback('warning', 'Champs requis', 'Veuillez remplir votre nom.');
      return;
    }

    try {
      let finalAvatarUrl = avatarUrl;

      // If avatarUrl is a local file (e.g., from ImagePicker), upload it first
      if (avatarUrl && avatarUrl.startsWith('file://')) {
        finalAvatarUrl = await useAuthStore.getState().uploadAvatar(avatarUrl);
      }

      await updateProfile({ firstName, lastName, avatarUrl: finalAvatarUrl });
      setIsEditing(false);
      showFeedback('success', 'Succès', 'Profil personnel mis à jour avec succès.');
    } catch (err) {
      const errorMessage = useAuthStore.getState().error;
      showFeedback('error', 'Erreur', errorMessage || 'Une erreur est survenue.');
    }
  };

  const handleSaveProfessional = async () => {
    if (profileType === 'entreprise' && !companyName.trim()) {
      showFeedback('warning', 'Champs requis', 'Veuillez entrer le nom de votre entreprise.');
      return;
    }

    try {
      let finalLogoUrl = logoUrl;

      // If logoUrl is a local file (e.g., from ImagePicker), upload it first
      if (logoUrl && logoUrl.startsWith('file://')) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser?.aiProfile?.id) {
          finalLogoUrl = await useAuthStore
            .getState()
            .uploadLogo(currentUser.aiProfile.id, logoUrl);
        }
      }

      // Concatenate prefix with local number for persistence
      const fullPhone1 =
        professionalPhone && selectedCountry
          ? `${selectedCountry.phoneCode} ${professionalPhone.trim()}`.replace(/\s+/g, ' ')
          : professionalPhone;

      const fullPhone2 =
        professionalPhone2 && selectedCountry
          ? `${selectedCountry.phoneCode} ${professionalPhone2.trim()}`.replace(/\s+/g, ' ')
          : professionalPhone2;

      await updateAiProfile({
        profileType,
        companyName: profileType === 'entreprise' ? companyName : '',
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
      showFeedback('success', 'Succès', 'Profil professionnel mis à jour avec succès.');
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

    try {
      await changePassword({ oldPassword, newPassword });
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showFeedback('success', 'Succès', 'Mot de passe modifié avec succès.');
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

  return (
    <BackgroundGradient>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ChevronRight
                size={24}
                color={colors.text.primary}
                style={{ transform: [{ rotate: '180deg' }] }}
              />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Mon Profil</Text>
              <Text style={styles.subtitle}>Gérez vos informations</Text>
            </View>
          </View>

          {/* Personal Profile Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconBadge}>
                <User size={20} color={colors.primary.main} />
              </View>
              <Text style={styles.sectionTitle}>Profil Personnel</Text>
            </View>

            <View style={styles.card}>
              {/* Avatar Preview */}
              <View style={styles.avatarSection}>
                <View style={styles.avatarContainer}>
                  {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <User size={40} color={colors.text.muted} />
                    </View>
                  )}
                  {isEditing && (
                    <TouchableOpacity
                      style={styles.cameraButton}
                      onPress={() => pickImage('avatar')}>
                      <Camera size={16} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
                {avatarUrl && isEditing && (
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setAvatarUrl('')}>
                    <X size={14} color={colors.status.error} />
                    <Text style={styles.removeImageText}>Retirer</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Prénom</Text>
                  <View style={[styles.inputContainer, isEditing && styles.activeInput]}>
                    <User size={18} color={colors.text.secondary} />
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
                    <User size={18} color={colors.text.secondary} />
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

                {isEditing ? (
                  <View style={styles.editActions}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setIsEditing(false);
                        setFirstName(user?.firstName || '');
                        setLastName(user?.lastName || '');
                        setAvatarUrl(user?.avatarUrl || '');
                      }}>
                      <Text style={styles.cancelButtonText}>Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveButton, isLoading && styles.disabledButton]}
                      onPress={handleSavePersonal}
                      disabled={isLoading}>
                      <Text style={styles.saveButtonText}>
                        {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                    <Text style={styles.editButtonText}>Modifier</Text>
                    <ChevronRight size={16} color={colors.primary.main} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {/* Professional Profile Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconBadge}>
                <Briefcase size={20} color={colors.primary.main} />
              </View>
              <Text style={styles.sectionTitle}>Profil Professionnel</Text>
            </View>

            <View style={styles.card}>
              {/* Type Toggle */}
              <View style={styles.typeToggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    profileType === 'particulier' && styles.typeOptionActive,
                  ]}
                  onPress={() => isEditingPro && setProfileType('particulier')}
                  disabled={!isEditingPro}>
                  <User
                    size={18}
                    color={profileType === 'particulier' ? '#000' : colors.text.muted}
                  />
                  <Text
                    style={[
                      styles.typeOptionText,
                      profileType === 'particulier' && styles.typeOptionTextActive,
                    ]}>
                    Particulier
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    profileType === 'entreprise' && styles.typeOptionActive,
                  ]}
                  onPress={() => isEditingPro && setProfileType('entreprise')}
                  disabled={!isEditingPro}>
                  <Building2
                    size={18}
                    color={profileType === 'entreprise' ? '#000' : colors.text.muted}
                  />
                  <Text
                    style={[
                      styles.typeOptionText,
                      profileType === 'entreprise' && styles.typeOptionTextActive,
                    ]}>
                    Entreprise
                  </Text>
                </TouchableOpacity>
              </View>

              {profileType === 'entreprise' ? (
                <View style={styles.form}>
                  {/* Logo Preview */}
                  {logoUrl && (
                    <View style={styles.logoPreviewContainer}>
                      <Image source={{ uri: logoUrl }} style={styles.logoPreview} />
                      {isEditingPro && (
                        <TouchableOpacity
                          style={styles.changeLogoButton}
                          onPress={() => pickImage('logo')}>
                          <Camera size={14} color={colors.primary.main} />
                          <Text style={styles.changeLogoText}>Changer</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {!logoUrl && isEditingPro && (
                    <TouchableOpacity
                      style={styles.addLogoButton}
                      onPress={() => pickImage('logo')}>
                      <LucideImage size={24} color={colors.primary.main} />
                      <Text style={styles.addLogoText}>Ajouter un logo</Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nom de l'entreprise *</Text>
                    <View style={[styles.inputContainer, isEditingPro && styles.activeInput]}>
                      <Building2 size={18} color={colors.text.secondary} />
                      <TextInput
                        style={styles.input}
                        value={companyName}
                        onChangeText={setCompanyName}
                        editable={isEditingPro}
                        placeholder="Ex: Hypster Studio"
                        placeholderTextColor={colors.text.muted}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email professionnel</Text>
                    <View style={[styles.inputContainer, isEditingPro && styles.activeInput]}>
                      <AtSign size={18} color={colors.text.secondary} />
                      <TextInput
                        style={styles.input}
                        value={professionalEmail}
                        onChangeText={setProfessionalEmail}
                        editable={isEditingPro}
                        placeholder="contact@entreprise.com"
                        placeholderTextColor={colors.text.muted}
                        keyboardType="email-address"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Adresse</Text>
                    <View style={[styles.inputContainer, isEditingPro && styles.activeInput]}>
                      <MapPin size={18} color={colors.text.secondary} />
                      <TextInput
                        style={styles.input}
                        value={professionalAddress}
                        onChangeText={setProfessionalAddress}
                        editable={isEditingPro}
                        placeholder="Adresse complète"
                        placeholderTextColor={colors.text.muted}
                      />
                    </View>
                  </View>

                  <View style={styles.inputRow}>
                    <View style={[styles.inputGroup, { flex: 2 }]}>
                      <Text style={styles.label}>Ville</Text>
                      <View style={[styles.inputContainer, isEditingPro && styles.activeInput]}>
                        <MapPin size={18} color={colors.text.secondary} />
                        <TextInput
                          style={styles.input}
                          value={city}
                          onChangeText={setCity}
                          editable={isEditingPro}
                          placeholder="Paris"
                          placeholderTextColor={colors.text.muted}
                        />
                      </View>
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Code postal</Text>
                      <View style={[styles.inputContainer, isEditingPro && styles.activeInput]}>
                        <TextInput
                          style={[styles.input, { marginLeft: 0 }]}
                          value={postalCode}
                          onChangeText={setPostalCode}
                          editable={isEditingPro}
                          placeholder="75001"
                          placeholderTextColor={colors.text.muted}
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Pays</Text>
                    <TouchableOpacity
                      style={[styles.countryPickerButton, !isEditingPro && styles.disabledButton]}
                      onPress={() => isEditingPro && setShowCountryPicker(true)}
                      disabled={!isEditingPro}>
                      <Globe size={18} color={colors.text.secondary} />
                      <Text style={styles.countryPickerText}>
                        {selectedCountry
                          ? `${selectedCountry.flag} ${selectedCountry.name}`
                          : country || 'Sélectionner un pays'}
                      </Text>
                      <ChevronRight size={16} color={colors.text.muted} />
                    </TouchableOpacity>
                  </View>

                  <View style={{}}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Téléphone 1</Text>
                      <View style={[styles.inputContainer, isEditingPro && styles.activeInput]}>
                        <Phone size={18} color={colors.text.secondary} />
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
                          placeholder="Principal"
                          placeholderTextColor={colors.text.muted}
                          keyboardType="phone-pad"
                        />
                      </View>
                    </View>

                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <Text style={styles.label}>Téléphone 2</Text>
                      <View style={[styles.inputContainer, isEditingPro && styles.activeInput]}>
                        <Phone size={18} color={colors.text.secondary} />
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
                  </View>

                  {selectedCountry?.name === 'France' && (
                    <View style={styles.inputRow}>
                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>SIRET</Text>
                        <View style={[styles.inputContainer, isEditingPro && styles.activeInput]}>
                          <Building2 size={18} color={colors.text.secondary} />
                          <TextInput
                            style={styles.input}
                            value={siret}
                            onChangeText={setSiret}
                            editable={isEditingPro}
                            placeholder="14 chiffres"
                            placeholderTextColor={colors.text.muted}
                            keyboardType="numeric"
                          />
                        </View>
                      </View>

                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.label}>N° TVA</Text>
                        <View style={[styles.inputContainer, isEditingPro && styles.activeInput]}>
                          <CreditCard size={18} color={colors.text.secondary} />
                          <TextInput
                            style={styles.input}
                            value={vatNumber}
                            onChangeText={setVatNumber}
                            editable={isEditingPro}
                            placeholder="FR12345678901"
                            placeholderTextColor={colors.text.muted}
                          />
                        </View>
                      </View>
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Coordonnées Bancaires</Text>
                    <View style={[styles.inputContainer, isEditingPro && styles.activeInput]}>
                      <CreditCard size={18} color={colors.text.secondary} />
                      <TextInput
                        style={styles.input}
                        value={bankDetails}
                        onChangeText={setBankDetails}
                        editable={isEditingPro}
                        placeholder="IBAN / BIC"
                        placeholderTextColor={colors.text.muted}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Site Web</Text>
                    <View style={[styles.inputContainer, isEditingPro && styles.activeInput]}>
                      <Link size={18} color={colors.text.secondary} />
                      <TextInput
                        style={styles.input}
                        value={websiteUrl}
                        onChangeText={setWebsiteUrl}
                        editable={isEditingPro}
                        placeholder="www.votre-site.com"
                        placeholderTextColor={colors.text.muted}
                      />
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    En mode Particulier, l'IA utilisera votre nom pour les créations.
                  </Text>
                  <Text style={styles.infoTextSecondary}>
                    Passez en mode Entreprise pour ajouter vos coordonnées professionnelles.
                  </Text>
                </View>
              )}

              {isEditingPro ? (
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => {
                      setIsEditingPro(false);
                      const profile = user?.aiProfile;
                      const savedCountry = profile?.country
                        ? getCountryByName(profile.country)
                        : null;

                      setProfileType(profile?.profileType || 'particulier');
                      setCompanyName(profile?.companyName || '');
                      setProfessionalEmail(profile?.professionalEmail || '');
                      setProfessionalAddress(profile?.professionalAddress || '');
                      setCity(profile?.city || '');
                      setPostalCode(profile?.postalCode || '');
                      setCountry(profile?.country || 'France');
                      setSelectedCountry(savedCountry);

                      // Strip prefixes for display on reset
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
                    }}>
                    <Text style={styles.cancelButtonText}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.saveButton, isLoading && styles.disabledButton]}
                    onPress={handleSaveProfessional}
                    disabled={isLoading}>
                    <Text style={styles.saveButtonText}>
                      {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.editButton} onPress={() => setIsEditingPro(true)}>
                  <Text style={styles.editButtonText}>Modifier</Text>
                  <ChevronRight size={16} color={colors.primary.main} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Subscription Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconBadge}>
                <Sparkles size={20} color={colors.primary.main} />
              </View>
              <Text style={styles.sectionTitle}>Abonnement</Text>
            </View>

            <View style={styles.planCard}>
              <View style={styles.planHeader}>
                <View>
                  <Text style={styles.planName}>
                    {user?.aiProfile?.planType
                      ? `Hipster ${user.aiProfile.planType.charAt(0).toUpperCase() + user.aiProfile.planType.slice(1)}`
                      : 'Hipster Gratuit'}
                  </Text>
                  <Text style={styles.planDescription}>
                    {user?.aiProfile?.planType === 'premium'
                      ? 'Accès illimité à toutes les fonctionnalités'
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
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => router.push('/(drawer)/subscription')}>
                <Sparkles size={18} color="#000" />
                <Text style={styles.upgradeButtonText}>
                  {user?.aiProfile?.planType === 'premium'
                    ? "Gérer l'abonnement"
                    : 'Passer Premium'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Security Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconBadge}>
                <Lock size={20} color={colors.primary.main} />
              </View>
              <Text style={styles.sectionTitle}>Sécurité</Text>
            </View>

            <TouchableOpacity style={styles.menuItem} onPress={() => setShowPasswordModal(true)}>
              <Lock size={20} color={colors.text.secondary} />
              <Text style={styles.menuItemText}>Modifier le mot de passe</Text>
              <ChevronRight size={20} color={colors.text.muted} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={20} color={colors.status.error} />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </TouchableOpacity>
          </View>
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier le mot de passe</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <X size={24} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mot de passe actuel</Text>
                <View style={styles.inputContainer}>
                  <Lock size={18} color={colors.text.secondary} />
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
                  <Lock size={18} color={colors.text.secondary} />
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
                  <Lock size={18} color={colors.text.secondary} />
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
  scrollContent: { padding: 20, paddingBottom: 80 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTextContainer: { flex: 1 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary.main + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.primary.main,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
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
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,59,48,0.1)',
    borderRadius: 8,
  },
  removeImageText: {
    fontSize: 12,
    color: colors.status.error,
    fontWeight: '600',
  },
  form: { gap: 16 },
  inputGroup: { gap: 8 },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    height: 48,
  },
  activeInput: {
    borderColor: colors.primary.main + '60',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 15,
    marginLeft: 12,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  editButtonText: {
    color: colors.primary.main,
    fontSize: 15,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  typeToggleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  typeOptionActive: {
    backgroundColor: colors.primary.main,
  },
  typeOptionText: {
    fontSize: 14,
    color: colors.text.muted,
    fontWeight: '600',
  },
  typeOptionTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  logoPreviewContainer: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  logoPreview: {
    width: 80,
    height: 80,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  changeLogoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary.main + '40',
  },
  changeLogoText: {
    fontSize: 12,
    color: colors.primary.main,
    fontWeight: '600',
  },
  addLogoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary.main + '40',
    marginBottom: 16,
  },
  addLogoText: {
    fontSize: 14,
    color: colors.primary.main,
    fontWeight: '600',
  },
  infoBox: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary.main,
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    color: colors.text.primary,
    fontSize: 14,
    lineHeight: 20,
  },
  infoTextSecondary: {
    color: colors.text.secondary,
    fontSize: 13,
    lineHeight: 18,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.primary.main + '40',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  planBadgeActive: {
    backgroundColor: colors.primary.main + '30',
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary.main,
  },
  upgradeButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,59,48,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.3)',
  },
  logoutText: {
    color: colors.status.error,
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.background.secondary,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  modalBody: {
    gap: 16,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
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
    fontSize: 15,
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700',
  },
  countryPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    height: 48,
    gap: 12,
  },
  countryPickerText: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 15,
  },
  inlinePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
    gap: 4,
  },
  prefixFlag: {
    fontSize: 16,
  },
  prefixCode: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '600',
  },
});
