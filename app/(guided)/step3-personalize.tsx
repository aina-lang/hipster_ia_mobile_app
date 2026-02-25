import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Keyboard,
  Animated,
  Dimensions,
  StyleSheet,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { useCreationStore } from '../../store/creationStore';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';
import { NeonButton } from '../../components/ui/NeonButton';
import { BlurView } from 'expo-blur';
import {
  Sparkles,
  ChevronRight,
  Moon,
  Sun,
  Upload,
  X,
  Gem,
  Zap,
} from 'lucide-react-native';

import illus2 from "../../assets/illus2.jpeg"
import illus3 from "../../assets/illus3.jpeg"
import illus4 from "../../assets/illus4.jpeg"
import { FLYER_CATEGORIES } from '../../constants/flyerModels';
import { useEffect, useRef, useState } from 'react';
import { GenericModal, ModalType } from 'components/ui/GenericModal';
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const VISUAL_STYLES = [
  { label: 'Premium', icon: Moon, description: 'Noir & blanc haut de gamme.\nContrasté, intemporel, effet luxe.', image: illus2 },
  { label: 'Hero Studio', icon: Sun, description: 'Produit mis en scène comme une icône.\nLumière maîtrisée, impact fort.', image: illus3 },
  { label: 'Minimal Studio', icon: Sun, description: 'Fond clair, composition épurée.\nModerne, haut de gamme, ultra lisible.', image: illus4 },
];

