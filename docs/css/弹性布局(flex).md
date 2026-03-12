### 1. Flexbox(弹性布局)
* 弹性布局css3新增的布局方式，用于替代早期的浮动布局和定位布局。

### 2. Flex容器属性
1. `flex-direction:` 决定主轴的方向
* row(默认值): 主轴为水平方向，起点在左端
* row-reverse: 主轴为水平方向，起点在右端
* column: 主轴为垂直方向，起点在上沿
* column-reverse: 主轴为垂直方向，起点在下沿
* 注意：主轴和交叉轴是会变化的，由flex-direction决定。

2. `flex-wrap:` 换行
* nowrap(默认值): 不换行
* wrap: 换行，第一行在上方
* wrap-reverse: 换行，第一行在下方

3. `flex-flow:` 是flex-direction和flex-wrap的简写形式
* 默认值为row nowrap

4. `justify-content:` 主轴上的对齐方式
* flex-start(默认值): 左对齐
* flex-end: 右对齐
* center: 居中
* space-between: 两端对齐，项目之间的间隔都相等
* space-around: 每个项目两侧的间隔相等，所以项目之间的间隔比项目与边框的间隔大一倍
* space-evenly: 所有项目与项目之间间隔相等，包括项目与边框的间隔
* 注意：该项目将等分剩余空间，如果剩余空间为负值，则项目会等比压缩。

5. `align-items:` 交叉轴上的对齐方式
* flex-start: 交叉轴的起点对齐
* flex-end: 交叉轴的终点对齐
* center: 交叉轴的中点对齐
* baseline: 项目的第一行文字的基线对齐
* stretch(默认值):  **如果项目未设置高度或设为auto，将占满整个容器的高度**

6. `align-content: `多根轴线的对齐方式
* flex-start: 与交叉轴的起点对齐
* flex-end: 与交叉轴的终点对齐
* center: 与交叉轴的中点对齐
* space-between: 与交叉轴两端对齐，轴线之间的间隔平均分布
* space-around: 每根轴线两侧的间隔都相等，所以轴线之间的间隔比轴线与边框的间隔大一倍
* stretch(默认值): 轴线占满整个交叉轴

### 3. Flex项目属性
1. `order:` 定义项目的排列顺序
* 数值越小，排列越靠前，默认为0
2. `flex-grow:` 定义项目的放大比例
* 默认值为0，即如果存在剩余空间也不放大。
3. `flex-shrink:` 定义了项目的缩小比例
* 默认值为1，如果空间不足，该项目将缩小
4. `flex-basis:` 定义了在分配**多余空间之前**，项目占据的主轴空间(main size)
* 默认值为auto，即项目的本来大小
5. `flex:` 是flex-grow, flex-shrink 和 flex-basis的简写，默认值为0 1 auto
6. `align-self:` 允许单个项目有与其他项目不一样的对齐方式
* 该属性可覆盖align-items属性
* 默认值为auto，表示继承父元素的align-items属性，如果没有父元素则等同于stretch
7. `flex:` 是一个简写属性，用于同时设置`flex-grow`, `flex-shrink` 和 `flex-basis`。
* 注意：在flex属性中，如果只写一个无单位数，那么它表示flex-grow，而flex-shrink为1，flex-basis为0%
* 由于flex-basis都是0%，项目初始尺寸为0，所有空间通过flex-grow分配

### 4. flex-grow,flex-shrink,flex-basis的关系
1. `flex-basis:`
* 定义了项目在分配**多余空间之前**的主轴尺寸（main size）。它可以设置为一个长度值（如20%、100px）或关键字（如auto）
* 默认值为auto，即项目的本身大小(**由内容或width/height属性决定**)
2. `flex-grow:`
* 定义了项目的放大比例，决定了当容器有额外空间时，项目应该如何分配这些空间。
* 默认值为0，即如果存在剩余空间也不放大。
3. `flex-shrink:`
* 在主轴上空间不足时，项目应该如何缩减。
* 默认值为1，即如果空间不足，该项目将缩小。

### 5. 核心计算原理详解
1. flex-grow 计算（**当有剩余空间时**）
* 公式：项目最终宽度 = flex-basis + (项目的flex-grow / 所有项目flex-grow总和) × 剩余空间
* 示例：
 - 容器宽度：600px
 - 项目flex-basis：100px, 100px, 100px
 - 项目flex-grow：1, 2, 1
 - 计算：
   - 总基准宽度 = 100 + 100 + 100 = 300px
   - 剩余空间 = 600 - 300 = 300px
   - flex-grow总和 = 1 + 2 + 1 = 4
   - 每个grow单位分配 = 300px / 4 = 75px
   - 项目1最终宽度 = 100 + 1×75 = 175px
   - 项目2最终宽度 = 100 + 2×75 = 250px
   - 项目3最终宽度 = 100 + 1×75 = 175px
  
2. flex-shrink 计算（**当空间不足时**）
* 公式：每个项目收缩量 = (每个项目的flex-shrink × 项目的flex-basis / 所有项目的flex-shrink × flex-basis总和) × 超出空间
  - 计算：
  - 1. 第一步：计算加权因子：每个项目的加权因子 = flex-shrink * flex-basis
  - 2. 第二步：计算所有项目的加权因子之和
  - 3. 第三步：计算每个项目的收缩比例：项目的加权因子 / 加权因子之和
  - 4. 第四步：每个项目的收缩量 = 收缩比例 * 超出空间

* 示例：
  - 容器宽度：400px
  - 项目flex-basis：150px, 200px, 150px
  - 项目flex-shrink：1, 2, 1
  - 总基准宽度 = 150 + 200 + 150 = 500px
  - 超出空间 = 500   -400 = 100px
  - 收缩因子总和 = (1×150) + (2×200) + (1×150) = 150 + 400 + 150 = 700
  - 收缩单位 = 100px / 700 ≈ 0.142857
  - 项目1收缩量 = 1×150×0.142857 ≈ 21.43px
  - 项目2收缩量 = 2×200×0.142857 ≈ 57.14px
  - 项目3收缩量 = 1×150×0.142857 ≈ 21.43px
  - 项目1最终宽度 = 150   -21.43 ≈ 128.57px
  - 项目2最终宽度 = 200   -57.14 ≈ 142.86px
  - 项目3最终宽度 = 150 - 21.43 ≈ 128.57px

### 特殊情况
- flex-grow为0：项目**不参与剩余空间**分配
- flex-shrink为0：项目不收缩，即使**空间不足**也不会缩小
- flex-basis为0%：项目`初始尺寸为0`，可以认为有剩余空间时，所有空间通过`flex-grow`分配