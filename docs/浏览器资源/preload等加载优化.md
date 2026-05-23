# Resource Hints 资源提示与预加载技术

## 一、资源提示总览

| 属性 | 作用 | 触发时机 | 使用场景 |
|------|------|---------|---------|
| `dns-prefetch` | �前解析 DNS | 页面加载早期 | 跨域域名 |
| `preconnect` | 预连接（DNS+TCP+TLS） | 页面加载早期 | 关键跨域资源 |
| `prefetch` | 预取（空闲时下载） | 浏览器空闲 | 下一页面资源 |
| `preload` | 预加载（高优先级） | 立即下载 | 当前页面关键资源 |
| `modulepreload` | 预加载 ES6 模块 | 立即下载 | 当前页面关键模块 |

## 二、dns-prefetch - DNS 预解析

### 2.1 作用

提前解析域名的 DNS，减少后续请求的 DNS 查询时间。

```
时间节省：DNS 查询通常需要 20-120ms
```

### 2.2 语法

```html
<link rel="dns-prefetch" href="https://cdn.example.com">
<link rel="dns-prefetch" href="https://api.example.com">
```

### 2.3 使用场景

```html
<head>
  <!-- 当前页面会使用的跨域资源 -->
  <link rel="dns-prefetch" href="https://cdn.jsdelivr.net">
  <link rel="dns-prefetch" href="https://www.google-analytics.com">

  <!-- 之后：正常使用这些域名 -->
  <script src="https://cdn.jsdelivr.net/npm/vue@3"></script>
</head>
```

### 2.4 注意事项

- 仅对跨域资源有效（同域名自动复用连接）
- 浏览器支持度高，可以放心使用
- 成本极低，不消耗带宽

## 三、preconnect - 预连接

### 3.1 作用

提前建立网络连接，包含：
1. DNS 解析
2. TCP 握手
3. TLS 协商（HTTPS）

```
时间节省：整个连接过程可节省 200-500ms+
```

### 3.2 语法

```html
<link rel="preconnect" href="https://cdn.example.com">
<link rel="preconnect" href="https://api.example.com" crossorigin>
```

### 3.3 使用场景

```html
<head>
  <!-- CDN 资源 -->
  <link rel="preconnect" href="https://cdn.jsdelivr.net">

  <!-- 字体服务 -->
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- API 服务器 -->
  <link rel="preconnect" href="https://api.example.com" crossorigin>
</head>
```

### 3.4 crossorigin 属性

```html
<!-- 没有 crossorigin：只做 DNS + TCP -->
<link rel="preconnect" href="https://fonts.gstatic.com">

<!-- 有 crossorigin：包含 TLS 协商 -->
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<!-- ✅ 推荐：对于需要 CORS 的资源（如字体）务必添加 -->
```

### 3.5 注意事项

- 每个域名最多预连接 6 个连接（浏览器限制）
- 不要过度使用（3-4 个域名足够）
- 成本较高，只用在高价值域名

## 四、prefetch - 预取（下一页面）

### 4.1 作用

在浏览器空闲时下载用户**可能接下来访问**的资源。

```
优先级：最低
时机：浏览器空闲时
```

### 4.2 语法

```html
<!-- 预取下一页面的资源 -->
<link rel="prefetch" href="/next-page.js">
<link rel="prefetch" href="https://cdn.example.com/future-component.js">

<!-- 预取图片 -->
<link rel="prefetch" as="image" href="/large-image.jpg">
```

### 4.3 使用场景

```html
<head>
  <!-- 分页：预取下一页 -->
  <link rel="prefetch" href="/page/2">

  <!-- 路由：预取可能访问的页面 -->
  <link rel="prefetch" href="/dashboard">
  <link rel="prefetch" href="/settings">

  <!-- 懒加载组件：预取即将使用的组件 -->
  <link rel="prefetch" href="/components/heavy-chart.js" as="script">
</head>
```

### 4.4 动态 prefetch

