/* eslint-disable */
// @ts-nocheck
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { CONFIG } from '../../constants/config';
import { getSphericalPosition, getWeightedTreePosition } from '../../utils/treePositions';
import type { SceneState, PhotoOrnamentData } from '../../types';

interface PhotoOrnamentsProps {
  state: SceneState;
  photoUrls: string[];
}

// Component con để load texture - đảm bảo hooks được gọi ổn định
const PhotoOrnamentsContent = ({ state, photoUrls }: PhotoOrnamentsProps) => {
  const textures = useTexture(photoUrls);
  const count = photoUrls.length;
  const groupRef = useRef<THREE.Group>(null);

  const borderGeometry = useMemo(() => new THREE.PlaneGeometry(1.2, 1.5), []);
  const photoGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);

  const data = useMemo<PhotoOrnamentData[]>(() => {
    return new Array(count).fill(0).map((_, i) => {
      // Tỏa ra theo hình cầu với bán kính 50
      const chaosPos = getSphericalPosition(50);
      
      // Phân bố trọng số: loại bỏ 25% phần đỉnh
      const targetPos = getWeightedTreePosition(0.25);
      targetPos.x += 0.5 * Math.cos(Math.random() * Math.PI * 2);
      targetPos.z += 0.5 * Math.sin(Math.random() * Math.PI * 2);
      targetPos.z += 0.3;

      const isBig = Math.random() < 0.2;
      const baseScale = isBig ? 2.2 : 0.8 + Math.random() * 0.6;
      const weight = 0.8 + Math.random() * 1.2;
      const borderColor = CONFIG.colors.borders[
        Math.floor(Math.random() * CONFIG.colors.borders.length)
      ];

      const rotationSpeed = {
        x: (Math.random() - 0.5) * 1.0,
        y: (Math.random() - 0.5) * 1.0,
        z: (Math.random() - 0.5) * 1.0
      };
      
      const chaosRotation = new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      return {
        chaosPos,
        targetPos,
        scale: baseScale,
        weight,
        textureIndex: i % textures.length,
        borderColor,
        currentPos: chaosPos.clone(),
        chaosRotation,
        rotationSpeed,
        wobbleOffset: Math.random() * 10,
        wobbleSpeed: 0.5 + Math.random() * 0.5
      };
    });
  }, [textures, count]);

  useFrame((stateObj, delta) => {
    if (!groupRef.current) return;
    const isFormed = state === 'FORMED';
    const time = stateObj.clock.elapsedTime;

    groupRef.current.children.forEach((group, i) => {
      const objData = data[i];
      const target = isFormed ? objData.targetPos : objData.chaosPos;

      objData.currentPos.lerp(target, delta * (isFormed ? 0.8 * objData.weight : 0.5));
      group.position.copy(objData.currentPos);

      if (isFormed) {
        const targetLookPos = new THREE.Vector3(
          group.position.x * 2,
          group.position.y + 0.5,
          group.position.z * 2
        );
        group.lookAt(targetLookPos);

        const wobbleX = Math.sin(time * objData.wobbleSpeed + objData.wobbleOffset) * 0.05;
        const wobbleZ = Math.cos(time * objData.wobbleSpeed * 0.8 + objData.wobbleOffset) * 0.05;
        group.rotation.x += wobbleX;
        group.rotation.z += wobbleZ;
      } else {
        group.rotation.x += delta * objData.rotationSpeed.x;
        group.rotation.y += delta * objData.rotationSpeed.y;
        group.rotation.z += delta * objData.rotationSpeed.z;
      }
    });
  });

  return (
    <group ref={groupRef} renderOrder={100}>
      {data.map((obj, i) => (
        <group
          key={i}
          scale={[obj.scale, obj.scale, obj.scale]}
          rotation={state === 'CHAOS' ? obj.chaosRotation : [0, 0, 0]}>
          {/* Mặt trước */}
          <group position={[0, 0, 0.5]}>
            <mesh geometry={photoGeometry} renderOrder={101}>
              <meshStandardMaterial
                map={textures[obj.textureIndex]}
                roughness={0.5}
                metalness={0}
                side={THREE.FrontSide}
                depthTest={true}
                depthWrite={true}
              />
            </mesh>
            <mesh
              geometry={borderGeometry}
              position={[0, -0.15, -0.01]}
              renderOrder={101}>
              <meshStandardMaterial
                color={obj.borderColor}
                roughness={0.9}
                metalness={0}
                side={THREE.FrontSide}
                depthTest={true}
                depthWrite={true}
              />
            </mesh>
          </group>

          {/* Mặt sau trống (không ảnh) */}
          <group
            position={[0, 0, -0.5]}
            rotation={[0, Math.PI, 0]}>
            <mesh geometry={photoGeometry} renderOrder={101}>
              <meshStandardMaterial
                color={obj.borderColor}
                roughness={0.9}
                metalness={0}
                side={THREE.FrontSide}
                depthTest={true}
                depthWrite={true}
              />
            </mesh>
            <mesh
              geometry={borderGeometry}
              position={[0, -0.15, -0.01]}
              renderOrder={101}>
              <meshStandardMaterial
                color={obj.borderColor}
                roughness={0.9}
                metalness={0}
                side={THREE.FrontSide}
                depthTest={true}
                depthWrite={true}
              />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
};

// Component chính - xử lý conditional rendering
export const PhotoOrnaments = ({ state, photoUrls }: PhotoOrnamentsProps) => {
  // Đảm bảo photoUrls luôn là mảng hợp lệ
  const validPhotoUrls = Array.isArray(photoUrls) && photoUrls.length > 0 ? photoUrls : [];
  
  // Nếu không có ảnh, không render gì
  if (validPhotoUrls.length === 0) {
    return null;
  }
  
  // Render component con với texture loading
  return <PhotoOrnamentsContent state={state} photoUrls={validPhotoUrls} />;
};

