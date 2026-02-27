import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Palette, Minus } from 'lucide-react-native';
import { useCreationStore } from '../../store/creationStore';
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

export default function Step3PersonalizeScreen() {
  const router = useRouter();
  const {
    mainTitle, setMainTitle,
    subTitle, setSubTitle,
    infoLine, setInfoLine,
    colorLeft, setColorLeft,
    colorRight, setColorRight,
    setQuery,
  } = useCreationStore();

  const handleCreate = () => {
    // Generate a prompt or pass values to the next screen.
    const queryParts = [];
    if (mainTitle) queryParts.push(`Titre: ${mainTitle}`);
    if (subTitle) queryParts.push(`Sous-titre: ${subTitle}`);
    if (infoLine) queryParts.push(`Info: ${infoLine}`);
    queryParts.push(`Couleurs: ${colorLeft} et ${colorRight}`);
    setQuery(queryParts.join('\n'));

    router.push('/(guided)/step4-result');
  };

  return (
    <GuidedScreenWrapper
      title="PERSONNALISE TON VISUEL"
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
        {/* EXAMPLES SECTION */}
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

        <View style={styles.separator} />

        {/* INPUT FORM SECTION */}
        <Text style={styles.formTitle}>PERSONNALISE TON VISUEL</Text>

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
                <Text style={styles.colorLabel}>COULEUR GAUCHE</Text>
              </View>
              <TextInput
                style={[styles.input, styles.colorInput]}
                value={colorLeft}
                onChangeText={setColorLeft}
              />
            </View>

            <View style={styles.colorConfig}>
              <View style={styles.colorHeader}>
                <Minus size={12} color="rgba(255,255,255,0.5)" />
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{"{{LEFT_COLOR}}"}</Text>
                </View>
                <Text style={styles.colorLabel}>• COULEUR GAUCHE</Text>
              </View>
              <TextInput
                style={[styles.input, styles.colorInput, { backgroundColor: '#F2F1EC', color: '#1A1A1A' }]}
                value={colorRight}
                onChangeText={setColorRight}
              />
            </View>
          </View>
        </View>

      </View>
    </GuidedScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  fixedFooter: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: 'rgba(10,10,10,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingBottom: 40,
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
});