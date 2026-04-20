import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, StyleSheet, RefreshControl,
  Modal, Share as RNShare, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Search, MessageSquare, ArrowLeft, Trash2, Download, Printer, Share2, X } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  interpolate,
  Extrapolate,
  runOnJS,
  useAnimatedRef,
  measure
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect, useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';

import { AiService } from '../../api/ai.service';
import { colors } from '../../theme/colors';
import { GenericModal, ModalType } from '../../components/ui/GenericModal';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { NeonBackButton } from '../../components/ui/NeonBackButton';

dayjs.extend(relativeTime);
dayjs.locale('fr');


interface HistoryItem {
  id: string;
  title: string;
  date: string;
  preview: string;
  imageUrl?: string;
  type?: string;
}

export default function HistoryScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [printing, setPrinting] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const scrollY = useSharedValue(0);
  const transitionProgress = useSharedValue(0);
  const [originLayout, setOriginLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [activeImageUri, setActiveImageUri] = useState<string | null>(null);

  const showGenericModal = (type: ModalType, title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const getFullUrl = (url?: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://hipster-api.fr/${url.startsWith('/') ? url.slice(1) : url}`;
  };

  const handleDownload = async (item: HistoryItem) => {
    if (!item.imageUrl) return;
    try {
      setDownloading(item.id);
      const fullUrl = getFullUrl(item.imageUrl);
      const filename = `hipster-${item.id}.jpg`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      const downloadRes = await FileSystem.downloadAsync(fullUrl, fileUri);
      if (downloadRes.status !== 200) throw new Error('Téléchargement échoué');
      await MediaLibrary.createAssetAsync(downloadRes.uri);
      showGenericModal('success', 'Succès', 'Image enregistrée dans votre galerie.');
    } catch (error: any) {
      console.error('Download error:', error);
      showGenericModal('error', 'Erreur', `Impossible d'enregistrer l'image. Vérifiez vos permissions.`);
    } finally {
      setDownloading(null);
    }
  };

  const handleShare = async (item: HistoryItem) => {
    if (!item.imageUrl) return;
    try {
      const fullUrl = getFullUrl(item.imageUrl);
      const filename = `hipster-${item.id}.jpg`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        const downloadRes = await FileSystem.downloadAsync(fullUrl, fileUri);
        if (downloadRes.status !== 200) throw new Error('Téléchargement échoué');
      }
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: 'image/jpeg', dialogTitle: `Partager — ${item.title}` });
      } else {
        RNShare.share({ url: fileUri, title: item.title, message: `Découvrez cette création` });
      }
    } catch (error: any) {
      console.error('Share error:', error);
      showGenericModal('error', 'Erreur', `Partage échoué : ${error.message}`);
    }
  };

  const handlePrint = async (item: HistoryItem) => {
    if (!item.imageUrl || printing) return;
    try {
      setPrinting(item.id);
      const fullUrl = getFullUrl(item.imageUrl);
      const filename = `hipster-${item.id}.jpg`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        const downloadRes = await FileSystem.downloadAsync(fullUrl, fileUri);
        if (downloadRes.status !== 200) throw new Error('Téléchargement échoué');
      }
      if (fileUri) {
        const html = `
          <html>
            <body style="margin:0;padding:0;display:flex;justify-content:center;align-items:center;height:100vh;background-color:black;">
              <img src="${fullUrl}" style="max-width:100%;max-height:100%;object-fit:contain;" />
            </body>
          </html>
        `;
        await Print.printAsync({ html });
      } else {
        showGenericModal('info', 'Impression', 'Impossible de préparer le fichier pour l\'impression.');
      }
    } catch (error: any) {
      console.error('Print error:', error);
      showGenericModal('error', 'Erreur', `Impression échouée : ${error.message}`);
    } finally {
      setPrinting(null);
    }
  };

  const fetchHistory = async () => {
    try {
      setError(null);
      const data = await AiService.getGroupedConversations();
      if (data && Array.isArray(data)) {
        setHistory(data.map((item: any) => ({
          id: item.id,
          title: item.title || 'Sans titre',
          date: dayjs(item.date || item.items?.[0]?.date).fromNow(),
          preview: `${item.count || item.items?.length || 1} message${(item.count || item.items?.length || 1) > 1 ? 's' : ''}`,
          imageUrl: item.imageUrl || item.items?.[0]?.imageUrl,
          type: item.type || item.items?.[0]?.type,
        })));
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Une erreur est survenue');
      setHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchHistory(); }, []));

  const onRefresh = () => { setRefreshing(true); fetchHistory(); };

  const handleClearHistory = async () => {
    try {
      await AiService.clearHistory();
      setHistory([]);
      setShowClearModal(false);
    } catch (err) {
      console.error('Failed to clear history', err);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    try {
      await AiService.deleteGeneration(itemToDelete);
      setHistory(prev => prev.filter(i => i.id !== itemToDelete));
    } catch (err) {
      console.error('Failed to delete item', err);
    } finally {
      setItemToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const renderHistoryItem = (item: HistoryItem) => {
    return <HistoryItemCard key={item.id} item={item} />;
  };

  const HistoryItemCard = ({ item }: { item: HistoryItem }) => {
    const itemRef = useRef<View>(null);
    return (
      <View style={s.itemWrapper}>
        <TouchableOpacity
          ref={itemRef}
          style={s.itemCard}
          onPress={() => {
            if (item.imageUrl) {
              const fullUrl = getFullUrl(item.imageUrl);
              itemRef.current?.measureInWindow((x, y, width, height) => {
                setOriginLayout({ x, y, width, height });
                setSelectedItem(item);
                setActiveImageUri(fullUrl);
                transitionProgress.value = withSpring(1, { damping: 15, stiffness: 100 });
                setShowImageModal(true);
              });
            } else if (item.type === 'chat') {
              router.push({ pathname: '/(drawer)/freetext', params: { conversationId: item.id } });
            } else {
              router.push({ pathname: '/(drawer)', params: { conversationId: item.id } });
            }
          }}
          activeOpacity={0.7}
        >
          <LinearGradient colors={[colors.primary.main + '0a', 'transparent']} style={StyleSheet.absoluteFill} />
          <View style={s.iconContainer}>
            {item.imageUrl ? (
              <Image
                source={{ uri: getFullUrl(item.imageUrl) }}
                style={s.thumbnail}
                resizeMode="cover"
              />
            ) : (
              <MessageSquare size={20} color={colors.neon.primary} />
            )}
          </View>
          <View style={s.itemContent}>
            <View style={s.itemHeader}>
              <Text style={s.itemTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={s.itemDate}>{item.date}</Text>
            </View>
            <Text style={s.itemPreview} numberOfLines={2}>{item.preview || 'Conversation'}</Text>
          </View>
          <ChevronRight size={16} color={colors.text.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={s.deleteButton}
          onPress={() => { setItemToDelete(item.id); setShowDeleteModal(true); }}
        >
          <Trash2 size={16} color={colors.status.error} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <BackgroundGradientOnboarding darkOverlay>
      <ScreenHeader
        titleSub="VOTRE"
        titleScript="Historique"
        onBack={() => navigation.dispatch(DrawerActions.openDrawer())}
        scrollY={scrollY}
      />

      <Animated.ScrollView
        contentContainerStyle={[s.scrollContent, { paddingTop: 140 }]}
        showsVerticalScrollIndicator={false}
        bounces={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.neon.primary} />}
        onScroll={(e) => {
          scrollY.value = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >

        <Text style={s.subtitle}>Retrouvez toutes vos créations</Text>

        {history.length > 0 && (
          <TouchableOpacity style={s.clearButton} onPress={() => setShowClearModal(true)}>
            <Trash2 size={14} color={colors.status.error} />
            <Text style={s.clearButtonText}>Tout effacer l'historique</Text>
          </TouchableOpacity>
        )}

        {loading ? (
          <View style={s.emptyContainer}>
            <ActivityIndicator size="large" color={colors.neon.primary} />
          </View>
        ) : error ? (
          <View style={s.emptyContainer}>
            <Text style={s.errorText}>{error}</Text>
            <TouchableOpacity style={s.retryButton} onPress={fetchHistory}>
              <Text style={s.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : history.length === 0 ? (
          <View style={s.emptyContainer}>
            <View style={s.emptyIconBox}>
              <Search size={28} color={colors.neon.primary} />
            </View>
            <Text style={s.emptyText}>Aucun résultat trouvé</Text>
          </View>
        ) : (
          <View style={s.list}>
            {history.map(renderHistoryItem)}
          </View>
        )}
      </Animated.ScrollView>

      {/* 🖼️ Custom Shared Element Modal */}
      {showImageModal && (
        <Animated.View 
          style={[
            StyleSheet.absoluteFill, 
            { zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.95)' },
            useAnimatedStyle(() => ({
              opacity: transitionProgress.value,
            }))
          ]}
        >
          <SafeAreaView style={s.modalContainer}>
            <Animated.View 
              style={[
                s.modalHeader,
                useAnimatedStyle(() => ({
                  transform: [{ translateY: interpolate(transitionProgress.value, [0, 1], [-50, 0]) }],
                  opacity: transitionProgress.value,
                }))
              ]}
            >
              <TouchableOpacity 
                onPress={() => {
                  transitionProgress.value = withTiming(0, { duration: 250 }, (finished) => {
                    if (finished) runOnJS(setShowImageModal)(false);
                  });
                }} 
                style={s.closeBtn}
              >
                <X size={24} color="white" />
              </TouchableOpacity>
              <Text style={s.modalTitleHeader} numberOfLines={1}>{selectedItem?.title || 'Aperçu'}</Text>
              <View style={{ width: 24 }} />
            </Animated.View>

            <View style={s.modalContent}>
              <Animated.Image
                source={{ uri: activeImageUri || '' }}
                style={[
                  s.fullImage,
                  useAnimatedStyle(() => {
                    const targetHeight = Dimensions.get('window').height * 0.65;
                    const targetWidth = Dimensions.get('window').width;
                    const targetX = 0;
                    const targetY = (Dimensions.get('window').height - targetHeight) / 2;

                    return {
                      position: 'absolute',
                      top: interpolate(transitionProgress.value, [0, 1], [originLayout.y, targetY]),
                      left: interpolate(transitionProgress.value, [0, 1], [originLayout.x, targetX]),
                      width: interpolate(transitionProgress.value, [0, 1], [originLayout.width, targetWidth]),
                      height: interpolate(transitionProgress.value, [0, 1], [originLayout.height, targetHeight]),
                      borderRadius: interpolate(transitionProgress.value, [0, 1], [16, 0]),
                    };
                  })
                ]}
                resizeMode="contain"
              />

              <Animated.View 
                style={[
                  s.modalActions,
                  useAnimatedStyle(() => ({
                    transform: [{ translateY: interpolate(transitionProgress.value, [0, 1], [100, 0]) }],
                    opacity: transitionProgress.value,
                  }))
                ]}
              >
                <TouchableOpacity
                  style={[s.modalButton, s.downloadBtn]}
                  onPress={() => selectedItem && handleDownload(selectedItem)}
                  disabled={downloading === selectedItem?.id}
                >
                  {downloading === selectedItem?.id ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Download size={20} color="white" />
                      <Text style={s.modalButtonText}>Télécharger</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.modalButton, s.printBtn]}
                  onPress={() => selectedItem && handlePrint(selectedItem)}
                  disabled={!!printing}
                >
                  {printing === selectedItem?.id ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <Printer size={20} color="white" />
                      <Text style={s.modalButtonText}>Imprimer</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={[s.modalButton, s.shareBtn]} onPress={() => selectedItem && handleShare(selectedItem)}>
                  <Share2 size={20} color="white" />
                  <Text style={s.modalButtonText}>Partager</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </SafeAreaView>
        </Animated.View>
      )}

      <GenericModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />

      <GenericModal
        visible={showDeleteModal}
        type="warning"
        title="Supprimer"
        message="Voulez-vous vraiment supprimer cet élément ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteItem}
      />
      <GenericModal
        visible={showClearModal}
        type="warning"
        title="Tout effacer"
        message="Cette action est irréversible. Voulez-vous vraiment supprimer tout votre historique ?"
        confirmText="Tout supprimer"
        cancelText="Annuler"
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearHistory}
      />
    </BackgroundGradientOnboarding>
  );
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const s = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  subtitle: {
    fontFamily: 'Arimo-Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 0.3,
    textAlign: 'center',
    marginBottom: 20,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 7,
    backgroundColor: 'rgba(239,68,68,0.06)',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.15)',
    marginBottom: 20,
  },
  clearButtonText: {
    fontFamily: 'Arimo-Bold',
    color: colors.status.error,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  list: {
    gap: 10,
  },
  itemWrapper: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  itemCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary.main + '1a',
    backgroundColor: colors.background.secondary + '99', // 60% alpha
    overflow: 'hidden',
    gap: 12,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primary.main + '14',
    borderWidth: 1,
    borderColor: colors.primary.main + '26',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 11,
  },
  itemContent: { flex: 1 },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    flex: 1,
    fontFamily: 'Arimo-Bold',
    fontSize: 14,
    color: colors.text.primary,
    marginRight: 8,
  },
  itemDate: {
    fontFamily: 'Arimo-Regular',
    fontSize: 10,
    color: colors.text.muted,
    letterSpacing: 0.2,
  },
  itemPreview: {
    fontFamily: 'Arimo-Regular',
    fontSize: 12,
    color: colors.text.muted,
    lineHeight: 17,
  },
  deleteButton: {
    width: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(239,68,68,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 16,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(0,212,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Arimo-Regular',
    fontSize: 15,
    color: colors.text.muted,
  },
  errorText: {
    fontFamily: 'Arimo-Regular',
    color: colors.status.error,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,212,255,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.15)',
  },
  retryText: {
    fontFamily: 'Arimo-Bold',
    color: colors.neon.primary,
    fontSize: 13,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    padding: 8,
  },
  modalTitleHeader: {
    fontFamily: 'Arimo-Bold',
    fontSize: 16,
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
  },
  fullImage: {
    width: '100%',
    height: SCREEN_H * 0.65,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  downloadBtn: {
    backgroundColor: 'rgba(0, 212, 255, 0.3)',
  },
  printBtn: {
    backgroundColor: 'rgba(102, 229, 255, 0.3)',
  },
  shareBtn: {
    backgroundColor: 'rgba(0, 153, 255, 0.3)',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Arimo-Bold',
  },
});