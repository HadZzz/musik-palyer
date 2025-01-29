import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Playlist } from '../constants/types';

interface PlaylistStatsProps {
  playlist: Playlist;
}

export const PlaylistStats: React.FC<PlaylistStatsProps> = ({ playlist }) => {
  const getTotalDuration = () => {
    const totalSeconds = playlist.songs.reduce((acc, song) => acc + song.duration, 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getAverageLength = () => {
    if (playlist.songs.length === 0) return '0m';
    const avgSeconds = playlist.songs.reduce((acc, song) => acc + song.duration, 0) / playlist.songs.length;
    return `${Math.floor(avgSeconds / 60)}m`;
  };

  const getLastUpdated = () => {
    const now = new Date();
    const updated = new Date(playlist.updatedAt);
    const diffDays = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.statRow}>
        <View style={styles.stat}>
          <Ionicons name="time" size={20} color="#9B6B9E" />
          <View style={styles.statText}>
            <Text style={styles.statValue}>{getTotalDuration()}</Text>
            <Text style={styles.statLabel}>Total Length</Text>
          </View>
        </View>
        
        <View style={styles.stat}>
          <Ionicons name="musical-notes" size={20} color="#9B6B9E" />
          <View style={styles.statText}>
            <Text style={styles.statValue}>{playlist.songs.length}</Text>
            <Text style={styles.statLabel}>Songs</Text>
          </View>
        </View>
      </View>

      <View style={styles.statRow}>
        <View style={styles.stat}>
          <Ionicons name="timer" size={20} color="#9B6B9E" />
          <View style={styles.statText}>
            <Text style={styles.statValue}>{getAverageLength()}</Text>
            <Text style={styles.statLabel}>Avg. Length</Text>
          </View>
        </View>
        
        <View style={styles.stat}>
          <Ionicons name="calendar" size={20} color="#9B6B9E" />
          <View style={styles.statText}>
            <Text style={styles.statValue}>{getLastUpdated()}</Text>
            <Text style={styles.statLabel}>Last Updated</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    marginLeft: 12,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  statLabel: {
    color: '#9B9B9B',
    fontSize: 12,
    marginTop: 2,
  },
}); 