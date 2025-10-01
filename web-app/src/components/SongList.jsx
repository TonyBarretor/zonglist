import SongCard from './SongCard';

export default function SongList({ songs, onAddToQueue, onPlayNow, addingVideoId }) {
  if (songs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Search for songs to add to the queue
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">
        Search Results
      </h2>
      {songs.map((song) => (
        <SongCard
          key={song.videoId}
          song={song}
          onAddToQueue={onAddToQueue}
          onPlayNow={onPlayNow}
          isAdding={addingVideoId === song.videoId}
        />
      ))}
    </div>
  );
}
