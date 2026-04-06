import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Sparkles, X, Upload } from 'lucide-react-native';
import ColorPicker, { HueSlider, Panel1, Preview } from 'reanimated-color-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { runOnJS } from 'react-native-reanimated';
import { useCreationStore } from '../../store/creationStore';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';
import { NeonActionButton } from '../../components/ui/NeonActionButton';
import { NeonBorderInput } from '../../components/ui/NeonBorderInput';
import { GenericModal, ModalType } from '../../components/ui/GenericModal';
import illus2 from '../../assets/Rouge_a_levre.jpeg';
import illus3 from '../../assets/casquette.jpeg';
import illus4 from '../../assets/TroisiemeCard.jpeg';
import illus1 from '../../assets/montre.jpeg';
import vertical1 from '../../assets/vertical1.jpeg';
import vertical2 from '../../assets/vertical2.jpeg';
import vertical3 from '../../assets/vertical3.jpeg';
import vertical4 from '../../assets/vertical4.jpeg';
import vertical5 from '../../assets/vertical5.jpeg';
import magazine2 from '../../assets/magazine2_1.jpeg';
import magazine3 from '../../assets/magazine3.jpeg';
import magazine4 from '../../assets/magazine4.jpeg';
import magazine5 from '../../assets/magazine5.jpeg';
import mode from '../../assets/mode.jpeg';
import chiot from '../../assets/chiot.jpeg';
import casque from '../../assets/Casque.jpeg';
import chantier from '../../assets/chantierComm.jpeg';
import signatureSplash1 from '../../assets/signatureSplash1.jpeg';
import signatureSplash2 from '../../assets/signatureSplash2.jpeg';
import signatureSplash3 from '../../assets/signatureSplash3.jpeg';
import signatureSplash4 from '../../assets/signatureSplash4.jpeg';
import FocusCircle1 from '../../assets/FocusCircle1.jpeg';
import FocusCircle2 from '../../assets/FocusCircle2.jpeg';
import FocusCircle3 from '../../assets/FocusCircle3.jpeg';
import FocusCircle4 from '../../assets/FocusCircle4.jpeg';

const NEON_BLUE = colors.neonBlue;
const NEON_BLUE_DARK = colors.neonBlueDark;

const TOGGLE_W = 150;

const EXAMPLES_DEFAULT = [
  { label: '', image: illus2, text: '' },
  { label: '', image: illus3, text: '' },
  { label: '', image: illus4, text: '' },
  { label: '', image: illus1, text: '' },
];

const ARCHITECTURE_EXAMPLES: Record<string, { label: string; image: any; text: string }[]> = {
  'fashion-vertical-impact': [
    { label: '', image: vertical1, text: '' },
    { label: '', image: vertical2, text: '' },
    { label: '', image: vertical3, text: '' },
    { label: '', image: vertical4, text: '' },
  ],
  'magazine-cover-poster': [
    { label: '', image: vertical5, text: '' },
    { label: '', image: magazine2, text: '' },
    { label: '', image: magazine3, text: '' },
    { label: '', image: magazine4, text: '' },
    { label: '', image: magazine5, text: '' },
  ],
  'focus-circle': [
    { label: '', image: FocusCircle1, text: '' },
    { label: '', image: FocusCircle2, text: '' },
    { label: '', image: FocusCircle3, text: '' },
    { label: '', image: FocusCircle4, text: '' },
  ],
  'impact-commercial': [
    { label: '', image: illus2, text: '' },
    { label: '', image: illus3, text: '' },
    { label: '', image: mode, text: '' },
    { label: '', image: chiot, text: '' },
    { label: '', image: casque, text: '' },
    { label: '', image: chantier, text: '' },
  ],
  'editorial-motion': [
    { label: '', image: illus2, text: '' },
    { label: '', image: illus3, text: '' },
    { label: '', image: illus4, text: 'MOTION' },
    { label: '', image: illus1, text: 'PREMIUM' },
  ],
  'signature-splash': [
    { label: '', image: signatureSplash1, text: '' },
    { label: '', image: signatureSplash2, text: '' },
    { label: '', image: signatureSplash3, text: '' },
    { label: '', image: signatureSplash4, text: '' },
  ],
  'diagonal-split-design': [
    { label: '', image: FocusCircle1, text: '' },
    { label: '', image: FocusCircle2, text: '' },
    { label: '', image: FocusCircle3, text: '' },
    { label: '', image: FocusCircle4, text: '' },
  ],
  'studio-poster': [
    { label: '', image: illus2, text: '' },
    { label: '', image: illus3, text: '' },
    { label: '', image: illus4, text: '' },
    { label: '', image: illus1, text: '' },
  ],
  'mono-accent': [
    { label: '', image: vertical1, text: '' },
    { label: '', image: vertical2, text: '' },
    { label: '', image: vertical3, text: '' },
    { label: '', image: vertical4, text: '' },
  ],
};

