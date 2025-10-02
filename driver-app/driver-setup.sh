#!/bin/bash

# Zonglist Driver App - Complete Auto Setup
# Run this from: /Users/tonyb/Desktop/zonglist/driver-app
# This creates ALL files with code automatically

echo "🚗 Setting up Zonglist Driver App with ALL code..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the driver-app directory:"
    echo "cd /Users/tonyb/Desktop/zonglist/driver-app"
    exit 1
fi

echo "✅ Correct directory detected"
echo ""

# Create directory structure
echo "📁 Creating directories..."
mkdir -p src/components
mkdir -p src/screens
mkdir -p src/services

# ============================================
# ROOT LEVEL FILES
# ============================================

echo "📄 Creating .env file..."
cat > .env << 'EOF'
# Firebase Configuration (FILL IN YOUR ACTUAL VALUES!)
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=zonglist.firebaseapp.com
EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://zonglist-default-rtdb.firebaseio.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=zonglist
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=zonglist.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Your Driver ID (SAME as web app)
EXPO_PUBLIC_DRIVER_ID=tesla_001
EOF

echo "📄 Creating app.json..."
cat > app.json << 'EOF'
{
  "expo": {
    "name": "Zonglist Driver",
    "slug": "zonglist-driver",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.zonglist.driver",
      "infoPlist": {
        "NSAppTransportSecurity": {
          "NSAllowsArbitraryLoads": true
        }
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.zonglist.driver"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "firebaseApiKey": process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      "firebaseAuthDomain": process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      "firebaseDatabaseURL": process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
      "firebaseProjectId": process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      "firebaseStorageBucket": process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      "firebaseMessagingSenderId": process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      "firebaseAppId": process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      "driverId": process.env.EXPO_PUBLIC_DRIVER_ID
    }
  }
}
EOF

echo "📄 Creating App.js..."
cat > App.js << 'EOF'
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainScreen from './src/screens/MainScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={MainScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
EOF

# ============================================
# SERVICES
# ============================================

echo "📄 Creating src/services/firebase.js..."
cat > src/services/firebase.js << 'EOF'
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, update, remove, set } from 'firebase/database';
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig.extra.firebaseApiKey,
  authDomain: Constants.expoConfig.extra.firebaseAuthDomain,
  databaseURL: Constants.expoConfig.extra.firebaseDatabaseURL,
  projectId: Constants.expoConfig.extra.firebaseProjectId,
  storageBucket: Constants.expoConfig.extra.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig.extra.firebaseMessagingSenderId,
  appId: Constants.expoConfig.extra.firebaseAppId
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export const listenToQueue = (driverId, callback) => {
  const queueRef = ref(database, `drivers/${driverId}/queue`);
  
  return onValue(queueRef, (snapshot) => {
    const data = snapshot.val();
    const queue = data ? Object.entries(data).map(([key, value]) => ({
      ...value,
      firebaseKey: key
    })) : [];
    
    queue.sort((a, b) => a.addedAt - b.addedAt);
    callback(queue);
  });
};

export const listenToCurrentSong = (driverId, callback) => {
  const currentSongRef = ref(database, `drivers/${driverId}/currentSong`);
  return onValue(currentSongRef, (snapshot) => {
    callback(snapshot.val());
  });
};

export const listenToStatus = (driverId, callback) => {
  const statusRef = ref(database, `drivers/${driverId}/status`);
  return onValue(statusRef, (snapshot) => {
    callback(snapshot.val());
  });
};

export const updateStatus = async (driverId, status) => {
  const statusRef = ref(database, `drivers/${driverId}/status`);
  await set(statusRef, status);
};

export const updateCurrentSong = async (driverId, song) => {
  const driverRef = ref(database, `drivers/${driverId}`);
  await update(driverRef, {
    currentSong: song,
    lastUpdate: Date.now()
  });
};

export const removeSongFromQueue = async (driverId, firebaseKey) => {
  const songRef = ref(database, `drivers/${driverId}/queue/${firebaseKey}`);
  await remove(songRef);
};

export const clearQueue = async (driverId) => {
  const queueRef = ref(database, `drivers/${driverId}/queue`);
  await set(queueRef, {});
};

export const initializeDriverSession = async (driverId, driverInfo = {}) => {
  const driverRef = ref(database, `drivers/${driverId}`);
  
  await set(driverRef, {
    queue: {},
    currentSong: null,
    status: 'idle',
    driverInfo: {
      carModel: driverInfo.carModel || 'Tesla Model Y',
      driverName: driverInfo.driverName || 'Driver',
      isActive: true,
      ...driverInfo
    },
    lastUpdate: Date.now()
  });
};

