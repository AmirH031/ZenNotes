import React, { useEffect, useState } from 'react';
import { Music, Volume2, VolumeX, Waves, Coffee, Wind } from 'lucide-react';
import { SoundType } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { Howl } from 'howler';

const soundSources = {
  rain: '/sounds/rain.mp3',
  cafe: '/sounds/cafe.mp3',
  forest: '/sounds/forest.mp3'
};

const ZenModeControls: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [sound, setSound] = useState<Howl | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);

  const handleToggleZenMode = () => {
    dispatch({ 
      type: 'SET_ZEN_MODE', 
      payload: state.zenMode === 'off' ? 'on' : 'off'
    });
    
    // If exiting zen mode, stop the sound
    if (state.zenMode === 'on') {
      dispatch({ type: 'SET_SOUND', payload: 'none' });
    }
  };

  const handleSelectSound = (soundType: SoundType) => {
    dispatch({ type: 'SET_SOUND', payload: soundType });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (sound) {
      sound.volume(newVolume);
    }
    
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (sound) {
      if (isMuted) {
        sound.volume(volume);
      } else {
        sound.volume(0);
      }
      setIsMuted(!isMuted);
    }
  };

  // Handle sound playback
  useEffect(() => {
    // Stop previous sound
    if (sound) {
      sound.stop();
      sound.unload();
    }

    // Create and play new sound if needed
    if (state.soundType !== 'none' && state.zenMode === 'on') {
      const soundUrl = soundSources[state.soundType];
      const newSound = new Howl({
        src: [soundUrl],
        loop: true,
        volume: isMuted ? 0 : volume,
        html5: true,
      });
      
      newSound.play();
      setSound(newSound);
    }

    // Cleanup on unmount
    return () => {
      if (sound) {
        sound.stop();
        sound.unload();
      }
    };
  }, [state.soundType, state.zenMode]);

  // If not in zen mode, don't render controls
  if (state.zenMode === 'off') {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full py-2 px-4 shadow-lg flex items-center gap-3">
      <button
        onClick={handleToggleZenMode}
        className={`p-2 rounded-full ${
          state.zenMode === 'on'
            ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title="Exit Zen Mode"
      >
        <Waves size={18} />
      </button>
      
      <div className="h-5 border-r border-gray-300 dark:border-gray-600"></div>
      
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Ambience:</span>
        
        <button
          onClick={() => handleSelectSound('rain')}
          className={`p-2 rounded-full ${
            state.soundType === 'rain'
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Rain Sounds"
        >
          <Waves size={18} />
        </button>
        
        <button
          onClick={() => handleSelectSound('cafe')}
          className={`p-2 rounded-full ${
            state.soundType === 'cafe'
              ? 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Café Sounds"
        >
          <Coffee size={18} />
        </button>
        
        <button
          onClick={() => handleSelectSound('forest')}
          className={`p-2 rounded-full ${
            state.soundType === 'forest'
              ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Forest Sounds"
        >
          <Wind size={18} />
        </button>
        
        <button
          onClick={() => handleSelectSound('none')}
          className={`p-2 rounded-full ${
            state.soundType === 'none'
              ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="No Sound"
        >
          <Music size={18} className="line-through" />
        </button>
      </div>
      
      {state.soundType !== 'none' && (
        <>
          <div className="h-5 border-r border-gray-300 dark:border-gray-600"></div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default ZenModeControls;