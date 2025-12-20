/* eslint-disable */
// @ts-nocheck
import { useState, useMemo, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  PerspectiveCamera,
  shaderMaterial,
  Float,
  Stars,
  Sparkles,
  useTexture
} from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { MathUtils } from 'three';
import * as random from 'maath/random';
import { GestureRecognizer, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

// --- Tạo danh sách ảnh động (top.jpg + 1.jpg đến 31.jpg) ---
const TOTAL_NUMBERED_PHOTOS = 31;
// Sửa đổi: Thêm top.jpg vào đầu mảng
const bodyPhotoPaths = [
  '/photos/top.jpg',
  ...Array.from({ length: TOTAL_NUMBERED_PHOTOS }, (_, i) => `/photos/${i + 1}.jpg`)
];

// --- Cấu hình giao diện ---
const CONFIG = {
  colors: {
    emerald: '#004225', // Xanh ngọc bích thuần khiết
    gold: '#FFD700',
    silver: '#ECEFF1',
    red: '#D32F2F',
    white: '#FFFFFF', // Trắng thuần khiết
    warmLight: '#FFD54F',
    lights: ['#FF0000', '#00FF00', '#FFFF00'], // Đèn màu
    // Bảng màu viền ảnh Polaroid (tông màu cổ điển nhẹ nhàng)
    borders: ['#FFFAF0', '#F0E68C', '#E6E6FA', '#FFB6C1', '#98FB98', '#FFDAB9'],
    // Màu sắc các phần tử Giáng sinh
    giftColors: ['#D32F2F', '#FFD700', '#2E7D32'],
    // Màu metallic cho hộp quà (đỏ, xanh lá, xanh dương, vàng, hồng, bạc)
    metallicGiftColors: ['#C41E3A', '#228B22', '#FFD700', '#FF69B4', '#C0C0C0']
  },
  counts: {
    foliage: 25000, // Tăng số hạt lá
    ornaments: 50, // Giảm số ảnh
    elements: 400, // Số lượng phần tử Giáng sinh
    lights: 400, // Số lượng đèn màu
    gifts: 300 // Hộp quà có nơ
  },
  tree: { height: 26, radius: 11 }, // Tăng kích thước cây thông
  photos: {
    // Thuộc tính top không còn cần thiết vì đã chuyển vào body
    body: bodyPhotoPaths
  }
};

// --- Shader Material (Foliage) ---
const FoliageMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color(CONFIG.colors.emerald), uProgress: 0 },
  `uniform float uTime; uniform float uProgress; attribute vec3 aTargetPos; attribute float aRandom;
  varying vec2 vUv; varying float vMix; varying float vHeight;
  float cubicInOut(float t) { return t < 0.5 ? 4.0 * t * t * t : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0; }
  void main() {
    vUv = uv;
    vec3 noise = vec3(sin(uTime * 1.5 + position.x), cos(uTime + position.y), sin(uTime * 1.5 + position.z)) * 0.15;
    float t = cubicInOut(uProgress);
    vec3 finalPos = mix(position, aTargetPos + noise, t);
    // Chuẩn hoá chiều cao để tạo gradient màu (0 = gốc, 1 = đỉnh)
    float h = 26.0;
    vHeight = clamp((finalPos.y + h / 2.0) / h, 0.0, 1.0);
    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    gl_PointSize = (60.0 * (1.0 + aRandom)) / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
    vMix = t;
  }`,
  `uniform vec3 uColor; varying float vMix; varying float vHeight;
  void main() {
    float r = distance(gl_PointCoord, vec2(0.5)); if (r > 0.5) discard;
    // Gradient: gốc cây tối hơn, đỉnh cây sáng và ấm hơn
    vec3 darkColor = uColor * 0.35;
    vec3 lightColor = uColor * 1.4;
    vec3 gradColor = mix(darkColor, lightColor, vHeight);
    vec3 finalColor = mix(gradColor * 0.8, gradColor * 1.15, vMix);
    gl_FragColor = vec4(finalColor, 1.0);
  }`
);
extend({ FoliageMaterial });

