import { ImageSourcePropType } from 'react-native';
import { AVPlaybackSource } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';

export interface Song {
  id: string;
  title: string;
  artist: string;
  uri: string;
  artwork?: ImageSourcePropType;
  duration: number;
}

export async function loadSongsFromDevice(): Promise<Song[]> {
  const permission = await MediaLibrary.requestPermissionsAsync();
  
  if (permission.granted) {
    const media = await MediaLibrary.getAssetsAsync({
      mediaType: 'audio',
      first: 50 // Get first 50 songs
    });

    return media.assets.map(asset => ({
      id: asset.id,
      title: asset.filename.replace(/\.[^/.]+$/, ""),
      artist: asset.albumId ? 'Unknown Artist' : 'Unknown Artist',
      uri: asset.uri,
      duration: asset.duration || 0,
    }));
  }
  
  return [];
}

// Default music data if no device media access
export const defaultMusicData: Song[] = [
  {
    id: '1',
    title: 'No songs found',
    artist: 'Please grant media access permission',
    uri: '',
    duration: 0,
  }
]; 