export const playNextInQueue = async (driverId, queue) => {
  if (queue.length === 0) {
    await updateCurrentSong(driverId, null);
    await updateStatus(driverId, 'idle');
    return null;
  }
  
  const nextSong = queue[0];
  await updateCurrentSong(driverId, {
    videoId: nextSong.videoId,
    title: nextSong.title,
    artist: nextSong.artist,
    thumbnail: nextSong.thumbnail,
    duration: nextSong.duration,
    startedAt: Date.now()
  });
  
  await removeSongFromQueue(driverId, nextSong.firebaseKey);
  await updateStatus(driverId, 'playing');
  
  return nextSong;
};

export { database };
EOF

# ============================================
# COMPONENTS
# ============================================

echo "📄 Creating src/components/YouTubePlayer.js..."
cat > src/components/YouTubePlayer.js << 'EOF'
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

export default function YouTubePlayerComponent({ 
  videoId, 
  onEnd, 
  onReady,
  playing = true,
  onChangeState
}) {
  const playerRef = useRef(null);

  useEffect(() => {
    if (videoId && playerRef.current) {
      console.log('Playing video:', videoId);
    }
  }, [videoId]);

  const handleStateChange = (state) => {
    console.log('Player state:', state);
    if (onChangeState) {
      onChangeState(state);
    }
    
    if (state === 'ended' && onEnd) {
      onEnd();
    }
  };

  if (!videoId) {
    return null;
  }

  return (
    <View style={styles.container}>
      <YoutubePlayer
        ref={playerRef}
        height={200}
        width="100%"
        videoId={videoId}
        play={playing}
        onReady={onReady}
        onChangeState={handleStateChange}
        webViewStyle={styles.webView}
        webViewProps={{
          allowsInlineMediaPlayback: true,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  webView: {
    opacity: 0.99,
  },
});
EOF

echo "📄 Creating src/components/QueueItem.js..."
cat > src/components/QueueItem.js << 'EOF'
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
EOF

echo "📄 Creating src/components/CurrentSong.js..."
cat > src/components/CurrentSong.js << 'EOF'
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
EOF

# ============================================
# SCREENS
# ============================================

echo "📄 Creating src/screens/MainScreen.js..."
cat > src/screens/MainScreen.js << 'EOF'
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

  useEffect(() => {
    initializeSession();

    const unsubscribeQueue = listenToQueue(DRIVER_ID, (updatedQueue) => {
      console.log('Queue updated:', updatedQueue.length, 'songs');
      setQueue(updatedQueue);
      
      if (!currentSong && updatedQueue.length > 0 && status === 'idle') {
        handlePlayNext(updatedQueue);
      }
    });

    const unsubscribeSong = listenToCurrentSong(DRIVER_ID, (song) => {
      console.log('Current song updated:', song?.title);
      setCurrentSong(song);
      setIsPlaying(!!song);
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
    console.log('Song ended, playing next...');
    handlePlayNext();
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
        <Text style={styles.headerTitle}>🎵 Zonglist Driver</Text>
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
            <Text style={styles.controlButtonText}>⏭ Skip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.controlButton, styles.nextButton]}
            onPress={() => handlePlayNext()}
            disabled={queue.length === 0}
          >
            <Text style={styles.controlButtonText}>▶ Next in Queue</Text>
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
EOF

# ============================================
# COMPLETION
# ============================================

echo ""
echo "✅ All files created successfully!"
echo ""
echo "📋 Files created:"
echo "  ✅ .env"
echo "  ✅ app.json"
echo "  ✅ App.js"
echo "  ✅ src/services/firebase.js"
echo "  ✅ src/components/YouTubePlayer.js"
echo "  ✅ src/components/QueueItem.js"
echo "  ✅ src/components/CurrentSong.js"
echo "  ✅ src/screens/MainScreen.js"
echo ""
echo "⚠️  IMPORTANT: Edit .env file with your Firebase keys!"
echo ""
echo "📝 Next steps:"
echo "  1. nano .env  (add your Firebase API keys)"
echo "  2. Download Expo Go app on your iPhone"
echo "  3. npx expo start"
echo "  4. Scan QR code with iPhone camera"
echo ""
echo "🎉 Setup complete! Ready to run!"
echo ""
