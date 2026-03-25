import React, { useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Text } from '../components/ui/Text';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeOut,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  Extrapolate,
  SharedValue,
  runOnJS,
} from 'react-native-reanimated';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useAuthStore } from '../store/authStore';
import { useWelcomeVideoStore } from '../store/welcomeVideoStore';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useResponsiveDimensions } from '../hooks/useResponsiveDimensions';

const NEON_BLUE = '#00d4ff';
const NEON_GLOW = '#0099ff';
const NEON_LIGHT = '#66e5ff';

const videobg = require('../assets/video/splashVideo-fixed-mobile.mp4');
const reloadingScreen = require('../assets/video/reloadingScreen.mp4');
const bgAfterBack = require('../assets/bg_after_back.jpeg');

interface ParticleConfig {
  x: number;
  y: number;
  size: number;
  color: string;
  delayMs: number;
  durationMs: number;
}

const PARTICLES: ParticleConfig[] = [
  { x: 0, y: -80, size: 2.5, color: NEON_BLUE, delayMs: 500, durationMs: 1700 },
  { x: -30, y: -85, size: 2, color: NEON_LIGHT, delayMs: 620, durationMs: 1300 },
  { x: 30, y: -85, size: 2, color: NEON_LIGHT, delayMs: 540, durationMs: 1500 },
  { x: -60, y: -78, size: 3, color: NEON_GLOW, delayMs: 700, durationMs: 1800 },
  { x: 60, y: -78, size: 3, color: NEON_GLOW, delayMs: 760, durationMs: 1600 },
];

interface ParticleProps extends ParticleConfig {}

const Particle = React.memo(({ x, y, size, color, delayMs, durationMs }: ParticleProps) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(0.9, { duration: durationMs * 0.5, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.1, { duration: durationMs * 0.5, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
    translateY.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(-5, { duration: durationMs, easing: Easing.inOut(Easing.sin) }),
          withTiming(5, { duration: durationMs, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: size * 3,
          elevation: 5,
        },
        animStyle,
      ]}
    />
  );
});

export interface WelcomeScreenProps {
  onVideoFinish?: () => void;
  setIsRouting?: (routing: boolean) => void;
}

interface TopBarProps {
  textAnimProgress: SharedValue<number>;
  isAuthenticated: boolean;
  userName: string | undefined;
}

const TopBar = ({ textAnimProgress, isAuthenticated, userName }: TopBarProps) => {
  const insets = useSafeAreaInsets();
  const responsive = useResponsiveDimensions();

  if (isAuthenticated) return null;

  const animStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      textAnimProgress?.value ?? 0,
      [0, 0.5, 1],
      [0, 0, 1],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      textAnimProgress?.value ?? 0,
      [0, 1],
      [-30, 0],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.topBar,
        {
          height: responsive.topBarHeight + insets.top,
          paddingTop: insets.top - 10
        },
        animStyle
      ]}
    >
      <Text h1 style={{ fontSize: responsive.fontSize['3xl'] }}>HIPSTER IA</Text>
      <Animated.Text style={[styles.topBarSubText, { fontSize: responsive.fontSize.lg }]}>
        L'agence marketing automatisée
      </Animated.Text>
      <Animated.Text style={[styles.subLineTextTop, { fontSize: responsive.fontSize.base }]}>
        Dans votre poche.
      </Animated.Text>
    </Animated.View>
  );
};

interface SubTextAnimationProps {
  textAnimProgress: SharedValue<number>;
  isAuthenticated: boolean;
}

const SubTextAnimation = React.memo(({ textAnimProgress, isAuthenticated }: SubTextAnimationProps) => {
  if (isAuthenticated) return null;

  const responsive = useResponsiveDimensions();

  const animStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      textAnimProgress?.value ?? 0,
      [0, 1],
      [0, -300],
      Extrapolate.CLAMP
    );

    const opacity = interpolate(
      textAnimProgress?.value ?? 0,
      [0, 0.5, 1],
      [0, 0, 1],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
      opacity
    };
  });

  return (
    <Animated.View style={animStyle}>
      <Animated.Text style={[styles.mainSubText, { fontSize: responsive.fontSize.lg, bottom: responsive.mainSubTextBottom }]}>
        Créez vos affiches, promotions et publications en quelques secondes.
      </Animated.Text>
    </Animated.View>
  );
});

