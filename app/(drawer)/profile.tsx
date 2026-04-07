import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, Text, TextInput, KeyboardAvoidingView,
  Platform, TouchableOpacity, ScrollView, Pressable,
  ActivityIndicator, Animated as RNAnimated, Easing, Image, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft, Mail, Lock, Sparkles, LogOut, ChevronRight,
  Briefcase, MapPin, Phone, Building2, AtSign, Link, Camera,
  X, Globe, ChevronDown, Users,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { GenericModal, ModalType } from '../../components/ui/GenericModal';
import { CountryPicker } from '../../components/ui/CountryPicker';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { getCountryByName, Country } from '../../api/countries';
import { useWelcomeVideoStore } from '../../store/welcomeVideoStore';

import { NeonBorderInput } from '../../components/ui/NeonBorderInput';
import { NeonActionButton } from '../../components/ui/NeonActionButton';
import { NeonBackButton } from '../../components/ui/NeonBackButton';

const AVATAR_SIZE = 110;

const JOB_OPTIONS = [
  'Coiffure & Esthétique',
  'Restaurant / Bar',
  'Commerce / Boutique',
  "Artisans du bâtiment",
  'Service local',
  'Profession libérale',
  'Bien-être / Santé alternative',
  'Autre',
];

function AvatarNeonBorder({ children, size }: { children: React.ReactNode; size: number }) {
  const translateX = useRef(new RNAnimated.Value(0)).current;
  const TRACK_W = size * Math.PI;
  const outer = size + 8;
  const BORDER = 2;

  useEffect(() => {
    const loop = RNAnimated.loop(
      RNAnimated.timing(translateX, { toValue: -TRACK_W, duration: 3000, easing: Easing.linear, useNativeDriver: true }),
      { resetBeforeIteration: true }
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={{ width: outer, height: outer, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', top: 0, left: 0, width: outer, height: outer, borderRadius: outer / 2, overflow: 'hidden' }} pointerEvents="none">
        <RNAnimated.View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: TRACK_W * 2, transform: [{ translateX }] }}>
          <LinearGradient
            colors={['transparent', colors.neon.primary, colors.primary.light, 'transparent', 'transparent', colors.neon.primary, colors.primary.light, 'transparent']}
            locations={[0.05, 0.2, 0.3, 0.45, 0.55, 0.7, 0.8, 0.95]}
            start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
            style={{ width: TRACK_W * 2, height: '100%' }}
          />
        </RNAnimated.View>
        <View style={{ position: 'absolute', top: BORDER, left: BORDER, right: BORDER, bottom: BORDER, borderRadius: (outer - BORDER * 2) / 2, backgroundColor: colors.background.tertiary }} />
      </View>
      <View style={{ position: 'absolute', top: -6, left: -6, right: -6, bottom: -6, borderRadius: (outer + 12) / 2, backgroundColor: 'transparent', shadowColor: colors.neon.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 10 }} pointerEvents="none" />
      {children}
    </View>
  );
}


function InputField({
  label, icon, value, onChangeText, placeholder, editable = true, dimmed = false,
  keyboardType, autoCapitalize, secureTextEntry, multiline = false, suffix,
}: {
  label: string; icon?: React.ReactNode; value: string; onChangeText?: (v: string) => void;
  placeholder?: string; editable?: boolean; dimmed?: boolean; keyboardType?: any;
  autoCapitalize?: any; secureTextEntry?: boolean; multiline?: boolean; suffix?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const isActive = focused && editable && !dimmed;

  return (
    <View style={s.inputGroup}>
      <Text style={s.label}>{label}</Text>
      <NeonBorderInput isActive={isActive}>
        <View style={[
          s.inputContainer,
          isActive && s.inputActive,
          dimmed && s.inputDimmed,
          multiline && { height: 'auto', minHeight: 80, alignItems: 'flex-start', paddingVertical: 12 },
        ]}>
          {icon && <View style={{ marginRight: 12 }}>{icon}</View>}
          <TextInput
            style={[s.input, dimmed && { opacity: 0.5 }, multiline && { textAlignVertical: 'top' }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.text.muted}
            editable={editable && !dimmed}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            secureTextEntry={secureTextEntry}
            multiline={multiline}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {suffix}
        </View>
      </NeonBorderInput>
    </View>
  );
}

function PhoneInputField({ label, value, onChangeText, placeholder, editable = true, selectedCountry }: {
  label: string; value: string; onChangeText?: (v: string) => void;
  placeholder?: string; editable?: boolean; selectedCountry?: any;
}) {
  const [focused, setFocused] = useState(false);
  const isActive = focused && editable;

  return (
    <View style={s.inputGroup}>
      <Text style={s.label}>{label}</Text>
      <NeonBorderInput isActive={isActive}>
        <View style={[s.inputContainer, isActive && s.inputActive]}>
          {selectedCountry && (
            <View style={s.phonePrefix}>
              <Text style={s.prefixFlag}>{selectedCountry.flag}</Text>
              <Text style={s.prefixCode}>{selectedCountry.phoneCode}</Text>
            </View>
          )}
          <Phone size={16} color={colors.text.muted} style={{ marginRight: 12 }} />
          <TextInput
            style={s.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.text.muted}
            editable={editable}
            keyboardType="phone-pad"
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </View>
      </NeonBorderInput>
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <View style={s.sectionRow}>
      <Text style={s.sectionText}>{title}</Text>
    </View>
  );
}

function JobSelector({
  job,
  customJob,
  onJobChange,
  onCustomJobChange,
  isEditing,
  onShowPicker,
}: {
  job: string;
  customJob: string;
  onJobChange: (j: string) => void;
  onCustomJobChange: (c: string) => void;
  isEditing: boolean;
  onShowPicker: () => void;
}) {
  return (
    <View style={s.inputGroup}>
      <Text style={s.label}>Métier / Secteur</Text>
      <NeonBorderInput isActive={false}>
        <TouchableOpacity
          style={s.inputContainer}
          onPress={onShowPicker}
          disabled={!isEditing}
        >
          <Briefcase size={16} color={colors.text.muted} style={{ marginRight: 12 }} />
          <Text style={[s.input, { color: colors.text.primary, flex: 1 }]}>
            {job && job !== 'Autre' ? job : (customJob ? customJob : 'Sélectionner')}
          </Text>
          {isEditing && <ChevronDown size={14} color={colors.text.muted} />}
        </TouchableOpacity>
      </NeonBorderInput>

      {job === 'Autre' && isEditing && (
        <View style={{ marginTop: 12 }}>
          <TextInput
            style={[s.customJobInput, { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(15,23,42,0.9)', borderWidth: 1, borderColor: 'rgba(0,212,255,0.2)', color: colors.text.primary }]}
            value={customJob}
            onChangeText={onCustomJobChange}
            placeholder="Ex: Boulanger, Plombier..."
            placeholderTextColor={colors.text.muted}
          />
        </View>
      )}
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateAiProfile, changePassword, logout, isLoading } = useAuthStore();

  // Protect against null user during logout
  if (!user) {
    return null;
  }

  const [isEditing, setIsEditing]                     = useState(false);
  const [name, setName]                               = useState(user?.name || '');
  const [professionalEmail, setProfessionalEmail]     = useState(user?.professionalEmail || '');
  const [professionalAddress, setProfessionalAddress] = useState(user?.professionalAddress || '');
  const [city, setCity]                               = useState(user?.city || '');
  const [postalCode, setPostalCode]                   = useState(user?.postalCode || '');
  const [country, setCountry]                         = useState(user?.country || 'France');
  const [professionalPhone, setProfessionalPhone]     = useState('');
  const [professionalPhone2, setProfessionalPhone2]   = useState('');
  const [siret, setSiret]                             = useState(user?.siret || '');
  const [vatNumber, setVatNumber]                     = useState(user?.vatNumber || '');
  const [websiteUrl, setWebsiteUrl]                   = useState(user?.websiteUrl || '');
  const [job, setJob]                                 = useState(user?.job || '');
  const [customJob, setCustomJob]                     = useState('');
  const [showJobPicker, setShowJobPicker]             = useState(false);
  const [selectedCountry, setSelectedCountry]         = useState<any>(null);
  const [showCountryPicker, setShowCountryPicker]     = useState(false);
  const [showPasswordModal, setShowPasswordModal]     = useState(false);
  const [oldPassword, setOldPassword]                 = useState('');
  const [newPassword, setNewPassword]                 = useState('');
  const [confirmPassword, setConfirmPassword]         = useState('');
  const [modal, setModal] = useState({ visible: false, type: 'info' as ModalType, title: '', message: '' });

  const showModal = (type: ModalType, title: string, message = '') =>
    setModal({ visible: true, type, title, message });

  const getLocalNumber = (phone: string, phoneCode?: string) => {
    if (!phone) return '';
    return phone.startsWith(phoneCode || '') ? phone.replace(phoneCode!, '').trim() : phone.trim();
  };

  useEffect(() => {
    if (!user || isEditing) return;  // Ne pas réinitialiser si on est en mode édition
    setName(user.name || '');
    setProfessionalEmail(user.professionalEmail || '');
    setProfessionalAddress(user.professionalAddress || '');
    setCity(user.city || '');
    setPostalCode(user.postalCode || '');
    setCountry(user.country || 'France');
    setSiret(user.siret || '');
    setVatNumber(user.vatNumber || '');
    setWebsiteUrl(user.websiteUrl || '');
    if (user.job) {
      if (JOB_OPTIONS.includes(user.job)) {
        setJob(user.job);
        setCustomJob('');
      } else {
        setJob('Autre');
        setCustomJob(user.job);
      }
    } else {
      setJob('');
      setCustomJob('');
    }
    const c = user.country ? getCountryByName(user.country) : getCountryByName('France');
    setSelectedCountry(c);
    setProfessionalPhone(getLocalNumber(user.professionalPhone || '', c?.phoneCode));
    setProfessionalPhone2(getLocalNumber(user.professionalPhone2 || '', c?.phoneCode));
  }, [user, isEditing]);

  const handleSave = async () => {
    try {
      const phone = (raw: string) => raw && selectedCountry ? `${selectedCountry.phoneCode} ${raw.trim()}` : raw;
      const finalJob = job === 'Autre' ? (customJob ? customJob.trim() : '') : job;
      await updateAiProfile({
        name, professionalEmail, professionalAddress, city, postalCode, country,
        professionalPhone: phone(professionalPhone),
        professionalPhone2: phone(professionalPhone2),
        siret, vatNumber, websiteUrl, job: finalJob,
      });
      setIsEditing(false);
      showModal('success', 'Succès', 'Profil mis à jour avec succès.');
    } catch {
      showModal('error', 'Erreur', useAuthStore.getState().error || 'Une erreur est survenue.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (!user) return;
    setName(user.name || '');
    const c = user.country ? getCountryByName(user.country) : null;
    setSelectedCountry(c);
    setProfessionalPhone(getLocalNumber(user.professionalPhone || '', c?.phoneCode));
    setProfessionalPhone2(getLocalNumber(user.professionalPhone2 || '', c?.phoneCode));
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showModal('warning', 'Champs requis', 'Veuillez remplir tous les champs.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showModal('warning', 'Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    try {
      await changePassword({ oldPassword, newPassword });
      setShowPasswordModal(false);
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      showModal('success', 'Succès', 'Mot de passe modifié avec succès.');
    } catch {
      showModal('error', 'Erreur', useAuthStore.getState().error || 'Impossible de modifier le mot de passe.');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, aspect: [1, 1], quality: 0.8,
      });
      if (!result.canceled && result.assets[0].uri) {
        showModal('info', 'Upload...', 'Mise à jour de votre image...');
        await useAuthStore.getState().uploadLogo(user!.id, result.assets[0].uri);
        showModal('success', 'Succès', 'Image mise à jour.');
      }
    } catch {
      showModal('error', 'Erreur', "Impossible d'importer l'image.");
    }
  };

  const isPremium = user?.planType === 'studio' || user?.planType === 'agence';

  const completion = Math.round(
    [name, professionalEmail, professionalAddress, city, postalCode, country, professionalPhone, websiteUrl, user?.email]
      .filter(f => f && f.trim().length > 0).length / 9 * 100
  );

  const userAvatar = (user?.avatarUrl || user?.logoUrl)
    ? `https://hipster-api.fr${user?.avatarUrl || user?.logoUrl}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=random`;

  return (
    <BackgroundGradientOnboarding darkOverlay>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} bounces={false} keyboardShouldPersistTaps="handled">

            <View style={s.header}>
              <NeonBackButton onPress={() => router.back()} />
              <View style={s.headerCenter}>
                <Text style={s.titleSub}>Mon Profil</Text>
              </View>
            </View>

            <View style={s.heroCard}>
              <LinearGradient colors={['rgba(0,212,255,0.06)', 'transparent']} style={StyleSheet.absoluteFill} />
              <View style={s.heroAvatarWrapper}>
                <AvatarNeonBorder size={AVATAR_SIZE}>
                  <Image source={{ uri: userAvatar }} style={s.heroAvatar} />
                </AvatarNeonBorder>
                {isEditing && (
                  <TouchableOpacity style={s.heroCameraBtn} onPress={pickImage}>
                    <Camera size={14} color="#000" />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={s.heroName}>{user?.name || 'Utilisateur'}</Text>
              <Text style={s.heroEmail}>{user?.email}</Text>
              <View style={s.heroBadge}>
                <Text style={s.heroBadgeStar}>★</Text>
                <Text style={s.heroBadgeText}>{isPremium ? 'Hipster•IA Premium' : 'Hipster Gratuit'}</Text>
              </View>
              <View style={s.progressSection}>
                <Text style={s.progressLabel}>Profil complété à {completion}%</Text>
                <View style={s.progressBar}>
                  <LinearGradient colors={[colors.neon.primary, colors.primary.light]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[s.progressFill, { width: `${completion}%` as any }]} />
                </View>
              </View>
            </View>

            {isEditing ? (
                <View style={s.actionsRow}>
                  <TouchableOpacity style={s.cancelBtn} onPress={handleCancel}>
                    <Text style={s.cancelBtnText}>Annuler</Text>
                  </TouchableOpacity>
                  <NeonActionButton onPress={handleSave} loading={isLoading} disabled={isLoading} label="Enregistrer" />
                </View>
              ) : (
                <View style={s.actionsCenter}>
                  <NeonActionButton onPress={() => setIsEditing(true)} loading={false} disabled={false} label="Modifier le profil" />
                </View>
            )}

            <View style={s.card}>
              <SectionTitle title="Informations générales" />
              <InputField label="Nom / Nom d'entreprise" icon={<Briefcase size={16} color={colors.text.muted} />} value={name} onChangeText={setName} placeholder="Jean Dupont ou Ma Société" editable={isEditing} />
              <JobSelector
                job={job}
                customJob={customJob}
                onJobChange={setJob}
                onCustomJobChange={setCustomJob}
                isEditing={isEditing}
                onShowPicker={() => setShowJobPicker(true)}
              />
              <InputField label="Email de connexion" icon={<Lock size={16} color={colors.text.muted} />} value={user?.email || ''} editable={false} dimmed />
              <InputField label="Email professionnel" icon={<Mail size={16} color={colors.text.muted} />} value={professionalEmail} onChangeText={setProfessionalEmail} placeholder="email@contact.com" editable={isEditing} keyboardType="email-address" />

              <SectionTitle title="Adresse" />
              <InputField label="Adresse" icon={<MapPin size={16} color={colors.text.muted} />} value={professionalAddress} onChangeText={setProfessionalAddress} placeholder="Votre adresse" editable={isEditing} multiline />
              <View style={s.inputRow}>
                <View style={{ flex: 2 }}><InputField label="Ville" value={city} onChangeText={setCity} placeholder="Ville" editable={isEditing} /></View>
                <View style={{ flex: 1 }}><InputField label="Code postal" value={postalCode} onChangeText={setPostalCode} placeholder="CP" editable={isEditing} keyboardType="number-pad" /></View>
              </View>
              <View style={s.inputGroup}>
                <Text style={s.label}>Pays</Text>
                <NeonBorderInput isActive={false}>
                  <TouchableOpacity style={s.inputContainer} onPress={() => isEditing && setShowCountryPicker(true)} disabled={!isEditing}>
                    <Globe size={16} color={colors.text.muted} style={{ marginRight: 12 }} />
                    <Text style={[s.input, { color: colors.text.primary }]}>
                      {selectedCountry ? `${selectedCountry.flag} ${selectedCountry.name}` : country || 'Sélectionner'}
                    </Text>
                    {isEditing && <ChevronDown size={14} color={colors.text.muted} />}
                  </TouchableOpacity>
                </NeonBorderInput>
              </View>

              <SectionTitle title="Contact" />
              <PhoneInputField label="Téléphone principal" value={professionalPhone} onChangeText={setProfessionalPhone} placeholder="Téléphone 1" editable={isEditing} selectedCountry={selectedCountry} />
              <PhoneInputField label="Téléphone secondaire" value={professionalPhone2} onChangeText={setProfessionalPhone2} placeholder="Téléphone 2" editable={isEditing} selectedCountry={selectedCountry} />

              {selectedCountry?.name === 'France' && (
                <>
                  <SectionTitle title="Informations légales" />
                  <InputField label="Numéro SIRET" icon={<Building2 size={16} color={colors.text.muted} />} value={siret} onChangeText={setSiret} placeholder="14 chiffres" editable={isEditing} keyboardType="numeric" />
                  <InputField label="Numéro TVA" icon={<AtSign size={16} color={colors.text.muted} />} value={vatNumber} onChangeText={setVatNumber} placeholder="FR00123456789" editable={isEditing} autoCapitalize="characters" />
                </>
              )}

              <SectionTitle title="Web" />
              <InputField label="Site Web" icon={<Link size={16} color={colors.text.muted} />} value={websiteUrl} onChangeText={setWebsiteUrl} placeholder="www.monsite.com" editable={isEditing} keyboardType="url" autoCapitalize="none" />

              
            </View>

            <View style={s.card}>
              <View style={s.planRow}>
                <View>
                  <Text style={s.planName}>
                    {user?.planType ? `Hipster ${user.planType.charAt(0).toUpperCase() + user.planType.slice(1)}` : 'Hipster Gratuit'}
                  </Text>
                  <Text style={s.planDesc}>{isPremium ? 'Accès illimité' : 'Pack de base'}</Text>
                </View>
                <View style={[s.planBadge, user?.subscriptionStatus === 'active' && s.planBadgeActive]}>
                  <Text style={s.planBadgeText}>{user?.subscriptionStatus === 'active' ? 'Actif' : 'Gratuit'}</Text>
                </View>
              </View>
              <NeonActionButton
                onPress={() => router.push('/(drawer)/subscription')}
                loading={false} disabled={false}
                label="Gérer l'abonnement"
                icon={<Sparkles size={16} color="#ffffff" />}
                small align="left"
              />
            </View>

            <View style={s.card}>
              <SectionTitle title="Compte" />
              <TouchableOpacity style={s.menuItem} onPress={() => router.push('/(drawer)/referral')}>
                <Users size={20} color={colors.text.muted} />
                <Text style={s.menuItemText}>Parrainage & Récompenses</Text>
                <ChevronRight size={20} color={colors.text.muted} />
              </TouchableOpacity>
              <TouchableOpacity style={s.menuItem} onPress={() => setShowPasswordModal(true)}>
                <Lock size={20} color={colors.text.muted} />
                <Text style={s.menuItemText}>Modifier le mot de passe</Text>
                <ChevronRight size={20} color={colors.text.muted} />
              </TouchableOpacity>
              <TouchableOpacity style={s.logoutBtn} onPress={() => { 
                useWelcomeVideoStore.getState().setIsReturningFromBack(true);
                logout(); 
                router.replace('/welcome'); 
              }}>
                <LogOut size={20} color={colors.status.error} />
                <Text style={s.logoutText}>Se déconnecter</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal visible={showJobPicker} transparent animationType="slide">
        <View style={[s.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}> 
          <View style={[s.modalContent, { maxHeight: '70%' }]}> 
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Choisir un métier</Text>
              <TouchableOpacity onPress={() => setShowJobPicker(false)}>
                <X size={22} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ marginTop: 12 }} contentContainerStyle={{ gap: 8 }}>
              {JOB_OPTIONS.map((opt) => (
                <Pressable key={opt} style={[s.inputContainer, { justifyContent: 'flex-start' }]} onPress={() => {
                  if (opt === 'Autre') {
                    setJob('Autre');
                  } else {
                    setJob(opt);
                    setCustomJob('');
                  }
                  setShowJobPicker(false);
                }}>
                  <Text style={[s.input, { color: colors.text.primary }]}>{opt}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showPasswordModal} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Sécurité</Text>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <X size={22} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <View style={s.modalBody}>
              <InputField label="Mot de passe actuel" icon={<Lock size={16} color={colors.text.muted} />} value={oldPassword} onChangeText={setOldPassword} placeholder="••••••••" secureTextEntry editable />
              <InputField label="Nouveau mot de passe" icon={<Lock size={16} color={colors.text.muted} />} value={newPassword} onChangeText={setNewPassword} placeholder="••••••••" secureTextEntry editable />
              <InputField label="Confirmer" icon={<Lock size={16} color={colors.text.muted} />} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="••••••••" secureTextEntry editable />
            </View>
            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setShowPasswordModal(false)}>
                <Text style={s.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <NeonActionButton onPress={handleChangePassword} loading={isLoading} disabled={isLoading} label="Modifier" />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <CountryPicker
        visible={showCountryPicker}
        onClose={() => setShowCountryPicker(false)}
        onSelect={(c: Country) => { setSelectedCountry(c); setCountry(c.name); }}
        selectedCountry={selectedCountry}
      />

      <GenericModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal(m => ({ ...m, visible: false }))}
      />
    </BackgroundGradientOnboarding>
  );
}

const s = StyleSheet.create({
  scrollContent:   { paddingHorizontal: 28, paddingTop: 16, paddingBottom: 40 },
  header:          { flexDirection: 'row', alignItems: 'center', marginBottom: 28, paddingTop: 8 },
  backButton:      { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  headerCenter:    { flex: 1, alignItems: 'center', marginRight: 58 },
  titleSub:        { fontFamily: 'Arimo-Bold', fontSize: 16,  textTransform: 'uppercase', color: '#ffffff' },

  heroCard:          { borderRadius: 24, borderWidth: 1, borderColor: colors.primary.main + '1f', alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24, overflow: 'hidden', backgroundColor: colors.background.secondary + '99' },
  heroAvatarWrapper: { position: 'relative', marginBottom: 16 },
  heroAvatar:        { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, backgroundColor: colors.background.tertiary },
  heroCameraBtn:     { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: colors.neon.primary, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.background.primary },
  heroName:          { fontFamily: 'Brittany-Signature', fontSize: 26, color: '#fff', textShadowColor: colors.neon.primary, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 12, lineHeight: 36, marginBottom: 4, paddingLeft: 6 },
  heroEmail:         { fontFamily: 'Arimo-Regular', fontSize: 13, color: colors.text.muted, marginBottom: 16 },
  heroBadge:         { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.primary.main + '14', borderRadius: 20, borderWidth: 1, borderColor: colors.primary.main + '33', marginBottom: 20 },
  heroBadgeStar:     { fontSize: 13, color: colors.neon.primary, fontWeight: '800' },
  heroBadgeText:     { fontFamily: 'Arimo-Bold', fontSize: 12, color: colors.neon.primary, letterSpacing: 0.3 },
  progressSection:   { width: '100%', gap: 8 },
  progressLabel:     { fontFamily: 'Arimo-Regular', fontSize: 11, color: colors.text.muted, textAlign: 'center', letterSpacing: 0.4, textTransform: 'uppercase' },
  progressBar:       { width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' },
  progressFill:      { height: '100%', borderRadius: 2 },

  card:        { backgroundColor: colors.background.secondary + '99', borderRadius: 20, borderWidth: 1, borderColor: colors.white + '12', padding: 20, gap: 16, marginBottom: 20 },
  sectionRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 20, marginBottom: 12 },
  sectionText: { fontFamily: 'Arimo-Bold', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.28)' },

  inputGroup:     { gap: 8 },
  inputRow:       { flexDirection: 'row', gap: 12 },
  label:          { fontFamily: 'Arimo-Bold', fontSize: 12, color: colors.text.secondary, letterSpacing: 0.3 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background.secondary + 'e6', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: colors.white + '14', zIndex: 3 },
  inputActive:    { borderColor: 'transparent', backgroundColor: '#030814' },
  inputDimmed: { opacity: 0.5 },
  customJobInput: {
    fontFamily: 'Arimo-Regular',
    fontSize: 14,
  },
  input:          { flex: 1, fontFamily: 'Arimo-Regular', fontSize: 14, color: colors.text.primary },

  phonePrefix: { flexDirection: 'row', alignItems: 'center', paddingRight: 10, borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.1)', marginRight: 10, gap: 4 },
  prefixFlag:  { fontSize: 16 },
  prefixCode:  { fontFamily: 'Arimo-Bold', fontSize: 12, color: colors.text.secondary },

  actionsRow:    { flexDirection: 'row', gap: 12, marginVertical : 20, alignItems: 'center' },
  actionsCenter: { alignItems: 'center', marginVertical : 20 },
  cancelBtn:    { paddingVertical: 15, paddingHorizontal: 16, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', minWidth: 90 },
  cancelBtnText: { fontFamily: 'Arimo-Bold', color: colors.text.secondary, fontSize: 14 },

  planRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  planName:      { fontFamily: 'Brittany-Signature', fontSize: 24, color: '#fff', textShadowColor: colors.neon.primary, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8, paddingLeft: 4, paddingVertical: 10 },
  planDesc:      { fontFamily: 'Arimo-Regular', fontSize: 13, color: colors.text.secondary, marginTop: 2 },
  planBadge:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)' },
  planBadgeActive: { backgroundColor: colors.primary.main + '1f', borderWidth: 1, borderColor: colors.primary.main + '40' },
  planBadgeText: { fontFamily: 'Arimo-Bold', fontSize: 12, color: colors.neon.primary, letterSpacing: 0.3 },

  menuItem:     { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  menuItemText: { flex: 1, fontFamily: 'Arimo-Regular', fontSize: 15, color: colors.text.primary },
  logoutBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, backgroundColor: 'rgba(239,68,68,0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.12)', marginTop: 12 },
  logoutText:   { fontFamily: 'Arimo-Bold', color: colors.status.error, fontSize: 15 },

  modalOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent:  { width: '100%', backgroundColor: '#0d0d0d', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', gap: 20 },
  modalHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle:    { fontFamily: 'Arimo-Bold', fontSize: 18, color: '#fff' },
  modalBody:     { gap: 14 },
  modalActions:  { flexDirection: 'row', gap: 12 },
});
