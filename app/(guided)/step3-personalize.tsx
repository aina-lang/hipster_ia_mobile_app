import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Palette, Minus, Check, X, Upload } from 'lucide-react-native';
import ColorPicker, { HueSlider, Panel1, Preview } from 'reanimated-color-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { runOnJS } from 'react-native-reanimated';
import { useCreationStore } from '../../store/creationStore';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';
import { NeonButton } from '../../components/ui/NeonButton';
import { GenericModal, ModalType } from '../../components/ui/GenericModal';

import illus2 from '../../assets/Rouge_a_levre.jpeg';
import illus3 from '../../assets/casquette.jpeg';
import illus4 from '../../assets/TroisiemeCard.jpeg';
import illus1 from '../../assets/montre.jpeg'; // Assuming illus1 exists, if not I'll handle it. Actually I will use illus2 again to be safe.
//VERTICAL FASHION
import vertical1 from '../../assets/vertical1.jpeg';
import vertical2 from '../../assets/vertical2.jpeg';
import vertical3 from '../../assets/vertical3.jpeg';
import vertical4 from '../../assets/vertical4.jpeg';
//Magazine cover
import vertical5 from '../../assets/vertical5.jpeg';
import vertical6 from '../../assets/vertical6.jpeg';
import magazine1 from '../../assets/magazin1.jpeg';
import magazine2 from '../../assets/magazine2_1.jpeg';
import magazine3 from '../../assets/magazine3.jpeg';
import magazine4 from '../../assets/magazine4.jpeg';
import magazine5 from '../../assets/magazine5.jpeg';
//Commerce Impact
import mode from '../../assets/mode.jpeg';
import chiot from '../../assets/chiot.jpeg';
import casque from '../../assets/Casque.jpeg';
import chantier from '../../assets/chantierComm.jpeg';
import signatureSplash1 from '../../assets/signatureSplash1.jpeg';
import signatureSplash2 from '../../assets/signatureSplash2.jpeg';
import signatureSplash3 from '../../assets/signatureSplash3.jpeg';
import signatureSplash4 from '../../assets/signatureSplash4.jpeg';
// Fallback to illus2 if illus1 is not there.
const EXAMPLES_DEFAULT = [
  { label: '', image: illus2, text: '' },
  { label: '', image: illus3, text: '' },
  { label: '', image: illus4, text: '' },
  { label: '', image: illus1, text: '' },
];

const ARCHITECTURE_EXAMPLES = {
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
};

const VISUAL_STYLES = [
  { label: 'Premium', description: 'Noir & blanc luxe', image: illus2 },
  { label: 'Hero', description: 'Impact fort', image: illus3 },
  { label: 'Minimal', description: 'Épuré & moderne', image: illus4 },
];