function NeonBorderToggle({
  children,
  isSelected,
}: {
  children: React.ReactNode;
  isSelected: boolean;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  React.useEffect(() => {
    loopRef.current?.stop();
    if (isSelected) {
      translateX.setValue(0);
      loopRef.current = Animated.loop(
        Animated.timing(translateX, {
          toValue: -TOGGLE_W,
          duration: 2500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        { resetBeforeIteration: true }
      );
      loopRef.current.start();
    } else {
      translateX.setValue(0);
    }
    return () => { loopRef.current?.stop(); };
  }, [isSelected]);

  return (
    <View style={t.neonWrapper}>
      {isSelected && (
        <View style={t.neonClip} pointerEvents="none">
          <Animated.View style={[t.neonTrack, { transform: [{ translateX }] }]}>
           <LinearGradient
              colors={['transparent', NEON_BLUE, NEON_BLUE_DARK, 'transparent', 'transparent', NEON_BLUE, NEON_BLUE_DARK, 'transparent']}
              locations={[0.05, 0.2, 0.3, 0.45, 0.55, 0.7, 0.8, 0.95]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ width: TOGGLE_W * 2, height: '100%' }}
            />
          </Animated.View>
          <View style={[t.neonMask, { backgroundColor: '#030814' }]} />
        </View>
      )}
      {isSelected && (
        <>
          <View style={[t.bloomMid, { shadowColor: NEON_BLUE }]} pointerEvents="none" />
          <View style={[t.bloomFar, { shadowColor: NEON_BLUE }]} pointerEvents="none" />
        </>
      )}
      {children}
    </View>
  );
}

const t = StyleSheet.create({
  neonWrapper: { position: 'relative', flex: 1 },
  neonClip:    { position: 'absolute', top: -1, left: -1, right: -1, bottom: -1, borderRadius: 12, overflow: 'hidden', zIndex: 2 },
  neonTrack:   { position: 'absolute', top: 0, bottom: 0, left: 0 },
  neonMask:    { position: 'absolute', top: 1, left: 1, right: 1, bottom: 1, borderRadius: 11, zIndex: 1 },
  bloomMid:    { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 15, backgroundColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6 },
  bloomFar:    { position: 'absolute', top: -8, left: -8, right: -8, bottom: -8, borderRadius: 19, backgroundColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 3 },
});

function NeonInputField({
  label,
  optional,
  placeholder,
  value,
  onChangeText,
  multiline,
}: {
  label?: string;
  optional?: boolean;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  multiline?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={s.inputGroup}>
      {label && (
        <Text style={s.inputLabel}>
          {label}
          {optional && <Text style={s.optional}> (OPTIONNEL)</Text>}
        </Text>
      )}
      <NeonBorderInput isActive={focused}>
        <TextInput
          style={[s.input, focused && s.inputActive, multiline && { height: 80, paddingTop: 14 }]}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </NeonBorderInput>
    </View>
  );
}

export default function Step4ContentCustomizeScreen() {
  const router = useRouter();
  const { style } = useLocalSearchParams();
  const scrollRef = useRef<ScrollView>(null);

  const {
    mainTitle,
    setMainTitle,
    subTitle,
    setSubTitle,
    infoLine,
    setInfoLine,
    subject,
    setSubject,
    colorLeft,
    setColorLeft,
    colorRight,
    setColorRight,
    uploadedImage,
    setUploadedImage,
    setQuery,
  } = useCreationStore();

  const { user } = useAuthStore();

  React.useEffect(() => {
    if (user?.brandingColor && colorRight === '#000000') {
      setColorRight(user.brandingColor);
    }
  }, [user, colorRight, setColorRight]);

  const [pickerVisible, setPickerVisible] = React.useState(false);
  const [activeColorSide, setActiveColorSide] = React.useState<'left' | 'right' | null>(null);
  const [tempColor, setTempColor] = React.useState('#FFFFFF');
  const [tempHex, setTempHex] = React.useState('#FFFFFF');

  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalType, setModalType] = React.useState<ModalType>('info');
  const [modalTitle, setModalTitle] = React.useState('');
  const [modalMessage, setModalMessage] = React.useState('');

  const [hexFocused, setHexFocused] = useState(false);

  const uploadCardSlide = useRef(new Animated.Value(0)).current;
  const imagePreviewSlide = useRef(new Animated.Value(0)).current;

  const [subjectSourceType, setSubjectSourceType] = React.useState<'image' | 'text'>(
    uploadedImage ? 'image' : 'text'
  );

  const handleSourceTypeChange = (type: 'image' | 'text') => {
    setSubjectSourceType(type);
    if (type === 'image') setSubject('');
    else setUploadedImage(null);
  };

  const showModal = (title: string, message: string, type: ModalType = 'info') => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri.toLowerCase();
        const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
        if (!allowed.some((ext) => uri.endsWith(ext))) {
          showModal('Format non supporté', 'Utilisez JPEG, PNG ou WebP.', 'error');
          return;
        }
        setUploadedImage(result.assets[0].uri);
      }
    } catch {
      showModal('Erreur', "Impossible de sélectionner l'image", 'error');
    }
  };

  const openPicker = (side: 'left' | 'right') => {
    setActiveColorSide(side);
    const currentColor = side === 'left' ? colorLeft : colorRight;
    setTempColor(currentColor);
    setTempHex(currentColor.toUpperCase());
    setPickerVisible(true);
  };

  const updateColorState = React.useCallback((hex: string) => {
    if (activeColorSide === 'left') setColorLeft(hex);
    else if (activeColorSide === 'right') setColorRight(hex);
    setTempHex(hex.toUpperCase());
    setTempColor(hex);
  }, [activeColorSide, setColorLeft, setColorRight]);

  const handleColorSelect = (event: { hex: string }) => {
    'worklet';
    runOnJS(updateColorState)(event.hex);
  };

  const handleHexChange = (text: string) => {
    const sanitized = text.toUpperCase().replace(/[^0-9A-F#]/g, '');
    setTempHex(sanitized);
    if (/^#([0-9A-F]{3,4}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(sanitized)) {
      updateColorState(sanitized);
    }
  };

  const handleHexBlur = () => {
    let formatted = tempHex;
    if (formatted.length > 0 && !formatted.startsWith('#')) formatted = '#' + formatted;
    if (/^#([0-9A-F]{3,4}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(formatted)) {
      updateColorState(formatted);
    } else {
      const currentColor = activeColorSide === 'left' ? colorLeft : colorRight;
      setTempHex(currentColor.toUpperCase());
    }
  };

  const handleCreate = () => {
    const queryParts = [];
    if (mainTitle) queryParts.push(mainTitle);
    if (subTitle) queryParts.push(subTitle);
    if (infoLine) queryParts.push(infoLine);
    setQuery(queryParts.join(' '));
    router.push('/(guided)/step4-result');
  };

  return (
    <GuidedScreenWrapper currentStep={4} totalSteps={4} scrollViewRef={scrollRef}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={s.container}>

          <View style={s.header}>
            <Text style={s.headerScript}>Personnaliser</Text>
            <Text style={s.headerSub}>VOTRE VISUEL</Text>
          </View>

          <View style={s.divider} />

          <View style={s.section}>
            <Text style={s.sectionLabel}>EXEMPLES</Text>
            <Text style={s.sectionSub}>Ce modèle s'adapte à tous les produits</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.carousel}>
              {EXAMPLES_DEFAULT.map((item, index) => (
                <View key={index} style={s.exampleCard}>
                  <Image source={item.image} style={s.exampleImage} />
                  {!!item.text && <Text style={s.exampleOverlayText}>{item.text}</Text>}
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={s.divider} />

          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>SOURCE DU SUJET</Text>
            <Text style={s.inputSub}>Comment voulez-vous définir le sujet principal ?</Text>

            <View style={s.toggleRow}>
              <NeonBorderToggle isSelected={subjectSourceType === 'text'}>
                <TouchableOpacity
                  style={[s.toggleBtn, subjectSourceType === 'text' && s.toggleBtnActive]}
                  onPress={() => handleSourceTypeChange('text')}
                  activeOpacity={0.9}
                >
                  {subjectSourceType === 'text' && (
                    <LinearGradient
                      colors={['rgba(26,143,255,0.4)', 'rgba(26,143,255,0.1)', 'transparent']}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={StyleSheet.absoluteFill}
                      pointerEvents="none"
                    />
                  )}
                  <Text style={[s.toggleText, subjectSourceType === 'text' && s.toggleTextActive]}>Texte</Text>
                </TouchableOpacity>
              </NeonBorderToggle>

              <NeonBorderToggle isSelected={subjectSourceType === 'image'}>
                <TouchableOpacity
                  style={[s.toggleBtn, subjectSourceType === 'image' && s.toggleBtnActive]}
                  onPress={() => handleSourceTypeChange('image')}
                  activeOpacity={0.9}
                >
                  {subjectSourceType === 'image' && (
                    <LinearGradient
                      colors={['rgba(26,143,255,0.4)', 'rgba(26,143,255,0.1)', 'transparent']}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={StyleSheet.absoluteFill}
                      pointerEvents="none"
                    />
                  )}
                  <Text style={[s.toggleText, subjectSourceType === 'image' && s.toggleTextActive]}>Photo</Text>
                </TouchableOpacity>
              </NeonBorderToggle>
            </View>
          </View>

          {subjectSourceType === 'image' ? (
            <View style={s.inputGroup}>
              <Animated.View style={{ transform: [{ translateX: uploadCardSlide }] }}>
                <TouchableOpacity
                  style={s.uploadCard}
                  onPress={pickImage}
                  activeOpacity={0.9}
                >
                  {uploadedImage ? (
                    <Animated.View style={[s.imagePreviewContainer, { transform: [{ translateX: imagePreviewSlide }] }]}>
                      <Image source={{ uri: uploadedImage }} style={s.uploadedImage} />
                      <TouchableOpacity
                        style={s.removeImageButton}
                        onPress={() => setUploadedImage(null)}
                      >
                        <X size={16} color="#fff" />
                      </TouchableOpacity>
                    </Animated.View>
                  ) : (
                    <View style={s.uploadPlaceholder}>
                      <View style={s.uploadIconCircle}>
                        <View style={s.uploadIconGlow}>
                          <Upload size={20} color={NEON_BLUE} />
                        </View>
                      </View>
                      <Text style={s.uploadText}>Sélectionner une image</Text>
                      <Text style={s.uploadSubtext}>JPG, PNG ou WebP</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          ) : (
            <View style={s.inputGroup}>
              <NeonInputField
                placeholder="Ex: un bouquet de fleurs, un sac à main..."
                value={subject}
                onChangeText={setSubject}
              />
              <Text style={s.helperText}>Décris en 3-8 mots ce que tu veux au centre du visuel</Text>
            </View>
          )}

          <View style={s.inputGroup}>
            <Text style={s.inputLabel}>COULEURS</Text>
            <View style={s.colorRow}>
              <View style={s.colorConfig}>
                <Text style={s.colorLabel}>PRINCIPALE</Text>
                <TouchableOpacity style={[s.input, s.colorButton]} onPress={() => openPicker('left')}>
                  <View style={[s.colorPreview, { backgroundColor: colorLeft }]} />
                  <Text style={s.colorValue}>{colorLeft.toUpperCase()}</Text>
                </TouchableOpacity>
              </View>
              <View style={s.colorConfig}>
                <Text style={s.colorLabel}>SECONDAIRE</Text>
                <TouchableOpacity style={[s.input, s.colorButton]} onPress={() => openPicker('right')}>
                  <View style={[s.colorPreview, { backgroundColor: colorRight }]} />
                  <Text style={s.colorValue}>{colorRight.toUpperCase()}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={s.buttonWrapper}>
            <NeonActionButton
              label="CONTINUER"
              icon={<Sparkles size={16} color="#ffffff" />}
              onPress={handleCreate}
            />
          </View>

          <Modal visible={pickerVisible} animationType="fade" transparent>
            <View style={s.modalOverlay}>
              <View style={s.pickerContainer}>
                <View style={s.pickerHeader}>
                  <Text style={s.pickerTitle}>
                    Couleur {activeColorSide === 'left' ? 'principale' : 'secondaire'}
                  </Text>
                  <TouchableOpacity onPress={() => setPickerVisible(false)} style={s.closeButton}>
                    <X size={20} color="#fff" />
                  </TouchableOpacity>
                </View>

                <ColorPicker value={tempColor} onComplete={handleColorSelect} style={{ gap: 20 }}>
                  <Panel1 style={s.colorPanel} />
                  <HueSlider style={s.hueSlider} />
                  <View style={s.pickerFooter}>
                    <Preview style={s.previewContainer} hideText colorFormat="hex" />
                    <View style={{ flex: 1 }}>
                      <NeonBorderInput isActive={hexFocused}>
                        <TextInput
                          style={[s.hexInput, hexFocused && s.hexInputActive]}
                          value={tempHex}
                          onChangeText={handleHexChange}
                          onBlur={() => { setHexFocused(false); handleHexBlur(); }}
                          onFocus={() => setHexFocused(true)}
                          placeholder="#FFFFFF"
                          placeholderTextColor="rgba(255,255,255,0.3)"
                          maxLength={9}
                          autoCapitalize="characters"
                          spellCheck={false}
                          autoCorrect={false}
                        />
                      </NeonBorderInput>
                    </View>
                  </View>
                </ColorPicker>

               <TouchableOpacity
                  onPress={() => setPickerVisible(false)}
                  style={s.confirmButtonPressable}
                >
                  <LinearGradient
                    colors={['#264F8C', '#0a1628', '#040612']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    locations={[0, 0.46, 1]}
                    style={s.confirmButtonGradient}
                  >
                    <Text style={s.confirmButtonText}>VALIDER</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <GenericModal
            visible={modalVisible}
            type={modalType}
            title={modalTitle}
            message={modalMessage}
            onClose={() => setModalVisible(false)}
          />
        </View>
      </ScrollView>
    </GuidedScreenWrapper>
  );
}

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 24
  },

  header: {
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 28,
  },
  headerScript: {
    fontFamily: 'Brittany-Signature',
    fontSize: 42,
    color: '#ffffff',
    paddingVertical: 10,
    textShadowColor: NEON_BLUE,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  headerSub: {
    fontFamily: fonts.arimo.bold,
    fontSize: 13,
    letterSpacing: 3,
    color: colors.gray,
  },

  section: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontFamily: fonts.arimo.bold,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.gray,
    marginBottom: 4,
  },
  sectionSub: {
    fontFamily: fonts.arimo.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 16,
  },

  carousel: {
    gap: 12,
    paddingBottom: 8,
  },
  exampleCard: {
    width: 125,
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#1c1c1e',
    position: 'relative',
  },
  exampleImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  exampleOverlayText: {
    position: 'absolute',
    top: 40,
    width: '100%',
    textAlign: 'center',
    fontSize: 26,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 24,
  },

  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: fonts.arimo.bold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.gray,
    marginBottom: 8,
  },
  inputSub: {
    fontFamily: fonts.arimo.regular,
    fontSize: 12,
    color: colors.whiteOverlayLight,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  optional: {
    fontFamily: fonts.arimo.regular,
    fontSize: 10,
    color: colors.whiteOverlayLight,
    letterSpacing: 0,
  },
  helperText: {
    fontFamily: fonts.arimo.regular,
    fontSize: 11,
    color: colors.whiteOverlayLight,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: colors.darkSlateBlue,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    height: 48,
    paddingHorizontal: 16,
    fontFamily: fonts.arimo.regular,
    fontSize: 14,
    color: '#fff',
    zIndex: 3,
  },
  inputActive: {
    borderColor: 'transparent',
    backgroundColor: colors.midnightBlue,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15,23,42,0.8)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.15)',
    padding: 3,
    gap: 3,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    overflow: 'hidden',
    zIndex: 3,
  },
  toggleBtnActive: {
  },
  toggleText: {
    fontFamily: fonts.arimo.bold,
    fontSize: 13,
    letterSpacing: 0.5,
    color: colors.gray,
    zIndex: 4,
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  uploadCard: {
    backgroundColor: 'rgba(15,23,42,0.7)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0,212,255,0.2)',
    borderStyle: 'dashed',
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    gap: 10,
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(0,212,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: `${NEON_BLUE}55`,
  },
  uploadIconGlow: {
    shadowColor: NEON_BLUE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 6,
  },
  uploadText: {
    fontFamily: fonts.arimo.bold,
    fontSize: 14,
    color: '#fff',
  },
  uploadSubtext: {
    fontFamily: fonts.arimo.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(0,212,255,0.2)',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 58, 48, 0.9)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,59,48,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  colorConfig: {
    flex: 1,
  },
  colorLabel: {
    fontFamily: fonts.arimo.bold,
    fontSize: 10,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 8,
  },
  colorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  colorPreview: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  colorValue: {
    fontFamily: fonts.arimo.bold,
    fontSize: 13,
    color: '#fff',
    letterSpacing: 0.5,
  },

  buttonWrapper: {
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerTitle: {
    fontFamily: fonts.arimo.bold,
    fontSize: 16,
    color: '#fff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPanel: {
    height: 200,
    borderRadius: 14,
  },
  hueSlider: {
    height: 24,
    borderRadius: 12,
  },
  pickerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 8,
  },
  previewContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  hexInput: {
    backgroundColor: colors.darkSlateBlue,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    height: 48,
    paddingHorizontal: 16,
    fontFamily: fonts.arimo.bold,
    fontSize: 16,
    color: '#fff',
    letterSpacing: 1,
    textAlign: 'center',
    zIndex: 3,
  },
  hexInputActive: {
    borderColor: 'transparent',
    backgroundColor: colors.midnightBlue,
  },
  confirmButtonPressable: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
    marginTop: 24,
  },
  confirmButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontFamily: fonts.arimo.bold,
    fontSize: 14,
    letterSpacing: 0.6,
    color: '#fff',
  },
});
