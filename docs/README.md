# Christmas Tree 3D - Documentation

Chào mừng đến với documentation của dự án Christmas Tree 3D!

## 📖 Mục lục

### 1. [Project Structure](PROJECT_STRUCTURE.md)
Tổng quan về cấu trúc dự án sau refactoring, bao gồm:
- Cấu trúc thư mục chi tiết
- Thống kê và metrics
- Responsibilities của từng folder
- Architectural patterns

### 2. [Architecture](ARCHITECTURE.md)
Giải thích kiến trúc và nguyên tắc thiết kế:
- Clean Architecture
- SOLID Principles
- Separation of Concerns
- Data Flow
- Best Practices

### 3. [Components](COMPONENTS.md)
Chi tiết hoạt động của từng component:
- 3D Components (Foliage, PhotoOrnaments, ChristmasElements, ...)
- UI Components (Buttons, StatusText)
- GestureController
- Custom Hooks

### 4. [Development Guide](DEVELOPMENT.md)
Hướng dẫn phát triển:
- Setup môi trường
- Workflow phát triển
- Code style guidelines
- Performance tips
- Debugging
- Testing
- Deployment

### 5. [Refactoring Summary](REFACTORING_SUMMARY.md)
Tóm tắt quá trình refactoring:
- Before/After comparison
- Files được tạo mới
- Metrics và improvements
- SOLID principles applied
- Benefits

## 🚀 Quick Start

### Cài đặt
```bash
pnpm install
```

### Development
```bash
pnpm dev
```

### Build
```bash
pnpm build
```

## 📚 Tài liệu theo vai trò

### Cho Developers mới
Đọc theo thứ tự:
1. **PROJECT_STRUCTURE.md** - Hiểu tổng quan
2. **COMPONENTS.md** - Hiểu từng component
3. **DEVELOPMENT.md** - Bắt đầu code

### Cho Architects
Đọc:
1. **ARCHITECTURE.md** - Hiểu design patterns
2. **REFACTORING_SUMMARY.md** - Hiểu quyết định thiết kế

### Cho Maintainers
Reference:
- **DEVELOPMENT.md** - Guidelines và best practices
- **COMPONENTS.md** - Chi tiết implementation

## 🎯 Key Concepts

### Kiến trúc
- **Clean Architecture**: Separation of concerns rõ ràng
- **SOLID**: Mỗi component tuân theo SOLID principles
- **Modular**: 28 files nhỏ thay vì 1 file lớn

### Components
- **3D Components**: Render Three.js objects
- **UI Components**: React UI elements
- **Hooks**: State management
- **Utils**: Pure functions

### Data Flow
```
User Input → Hooks → State → Props → Components → Render
```

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| Total Files | 28 |
| Source Lines | 1,343 |
| Doc Lines | 1,067 |
| Components | 13 |
| Custom Hooks | 3 |
| Utils | 3 |

## 🛠️ Tech Stack

- **React 19** - UI framework
- **Three.js** - 3D rendering
- **React Three Fiber** - React renderer for Three.js
- **@react-three/drei** - Three.js helpers
- **MediaPipe** - Gesture recognition
- **TypeScript** - Type safety
- **Vite** - Build tool

## 🎨 Features

- ✨ Interactive 3D Christmas tree
- 🖼️ Polaroid photo ornaments
- 🎁 3D gift boxes with ribbons
- 💡 Animated fairy lights
- 🌟 Golden star on top
- 👋 Hand gesture control
- 🎨 Post-processing effects

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please read:
1. [Architecture](ARCHITECTURE.md) để hiểu design
2. [Development Guide](DEVELOPMENT.md) để follow guidelines
3. Tạo PR với mô tả rõ ràng

## 📬 Contact

Có câu hỏi? Tạo issue hoặc liên hệ maintainers.

---

**Happy Coding! 🎄✨**

