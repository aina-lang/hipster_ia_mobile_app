import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, StyleSheet, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Search, MessageSquare, ArrowLeft, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';

import { AiService } from '../../api/ai.service';
import { colors } from '../../theme/colors';
import { GenericModal } from '../../components/ui/GenericModal';
import { BackgroundGradientOnboarding } from '../../components/ui/BackgroundGradientOnboarding';

dayjs.extend(relativeTime);
dayjs.locale('fr');


interface HistoryItem {
  id: string;
  title: string;
  date: string;
  preview: string;
  imageUrl?: string;
}

export default function HistoryScreen() {
  const router = useRouter();
  const [history, setHistory]                 = useState<HistoryItem[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [refreshing, setRefreshing]           = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [showClearModal, setShowClearModal]   = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete]       = useState<string | null>(null);

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

  return (
    <BackgroundGradientOnboarding darkOverlay>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.neon.primary} />}
        >
          <View style={s.header}>
            <TouchableOpacity style={s.backButton} onPress={() => router.back()}>
              <ArrowLeft size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <View style={s.headerCenter}>
              <Text style={s.titleSub}>Historique</Text>
            </View>
            <View style={{ width: 42 }} />
          </View>

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
              {history.map(item => (
                <View key={item.id} style={s.itemWrapper}>
                  <TouchableOpacity
                    style={s.itemCard}
                    onPress={() => router.push({ pathname: '/(drawer)', params: { conversationId: item.id } })}
                    activeOpacity={0.7}
                  >
                    <LinearGradient colors={[colors.primary.main + '0a', 'transparent']} style={StyleSheet.absoluteFill} />
                    <View style={s.iconContainer}>
                      {item.imageUrl ? (
                        <Image
                          source={{ uri: item.imageUrl.startsWith('http') ? item.imageUrl : `https://hipster-api.fr/${item.imageUrl}` }}
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
              ))}
            </View>
          )}
        </ScrollView>

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

const s = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
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
});