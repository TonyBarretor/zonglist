import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function QueueItem({ song, index, onRemove, onPlayNow }) {
  return (
    <View style={styles.container}>
      <Text style={styles.index}>#{index + 1}</Text>
      
      <Image 
        source={{ uri: song.thumbnail }} 
        style={styles.thumbnail}
      />
      
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {song.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {song.artist}
        </Text>
        <Text style={styles.duration}>{song.duration}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.playButton}
          onPress={() => onPlayNow(song)}
        >
          <Text style={styles.buttonText}>▶ Play</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => onRemove(song)}
        >
          <Text style={styles.buttonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  index: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginRight: 12,
    width: 30,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  artist: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  duration: {
    fontSize: 11,
    color: '#999',
  },
  actions: {
    flexDirection: 'column',
    gap: 6,
  },
  playButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