interface BottomAuthSectionProps {
  isAuthenticated: boolean;
  onVideoFinish?: () => void;
  setIsRouting?: (routing: boolean) => void;
  textAnimProgress: SharedValue<number>;
  setIsReturningFromBack?: (returning: boolean) => void;
}

const BottomAuthSection = React.memo(({ isAuthenticated, onVideoFinish, setIsRouting, textAnimProgress, setIsReturningFromBack }: BottomAuthSectionProps) => {
  const router = useRouter();
  const responsive = useResponsiveDimensions();

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(textAnimProgress?.value ?? 0, [0, 1], [350, 0], Extrapolate.CLAMP),
      },
    ],
    opacity: interpolate(textAnimProgress?.value ?? 0, [0, 0.4, 1], [0, 0, 1], Extrapolate.CLAMP),
  }));

  if (isAuthenticated) return null;

  return (
    <Animated.View style={[styles.container, { paddingHorizontal: responsive.containerPaddingHorizontal, gap: responsive.containerGap, bottom: responsive.containerBottom }, animStyle]}>
      <Pressable
        onPress={() => {
          onVideoFinish?.();
          router.push({
            pathname: '/(auth)/register',
            params: { from: 'welcome' }
          });
        }}
        style={[styles.primaryButton, { width: responsive.isSmallScreen ? '85%' : '70%' }]}
      >
        <LinearGradient
          colors={['#000000', '#0a1628', '#264F8C']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          locations={[0, 0.6, 1]}
          style={[styles.gradient, { paddingVertical: responsive.isSmallScreen ? 12 : 14 }]}
        >
          <Text style={[styles.primaryButtonText, { fontSize: responsive.fontSize.sm }]}>
            Commencer maintenant
          </Text>
        </LinearGradient>
      </Pressable>

      <View style={[styles.row, { gap: responsive.spacing.xs }]}>
        <Text small style={{ fontSize: responsive.fontSize.xs }}>
          Déjà un compte ?
        </Text>
        <Pressable
          onPress={() => {
            onVideoFinish?.();
            router.push('/(auth)/login');
          }}
          style={({ pressed }) => ({
            padding: 10,
            opacity: pressed ? 0.7 : 1,
            margin: -10,
          })}
        >
          <Text small style={[styles.highlight, { fontSize: responsive.fontSize.base }]}>
            Se connecter
          </Text>
        </Pressable>
      </View>

      <View style={[styles.trial, { gap: responsive.spacing.xs, marginTop: responsive.spacing.lg }]}>
        <FontAwesome5 name="angellist" size={responsive.isSmallScreen ? 16 : 18} style={styles.glowIcon} />
        <Text small style={{ fontSize: responsive.fontSize.xs }}>
          <Text style={styles.highlight}>7 jours</Text> d'essai gratuit
        </Text>
        <Text style={[styles.separator, { fontSize: responsive.fontSize.xs }]}>·</Text>
        <Pressable
          onPress={() => Linking.openURL('mailto:contact@hipster-ia.fr').catch(() => { })}
          style={styles.contactLink}
        >
          <Text style={[styles.contactText, { fontSize: responsive.fontSize.xs }]}>
            Besoin d'aide ?
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
});

