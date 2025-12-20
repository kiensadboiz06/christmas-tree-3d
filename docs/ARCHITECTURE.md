# Kiến trúc dự án Christmas Tree 3D

## Tổng quan

Dự án được tổ chức theo kiến trúc **Clean Architecture** với nguyên tắc **SOLID**, đảm bảo code dễ bảo trì, mở rộng và test.

## Cấu trúc thư mục

```
src/
├── components/          # React Components
│   ├── 3d/             # 3D Scene Components
│   ├── UI/             # UI Components  
│   └── GestureController.tsx
├── constants/          # Configuration & Constants
├── hooks/              # Custom React Hooks
├── shaders/            # GLSL Shader Materials
├── types/              # TypeScript Type Definitions
├── utils/              # Utility Functions
├── App.tsx             # Main Application Component
└── main.tsx            # Entry Point
```

## Nguyên tắc thiết kế

### 1. Single Responsibility Principle (SRP)

Mỗi component/module chỉ có một lý do duy nhất để thay đổi:

- **Foliage.tsx**: Chỉ quản lý hạt lá cây
- **PhotoOrnaments.tsx**: Chỉ quản lý ảnh trang trí
- **GestureController.tsx**: Chỉ xử lý nhận diện cử chỉ tay
- **useSceneState.ts**: Chỉ quản lý state của scene

### 2. Open/Closed Principle (OCP)

Code mở cho việc mở rộng, đóng cho việc sửa đổi:

- Thêm 3D component mới không cần sửa `Experience.tsx`
- Thêm UI button mới không cần sửa `App.tsx`
- Thêm utility function mới không ảnh hưởng code cũ

### 3. Dependency Inversion Principle (DIP)

Phụ thuộc vào abstraction (types/interfaces), không phụ thuộc vào implementation:

```typescript
// ✅ Good: Component nhận props theo interface
interface FoliageProps {
  state: SceneState;
}

export const Foliage = ({ state }: FoliageProps) => {
  // Implementation
};
```

### 4. Separation of Concerns

Tách biệt các mối quan tâm:

- **Presentation Layer**: Components (UI + 3D)
- **Business Logic**: Hooks + Utils
- **Configuration**: Constants
- **Types**: Type definitions
- **Rendering**: Shaders

## Chi tiết từng layer

### Components Layer

#### 3D Components (`components/3d/`)

Các component Three.js thuần túy, không chứa business logic:

- **Foliage**: Particle system cho lá cây
- **PhotoOrnaments**: Mesh với texture cho ảnh
- **ChristmasElements**: Quả cầu trang trí với sparkle effect
- **FairyLights**: Đèn LED nhấp nháy
- **GiftBoxes**: Hộp quà 3D
- **TopStar**: Ngôi sao trên đỉnh
- **ExperienceLights**: Camera, lights và post-processing
- **Experience**: Orchestrator cho toàn bộ scene

#### UI Components (`components/UI/`)

React components cho giao diện người dùng:

- **Buttons**: Debug button, Action button
- **StatusText**: Hiển thị trạng thái AI
- **styles**: Centralized styling

### Hooks Layer (`hooks/`)

Custom hooks để tái sử dụng logic:

- **useSceneState**: Quản lý state CHAOS/FORMED
- **useDebugMode**: Toggle debug mode
- **useAIStatus**: Quản lý status message từ AI

### Constants Layer (`constants/`)

Cấu hình tập trung, dễ điều chỉnh:

```typescript
export const CONFIG = {
  colors: { ... },
  counts: { ... },
  tree: { ... },
  photos: { ... }
};
```

### Utils Layer (`utils/`)

Pure functions, không side effects:

- **getTreePosition()**: Tính vị trí hình nón
- **getSphericalPosition()**: Tính vị trí hình cầu
- **getWeightedTreePosition()**: Phân bố có trọng số

### Shaders Layer (`shaders/`)

GLSL shader materials:

- **FoliageMaterial**: Custom shader cho particle lá cây với gradient và animation

### Types Layer (`types/`)

TypeScript type definitions cho toàn bộ app:

- Interface cho props
- Type cho data structures
- Config types

## Data Flow

```
User Interaction
    ↓
App.tsx (State Management via Hooks)
    ↓
Components (Props)
    ↓
Utils/Constants (Pure Functions/Config)
    ↓
Three.js Rendering
```

## Best Practices được áp dụng

### 1. Type Safety

- Sử dụng TypeScript strict mode
- Type-only imports cho type definitions
- Interface cho tất cả props

### 2. Code Reusability

- Custom hooks cho logic tái sử dụng
- Utility functions cho tính toán chung
- Shared constants cho configuration

### 3. Maintainability

- Tách file nhỏ, mỗi file < 200 lines
- Naming convention rõ ràng
- Comments cho logic phức tạp

### 4. Performance

- `useMemo` cho geometry và materials
- `useRef` cho mutable values
- Tái sử dụng geometries và materials

### 5. Testability

- Pure functions dễ test
- Components nhận props rõ ràng
- Separation of concerns giúp mock dễ dàng

## Mở rộng trong tương lai

### Thêm 3D Component mới

```typescript
// src/components/3d/NewComponent.tsx
export const NewComponent = ({ state }: { state: SceneState }) => {
  // Implementation
};

// Thêm vào Experience.tsx
<NewComponent state={sceneState} />
```

### Thêm Custom Hook

```typescript
// src/hooks/useNewFeature.ts
export const useNewFeature = () => {
  // Implementation
  return { ... };
};
```

### Thêm Utility Function

```typescript
// src/utils/newUtils.ts
export const newUtilFunction = () => {
  // Pure function implementation
};
```

## Kết luận

Kiến trúc này đảm bảo:

- ✅ **Maintainability**: Dễ bảo trì
- ✅ **Scalability**: Dễ mở rộng
- ✅ **Testability**: Dễ test
- ✅ **Readability**: Dễ đọc hiểu
- ✅ **Reusability**: Tái sử dụng code tốt

