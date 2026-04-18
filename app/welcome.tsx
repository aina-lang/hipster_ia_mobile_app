import React, { useCallback, useEffect, useRef } from 'react';
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
import { useRouter, useFocusEffect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useResponsiveDimensions } from '../hooks/useResponsiveDimensions';

const NEON_BLUE = '#00d4ff';
const NEON_GLOW = '#0099ff';
const NEON_LIGHT = '#66e5ff';

const videobg = require('../assets/video/splashVideo-fixed-mobile.mp4');
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

interface ParticleProps extends ParticleConfig { }

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
}

interface TopBarProps {
  textAnimProgress: SharedValue<number>;
  isAuthenticated: boolean;
  userName: string | undefined;
}

const TopBar = ({ textAnimProgress, isAuthenticated, userName }: TopBarProps) => {
  if (isAuthenticated) return null;

  const insets = useSafeAreaInsets();
  const responsive = useResponsiveDimensions();

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
  textAnimProgress: SharedValue<number>;
  setIsReturningFromBack?: (returning: boolean) => void;
  setFirstTimeUsed?: () => void;
}

const BottomAuthSection = React.memo(({ isAuthenticated, textAnimProgress, setIsReturningFromBack, setFirstTimeUsed }: BottomAuthSectionProps) => {
  if (isAuthenticated) return null;

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

  return (
    <Animated.View style={[styles.container, { paddingHorizontal: responsive.containerPaddingHorizontal, gap: responsive.containerGap, bottom: responsive.containerBottom }, animStyle]}>
      <Pressable
        onPress={() => {
          useWelcomeVideoStore.getState().markOpenedAuthFromWelcome();
          router.push({
            pathname: '/(auth)/register',
            params: { from: 'welcome' },
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

      <View style={styles.row}>
        <Text small style={{ fontSize: responsive.fontSize.xs }}>
          Déjà un compte ?{'  '}
        </Text>
        <Pressable
          onPress={() => {
            useWelcomeVideoStore.getState().markOpenedAuthFromWelcome();
            router.push('/(auth)/login');
          }}
          style={({ pressed }) => ({
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text small style={[styles.highlight, { fontSize: responsive.fontSize.base }]}>
            Se connecter
          </Text>
        </Pressable>
      </View>

      <View style={[styles.trialRow, { marginTop: responsive.spacing.lg }]}>
        <FontAwesome5 name="angellist" size={responsive.isSmallScreen ? 16 : 18} style={styles.glowIcon} />
        <Text
          style={[styles.trialText, { fontSize: responsive.fontSize.xs }]}
          numberOfLines={1}
        >
          {'  '}
          <Text style={styles.highlight}>7 jours</Text>
          {" d'essai gratuit  ·  "}
          <Text
            style={styles.contactText}
            onPress={() => Linking.openURL('mailto:contact@hipster-ia.fr').catch(() => { })}
          >
            Besoin d'aide ?
          </Text>
        </Text>
      </View>
    </Animated.View>
  );
});

function WelcomeScreenContent({ onVideoFinish }: WelcomeScreenProps) {
  const [videoReady, setVideoReady] = React.useState(false);
  const { isReturningFromBack, videoCompleted, setVideoCompleted, isNavigating } = useWelcomeVideoStore();
  const { user } = useAuthStore();
  const responsive = useResponsiveDimensions();

  const isFinishedRef = useRef(false);
  const playbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoCompletedRef = useRef(false);
  const playbackStartedRef = useRef(false);
  // ✅ Verrou permanent — initialisé depuis le store pour capturer logout/back avant le premier render
  const hasShownImageRef = useRef(useWelcomeVideoStore.getState().isReturningFromBack);

  const textAnimProgress = useSharedValue(0);
  const videoMarginTop = useSharedValue(0);

  const videoPlayer = useVideoPlayer(videobg, (player) => {
    player.loop = false;
    player.muted = true;
  });

  useFocusEffect(
    useCallback(() => {
      const store = useWelcomeVideoStore.getState();
      console.log('[Welcome] Screen focused - openedAuthFromWelcome:', store.openedAuthFromWelcome);

      if (store.openedAuthFromWelcome) {
        console.log('[Welcome] User returning from auth screen, showing static image');
        store.setIsReturningFromBack(true);
        store.clearOpenedAuthFromWelcome();
      }
    }, [])
  );

  // ✅ Une fois isReturningFromBack=true, le ref se verrouille définitivement
  if (isReturningFromBack) hasShownImageRef.current = true;
  const showImage = hasShownImageRef.current;
  const showVideo = !hasShownImageRef.current;

  React.useEffect(() => {
    if (isReturningFromBack) {
      console.log('[Welcome] Showing static image (returning from auth)');
      textAnimProgress.value = 1;
      videoMarginTop.value = 100;
      isFinishedRef.current = true;
    } else if (videoCompleted) {
      console.log('[Welcome] Video was already completed, showing final state');
      textAnimProgress.value = 1;
      videoMarginTop.value = 100;
      isFinishedRef.current = true;
    } else {
      console.log('[Welcome] Fresh start, resetting for video playback - animations hidden');
      textAnimProgress.value = 0;
      videoMarginTop.value = 0;
      isFinishedRef.current = false;
      videoCompletedRef.current = false;
      playbackStartedRef.current = false;
    }
  }, [isReturningFromBack, videoCompleted]);

  useEffect(() => {
    if (!videoPlayer) return;

    console.log('[Welcome] Setting up video playback');

    const onPlaybackFinish = () => {
      if (isFinishedRef.current) return;
      console.log('[Welcome] Video playback finished, starting animations');
      isFinishedRef.current = true;

      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }

      videoMarginTop.value = withTiming(100, {
        duration: 1500,
        easing: Easing.inOut(Easing.quad),
      });

      textAnimProgress.value = withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.quad),
      });

      playbackTimerRef.current = setTimeout(() => {
        console.log('[Welcome] Animations complete, marking video as completed');
        setVideoCompleted(true);
        onVideoFinish?.();
      }, 2000);
    };

    const fallbackTimer = setTimeout(() => {
      if (!isFinishedRef.current) {
        console.log('[Welcome] Video playback timeout fallback triggered');
        onPlaybackFinish();
      }
    }, 15000);

    const startPlayback = () => {
      const currentStore = useWelcomeVideoStore.getState();
      if (currentStore.videoCompleted || currentStore.isReturningFromBack || currentStore.isNavigating) {
        console.log('[Welcome] Skipping startPlayback (already done or navigating)');
        return;
      }
      if (playbackStartedRef.current) {
        console.log('[Welcome] Playback already started, skipping');
        return;
      }

      console.log('[Welcome] Starting video playback');
      playbackStartedRef.current = true;

      if (videoPlayer.status === 'readyToPlay') {
        setVideoReady(true);
        videoPlayer.play();
        SplashScreen.hideAsync().catch(() => { });
      }
    };

    const onStatusChange = ({ status }: { status: 'idle' | 'loading' | 'readyToPlay' | 'error' }) => {
      console.log('[Welcome] Video status:', status);
      if (status === 'readyToPlay') {
        setVideoReady(true);
        startPlayback();
      } else if (status === 'error') {
        console.error('[Welcome] Video error');
        onPlaybackFinish();
      }
    };

    if (videoPlayer.status === 'readyToPlay') {
      console.log('[Welcome] Video already ready, starting playback immediately');
      startPlayback();
    }

    videoPlayer.addListener('statusChange', onStatusChange);
    videoPlayer.addListener('playToEnd', onPlaybackFinish);

    return () => {
      videoPlayer.removeListener('statusChange', onStatusChange);
      videoPlayer.removeListener('playToEnd', onPlaybackFinish);
      clearTimeout(fallbackTimer);
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
      }
    };
  }, [videoPlayer, onVideoFinish, setVideoCompleted]);

  const videoAnimatedStyle = useAnimatedStyle(() => ({
    marginTop: videoMarginTop.value,
    opacity: 1,
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]}>
      <StatusBar style="light" />

      {showImage && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]} pointerEvents="none">
          <Image source={bgAfterBack} style={styles.staticWelcomeBg} resizeMode="contain" />
        </View>
      )}

      {showVideo && (
        // ✅ pointerEvents="none" — aucun re-render au clic, pas de flash
        <Animated.View
          style={[StyleSheet.absoluteFill, videoAnimatedStyle]}
          pointerEvents="none"
        >
          <VideoView player={videoPlayer} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
        </Animated.View>
      )}

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.globalOverlay}
        pointerEvents="none"
      />

      <View style={StyleSheet.absoluteFill}>
        <TopBar
          textAnimProgress={textAnimProgress}
          isAuthenticated={false}
          userName={user?.name || user?.email?.split('@')[0]}
        />

        <View style={styles.center}>
          <View style={[styles.particleAnchor, { bottom: responsive.particleBottom }]} pointerEvents="none">
            {PARTICLES.map((p, i) => (
              <Particle key={i} {...p} />
            ))}
          </View>
          <SubTextAnimation textAnimProgress={textAnimProgress} isAuthenticated={false} />
        </View>

        <BottomAuthSection
          isAuthenticated={false}
          textAnimProgress={textAnimProgress}
          setFirstTimeUsed={() => { }}
        />
      </View>
    </Animated.View>
  );
}

