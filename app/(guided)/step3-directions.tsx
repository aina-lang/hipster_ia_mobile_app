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
const TILE_WIDTH = (width - 56) / 2; // 2 columns with padding

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
      toValue: 0.94,
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
        activeOpacity={0.8}
        style={[styles.card, isSelected && styles.cardSelected]}
      >
        {/* Background image */}
        <Image
          source={architecture.image}
          style={styles.cardImage}
          resizeMode="cover"
        />

        {/* Gradient overlay */}
        <View
          style={[
            styles.cardOverlay,
            {
              backgroundColor: `rgba(0, 0, 0, ${isSelected ? 0.4 : 0.5})`,
            },
          ]}
        />

        {/* Selection glow */}
        {isSelected && (
          <>
            <View
              style={[
                styles.cardGlow,
                { borderColor: architecture.color },
              ]}
              pointerEvents="none"
            />
            <View
              style={[
                styles.cardBloom,
                { shadowColor: architecture.color },
              ]}
              pointerEvents="none"
            />
          </>
        )}

        {/* Content */}
        <View style={styles.cardContent}>
          {/* Title */}
          <Text style={styles.cardTitle} numberOfLines={2}>
            {architecture.label}
          </Text>

          {/* Description */}
          <Text style={styles.cardDescription} numberOfLines={1}>
            {architecture.description}
          </Text>

          {/* Selection indicator */}
          {isSelected && (
            <View style={styles.selectedBadge}>
              <View style={styles.selectedDot} />
            </View>
          )}
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
    console.log('[DEBUG] Step3DirectionsScreen MODIFIED MOUNT', { selectedJob, selectedFunction, selectedArchitecture });
  }, []);

  const [showSubtitle, setShowSubtitle] = useState(true);

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
        {/* Header Content */}
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

        {/* ── Subtitle ── */}
        <View style={styles.subtitleBlock}>
          <Text style={styles.subtitle}>
            Sélectionnez une architecture graphique
          </Text>
          <Text style={styles.subtitleMuted}>
            Chaque direction définit le style visuel de votre création
          </Text>
        </View>

        {/* ── Grid of architectures ── */}
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

        {/* ── Selected architecture details ── */}
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  fixedFooter: {
    paddingHorizontal: 20,
    paddingVertical: 14,


  },

  // ── Header ──────────────────────────────────────────────────────────────
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

  // ── Subtitle ────────────────────────────────────────────────────────────
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

  // ── Grid ────────────────────────────────────────────────────────────────
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  // ── Card ────────────────────────────────────────────────────────────────
  card: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    position: 'relative',
  },
  cardSelected: {
    borderColor: '#1e9bff',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 2,
    zIndex: 5,
  },
  cardBloom: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
    zIndex: -1,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'flex-end',
    zIndex: 3,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    lineHeight: 16,
  },
  cardDescription: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1e9bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },

  // ── Details block ────────────────────────────────────────────────────────
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
