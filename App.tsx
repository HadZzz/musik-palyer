import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import { MusicList } from './components/MusicList';
import { MusicPlayer } from './components/MusicPlayer';
import { PlaylistManager } from './components/PlaylistManager';
import { NavigationBar } from './components/NavigationBar';
import { SearchBar } from './components/SearchBar';
import { PlaylistStats } from './components/PlaylistStats';
import { ErrorBoundary } from './components/ErrorBoundary';
import { defaultMusicData, Song, loadSongsFromDevice } from './constants/MusicData';
import { Playlist } from './constants/types';

type Screen = 'songs' | 'playlists' | 'favorites';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('songs');
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [songs, setSongs] = useState<Song[]>(defaultMusicData);
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [shuffledQueue, setShuffledQueue] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
  const [favorites, setFavorites] = useState<Song[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setupAudio();
    loadSongs();
    // Create favorites folder if it doesn't exist
    const favoritesFolder = playlists.find(p => p.id === 'favorites');
    if (!favoritesFolder) {
      const newFavoritesFolder: Playlist = {
        id: 'favorites',
        name: 'Favorites',
        songs: favorites,
        createdAt: new Date(),
        updatedAt: new Date(),
        isFolder: true,
        isSpecial: true, // Mark as special folder
        subPlaylists: [],
      };
      setPlaylists(prev => [newFavoritesFolder, ...prev]);
    }
  }, []);

  // Update favorites folder whenever favorites change
  useEffect(() => {
    setPlaylists(prevPlaylists => 
      prevPlaylists.map(playlist => {
        if (playlist.id === 'favorites') {
          return {
            ...playlist,
            songs: favorites,
            updatedAt: new Date(),
          };
        }
        return playlist;
      })
    );
  }, [favorites]);

  useEffect(() => {
    if (shuffleMode) {
      const newQueue = [...songs].sort(() => Math.random() - 0.5);
      setShuffledQueue(newQueue);
    }
  }, [shuffleMode, songs]);

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  };

  const loadSongs = async () => {
    const deviceSongs = await loadSongsFromDevice();
    if (deviceSongs.length > 0) {
      setSongs(deviceSongs);
    }
  };

  const handleSongSelect = (song: Song) => {
    setCurrentSong(song);
  };

  const toggleShuffle = () => {
    setShuffleMode(!shuffleMode);
  };

  const toggleRepeat = () => {
    const modes: ('off' | 'one' | 'all')[] = ['off', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const handleNextSong = () => {
    if (!currentSong) return;

    if (repeatMode === 'one') {
      setCurrentSong({ ...currentSong });
      return;
    }

    const currentList = shuffleMode ? shuffledQueue : songs;
    const currentIndex = currentList.findIndex(song => song.id === currentSong.id);
    
    if (currentIndex === currentList.length - 1) {
      if (repeatMode === 'all') {
        setCurrentSong(currentList[0]);
      }
    } else {
      setCurrentSong(currentList[currentIndex + 1]);
    }
  };

  const handlePreviousSong = () => {
    if (!currentSong) return;

    if (repeatMode === 'one') {
      setCurrentSong({ ...currentSong });
      return;
    }

    const currentList = shuffleMode ? shuffledQueue : songs;
    const currentIndex = currentList.findIndex(song => song.id === currentSong.id);
    
    if (currentIndex === 0) {
      if (repeatMode === 'all') {
        setCurrentSong(currentList[currentList.length - 1]);
      }
    } else {
      setCurrentSong(currentList[currentIndex - 1]);
    }
  };

  const toggleFavorite = (song: Song) => {
    setFavorites(prevFavorites => {
      const isFavorite = prevFavorites.some(fav => fav.id === song.id);
      if (isFavorite) {
        return prevFavorites.filter(fav => fav.id !== song.id);
      } else {
        return [...prevFavorites, song];
      }
    });
  };

  const handleCreatePlaylistFolder = (name: string) => {
    // Don't allow creating a folder with the same name as Favorites
    if (name.toLowerCase() === 'favorites') {
      return;
    }
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      songs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isFolder: true,
      subPlaylists: [],
    };
    setPlaylists([...playlists, newPlaylist]);
  };

  const handleCreatePlaylist = (name: string, parentId?: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      songs: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isFolder: false,
      parentId,
    };

    if (parentId) {
      setPlaylists(prevPlaylists => 
        prevPlaylists.map(playlist => {
          if (playlist.id === parentId && playlist.isFolder) {
            return {
              ...playlist,
              subPlaylists: [...(playlist.subPlaylists || []), newPlaylist.id],
            };
          }
          return playlist;
        })
      );
    }
    
    setPlaylists(prevPlaylists => [...prevPlaylists, newPlaylist]);
  };

  const handleAddToPlaylist = (playlistId: string, song: Song) => {
    setPlaylists(playlists.map(playlist => {
      if (playlist.id === playlistId && !playlist.songs.find(s => s.id === song.id)) {
        return {
          ...playlist,
          songs: [...playlist.songs, song],
          updatedAt: new Date(),
        };
      }
      return playlist;
    }));
  };

  const handleRemoveFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(playlists.map(playlist => {
      if (playlist.id === playlistId) {
        return {
          ...playlist,
          songs: playlist.songs.filter(song => song.id !== songId),
          updatedAt: new Date(),
        };
      }
      return playlist;
    }));
  };

  const handlePlaylistSelect = (playlist: Playlist) => {
    setCurrentPlaylist(playlist);
    if (playlist.songs.length > 0) {
      setCurrentSong(playlist.songs[0]);
    }
  };

  const togglePlayerExpansion = () => {
    setIsPlayerExpanded(!isPlayerExpanded);
  };

  // Filtered songs based on search query
  const filteredSongs: Song[] = songs.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered playlists based on search query
  const filteredPlaylists: Playlist[] = playlists.filter(playlist =>
    !playlist.isFolder && playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCurrentScreen = () => {
    const content = (
      <>
        <SearchBar
          onSearch={setSearchQuery}
          placeholder={
            currentScreen === 'songs' 
              ? 'Search songs...' 
              : currentScreen === 'playlists'
              ? 'Search playlists...'
              : 'Search favorites...'
          }
        />
        {currentScreen === 'songs' ? (
          <MusicList
            songs={filteredSongs}
            currentSong={currentSong}
            onSongSelect={handleSongSelect}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            playlists={playlists}
            onAddToPlaylist={handleAddToPlaylist}
          />
        ) : currentScreen === 'favorites' ? (
          <MusicList
            songs={favorites}
            currentSong={currentSong}
            onSongSelect={handleSongSelect}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            playlists={playlists}
            onAddToPlaylist={handleAddToPlaylist}
          />
        ) : (
          <>
            <PlaylistManager
              playlists={filteredPlaylists}
              currentSong={currentSong}
              onCreatePlaylist={handleCreatePlaylist}
              onCreateFolder={handleCreatePlaylistFolder}
              onAddToPlaylist={handleAddToPlaylist}
              onRemoveFromPlaylist={handleRemoveFromPlaylist}
              onPlaylistSelect={handlePlaylistSelect}
              onSongSelect={handleSongSelect}
              favorites={favorites}
            />
            {currentPlaylist && !currentPlaylist.isFolder && (
              <PlaylistStats playlist={currentPlaylist} />
            )}
          </>
        )}
      </>
    );

    return (
      <ErrorBoundary>
        {content}
      </ErrorBoundary>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        {renderCurrentScreen()}
      </View>
      {currentSong && (
        <MusicPlayer
          currentSong={currentSong}
          songs={currentPlaylist?.songs || filteredSongs}
          onNextSong={handleNextSong}
          onPreviousSong={handlePreviousSong}
          shuffleMode={shuffleMode}
          repeatMode={repeatMode}
          onShufflePress={toggleShuffle}
          onRepeatPress={toggleRepeat}
          isExpanded={isPlayerExpanded}
          onToggleExpand={togglePlayerExpansion}
          onToggleFavorite={() => currentSong && toggleFavorite(currentSong)}
          isFavorite={favorites.some(fav => fav.id === currentSong?.id)}
          playlists={playlists}
          onAddToPlaylist={handleAddToPlaylist}
          onCreatePlaylist={handleCreatePlaylist}
          onCreateFolder={handleCreatePlaylistFolder}
        />
      )}
      <NavigationBar
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    marginBottom: 130, // Space for the music player and navigation
  },
}); 