import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';
import { NeonButton } from '../../components/ui/NeonButton';
import { VISUAL_ARCHITECTURES, VisualArchitecture } from '../../constants/visualArchitectures';
import { useCreationStore } from '../../store/creationStore';
import { ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const TILE_WIDTH = (width - 56) / 2;

// ============================================================================
// Architecture Card Component
// ============================================================================
function ArchitectureCard({
  architecture,
  isSelected,
  onPress,
}: {
  architecture: VisualArchitecture;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      stiffness: 260,
      damping: 20,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      stiffness: 260,
      damping: 20,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        width: TILE_WIDTH,
      }}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={0.9}
        style={[
          styles.card,
          isSelected && { borderColor: architecture.color },
        ]}
      >
        {/* ── Zone image (haut) — pleinement visible ── */}
        <View style={styles.imageContainer}>
          <Image
            source={architecture.image}
            style={styles.cardImage}
            resizeMode="contain"
          />

          {/* Fondu bas très léger pour raccorder visuellement avec la zone texte */}
          {/* <View style={styles.imageBottomFade} pointerEvents="none" /> */}

          {/* Badge sélection posé sur l'image */}
          {isSelected && (
            <View
              style={[
                styles.selectedBadge,
                { backgroundColor: architecture.color },
              ]}
            >
              <View style={styles.selectedDot} />
            </View>
          )}

          {/* Bordure colorée interne quand sélectionné */}
          
        </View>

        {/* ── Zone texte (bas) — fond solide, jamais sur l'image ── */}
        <View
          style={[
            styles.textZone,
            isSelected && {
              backgroundColor: `${architecture.color}18`,
              borderTopColor: `${architecture.color}66`,
            },
          ]}
        >
          <Text style={styles.cardTitle} numberOfLines={1}>
            {architecture.label}
          </Text>
          <Text style={styles.cardDescription} numberOfLines={2}>
            {architecture.description}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================================================
// Main Screen
// ============================================================================
export default function Step3DirectionsScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const {
    selectedArchitecture,
    setArchitecture,
    selectedJob,
    selectedFunction,
  } = useCreationStore();

  React.useEffect(() => {
    console.log('[DEBUG] Step3DirectionsScreen MOUNT', {
      selectedJob,
      selectedFunction,
      selectedArchitecture,
    });
  }, []);

  const handleSelectArchitecture = (id: string) => {
    setArchitecture(id);
  };

  const handleContinue = () => {
    if (selectedArchitecture) {
      router.push('/(guided)/step3-personalize');
    }
  };

  return (
    <GuidedScreenWrapper
      currentStep={3}
      totalSteps={4}
      scrollViewRef={scrollRef}
      footer={
        <View style={styles.fixedFooter}>
          <NeonButton
            title="Continuer"
            onPress={handleContinue}
            variant="premium"
            size="lg"
            disabled={!selectedArchitecture}
            style={{ width: '100%', opacity: selectedArchitecture ? 1 : 0.5 }}
          />
        </View>
      }
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Directions Artistiques</Text>
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbText}>{selectedJob}</Text>
            <ChevronRight size={12} color={colors.text.muted} />
            <Text style={styles.breadcrumbText} numberOfLines={1}>
              {selectedFunction?.split('(')[0]}
            </Text>
          </View>
        </View>

        {/* Subtitle */}
        <View style={styles.subtitleBlock}>
          <Text style={styles.subtitle}>
            Sélectionnez une architecture graphique
          </Text>
          <Text style={styles.subtitleMuted}>
            Chaque direction définit le style visuel de votre création
          </Text>
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {VISUAL_ARCHITECTURES.map((architecture) => (
            <ArchitectureCard
              key={architecture.id}
              architecture={architecture}
              isSelected={selectedArchitecture === architecture.id}
              onPress={() => handleSelectArchitecture(architecture.id)}
            />
          ))}
        </View>

        {/* Détails architecture sélectionnée */}
        {selectedArchitecture && (
          <View style={styles.detailsBlock}>
            {VISUAL_ARCHITECTURES.map((arch) => {
              if (arch.id !== selectedArchitecture) return null;
              return (
                <View key={arch.id} style={styles.details}>
                  <View
                    style={[
                      styles.detailsColorBand,
                      { backgroundColor: arch.color },
                    ]}
                  />
                  <View style={styles.detailsContent}>
                    <Text style={styles.detailsTitle}>{arch.label}</Text>
                    <Text style={styles.detailsSubtitle}>{arch.subtitle}</Text>
                    <Text style={styles.detailsDescription}>
                      {arch.description}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </GuidedScreenWrapper>
  );
}

// ============================================================================
// Styles
// ============================================================================
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  fixedFooter: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 6,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
  },
  breadcrumbText: {
    fontSize: 13,
    color: colors.text.muted,
    fontWeight: '500',
  },

  // ── Subtitle ──────────────────────────────────────────────────────────────
  subtitleBlock: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 6,
  },
  subtitleMuted: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '400',
  },

  // ── Grid ──────────────────────────────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    width: TILE_WIDTH,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  // Image zone
  imageContainer: {
    height: 260,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  // Fondu très discret en bas de l'image — ne cache PAS l'image
  imageBottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 28,
    backgroundColor: 'transparent',
    // Pour un vrai gradient, remplacer ce View par :
    // <LinearGradient
    //   colors={['transparent', 'rgba(10,12,18,0.7)']}
    //   style={{ position:'absolute', bottom:0, left:0, right:0, height:36 }}
    // />
  },
  imageGlowBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1.5,
  },

  // Text zone — fond opaque, jamais superposé à l'image
  textZone: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'rgba(10,12,18,0.7)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  cardDescription: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '400',
    lineHeight: 14,
  },

  // Badge sélection
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

  // ── Details block ─────────────────────────────────────────────────────────
  detailsBlock: {
    marginTop: 8,
  },
  details: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  detailsColorBand: {
    width: 4,
  },
  detailsContent: {
    flex: 1,
    padding: 14,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  detailsSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    marginBottom: 6,
  },
  detailsDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '400',
    lineHeight: 16,
  },
});