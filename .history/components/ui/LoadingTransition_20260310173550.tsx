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

// ─── Constants ────────────────────────────────────────────────
const NEON_BLUE  = '#00d4ff';
const NEON_GLOW  = '#0099ff';
const NEON_LIGHT = '#66e5ff';
const videobg    = require('../../assets/video/splashVideo-fixed-mobile.mp4');

const PARTICLES = [
  { x: 0,   y: -80, size: 2.5, color: NEON_BLUE,  delayMs: 500,  durationMs: 1700 },
  { x: -30, y: -85, size: 2,   color: NEON_LIGHT, delayMs: 620,  durationMs: 1300 },
  { x: 30,  y: -85, size: 2,   color: NEON_LIGHT, delayMs: 540,  durationMs: 1500 },
  { x: -60, y: -78, size: 3,   color: NEON_GLOW,  delayMs: 700,  durationMs: 1800 },
  { x: 60,  y: -78, size: 3,   color: NEON_GLOW,  delayMs: 760,  durationMs: 1600 },
] as const;

// ─── Particle ─────────────────────────────────────────────────
const Particle = React.memo(({ x, y, size, color, delayMs, durationMs }: typeof PARTICLES[number]) => {
  const opacity    = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delayMs, withRepeat(
      withSequence(
        withTiming(0.9, { duration: durationMs * 0.5, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.1, { duration: durationMs * 0.5, easing: Easing.inOut(Easing.sin) }),
      ), -1, true,
    ));
    translateY.value = withDelay(delayMs, withRepeat(
      withSequence(
        withTiming(-5, { duration: durationMs, easing: Easing.inOut(Easing.sin) }),
        withTiming(5,  { duration: durationMs, easing: Easing.inOut(Easing.sin) }),
      ), -1, true,
    ));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[{
      position: 'absolute',
      left: x, top: y,
      width: size, height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      shadowColor: color,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 1,
      shadowRadius: size * 3,
      elevation: 5,
    }, animStyle]} />
  );
});

// ─── TopBar ───────────────────────────────────────────────────
const TopBar = React.memo(({ isAuthenticated, userName }: {
  isAuthenticated: boolean;
  userName?: string;
}) => (
  <LinearGradient
    colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.4)', 'transparent']}
    locations={[0, 0.6, 1]}
    start={{ x: 0.5, y: 0 }}
    end={{ x: 0.5, y: 1 }}
    style={styles.topBar}
  >
    <Text style={styles.topBarTitle}>
      {isAuthenticated ? `Bienvenue${userName ? `, ${userName}` : ''}` : 'HIPSTER-IA'}
    </Text>
  </LinearGradient>
));

// ─── SubText — invisible until video ends ─────────────────────
// KEY FIX: no absolute bottom values on text, opacity starts at 0
const SubTextAnimation = React.memo(({ progress, isAuthenticated }: {
  progress: SharedValue<number>;
  isAuthenticated: boolean;
}) => {
  const animStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.6, 1], [0, 0, 1], Extrapolate.CLAMP),
    transform: [{
      translateY: interpolate(progress.value, [0, 1], [20, 0], Extrapolate.CLAMP),
    }],
  }));

  return (
    <Animated.View style={[styles.subTextBlock, animStyle]} pointerEvents="none">
      {isAuthenticated ? (
        <Text style={styles.mainSubText}>CONTENT DE TE REVOIR</Text>
      ) : (
        <>
          <Text style={styles.mainSubText}>VOTRE AGENCE MARKETING AUTOMATISÉE.</Text>
          <Text style={styles.subLineText}>DANS VOTRE POCHE.</Text>
        </>
      )}
    </Animated.View>
  );
});

