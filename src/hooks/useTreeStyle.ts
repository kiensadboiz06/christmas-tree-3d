import { useState, useCallback, useRef } from 'react';
import type { TreeStyle } from '../types';

const TREE_STYLES: TreeStyle[] = ['classic', 'tiered', 'spiral'];

export const useTreeStyle = () => {
  const [treeStyle, setTreeStyle] = useState<TreeStyle>('classic');
  const lastStyleChangeRef = useRef<number>(0);
  
  // Debounce style change to prevent rapid switching
  const STYLE_CHANGE_COOLDOWN = 1500; // 1.5 seconds

  const setStyleByFingerCount = useCallback((count: 1 | 2 | 3) => {
    const now = Date.now();
    if (now - lastStyleChangeRef.current < STYLE_CHANGE_COOLDOWN) {
      return; // Still in cooldown
    }
    
    const newStyle = TREE_STYLES[count - 1];
    if (newStyle && newStyle !== treeStyle) {
      lastStyleChangeRef.current = now;
      setTreeStyle(newStyle);
    }
  }, [treeStyle]);

  return {
    treeStyle,
    setTreeStyle,
    setStyleByFingerCount
  };
};

