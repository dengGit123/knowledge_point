### 1. Flexbox(弹性布局)
* 弹性布局css3新增的布局方式，用于替代早期的浮动布局和定位布局。
> 💡 **提示：** 
> 1. 子项的 `min-width`,`min-height`  默认是 `auto`, 受内容最小宽度限制，无法缩小到设定值。在**动态控制宽度**的 `Flex` 布局中，如果希望宽度能**自由缩小**，请务必给子项加上 `min-width: 0`
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
* space-between: 两端对齐，子项之间的间隔都相等
* space-around: 每个子项两侧的间隔相等，所以子项之间的间隔比子项与边框的间隔大一倍
* space-evenly: 所有子项与子项之间间隔相等，包括子项与边框的间隔
* 注意：该子项将等分剩余空间，如果剩余空间为负值，则子项会等比压缩。

5. `align-items:` 交叉轴上的对齐方式
* flex-start: 交叉轴的起点对齐
* flex-end: 交叉轴的终点对齐
* center: 交叉轴的中点对齐
* baseline: 子项的第一行文字的基线对齐
* <div style="color:red"><em>stretch(默认值)</em>:  如果子项<span style="color:#0072FF">未设置高度或设为auto</span>，将占满整个容器的高度(即占满侧轴)</div>

6. `align-content: `多根轴线的对齐方式
* flex-start: 与交叉轴的起点对齐
* flex-end: 与交叉轴的终点对齐
* center: 与交叉轴的中点对齐
* space-between: 与交叉轴两端对齐，轴线之间的间隔平均分布
* space-around: 每根轴线两侧的间隔都相等，所以轴线之间的间隔比轴线与边框的间隔大一倍
* stretch(默认值): 轴线占满整个交叉轴

### 3. Flex子项属性
1. `order:` 定义子项的排列顺序
* 数值越小，排列越靠前，默认为0
2. `flex-grow:` 定义子项的放大比例
* 默认值为0，即如果存在剩余空间也不放大。
3. `flex-shrink:` 定义了子项的缩小比例
* 默认值为1，如果空间不足，该子项将缩小
4. `flex-basis:` 定义了在分配**多余空间之前**，子项占据的主轴空间(main size)
* 默认值为auto，即子项的本来大小
5. `flex:` 是flex-grow, flex-shrink 和 flex-basis的简写，默认值为0 1 auto
6. `align-self:` 允许单个子项有与其他子项不一样的对齐方式
* 该属性可覆盖align-items属性
* 默认值为auto，表示继承父元素的align-items属性，如果没有父元素则等同于stretch
7. `flex:` 是一个简写属性，用于同时设置`flex-grow`, `flex-shrink` 和 `flex-basis`。
* 注意：在flex属性中，如果只写一个无单位数，那么它表示flex-grow，而flex-shrink为1，flex-basis为0%
* 由于flex-basis都是0%，子项初始尺寸为0，所有空间通过flex-grow分配

### 4. flex-grow,flex-shrink,flex-basis的关系
1. `flex-basis:`
* 定义了子项在分配**多余空间之前**的主轴尺寸（main size）。它可以设置为一个长度值（如20%、100px）或关键字（如auto）
* 默认值为auto，即子项的本身大小(**由内容或width/height属性决定**)
2. `flex-grow:`
* 定义了子项的放大比例，决定了当容器有额外空间时，子项应该如何分配这些空间。
* 默认值为0，即如果存在剩余空间也不放大。
3. `flex-shrink:`
* 在主轴上空间不足时，子项应该如何缩减。
* 默认值为1，即如果空间不足，该子项将缩小。

### 5. 核心计算原理详解
1. flex-grow 计算（**当有剩余空间时**）
* 公式：子项最终宽度 = flex-basis + (子项的flex-grow / 所有子项flex-grow总和) × 剩余空间
* 示例：
 - 容器宽度：600px
 - 子项flex-basis：100px, 100px, 100px
 - 子项flex-grow：1, 2, 1
 - 计算：
   - 总基准宽度 = 100 + 100 + 100 = 300px
   - 剩余空间 = 600 - 300 = 300px
   - flex-grow总和 = 1 + 2 + 1 = 4
   - 每个grow单位分配 = 300px / 4 = 75px
   - 子项1最终宽度 = 100 + 1×75 = 175px
   - 子项2最终宽度 = 100 + 2×75 = 250px
   - 子项3最终宽度 = 100 + 1×75 = 175px
  
2. flex-shrink 计算（**当空间不足时**）
* 公式：每个子项收缩量 = (每个子项的flex-shrink × 子项的flex-basis / 所有子项的flex-shrink × flex-basis总和) × 超出空间
  - 计算：
  - 1. 第一步：计算加权因子：每个子项的加权因子 = flex-shrink * flex-basis
  - 2. 第二步：计算所有子项的加权因子之和
  - 3. 第三步：计算每个子项的收缩比例：子项的加权因子 / 加权因子之和
  - 4. 第四步：每个子项的收缩量 = 收缩比例 * 超出空间

* 示例：
  - 容器宽度：400px
  - 子项flex-basis：150px, 200px, 150px
  - 子项flex-shrink：1, 2, 1
  - 总基准宽度 = 150 + 200 + 150 = 500px
  - 超出空间 = 500   -400 = 100px
  - 收缩因子总和 = (1×150) + (2×200) + (1×150) = 150 + 400 + 150 = 700
  - 收缩单位 = 100px / 700 ≈ 0.142857
  - 子项1收缩量 = 1×150×0.142857 ≈ 21.43px
  - 子项2收缩量 = 2×200×0.142857 ≈ 57.14px
  - 子项3收缩量 = 1×150×0.142857 ≈ 21.43px
  - 子项1最终宽度 = 150   -21.43 ≈ 128.57px
  - 子项2最终宽度 = 200   -57.14 ≈ 142.86px
  - 子项3最终宽度 = 150 - 21.43 ≈ 128.57px

### 特殊情况
- flex-grow为0：子项**不参与剩余空间**分配
- flex-shrink为0：子项不收缩，即使**空间不足**也不会缩小
- flex-basis为0%：子项`初始尺寸为0`，可以认为有剩余空间时，所有空间通过`flex-grow`分配