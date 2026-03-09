import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

const NEON_BLUE = '#00d4ff';
const NEON_GLOW = '#0099ff';
const NEON_LIGHT = '#66e5ff';

const videobg = require('../../assets/video/splashVideo-fixed-mobile.mp4');

const PARTICLES: {
  x: number;
  y: number;
  size: number;
  color: string;
  delayMs: number;
  durationMs: number;
}[] = [
    { x: 0, y: -80, size: 2.5, color: NEON_BLUE, delayMs: 500, durationMs: 1700 },
    { x: -30, y: -85, size: 2, color: NEON_LIGHT, delayMs: 620, durationMs: 1300 },
    { x: 30, y: -85, size: 2, color: NEON_LIGHT, delayMs: 540, durationMs: 1500 },
    { x: -60, y: -78, size: 3, color: NEON_GLOW, delayMs: 700, durationMs: 1800 },
    { x: 60, y: -78, size: 3, color: NEON_GLOW, delayMs: 760, durationMs: 1600 },
    // Ajoute les autres particules comme dans ton code
  ];

const Particle = React.memo(({ x, y, size, color, delayMs, durationMs }: typeof PARTICLES[number]) => {
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

const TextAnimation = React.memo(({ textAnimProgress, isAuthenticated, userName }: { textAnimProgress: SharedValue<number>; isAuthenticated: boolean; userName?: string }) => {
  const animStyle = useAnimatedStyle(() => {
    const progress = textAnimProgress?.value ?? 0;
    const translateY = interpolate(
      progress,
      [0, 1],
      [0, -300],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
    };
  });

  // Textes différents selon l'authentification
  const title = isAuthenticated ? `Bienvenue${userName ? `, ${userName}` : ''}` : 'HIPSTER-IA';
  const subFirst = isAuthenticated ? 'Content de te revoir' : 'Créer avec l\'IA,';
  const subSecond = isAuthenticated ? 'Créons quelque chose!' : 'perfectionner avec l\'agence';

  return (
    <Animated.View style={[animStyle]}>
      <Animated.Text style={styles.title}>{title}</Animated.Text>
      <Animated.Text style={styles.subFirst}>{subFirst}</Animated.Text>
      <Animated.Text style={styles.subSecond}>{subSecond}</Animated.Text>
    </Animated.View>
  );
});

const TopBar = React.memo(({ textAnimProgress, isAuthenticated, userName }: { textAnimProgress: SharedValue<number>; isAuthenticated: boolean; userName?: string }) => {
  const title = isAuthenticated ? `Bienvenue${userName ? `, ${userName}` : ''}` : 'HIPSTER-IA';

  return (
    <LinearGradient
      colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0)']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.topBar]}
    >
      <Text style={styles.topBarTitle}>{title}</Text>
    </LinearGradient>
  );
});

const SubTextAnimation = React.memo(({ textAnimProgress, isAuthenticated }: { textAnimProgress: SharedValue<number>; isAuthenticated: boolean }) => {
  const animStyle = useAnimatedStyle(() => {
    const progress = textAnimProgress?.value ?? 0;
    const translateY = interpolate(
      progress,
      [0, 1],
      [0, -300],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
    };
  });

  if (isAuthenticated) {
    return (
      <Animated.View style={[animStyle]}>
        <Animated.Text style={styles.mainSubText}>CONTENT DE TE REVOIR</Animated.Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[animStyle]}>
      <Animated.Text style={styles.mainSubText}>VOTRE AGENCE MARKETING AUTOMATISÉE.</Animated.Text>
      <Animated.Text style={styles.subLineText}>DANS VOTRE POCHE.</Animated.Text>
    </Animated.View>
  );
});

const BottomAuthSection = React.memo(({ isAuthenticated, onVideoFinish, textAnimProgress }: { isAuthenticated: boolean; onVideoFinish?: () => void; textAnimProgress: SharedValue<number> }) => {
  const router = useRouter();

  if (isAuthenticated) return null;

  const handleWelcomePress = () => {
    onVideoFinish?.();
    router.push('/(onboarding)/welcome');
  };

  const handleLoginPress = () => {
    onVideoFinish?.();
    router.push('/(auth)/login');
  };

  const handleHelpPress = () => {
    onVideoFinish?.();
    router.push('/(auth)/help');
  };

  const animStyle = useAnimatedStyle(() => {
    const progress = textAnimProgress?.value ?? 0;
    const translateY = interpolate(
      progress,
      [0, 1],
      [200, 0],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY }],
    };
  });

  return (
    <Animated.View style={[styles.bottomSection, animStyle]}>
      {/* Layer 0: floor glow ellipse */}
      <View style={styles.primaryButtonFloorGlow} pointerEvents="none" />

      {/* Layer 1: tight border glow */}
      <View style={styles.primaryBorderGlow} pointerEvents="none" />

      {/* Layer 2: main button body — dark fill + electric border */}
      <Pressable onPress={handleWelcomePress} style={styles.primaryButtonBody}>
        <View style={[StyleSheet.absoluteFillObject, { borderRadius: 14, overflow: 'hidden' }]}>
          <LinearGradient
            colors={['#020c1e', '#010810']}
            style={StyleSheet.absoluteFillObject}
          />
          <LinearGradient
            colors={['rgba(80, 170, 255, 0.18)', 'transparent']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.5 }}
            style={StyleSheet.absoluteFillObject}
          />
          <LinearGradient
            colors={['transparent', 'rgba(40, 130, 255, 0.08)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFillObject}
          />
        </View>
        <Text style={styles.primaryButtonText}>COMMENCER MAINTENANT</Text>
      </Pressable>

      <View style={styles.dividerContainer}>
        <Text style={styles.dividerText}>Déjà un compte ?</Text>
        <Pressable onPress={handleLoginPress}>
          <Text style={styles.secondaryLink}>Se connecter</Text>
        </Pressable>
      </View>

      <Pressable onPress={handleHelpPress} style={styles.helpButton}>
        <Text style={styles.helpLink}>Besoin d'aide ?</Text>
      </Pressable>
    </Animated.View>
  );
});

