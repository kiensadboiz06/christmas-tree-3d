# 🎄 Christmas Tree 3D

Ứng dụng cây thông Noel 3D tương tác với Three.js và React Three Fiber, được điều khiển bằng cử chỉ tay.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6)
![Three.js](https://img.shields.io/badge/Three.js-0.182-000000)

## ✨ Tính năng

- 🎄 **Cây thông 3D** với 25,000+ particles
- 🖼️ **32 ảnh Polaroid** với hiệu ứng wobble
- 🎁 **300 hộp quà** 3D với nơ vàng
- 🔴 **400 quả cầu** trang trí với sparkle effect
- 💡 **400 đèn LED** nhấp nháy đa màu
- ⭐ **Ngôi sao vàng** quay trên đỉnh
- 👋 **Điều khiển cử chỉ tay** với MediaPipe AI
- 🎨 **Post-processing** effects (Bloom, Vignette)
- 🌌 **5000 ngôi sao** background

## 🚀 Quick Start

### Yêu cầu

- Node.js >= 18
- pnpm >= 8

### Cài đặt

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Mở trình duyệt: `http://localhost:5173`

### Build Production

```bash
pnpm build
```

### Preview Production

```bash
pnpm preview
```

## 🎮 Cách sử dụng

### Điều khiển chuột
- **Click & Drag**: Xoay camera
- **Scroll**: Zoom in/out
- **Button "Assemble Tree"**: Chuyển từ CHAOS → FORMED
- **Button "Disperse"**: Chuyển từ FORMED → CHAOS

### Điều khiển cử chỉ tay
1. Bật camera (cho phép quyền truy cập)
2. Đưa tay vào khung hình
3. **Tay mở (Open Palm)** → CHAOS
4. **Nắm đấm (Closed Fist)** → FORMED

### Debug Mode
- Click nút **🛠 DEBUG** để xem:
  - Camera feed
  - Hand tracking visualization
  - Gesture detection status

## 📚 Documentation

Chi tiết trong thư mục [`docs/`](docs/):

- **[Project Structure](docs/PROJECT_STRUCTURE.md)** - Tổng quan cấu trúc
- **[Architecture](docs/ARCHITECTURE.md)** - Kiến trúc và SOLID principles
- **[Components](docs/COMPONENTS.md)** - Chi tiết từng component
- **[Development Guide](docs/DEVELOPMENT.md)** - Hướng dẫn phát triển
- **[Refactoring Summary](docs/REFACTORING_SUMMARY.md)** - Quá trình refactoring

## 🏗️ Kiến trúc

Dự án tuân theo **Clean Architecture** và **SOLID Principles**:

```
src/
├── components/          # React Components
│   ├── 3d/             # 3D Scene Components (9 files)
│   ├── UI/             # UI Components (3 files)
│   └── GestureController.tsx
├── constants/          # Configuration (1 file)
├── hooks/              # Custom Hooks (3 files)
├── shaders/            # GLSL Shaders (1 file)
├── types/              # TypeScript Types (1 file)
├── utils/              # Utilities (1 file)
├── App.tsx             # Main App (35 lines)
└── main.tsx            # Entry point
```

**Highlights**:
- ✅ 28 files, avg 56 lines/file (was: 1 file, 1046 lines)
- ✅ Full TypeScript type safety
- ✅ Modular và dễ maintain
- ✅ 100% giữ nguyên chức năng

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | React 19, TypeScript 5.9 |
| **3D Engine** | Three.js 0.182, React Three Fiber 9 |
| **3D Helpers** | @react-three/drei, @react-three/postprocessing |
| **AI** | MediaPipe Tasks Vision |
| **Build** | Vite 7 |
| **Linting** | ESLint 9 |

## 📊 Thống kê

| Metric | Value |
|--------|-------|
| Total Components | 13 |
| 3D Particles | 25,000 |
| Photo Ornaments | 50 |
| Christmas Balls | 400 |
| Fairy Lights | 400 |
| Gift Boxes | 300 |
| Background Stars | 5,000 |
| Source Files | 24 |
| Lines of Code | ~1,343 |

## 🧪 Testing

```bash
# Lint
pnpm lint

# Type check
pnpm build
```

## 🤝 Contributing

Contributions welcome! Vui lòng đọc [Development Guide](docs/DEVELOPMENT.md) trước khi contribute.

### Guidelines
1. Fork repo
2. Tạo branch: `feature/your-feature`
3. Follow code style trong [Development Guide](docs/DEVELOPMENT.md)
4. Test kỹ
5. Commit với message rõ ràng
6. Tạo Pull Request

## 📝 License

MIT License - xem file [LICENSE](LICENSE)

## 🙏 Credits

- [Three.js](https://threejs.org/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [MediaPipe](https://developers.google.com/mediapipe)
- [@react-three/drei](https://github.com/pmndrs/drei)

## 📞 Support

Có vấn đề? [Tạo issue](../../issues)

---

**Made with ❤️ and 🎄 | Merry Christmas! 🎅**
