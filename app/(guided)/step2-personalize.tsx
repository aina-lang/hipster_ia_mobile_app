
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
  KeyboardAvoidingView,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { useCreationStore } from '../../store/creationStore';
import { WORKFLOWS, WorkflowQuestion } from '../../constants/workflows';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';
import { SelectionCard } from '../../components/ui/SelectionCard';
import { NeonButton } from '../../components/ui/NeonButton';
import { BlurView } from 'expo-blur';
import { ChatInput } from '../../components/ChatInput';
import {
  Sparkles,
  ChevronRight,
  Mic,
  Image as LucideImage,
  Paperclip,
  Moon,
  Sun,
  Upload,
  X,
  TrendingUp,
  Gem,
  BookOpen,
  Target,
  GraduationCap,
  Megaphone,
  Gift,
  RotateCcw,
  Handshake,
  Newspaper,
  Zap,
  Trophy,
  Building2,
  ShoppingBag,
  Calendar,
  Mail,
  Heart,
  Plus,
} from 'lucide-react-native';

import illus2 from "../../assets/illus2.jpeg"
import illus3 from "../../assets/illus3.jpeg"
import illus4 from "../../assets/illus4.jpeg"
import { useEffect, useRef, useState } from 'react';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Visual style options
// Visual style options
const VISUAL_STYLES = [
  // Custom Styles
  {
    label: 'Monochrome',
    icon: Moon,
    description: 'Noir & blanc élégant et contrasté.\nIntemporel, artistique, sophistiqué.',
    image: illus2,
  },
  {
    label: 'Hero Studio',
    icon: Sun,
    description: 'Produit mis en scène comme une icône.\nLumière maîtrisée, impact fort.',
    image: illus3,
  },
  {
    label: 'Minimal Studio',
    icon: Sun,
    description: 'Fond clair, composition épurée.\nModerne, haut de gamme, ultra lisible.',
    image: illus4,
  },
  // Stability AI Presets
  {
    label: '3D Model',
    icon: Gem,
    description: 'Rendu 3D net et moderne.\nVolume parfait, textures lisses.',
    image: illus4,
  },
  {
    label: 'Analog Film',
    icon: Sparkles,
    description: 'Grain argentique, couleurs rétro.\nAuthentique, nostalgique, chaleureux.',
    image: illus3,
  },
  {
    label: 'Anime',
    icon: Sparkles,
    description: 'Style animation japonaise vibrant.\nTraits dynamiques, couleurs vives.',
    image: illus2,
  },
  {
    label: 'Cinematic',
    icon: Moon,
    description: 'Ambiance film, lumière dramatique.\nProfondeur de champ, rendu cinéma.',
    image: illus2,
  },
  {
    label: 'Comic Book',
    icon: Zap,
    description: 'Style bande dessinée américaine.\nTraits noirs, couleurs aplat, dynamique.',
    image: illus2,
  },
  {
    label: 'Digital Art',
    icon: Zap,
    description: 'Art numérique créatif et poli.\nModerne, expressif, détaillé.',
    image: illus4,
  },
  {
    label: 'Enhance',
    icon: Sparkles,
    description: 'Amélioration créative et magique.\nDétails boostés, rendu supérieur.',
    image: illus3,
  },
  {
    label: 'Fantasy Art',
    icon: Sparkles,
    description: 'Magie et imaginaire fantastique.\nOnirique, épique, surnaturel.',
    image: illus2,
  },
  {
    label: 'Isometric',
    icon: Gem,
    description: 'Vue 3D isométrique technique.\nParfait pour architecture/objets.',
    image: illus4,
  },
  {
    label: 'Line Art',
    icon: Sun,
    description: 'Dessin au trait pur et simple.\nMinimaliste, élégant, sans couleur.',
    image: illus4,
  },
  {
    label: 'Low Poly',
    icon: Gem,
    description: 'Style géométrique facetté.\nModerne, abstrait, ludique.',
    image: illus4,
  },
  {
    label: 'Modeling Compound',
    icon: Gem,
    description: 'Style pâte à modeler / clay.\nTexture douce, ludique, tactile.',
    image: illus4,
  },
  {
    label: 'Neon Punk',
    icon: Zap,
    description: 'Esthétique cyberpunk urbaine et néon.\nContrastes forts, futuriste.',
    image: illus2,
  },
  {
    label: 'Origami',
    icon: Sun,
    description: 'Art du pliage de papier.\nGéométrique, délicat, texturé.',
    image: illus4,
  },
  {
    label: 'Photographic',
    icon: Sparkles,
    description: 'Rendu photo-réaliste impeccable.\nLumière naturelle, détails fins.',
    image: illus3,
  },
  {
    label: 'Pixel Art',
    icon: Zap, // Using Zap as a proxy for digital/pixel
    description: 'Style rétro 8-bit / 16-bit.\nNostalgique, numérique, carré.',
    image: illus2,
  },
  {
    label: 'Tile Texture',
    icon: Gem,
    description: 'Texture répétable sans raccord.\nIdéal pour fonds et motifs.',
    image: illus4,
  },
];

// Visual style options