export const LoadingTransition = React.memo(({ onVideoFinish }: LoadingTransitionProps) => {
  const [videoReady, setVideoReady] = React.useState(false);
  const textAnimProgress = useSharedValue(0);
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  const videoPlayer = useVideoPlayer(videobg, (player) => {
    player.loop = false;
    player.muted = false;
  });

  const isFinishedRef = React.useRef(false);
  const playbackTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!videoPlayer) return;

    const handleVideoFinish = () => {
      if (isFinishedRef.current) return;
      isFinishedRef.current = true;

      // Cleanup existing playback timer 
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }

      // Animation: Slide up des typologies - lent et fluide
      textAnimProgress.value = withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.quad),
      });

      // Délai final de 2 secondes avant de signaler la fin au layout
      // ATTENDRE QUE isHydrated = true pour vérifier isAuthenticated
      // SI HYDRATÉ ET AUTHENTIFIÉ: Continue vers l'accueil
      // SINON: Reste figé au LoadingTransition
      setTimeout(() => {
        if (isHydrated && isAuthenticated) {
          onVideoFinish?.();
        }
      }, 2000);
    };

    const startTracking = () => {
      if (isFinishedRef.current || playbackTimerRef.current) return;
      // TRAQUEUR PRÉCIS: On compte exactement 5 secondes de lecture
      playbackTimerRef.current = setTimeout(handleVideoFinish, 5000);
    };

    // Jouer seulement quand prêt
    const onStatusChange = ({ status }: { status: string }) => {
      if (status === 'readyToPlay') {
        setVideoReady(true);
        videoPlayer.play();
        SplashScreen.hideAsync().catch(() => { });
        // Si la lecture démarre suite au play(), on traquera via playingChange
      }
    };

    const onPlayingChange = (payload: { isPlaying: boolean }) => {
      if (payload.isPlaying) {
        startTracking();
      }
    };

    // Check immediately if already ready or playing (race condition fix)
    if (videoPlayer.status === 'readyToPlay') {
      setVideoReady(true);
      SplashScreen.hideAsync().catch(() => { });
    }

    if (videoPlayer.playing) {
      startTracking();
    }

    videoPlayer.addListener('statusChange', onStatusChange);
    videoPlayer.addListener('playingChange', onPlayingChange);
    videoPlayer.addListener('playToEnd', handleVideoFinish);

    return () => {
      videoPlayer.removeListener('statusChange', onStatusChange);
      videoPlayer.removeListener('playingChange', onPlayingChange);
      videoPlayer.removeListener('playToEnd', handleVideoFinish);
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
      }
    };
  }, [videoPlayer, onVideoFinish, isHydrated, isAuthenticated]);

  return (
    <Animated.View exiting={FadeOut.duration(400)} style={StyleSheet.absoluteFill}>
      <StatusBar style="light" />
      {/* Background noir avant que la vidéo ne soit prête */}
      {!videoReady && <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]} />}
      {/* Video */}
      <View style={[StyleSheet.absoluteFill, styles.videoContainer]}>
        <VideoView player={videoPlayer} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} isMuted={true} />
      </View>

      {/* Top Bar avec le titre */}
      <TopBar
        textAnimProgress={textAnimProgress}
        isAuthenticated={isAuthenticated}
        userName={user?.name || user?.email?.split('@')[0]}
      />

      {/* Contenu central - Particules */}
      <View style={styles.center}>
        <View style={styles.particleAnchor} pointerEvents="none">
          {PARTICLES.map((p, i) => (
            <Particle key={i} {...p} />
          ))}
        </View>

        <SubTextAnimation
          textAnimProgress={textAnimProgress}
          isAuthenticated={isAuthenticated}
        />
      </View>

      {/* Bottom Auth Section */}
      <BottomAuthSection
        isAuthenticated={isAuthenticated}
        onVideoFinish={onVideoFinish}
        textAnimProgress={textAnimProgress}
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    overflow: 'visible',
  },
  videoContainer: {
    marginTop: 100,
  },
  particleAnchor: {
    position: 'absolute',
    width: 0,
    height: 0,
    overflow: 'visible',
    bottom: 150,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 6,
    color: '#ffffff',
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 8,
    color: '#ffffff',
    bottom: -450,
  },
  mainSubText: {
    marginTop: 0,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 20,
    bottom: -435,
    lineHeight: 20,
    textShadowColor: '#00d4ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  subLineText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 20,
    bottom: -433,
    lineHeight: 18,
    textShadowColor: '#00d4ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  subFirst: {
    marginTop: 12,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 30,
    bottom: -450,
  },
  subSecond: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 1,
    color: '#ffffff',
    textTransform: 'lowercase',
    textAlign: 'center',
    paddingHorizontal: 20,
    bottom: -450,
  },
