import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Experience } from './components/3d';
import { GestureController } from './components/GestureController';
import { DebugButton, StatusText, AddPhotoButton, uiStyles } from './components/UI';
import { useSceneState, useDebugMode, useAIStatus, usePhotos } from './hooks';

export default function GrandTreeApp() {
  const { sceneState, setSceneState, toggleSceneState } = useSceneState();
  const { debugMode, toggleDebugMode } = useDebugMode();
  const { aiStatus, setAiStatus } = useAIStatus();
  const { photos, addPhotos } = usePhotos();

  const handlePhotosAdded = (files: FileList) => {
    addPhotos(files).catch((error) => {
      console.error('Error adding photos:', error);
      setAiStatus(`ERROR: ${error.message}`);
    });
  };

  return (
    <div style={uiStyles.container}>
      <div 
        style={uiStyles.canvasWrapper}
        onClick={toggleSceneState}>
        <Canvas
          dpr={[1, 2]}
          gl={{ toneMapping: THREE.ReinhardToneMapping }}
          shadows>
          <Experience sceneState={sceneState} photoUrls={photos} />
        </Canvas>
      </div>

      <GestureController
        onGesture={setSceneState}
        onStatus={setAiStatus}
        debugMode={debugMode}
      />

      <div style={uiStyles.buttonContainer}>
        <AddPhotoButton onPhotosAdded={handlePhotosAdded} photoCount={photos.length} />
        <DebugButton debugMode={debugMode} onClick={toggleDebugMode} />
      </div>

      <StatusText aiStatus={aiStatus} />
    </div>
  );
}
