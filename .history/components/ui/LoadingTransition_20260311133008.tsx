import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from './Text';
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
} from 'react-native-reanimated';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NEON_BLUE = '#00d4ff';
const NEON_GLOW = '#0099ff';
const NEON_LIGHT = '#66e5ff';

const videobg = require('../../assets/video/splashVideo-fixed-mobile.mp4');

const PARTICLES = [
  { x: 0, y: -80, size: 2.5, color: NEON_BLUE, delayMs: 500, durationMs: 1700 },
  { x: -30, y: -85, size: 2, color: NEON_LIGHT, delayMs: 620, durationMs: 1300 },
  { x: 30, y: -85, size: 2, color: NEON_LIGHT, delayMs: 540, durationMs: 1500 },
  { x: -60, y: -78, size: 3, color: NEON_GLOW, delayMs: 700, durationMs: 1800 },
  { x: 60, y: -78, size: 3, color: NEON_GLOW, delayMs: 760, durationMs: 1600 },
];

const Particle = React.memo(({ x, y, size, color, delayMs, durationMs }) => {
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

interface LoadingTransitionProps {
  onVideoFinish?: () => void;
}

const TopBar = ({ isAuthenticated, userName }) => {
  const insets = useSafeAreaInsets();
  const title = isAuthenticated ? `Bienvenue${userName ? `, ${userName}` : ''}` : 'HIPSTER IA';

  return (
    <View style={[styles.topBar, { height: 60 + insets.top, paddingTop: insets.top - 10 }]}>
      <Text h1>{title}</Text>
    </View>
  );
};

const SubTextAnimation = React.memo(({ textAnimProgress, isAuthenticated }) => {
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
        <Animated.Text style={styles.mainSubText}>CONTENT DE TE REVOIR</Animated.Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={animStyle}>
      <Animated.Text style={styles.mainSubText}>L'agence marketing automatisée.</Animated.Text>
      <Animated.Text style={styles.subLineText}>Dans votre poche.</Animated.Text>
    </Animated.View>
  );
});

const BottomAuthSection = React.memo(({ isAuthenticated, onVideoFinish, textAnimProgress }) => {
  const router = useRouter();

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
    <Animated.View style={[styles.container, animStyle]}>
      <Pressable
        onPress={() => {
          onVideoFinish?.();
          router.push('/(onboarding)/welcome');
        }}
        style={styles.primaryButton}
      >
        <LinearGradient
          colors={['#0a1628', '#050d1e', '#000000']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.gradient}
        >
          <Text style={styles.primaryButtonText}>Commencer maintenant</Text>
        </LinearGradient>
      </Pressable>

      <View style={styles.row}>
        <Text style={styles.mutedText}>Déjà un compte ?</Text>
        <Pressable
          onPress={() => {
            onVideoFinish?.();
            router.push('/(auth)/login');
          }}
        >
          <Text style={styles.link}>Se connecter</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={() => {
          onVideoFinish?.();
          router.push('/(auth)/help');
        }}
      >
        <Text style={styles.helpText}>Besoin d'aide ?</Text>
      </Pressable>

      <View style={styles.row}>
        <Text style={styles.star}>✦</Text>
        <Text style={styles.trialText}>
          <Text style={styles.highlight}>7 jours</Text> d'essai gratuit · transformez votre business
        </Text>
        <Text style={styles.star}>✦</Text>
      </View>
    </Animated.View>
  );
});

export const LoadingTransition = React.memo(({ onVideoFinish }: LoadingTransitionProps) => {
  const [videoReady, setVideoReady] = React.useState(false);
  const textAnimProgress = useSharedValue(0);
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  const videoPlayer = useVideoPlayer(videobg, (player) => {
    player.loop = false;
    player.muted = true;
  });

  const isFinishedRef = React.useRef(false);
  const playbackTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!videoPlayer) return;

    const handleVideoFinish = () => {
      if (isFinishedRef.current) return;
      isFinishedRef.current = true;

      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }

      textAnimProgress.value = withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.quad),
      });

      setTimeout(() => {
        if (isHydrated && isAuthenticated) onVideoFinish?.();
      }, 2000);
    };

    const startTracking = () => {
      if (isFinishedRef.current || playbackTimerRef.current) return;
      playbackTimerRef.current = setTimeout(handleVideoFinish, 5000);
    };

    const onStatusChange = ({ status }) => {
      if (status === 'readyToPlay') {
        setVideoReady(true);
        videoPlayer.play();
        SplashScreen.hideAsync().catch(() => {});
      }
    };

    const onPlayingChange = (payload) => {
      if (payload.isPlaying) startTracking();
    };

    if (videoPlayer.status === 'readyToPlay') {
      setVideoReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }
    if (videoPlayer.playing) startTracking();

    videoPlayer.addListener('statusChange', onStatusChange);
    videoPlayer.addListener('playingChange', onPlayingChange);
    videoPlayer.addListener('playToEnd', handleVideoFinish);

    return () => {
      videoPlayer.removeListener('statusChange', onStatusChange);
      videoPlayer.removeListener('playingChange', onPlayingChange);
      videoPlayer.removeListener('playToEnd', handleVideoFinish);
      if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    };
  }, [videoPlayer, onVideoFinish, isHydrated, isAuthenticated]);

  return (
    <Animated.View exiting={FadeOut.duration(400)} style={StyleSheet.absoluteFill}>
      <StatusBar style="light" />
      {!videoReady && <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]} />}

      <View style={[StyleSheet.absoluteFill, styles.videoContainer]}>
        <VideoView player={videoPlayer} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
      </View>

      {/* Overlay placé APRÈS la vidéo mais AVANT le contenu */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']}
        locations={[0, 0.5, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.globalOverlay}
        pointerEvents="none"
      />

      {/* Contenu au-dessus de l'overlay */}
      <View style={StyleSheet.absoluteFill}>
        <TopBar isAuthenticated={isAuthenticated} userName={user?.name || user?.email?.split('@')[0]} />

        <View style={styles.center}>
          <View style={styles.particleAnchor} pointerEvents="none">
            {PARTICLES.map((p, i) => (
              <Particle key={i} {...p} />
            ))}
          </View>
          <SubTextAnimation textAnimProgress={textAnimProgress} isAuthenticated={isAuthenticated} />
        </View>

        <BottomAuthSection
          isAuthenticated={isAuthenticated}
          onVideoFinish={onVideoFinish}
          textAnimProgress={textAnimProgress}
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
  videoContainer: {
    marginTop: 100,
  },
  particleAnchor: {
    position: 'absolute',
    width: 0,
    height: 0,
    bottom: 150,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#09080E',
  },
  mainSubText: {
    fontSize: 32,
    fontWeight : 700,
    fontFamily: 'Arimo-Bold',
    color: '#ffffff',
    textAlign: 'center',
    bottom: -430,
    textShadowColor: '#00d4ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  subLineText: {
    paddingTop: 10,
    paddingBottom: 30,
    fontSize: 32,
    fontFamily: 'Brittany-Signature',
    color: '#ffffff',
    textAlign: 'center',
    bottom: -428,
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
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
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  primaryButton: {
    width: '70%',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#00aaff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    paddingTop : 10,
    elevation: 10,
  },
  gradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(160, 220, 255, 0.6)',
    borderRadius: 14,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  mutedText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  link: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00a8cc',
  },
  helpText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  star: {
    fontSize: 8,
    color: '#00d4ff',
  },
  trialText: {
    fontSize: 11,
    fontWeight: '400',
    color: '#ffffff',
    opacity: 0.7,
  },
  highlight: {
    fontWeight: '700',
    color: '#00d4ff',
  },
});