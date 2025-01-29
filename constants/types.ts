import { Song } from './MusicData';

export interface Playlist {
  id: string;
  name: string;
  songs: Song[];
  createdAt: Date;
  updatedAt: Date;
  isFolder?: boolean;
  isSpecial?: boolean; // For special folders like Favorites
  parentId?: string;
  subPlaylists?: string[];
}

export interface MusicListProps {
  songs: Song[];
  currentSong: Song | null;
  onSongSelect: (song: Song) => void;
  favorites: Song[];
  onToggleFavorite: (song: Song) => void;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, song: Song) => void;
}

export interface PlaylistManagerProps {
  playlists: Playlist[];
  currentSong: Song | null;
  onCreatePlaylist: (name: string, parentId?: string) => void;
  onCreateFolder: (name: string) => void;
  onAddToPlaylist: (playlistId: string, song: Song) => void;
  onRemoveFromPlaylist: (playlistId: string, songId: string) => void;
  onPlaylistSelect: (playlist: Playlist) => void;
  onSongSelect: (song: Song) => void;
  favorites: Song[];
}

export interface MusicPlayerProps {
  currentSong: Song;
  songs: Song[];
  onNextSong: () => void;
  onPreviousSong: () => void;
  shuffleMode: boolean;
  repeatMode: 'off' | 'one' | 'all';
  onShufflePress: () => void;
  onRepeatPress: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, song: Song) => void;
  onCreatePlaylist: (name: string, parentId?: string) => void;
  onCreateFolder: (name: string) => void;
}

export interface EqualizerPreset {
  id: string;
  name: string;
  bands: EqualizerBand[];
}

export interface EqualizerBand {
  frequency: number;
  gain: number;
}

export const defaultEqualizerPresets: EqualizerPreset[] = [
  {
    id: 'flat',
    name: 'Flat',
    bands: [
      { frequency: 60, gain: 0 },
      { frequency: 170, gain: 0 },
      { frequency: 310, gain: 0 },
      { frequency: 600, gain: 0 },
      { frequency: 1000, gain: 0 },
      { frequency: 3000, gain: 0 },
      { frequency: 6000, gain: 0 },
      { frequency: 12000, gain: 0 },
      { frequency: 14000, gain: 0 },
      { frequency: 16000, gain: 0 },
    ],
  },
  {
    id: 'pop',
    name: 'Pop',
    bands: [
      { frequency: 60, gain: -1.5 },
      { frequency: 170, gain: -1 },
      { frequency: 310, gain: 0 },
      { frequency: 600, gain: 2 },
      { frequency: 1000, gain: 3 },
      { frequency: 3000, gain: 2 },
      { frequency: 6000, gain: 1 },
      { frequency: 12000, gain: 0 },
      { frequency: 14000, gain: -1 },
      { frequency: 16000, gain: -1.5 },
    ],
  },
  {
    id: 'rock',
    name: 'Rock',
    bands: [
      { frequency: 60, gain: 4 },
      { frequency: 170, gain: 3 },
      { frequency: 310, gain: 1 },
      { frequency: 600, gain: 0 },
      { frequency: 1000, gain: -0.5 },
      { frequency: 3000, gain: 0 },
      { frequency: 6000, gain: 1.5 },
      { frequency: 12000, gain: 3 },
      { frequency: 14000, gain: 4 },
      { frequency: 16000, gain: 4.5 },
    ],
  },
  {
    id: 'jazz',
    name: 'Jazz',
    bands: [
      { frequency: 60, gain: 2 },
      { frequency: 170, gain: 1 },
      { frequency: 310, gain: 0 },
      { frequency: 600, gain: -0.5 },
      { frequency: 1000, gain: -1 },
      { frequency: 3000, gain: 0 },
      { frequency: 6000, gain: 1 },
      { frequency: 12000, gain: 2 },
      { frequency: 14000, gain: 3 },
      { frequency: 16000, gain: 3.5 },
    ],
  },
]; 