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
  SharedValue,
} from 'react-native-reanimated';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { textStyles } from '../../theme/typography';

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
  { x: 0,   y: -80, size: 2.5, color: NEON_BLUE,  delayMs: 500, durationMs: 1700 },
  { x: -30, y: -85, size: 2,   color: NEON_LIGHT, delayMs: 620, durationMs: 1300 },
  { x: 30,  y: -85, size: 2,   color: NEON_LIGHT, delayMs: 540, durationMs: 1500 },
  { x: -60, y: -78, size: 3,   color: NEON_GLOW,  delayMs: 700, durationMs: 1800 },
  { x: 60,  y: -78, size: 3,   color: NEON_GLOW,  delayMs: 760, durationMs: 1600 },
];

const Particle = React.memo(({ x, y, size, color, delayMs, durationMs }: typeof PARTICLES[number]) => {
  const opacity    = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(0.9, { duration: durationMs * 0.5, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.1, { duration: durationMs * 0.5, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    translateY.value = withDelay(
      delayMs,
      withRepeat(
        withSequence(
          withTiming(-5, { duration: durationMs, easing: Easing.inOut(Easing.sin) }),
          withTiming(5,  { duration: durationMs, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
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

const TextAnimation = React.memo(({ textAnimProgress, isAuthenticated, userName }: {
  textAnimProgress: SharedValue<number>;
  isAuthenticated: boolean;
  userName?: string;
}) => {
  const animStyle = useAnimatedStyle(() => {
    const translateY = interpolate(textAnimProgress?.value ?? 0, [0, 1], [0, -300], Extrapolate.CLAMP);
    return { transform: [{ translateY }] };
  });

  const title     = isAuthenticated ? `Bienvenue${userName ? `, ${userName}` : ''}` : 'HIPSTER-IA';
  const subFirst  = isAuthenticated ? 'Content de te revoir'  : "Créer avec l'IA,";
  const subSecond = isAuthenticated ? 'Créons quelque chose!' : "perfectionner avec l'agence";

  return (
    <Animated.View style={animStyle}>
      <Animated.Text style={styles.title}>{title}</Animated.Text>
      <Animated.Text style={styles.subFirst}>{subFirst}</Animated.Text>
      <Animated.Text style={styles.subSecond}>{subSecond}</Animated.Text>
    </Animated.View>
  );
});

const TopBar = ({ isAuthenticated, userName }) => {
  const insets = useSafeAreaInsets();
  const title = isAuthenticated ? `Bienvenue${userName ? `, ${userName}` : ''}` : 'HIPSTER-IA';

  return (
    <LinearGradient
      colors={['rgba(0,0,0,0.75)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0)']}
      locations={[0, 0.5, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 80 + insets.top,
        paddingTop: insets.top,
        paddingHorizontal: 20,
        zIndex: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#5230ff'
      }}
    >
      <Text h1>{title}</Text>
    </LinearGradient>
  );
};

const SubTextAnimation = React.memo(({ textAnimProgress, isAuthenticated }: {
  textAnimProgress: SharedValue<number>;
  isAuthenticated: boolean;
}) => {
  const animStyle = useAnimatedStyle(() => {
    const translateY = interpolate(textAnimProgress?.value ?? 0, [0, 1], [0, -300], Extrapolate.CLAMP);
    return { transform: [{ translateY }] };
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
      <Animated.Text style={styles.mainSubText}>VOTRE AGENCE MARKETING AUTOMATISÉE.</Animated.Text>
      <Animated.Text style={styles.subLineText}>DANS VOTRE POCHE.</Animated.Text>
    </Animated.View>
  );
});

// ─────────────────────────────────────────────────────────────
// HelpButton : bordure lumineuse tournante façon conic-gradient
// ─────────────────────────────────────────────────────────────
const HelpButton = React.memo(({ onPress }: { onPress: () => void }) => {
  const translateX = useSharedValue(-120);

  useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(120, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
        withTiming(-120, { duration: 1500, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <View style={styles.helpButtonWrapper}>

      {/* glow qui traverse la bordure */}
      <View style={styles.helpBorderMask}>
        <Animated.View style={[styles.helpGlow, animatedStyle]}>
          <LinearGradient
            colors={[
              "transparent",
              "#00d4ff",
              "#66e5ff",
              "#00d4ff",
              "transparent"
            ]}
            locations={[0, 0.35, 0.5, 0.65, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      </View>

      {/* masque centre */}
      <View style={styles.helpInnerBg} pointerEvents="none" />

      <Pressable style={styles.helpPressable} onPress={onPress}>
        <Text style={styles.helpLink}>Besoin d'aide ?</Text>
      </Pressable>

    </View>
  );
});
// ─────────────────────────────────────────────────────────────
// BottomAuthSection
// ─────────────────────────────────────────────────────────────
const BottomAuthSection = React.memo(({ isAuthenticated, onVideoFinish, textAnimProgress }: {
  isAuthenticated: boolean;
  onVideoFinish?: () => void;
  textAnimProgress: SharedValue<number>;
}) => {
  const router = useRouter();

  const animStyle = useAnimatedStyle(() => {
    // Le bloc part de juste sous la typo (bottom: -435 environ) vers sa position finale
    // translateY 350 = distance approximative entre la position finale du bloc et le bas de la typo
    const translateY = interpolate(
      textAnimProgress?.value ?? 0,
      [0, 1],
      [350, 0],
      Extrapolate.CLAMP
    );
    // Invisible tant qu'il est positionné sur la typo, apparaît progressivement ensuite
    const opacity = interpolate(
      textAnimProgress?.value ?? 0,
      [0, 0.4, 1],
      [0, 0, 1],
      Extrapolate.CLAMP
    );
    return { transform: [{ translateY }], opacity };
  });

  if (isAuthenticated) return null;

  const handleWelcomePress = () => { onVideoFinish?.(); router.push('/(onboarding)/welcome'); };
  const handleLoginPress   = () => { onVideoFinish?.(); router.push('/(auth)/login'); };
  const handleHelpPress    = () => { onVideoFinish?.(); router.push('/(auth)/help'); };

  return (
    <Animated.View style={[styles.bottomSection, animStyle]}>
      {/* Layer 0 : floor glow ellipse */}
      <View style={styles.primaryButtonFloorGlow} pointerEvents="none" />

      {/* Layer 1 : tight border glow */}
      <View style={styles.primaryBorderGlow} pointerEvents="none" />

      {/* Layer 2 : main button body — dark fill + electric border */}
<Pressable onPress={handleWelcomePress} style={styles.primaryButtonWrapper}>
  <View style={styles.primaryGlow} pointerEvents="none" />
  <LinearGradient
    colors={["#0a1628", "#050d1e", "#000000"]}
    start={{ x: 0.5, y: 0 }}
    end={{ x: 0.5, y: 1 }}
    style={[styles.primaryButtonBody]}
  >
    <Text style={styles.primaryButtonText}>COMMENCER MAINTENANT</Text>
  </LinearGradient>
</Pressable>

      <View style={styles.dividerContainer}>
        <Text style={styles.dividerText}>Déjà un compte ?</Text>
        <Pressable onPress={handleLoginPress}>
          <Text style={styles.secondaryLink}>Se connecter</Text>
        </Pressable>
      </View>

      <HelpButton onPress={handleHelpPress} />

      {/* ── Texte "7 jours d'essai gratuit" ── */}
      <View style={styles.trialContainer}>
        <Text style={styles.trialStar}>✦</Text>
        <Text style={styles.trialText}>
          <Text style={styles.trialHighlight}>7 jours</Text>
          {' '}d'essai gratuit · transformez votre business
        </Text>
        <Text style={styles.trialStar}>✦</Text>
      </View>

    </Animated.View>
  );
});

// ─────────────────────────────────────────────────────────────
// LoadingTransition (root)
// ─────────────────────────────────────────────────────────────
export const LoadingTransition = React.memo(({ onVideoFinish }: LoadingTransitionProps) => {
  const [videoReady, setVideoReady] = React.useState(false);
  const textAnimProgress = useSharedValue(0);
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  

  const videoPlayer = useVideoPlayer(videobg, (player) => {
    player.loop  = false;
    player.muted = true;
  });

  const isFinishedRef    = React.useRef(false);
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

    const onStatusChange  = ({ status }: { status: string }) => {
      if (status === 'readyToPlay') {
        setVideoReady(true);
        videoPlayer.play();
        SplashScreen.hideAsync().catch(() => {});
      }
    };

    const onPlayingChange = (payload: { isPlaying: boolean }) => {
      if (payload.isPlaying) startTracking();
    };

    if (videoPlayer.status === 'readyToPlay') {
      setVideoReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }
    if (videoPlayer.playing) startTracking();

    videoPlayer.addListener('statusChange',  onStatusChange);
    videoPlayer.addListener('playingChange', onPlayingChange);
    videoPlayer.addListener('playToEnd',     handleVideoFinish);

    return () => {
      videoPlayer.removeListener('statusChange',  onStatusChange);
      videoPlayer.removeListener('playingChange', onPlayingChange);
      videoPlayer.removeListener('playToEnd',     handleVideoFinish);
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

      <TopBar
        textAnimProgress={textAnimProgress}
        isAuthenticated={isAuthenticated}
        userName={user?.name || user?.email?.split('@')[0]}
      />

      <View style={styles.center}>
        <View style={styles.particleAnchor} pointerEvents="none">
          {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}
        </View>
        <SubTextAnimation textAnimProgress={textAnimProgress} isAuthenticated={isAuthenticated} />
      </View>

      <BottomAuthSection
        isAuthenticated={isAuthenticated}
        onVideoFinish={onVideoFinish}
        textAnimProgress={textAnimProgress}
      />
    </Animated.View>
  );
});

// ─────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    overflow: 'visible',
  },
  videoContainer: { marginTop: 130 },
  particleAnchor: {
    position: 'absolute',
    width: 0,
    height: 0,
    overflow: 'visible',
    bottom: 150,
  },
  topBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 100,
    paddingHorizontal: 20,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor : '#5230ff'
  },
  topBarTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 6,
    color: '#ff2f2f',
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
    bottom: -430,
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
    bottom: -428,
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
    left: 0, right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  primaryButtonGradient: {
    position: "absolute",
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 16,
  },
  primaryButtonBody: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#00d4ff",
    backgroundColor: "#020c1e",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
 primaryButtonWrapper: {
  width: "70%",
  height: 52,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  // Glow externe bleu diffus
  shadowColor: "#00aaff",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 1,
  shadowRadius: 22,
  elevation: 30,
},

primaryButtonBody: {
  width: "100%",
  height: "100%",
  borderRadius: 14,
  borderWidth: 1.5,
  borderColor: "rgba(160, 220, 255, 0.9)", // bordure blanc-bleuté
  backgroundColor: "#050d1e",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
  // Glow interne subtil sur la bordure
  shadowColor: "#ffffff",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
},

primaryGlow: {
  position: "absolute",
  width: "100%",
  height: "100%",
  borderRadius: 14,
  backgroundColor: "transparent",
  shadowColor: "#3399ff",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 1,
  shadowRadius: 30,
  elevation: 25,
},

primaryButtonText: {
  fontSize: 13,
  fontWeight: "700",
  letterSpacing: 1,
  color: "#ffffff",
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

  // ── HelpButton ──
  helpButtonWrapper: {},
  helpBorderMask: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
    overflow: "hidden",
  },
  helpGlow: {
    position: "absolute",
    width: 200,
    height: "100%",
  },
  helpInnerBg: {
    position: "absolute",
    top: 2,
    left: 2,
    right: 2,
    bottom: 2,
    borderRadius: 12,
    backgroundColor: "#000",
  },
  helpPressable: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  helpLink: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
    opacity: 0.7,
    letterSpacing: 0.3,
  },

  // ── Texte essai gratuit ──
  trialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
    opacity: 0.65,
  },
  trialStar: {
    fontSize: 8,
    color: '#00d4ff',
  },
  trialText: {
    fontSize: 11,
    fontWeight: '400',
    color: '#ffffff',
    letterSpacing: 0.4,
  },
  trialHighlight: {
    fontWeight: '700',
    color: '#00d4ff',
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

  primaryBorderGlow: {},
});