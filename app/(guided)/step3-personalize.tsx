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
import { useRef, useState } from 'react';
import { GenericModal, ModalType } from 'components/ui/GenericModal';

const VISUAL_STYLES = [
  { label: 'Premium', description: 'Noir & blanc luxe', image: illus2 },
  { label: 'Hero Studio', description: 'Impact fort', image: illus3 },
  { label: 'Minimal', description: 'Épuré & moderne', image: illus4 },
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
              /* Flyer models: flat list with section headers — no category tap needed */
              <View style={{ marginTop: 16 }}>
                <Text style={styles.label}>Modèle de flyer</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.flyerScroll}
                >
                  {FLYER_CATEGORIES.map((cat) =>
                    cat.models.map((modelObj) => {
                      const modelLabel =
                        typeof modelObj === 'string' ? modelObj : modelObj.label;
                      const modelImage =
                        typeof modelObj === 'object' && modelObj.image
                          ? modelObj.image
                          : cat.image;
                      const isSelected = selectedStyle === modelLabel;
                      return (
                        <TouchableOpacity
                          key={modelLabel}
                          style={[styles.flyerCard, isSelected && styles.flyerCardSelected]}
                          onPress={() => setStyle(modelLabel)}
                        >
                          <Image source={modelImage} style={styles.flyerCardImage} />
                          {isSelected && (
                            <View style={styles.flyerCardBadge}>
                              <Zap size={10} color="white" />
                            </View>
                          )}
                          <View style={styles.flyerCardOverlay}>
                            <Text style={styles.flyerCardCat}>{cat.label}</Text>
                            <Text style={styles.flyerCardName} numberOfLines={2}>
                              {modelLabel}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              </View>
            ) : (
              /* Visual styles: 3 cards side by side — no scroll needed */
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

  // ── Flyer cards (horizontal scroll) ──────────────────────────────────────────
  flyerScroll: {
    gap: 10,
    paddingBottom: 4,
  },
  flyerCard: {
    width: 120,
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
  },
  flyerCardSelected: {
    borderColor: '#1e9bff',
  },
  flyerCardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    opacity: 0.55,
  },
  flyerCardOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 10,
  },
  flyerCardCat: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  flyerCardName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 15,
  },
  flyerCardBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1e9bff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
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