export default function Step3PersonalizeScreen() {
  const router = useRouter();
  const {
    selectedJob,
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
    colorRight,
    setColorRight,
    textPromo,
    setTextPromo,
    uploadedImage,
    setUploadedImage,
    setQuery,
  } = useCreationStore();

  React.useEffect(() => {
    console.log('[DEBUG] Step3PersonalizeScreen MODIFIED MOUNT', {
      selectedCategory,
      selectedFunction,
      selectedArchitecture,
      selectedJob
    });
  }, []);

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

  // Animation references for slide animations
  const textButtonSlide = useRef(new Animated.Value(0)).current;
  const imageButtonSlide = useRef(new Animated.Value(0)).current;
  const uploadCardSlide = useRef(new Animated.Value(0)).current;
  const imagePreviewSlide = useRef(new Animated.Value(0)).current;

  const animateButtonSlide = (slideRef: any) => {
    Animated.sequence([
      Animated.timing(slideRef, {
        toValue: -30,
        duration: 280,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: true,
      }),
      Animated.timing(slideRef, {
        toValue: 0,
        duration: 350,
        easing: Easing.bezier(0.33, 0.66, 0.66, 1),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateCardSlide = (slideRef: any) => {
    Animated.sequence([
      Animated.timing(slideRef, {
        toValue: -40,
        duration: 320,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: true,
      }),
      Animated.timing(slideRef, {
        toValue: 0,
        duration: 420,
        easing: Easing.bezier(0.33, 0.66, 0.66, 1),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const [subjectSourceType, setSubjectSourceType] = React.useState<'image' | 'text'>(
    uploadedImage ? 'image' : 'text'
  );

  const handleSourceTypeChange = (type: 'image' | 'text') => {
    setSubjectSourceType(type);
    if (type === 'image') {
      setSubject('');
    } else {
      setUploadedImage(null);
    }
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
    if (formatted.length > 0 && !formatted.startsWith('#')) {
      formatted = '#' + formatted;
    }

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

    // Use a simple space-separated string for improvisation context
    setQuery(queryParts.join(' '));

    router.push('/(guided)/step4-result');
  };

  return (
    <GuidedScreenWrapper
      currentStep={selectedCategory === 'Social' || selectedCategory === 'Image' ? 3 : 4}
      totalSteps={selectedCategory === 'Social' || selectedCategory === 'Image' ? 3 : 4}
      footer={
        <View style={styles.fixedFooter}>
          <View style={styles.ctaWrapper}>
            <NeonButton
              title="GÉNÉRER MON VISUEL"
              onPress={handleCreate}
              variant="premium"
              size="lg"
              style={{ width: '100%' }}
            />
          </View>
        </View>
      }
    >
      <View style={styles.container}>
        {/* Header Content */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Personnaliser le visuel</Text>
        </View>
        {/* EXAMPLES OR STYLES SECTION */}
        {selectedCategory === 'Social' ? (
          <>
            <Text style={styles.sectionTitle}>Chosissez votre DA</Text>
            <Text style={styles.sectionSubtitle}>Sélectionnez l'ambiance de votre contenu</Text>
            <View style={styles.stylesGrid}>
              {VISUAL_STYLES.map((item) => {
                const isSelected = selectedStyle === item.label;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.styleCard, isSelected && styles.styleCardSelected]}
                    onPress={() => setStyle(item.label as any)}
                    activeOpacity={0.85}
                  >
                    {isSelected && (
                      <>
                        <View style={styles.cardBorderGlow} pointerEvents="none" />
                        <View style={styles.cardBloom} pointerEvents="none" />
                      </>
                    )}
                    <Image source={item.image} style={styles.styleCardImage} />
                    <View style={[styles.styleCardFooter, isSelected && styles.styleCardFooterSelected]}>
                      <Text style={styles.styleCardLabel}>{item.label}</Text>
                      <Text style={styles.styleCardDesc}>{item.description}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Ce modèle s'adapte à tous les produits</Text>
            <Text style={styles.sectionSubtitle}>Voici quelques exemples</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
              {(selectedArchitecture && selectedArchitecture in ARCHITECTURE_EXAMPLES
                ? ARCHITECTURE_EXAMPLES[selectedArchitecture as keyof typeof ARCHITECTURE_EXAMPLES]
                : EXAMPLES_DEFAULT
              ).map((item, index) => (
                <View key={index} style={styles.exampleCard}>
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: index === 0 ? '#ffb6b9' : index === 1 ? '#e2e8f0' : index === 2 ? '#fde047' : '#94a3b8' }]} />
                  <Image source={item.image} style={styles.exampleImage} />

                  <Text style={styles.exampleOverlayText}>{item.text}</Text>

                </View>
              ))}
            </ScrollView>

            <View style={styles.paginationDots}>
              <View style={[styles.dot, styles.dotInactive]} />
              <View style={styles.dotActiveWrapper}>
                <View style={[styles.dot, styles.dotActive]} />
              </View>
              <View style={[styles.dot, styles.dotInactive]} />
            </View>
          </>
        )}

        <View style={styles.separator} />

        {/* SUBJECT SOURCE TOGGLE */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>SOURCE DU SUJET</Text>
          <Text style={styles.inputDescription}>Comment voulez-vous définir le sujet principal ?</Text>

          <View style={styles.sourceToggleContainer}>
            <TouchableOpacity
              style={[styles.sourceToggleButton, subjectSourceType === 'text' && styles.sourceToggleButtonActive]}
              onPress={() => {
                animateButtonSlide(textButtonSlide);
                handleSourceTypeChange('text');
              }}
              activeOpacity={1}
            >
              {subjectSourceType === 'text' && (
                <LinearGradient
                  colors={['rgba(26, 143, 255, 0.4)', 'rgba(26, 143, 255, 0.1)', 'transparent']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                />
              )}
              <Animated.View style={{ position: 'absolute', inset: 0, transform: [{ translateX: textButtonSlide }], borderRadius: 12 }} />
              <Text style={[styles.sourceToggleText, subjectSourceType === 'text' && styles.sourceToggleTextActive, { zIndex: 1 }]}>Texte</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sourceToggleButton, subjectSourceType === 'image' && styles.sourceToggleButtonActive]}
              onPress={() => {
                animateButtonSlide(imageButtonSlide);
                handleSourceTypeChange('image');
              }}
              activeOpacity={1}
            >
              {subjectSourceType === 'image' && (
                <LinearGradient
                  colors={['rgba(26, 143, 255, 0.4)', 'rgba(26, 143, 255, 0.1)', 'transparent']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={StyleSheet.absoluteFill}
                  pointerEvents="none"
                />
              )}
              <Animated.View style={{ position: 'absolute', inset: 0, transform: [{ translateX: imageButtonSlide }], borderRadius: 12 }} />
              <Text style={[styles.sourceToggleText, subjectSourceType === 'image' && styles.sourceToggleTextActive, { zIndex: 1 }]}>Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {subjectSourceType === 'image' ? (
          /* IMAGE UPLOAD SECTION */
          <View style={styles.inputGroup}>
            <Animated.View style={{ transform: [{ translateX: uploadCardSlide }] }}>
              <TouchableOpacity
                style={styles.uploadCard}
                onPress={() => {
                  animateCardSlide(uploadCardSlide);
                  pickImage();
                }}
                activeOpacity={1}
              >
                {uploadedImage ? (
                  <Animated.View 
                    style={[
                      styles.imagePreviewContainer,
                      { transform: [{ translateX: imagePreviewSlide }] }
                    ]}
                  >
                    <Image source={{ uri: uploadedImage }} style={styles.uploadedImage} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => {
                        animateCardSlide(imagePreviewSlide);
                        setUploadedImage(null);
                      }}
                    >
                      <X size={16} color="#fff" />
                    </TouchableOpacity>
                  </Animated.View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <View style={styles.uploadIconCircle}>
                      <Upload size={20} color={colors.primary.main} />
                    </View>
                    <Text style={styles.uploadText}>Sélectionner une image</Text>
                    <Text style={styles.uploadSubtext}>JPG, PNG ou WebP</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        ) : (
          /* SUBJECT FIELD */
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              placeholder="Ex: un bouquet de fleurs, un sac à main..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={subject}
              onChangeText={setSubject}
            />
            <Text style={styles.helperText}>Décris en 3-8 mots ce que tu veux au centre du visuel</Text>
          </View>
        )}

        {/* INPUT FORM SECTION */}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>TITRE PRINCIPAL</Text>
          <TextInput
            style={styles.input}
            placeholder="TON TITRE ICI"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={mainTitle}
            onChangeText={setMainTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>SOUS-TITRE (OPTIONNEL)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ajouter un sous-titre ici"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={subTitle}
            onChangeText={setSubTitle}
          />
        </View>

        {selectedArchitecture === 'impact-commercial' && (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>TEXTE PROMO (POUR LE BADGE)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: -50% ou NOUVEAU"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={textPromo}
              onChangeText={setTextPromo}
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>LIGNE D'INFO</Text>
          <TextInput
            style={styles.input}
            placeholder="Date ou info brève ici"
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={infoLine}
            onChangeText={setInfoLine}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>PERSONNALISATION DES COULEURS</Text>
          <View style={styles.colorRow}>
            <View style={styles.colorConfig}>
              <View style={styles.colorHeader}>
                <View style={styles.iconCircle}>
                  <Palette size={12} color="#fff" />
                </View>
                <Text style={styles.colorLabel}>
                  {selectedArchitecture === 'impact-commercial' ? 'COULEUR DE FOND' : 'COULEUR PRINCIPALE'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.input, styles.colorButton]}
                onPress={() => openPicker('left')}
              >
                <View style={[styles.colorPreview, { backgroundColor: colorLeft }]} />
                <Text style={styles.colorValue}>{colorLeft.toUpperCase()}</Text>
              </TouchableOpacity>
            </View>

            {/* SECONDAIRE - HIDDEN FOR STREET SALE (single-color architecture) */}
            {selectedArchitecture !== 'magazine-cover-poster' && (
              <View style={styles.colorConfig}>
                <View style={styles.colorHeader}>
                  <View style={styles.iconCircle}>
                    <Palette size={12} color="#fff" />
                  </View>
                  <Text style={styles.colorLabel}>
                    {selectedArchitecture === 'impact-commercial' ? 'COULEUR DU SUJET' : 'COULEUR SECONDAIRE'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.input, styles.colorButton]}
                  onPress={() => openPicker('right')}
                >
                  <View style={[styles.colorPreview, { backgroundColor: colorRight }]} />
                  <Text style={styles.colorValue}>{colorRight.toUpperCase()}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Color Picker Modal */}
        < Modal visible={pickerVisible} animationType="fade" transparent >
          <View style={styles.modalOverlay}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>
                  Choisir la couleur {activeColorSide === 'left' ? 'principale' : 'secondaire'}
                </Text>
                <TouchableOpacity onPress={() => setPickerVisible(false)} style={styles.closeButton}>
                  <X size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              <ColorPicker
                value={tempColor}
                onComplete={handleColorSelect}
                style={{ gap: 20 }}
              >
                <Panel1 style={styles.colorPanel} />
                <HueSlider style={styles.hueSlider} />

                <View style={styles.pickerFooter}>
                  <Preview style={styles.previewContainer} hideText colorFormat="hex" />
                  <TextInput
                    style={styles.hexInput}
                    value={tempHex}
                    onChangeText={handleHexChange}
                    onBlur={handleHexBlur}
                    placeholder="#FFFFFF"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    maxLength={9}
                    autoCapitalize="characters"
                    spellCheck={false}
                    autoCorrect={false}
                  />
                </View>
              </ColorPicker>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => setPickerVisible(false)}
              >
                <Text style={styles.confirmButtonText}>Valider</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal >

        {/* Info/Error Modal */}
        < GenericModal
          visible={modalVisible}
          type={modalType}
          title={modalTitle}
          message={modalMessage}
          onClose={() => setModalVisible(false)
          }
        />
      </View >
    </GuidedScreenWrapper >
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 4,
  },
  fixedFooter: {
    paddingHorizontal: 20,
    paddingTop: 10,

    paddingBottom: 20,
  },
  ctaWrapper: {
    overflow: 'visible',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 24,
  },
  carousel: {
    gap: 12,
  },
  exampleCard: {
    width: 125,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#1c1c1e',
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
  exampleBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#000',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'center',
    zIndex: 10,
  },
  exampleBadgeText: {
    color: '#fff',
    fontSize: 6,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  exampleBadgeSale: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  exampleLabelContainer: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
    backgroundColor: '#1E1E24',
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
  },
  exampleLabelText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    marginBottom: 24,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  dotActiveWrapper: {
    width: 20,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  dotActive: {
    width: '50%',
    backgroundColor: '#3b82f6',
    height: '100%',
  },
  dotInactive: {
    width: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  helperText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 8,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#fff',
  },
  sourceToggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 212, 255, 0.15)',
    overflow: 'visible',
    position: 'relative',
    marginTop: 12,
    marginBottom: 12,
    gap: 1,
    padding: 2,
    shadowColor: 'rgba(0, 212, 255, 0.2)',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  sourceToggleButton: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(15, 30, 60, 0.6)',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 212, 255, 0.25)',
  },
  sourceToggleButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: '#1e9bff',
    borderWidth: 2,
    shadowColor: '#1a8fff',
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 20,
  },
  sourceToggleText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  sourceToggleTextActive: {
    color: '#000',
    fontWeight: '800',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  colorConfig: {
    flex: 1,
  },
  colorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
    height: 20,
  },
  iconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: 'rgba(30,155,255,0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#60a5fa',
  },
  colorLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  colorInput: {
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  stylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  styleCard: {
    width: '48%', // Approx 2 columns
    aspectRatio: 0.8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
  },
  styleCardSelected: {
    borderColor: colors.primary.main,
    borderWidth: 2,
  },
  styleCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.6,
  },
  styleCardCheckBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  styleCardFooter: {
    marginTop: 'auto',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  styleCardFooterSelected: {
    backgroundColor: 'rgba(30,155,255,0.2)',
  },
  cardBorderGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 12,
    backgroundColor: 'transparent',
    shadowColor: '#1a8fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 12,
    zIndex: -1,
  },
  cardBloom: {
    position: 'absolute',
    top: -6, left: -6, right: -6, bottom: -6,
    borderRadius: 18,
    backgroundColor: 'transparent',
    shadowColor: '#0840bb',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 4,
    zIndex: -1,
  },
  styleCardLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  styleCardDesc: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 2,
  },
  // Upload Card
  uploadCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 212, 255, 0.20)',
    borderStyle: 'dashed',
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    shadowColor: 'rgba(0, 212, 255, 0.15)',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    gap: 10,
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 212, 255, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 212, 255, 0.25)',
    shadowColor: colors.primary.main,
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  uploadText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  uploadSubtext: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 212, 255, 0.20)',
    shadowColor: colors.primary.main,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 59, 48, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  // Neon Toggle Button Glow Effects
  toggleBorderGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 12,
    backgroundColor: 'transparent',
    shadowColor: '#1e9bff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 18,
    zIndex: -1,
  },
  toggleBloomMid: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 14,
    backgroundColor: 'transparent',
    shadowColor: '#0060e0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 12,
    zIndex: -2,
  },
  toggleBloomFar: {
    position: 'absolute',
    top: -12,
    left: -12,
    right: -12,
    bottom: -12,
    borderRadius: 16,
    backgroundColor: 'transparent',
    shadowColor: '#0a50cc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 8,
    zIndex: -3,
  },
  toggleFloorGlow: {
    position: 'absolute',
    bottom: -40,
    left: '50%',
    marginLeft: -90,
    width: 180,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'transparent',
    shadowColor: '#1a6fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 35,
    elevation: 30,
    zIndex: -4,
  },
  // Color Picker styles
  colorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  colorValue: {
    fontSize: 13,
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
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
    backgroundColor: '#1c1c1e',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPanel: {
    height: 200,
    borderRadius: 16,
  },
  hueSlider: {
    height: 24,
    borderRadius: 12,
  },
  previewContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pickerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 8,
  },
  hexInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  confirmButton: {
    backgroundColor: colors.primary.main,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
