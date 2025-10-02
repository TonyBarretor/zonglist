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
