import { Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Foliage } from './Foliage';
import { PhotoOrnaments } from './PhotoOrnaments';
import { ChristmasElements } from './ChristmasElements';
import { FairyLights } from './FairyLights';
import { GiftBoxes } from './GiftBoxes';
import { TopStar } from './TopStar';
import { ExperienceLights } from './ExperienceLights';
import type { SceneState, ZoomState } from '../../types';
import * as THREE from 'three';

interface ExperienceProps {
  sceneState: SceneState;
  photoUrls: string[];
  zoomState?: ZoomState;
}

export const Experience = ({ sceneState, photoUrls, zoomState }: ExperienceProps) => {
  const treeGroupRef = useRef<THREE.Group>(null);

  // Quay cây chậm liên tục - dừng khi đang zoom
  useFrame((_, delta) => {
    if (treeGroupRef.current && !zoomState?.active) {
      treeGroupRef.current.rotation.y += delta * 0.2; // Quay chậm (0.2 rad/s)
    }
  });

  return (
    <>
      <ExperienceLights sceneState={sceneState} zoomState={zoomState} />

      <group ref={treeGroupRef} position={[0, -2, 0]}>
        <Foliage state={sceneState} />
        <Suspense fallback={null}>
          <ChristmasElements state={sceneState} />
          <FairyLights state={sceneState} />
          <GiftBoxes state={sceneState} />
          <TopStar state={sceneState} />
          {/* Render ảnh sau cùng để nổi lên trên */}
          <PhotoOrnaments 
            key={photoUrls?.length || 0} 
            state={sceneState} 
            photoUrls={photoUrls || []}
            zoomState={zoomState}
          />
        </Suspense>
      </group>
    </>
  );
};

