import { useState, useCallback } from 'react';
import type { ZoomState } from '../types';

export const useZoomState = () => {
  const [zoomState, setZoomState] = useState<ZoomState>({
    active: false,
    targetIndex: -1
  });

  const handlePinch = useCallback((isPinching: boolean, handPosition?: { x: number; y: number }) => {
    setZoomState(prev => ({
      ...prev,
      active: isPinching,
      handPosition: isPinching ? handPosition : undefined
    }));
  }, []);

  return { zoomState, handlePinch };
};