// ─── HelpButton ───────────────────────────────────────────────
const HelpButton = React.memo(({ onPress }: { onPress: () => void }) => {
  const translateX = useSharedValue(-120);

  useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(120,  { duration: 1500, easing: Easing.inOut(Easing.quad) }),
        withTiming(-120, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
      ), -1, false,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={styles.helpWrapper}>
      <View style={styles.helpBorderMask}>
        <Animated.View style={[styles.helpGlow, glowStyle]}>
          <LinearGradient
            colors={['transparent', NEON_BLUE, NEON_LIGHT, NEON_BLUE, 'transparent']}
            locations={[0, 0.35, 0.5, 0.65, 1]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      </View>
      <View style={styles.helpInnerBg} pointerEvents="none" />
      <Pressable style={styles.helpPressable} onPress={onPress}>
        <Text style={styles.helpText}>Besoin d'aide ?</Text>
      </Pressable>
    </View>
  );
});

// ─── BottomAuthSection ────────────────────────────────────────
const BottomAuthSection = React.memo(({ isAuthenticated, onVideoFinish, progress }: {
  isAuthenticated: boolean;
  onVideoFinish?: () => void;
  progress: SharedValue<number>;
}) => {
  const router = useRouter();

  // Starts fully transparent + shifted down, animates in after video
  const animStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.5, 1], [0, 0, 1], Extrapolate.CLAMP),
    transform: [{
      translateY: interpolate(progress.value, [0, 1], [60, 0], Extrapolate.CLAMP),
    }],
  }));

  if (isAuthenticated) return null;

  const go = (path: string) => { onVideoFinish?.(); router.push(path as any); };

  return (
    <Animated.View style={[styles.bottomSection, animStyle]}>
      {/* CTA */}
      <Pressable onPress={() => go('/(onboarding)/welcome')} style={styles.ctaWrapper}>
        <LinearGradient
          colors={['#1a3a6e', '#040612']}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.ctaBody}
        >
          <Text style={styles.ctaText}>COMMENCER MAINTENANT</Text>
        </LinearGradient>
      </Pressable>

      {/* Login */}
      <View style={styles.loginRow}>
        <Text style={styles.loginLabel}>Déjà un compte ?</Text>
        <Pressable onPress={() => go('/(auth)/login')}>
          <Text style={styles.loginLink}>Se connecter</Text>
        </Pressable>
      </View>

      <HelpButton onPress={() => go('/(auth)/help')} />

      {/* Trial */}
      <View style={styles.trialRow}>
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

// ─── Root ─────────────────────────────────────────────────────
interface LoadingTransitionProps { onVideoFinish?: () => void; }

export const LoadingTransition = React.memo(({ onVideoFinish }: LoadingTransitionProps) => {
  const [videoReady, setVideoReady]  = React.useState(false);
  const progress                     = useSharedValue(0);
  const { isAuthenticated, user, isHydrated } = useAuthStore();
  const isFinishedRef    = React.useRef(false);
  const playbackTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const videoPlayer = useVideoPlayer(videobg, (player) => {
    player.loop  = false;
    player.muted = true;
  });

  useEffect(() => {
    if (!videoPlayer) return;

    const revealUI = () => {
      if (isFinishedRef.current) return;
      isFinishedRef.current = true;
      if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);

      // Animate progress 0 → 1, which drives all sub-animations
      progress.value = withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) });
      setTimeout(() => { if (isHydrated && isAuthenticated) onVideoFinish?.(); }, 2000);
    };

    const onStatus = ({ status }: { status: string }) => {
      if (status === 'readyToPlay') {
        setVideoReady(true);
        videoPlayer.play();
        SplashScreen.hideAsync().catch(() => {});
      }
    };

    const onPlaying = ({ isPlaying }: { isPlaying: boolean }) => {
      if (isPlaying && !playbackTimerRef.current)
        playbackTimerRef.current = setTimeout(revealUI, 5000);
    };

    if (videoPlayer.status === 'readyToPlay') {
      setVideoReady(true);
      SplashScreen.hideAsync().catch(() => {});
    }
    if (videoPlayer.playing && !playbackTimerRef.current)
      playbackTimerRef.current = setTimeout(revealUI, 5000);

    videoPlayer.addListener('statusChange',  onStatus);
    videoPlayer.addListener('playingChange', onPlaying);
    videoPlayer.addListener('playToEnd',     revealUI);

    return () => {
      videoPlayer.removeListener('statusChange',  onStatus);
      videoPlayer.removeListener('playingChange', onPlaying);
      videoPlayer.removeListener('playToEnd',     revealUI);
      if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    };
  }, [videoPlayer, onVideoFinish, isHydrated, isAuthenticated]);

  return (
    <Animated.View exiting={FadeOut.duration(400)} style={StyleSheet.absoluteFill}>
      <StatusBar style="light" />

      {/* Black until video ready */}
      {!videoReady && <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]} />}

      {/* Full-screen video */}
      <View style={StyleSheet.absoluteFill}>
        <VideoView
          player={videoPlayer}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
        />
      </View>

      {/* Bottom gradient so text stays legible over the video */}
      <LinearGradient
        colors={['transparent', 'transparent', 'rgba(0,0,0,0.65)', 'rgba(0,0,0,0.95)']}
        locations={[0, 0.4, 0.68, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Top title bar */}
      <TopBar
        isAuthenticated={isAuthenticated}
        userName={user?.name || user?.email?.split('@')[0]}
      />

      {/* Particles */}
      <View style={styles.particleAnchor} pointerEvents="none">
        {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}
      </View>

      {/* Sub-text (fades in after video) */}
      <View style={styles.subTextAnchor} pointerEvents="none">
        <SubTextAnimation progress={progress} isAuthenticated={isAuthenticated} />
      </View>

      {/* Bottom CTA (slides + fades in after video) */}
      <BottomAuthSection
        isAuthenticated={isAuthenticated}
        onVideoFinish={onVideoFinish}
        progress={progress}
      />
    </Animated.View>
  );
});

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Sub-text sits just above the bottom section
  subTextAnchor: {
    position: 'absolute',
    bottom: 230,
    left: 0, right: 0,
    alignItems: 'center',
  },
  subTextBlock: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  mainSubText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 22,
    textShadowColor: NEON_BLUE,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  subLineText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 18,
    textShadowColor: NEON_BLUE,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },

  // Particles
  particleAnchor: {
    position: 'absolute',
    bottom: '38%',
    left: '50%',
    width: 0,
    height: 0,
    overflow: 'visible',
  },

  // TopBar
  topBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    paddingTop: 44,
    paddingBottom: 50,
    paddingHorizontal: 20,
    zIndex: 10,
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 7,
    color: '#fff',
    textAlign: 'center',
  },

  // Bottom section
  bottomSection: {
    position: 'absolute',
    bottom: 44,
    left: 0, right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 10,
  },

  // CTA button
  ctaWrapper: {
    width: '78%',
    height: 54,
    borderRadius: 6,
    shadowColor: NEON_BLUE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
  ctaBody: {
    flex: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#fff',
  },

  // Login row
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loginLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.3,
  },
  loginLink: {
    fontSize: 12,
    fontWeight: '700',
    color: NEON_BLUE,
    letterSpacing: 0.3,
  },

  // Help button
  helpWrapper: {
    position: 'relative',
  },
  helpBorderMask: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 14,
    overflow: 'hidden',
  },
  helpGlow: {
    position: 'absolute',
    width: 200,
    height: '100%',
  },
  helpInnerBg: {
    position: 'absolute',
    top: 1, left: 1, right: 1, bottom: 1,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  helpPressable: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 36,
  },
  helpText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.5,
  },

  // Trial row
  trialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    opacity: 0.6,
  },
  trialStar: {
    fontSize: 8,
    color: NEON_BLUE,
  },
  trialText: {
    fontSize: 11,
    fontWeight: '400',
    color: '#fff',
    letterSpacing: 0.4,
  },
  trialHighlight: {
    fontWeight: '700',
    color: NEON_BLUE,
  },
});