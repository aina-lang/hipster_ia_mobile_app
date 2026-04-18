import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { View, StyleSheet, Pressable, Dimensions, useWindowDimensions, DimensionValue } from 'react-native';
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
import { FontAwesome5 } from '@expo/vector-icons';

// Responsive utilities
const ResponsiveSize = {
  getResponsiveFontSize: (baseSize: number, minSize: number = baseSize * 0.8): number => {
    const { width } = Dimensions.get('window');
    return Math.max(minSize, Math.min(baseSize, width * (baseSize / 375)));
  },
  getResponsivePadding: (basePadding: number): number => {
    const { width } = Dimensions.get('window');
    return width < 400 ? basePadding * 0.75 : basePadding;
  },
  getResponsiveButtonWidth: (): DimensionValue => {
    const { width } = Dimensions.get('window');
    return width < 400 ? '85%' : '70%';
  }
};

const NEON_BLUE = '#00d4ff';
const NEON_GLOW = '#0099ff';
const NEON_LIGHT = '#66e5ff';

const videobg = require('../assets/video/splashVideo-fixed-mobile.mp4');
const loadingVideo = require('../assets/video/loadingVideo.mp4');
const reloadingScreen = require('../assets/video/reloadignScreen.mp4');

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
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 400;
  
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

  const title = isAuthenticated ? `Bienvenue${userName ? `, ${userName}` : ''}` : 'Bienvenue';
  const subtitle = isAuthenticated ? 'À bord' : 'Votre agence marketing';
  const topBarHeight = isAuthenticated ? (isSmallScreen ? 50 : 60) : (isSmallScreen ? 100 : 120);

  return (
    <View 
      style={[
        { 
          height: topBarHeight + insets.top, 
          paddingTop: Math.max(insets.top - 10, 4),
          overflow: 'hidden'
        }
      ]}
    >
      <LinearGradient
        colors={['#000000', '#0a1a2e', '#0d2a4d']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.topBar, { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}
      />

      <Animated.View 
        style={[
          styles.topBarContent,
          { paddingHorizontal: ResponsiveSize.getResponsivePadding(20) },
          animStyle
        ]}
      >
        <View style={styles.titleWrapper}>
          <Text h1 style={[
            styles.topBarTitle,
            { fontSize: ResponsiveSize.getResponsiveFontSize(28, 22) }
          ]}>
            {title}
          </Text>
          {!isAuthenticated && (
            <Text style={[
              styles.topBarSubtitle,
              { fontSize: ResponsiveSize.getResponsiveFontSize(16, 13) }
            ]}>
              {subtitle}
            </Text>
          )}
        </View>
        {!isAuthenticated && (
          <Animated.Text style={[
            styles.topBarTagline,
            { fontSize: ResponsiveSize.getResponsiveFontSize(13, 11) }
          ]}>
            automatisée
          </Animated.Text>
        )}
      </Animated.View>
    </View>
  );
};

interface SubTextAnimationProps {
  textAnimProgress: SharedValue<number>;
  isAuthenticated: boolean;
}

const SubTextAnimation = React.memo(({ textAnimProgress, isAuthenticated }: SubTextAnimationProps) => {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;

  const animStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      textAnimProgress?.value ?? 0, 
      [0, 1], 
      [0, isSmallScreen ? -250 : -300], 
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
      <Animated.View style={[animStyle, { width: '100%', paddingHorizontal: ResponsiveSize.getResponsivePadding(20) }]}>
        <Animated.Text style={[
          styles.mainSubText,
          {
            fontSize: ResponsiveSize.getResponsiveFontSize(18, 16),
            lineHeight: ResponsiveSize.getResponsiveFontSize(30, 24),
          }
        ]}>
          CONTENT DE TE REVOIR
        </Animated.Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[animStyle, { width: '100%', paddingHorizontal: ResponsiveSize.getResponsivePadding(20) }]}>
      <Animated.Text style={[
        styles.mainSubText,
        {
          fontSize: ResponsiveSize.getResponsiveFontSize(18, 15),
          lineHeight: ResponsiveSize.getResponsiveFontSize(30, 24),
        }
      ]}>
        Créez  affiches, promotions et publications en quelques secondes.
      </Animated.Text>
    </Animated.View>
  );
});

interface BottomAuthSectionProps {
  isAuthenticated: boolean;
  onVideoFinish?: () => void;
  setIsRouting?: (routing: boolean) => void;
  textAnimProgress: SharedValue<number>;
  setFirstTimeUsed?: () => void;
}

