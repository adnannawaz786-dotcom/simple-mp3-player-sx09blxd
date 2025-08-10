import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Upload, Volume2, List, X } from 'lucide-react';

export default function MP3Player() {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const audioRef = useRef(null);
  const fileInputRef = useRef(null);
  const progressRef = useRef(null);

  // Load playlist from localStorage on mount
  useEffect(() => {
    const savedPlaylist = localStorage.getItem('mp3-player-playlist');
    if (savedPlaylist) {
      try {
        const parsed = JSON.parse(savedPlaylist);
        setPlaylist(parsed);
      } catch (error) {
        console.error('Failed to parse saved playlist:', error);
      }
    }
  }, []);

  // Save playlist to localStorage whenever it changes
  useEffect(() => {
    if (playlist.length > 0) {
      localStorage.setItem('mp3-player-playlist', JSON.stringify(playlist));
    }
  }, [playlist]);

  // Update current time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
      }
    };

    const updateDuration = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (currentTrack < playlist.length - 1) {
        setCurrentTrack(currentTrack + 1);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, playlist.length, isDragging]);

  // Handle file upload
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newTracks = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name.replace('.mp3', ''),
      url: URL.createObjectURL(file),
      file: file
    }));

    setPlaylist(prev => [...prev, ...newTracks]);
  };

  // Play/pause functionality
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || playlist.length === 0) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Skip to next track
  const nextTrack = () => {
    if (currentTrack < playlist.length - 1) {
      setCurrentTrack(currentTrack + 1);
      setIsPlaying(true);
    }
  };

  // Skip to previous track
  const previousTrack = () => {
    if (currentTrack > 0) {
      setCurrentTrack(currentTrack - 1);
      setIsPlaying(true);
    }
  };

  // Handle progress bar interaction
  const handleProgressClick = (event) => {
    const audio = audioRef.current;
    if (!audio || !progressRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Remove track from playlist
  const removeTrack = (trackId) => {
    const newPlaylist = playlist.filter(track => track.id !== trackId);
    setPlaylist(newPlaylist);
    
    if (newPlaylist.length === 0) {
      setCurrentTrack(0);
      setIsPlaying(false);
    } else if (currentTrack >= newPlaylist.length) {
      setCurrentTrack(newPlaylist.length - 1);
    }
  };

  // Format time display
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentTrackData = playlist[currentTrack];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Music Player</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPlaylist(!showPlaylist)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <List size={20} />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <Upload size={20} />
              </button>
            </div>
          </div>

          {/* Current Track Display */}
          <div className="text-center mb-8">
            <motion.div
              key={currentTrack}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-48 h-48 mx-auto mb-4 bg-gradient-to-br from-pink-500 to-violet-500 rounded-2xl flex items-center justify-center"
            >
              <Volume2 size={64} className="text-white/80" />
            </motion.div>
            
            <h2 className="text-xl font-semibold mb-2">
              {currentTrackData?.name || 'No track selected'}
            </h2>
            <p className="text-white/70">
              {playlist.length > 0 ? `${currentTrack + 1} of ${playlist.length}` : 'Upload MP3 files to start'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div
              ref={progressRef}
              className="h-2 bg-white/20 rounded-full cursor-pointer mb-2"
              onClick={handleProgressClick}
            >
              <motion.div
                className="h-full bg-white rounded-full"
                style={{
                  width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%'
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <div className="flex justify-between text-sm text-white/70">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <button
              onClick={previousTrack}
              disabled={currentTrack === 0}
              className="p-3 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <SkipBack size={24} />
            </button>
            
            <motion.button
              whileScale={{ scale: 0.95 }}
              onClick={togglePlay}
              disabled={playlist.length === 0}
              className="p-4 rounded-full bg-white text-black hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
            </motion.button>
            
            <button
              onClick={nextTrack}
              disabled={currentTrack >= playlist.length - 1}
              className="p-3 rounded-full bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <SkipForward size={24} />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 mb-4">
            <Volume2 size={20} className="text-white/70" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => {
                const newVolume = parseFloat(e.target.value);
                setVolume(newVolume);
                if (audioRef.current) {
                  audioRef.current.volume = newVolume;
                }
              }}
              className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </motion.div>

        {/* Playlist Modal */}
        <AnimatePresence>
          {showPlaylist && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end"
              onClick={() => setShowPlaylist(false)}
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="w-full bg-white/10 backdrop-blur-lg rounded-t-3xl p-6 max-h-[70vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Playlist</h3>
                  <button
                    onClick={() => setShowPlaylist(false)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {playlist.map((track, index) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        index === currentTrack ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'
                      }`}
                      onClick={() => {
                        setCurrentTrack(index);
                        setShowPlaylist(false);
                      }}
                    >
                      <span className="flex-1 truncate">{track.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTrack(track.id);
                        }}
                        className="p-1 rounded-full hover:bg-white/20 text-white/70 hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}
                  
                  {playlist.length === 0 && (
                    <p className="text-center text-white/70 py-8">
                      No tracks in playlist. Upload some MP3 files to get started!
                    </p>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mp3,audio/mpeg"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Hidden audio element */}
        {currentTrackData && (
          <audio
            ref={audioRef}
            src={currentTrackData.url}
            volume={volume}
            onLoadedData={() => {
              if (isPlaying) {
                audioRef.current?.play();
              }
            }}
          />
        )}
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #8b5cf6;
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #8b5cf6;
        }
      `}</style>
    </div>
  );
}