export default function WelcomeScreen({ onVideoFinish }: WelcomeScreenProps) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    console.log('[WelcomeScreen] Authenticated user detected, returning null');
    return null;
  }

  return <WelcomeScreenContent onVideoFinish={onVideoFinish} />;
}

const styles = StyleSheet.create({
  staticWelcomeBg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  authVideoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  authVideo: {
    width: '100%',
    aspectRatio: 9 / 16,
    maxHeight: '80%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  particleAnchor: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  mainSubText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Arimo-Bold',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 30,
    paddingHorizontal: 20,
  },
  subLineTextTop: {
    fontSize: 18,
    fontFamily: 'Brittany-Signature',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: -2,
  },
  topBarSubText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Arimo-Bold',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 5,
    textShadowColor: '#00d4ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  globalOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingVertical: 20,
  },
  primaryButton: {
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(160, 220, 255, 0.6)',
    borderRadius: 14,
  },
  primaryButtonText: {
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    color: '#ffffff',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  trialText: {
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    flexShrink: 1,
  },
  link: {
    color: '#00a8cc',
  },
  separator: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    marginHorizontal: 6,
  },
  helpText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
  highlight: {
    fontWeight: '700',
    color: '#ffffff',
    fontSize: 14,
    textShadowColor: '#00d4ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    overflow: 'visible',
  },
  glowIcon: {
    color: '#ffffff',
    textShadowColor: '#00eaff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  contactLink: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
  },
});
