import type { CSSProperties } from 'react';

export const uiStyles = {
  container: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#000',
    position: 'relative',
    overflow: 'hidden'
  } as CSSProperties,

  canvasWrapper: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    cursor: 'pointer'
  } as CSSProperties,

  buttonContainer: {
    position: 'absolute',
    bottom: '32px',
    right: '32px',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  } as CSSProperties
};