export default function Step2PersonalizeScreen() {
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

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const keyboardHeight = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);
  const [localQuery, setLocalQuery] = useState(userQuery || '');
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);



  // No longer using dynamic questions

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setIsKeyboardVisible(true);
        Animated.timing(keyboardHeight, {
          toValue: e.endCoordinates.height - 40,
          duration: Platform.OS === 'ios' ? 250 : 200,
          useNativeDriver: false,
        }).start();

        // scroll to bottom when keyboard opens
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    const hideSubscription = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
        Animated.timing(keyboardHeight, {
          toValue: 0,
          duration: Platform.OS === 'ios' ? 250 : 200,
          useNativeDriver: false,
        }).start();
      }
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // No longer using intentions

  // Image picker for visual flow
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Nous avons besoin de votre permission pour accéder à vos photos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri.toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
        const hasValidExtension = allowedExtensions.some((ext) =>
          uri.endsWith(ext)
        );

        if (!hasValidExtension) {
          Alert.alert(
            'Format non supporté',
            'Veuillez sélectionner une image au format JPEG, PNG ou WebP.'
          );
          return;
        }
        setUploadedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  // No longer rendering questions

  const handleCreate = () => {
    // Validate based on category
    if (selectedCategory === 'Image' || selectedCategory === 'Social') {
      // Visual flow: require style and image
      if (!selectedStyle) {
        Alert.alert('Style requis', 'Veuillez choisir un style artistique.');
        return;
      }
    } else if (selectedCategory === 'Texte') {
      // Text flow: require intention
    }

    // All validations passed, save query and go to result
    setQuery(localQuery);
    router.push('/(guided)/step3-result');
  };

  const insets = useSafeAreaInsets();

  return (
    <GuidedScreenWrapper
      scrollViewRef={scrollRef}
      footer={
        null
      }
    >
      <View style={{ paddingHorizontal: 20 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Personnalisez votre création</Text>
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbJob}>{selectedJob}</Text>
            <ChevronRight size={14} color={colors.text.muted} />
            <Text style={styles.breadcrumbFunction}>{selectedFunction?.split('(')[0]}</Text>
          </View>
        </View>


        {/* CONDITIONAL FLOW: Visual Style Selection */}
        {(selectedCategory === 'Image' || selectedCategory === 'Social') && (
          <View style={{ marginBottom: 32 }}>

            <View style={{ marginTop: 32 }}>
              <Text style={styles.sectionTitle}>Choisissez le style artistique</Text>
              <View style={{ flexDirection: 'column', gap: 16, marginTop: 16 }}>
                {VISUAL_STYLES.map((style) => {
                  const isSelected = selectedStyle === style.label;
                  return (
                    <TouchableOpacity
                      key={style.label}
                      style={styles.styleCard}
                      onPress={() => {
                        setStyle(style.label as any);
                      }}
                      activeOpacity={0.9}
                    >
                      <Image
                        source={
                          typeof style.image === 'string'
                            ? { uri: style.image }
                            : style.image
                        }
                        style={styles.styleCardImage}
                        resizeMode='cover'
                      />

                      <View style={styles.styleCardContent}>
                        <Text style={styles.styleCardLabel}>{style.label}</Text>
                        <Text style={styles.styleCardDescription} numberOfLines={2}>
                          {style.description}
                        </Text>
                      </View>

                      {isSelected && (
                        <BlurView
                          intensity={20}
                          tint="light"
                          style={StyleSheet.absoluteFill}
                        >
                          <View style={styles.selectedOverlayContent}>
                            <View style={styles.styleCardCheck}>
                              <View style={styles.styleCardCheckInner} />
                            </View>
                          </View>
                        </BlurView>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}
        {/* Intentions removed */}

        {/* Prompt Section */}
        <View style={{ marginTop: 20, marginBottom: 40 }}>
          <Text style={styles.sectionTitle}>Étape finale : Précisez votre besoin</Text>
          <Text style={styles.sectionSubtitle}>
            Décrivez précisément l'offre ou le visuel souhaité (ex: promotion -20% sur les burgers...)
          </Text>

          <View style={styles.promptContainer}>
            <TextInput
              style={styles.promptInput}
              placeholder="Ex: Une offre spéciale pour la Saint-Valentin..."
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              multiline
              value={localQuery}
              onChangeText={setLocalQuery}
            />

            <TouchableOpacity style={styles.micButton} activeOpacity={0.7}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Mic size={24} color={colors.primary.main} />
              </Animated.View>
            </TouchableOpacity>
          </View>

          <NeonButton
            title="Démarrer la création"
            icon={<Sparkles size={20} color="white" />}
            onPress={handleCreate}
            variant="premium"
            size="lg"
            style={{ width: '100%' }}
          />
        </View>
      </View>
    </GuidedScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    color: '#FFFFFF',
  },
  breadcrumbFunction: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.muted,
  },
  animationContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  questionContainer: {
    marginBottom: 28,
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  choiceButton: {
    minWidth: '30%',
    maxWidth: '48%',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceButtonSelected: {
    borderColor: colors.blue[400],
    backgroundColor: colors.blue[600],
    shadowColor: colors.blue[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  choiceText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  choiceTextSelected: {
    color: '#FFFFFF',
  },
  textInput: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  textInputActive: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '0D',
  },
  // Conditional flow styles
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 20,
    lineHeight: 20,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.text.muted,
    marginTop: 4,
  },
  promptContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 150,
    padding: 16,
    position: 'relative',
    marginBottom: 24,
  },
  promptInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  micButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary.main + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary.main + '40',
  },
  uploadButton: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 300,
    borderRadius: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary.main,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
  },
  uploadHint: {
    fontSize: 14,
    color: colors.text.muted,
  },
  imagePreviewContainer: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 300,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
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
    color: colors.primary.main,
  },
  customIntentionSection: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 16,
  },
  customIntentionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
  },
  customIntentionInput: {
    minHeight: 80,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
    textAlignVertical: 'top',
  },
  customIntentionInputActive: {
    borderColor: colors.primary.main,
    backgroundColor: colors.primary.main + '0D',
  },
  styleCard: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },

  styleCardSelected: {
    // Removed border
  },
  styleCardImage: {
    width: '100%',
    height: undefined,     // ← IMPORTANT
    aspectRatio: 1,        // ← mets l’aspect réel (voir plus bas)

  },

  styleCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  styleCardDescription: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 14,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
