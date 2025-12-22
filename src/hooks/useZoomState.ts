import { useState, useCallback, useRef } from 'react';
import type { ZoomState } from '../types';

export const useZoomState = () => {
  const [zoomState, setZoomState] = useState<ZoomState>({
    active: false,
    targetIndex: -1
  });
  
  // Use ref to track previous values and avoid unnecessary updates
  const prevStateRef = useRef<{ isPinching: boolean; handPosition?: { x: number; y: number } }>({
    isPinching: false,
    handPosition: undefined
  });

  const handlePinch = useCallback((isPinching: boolean, handPosition?: { x: number; y: number }) => {
    const prev = prevStateRef.current;
    
    // Only update if state actually changed
    const stateChanged = prev.isPinching !== isPinching;
    
    // Check if hand position changed significantly (threshold: 1% of screen)
    const positionChanged = isPinching && handPosition && (
      !prev.handPosition ||
      Math.abs(prev.handPosition.x - handPosition.x) > 0.01 ||
      Math.abs(prev.handPosition.y - handPosition.y) > 0.01
    );
    
    // Only update state if something actually changed
    if (stateChanged || positionChanged) {
      prevStateRef.current = { isPinching, handPosition };
      setZoomState(prev => ({
        ...prev,
        active: isPinching,
        handPosition: isPinching ? handPosition : undefined
      }));
    }
  }, []);

  return { zoomState, handlePinch };
};

