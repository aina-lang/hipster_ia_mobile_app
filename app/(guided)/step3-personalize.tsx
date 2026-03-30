import React, { useCallback, useEffect, useRef, useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ColorPicker, HueSlider, Panel1, Preview } from 'reanimated-color-picker';
import { Upload, X, Sparkles } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { VISUAL_ARCHITECTURES } from '../../constants/visualArchitectures';
import { useCreationStore } from '../../store/creationStore';
import { useAuthStore } from '../../store/authStore';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';
import { NeonActionButton } from '../../components/ui/NeonActionButton';
import { NeonBorderInput } from '../../components/ui/NeonBorderInput';
import { GenericModal, ModalType } from '../../components/ui/GenericModal';
import prestigeImg from '../../assets/bw5.jpeg';
import magazineCoverImg from '../../assets/TroisiemeCard.jpeg';
import editorialMotionImg from '../../assets/quatriemeCard.jpeg';
import fashionImg from '../../assets/premierCard.jpeg';
import streetSaleImg from '../../assets/deuxiemeCard.jpeg';

const NEON_BLUE = colors.neonBlue;

const CAROUSEL_IMAGES = [fashionImg, streetSaleImg, magazineCoverImg, editorialMotionImg];

const ARCHITECTURE_EXAMPLES: Record<string, { label: string; image: any; text: string }[]> =
  VISUAL_ARCHITECTURES.reduce(
    (acc, arch) => {
      acc[arch.id] = CAROUSEL_IMAGES.map((image) => ({ label: '', image, text: '' }));
      return acc;
    },
    {} as Record<string, { label: string; image: any; text: string }[]>
  );