```javascript
// 用户 hover 链接时预取
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('mouseenter', () => {
    const prefetchUrl = link.getAttribute('href');
    const prefetchLink = document.createElement('link');
    prefetchLink.rel = 'prefetch';
    prefetchLink.href = prefetchUrl;
    document.head.appendChild(prefetchLink);
  }, { once: true });
});

// React/Vue 路由预取
router.beforeEach((to, from, next) => {
  if (to.path === '/home') {
    const prefetchLink = document.createElement('link');
    prefetchLink.rel = 'prefetch';
    prefetchLink.href = '/dashboard.js';
    document.head.appendChild(prefetchLink);
  }
  next();
});
```

### 4.5 注意事项

- 不要 prefetch 当前页面不会用的资源
- 慎用 prefetch 大文件（可能影响带宽）
- 移动网络下考虑禁用

## 五、preload - 预加载（当前页面）

### 5.1 作用

立即以**高优先级**下载当前页面**马上需要**的关键资源。

```
优先级：高
时机：立即下载
```

### 5.2 语法

```html
<link rel="preload" href="critical.css" as="style">
<link rel="preload" href="critical.js" as="script">
<link rel="preload" href="font.woff2" as="font" crossorigin>
<link rel="preload" href="image.jpg" as="image">
```

### 5.3 as 属性详解

#### 5.3.1 as 属性的作用

`as` 属性告诉浏览器被预加载资源的类型，主要有三个作用：

```
┌─────────────────────────────────────────────────────────────┐
│                    as 属性的三大作用                          │
├─────────────────────────────────────────────────────────────┤
│  1. 设置正确的资源优先级（Priority）                         │
│     → 浏览器根据资源类型分配加载优先级                        │
│                                                              │
│  2. 应用正确的安全策略（CORS）                               │
│     → 某些资源类型（font、fetch）需要 CORS 验证              │
│                                                              │
│  3. 匹配后续资源，避免重复下载                               │
│     → 相同 URL + as 类型会复用已下载的资源                   │
└─────────────────────────────────────────────────────────────┘
```

#### 5.3.2 资源优先级对比

```
优先级从高到低：

Highest  │  HTML、CSS、Critical JS（viewport 内）
         │
High     │  Fonts、Scripts（as=script）
         │
Medium   │  Images（as=image）、Media
         │
Low      │  Prefetch 资源
         │
Lowest   │  Preload 没有 as 属性的资源 ⚠️
```

**没有 as 属性的后果：**

```html
<!-- ❌ 没有 as：优先级最低，等同于 XHR 请求 -->
<link rel="preload" href="critical.css">

<!-- ✅ 有 as：优先级正确 -->
<link rel="preload" href="critical.css" as="style">
```

#### 5.3.3 as 属性值完整列表

| as 值 | 资源类型 | 需要 crossorigin? | 优先级 | 典型扩展名 |
|-------|---------|------------------|--------|-----------|
| `style` | CSS 样式表 | ❌ | Highest | .css |
| `script` | JavaScript 脚本 | ❌ | High | .js |
| `font` | 字体文件 | ✅ **必须** | High | .woff2, .woff, .ttf |
| `image` | 图片 | ❌ | Medium | .jpg, .png, .webp, .svg |
| `fetch` | fetch/XHR 请求 | ✅ 通常需要 | Medium | - |
| `audio` | 音频 | ❌ | Medium | .mp3, .wav, .ogg |
| `video` | 视频 | ❌ | Medium | .mp4, .webm |
| `track` | 字幕轨道 (WebVTT) | ❌ | Low | .vtt |
| `worker` | Web Worker | ❌ | High | .js |
| `embed` | embed 嵌入内容 | ❌ | Medium | - |
| `object` | object 嵌入内容 | ❌ | Medium | - |
| `document` | iframe/页面 | ❌ | High | .html |
| `manifest` | manifest 文件 | ❌ | Low | .webmanifest |

#### 5.3.4 各类型详细说明

##### style - CSS 样式表

```html
<link rel="preload" href="main.css" as="style">

<!-- 配合 onload 立即应用 -->
<link rel="preload" href="critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link href="critical.css" rel="stylesheet"></noscript>
```

##### script - JavaScript 脚本

