import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Upload, Music, Trash2, Play } from 'lucide-react';

const PlaylistManager = ({ 
  playlist, 
  currentTrack, 
  onTrackSelect, 
  onPlaylistUpdate,
  isPlaying 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    // Load playlist from localStorage on component mount
    const savedPlaylist = localStorage.getItem('mp3-playlist');
    if (savedPlaylist) {
      try {
        const parsedPlaylist = JSON.parse(savedPlaylist);
        onPlaylistUpdate(parsedPlaylist);
      } catch (error) {
        console.error('Error loading playlist:', error);
      }
    }
  }, []);

  const savePlaylistToStorage = (newPlaylist) => {
    localStorage.setItem('mp3-playlist', JSON.stringify(newPlaylist));
    onPlaylistUpdate(newPlaylist);
  };

  const handleFileUpload = (files) => {
    const newTracks = [];
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('audio/')) {
        const track = {
          id: Date.now() + Math.random(),
          name: file.name.replace(/\.[^/.]+$/, ''),
          file: file,
          url: URL.createObjectURL(file),
          duration: 0,
          size: file.size
        };
        newTracks.push(track);
      }
    });

    if (newTracks.length > 0) {
      const updatedPlaylist = [...playlist, ...newTracks];
      savePlaylistToStorage(updatedPlaylist);
      setShowUpload(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const removeTrack = (trackId) => {
    const updatedPlaylist = playlist.filter(track => track.id !== trackId);
    savePlaylistToStorage(updatedPlaylist);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Music className="w-6 h-6" />
            <h2 className="text-lg font-semibold">My Playlist</h2>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm opacity-90 mt-1">{playlist.length} tracks</p>
      </div>

      {/* Upload Section */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-b border-gray-200"
          >
            <div
              className={`m-4 p-6 border-2 border-dashed rounded-lg transition-colors ${
                dragActive 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-300 bg-gray-50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Drop MP3 files here or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  accept="audio/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-4 py-2 bg-purple-500 text-white rounded-lg text-sm cursor-pointer hover:bg-purple-600 transition-colors"
                >
                  Browse Files
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playlist */}
      <div className="max-h-96 overflow-y-auto">
        {playlist.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No tracks in playlist</p>
            <p className="text-xs mt-1">Add some MP3 files to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            <AnimatePresence>
              {playlist.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    currentTrack?.id === track.id ? 'bg-purple-50 border-r-4 border-purple-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => onTrackSelect(track)}
                      className="flex-1 flex items-center space-x-3 text-left"
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        currentTrack?.id === track.id && isPlaying
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {currentTrack?.id === track.id && isPlaying ? (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          >
                            <Play className="w-4 h-4 ml-0.5" />
                          </motion.div>
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {track.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(track.size)}
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTrack(track.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistManager;