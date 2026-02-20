import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  ChevronRight,
  Search,
  MessageSquare,
} from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { AiService } from '../../api/ai.service';
import { useCallback } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';
import { colors } from '../../theme/colors';

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

import { GenericModal } from '../../components/ui/GenericModal';
import { Trash2 } from 'lucide-react-native';

export default function HistoryScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<HistoryType | 'all'>('all');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Delete states
  const [showClearModal, setShowClearModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await AiService.getHistory();
      if (data && Array.isArray(data)) {
        const mappedData: HistoryItem[] = data.map((item: any) => ({
          id: item.id.toString(),
          type: item.type,
          title: item.title || 'Sans titre',
          date: dayjs(item.createdAt).fromNow(),
          preview: item.result || item.prompt,
          imageUrl: item.imageUrl,
        }));
        setHistory(mappedData);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
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
        return <FileText size={24} color={colors.primary.main} />;
      case 'image':
        return <ImageIcon size={24} color={colors.primary.light} />;
      case 'document':
        return <FileSpreadsheet size={24} color={colors.text.accent} />;
      case 'chat':
        return <MessageSquare size={24} color={colors.text.primary} />;
    }
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <View className="flex-row items-center gap-2">
      <TouchableOpacity
        className="flex-1 flex-row items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4"
        onPress={() => router.push({ pathname: '/(drawer)', params: { chatId: item.id } })}>
        <View className="bg-white/3 h-12 w-12 items-center justify-center rounded-lg">
          {getIcon(item.type)}
        </View>
        <View className="flex-1">
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="mr-2 flex-1 text-base font-semibold text-slate-200" numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="text-xs text-slate-400">{item.date}</Text>
          </View>
          <Text className="text-sm leading-5 text-slate-400" numberOfLines={2}>
            {item.preview}
          </Text>
        </View>
        <ChevronRight size={20} color={colors.text.muted} />
      </TouchableOpacity>

      <TouchableOpacity
        className="ml-1 h-full items-center justify-center rounded-xl bg-red-500/10 p-3"
        onPress={() => {
          setItemToDelete(item.id);
          setShowDeleteModal(true);
        }}>
        <Trash2 size={20} color={colors.status.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <BackgroundGradient>
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pb-2 pt-5">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity className="rounded-xl bg-white/10 p-2" onPress={() => router.back()}>
              <ChevronRight size={24} color={colors.text.primary} className="rotate-180" />
            </TouchableOpacity>
            <View>
              <Text className="mb-1 text-2xl font-bold text-slate-200">Historique</Text>
              <Text className="text-base text-slate-400">vos créations</Text>
            </View>
          </View>
          {history.length > 0 && (
            <TouchableOpacity
              className="rounded-lg bg-red-500/10 px-3 py-2"
              onPress={() => setShowClearModal(true)}>
              <Text className="text-sm font-semibold text-red-400">Tout effacer</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <View className="mb-2 mt-4">
          <FlatList
            horizontal
            data={FILTERS}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 10 }}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="rounded-full border px-4 py-2"
                style={
                  activeFilter === item.value
                    ? { backgroundColor: colors.primary.main, borderColor: colors.primary.main }
                    : {
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    }
                }
                onPress={() => setActiveFilter(item.value)}>
                <Text
                  className={`text-sm font-semibold ${activeFilter === item.value ? 'text-slate-200' : 'text-slate-400'
                    }`}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* History List */}
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchHistory}
          refreshing={loading}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator
                size="large"
                color={colors.primary.main}
                style={{ marginTop: 40 }}
              />
            ) : (
              <View className="items-center justify-center gap-4 pt-16">
                <Search size={48} color={colors.text.muted} />
                <Text className="text-base text-slate-400">Aucun résultat trouvé</Text>
              </View>
            )
          }
        />

        {/* Modals */}
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
          message="Attention, cette action est irréversible. Voulez-vous vraiment supprimer tout votre historique ?"
          confirmText="Tout supprimer"
          cancelText="Annuler"
          onClose={() => setShowClearModal(false)}
          onConfirm={handleClearHistory}
        />
      </SafeAreaView>
    </BackgroundGradient>
  );
}
