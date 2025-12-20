import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { CONFIG } from '../constants/config';

export const FoliageMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color(CONFIG.colors.emerald), uProgress: 0 },
  // Vertex Shader
  `uniform float uTime; 
   uniform float uProgress; 
   attribute vec3 aTargetPos; 
   attribute float aRandom;
   varying vec2 vUv; 
   varying float vMix; 
   varying float vHeight;
   
   float cubicInOut(float t) { 
     return t < 0.5 ? 4.0 * t * t * t : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0; 
   }
   
   void main() {
     vUv = uv;
     vec3 noise = vec3(
       sin(uTime * 1.5 + position.x), 
       cos(uTime + position.y), 
       sin(uTime * 1.5 + position.z)
     ) * 0.15;
     
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
  // Fragment Shader
  `uniform vec3 uColor; 
   varying float vMix; 
   varying float vHeight;
   
   void main() {
     float r = distance(gl_PointCoord, vec2(0.5)); 
     if (r > 0.5) discard;
     
     // Gradient: gốc cây tối hơn, đỉnh cây sáng và ấm hơn
     vec3 darkColor = uColor * 0.35;
     vec3 lightColor = uColor * 1.4;
     vec3 gradColor = mix(darkColor, lightColor, vHeight);
     vec3 finalColor = mix(gradColor * 0.8, gradColor * 1.15, vMix);
     
     gl_FragColor = vec4(finalColor, 1.0);
   }`
);

