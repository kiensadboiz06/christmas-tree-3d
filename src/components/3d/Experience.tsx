/* eslint-disable */
// @ts-nocheck
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
}

export const Experience = ({ sceneState }: ExperienceProps) => {
  return (
    <>
      <ExperienceLights sceneState={sceneState} />

      <group position={[0, -2, 0]}>
        <Foliage state={sceneState} />
        <Suspense fallback={null}>
          <PhotoOrnaments state={sceneState} />
          <ChristmasElements state={sceneState} />
          <FairyLights state={sceneState} />
          <GiftBoxes state={sceneState} />
          <TopStar state={sceneState} />
        </Suspense>
      </group>
    </>
  );
};