// --- Hàm trợ giúp: Hình dạng cây ---
const getTreePosition = () => {
  const h = CONFIG.tree.height;
  const rBase = CONFIG.tree.radius;
  const y = Math.random() * h - h / 2;
  const normalizedY = (y + h / 2) / h;
  const currentRadius = rBase * (1 - normalizedY);
  const theta = Math.random() * Math.PI * 2;
  const r = Math.random() * currentRadius;
  return [r * Math.cos(theta), y, r * Math.sin(theta)];
};

// --- Hàm trợ giúp: Vị trí hình cầu (cho trạng thái CHAOS) ---
const getSphericalPosition = (radius: number) => {
  // Tạo vị trí ngẫu nhiên trên hình cầu với phân bố đều
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u; // Góc phương vị (0 đến 2π)
  const phi = Math.acos(2 * v - 1); // Góc cực (0 đến π) - phân bố đều
  const r = radius * (0.7 + Math.random() * 0.3); // Bán kính ngẫu nhiên trong khoảng
  return new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi), // Trục Y
    r * Math.sin(phi) * Math.sin(theta)
  );
};

// --- Component: Lá cây ---
const Foliage = ({ state }: { state: 'CHAOS' | 'FORMED' }) => {
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
  useFrame((rootState, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime = rootState.clock.elapsedTime;
      const targetProgress = state === 'FORMED' ? 1 : 0;
      materialRef.current.uProgress = MathUtils.damp(materialRef.current.uProgress, targetProgress, 1.5, delta);
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

// --- Component: Trang trí ảnh (Polaroid hai mặt) ---
const PhotoOrnaments = ({ state }: { state: 'CHAOS' | 'FORMED' }) => {
  const textures = useTexture(CONFIG.photos.body);
  const count = CONFIG.counts.ornaments;
  const groupRef = useRef<THREE.Group>(null);

  const borderGeometry = useMemo(() => new THREE.PlaneGeometry(1.2, 1.5), []);
  const photoGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);

  const data = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      // Tỏa ra theo hình cầu với bán kính 50
      const chaosPos = getSphericalPosition(50);
      const h = CONFIG.tree.height;
      // Phân bố trọng số: ít ở đỉnh (y cao), nhiều ở thân và gốc (y thấp)
      // Giới hạn ảnh không xuất hiện ở đỉnh: chỉ từ 0% đến 75% chiều cao cây
      const normalizedY = Math.pow(Math.random(), 1.8) * 0.75; // 0.75 để loại bỏ 25% phần đỉnh
      const y = normalizedY * h - h / 2;
      const rBase = CONFIG.tree.radius;
      const currentRadius = rBase * (1 - (y + h / 2) / h) + 0.5;
      const theta = Math.random() * Math.PI * 2;
      const targetPos = new THREE.Vector3(currentRadius * Math.cos(theta), y, currentRadius * Math.sin(theta));

      const isBig = Math.random() < 0.2;
      const baseScale = isBig ? 2.2 : 0.8 + Math.random() * 0.6;
      const weight = 0.8 + Math.random() * 1.2;
      const borderColor = CONFIG.colors.borders[Math.floor(Math.random() * CONFIG.colors.borders.length)];

      const rotationSpeed = {
        x: (Math.random() - 0.5) * 1.0,
        y: (Math.random() - 0.5) * 1.0,
        z: (Math.random() - 0.5) * 1.0
      };
      const chaosRotation = new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

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
        const targetLookPos = new THREE.Vector3(group.position.x * 2, group.position.y + 0.5, group.position.z * 2);
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
    <group ref={groupRef}>
      {data.map((obj, i) => (
        <group
          key={i}
          scale={[obj.scale, obj.scale, obj.scale]}
          rotation={state === 'CHAOS' ? obj.chaosRotation : [0, 0, 0]}>
          {/* Mặt trước */}
          <group position={[0, 0, 0.015]}>
            <mesh geometry={photoGeometry}>
              <meshStandardMaterial
                map={textures[obj.textureIndex]}
                roughness={0.5}
                metalness={0}
                side={THREE.FrontSide}
              />
            </mesh>
            <mesh
              geometry={borderGeometry}
              position={[0, -0.15, -0.01]}>
              <meshStandardMaterial
                color={obj.borderColor}
                roughness={0.9}
                metalness={0}
                side={THREE.FrontSide}
              />
            </mesh>
          </group>

          {/* Mặt sau trống (không ảnh) */}
          <group
            position={[0, 0, -0.015]}
            rotation={[0, Math.PI, 0]}>
            <mesh geometry={photoGeometry}>
              <meshStandardMaterial
                color={obj.borderColor}
                roughness={0.9}
                metalness={0}
                side={THREE.FrontSide}
              />
            </mesh>
            <mesh
              geometry={borderGeometry}
              position={[0, -0.15, -0.01]}>
              <meshStandardMaterial
                color={obj.borderColor}
                roughness={0.9}
                metalness={0}
                side={THREE.FrontSide}
              />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
};

// --- Component: Các phần tử Giáng sinh ---
const ChristmasElements = ({ state }: { state: 'CHAOS' | 'FORMED' }) => {
  const count = CONFIG.counts.elements;
  const groupRef = useRef<THREE.Group>(null);

  const sphereGeometry = useMemo(() => new THREE.SphereGeometry(1, 16, 16), []);

  const data = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      const chaosPos = new THREE.Vector3(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60
      );
      const h = CONFIG.tree.height;
      // Phân bố trọng số: ít ở đỉnh (y cao), nhiều ở thân và gốc (y thấp)
      // Dùng Math.random()^2 để tạo nhiều giá trị ở dưới hơn
      const normalizedY = Math.pow(Math.random(), 1.8); // 1.8 để tăng mật độ ở dưới
      const y = normalizedY * h - h / 2;
      const rBase = CONFIG.tree.radius;
      const currentRadius = rBase * (1 - (y + h / 2) / h) * 0.95;
      const theta = Math.random() * Math.PI * 2;

      const targetPos = new THREE.Vector3(currentRadius * Math.cos(theta), y, currentRadius * Math.sin(theta));

      // Tất cả đều là quả cầu, chỉ khác màu và tỷ lệ (giảm tỷ lệ để quả cầu nhỏ hơn)
      const colorType = Math.floor(Math.random() * 3);
      let color;
      let scale = 1;
      if (colorType === 0) {
        color = CONFIG.colors.giftColors[Math.floor(Math.random() * CONFIG.colors.giftColors.length)];
        scale = 0.5 + Math.random() * 0.3;
      } else if (colorType === 1) {
        color = CONFIG.colors.giftColors[Math.floor(Math.random() * CONFIG.colors.giftColors.length)];
        scale = 0.4 + Math.random() * 0.3;
      } else {
        color = Math.random() > 0.5 ? CONFIG.colors.red : CONFIG.colors.white;
        scale = 0.45 + Math.random() * 0.25;
      }

      const rotationSpeed = {
        x: (Math.random() - 0.5) * 2.0,
        y: (Math.random() - 0.5) * 2.0,
        z: (Math.random() - 0.5) * 2.0
      };
      // Chỉ một số quả cầu ngẫu nhiên sẽ lấp lánh (khoảng 25%)
      const shouldSparkle = Math.random() < 0.25;
      const sparkleOffset = Math.random() * Math.PI * 2;
      const sparkleSpeed = 1.5 + Math.random() * 1.5;
      const sparkleDuration = 1.5 + Math.random() * 2.0; // Lấp lánh trong 1.5-3.5 giây
      const sparkleCooldown = 3.0 + Math.random() * 5.0; // Chờ 3-8 giây trước khi lấp lánh lại
      const sparkleStartTime = Math.random() * sparkleCooldown;
      return {
        chaosPos,
        targetPos,
        color,
        scale,
        currentPos: chaosPos.clone(),
        chaosRotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
        rotationSpeed,
        shouldSparkle,
        sparkleOffset,
        sparkleSpeed,
        sparkleDuration,
        sparkleCooldown,
        sparkleStartTime
      };
    });
  }, [sphereGeometry]);

  useFrame((stateObj, delta) => {
    if (!groupRef.current) return;
    const isFormed = state === 'FORMED';
    const time = stateObj.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const objData = data[i];
      const target = isFormed ? objData.targetPos : objData.chaosPos;
      objData.currentPos.lerp(target, delta * 1.5);
      mesh.position.copy(objData.currentPos);
      mesh.rotation.x += delta * objData.rotationSpeed.x;
      mesh.rotation.y += delta * objData.rotationSpeed.y;
      mesh.rotation.z += delta * objData.rotationSpeed.z;

      // Hiệu ứng lấp lánh vàng: chỉ cho những quả cầu được chọn, không phải lúc nào cũng nháy
      if (mesh.material && isFormed && objData.shouldSparkle) {
        const material = mesh.material as THREE.MeshStandardMaterial;
        // Tính toán chu kỳ lấp lánh: lấp lánh trong một khoảng thời gian, sau đó tắt
        const cycleTime = time - objData.sparkleStartTime;
        const cyclePosition = cycleTime % (objData.sparkleDuration + objData.sparkleCooldown);
        const isSparkling = cyclePosition < objData.sparkleDuration;

        if (isSparkling) {
          // Đang trong thời gian lấp lánh
          const sparkle = (Math.sin(time * objData.sparkleSpeed + objData.sparkleOffset) + 1) / 2;
          // Phát sáng lớn và chói hơn: cường độ từ 1.0 đến 4.0
          material.emissiveIntensity = 1.0 + sparkle * 3.0;
          // Tăng tỷ lệ khi lấp lánh để quả cầu lớn hơn (1.0 đến 1.3)
          const sparkleScale = 1.0 + sparkle * 0.3;
          mesh.scale.setScalar(objData.scale * sparkleScale);
          // Thêm màu vàng chói khi lấp lánh
          const goldTint = new THREE.Color(CONFIG.colors.gold);
          goldTint.lerp(new THREE.Color(objData.color), 1 - sparkle * 0.8);
          material.emissive = goldTint;
        } else {
          // Đang trong thời gian chờ, giữ nguyên
          material.emissiveIntensity = 0.5;
          material.emissive = new THREE.Color(objData.color);
          mesh.scale.setScalar(objData.scale);
        }
      } else if (mesh.material && isFormed) {
        // Quả cầu không lấp lánh giữ nguyên
        const material = mesh.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = 0.5;
        material.emissive = new THREE.Color(objData.color);
        mesh.scale.setScalar(objData.scale);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {data.map((obj, i) => (
        <mesh
          key={i}
          scale={[obj.scale, obj.scale, obj.scale]}
          geometry={sphereGeometry}
          rotation={obj.chaosRotation}
          castShadow
          receiveShadow>
          <meshStandardMaterial
            color={obj.color}
            roughness={0.15}
            metalness={0.9}
            emissive={obj.color}
            emissiveIntensity={0.5}
            envMapIntensity={1.5}
          />
        </mesh>
      ))}
    </group>
  );
};

// --- Component: Đèn trang trí ---
const FairyLights = ({ state }: { state: 'CHAOS' | 'FORMED' }) => {
  const count = CONFIG.counts.lights;
  const groupRef = useRef<THREE.Group>(null);
  const geometry = useMemo(() => new THREE.SphereGeometry(0.8, 8, 8), []);

  const data = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      // Tỏa ra theo hình cầu với bán kính 40
      const chaosPos = getSphericalPosition(40);
      const h = CONFIG.tree.height;
      const y = Math.random() * h - h / 2;
      const rBase = CONFIG.tree.radius;
      const currentRadius = rBase * (1 - (y + h / 2) / h) + 0.3;
      const theta = Math.random() * Math.PI * 2;
      const targetPos = new THREE.Vector3(currentRadius * Math.cos(theta), y, currentRadius * Math.sin(theta));
      const color = CONFIG.colors.lights[Math.floor(Math.random() * CONFIG.colors.lights.length)];
      const speed = 2 + Math.random() * 3;
      return { chaosPos, targetPos, color, speed, currentPos: chaosPos.clone(), timeOffset: Math.random() * 100 };
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
        (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = isFormed ? 3 + intensity * 4 : 0;
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

// --- Component: Ngôi sao trên đỉnh (Không có ảnh, Ngôi sao 3D vàng thuần) ---
const TopStar = ({ state }: { state: 'CHAOS' | 'FORMED' }) => {
  const groupRef = useRef<THREE.Group>(null);

  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const outerRadius = 1.3;
    const innerRadius = 0.7;
    const points = 5;
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      i === 0
        ? shape.moveTo(radius * Math.cos(angle), radius * Math.sin(angle))
        : shape.lineTo(radius * Math.cos(angle), radius * Math.sin(angle));
    }
    shape.closePath();
    return shape;
  }, []);

  const starGeometry = useMemo(() => {
    return new THREE.ExtrudeGeometry(starShape, {
      depth: 0.4, // Tăng một chút độ dày
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelSegments: 3
    });
  }, [starShape]);

  // Chất liệu vàng thuần khiết
  const goldMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: CONFIG.colors.gold,
        emissive: CONFIG.colors.gold,
        emissiveIntensity: 1.5, // Độ sáng vừa phải, vừa phát sáng vừa có chất liệu
        roughness: 0.1,
        metalness: 1.0
      }),
    []
  );

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
      const targetScale = state === 'FORMED' ? 1 : 0;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 3);
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, CONFIG.tree.height / 2 + 1.8, 0]}>
      <Float
        speed={2}
        rotationIntensity={0.2}
        floatIntensity={0.2}>
        <mesh
          geometry={starGeometry}
          material={goldMaterial}
        />
      </Float>
    </group>
  );
};

