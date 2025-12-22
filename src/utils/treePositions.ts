import * as THREE from 'three';
import { CONFIG } from '../constants/config';
import type { TreeStyle } from '../types';

/**
 * Tính toán vị trí hình nón của cây thông (Classic style)
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
 * Tính toán vị trí cho cây nhiều tầng (Tiered style)
 * Gồm nhiều hình nón cụt xếp chồng lên nhau
 */
export const getTieredTreePosition = (): [number, number, number] => {
  const h = CONFIG.tree.height;
  const rBase = CONFIG.tree.radius;
  const numTiers = 4; // Số tầng
  
  // Chọn ngẫu nhiên một tầng (tầng dưới có nhiều hạt hơn)
  const tierWeights = [0.35, 0.30, 0.22, 0.13]; // Phân bố trọng số
  let rand = Math.random();
  let tier = 0;
  for (let i = 0; i < tierWeights.length; i++) {
    rand -= tierWeights[i];
    if (rand <= 0) {
      tier = i;
      break;
    }
  }
  
  // Tính toán chiều cao và bán kính cho mỗi tầng
  const tierHeight = h / numTiers;
  const tierBottomY = -h / 2 + tier * tierHeight;
  
  // Bán kính tầng (giảm dần từ dưới lên)
  const tierRadiusBottom = rBase * (1 - tier / numTiers) * 1.1;
  const tierRadiusTop = rBase * (1 - (tier + 0.8) / numTiers) * 0.7;
  
  // Vị trí y trong tầng
  const y = tierBottomY + Math.random() * tierHeight;
  const normalizedInTier = (y - tierBottomY) / tierHeight;
  
  // Bán kính tại vị trí y (hình nón cụt)
  const currentRadius = tierRadiusBottom + (tierRadiusTop - tierRadiusBottom) * normalizedInTier;
  
  const theta = Math.random() * Math.PI * 2;
  const r = Math.random() * currentRadius;
  
  return [r * Math.cos(theta), y, r * Math.sin(theta)];
};

/**
 * Tính toán vị trí cho kiểu xoắn ốc (Spiral style)
 * Hạt phân bố theo đường xoắn ốc quanh cây
 */
export const getSpiralTreePosition = (): [number, number, number] => {
  const h = CONFIG.tree.height;
  const rBase = CONFIG.tree.radius;
  
  // Vị trí y ngẫu nhiên với phân bố đều hơn
  const normalizedY = Math.random();
  const y = normalizedY * h - h / 2;
  
  // Bán kính giảm dần theo chiều cao
  const baseRadius = rBase * (1 - normalizedY);
  
  // Tạo hiệu ứng xoắn ốc - góc phụ thuộc vào chiều cao
  const spiralTurns = 8; // Số vòng xoắn
  const baseTheta = normalizedY * spiralTurns * Math.PI * 2;
  
  // Thêm nhiễu để tạo độ dày cho nhánh xoắn
  const thetaVariation = (Math.random() - 0.5) * 1.2; // Độ rộng nhánh
  const theta = baseTheta + thetaVariation;
  
  // Bán kính với một chút nhiễu
  const r = baseRadius * (0.7 + Math.random() * 0.3);
  
  return [r * Math.cos(theta), y, r * Math.sin(theta)];
};

/**
 * Lấy vị trí dựa trên kiểu cây
 */
export const getTreePositionByStyle = (style: TreeStyle): [number, number, number] => {
  switch (style) {
    case 'tiered':
      return getTieredTreePosition();
    case 'spiral':
      return getSpiralTreePosition();
    case 'classic':
    default:
      return getTreePosition();
  }
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
  excludeTopPercent: number = 0,
  style: TreeStyle = 'classic'
): THREE.Vector3 => {
  const h = CONFIG.tree.height;
  const rBase = CONFIG.tree.radius;
  
  if (style === 'tiered') {
    const [x, y, z] = getTieredTreePosition();
    return new THREE.Vector3(x, y, z);
  }
  
  if (style === 'spiral') {
    const [x, y, z] = getSpiralTreePosition();
    return new THREE.Vector3(x, y, z);
  }
  
  // Classic style
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

/**
 * Tính toán vị trí đèn LED dạng dây quấn xoắn ốc
 */
export const getSpiralLightPosition = (
  index: number, 
  totalCount: number
): THREE.Vector3 => {
  const h = CONFIG.tree.height;
  const rBase = CONFIG.tree.radius;
  const spiralTurns = 12; // Số vòng quấn
  
  // Phân bố đều theo chiều cao
  const normalizedY = index / totalCount;
  const y = normalizedY * h - h / 2;
  
  // Bán kính giảm dần theo chiều cao
  const currentRadius = rBase * (1 - normalizedY) * 0.95;
  
  // Góc xoắn ốc
  const theta = normalizedY * spiralTurns * Math.PI * 2;
  
  return new THREE.Vector3(
    currentRadius * Math.cos(theta),
    y,
    currentRadius * Math.sin(theta)
  );
};

/**
 * Tính toán vị trí đèn cho cây nhiều tầng
 */
export const getTieredLightPosition = (
  index: number, 
  totalCount: number
): THREE.Vector3 => {
  const h = CONFIG.tree.height;
  const rBase = CONFIG.tree.radius;
  const numTiers = 4;
  
  // Phân bố đèn cho mỗi tầng
  const lightsPerTier = Math.floor(totalCount / numTiers);
  const tier = Math.floor(index / lightsPerTier);
  const indexInTier = index % lightsPerTier;
  
  const tierHeight = h / numTiers;
  const tierCenterY = -h / 2 + tier * tierHeight + tierHeight * 0.6;
  
  // Bán kính mép ngoài của tầng
  const tierRadius = rBase * (1 - tier / numTiers) * 1.05;
  
  // Góc quanh tầng
  const theta = (indexInTier / lightsPerTier) * Math.PI * 2;
  
  // Thêm một chút nhiễu
  const yOffset = (Math.random() - 0.5) * tierHeight * 0.4;
  const rOffset = (Math.random() - 0.5) * 0.5;
  
  return new THREE.Vector3(
    (tierRadius + rOffset) * Math.cos(theta),
    tierCenterY + yOffset,
    (tierRadius + rOffset) * Math.sin(theta)
  );
};

