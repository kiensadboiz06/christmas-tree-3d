import { Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Foliage } from './Foliage';
import { PhotoOrnaments } from './PhotoOrnaments';
import { ChristmasElements } from './ChristmasElements';
import { FairyLights } from './FairyLights';
import { GiftBoxes } from './GiftBoxes';
import { TopStar } from './TopStar';
import { ExperienceLights } from './ExperienceLights';
import type { SceneState } from '../../types';
import * as THREE from 'three';

interface ExperienceProps {
  sceneState: SceneState;
  photoUrls: string[];
}

export const Experience = ({ sceneState, photoUrls }: ExperienceProps) => {
  const treeGroupRef = useRef<THREE.Group>(null);

  // Quay cây chậm liên tục
  useFrame((_, delta) => {
    if (treeGroupRef.current) {
      treeGroupRef.current.rotation.y += delta * 0.2; // Quay chậm (0.2 rad/s)
    }
  });

  return (
    <>
      <ExperienceLights sceneState={sceneState} />

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
          />
        </Suspense>
      </group>
    </>
  );
};