```html
<!-- 预加载普通脚本 -->
<link rel="preload" href="app.js" as="script">

<!-- 预加载 Worker 脚本 -->
<link rel="preload" href="worker.js" as="worker">

<!-- 注意：modulepreload 用于 ES6 模块，不是 as="module" -->
<link rel="modulepreload" href="app.js">
```

##### font - 字体文件

```html
<!-- ⚠️ 字体必须加 crossorigin，否则会下载两次！ -->
<link rel="preload" href="font.woff2" as="font" crossorigin>

<style>
  @font-face {
    font-family: 'MyFont';
    src: url('font.woff2') format('woff2');
    font-display: swap;
  }
</style>
```

**为什么字体需要 crossorigin？**

字体加载遵循 CORS 策略，当使用 `preload` 时：
- 没有 `crossorigin` → 浏览器以匿名方式预加载
- 后续 `@font-face` 使用时需要 CORS 验证
- **验证失败 → 重新下载** ❌

##### image - 图片

```html
<!-- 预加载首屏图片 -->
<link rel="preload" href="hero-image.jpg" as="image">

<!-- 响应式图片预加载 -->
<link rel="preload" href="hero-large.jpg" as="image" media="(min-width: 1024px)">
<link rel="preload" href="hero-small.jpg" as="image" media="(max-width: 640px)">

<!-- 预加载 srcset 图片 -->
<link rel="preload" as="image" imagesrcset="hero-320w.jpg 320w, hero-640w.jpg 640w" imagesizes="100vw">
```

##### fetch - 数据请求

```html
<!-- 预加载 API 响应数据 -->
<link rel="preload" href="/api/user-data" as="fetch" crossorigin>

<!-- JavaScript 中使用 -->
<script>
  fetch('/api/user-data')  // 会使用预加载的响应
    .then(res => res.json())
    .then(data => console.log(data));
</script>
```

##### video/audio - 媒体文件

```html
<!-- 预加载视频 -->
<link rel="preload" href="intro-video.mp4" as="video">

<!-- 预加载音频 -->
<link rel="preload" href="bg-music.mp3" as="audio">

<!-- 只预加载元数据（不下载完整文件） -->
<link rel="preload" href="video.mp4" as="video" media="print">
```

##### worker - Web Worker

```html
<!-- 预加载 Worker 脚本 -->
<link rel="preload" href="worker.js" as="worker">

<script>
  const worker = new Worker('worker.js');  // 使用预加载的脚本
</script>
```

##### document - 页面/iframe

```html
<!-- 预加载下一页面的 HTML -->
<link rel="preload" href="/next-page.html" as="document">

<!-- 预加载 iframe 内容 -->
<link rel="preload" href="/iframe-content.html" as="document">
```

#### 5.3.5 crossorigin 属性配合

```html
<!-- 需要 CORS 的资源类型 -->
<link rel="preload" href="font.woff2" as="font" crossorigin>                      <!-- ✅ 必须 -->
<link rel="preload" href="api-data.json" as="fetch" crossorigin>                <!-- ✅ 需要 -->
<link rel="preload" href="https://cdn.com/script.js" as="script" crossorigin>  <!-- ✅ 跨域时需要 -->

<!-- 不需要 CORS 的资源类型 -->
<link rel="preload" href="style.css" as="style">                                <!-- ❌ 不需要 -->
<link rel="preload" href="image.jpg" as="image">                                <!-- ❌ 不需要 -->
<link rel="preload" href="app.js" as="script">                                  <!-- ❌ 同域不需要 -->
```

**crossorigin 的两个值：**

```html
<!-- crossorigin 或 crossorigin="anonymous"：不发送凭证 -->
<link rel="preload" href="font.woff2" as="font" crossorigin>

<!-- crossorigin="use-credentials"：发送 Cookie 等凭证 -->
<link rel="preload" href="api-data.json" as="fetch" crossorigin="use-credentials">
```

#### 5.3.6 常见错误

