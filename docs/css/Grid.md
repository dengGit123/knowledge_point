### grid布局
网格布局（Grid Layout）是CSS3中引入的一种二维布局系统，它允许我们通过定义行和列来创建复杂的页面布局。
### 1. 容器属性
- 1. `display: grid;`：将元素设置为网格容器。
```css
.container {
  display: grid; /* 块级网格 */
  display: inline-grid; /* 行内网格 */
}
```
- 2. `grid-template-columns:`：定义**列**的宽度和数量。例如，`"100px 1fr"`表示两列，第一列宽为100像素，第二列占据剩余空间。
- 3. `grid-template-rows:`：定义**行**的行高和数量。例如，`"50px auto"`表示两行，第一行高为50像素，第二行高度自动调整。
* 1. 它们可以设置多个值，每个值代表一列或一行的尺寸
* `fr` 单位：表示剩余空间的比例
* `repeat() `函数：可以重复定义列或行的尺寸
* `auto-fill` 和 `auto-fit` 关键字：自动填充或适应网格项
* `minmax()` 函数：定义最小和最大尺寸
```css
.container {
  /* 固定尺寸 */
  grid-template-columns: 100px 200px 300px;
  grid-template-rows: 50px 100px;
  
  /* fr单位 (分数单位) */
  grid-template-columns: 1fr 2fr 1fr; /* 中间列是两侧的两倍宽 */
  
  /* repeat() 函数 */
  grid-template-columns: repeat(3, 100px); /* 创建3个100px的列 */
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); /* 自动填充 */
  
  /* 为网格线命名 */
  grid-template-columns: [first] 100px [second] 200px [third] 100px [end];
  
  /* minmax() 函数 */
  grid-template-columns: 1fr minmax(200px, 1fr) 1fr;
}
```
- 4. `grid-template-areas`：通过区域名称定义网格布局。
* 用于定义网格区域，可以将网格划分为多个区域，然后通过项目属性`grid-area`将项目放入指定区域
* 区域名称之间用空格分隔，表示网格的行和列
```css
.container {
  grid-template-areas:
    "header header header"
    "sidebar content sidebar"
    "footer footer footer";
}
.item1 { grid-area: header; }
.item2 { grid-area: sidebar; }
.item3 { grid-area: content; }
.item4 { grid-area: footer; }
```
- 5. `grid-gap`：定义行和列之间的间隙。
* `grid-gap` 属性用于设置网格项之间的间隙，包括行间距和列间距
* 它是一个简写属性，可以同时设置`grid-row-gap`（行间距）和`grid-column-gap`（列间距）。
```css
.container {
  grid-gap: 10px; /* 所有行和列之间的间隙为10像素 */
  /* 或者分开设置 */
  row-gap: 15px; /* 行间距 */
  column-gap: 10px; /* 列间距 */
}
```
- 6. `justify-items`：定义**网格项**在列方向上的对齐方式。
* 控制网格项在列方向上的对齐方式
* 例如，`justify-items: center;` 将使**所有网格项**在列方向上居中对齐
- 7. `align-items`：定义**网格项**在行方向上的对齐方式。
* 控制**网格项**在行方向上的对齐方式
* 例如，`align-items: end;` 将使**所有网格项**在行方向上底部对齐
```css
.container {
  justify-items: start | end | center | stretch;
  align-items: start | end | center | stretch;
}
```
- 8. `justify-content / align-content`：当网格总大小**小于容器**时，控制整个网格在容器内的对齐
```css
.container {
  justify-content: start | end | center | stretch | space-around | space-between | space-evenly;
  align-content: start | end | center | stretch | space-around | space-between | space-evenly;
  
  /* 简写 */
  place-content: <align-content> <justify-content>;
}
```
- 9.` grid-auto-columns / grid-auto-rows：`定义隐式网格的列宽和行高。
```css
.container {
  grid-auto-columns: 100px; /* 隐式创建的列宽100px */
  grid-auto-rows: minmax(100px, auto); /* 隐式创建的行最小100px */
}
```

### 2. 项目属性
- 1. `grid-column / grid-row`：定义项目所在的列和行。
```css
.item {
  /* 使用行线号 */
  grid-column: 1 / 3; /* 从第1列线到第3列线 */
  grid-row: 2 / 4; /* 从第2行线到第4行线 */
  
  /* 使用 span 关键字 */
  grid-column: 1 / span 2; /* 从第1列线开始，跨越2列 */
  grid-row: span 3; /* 跨越3行 */
  
  /* 单独属性 */
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 2;
  grid-row-end: span 2;
}
```
- 2. `grid-area`：通过区域名称定位项目。
```css
.container {
  grid-template-areas:
    "header header header"
    "sidebar content sidebar"
    "footer footer footer";
}
.item {
  grid-area: content; /* 定位到名为'content'的区域 */
}
```
- 3. `justify-self / align-self`：定义项目在单元格内的对齐方式。
* 控制**单个网格项**在其所在单元格内的对齐方式，覆盖容器级别的对齐设置
```css
.item {
  justify-self: start | end | center | stretch;
  align-self: start | end | center | stretch;
  
  /* 简写 */
  place-self: <align-self> <justify-self>;
}
```