/* eslint-disable */
// @ts-nocheck
import { useRef, useMemo, useEffect } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { MathUtils } from 'three';
import * as random from 'maath/random';
import { FoliageMaterial } from '../../shaders/FoliageMaterial';
import { getTreePosition } from '../../utils/treePositions';
import { CONFIG } from '../../constants/config';
import type { SceneState, ThemeColors } from '../../types';

extend({ FoliageMaterial });

interface FoliageProps {
  state: SceneState;
  themeColors: ThemeColors;
}

export const Foliage = ({ state, themeColors }: FoliageProps) => {
  const materialRef = useRef<any>(null);
  
  const { positions, targetPositions, randoms } = useMemo(() => {
    const count = CONFIG.counts.foliage;
    const positions = new Float32Array(count * 3);
    const targetPositions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    const spherePoints = random.inSphere(new Float32Array(count * 3), { radius: 30 }) as Float32Array;
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = spherePoints[i * 3];
      positions[i * 3 + 1] = spherePoints[i * 3 + 1];
      positions[i * 3 + 2] = spherePoints[i * 3 + 2];
      
      const [tx, ty, tz] = getTreePosition();
      targetPositions[i * 3] = tx;
      targetPositions[i * 3 + 1] = ty;
      targetPositions[i * 3 + 2] = tz;
      
      randoms[i] = Math.random();
    }
    
    return { positions, targetPositions, randoms };
  }, []);
  
  // Update theme color
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uColor = new THREE.Color(themeColors.primary);
    }
  }, [themeColors.primary]);

  useFrame((rootState, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime = rootState.clock.elapsedTime;
      const targetProgress = state === 'FORMED' ? 1 : 0;
      materialRef.current.uProgress = MathUtils.damp(
        materialRef.current.uProgress,
        targetProgress,
        1.5,
        delta
      );
      
      // Smoothly interpolate color
      const targetColor = new THREE.Color(themeColors.primary);
      materialRef.current.uColor.lerp(targetColor, delta * 2);
    }
  });
  
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach='attributes-position'
          args={[positions, 3]}
        />
        <bufferAttribute
          attach='attributes-aTargetPos'
          args={[targetPositions, 3]}
        />
        <bufferAttribute
          attach='attributes-aRandom'
          args={[randoms, 1]}
        />
      </bufferGeometry>
      <foliageMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

