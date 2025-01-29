import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { EqualizerPreset, defaultEqualizerPresets } from '../constants/types';

interface EqualizerProps {
  onBandChange: (frequency: number, gain: number) => void;
  onPresetSelect: (preset: EqualizerPreset) => void;
}

export const Equalizer: React.FC<EqualizerProps> = ({
  onBandChange,
  onPresetSelect,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('flat');
  const [customBands, setCustomBands] = useState(defaultEqualizerPresets[0].bands);

  const handlePresetSelect = (preset: EqualizerPreset) => {
    setSelectedPreset(preset.id);
    setCustomBands(preset.bands);
    onPresetSelect(preset);
  };

  const handleBandChange = (frequency: number, gain: number) => {
    const newBands = customBands.map(band =>
      band.frequency === frequency ? { ...band, gain } : band
    );
    setCustomBands(newBands);
    onBandChange(frequency, gain);
    setSelectedPreset('custom');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Equalizer</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetContainer}>
        {defaultEqualizerPresets.map(preset => (
          <TouchableOpacity
            key={preset.id}
            style={[
              styles.presetButton,
              selectedPreset === preset.id && styles.selectedPreset,
            ]}
            onPress={() => handlePresetSelect(preset)}
          >
            <Text style={[
              styles.presetText,
              selectedPreset === preset.id && styles.selectedPresetText,
            ]}>
              {preset.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.bandContainer}>
        {customBands.map(band => (
          <View key={band.frequency} style={styles.band}>
            <Slider
              style={styles.bandSlider}
              value={band.gain}
              onValueChange={(value) => handleBandChange(band.frequency, value)}
              minimumValue={-12}
              maximumValue={12}
              step={0.5}
              minimumTrackTintColor="#9B6B9E"
              maximumTrackTintColor="#2A2A2A"
              thumbTintColor="#9B6B9E"
              orientation="vertical"
            />
            <Text style={styles.frequencyText}>
              {band.frequency < 1000
                ? `${band.frequency}Hz`
                : `${band.frequency / 1000}kHz`}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  presetContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  selectedPreset: {
    backgroundColor: '#3A3A3A',
    borderColor: '#9B6B9E',
  },
  presetText: {
    color: '#9B9B9B',
    fontSize: 14,
  },
  selectedPresetText: {
    color: '#FFFFFF',
  },
  bandContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 200,
    paddingHorizontal: 8,
  },
  band: {
    alignItems: 'center',
    flex: 1,
  },
  bandSlider: {
    height: 150,
    width: 40,
  },
  frequencyText: {
    color: '#9B9B9B',
    fontSize: 12,
    marginTop: 8,
  },
}); 