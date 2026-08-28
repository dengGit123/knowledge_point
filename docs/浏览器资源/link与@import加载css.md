# link 与 @import 加载 CSS

> 📖 官方文档：[MDN - link 元素](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/link) ｜ [MDN - @import](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@import) ｜ [web.dev - 渲染阻塞资源](https://web.dev/articles/render-blocking-resources)

---

### 一、概述

把 CSS 引入页面有两种"外链"方式：HTML 的 `<link>` 标签和 CSS 的 `@import` 规则。两者都能加载外部样式表，但**加载时机、性能表现、可控性**完全不同——这是前端面试的经典考题，更是性能优化的实战知识点。

一句话预览核心结论：**生产环境默认用 `<link>`；`@import` 主要服务于"CSS 模块化组织"和 cascade layers，不建议用于 HTML 主样式表的引入。**

```html
<!-- 方式一：HTML 的 link 标签（推荐） -->
<link rel="stylesheet" href="style.css" />
```

```css
/* 方式二：CSS 的 @import 规则 */
@import url("style.css");
```

> 💡 **通俗理解**：`<link>` 像快递收货地址写在**订单首页**——仓库（浏览器预加载扫描器）一打开订单就知道要发哪些包裹，所有包裹**并行发出**；`@import` 像包裹 A 里夹了张字条"还需要包裹 B"——仓库必须**先拆完 A** 才能发现 B 的存在，运输变成一环扣一环的串行。

### 二、特点详解

#### 1. `<link>` 的特点

`<link>` 是 HTML 标签，定义当前文档与外部资源的**链接关系**。虽然最常用于加载 CSS，但它的能力远不止于此：

| 能力 | 语法 | 说明 |
|------|------|------|
| 加载样式表 | `rel="stylesheet"` | 最常用；会**阻塞渲染**（在它完成前页面不绘制） |
| 备选样式表 | `rel="stylesheet alternate" title="夜间"` | 提供多套主题，用户可在浏览器菜单切换——**只有 link 支持** |
| 资源提示 | `rel="preload"` / `preconnect` / `dns-prefetch` | 提前下载/建连，见 [preload等加载优化.md](./preload等加载优化.md) |
| 站点图标 | `rel="icon"` | favicon |
| 按媒体加载 | `media="print"` | 条件匹配才应用；**仍会下载**，但不阻塞当前渲染 |

```html
<head>
  <!-- 阻塞渲染的主样式：匹配当前设备，必须等它加载完才绘制页面 -->
  <link rel="stylesheet" href="main.css" />

  <!-- 打印样式：不匹配当前设备 → 依然下载（低优先级），但不阻塞屏幕渲染 -->
  <link rel="stylesheet" href="print.css" media="print" />

  <!-- 备选主题：默认不应用，用户通过浏览器"页面样式"菜单切换 -->
  <link rel="stylesheet alternate" href="dark.css" title="夜间模式" />
</head>
```

#### 2. `@import` 的特点

`@import` 是 **CSS 层面的导入规则**，只能写在样式表（`.css` 文件或 `<style>` 块）内部，把另一个样式表"合并"进来：

```css
/* ── main.css ─────────────────────────────── */

@import url("reset.css");            /* 标准写法 */
@import "variables.css";             /* 可省略 url() 和引号 */
@import url("theme.css") screen and (min-width: 1024px);  /* 可带媒体条件 */

/* @import 之后才能写其他规则 */
body {
  margin: 0;
}
```

**位置铁律**：`@import` 必须位于样式表**所有规则之前**，仅允许排在 `@charset` 和 `@layer` 语句（layer statement，只声明层顺序的那种）之后——位置不对整条规则会被浏览器静默忽略，控制台报 `Ignored @import rule`：

```css
/* ✅ 合法：@charset、@layer 语句可以出现在 @import 前 */
@charset "UTF-8";
@layer base, components, utilities;
@import url("base.css") layer(base);
@import url("components.css") layer(components);

/* ❌ 非法：出现在普通规则之后 → 整条被忽略 */
body { margin: 0; }
@import url("late.css");   /* 控制台警告：Ignored @import rule */
```

**三个较新的可选子句**（声明在 url 之后）：

| 子句 | 作用 | 示例 | 支持 |
|------|------|------|------|
| `layer(名称)` | 把导入的样式放进**级联层**（Cascade Layers）——这是把外部文件放进 layer 的**唯一途径**（`@import` 不能嵌套进 `@layer` 块） | `@import url("a.css") layer(base);` | Chrome 99+ / Firefox 97+ / Safari 15.4+ |
| `supports(条件)` | 仅当浏览器支持某特性时才导入 | `@import url("grid.css") supports(display: grid);` | Chrome 66+ / Firefox 83+ / Safari 16.4+ |
| 媒体查询 | 仅当媒体条件匹配时导入 | `@import url("m.css") screen and (max-width: 600px);` | 全平台 |

### 三、核心区别（重点）

#### 1. 总对比表

| 对比项 | `<link>` | `@import` |
|--------|----------|-----------|
| **归属** | HTML 标签 | CSS 语法规则 |
| **写在哪** | HTML 文档内（通常 `<head>`） | `.css` 文件或 `<style>` 内部 |
| **发现时机** | HTML 解析时立即发现（预加载扫描器**并行**预取） | 等宿主 CSS 下载并解析后才被发现——**串行链** |
| **渲染阻塞** | 匹配媒体即阻塞渲染；`media` 不匹配则不阻塞 | 阻塞宿主样式表的应用，拉长阻塞链 |
| **DOM 可控** | ✅ `createElement('link')` 动态增删 | ❌ 无对应 DOM 接口 |
| **位置限制** | 无（放 `<head>` 即可） | 必须在所有规则之前（`@charset`/`@layer` 语句除外） |
| **主题切换** | ✅ `alternate stylesheet` | ❌ |
| **级联层** | 配合 `@layer` 块使用 | ✅ `layer()` 子句——外部文件入层的唯一途径 |
| **特性检测** | ❌ | ✅ `supports()` 子句 |
| **兼容性** | 全平台 | 基础语法现代全支持；`layer()`/`supports()` 子句较新 |
| **构建工具处理** | 原生支持、可提取拆包 | 常被 SCSS/postcss-import 在**构建期编译掉** |

#### 2. 性能差异：并行 vs 串行（核心原理）

两者的性能差距源自浏览器发现资源的**时机**不同：

```
方式一：<link> 并行加载

HTML 解析 ──┬── 发现 main.css   ──→ 下载 ──→ 应用
            ├── 发现 print.css  ──→ 下载（低优先级）
            └── 发现 theme.css  ──→ 下载
            （预加载扫描器一口气发现全部，同时开跑）✅


方式二：@import 串行加载

HTML 解析 ──→ 发现 main.css ──→ 下载 ──→ 解析 main.css
                                              │ 此时才发现 @import
                                              ▼
                                         下载 theme.css ──→ 应用
            （第二跳要等第一跳完成，每多一层 @import 多一轮等待）❌
```

分步解释：

1. 浏览器有个**预加载扫描器（preload scanner）**：主解析器逐字解析 HTML 时，扫描器抢先扫描原始字节流，把 `<link>`、`<img>` 等引用的资源**立刻并行发起下载**——`<link>` 因此受益；
2. `@import` 藏在 CSS 文件**内部**，扫描器不解析 CSS 内容，必须等宿主 CSS 下载完、解析到那一行才"露出"下一个 URL——**每层 @import 多一轮往返（RTT）**；
3. 多个 `@import` 链在最坏情况下形成"接力赛"，直接拖慢**首次渲染时间（FCP）**，Lighthouse 的"消除渲染阻塞资源"审计会点名此类链式请求。

> ⚠️ **注意：** 老资料常说"@import 要等页面加载完才下载"，这个表述不准确。准确说法是：**@import 的目标文件要等宿主 CSS 下载并解析后才开始下载**——页面其他部分加载与否不是关键，"宿主 CSS 解析完成"才是触发点。

#### 3. `link media` 不匹配 ≠ 不下载

`<link media="print">` 的行为容易误解，实际行为是：

| 场景 | 是否下载 | 是否应用 | 是否阻塞屏幕渲染 |
|------|:-------:|:-------:|:---------------:|
| `<link rel="stylesheet">`（无 media） | ✅ | ✅ | ✅ 阻塞 |
| `<link rel="stylesheet" media="print">`（屏幕浏览时） | ✅（低优先级） | ❌ | ❌ 不阻塞 |
| `@import url("m.css") screen and (max-width:600px)`（宽屏时） | ❌ 不匹配不下载 | ❌ | —— |

媒体条件不匹配的 `link` 是经典的"**异步加载 CSS**"技巧（`media="print"` + `onload` 切回 `all`），在 `rel="preload"` 普及前被广泛使用。

### 四、使用方式

#### 1. 标准用法：主样式用 link

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <!-- 预加载提示：以最高优先级提前下载，缩短白屏（可选增强） -->
    <link rel="preload" href="main.css" as="style" />
    <link rel="stylesheet" href="main.css" />
    <!-- 按环境拆分的其他样式表：并行下载，互不阻塞发现 -->
    <link rel="stylesheet" href="print.css" media="print" />
    <link rel="stylesheet" href="dark.css" media="(prefers-color-scheme: dark)" />
  </head>
  <body>
    <!-- 页面内容 -->
  </body>
</html>
```

> ⚠️ **注意：** 用**多个平级 `<link>`** 替代"一个 CSS 里 `@import` 多个文件"——这是性能优化的最直接收益：预加载扫描器能同时发现所有文件。HTTP/2 多路复用下多个小文件并行传输的代价已经很低。

#### 2. @import 的合理使用场景

`@import` 并非一无是处，它在 **CSS 源码组织**层面有价值（注意：构建项目中常被工具编译掉，见下节）：

```css
/* ── index.css：作为"入口文件"聚合模块 ────────── */
@import url("base/reset.css");
@import url("base/typography.css");
@import url("components/button.css");
@import url("components/card.css");
```

两个"只有 @import 能做"的场景：

```css
/* 场景一：把外部样式表放入级联层（layer() 子句） */
@layer defaults, theme;
@import url("third-party-lib.css") layer(defaults);
@import url("my-theme.css") layer(theme);
/* 第三方样式被"压"进 defaults 层，我方 theme 层优先级更高，
   不用和第三方选择器比特异性 */

/* 场景二：按特性支持条件导入（supports() 子句） */
@import url("enhanced.css") supports (backdrop-filter: blur(4px));
```

#### 3. Vue 3 / 构建工具中的形态

现代工程中 `@import` 常在**构建期**被处理成内联代码或独立文件，浏览器看到的是构建产物：

```vue
<!-- App.vue 的 <style> 中写 @import -->
<style>
/* Vite 会尝试解析该路径；生产构建通常被内联/合并进产物 CSS */
@import url("./styles/global.css");
</style>
```

```scss
// SCSS 中有两种"导入"，语义完全不同：
@import "variables";        // ❌ SCSS 旧式导入：构建期复制粘贴文件内容（Sass 已弃用，计划移除）
@use "variables";           // ✅ SCSS 新方案：模块化导入
@import url("fonts.css");   // ✅ 纯 CSS @import：保留到产物中，运行时由浏览器加载
```

> ⚠️ **注意：** SCSS 的 `@import` 与原生 CSS 的 `@import` **不是一回事**——前者是构建期文本合并（无运行时请求），后者保留到产物里由浏览器执行。判断方法：带 `url()` 且以 `.css` 结尾、或以 `http(s)://` 开头的会被当作原生 CSS `@import` 保留；其余默认按 SCSS 导入编译。**SCSS 新代码请用 `@use`。**

### 五、实际应用场景

#### 场景一：多主题切换（link 的独占能力）

```html
<head>
  <!-- 持久样式：始终生效 -->
  <link rel="stylesheet" href="base.css" />
  <!-- 首选主题：默认生效，带 title 即"首选样式表" -->
  <link rel="stylesheet" href="light.css" title="浅色" />
  <!-- 备选主题：默认只下载不应用，用户从浏览器菜单切换 -->
  <link rel="stylesheet alternate" href="dark.css" title="深色" />
</head>
```

> 💡 **提示：** 现代主题切换更多用 CSS 变量 + `data-theme` 属性实现（切换无闪烁），`alternate stylesheet` 是浏览器原生机制，了解即可。

#### 场景二：条件加载差异化样式

```css
/* main.css 顶部：为不同能力分级加载 */
@import url("base.css");
@import url("enhanced.css") supports (backdrop-filter: blur(2px));
@import url("mobile-nav.css") screen and (max-width: 768px);
```

等价拆成 link 的写法（性能更好）：

```html
<link rel="stylesheet" href="base.css" />
<link rel="stylesheet" href="enhanced.css" />
<link rel="stylesheet" href="mobile-nav.css" media="screen and (max-width: 768px)" />
```

> 💡 **提示：** `enhanced.css` 内部用 `@supports (backdrop-filter: blur(2px)) { ... }` 包裹实现同样的特性检测，且不牺牲加载并行性——**`supports()` 检测放在规则内部比放在 `@import` 上更常见**。

#### 场景三：迁移第三方样式进级联层

```css
/* 解决"第三方库样式压不住/盖不住"的经典方案 */
@layer reset, vendor, app;                        /* 先声明层顺序 */

@import url("normalize.css") layer(reset);
@import url("bootstrap.min.css") layer(vendor);   /* 第三方整体降权 */
@import url("app.css") layer(app);                /* 我方代码永远最高优先 */
/* 同特异性的规则：后声明的层赢，与选择器权重无关 */
```

### 六、常见问题与注意事项

#### 1. 陷阱速查表

| 陷阱 | 后果 | 正确做法 |
|------|------|---------|
| `@import` 写在样式表中间/末尾 | 整条规则被静默忽略，样式丢失 | 放在所有规则之前（`@charset`/`@layer` 语句除外） |
| 在主样式表里 `@import` 多个文件 | 串行链拖慢 FCP，白屏变长 | 构建期合并，或拆成多个平级 `<link>` |
| `@import` 不写分号 | 后续内容解析错乱 | 每条 `@import` 以 `;` 结尾 |
| `<style>` 里 `@import` 第三方 CSS | 阻塞链上多一跳 + 跨域 DNS/TLS | 改用 `<link rel="preconnect">` + `<link rel="stylesheet">` |
| 混淆 SCSS `@import` 与 CSS `@import` | 产物中意外多出运行时请求，或未按预期合并 | SCSS 用 `@use`；确需运行时导入写全 `url("x.css")` |
| 动态换肤用 `@import` | 没有接口，做不到 | `<link>` 动态增删或 CSS 变量切换 |
| 旧浏览器解析带 `layer()` 子句的 `@import` | 整条被忽略 | 确认目标浏览器，或不用子句 |

#### 2. 常见问题

**Q1：`@import` 的 CSS 文件之间会并行下载吗？**

同一宿主文件里的**多个顶层 `@import`** 会在宿主解析后并行发起（不是一条条接力）；性能问题的本质是**发现时机晚**——它们都要等宿主 CSS 下载解析完才被发现，整体链条比 `<link>` 长一层。而 `@import` 再嵌套 `@import` 则是彻底的串行接力。

**Q2：`<link>` 会阻塞什么？**

阻塞**渲染**（不阻塞 HTML 解析——解析继续、页面不绘制）。这正是"CSS 阻塞渲染"机制的用意：避免用户看到"无样式内容的闪烁（FOUC）"。配套结论：CSS 要放 `<head>` 尽早开始下载；JS 放 body 末尾或加 `defer`，因为 JS 执行可能依赖 CSSOM。

**Q3：@import 兼容性很差吗？**

过时的说法。基础 `@import` 从 CSS 2.1 起全平台支持；真正要注意的是**较新的子句**：`layer()` 依赖级联层（2022–2023 年陆续成为基线）、`supports()` 依赖条件规则。对旧浏览器，带子句的 `@import` 整条失效。

**Q4：Vite/webpack 项目里还有必要关心这个吗？**

分两层看：**开发体验层**（组件里 `@import` 拆分模块）随意，构建工具会处理好；**产物层**依然要关心——检查最终 HTML 是否有链式 CSS 请求、第三方样式是否该走 CDN `<link>` + `preconnect`，这些是工具不会自动优化的。

### 七、与相关概念对比

| 概念 | 与本文的关系 |
|------|-------------|
| `<style>` 内嵌样式 | 无额外请求、最快；但无法被多页缓存复用。首屏关键 CSS 内联 + 其余 link 是常见优化组合 |
| 行内 `style` 属性 | 优先级最高、无缓存、无媒体条件——仅适合动态值 |
| SCSS `@use` / `@import` | 构建期模块化（文本级合并），与运行时加载是两个世界的概念 |
| `<link rel="preload" as="style">` | 资源提示：提前下载但不应用，配合 `onload` 切 rel 实现异步加载 |

### 八、总结

| 知识点 | 核心要点 |
|--------|---------|
| 本质区别 | `<link>` 是 HTML 标签、`@import` 是 CSS 规则——决定了发现时机与可控性的一切差异 |
| 加载模型 | link 由预加载扫描器并行发现；@import 要等宿主 CSS 下载解析后串行发现 |
| @import 位置 | 必须在所有规则前（`@charset`、`@layer` 语句除外），否则整条静默失效 |
| 独占能力 | link：`alternate stylesheet` 主题切换、DOM 动态操作、资源提示；@import：`layer()`/`supports()` 子句 |
| 最佳实践 | HTML 主样式用 `<link>`；`@import` 留给 CSS 组织与级联层；SCSS 用 `@use` |
| 机制理解 | link 阻塞渲染不阻塞解析；media 不匹配的 link 仍下载但不阻塞 |

**记住三句话**：

1. **link 并行、@import 串行——差距在"被发现"的时机：扫描器只认 HTML 标签，不拆 CSS 内容。**
2. **@import 必须写在最前（仅 `@charset`/`@layer` 语句可前置），写错位置整条静默失效。**
3. **主样式一律 `<link>`；`@import` 只在两处登场——CSS 源码组织、`layer()` 把外部文件放进级联层。**