```html
<!-- ❌ 错误 1：没有 as 属性 -->
<link rel="preload" href="style.css">

<!-- ❌ 错误 2：as 值错误 -->
<link rel="preload" href="style.css" as="stylesheet">  <!-- 应该是 style -->

<!-- ❌ 错误 3：字体缺失 crossorigin（会下载两次！）-->
<link rel="preload" href="font.woff2" as="font">

<!-- ❌ 错误 4：非字体资源加了 crossorigin -->
<link rel="preload" href="image.jpg" as="image" crossorigin>  <!-- 多余 -->

<!-- ❌ 错误 5：as 类型与实际资源不匹配 -->
<link rel="preload" href="script.js" as="style">

<!-- ✅ 正确示例 -->
<link rel="preload" href="style.css" as="style">
<link rel="preload" href="script.js" as="script">
<link rel="preload" href="font.woff2" as="font" crossorigin>
<link rel="preload" href="image.jpg" as="image">
```

#### 5.3.7 media 属性配合使用

```html
<!-- 只在大屏幕预加载大图 -->
<link rel="preload" href="hero-large.jpg" as="image" media="(min-width: 1024px)">

<!-- 只在打印时预加载 -->
<link rel="preload" href="print.css" as="style" media="print">

<!-- 响应式字体预加载 -->
<link rel="preload" href="font-large.woff2" as="font" media="(min-width: 768px)" crossorigin>
<link rel="preload" href="font-small.woff2" as="font" media="(max-width: 767px)" crossorigin>
```

### 5.4 使用场景

#### 5.4.1 关键 CSS

```html
<head>
  <!-- 预加载，但不要阻塞渲染 -->
  <link rel="preload" href="critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link href="critical.css" rel="stylesheet"></noscript>

  <!-- 或者：直接使用 link + preload -->
  <link rel="preload" href="critical.css" as="style">
  <link href="critical.css" rel="stylesheet">
</head>
```

#### 5.4.2 关键 JS

```html
<head>
  <!-- 立即开始下载，不阻塞 HTML 解析 -->
  <link rel="preload" href="app.js" as="script">

  <!-- 后续使用 -->
  <script src="app.js" defer></script>
</head>
```

#### 5.4.3 字体

```html
<head>
  <!-- 字体需要 crossorigin -->
  <link rel="preload" href="font.woff2" as="font" crossorigin>

  <style>
    @font-face {
      font-family: 'CustomFont';
      src: url('font.woff2') format('woff2');
      font-display: swap;
    }
  </style>
</head>
```

#### 5.4.4 响应式图片

```html
<head>
  <!-- 预加载特定尺寸的图片 -->
  <link rel="preload" href="hero-image.jpg" as="image" media="(min-width: 1024px)">
  <link rel="preload" href="hero-image-small.jpg" as="image" media="(max-width: 640px)">
</head>
```

### 5.5 注意事项

- ❌ 不要滥用：只用真正关键的资源
- ❌ 不要 preload 懒加载的资源
- ✅ 必须指定正确的 `as` 属性
- ✅ 字体必须加 `crossorigin`

## 六、modulepreload - ES6 模块预加载

### 6.1 作用

专门用于预加载 ES6 模块，浏览器会解析并缓存模块依赖图。

### 6.2 语法

```html
<link rel="modulepreload" href="/app.js">
<link rel="modulepreload" href="/utils.js">
<link rel="modulepreload" href="/components.js">
```

### 6.3 使用场景

```html
<head>
  <!-- 预加载主模块及其依赖 -->
  <link rel="modulepreload" href="/app.js">
  <link rel="modulepreload" href="/utils/helpers.js">
  <link rel="modulepreload" href="/components/button.js">

  <!-- 后续导入 -->
  <script type="module" src="/app.js"></script>
</head>
```

### 6.4 注意事项

- 只对 ES6 模块有效（`type="module"`）
- 会自动跟踪并预加载依赖的模块

## 七、资源提示优先级对比

```
优先级从高到低：

1. preload      - 最高，立即下载（当前页面关键资源）
2. preconnect   - 高，提前连接（当前页面跨域资源）
3. prefetch     - 低，空闲时下载（下一页面资源）
4. dns-prefetch - 最低，只解析 DNS（跨域域名）
```

