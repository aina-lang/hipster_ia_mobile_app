import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  Dimensions,
  ActivityIndicator,
  Share as RNShare,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import {
  Download,
  Trash2,
  Printer,
  Plus,
  ArrowLeft,
  LayoutGrid,
} from 'lucide-react-native';

import { useImageHistoryStore, GeneratedImage } from '../../store/imageHistoryStore';
import { colors } from '../../theme/colors';
import { GenericModal, ModalType } from '../../components/ui/GenericModal';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { NeonBackButton } from '../../components/ui/NeonBackButton';
import { AiService } from '../../api/ai.service';

const { width: SCREEN_W } = Dimensions.get('window');
const SCROLL_PAD = 24;
const GALLERY_GAP = 8;
const COLS = 3;
const CONTENT_W = SCREEN_W - SCROLL_PAD * 2;
const TILE = (CONTENT_W - GALLERY_GAP * (COLS - 1)) / COLS;

export default function ImpressionHDHistoryScreen() {
  const router = useRouter();

  const allImages = useImageHistoryStore((state) => state.images);
  const removeImage = useImageHistoryStore((state) => state.removeImage);
  const clearHistory = useImageHistoryStore((state) => state.clearHistory);

  // Backend flyers state
  const [backendFlyers, setBackendFlyers] = useState<GeneratedImage[]>([]);
  const [loadingFlyers, setLoadingFlyers] = useState(false);
  const [flyersFetchError, setFlyersFetchError] = useState<string | null>(null);

  // Fetch flyers from backend when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchFlyers = async () => {
        try {
          setLoadingFlyers(true);
          setFlyersFetchError(null);
          console.log('[ImpressionHDHistory] Fetching flyers from backend...');

          const flyers = await AiService.getFlyerHistory();
          console.log('[ImpressionHDHistory] Fetched', flyers?.length, 'flyers from backend');

          // Transform backend data to GeneratedImage format
          const transformedFlyers: GeneratedImage[] = (flyers || []).map((flyer: any) => ({
            id: String(flyer.id),
            url: flyer.imageUrl || '',
            title: flyer.title || 'Sans titre',
            description: flyer.title || 'Flyer généré',
            format: 'flyer' as const,
            architecture: flyer.attributes?.style || 'Personnalisé',
            style: flyer.attributes?.style || 'Professional',
            thumbnail: flyer.imageUrl,
            createdAt: new Date(flyer.createdAt).getTime(),
            generationId: flyer.id,
            metadata: flyer.attributes,
          }));

          setBackendFlyers(transformedFlyers);
        } catch (error: any) {
          console.error('[ImpressionHDHistory] Error fetching flyers:', error.message);
          setFlyersFetchError(error.message);
          // Fall back to local storage on error
          setBackendFlyers([]);
        } finally {
          setLoadingFlyers(false);
        }
      };

      fetchFlyers();
    }, [])
  );

  // Merge backend flyers with local images (backend takes precedence)
  const images = useMemo(() => {
    // Prioritize backend flyers, but include local images if no backend data
    const flyersToDisplay = backendFlyers.length > 0 ? backendFlyers : allImages.filter(
      (img) => img.format === 'impression-hd' || img.format === 'flyer',
    );
    return [...flyersToDisplay].sort((a, b) => b.createdAt - a.createdAt);
  }, [backendFlyers, allImages]);

  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  const showModal = (type: ModalType, title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh from backend
      const flyers = await AiService.getFlyerHistory();
      console.log('[ImpressionHDHistory] Refreshing flyers:', flyers?.length);

      const transformedFlyers: GeneratedImage[] = (flyers || []).map((flyer: any) => ({
        id: String(flyer.id),
        url: flyer.imageUrl || '',
        title: flyer.title || 'Sans titre',
        description: flyer.title || 'Flyer généré',
        format: 'flyer' as const,
        architecture: flyer.attributes?.style || 'Personnalisé',
        style: flyer.attributes?.style || 'Professional',
        thumbnail: flyer.imageUrl,
        createdAt: new Date(flyer.createdAt).getTime(),
        generationId: flyer.id,
        metadata: flyer.attributes,
      }));

      setBackendFlyers(transformedFlyers);
    } catch (error: any) {
      console.error('[ImpressionHDHistory] Error refreshing flyers:', error.message);
    } finally {
      setRefreshing(false);
    }
  };

  const openPreview = (image: GeneratedImage) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const handleDownloadImage = async (image: GeneratedImage) => {
    try {
      setDownloading(image.id);

      if (permissionResponse?.status !== 'granted') {
        const resp = await requestPermission();
        if (resp.status !== 'granted') {
          showModal('error', 'Permission refusée', 'Accès à la galerie refusé.');
          return;
        }
      }

      const filename = `hipster-${image.id}.jpg`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      const downloadRes = await FileSystem.downloadAsync(image.url, fileUri);
      if (downloadRes.status !== 200) throw new Error('Téléchargement échoué');

      const asset = await MediaLibrary.createAssetAsync(downloadRes.uri);
      const album = await MediaLibrary.getAlbumAsync('Hipster IA');

      if (!album) {
        await MediaLibrary.createAlbumAsync('Hipster IA', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      showModal('success', 'Succès', 'Flyer enregistré dans votre galerie.');
    } catch (error: any) {
      showModal('error', 'Erreur', `Impossible de télécharger : ${error.message}`);
    } finally {
      setDownloading(null);
    }
  };

  const handleShareImage = async (image: GeneratedImage) => {
    try {
      const filename = `hipster-${image.id}.jpg`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        const downloadRes = await FileSystem.downloadAsync(image.url, fileUri);
        if (downloadRes.status !== 200) throw new Error('Téléchargement échoué');
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/jpeg',
          dialogTitle: `Partager — ${image.title}`,
        });
      } else {
        RNShare.share({
          url: fileUri,
          title: image.title,
          message: `Découvrez cette création : ${image.description}`,
        });
      }
    } catch (error: any) {
      showModal('error', 'Erreur', `Partage échoué : ${error.message}`);
    }
  };

  const handlePrintImage = async (image: GeneratedImage) => {
    try {
      const filename = `hipster-${image.id}.jpg`;
      const fileUri = `${FileSystem.cacheDirectory}${filename}`;

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        const downloadRes = await FileSystem.downloadAsync(image.url, fileUri);
        if (downloadRes.status !== 200) throw new Error('Téléchargement échoué');
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/jpeg',
          dialogTitle: `Imprimer — ${image.title}`,
        });
      } else {
        showModal('info', 'Impression', 'Utilisez le partage pour accéder aux options d\'impression.');
      }
    } catch (error: any) {
      showModal('error', 'Erreur', `Impression échouée : ${error.message}`);
    }
  };

  const confirmDeleteOne = () => {
    if (!itemToDelete) return;
    const deletedId = itemToDelete;
    removeImage(deletedId);
    setItemToDelete(null);
    setShowDeleteModal(false);
    if (selectedImage?.id === deletedId) {
      setShowImageModal(false);
      setSelectedImage(null);
    }
  };

  const confirmClearAll = () => {
    clearHistory();
    setShowClearModal(false);
    setShowImageModal(false);
    setSelectedImage(null);
  };

  const renderGalleryTile = ({ item }: { item: GeneratedImage }) => (
    <View style={s.tileWrap}>
      <TouchableOpacity
        style={s.tileTouchable}
        onPress={() => openPreview(item)}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[colors.primary.main + '0a', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
        <Image
          source={{ uri: item.thumbnail || item.url }}
          style={s.tileImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={s.tileDelete}
        onPress={() => {
          setItemToDelete(item.id);
          setShowDeleteModal(true);
        }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Trash2 size={14} color={colors.status.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <BackgroundGradientOnboarding darkOverlay>
      <SafeAreaView style={s.safe}>
        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          numColumns={COLS}
          renderItem={renderGalleryTile}
          columnWrapperStyle={s.columnWrap}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.neon.primary}
            />
          }
          ListHeaderComponent={
            <>
              <View style={s.header}>
                <NeonBackButton onPress={() => router.back()} />
                <View style={s.headerCenter}>
                  <Text style={s.titleSub}>Impression HD</Text>
                </View>
                <View style={{ width: 42 }} />
              </View>

              <Text style={s.subtitle}>Galerie de vos affiches et visuels HD</Text>

              {loadingFlyers && images.length === 0 && (
                <View style={s.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.neonBlue} />
                  <Text style={s.loadingText}>Chargement de vos flyers...</Text>
                </View>
              )}

              {images.length > 0 && (
                <TouchableOpacity style={s.clearButton} onPress={() => setShowClearModal(true)}>
                  <Trash2 size={14} color={colors.status.error} />
                  <Text style={s.clearButtonText}>Tout effacer la galerie</Text>
                </TouchableOpacity>
              )}

              {images.length === 0 && !loadingFlyers && (
                <View style={s.emptyBlock}>
                  <View style={s.emptyIconBox}>
                    <LayoutGrid size={28} color={colors.neon.primary} />
                  </View>
                  <Text style={s.emptyText}>Aucun visuel enregistré</Text>
                  <Text style={s.emptyHint}>
                    Les flyers générés depuis l'accueil apparaissent ici automatiquement.
                  </Text>
                  {flyersFetchError && (
                    <Text style={s.errorText}>Erreur : {flyersFetchError}</Text>
                  )}
                  <TouchableOpacity
                    style={s.createBtn}
                    onPress={() => router.push('/(drawer)/impression-hd-create')}
                  >
                    <Plus size={18} color={colors.neon.primary} />
                    <Text style={s.createBtnText}>Nouveau flyer</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          }
        />

        {images.length > 0 && (
          <TouchableOpacity
            style={s.fab}
            onPress={() => router.push('/(drawer)/impression-hd-create')}
            accessibilityRole="button"
            accessibilityLabel="Créer un nouveau flyer"
          >
            <Plus size={28} color="white" />
          </TouchableOpacity>
        )}

        <Modal visible={showImageModal} transparent animationType="fade">
          <View style={s.modalContainer}>
            <View style={s.modalHeader}>
              <TouchableOpacity onPress={() => setShowImageModal(false)}>
                <ArrowLeft size={24} color="white" />
              </TouchableOpacity>
              <Text style={s.modalTitle} numberOfLines={1}>
                {selectedImage?.title || 'Aperçu'}
              </Text>
              <View style={{ width: 24 }} />
            </View>

            {selectedImage && (
              <>
                <Image
                  source={{ uri: selectedImage.url }}
                  style={s.fullImage}
                  resizeMode="contain"
                />

                <View style={s.modalActions}>
                  <TouchableOpacity
                    style={[s.modalButton, s.downloadBtnLarge]}
                    onPress={() => {
                      handleDownloadImage(selectedImage);
                      setShowImageModal(false);
                    }}
                    disabled={downloading === selectedImage.id}
                  >
                    {downloading === selectedImage.id ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Download size={20} color="white" />
                        <Text style={s.modalButtonText}>Télécharger</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.modalButton, s.printBtnLarge]}
                    onPress={() => {
                      handlePrintImage(selectedImage);
                      setShowImageModal(false);
                    }}
                  >
                    <Printer size={20} color="white" />
                    <Text style={s.modalButtonText}>Imprimer</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.modalButton, s.shareBtnLarge]}
                    onPress={() => {
                      handleShareImage(selectedImage);
                      setShowImageModal(false);
                    }}
                  >
                    <Text style={s.modalButtonText}>Partager</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </Modal>

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
          message="Voulez-vous vraiment supprimer ce visuel de la galerie ?"
          confirmText="Supprimer"
          cancelText="Annuler"
          onClose={() => {
            setShowDeleteModal(false);
            setItemToDelete(null);
          }}
          onConfirm={confirmDeleteOne}
        />

        <GenericModal
          visible={showClearModal}
          type="warning"
          title="Tout effacer"
          message="Cette action est irréversible. Tous les visuels de cette galerie seront supprimés de l’app."
          confirmText="Tout supprimer"
          cancelText="Annuler"
          onClose={() => setShowClearModal(false)}
          onConfirm={confirmClearAll}
        />
      </SafeAreaView>
    </BackgroundGradientOnboarding>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: SCROLL_PAD,
    paddingTop: 16,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  titleSub: {
    fontFamily: 'Arimo-Bold',
    fontSize: 16,
    textTransform: 'uppercase',
    color: '#ffffff',
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
  columnWrap: {
    justifyContent: 'flex-start',
    gap: GALLERY_GAP,
    marginBottom: GALLERY_GAP,
  },
  tileWrap: {
    width: TILE,
    position: 'relative',
  },
  tileTouchable: {
    width: TILE,
    height: TILE,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary.main + '1a',
    backgroundColor: colors.background.secondary + '99',
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
  tileDelete: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(15,23,42,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBlock: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
    gap: 12,
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
  emptyHint: {
    fontFamily: 'Arimo-Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,212,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,212,255,0.15)',
  },
  createBtnText: {
    fontFamily: 'Arimo-Bold',
    color: colors.neon.primary,
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 24,
    gap: 16,
  },
  loadingText: {
    fontFamily: 'Arimo-Regular',
    fontSize: 14,
    color: colors.text.muted,
  },
  errorText: {
    fontFamily: 'Arimo-Regular',
    fontSize: 12,
    color: colors.status.error,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    borderWidth: 2,
    borderColor: colors.neonBlue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.neon.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
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
    paddingTop: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  fullImage: {
    width: '100%',
    flex: 1,
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
  downloadBtnLarge: {
    backgroundColor: 'rgba(0, 212, 255, 0.3)',
  },
  printBtnLarge: {
    backgroundColor: 'rgba(102, 229, 255, 0.3)',
  },
  shareBtnLarge: {
    backgroundColor: 'rgba(0, 153, 255, 0.3)',
  },
  modalButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
});
