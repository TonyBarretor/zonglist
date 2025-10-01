export default function QueueDisplay({ currentSong, queue }) {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4 shadow-lg">
      <h2 className="text-xl font-bold mb-3">🎵 Now Playing</h2>
      
      {currentSong ? (
        <div className="flex items-center gap-3 bg-white/20 rounded-lg p-3 backdrop-blur-sm">
          <img
            src={currentSong.thumbnail}
            alt={currentSong.title}
            className="w-16 h-16 rounded object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">
              {currentSong.title}
            </h3>
            <p className="text-sm opacity-90 truncate">
              {currentSong.artist}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 bg-white/10 rounded-lg">
          No song playing
        </div>
      )}

      {queue.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2 opacity-90">
            Up Next ({queue.length})
          </h3>
          <div className="space-y-2">
            {queue.slice(0, 3).map((song, index) => (
              <div
                key={song.id}
                className="flex items-center gap-2 bg-white/10 rounded p-2 text-sm"
              >
                <span className="font-bold opacity-70">#{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{song.title}</p>
                  <p className="text-xs opacity-75 truncate">{song.artist}</p>
                </div>
                <span className="text-xs opacity-75">{song.duration}</span>
              </div>
            ))}
            {queue.length > 3 && (
              <p className="text-xs text-center opacity-75 pt-1">
                + {queue.length - 3} more songs
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
