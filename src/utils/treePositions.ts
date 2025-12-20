import * as THREE from 'three';
import { CONFIG } from '../constants/config';

/**
 * Tính toán vị trí hình nón của cây thông
 */
export const getTreePosition = (): [number, number, number] => {
  const h = CONFIG.tree.height;
  const rBase = CONFIG.tree.radius;
  const y = Math.random() * h - h / 2;
  const normalizedY = (y + h / 2) / h;
  const currentRadius = rBase * (1 - normalizedY);
  const theta = Math.random() * Math.PI * 2;
  const r = Math.random() * currentRadius;
  return [r * Math.cos(theta), y, r * Math.sin(theta)];
};

/**
 * Tính toán vị trí trên hình cầu (cho trạng thái CHAOS)
 * Phân bố đều trên bề mặt hình cầu
 */
export const getSphericalPosition = (radius: number): THREE.Vector3 => {
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

/**
 * Tính toán vị trí target trên cây với phân bố trọng số
 * Nhiều phần tử ở gốc và thân, ít phần tử ở đỉnh
 */
export const getWeightedTreePosition = (
  excludeTopPercent: number = 0
): THREE.Vector3 => {
  const h = CONFIG.tree.height;
  const rBase = CONFIG.tree.radius;
  
  // Phân bố trọng số: ít ở đỉnh (y cao), nhiều ở thân và gốc (y thấp)
  const maxHeight = 1 - excludeTopPercent;
  const normalizedY = Math.pow(Math.random(), 1.8) * maxHeight;
  const y = normalizedY * h - h / 2;
  
  const currentRadius = rBase * (1 - (y + h / 2) / h);
  const theta = Math.random() * Math.PI * 2;
  
  return new THREE.Vector3(
    currentRadius * Math.cos(theta),
    y,
    currentRadius * Math.sin(theta)
  );
};

