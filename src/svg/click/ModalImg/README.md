# ModalImg

热区点击弹出图片（微信原生预览）。在背景图上放 N 个热区 `<img>`，点击触发微信原生图片查看器。

## 原代码结构树（普拉达参考）

```
<section overflow:hidden>                                              ← 最外层容器
│
├── [section ×8] label="404.tech_svg" height:0 overflow:visible pe:none   ← 零高视差层
│   ├── <svg viewBox="0 0 889 H" display:inline />                          ← 占位定高 SVG（H 决定该层 Y 偏移）
│   └── <section label="404.tech_svg_slide" display:flex overflow-x:auto pe:none>
│       └── <section flex:0 0 100% display:flex overflow:hidden>
│           ├── <section flex:0 0 X%>                                       ← 左留白（错位偏移）
│           │     <svg viewBox="0 0 404 404" />
│           │   </section>
│           └── <section width:Y% height:40404px>                           ← 图片容器（超高 + scale 压缩）
│                 <img class="rich_pages wxw-img"                           ← ★微信靠此 class 识别可预览图片
│                   data-src="..." data-ratio="5.66" data-w="800"           ← ★微信算高度/缩放用
│                   data-type="jpeg"
│                   style="pointer-events: painted;                         ← 只点可见区才触发预览
│                          transform-origin: center top;
│                          transform: scale(1, scaleY);                     ← 纵向压缩（WeChat 长图技巧）
│                          height: auto !important;" />
│             </section>
│
├── <svg bg viewBox="0 0 889 854" background-size:cover pe:none />          ← 背景大图（散在 section 之间）
├── <svg bg viewBox="0 0 889 828" background-size:cover />                  ← 背景大图
└── <svg bg viewBox="0 0 889 246" background-size:cover />                  ← 背景大图
```

## 关键发现

1. **childItems 个数 = `<img>` 个数**：原代码 8 个 `404.tech_svg` section → 8 个 `<img>`，1:1。
2. **`class="rich_pages wxw-img"`** 是微信识别可预览图片的关键——没有它点击不弹出原生预览。
3. **`data-src` / `data-ratio` / `data-w` / `data-type`** 是微信算图片高度/缩放的必需属性。
4. **`pointer-events: painted`** = 只点击图片可见（非透明）区域才触发。
5. **`transform: scale(1, scaleY)` + `height:40404px`** = WeChat 长图压缩技巧（绕过微信图片压缩限制）。
6. **占位 SVG viewBox 高 H**（324/621/1/225/1/1/598）= 决定每个热区的纵向 Y 偏移。
7. **左留白 `flex:0 0 X%`** = 图片水平错位偏移。
8. **背景大图** 散在 section 之间（不是一层），形成视差叠层。

## 最小用法

```tsx
import { ModalImg } from 'expub-tool/svg'

<ModalImg
  canvasSize={{ w: 1080, h: 1920 }}
  canvasBg={{ url: 'https://...bg.png' }}
  childItems={[
    { hotArea: { x: 100, y: 200, w: 300, h: 400 }, imgUrl: 'https://...img1.jpg' },
    { hotArea: { x: 500, y: 600, w: 400, h: 500 }, imgUrl: 'https://...img2.jpg' },
  ]}
/>
```

## Props

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `canvasSize` | `{ w: number; h: number }` | — | viewBox 尺寸（必填） |
| `canvasBg` | `I_CanvasBg` | — | 画布背景 |
| `childItems` | `I_ModalImgChildItem[]` | — | 热区 + 图片列表（必填） |
| `spacing` | `T_SpacingProps` | 全 0 | 外间距 |

### I_ModalImgChildItem

| 字段 | 类型 | 说明 |
|---|---|---|
| `hotArea` | `{ x, y, w, h }` | 热区位置和尺寸（viewBox 单位） |
| `imgUrl` | `string` | 点击后微信原生预览的图片 URL |

## 注意事项

- `<img>` 必须带 `class="rich_pages wxw-img"`（微信识别可预览图片的关键）。
- `data-src` / `data-ratio` / `data-w` / `data-type` 也需带上（微信算高度/缩放）。
- 组件不处理弹出/关闭/动画——那是微信原生行为。