// --- Component: Hộp quà có nơ ---
const GiftBoxes = ({ state }: { state: 'CHAOS' | 'FORMED' }) => {
  const count = CONFIG.counts.gifts;
  const groupRef = useRef<THREE.Group>(null);

  const data = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      // Phân tán giống quả cầu: trong hình hộp 60x60x60
      const chaosPos = new THREE.Vector3(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60
      );
      const h = CONFIG.tree.height;
      // Phân bố trọng số giống quả cầu: ít ở đỉnh, nhiều ở thân và gốc
      const normalizedY = Math.pow(Math.random(), 1.8); // Giống quả cầu
      const y = normalizedY * h - h / 2;
      const rBase = CONFIG.tree.radius;
      const currentRadius = rBase * (1 - (y + h / 2) / h) * 0.95; // Giống quả cầu
      const theta = Math.random() * Math.PI * 2;
      const targetPos = new THREE.Vector3(currentRadius * Math.cos(theta), y, currentRadius * Math.sin(theta));

      // Màu từ giftColors
      const giftColors = CONFIG.colors.metallicGiftColors || CONFIG.colors.giftColors;
      const boxColor = giftColors[Math.floor(Math.random() * giftColors.length)];
      // Kích thước bằng với quả cầu: từ 0.4 đến 0.8
      const colorType = Math.floor(Math.random() * 3);
      let size = 1;
      if (colorType === 0) {
        size = 0.5 + Math.random() * 0.3; // 0.5 đến 0.8
      } else if (colorType === 1) {
        size = 0.4 + Math.random() * 0.3; // 0.4 đến 0.7
      } else {
        size = 0.45 + Math.random() * 0.25; // 0.45 đến 0.7
      }

      const rotationSpeed = {
        x: (Math.random() - 0.5) * 1.0,
        y: (Math.random() - 0.5) * 1.0,
        z: (Math.random() - 0.5) * 1.0
      };
      return {
        chaosPos,
        targetPos,
        boxColor,
        size,
        currentPos: chaosPos.clone(),
        chaosRotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
        rotationSpeed,
        timeOffset: Math.random() * Math.PI * 2
      };
    });
  }, []);

  useFrame((stateObj, delta) => {
    if (!groupRef.current) return;
    const isFormed = state === 'FORMED';
    const time = stateObj.clock.elapsedTime;
    groupRef.current.children.forEach((child, i) => {
      const group = child as THREE.Group;
      const objData = data[i];
      const target = isFormed ? objData.targetPos : objData.chaosPos;
      objData.currentPos.lerp(target, delta * 1.2);
      group.position.copy(objData.currentPos);
      group.rotation.x += delta * objData.rotationSpeed.x;
      group.rotation.y += delta * objData.rotationSpeed.y;
      group.rotation.z += delta * objData.rotationSpeed.z;

      const targetScale = isFormed ? 1 : 1;
      group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 3);
      group.visible = true;

      // Hiệu ứng bay nhẹ nhàng khi ở trạng thái FORMED
      if (isFormed) {
        const floatOffset = Math.sin(time * 2 + objData.timeOffset) * 0.1;
        group.position.y += floatOffset;
      }
    });
  });

  // Tái sử dụng vật liệu
  const ribbonMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: CONFIG.colors.gold,
        roughness: 0.15,
        metalness: 1.0
      }),
    []
  );

  return (
    <group ref={groupRef}>
      {data.map((obj, i) => {
        const size = obj.size;

        return (
          <group
            key={i}
            position={[obj.currentPos.x, obj.currentPos.y, obj.currentPos.z]}
            rotation={[obj.chaosRotation.x, obj.chaosRotation.y, obj.chaosRotation.z]}>
            {/* Hộp chính */}
            <mesh
              receiveShadow
              castShadow>
              <boxGeometry args={[size, size, size]} />
              <meshStandardMaterial
                color={obj.boxColor}
                roughness={0.3}
                metalness={0.1}
              />
            </mesh>

            {/* Ruy băng dọc */}
            <mesh
              receiveShadow
              castShadow
              material={ribbonMaterial}>
              <boxGeometry args={[size + 0.1, size, size * 0.2]} />
            </mesh>

            {/* Ruy băng ngang */}
            <mesh
              receiveShadow
              castShadow
              material={ribbonMaterial}>
              <boxGeometry args={[size * 0.2, size, size + 0.1]} />
            </mesh>

            {/* Nơ trên - Vòng trái (dẹt) */}
            <mesh
              position={[-size * 0.25, size / 2, 0]}
              rotation={[0, 0, Math.PI / 3]}
              castShadow
              material={ribbonMaterial}>
              <boxGeometry args={[size * 0.3, size * 0.15, size * 0.05]} />
            </mesh>

            {/* Nơ trên - Vòng phải (dẹt) */}
            <mesh
              position={[size * 0.25, size / 2, 0]}
              rotation={[0, 0, -Math.PI / 3]}
              castShadow
              material={ribbonMaterial}>
              <boxGeometry args={[size * 0.3, size * 0.15, size * 0.05]} />
            </mesh>

            {/* Nút nơ giữa (dẹt) */}
            <mesh
              position={[0, size / 2, 0]}
              castShadow
              material={ribbonMaterial}>
              <boxGeometry args={[size * 0.12, size * 0.12, size * 0.05]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// --- Trải nghiệm cảnh chính ---
const Experience = ({ sceneState }: { sceneState: 'CHAOS' | 'FORMED' }) => {
  const controlsRef = useRef<any>(null);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 15, 45]}
        fov={50}
      />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        minDistance={15}
        maxDistance={80}
        rotateSpeed={1.2}
        autoRotate={sceneState === 'FORMED'}
        autoRotateSpeed={0.3}
      />

      <color
        attach='background'
        args={['#000300']}
      />
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      <Environment
        preset='city'
        background={false}
      />

      <ambientLight
        intensity={0.5}
        color='#003311'
      />
      {/* Ánh sáng dịu để ảnh và trang trí luôn rõ nét */}
      <ambientLight
        intensity={0.3}
        color='#666688'
      />
      <spotLight
        position={[10, 20, 10]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        castShadow
        color='#fffaed'
      />
      <pointLight
        position={[30, 30, 30]}
        intensity={100}
        color={CONFIG.colors.warmLight}
      />
      <pointLight
        position={[-30, 10, -30]}
        intensity={50}
        color={CONFIG.colors.gold}
      />
      <pointLight
        position={[0, -20, 10]}
        intensity={30}
        color='#ffffff'
      />

      <group position={[0, -2, 0]}>
        <Foliage state={sceneState} />
        <Suspense fallback={null}>
          <PhotoOrnaments state={sceneState} />
          <ChristmasElements state={sceneState} />
          <FairyLights state={sceneState} />
          <GiftBoxes state={sceneState} />
          <TopStar state={sceneState} />
        </Suspense>
        <Sparkles
          count={600}
          scale={50}
          size={8}
          speed={0.4}
          opacity={0.4}
          color={CONFIG.colors.silver}
        />
      </group>

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.5}
          luminanceSmoothing={0.1}
          intensity={1.5}
          radius={0.6}
          mipmapBlur
        />
        <Vignette
          eskil={false}
          offset={0.1}
          darkness={1.1}
        />
      </EffectComposer>
    </>
  );
};

// --- Bộ điều khiển cử chỉ ---
const GestureController = ({ onGesture, onStatus, debugMode }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let gestureRecognizer: GestureRecognizer;
    let requestRef: number;

    const setup = async () => {
      onStatus('DOWNLOADING AI...');
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
        );
        gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 1
        });
        onStatus('REQUESTING CAMERA...');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            onStatus('AI READY: SHOW HAND');
            predictWebcam();
          }
        } else {
          onStatus('ERROR: CAMERA PERMISSION DENIED');
        }
      } catch (err: any) {
        onStatus(`ERROR: ${err.message || 'MODEL FAILED'}`);
      }
    };

    const predictWebcam = () => {
      if (gestureRecognizer && videoRef.current && canvasRef.current) {
        if (videoRef.current.videoWidth > 0) {
          const results = gestureRecognizer.recognizeForVideo(videoRef.current, Date.now());
          const ctx = canvasRef.current.getContext('2d');
          if (ctx && debugMode) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            if (results.landmarks)
              for (const landmarks of results.landmarks) {
                const drawingUtils = new DrawingUtils(ctx);
                drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
                  color: '#FFD700',
                  lineWidth: 2
                });
                drawingUtils.drawLandmarks(landmarks, { color: '#FF0000', lineWidth: 1 });
              }
          } else if (ctx && !debugMode) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          if (results.gestures.length > 0) {
            const name = results.gestures[0][0].categoryName;
            const score = results.gestures[0][0].score;
            if (score > 0.4) {
              if (name === 'Open_Palm') onGesture('CHAOS');
              if (name === 'Closed_Fist') onGesture('FORMED');
              if (debugMode) onStatus(`DETECTED: ${name}`);
            }
          } else {
            if (debugMode) onStatus('AI READY: NO HAND');
          }
        }
        requestRef = requestAnimationFrame(predictWebcam);
      }
    };
    setup();
    return () => cancelAnimationFrame(requestRef);
  }, [onGesture, onStatus, debugMode]);

  return (
    <>
      <video
        ref={videoRef}
        style={{
          opacity: debugMode ? 0.6 : 0,
          position: 'fixed',
          top: 0,
          right: 0,
          width: debugMode ? '320px' : '1px',
          zIndex: debugMode ? 100 : -1,
          pointerEvents: 'none',
          transform: 'scaleX(-1)'
        }}
        playsInline
        muted
        autoPlay
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: debugMode ? '320px' : '1px',
          height: debugMode ? 'auto' : '1px',
          zIndex: debugMode ? 101 : -1,
          pointerEvents: 'none',
          transform: 'scaleX(-1)'
        }}
      />
    </>
  );
};

