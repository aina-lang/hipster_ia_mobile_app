import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated as RNAnimated,
  Dimensions,
  StyleSheet,
  Image,
  Modal,
  Platform,
  ActivityIndicator,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, SlideInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { useCreationStore } from '../../store/creationStore';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';
import { NeonActionButton } from '../../components/ui/NeonActionButton';
import { NeonBorderInput } from '../../components/ui/NeonBorderInput';
import { BlurView } from 'expo-blur';
import { ChevronRight, Upload, X, Check, Search, Moon, Sparkles } from 'lucide-react-native';
import illus2 from '../../assets/illus2.jpeg';
import illus3 from '../../assets/illus3.jpeg';
import illus4 from '../../assets/illus4.jpeg';
import { FLYER_CATEGORIES as LOCAL_FLYER_CATEGORIES, getFlyerCategoryAssets, FlyerCategory } from '../../constants/flyerAssets';
import { useRef, useState, useCallback, useEffect } from 'react';
import { GenericModal, ModalType, ThemedNeonBorder } from '../../components/ui/GenericModal';
import { AiService } from '../../api/ai.service';

const NEON_BLUE = colors.neonBlue;
const NEON_BLUE_DARK = colors.neonBlueDark;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_W_GRID = (SCREEN_WIDTH - 48 - 8) / 2;
const STYLE_CARD_W = (SCREEN_WIDTH - 48 - 12) / 2;

const VISUAL_STYLES = [
  { label: 'Noir Dominance', description: 'Noir & blanc luxe', image: illus2, color: '#ffffff' },
  { label: 'Digital Drift', description: 'Impact fort', image: illus3, color: '#FF1744' },
  { label: 'Smoke', description: 'Épuré & moderne', image: illus4, color: '#1A73E8' },
];

