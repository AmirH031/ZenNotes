import React from 'react';
import { Waves } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import useSound from 'use-sound';

const ZenModeToggle: React.FC = () => {
  const { state, dispatch } = useAppContext();
  
  const [playRain, { stop: stopRain }] = useSound('/sounds/rain.mp3', {
    volume: 0.5,
    loop: true,
  });

  const handleToggleZenMode = () => {
    dispatch({ 
      type: 'SET_ZEN_MODE', 
      payload: state.zenMode === 'off' ? 'on' : 'off'
    });
    
    if (state.zenMode === 'on') {
      dispatch({ type: 'SET_SOUND', payload: 'none' });
      stopRain();
    }
  };

  return (
    <button
      onClick={handleToggleZenMode}
      className={`flex items-center gap-2 px-3 py-2 rounded-md w-full sm:w-auto justify-center ${
        state.zenMode === 'on'
          ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
      }`}
      title={state.zenMode === 'on' ? 'Exit Zen Mode' : 'Enter Zen Mode'}
    >
      <Waves size={18} />
      <span className="text-sm font-medium">{state.zenMode === 'on' ? 'Exit Zen Mode' : 'Zen Mode'}</span>
    </button>
  );
};

export default ZenModeToggle;