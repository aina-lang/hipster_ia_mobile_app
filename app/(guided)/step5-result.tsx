import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
  Animated,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import * as Notifications from 'expo-notifications';
import * as IntentLauncher from 'expo-intent-launcher';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import { Share, Home, Check, Copy, Download, FileText } from 'lucide-react-native';

import { colors } from '../../theme/colors';
import { DeerAnimation } from '../../components/ui/DeerAnimation';
import { NeonButton } from '../../components/ui/NeonButton';
import { GenericModal, ModalType } from '../../components/ui/GenericModal';
import { useCreationStore } from '../../store/creationStore';
import { useAuthStore } from '../../store/authStore';
import { AiService, TextGenerationType } from '../../api/ai.service';
import { WORKFLOWS } from '../../constants/workflows';
import { GuidedScreenWrapper } from '../../components/layout/GuidedScreenWrapper';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export default function Step5ResultScreen() {
  const router = useRouter();
  const {
    userQuery,
    selectedJob,
    selectedFunction,
    selectedCategory,
    selectedContext,
    selectedTone,
    selectedTarget,
    workflowAnswers,
    reset,
  } = useCreationStore();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const [pulseAnim] = useState(new Animated.Value(0.3));

  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions({
    granularPermissions: ['photo'],
  });

  const showModal = (type: ModalType, title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (loading) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
        ])
      );
      animation.start();
    } else pulseAnim.setValue(1);

    return () => animation?.stop();
  }, [loading, pulseAnim]);

  // --- Generation logic here ---
  useEffect(() => {
    const generateContent = async () => {
      setLoading(true);
      // ... logique de génération comme dans ton code original ...
      setLoading(false);
    };
    generateContent();
  }, []);

  const handleCopyText = async () => {
    if (!result) return;
    await Clipboard.setStringAsync(result);
    showModal('success', 'Succès', 'Texte copié dans le presse-papier !');
  };

  const handleSaveToGallery = async () => {
    // logique sauvegarde MediaLibrary
  };

  const handleShare = async () => {
    // logique partage
  };

  const handleFinish = () => {
    reset();
    router.replace('/(drawer)');
  };

  return (
    <GuidedScreenWrapper>
      <View className="px-5">

        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-15 h-15 rounded-full bg-primary-main justify-center items-center mb-4 shadow-lg">
            <Check size={40} color={colors.background.dark} />
          </View>
          <Text className="text-2xl font-bold text-white">
            {loading ? 'Création en cours...' : "C'est prêt !"}
          </Text>
        </View>

        <View className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">

          {/* Image Section */}
          {(selectedCategory === 'Image' || imageUrl || loading) && (
            <>
              <Text className="self-start bg-teal-200/20 text-primary-main text-[10px] font-extrabold px-2 py-1 rounded mb-4 tracking-widest">
                {loading ? 'GÉNÉRATION VISUELLE...' : 'VISUEL GÉNÉRÉ'}
              </Text>

              {loading ? (
                <View className="w-full aspect-square rounded-xl bg-black/30 border border-white/10 border-dashed justify-center items-center mb-6">
                  <DeerAnimation size={80} progress={50} />
                  <Text className="text-primary-main mt-3 font-semibold text-sm">Design en cours...</Text>
                </View>
              ) : (
                imageUrl && (
                  <Image
                    source={{ uri: imageUrl }}
                    className="w-full aspect-square rounded-xl mb-6"
                    resizeMode="cover"
                  />
                )
              )}
            </>
          )}

          {/* Text Section */}
          {(selectedCategory !== 'Image' || imageUrl) && (
            <>
              <Text className="self-start bg-teal-200/20 text-primary-main text-[10px] font-extrabold px-2 py-1 rounded mb-4 tracking-widest">
                {loading ? 'RÉDACTION...' : selectedCategory === 'Social' ? 'CONTENU SOCIAL' : 'CONTENU TEXTUEL'}
              </Text>

              {loading ? (
                <View className="gap-3 mt-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Animated.View
                      key={i}
                      className="h-4 rounded-lg bg-white/10"
                      style={{ width: i === 4 ? '60%' : '100%', opacity: pulseAnim }}
                    />
                  ))}
                </View>
              ) : (
                <Text className="text-white text-base leading-6 mb-6">{result}</Text>
              )}
            </>
          )}

          {/* Action Buttons */}
          <View className="flex-row border-t border-white/10 pt-4 justify-end gap-4">
            {selectedCategory !== 'Document' && (
              <TouchableOpacity className="flex-row items-center gap-1.5 p-2" onPress={handleCopyText}>
                <Copy size={20} color={colors.text.secondary} />
                <Text className="text-white/70 text-sm">Copier Texte</Text>
              </TouchableOpacity>
            )}

            {selectedCategory === 'Image' || imageUrl ? (
              <>
                <TouchableOpacity className="flex-row items-center gap-1.5 p-2" onPress={handleSaveToGallery}>
                  <Download size={20} color={colors.text.secondary} />
                  <Text className="text-white/70 text-sm">Enregistrer</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center gap-1.5 p-2" onPress={handleShare}>
                  <Share size={20} color={colors.text.secondary} />
                  <Text className="text-white/70 text-sm">Partager</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>

        {/* Finish Button */}
        <View className="items-center">
          <NeonButton
            title="Terminer"
            onPress={handleFinish}
            icon={<Home size={20} color="#000" />}
            size="lg"
            variant="primary"
          />
        </View>

        <GenericModal
          visible={modalVisible}
          type={modalType}
          title={modalTitle}
          message={modalMessage}
          onClose={() => setModalVisible(false)}
        />
      </View>
    </GuidedScreenWrapper>
  );
}
