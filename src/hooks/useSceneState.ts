import { useState } from 'react';
import type { SceneState } from '../types';

export const useSceneState = () => {
  const [sceneState, setSceneState] = useState<SceneState>('CHAOS');

  const toggleSceneState = () => {
    setSceneState(prev => (prev === 'CHAOS' ? 'FORMED' : 'CHAOS'));
  };

  return {
    sceneState,
    setSceneState,
    toggleSceneState
  };
};