function StyleNeonBorderCard({
  children,
  isSelected,
  color,
}: {
  children: React.ReactNode;
  isSelected: boolean;
  color?: string;
}) {
  const translateX = useRef(new RNAnimated.Value(0)).current;
  const loopRef = useRef<RNAnimated.CompositeAnimation | null>(null);
  const safeColor = color || colors.neon.primary;

  useEffect(() => {
    loopRef.current?.stop();
    if (isSelected) {
      translateX.setValue(0);
      loopRef.current = RNAnimated.loop(
        RNAnimated.timing(translateX, {
          toValue: -STYLE_CARD_W,
          duration: 3000,
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
  }, [isSelected, safeColor]);

  return (
    <View style={neonStyles.wrapper}>
      {isSelected && (
        <View style={neonStyles.clip} pointerEvents="none">
          <RNAnimated.View style={[neonStyles.track, { transform: [{ translateX }] }]}>
            <LinearGradient
              colors={['transparent', safeColor, safeColor, 'transparent', 'transparent', safeColor, safeColor, 'transparent']}
              locations={[0.05, 0.2, 0.3, 0.45, 0.55, 0.7, 0.8, 0.95]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ width: STYLE_CARD_W * 2, height: '100%' }}
            />
          </RNAnimated.View>
          <View style={[neonStyles.mask, { backgroundColor: '#030814' }]} />
        </View>
      )}
      {children}
    </View>
  );
}

function StyleCard({
  item,
  isSelected,
  onPress,
}: {
  item: { label: string; description: string; image: any; color?: string };
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const themeColor = item.color || colors.neon.primary;

  const handlePress = () => {
    onPress();
  };

  return (
    <Animated.View style={[{ width: STYLE_CARD_W }, animatedStyle]}>
      <TouchableOpacity
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        onPress={handlePress}
        activeOpacity={0.9}
        style={{ width: STYLE_CARD_W }}
      >
        <StyleNeonBorderCard isSelected={isSelected} color={themeColor}>
          <View style={[styles.styleCard, isSelected && styles.styleCardSelected]}>
            <View style={styles.imageContainer}>
              <Image
                source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                style={styles.cardImage}
                resizeMode="cover"
              />
              {isSelected && (
                <View style={[styles.selectedBadge, { backgroundColor: themeColor === '#ffffff' ? '#000000' : themeColor }]}>
                  <View style={styles.selectedDot} />
                </View>
              )}
            </View>
            <View style={[
              styles.textZone,
              isSelected && {
                backgroundColor: `${themeColor}18`,
                borderTopColor: `${themeColor}66`,
              },
            ]}>
              <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]} numberOfLines={1}>{item.label}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
            </View>
          </View>
        </StyleNeonBorderCard>
      </TouchableOpacity>
    </Animated.View>
  );
}

const neonStyles = StyleSheet.create({
  wrapper: { position: 'relative', marginBottom: 2 },
  clip: { position: 'absolute', top: -1, left: -1, right: -1, bottom: -0.5, borderRadius: 21, overflow: 'hidden', zIndex: 2 },
  track: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  mask: { position: 'absolute', top: 1, left: 1, right: 1, bottom: 0.5, borderRadius: 20, zIndex: 1 },
});

function CategoryTabs({
  categories,
  selectedId,
  onSelect,
}: {
  categories: FlyerCategory[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const tabWidths = useRef<Record<string, number>>({});
  const tabOffsets = useRef<Record<string, number>>({});
  const slideX = useRef(new RNAnimated.Value(0)).current;
  const slideW = useRef(new RNAnimated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [ready, setReady] = useState(false);

  const animateTo = useCallback(
    (id: string, scroll = true) => {
      const x = tabOffsets.current[id] ?? 0;
      const w = tabWidths.current[id] ?? 0;
      RNAnimated.parallel([
        RNAnimated.spring(slideX, { toValue: x, useNativeDriver: false, stiffness: 260, damping: 24 }),
        RNAnimated.spring(slideW, { toValue: w, useNativeDriver: false, stiffness: 260, damping: 24 }),
      ]).start();
      if (scroll) scrollRef.current?.scrollTo({ x: Math.max(0, x - 16), animated: true });
    },
    [slideX, slideW]
  );

  return (
    <View style={tabStyles.wrapper}>
      <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={tabStyles.scroll}>
        {ready && (
          <Animated.View pointerEvents="none" style={[tabStyles.indicator, { left: slideX, width: slideW }]} />
        )}
        {categories.map((cat) => {
          const isActive = cat.id === selectedId;
          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.75}
              onLayout={(e) => {
                const { width, x } = e.nativeEvent.layout;
                tabWidths.current[cat.id] = width;
                tabOffsets.current[cat.id] = x;
                const allMeasured = categories.every((c) => tabWidths.current[c.id] !== undefined);
                if (allMeasured && !ready) {
                  slideX.setValue(tabOffsets.current[selectedId] ?? 0);
                  slideW.setValue(tabWidths.current[selectedId] ?? 0);
                  setReady(true);
                }
                if (cat.id === selectedId && ready) animateTo(cat.id, false);
              }}
              onPress={() => { onSelect(cat.id); animateTo(cat.id); }}
              style={tabStyles.tab}
            >
              {cat.icon && typeof cat.icon !== 'string' ? (
                <cat.icon size={14} color={isActive ? colors.primary.main : 'rgba(255,255,255,0.45)'} />
              ) : (
                <Moon size={14} color={isActive ? colors.primary.main : 'rgba(255,255,255,0.45)'} />
              )}
              <Text style={[tabStyles.label, isActive && tabStyles.labelActive]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  scroll: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 2, paddingBottom: 2, gap: 4, position: 'relative' },
  indicator: { position: 'absolute', bottom: 0, height: '100%', borderRadius: 12, backgroundColor: 'rgba(30,155,255,0.15)', borderWidth: 1.5, borderColor: 'rgba(30,155,255,0.45)', zIndex: 0 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 9, paddingHorizontal: 14, borderRadius: 12, zIndex: 1 },
  label: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.45)' },
  labelActive: { color: '#fff', fontWeight: '700' },
});

function ModelGridItem({
  modelLabel,
  modelImage,
  isSelected,
  onPress,
}: {
  modelLabel: string;
  modelImage: any;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.flyerGridItem, isSelected && styles.flyerGridItemSelected]}
      onPress={onPress}
    >
      <Image source={modelImage} style={styles.flyerGridImage} />
      {isSelected && (
        <View style={styles.styleCardCheckBadge}>
          <Check size={10} color="white" strokeWidth={3} />
        </View>
      )}
      <View style={styles.flyerGridOverlay}>
        <Text style={styles.flyerGridName} numberOfLines={2}>{modelLabel}</Text>
      </View>
    </TouchableOpacity>
  );
}

function AllModelsModal({
  visible,
  selectedStyle,
  activeCategoryId,
  onCategoryChange,
  onSelect,
  onClose,
  categories,
}: {
  visible: boolean;
  selectedStyle: string | null;
  activeCategoryId: string;
  onCategoryChange: (id: string) => void;
  onSelect: (categoryId: string, modelLabel: string) => void;
  onClose: () => void;
  categories: FlyerCategory[];
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const isSearching = searchQuery.trim().length > 0;

  const searchResults = isSearching
    ? categories.flatMap((cat) =>
        cat.models
          .filter((m) => m.label.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((m) => ({ cat, model: m }))
      )
    : [];

  const activeCat = categories.find((c) => c.id === activeCategoryId) || categories[0];
  const handleClose = () => { setSearchQuery(''); onClose(); };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
        <BlurView intensity={95} tint="dark" style={StyleSheet.absoluteFill}>
          <ThemedNeonBorder color={colors.neon.primary} style={{ flex: 1, width: '100%' }}>
            <View style={modalStyles.container}>
              <View style={modalStyles.header}>
                <View>
                  <Text style={modalStyles.title}>Tous les modèles</Text>
                  <Text style={modalStyles.subtitle}>
                    {isSearching ? `${searchResults.length} résultat${searchResults.length !== 1 ? 's' : ''}` : activeCat?.label}
                  </Text>
                </View>
                <TouchableOpacity onPress={handleClose} style={modalStyles.closeBtn}>
                  <X size={24} color="white" />
                </TouchableOpacity>
              </View>

              <View style={modalStyles.searchBar}>
                <Search size={18} color="rgba(255,255,255,0.4)" />
                <TextInput
                  style={modalStyles.searchInput}
                  placeholder="Rechercher un modèle..."
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <X size={16} color="rgba(255,255,255,0.4)" />
                  </TouchableOpacity>
                )}
              </View>

              {!isSearching && (
                <CategoryTabs categories={categories} selectedId={activeCategoryId} onSelect={onCategoryChange} />
              )}

              <ScrollView key={isSearching ? 'search' : activeCategoryId} contentContainerStyle={modalStyles.scrollContent} showsVerticalScrollIndicator={false}>
                {isSearching ? (
                  searchResults.length === 0 ? (
                    <View style={modalStyles.empty}>
                      <Text style={modalStyles.emptyText}>Aucun modèle ne correspond</Text>
                    </View>
                  ) : (
                    categories.map((cat) => {
                      const hits = searchResults.filter((r) => r.cat.id === cat.id);
                      if (hits.length === 0) return null;
                      return (
                        <View key={cat.id} style={modalStyles.group}>
                          <View style={modalStyles.groupHeader}>
                            {cat.icon && typeof cat.icon !== 'string' ? (
                              <cat.icon size={16} color={colors.primary.main} />
                            ) : (
                              <Moon size={16} color={colors.primary.main} />
                            )}
                            <Text style={modalStyles.groupLabel}>{cat.label}</Text>
                          </View>
                          <View style={styles.modelsGrid}>
                            {hits.map(({ cat: c, model: m }) => (
                              <ModelGridItem
                                key={m.label}
                                modelLabel={m.label}
                                modelImage={m.image ?? c.image}
                                isSelected={selectedStyle === m.label}
                                onPress={() => { onSelect(c.id, m.label); handleClose(); }}
                              />
                            ))}
                          </View>
                        </View>
                      );
                    })
                  )
                ) : (
                  <View style={styles.modelsGrid}>
                    {activeCat?.models?.map((m) => (
                      <ModelGridItem
                        key={m.label}
                        modelLabel={m.label}
                        modelImage={m.image ?? activeCat?.image}
                        isSelected={selectedStyle === m.label}
                        onPress={() => { onSelect(activeCat?.id || '', m.label); handleClose(); }}
                      />
                    ))}
                  </View>
                )}
              </ScrollView>
            </View>
          </ThemedNeonBorder>
        </BlurView>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 20, zIndex: 3 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: 'white', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: colors.primary.main, fontWeight: '600', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 },
  closeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, paddingHorizontal: 14, marginBottom: 16, height: 48, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  searchInput: { flex: 1, color: 'white', fontSize: 15, height: '100%' },
  scrollContent: { paddingBottom: 80 },
  group: { marginBottom: 24 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, paddingVertical: 4 },
  groupLabel: { fontSize: 13, fontWeight: '800', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: 0.5 },
  empty: { paddingTop: 80, alignItems: 'center' },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 15, textAlign: 'center' },
});

export default function Step4PersonalizeScreen() {
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
  const [categories, setCategories] = useState<FlyerCategory[]>(LOCAL_FLYER_CATEGORIES);
  const [selectedFlyerCategory, setSelectedFlyerCategory] = useState(LOCAL_FLYER_CATEGORIES[0]?.id || '');
  const [showAllModels, setShowAllModels] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const data = await AiService.getFlyerCategories();
        if (data && Array.isArray(data)) {
          const mapped = data.map(cat => {
            const assets = getFlyerCategoryAssets(cat.id, cat.icon);
            return { ...cat, icon: assets.icon, image: assets.image || cat.image };
          });
          setCategories(mapped);
          setSelectedFlyerCategory(mapped[0].id);
        }
      } catch (e) {
        console.error('Failed to load flyer categories:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

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

  const isVisual = selectedCategory === 'Image' || selectedCategory === 'Social' || selectedCategory === 'Document';
  const activeFlyerCategory = categories.find((c) => c.id === selectedFlyerCategory);

  return (
    <GuidedScreenWrapper
      currentStep={1}
      totalSteps={selectedCategory === 'Social' ? 2 : 1}
      scrollViewRef={scrollRef}
      footer={
        selectedCategory === 'Social' && selectedStyle ? (
          <Animated.View entering={SlideInDown.duration(300)} style={styles.footerButtonWrapper}>
            <NeonActionButton
              label="Continuer"
              onPress={() => router.push({
                pathname: '/(guided)/step4-content-customize',
                params: { style: selectedStyle }
              })}
              disabled={!selectedStyle}
            />
          </Animated.View>
        ) : null
      }
    >
      <View style={styles.container}>

        <View style={styles.header}>
          <Text style={styles.headerScript}>Personnalisez</Text>
          <Text style={styles.headerSub}>VOTRE CRÉATION</Text>
          {(selectedJob || selectedFunction) && (
            <View style={styles.breadcrumb}>
              {selectedJob && <Text style={styles.breadcrumbText}>{selectedJob}</Text>}
              {selectedJob && selectedFunction && <ChevronRight size={12} color={colors.text.muted} />}
              {selectedFunction && <Text style={styles.breadcrumbText}>{selectedFunction?.split('(')[0]}</Text>}
            </View>
          )}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary.main} />
            <Text style={styles.loadingText}>Chargement des modèles...</Text>
          </View>
        ) : (
          isVisual && (
            <View style={styles.visualBlock}>

              {selectedCategory !== 'Social' && (
                <>
                  <Text style={styles.sectionLabel}>PHOTO DE RÉFÉRENCE</Text>

                  {uploadedImage ? (
                    <View style={styles.imagePill}>
                      <Image source={{ uri: uploadedImage }} style={styles.imagePillThumb} />
                      <TouchableOpacity onPress={pickImage} style={styles.imagePillText}>
                        <Text style={styles.imagePillLabel} numberOfLines={1}>
                          Changer l'image
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setUploadedImage(null)} style={styles.imagePillRemove}>
                        <View style={styles.iconGlow}>
                          <X size={14} color="white" />
                        </View>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.imagePill} onPress={pickImage}>
                      <View style={styles.iconGlow}>
                        <Upload size={16} color={'#fff'} />
                      </View>
                      <Text style={styles.uploadCompactText}>Ajouter une photo</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}

              {selectedCategory === 'Document' ? (
                <View style={{ marginTop: 20 }}>
                  <Text style={styles.sectionLabel}>MODÈLE DE FLYER</Text>
                  <CategoryTabs
                    categories={categories}
                    selectedId={selectedFlyerCategory}
                    onSelect={setSelectedFlyerCategory}
                  />
                  {activeFlyerCategory && (
                    <View style={styles.modelsGrid}>
                      {activeFlyerCategory?.models?.slice(0, 4).map((modelObj) => (
                        <ModelGridItem
                          key={modelObj.label}
                          modelLabel={modelObj.label}
                          modelImage={modelObj.image ?? activeFlyerCategory?.image}
                          isSelected={selectedStyle === modelObj.label}
                          onPress={() => setStyle(modelObj.label)}
                        />
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View style={{ marginTop: 30 }}>
                  <Text style={styles.sectionLabel}>STYLE ARTISTIQUE</Text>
                  <View style={styles.stylesGrid}>
                    {VISUAL_STYLES.map((item) => (
                      <StyleCard
                        key={item.label}
                        item={item}
                        isSelected={selectedStyle === item.label}
                        onPress={() => setStyle(item.label as any)}
                      />
                    ))}
                  </View>
                </View>
              )}

              {selectedCategory !== 'Social' && (
                <TouchableOpacity style={styles.seeAllButton} onPress={() => setShowAllModels(true)} activeOpacity={0.7}>
                  <Text style={styles.seeAllText}>Voir tous les modèles</Text>
                  <ChevronRight size={16} color={colors.primary.main} />
                </TouchableOpacity>
              )}

            </View>
          )
        )}

        {selectedCategory !== 'Social' && (
          <View style={styles.ctaWrapper}>
            <NeonActionButton
              label="Démarrer la création"
              onPress={handleCreate}
              icon={<Sparkles size={16} color="#ffffff" />}
              small={false}
              loading={false}
              disabled={false}
            />
          </View>
        )}

      </View>

      <GenericModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />

      <AllModelsModal
        visible={showAllModels}
        selectedStyle={selectedStyle}
        activeCategoryId={selectedFlyerCategory}
        categories={categories}
        onCategoryChange={setSelectedFlyerCategory}
        onSelect={(catId, modelLabel) => { setSelectedFlyerCategory(catId); setStyle(modelLabel); }}
        onClose={() => setShowAllModels(false)}
      />
    </GuidedScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  loadingContainer: {
    paddingVertical: 100,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fonts.arimo.bold,
    fontSize: 14,
  },
  header: {
    alignItems: 'center',
    paddingTop: 0,
    marginBottom: 28,
  },
  headerScript: {
    fontFamily: 'Brittany-Signature',
    fontSize: 42,
    color: '#ffffff',
    paddingVertical: 15,
    textShadowColor: NEON_BLUE,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
  headerSub: {
    fontFamily: fonts.arimo.bold,
    fontSize: 13,
    letterSpacing: 3,
    color: colors.gray,
    marginBottom: 8,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
    marginTop: 4,
  },
  breadcrumbText: {
    fontFamily: fonts.arimo.regular,
    fontSize: 12,
    color: colors.text.muted,
  },
  sectionLabel: {
    fontFamily: fonts.arimo.bold,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.gray,
    marginBottom: 15,
    textTransform: 'uppercase',
  },
  visualBlock: {
    marginBottom: 24,
  },
  stylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stylesScrollContent: {
    gap: 12,
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
  styleCard: {
    width: STYLE_CARD_W,
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    zIndex: 3,
  },
  styleCardSelected: {
    backgroundColor: '#030814',
    borderWidth: 0,
  },
  imageContainer: {
    height: 220,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
  },
  selectedDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#fff',
  },
  styleCardCheckBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: '#293c68e6',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: colors.neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  textZone: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(10,12,18,0.85)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    height: 70,
  },
  cardTitle: {
    fontFamily: fonts.arimo.bold,
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  cardTitleSelected: {
    color: '#ffffff',
  },
  cardDescription: {
    fontFamily: fonts.arimo.regular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
    lineHeight: 14,
  },
  modelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flyerGridItem: {
    width: CARD_W_GRID,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    position: 'relative',
  },
  flyerGridItemSelected: {
    borderColor: NEON_BLUE,
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
    fontFamily: fonts.arimo.bold,
    fontSize: 11,
    color: '#fff',
    lineHeight: 14,
  },
  ctaWrapper: {
    paddingBottom: 20,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 8,
    backgroundColor: 'rgba(30,155,255,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(30,155,255,0.15)',
  },
  seeAllText: {
    fontFamily: fonts.arimo.bold,
    color: colors.primary.main,
    fontSize: 14,
  },
  uploadCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(30,155,255,0.06)',
  },
  iconGlow: {
    shadowColor: colors.neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadCompactText: {
    fontSize: 13,
    fontWeight: '600',
    padding: 8,
    fontFamily: 'Arimo-Regular',
    color: '#fff',
    textShadowColor: NEON_BLUE,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
    elevation: 3,
  },
  imagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.darkSlateBlue,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    maxWidth: 200,
    gap: 10,
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
    fontFamily: fonts.arimo.bold,
    fontSize: 12,
    color: '#fff',
    textShadowColor: NEON_BLUE,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
    elevation: 3,
  },
  imagePillRemove: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  footerButtonWrapper: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: 'transparent',
  },
});