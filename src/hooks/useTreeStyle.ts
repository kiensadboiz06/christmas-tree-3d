import { useState, useCallback, useRef } from 'react';
import type { TreeStyle } from '../types';

const TREE_STYLES: TreeStyle[] = ['classic', 'tiered', 'spiral'];

export const useTreeStyle = () => {
  const [treeStyle, setTreeStyle] = useState<TreeStyle>('classic');
  const treeStyleRef = useRef<TreeStyle>('classic');

  const setStyleByFingerCount = useCallback((count: 1 | 2 | 3) => {
    const newStyle = TREE_STYLES[count - 1];
    // Chỉ đổi nếu khác style hiện tại (dùng ref để tránh stale closure)
    if (newStyle && newStyle !== treeStyleRef.current) {
      treeStyleRef.current = newStyle;
      setTreeStyle(newStyle);
    }
  }, []);

  return {
    treeStyle,
    setTreeStyle,
    setStyleByFingerCount
  };
};

