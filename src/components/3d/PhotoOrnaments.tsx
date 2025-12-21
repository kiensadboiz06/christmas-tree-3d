/* eslint-disable */
// @ts-nocheck
import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { CONFIG } from '../../constants/config';
import { getSphericalPosition, getWeightedTreePosition } from '../../utils/treePositions';
import type { SceneState, PhotoOrnamentData, ZoomState } from '../../types';

interface PhotoOrnamentsProps {
  state: SceneState;
  photoUrls: string[];
  zoomState?: ZoomState;
}

// Component con để load texture - đảm bảo hooks được gọi ổn định
const PhotoOrnamentsContent = ({ state, photoUrls, zoomState }: PhotoOrnamentsProps) => {
  const textures = useTexture(photoUrls);
  const count = photoUrls.length;
  const groupRef = useRef<THREE.Group>(null);
  const [nearestIndex, setNearestIndex] = useState<number>(-1);
  const lockedZoomIndexRef = useRef<number>(-1); // Lưu index của ảnh đang được zoom
  const { camera } = useThree();
  
  // Track khi zoom bắt đầu hoặc kết thúc
  useEffect(() => {
    if (!zoomState?.active) {
      // Khi tắt zoom, unlock và reset
      lockedZoomIndexRef.current = -1;
      setNearestIndex(-1);
    }
  }, [zoomState?.active]);

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
        baseScale,
        zoomScale: 1.0,
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

    // Find nearest photo to hand position when zoom is active (works in both CHAOS and FORMED)
    let currentNearestIndex = -1;
    let minDistance = Infinity;
    
    // Nếu đang zoom và đã lock một ảnh, giữ nguyên ảnh đó
    if (zoomState?.active && lockedZoomIndexRef.current >= 0) {
      currentNearestIndex = lockedZoomIndexRef.current;
    } else if (zoomState?.active && zoomState?.handPosition) {
      // Chỉ tìm ảnh mới khi chưa lock (lần đầu bắt đầu zoom)
      // Convert hand position from screen space (0-1) to world space
      const handScreenPos = new THREE.Vector2(
        zoomState.handPosition.x * 2 - 1, // Convert 0-1 to -1 to 1
        -(zoomState.handPosition.y * 2 - 1) // Flip Y and convert
      );
      
      // Create a raycaster to project hand position into 3D space
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(handScreenPos, camera);
      
      // Find photo closest to the ray from hand position
      groupRef.current.children.forEach((group, i) => {
        // Calculate distance from hand ray to photo position
        const photoPos = group.position;
        const distanceToRay = raycaster.ray.distanceToPoint(photoPos);
        
        // Also consider screen-space distance for better selection
        const screenPos = photoPos.clone().project(camera);
        const screenDistance = Math.sqrt(
          Math.pow(screenPos.x - handScreenPos.x, 2) + 
          Math.pow(screenPos.y - handScreenPos.y, 2)
        );
        
        // Combined distance metric (weighted towards screen space for better UX)
        const combinedDistance = screenDistance * 0.7 + distanceToRay * 0.3;
        
        if (combinedDistance < minDistance) {
          minDistance = combinedDistance;
          currentNearestIndex = i;
        }
      });
      
      // Lock index khi tìm được ảnh đầu tiên và chưa lock
      if (currentNearestIndex >= 0 && lockedZoomIndexRef.current < 0) {
        lockedZoomIndexRef.current = currentNearestIndex;
        setNearestIndex(currentNearestIndex);
      }
    }
    
    // Khi đang zoom và đã lock, đảm bảo nearestIndex luôn là locked index
    if (zoomState?.active && lockedZoomIndexRef.current >= 0) {
      if (nearestIndex !== lockedZoomIndexRef.current) {
        setNearestIndex(lockedZoomIndexRef.current);
      }
    }

    groupRef.current.children.forEach((group, i) => {
      const objData = data[i];
      // Sử dụng lockedZoomIndexRef hoặc currentNearestIndex để xác định ảnh đang zoom
      const zoomedIndex = lockedZoomIndexRef.current >= 0 ? lockedZoomIndexRef.current : currentNearestIndex;
      const isZoomed = zoomState?.active && i === zoomedIndex;
      
      // Khi zoom, di chuyển ảnh về phía camera (hoạt động ở cả CHAOS và FORMED)
      let finalTarget;
      if (isZoomed) {
        // Tính toán vị trí gần camera hơn
        // Lấy hướng camera (forward direction)
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        // Đặt ảnh ở khoảng cách 30 đơn vị trước camera (gần hơn để dễ nhìn thấy)
        const distanceFromCamera = 30;
        finalTarget = new THREE.Vector3()
          .copy(camera.position)
          .addScaledVector(cameraDirection, distanceFromCamera);
      } else {
        finalTarget = isFormed ? objData.targetPos : objData.chaosPos;
      }

      // Tăng tốc độ di chuyển khi zoom để ảnh di chuyển nhanh hơn
      const lerpSpeed = isZoomed ? 5.0 : (isFormed ? 0.8 * objData.weight : 0.5);
      objData.currentPos.lerp(finalTarget, delta * lerpSpeed);
      group.position.copy(objData.currentPos);

      // Smooth zoom animation - only zoom the nearest photo
      const targetZoom = isZoomed ? 9.5 : 1.0;
      objData.zoomScale += (targetZoom - objData.zoomScale) * delta * 8; // Fast smooth lerp
      objData.scale = objData.baseScale * objData.zoomScale;
      group.scale.setScalar(objData.scale);

      // Khi zoom, ảnh hướng thẳng vào camera và dừng rotation (hoạt động ở cả CHAOS và FORMED)
      if (isZoomed) {
        group.lookAt(camera.position);
      } else if (isFormed) {
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
        // CHAOS state - continuous rotation
        group.rotation.x += delta * objData.rotationSpeed.x;
        group.rotation.y += delta * objData.rotationSpeed.y;
        group.rotation.z += delta * objData.rotationSpeed.z;
      }
    });
  });

  return (
    <group ref={groupRef} renderOrder={100}>
      {data.map((obj, i) => {
        const isZoomed = zoomState?.active && i === nearestIndex;
        const renderOrder = isZoomed ? 200 : 101; // Tăng renderOrder khi zoom
        
        return (
          <group
            key={i}
            scale={[obj.scale, obj.scale, obj.scale]}
            rotation={state === 'CHAOS' ? obj.chaosRotation : [0, 0, 0]}>
            {/* Mặt trước */}
            <group position={[0, 0, 0.5]}>
              <mesh geometry={photoGeometry} renderOrder={renderOrder}>
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
                renderOrder={renderOrder}>
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
              <mesh geometry={photoGeometry} renderOrder={renderOrder}>
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
                renderOrder={renderOrder}>
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
        );
      })}
    </group>
  );
};

// Component chính - xử lý conditional rendering
export const PhotoOrnaments = ({ state, photoUrls, zoomState }: PhotoOrnamentsProps) => {
  // Đảm bảo photoUrls luôn là mảng hợp lệ
  const validPhotoUrls = Array.isArray(photoUrls) && photoUrls.length > 0 ? photoUrls : [];
  
  // Nếu không có ảnh, không render gì
  if (validPhotoUrls.length === 0) {
    return null;
  }
  
  // Render component con với texture loading
  return <PhotoOrnamentsContent state={state} photoUrls={validPhotoUrls} zoomState={zoomState} />;
};

