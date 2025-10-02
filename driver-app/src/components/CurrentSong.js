import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function CurrentSong({ song }) {
  if (!song) {
    return (
      <View style={[styles.container, styles.empty]}>
        <Text style={styles.emptyText}>🎵</Text>
        <Text style={styles.emptySubtext}>No song playing</Text>
        <Text style={styles.emptyHint}>Waiting for passengers to add songs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>🎵 NOW PLAYING</Text>
      
      <Image 
        source={{ uri: song.thumbnail }} 
        style={styles.thumbnail}
      />
      
      <Text style={styles.title} numberOfLines={2}>
        {song.title}
      </Text>
      
      <Text style={styles.artist} numberOfLines={1}>
        {song.artist}
      </Text>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>▶ LIVE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#667eea',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  empty: {
    backgroundColor: '#f3f4f6',
    padding: 40,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 16,
  },
  thumbnail: {
    width: 160,
    height: 160,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  artist: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});