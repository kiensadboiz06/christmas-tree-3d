/* eslint-disable */
// @ts-nocheck
import { useRef, useMemo, useEffect } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';
import { MathUtils } from 'three';
import * as random from 'maath/random';
import { FoliageMaterial } from '../../shaders/FoliageMaterial';
import { getTreePositionByStyle } from '../../utils/treePositions';
import { CONFIG } from '../../constants/config';
import type { SceneState, ThemeColors, TreeStyle } from '../../types';

extend({ FoliageMaterial });

interface FoliageProps {
  state: SceneState;
  themeColors: ThemeColors;
  treeStyle: TreeStyle;
}

export const Foliage = ({ state, themeColors, treeStyle }: FoliageProps) => {
  const materialRef = useRef<any>(null);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const count = CONFIG.counts.foliage;
  
  // Store initial chaos positions (only generated once)
  const chaosPositions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const spherePoints = random.inSphere(new Float32Array(count * 3), { radius: 30 }) as Float32Array;
    for (let i = 0; i < count; i++) {
      positions[i * 3] = spherePoints[i * 3];
      positions[i * 3 + 1] = spherePoints[i * 3 + 1];
      positions[i * 3 + 2] = spherePoints[i * 3 + 2];
    }
    return positions;
  }, [count]);
  
  const randoms = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      arr[i] = Math.random();
    }
    return arr;
  }, [count]);
  
  // Generate target positions based on tree style (regenerate when style changes)
  const targetPositions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const [tx, ty, tz] = getTreePositionByStyle(treeStyle);
      positions[i * 3] = tx;
      positions[i * 3 + 1] = ty;
      positions[i * 3 + 2] = tz;
    }
    return positions;
  }, [count, treeStyle]);
  
  // Update geometry when tree style changes
  useEffect(() => {
    if (geometryRef.current) {
      const targetAttr = geometryRef.current.getAttribute('aTargetPos');
      if (targetAttr) {
        targetAttr.array.set(targetPositions);
        targetAttr.needsUpdate = true;
      }
    }
  }, [targetPositions]);
  
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
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach='attributes-position'
          args={[chaosPositions, 3]}
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