export default function Step3PersonalizeScreen() {
  const router = useRouter();
  const {
    selectedJob,
    selectedFunction,
    selectedCategory,
    userQuery,
    setQuery,
    selectedStyle,
    setStyle,
    uploadedImage,
    setUploadedImage,
  } = useCreationStore();

  const scrollRef = useRef<ScrollView>(null);
  const [localQuery, setLocalQuery] = useState(userQuery || '');
  const [activeFlyerCategory, setActiveFlyerCategory] = useState<string | null>(null);

  const displayedCategories = FLYER_CATEGORIES;


  const skeletonOpacity = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const skeletonPulse = useRef(new Animated.Value(0.4)).current;

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (title: string, message: string, type: ModalType = 'info') => {
    setModalTitle(title);
    setModalMessage(message);
    setModalType(type);
    setModalVisible(true);
  };

  const flatListRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const ITEM_WIDTH = 240;
  const SPACING = 20;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonPulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(skeletonPulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(skeletonOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    }, 700);
    return () => { pulse.stop(); clearTimeout(timer); };
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri.toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
        if (!allowedExtensions.some((ext) => uri.endsWith(ext))) {
          showModal('Format non supporté', 'Veuillez sélectionner une image au format JPEG, PNG ou WebP.', 'error');
          return;
        }
        setUploadedImage(result.assets[0].uri);
      }
    } catch (error) {
      showModal('Erreur', "Impossible de sélectionner l'image", 'error');
    }
  };

  const handleCreate = () => {
    if (selectedCategory === 'Image' || selectedCategory === 'Social' || selectedCategory === 'Document') {
      if (!uploadedImage && !selectedStyle) {
        showModal('Choix requis', 'Veuillez choisir un modèle ou un style.', 'warning');
        return;
      }
    }
    setQuery(localQuery);
    router.push('/(guided)/step4-result');
  };

  const handleSelectStyle = (style: string, index: number) => {
    setStyle(style as any);
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5,
    });
  };

  return (
    <GuidedScreenWrapper scrollViewRef={scrollRef} footer={null}>
      <View style={{ paddingHorizontal: 20, overflow: 'visible' }}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Personnalisez votre création</Text>
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbJob}>{selectedJob}</Text>
            <ChevronRight size={14} color={colors.text.primary} />
            <Text style={styles.breadcrumbJob}>{selectedFunction?.split('(')[0]}</Text>
          </View>
        </View>

        {/* CONDITIONAL FLOW: Visual Layout */}
        {(selectedCategory === 'Image' || selectedCategory === 'Social' || selectedCategory === 'Document') && (
          <View style={{ marginBottom: 32, overflow: 'visible' }}>

            {/* 1. REFERENCE IMAGE */}
            <View style={{ marginTop: 20 }}>
              <Text style={styles.sectionTitle}>Image de référence</Text>
              {uploadedImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: uploadedImage }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeImageButton} onPress={() => setUploadedImage(null)}>
                    <X size={20} color="white" />
                  </TouchableOpacity>
                  <BlurView intensity={30} tint="dark" style={styles.changeImageOverlay}>
                    <TouchableOpacity onPress={pickImage} style={styles.changeImageButton}>
                      <Text style={styles.changeImageText}>Changer l'image</Text>
                    </TouchableOpacity>
                  </BlurView>
                </View>
              ) : (
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                  <View style={styles.uploadIconContainer}>
                    <Upload size={32} color={colors.primary.main} />
                  </View>
                  <Text style={styles.uploadText}>Cliquez pour ajouter une photo</Text>
                  <Text style={styles.uploadHint}>JPG, PNG ou WebP</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* 2. VISUAL STYLE / FLYER MODELS */}
            <View style={{ marginTop: 24, overflow: 'visible' }}>
              <Text style={styles.sectionTitle}>
                {selectedCategory === 'Document' ? 'Modèle de flyer' : 'Style artistique'}
              </Text>

              {selectedCategory === 'Document' ? (
                /* FLYER MODELS SELECTION */
                <View style={{ marginTop: 12 }}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryChipsContainer}
                    style={styles.categoryChipsScroll}
                  >
                    {displayedCategories.map((cat) => {
                      const isActive = activeFlyerCategory === cat.id;
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                          onPress={() => setActiveFlyerCategory(cat.id)}
                        >
                          <cat.icon size={18} color={isActive ? "white" : colors.text.muted} />
                          <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                            {cat.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {activeFlyerCategory ? (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.modelsScroll}
                      contentContainerStyle={styles.modelsScrollContainer}
                    >
                      <View style={styles.modelsGrid}>
                        {displayedCategories.find(c => c.id === activeFlyerCategory)?.models.map((modelObj) => {
                          const modelLabel = typeof modelObj === 'string' ? modelObj : modelObj.label;
                          const modelImage = typeof modelObj === 'object' && modelObj.image ? modelObj.image : displayedCategories.find(c => c.id === activeFlyerCategory)?.image;
                          const isSelected = selectedStyle === modelLabel;

                          return (
                            <TouchableOpacity
                              key={modelLabel}
                              style={[styles.modelCard, isSelected && styles.modelCardSelected]}
                              onPress={() => setStyle(modelLabel)}
                            >
                              <Image source={modelImage} style={styles.modelCardImage} />
                              <View style={styles.modelCardOverlay}>
                                <Text style={styles.modelCardName} numberOfLines={2}>{modelLabel}</Text>
                                {isSelected && (
                                  <View style={styles.modelCardActiveBadge}>
                                    <Zap size={12} color="white" />
                                  </View>
                                )}
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </ScrollView>
                  ) : (
                    <View style={styles.emptyModelsContainer}>
                      <Sparkles size={32} color="rgba(255,255,255,0.1)" />
                      <Text style={styles.emptyModelsText}>Sélectionnez une catégorie ci-dessus</Text>
                    </View>
                  )}
                </View>
              ) : (
                /* STANDARD VISUAL STYLES CAROUSEL */
                <Animated.FlatList
                  data={VISUAL_STYLES}
                  horizontal
                  keyExtractor={(item) => item.label}
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={ITEM_WIDTH + SPACING}
                  decelerationRate="fast"
                  contentContainerStyle={{
                    paddingHorizontal: SPACING,
                    paddingVertical: 50,
                  }}
                  style={{ overflow: 'visible' }}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: true }
                  )}
                  ref={flatListRef}
                  getItemLayout={(data, index) => ({
                    length: ITEM_WIDTH + SPACING,
                    offset: (ITEM_WIDTH + SPACING) * index,
                    index,
                  })}
                  renderItem={({ item, index }) => {
                    const inputRange = [
                      (index - 1) * (ITEM_WIDTH + SPACING),
                      index * (ITEM_WIDTH + SPACING),
                      (index + 1) * (ITEM_WIDTH + SPACING),
                    ];

                    const scale = scrollX.interpolate({
                      inputRange,
                      outputRange: [0.8, 1.25, 0.8],
                      extrapolate: 'clamp',
                    });

                    const translateY = scrollX.interpolate({
                      inputRange,
                      outputRange: [15, -15, 15],
                      extrapolate: 'clamp',
                    });

                    const opacity = scrollX.interpolate({
                      inputRange,
                      outputRange: [0.7, 1, 0.7],
                      extrapolate: 'clamp',
                    });

                    const isSelected = selectedStyle === item.label;

                    return (
                      <Animated.View
                        style={{
                          width: ITEM_WIDTH,
                          marginHorizontal: SPACING / 2,
                          transform: [{ scale }, { translateY }],
                          opacity,
                          position: 'relative',
                        }}
                      >
                        {isSelected && (
                          <>
                            <View style={styles.cardBloomFar} pointerEvents="none" />
                            <View style={styles.cardBloomMid} pointerEvents="none" />
                            <View style={styles.cardBorderGlow} pointerEvents="none" />
                            <View style={styles.cardFloorGlow} pointerEvents="none" />
                          </>
                        )}

                        <TouchableOpacity
                          style={[styles.styleCard, isSelected && styles.styleCardSelected]}
                          onPress={() => handleSelectStyle(item.label, index)}
                          activeOpacity={0.9}
                        >
                          <Image
                            source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                            style={styles.styleCardImage}
                            resizeMode="cover"
                          />

                          {isSelected && (
                            <View style={styles.styleCardTopReflection} pointerEvents="none" />
                          )}

                          <View style={[styles.styleCardContent, isSelected && { backgroundColor: 'transparent' }]}>
                            <Text style={[styles.styleCardLabel, isSelected && styles.styleCardLabelSelected]}>
                              {item.label}
                            </Text>
                          </View>

                          {isSelected && (
                            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
                              <View style={styles.selectedOverlayContent}>
                                <View style={styles.styleCardCheck}>
                                  <View style={styles.styleCardCheckInner} />
                                </View>
                              </View>
                            </BlurView>
                          )}
                        </TouchableOpacity>
                      </Animated.View>
                    );
                  }}
                />
              )}
            </View>
          </View>
        )}

        {/* Prompt Section */}
        {/* Extra top padding so NeonButton glow isn't clipped by parent */}
        <View style={{ marginBottom: 60, overflow: 'visible' }}>
          <Text style={styles.sectionTitle}>Précisez votre besoin</Text>

          <View style={styles.promptContainer}>
            <TextInput
              style={styles.promptInput}
              placeholder="Ex: Une offre spéciale pour la Saint-Valentin..."
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              multiline
              value={localQuery}
              onChangeText={setLocalQuery}
            />
          </View>

          {/* Wrapper with vertical padding so neon floor glow isn't clipped */}
          <View style={{ paddingBottom: 40, overflow: 'visible' }}>
            <NeonButton
              title="Démarrer la création"
              onPress={handleCreate}
              variant="premium"
              size="lg"
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </View>

      <GenericModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </GuidedScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 6,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breadcrumbJob: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  promptContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 120,
    padding: 16,
    marginBottom: 24,
  },
  promptInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  uploadButton: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  uploadHint: {
    fontSize: 12,
    color: colors.text.muted,
  },
  imagePreviewContainer: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeImageButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  changeImageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
  },
  changeImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Style Card ──────────────────────────────────────────────────────────────

  // Card body — overflow hidden pour clipper image et overlay
  styleCard: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    height: 140,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },

  styleCardSelected: {
    borderWidth: 2,
    borderColor: '#1e9bff',
  },

  styleCardImage: {
    width: '100%',
    height: '100%',
  },

  // Reflet lumineux bleu en haut de la carte sélectionnée
  styleCardTopReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(80, 170, 255, 0.15)',
  },

  styleCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  styleCardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },

  styleCardLabelSelected: {
    color: '#ffffff',
    fontWeight: '800',
  },

  styleCardCheck: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },

  styleCardCheckInner: {
    width: 14,
    height: 9,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }, { translateY: -2 }],
  },

  selectedOverlayContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 100, 255, 0.08)',
  },

  // ── Neon glow layers pour styleCard (dans l'Animated.View, hors du card clippé) ──

  cardBorderGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 16,
    backgroundColor: 'transparent',
    shadowColor: '#1a8fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 14,
  },

  cardBloomMid: {
    position: 'absolute',
    top: -4, left: -4, right: -4, bottom: -4,
    borderRadius: 20,
    backgroundColor: 'transparent',
    shadowColor: '#0f60e0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },

  cardBloomFar: {
    position: 'absolute',
    top: -8, left: -8, right: -8, bottom: -8,
    borderRadius: 24,
    backgroundColor: 'transparent',
    shadowColor: '#0840bb',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
    elevation: 4,
  },

  cardFloorGlow: {
    position: 'absolute',
    bottom: -28,
    alignSelf: 'center',
    width: 160,
    height: 36,
    borderRadius: 50,
    backgroundColor: 'transparent',
    shadowColor: '#1a6fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 22,
    elevation: 18,
  },
  categoryChipsScroll: {
    marginHorizontal: -20,
    marginBottom: 20,
  },
  categoryChipsContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  categoryChipActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.muted,
  },
  categoryChipTextActive: {
    color: 'white',
  },
  modelsScroll: {
    marginHorizontal: -20,
  },
  modelsScrollContainer: {
    paddingHorizontal: 20,
  },
  modelsGrid: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    height: 380, // Height for 2 rows of 180px cards + gap
    gap: 12,
    marginTop: 8,
  },
  modelCard: {
    width: 156,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  modelCardSelected: {
    borderColor: '#1e9bff',
  },
  modelCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.6,
  },
  modelCardOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modelCardName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  modelCardActiveBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1e9bff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1e9bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyModelsContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderStyle: 'dashed',
    gap: 10,
  },
  emptyModelsText: {
    color: colors.text.muted,
    fontSize: 14,
    fontWeight: '500',
  },
});