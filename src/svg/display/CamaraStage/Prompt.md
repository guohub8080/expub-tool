- - 你现在是一个资深的图形引擎 / SVG 编译器设计师。
    我要你帮我设计一套用于微信公众号 SVG 的**导演式镜头动画系统**。请严格基于下面这套思路工作，不要擅自改成普通平面补间系统，也不要偷换成运行时动画框架。

    ## 一、项目目标

    我要做的是一种**导演式 camera 探索 / 穿越 / 后撤 / 推进**的 SVG 动画体验。它的核心不是单个元素自己做小动画，而是：

    - 在开发阶段建立一个虚拟空间
    - 在这个空间里定义 `camera`、`scene`、`object` 的位置和时间关系
    - 再把这些关系在 build 阶段编译成纯静态 SVG/JSX + SMIL
    - 最终产物在公众号里直接播放，不依赖运行时 JS

    也就是说：

    - 开发时：允许存在虚拟 camera、虚拟 z 空间、采样器、编译器
    - 输出时：只有单个静态 `<svg>`，里面是多个 `<g>` 和 SMIL

    这里特别强调：

    “后撤”只是一个典型用例，不是系统唯一目标。
    这个系统必须支持：

    - camera 向 z 负方向后撤
    - camera 向 z 正方向推进
    - camera 在 timeline 中停顿、折返、再次推进
    - camera 对不同 scene 发生任意次数的穿入 / 穿出
    - camera 作为一种持续探索空间的主视角，而不是固定的退出式镜头

    换句话说，这个系统不是“后撤动画模板”，而是一个**以 camera 为主骨架的空间探索编译系统**。

    ## 二、平台限制

    这是给微信公众号 SVG 用的，所以必须遵守以下原则：

    - 不依赖运行时 JS
    - 不依赖外部 CSS
    - 不使用嵌套 `<svg>`
    - 尽量避免复杂的 ID 引用关系
    - 最终结构必须是：单顶层 `<svg>` + 多层 `<g>`
    - 动画使用 SMIL：`<animate>` / `<animateTransform>`

    补充理解：

    - `<g>` 是主要的空间分层容器，对 `<g>` 的 `transform` 会作用到其子元素。
    - SVG 的叠放顺序主要由文档顺序控制。
    - `<animate>` / `<animateTransform>` 可以直接绑定在元素或 `<g>` 上。

    ## 三、根本原则

    请始终基于这个原则思考：

    **SVG 只是播放层，不是空间层；空间存在于编译器里。**

    也就是说，最终 SVG 并不真的懂 3D。
    3D / 空间 / camera / 景深 / 穿越，都是我在开发和编译阶段虚拟出来的，最后只落成 2D 的 `transform`、`opacity`、`clip` 等结果。

    因此：

    - camera 不输出成 SVG DOM 节点
    - z 空间不在 SVG 里真实存在
    - scene 的前后关系也不是 DOM 概念，而是编译时的相对求值结果
    - 最终 SVG 只负责按编译好的时间轨迹回放

    ## 四、空间模型

    ## 1. World Space

    整个系统有一个统一的虚拟世界坐标系：

    ```
    ts
    type Vec3 = { x: number; y: number; z: number }
    ```

    坐标语义固定为：

    - `x`：向右为正
    - `y`：向上为正
    - `z`：沿镜头方向的深度坐标

    这里特别强调：

    观众就是 camera。
    所以 z 不是“相对观众定义”的抽象远近，而是 world space 里的一个深度轴。真正决定“元素在 camera 前方还是后方”的，不是 z 本身，而是它和 `camera.z` 的相对关系。

    因此必须按下面的规则理解：

    - 当 `ez > cz` 时，元素在 camera 前方
    - 当 `ez = cz` 时，元素在 camera 平面上
    - 当 `ez < cz` 时，元素在 camera 后方

    例如，当 `camera.z = 0` 时：

    - `(0, 0, 300)` 在 camera 前方
    - `(0, 0, -300)` 在 camera 后方

    但如果 camera 变成 `z = -600`，那么 `(0,0,-300)` 反而会跑到 camera 前方。
    所以前后关系永远由 `ez - cz` 决定，而不是由绝对 z 单独决定。

    ## 2. Camera

    camera 也处在同一个 world space 中，并且**永远朝向 `{ x: 0, y: 0, z: 1 }` 的方向**。第一版系统中，camera **不参与旋转**，只处理位置变化，尤其是 z 向运动。

    ```
    ts
    camera: { x, y, z }
    ```

    camera 不是最终 SVG DOM 里的一个节点。
    它只参与编译计算，用来解每一帧所有 scene 和 object 的相对位置。

    这里再补充一个重要要求：

    camera 不是只能“后撤”的。它必须支持在全局 timeline 上做任意路径式的 z 向运动，包括：

    - 推进
    - 后撤
    - 停顿
    - 折返
    - 二次靠近某个 scene
    - 穿过一个 scene 后又从另一侧重新接近它

    因此系统必须支持：

    - 同一个 scene 在一条 timeline 中发生多次前后关系切换
    - 同一个 scene 在一条 timeline 中发生多次 crossing event

    ## 3. Relative Space

    每一帧都要先把元素转换到“相对 camera 的空间”：

    ```
    ts
    rx = ex - cx
    ry = ey - cy
    rz = ez - cz
    ```

    其中：

    - `e` = element 的世界坐标
    - `c` = camera 的世界坐标
    - `r` = 相对 camera 的坐标

    并且必须按以下语义理解：

    - `rz > 0`：元素在 camera 前方，可以进入正常投影
    - `rz = 0`：元素就在 camera 平面上，是危险点，需要裁剪或特殊处理
    - `rz < 0`：元素在 camera 后方，不能直接按普通前景透视处理，需要走 `passThrough / crossing` 特殊规则

    还要强调：

    scene 是否“在前景”不是静态属性，而是某一时刻 `rz` 的状态。
    因此一个 scene 在 timeline 上可以经历：

    - behind
    - approach
    - crossing
    - front
    - 以及再次 crossing / behind

    也就是说：

    **scene 的前后身份是动态 phase，不是静态分类。**

    ## 4. Screen Space

    将 relative space 投影为最终屏幕空间。
    设：

    ```
    ts
    viewport = { width: 300, height: 500 }
    center = { x: 150, y: 250 }
    f = 300
    ```

    采用简化透视模型：

    ```
    ts
    scale = f / rz
    screenX = centerX + rx * scale
    screenY = centerY - ry * scale
    ```

    因此：

    - camera 只是计算参考系
    - 所有 scene / object 最终都会被解成 2D 的 `screen position + scale + opacity`
    - 最后写回 SVG 的 `<g>` 的 `transform / opacity` 动画

    但这里必须补充：

    当 `rz` 接近 0 或跨过 0 时，不能直接机械使用 `f / rz`，否则会出现奇点或负比例。
    所以系统必须定义一套 `crossing window / passThrough window` 的特殊规则，在编译期把这一段危险区间映射成导演式的 2D 表现。

    ## 5. Projection Calibration

    为了让空间投影具有稳定、可控、可理解的导演语义，系统必须引入一个明确的投影标定参数：

    ```
    ts
    f: number
    ```

    这里的 `f` 不是抽象常量，而是系统的**1x 满屏参考深度**。

    它的语义定义为：

    > 当一个元素与 viewport 的基准设计尺寸一致，并且它位于相对 camera 深度 `rz = f` 的位置时，该元素投影到 screen space 后的 `scale = 1`，也就是它会以 1:1 的比例正好呈现为设计尺寸。

    例如：

    - `viewport = { width: 300, height: 500 }`
    - 一个 image 资源尺寸也是 `300 × 500`
    - `camera = { x: 0, y: 0, z: 0 }`
    - 该 image 位于 `world z = 300`
    - 若设 `f = 300`

    则：

    ```
    ts
    rz = ez - cz = 300
    scale = f / rz = 300 / 300 = 1
    ```

    此时该 image 会刚好满屏。

    因此，`f` 可以理解为：

    > 在 z 方向距离为多少的、与 viewport 基准尺寸一致的元素，会以 `scale = 1` 正好满屏显示。

    换句话说：

    - 若希望 `z = 300` 的基准图层正好满屏，则设 `f = 300`
    - 若希望 `z = 500` 的基准图层正好满屏，则设 `f = 500`

    所以：

    `f` 本质上是系统的**满屏参考深度**，也可以理解为**1x 投影深度锚点**。

    进一步地，若元素尺寸与 viewport 不同，则应按基准尺寸关系决定实际缩放：

    ```
    ts
    projectedScale = (f / rz) * baseFitScale
    ```

    其中：

    - `f / rz` 负责深度透视缩放
    - `baseFitScale` 负责元素原始尺寸与目标设计尺寸之间的基准匹配

    在第一版最小系统中，可以先约定：

    ```
    ts
    baseFitScale = 1
    ```

    即 asset 尺寸与 viewport 设计尺寸一致时：

    ```
    ts
    scale = f / rz
    ```

    还要特别强调：

    `f` 的作用不是直接表示 camera 自身的 z 位置，也不是简单表示“镜头远近”的主观感受。
    `f` 的数学作用，是定义透视投影中的参考深度尺度。

    真正决定某个元素当前投影大小的，不是 `f` 单独一个量，而是：

    ```
    ts
    scale = f / (ez - cz)
    ```

    也就是说：

    - camera 改变 `cz`
    - element 决定 `ez`
    - `f` 决定哪一个相对深度会被解释为 `scale = 1`

    ## 五、Crossing Direction 与可见性规则

    由于 camera 永远朝向 `{0,0,1}` 且第一版系统不考虑旋转，因此 crossing 的方向仅由 `rz = ez - cz` 的符号变化决定。

    ## 1. Forward Cross

    当 `rz` 从负变正时，定义为：

    ```
    ts
    forwardCross
    ```

    含义是：

    camera 从元素后方穿到元素前方。
    这时元素的导演式可见性规则应为：

    - crossing 前：可不可见或弱可见
    - crossing 中：逐步显现
    - crossing 后：进入正常前景逻辑

    最小可用规则：

    ```
    ts
    opacity: 0 -> 1
    ```

    同时必须配合正确的 scale 处理，不能只做淡入。

    ## 2. Backward Cross

    当 `rz` 从正变负时，定义为：

    ```
    ts
    backwardCross
    ```

    含义是：

    camera 从元素前方穿到元素后方。
    这时元素的导演式可见性规则应为：

    - crossing 前：处于前景，可见
    - crossing 中：逐步消失
    - crossing 后：不可见

    最小可用规则：

    ```
    ts
    opacity: 1 -> 0
    ```

    同时必须配合正确的 scale 处理，不能只做淡出。

    ## 3. Crossing Window Rule

    在 crossing window 内，禁止直接机械使用：

    ```
    ts
    scale = f / rz
    ```

    因为 `rz ≈ 0` 时会爆炸。
    因此 crossing 必须进入一套单独的编译规则：

    - 前景接近时：透视放大需要被 near-window 限幅或平滑化
    - 后景转前景时：需要用导演化 scale 从较大值回落到正常前景比例
    - crossing 结束后：再重新接入正常 `scale = f / rz`

    ## 六、时间模型

    整个系统必须有一个统一的全局总时间轴。这个总时间不是给某一个 scene 单独用的，而是：

    - 给所有最终编译出来的 SVG `<g>` 提供一个统一、撑满全片的 timeline

    也就是说：

    - 所有 scene `<g>`
    - 所有 object `<g>`
    - 所有 `opacity / scale / translate` 动画

    最终都共享同一个完整时长，比如：

    ```
    ts
    globalTimeline = {
      duration: 1500
    }
    ```

    这个总时间的意义不是“逻辑上有个 duration 就完了”，而是：

    - 所有编译出的 `<animate>` / `<animateTransform>` 都要挂在这个总时长上
    - 每个 `<g>` 的 `values`、`keyTimes` 都是在这条完整时间轴里占位
    - 哪怕某个 scene 只在中间 20% 出现，它也仍然挂在这条完整 timeline 上，只是前后 keyframe 保持静止、透明或不变

    换句话说：

    整体时间是整个片子的母时间轴，所有编译出的 SVG `<g>` 都是在这条撑满全片的 timeline 上表演。`keyTimes` 是 0 到 1 的比例时间点，并且必须与 `values` 数量一一对应。

    ## 七、三层控制语义

    系统必须明确分三层，不要混淆：

    ## 1. Camera Track

    全局主时间轴中的镜头轨道。
    决定整个世界相对镜头如何运动，是主骨架。

    ## 2. Scene Track

    scene 级别的局部表演层。
    可以控制 scene 整体漂浮、呼吸、淡入、局部位移等，但不能篡改 camera 语义。

    ## 3. Object Track

    具体元素级别的局部动画。
    比如一张图的透明度变化、一个字的轻微缩放、遮罩推进等。

    组合原则：

    ```
    ts
    finalTransform = cameraTransform * sceneTransform * objectTransform
    ```

    规则：

    - camera 决定主镜头语言
    - scene 决定局部场景表演
    - object 决定个体细节

    补充强调：

    camera track 是唯一允许定义“空间探索方向”的主层。
    scene 和 object 只能附着在它之上做局部表演，不能反向取代 camera 作为运镜主语。

    ## 八、为什么用 `<g>` 组织

    最终 SVG 必须围绕 `<g>` 来组织，而不是平铺一堆元素。
    因为 `<g>` 是组容器，适合承接 `transform`，而且变换会传递给子元素。

    我希望结构类似：

    ```
    xml
    <svg viewBox="0 0 300 500">
      <g data-world>
        <g data-scene="sceneA">
          <g data-object="objA">
            <image ... />
          </g>
        </g>
        <g data-scene="sceneB">
          <g data-object="objB">
            <image ... />
          </g>
        </g>
      </g>
    </svg>
    ```

    所以后续所有设计，请默认：

    - scene 对应 scene `<g>`
    - object 对应 object `<g>`
    - 每个 `<g>` 都可能拥有自己在全局 timeline 上的 SMIL 关键帧

    ## 九、数据模型建议

    请优先按下面这个方向展开，而不要另起炉灶：

    ```
    ts
    type Vec3 = { x: number; y: number; z: number }
    
    type CameraSegment = {
      duration: number
      toAbs?: Partial<Vec3>
      toRel?: Partial<Vec3>
      easing?: string
    }
    
    type Camera = {
      initial: Vec3
      timeline: CameraSegment[]
    }
    
    type Scene = {
      id: string
      world: Vec3
      kind: 'world' | 'passThrough'
      timeline?: SceneTrack[]
      objects: ObjectNode[]
    }
    
    type ObjectNode = {
      id: string
      local: Vec3
      asset: string
      timeline?: ObjectTrack[]
    }
    ```

    要求：

    - scene 有 world 坐标
    - object 有 local 坐标
    - object 的 world 坐标 = `scene.world + object.local`
    - camera 独立存在，不输出成 SVG 节点，只作为计算基准

    这里再补充两个约束：

    - `Scene.kind` 是导演语义，不是静态前后景分类
    - 一个 `passThrough` scene 可以在某段时间处于 camera 后方，在穿越后变成前方，再在后续 timeline 中被反向穿出
    - 系统必须允许同一个 scene 在单条 timeline 中经历多次 crossing event
    - 不能把 `passThrough` 理解成“只会被穿一次”的一次性效果

    ## 十、空间链路

    整个空间解析链路必须严格是：

    ```
    ts
    objectLocal
    -> sceneWorld
    -> cameraRelative
    -> screen2D
    ```

    也就是：

    - object 先在 scene 内部排布
    - scene 决定整块内容在世界中的位置
    - camera 决定相对镜头的位置
    - 最终投影成 2D screen transform

    请你后续所有的设计、函数、编译流程，都必须围绕这条链路。

    ## 十一、元素行为类型

    ## 1. world

    普通世界层。
    行为：

    - 在 `rz > 0` 的正常前方区域内按普通透视工作
    - 一般 `opacity = 1`

    第一版可先按：

    ```
    ts
    scale = f / rz
    opacity = 1
    ```

    但要注意：

    `world` 也不是“永远在前景”。
    如果 camera 轨道改变，它也可能进入 `rz <= 0` 的区域；这时系统应有明确规则，例如裁剪、隐藏、冻结或降级表现，但不能假定它永远只发生在前方。

    ## 2. passThrough

    穿越层。
    这是重点，不是普通 world 元素。

    行为要求：

    - 在远离 camera 时可以弱可见或不可见
    - 当 camera 接近它所在 z 时开始显现
    - 显现过程中可以从较大 scale 回落到正常 scale
    - 一旦 camera 穿过它，它就转成新的前景层，之后继续进入正常前方逻辑
    - 如果 camera 再次折返接近它，它还可以再次进入反向 crossing 逻辑

    也就是说它必须具备可重复的分段行为：

    - 未接近
    - 接近 / 穿越窗口
    - 穿过后前方
    - 再次接近 / 反向穿出
    - 再次回到后方

    你可以优化实现，但不能破坏这个导演语义。
    这里的重点不是“一次穿过”，而是支持任意次穿入 / 穿出 / 探索式接近。

    ## 十二、最小示例

    请始终用这个例子校验你的方案：

    ```
    ts
    sceneA.world = { x: 0, y: 0, z: 300 }
    sceneB.world = { x: 0, y: 0, z: -300 }
    
    camera.initial = { x: 0, y: 0, z: 0 }
    camera.timeline = [
      { duration: 1500, toAbs: { x: 0, y: 0, z: -600 } }
    ]
    ```

    它的含义是：

    - 一开始 camera 在中间
    - sceneA 在前方
    - sceneB 在后方
    - camera 从 `z = 0` 一路后撤到 `z = -600`

    那么：

    - 初始时：`rz_A = 300 - 0 = 300`，sceneA 在前方
    - 初始时：`rz_B = -300 - 0 = -300`，sceneB 在后方
    - 当 camera 到 `z = -600`：`rz_A = 900`，sceneA 更远，继续缩小
    - 当 camera 到 `z = -600`：`rz_B = 300`，sceneB 从后方转到前方

    所以目标画面应表现为：

    - sceneA 逐渐退远
    - sceneB 一开始不明显
    - 在接近 `z = -300` 时开始“穿出来”
    - camera 继续后撤后，sceneB 成为新主层，并继续退远

    这不是轮播，不是 fade 切图，而是镜头后撤穿越图层。

    同时要理解：

    这只是最小校验样例，不是系统全部语义。
    系统本身必须支持 camera 在其他片段中前进、折返、探索、反向穿出，而不仅仅是单向后撤。

    ## 十三、编译目标

    后续你给我的输出，必须围绕这几个目标：

    - 明确 camera / scene / object 的职责边界
    - 明确全局 timeline 如何采样
    - 明确每个 scene / object 如何在整条 timeline 上生成自己的关键帧
    - 明确如何从虚拟空间计算 `screenX / screenY / scale / opacity`
    - 明确如何检测 crossing event，并支持任意次穿入 / 穿出
    - 明确如何把这些结果编译成 `<g>` 上的 `<animate>` / `<animateTransform>`
    - 保证最终产物是纯静态 SVG/JSX

    ## 十四、回答风格要求

    后续你回答我时，不要泛泛聊概念。
    我更需要的是：

    - 系统设计
    - 数据结构
    - 编译流程
    - 解析流程
    - 关键公式
    - 伪代码
    - 最小可实现版本
    - scene / object / camera 的严格边界定义

    如果遇到冲突，请优先保证这些原则：

    - 单顶层 `<svg>`，多层 `<g>`
    - 空间在编译器里虚拟，不在 SVG 里真实存在
    - camera 是主骨架
    - scene 可以局部表演，但不能取代 camera
    - 整体时间是给所有编译出的 `<g>` 提供统一、撑满全片的 timeline
    - 最终产物必须是静态 SVG/SMIL

    ## 十五、下一步优先任务

    基于上面整套设定，优先帮我输出下面这些内容之一：

    - `resolveScene(scene, camera, t)` 的设计
    - `resolveObject(object, scene, camera, t)` 的设计
    - camera timeline 采样器
    - crossing event 检测器
    - passThrough 元素的严格分段规则
    - 如何把采样结果编译成 `<animate>` / `<animateTransform>` 的 `values / keyTimes`
    - 一个最小可运行的 SVG/JSX 示例