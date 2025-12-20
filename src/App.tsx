import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Experience } from './components/3d';
import { GestureController } from './components/GestureController';
import { DebugButton, ActionButton, StatusText, uiStyles } from './components/UI';
import { useSceneState, useDebugMode, useAIStatus } from './hooks';

export default function GrandTreeApp() {
  const { sceneState, setSceneState, toggleSceneState } = useSceneState();
  const { debugMode, toggleDebugMode } = useDebugMode();
  const { aiStatus, setAiStatus } = useAIStatus();

  return (
    <div style={uiStyles.container}>
      <div style={uiStyles.canvasWrapper}>
        <Canvas
          dpr={[1, 2]}
          gl={{ toneMapping: THREE.ReinhardToneMapping }}
          shadows>
          <Experience sceneState={sceneState} />
        </Canvas>
      </div>

      <GestureController
        onGesture={setSceneState}
        onStatus={setAiStatus}
        debugMode={debugMode}
      />

      <div style={uiStyles.buttonContainer}>
        <DebugButton debugMode={debugMode} onClick={toggleDebugMode} />
        <ActionButton sceneState={sceneState} onClick={toggleSceneState} />
      </div>

      <StatusText aiStatus={aiStatus} />
    </div>
  );
}