## 八、完整使用示例

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width">

  <!-- ============ 阶段 1: 最早的连接优化 ============ -->
  <!-- DNS 预解析：所有可能用到的域名 -->
  <link rel="dns-prefetch" href="https://cdn.example.com">
  <link rel="dns-prefetch" href="https://fonts.gstatic.com">
  <link rel="dns-prefetch" href="https://www.google-analytics.com">

  <!-- 预连接：关键跨域域名 -->
  <link rel="preconnect" href="https://cdn.example.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- ============ 阶段 2: 关键资源预加载 ============ -->
  <!-- 关键 CSS -->
  <link rel="preload" href="/critical.css" as="style">

  <!-- 关键 JS -->
  <link rel="preload" href="/app.js" as="script">

  <!-- 字体 -->
  <link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>

  <!-- 关键图片 -->
  <link rel="preload" href="/hero-image.jpg" as="image">

  <!-- ============ 阶段 3: 实际加载资源 ============ -->
  <link href="/critical.css" rel="stylesheet">

  <style>
    @font-face {
      font-family: 'MainFont';
      src: url('/fonts/main.woff2') format('woff2');
      font-display: swap;
    }
  </style>

  <!-- ============ 阶段 4: 下一页面资源预取 ============ -->
  <link rel="prefetch" href="/next-page.js">
  <link rel="prefetch" href="/dashboard.css">

  <!-- ============ 阶段 5: 脚本加载 ============ -->
  <script defer src="/app.js"></script>
  <script async src="https://www.google-analytics.com/analytics.js"></script>
</head>
<body>
  <h1>Hello World</h1>
  <img src="/hero-image.jpg" alt="Hero">
</body>
</html>
```

## 九、script 标签属性详解

### 9.1 script 属性总览

| 属性 | 加载时机 | 执行时机 | 执行顺序 | 适用场景 |
|------|---------|---------|---------|---------|
| 无属性 | 同步，阻塞 HTML 解析 | 立即执行 | 按顺序 | 关键内联脚本（不推荐） |
| `defer` | 异步，不阻塞 | DOM 解析完成后，`DOMContentLoaded` 前 | 按顺序 | DOM 操作脚本 |
| `async` | 异步，不阻塞 | 加载完成后立即执行 | 不保证顺序 | 独立脚本（统计、广告） |
| `type="module"` | 异步（默认 defer） | 按 defer 规则 | 按顺序 | ES6 模块 |

### 9.2 执行时机对比图

```
HTML 解析过程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

无属性 script:
解析中 → [遇到 script] → ⏸暂停解析 → 下载 → 执行 → ▶继续解析

defer script:
解析中 → [遇到 script] → 📥后台下载 → 解析完成 → 按顺序执行 → DOMContentLoaded

async script:
解析中 → [遇到 script] → 📥后台下载 → ⚡下载完立即执行 → 可能穿插解析中

module script (默认 defer):
解析中 → [遇到 module] → 📥后台下载 → 预解析依赖 → 按顺序执行 → DOMContentLoaded
```

### 9.3 详细说明

#### 9.3.1 普通脚本（不推荐）

```html
<!-- ❌ 阻塞 HTML 解析，性能最差 -->
<script src="app.js"></script>
```

**执行流程：**
1. 遇到 script 标签，暂停 HTML 解析
2. 下载脚本（阻塞）
3. 执行脚本（阻塞）
4. 继续解析剩余 HTML

#### 9.3.2 defer - 延迟执行

```html
<!-- ✅ 推荐：需要操作 DOM 的脚本 -->
<script defer src="app.js"></script>
<script defer src="utils.js"></script>
<script defer src="main.js"></script>

<!-- 执行顺序：app.js → utils.js → main.js -->
```

**特点：**
- 异步下载，不阻塞 HTML 解析
- 等到 HTML 解析完成后执行
- **按 HTML 中的顺序执行**
- `DOMContentLoaded` 之前执行

**适用场景：**
```html
<!-- DOM 操作脚本 -->
<script defer src="jquery.js"></script>
<script defer src="app.js"></script> <!-- 可以依赖 jquery.js -->

<!-- 组件初始化 -->
<script defer src="components/header.js"></script>
<script defer src="components/sidebar.js"></script>
```

#### 9.3.3 async - 异步执行

```html
<!-- ✅ 适用：独立、无依赖的脚本 -->
<script async src="analytics.js"></script>
<script async src="ad-platform.js"></script>

