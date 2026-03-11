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

// ─── Constants ───────────────────────────────────────────────
const NEON_BLUE  = '#00d4ff';
const NEON_GLOW  = '#0099ff';
const NEON_LIGHT = '#66e5ff';
const videobg    = require('../../assets/video/splashVideo-fixed-mobile.mp4');

const PARTICLES = [
  { x: 0,   y: -80, size: 2.5, color: NEON_BLUE,  delayMs: 500, durationMs: 1700 },
  { x: -30, y: -85, size: 2,   color: NEON_LIGHT, delayMs: 620, durationMs: 1300 },
  { x: 30,  y: -85, size: 2,   color: NEON_LIGHT, delayMs: 540, durationMs: 1500 },
  { x: -60, y: -78, size: 3,   color: NEON_GLOW,  delayMs: 700, durationMs: 1800 },
  { x: 60,  y: -78, size: 3,   color: NEON_GLOW,  delayMs: 760, durationMs: 1600 },
] as const;

// ─── Particle ────────────────────────────────────────────────
const Particle = React.memo(({ x, y, size, color, delayMs, durationMs }: typeof PARTICLES[number]) => {
  const opacity    = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    const sinLoop = (from: number, to: number, dur: number) =>
      withRepeat(
        withSequence(
          withTiming(from, { duration: dur * 0.5, easing: Easing.inOut(Easing.sin) }),
          withTiming(to,   { duration: dur * 0.5, easing: Easing.inOut(Easing.sin) }),
        ),
        -1, true,
      );
    opacity.value    = withDelay(delayMs, sinLoop(0.9, 0.1, durationMs));
    translateY.value = withDelay(delayMs, sinLoop(-5, 5, durationMs));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[{
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
      }, animStyle]}
    />
  );
});

// ─── TopBar ───────────────────────────────────────────────────
const TopBar = React.memo(({ isAuthenticated, userName }: { isAuthenticated: boolean; userName?: string }) => (
  <LinearGradient
    colors={['rgba(0,0,0,0.75)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0)']}
    locations={[0, 0.5, 1]}
    start={{ x: 0.5, y: 0 }}
    end={{ x: 0.5, y: 1 }}
    style={styles.topBar}
  >
    <Text style={styles.topBarTitle}>
      {isAuthenticated ? `Bienvenue${userName ? `, ${userName}` : ''}` : 'HIPSTER-IA'}
    </Text>
  </LinearGradient>
));

// ─── SubTextAnimation ─────────────────────────────────────────
const SubTextAnimation = React.memo(({ textAnimProgress, isAuthenticated }: {
  textAnimProgress: SharedValue<number>;
  isAuthenticated: boolean;
}) => {
  const animStyle = useAnimatedStyle(() => ({
    opacity: interpolate(textAnimProgress.value, [0, 0.5, 1], [0, 0, 1], Extrapolate.CLAMP),
  }));

  return (
    <Animated.View style={[styles.subTextContainer, animStyle]}>
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
      ),
      -1, false,
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: translateX.value }] }));

  return (
    <View style={styles.helpWrapper}>
      {/* Animated border glow */}
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
      {/* Inner background mask */}
      <View style={styles.helpInnerBg} pointerEvents="none" />
      <Pressable style={styles.helpPressable} onPress={onPress}>
        <Text style={styles.helpText}>Besoin d'aide ?</Text>
      </Pressable>
    </View>
  );
});

