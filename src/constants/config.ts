import type { Config } from '../types';

const TOTAL_NUMBERED_PHOTOS = 31;

// Tạo danh sách ảnh động (top.jpg + 1.jpg đến 31.jpg)
const bodyPhotoPaths = [
  '/photos/top.jpg',
  ...Array.from({ length: TOTAL_NUMBERED_PHOTOS }, (_, i) => `/photos/${i + 1}.jpg`)
];

export const CONFIG: Config = {
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
    body: bodyPhotoPaths
  }
};

