import React, { useState, useEffect } from 'react';
import { Music, Volume2, VolumeX, CloudRain, Waves, Trees, Play, Square } from 'lucide-react';
import { SoundType } from '../../types';
import { useAppContext } from '../../context/AppContext';
import useSound from 'use-sound';

const ZenModeControls: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundLoadError, setSoundLoadError] = useState<string | null>(null);

  const [playRain, { stop: stopRain }] = useSound('/ZenNotes/sounds/rain.mp3', {
    volume: isMuted ? 0 : volume,
    loop: true,
    onload: () => setSoundLoadError(null),
    onloaderror: () => setSoundLoadError('Failed to load rain sound'),
  });

  const [playOcean, { stop: stopOcean }] = useSound('/ZenNotes/sounds/ocean.mp3', {
    volume: isMuted ? 0 : volume,
    loop: true,
    onload: () => setSoundLoadError(null),
    onloaderror: () => setSoundLoadError('Failed to load ocean sound'),
  });

  const [playForest, { stop: stopForest }] = useSound('/ZenNotes/sounds/forest.mp3', {
    volume: isMuted ? 0 : volume,
    loop: true,
    onload: () => setSoundLoadError(null),
    onloaderror: () => setSoundLoadError('Failed to load forest sound'),
  });

  const stopAllSounds = () => {
    stopRain();
    stopOcean();
    stopForest();
    setIsPlaying(false);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopAllSounds();
    } else {
      try {
        switch (state.soundType) {
          case 'rain':
            playRain();
            break;
          case 'ocean':
            playOcean();
            break;
          case 'forest':
            playForest();
            break;
        }
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing sound:', error);
        setSoundLoadError('Failed to play sound');
      }
    }
  };

 const handleSelectSound = (soundType: SoundType) => {
  stopAllSounds();
  dispatch({ type: 'SET_SOUND', payload: soundType });

  if (soundType === 'none') {
    dispatch({ type: 'SET_ZEN_MODE', payload: 'off' });
  }
};


  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted) {
      stopAllSounds();
    } else if (isPlaying) {
      handleTogglePlay();
    }
  };

  useEffect(() => {
    return () => {
      stopAllSounds();
    };
  }, []);

  useEffect(() => {
    if (state.zenMode === 'off') {
      stopAllSounds();
    }
  }, [state.zenMode]);

  if (state.zenMode === 'off') return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full py-2 px-4 shadow-lg">
      {soundLoadError && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md text-sm">
          {soundLoadError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleTogglePlay}
            className={`p-3 rounded-full ${
              isPlaying
                ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300'
                : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'
            }`}
            title={isPlaying ? 'Stop' : 'Play'}
            disabled={state.soundType === 'none'}
          >
            {isPlaying ? <Square size={24} /> : <Play size={24} />}
          </button>
          <div className="h-8 border-r border-gray-300 dark:border-gray-600 hidden sm:block" />
        </div>

        <div className="flex flex-wrap justify-center items-center gap-3">
          <button
            onClick={() => handleSelectSound('rain')}
            className={`p-3 rounded-full ${
              state.soundType === 'rain'
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Rain Sounds"
          >
            <CloudRain size={24} />
          </button>

          <button
            onClick={() => handleSelectSound('ocean')}
            className={`p-3 rounded-full ${
              state.soundType === 'ocean'
                ? 'bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Ocean Sounds"
          >
            <Waves size={24} />
          </button>

          <button
            onClick={() => handleSelectSound('forest')}
            className={`p-3 rounded-full ${
              state.soundType === 'forest'
                ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Forest Sounds"
          >
            <Trees size={24} />
          </button>

          <button
            onClick={() => handleSelectSound('none')}
            className={`p-3 rounded-full ${
              state.soundType === 'none'
                ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="No Sound"
          >
            <Music size={24} className="line-through" />
          </button>
        </div>

        {state.soundType !== 'none' && (
          <div className="flex items-center gap-3">
            <div className="h-8 border-r border-gray-300 dark:border-gray-600 hidden sm:block" />

            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-2 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZenModeControls;
