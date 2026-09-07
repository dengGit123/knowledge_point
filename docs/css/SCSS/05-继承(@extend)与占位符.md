# SCSS 继承（@extend）与占位符选择器

> 📖 官方文档：[Sass @extend](https://sass-lang.com/documentation/at-rules/extend/)

### 一、概述

**`@extend` 让一个选择器"继承"另一个选择器的全部样式**——编译后，继承者会被追加到被继承选择器的选择器列表里，共享同一份 CSS 规则。

它和 mixin 的区别一句话说清：**mixin 是"复制样式"，`@extend` 是"合并选择器"**。

```scss
.error {
  border: 1px #f00;
  background-color: #fdd;
}

.error--serious {
  @extend .error; // 继承 .error 的所有样式
  border-width: 3px;
}
```

```css
/* 编译结果：.error--serious 被"加进" .error 的规则里 */
.error, .error--serious {
  border: 1px #f00;
  background-color: #fdd;
}
.error--serious {
  border-width: 3px;
}
```

HTML 里只需要写一个类，不用再写 `class="error error--serious"`。

### 二、工作原理

`@extend` 的语义是：**"让匹配继承者的元素，表现得像同时也匹配了被继承的选择器"**。等价于你手动在每个相关元素的 HTML 上加了被继承的类。

#### 1. 不止继承一条规则——所有用到该选择器的规则都会被扩展

```scss
.error:hover {
  background-color: #fee;
}

.error--serious {
  @extend .error;
  border-width: 3px;
}
```

```css
/* :hover 规则也被扩展了 */
.error:hover, .error--serious:hover {
  background-color: #fee;
}
.error--serious {
  border-width: 3px;
}
```

#### 2. 智能统一化（unification）

Sass 在扩展时会做智能处理，避免生成无用选择器：

- 不可能匹配任何元素的选择器（如 `#main#footer`）不会生成
- 类型不兼容的选择器被跳过：`nav` 上扩展的样式不会拼给 `p.info`（`p` 和 `nav` 不可能同时匹配）
- 冗余选择器会被裁剪，同时保证特异性不低于继承者

```scss
.content nav.sidebar {
  @extend .info;
}

p.info { color: #dee9fc; } // 不会被扩展：p 与 nav 互斥

main.content .info { font-size: 0.8em; }
// → main.content .info, main.content nav.sidebar（自动合并，不生成冗余）
```

> ⚠️ **注意：** `@extend` 在**整个样式表编译完成后**才解析。因此 `@extend .error` 不会影响 `.error { &__icon { ... } }` 内部生成的选择器（`.error__icon` 是编译后才形成的，extend 看不见它们的内部结构关系）。

### 三、占位符选择器 `%`

#### 1. 为什么需要占位符

直接 `@extend .error` 有个问题：`.error` 本身也会输出到 CSS 里，哪怕没人直接用它。**占位符选择器 `%` 就是为"只被继承、不直接使用"的场景准备的**——它不会出现在编译结果里。

```scss
%button-base {
  padding: 8px 16px;
  border: none;
  cursor: pointer;
}

.button-primary { @extend %button-base; background: blue; }
.button-danger  { @extend %button-base; background: red; }
```

```css
/* %button-base 本身不输出，两个类合并到一条规则 */
.button-primary, .button-danger {
  padding: 8px 16px;
  border: none;
  cursor: pointer;
}
.button-primary { background: blue; }
.button-danger { background: red; }
```

#### 2. 私有占位符

以 `-` 或 `_` 开头的占位符（`%-button-base`）是**私有的**，只能在定义它的文件内被 `@extend`。

### 四、`!optional` 可选扩展

默认情况下，`@extend` 的目标选择器如果在样式表中不存在，会**报错**（防止拼写错误、改名漏改）。加 `!optional` 后目标不存在也不报错，静静跳过：

```scss
// 如果整个项目里没有 .no-such-class，这行会报错
@extend .no-such-class;

// 加了 !optional 就不会报错
@extend .no-such-class !optional;
```

> 💡 **提示：** 写通用 mixin/组件库时，扩展可能存在也可能不存在的第三方选择器，用 `!optional` 更健壮。

### 五、扩展的作用域

使用模块系统（`@use`/`@forward`）时，`@extend` 只影响**上游模块**（你加载的模块）中的规则，范围可预测。

> ⚠️ **注意：** 老的 `@import` 体系里 **extend 是全局的**——会影响所有导入链上的样式表，牵一发动全身。这也是 `@import` 被淘汰的原因之一。

### 六、@extend 的限制（必读）

#### 1. 只能扩展"简单选择器"

复合选择器（`.message.info`）和复杂选择器（`.main .info`）不能直接扩展：

```scss
.alert {
  @extend .message.info; // ❌ 报错：应写 @extend .message, .info;
  @extend .main .info;   // ❌ 报错：应写 @extend .info;
}
```

#### 2. `@media` 内不能扩展外面的选择器

`@media` 里的 `@extend` 只能扩展**同一媒体查询上下文内**的选择器，不能跨出去：

```scss
@media screen and (max-width: 600px) {
  .error--serious {
    @extend .error; // ❌ 报错：".error" was extended in @media, but used outside it.
  }
}

.error {
  border: 1px #f00;
}
```

> 💡 **提示：** 需要在媒体查询里复用样式时，用 **mixin** 替代。

#### 3. 生成选择器可能爆炸

复杂选择器互相扩展时，Sass 为了保险会生成多种嵌套组合（HTML 结构未知，只能都覆盖），选择器数量可能急剧膨胀。

### 七、@extend 还是 @mixin？（关键选型）

| 对比项 | `@extend` | `@mixin` |
| --- | --- | --- |
| 本质 | 合并选择器，共享一份规则 | 复制样式到引入处 |
| 可传参 | ❌ 不能 | ✅ 能 |
| 输出体积 | 小（一条规则多个选择器） | 大（引入几次复制几份） |
| 样式来源 | 不直观（规则在别处） | 直观（样式就在 @include 处） |
| 级联行为 | 特异性按被扩展规则的顺序算，易踩坑 | 按引入处位置算，直观 |
| 适用场景 | **语义相关的类**（`.error--serious` 是一种 `.error`） | **无语义的样式集合**（弹性布局、省略号） |

官方的经验法则：**表达"类与类的语义关系"用 `@extend`，复用"一组样式"用 `@mixin`**。此外现代 web 服务器基本都开 gzip，重复文本压缩率极高——**不要为了省那点 CSS 体积硬用 `@extend`**，按场景选最合适的。

### 八、实际应用场景

```scss
// 场景一：语义化消息类型（extend 的正当用途）
%message-shared {
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 4px;
}

.message-success { @extend %message-shared; border-color: green; }
.message-warning { @extend %message-shared; border-color: orange; }
.message-error   { @extend %message-shared; border-color: red; }
```

```scss
// 场景二：BEM 修饰符继承块
.button {
  padding: 8px 16px;
  &--large { @extend .button; padding: 12px 24px; } // 需谨慎，选择器合并位置可能出乎意料
}
```

> ⚠️ **注意：** 场景二这种"嵌套内部 extend 外层选择器"的写法容易让人困惑，实践中更推荐把公共部分抽成 `%placeholder` 或 mixin，结构更清晰。

### 九、常见问题与注意事项

1. **extend 的级联位置易踩坑**：被扩展规则的优先级由**被扩展规则所在位置**决定，而不是 `@extend` 写在哪。覆盖样式时可能"怎么都盖不住"，先想想是不是 extend 搬的规则。
2. **永远不要 `@extend` 后代选择器外的复杂结构**，也尽量别在大型项目里 extend 具体类——用 `%placeholder` 收敛影响范围。
3. **跨模块 extend** 受模块作用域限制，第三方库的类不一定能被 extend 到。
4. **extend 解析在编译末尾**：依赖"extend 先于/后于某规则"的顺序逻辑都不可靠。

### 十、总结

- `@extend` = 合并选择器共享规则；`%placeholder` = 只供继承、不输出的选择器
- 只能扩展简单选择器；`@media` 内不能向外 extend；目标不存在会报错（`!optional` 可跳过）
- mixin 优先、extend 慎用：需要传参选 mixin，语义类继承选 extend
- 输出体积的差异在 gzip 面前微不足道，**可维护性才是选型标准**