bottomSection: {
  position: 'absolute',
  bottom: 50,
  left: 0,
  right: 0,
  alignItems: 'center',
  paddingHorizontal: 20,
  gap: 8, // petit espace entre les éléments enfants
},
  primaryBorderGlow: {
    position: 'absolute',
    width: '72%',
    height: 54,
    borderRadius: 20,
    backgroundColor: 'transparent',
    shadowColor: '#1a8fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 18,
  },
  primaryButtonBody: {
    width: '70%',
    height: 46,
    borderRadius: 14,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1e9bff',
    shadowColor: '#1a8fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 20,
    overflow: 'visible',
  },
  primaryButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.6,
    textShadowColor: '#1a8fff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  dividerContainer: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    opacity: 0.7,
    letterSpacing: 0.3,
    marginRight: 8,
  },
  secondaryLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00a8cc',
    letterSpacing: 0.3,
  },
helpButton: {
  marginTop: 8,
  borderWidth: 1.5,
  borderColor: '#00d4ff',
  borderRadius: 14,
  paddingVertical: 10,
  paddingHorizontal: 32,
  shadowColor: '#00d4ff',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.6,
  shadowRadius: 8,
  elevation: 10,
},
  helpLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    opacity: 0.6,
    letterSpacing: 0.3,
  },
  primaryButtonFloorGlow: {
    position: 'absolute',
    bottom: -35,
    left: '50%',
    marginLeft: -90,
    width: 180,
    height: 50,
    borderRadius: 90,
    backgroundColor: 'transparent',
    shadowColor: '#1a6fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 35,
    elevation: 30,
  },
});