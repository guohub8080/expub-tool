# 硬编码 SVG → React 组件 逆向工程流程

本文档描述将硬编码 SVG/HTML 参考代码还原为参数驱动 React 组件的标准流程。
以 `CoverFlow` 系列为参考案例。

## 核心思路

参考代码是**写死数据的最终产物**，组件是**能生成任意参数下同类产物的模板**。
逆向工程的目标：找出参考代码中所有的魔法数字，推导它们背后的计算公式，用 props 替换。

---

## 第一步：读懂参考代码的结构

先不管数字，搞清楚 DOM/SVG 树的层级关系：

- 最外层是什么容器？
- 每一层 `<g>` / `<div>` 的职责是什么？
- 动画加在哪一层？（位移在外层，缩放在内层，还是反过来？）

把层级用注释标出来，例如：

```
<g>                          <!-- 外层：整体平移（轮播驱动） -->
  <g transform="translate(x,y)">  <!-- slot 定位 -->
    <g>                      <!-- 缩放层 -->
      <g>                    <!-- 内容层 -->
        <foreignObject />
        <animateTransform /> <!-- scale 动画 -->
      </g>
      <animateTransform />   <!-- translate 补偿动画 -->
    </g>
  </g>
  <animateTransform />       <!-- 外层平移动画 -->
</g>
```

---

## 第二步：提取魔法数字，推导公式

把参考代码里所有写死的数值列出来，逐一问：**这个数字是怎么来的？**

常见模式：

| 写死的值 | 可能的公式 |
|---|---|
| `translate(350, 0)` | `centerX = (viewBoxW - imageW) / 2` |
| `translate(-150, 0)` | `scaleDx = -imageW * (scale - 1) / 2` |
| `values="1;1.4;1.4;1"` | `initValue`, `fullScale`, timeline 段数 |
| `dur="0.5s"` | `switchDuration` |
| `dur="1s"` | `stayDuration` |
| `repeatCount="3"` | `N`（图片数量） |

验证方法：把公式代入参考代码的具体数值，看是否吻合。

---

## 第三步：识别重复模式 → 循环/函数

参考代码里通常有 N 份几乎相同的结构（N = 图片数量）。
找出它们的差异规律，抽象为循环索引 `i` 的函数。

例如 CoverFlow 的 slot 定位：

```
// 参考代码（N=3，写死）
translate(700, 0)   // slot[0]
translate(350, 0)   // slot[1]  ← 中心
translate(0, 0)     // slot[2]
translate(-350, 0)  // slot[3]

// 推导公式
x = centerX + step - i * step   // step = imageW + gap
```

动画 `values` 的规律同理——找出每个 slot 在哪一段放大、哪一段缩回，抽象为 `buildSlotScale(activeIdx, N, ...)` 函数。

---

## 第四步：确定 props 边界

不是所有魔法数字都要变成 prop，只有**用户合理需要调整**的才暴露：

| 应该是 prop | 应该是内部常量或计算值 |
|---|---|
| `canvasSize`、`itemCanvasSize` | slot 数量（`N + 3`，内部逻辑） |
| `itemGap`、`itemScale` | `scaleDx`、`scaleDy`（由其他 props 推导） |
| `switchDuration`、`stayDuration` | `step = imageW + gap`（推导值） |
| `itemAlign`、`isReversed` | `centerX`、`centerY`（推导值） |

---

## 第五步：验证

用参考代码的原始参数值实例化组件，对比输出的 HTML/SVG 是否与参考一致。

重点检查：
1. 初始帧（`initValue`）是否正确
2. 动画 `values` 序列是否与参考一致
3. 边界情况：N=1、N=2 时是否自动补齐

---

## 第六步：写 README

README 只需包含：
- 一句话描述
- 最小用法示例
- Props 表格
- 注意事项（边界情况）

不需要解释内部计算逻辑——那是代码注释的职责。

---

## 参考案例

- `src/svg/display/CoverFlowX/` — 横向轮播，参考了硬编码的 slot + scale + translate 动画
- `src/svg/display/CoverFlowY/` — 纵向变体，复用 CoverFlowX 的类型和 normalizer
