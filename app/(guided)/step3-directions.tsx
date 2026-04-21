import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  Animated as RNAnimated,
  Easing,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, SlideInDown, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';
import { NeonActionButton } from '../../components/ui/NeonActionButton';
import { VISUAL_ARCHITECTURES, VisualArchitecture } from '../../constants/visualArchitectures';
import { useCreationStore } from '../../store/creationStore';


const { width } = Dimensions.get('window');
const H_PADDING = 24;
const COL_GAP   = 12;
const CARD_W    = (width - H_PADDING * 2 - COL_GAP) / 2;

function ArchNeonBorderCard({
  children,
  isSelected,
  color,
}: {
  children: React.ReactNode;
  isSelected: boolean;
  color: string;
}) {
  const translateX = useRef(new RNAnimated.Value(0)).current;
  const loopRef    = useRef<RNAnimated.CompositeAnimation | null>(null);

  React.useEffect(() => {
    loopRef.current?.stop();
    if (isSelected) {
      translateX.setValue(0);
      loopRef.current = RNAnimated.loop(
        RNAnimated.timing(translateX, {
          toValue: -CARD_W,
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
  }, [isSelected, color]);

  return (
    <View style={s.neonWrapper}>
      {isSelected && (
        <View style={s.neonClip} pointerEvents="none">
          <RNAnimated.View style={[s.neonTrack, { transform: [{ translateX }] }]}>
            <LinearGradient
              colors={['transparent', color, color, 'transparent', 'transparent', color, color, 'transparent']}
              locations={[0.05, 0.2, 0.3, 0.45, 0.55, 0.7, 0.8, 0.95]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ width: CARD_W * 2, height: '100%' }}
            />
          </RNAnimated.View>
          <View style={[s.neonMask, { backgroundColor: '#030814' }]} />
        </View>
      )}

      {children}
    </View>
  );
}

function ArchitectureCard({
  architecture,
  isSelected,
  onPress,
}: {
  architecture: VisualArchitecture;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[{ width: CARD_W }, animatedStyle]}>
      <TouchableOpacity
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        onPress={onPress}
        activeOpacity={0.9}
        style={{ width: CARD_W }}
      >
        <ArchNeonBorderCard isSelected={isSelected} color={architecture.color}>
          <View style={[s.card, isSelected && s.cardSelected]}>
            <View style={s.imageContainer}>
              <Image
                source={architecture.image}
                style={s.cardImage}
                resizeMode="cover"
              />
              {isSelected && (
                <View style={[s.selectedBadge, { backgroundColor: architecture.color === '#ffffff' ? '#000000' : architecture.color }]}>
                  <View style={s.selectedDot} />
                </View>
              )}
            </View>

            <View style={[
              s.textZone,
              isSelected && {
                backgroundColor: `${architecture.color}18`,
                borderTopColor: `${architecture.color}66`,
              },
            ]}>
              <Text style={[s.cardTitle, isSelected && s.cardTitleSelected]} numberOfLines={1}>
                {architecture.label}
              </Text>
              <Text style={s.cardDescription} numberOfLines={2}>
                {architecture.description}
              </Text>
            </View>
          </View>
        </ArchNeonBorderCard>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function Step3DirectionsScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { selectedArchitecture, setArchitecture, selectedJob, selectedFunction } = useCreationStore();

  const handleArchitectureSelect = (architectureId: string) => {
    setArchitecture(architectureId);
  };

  const handleContinue = () => {
    router.push('/(guided)/step3-personalize');
  };

  return (
    <GuidedScreenWrapper
      currentStep={1}
      totalSteps={2}
      scrollViewRef={scrollRef}
      footer={
        selectedArchitecture ? (
          <Animated.View entering={SlideInDown.duration(300)} style={s.footerButtonWrapper}>
            <NeonActionButton
              label="Continuer"
              onPress={handleContinue}
              disabled={!selectedArchitecture}
            />
          </Animated.View>
        ) : null
      }
    >
      <View style={s.container}>
        <View style={s.header}>
          <Text style={s.headerScript}>Directions</Text>
          <Text style={s.headerSub}>ARTISTIQUES</Text>
          {(selectedJob || selectedFunction) && (
            <View style={s.breadcrumb}>
              {selectedJob && <Text style={s.breadcrumbText}>{selectedJob}</Text>}
              {selectedJob && selectedFunction && (
                <ChevronRight size={12} color={colors.text.muted} />
              )}
              {selectedFunction && (
                <Text style={s.breadcrumbText} numberOfLines={1}>
                  {selectedFunction.split('(')[0]}
                </Text>
              )}
            </View>
          )}
        </View>

        <Text style={s.subtitle}>
          Chaque direction définit le style visuel de votre création
        </Text>

        <View style={s.grid}>
          {VISUAL_ARCHITECTURES.map((architecture) => (
            <ArchitectureCard
              key={architecture.id}
              architecture={architecture}
              isSelected={selectedArchitecture === architecture.id}
              onPress={() => handleArchitectureSelect(architecture.id)}
            />
          ))}
        </View>

        {selectedArchitecture && VISUAL_ARCHITECTURES.map((arch) => {
          if (arch.id !== selectedArchitecture) return null;
          return (
            <View key={arch.id} style={[s.detailsBlock, { backgroundColor: arch.color + '18', borderColor: arch.color  }]}>
              <View style={s.detailsContent}>
                <Text style={s.detailsTitle}>{arch.label}</Text>
                <Text style={s.detailsSubtitle}>{arch.subtitle}</Text>
                <Text style={s.detailsDescription}>{arch.description}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </GuidedScreenWrapper>
  );
}

const s = StyleSheet.create({
  container: {
    paddingHorizontal: H_PADDING
  },

  header: {
    alignItems: 'center',
    paddingTop: 0
  },
  headerScript: {
    fontFamily: 'Brittany-Signature',
    fontSize: 42,
    paddingVertical : 10,
    color: '#ffffff',
    textShadowColor: colors.neonBlue,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
    marginBottom : 5
  },
  headerSub: {
    fontFamily: fonts.arimo.bold,
    fontSize: 13,
    letterSpacing: 3,
    color: colors.gray,
    marginBottom: 20,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
    marginBottom : 10
  },
  breadcrumbText: {
    fontFamily: fonts.arimo.regular,
    fontSize: 12,
    color: colors.text.muted
  },
  subtitle: {
    fontFamily: fonts.arimo.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: COL_GAP,
    marginBottom: 24,
  },

  neonWrapper: { position: 'relative', marginBottom: 2 },
  neonClip:    { position: 'absolute', top: -1, left: -1, right: -1, bottom: -0.5, borderRadius: 21, overflow: 'hidden', zIndex: 2 },
  neonTrack:   { position: 'absolute', top: 0, bottom: 0, left: 0 },
  neonMask:    { position: 'absolute', top: 1, left: 1, right: 1, bottom: 0.5, borderRadius: 20, zIndex: 1 },


  card: {
    width: CARD_W,
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    zIndex: 3,
  },
  cardSelected: {
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

  detailsBlock: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginBottom: 28
  },
  detailsColorBand: {
    width: 4,
  },
  detailsContent: {
    flex: 1,
    padding: 16,
    justifyContent : 'center',
    alignItems : 'center'
  },
  detailsTitle: {
    fontFamily: fonts.arimo.bold,
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 10,
  },
  detailsSubtitle: {
    fontFamily: fonts.arimo.bold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 6,
  },
  detailsDescription: {
    fontFamily: fonts.arimo.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 18,
  },

  footerButtonWrapper: {
    paddingHorizontal: H_PADDING,
    paddingVertical: 16,
    paddingBottom: 32, // Extra padding for safe area bottom if needed
    backgroundColor: 'transparent',
  },
});