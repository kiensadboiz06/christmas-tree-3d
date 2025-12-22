import { Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Foliage } from './Foliage';
import { PhotoOrnaments } from './PhotoOrnaments';
import { ChristmasElements } from './ChristmasElements';
import { FairyLights } from './FairyLights';
import { GiftBoxes } from './GiftBoxes';
import { TopStar } from './TopStar';
import { ExperienceLights } from './ExperienceLights';
import type { SceneState, ZoomState, ThemeColors, TreeStyle } from '../../types';
import * as THREE from 'three';

interface ExperienceProps {
  sceneState: SceneState;
  photoUrls: string[];
  zoomState?: ZoomState;
  themeColors: ThemeColors;
  treeStyle: TreeStyle;
}

export const Experience = ({ sceneState, photoUrls, zoomState, themeColors, treeStyle }: ExperienceProps) => {
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
        <Foliage state={sceneState} themeColors={themeColors} treeStyle={treeStyle} />
        <Suspense fallback={null}>
          <ChristmasElements state={sceneState} themeColors={themeColors} treeStyle={treeStyle} />
          <FairyLights state={sceneState} themeColors={themeColors} treeStyle={treeStyle} />
          <GiftBoxes state={sceneState} themeColors={themeColors} treeStyle={treeStyle} />
          <TopStar state={sceneState} themeColors={themeColors} />
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

