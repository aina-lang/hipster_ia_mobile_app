import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Share, Clipboard,
  Animated as RNAnimated, Easing,
} from 'react-native';
import { Copy, Share2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GenericModal } from './ui/GenericModal';

const NEON_BLUE  = '#00d4ff';
const NEON_LIGHT = '#1e9bff';
const CARD_W     = 340;

interface ReferralCodeCardProps {
  code: string;
}

export const ReferralCodeCard: React.FC<ReferralCodeCardProps> = ({ code }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig]   = useState({ type: 'success' as any, title: '', message: '' });
  const translateX = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    const loop = RNAnimated.loop(
      RNAnimated.timing(translateX, { toValue: -CARD_W, duration: 3000, easing: Easing.linear, useNativeDriver: true }),
      { resetBeforeIteration: true }
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const showModal = (type: any, title: string, message: string) => {
    setModalConfig({ type, title, message });
    setModalVisible(true);
  };

  const handleCopy = () => {
    Clipboard.setString(code);
    showModal('success', 'Copié !', 'Le code a été copié dans le presse-papiers.');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Rejoins-moi sur Hipster IA et profite d'avantages exclusifs avec mon code de parrainage : ${code}\n\nTélécharge l'app ici : https://hipster-api.fr`,
      });
    } catch {
      showModal('error', 'Erreur', "Impossible de partager le code pour l'instant.");
    }
  };

  return (
    <>
      <View style={s.outerWrapper}>
        <View style={s.bloomFar}  pointerEvents="none" />
        <View style={s.bloomMid}  pointerEvents="none" />
        <View style={s.floorGlow} pointerEvents="none" />

        <View style={s.neonClip} pointerEvents="none">
          <RNAnimated.View style={[s.neonTrack, { transform: [{ translateX }] }]}>
            <LinearGradient
              colors={['transparent', NEON_BLUE, NEON_LIGHT, 'transparent', 'transparent', NEON_BLUE, NEON_LIGHT, 'transparent']}
              locations={[0.05, 0.2, 0.3, 0.45, 0.55, 0.7, 0.8, 0.95]}
              start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
              style={{ width: CARD_W * 2, height: '100%' }}
            />
          </RNAnimated.View>
          <View style={s.neonMask} />
        </View>

        <View style={s.card}>
          <LinearGradient colors={['rgba(0,212,255,0.07)', 'transparent']} style={StyleSheet.absoluteFill} />
          <Text style={s.label}>TON CODE DE PARRAINAGE</Text>
          <View style={s.codeContainer}>
            <Text style={s.codeText}>{code}</Text>
            <View style={s.actions}>
              <TouchableOpacity onPress={handleCopy} style={s.actionButton}>
                <Copy size={18} color={NEON_BLUE} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={s.actionButton}>
                <Share2 size={18} color={NEON_BLUE} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <GenericModal
        visible={modalVisible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
};

const s = StyleSheet.create({
  outerWrapper: { position: 'relative', marginBottom: 20 },
  neonClip:     { position: 'absolute', top: -1, left: -1, right: -1, bottom: -0.5, borderRadius: 21, overflow: 'hidden', zIndex: 2, pointerEvents: 'none' },
  neonTrack:    { position: 'absolute', top: 0, bottom: 0, left: 0 },
  neonMask:     { position: 'absolute', top: 1, left: 1, right: 1, bottom: 0.5, borderRadius: 20, backgroundColor: '#030814', zIndex: 1 },
  bloomMid:     { position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 24, backgroundColor: 'transparent', shadowColor: NEON_BLUE, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.45, shadowRadius: 18, elevation: 8 },
  bloomFar:     { position: 'absolute', top: -8, left: -8, right: -8, bottom: -8, borderRadius: 28, backgroundColor: 'transparent', shadowColor: NEON_LIGHT, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 28, elevation: 4 },
  floorGlow:    { position: 'absolute', bottom: -16, alignSelf: 'center', width: '80%', height: 24, borderRadius: 50, backgroundColor: 'transparent', shadowColor: NEON_BLUE, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 12 },
  card:         { backgroundColor: '#030814', borderRadius: 20, padding: 20, alignItems: 'center', overflow: 'hidden', zIndex: 3 },
  label:        { fontFamily: 'Arimo-Bold', fontSize: 11, color: 'rgba(255,255,255,0.28)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 18 },
  codeContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, paddingLeft: 20, paddingRight: 8, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(0,212,255,0.15)', width: '100%', justifyContent: 'space-between' },
  codeText:     { fontFamily: 'Arimo-Bold', fontSize: 22, color: '#ffffff', letterSpacing: 2, textShadowColor: NEON_BLUE, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },
  actions:      { flexDirection: 'row', gap: 4 },
  actionButton: { padding: 11, borderRadius: 10, backgroundColor: 'rgba(0,212,255,0.08)', borderWidth: 1, borderColor: 'rgba(0,212,255,0.15)' },
});