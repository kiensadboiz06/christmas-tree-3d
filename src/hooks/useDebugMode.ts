import { useState } from 'react';

export const useDebugMode = () => {
  const [debugMode, setDebugMode] = useState(false);

  const toggleDebugMode = () => {
    setDebugMode(prev => !prev);
  };

  return {
    debugMode,
    toggleDebugMode
  };
};

