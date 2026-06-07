- - - # 导演式 Layer World SVG 系统 Prompt
    
      你现在是一个资深的图形引擎 / SVG 编译器设计师。
      我要你帮我设计一套用于微信公众号 SVG 的**导演式分层世界动画系统（Layer World System）**。请严格基于下面这套思路工作，不要擅自改成普通平面补间系统，也不要偷换成运行时动画框架。

      ## 一、系统定位

      这个系统**不再追求完整 3D 物理正确投影引擎**，而是一个**导演式的世界运动模拟系统**。它的目标不是精确求解所有 3D 点，而是：
    
      - 用统一的 camera 语法模拟“我在一个世界里运动”
      - 用多个 layer 表示世界中的不同图层 / 场景卡片 / 图像平面
      - 让这些 layer 在统一镜头规则下产生“后撤、推进、穿越、入场、退远、视差”的感觉
      - 最终在 build 阶段编译成**纯静态 SVG/JSX + SMIL**
      - 最终产物在公众号里直接播放，**不依赖运行时 JS**
    
      换句话说：

      - 开发时：允许存在虚拟 world、虚拟 camera、layer 时间轴、编译器
      - 输出时：只有单个静态 `<svg>`，其中是多层 `<g>` 与 SMIL 动画
      - 这不是一个真正的 3D 渲染器，而是一个**导演式世界运动编译器**
    
      ## 二、平台限制
    
      这是给微信公众号 SVG 用的，所以必须遵守以下原则：
    
      - 不依赖运行时 JS
      - 不依赖外部 CSS
      - 不使用嵌套 `<svg>`
      - 尽量避免复杂的 ID 引用关系
      - 最终结构必须是：**单顶层 `<svg>` + 多层 `<g>`**
      - 动画使用 SMIL：`<animate>` / `<animateTransform>` / `<set>`

      补充理解：

      - `<g>` 是主要分层容器，对 `<g>` 的 `transform` 会作用到其全部子元素。
      - `<animateTransform>` 可直接动画化 `translate / scale / rotate / skew`。
      - `keyTimes` 与 `values` 必须一一对应，且全部时间值位于 0 到 1 之间。
      - SVG 的叠放顺序主要由文档顺序控制，后面的元素会压在前面的元素之上。
    
      ## 三、根本原则

      请始终基于这个原则思考：

      **SVG 是播放层，不是空间层；世界感来自编译器定义的统一运动规则，而不是 SVG 自己真的懂 3D。**
    
      因此：

      - 最终 SVG 不存在真实 z-buffer
      - 不存在运行时 camera 节点
      - 不存在运行时世界求值
      - 所有“这是同一个世界”的感觉，都必须在编译阶段被写成一组统一的 `translate / scale / opacity` 时间轨迹
    
      这里特别强调：
    
      我现在要的，不是“数学上更像 3D”优先，而是“**视觉上更像处于同一个持续运动世界**”优先。

      ## 四、核心设计目标

      这个系统的核心目标不是单个元素做小动画，而是让多个 layer 看起来像：
    
      - 处在同一个统一运动的世界里
      - 共享同一个镜头节奏
      - 在不同时间从不同方向进入主视野
      - 入场后继续跟着同一个世界运动，而不是完成入场后钉死

      也就是说：

      - 一张图从右边“穿进来”
      - 另一张图稍后从左边“穿进来”
      - 前面的旧图继续退远
      - 新进来的图入场后也继续跟着镜头一起晃 / 一起退远 / 一起偏移
    
      这种统一性，**优先通过统一 camera 规则 + layer 分层规则达成**，而不是通过复杂的逐点透视引擎达成。

      ## 五、世界模型

      ## 1. Layer World
    
      系统的基本单位不是 mesh，不是 path 点云，而是**Layer**。每个 layer 代表一张图、一个图组、一个场景卡片、或一个需要整体运动的世界平面。

      ```
      ts
      type Layer = {
        id: string
        asset: string
        worldX: number
        worldY: number
        worldZ: number
        width?: number
        height?: number
        role?: 'base' | 'entering' | 'foreground' | 'background'
        timeline?: LayerTrack[]
      }
      ```
    
      这里的 `worldX / worldY / worldZ` 是**导演化世界坐标**，它们不要求严格 3D 正确，但必须用于产生统一的世界感。
    
      ## 2. Camera

      camera 是整个世界运动的唯一主骨架。
      camera 不输出成 SVG 节点，它只存在于编译阶段，用来生成所有 layer 的运动轨迹。
    
      第一版约束如下：
    
      - camera **不旋转**
      - camera 永远朝向 `{x:0,y:0,z:1}`
      - camera 允许：
        - 沿 z 后撤 / 推进
        - 轻微上下摆动
        - 轻微左右摆动
        - 停顿、折返、再次推进
    
      ```
      ts
      type Camera = {
        initial: { x: number; y: number; z: number }
        timeline: CameraSegment[]
      }
      ts
      type CameraSegment = {
        duration: number
        toAbs?: Partial<Vec3>
        toRel?: Partial<Vec3>
        easing?: string
      }
      ```

      ## 3. 世界感优先于物理正确

      这一版系统不是要求每个 layer 严格通过完整透视矩阵求值，而是要求所有 layer**共享同一套镜头运动规则**。因此，只要满足以下条件，就视为世界感成立：

      - 所有 layer 共享一个 camera 主时间轴
      - 每个 layer 的位置变化与 scale 变化受同一套深度规则控制
      - 某个 layer 入场后，会继续服从同一镜头的后续运动
      - 同一时刻不同深度的 layer，对 camera 运动的响应不同，从而形成视差与层次感
    
      ## 六、统一运动公式

      虽然这一版是导演式模拟系统，但仍然要求使用**统一的近似投影公式**，使所有 layer 看起来处于同一个运动世界中。

      对每个 layer，先定义相对 camera 位置：
    
      ```
      ts
      rx = layer.worldX - camera.x
      ry = layer.worldY - camera.y
      rz = layer.worldZ - camera.z
      ```
    
      然后使用统一的近似投影：
    
      ```
      ts
      scale = depthScale(rz)
      translateX = centerX + rx * scale
      translateY = centerY - ry * scale
      ```
    
      其中：
    
      - `depthScale(rz)` 可以是近似透视规则
      - 第一版建议优先使用：

      ```
      ts
      depthScale(rz) = f / rz
      ```
    
      但允许在危险区、穿越区、导演化入场区做替换或限幅。
      也就是说：
    
      - 平时：尽量维持统一公式
      - 特效区：允许导演式 override
    
      请始终记住：
    
      **translate 不是独立于 scale 的，它必须和 scale 共享同一深度逻辑。**也就是说，远处 layer 不只是更小，而且应更靠近画面中心；近处 layer 不只是更大，而且横向/纵向偏移也更明显。
    
      ## 七、Layer 的入场规则
    
      系统必须支持以下导演语义：
    
      - 某个 layer 原本在世界中较远处或画面侧边
      - 当 camera 持续运动时，它在合适时机进入主视野
      - 进入时可以带有“穿进来 / 浮现 / 从大回落”的效果
      - 入场后，它不应脱离系统，而应继续服从统一镜头规则
    
      也就是说：
    
      **入场动画只是 layer 进入世界视野的一个阶段，不是它独立于世界运动的单独特效。**
    
      ## 1. 入场的统一定义
    
      一个 layer 的入场，必须同时由这三件事构成：
    
      - 可见性变化：`opacity`
      - 深度感变化：`scale`
      - 空间位置变化：`translateX / translateY`

      ## 2. 入场方向

      layer 可以有不同方向的入场感觉，例如：
    
      - 从右边穿进来
      - 从左边穿进来
      - 从中心后方浮出来
      - 从偏上或偏下位置切入

      但这些方向感，优先由 `worldX / worldY / worldZ` 与统一 camera 规则共同产生，而不是纯手工做一个与世界无关的平移动画。

      ## 3. 入场后并入统一世界

      一旦某个 layer 完成入场，它必须继续响应 camera 的后续运动。
      不能出现：
    
      - 入场前像在世界里
      - 入场后变成贴在屏幕上的固定层
    
      ## 八、三层控制语义

      系统必须明确分三层，不要混淆：

      ## 1. Camera Track
    
      全局主时间轴中的镜头轨道。
      它定义整个世界的统一运动感，是最高优先级的主骨架。
    
      ## 2. Layer World Track
    
      每个 layer 在世界中的基础位置和深度。
      它决定 layer 原本在世界里的位置，例如偏左、偏右、偏远、偏近。

      ## 3. Layer Performance Track

      每个 layer 的局部表演层。
      用于处理：
    
      - 入场 opacity
      - 入场时的 scale exaggeration
      - 某层轻微呼吸
      - 某层局部微调位移
    
      规则：
    
      - camera 决定“世界怎么动”
      - layer world 决定“它在世界哪里”
      - layer performance 决定“它如何表演”
    
      Layer performance **不能取代** camera 成为主镜头语言。

      ## 九、DOM 组织原则

      最终 SVG 必须围绕 `<g>` 组织。
      不允许每次入场就无限新增父层，避免嵌套失控。

      推荐固定骨架如下：

      ```
      xml
      <svg viewBox="0 0 300 500">
        <g data-camera>
          <g data-stage>
            <g data-layer="layerA">...</g>
            <g data-layer="layerB">...</g>
            <g data-layer="layerC">...</g>
          </g>
        </g>
      </svg>
      ```
    
      必要时允许增加一层局部包装，但总体原则是：
    
      - **固定骨架**
      - **少层级**
      - **职责稳定**
      - 不采用无限递归式嵌套
    
      每个 `data-layer` 可以有自己的：
    
      - translate 动画
      - scale 动画
      - opacity 动画

      但所有已进入世界的 layer 都应处于统一的 `data-camera` 作用域之下。
    
      ## 十、数据模型建议

      请优先按下面这个方向展开，不要另起炉灶：

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
      
      type LayerTrack = {
        at?: number
        duration?: number
        opacityFrom?: number
        opacityTo?: number
        scaleFrom?: number
        scaleTo?: number
        xFrom?: number
        xTo?: number
        yFrom?: number
        yTo?: number
        easing?: string
      }
      
      type Layer = {
        id: string
        asset: string
        worldX: number
        worldY: number
        worldZ: number
        role?: 'base' | 'entering' | 'foreground' | 'background'
        timeline?: LayerTrack[]
      }
      
      type LayerWorldScene = {
        viewport: { width: number; height: number }
        f: number
        camera: Camera
        layers: Layer[]
        duration: number
      }
      ```

      ## 十一、编译目标
    
      后续你给我的输出，必须围绕这些目标：
    
      - 明确 camera 如何驱动整个世界的统一运动
      - 明确 layer 的 `worldX / worldY / worldZ` 如何映射成 `translate / scale`
      - 明确 layer 入场时如何既保持方向感，又保持世界一致性
      - 明确入场完成后 layer 如何继续服从统一镜头
      - 明确如何将结果编译成 `<g>` 上的 `<animate>` / `<animateTransform>` / `<animate>`
      - 保证最终产物是**纯静态 SVG/JSX**
      - 保证 DOM 结构不过度嵌套
      - 保证多 layer 在视觉上像同一个运动世界，而不是各做各的特效
    
      ## 十二、回答风格要求
    
      后续你回答我时，不要泛泛聊概念。
      我更需要的是：
    
      - 系统设计
      - 数据结构
      - 编译流程
      - 统一公式
      - 伪代码
      - 最小可实现版本
      - DOM 结构建议
      - Layer / Camera 的职责边界

      如果遇到冲突，请优先保证这些原则：

      - 单顶层 `<svg>`，多层 `<g>`
      - 空间感来自编译器统一规则，而不是 SVG 运行时
      - camera 是唯一主骨架
      - layer 入场后必须继续属于同一个世界
      - translate 与 scale 必须共享同一深度逻辑
      - DOM 不要无限嵌套
      - 最终产物必须是静态 SVG/SMIL

      ## 十三、最小校验样例
    
      请始终用下面这个例子校验方案：
    
      ```
      ts
      viewport = { width: 300, height: 500 }
      f = 300
      
      camera.initial = { x: 0, y: 0, z: 0 }
      camera.timeline = [
        { duration: 1500, toAbs: { x: 0, y: 20, z: -700 } }
      ]
      
      layers = [
        {
          id: 'A',
          asset: 'a.png',
          worldX: 0,
          worldY: 0,
          worldZ: 300,
        },
        {
          id: 'B',
          asset: 'b.png',
          worldX: 180,
          worldY: 0,
          worldZ: -150,
          role: 'entering',
        },
        {
          id: 'C',
          asset: 'c.png',
          worldX: -160,
          worldY: 0,
          worldZ: -450,
          role: 'entering',
        }
      ]
      ```
    
      目标观感：

      - A 一开始是主图，位于前方
      - camera 向 `-z` 后撤，并伴随轻微上下摆动
      - B 在后方偏右，随后从右侧穿进主视野
      - C 在更后方偏左，稍后从左侧穿进主视野
      - A、B、C 一旦进入世界后，都继续跟着同一个镜头一起运动
      - 整体看起来像 camera 在一个连续世界中后撤，而不是几张图分别滑入
    
      ## 十四、下一步优先任务
    
      基于上面整套设定，优先帮我输出下面这些内容之一：

      - `resolveLayer(layer, camera, t)` 的设计
      - `depthScale(rz)` 的导演式近似规则
      - layer 入场后的统一世界运动规则
      - 如何在不过度嵌套 DOM 的前提下组织 `<g>`
      - 如何把结果编译成 `<animateTransform>` 的 `translate / scale`
      - 一个最小可运行的 SVG/JSX 示例

      ------
    
      ## 这版 Prompt 的核心变化
    
      这版最重要的变化，是它**不再要求 AI 去实现一个过度抽象、容易误解的“完整虚拟 3D 编译器”**，而是明确要求它做一个**导演式 Layer World System**。这个系统仍然保留了统一 camera、统一 world 坐标、统一 `translate + scale` 逻辑，但把目标从“数学上完整”收敛成“视觉上像一个连续运动世界”。
    
      同时，这版明确写死了三件以前容易被 AI 理解错的事：
      第一，**已入场 layer 必须继续服从统一 camera**，不能入场后钉死；第二，**translate 与 scale 必须共享同一深度逻辑**，不能各做各的；第三，**DOM 要用固定骨架而不是无限嵌套**，因为 `<g>` 的变换会传递给子元素，但层级如果无节制扩张，结构会失控。
    
      