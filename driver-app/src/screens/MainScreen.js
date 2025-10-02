import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Constants from 'expo-constants';
import CurrentSong from '../components/CurrentSong';
import QueueItem from '../components/QueueItem';
import YouTubePlayerComponent from '../components/YouTubePlayer';
import {
  listenToQueue,
  listenToCurrentSong,
  listenToStatus,
  updateStatus,
  removeSongFromQueue,
  clearQueue,
  playNextInQueue,
  updateCurrentSong,
  initializeDriverSession,
} from '../services/firebase';

const DRIVER_ID = Constants.expoConfig.extra.driverId;

export default function MainScreen() {
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [status, setStatus] = useState('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);

  // Initialize session once on mount
  useEffect(() => {
    initializeSession();
  }, []);

  // Set up Firebase listeners
  useEffect(() => {
    const unsubscribeQueue = listenToQueue(DRIVER_ID, (updatedQueue) => {
      console.log('Queue updated:', updatedQueue.length, 'songs');
      setQueue(updatedQueue);
    });

    const unsubscribeSong = listenToCurrentSong(DRIVER_ID, (song) => {
      console.log('Current song updated:', song?.title);
      const prevSong = currentSong;
      setCurrentSong(song);
      
      // Set playing state
      if (song) {
        setIsPlaying(true);
        updateStatus(DRIVER_ID, 'playing');
      } else {
        setIsPlaying(false);
      }
      
      // If song just ended and queue has items, auto-play next
      if (prevSong && !song) {
        console.log('Song ended naturally');
        setTimeout(() => {
          if (queue.length > 0) {
            console.log('Auto-playing next from queue after song ended');
            handlePlayNext();
          }
        }, 1000);
      }
    });

    const unsubscribeStatus = listenToStatus(DRIVER_ID, (newStatus) => {
      console.log('Status updated:', newStatus);
      setStatus(newStatus || 'idle');
    });

    return () => {
      unsubscribeQueue();
      unsubscribeSong();
      unsubscribeStatus();
    };
  }, []);

  const initializeSession = async () => {
    try {
      await initializeDriverSession(DRIVER_ID, {
        carModel: 'Tesla Model Y',
        driverName: 'Tony',
      });
      setSessionActive(true);
      console.log('Session initialized for:', DRIVER_ID);
    } catch (error) {
      console.error('Failed to initialize session:', error);
      Alert.alert('Error', 'Failed to start session');
    }
  };

  const handlePlayNext = async (currentQueue = queue) => {
    try {
      const nextSong = await playNextInQueue(DRIVER_ID, currentQueue);
      if (nextSong) {
        console.log('Playing next:', nextSong.title);
      } else {
        console.log('Queue is empty');
      }
    } catch (error) {
      console.error('Error playing next song:', error);
      Alert.alert('Error', 'Failed to play next song');
    }
  };

  const handleSongEnd = () => {
    console.log('YouTube player: Song ended');
    // The listener will handle auto-playing next
  };

  const handleRemoveSong = async (song) => {
    try {
      await removeSongFromQueue(DRIVER_ID, song.firebaseKey);
      console.log('Removed song:', song.title);
    } catch (error) {
      console.error('Error removing song:', error);
      Alert.alert('Error', 'Failed to remove song');
    }
  };

  const handlePlayNow = async (song) => {
    try {
      await updateCurrentSong(DRIVER_ID, {
        videoId: song.videoId,
        title: song.title,
        artist: song.artist,
        thumbnail: song.thumbnail,
        duration: song.duration,
        startedAt: Date.now(),
      });
      await removeSongFromQueue(DRIVER_ID, song.firebaseKey);
      await updateStatus(DRIVER_ID, 'playing');
      console.log('Playing now:', song.title);
    } catch (error) {
      console.error('Error playing song:', error);
      Alert.alert('Error', 'Failed to play song');
    }
  };

  const handleClearQueue = () => {
    Alert.alert(
      'Clear Queue',
      'Are you sure you want to clear all songs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearQueue(DRIVER_ID);
              console.log('Queue cleared');
            } catch (error) {
              console.error('Error clearing queue:', error);
            }
          },
        },
      ]
    );
  };

  const handleSkip = () => {
    handlePlayNext();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Zonglist Driver</Text>
        <Text style={styles.headerSubtitle}>
          {sessionActive ? `ID: ${DRIVER_ID}` : 'Starting...'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <CurrentSong song={currentSong} />

        {currentSong && (
          <View style={styles.playerContainer}>
            <YouTubePlayerComponent
              videoId={currentSong.videoId}
              onEnd={handleSongEnd}
              playing={isPlaying}
              onReady={() => console.log('Player ready')}
            />
          </View>
        )}

        <View style={styles.controls}>
          <TouchableOpacity 
            style={[styles.controlButton, styles.skipButton]}
            onPress={handleSkip}
            disabled={!currentSong}
          >
            <Text style={styles.controlButtonText}>Skip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, styles.nextButton]}
            onPress={() => handlePlayNext()}
            disabled={queue.length === 0}
          >
            <Text style={styles.controlButtonText}>Next in Queue</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.queueSection}>
          <View style={styles.queueHeader}>
            <Text style={styles.queueTitle}>
              Up Next ({queue.length})
            </Text>
            {queue.length > 0 && (
              <TouchableOpacity onPress={handleClearQueue}>
                <Text style={styles.clearButton}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {queue.length === 0 ? (
            <View style={styles.emptyQueue}>
              <Text style={styles.emptyQueueText}>Queue is empty</Text>
              <Text style={styles.emptyQueueHint}>
                Passengers can scan the QR code to add songs
              </Text>
            </View>
          ) : (
            queue.map((song, index) => (
              <QueueItem
                key={song.firebaseKey}
                song={song}
                index={index}
                onRemove={handleRemoveSong}
                onPlayNow={handlePlayNow}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  playerContainer: {
    marginBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  controlButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: '#f59e0b',
  },
  nextButton: {
    backgroundColor: '#3b82f6',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  queueSection: {
    marginBottom: 20,
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  queueTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  clearButton: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyQueue: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyQueueText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptyQueueHint: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});