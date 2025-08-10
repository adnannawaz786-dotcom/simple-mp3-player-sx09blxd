import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, Upload, X } from 'lucide-react';

const MP3Player = () => {
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load playlist from localStorage on component mount
  useEffect(() => {
    const savedPlaylist = localStorage.getItem('mp3-player-playlist');
    if (savedPlaylist) {
      try {
        const parsed = JSON.parse(savedPlaylist);
        setPlaylist(parsed);
      } catch (error) {
        console.error('Error loading playlist:', error);
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

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleNext);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleNext);
    };
  }, [playlist, currentTrackIndex]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newTracks = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name.replace('.mp3', ''),
      url: URL.createObjectURL(file),
      file: file
    }));

    setPlaylist(prev => [...prev, ...newTracks]);
    if (playlist.length === 0) {
      setCurrentTrackIndex(0);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || playlist.length === 0) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (playlist.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (playlist.length === 0) return;
    const prevIndex = currentTrackIndex === 0 ? playlist.length - 1 : currentTrackIndex - 1;
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
  };

  const handleSeek = (event) => {
    if (!audioRef.current) return;
    const seekTime = (event.target.value / 100) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (event) => {
    const newVolume = event.target.value / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const selectTrack = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setShowPlaylist(false);
  };

  const removeTrack = (index) => {
    const newPlaylist = playlist.filter((_, i) => i !== index);
    setPlaylist(newPlaylist);
    
    if (index === currentTrackIndex && newPlaylist.length > 0) {
      setCurrentTrackIndex(0);
    } else if (index < currentTrackIndex) {
      setCurrentTrackIndex(prev => prev - 1);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentTrack = playlist[currentTrackIndex];
  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        volume={volume}
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
        <h1 className="text-xl font-bold text-center">MP3 Player</h1>
      </div>

      {/* Current Track Display */}
      <div className="p-6 text-center">
        <motion.div
          key={currentTrack?.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h2 className="text-lg font-semibold text-gray-800 truncate">
            {currentTrack?.name || 'No track selected'}
          </h2>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercentage}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrevious}
            disabled={playlist.length === 0}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            <SkipBack size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            disabled={playlist.length === 0}
            className="p-4 rounded-full bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNext}
            disabled={playlist.length === 0}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
          >
            <SkipForward size={20} />
          </motion.button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center space-x-2 mb-4">
          <Volume2 size={16} className="text-gray-500" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={handleVolumeChange}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center space-x-2 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Upload size={16} />
            <span className="text-sm">Add Songs</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Playlist ({playlist.length})
          </motion.button>
        </div>
      </div>

      {/* Playlist */}
      <AnimatePresence>
        {showPlaylist && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t bg-gray-50 max-h-64 overflow-y-auto"
          >
            {playlist.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No songs in playlist
              </div>
            ) : (
              playlist.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex items-center justify-between p-3 border-b hover:bg-gray-100 cursor-pointer ${
                    index === currentTrackIndex ? 'bg-purple-50 border-purple-200' : ''
                  }`}
                  onClick={() => selectTrack(index)}
                >
                  <span className="text-sm truncate flex-1">{track.name}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTrack(index);
                    }}
                    className="ml-2 p-1 text-red-500 hover:bg-red-100 rounded"
                  >
                    <X size={14} />
                  </motion.button>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mp3,audio/mpeg"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default MP3Player;