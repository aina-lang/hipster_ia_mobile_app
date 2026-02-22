import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  ChevronRight,
  Search,
  MessageSquare,
  ArrowLeft,
  Trash2,
} from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AiService } from '../../api/ai.service';
import { useCallback } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';
import { colors } from '../../theme/colors';
import { GenericModal } from '../../components/ui/GenericModal';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';

dayjs.extend(relativeTime);
dayjs.locale('fr');

type HistoryType = 'text' | 'image' | 'document' | 'chat';

interface HistoryItem {
  id: string;
  type: HistoryType;
  title: string;
  date: string;
  preview: string;
  imageUrl?: string;
}

const FILTERS: { label: string; value: HistoryType | 'all' }[] = [
  { label: 'Tout', value: 'all' },
  { label: 'Textes', value: 'text' },
  { label: 'Images', value: 'image' },
  { label: 'Documents', value: 'document' },
  { label: 'Chats', value: 'chat' },
];

export default function HistoryScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<HistoryType | 'all'>('all');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete states
  const [showClearModal, setShowClearModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const generateTitle = (item: any): string => {
    if (item.title && item.title.trim() && item.title !== 'Sans titre') {
      return item.title;
    }
    const text = (item.prompt || item.result || '').trim();
    if (text && text.length > 0) {
      const cleaned = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
      const maxLength = 50;
      if (cleaned.length > maxLength) {
        return cleaned.substring(0, maxLength).trim() + '...';
      }
      return cleaned;
    }
    return 'Sans titre';
  };

  const generatePreview = (item: any): string => {
    const result = item.result || '';
    if (typeof result === 'string' && (result.includes('ERROR') || result.includes('error'))) {
      return '';
    }
    if (item.type === 'text' && result && result.length > 0 && !result.includes('ERROR')) {
      const cleaned = result.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
      const maxLength = 120;
      if (cleaned.length > maxLength) {
        return cleaned.substring(0, maxLength).trim() + '...';
      }
      return cleaned;
    }
    return '';
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AiService.getHistory();
      if (data && Array.isArray(data)) {
        const mappedData: HistoryItem[] = data.map((item: any) => ({
          id: item.id.toString(),
          type: item.type,
          title: generateTitle(item),
          date: dayjs(item.createdAt).fromNow(),
          preview: generatePreview(item),
          imageUrl: item.imageUrl,
        }));
        setHistory(mappedData);
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Une erreur est survenue';
      setError(errorMsg);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  const handleClearHistory = async () => {
    try {
      await AiService.clearHistory();
      setHistory([]);
      setShowClearModal(false);
    } catch (error) {
      console.error('Failed to clear history', error);
    }
  };

  const handleDeleteItem = async () => {
    if (itemToDelete) {
      try {
        await AiService.deleteGeneration(itemToDelete);
        setHistory((prev) => prev.filter((i) => i.id !== itemToDelete));
        setItemToDelete(null);
        setShowDeleteModal(false);
      } catch (error) {
        console.error('Failed to delete item', error);
      }
    }
  };

  const filteredData =
    activeFilter === 'all' ? history : history.filter((item) => item.type === activeFilter);

  const getIcon = (type: HistoryType) => {
    switch (type) {
      case 'text':
        return <FileText size={22} color="#1e9bff" />;
      case 'image':
        return <ImageIcon size={22} color="#10b981" />;
      case 'document':
        return <FileSpreadsheet size={22} color="#f59e0b" />;
      case 'chat':
        return <MessageSquare size={22} color="#8b5cf6" />;
    }
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <View style={styles.itemWrapper}>
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => router.push({ pathname: '/(drawer)', params: { chatId: item.id } })}
        activeOpacity={0.7}
      >
        <BlurView intensity={20} style={StyleSheet.absoluteFill} tint="light" />
        <View style={styles.iconContainer}>
          {getIcon(item.type)}
        </View>
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.itemDate}>{item.date}</Text>
          </View>
          <Text style={styles.itemPreview} numberOfLines={2}>
            {item.preview || 'Aucun aperçu disponible'}
          </Text>
        </View>
        <ChevronRight size={18} color={colors.text.muted} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          setItemToDelete(item.id);
          setShowDeleteModal(true);
        }}>
        <Trash2 size={18} color={colors.status.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <BackgroundGradientOnboarding darkOverlay={true} blurIntensity={90} imageSource="splash">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Historique</Text>
            <Text style={styles.subtitle}>Retrouvez toutes vos créations</Text>
          </View>
          {history.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setShowClearModal(true)}>
              <Trash2 size={16} color={colors.status.error} />
              <Text style={styles.clearButtonText}>Effacer</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <View style={styles.filtersWrapper}>
          <FlatList
            horizontal
            data={FILTERS}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setActiveFilter(item.value)}
                style={[
                  styles.filterChip,
                  activeFilter === item.value && styles.activeFilterChip
                ]}>
                {activeFilter === item.value && (
                  <BlurView intensity={30} style={StyleSheet.absoluteFill} tint="light" />
                )}
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === item.value && styles.activeFilterText
                  ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* List */}
        <View style={{ flex: 1 }}>
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={fetchHistory}
            refreshing={loading}
            ListEmptyComponent={
              loading ? (
                <View style={styles.emptyContainer}>
                  <ActivityIndicator size="large" color="#1e9bff" />
                </View>
              ) : error ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={fetchHistory}>
                    <Text style={styles.retryText}>Réessayer</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Search size={48} color={colors.text.muted} />
                  <Text style={styles.emptyText}>Aucun résultat trouvé</Text>
                </View>
              )
            }
          />
        </View>

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
      </SafeAreaView>
    </BackgroundGradientOnboarding>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.muted,
    marginTop: 2,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  clearButtonText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '700',
  },
  filtersWrapper: {
    marginBottom: 16,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  activeFilterChip: {
    backgroundColor: 'rgba(30, 155, 255, 0.15)',
    borderColor: 'rgba(30, 155, 255, 0.4)',
  },
  filterText: {
    color: colors.text.muted,
    fontSize: 14,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#1e9bff',
  },
  listContent: {
    padding: 20,
    gap: 12,
    paddingBottom: 40,
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
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    overflow: 'hidden',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
    marginRight: 8,
  },
  itemDate: {
    fontSize: 11,
    color: colors.text.muted,
  },
  itemPreview: {
    fontSize: 13,
    color: colors.text.muted,
    lineHeight: 18,
  },
  deleteButton: {
    width: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.muted,
    fontWeight: '500',
  },
  errorText: {
    color: colors.status.error,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  retryText: {
    color: colors.text.primary,
    fontWeight: '600',
  },
});

