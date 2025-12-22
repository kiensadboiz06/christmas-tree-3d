/* eslint-disable */
// @ts-nocheck
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG } from '../../constants/config';
import { 
  getSphericalPosition, 
  getWeightedTreePosition, 
  getSpiralLightPosition,
  getTieredLightPosition 
} from '../../utils/treePositions';
import type { SceneState, FairyLightData, ThemeColors, TreeStyle } from '../../types';

interface FairyLightsProps {
  state: SceneState;
  themeColors: ThemeColors;
  treeStyle: TreeStyle;
}

export const FairyLights = ({ state, themeColors, treeStyle }: FairyLightsProps) => {
  const count = CONFIG.counts.lights;
  const groupRef = useRef<THREE.Group>(null);
  const geometry = useMemo(() => new THREE.SphereGeometry(0.8, 8, 8), []);

  // Store color indices for each light to map to theme colors
  const colorIndices = useMemo(() => {
    return new Array(count).fill(0).map(() => Math.floor(Math.random() * 4));
  }, [count]);

  // Generate chaos positions (only once)
  const chaosPositions = useMemo(() => {
    return new Array(count).fill(0).map(() => getSphericalPosition(40));
  }, [count]);

  // Generate target positions based on tree style
  const targetPositions = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      let targetPos: THREE.Vector3;
      
      switch (treeStyle) {
        case 'spiral':
          // Đèn LED dạng dây quấn xoắn ốc
          targetPos = getSpiralLightPosition(i, count);
          break;
        case 'tiered':
          // Đèn phân bố theo các tầng
          targetPos = getTieredLightPosition(i, count);
          break;
        case 'classic':
        default:
          // Phân bố ngẫu nhiên trên cây
          targetPos = getWeightedTreePosition();
          targetPos.x += 0.3 * Math.cos(Math.random() * Math.PI * 2);
          targetPos.z += 0.3 * Math.sin(Math.random() * Math.PI * 2);
          break;
      }
      
      return targetPos;
    });
  }, [count, treeStyle]);

  // Store random speeds and time offsets (only generated once)
  const lightSpeeds = useMemo(() => {
    return new Array(count).fill(0).map(() => 2 + Math.random() * 3);
  }, [count]);
  
  const timeOffsets = useMemo(() => {
    return new Array(count).fill(0).map(() => Math.random() * 100);
  }, [count]);

  const data = useMemo<FairyLightData[]>(() => {
    return new Array(count).fill(0).map((_, i) => {
      const chaosPos = chaosPositions[i];
      const targetPos = targetPositions[i];
      
      // Use theme colors directly
      const colorIndex = colorIndices[i] % themeColors.lights.length;
      const color = themeColors.lights[colorIndex];
      
      return {
        chaosPos,
        targetPos,
        color,
        speed: lightSpeeds[i],
        currentPos: chaosPos.clone(),
        timeOffset: timeOffsets[i]
      };
    });
  }, [count, chaosPositions, targetPositions, colorIndices, themeColors.lights, lightSpeeds, timeOffsets]);
  
  // Update target positions when tree style changes
  useEffect(() => {
    data.forEach((objData, i) => {
      objData.targetPos.copy(targetPositions[i]);
    });
  }, [targetPositions, data]);
  
  // Update light colors when theme changes
  useEffect(() => {
    if (!groupRef.current) return;
    
    groupRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      if (mesh.material) {
        const colorIndex = colorIndices[i] % themeColors.lights.length;
        const newColor = themeColors.lights[colorIndex];
        (mesh.material as THREE.MeshStandardMaterial).color.set(newColor);
        (mesh.material as THREE.MeshStandardMaterial).emissive.set(newColor);
        // Also update data color for reference
        data[i].color = newColor;
      }
    });
  }, [themeColors.lights, colorIndices, data]);

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
      {data.map((obj, i) => {
        const colorIndex = colorIndices[i] % themeColors.lights.length;
        const currentColor = themeColors.lights[colorIndex];
        return (
          <mesh
            key={i}
            scale={[0.15, 0.15, 0.15]}
            geometry={geometry}>
            <meshStandardMaterial
              color={currentColor}
              emissive={currentColor}
              emissiveIntensity={0}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
};

