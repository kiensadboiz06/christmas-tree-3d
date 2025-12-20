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
    zIndex: 1
  } as CSSProperties,

  buttonContainer: {
    position: 'absolute',
    bottom: '30px',
    right: '40px',
    zIndex: 10,
    display: 'flex',
    gap: '10px'
  } as CSSProperties,

  debugButton: (debugMode: boolean): CSSProperties => ({
    padding: '12px 15px',
    backgroundColor: debugMode ? '#FFD700' : 'rgba(0,0,0,0.5)',
    border: '1px solid #FFD700',
    color: debugMode ? '#000' : '#FFD700',
    fontFamily: 'sans-serif',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    backdropFilter: 'blur(4px)'
  }),

  actionButton: {
    padding: '12px 30px',
    backgroundColor: 'rgba(0,0,0,0.5)',
    border: '1px solid rgba(255, 215, 0, 0.5)',
    color: '#FFD700',
    fontFamily: 'serif',
    fontSize: '14px',
    fontWeight: 'bold',
    letterSpacing: '3px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    backdropFilter: 'blur(4px)'
  } as CSSProperties,

  statusText: (hasError: boolean): CSSProperties => ({
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    color: hasError ? '#FF0000' : 'rgba(255, 215, 0, 0.4)',
    fontSize: '10px',
    letterSpacing: '2px',
    zIndex: 10,
    background: 'rgba(0,0,0,0.5)',
    padding: '4px 8px',
    borderRadius: '4px'
  })
};