<!-- 执行顺序：不确定！谁先下载完先执行谁 -->
```

**特点：**
- 异步下载，不阻塞 HTML 解析
- 下载完成后**立即执行**（不等待 HTML 解析完成）
- **不保证执行顺序**（取决于下载速度）
- 可能在 HTML 解析过程中穿插执行

**适用场景：**
```html
<!-- 统计分析 -->
<script async src="https://www.google-analytics.com/analytics.js"></script>
<script async src="https://mc.yandex.ru/metrika/watch.js"></script>

<!-- 广告 -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>

<!-- 热图/用户行为 -->
<script async src="https://static.hotjar.com/c/hotjar-xxx.js"></script>
```

#### 9.3.4 type="module" - ES6 模块

```html
<!-- ES6 模块，默认带 defer 效果 -->
<script type="module" src="app.js"></script>

<!-- 内联模块 -->
<script type="module">
  import { init } from './utils.js';
  init();
</script>

<!-- nomodule：给不支持 module 的浏览器降级 -->
<script nomodule src="app-legacy.js"></script>
```

**特点：**
- 自动 `defer`，不阻塞 HTML 解析
- 自动严格模式
- 支持 import/export
- 支持 CSS 导入：`import styles from './style.css' assert { type: 'css' };`
- 同一模块只执行一次

### 9.4 混合使用注意事项

```html
<!-- ⚠️ 顺序可能混乱 -->
<script defer src="a.js"></script>     <!-- DOM 后按顺序执行 -->
<script async src="b.js"></script>     <!-- 下载完立即执行，可能比 a 先 -->
<script src="c.js"></script>           <!-- 立即阻塞执行 -->
<script type="module" src="d.js"></script>  <!-- DOM 后按顺序执行 -->

<!-- 推荐策略：统一使用 defer，独立脚本用 async -->
```

### 9.5 最佳实践配置

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">

  <!-- ============ 关键 CSS preload ============ -->
  <link rel="preload" href="critical.css" as="style">

  <!-- ============ 关键资源预连接 ============ -->
  <link rel="preconnect" href="https://cdn.example.com" crossorigin>

  <!-- ============ 关键 CSS ============ -->
  <link href="critical.css" rel="stylesheet">

  <!-- ============ 应用脚本：defer ============ -->
  <!-- 需要操作 DOM 的脚本，按顺序执行 -->
  <script defer src="vendor/vue.js"></script>
  <script defer src="vendor/router.js"></script>
  <script defer src="app.js"></script>

  <!-- ============ 第三方脚本：async ============ -->
  <!-- 独立脚本，不阻塞其他资源 -->
  <script async src="https://www.google-analytics.com/analytics.js"></script>
  <script async src="https://static.hotjar.com/c/hotjar.js"></script>

  <!-- ============ ES6 模块：type=module ============ -->
  <script type="module" src="module-app.js"></script>
  <script nomodule src="legacy-app.js"></script>
</head>
<body>
  <h1>Hello</h1>
</body>
</html>
```

### 9.6 快速决策指南

```
需要加载脚本？

├── 是否需要操作 DOM？
│   ├── 是 → 使用 defer ✅
│   └── 否 ↓
├── 是否是独立第三方脚本（统计、广告）？
│   ├── 是 → 使用 async ✅
│   └── 否 ↓
├── 是否是 ES6 模块？
│   ├── 是 → 使用 type="module" ✅
│   └── 否 ↓
└── 默认使用 defer ✅
```

### 9.7 script vs link 属性对比

| 标签 | 属性 | 作用 | 使用场景 |
|------|------|------|---------|
| `script` | `defer` | 延迟执行 | DOM 操作脚本 |
| `script` | `async` | 异步执行 | 独立脚本（统计、广告） |
| `script` | `type="module"` | ES6 模块 | 现代模块化开发 |
| `link` | `rel="preload"` | 预加载 | 关键资源提前下载 |
| `link` | `rel="prefetch"` | 预取 | 下一页面资源 |
| `link` | `rel="preconnect"` | 预连接 | 关键跨域域名 |
| `link` | `rel="dns-prefetch"` | DNS 预解析 | 次要跨域域名 |

