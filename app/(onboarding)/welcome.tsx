import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  Text,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  withRepeat,
  withSequence,
  SharedValue,
} from 'react-native-reanimated';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { NeonButton } from '../../components/ui/NeonButton';
import { colors } from '../../theme/colors';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Propulsez votre créativité',
    subtitle: 'Hipster IA transforme vos idées en contenus spectaculaires en quelques secondes.',
    image: require('../../assets/logo.png'),
  },
  {
    id: '2',
    title: 'Une IA à votre image',
    subtitle:
      'Personnalisez votre assistant pour obtenir des résultats parfaitement adaptés à votre style.',
    image: require('../../assets/logo.png'),
  },
  {
    id: '3',
    title: 'Prêt pour le futur ?',
    subtitle: 'Rejoignez des milliers de créateurs qui utilisent déjà nos outils de pointe.',
    image: require('../../assets/logo.png'),
  },
];

export default function WelcomeScreen() {
  const scrollX = useSharedValue(0);
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.value = event.nativeEvent.contentOffset.x;
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.push('/(auth)/register');
    }
  };

  // Shared values for the deer animation
  const deerScale = useSharedValue(1);
  const deerTranslateY = useSharedValue(0);

  useEffect(() => {
    deerScale.value = withRepeat(withTiming(1.05, { duration: 3000 }), -1, true);

    deerTranslateY.value = withRepeat(withTiming(-10, { duration: 3500 }), -1, true);
  }, []);

  const cerfStyle = useAnimatedStyle(() => {
    // Show deer specifically towards the end of the swiper
    // Cross-fade based on scrollX
    const opacity = interpolate(
      scrollX.value,
      [width * (SLIDES.length - 2), width * (SLIDES.length - 1)],
      [0, 1],
      'clamp'
    );

    return {
      opacity,
      transform: [{ scale: deerScale.value }, { translateY: deerTranslateY.value }],
    };
  });

  return (
    <BackgroundGradient>
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={SLIDES}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            return <Slide item={item} index={index} scrollX={scrollX} />;
          }}
        />

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, currentIndex === index ? styles.activeDot : styles.inactiveDot]}
            />
          ))}
        </View>

        {/* CTA Button */}
        <View style={styles.buttonContainer}>
          <NeonButton
            title={currentIndex === SLIDES.length - 1 ? 'Commencer' : 'Continuer'}
            onPress={handleNext}
            size="lg"
            variant="premium"
            style={styles.button}
          />
        </View>
      </View>
    </BackgroundGradient>
  );
}

function Slide({
  item,
  index,
  scrollX,
}: {
  item: any;
  index: number;
  scrollX: SharedValue<number>;
}) {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(withTiming(1.04, { duration: 2500 }), -1, true);
  }, []);

  const animatedImageStyle = useAnimatedStyle(() => {
    const inputRatio = index * width;
    const opacity = interpolate(
      scrollX.value,
      [inputRatio - width, inputRatio, inputRatio + width],
      [0, 1, 0]
    );
    const scrollScale = interpolate(
      scrollX.value,
      [inputRatio - width, inputRatio, inputRatio + width],
      [0.8, 1, 0.8]
    );
    const translateX = interpolate(
      scrollX.value,
      [inputRatio - width, inputRatio, inputRatio + width],
      [width * 0.2, 0, -width * 0.2]
    );

    return {
      opacity,
      transform: [{ scale: scrollScale * pulseScale.value }, { translateX }],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    const inputRatio = index * width;
    const opacity = interpolate(
      scrollX.value,
      [inputRatio - width, inputRatio, inputRatio + width],
      [0, 1, 0]
    );
    const translateY = interpolate(
      scrollX.value,
      [inputRatio - width, inputRatio, inputRatio + width],
      [20, 0, 20]
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <View style={styles.slide}>
      <Animated.View style={[styles.imageContainer, animatedImageStyle]}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />
      </Animated.View>

      <Animated.View style={[styles.content, animatedTextStyle]}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cerf: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    top: height * 0.1,
    left: width * 0.1,
    zIndex: 0,
    opacity: 0,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  slide: {
    width,
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 1,
  },
  imageContainer: {
    width: width * 0.7,
    height: height * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  content: {
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.primary.main,
  },
  inactiveDot: {
    width: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonContainer: {
    paddingHorizontal: 32,
    marginBottom: 60,
  },
  button: {
    width: '100%',
  },
});
