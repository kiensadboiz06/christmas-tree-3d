# Component Documentation

## 3D Components

### Foliage Component

**Mục đích**: Render hệ thống particle cho lá cây thông

**Props**:
- `state: SceneState` - Trạng thái CHAOS hoặc FORMED

**Hoạt động**:
1. Tạo 25,000 particles với vị trí ban đầu ngẫu nhiên trong hình cầu
2. Mỗi particle có target position trên hình nón (cây thông)
3. Sử dụng custom shader để animate từ CHAOS → FORMED
4. Shader tạo gradient màu từ gốc (tối) đến đỉnh (sáng)

**Performance Optimization**:
- Sử dụng `useMemo` để cache positions
- Shader chạy trên GPU
- `depthWrite={false}` để tăng performance

---

### PhotoOrnaments Component

**Mục đích**: Hiển thị ảnh Polaroid hai mặt trên cây

**Props**:
- `state: SceneState` - Trạng thái CHAOS hoặc FORMED

**Đặc điểm**:
- Load 32 ảnh từ `/photos/` (top.jpg + 1-31.jpg)
- Mỗi ảnh có viền Polaroid với màu ngẫu nhiên
- Hai mặt: mặt trước có ảnh, mặt sau trống
- Wobble effect khi ở trạng thái FORMED
- Không xuất hiện ở 25% đỉnh cây (chỉ ở thân và gốc)

**Phân bố**:
- 20% ảnh lớn (scale 2.2)
- 80% ảnh nhỏ (scale 0.8-1.4)

---

### ChristmasElements Component

**Mục đích**: Quả cầu trang trí với hiệu ứng lấp lánh

**Props**:
- `state: SceneState` - Trạng thái CHAOS hoặc FORMED

**Đặc điểm**:
- 400 quả cầu với màu sắc khác nhau (đỏ, trắng, vàng, xanh)
- 25% quả cầu có sparkle effect (lấp lánh vàng)
- Sparkle cycle: lấp lánh 1.5-3.5s, nghỉ 3-8s
- Material: metallic với roughness thấp

**Sparkle Effect**:
```typescript
// Tăng emissive intensity và scale
material.emissiveIntensity = 1.0 + sparkle * 3.0;
const sparkleScale = 1.0 + sparkle * 0.3;
```

---

### FairyLights Component

**Mục đích**: Đèn LED nhấp nháy trên cây

**Props**:
- `state: SceneState` - Trạng thái CHAOS hoặc FORMED

**Đặc điểm**:
- 400 đèn với 3 màu: đỏ, xanh lá, vàng
- Mỗi đèn có tốc độ nhấp nháy riêng (2-5 Hz)
- Sử dụng `sin()` để tạo fade in/out mượt
- `toneMapped={false}` để màu sáng hơn

**Animation**:
```typescript
const intensity = (Math.sin(time * speed + offset) + 1) / 2;
material.emissiveIntensity = 3 + intensity * 4; // 3-7
```

---

### GiftBoxes Component

**Mục đích**: Hộp quà có nơ trang trí

**Props**:
- `state: SceneState` - Trạng thái CHAOS hoặc FORMED

**Cấu trúc**:
- Hộp chính: BoxGeometry
- Ruy băng dọc và ngang: màu vàng metallic
- Nơ 3 phần: 2 vòng + 1 nút giữa
- Float effect khi FORMED

**Tối ưu**:
- Reuse ribbon material cho tất cả ruy băng
- Geometry đơn giản (box) thay vì complex shapes

---

### TopStar Component

**Mục đích**: Ngôi sao vàng trên đỉnh cây

**Props**:
- `state: SceneState` - Trạng thái CHAOS hoặc FORMED

**Đặc điểm**:
- Hình ngôi sao 5 cánh 3D (ExtrudeGeometry)
- Vật liệu vàng metallic với emissive
- Tự xoay quanh trục Y
- Float effect từ `@react-three/drei`
- Scale từ 0 → 1 khi chuyển sang FORMED

---

### ExperienceLights Component

**Mục đích**: Quản lý camera, lights và post-processing

**Bao gồm**:
1. **Camera**: PerspectiveCamera (FOV 50°)
2. **Controls**: OrbitControls với auto-rotate
3. **Environment**: 
   - Stars background (5000 stars)
   - HDR environment map (city preset)
4. **Lights**:
   - 2x Ambient lights (tổng chiếu sáng)
   - 1x Spot light (cast shadow)
   - 3x Point lights (accent lighting)
5. **Effects**:
   - Bloom: Làm sáng emissive materials
   - Vignette: Làm tối góc màn hình
   - Sparkles: Hiệu ứng lấp lánh không gian

---

### Experience Component

**Mục đích**: Orchestrator cho toàn bộ scene 3D

**Trách nhiệm**:
- Kết hợp tất cả 3D components
- Wrap Suspense cho lazy loading textures
- Đặt position chung cho group (-2 trên trục Y)

---

## UI Components

### DebugButton

**Mục đích**: Toggle debug mode để xem camera và hand tracking

**Props**:
- `debugMode: boolean`
- `onClick: () => void`

**Styling**: Màu vàng khi active, trong suốt khi inactive

---

### ActionButton

**Mục đích**: Chuyển đổi giữa CHAOS và FORMED

**Props**:
- `sceneState: SceneState`
- `onClick: () => void`

**Text**: 
- "Assemble Tree" khi CHAOS
- "Disperse" khi FORMED

---

### StatusText

**Mục đích**: Hiển thị trạng thái AI gesture recognition

**Props**:
- `aiStatus: string`

**Màu sắc**:
- Đỏ khi có ERROR
- Vàng mờ khi bình thường

---

## Gesture Controller

**Mục đích**: Nhận diện cử chỉ tay bằng MediaPipe

**Props**:
- `onGesture: (gesture: SceneState) => void`
- `onStatus: (status: string) => void`
- `debugMode: boolean`

**Cử chỉ được nhận diện**:
- **Open Palm** → CHAOS (tay mở)
- **Closed Fist** → FORMED (nắm đấm)

**Workflow**:
1. Tải model MediaPipe từ CDN
2. Xin quyền truy cập camera
3. Chạy recognition loop với `requestAnimationFrame`
4. Vẽ hand landmarks khi debug mode
5. Gọi callback `onGesture` khi detect (score > 0.4)

---

## Custom Hooks

### useSceneState

**Mục đích**: Quản lý state của scene

**Returns**:
```typescript
{
  sceneState: SceneState,
  setSceneState: (state: SceneState) => void,
  toggleSceneState: () => void
}
```

---

### useDebugMode

**Mục đích**: Quản lý debug mode

**Returns**:
```typescript
{
  debugMode: boolean,
  toggleDebugMode: () => void
}
```

---

### useAIStatus

**Mục đích**: Quản lý status message từ AI

**Returns**:
```typescript
{
  aiStatus: string,
  setAiStatus: (status: string) => void
}
```

---

## Shader Materials

### FoliageMaterial

**Mục đích**: Custom shader cho particles lá cây

**Uniforms**:
- `uTime`: Elapsed time cho animation
- `uColor`: Base color (emerald green)
- `uProgress`: 0-1, transition từ CHAOS → FORMED

**Attributes**:
- `aTargetPos`: Target position trên cây
- `aRandom`: Random value cho mỗi particle

**Features**:
- Cubic easing cho smooth transition
- Noise animation khi ở FORMED
- Gradient màu từ gốc (tối) đến đỉnh (sáng)
- Point size based on distance