// --- Điểm vào ứng dụng ---
export default function GrandTreeApp() {
  const [sceneState, setSceneState] = useState<'CHAOS' | 'FORMED'>('CHAOS');
  const [aiStatus, setAiStatus] = useState('INITIALIZING...');
  const [debugMode, setDebugMode] = useState(false);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', position: 'relative', overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        <Canvas
          dpr={[1, 2]}
          gl={{ toneMapping: THREE.ReinhardToneMapping }}
          shadows>
          <Experience
            sceneState={sceneState}
          />
        </Canvas>
      </div>
      <GestureController
        onGesture={setSceneState}
        onStatus={setAiStatus}
        debugMode={debugMode}
      />

      {/* UI - Buttons */}
      <div style={{ position: 'absolute', bottom: '30px', right: '40px', zIndex: 10, display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setDebugMode(!debugMode)}
          style={{
            padding: '12px 15px',
            backgroundColor: debugMode ? '#FFD700' : 'rgba(0,0,0,0.5)',
            border: '1px solid #FFD700',
            color: debugMode ? '#000' : '#FFD700',
            fontFamily: 'sans-serif',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)'
          }}>
          {debugMode ? 'HIDE DEBUG' : '🛠 DEBUG'}
        </button>
        <button
          onClick={() => setSceneState(s => (s === 'CHAOS' ? 'FORMED' : 'CHAOS'))}
          style={{
            padding: '12px 30px',
            backgroundColor: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255, 215, 0, 0.5)',
            color: '#FFD700',
            fontFamily: 'serif',
            fontSize: '14px',
            fontWeight: 'bold',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)'
          }}>
          {sceneState === 'CHAOS' ? 'Assemble Tree' : 'Disperse'}
        </button>
      </div>

      {/* UI - AI Status */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: aiStatus.includes('ERROR') ? '#FF0000' : 'rgba(255, 215, 0, 0.4)',
          fontSize: '10px',
          letterSpacing: '2px',
          zIndex: 10,
          background: 'rgba(0,0,0,0.5)',
          padding: '4px 8px',
          borderRadius: '4px'
        }}>
        {aiStatus}
      </div>
    </div>
  );
}
