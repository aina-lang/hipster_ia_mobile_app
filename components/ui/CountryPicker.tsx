import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { X, Search } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { countries, Country } from '../../api/countries';

interface CountryPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: Country) => void;
  selectedCountry?: Country;
}

export const CountryPicker: React.FC<CountryPickerProps> = ({
  visible,
  onClose,
  onSelect,
  selectedCountry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (country: Country) => {
    onSelect(country);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Sélectionner un pays</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text.muted} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={18} color={colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un pays..."
              placeholderTextColor={colors.text.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.countryItem,
                  selectedCountry?.code === item.code && styles.selectedCountryItem,
                ]}
                onPress={() => handleSelect(item)}>
                <Text style={styles.flag}>{item.flag}</Text>
                <Text style={styles.countryName}>{item.name}</Text>
                <Text style={styles.phoneCode}>{item.phoneCode}</Text>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingHorizontal: 14,
    margin: 16,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 15,
    marginLeft: 12,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  selectedCountryItem: {
    backgroundColor: colors.primary.main + '20',
  },
  flag: {
    fontSize: 24,
  },
  countryName: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
  },
  phoneCode: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '600',
  },
});
