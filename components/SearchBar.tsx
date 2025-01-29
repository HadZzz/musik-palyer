import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search songs or playlists...',
}) => {
  const [query, setQuery] = useState('');

  const handleClear = () => {
    setQuery('');
    onSearch('');
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9B9B9B" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9B9B9B"
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            onSearch(text);
          }}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#9B9B9B" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#121212',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
}); 