项目交接文档：《只管寻路》 (Just Keep Pathing)

1. 项目概述与命名 (Project Overview & Naming)

项目名称：Just Keep Pathing (中文暂定：《只管寻路》)

命名理念：采用直白、带有指令感和宿命感的命名。游戏抛弃了繁重的背景故事，采用“薄故事”设定：主角（或寻路算法）是一个不断深入、以战养战的狂热者/程序。系统给出的唯一指令就是不断寻路。强化自身是为了存活，而增加迷宫里的怪物和宝箱，仅仅是因为“嫌这迷宫不够刺激，不够刷”。

项目愿景：打造一款以“2.5D 清晰视效”和“全自动机制”为核心驱动力的网页端放置挂机游戏。弱化繁琐的 UI 交互，核心体验集中在：观察迷宫生成、欣赏智能寻路、以及观赏极具动感的 RPG 自动回合制战斗上。

2. 需求设计文档 (PRD)

2.1 核心机制需求

无限层级：没有最终通关概念，完成当前层后自动生成更大/更难的下一层。难度（敌人血量/攻击力）随层数呈指数级或线性增长。

迷宫生成 (Maze Generation)：

必须确保每次生成的迷宫存在至少一条从起点到终点的连通路径。

视效需求：迷宫不能瞬间出现，需要有“逐块打通/挖掘”的动画过程（基于 DFS 算法，墙壁弹性下沉，露出底部网格通道）。

自动寻路 (Pathfinding)：

玩家角色必须能自动计算出最短路径并沿路径移动（BFS/A*）。

网格交互与对峙 (Grid Interaction & Standoff)：

前瞻侦测：玩家在移动前需判定下一个格子的实体。

遇敌对峙：如果前方1格是敌人，玩家必须停止在1格之外，进入战斗对峙状态，不可与敌人模型重叠。

回合制战斗 (Turn-based RPG Combat)：

UI 需求：触发战斗时，弹出经典 RPG 的对局血条和文字播报框（打字机效果）。

视效需求：双方交替进行带方向的物理冲刺撞击，伴随屏幕震动 (Trauma) 和受击闪白/故障特效 (Glitch)。

逻辑：玩家先手，战斗直到一方 HP 归零。胜利则获得资源并迈入敌方格子继续寻路；失败则当前层数重置。

2.2 资源与成长循环

消耗魂能（积分）进行强化：

寻路引擎：提升移动速度（缩短每格移动的物理时间）。

深渊打击：提升玩家基础攻击力。

矩阵护盾：提升玩家最大生命值（每层开始时回满）。

数据宝藏：增加迷宫生成时宝箱的概率（低收益，无风险）。

高风险信标：增加迷宫生成时怪物的概率（高收益，高风险）。

3. 技术文档 (Technical Documentation)

3.1 技术栈 (Tech Stack)

前端结构：单 HTML 文件（包含内联 CSS 和 JS），ES Module 架构。

UI 框架：Tailwind CSS (CDN 引入)。

3D/渲染引擎：Three.js (v0.160.0)。

后处理库：EffectComposer, RenderPass, GlitchPass, OutputPass。

3.2 渲染与视效规范 (Visual Conventions)

2.5D 清晰色块风：完全摒弃复杂的光照、阴影和泛光 (Bloom)。

材质：所有 3D 物体统一使用 MeshBasicMaterial（纯色发光材质），确保所见即所得。

描边工艺：所有实体（墙壁、玩家、怪物、宝箱）必须附加 LineSegments + EdgesGeometry 实现纯黑色的物理轮廓描边，保障极致的边界清晰度。

动态运镜 (Cinematic Camera)：

生成地图时：高空俯视上帝视角 (fov 变大)。

自动寻路时：平滑追尾跟随视角。

遭遇战斗时：极速拉低视角并放大 (fov 变小)，镜头聚焦于玩家与怪物的“中心点”。

3.3 核心类架构 (Core Classes)

GameState: 管理全局数据（阶段、层数、积分、玩家与环境的强化等级及花费计算）。

TweenManager: 轻量级补间动画引擎，处理平滑移动、缩放、弹性变形 (EaseOutElastic) 等。

VisualEngine: 渲染引擎。封装 Three.js 场景、相机、后处理。管理粒子系统 (spawnBurst)、3D 浮动伤害数字、以及带有阻尼衰减的屏幕震动系统 (shake(trauma))。

GameController: 逻辑控制器。负责二维网格生成、DFS 迷宫挖掘、BFS 寻路算法，以及异步的 RPG 回合制战斗协程 (startCombatRPG)。

4. 架构设计调优方向 (Architecture Tuning & Roadmap)

给接手开发者的建议路线图：

Phase 1: 代码解耦与重构

事件驱动 (Event-Driven)：目前 GameController 严重耦合了 Three.js 的渲染逻辑。建议引入 EventBus（如触发 PlayerMoveEvent, CombatStartEvent），由 VisualEngine 监听并播放动画，实现逻辑层与表现层的彻底分离。

配置文件抽取：将“魂能”、“深渊”、“矩阵”等文本，以及所有的颜色 HEX 值抽取到统一的 ThemeConfig.js 中，方便未来一键换肤或文本国际化。

Phase 2: 性能优化 (Performance)

对象池 (Object Pooling)：目前每层都会销毁并 new 大量的 BoxGeometry 和 EdgesGeometry。必须引入对象池复用墙壁、怪物和宝箱实例，减少垃圾回收 (GC) 压力和掉帧卡顿。

合并渲染：对于静态的地面和未被挖掘的墙壁，考虑使用 InstancedMesh 合并 Draw Calls。

Phase 3: 玩法深度扩展 (Gameplay Depth)

装备与词条系统：战斗目前只有基础的 ATK vs HP。可以加入“吸血”、“暴击”、“反伤”等词条机制。

多样化算法地图：除了 DFS 迷宫，加入基于元胞自动机 (Cellular Automata) 的开阔洞穴地图，或基于 BSP 的完美迷宫，每 5 层切换一种地貌。

Boss 战：每 10 层生成一个占据 2x2 格子的巨型 Boss，引入多阶段战斗演出。

5. 启动指南 (Getting Started)

环境准备：游戏使用纯前端技术，无需 Node.js 依赖包安装。但由于使用了 ES Module (<script type="importmap">) 加载 Three.js，不能直接双击 HTML 文件在浏览器中打开，否则会报 CORS 跨域错误。

本地运行：

VS Code：安装并使用 Live Server 插件，右键点击 HTML 文件选择 "Open with Live Server"。

Python：在项目根目录执行 python -m http.server 8000 (Python 3) 或 python -m SimpleHTTPServer 8000 (Python 2)，然后访问 http://localhost:8000。

Node.js：使用 npx http-server 或 npx serve。