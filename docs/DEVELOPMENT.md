# Development Guide

## Cài đặt môi trường

### Yêu cầu

- Node.js >= 18
- pnpm >= 8

### Cài đặt dependencies

```bash
pnpm install
```

## Scripts

```bash
# Development server với hot reload
pnpm dev

# Build production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint
```

## Workflow phát triển

### 1. Thêm 3D Component mới

**Bước 1**: Tạo file component

```typescript
// src/components/3d/MyNewComponent.tsx
import type { SceneState } from '../../types';

interface MyNewComponentProps {
  state: SceneState;
}

export const MyNewComponent = ({ state }: MyNewComponentProps) => {
  // Your implementation
  return (
    <mesh>
      {/* Your geometry and material */}
    </mesh>
  );
};
```

**Bước 2**: Export trong index

```typescript
// src/components/3d/index.ts
export { MyNewComponent } from './MyNewComponent';
```

**Bước 3**: Thêm vào Experience

```typescript
// src/components/3d/Experience.tsx
import { MyNewComponent } from './MyNewComponent';

export const Experience = ({ sceneState }: ExperienceProps) => {
  return (
    <>
      {/* ... existing components ... */}
      <MyNewComponent state={sceneState} />
    </>
  );
};
```

---

### 2. Thêm Configuration mới

```typescript
// src/constants/config.ts
export const CONFIG = {
  // ... existing config ...
  myNewFeature: {
    count: 100,
    size: 1.5,
    color: '#FF0000'
  }
};
```

Cập nhật type:

```typescript
// src/types/index.ts
export interface Config {
  // ... existing types ...
  myNewFeature: {
    count: number;
    size: number;
    color: string;
  };
}
```

---

### 3. Thêm Custom Hook

```typescript
// src/hooks/useMyFeature.ts
import { useState, useEffect } from 'react';

export const useMyFeature = () => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    // Your logic
  }, []);

  return {
    value,
    setValue
  };
};
```

Export trong index:

```typescript
// src/hooks/index.ts
export { useMyFeature } from './useMyFeature';
```

---

### 4. Thêm Utility Function

```typescript
// src/utils/myUtils.ts
import * as THREE from 'three';

/**
 * Description of what this function does
 * @param param1 - Description
 * @returns Description
 */
export const myUtilFunction = (param1: number): THREE.Vector3 => {
  // Pure function implementation
  return new THREE.Vector3(param1, 0, 0);
};
```

---

### 5. Thêm Type Definition

```typescript
// src/types/index.ts
export interface MyNewType {
  id: string;
  value: number;
  position: THREE.Vector3;
}
```

---

## Code Style Guidelines

### TypeScript

1. **Luôn define types**:
```typescript
// ✅ Good
interface Props {
  value: number;
}

// ❌ Bad
const Component = ({ value }: any) => { ... }
```

2. **Sử dụng type-only imports**:
```typescript
// ✅ Good
import type { SceneState } from '../types';

// ❌ Bad (nếu chỉ dùng cho type)
import { SceneState } from '../types';
```

3. **Prefer interface over type**:
```typescript
// ✅ Good
interface User {
  name: string;
}

// ❌ Less preferred
type User = {
  name: string;
}
```

### React Components

1. **Function components với named exports**:
```typescript
// ✅ Good
export const MyComponent = ({ prop }: Props) => {
  return <div>{prop}</div>;
};

// ❌ Bad
export default function MyComponent() { ... }
```

2. **Props interface trước component**:
```typescript
interface MyComponentProps {
  value: number;
  onAction: () => void;
}

export const MyComponent = ({ value, onAction }: MyComponentProps) => {
  // ...
};
```

3. **Sử dụng useMemo cho expensive computations**:
```typescript
const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
```

4. **Sử dụng useRef cho mutable values**:
```typescript
const groupRef = useRef<THREE.Group>(null);
```

### Three.js Best Practices