const AuthenticatedSplash = React.memo(({ onVideoFinish }: { onVideoFinish?: () => void }) => {
  const videoOpacity = useSharedValue(1);
  const isFinished = useRef(false);

  const videoPlayer = useVideoPlayer(reloadingScreen, (player) => {
    player.loop = false;
    player.muted = true;
  });

  const triggerExit = () => {
    if (isFinished.current) return;
    isFinished.current = true;
    videoOpacity.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) }, (finished) => {
      if (finished) {
        runOnJS(onVideoFinish ?? (() => {}))();
      }
    });
  };

  useEffect(() => {
    const timer = setTimeout(triggerExit, 1000);

    const onStatusChange = ({ status }: { status: string }) => {
      if (status === 'readyToPlay') {
        videoPlayer.play();
        SplashScreen.hideAsync().catch(() => {});
      }
    };

    if (videoPlayer.status === 'readyToPlay') {
      videoPlayer.play();
      SplashScreen.hideAsync().catch(() => {});
    }

    videoPlayer.addListener('statusChange', onStatusChange);
    videoPlayer.addListener('playToEnd', triggerExit);

    return () => {
      clearTimeout(timer);
      videoPlayer.removeListener('statusChange', onStatusChange);
      videoPlayer.removeListener('playToEnd', triggerExit);
    };
  }, [videoPlayer]);

  const videoAnimStyle = useAnimatedStyle(() => ({
    opacity: videoOpacity.value,
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }, videoAnimStyle]}>
      <StatusBar style="light" />
      <View style={styles.authVideoContainer}>
        <VideoView
          player={videoPlayer}
          style={styles.authVideo}
          contentFit="contain"
          nativeControls={false}
        />
      </View>
    </Animated.View>
  );
});

export default React.memo(function WelcomeScreen({ onVideoFinish, setIsRouting }: WelcomeScreenProps) {
  const [videoReady, setVideoReady] = React.useState(false);
  const { isReturningFromBack, setIsReturningFromBack, videoCompleted, setVideoCompleted } = useWelcomeVideoStore();
  const showImage = isReturningFromBack;
  const shouldSkipPlay = videoCompleted || isReturningFromBack;

  const textAnimProgress = useSharedValue(shouldSkipPlay ? 1 : 0);
  const videoMarginTop = useSharedValue(shouldSkipPlay ? 100 : 0);
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const insets = useSafeAreaInsets();
  const responsive = useResponsiveDimensions();
  const videoCompletedRef = useRef(false);
  const topBarHeight = responsive.topBarHeight + insets.top;

  if (isAuthenticated) {
    return <AuthenticatedSplash onVideoFinish={onVideoFinish} />;
  }

  React.useEffect(() => {
    if (!isReturningFromBack) {
      videoCompletedRef.current = false;
    }
  }, [isReturningFromBack]);

  React.useEffect(() => {
    if (isReturningFromBack) {
      textAnimProgress.value = 1;
      videoMarginTop.value = 100;
      isFinishedRef.current = true;
      onVideoFinish?.();
    }
  }, [isReturningFromBack]);

  const videoPlayer = useVideoPlayer(videobg, (player) => {
    player.loop = false;
    player.muted = true;
  });

  const isFinishedRef = React.useRef(shouldSkipPlay);
  const playbackTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!videoPlayer || shouldSkipPlay) return;

    const onPlaybackFinish = () => {
      if (isFinishedRef.current) return;
      videoCompletedRef.current = true;

      videoMarginTop.value = withTiming(100, {
        duration: 1500,
        easing: Easing.inOut(Easing.quad),
      });

      textAnimProgress.value = withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.quad),
      });

      playbackTimerRef.current = setTimeout(() => {
        setVideoCompleted(true);
        onVideoFinish?.();
      }, 2000);
    };

    videoPlayer.addListener('playToEnd', onPlaybackFinish);

    return () => {
      videoPlayer.removeListener('playToEnd', onPlaybackFinish);
    };
  }, [videoPlayer]);

  const videoAnimatedStyle = useAnimatedStyle(() => ({
    marginTop: videoMarginTop.value,
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]}>
      <StatusBar style="light" />

      {showImage ? (
        <Animated.View>
          <Image source={bgAfterBack} />
        </Animated.View>
      ) : (
        <Animated.View style={videoAnimatedStyle}>
          <VideoView player={videoPlayer} />
        </Animated.View>
      )}

      <TopBar
        textAnimProgress={textAnimProgress}
        isAuthenticated={isAuthenticated}
        userName={user?.name}
      />

      <SubTextAnimation textAnimProgress={textAnimProgress} isAuthenticated={isAuthenticated} />

      <BottomAuthSection
        isAuthenticated={isAuthenticated}
        onVideoFinish={onVideoFinish}
        setIsRouting={setIsRouting}
        textAnimProgress={textAnimProgress}
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  authVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  authVideo: {
    width: '85%',
    aspectRatio: 9 / 16,
    maxHeight: '80%',
  },
});