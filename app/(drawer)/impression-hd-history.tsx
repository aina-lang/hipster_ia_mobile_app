import React, { useState, useMemo, useCallback } from 'react';
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
  CheckCircle2,
  X,
} from 'lucide-react-native';

import { useImageHistoryStore, GeneratedImage } from '../../store/imageHistoryStore';
import { colors } from '../../theme/colors';
import { GenericModal, ModalType } from '../../components/ui/GenericModal';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';
import { NeonBackButton } from '../../components/ui/NeonBackButton';
import { AiService } from '../../api/ai.service';

const { width: SCREEN_W } = Dimensions.get('window');
const SCROLL_PAD = 20;
const GALLERY_GAP = 12;
const COLS = 2;
const CONTENT_W = SCREEN_W - SCROLL_PAD * 2;
const TILE = (CONTENT_W - GALLERY_GAP * (COLS - 1)) / COLS;
const TILE_H = TILE * 1.5; // Aspect ratio for taller images

export default function ImpressionHDHistoryScreen() {
  const router = useRouter();

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
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [backendFlyers, setBackendFlyers] = useState<GeneratedImage[]>([]);
  const [loadingFlyers, setLoadingFlyers] = useState(false);

  const allImages = useImageHistoryStore((state) => state.images);
  const removeImage = useImageHistoryStore((state) => state.removeImage);
  const clearHistory = useImageHistoryStore((state) => state.clearHistory);

  // Fetch flyers from backend
  const fetchBackendFlyers = useCallback(async () => {
    try {
      console.log('[ImpressionHDHistory] Fetching backend flyers...');
      setLoadingFlyers(true);
      const flyers = await AiService.getFlyerHistory();

      if (!Array.isArray(flyers)) {
        console.warn('[ImpressionHDHistory] Backend flyers not an array:', flyers);
        setBackendFlyers([]);
        return;
      }

      // Transform backend flyers to GeneratedImage format
      const transformedFlyers: GeneratedImage[] = flyers.map((flyer: any) => ({
        id: flyer.id?.toString() || `backend-${Date.now()}`,
        url: flyer.imageUrl || flyer.url || '',
        title: flyer.title || 'Flyer',
        description: flyer.description || '',
        format: 'impression-hd' as const,
        thumbnail: flyer.thumbnail || undefined,
        createdAt: new Date(flyer.createdAt || Date.now()).getTime(),
        generationId: flyer.generationId,
        metadata: flyer.metadata,
      }));

      console.log('[ImpressionHDHistory] Backend flyers transformed:', transformedFlyers.length);
      setBackendFlyers(transformedFlyers);
    } catch (error) {
      console.error('[ImpressionHDHistory] Error fetching backend flyers:', error);
      setBackendFlyers([]);
    } finally {
      setLoadingFlyers(false);
    }
  }, []);

  // Load flyers when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchBackendFlyers();
    }, [fetchBackendFlyers])
  );

  const images = useMemo(() => {
    console.log('[ImpressionHDHistory] All images in store:', allImages.length);
    console.log('[ImpressionHDHistory] Backend flyers:', backendFlyers.length);

    // Combine store images and backend flyers
    const storeFlyers = allImages.filter(
      (img) => img.format === 'impression-hd' || img.format === 'flyer',
    );

    // Merge and deduplicate by ID
    const allFlyers = [...storeFlyers, ...backendFlyers];
    const seen = new Set<string>();
    const uniqueFlyers = allFlyers.filter(img => {
      if (seen.has(img.id)) return false;
      seen.add(img.id);
      return true;
    });

    const sorted = [...uniqueFlyers].sort((a, b) => b.createdAt - a.createdAt);
    console.log('[ImpressionHDHistory] Final images to display:', sorted.length);
    return sorted;
  }, [allImages, backendFlyers]);
  const showModal = (type: ModalType, title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 350);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (next.size === 0) setSelectionMode(false);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleLongPress = (id: string) => {
    if (!selectionMode) {
      setSelectionMode(true);
      setSelectedIds(new Set([id]));
    }
  };

  const handlePress = (item: GeneratedImage) => {
    if (selectionMode) {
      toggleSelection(item.id);
    } else {
      openPreview(item);
    }
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
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

  const confirmDeleteOne = async () => {
    try {
      if (selectionMode) {
        // Supprimer toutes les sélections
        for (const id of Array.from(selectedIds)) {
          removeImage(id);
          AiService.deleteGeneration(id).catch(() => { });
        }
        setBackendFlyers((prev) => prev.filter((img) => !selectedIds.has(img.id)));
        exitSelectionMode();
      } else {
        if (!itemToDelete) return;
        const deletedId = itemToDelete;
        removeImage(deletedId);
        AiService.deleteGeneration(deletedId).catch(() => { });
        setBackendFlyers((prev) => prev.filter((img) => img.id !== deletedId));
        setItemToDelete(null);
        if (selectedImage?.id === deletedId) {
          setShowImageModal(false);
          setSelectedImage(null);
        }
      }
    } finally {
      setShowDeleteModal(false);
    }
  };

  const confirmClearAll = () => {
    clearHistory();
    setBackendFlyers([]);
    AiService.clearHistory().catch(() => { });
    setShowClearModal(false);
    setShowImageModal(false);
    setSelectedImage(null);
  };

  const MemoizedGalleryTile = useCallback(
    React.memo(({ item, isSelected, selectionMode, onPress, onLongPress, onDelete }: any) => {
      return (
        <View style={s.tileWrap}>
          <TouchableOpacity
            style={[
              s.tileTouchable,
              selectionMode && isSelected && s.tileSelected
            ]}
            onPress={onPress}
            onLongPress={onLongPress}
            delayLongPress={150}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[colors.primary.main + '0a', 'transparent']}
              style={StyleSheet.absoluteFill}
            />
            <Image
              source={{ uri: item.thumbnail || item.url }}
              style={[s.tileImage, selectionMode && isSelected && s.tileImageSelected]}
              resizeMode="cover"
            />
            {selectionMode && (
              <View style={s.selectionCircle}>
                {isSelected && <CheckCircle2 size={22} color={colors.neon.primary} fill="white" />}
                {!isSelected && <View style={s.selectionCircleEmpty} />}
              </View>
            )}
          </TouchableOpacity>
          {/* {!selectionMode && (
            <TouchableOpacity
              style={s.tileDelete}
              onPress={onDelete}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Trash2 size={14} color={colors.status.error} />
            </TouchableOpacity>
          )} */}
        </View>
      );
    }, (prevProps, nextProps) => {
      return prevProps.isSelected === nextProps.isSelected &&
        prevProps.selectionMode === nextProps.selectionMode &&
        prevProps.item.id === nextProps.item.id;
    }),
    []
  );

  const renderGalleryTile = useCallback(
    ({ item }: { item: GeneratedImage }) => {
      const isSelected = selectedIds.has(item.id);
      return (
        <MemoizedGalleryTile
          item={item}
          isSelected={isSelected}
          selectionMode={selectionMode}
          onPress={() => handlePress(item)}
          onLongPress={() => handleLongPress(item.id)}
          onDelete={() => {
            setItemToDelete(item.id);
            setShowDeleteModal(true);
          }}
        />
      );
    },
    [selectionMode, selectedIds, handlePress, handleLongPress]
  );

  return (
    <BackgroundGradientOnboarding darkOverlay>
      <SafeAreaView style={s.safe}>
        {selectionMode ? (
          <View style={[s.header, s.headerSelectionMode]}>
            <TouchableOpacity onPress={exitSelectionMode} style={s.headerIconBtn}>
              <X size={24} color="white" />
            </TouchableOpacity>
            <Text style={s.selectionCount}>{selectedIds.size} sélectionné(s)</Text>
            <View style={s.headerActions}>
              <TouchableOpacity
                onPress={() => {
                  if (selectedIds.size === images.length) setSelectedIds(new Set());
                  else setSelectedIds(new Set(images.map(img => img.id)));
                }}
                style={s.headerTextBtn}
              >
                <Text style={s.headerActionText}>
                  {selectedIds.size === images.length ? 'Annuler' : 'Tout'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowDeleteModal(true)}
                style={s.headerIconBtn}
              >
                <Trash2 size={24} color={colors.status.error} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={s.header}>
            <NeonBackButton onPress={() => router.back()} />
            <View style={s.headerCenter}>
              <Text style={s.titleSub}>Impression HD</Text>
            </View>
            <View style={{ width: 42 }} />
          </View>
        )}

        <FlatList
          data={images}
          keyExtractor={(item) => item.id}
          numColumns={COLS}
          renderItem={renderGalleryTile}
          columnWrapperStyle={s.columnWrap}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.neon.primary}
            />
          }
          ListHeaderComponent={
            <>
<<<<<<< Updated upstream
              {selectionMode ? (
                <View style={[s.header, s.headerSelectionMode]}>
                  <TouchableOpacity onPress={exitSelectionMode} style={s.headerIconBtn}>
                    <X size={24} color="white" />
                  </TouchableOpacity>
                  <Text style={s.selectionCount}>{selectedIds.size} sélectionné(s)</Text>
                  <View style={s.headerActions}>
                    <TouchableOpacity
                      onPress={() => {
                        if (selectedIds.size === images.length) setSelectedIds(new Set());
                        else setSelectedIds(new Set(images.map(img => img.id)));
                      }}
                      style={s.headerTextBtn}
                    >
                      <Text style={s.headerActionText}>
                        {selectedIds.size === images.length ? 'Annuler' : 'Tout'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowDeleteModal(true)}
                      style={s.headerIconBtn}
                    >
                      <Trash2 size={24} color={colors.status.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={s.header}>
                  <NeonBackButton onPress={() => router.back()} />
                  <View style={s.headerCenter}>
                    <Text style={s.titleSub}>Historique flyers</Text>
                  </View>
                  <View style={{ width: 42 }} />
                </View>
              )}

=======
>>>>>>> Stashed changes
              <Text style={s.subtitle}>Galerie de vos affiches et visuels HD</Text>

              {images.length > 0 && !selectionMode && (
                <TouchableOpacity style={s.clearButton} onPress={() => setShowClearModal(true)}>
                  <Trash2 size={14} color={colors.status.error} />
                  <Text style={s.clearButtonText}>Tout effacer la galerie</Text>
                </TouchableOpacity>
              )}
            </>
          }
        />

        <Modal visible={showImageModal} transparent animationType="fade">
          <View style={s.modalContainer}>
<<<<<<< Updated upstream
            <View style={s.modalHeader}>
              <TouchableOpacity onPress={() => setShowImageModal(false)}>
=======
            <View style={[s.modalHeader, { paddingTop: Math.max(insets.top, 20) }]}>
              <TouchableOpacity
                onPress={() => setShowImageModal(false)}
                style={s.modalCloseBtn}
              >
>>>>>>> Stashed changes
                <ArrowLeft size={24} color="white" />
              </TouchableOpacity>
              <Text style={s.modalTitle} numberOfLines={1}>
                {selectedImage?.title || 'Aperçu'}
              </Text>
              <View style={{ width: 24 }} />
            </View>

            {selectedImage && (
              <>
                <FlatList
                  data={images}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => item.id}
                  initialNumToRender={1}
                  maxToRenderPerBatch={2}
                  windowSize={3}
                  getItemLayout={(data, index) => ({
                    length: SCREEN_W,
                    offset: SCREEN_W * index,
                    index,
                  })}
                  initialScrollIndex={Math.max(0, images.findIndex(i => i.id === selectedImage?.id))}
                  onMomentumScrollEnd={(e) => {
                    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
                    if (images[index]) setSelectedImage(images[index]);
                  }}
                  renderItem={({ item }) => (
                    <View style={{ width: SCREEN_W, flex: 1 }}>
                      <Image
                        source={{ uri: item.url }}
                        style={s.fullImage}
                        resizeMode="contain"
                      />
                    </View>
                  )}
                />

                <View style={s.modalActions}>
                  <TouchableOpacity
                    style={[s.modalButton, s.downloadBtnLarge]}
                    onPress={() => handleDownloadImage(selectedImage)}
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
                    onPress={() => handlePrintImage(selectedImage)}
                  >
                    <Printer size={20} color="white" />
                    <Text style={s.modalButtonText}>Imprimer</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[s.modalButton, s.shareBtnLarge]}
                    onPress={() => handleShareImage(selectedImage)}
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
          title={selectionMode ? "Supprimer la sélection" : "Supprimer"}
          message={selectionMode ? `Voulez-vous vraiment supprimer les ${selectedIds.size} visuels sélectionnés ?` : "Voulez-vous vraiment supprimer ce visuel de la galerie ?"}
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
    paddingHorizontal: SCROLL_PAD,
    paddingVertical: 12,
    zIndex: 10,
    backgroundColor: 'rgba(15,23,42,0.8)',
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
    height: TILE_H,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.primary.main + '1a',
    backgroundColor: colors.background.secondary + '99',
  },
  tileSelected: {
    borderColor: colors.neon.primary,
    borderWidth: 2,
    transform: [{ scale: 0.95 }],
  },
  tileImage: {
    width: '100%',
    height: '100%',
  },
  tileImageSelected: {
    opacity: 0.8,
  },
  selectionCircle: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  selectionCircleEmpty: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'white',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tileDelete: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(15,23,42,0.85)',
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalCloseBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
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
    fontFamily: 'Arimo-Bold',
    color: 'white',
    fontSize: 14,
  },
  headerSelectionMode: {
    backgroundColor: 'rgba(0, 212, 255, 0.25)',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 212, 255, 0.3)',
  },
  selectionCount: {
    fontFamily: 'Arimo-Bold',
    color: 'white',
    fontSize: 18,
    flex: 1,
    marginLeft: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconBtn: {
    padding: 8,
  },
  headerTextBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerActionText: {
    fontFamily: 'Arimo-Bold',
    color: colors.neon.primary,
    fontSize: 16,
  },
});
