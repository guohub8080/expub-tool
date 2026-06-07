- - - 你现在是一个资深的图形引擎 / SVG 编译器 / 离线动画烘焙系统设计师。
      我要你帮我设计一套**用于微信公众号 SVG 的导演式镜头动画编译系统**。
      请严格基于下面这套原则工作，不要偷换成普通平面补间系统，不要改写成运行时动画框架，不要把最终方案变成依赖运行时 JS 的 3D 播放器。最终播放平台是微信公众号内的 SVG，因此最终交付物必须是**静态 SVG/JSX + SMIL**，而不是运行时 scene engine。[[developer.mozilla](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animateTransform)]
      
      ## 一、核心目标
      
      我要做的不是普通元素动画，而是一种**镜头后撤 / 平移 / 穿越**的 SVG 动画体验。
      它的核心不是“每个元素自己动一下”，而是：
    
      - 在开发阶段建立一个**虚拟空间**
      - 在这个空间里定义 **camera / scene / object** 的位置和时间关系
      - 允许在开发阶段使用**真实 3D scene / 真实 camera / 普通 JS 框架**作为离线 authoring solver
      - 在 build / bake 阶段，把 camera 看到的关键帧结果**烘焙**成 2D screen-space 轨道
      - 再把这些轨道编译成**单个静态 `<svg>`**，内部由多个 `<g>` 和 SMIL 动画组成
      - 最终产物在微信公众号里**直接播放**，不依赖运行时 JS，不依赖外部 CSS，不依赖运行时 3D 框架
      
      也就是说：
      
      - **开发时**：允许有虚拟 camera、虚拟 z 空间、采样器、离线 3D solver、编译器
      - **输出时**：只有单个静态 `<svg>`，里面是多个 `<g>`、`<animate>`、`<animateTransform>`
    
      ## 二、平台限制
    
      这是给微信公众号 SVG 用的，因此必须遵守：
    
      - 不依赖运行时 JS
      - 不依赖外部 CSS
      - 不使用嵌套 `<svg>`
      - 尽量避免复杂的 ID 引用关系
      - 最终结构应为：**单顶层 `<svg>` + 多层 `<g>`**
      - 动画主要使用 SMIL：`<animate>` / `<animateTransform>`
      - 输出应尽量稳定、扁平、可直接嵌入 SVG/JSX
      
      补充理解：
      
      - `<g>` 是主要的空间分层容器，适合承接 `transform`，并把变换传递给子元素[[mdn2.netlify](https://mdn2.netlify.app/en-us/docs/web/svg/element/g/)]
      - `transform` / `animateTransform` 可以直接挂在 `<g>` 或元素上[[developer.mozilla](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorials/SVG_from_scratch/Basic_transformations)]
      - SVG 并不真的懂 3D；最终 SVG 只是播放 2D transform/opacity 的结果
      - 不要把最终方案设计成在 SVG 里实时跑 camera 计算
      
      ## 三、根本原则
      
      请始终基于以下原则思考：
      
      > **SVG 只是播放层，不是空间层；空间只存在于开发阶段和编译阶段。**
      
      也就是说：
      
      - 最终 SVG 不真的拥有 3D 空间
      - 3D / camera / 景深 / 视差 / 穿越 都是在 authoring / bake / compile 阶段虚拟和求解出来的
      - 最终落地结果只能是 2D 的 `translate / scale / opacity / clip / rotate` 等回放数据
    
      ## 四、Authoring 与 Output 的双层架构
    
      系统必须明确区分两层：

      ## 1. Authoring Solver Layer

      这是开发阶段的离线求解层。这里允许：
    
      - 用普通 JS / Three.js / 自定义 solver / 其他框架
      - 真正搭一个 3D scene
      - 真正放一个 camera
      - 真正控制关键帧
      - 在任意时间 `t` 采样 camera 和对象的世界位置
      - 计算对象在 camera 内的相对位置与屏幕投影
      - 得到 baked screen-space 数据
      
      这里可以有真实 3D、矩阵、camera、世界坐标、时间采样器。
      
      ## 2. SVG Playback Layer
    
      这是输出层。这里**不允许**存在：

      - 运行时 camera
      - 运行时 3D
      - 运行时 solver
      - 运行时布局重算
      
      这里只允许：
      
      - 静态 `<svg>`
      - 多个 `<g>`
      - `animate / animateTransform`
      - 预编译好的 `values / keyTimes / keySplines`
      
      ## 五、空间模型
      
      整个系统有一个统一的虚拟世界坐标系：
      
      ```
      ts
      type Vec3 = { x: number; y: number; z: number }
      ```
    
      坐标语义固定为：
    
      - `x`：向右为正
      - `y`：向上为正
      - `z`：沿镜头方向的深度轴
      
      必须严格理解前后关系由**相对 camera 的深度**决定，而不是绝对 z 决定。
      
      设：
      
      - `e = element world position`
      - `c = camera world position`
      
      则：
      
      ```
      ts
      rx = ex - cx
      ry = ey - cy
      rz = ez - cz
      ```
      
      语义必须是：
      
      - `rz > 0`：元素在 camera 前方
      - `rz = 0`：元素在 camera 平面上，是危险区
      - `rz < 0`：元素在 camera 后方
      
      也就是说，元素是否在前面，不由绝对 z 决定，而由 `ez - cz` 决定。
      
      ## 六、Camera

      camera 处在与 scene/object 相同的 world space 中。
      camera 永远作为**开发时 / 编译时的参考系**存在，而**不会输出为 SVG 节点**。
      
      ```
      ts
      type Camera = {
        initial: Vec3
        timeline: CameraSegment[]
      }
      ```

      camera 是整个系统的**主骨架**。
      scene 和 object 可以有局部表演，但不能篡改 camera 的主语义。
      
      ## 七、空间链路
      
      整个空间解析链路必须严格是：
      
      ```
      ts
      objectLocal
      -> sceneWorld
      -> cameraRelative
      -> screen2D
      ```
      
      也就是：
      
      - object 先在 scene 内排布
      - scene 决定整块内容在世界中的位置
      - camera 决定相对镜头的位置
      - 最终投影成屏幕空间的位置与缩放
    
      请后续所有函数、编译流程、数据结构都围绕这条链路设计。
      
      ## 八、投影模型
      
      设：
      
      ```
      ts
      viewport = { width: 300, height: 500 }
      center = { x: 150, y: 250 }
      f = 300
      ```
      
      采用简化 pinhole / perspective 模型：
      
      ```
      ts
      scale = f / rz
      screenX = centerX + rx * scale
      screenY = centerY - ry * scale
      ```
    
      要求你始终理解：
      
      - `screenX/screenY` 与 `scale` 在几何求值上**共享同一个深度因子**
      - 所以在求值层，translate 与 scale 是**耦合的**
      - 但在最终 SVG 编译层，可以把它们拆成独立动画通道输出
      - 即：**求值耦合，输出分离**
    
      ## 九、时间模型
    
      整个系统必须有统一的全局主时间轴：
    
      ```
      ts
      globalTimeline = {
        duration: number
      }
      ```
      
      要求：
      
      - 所有 scene `<g>`
      - 所有 object `<g>`
      - 所有 opacity / translate / scale 动画
      
      最终都共享这一条完整时间轴。
      哪怕某个 scene/object 只在局部时段活跃，也必须在整条 timeline 上占位。
      
      也就是说：
      
      - 所有编译出的 `keyTimes` 都必须落在同一条 `0..1` 母时间轴上
      - 每个 `<g>` 的动画都要挂满整片 duration
      - 不允许每个 scene 自己偷偷有一套独立片长
    
      ## 十、三层控制语义
      
      系统必须明确分三层：
      
      ## 1. Camera Track
      
      全局镜头轨道。
      决定主镜头语言：后撤、左移、右移、上移、下移、穿越。
    
      ## 2. Scene Track
      
      scene 级表演层。
      允许轻微漂浮、呼吸、淡入、局部偏移，但不能篡改 camera 语义。
    
      ## 3. Object Track
      
      object 级表演层。
      允许透明度、轻微缩放、mask、微位移等个体细节。

      组合原则：
      
      ```
      ts
      finalVisual = cameraSolvedWorld + sceneModifier + objectModifier
      ```
      
      在语义上，camera 决定主镜头，scene 决定局部表演，object 决定细节。
      
      ## 十一、DOM 组织原则
      
      最终 SVG 必须围绕 `<g>` 组织，不要平铺一堆元素。
      
      结构默认类似：
      
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
      
      scene 对应 scene `<g>`，object 对应 object `<g>`。
      每个 `<g>` 都可能拥有自己在全局 timeline 上的 SMIL 动画。
    
      ## 十二、数据模型建议
    
      请优先使用如下方向，不要另起炉灶：
      
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
      
      type SceneTrack = any
      type ObjectTrack = any
      
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
      
      - `scene.world` 是 scene 世界坐标
      - `object.local` 是 object 相对 scene 的局部坐标
      - `object.world = scene.world + object.local`
      - `camera` 独立存在，只参与计算，不输出成 SVG 节点
      
      ## 十三、Authoring Bake 中间层
      
      在离线 solver 与 SVG compiler 之间，必须存在一个**Canonical Baked Timeline** 中间层。
      不要让编译器直接依赖具体 3D 引擎。
      
      建议：
      
      ```
      ts
      type BakedFrame = {
        t: number
        tx: number
        ty: number
        sx: number
        sy: number
        opacity: number
        visible: boolean
      }
      
      type CanonicalTrack = {
        id: string
        frames: BakedFrame[]
      }
      ```
      
      要求：
      
      - 上游可以是 Three.js / 自定义 3D solver / 任何离线求解器
      - 下游只认 CanonicalTrack
      - SVG 编译器只从 CanonicalTrack 读取数据
      - 这样可以实现“上游求值器可替换，下游发射器稳定”
      
      ## 十四、关于 translate 与 scale 的正式原则
      
      这是本系统的重要公理，请严格遵守：
      
      ## Transform Coupling Rule
      
      在 authoring / bake 阶段，translate 与 scale 在几何上不是正交的，而是由同一个 camera-depth 投影共同决定。
      也就是说：
      
      ```
      ts
      screenX = centerX + rx * k
      screenY = centerY - ry * k
      scale = k
      ```
      
      其中 `k` 是深度缩放因子。
      
      因此：
      
      - 在**求值层**，translate / scale 是耦合的
      - 在**输出层**，可以拆成独立 SMIL 通道
      - 但这些通道必须来自同一次统一求解结果，而不能各自独立拍脑袋设计
      
      总结成一句：
      
      > 求值耦合，输出分离。
      
      ## 十五、关于 camera 横向移动的正式规则
      
      请严格遵守下列世界规则：
      
      - camera 向左移动时，世界中的对象在屏幕上整体表现为**向右移动**
      - camera 向右移动时，世界中的对象在屏幕上整体表现为**向左移动**
      - 但不同深度对象的位移量不同：
        - 近处层偏移更大
        - 远处层偏移更小
      
      也就是说，camera 平移必须产生 **motion parallax / 近快远慢** 的效果，不能把所有 layer 做成同速平移。
      
      要求你在设计中体现：
      
      ```
      ts
      parallaxX = (worldX - camera.x) * depthScale(worldZ - camera.z)
      finalX = centerX + parallaxX + sceneOffsetX + objectOffsetX
      ```
      
      ## 十六、元素行为类型
      
      至少支持两类：
      
      ## 1. world
      
      普通世界层。行为：
      
      - 始终属于统一 world/camera 系统
      - 随 camera 后撤持续缩小
      - camera 横移时表现出正常视差
      - 默认 opacity 为 1
      
      第一版可按：
      
      ```
      ts
      scale = f / rz
      opacity = 1
      ```
      
      ## 2. passThrough
      
      穿越层。
      这是重点，不是普通 world 层。
      
      行为要求：
      
      - 初始可以不可见或弱可见
      - 当 camera 接近其所在 z 时开始显现
      - 显现过程中允许带有“导演式入场修饰”
      - 一旦进入主视野后，它仍然属于统一 world/camera 系统
      - 它**不是先独立入场再切换到世界**，而是从一开始就属于世界，只是在某个窗口里叠加一个 temporary entrance modifier
      - 当 modifier 衰减到 0 时，它自然完全服从统一世界控制
      
      也就是说：
      
      > 入场不是独立系统，而是 canonical world projection 上附着的一层 temporary entrance modifier。
      
      ## 十七、Entrance Modifier 原则
      
      对需要“从右边/左边/后方进入主视野”的对象，请按下列思路设计：
      
      先统一求 canonical world state：
      
      ```
      ts
      worldX2D
      worldY2D
      worldScale
      worldOpacity
      ```
      
      再叠加临时 modifier：
      
      ```
      ts
      finalX = worldX2D + enterOffsetX(u)
      finalY = worldY2D + enterOffsetY(u)
      finalScale = worldScale * enterScaleFactor(u)
      finalOpacity = worldOpacity * enterOpacityFactor(u)
      ```
      
      其中：
      
      - `u` 是入场进度
      - `u` 到末端时，modifier 衰减到 0/1
      - 入场完成后，layer 无需“切换系统”，自然继续服从 world 控制
      
      ## 十八、最小校验案例
      
      请始终用下面这个例子校验你的方案：
      
      ```
      ts
      sceneA.world = { x: 0, y: 0, z: 300 }
      sceneB.world = { x: 0, y: 0, z: -300 }
      
      camera.initial = { x: 0, y: 0, z: 0 }
      camera.timeline = [
        { duration: 1500, toAbs: { x: 0, y: 0, z: -600 } }
      ]
      ```
      
      含义：
      
      - 初始 camera 在中间
      - sceneA 在前方
      - sceneB 在后方
      - camera 从 z=0 后撤到 z=-600
      
      目标画面：
      
      - sceneA 逐渐退远
      - sceneB 一开始不明显
      - 在接近 z=-300 时开始“穿出来”
      - camera 继续后撤后，sceneB 成为新的前景层，并继续退远
      
      这不是轮播，不是 fade 切图，而是镜头后撤穿越图层。
      
      ## 十九、编译目标
      
      请你后续的输出围绕以下几个目标展开：
      
      - 明确 camera / scene / object 的职责边界
      - 明确全局 timeline 如何采样
      - 明确 authoring solver 如何烘焙为 CanonicalTrack
      - 明确每个 scene / object 如何在整条 timeline 上生成关键帧
      - 明确如何从虚拟空间/真实 3D bake 结果计算 `screenX / screenY / scale / opacity`
      - 明确如何把这些结果编译为 `<g>` 上的 `<animate>` / `<animateTransform>`
      - 保证最终产物是纯静态 SVG/JSX + SMIL
      - 不要把最终方案写成运行时 3D 引擎
      
      ## 二十、回答风格要求
      
      后续回答不要泛泛聊概念。
      我更需要的是：
      
      - 系统设计
      - 数据结构
      - 编译流程
      - 解析流程
      - 关键公式
      - 伪代码
      - 最小可实现版本
      - camera / scene / object 的严格边界定义
      - authoring bake -> canonical track -> svg emit 的明确流程
      
      如果遇到冲突，请优先保证：
      
      1. 单顶层 `<svg>`，多层 `<g>`
      2. 空间在编译器里，不在 SVG 里真实存在
      3. camera 是主骨架
      4. scene 可以局部表演，但不能取代 camera
      5. 时间轴必须是全片统一的母时间轴
      6. transform 在求值层耦合，在输出层可分离
      7. 最终产物必须是静态 SVG/SMIL
      8. 允许开发阶段使用真实 3D + 真实 camera 做离线烘焙，但绝不把运行时 3D 带到最终播放器里
      
      ## 二十一、优先任务
      
      基于以上设定，后续优先输出以下内容之一：
      
      - `sampleCamera(t)` 的设计
      - `resolveScene(scene, camera, t)` 的设计
      - `resolveObject(object, scene, camera, t)` 的设计
      - `authoring bake -> CanonicalTrack` 的设计
      - passThrough 的严格分段规则
      - `CanonicalTrack -> SMIL values / keyTimes` 的编译器设计
      - 一个最小可运行的 SVG/JSX 示例
      
      ## 使用说明
      
      
      
      **“请先输出：1）系统总架构图；2）TypeScript 数据结构；3）最小 bake pipeline 伪代码。”**[[developer.mozilla](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/animateTransform)]
      
      如果你愿意，我下一条可以继续帮你做两件事之一：
      **A. 把这个大 Prompt 再压缩成一个更适合直接喂模型的精炼版；**
      **B. 直接基于这个 Prompt，开始写第一版 `sampleCamera / resolveScene / bake pipeline`。