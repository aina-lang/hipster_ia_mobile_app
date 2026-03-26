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
  Modal,
  FlatList,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
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
import { GenericModal, ModalType } from 'components/ui/GenericModal';
import { AiService } from '../../api/ai.service';

const NEON_BLUE = colors.neonBlue;
const NEON_BLUE_DARK = colors.neonBlueDark;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_W_GRID = (SCREEN_WIDTH - 48 - 8) / 2;
const CAROUSEL_ITEM_WIDTH = SCREEN_WIDTH * 0.75;
const CAROUSEL_SPACING = (SCREEN_WIDTH - CAROUSEL_ITEM_WIDTH) / 2;

const VISUAL_STYLES = [
  { label: 'Premium', description: 'Noir & blanc luxe', image: illus2 },
  { label: 'Hero', description: 'Impact fort', image: illus3 },
  { label: 'Minimal', description: 'Épuré & moderne', image: illus4 },
];

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
  const slideX = useRef(new Animated.Value(0)).current;
  const slideW = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [ready, setReady] = useState(false);

  const animateTo = useCallback(
    (id: string, scroll = true) => {
      const x = tabOffsets.current[id] ?? 0;
      const w = tabWidths.current[id] ?? 0;
      Animated.parallel([
        Animated.spring(slideX, { toValue: x, useNativeDriver: false, stiffness: 260, damping: 24 }),
        Animated.spring(slideW, { toValue: w, useNativeDriver: false, stiffness: 260, damping: 24 }),
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
      {isSelected && (
        <>
          <View style={styles.cardBorderGlow} pointerEvents="none" />
          <View style={styles.cardBloom} pointerEvents="none" />
        </>
      )}
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
        </BlurView>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  container: { flex: 1, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 20 },
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

function StyleCarousel({
  styles: items,
  selectedStyle,
  onSelect,
}: {
  styles: any[];
  selectedStyle: string | null;
  onSelect: (style: string) => void;
}) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const centerOnIndex = (index: number) => {
    const offset = index * (CAROUSEL_ITEM_WIDTH + 14);
    flatListRef.current?.scrollToOffset({ offset, animated: true });
  };

  // Trouver l'index du style sélectionné
  const getSelectedIndex = useCallback(() => {
    if (!selectedStyle) return 0;
    const index = items.findIndex(item => item.label === selectedStyle);
    return index >= 0 ? index : 0;
  }, [items, selectedStyle]);

  // Centrer sur l'élément sélectionné au montage et quand la sélection change
  useEffect(() => {
    if (!isInitialized) {
      // Petit délai pour s'assurer que le FlatList est prêt
      const timer = setTimeout(() => {
        const selectedIndex = getSelectedIndex();
        centerOnIndex(selectedIndex);
        setIsInitialized(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      const selectedIndex = getSelectedIndex();
      centerOnIndex(selectedIndex);
    }
  }, [selectedStyle, getSelectedIndex, isInitialized]);

  return (
    <View style={carouselStyles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CAROUSEL_ITEM_WIDTH + 14}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: CAROUSEL_SPACING, paddingVertical: 10 }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: true })}
        onMomentumScrollEnd={(e) => {
          const x = e.nativeEvent.contentOffset.x;
          const index = Math.round(x / (CAROUSEL_ITEM_WIDTH + 14));
          if (items[index] && items[index].label !== selectedStyle) {
            onSelect(items[index].label);
          }
        }}
        renderItem={({ item, index }) => {
          const isSelected = selectedStyle === item.label;
          const inputRange = [
            (index - 1) * (CAROUSEL_ITEM_WIDTH + 14),
            index * (CAROUSEL_ITEM_WIDTH + 14),
            (index + 1) * (CAROUSEL_ITEM_WIDTH + 14),
          ];
          const scale = scrollX.interpolate({ inputRange, outputRange: [0.92, 1, 0.92], extrapolate: 'clamp' });
          const opacity = scrollX.interpolate({ inputRange, outputRange: [0.6, 1, 0.6], extrapolate: 'clamp' });

          return (
            <Animated.View style={{ transform: [{ scale }], opacity }}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => { 
                  onSelect(item.label); 
                  centerOnIndex(index); 
                }}
                style={[
                  styles.styleCard,
                  { width: CAROUSEL_ITEM_WIDTH, aspectRatio: 1.4, marginRight: 14 },
                  isSelected && styles.styleCardSelected,
                ]}
              >
                {isSelected && (
                  <>
                    <View style={styles.cardBorderGlow} pointerEvents="none" />
                    <View style={styles.cardBloom} pointerEvents="none" />
                  </>
                )}
                <Image
                  source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                  style={styles.styleCardImage}
                  resizeMode="cover"
                />
                {isSelected && (
                  <View style={styles.styleCardCheckBadge}>
                    <Check size={10} color="white" strokeWidth={3} />
                  </View>
                )}
                <View style={[styles.styleCardFooter, isSelected && styles.styleCardFooterSelected]}>
                  <Text style={styles.styleCardLabel}>{item.label}</Text>
                  <Text style={styles.styleCardDesc}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        }}
      />
    </View>
  );
}

const carouselStyles = StyleSheet.create({
  container: { marginHorizontal: -24, marginBottom: 8 },
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
  const [promptFocused, setPromptFocused] = useState(false);
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
    <GuidedScreenWrapper currentStep={3} totalSteps={4} scrollViewRef={scrollRef}>
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

              <Text style={styles.sectionLabel}>PHOTO DE RÉFÉRENCE</Text>
              
              {uploadedImage ? (
                <View style={styles.imagePillLarge}>
                  <Image source={{ uri: uploadedImage }} style={styles.imageThumbLarge} />
                  <TouchableOpacity onPress={pickImage} style={styles.imagePillTextLarge}>
                    <Text style={styles.imagePillLabel} numberOfLines={1}>Changer l'image</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setUploadedImage(null)} style={styles.imagePillRemoveLarge}>
                    <X size={14} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.uploadLarge} onPress={pickImage}>
                  <Upload size={20} color={colors.text.muted} />
                  <Text style={styles.uploadLargeText}>Ajouter une photo</Text>
                  <Text style={styles.uploadLargeSub}>JPG, PNG ou WebP</Text>
                </TouchableOpacity>
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
                <View style={{ marginTop: 20 }}>
                  <Text style={styles.sectionLabel}>STYLE ARTISTIQUE</Text>
                  {selectedCategory === 'Social' ? (
                    <StyleCarousel styles={VISUAL_STYLES} selectedStyle={selectedStyle} onSelect={(s) => setStyle(s as any)} />
                  ) : (
                    <View style={styles.stylesRow}>
                      {VISUAL_STYLES.map((item) => {
                        const isSelected = selectedStyle === item.label;
                        return (
                          <TouchableOpacity
                            key={item.label}
                            style={[styles.styleCard, isSelected && styles.styleCardSelected, { height: 160 }]}
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
                              source={typeof item.image === 'string' ? { uri: item.image } : item.image}
                              style={styles.styleCardImage}
                              resizeMode="cover"
                            />
                            {isSelected && (
                              <View style={styles.styleCardCheckBadge}>
                                <Check size={10} color="white" strokeWidth={3} />
                              </View>
                            )}
                            <View style={[styles.styleCardFooter, isSelected && styles.styleCardFooterSelected]}>
                              <Text style={styles.styleCardLabel}>{item.label}</Text>
                              <Text style={styles.styleCardDesc}>{item.description}</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
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

        <View style={styles.promptBlock}>
          <Text style={styles.sectionLabel}>PRÉCISEZ VOTRE BESOIN</Text>
          <NeonBorderInput isActive={promptFocused}>
            <TextInput
              style={[styles.promptInput, promptFocused && styles.promptInputFocused]}
              placeholder="Ex: Une offre spéciale pour la Saint-Valentin..."
              placeholderTextColor="rgba(255,255,255,0.25)"
              multiline
              value={localQuery}
              onChangeText={setLocalQuery}
              onFocus={() => setPromptFocused(true)}
              onBlur={() => setPromptFocused(false)}
            />
          </NeonBorderInput>
        </View>

        <View style={styles.ctaWrapper}>
          <NeonActionButton
            label="Démarrer la création"
            onPress={handleCreate}
            icon={<Sparkles size={16} color="#ffffff" />}
            small={false}
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
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  visualBlock: {
    marginBottom: 24,
  },
  uploadLarge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(0,212,255,0.2)',
    borderStyle: 'dashed',
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadLargeText: {
    fontFamily: fonts.arimo.bold,
    fontSize: 14,
    color: colors.text.muted,
    marginTop: 8,
  },
  uploadLargeSub: {
    fontFamily: fonts.arimo.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
  },
  imagePillLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 20,
  },
  imageThumbLarge: {
    width: 60,
    height: 60,
    resizeMode: 'cover',
  },
  imagePillTextLarge: {
    flex: 1,
    paddingHorizontal: 12,
  },
  imagePillLabel: {
    fontFamily: fonts.arimo.bold,
    fontSize: 12,
    color: colors.text.primary,
  },
  imagePillRemoveLarge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 58, 48, 0.9)',
    marginRight: 8,
  },
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
    backgroundColor: 'rgba(193, 31, 31, 0.04)',
    position: 'relative',
  },
  styleCardSelected: {
    borderColor: colors.text.muted
  },
  styleCardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    position: 'absolute',
  },
  styleCardFooter: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginTop: 'auto',
  },
  styleCardFooterSelected: {
    backgroundColor: colors.darkSlateBlue,
  },
  styleCardLabel: {
    fontFamily: fonts.arimo.bold,
    fontSize: 12,
    color: '#fff',
    marginBottom: 1,
  },
  styleCardDesc: {
    fontFamily: fonts.arimo.regular,
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
    backgroundColor: colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cardBorderGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 14,
    backgroundColor: 'transparent',
    shadowColor: NEON_BLUE,
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
  promptBlock: {
    marginBottom: 20,
  },
  promptInput: {
    backgroundColor: colors.darkSlateBlue,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    minHeight: 100,
    padding: 14,
    fontFamily: fonts.arimo.regular,
    fontSize: 14,
    color: colors.text.primary,
    textAlignVertical: 'top',
    zIndex: 3,
  },
  promptInputFocused: {
    borderColor: 'transparent',
    backgroundColor: colors.midnightBlue,
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
});