const VISUAL_STYLES = [
  { label: 'Premium' as const, description: 'Noir & blanc luxe', image: prestigeImg },
  { label: 'Hero Studio' as const, description: 'Impact fort', image: magazineCoverImg },
  { label: 'Minimal Studio' as const, description: 'Épuré & moderne', image: editorialMotionImg },
];

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
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

  stylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  styleCard: {
    width: '48%',
    aspectRatio: 0.8,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  styleCardSelected: {
    borderColor: NEON_BLUE,
    borderWidth: 1.5,
  },
  styleCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.6,
  },
  styleCardFooter: {
    marginTop: 'auto',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  styleCardFooterSelected: {
    backgroundColor: 'rgba(30,155,255,0.2)',
  },
  styleCardLabel: {
    fontFamily: fonts.arimo.bold,
    fontSize: 13,
    color: '#fff',
  },
  styleCardDesc: {
    fontFamily: fonts.arimo.regular,
    fontSize: 10,
    color: colors.gray,
    marginTop: 2,
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
  toggleBtnActive: {},
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
    marginBottom: 24,
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
    <View style={styles.inputGroup}>
      {label && (
        <Text style={styles.inputLabel}>
          {label}
          {optional && <Text style={styles.optional}> (OPTIONNEL)</Text>}
        </Text>
      )}
      <NeonBorderInput isActive={focused}>
        <TextInput
          style={[
            styles.input,
            focused && styles.inputActive,
            multiline && { height: 80, paddingTop: 14 },
          ]}
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

export default function Step3PersonalizeScreen() {
  const router = useRouter();
  const {
    selectedCategory,
    selectedFunction,
    selectedArchitecture,
    selectedStyle,
    setStyle,
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
    setColorRight,
    colorRight,
    textPromo,
    setTextPromo,
    uploadedImage,
    setUploadedImage,
    setQuery,
  } = useCreationStore();

  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.brandingColor && colorRight === '#000000') {
      setColorRight(user.brandingColor);
    }
  }, [user, colorRight, setColorRight]);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [activeColorSide, setActiveColorSide] = useState<'left' | 'right' | null>(null);
  const [tempColor, setTempColor] = useState('#FFFFFF');
  const [tempHex, setTempHex] = useState('#FFFFFF');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const [hexFocused, setHexFocused] = useState(false);

  const uploadCardSlide = useRef(new Animated.Value(0)).current;
  const imagePreviewSlide = useRef(new Animated.Value(0)).current;

  const [subjectSourceType, setSubjectSourceType] = useState<'image' | 'text'>(
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

  const updateColorState = useCallback(
    (hex: string) => {
      if (activeColorSide === 'left') setColorLeft(hex);
      else if (activeColorSide === 'right') setColorRight(hex);
      setTempHex(hex.toUpperCase());
      setTempColor(hex);
    },
    [activeColorSide, setColorLeft, setColorRight]
  );

  const handleColorSelect = (event: { hex: string }) => {
    updateColorState(event.hex);
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
    if (textPromo) queryParts.push(textPromo);
    if (infoLine) queryParts.push(infoLine);
    setQuery(queryParts.join(' '));
    router.push('/(guided)/step4-result');
  };

  const exampleData =
    selectedArchitecture && selectedArchitecture in ARCHITECTURE_EXAMPLES
      ? ARCHITECTURE_EXAMPLES[selectedArchitecture]
      : ARCHITECTURE_EXAMPLES[VISUAL_ARCHITECTURES[0]?.id] ?? [];

  const isShortFlow = selectedCategory === 'Social' || selectedCategory === 'Image';

  return (
    <GuidedScreenWrapper currentStep={isShortFlow ? 3 : 4} totalSteps={isShortFlow ? 3 : 4}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerScript}>Personnaliser</Text>
          <Text style={styles.headerSub}>VOTRE VISUEL</Text>
        </View>

        {selectedCategory === 'Social' ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DIRECTION ARTISTIQUE</Text>
            <Text style={styles.sectionSub}>Sélectionnez l&apos;ambiance de votre contenu</Text>
            <View style={styles.stylesGrid}>
              {VISUAL_STYLES.map((item) => {
                const isSelected = selectedStyle === item.label;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.styleCard, isSelected && styles.styleCardSelected]}
                    onPress={() => setStyle(item.label)}
                    activeOpacity={0.85}
                  >
                    <Image source={item.image} style={styles.styleCardImage} />
                    <View style={[styles.styleCardFooter, isSelected && styles.styleCardFooterSelected]}>
                      <Text style={styles.styleCardLabel}>{item.label}</Text>
                      <Text style={styles.styleCardDesc}>{item.description}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>EXEMPLES</Text>
            <Text style={styles.sectionSub}>Ce modèle s&apos;adapte à tous les produits</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
              {exampleData.map((item, index) => (
                <View key={index} style={styles.exampleCard}>
                  <Image source={item.image} style={styles.exampleImage} />
                  {!!item.text && <Text style={styles.exampleOverlayText}>{item.text}</Text>}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>SOURCE DU SUJET</Text>
          <Text style={styles.inputSub}>Comment voulez-vous définir le sujet principal ?</Text>

          <View style={styles.toggleRow}>
            <NeonBorderInput isActive={subjectSourceType === 'text'}>
              <TouchableOpacity
                style={[styles.toggleBtn, subjectSourceType === 'text' && styles.toggleBtnActive]}
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
                <Text
                  style={[styles.toggleText, subjectSourceType === 'text' && styles.toggleTextActive]}
                >
                  Texte
                </Text>
              </TouchableOpacity>
            </NeonBorderInput>

            <NeonBorderInput isActive={subjectSourceType === 'image'}>
              <TouchableOpacity
                style={[styles.toggleBtn, subjectSourceType === 'image' && styles.toggleBtnActive]}
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
                <Text
                  style={[styles.toggleText, subjectSourceType === 'image' && styles.toggleTextActive]}
                >
                  Photo
                </Text>
              </TouchableOpacity>
            </NeonBorderInput>
          </View>
        </View>

        {subjectSourceType === 'image' ? (
          <View style={styles.inputGroup}>
            <Animated.View style={{ transform: [{ translateX: uploadCardSlide }] }}>
              <TouchableOpacity style={styles.uploadCard} onPress={pickImage} activeOpacity={0.9}>
                {uploadedImage ? (
                  <Animated.View
                    style={[styles.imagePreviewContainer, { transform: [{ translateX: imagePreviewSlide }] }]}
                  >
                    <Image source={{ uri: uploadedImage }} style={styles.uploadedImage} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => setUploadedImage(null)}
                    >
                      <X size={16} color="#fff" />
                    </TouchableOpacity>
                  </Animated.View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <View style={styles.uploadIconCircle}>
                      <View style={styles.uploadIconGlow}>
                        <Upload size={20} color={NEON_BLUE} />
                      </View>
                    </View>
                    <Text style={styles.uploadText}>Sélectionner une image</Text>
                    <Text style={styles.uploadSubtext}>JPG, PNG ou WebP</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        ) : (
          <View style={styles.inputGroup}>
            <NeonInputField
              placeholder="Ex: un bouquet de fleurs, un sac à main..."
              value={subject}
              onChangeText={setSubject}
            />
            <Text style={styles.helperText}>Décris en 3-8 mots ce que tu veux au centre du visuel</Text>
          </View>
        )}

        <NeonInputField
          label="TITRE PRINCIPAL"
          placeholder="Ajouter un titre"
          value={mainTitle}
          onChangeText={setMainTitle}
        />

        <NeonInputField
          label="SOUS-TITRE"
          optional
          placeholder="Ajouter un sous-titre"
          value={subTitle}
          onChangeText={setSubTitle}
        />

        {selectedArchitecture === 'impact-commercial' && (
          <NeonInputField
            label="TEXTE PROMO (BADGE)"
            placeholder="Ex: -50% ou NOUVEAU"
            value={textPromo}
            onChangeText={setTextPromo}
          />
        )}

        <NeonInputField
          label="LIGNE D'INFO"
          placeholder="Date ou info brève"
          value={infoLine}
          onChangeText={setInfoLine}
        />

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>COULEURS</Text>
          <View style={styles.colorRow}>
            {selectedArchitecture !== 'mono-accent' && (
              <View style={styles.colorConfig}>
                <Text style={styles.colorLabel}>
                  {selectedArchitecture === 'impact-commercial' ? 'FOND' : 'PRINCIPALE'}
                </Text>
                <TouchableOpacity style={[styles.input, styles.colorButton]} onPress={() => openPicker('left')}>
                  <View style={[styles.colorPreview, { backgroundColor: colorLeft }]} />
                  <Text style={styles.colorValue}>{colorLeft.toUpperCase()}</Text>
                </TouchableOpacity>
              </View>
            )}
            {selectedArchitecture !== 'magazine-cover-poster' && (
              <View style={styles.colorConfig}>
                <Text style={styles.colorLabel}>
                  {selectedArchitecture === 'impact-commercial' ? 'SUJET' : 'SECONDAIRE'}
                </Text>
                <TouchableOpacity style={[styles.input, styles.colorButton]} onPress={() => openPicker('right')}>
                  <View style={[styles.colorPreview, { backgroundColor: colorRight }]} />
                  <Text style={styles.colorValue}>{colorRight.toUpperCase()}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.buttonWrapper}>
          <NeonActionButton
            label="GÉNÉRER MON VISUEL"
            icon={<Sparkles size={16} color="#ffffff" />}
            onPress={handleCreate}
          />
        </View>

        <Modal visible={pickerVisible} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>
                  Couleur {activeColorSide === 'left' ? 'principale' : 'secondaire'}
                </Text>
                <TouchableOpacity onPress={() => setPickerVisible(false)} style={styles.closeButton}>
                  <X size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <ColorPicker value={tempColor} onCompleteJS={handleColorSelect} style={{ gap: 20 }}>
                <Panel1 style={styles.colorPanel} />
                <HueSlider style={styles.hueSlider} />
                <View style={styles.pickerFooter}>
                  <Preview style={styles.previewContainer} hideText colorFormat="hex" />
                  <View style={{ flex: 1 }}>
                    <NeonBorderInput isActive={hexFocused}>
                      <TextInput
                        style={[styles.hexInput, hexFocused && styles.hexInputActive]}
                        value={tempHex}
                        onChangeText={handleHexChange}
                        onBlur={() => {
                          setHexFocused(false);
                          handleHexBlur();
                        }}
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

              <TouchableOpacity onPress={() => setPickerVisible(false)} style={styles.confirmButtonPressable}>
                <LinearGradient
                  colors={['#264F8C', '#0a1628', '#040612']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  locations={[0, 0.46, 1]}
                  style={styles.confirmButtonGradient}
                >
                  <Text style={styles.confirmButtonText}>VALIDER</Text>
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
    </GuidedScreenWrapper>
  );
}
