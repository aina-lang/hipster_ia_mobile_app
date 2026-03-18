import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { View, StyleSheet, Pressable } from 'react-native';
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
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { Particle, ParticleConfig } from '../components/welcome/Particle';
import { TopBar } from '../components/welcome/TopBar';
import { SubTextAnimation } from '../components/welcome/SubTextAnimation';
import { BottomAuthSection } from '../components/welcome/BottomAuthSection';

import { colors } from '../theme/colors';

const NEON_BLUE = colors.neon.primary;
const NEON_GLOW = colors.primary.glow;
const NEON_LIGHT = colors.primary.light;

const videobg = require('../assets/video/splashVideo-fixed-mobile.mp4');
const loadingVideo = require('../assets/video/loadingVideo.mp4');
const reloadingScreen = require('../assets/video/reloadignScreen.mp4');

export interface WelcomeScreenProps {
  onVideoFinish?: () => void;
  setIsRouting?: (routing: boolean) => void;
}

const PARTICLES: ParticleConfig[] = [
  { x: 0, y: -80, size: 2.5, color: NEON_BLUE, delayMs: 500, durationMs: 1700 },
  { x: -30, y: -85, size: 2, color: NEON_LIGHT, delayMs: 620, durationMs: 1300 },
  { x: 30, y: -85, size: 2, color: NEON_LIGHT, delayMs: 540, durationMs: 1500 },
  { x: -60, y: -78, size: 3, color: NEON_GLOW, delayMs: 700, durationMs: 1800 },
  { x: 60, y: -78, size: 3, color: NEON_GLOW, delayMs: 760, durationMs: 1600 },
];

export default React.memo(function WelcomeScreen({ onVideoFinish, setIsRouting }: WelcomeScreenProps) {
  const [videoReady, setVideoReady] = React.useState(false);
  const [hasFinishedAnimations, setHasFinishedAnimations] = React.useState(false);
  const textAnimProgress = useSharedValue(0);
  const videoMarginTop = useSharedValue(0);
  const { isAuthenticated, user, isHydrated } = useAuthStore();

  // Select video based on whether this is user's first time
  const isFirstTime = user?.isFirstTime !== false;
  const selectedVideo = isFirstTime ? loadingVideo : reloadingScreen;

  const videoPlayer = useVideoPlayer(selectedVideo, (player) => {
    player.loop = false;
    player.muted = true;
  });

  const isFinishedRef = React.useRef(false);
  const playbackTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!videoPlayer) return;

    const onPlaybackFinish = () => {
      if (isFinishedRef.current) return;
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

      setTimeout(() => {
        setHasFinishedAnimations(true);
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

    videoPlayer.addListener('statusChange', onStatusChange);
    videoPlayer.addListener('playingChange', onPlayingChange);
    videoPlayer.addListener('playToEnd', onPlaybackFinish);

    return () => {
      videoPlayer.removeListener('statusChange', onStatusChange);
      videoPlayer.removeListener('playingChange', onPlayingChange);
      videoPlayer.removeListener('playToEnd', onPlaybackFinish);
      if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    };
  }, [videoPlayer, onVideoFinish, isHydrated, isAuthenticated]);

  // Handle automatic redirection when BOTH animations are finished AND user is authenticated
  useEffect(() => {
    if (hasFinishedAnimations && isHydrated && isAuthenticated) {
      console.log('[Welcome] Redirection triggered: Anim finished & Auth ready');
      onVideoFinish?.();
    }
  }, [hasFinishedAnimations, isHydrated, isAuthenticated, onVideoFinish]);

  const videoAnimatedStyle = useAnimatedStyle(() => ({
    marginTop: videoMarginTop.value,
  }));

  return (
    <Animated.View exiting={FadeOut.duration(400)} style={StyleSheet.absoluteFill}>
      <StatusBar style="light" />
      {!videoReady && <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]} />}

      <Animated.View style={[StyleSheet.absoluteFill, videoAnimatedStyle]}>
        <VideoView player={videoPlayer} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
      </Animated.View>

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.4)', colors.overlay]}
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
          setIsRouting={setIsRouting}
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
  particleAnchor: {
    position: 'absolute',
    width: 0,
    height: 0,
    bottom: 150,
  },
  globalOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
});