const BottomAuthSection = React.memo(({ isAuthenticated, onVideoFinish, setIsRouting, textAnimProgress, setFirstTimeUsed }: BottomAuthSectionProps) => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 400;

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(textAnimProgress?.value ?? 0, [0, 1], [isSmallScreen ? 280 : 350, 0], Extrapolate.CLAMP),
      },
    ],
    opacity: interpolate(textAnimProgress?.value ?? 0, [0, 0.4, 1], [0, 0, 1], Extrapolate.CLAMP),
  }));

  if (isAuthenticated) return null;

  return (
    <Animated.View style={[
      styles.container,
      { paddingHorizontal: ResponsiveSize.getResponsivePadding(20) },
      animStyle
    ]}>
      <Pressable
        onPress={() => {
          console.log('[Welcome] Commencer clicked - calling setFirstTimeUsed()');
          setFirstTimeUsed?.();
          console.log('[Welcome] setFirstTimeUsed() completed');
          setIsRouting?.(true);
          onVideoFinish?.();
          router.replace('/(onboarding)/packs');
        }}
        style={[
          styles.primaryButton,
          { width: ResponsiveSize.getResponsiveButtonWidth() }
        ]}
      >
        <LinearGradient
          colors={['#000000', '#0a1628', '#264F8C']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          locations={[0, 0.6, 1]}
          style={[
            styles.gradient,
            { paddingVertical: isSmallScreen ? 12 : 14 }
          ]}
        >
          <Text style={[
            styles.primaryButtonText,
            { fontSize: ResponsiveSize.getResponsiveFontSize(14, 12) }
          ]}>
            Commencer maintenant
          </Text>
        </LinearGradient>
      </Pressable>

      <View style={[styles.row, { gap: isSmallScreen ? 4 : 6 }]}>
        <Text small style={{ fontSize: ResponsiveSize.getResponsiveFontSize(12, 10) }}>
          Déjà un compte ?
        </Text>
        <Pressable 
          onPress={() => { 
            console.log('[Welcome] Login clicked - calling setFirstTimeUsed()');
            setFirstTimeUsed?.();
            console.log('[Welcome] setFirstTimeUsed() completed');
            setIsRouting?.(true);
            onVideoFinish?.(); 
            router.replace('/(auth)/login'); 
          }}
          style={({ pressed }) => ({
            padding: 8,
            opacity: pressed ? 0.7 : 1,
            margin: -8,
          })}
        >
          <Text small style={[
            styles.highlight,
            { fontSize: ResponsiveSize.getResponsiveFontSize(14, 11) }
          ]}>
            Se connecter
          </Text>
        </Pressable>
      </View>

      <View style={[styles.trial, { gap: isSmallScreen ? 3 : 4, marginTop: isSmallScreen ? 16 : 20 }]}>
        <FontAwesome5 name="angellist" size={isSmallScreen ? 14 : 16} style={styles.glowIcon} />
        <Text small style={{ fontSize: ResponsiveSize.getResponsiveFontSize(11, 9) }}>
          <Text style={styles.highlight}>7 jours</Text> d'essai gratuit
        </Text>
        <Text style={[styles.separator, { fontSize: ResponsiveSize.getResponsiveFontSize(12, 10) }]}>·</Text>
        <Pressable
          onPress={() => Linking.openURL('mailto:contact@hipster-ia.fr').catch(() => {})}
          style={styles.contactLink}
        >
          <Text style={[
            styles.contactText,
            { fontSize: ResponsiveSize.getResponsiveFontSize(11, 9) }
          ]}>
            Besoin d'aide ?
          </Text>
        </Pressable>
      </View>

    </Animated.View>
  );
});

export default React.memo(function WelcomeScreen({ onVideoFinish, setIsRouting }: WelcomeScreenProps) {
  const [videoReady, setVideoReady] = React.useState(false);
  const textAnimProgress = useSharedValue(0);
  const videoMarginTop = useSharedValue(0);
  const { isAuthenticated, user, isHydrated, setFirstTimeUsed, isFirstTime } = useAuthStore();

  // Select video based on whether this is user's first time
  const selectedVideo = isFirstTime ? videobg : reloadingScreen;

  const videoPlayer = useVideoPlayer(selectedVideo, (player) => {
    player.loop = false;
    player.muted = true;
  });

  console.log('[Welcome] Current video:', { isFirstTime, selectedVideo: isFirstTime ? 'splash' : 'reloading' });

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
        if (isHydrated && isAuthenticated) onVideoFinish?.();
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

  const videoAnimatedStyle = useAnimatedStyle(() => ({
    marginTop: videoMarginTop.value,
  }));

  return (
    <Animated.View exiting={FadeOut.duration(400)} style={StyleSheet.absoluteFill}>
      {!videoReady && <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]} />}

      <Animated.View style={[StyleSheet.absoluteFill, videoAnimatedStyle]}>
        <VideoView player={videoPlayer} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
      </Animated.View>

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
          setFirstTimeUsed={setFirstTimeUsed}
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
  topBar: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  topBarContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  titleWrapper: {
    alignItems: 'center',
    gap: 0,
  },
  topBarTitle: {
    fontSize: 28,
    fontWeight: '800',
    fontFamily: 'Arimo-Bold',
    color: '#ffffff',
    textShadowColor: '#00d4ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
    letterSpacing: -0.5,
  },
  topBarSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Arimo-Bold',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 212, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 1.2,
  },
  topBarTagline: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Arimo-Regular',
    color: 'rgba(0, 212, 255, 0.8)',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  mainSubText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Arimo-Bold',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 30,
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
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 12,
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
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
    color: '#ffffff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  trial: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
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
