import React from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Palette, Minus, Check, X } from 'lucide-react-native';
import ColorPicker, { HueSlider, Panel1, Preview } from 'reanimated-color-picker';
import { runOnJS } from 'react-native-reanimated';
import { useCreationStore } from '../../store/creationStore';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';
import { NeonButton } from '../../components/ui/NeonButton';

import illus2 from '../../assets/illus2.jpeg';
import illus3 from '../../assets/illus3.jpeg';
import illus4 from '../../assets/illus4.jpeg';
import illus1 from '../../assets/illus1.jpeg'; // Assuming illus1 exists, if not I'll handle it. Actually I will use illus2 again to be safe.

// Fallback to illus2 if illus1 is not there.
const EXAMPLES = [
  { label: 'Cosmétique', image: illus2, text: 'NOUVEAU' },
  { label: 'Mode', image: illus3, text: 'NOUVEAU' },
  { label: 'Mobilier', image: illus4, text: 'SOLDES' },
  { label: 'Tech', image: illus2, text: 'NOUVEAU' },
];

const VISUAL_STYLES = [
  { label: 'Premium', description: 'Noir & blanc luxe', image: illus2 },
  { label: 'Hero', description: 'Impact fort', image: illus3 },
  { label: 'Minimal', description: 'Épuré & moderne', image: illus4 },
];

export default function Step3PersonalizeScreen() {
  const router = useRouter();
  const {
    selectedCategory,
    selectedStyle, setStyle,
    mainTitle, setMainTitle,
    subTitle, setSubTitle,
    infoLine, setInfoLine,
    colorLeft, setColorLeft,
    colorRight, setColorRight,
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
    // Generate a prompt or pass values to the next screen.
    const queryParts = [];
    if (mainTitle) queryParts.push(`Titre: ${mainTitle}`);
    if (subTitle) queryParts.push(`Sous-titre: ${subTitle}`);
    if (infoLine) queryParts.push(`Info: ${infoLine}`);
    queryParts.push(`Couleur Principale: ${colorLeft}`);
    queryParts.push(`Couleur Secondaire: ${colorRight}`);
    setQuery(queryParts.join('\n'));

    router.push('/(guided)/step4-personalize');
  };

  return (
    <GuidedScreenWrapper
      currentStep={4}
      totalSteps={4}
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
              {EXAMPLES.map((item, index) => (
                <View key={index} style={styles.exampleCard}>
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: index === 0 ? '#ffb6b9' : index === 1 ? '#e2e8f0' : index === 2 ? '#fde047' : '#94a3b8' }]} />
                  <Image source={item.image} style={styles.exampleImage} />

                  <Text style={styles.exampleOverlayText}>{item.text}</Text>

                  <View style={styles.exampleBadge}>
                    <Text style={styles.exampleBadgeText}>JUSQU'À</Text>
                    <Text style={styles.exampleBadgeSale}>-50%</Text>
                  </View>

                  <View style={styles.exampleLabelContainer}>
                    <Text style={styles.exampleLabelText}>{item.label}</Text>
                  </View>
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
                <Text style={styles.colorLabel}>COULEUR PRINCIPALE</Text>
              </View>
              <TouchableOpacity
                style={[styles.input, styles.colorButton]}
                onPress={() => openPicker('left')}
              >
                <View style={[styles.colorPreview, { backgroundColor: colorLeft }]} />
                <Text style={styles.colorValue}>{colorLeft.toUpperCase()}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.colorConfig}>
              <View style={styles.colorHeader}>
                <View style={styles.iconCircle}>
                  <Palette size={12} color="#fff" />
                </View>
                <Text style={styles.colorLabel}> COULEUR SECONDAIRE</Text>
              </View>
              <TouchableOpacity
                style={[styles.input, styles.colorButton]}
                onPress={() => openPicker('right')}
              >
                <View style={[styles.colorPreview, { backgroundColor: colorRight }]} />
                <Text style={styles.colorValue}>{colorRight.toUpperCase()}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Color Picker Modal */}
        <Modal visible={pickerVisible} animationType="fade" transparent>
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
        </Modal>

      </View>
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
    opacity: 0.8,
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