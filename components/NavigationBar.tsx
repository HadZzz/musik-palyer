import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Screen = 'songs' | 'playlists';

interface NavigationBarProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  currentScreen,
  onScreenChange,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.navItem, currentScreen === 'songs' && styles.activeNavItem]}
        onPress={() => onScreenChange('songs')}
      >
        <Ionicons
          name="musical-notes"
          size={24}
          color={currentScreen === 'songs' ? '#9B6B9E' : '#9B9B9B'}
        />
        <Text style={[styles.navText, currentScreen === 'songs' && styles.activeNavText]}>
          Songs
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, currentScreen === 'playlists' && styles.activeNavItem]}
        onPress={() => onScreenChange('playlists')}
      >
        <Ionicons
          name="list"
          size={24}
          color={currentScreen === 'playlists' ? '#9B6B9E' : '#9B9B9B'}
        />
        <Text style={[styles.navText, currentScreen === 'playlists' && styles.activeNavText]}>
          Playlists
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeNavItem: {
    borderTopWidth: 2,
    borderTopColor: '#9B6B9E',
    marginTop: -2,
  },
  navText: {
    fontSize: 12,
    color: '#9B9B9B',
    marginTop: 4,
  },
  activeNavText: {
    color: '#9B6B9E',
  },
}); 