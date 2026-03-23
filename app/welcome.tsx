import React, { useEffect, useRef } from 'react';
import { Linking } from 'react-native';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { Text } from '../components/ui/Text';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeOut,
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
const reloadingScreen = require('../assets/video/reloadignScreen.mp4');
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

  const title = isAuthenticated ? `Bienvenue${userName ? `, ${userName}` : ''}` : 'HIPSTER IA';

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
      <Text h1 style={{ fontSize: responsive.fontSize['3xl'] }}>{title}</Text>
      {!isAuthenticated && (
        <>
          <Animated.Text style={[styles.topBarSubText, { fontSize: responsive.fontSize.lg }]}>
            L'agence marketing automatisée
          </Animated.Text>
          <Animated.Text style={[styles.subLineTextTop, { fontSize: responsive.fontSize.base }]}>
            Dans votre poche.
          </Animated.Text>
        </>
      )}
    </Animated.View>
  );
};

interface SubTextAnimationProps {
  textAnimProgress: SharedValue<number>;
  isAuthenticated: boolean;
}

const SubTextAnimation = React.memo(({ textAnimProgress, isAuthenticated }: SubTextAnimationProps) => {
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

  if (isAuthenticated) {
    return (
      <Animated.View style={animStyle}>
        <Animated.Text style={[styles.mainSubText, { fontSize: responsive.fontSize.lg, bottom: responsive.mainSubTextBottom }]}>
          CONTENT DE TE REVOIR
        </Animated.Text>
      </Animated.View>
    );
  }

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
          console.log('[Welcome] Commencer clicked');
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
            console.log('[Welcome] Login clicked');
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

export default React.memo(function WelcomeScreen({ onVideoFinish, setIsRouting }: WelcomeScreenProps) {
  const [videoReady, setVideoReady] = React.useState(false);
  const { isReturningFromBack, setIsReturningFromBack, videoCompleted, setVideoCompleted } = useWelcomeVideoStore();
  // Image is ONLY shown if explicitly returning from back or after logout.
  // Global completion state (videoCompleted) should NOT trigger the image.
  const showImage = isReturningFromBack;
  const shouldSkipPlay = videoCompleted || isReturningFromBack;
  
  const textAnimProgress = useSharedValue(shouldSkipPlay ? 1 : 0);
  const videoMarginTop = useSharedValue(shouldSkipPlay ? 100 : 0);
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const insets = useSafeAreaInsets();
  const responsive = useResponsiveDimensions();
  const videoCompletedRef = useRef(false);
  const topBarHeight = responsive.topBarHeight + insets.top;

  // Sync store state with ref
  React.useEffect(() => {
    // Only reset if NOT returning from back - keep flag persistent
    if (!isReturningFromBack) {
      videoCompletedRef.current = false;
    }
  }, [isReturningFromBack]);

  // When returning from back, freeze animations in final state and show static image
  React.useEffect(() => {
    if (isReturningFromBack) {
      // Set animations to their final state immediately - no animations
      textAnimProgress.value = 1; // Text fully animated in
      videoMarginTop.value = 100; // Video fully animated up
      // Mark as finished to prevent video playback logic from triggering
      isFinishedRef.current = true;
      // CRITICAL: Signal to RootLayout that "video" (overlay) is done
      onVideoFinish?.();
    }
  }, [isReturningFromBack, textAnimProgress, videoMarginTop, onVideoFinish]);

  // Select video based on authentication status
  const selectedVideo = isAuthenticated ? reloadingScreen : videobg;

  const videoPlayer = useVideoPlayer(selectedVideo, (player) => {
    player.loop = false;
    player.muted = true;
  });

  console.log('[Welcome] Video selection:', { isAuthenticated, selectedVideo: isAuthenticated ? 'reloading' : 'splash' });

  const isFinishedRef = React.useRef(shouldSkipPlay);
  const playbackTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!videoPlayer || shouldSkipPlay) {
      if (videoPlayer && videoCompleted && !isReturningFromBack) {
        // If video already completed in overlay, ensure this instance is at the end
        const duration = videoPlayer.duration ?? 0;
        if (duration > 0) {
          videoPlayer.seekBy(duration - videoPlayer.currentTime);
          videoPlayer.pause();
        }
      }
      return; 
    }

    const onPlaybackFinish = () => {
      if (isFinishedRef.current) return;
      videoCompletedRef.current = true;

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
        // Seek to the absolute end of the video to show last frame
        const duration = videoPlayer?.duration ?? 0;
        if (duration > 0 && videoPlayer) {
          videoPlayer.seekBy(duration - videoPlayer.currentTime);
          videoPlayer.pause(); // Freeze on last frame
        }
        
        // Mark as completed globally
        setVideoCompleted(true);
        
        // CRITICAL: Signal to RootLayout that "video" (overlay) is done 
        onVideoFinish?.();
      }, 2000);
    };

    const startTracking = () => {
      if (isFinishedRef.current || playbackTimerRef.current) return;
      playbackTimerRef.current = setTimeout(onPlaybackFinish, 5000);
    };

    const onStatusChange = ({ status }: { status: 'idle' | 'loading' | 'readyToPlay' | 'error' }) => {
      if (status === 'readyToPlay') {
        setVideoReady(true);
        videoPlayer.play();
        SplashScreen.hideAsync().catch(() => { });
      }
    };

    const onPlayingChange = (payload: { isPlaying: boolean }) => {
      if (payload.isPlaying) startTracking();
    };

    if (videoPlayer.status === 'readyToPlay') {
      setVideoReady(true);
      videoPlayer.play();
      SplashScreen.hideAsync().catch(() => { });
    }
    if (videoPlayer.playing) startTracking();

    videoPlayer.addListener('statusChange', onStatusChange);
    videoPlayer.addListener('playingChange', onPlayingChange);
    videoPlayer.addListener('playToEnd', onPlaybackFinish);

    return () => {
      videoPlayer.removeListener('statusChange', onStatusChange);
      videoPlayer.removeListener('playingChange', onPlayingChange);
      videoPlayer.removeListener('playToEnd', onPlaybackFinish);
      if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    };
  }, [videoPlayer, onVideoFinish, isHydrated, isAuthenticated, isReturningFromBack]);

  const videoAnimatedStyle = useAnimatedStyle(() => ({
    marginTop: videoMarginTop.value,
  }));

  return (
    <Animated.View exiting={FadeOut.duration(400)} style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]}>
      <StatusBar style="light" />
      {!videoReady && <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]} />}

      {showImage ? (
        // Show static image when returning from packs with frozen animations
        <Animated.View style={[{ position: 'absolute', top: topBarHeight - 20, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }]}>
          <Image source={bgAfterBack} style={{ width: '120%', height: '120%' }} resizeMode="contain" />
        </Animated.View>
      ) : (
        // Show video during normal flow
        <Animated.View style={[StyleSheet.absoluteFill, videoAnimatedStyle]}>
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
          isAuthenticated={isAuthenticated}
          userName={user?.name || user?.email?.split('@')[0]}
        />

        <View style={styles.center}>
          <View style={[styles.particleAnchor, { bottom: responsive.particleBottom }]} pointerEvents="none">
            {PARTICLES.map((p, i) => (
              <Particle key={i} {...p} />
            ))}
          </View>
          <SubTextAnimation textAnimProgress={textAnimProgress} isAuthenticated={isAuthenticated} />
        </View>

        <BottomAuthSection
          isAuthenticated={isAuthenticated}
          onVideoFinish={onVideoFinish}
          setIsRouting={setIsRouting}
          textAnimProgress={textAnimProgress}
          setIsReturningFromBack={setIsReturningFromBack}
        />
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trial: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    color: '#00a8cc',
  },
  separator: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    marginHorizontal: 4,
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