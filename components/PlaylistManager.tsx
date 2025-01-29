import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlaylistManagerProps } from '../constants/types';

export const PlaylistManager: React.FC<PlaylistManagerProps> = ({
  playlists,
  currentSong,
  onCreatePlaylist,
  onCreateFolder,
  onAddToPlaylist,
  onRemoveFromPlaylist,
  onPlaylistSelect,
  onSongSelect,
  favorites,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [createMode, setCreateMode] = useState<'folder' | 'playlist'>('playlist');
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>(undefined);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | undefined>(undefined);

  const handlePlaylistSelect = (playlist: typeof playlists[0]) => {
    setSelectedPlaylist(playlist.id);
    onPlaylistSelect(playlist);
  };

  const handleSongSelect = (song: typeof favorites[0], playlistSongs: typeof favorites) => {
    onSongSelect(song);
    // Cari playlist yang sesuai dan set sebagai current playlist
    const playlist = playlists.find(p => {
      // Cek apakah lagu ada di playlist ini
      return p.songs.some(s => s.id === song.id);
    });
    
    if (playlist) {
      setSelectedPlaylist(playlist.id);
      onPlaylistSelect({
        ...playlist,
        // Pastikan urutan lagu dimulai dari lagu yang dipilih
        songs: [
          song,
          ...playlist.songs.filter(s => s.id !== song.id)
        ]
      });
    }
  };

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Create New {createMode === 'folder' ? 'Folder' : 'Playlist'}
            </Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.createForm}>
            <TextInput
              style={styles.input}
              placeholder={`Enter ${createMode === 'folder' ? 'folder' : 'playlist'} name`}
              placeholderTextColor="#9B9B9B"
              value={newItemName}
              onChangeText={setNewItemName}
              autoFocus
            />
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => {
                if (createMode === 'folder') {
                  onCreateFolder(newItemName);
                } else {
                  onCreatePlaylist(newItemName, selectedFolder);
                }
                setNewItemName('');
                setShowCreateModal(false);
              }}
            >
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderPlaylist = (playlist: typeof playlists[0]) => {
    if (playlist.isFolder) {
      return (
        <View key={playlist.id}>
          <TouchableOpacity
            style={[
              styles.folderItem,
              selectedFolder === playlist.id && styles.selectedFolder
            ]}
            onPress={() => {
              if (playlist.isSpecial) {
                setSelectedPlaylist(playlist.id);
                onPlaylistSelect(playlist);
              } else {
                setSelectedFolder(
                  selectedFolder === playlist.id ? undefined : playlist.id
                );
              }
            }}
          >
            <View style={styles.folderHeader}>
              <Ionicons 
                name={selectedFolder === playlist.id || selectedPlaylist === playlist.id ? "folder-open" : "folder"} 
                size={24} 
                color={playlist.isSpecial ? "#FFD700" : "#9B6B9E"}
              />
              <Text style={[
                styles.folderName,
                playlist.isSpecial && styles.specialFolderName
              ]}>
                {playlist.name}
                {playlist.isSpecial && ` (${playlist.songs.length})`}
              </Text>
            </View>
          </TouchableOpacity>
          
          {playlist.isSpecial && selectedPlaylist === playlist.id && (
            <View style={styles.folderContent}>
              <ScrollView style={styles.songList}>
                {playlist.songs.map(song => (
                  <TouchableOpacity
                    key={song.id}
                    style={[
                      styles.songItem,
                      currentSong?.id === song.id && styles.currentSongItem
                    ]}
                    onPress={() => handleSongSelect(song, playlist.songs)}
                  >
                    <View style={styles.songInfo}>
                      {currentSong?.id === song.id && (
                        <Ionicons name="musical-note" size={16} color="#9B6B9E" style={styles.playingIcon} />
                      )}
                      <Text style={[
                        styles.songTitle,
                        currentSong?.id === song.id && styles.currentSongText
                      ]} numberOfLines={1}>
                        {song.title}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => onRemoveFromPlaylist(playlist.id, song.id)}
                    >
                      <Ionicons name="heart" size={20} color="#FFD700" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
                {playlist.songs.length === 0 && (
                  <Text style={styles.emptyText}>No favorite songs yet</Text>
                )}
              </ScrollView>
            </View>
          )}
          
          {!playlist.isSpecial && selectedFolder === playlist.id && (
            <View style={styles.folderContent}>
              {playlists
                .filter(p => !p.isFolder && p.parentId === playlist.id)
                .map(subPlaylist => renderPlaylist(subPlaylist))}
            </View>
          )}
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={playlist.id}
        style={[
          styles.playlistItem,
          selectedPlaylist === playlist.id && styles.selectedPlaylist
        ]}
        onPress={() => handlePlaylistSelect(playlist)}
      >
        <View style={styles.playlistHeader}>
          <Text style={styles.playlistName}>{playlist.name}</Text>
          <Text style={styles.songCount}>{playlist.songs.length} songs</Text>
        </View>
        {selectedPlaylist === playlist.id && (
          <ScrollView style={styles.songList}>
            {playlist.songs.map(song => (
              <TouchableOpacity
                key={song.id}
                style={[
                  styles.songItem,
                  currentSong?.id === song.id && styles.currentSongItem
                ]}
                onPress={() => handleSongSelect(song, playlist.songs)}
              >
                <View style={styles.songInfo}>
                  {currentSong?.id === song.id && (
                    <Ionicons name="musical-note" size={16} color="#9B6B9E" style={styles.playingIcon} />
                  )}
                  <Text style={[
                    styles.songTitle,
                    currentSong?.id === song.id && styles.currentSongText
                  ]} numberOfLines={1}>
                    {song.title}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => onRemoveFromPlaylist(playlist.id, song.id)}
                >
                  <Ionicons name="close-circle" size={20} color="#9B9B9B" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
            {playlist.songs.length === 0 && (
              <Text style={styles.emptyText}>No songs in this playlist</Text>
            )}
          </ScrollView>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Playlists</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => {
              setCreateMode('folder');
              setShowCreateModal(true);
            }}
          >
            <Ionicons name="folder-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => {
              setCreateMode('playlist');
              setShowCreateModal(true);
            }}
          >
            <Ionicons name="add-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {playlists.map(playlist => renderPlaylist(playlist))}
      </ScrollView>

      {renderCreateModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  content: {
    flex: 1,
  },
  folderItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
    backgroundColor: '#1F1F1F',
  },
  selectedFolder: {
    backgroundColor: '#2A2A2A',
  },
  folderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  folderName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  specialFolderName: {
    color: '#FFD700',
  },
  folderContent: {
    marginLeft: 24,
  },
  playlistItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  selectedPlaylist: {
    backgroundColor: '#2A2A2A',
  },
  playlistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playlistName: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  songCount: {
    color: '#9B9B9B',
    fontSize: 12,
  },
  songList: {
    marginTop: 12,
    maxHeight: 200,
  },
  songItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#1A1A1A',
    marginVertical: 2,
    borderRadius: 4,
  },
  songTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  createForm: {
    gap: 16,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#9B6B9E',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    color: '#9B9B9B',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  playingIcon: {
    marginRight: 8,
  },
  currentSongItem: {
    backgroundColor: '#2A2A2A',
  },
  currentSongText: {
    color: '#9B6B9E',
    fontWeight: '600',
  },
}); 