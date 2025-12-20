import type { SceneState } from '../../types';

interface DebugButtonProps {
  debugMode: boolean;
  onClick: () => void;
}

export const DebugButton = ({ debugMode, onClick }: DebugButtonProps) => {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 15px',
        backgroundColor: debugMode ? '#FFD700' : 'rgba(0,0,0,0.5)',
        border: '1px solid #FFD700',
        color: debugMode ? '#000' : '#FFD700',
        fontFamily: 'sans-serif',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        backdropFilter: 'blur(4px)'
      }}>
      {debugMode ? 'HIDE DEBUG' : '🛠 DEBUG'}
    </button>
  );
};

interface ActionButtonProps {
  sceneState: SceneState;
  onClick: () => void;
}

export const ActionButton = ({ sceneState, onClick }: ActionButtonProps) => {
  return (
    <button
      onClick={onClick}
      style={{
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
      }}>
      {sceneState === 'CHAOS' ? 'Assemble Tree' : 'Disperse'}
    </button>
  );
};

interface StatusTextProps {
  aiStatus: string;
}

export const StatusText = ({ aiStatus }: StatusTextProps) => {
  const hasError = aiStatus.includes('ERROR');
  
  return (
    <div
      style={{
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
      }}>
      {aiStatus}
    </div>
  );
};

