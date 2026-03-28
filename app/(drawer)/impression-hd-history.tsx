import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Modal,
  Dimensions,
  ActivityIndicator,
  Share as RNShare,
} from 'react-native';
import { FlatList } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Download,
  Trash2,
  Eye,
  Printer,
  Plus,
  Menu,
  ArrowLeft,
  MoreVertical,
} from 'lucide-react-native';
import { useImageHistoryStore, GeneratedImage } from '../../store/imageHistoryStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { GenericModal, ModalType } from '../../components/ui/GenericModal';
import { NeonButton } from '../../components/ui/NeonButton';

const { width, height } = Dimensions.get('window');
const itemSize = (width - 40) / 2;

interface ImageHistoryScreenProps {
  navigation?: DrawerNavigationProp<any>;
}

export default function ImpressionHDHistoryScreen() {
  const router = useRouter();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const insets = useSafeAreaInsets();

  const { images, removeImage } = useImageHistoryStore((state) => ({
    images: state.getImagesByFormat('impression-hd'),
    removeImage: state.removeImage,
  }));

  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  const showModal = (type: ModalType, title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleViewImage = (image: GeneratedImage) => {
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

      showModal('success', 'Succès', 'Image téléchargée dans votre galerie !');
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

      // Vérifier si le fichier existe, sinon le télécharger
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        const downloadRes = await FileSystem.downloadAsync(image.url, fileUri);
        if (downloadRes.status !== 200) throw new Error('Téléchargement échoué');
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/jpeg',
          dialogTitle: `Partager - ${image.title}`,
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

      // Vérifier si le fichier existe, sinon le télécharger
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        const downloadRes = await FileSystem.downloadAsync(image.url, fileUri);
        if (downloadRes.status !== 200) throw new Error('Téléchargement échoué');
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/jpeg',
          dialogTitle: `Imprimer - ${image.title}`,
        });
      } else {
        showModal('info', 'Impression', 'Utilisez le partage pour accéder aux options d\'impression.');
      }
    } catch (error: any) {
      showModal('error', 'Erreur', `Impression échouée : ${error.message}`);
    }
  };

  const handleDeleteImage = (image: GeneratedImage) => {
    removeImage(image.id);
    showModal('success', 'Supprimé', 'Image supprimée de l\'historique.');
  };

  const renderImageCard = ({ item }: { item: GeneratedImage }) => (
    <View style={s.cardContainer}>
      <TouchableOpacity
        style={s.imageWrapper}
        onPress={() => handleViewImage(item)}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: item.thumbnail || item.url }}
          style={s.image}
          resizeMode="cover"
        />
        <View style={s.imageOverlay}>
          <Eye size={32} color="white" />
        </View>
      </TouchableOpacity>

      <View style={s.cardInfo}>
        <Text style={s.cardTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={s.cardDate}>
          {new Date(item.createdAt).toLocaleDateString('fr-FR')}
        </Text>

        <View style={s.actionButtonsSmall}>
          <TouchableOpacity
            style={[s.actionButtonSmall, s.downloadBtn]}
            onPress={() => handleDownloadImage(item)}
            disabled={downloading === item.id}
          >
            {downloading === item.id ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Download size={16} color="white" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.actionButtonSmall, s.printBtn]}
            onPress={() => handlePrintImage(item)}
          >
            <Printer size={16} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.actionButtonSmall, s.shareBtn]}
            onPress={() => handleShareImage(item)}
          >
            <MoreVertical size={16} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.actionButtonSmall, s.deleteBtn]}
            onPress={() => handleDeleteImage(item)}
          >
            <Trash2 size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <Text style={s.title}>Impression HD</Text>

        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {images.length === 0 ? (
        <View style={s.emptyContainer}>
          <Text style={s.emptyText}>Aucune image générée</Text>
          <Text style={s.emptySubtext}>
            Commencez par créer une nouvelle image d'impression HD
          </Text>
          <NeonButton
            onPress={() => router.push('/(drawer)/impression-hd-create')}
            style={{ marginTop: 24, width: '70%' }}
          >
            <Text style={{ color: colors.text.primary, fontWeight: '600', flexDirection: 'row', alignItems: 'center' }}>
              + Créer une image
            </Text>
          </NeonButton>
        </View>
      ) : (
        <>
          <FlatList
            data={images}
            keyExtractor={(item) => item.id}
            renderItem={renderImageCard}
            numColumns={2}
            columnWrapperStyle={s.columnWrapper}
            contentContainerStyle={s.listContent}
            scrollEnabled
            scrollIndicatorInsets={{ right: 1 }}
          />
          
          {/* FAB Button for Creating New Image */}
          <TouchableOpacity
            style={s.fab}
            onPress={() => router.push('/(drawer)/impression-hd-create')}
          >
            <Plus size={28} color="white" />
          </TouchableOpacity>
        </>
      )}

      {/* Image Preview Modal */}
      <Modal visible={showImageModal} transparent animationType="fade">
        <View style={s.modalContainer}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => setShowImageModal(false)}>
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <Text style={s.modalTitle}>{selectedImage?.title}</Text>
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
                >
                  <Download size={20} color="white" />
                  <Text style={s.modalButtonText}>Télécharger</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.modalButton, s.printBtnLarge]}
                  onPress={() => {
                    handlePrintImage(selectedImage);
                    setShowImageModal(false);
                  }}
                >
                  <Printer size={20} color="white" />
                  <Text style={s.modalButtonText}>Imprimer HD</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[s.modalButton, s.shareBtnLarge]}
                  onPress={() => {
                    handleShareImage(selectedImage);
                    setShowImageModal(false);
                  }}
                >
                  <MoreVertical size={20} color="white" />
                  <Text style={s.modalButtonText}>Partager</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>

      {/* Generic Modal for messages */}
      <GenericModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: fonts.arimo,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardContainer: {
    width: itemSize,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  imageWrapper: {
    width: '100%',
    height: itemSize,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  cardInfo: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: 12,
  },
  actionButtonsSmall: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonSmall: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
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
  deleteBtn: {
    backgroundColor: 'rgba(255, 0, 100, 0.3)',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.muted,
    textAlign: 'center',
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
    height: '60%',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    borderWidth: 2,
    borderColor: colors.neonBlue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
});
