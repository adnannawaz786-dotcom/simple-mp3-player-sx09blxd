// Storage utility functions for playlist and player state management
const STORAGE_KEYS = {
  PLAYLIST: 'mp3-player-playlist',
  CURRENT_TRACK: 'mp3-player-current-track',
  PLAYER_STATE: 'mp3-player-state',
  VOLUME: 'mp3-player-volume',
  PLAYBACK_POSITION: 'mp3-player-position'
};

// Check if localStorage is available
const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
};

// Generic storage operations
const setItem = (key, value) => {
  if (!isStorageAvailable()) return false;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

const getItem = (key, defaultValue = null) => {
  if (!isStorageAvailable()) return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

const removeItem = (key) => {
  if (!isStorageAvailable()) return false;
  
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
};

// Playlist management
export const savePlaylist = (tracks) => {
  return setItem(STORAGE_KEYS.PLAYLIST, tracks);
};

export const getPlaylist = () => {
  return getItem(STORAGE_KEYS.PLAYLIST, []);
};

export const addTrackToPlaylist = (track) => {
  const playlist = getPlaylist();
  const trackWithId = {
    id: Date.now() + Math.random(),
    name: track.name,
    file: track.file,
    duration: track.duration || 0,
    addedAt: new Date().toISOString()
  };
  
  playlist.push(trackWithId);
  return savePlaylist(playlist);
};

export const removeTrackFromPlaylist = (trackId) => {
  const playlist = getPlaylist();
  const filteredPlaylist = playlist.filter(track => track.id !== trackId);
  return savePlaylist(filteredPlaylist);
};

export const clearPlaylist = () => {
  return setItem(STORAGE_KEYS.PLAYLIST, []);
};

// Current track management
export const saveCurrentTrack = (track) => {
  return setItem(STORAGE_KEYS.CURRENT_TRACK, track);
};

export const getCurrentTrack = () => {
  return getItem(STORAGE_KEYS.CURRENT_TRACK, null);
};

export const clearCurrentTrack = () => {
  return removeItem(STORAGE_KEYS.CURRENT_TRACK);
};

// Player state management
export const savePlayerState = (state) => {
  const playerState = {
    isPlaying: state.isPlaying || false,
    currentTime: state.currentTime || 0,
    duration: state.duration || 0,
    isShuffled: state.isShuffled || false,
    repeatMode: state.repeatMode || 'none', // 'none', 'one', 'all'
    lastUpdated: new Date().toISOString()
  };
  
  return setItem(STORAGE_KEYS.PLAYER_STATE, playerState);
};

export const getPlayerState = () => {
  return getItem(STORAGE_KEYS.PLAYER_STATE, {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isShuffled: false,
    repeatMode: 'none'
  });
};

// Volume management
export const saveVolume = (volume) => {
  const normalizedVolume = Math.max(0, Math.min(1, volume));
  return setItem(STORAGE_KEYS.VOLUME, normalizedVolume);
};

export const getVolume = () => {
  return getItem(STORAGE_KEYS.VOLUME, 0.8);
};

// Playback position management
export const savePlaybackPosition = (trackId, position) => {
  const positions = getItem(STORAGE_KEYS.PLAYBACK_POSITION, {});
  positions[trackId] = {
    position: position,
    timestamp: new Date().toISOString()
  };
  
  return setItem(STORAGE_KEYS.PLAYBACK_POSITION, positions);
};

export const getPlaybackPosition = (trackId) => {
  const positions = getItem(STORAGE_KEYS.PLAYBACK_POSITION, {});
  return positions[trackId]?.position || 0;
};

export const clearPlaybackPosition = (trackId) => {
  const positions = getItem(STORAGE_KEYS.PLAYBACK_POSITION, {});
  delete positions[trackId];
  return setItem(STORAGE_KEYS.PLAYBACK_POSITION, positions);
};

// Utility functions
export const exportPlayerData = () => {
  return {
    playlist: getPlaylist(),
    currentTrack: getCurrentTrack(),
    playerState: getPlayerState(),
    volume: getVolume(),
    exportedAt: new Date().toISOString()
  };
};

export const importPlayerData = (data) => {
  try {
    if (data.playlist) savePlaylist(data.playlist);
    if (data.currentTrack) saveCurrentTrack(data.currentTrack);
    if (data.playerState) savePlayerState(data.playerState);
    if (data.volume !== undefined) saveVolume(data.volume);
    return true;
  } catch (error) {
    console.error('Error importing player data:', error);
    return false;
  }
};

export const clearAllData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
};

// Storage size management
export const getStorageSize = () => {
  if (!isStorageAvailable()) return 0;
  
  let total = 0;
  Object.values(STORAGE_KEYS).forEach(key => {
    const item = localStorage.getItem(key);
    if (item) {
      total += item.length;
    }
  });
  
  return total;
};

export const getStorageInfo = () => {
  return {
    isAvailable: isStorageAvailable(),
    size: getStorageSize(),
    keys: Object.values(STORAGE_KEYS),
    trackCount: getPlaylist().length
  };
};