// ─── BottomAuthSection ────────────────────────────────────────
const BottomAuthSection = React.memo(({ isAuthenticated, onVideoFinish, textAnimProgress }: {
  isAuthenticated: boolean;
  onVideoFinish?: () => void;
  textAnimProgress: SharedValue<number>;
}) => {
  const router = useRouter();

  const animStyle = useAnimatedStyle(() => ({
    opacity: interpolate(textAnimProgress.value, [0, 0.4, 1], [0, 0, 1], Extrapolate.CLAMP),
    transform: [{
      translateY: interpolate(textAnimProgress.value, [0, 1], [350, 0], Extrapolate.CLAMP),
    }],
  }));

  if (isAuthenticated) return null;

  return (
    <Animated.View style={[styles.bottomSection, animStyle]}>
      {/* Floor glow */}
      <View style={styles.floorGlow} pointerEvents="none" />

      {/* CTA Button */}
      <Pressable
        onPress={() => { onVideoFinish?.(); router.push('/(onboarding)/welcome'); }}
        style={styles.ctaWrapper}
      >
        <LinearGradient
          colors={['#264F8C', '#040612']}
          start={{ x: 0.22, y: 0 }}
          end={{ x: 0.78, y: 1 }}
          style={styles.ctaBody}
        >
          <Text style={styles.ctaText}>COMMENCER MAINTENANT</Text>
        </LinearGradient>
      </Pressable>

      {/* Login row */}
      <View style={styles.loginRow}>
        <Text style={styles.loginLabel}>Déjà un compte ?</Text>
        <Pressable onPress={() => { onVideoFinish?.(); router.push('/(auth)/login'); }}>
          <Text style={styles.loginLink}>Se connecter</Text>
        </Pressable>
      </View>

      <HelpButton onPress={() => { onVideoFinish?.(); router.push('/(auth)/help'); }} />

      {/* Trial text */}
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

// ─── LoadingTransition (root) ─────────────────────────────────
interface LoadingTransitionProps {
  onVideoFinish?: () => void;
}

export const LoadingTransition = React.memo(({ onVideoFinish }: LoadingTransitionProps) => {
  const [videoReady, setVideoReady]  = React.useState(false);
  const textAnimProgress             = useSharedValue(0);
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

      textAnimProgress.value = withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.quad) });
      setTimeout(() => { if (isHydrated && isAuthenticated) onVideoFinish?.(); }, 2000);
    };

    const onStatus  = ({ status }: { status: string }) => {
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

    if (videoPlayer.status === 'readyToPlay') { setVideoReady(true); SplashScreen.hideAsync().catch(() => {}); }
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

      {/* Black bg until video is ready */}
      {!videoReady && <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]} />}

      {/* Video — top half */}
      <View style={styles.videoContainer}>
        <VideoView player={videoPlayer} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
      </View>

      {/* Top gradient + title */}
      <TopBar
        isAuthenticated={isAuthenticated}
        userName={user?.name || user?.email?.split('@')[0]}
      />

      {/* Center particles */}
      <View style={styles.particleAnchor} pointerEvents="none">
        {PARTICLES.map((p, i) => <Particle key={i} {...p} />)}
      </View>

      {/* Sub text — revealed after video */}
      <View style={styles.subTextAnchor} pointerEvents="none">
        <SubTextAnimation textAnimProgress={textAnimProgress} isAuthenticated={isAuthenticated} />
      </View>

      {/* Bottom CTA — revealed after video */}
      <BottomAuthSection
        isAuthenticated={isAuthenticated}
        onVideoFinish={onVideoFinish}
        textAnimProgress={textAnimProgress}
      />
    </Animated.View>
  );
});

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Layout
  videoContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: '55%',
  },
  particleAnchor: {
    position: 'absolute',
    bottom: '42%',
    left: '50%',
    width: 0, height: 0,
    overflow: 'visible',
  },
  subTextAnchor: {
    position: 'absolute',
    bottom: '28%',
    left: 0, right: 0,
    alignItems: 'center',
  },
  subTextContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  // TopBar
  topBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    zIndex: 100,
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 6,
    color: '#fff',
  },

  // Sub texts
  mainSubText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 20,
    textShadowColor: NEON_BLUE,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  subLineText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 18,
    textShadowColor: NEON_BLUE,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },

  // Bottom section
  bottomSection: {
    position: 'absolute',
    bottom: 50, left: 0, right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  floorGlow: {
    position: 'absolute',
    bottom: -35,
    left: '50%',
    marginLeft: -90,
    width: 180, height: 50,
    borderRadius: 90,
    shadowColor: '#1a6fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 35,
    elevation: 30,
  },

  // CTA button
  ctaWrapper: {
    width: '70%',
    height: 52,
    borderRadius: 5,
    shadowColor: '#264F8C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  ctaBody: {
    flex: 1,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.42)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: '#fff',
  },

  // Login row
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.3,
  },
  loginLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00a8cc',
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
    top: 2, left: 2, right: 2, bottom: 2,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  helpPressable: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 32,
  },
  helpText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.3,
  },

  // Trial row
  trialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    opacity: 0.65,
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