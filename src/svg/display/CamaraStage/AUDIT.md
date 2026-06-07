# CamaraStage 系统审计文档

## 一、系统目标

在 SVG 中模拟 3D 镜头穿越动画。用户定义虚拟 camera 轨迹和 scene/object 的空间位置，系统在编译阶段采样投影，输出纯静态 SVG + SMIL 动画。

## 二、数据流

```
用户 props
  → normalizer（填充默认值、校验）
  → cameraSampler（解析 camera timeline，按 sampleRate 采样 camera 位置）
  → compiler（对每个 scene 的每个采样帧调用 projector）
    → projector（根据 rz = ez - cz 计算 offset / scale / opacity）
  → SceneGroup（用编译结果生成 SMIL <animate>/<animateTransform>）
  → 输出 SVG
```

## 三、核心概念

### 3.1 坐标系

- **World Space**：统一 Vec3 坐标系，z 轴为深度方向
- **Camera**：只有位置，不旋转，永远朝 `{0,0,1}`
- **rz = ez - cz**：元素相对 camera 的深度
  - rz > 0 = 前方
  - rz < 0 = 后方
  - rz = 0 = 在 camera 平面上

### 3.2 Object 的世界坐标

```
objectWorld = scene.world + object.local
```

### 3.3 投影（当前实现）

**不做连续透视缩放（f/rz）。** 正常时 scale=1，只有穿越档口有 scale burst。

**world 类型**：
- rz > 0：scale=1, opacity=1
- rz ≤ 0：scale=0, opacity=0

**passThrough 类型**：
- rz ≥ 0：scale=1（穿越区内 1→1.5→1）, opacity=1
- -FADE_DISTANCE < rz < 0：opacity 从 0 渐变到 1，scale 有穿越 burst
- rz ≤ -FADE_DISTANCE：scale=0, opacity=0

**屏幕偏移**：
```
screenX = rx * scale
screenY = -ry * scale
```
其中 rx = worldPos.x - cameraPosition.x, ry = worldPos.y - cameraPosition.y

### 3.4 穿越效果参数

- `CROSSING_ZONE = 100`：穿越缩放区半径，|rz| < 此值时 scale 从 1 → 1.5 → 1
- `CROSS_SCALE = 1.5`：穿越点 rz=0 时的 scale 峰值
- `FADE_DISTANCE = 300`：passThrough 从不可见到穿越点的淡入距离

## 四、当前 Playground 测试用例

```typescript
// viewport
{ width: 300, height: 500, f: 300 }

// camera: 从 z=0 后撤到 z=-600，耗时 5s
{
  initial: { x: 0, y: 0, z: 0 },
  timeline: [
    { durationSeconds: 5, toAbs: { x: 0, y: 0, z: -600 } },
  ],
}

// 场景
sceneA: { world: {x:0,y:0,z:0}, kind: "world",
  objects: [{ id:"objA1", local:{x:200,y:0,z:0}, url:... }] }
// objA1 worldPos = (200, 0, 0)

sceneB: { world: {x:0,y:0,z:0}, kind: "passThrough",
  objects: [{ id:"objB1", local:{x:-100,y:0,z:-200}, url:... }] }
// objB1 worldPos = (-100, 0, -200)
```

**预期行为**：
- objA1 在 z=0，camera 从 z=0 开始后撤 → 一开始 rz=0（贴脸），然后 rz 增大，物体始终可见
- objB1 在 z=-200，camera 从 z=0 后撤到 z=-600 → 一开始 rz=-200（后方不可见），camera 到 z≈-200 时穿越，穿越后变为可见

## 五、编译流程（compiler.ts）

1. `resolveCameraTimeline(camera)` → 解析为分段列表 + 总时长
2. 按 `sampleRate`（默认 30fps）均匀采样 camera 位置
3. 对每个 scene，取其第一个 object 的 worldPos 作为锚点
4. 对每个采样帧调用 `projectToScreen()` 得到 `{screenX, screenY, scale, opacity}`
5. 首帧作为 `initTranslate / initScale / initOpacity`
6. 后续帧转为 SMIL keyframes 数组

**采样数**：`Math.ceil(totalDuration * sampleRate) + 1`，5s × 30fps = 151 帧

## 六、SVG 结构

```xml
<svg viewBox="0 0 300 500">
  <g visibility="hidden">                          <!-- 初始隐藏防闪烁 -->
    <set visibility="visible" begin="0.01s"/>
    <g transform="translate(150, 250)">            <!-- viewport 中心 -->
      <g data-scene="sceneA">
        <g>                                         <!-- translate 层 -->
          <animateTransform type="translate"
            values="..." keyTimes="..." keySplines="..."
            dur="5s" fill="freeze" repeatCount="1"/>
          <g>                                       <!-- scale 层 -->
            <animateTransform type="scale"
              values="..." keyTimes="..." keySplines="..."
              dur="5s" fill="freeze" repeatCount="1"/>
            <g>                                     <!-- opacity 层 -->
              <animate attributeName="opacity"
                values="..." keyTimes="..." keySplines="..."
                dur="5s" fill="freeze" repeatCount="1"/>
              <g>                                   <!-- object 内容 -->
                <g transform="translate(-150, -250)">
                  <foreignObject width="301" height="501">
                    <svg ... style="background-image:url(...)"/>
                  </foreignObject>
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
      <!-- sceneB 结构同上 -->
    </g>
  </g>
</svg>
```

## 七、已知问题 / 审计关注点

1. **scale=1 导致 x 偏移无透视效果**：objA1 在 x=200，当 scale=1 时 screenX=200（偏右 200px），但没有远近缩放。这是当前设计的取舍。

2. **穿越 burst 效果是否合理**：当前用线性插值 `1 + 0.5 * (1 - |rz|/100)`，在 rz=0 时 scale=1.5，rz=±100 时 scale=1。是否应该用其他缓动？

3. **world 类型在 rz≈0 时的行为**：objA1 在 z=0，camera 初始 z=0，rz=0。按当前逻辑 rz≤0 时 scale=0,opacity=0。一旦 camera 移动到 z=-1，rz=1，突然 scale=1,opacity=1。从不可见到可见的切换是瞬间的。

4. **FADE_DISTANCE 和 CROSSING_ZONE 的值是否合适**：FADE_DISTANCE=300 意味着 passThrough 元素在 rz=-300 时才开始淡入。对于 objB1 在 z=-200 的场景，camera 从 z=0 到 z=-600，当 camera 到 z≈100 时（rz=-300）objB1 开始淡入，到 z=-200（rz=0）时完全可见。这个过渡是否太长？

5. **采样密度**：151 帧生成 150 个 keyframe。每个 SMIL animate 的 values 字符串包含 151 个值。对于微信 WebView 的性能是否有问题？

6. **SMIL loopCount=1 + fill=freeze**：动画播放一次后冻结在最后一帧。这意味着动画结束后不会再播放，适合一次性镜头运动。

## 八、文件清单

```
src/svg/display/CamaraStage/
├── types.ts                          ← 类型定义
├── utils/normalizer.ts               ← props 标准化
├── core/
│   ├── cameraSampler.ts              ← camera timeline 采样
│   ├── projector.ts                  ← 空间投影（本文件是核心）
│   ├── crossingDetector.ts           ← 穿越事件检测
│   └── compiler.ts                   ← 采样→SMIL 编译
├── components/SceneGroup.tsx          ← SVG 渲染
└── index.tsx                          ← 主组件
```
