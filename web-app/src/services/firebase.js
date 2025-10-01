import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, onValue, update, remove } from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

// Sign in anonymously
signInAnonymously(auth).catch((error) => {
  console.error('Firebase auth error:', error);
});

// Get driver session reference
const getDriverSessionRef = (driverId) => {
  return ref(database, `drivers/${driverId}`);
};

// Add song to queue
export const addSongToQueue = async (driverId, song) => {
  const queueRef = ref(database, `drivers/${driverId}/queue`);
  const newSongRef = push(queueRef);
  
  const songData = {
    id: newSongRef.key,
    videoId: song.videoId,
    title: song.title,
    artist: song.artist,
    thumbnail: song.thumbnail,
    duration: song.duration,
    addedAt: Date.now(),
    addedBy: auth.currentUser?.uid || 'anonymous'
  };

  await set(newSongRef, songData);
  return songData;
};

// Play song immediately (adds to front of queue and triggers play)
export const playSongNow = async (driverId, song) => {
  const driverRef = getDriverSessionRef(driverId);
  
  const songData = {
    videoId: song.videoId,
    title: song.title,
    artist: song.artist,
    thumbnail: song.thumbnail,
    duration: song.duration,
    position: 0,
    startedAt: Date.now()
  };

  await update(driverRef, {
    currentSong: songData,
    status: 'playing',
    lastUpdate: Date.now()
  });

  return songData;
};

// Listen to queue updates
export const listenToQueue = (driverId, callback) => {
  const queueRef = ref(database, `drivers/${driverId}/queue`);
  return onValue(queueRef, (snapshot) => {
    const data = snapshot.val();
    const queue = data ? Object.values(data) : [];
    callback(queue);
  });
};

// Listen to current song
export const listenToCurrentSong = (driverId, callback) => {
  const currentSongRef = ref(database, `drivers/${driverId}/currentSong`);
  return onValue(currentSongRef, (snapshot) => {
    callback(snapshot.val());
  });
};

// Listen to playback status
export const listenToStatus = (driverId, callback) => {
  const statusRef = ref(database, `drivers/${driverId}/status`);
  return onValue(statusRef, (snapshot) => {
    callback(snapshot.val());
  });
};

// Remove song from queue
export const removeSongFromQueue = async (driverId, songId) => {
  const songRef = ref(database, `drivers/${driverId}/queue/${songId}`);
  await remove(songRef);
};

// Initialize driver session (driver app will call this)
export const initializeDriverSession = async (driverId, driverInfo = {}) => {
  const driverRef = getDriverSessionRef(driverId);
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

export { database, auth };
