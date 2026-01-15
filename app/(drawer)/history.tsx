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
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { AiService } from '../../api/ai.service';
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

export default function HistoryScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<HistoryType | 'all'>('all');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchHistory();
  }, []);

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
        return <Search size={24} color={colors.text.primary} />;
    }
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity
      className="flex-row items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-4"
      onPress={() => router.push({ pathname: '/(drawer)', params: { chatId: item.id } })}>
      <View className="bg-white/3 h-12 w-12 items-center justify-center rounded-lg">
        {getIcon(item.type)}
      </View>
      <View className="flex-1">
        <View className="mb-1 flex-row items-center justify-between">
          <Text className="mr-2 flex-1 text-base font-semibold text-white" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="text-xs text-white/60">{item.date}</Text>
        </View>
        <Text className="text-sm leading-5 text-white/60" numberOfLines={2}>
          {item.preview}
        </Text>
      </View>
      <ChevronRight size={20} color={colors.text.muted} />
    </TouchableOpacity>
  );

  return (
    <BackgroundGradient>
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center gap-4 px-5 pb-2 pt-5">
          <TouchableOpacity className="rounded-xl bg-white/10 p-2" onPress={() => router.back()}>
            <ChevronRight size={24} color={colors.text.primary} className="rotate-180" />
          </TouchableOpacity>
          <View>
            <Text className="mb-1 text-2xl font-bold text-white">Historique</Text>
            <Text className="text-base text-white/60">Retrouvez toutes vos créations</Text>
          </View>
        </View>

        {/* Filters */}
        <View className="mb-2">
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
                  className={`text-sm font-semibold ${
                    activeFilter === item.value ? 'text-white' : 'text-white/60'
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
                <Text className="text-base text-white/60">Aucun résultat trouvé</Text>
              </View>
            )
          }
        />
      </SafeAreaView>
    </BackgroundGradient>
  );
}
