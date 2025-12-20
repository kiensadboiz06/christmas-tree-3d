/* eslint-disable */
// @ts-nocheck
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG } from '../../constants/config';
import { getSphericalPosition, getWeightedTreePosition } from '../../utils/treePositions';
import type { SceneState, FairyLightData } from '../../types';

interface FairyLightsProps {
  state: SceneState;
}

export const FairyLights = ({ state }: FairyLightsProps) => {
  const count = CONFIG.counts.lights;
  const groupRef = useRef<THREE.Group>(null);
  const geometry = useMemo(() => new THREE.SphereGeometry(0.8, 8, 8), []);

  const data = useMemo<FairyLightData[]>(() => {
    return new Array(count).fill(0).map(() => {
      // Tỏa ra theo hình cầu với bán kính 40
      const chaosPos = getSphericalPosition(40);
      
      const targetPos = getWeightedTreePosition();
      targetPos.x += 0.3 * Math.cos(Math.random() * Math.PI * 2);
      targetPos.z += 0.3 * Math.sin(Math.random() * Math.PI * 2);
      
      const color = CONFIG.colors.lights[
        Math.floor(Math.random() * CONFIG.colors.lights.length)
      ];
      const speed = 2 + Math.random() * 3;
      
      return {
        chaosPos,
        targetPos,
        color,
        speed,
        currentPos: chaosPos.clone(),
        timeOffset: Math.random() * 100
      };
    });
  }, []);

  useFrame((stateObj, delta) => {
    if (!groupRef.current) return;
    const isFormed = state === 'FORMED';
    const time = stateObj.clock.elapsedTime;
    
    groupRef.current.children.forEach((child, i) => {
      const objData = data[i];
      const target = isFormed ? objData.targetPos : objData.chaosPos;
      objData.currentPos.lerp(target, delta * 2.0);
      
      const mesh = child as THREE.Mesh;
      mesh.position.copy(objData.currentPos);
      
      const intensity = (Math.sin(time * objData.speed + objData.timeOffset) + 1) / 2;
      if (mesh.material) {
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 
          isFormed ? 3 + intensity * 4 : 0;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((obj, i) => (
        <mesh
          key={i}
          scale={[0.15, 0.15, 0.15]}
          geometry={geometry}>
          <meshStandardMaterial
            color={obj.color}
            emissive={obj.color}
            emissiveIntensity={0}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
};

