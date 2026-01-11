import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { BackgroundGradient } from '../../components/ui/BackgroundGradient';
import { colors } from '../../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  ChevronRight,
  Search,
  Filter,
} from 'lucide-react-native';
import { Drawer } from 'expo-router/drawer';
import { useRouter } from 'expo-router';

// Temporary Mock Data
type HistoryType = 'text' | 'image' | 'document';

interface HistoryItem {
  id: string;
  type: HistoryType;
  title: string;
  date: string;
  preview: string;
  imageUrl?: string;
}

const MOCK_HISTORY: HistoryItem[] = [
  {
    id: '1',
    type: 'text',
    title: 'Post Instagram - Noël',
    date: 'Il y a 2 heures',
    preview: 'Découvrez notre collection magique pour les fêtes ! 🎄✨ #Noël #Cadeaux',
  },
  {
    id: '2',
    type: 'image',
    title: 'Affiche Publicitaire',
    date: 'Hier',
    preview: "Génération d'image pour campagne été",
    imageUrl: 'https://via.placeholder.com/150', // Would be a real URL
  },
  {
    id: '3',
    type: 'document',
    title: 'Rapport Mensuel.xlsx',
    date: 'Il y a 2 jours',
    preview: 'Analyse des ventes octobre 2025',
  },
  {
    id: '4',
    type: 'text',
    title: 'Article de Blog - IA',
    date: 'Il y a 3 jours',
    preview: "L'intelligence artificielle révolutionne le marketing digital...",
  },
  {
    id: '5',
    type: 'image',
    title: 'Logo Concept',
    date: 'Il y a 1 semaine',
    preview: 'Version minimaliste néon',
  },
];

const FILTERS: { label: string; value: HistoryType | 'all' }[] = [
  { label: 'Tout', value: 'all' },
  { label: 'Textes', value: 'text' },
  { label: 'Images', value: 'image' },
  { label: 'Documents', value: 'document' },
];

export default function HistoryScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<HistoryType | 'all'>('all');

  const filteredData =
    activeFilter === 'all'
      ? MOCK_HISTORY
      : MOCK_HISTORY.filter((item) => item.type === activeFilter);

  const getIcon = (type: HistoryType) => {
    switch (type) {
      case 'text':
        return <FileText size={24} color={colors.primary.main} />;
      case 'image':
        return <ImageIcon size={24} color={colors.primary.light} />;
      case 'document':
        return <FileSpreadsheet size={24} color={colors.text.accent} />;
    }
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/(drawer)', params: { chatId: item.id } })}>
      <View style={styles.cardIconContainer}>{getIcon(item.type)}</View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardDate}>{item.date}</Text>
        </View>
        <Text style={styles.cardPreview} numberOfLines={2}>
          {item.preview}
        </Text>
      </View>
      <ChevronRight size={20} color={colors.text.muted} />
    </TouchableOpacity>
  );

  return (
    <BackgroundGradient>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Historique</Text>
          <Text style={styles.subtitle}>Retrouvez toutes vos créations</Text>
        </View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            data={FILTERS}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.filterChip, activeFilter === item.value && styles.activeFilterChip]}
                onPress={() => setActiveFilter(item.value)}>
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === item.value && styles.activeFilterText,
                  ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Content List */}
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Search size={48} color={colors.text.muted} />
              <Text style={styles.emptyText}>Aucun résultat trouvé</Text>
            </View>
          }
        />
      </SafeAreaView>
    </BackgroundGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  filterContainer: {
    marginBottom: 10,
  },
  filterList: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeFilterChip: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterText: {
    color: colors.text.secondary,
    fontWeight: '600',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#fefefe',
  },
  listContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 16,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  cardDate: {
    fontSize: 12,
    color: colors.text.muted,
  },
  cardPreview: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 16,
  },
  emptyText: {
    color: colors.text.secondary,
    fontSize: 16,
  },
});
