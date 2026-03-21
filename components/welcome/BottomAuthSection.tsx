import React from 'react';
import { View, StyleSheet, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { 
  interpolate, 
  Extrapolate, 
  SharedValue, 
  useAnimatedStyle 
} from 'react-native-reanimated';
import { Text } from '../ui/Text';

interface BottomAuthSectionProps {
  isAuthenticated: boolean;
  onVideoFinish?: () => void;
  setIsRouting?: (routing: boolean) => void;
  textAnimProgress: SharedValue<number>;
  setFirstTimeUsed?: () => void;
}

export const BottomAuthSection = React.memo(({ isAuthenticated, onVideoFinish, setIsRouting, textAnimProgress, setFirstTimeUsed }: BottomAuthSectionProps) => {
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
          console.log('[Welcome] Commencer clicked - calling setFirstTimeUsed()');
          setFirstTimeUsed?.(); // Mark user as having started
          console.log('[Welcome] setFirstTimeUsed() completed');
          setIsRouting?.(true);
          onVideoFinish?.();
          router.push({ pathname: '/(onboarding)/packs', params: { from: 'welcome' } });
        }}
        style={styles.primaryButton}
      >
        <LinearGradient
          colors={['#000000', '#0a1628', '#264F8C']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          locations={[0, 0.6, 1]}
          style={styles.gradient}
        >
          <Text style={styles.primaryButtonText}>Commencer maintenant</Text>
        </LinearGradient>
      </Pressable>

      <View style={styles.row}>
        <Text small>Déjà un compte ?</Text>
        <Pressable 
          onPress={() => { 
            console.log('[Welcome] Login clicked - calling setFirstTimeUsed()');
            setFirstTimeUsed?.(); // Mark user as having started
            console.log('[Welcome] setFirstTimeUsed() completed');
            setIsRouting?.(true);
            onVideoFinish?.(); 
            router.push('/(auth)/login'); 
          }}
          style={({ pressed }) => ({
            padding: 10,
            opacity: pressed ? 0.7 : 1,
            margin: -10, 
          })}
        >
          <Text small style={styles.highlight}>Se connecter</Text>
        </Pressable>
      </View>

      <View style={styles.trial}>
        <FontAwesome5 name="angellist" size={18} style={styles.glowIcon} />
        <Text small>
          <Text style={styles.highlight}>7 jours</Text> d'essai gratuit
        </Text>
        <Text style={styles.separator}>·</Text>
        <Pressable
          onPress={() => Linking.openURL('mailto:contact@hipster-ia.fr').catch(() => {})}
          style={styles.contactLink}
        >
          <Text style={styles.contactText}>Besoin d'aide ?</Text>
        </Pressable>
      </View>

    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  primaryButton: {
    width: '70%',
    overflow: 'hidden',
  },
  gradient: {
    width: '100%',
    paddingVertical: 14,
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
  separator: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    marginHorizontal: 4,
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
