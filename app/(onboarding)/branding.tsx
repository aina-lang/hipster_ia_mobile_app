import React, { useState } from 'react';
import {
  View, StyleSheet, Text, TouchableOpacity, ScrollView,
  Image, Platform, TextInput, BackHandler,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown, runOnJS } from 'react-native-reanimated';
import { Upload, Palette, User } from 'lucide-react-native';
import ColorPicker, { HueSlider, Panel1, Preview, OpacitySlider } from 'reanimated-color-picker';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { NeonActionButton } from '../../components/ui/NeonActionButton';
import { GenericModal } from '../../components/ui/GenericModal';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useAuthStore } from '../../store/authStore';

export default function BrandingScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { brandingColor, setBrandingData, logoUri } = useOnboardingStore();
  const { user, finishOnboarding } = useAuthStore();

  const initialImage = user?.logoUrl || user?.avatarUrl || logoUri;

  const [selectedColor, setSelectedColor] = useState(user?.brandingColor || brandingColor || '#FF0000');
  const [localImage, setLocalImage]       = useState(initialImage);
  const [localLoading, setLocalLoading]   = useState(false);
  const [tempHex, setTempHex]             = useState(selectedColor.toUpperCase());
  const [modal, setModal]                 = useState({ visible: false, type: 'info' as any, title: '', message: '' });

  const showModal = (type: any, title: string, message = '') =>
    setModal({ visible: true, type, title, message });

  // Block Android hardware back button
  React.useEffect(() => {
    const onBackPress = () => {
      if (user && !user.isSetupComplete) {
        showModal('warning', 'Configuration requise', 'Veuillez finaliser votre profil pour continuer.');
        return true;
      }
      return false;
    };
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [user]);

  // Block swipe/UI back navigation
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (user && user.isSetupComplete) return;
      e.preventDefault();
      showModal('warning', 'Configuration requise', 'Veuillez finaliser votre profil pour continuer.');
    });
    return unsubscribe;
  }, [navigation, user]);

  const handleHexChange = (text: string) => {
    const sanitized = text.toUpperCase().replace(/[^0-9A-F#]/g, '');
    setTempHex(sanitized);
    if (/^#([0-9A-F]{3,4}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(sanitized)) {
      setSelectedColor(sanitized);
    }
  };

  const handleHexBlur = () => {
    let formatted = tempHex;
    if (formatted.length > 0 && !formatted.startsWith('#')) {
      formatted = '#' + formatted;
    }
    if (/^#([0-9A-F]{3,4}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(formatted)) {
      setSelectedColor(formatted);
      setTempHex(formatted);
    } else {
      setTempHex(selectedColor.toUpperCase());
    }
  };

  const pickImage = async () => {
    if (localLoading) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setLocalImage(result.assets[0].uri);
    }
  };

  const handleNext = async () => {
    setLocalLoading(true);
    try {
      setBrandingData({ brandingColor: selectedColor, logoUri: localImage });

      const authStore = useAuthStore.getState();
      const profileId = authStore.user?.id;

      await authStore.updateAiProfile({
        brandingColor: selectedColor,
        isSetupComplete: true,
      });

      const isLocalUri =
        localImage &&
        (localImage.startsWith('file://') ||
          localImage.startsWith('content://') ||
          localImage.includes('/cache/'));

      if (localImage && (localImage !== initialImage || isLocalUri) && profileId) {
        await authStore.uploadLogo(profileId, localImage);
      }

      await authStore.finishOnboarding();
      router.replace('/(drawer)');
    } catch (e) {
      console.error('Failed to sync branding data', e);
    } finally {
      setLocalLoading(false);
    }
  };

  const onColorChange = ({ hex }: { hex: string }) => {
    'worklet';
    runOnJS(setSelectedColor)(hex);
    runOnJS(setTempHex)(hex.toUpperCase());
  };

  return (
    <BackgroundGradientOnboarding darkOverlay>

      <ScreenHeader
        titleSub="Votre"
        titleScript="identité"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View entering={FadeInDown.duration(800)} style={s.content}>

          {/* Color Picker */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <Palette size={16} color={colors.text.secondary} />
              <Text style={s.sectionTitle}>Couleur principale</Text>
            </View>
            <View style={s.card}>
              <ColorPicker value={selectedColor} onChange={onColorChange} style={s.colorPicker}>
                <View style={s.panelContainer}>
                  <Panel1 style={s.panel} />
                </View>
                <View style={s.slidersContainer}>
                  <HueSlider style={s.slider} />
                  <OpacitySlider style={s.slider} />
                </View>
                <View style={s.pickerFooter}>
                  <Preview style={s.preview} hideText />
                  <TextInput
                    style={s.hexInput}
                    value={tempHex}
                    onChangeText={handleHexChange}
                    onBlur={handleHexBlur}
                    placeholder="#000000FF"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    maxLength={9}
                    autoCapitalize="characters"
                    spellCheck={false}
                    autoCorrect={false}
                  />
                </View>
              </ColorPicker>
              {localLoading && (
                <View style={StyleSheet.absoluteFill} pointerEvents="box-only" />
              )}
            </View>
          </View>

          {/* Avatar / Logo */}
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <User size={16} color={colors.text.secondary} />
              <Text style={s.sectionTitle}>Photo de profil / Logo</Text>
            </View>
            <TouchableOpacity
              style={[s.uploadBox, localLoading && { opacity: 0.6 }]}
              onPress={() => !localLoading && pickImage()}
              disabled={localLoading}
              activeOpacity={0.8}
            >
              {localImage && localImage.trim() !== '' ? (
                <Image source={{ uri: localImage }} style={s.uploadedImage} />
              ) : (
                <View style={s.uploadPlaceholder}>
                  <Upload size={24} color={colors.text.secondary} />
                  <Text style={s.uploadText}>Choisir une image</Text>
                  <Text style={s.uploadHint}>PNG, JPG, JPEG • Max 5Mo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>

      <View style={s.footer}>
        <NeonActionButton
          label="Continuer"
          onPress={handleNext}
          loading={localLoading}
          disabled={localLoading}
        />
      </View>

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
  scrollContent:    { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 120 },
  content:          { gap: 24 },

  section:          { gap: 12 },
  sectionHeader:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle:     { fontFamily: fonts.arimo.bold, fontSize: 13, color: colors.gray, fontWeight: '600', letterSpacing: 0.3 },

  card: {
    backgroundColor: colors.darkSlateBlue,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ffffff14',
  },
  colorPicker:      { gap: 16 },
  panelContainer:   { height: 180, borderRadius: 12, overflow: 'hidden' },
  panel:            { flex: 1 },
  slidersContainer: { gap: 12 },
  slider:           { height: 20, borderRadius: 10 },
  pickerFooter:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 4 },
  preview:          { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  hexInput: {
    fontFamily: fonts.arimo.bold,
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffffff14',
    minWidth: 100,
    textAlign: 'center',
  },

  uploadBox: {
    height: 120,
    backgroundColor: colors.darkSlateBlue,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffffff14',
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadPlaceholder: { alignItems: 'center', gap: 8 },
  uploadText:        { fontFamily: fonts.arimo.bold, color: 'white', fontSize: 14, fontWeight: '600' },
  uploadHint:        { fontFamily: fonts.arimo.regular, color: colors.gray, fontSize: 12 },
  uploadedImage:     { width: '100%', height: '100%', resizeMode: 'cover' },

  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
});