1. **Reuse geometries và materials**:
```typescript
// ✅ Good
const geometry = useMemo(() => new THREE.BoxGeometry(), []);
const material = useMemo(() => new THREE.MeshStandardMaterial(), []);

return (
  <group>
    {items.map(item => (
      <mesh key={item.id} geometry={geometry} material={material} />
    ))}
  </group>
);
```

2. **Dispose khi unmount** (nếu cần):
```typescript
useEffect(() => {
  return () => {
    geometry.dispose();
    material.dispose();
  };
}, []);
```

3. **Sử dụng instancing cho nhiều objects giống nhau** (nếu > 1000):
```typescript
<instancedMesh args={[geometry, material, count]}>
  <bufferGeometry>
    {/* attributes */}
  </bufferGeometry>
</instancedMesh>
```

---

## Performance Tips

### 1. Giảm draw calls

- Merge geometries cùng material
- Sử dụng instancing
- Frustum culling tự động trong Three.js

### 2. Optimize textures

- Resize ảnh về kích thước phù hợp (power of 2)
- Sử dụng compression (JPG cho photos, PNG cho transparency)
- Preload textures với Suspense

### 3. Optimize animations

- Sử dụng GPU (shaders) thay vì CPU khi có thể
- Limit số objects có animation phức tạp
- Sử dụng `lerp` thay vì `set` cho smooth transitions

### 4. Memory management

- Dispose geometries và materials khi không dùng
- Limit số particles (hiện tại: 25,000 là reasonable)
- Reuse objects thay vì tạo mới mỗi frame

---

## Debugging

### Debug Mode

Bật debug mode trong UI để xem:
- Camera feed từ MediaPipe
- Hand landmarks visualization
- Gesture detection status

### Three.js Inspector

Cài đặt extension:
- Chrome: [Three.js Inspector](https://chrome.google.com/webstore/detail/threejs-inspector)

### Performance Monitor

```typescript
// Thêm vào Experience.tsx
import { Stats } from '@react-three/drei';

export const Experience = () => {
  return (
    <>
      <Stats />
      {/* ... */}
    </>
  );
};
```

### Console Logging

```typescript
// Log trong useFrame để debug animation
useFrame(() => {
  console.log('Current position:', mesh.position);
});
```

---

## Testing

### Component Testing (Suggestion)

```typescript
// Có thể thêm testing với @testing-library/react
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders without crashing', () => {
    render(
      <Canvas>
        <MyComponent state="FORMED" />
      </Canvas>
    );
  });
});
```

### Utility Function Testing

```typescript
// Pure functions dễ test
import { getTreePosition } from './treePositions';

describe('getTreePosition', () => {
  it('returns valid position', () => {
    const [x, y, z] = getTreePosition();
    expect(typeof x).toBe('number');
    expect(typeof y).toBe('number');
    expect(typeof z).toBe('number');
  });
});
```

---

## Common Issues & Solutions

### Issue: Build warnings về chunk size

**Solution**: Code splitting với dynamic imports

```typescript
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

### Issue: Textures không load

**Solution**: Kiểm tra path và wrap trong Suspense

```typescript
<Suspense fallback={null}>
  <ComponentWithTextures />
</Suspense>
```

### Issue: Performance chậm

**Solution**: 
1. Giảm particle count trong CONFIG
2. Sử dụng instancing
3. Kiểm tra không có memory leak

### Issue: MediaPipe không hoạt động

**Solution**:
1. Kiểm tra HTTPS (MediaPipe yêu cầu secure context)
2. Check camera permissions
3. Verify model CDN accessible

---

## Git Workflow

### Branch naming

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation

### Commit messages

```
feat: add new gift box animation
fix: correct photo ornament positioning
refactor: extract shader material to separate file
docs: update architecture documentation
```

---

## Deployment

### Build for production

```bash
pnpm build
```

### Deploy to static hosting

Build output trong `dist/` có thể deploy lên:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting

### Environment variables (if needed)

Create `.env`:
```
VITE_API_URL=https://api.example.com
```

Access trong code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [@react-three/drei](https://github.com/pmndrs/drei)
- [MediaPipe](https://developers.google.com/mediapipe)
- [GLSL Shader Reference](https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language)

