# CSS 变量与预处理器

> 官方文档：[MDN - CSS 自定义属性](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties)

---

## 一、CSS 变量（Custom Properties）

### 1.1 核心概念

CSS 变量（也叫 CSS 自定义属性）允许你定义**可复用的值**，通过 `--` 前缀声明，`var()` 函数使用。

> 通俗类比：CSS 变量就像程序中的"常量"——定义一次，到处使用，修改一处，全局生效。

### 1.2 基本语法

```css
/* 声明变量 */
:root {
  --primary-color: #3498db;
  --font-size-base: 16px;
  --spacing-unit: 8px;
  --border-radius: 4px;
}

/* 使用变量 */
.button {
  background: var(--primary-color);
  font-size: var(--font-size-base);
  padding: var(--spacing-unit) calc(var(--spacing-unit) * 2);
  border-radius: var(--border-radius);
}
```

### 1.3 变量作用域与继承

```css
/* 全局变量（所有元素可用） */
:root {
  --color: blue;
}

/* 局部变量（只在 .card 及其子元素中有效） */
.card {
  --color: red;
  background: var(--color); /* red */
}

.card .title {
  color: var(--color); /* red —— 继承自 .card */
}

.sidebar {
  color: var(--color); /* blue —— 继承自 :root */
}
```

```
:root (--color: blue)
  ├── .card (--color: red)     ← 覆盖
  │    └── .title               ← 使用 red（继承 .card）
  └── .sidebar                  ← 使用 blue（继承 :root）
```

### 1.4 默认值（fallback）

```css
.element {
  /* 如果 --my-color 未定义，则使用 #333 */
  color: var(--my-color, #333);

  /* 多层 fallback */
  color: var(--my-color, var(--fallback-color, black));
}
```

### 1.5 动态主题切换

```css
/* 定义主题 */
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --border-color: #e0e0e0;
}

[data-theme="dark"] {
  --bg-color: #1a1a2e;
  --text-color: #e0e0e0;
  --border-color: #333355;
}

/* 使用主题变量 */
body {
  background: var(--bg-color);
  color: var(--text-color);
  border-color: var(--border-color);
}
```

```javascript
// JS 切换主题
document.documentElement.setAttribute('data-theme', 'dark')

// 或者直接修改 CSS 变量
document.documentElement.style.setProperty('--primary-color', '#e74c3c')
```

---

## 二、CSS 变量 vs SCSS 变量

| 对比项 | CSS 变量 | SCSS 变量 |
|--------|---------|----------|
| 声明 | `--name: value` | `$name: value` |
| 使用 | `var(--name)` | `$name` |
| 运行时 | ✅ 浏览器运行时存在 | ❌ 编译后不存在 |
| 可修改 | ✅ JS 可动态修改 | ❌ 编译后固定 |
| 作用域 | DOM 层级继承 | 文件/块级作用域 |
| 媒体查询 | ✅ 可在媒体查询中重定义 | ❌ 编译时固定 |
| 兼容性 | ✅ 现代浏览器 | ✅ 编译为普通 CSS |

### 核心区别

```css
/* CSS 变量 —— 运行时生效 */
:root { --color: blue; }
@media (prefers-color-scheme: dark) {
  :root { --color: white; }
}
.element { color: var(--color); } /* 运行时根据媒体查询动态决定 */
```

```scss
// SCSS 变量 —— 编译时固定
$color: blue;
.element { color: $color; } /* 编译后永远是 color: blue，不可变 */
```

---

## 三、SCSS 预处理器基础

### 3.1 变量

```scss
$primary: #3498db;
$font-stack: 'Helvetica', sans-serif;

body {
  font-family: $font-stack;
  color: $primary;
}
```

### 3.2 嵌套

```scss
.nav {
  padding: 10px;

  &__item {
    display: inline-block;

    &:hover {
      color: red;
    }
  }

  &__link {
    text-decoration: none;
  }
}
/* 编译后：
.nav { padding: 10px; }
.nav__item { display: inline-block; }
.nav__item:hover { color: red; }
.nav__link { text-decoration: none; }
*/
```

### 3.3 Mixin（混入）

```scss
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

@mixin respond-to($breakpoint) {
  @if $breakpoint == mobile {
    @media (max-width: 576px) { @content; }
  } @else if $breakpoint == tablet {
    @media (max-width: 768px) { @content; }
  }
}

.card {
  @include flex-center;
  padding: 20px;

  @include respond-to(mobile) {
    padding: 10px;
  }
}
```

### 3.4 函数

```scss
@function px-to-rem($px, $base: 16px) {
  @return ($px / $base) * 1rem;
}

.text {
  font-size: px-to-rem(24px);    // 1.5rem
  padding: px-to-rem(16px);      // 1rem
}
```

### 3.5 继承 / 扩展

```scss
%button-base {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.button-primary {
  @extend %button-base;
  background: blue;
  color: white;
}

.button-danger {
  @extend %button-base;
  background: red;
  color: white;
}
```

---

## 四、什么时候用什么？

| 场景 | 推荐 | 原因 |
|------|------|------|
| 主题色/全局变量 | **CSS 变量** | 可动态修改，支持主题切换 |
| 响应式变量 | **CSS 变量** | 可在媒体查询中重定义 |
| 工具函数（flex-center 等） | **SCSS mixin** | 需要编译时生成代码 |
| 复杂嵌套 | **SCSS 嵌套** | 减少重复书写 |
| 颜色/字体函数 | **SCSS 函数** | 编译时计算 |
| JS 需要修改的值 | **CSS 变量** | 唯一支持运行时修改 |

**现代趋势**：越来越多的场景可以用 CSS 变量替代 SCSS 变量，但 SCSS 的嵌套、mixin、函数等预处理能力仍然不可替代。

---

## 五、常见面试题

### Q1：CSS 变量和 SCSS 变量的区别？

**答：**
- CSS 变量是**运行时**的，存在于浏览器中，可通过 JS 动态修改，支持 DOM 层级继承和媒体查询重定义。
- SCSS 变量是**编译时**的，编译后不存在，值固定。优势是支持计算、函数、条件判断。
- 需要动态切换（如主题切换）用 CSS 变量，需要编译时处理（如 mixin、函数）用 SCSS。

### Q2：如何实现暗黑模式切换？

**答：** 使用 CSS 变量。在 `:root` 定义亮色主题变量，在 `[data-theme="dark"]` 选择器中覆盖为暗色值。JS 切换时只需修改根元素的 `data-theme` 属性。CSS 变量的继承机制确保所有使用变量的元素自动更新。

### Q3：CSS 变量的作用域是什么？

**答：** CSS 变量遵循 **DOM 层级继承**。在 `:root` 上定义的变量全局可用；在某个元素上定义的变量只在该元素及其子元素中可用；子元素可以覆盖继承来的变量值。这和 SCSS 变量的文件作用域完全不同。

---

## 六、注意事项

1. **CSS 变量命名区分大小写**：`--myColor` 和 `--mycolor` 是不同的变量
2. **CSS 变量不能用于属性名**：只能用于属性值
3. **var() 的 fallback 不会处理空值**：如果变量定义为空字符串 `--color: ;`，fallback 不会生效
4. **SCSS 嵌套不要超过 3 层**：过深的嵌套导致选择器权重过高，难以覆盖
