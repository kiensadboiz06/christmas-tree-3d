import { Suspense } from 'react';
import { Foliage } from './Foliage';
import { PhotoOrnaments } from './PhotoOrnaments';
import { ChristmasElements } from './ChristmasElements';
import { FairyLights } from './FairyLights';
import { GiftBoxes } from './GiftBoxes';
import { TopStar } from './TopStar';
import { ExperienceLights } from './ExperienceLights';
import type { SceneState } from '../../types';

interface ExperienceProps {
  sceneState: SceneState;
  photoUrls: string[];
}

export const Experience = ({ sceneState, photoUrls }: ExperienceProps) => {
  return (
    <>
      <ExperienceLights sceneState={sceneState} />

      <group position={[0, -2, 0]}>
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

