import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
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
import { SelectionCard } from '../../components/ui/SelectionCard';
import { BlurView } from 'expo-blur';
import { ChevronRight, Upload, X, Zap, Check } from 'lucide-react-native';

import illus2 from '../../assets/illus2.jpeg';
import illus3 from '../../assets/illus3.jpeg';
import illus4 from '../../assets/illus4.jpeg';
import { FLYER_CATEGORIES } from '../../constants/flyerModels';
import { useRef, useState, useCallback } from 'react';
import { GenericModal, ModalType } from 'components/ui/GenericModal';

const VISUAL_STYLES = [
  { label: 'Premium', description: 'Noir & blanc luxe', image: illus2 },
  { label: 'Hero Studio', description: 'Impact fort', image: illus3 },
  { label: 'Minimal', description: 'Épuré & moderne', image: illus4 },
];

// ─── Animated category tab bar ────────────────────────────────────────────────
function CategoryTabs({
  categories,
  selectedId,
  onSelect,
}: {
  categories: typeof FLYER_CATEGORIES;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const tabWidths = useRef<Record<string, number>>({});
  const tabOffsets = useRef<Record<string, number>>({});
  const slideX = useRef(new Animated.Value(0)).current;
  const slideW = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [ready, setReady] = useState(false);

  const animateTo = useCallback(
    (id: string, scroll = true) => {
      const x = tabOffsets.current[id] ?? 0;
      const w = tabWidths.current[id] ?? 0;

      Animated.parallel([
        Animated.spring(slideX, {
          toValue: x,
          useNativeDriver: false,
          stiffness: 260,
          damping: 24,
        }),
        Animated.spring(slideW, {
          toValue: w,
          useNativeDriver: false,
          stiffness: 260,
          damping: 24,
        }),
      ]).start();

      if (scroll) {
        scrollRef.current?.scrollTo({ x: Math.max(0, x - 16), animated: true });
      }
    },
    [slideX, slideW]
  );

  return (
    <View style={tabStyles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tabStyles.scroll}
      >
        {/* Sliding pill indicator */}
        {ready && (
          <Animated.View
            pointerEvents="none"
            style={[
              tabStyles.indicator,
              {
                left: slideX,
                width: slideW,
              },
            ]}
          />
        )}

        {categories.map((cat, index) => {
          const isActive = cat.id === selectedId;
          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.75}
              onLayout={(e) => {
                const { width, x } = e.nativeEvent.layout;
                tabWidths.current[cat.id] = width;
                tabOffsets.current[cat.id] = x;

                // Initialize position on first render for the default selected tab
                const allMeasured = categories.every(
                  (c) => tabWidths.current[c.id] !== undefined
                );
                if (allMeasured && !ready) {
                  const initX = tabOffsets.current[selectedId] ?? 0;
                  const initW = tabWidths.current[selectedId] ?? 0;
                  slideX.setValue(initX);
                  slideW.setValue(initW);
                  setReady(true);
                }

                // Re-animate if this is the currently selected tab
                if (cat.id === selectedId && ready) {
                  animateTo(cat.id, false);
                }
              }}
              onPress={() => {
                onSelect(cat.id);
                animateTo(cat.id);
              }}
              style={tabStyles.tab}
            >
              <cat.icon
                size={14}
                color={isActive ? colors.primary.main : 'rgba(255,255,255,0.45)'}
              />
              <Text style={[tabStyles.label, isActive && tabStyles.labelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  scroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingBottom: 2,
    gap: 4,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: '100%',
    borderRadius: 12,
    backgroundColor: 'rgba(30,155,255,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(30,155,255,0.45)',
    zIndex: 0,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    zIndex: 1,
  },
  icon: {
    fontSize: 14,
    lineHeight: 17,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
  },
  labelActive: {
    color: '#fff',
    fontWeight: '700',
  },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
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
  const [selectedFlyerCategory, setSelectedFlyerCategory] = useState(FLYER_CATEGORIES[0].id);

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

  const handleCreate = () => {
    if (
      (selectedCategory === 'Image' || selectedCategory === 'Social' || selectedCategory === 'Document') &&
      !uploadedImage &&
      !selectedStyle
    ) {
      showModal('Choix requis', 'Choisissez un style ou un modèle.', 'warning');
      return;
    }
    setQuery(localQuery);
    router.push('/(guided)/step4-result');
  };

  const isVisual =
    selectedCategory === 'Image' ||
    selectedCategory === 'Social' ||
    selectedCategory === 'Document';

  const activeFlyerCategory = FLYER_CATEGORIES.find((c) => c.id === selectedFlyerCategory);

  return (
    <GuidedScreenWrapper scrollViewRef={scrollRef} footer={null}>
      <View style={styles.container}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Personnalisez</Text>
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbText}>{selectedJob}</Text>
            <ChevronRight size={12} color={colors.text.muted} />
            <Text style={styles.breadcrumbText}>{selectedFunction?.split('(')[0]}</Text>
          </View>
        </View>

        {/* ── Visual Block ── */}
        {isVisual && (
          <View style={styles.visualBlock}>

            {/* ── Image Upload — compact row ── */}
            <View style={styles.row}>
              <Text style={styles.label}>Photo de référence</Text>
              {uploadedImage ? (
                <View style={styles.imagePill}>
                  <Image source={{ uri: uploadedImage }} style={styles.imagePillThumb} />
                  <TouchableOpacity onPress={pickImage} style={styles.imagePillText}>
                    <Text style={styles.imagePillLabel} numberOfLines={1}>
                      Changer l'image
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setUploadedImage(null)} style={styles.imagePillRemove}>
                    <X size={14} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.uploadCompact} onPress={pickImage}>
                  <Upload size={16} color={colors.primary.main} />
                  <Text style={styles.uploadCompactText}>Ajouter une photo</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ── Style / Model selection ── */}
            {selectedCategory === 'Document' ? (
              <View style={{ marginTop: 16 }}>
                <Text style={styles.label}>Modèle de flyer</Text>

                {/* ── Animated tab bar ── */}
                <CategoryTabs
                  categories={FLYER_CATEGORIES}
                  selectedId={selectedFlyerCategory}
                  onSelect={setSelectedFlyerCategory}
                />

                {/* ── Models grid for active category ── */}
                {activeFlyerCategory && (
                  <View style={styles.modelsGrid}>
                    {activeFlyerCategory.models.map((modelObj) => {
                      const modelLabel =
                        typeof modelObj === 'string' ? modelObj : modelObj.label;
                      const modelImage =
                        typeof modelObj === 'object' && modelObj.image
                          ? modelObj.image
                          : activeFlyerCategory.image;
                      const isModelSelected = selectedStyle === modelLabel;
                      return (
                        <TouchableOpacity
                          key={modelLabel}
                          style={[
                            styles.flyerGridItem,
                            isModelSelected && styles.flyerGridItemSelected,
                          ]}
                          onPress={() => setStyle(modelLabel)}
                        >
                          {isModelSelected && (
                            <>
                              <View style={styles.cardBorderGlow} pointerEvents="none" />
                              <View style={styles.cardBloom} pointerEvents="none" />
                            </>
                          )}
                          <Image source={modelImage} style={styles.flyerGridImage} />
                          {isModelSelected && (
                            <View style={styles.styleCardCheckBadge}>
                              <Check size={10} color="white" strokeWidth={3} />
                            </View>
                          )}
                          <View style={styles.flyerGridOverlay}>
                            <Text style={styles.flyerGridName} numberOfLines={2}>
                              {modelLabel}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            ) : (
              /* Visual styles: 3 cards side by side */
              <View style={{ marginTop: 16 }}>
                <Text style={styles.label}>Style artistique</Text>
                <View style={styles.stylesRow}>
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
                        <Image
                          source={
                            typeof item.image === 'string' ? { uri: item.image } : item.image
                          }
                          style={styles.styleCardImage}
                          resizeMode="cover"
                        />
                        {isSelected && (
                          <View style={styles.styleCardCheckBadge}>
                            <Check size={10} color="white" strokeWidth={3} />
                          </View>
                        )}
                        <View
                          style={[
                            styles.styleCardFooter,
                            isSelected && styles.styleCardFooterSelected,
                          ]}
                        >
                          <Text style={styles.styleCardLabel}>{item.label}</Text>
                          <Text style={styles.styleCardDesc}>{item.description}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── Prompt ── */}
        <View style={styles.promptBlock}>
          <Text style={styles.label}>Précisez votre besoin</Text>
          <TextInput
            style={styles.promptInput}
            placeholder="Ex: Une offre spéciale pour la Saint-Valentin..."
            placeholderTextColor="rgba(255,255,255,0.25)"
            multiline
            value={localQuery}
            onChangeText={setLocalQuery}
          />
        </View>

        {/* ── CTA ── */}
        <View style={styles.ctaWrapper}>
          <NeonButton
            title="Démarrer la création"
            onPress={handleCreate}
            variant="premium"
            size="lg"
            style={{ width: '100%' }}
          />
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
  container: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
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
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  breadcrumbText: {
    fontSize: 13,
    color: colors.text.muted,
    fontWeight: '500',
  },

  // ── Section label ────────────────────────────────────────────────────────────
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 10,
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  // ── Visual block ─────────────────────────────────────────────────────────────
  visualBlock: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  // ── Upload compact pill ───────────────────────────────────────────────────────
  uploadCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  uploadCompactText: {
    fontSize: 13,
    color: colors.primary.main,
    fontWeight: '600',
  },
  imagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    maxWidth: 200,
  },
  imagePillThumb: {
    width: 32,
    height: 32,
    resizeMode: 'cover',
  },
  imagePillText: {
    flex: 1,
    paddingHorizontal: 10,
  },
  imagePillLabel: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: '600',
  },
  imagePillRemove: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  // ── 3-col style cards ─────────────────────────────────────────────────────────
  stylesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  styleCard: {
    flex: 1,
    borderRadius: 14,
    overflow: 'visible',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    position: 'relative',
  },
  styleCardSelected: {
    borderColor: '#1e9bff',
  },
  styleCardImage: {
    width: '100%',
    height: 90,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  styleCardFooter: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  styleCardFooterSelected: {
    backgroundColor: 'rgba(30,100,255,0.25)',
  },
  styleCardLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 1,
  },
  styleCardDesc: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 13,
  },
  styleCardCheckBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1e9bff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cardBorderGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 14,
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
    borderRadius: 20,
    backgroundColor: 'transparent',
    shadowColor: '#0840bb',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 4,
    zIndex: -1,
  },

  // ── Flyer grid ───────────────────────────────────────────────────────────────
  modelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flyerGridItem: {
    width: '48%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    position: 'relative',
  },
  flyerGridItemSelected: {
    borderColor: '#1e9bff',
  },
  flyerGridImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.55,
  },
  flyerGridOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 8,
  },
  flyerGridName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 14,
  },

  // ── Prompt ───────────────────────────────────────────────────────────────────
  promptBlock: {
    marginBottom: 20,
  },
  promptInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 100,
    padding: 14,
    fontSize: 15,
    color: colors.text.primary,
    textAlignVertical: 'top',
  },

  // ── CTA ──────────────────────────────────────────────────────────────────────
  ctaWrapper: {
    paddingBottom: 40,
    overflow: 'visible',
  },
});