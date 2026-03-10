import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Clipboard } from 'react-native';
import { Copy, Share2 } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface ReferralCodeCardProps {
  code: string;
}

export const ReferralCodeCard: React.FC<ReferralCodeCardProps> = ({ code }) => {
  const handleCopy = () => {
    Clipboard.setString(code);
    alert('Code copié !');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Rejoins-moi sur Hipster IA et profite d'avantages exclusifs avec mon code de parrainage : ${code}\n\nTélécharge l'app ici : https://hipster-api.fr`,
      });
    } catch (error: any) {
      console.error('Error sharing code:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={60} tint="dark" style={styles.blur}>
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.05)']}
          style={styles.gradient}
        >
          <Text style={styles.label}>TON CODE DE PARRAINAGE</Text>
          <View style={styles.codeContainer}>
            <Text style={styles.codeText}>{code}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={handleCopy} style={styles.actionButton}>
                <Copy size={20} color={colors.primary.main} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
                <Share2 size={20} color={colors.primary.main} />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    marginBottom: 20,
  },
  blur: {
    borderRadius: 24,
  },
  gradient: {
    padding: 24,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text.muted,
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingLeft: 24,
    paddingRight: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
    justifyContent: 'space-between',
  },
  codeText: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text.primary,
    letterSpacing: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
});
