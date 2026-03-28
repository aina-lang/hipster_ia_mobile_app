import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Plus,
  Sparkles,
  ChevronRight,
  LayoutGrid,
} from 'lucide-react-native';
import { useCreationStore } from '../../store/creationStore';
import { useAuthStore } from '../../store/authStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { NeonButton } from '../../components/ui/NeonButton';
import { GenericModal, ModalType } from '../../components/ui/GenericModal';

export default function ImpressionHDCreateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    setFunction,
    setQuery,
    setStyle,
    setArchitecture,
    reset: resetCreation,
  } = useCreationStore();
  const { user } = useAuthStore();

  const [description, setDescription] = useState('');
  const [dimensions, setDimensions] = useState('A4');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const dimensionOptions = [
    { id: 'A4', label: 'A4 (21x29.7 cm)', width: 2480, height: 3508 },
    { id: 'A3', label: 'A3 (29.7x42 cm)', width: 3508, height: 4962 },
    { id: 'A2', label: 'A2 (42x59.4 cm)', width: 4962, height: 7016 },
    { id: 'custom', label: 'Personnalisé', width: 2480, height: 3508 },
  ];

  const showModal = (type: ModalType, title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleCreateImage = async () => {
    if (!description.trim()) {
      showModal('error', 'Validation', 'Veuillez décrire votre création');
      return;
    }

    try {
      setLoading(true);

      // Set creation data using individual methods
      setFunction('Format impression HD', 'Document');
      setQuery(description);
      setStyle('Professional' as any);
      setArchitecture('Impression HD');

      // Navigate to the result page directly
      // We'll create a custom gen endpoint for Impression HD
      router.push('/(guided)/step4-result');
    } catch (error: any) {
      showModal('error', 'Erreur', error.message || 'Impossible de créer l\'image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Nouveau flyer</Text>
        <TouchableOpacity onPress={() => router.push('/(drawer)/impression-hd-history')}>
          <LayoutGrid size={24} color={colors.neonBlue} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.content}
        contentContainerStyle={s.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View style={s.infoCard}>
          <LinearGradient
            colors={['rgba(0, 212, 255, 0.1)', 'rgba(0, 100, 200, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.infoGradient}
          >
            <View style={s.infoContent}>
              <Sparkles size={24} color={colors.neonBlue} />
              <Text style={s.infoText}>
                Créez des visuels haute résolution (300 DPI) prêts pour l'impression
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Dimensions */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Format impression</Text>
          <View style={s.dimensionsGrid}>
            {dimensionOptions.map((dim) => (
              <TouchableOpacity
                key={dim.id}
                style={[s.dimensionCard, dimensions === dim.id && s.dimensionCardActive]}
                onPress={() => setDimensions(dim.id)}
              >
                <View
                  style={[
                    s.dimensionPreview,
                    dimensions === dim.id && s.dimensionPreviewActive,
                  ]}
                >
                  {dimensions === dim.id && <Text style={s.checkmark}>✓</Text>}
                </View>
                <Text style={s.dimensionLabel}>{dim.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Décrivez votre création</Text>
          <TextInput
            style={s.textInput}
            placeholder="Ex: Affiche pour une campagne de marketing digital, design moderne avec couleurs vives..."
            placeholderTextColor={colors.text.muted}
            multiline
            numberOfLines={6}
            maxLength={500}
            value={description}
            onChangeText={setDescription}
          />
          <Text style={s.charCount}>
            {description.length}/500
          </Text>
        </View>

        {/* Features */}
        <View style={s.featuresSection}>
          <Text style={s.sectionTitle}>Caractéristiques</Text>
          <View style={s.featuresList}>
            {[
              'Résolution 300 DPI',
              'Format CMYK pour impression',
              'Marges de sécurité',
              'Export PDF inclus',
            ].map((feature, idx) => (
              <View key={idx} style={s.featureItem}>
                <View style={s.featureDot} />
                <Text style={s.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Generate Button */}
      <View style={s.footer}>
        <NeonButton
          onPress={handleCreateImage}
          disabled={loading || !description.trim()}
          style={{ width: '100%' }}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <View style={s.buttonContent}>
              <Plus size={20} color={colors.text.primary} />
              <Text style={s.buttonText}>Générer l'image</Text>
            </View>
          )}
        </NeonButton>
      </View>

      <GenericModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: fonts.arimo,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  infoCard: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoGradient: {
    padding: 16,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: fonts.arimo,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
    fontFamily: fonts.arimo,
  },
  dimensionsGrid: {
    gap: 12,
  },
  dimensionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    gap: 12,
  },
  dimensionCardActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
    borderColor: colors.neonBlue,
  },
  dimensionPreview: {
    width: 40,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dimensionPreviewActive: {
    backgroundColor: colors.neonBlue,
  },
  checkmark: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
  },
  dimensionLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: fonts.arimo,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.text.primary,
    fontFamily: fonts.arimo,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: colors.text.muted,
    marginTop: 8,
    textAlign: 'right',
  },
  featuresSection: {
    marginBottom: 24,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neonBlue,
  },
  featureText: {
    fontSize: 13,
    color: colors.text.primary,
    fontFamily: fonts.arimo,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: fonts.arimo,
  },
});
