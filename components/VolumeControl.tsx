import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import debounce from 'lodash/debounce';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (value: number) => void;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  onVolumeChange,
}) => {
  const debouncedVolumeChange = useCallback(
    debounce((value: number) => {
      onVolumeChange(value);
    }, 100),
    [onVolumeChange]
  );

  return (
    <View style={styles.container}>
      <View style={styles.volumeControl}>
        <Ionicons
          name={volume === 0 ? 'volume-mute' : 'volume-medium'}
          size={20}
          color="#9B9B9B"
        />
        <Slider
          style={styles.slider}
          value={volume}
          onValueChange={debouncedVolumeChange}
          minimumValue={0}
          maximumValue={1}
          step={0.05}
          minimumTrackTintColor="#9B6B9E"
          maximumTrackTintColor="#2A2A2A"
          thumbTintColor="#9B6B9E"
        />
        <Ionicons name="volume-high" size={20} color="#9B9B9B" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
  },
  volumeControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  slider: {
    flex: 1,
    marginHorizontal: 12,
    height: 40,
  },
}); 