import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageSourcePropType, Dimensions, Modal, Animated, ScrollView, TextInput } from 'react-native';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { Song } from '../constants/MusicData';
import { VolumeControl } from './VolumeControl';
import { PanGestureHandler, State, PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import { MusicPlayerProps } from '../constants/types';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MINIMIZED_HEIGHT = 80;
const FULL_HEIGHT = SCREEN_HEIGHT - 100;

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  currentSong,
  songs,
  onNextSong,
  onPreviousSong,
  shuffleMode,
  repeatMode,
  onShufflePress,
  onRepeatPress,
  isExpanded,
  onToggleExpand,
  onToggleFavorite,
  isFavorite,
  playlists,
  onAddToPlaylist,
  onCreatePlaylist,
  onCreateFolder,
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const wasPlayingRef = useRef(false);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT - MINIMIZED_HEIGHT)).current;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [createMode, setCreateMode] = useState<'folder' | 'playlist'>('playlist');
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>(undefined);

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          wasPlayingRef.current = isPlaying;
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    if (currentSong) {
      wasPlayingRef.current = isPlaying;
      loadAudio();
    }
  }, [currentSong]);

  const loadAudio = async () => {
    try {
      if (currentSong) {
        console.log('Loading new song:', currentSong.uri);
        
        if (sound) {
          await sound.unloadAsync();
        }

        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: currentSong.uri },
          { shouldPlay: true, volume: volume },
          onPlaybackStatusUpdate
        );

        setSound(newSound);
        setIsPlaying(true);
        setPosition(0);
        setDuration(currentSong.duration);
        
        console.log('New sound loaded successfully and playing');
      }
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis / 1000);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        onNextSong();
      }
    }
  };

  const handlePlayPause = async () => {
    try {
      if (!sound) {
        console.log('No sound loaded');
        return;
      }

      if (isPlaying) {
        console.log('Pausing sound');
        await sound.pauseAsync();
      } else {
        console.log('Playing sound');
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error in play/pause:', error);
    }
  };

  const handleSeek = async (value: number) => {
    if (sound) {
      try {
        await sound.setPositionAsync(value * 1000);
      } catch (error) {
        console.error('Error seeking:', error);
      }
    }
  };

  const handleVolumeChange = async (value: number) => {
    if (sound) {
      try {
        await sound.setVolumeAsync(value);
        setVolume(value);
      } catch (error) {
        console.error('Error changing volume:', error);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationY } = event.nativeEvent;
      const shouldExpand = translationY < -50 || (isExpanded && translationY < 50);
      
      Animated.spring(translateY, {
        toValue: shouldExpand ? 0 : SCREEN_HEIGHT - MINIMIZED_HEIGHT,
        useNativeDriver: true,
      }).start();
      
      onToggleExpand();
    }
  };

  const toggleModal = () => {
    if (!isModalVisible) {
      setIsModalVisible(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsModalVisible(false);
      });
    }
  };

  const renderMinimizedPlayer = () => (
    <TouchableOpacity style={styles.minimizedContainer} onPress={() => onToggleExpand()}>
      <Image
        source={typeof currentSong.artwork === 'string' 
          ? { uri: currentSong.artwork }
          : currentSong.artwork as ImageSourcePropType}
        style={styles.miniArtwork}
      />
      <View style={styles.miniInfo}>
        <Text style={styles.miniTitle} numberOfLines={1}>
          {currentSong.title}
        </Text>
        <Text style={styles.miniArtist} numberOfLines={1}>
          {currentSong.artist}
        </Text>
      </View>
      <View style={styles.miniControls}>
        <TouchableOpacity onPress={onPreviousSong}>
          <Ionicons name="play-skip-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.miniPlayButton} onPress={handlePlayPause}>
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={24} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={onNextSong}>
          <Ionicons name="play-skip-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderExpandedPlayer = () => (
    <Modal
      visible={isExpanded}
      animationType="slide"
      transparent={true}
      onRequestClose={() => onToggleExpand()}
    >
      <View style={styles.modalContainer}>
        <View style={styles.expandedPlayer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => onToggleExpand()}>
            <Ionicons name="chevron-down" size={30} color="#FFFFFF" />
          </TouchableOpacity>

          <Image
            source={typeof currentSong.artwork === 'string' 
              ? { uri: currentSong.artwork }
              : currentSong.artwork as ImageSourcePropType}
            style={styles.artwork}
          />

          <View style={styles.songInfo}>
            <Text style={styles.title}>{currentSong.title}</Text>
            <Text style={styles.artist}>{currentSong.artist}</Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity onPress={onShufflePress}>
              <Ionicons
                name="shuffle"
                size={24}
                color={shuffleMode ? '#9B6B9E' : '#FFFFFF'}
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={onPreviousSong}>
              <Ionicons name="play-skip-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={32} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={onNextSong}>
              <Ionicons name="play-skip-forward" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity onPress={onRepeatPress}>
              <Ionicons
                name={repeatMode === 'one' ? 'sync' : 'repeat'}
                size={24}
                color={repeatMode !== 'off' ? '#9B6B9E' : '#FFFFFF'}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer}>
            <Text style={styles.time}>{formatTime(position)}</Text>
            <Slider
              style={styles.progressBar}
              value={position}
              minimumValue={0}
              maximumValue={duration}
              onSlidingComplete={handleSeek}
              minimumTrackTintColor="#9B6B9E"
              maximumTrackTintColor="#2A2A2A"
              thumbTintColor="#9B6B9E"
            />
            <Text style={styles.time}>{formatTime(duration)}</Text>
          </View>

          <View style={styles.additionalControls}>
            <TouchableOpacity onPress={onToggleFavorite}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? '#9B6B9E' : '#FFFFFF'}
              />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => setShowPlaylistModal(true)}>
              <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderCreateModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowCreateModal(false)}
    >
      <View style={styles.playlistModalContainer}>
        <View style={styles.playlistModalContent}>
          <View style={styles.playlistModalHeader}>
            <Text style={styles.playlistModalTitle}>
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
                  if (currentSong) {
                    // Wait for the playlist to be created
                    setTimeout(() => {
                      const newPlaylist = playlists.find(p => p.name === newItemName);
                      if (newPlaylist) {
                        onAddToPlaylist(newPlaylist.id, currentSong);
                      }
                    }, 100);
                  }
                }
                setNewItemName('');
                setShowCreateModal(false);
                setShowPlaylistModal(true);
              }}
            >
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderPlaylistModal = () => (
    <Modal
      visible={showPlaylistModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowPlaylistModal(false)}
    >
      <View style={styles.playlistModalContainer}>
        <View style={styles.playlistModalContent}>
          <View style={styles.playlistModalHeader}>
            <Text style={styles.playlistModalTitle}>Add to Playlist</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.createNewButton}
                onPress={() => {
                  setShowPlaylistModal(false);
                  setCreateMode('folder');
                  setShowCreateModal(true);
                }}
              >
                <Ionicons name="folder-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.createNewButton}
                onPress={() => {
                  setShowPlaylistModal(false);
                  setCreateMode('playlist');
                  setShowCreateModal(true);
                }}
              >
                <Ionicons name="add-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowPlaylistModal(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView style={styles.playlistList}>
            {playlists.map(playlist => (
              <View key={playlist.id}>
                {playlist.isFolder ? (
                  <TouchableOpacity
                    style={[
                      styles.folderItem,
                      selectedFolder === playlist.id && styles.selectedFolder
                    ]}
                    onPress={() => setSelectedFolder(
                      selectedFolder === playlist.id ? undefined : playlist.id
                    )}
                  >
                    <View style={styles.folderHeader}>
                      <Ionicons 
                        name={selectedFolder === playlist.id ? "folder-open" : "folder"} 
                        size={24} 
                        color="#9B6B9E" 
                      />
                      <Text style={styles.folderName}>{playlist.name}</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  (!selectedFolder || playlist.parentId === selectedFolder) && (
                    <TouchableOpacity
                      style={[
                        styles.playlistItem,
                        selectedFolder && !playlist.parentId && styles.hiddenPlaylist
                      ]}
                      onPress={() => {
                        onAddToPlaylist(playlist.id, currentSong);
                        setShowPlaylistModal(false);
                      }}
                    >
                      <Text style={styles.playlistName}>{playlist.name}</Text>
                      <Text style={styles.playlistSongCount}>
                        {playlist.songs.length} songs
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (!currentSong) {
    return null;
  }

  return (
    <>
      {isExpanded ? renderExpandedPlayer() : renderMinimizedPlayer()}
      {renderPlaylistModal()}
      {renderCreateModal()}
    </>
  );
};

const styles = StyleSheet.create({
  minimizedContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#1A1A1A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  miniArtwork: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  miniInfo: {
    flex: 1,
    marginLeft: 12,
  },
  miniTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  miniArtist: {
    color: '#9B9B9B',
    fontSize: 12,
  },
  miniControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  miniPlayButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9B6B9E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  expandedPlayer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  artwork: {
    width: 300,
    height: 300,
    borderRadius: 8,
    marginTop: 40,
  },
  songInfo: {
    alignItems: 'center',
    marginTop: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  artist: {
    color: '#9B9B9B',
    fontSize: 18,
    marginTop: 8,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 40,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#9B6B9E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '40%',
    marginTop: 30,
  },
  playlistModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  playlistModalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '70%',
  },
  playlistModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  playlistModalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  playlistList: {
    padding: 20,
  },
  playlistItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  playlistName: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  playlistSongCount: {
    color: '#9B9B9B',
    fontSize: 12,
    marginTop: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 30,
  },
  progressBar: {
    flex: 1,
    marginHorizontal: 10,
  },
  time: {
    color: '#9B9B9B',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  createNewButton: {
    padding: 4,
  },
  createForm: {
    padding: 20,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
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
  hiddenPlaylist: {
    display: 'none',
  },
}); 