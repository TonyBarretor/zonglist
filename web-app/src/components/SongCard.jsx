export default function SongCard({ song, onAddToQueue, onPlayNow, isAdding }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <img
        src={song.thumbnail}
        alt={song.title}
        className="w-20 h-20 rounded object-cover"
      />
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">
          {song.title}
        </h3>
        <p className="text-sm text-gray-600 truncate">
          {song.artist}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {song.duration}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => onPlayNow(song)}
          disabled={isAdding}
          className="px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded hover:bg-green-600 disabled:bg-gray-300 transition-colors whitespace-nowrap"
        >
          ▶ Play Now
        </button>
        <button
          onClick={() => onAddToQueue(song)}
          disabled={isAdding}
          className="px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded hover:bg-blue-600 disabled:bg-gray-300 transition-colors whitespace-nowrap"
        >
          + Add to Queue
        </button>
      </div>
    </div>
  );
}