**核心区别：**
- **script 属性（defer/async/module）**：控制脚本的**执行时机**
- **link 属性（preload/prefetch 等）**：控制资源的**加载优先级**

## 十、JavaScript 动态控制

### 9.1 动态创建资源提示

```javascript
// 动态 prefetch
function prefetchResource(url) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
}

// 动态 preconnect
function preconnectDomain(url) {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;
  document.head.appendChild(link);
}

// 动态 preload
function preloadResource(url, as) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = as;
  if (as === 'font') link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
}
```

### 9.2 条件预加载

```javascript
// 根据网络类型决定是否预加载
if (navigator.connection) {
  const connection = navigator.connection;

  // 只有在快速网络下预加载大文件
  if (connection.effectiveType === '4g') {
    preloadResource('/large-video.mp4', 'video');
  }

  // 在慢速网络下只预连接
  if (connection.saveData || connection.effectiveType !== '4g') {
    preconnectDomain('https://cdn.example.com');
  }
}
```

### 9.3 闲置时预加载

```javascript
// 使用 requestIdleCallback
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    prefetchResource('/next-page.js');
  });
}
```

## 十一、常见错误

### 10.1 遗漏 as 属性

```html
<!-- ❌ 错误：没有 as，浏览器不知道如何处理 -->
<link rel="preload" href="style.css">

<!-- ✅ 正确 -->
<link rel="preload" href="style.css" as="style">
```

### 10.2 字体忘记 crossorigin

```html
<!-- ❌ 错误：字体需要 CORS -->
<link rel="preload" href="font.woff2" as="font">

<!-- ✅ 正确 -->
<link rel="preload" href="font.woff2" as="font" crossorigin>
```

### 10.3 preload 与 prefetch 混淆

```html
<!-- ❌ 错误：当前页面不需要的资源不应该 preload -->
<link rel="preload" href="unused.js">

<!-- ✅ 正确：下一页面的资源用 prefetch -->
<link rel="prefetch" href="next-page.js">
```

### 10.4 过度使用 preconnect

```html
<!-- ❌ 错误：太多预连接会浪费资源 -->
<link rel="preconnect" href="https://cdn1.com">
<link rel="preconnect" href="https://cdn2.com">
<link rel="preconnect" href="https://cdn3.com">
<link rel="preconnect" href="https://api1.com">
<link rel="preconnect" href="https://api2.com">

<!-- ✅ 正确：只用真正关键的域名（3-4个） -->
<link rel="preconnect" href="https://cdn.example.com" crossorigin>
```

## 十二、浏览器兼容性

| 属性 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| dns-prefetch | ✅ | ✅ | ✅ | ✅ |
| preconnect | ✅ | ✅ | ✅ | ✅ |
| prefetch | ✅ | ✅ | ⚠️ | ✅ |
| preload | ✅ | ✅ | ✅ | ✅ |
| modulepreload | ✅ | ✅ | ⚠️ 16.4+ | ✅ |

## 十三、性能优化检查清单

### 使用前检查

- [ ] 是否真的需要预加载？（关键资源优先）
- [ ] 资源是否会被使用？（避免浪费带宽）
- [ ] as 属性是否正确？
- [ ] 字体资源是否添加 crossorigin？
- [ ] 是否考虑了慢速网络用户？

### 推荐配置

```html
<!-- 1. 关键域名预连接（2-3个） -->
<link rel="preconnect" href="https://cdn.example.com" crossorigin>

<!-- 2. DNS 预解析（次要域名） -->
<link rel="dns-prefetch" href="https://analytics.example.com">

<!-- 3. 当前页面关键资源 preload（3-5个） -->
<link rel="preload" href="critical.css" as="style">
<link rel="preload" href="app.js" as="script">
<link rel="preload" href="font.woff2" as="font" crossorigin>

<!-- 4. 下一步可能访问的资源 prefetch（可选） -->
<link rel="prefetch" href="/next-page.js">
```
