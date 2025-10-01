import { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import SongList from './components/SongList';
import QueueDisplay from './components/QueueDisplay';
import { searchYouTubeVideos } from './services/youtube';
import { addSongToQueue, playSongNow, listenToQueue, listenToCurrentSong } from './services/firebase';

// Get driver ID from URL parameter or use default
const getDriverId = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('driver') || window.location.pathname.slice(1) || import.meta.env.VITE_DRIVER_SESSION_ID;
};

function App() {
  const [driverId] = useState(getDriverId());
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addingVideoId, setAddingVideoId] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [notification, setNotification] = useState(null);

  // Listen to queue and current song updates
  useEffect(() => {
    const unsubscribeQueue = listenToQueue(driverId, (updatedQueue) => {
      setQueue(updatedQueue.sort((a, b) => a.addedAt - b.addedAt));
    });

    const unsubscribeCurrent = listenToCurrentSong(driverId, (song) => {
      setCurrentSong(song);
    });

    return () => {
      unsubscribeQueue();
      unsubscribeCurrent();
    };
  }, [driverId]);

  const handleSearch = async (query) => {
    setIsLoading(true);
    try {
      const results = await searchYouTubeVideos(query);
      setSearchResults(results);
    } catch (error) {
      showNotification('Failed to search. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToQueue = async (song) => {
    setAddingVideoId(song.videoId);
    try {
      await addSongToQueue(driverId, song);
      showNotification('✅ Added to queue!', 'success');
    } catch (error) {
      showNotification('Failed to add song. Please try again.', 'error');
    } finally {
      setAddingVideoId(null);
    }
  };

  const handlePlayNow = async (song) => {
    setAddingVideoId(song.videoId);
    try {
      await playSongNow(driverId, song);
      showNotification('▶️ Playing now!', 'success');
    } catch (error) {
      showNotification('Failed to play song. Please try again.', 'error');
    } finally {
      setAddingVideoId(null);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🎵 Zonglist
          </h1>
          <p className="text-gray-600">
            Your ride, your playlist
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-semibold z-50 ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Current Song & Queue */}
        <div className="mb-6">
          <QueueDisplay currentSong={currentSong} queue={queue} />
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Search Results */}
        <div>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Searching...</p>
            </div>
          ) : (
            <SongList
              songs={searchResults}
              onAddToQueue={handleAddToQueue}
              onPlayNow={handlePlayNow}
              addingVideoId={addingVideoId}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
