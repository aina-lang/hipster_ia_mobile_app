import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Animated, {
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useVideoPlayer, VideoView } from 'expo-video';
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

export const LoadingTransition = React.memo(({ onVideoFinish }: LoadingTransitionProps) => {
  const [videoReady, setVideoReady] = React.useState(false);

  const videoPlayer = useVideoPlayer(videobg, (player) => {
    player.loop = false;
    player.muted = false;
  });

  useEffect(() => {
    if (!videoPlayer) return;

    let fallbackTimer: NodeJS.Timeout;
    let isFinished = false;

    const handleVideoFinish = () => {
      if (isFinished) return;
      isFinished = true;
      // Ajoute un délai de 2 secondes avant de signaler la fin
      setTimeout(() => {
        onVideoFinish?.();
      }, 2000);
      clearTimeout(fallbackTimer);
    };

    // Jouer seulement quand prêt
    const onStatusChange = ({ status }: { status: string }) => {
      if (status === 'readyToPlay') {
        setVideoReady(true);
        videoPlayer.play();
        SplashScreen.hideAsync().catch(() => { });
      }
    };

    // Check immediately if already ready (race condition fix)
    if (videoPlayer.status === 'readyToPlay') {
      onStatusChange({ status: 'readyToPlay' });
    }

    videoPlayer.addListener('statusChange', onStatusChange);
    videoPlayer.addListener('playToEnd', handleVideoFinish);

    // Fallback si vidéo freeze ou ne se déclenche pas
    fallbackTimer = setTimeout(handleVideoFinish, 8000);

    return () => {
      videoPlayer.removeListener('statusChange', onStatusChange);
      videoPlayer.removeListener('playToEnd', handleVideoFinish);
      clearTimeout(fallbackTimer);
    };
  }, [videoPlayer, onVideoFinish]);

  return (
    <Animated.View exiting={FadeOut.duration(400)} style={StyleSheet.absoluteFill}>
      <StatusBar style="light" />
      {/* Background noir avant que la vidéo ne soit prête */}
      {!videoReady && <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]} />}
      {/* Video */}
      <View style={[StyleSheet.absoluteFill, { opacity: videoReady ? 1 : 0 }]}>
        <VideoView player={videoPlayer} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
      </View>

      {/* Particules */}
      <View style={styles.center}>
        <View style={styles.particleAnchor} pointerEvents="none">
          {PARTICLES.map((p, i) => (
            <Particle key={i} {...p} />
          ))}
        </View>

        <Animated.Text style={styles.title}>HIPSTER-IA</Animated.Text>
        <Animated.Text style={styles.subFirst}>Créer avec l'IA,</Animated.Text>
        <Animated.Text style={styles.subSecond}>perfectionner avec l'agence</Animated.Text>
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
    overflow: 'visible',
  },
  particleAnchor: {
    position: 'absolute',
    width: 0,
    height: 0,
    overflow: 'visible',
    bottom: 150,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 8,
    color: '#ffffff',
    bottom: -350,
  },
  subFirst: {
    marginTop: 12,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 30,
    bottom: -350,
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
    bottom: -350,
  },
});