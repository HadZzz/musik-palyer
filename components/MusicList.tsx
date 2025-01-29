import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song } from '../constants/MusicData';

interface MusicListProps {
  songs: Song[];
  currentSong: Song | null;
  onSongSelect: (song: Song) => void;
}

export const MusicList: React.FC<MusicListProps> = ({ songs, currentSong, onSongSelect }) => {
  const renderItem = ({ item }: { item: Song }) => (
    <TouchableOpacity
      style={[
        styles.songItem,
        currentSong?.id === item.id && styles.currentSong,
      ]}
      onPress={() => onSongSelect(item)}
    >
      {item.artwork ? (
        <Image source={item.artwork as ImageSourcePropType} style={styles.artwork} />
      ) : (
        <View style={[styles.artwork, styles.placeholderArtwork]}>
          <Ionicons name="musical-note" size={20} color="#9B9B9B" />
        </View>
      )}
      <View style={styles.songInfo}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.artist} numberOfLines={1}>{item.artist}</Text>
      </View>
      {currentSong?.id === item.id && (
        <View style={styles.playingIndicator}>
          <Ionicons name="musical-notes" size={16} color="#9B6B9E" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>音楽プレーヤー</Text>
      <FlatList
        data={songs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    padding: 20,
    textAlign: 'center',
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  songItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  currentSong: {
    backgroundColor: '#2A2A2A',
    borderColor: '#3A3A3A',
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  placeholderArtwork: {
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  songInfo: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
    color: '#9B9B9B',
  },
  playingIndicator: {
    marginLeft: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
}); 
