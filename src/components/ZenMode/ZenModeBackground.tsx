import React, { useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';

interface ZenModeBackgroundProps {
  children: React.ReactNode;
}

const ZenModeBackground: React.FC<ZenModeBackgroundProps> = ({ children }) => {
  const { state } = useAppContext();
  
  useEffect(() => {
    if (state.zenMode === 'on') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [state.zenMode]);

  if (state.zenMode === 'off') {
    return <>{children}</>;
  }

  let backgroundGradient = '';
  switch (state.soundType) {
    case 'rain':
      backgroundGradient = 'from-blue-900 via-blue-600 to-blue-400';
      break;
    case 'ocean':
      backgroundGradient = 'from-cyan-900 via-cyan-600 to-cyan-400';
      break;
    case 'forest':
      backgroundGradient = 'from-green-900 via-green-700 to-green-500';
      break;
    default:
      backgroundGradient = 'from-indigo-900 via-purple-800 to-blue-700';
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div 
        className={`fixed inset-0 bg-gradient-to-br ${backgroundGradient} opacity-20 dark:opacity-40 z-0`}
      >
        {state.soundType === 'rain' && (
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-blue-200 dark:bg-blue-400 opacity-20 rounded-full"
                style={{
                  width: `${Math.random() * 8 + 2}px`,
                  height: `${Math.random() * 20 + 10}px`,
                  left: `${Math.random() * 100}%`,
                  top: `-${Math.random() * 10 + 5}%`,
                  animation: `fall ${Math.random() * 5 + 5}s linear infinite`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              />
            ))}
          </div>
        )}
        
        {state.soundType === 'ocean' && (
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 15 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-cyan-200 dark:bg-cyan-400 opacity-20"
                style={{
                  width: `${Math.random() * 100 + 50}px`,
                  height: `${Math.random() * 20 + 10}px`,
                  borderRadius: '50%',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${Math.random() * 8 + 4}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              />
            ))}
          </div>
        )}
        
        {state.soundType === 'forest' && (
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={i}
                className="absolute bg-green-200 dark:bg-green-400 opacity-20"
                style={{
                  width: `${Math.random() * 30 + 20}px`,
                  height: `${Math.random() * 30 + 20}px`,
                  borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 5}s`
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default ZenModeBackground;