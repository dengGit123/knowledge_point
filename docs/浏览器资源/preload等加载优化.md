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

### 5.3 as 属性值

| as 值 | 资源类型 | 是否需要 crossorigin |
|-------|---------|---------------------|
| `style` | CSS | ❌ |
| `script` | JavaScript | ❌ |
| `font` | 字体文件 | ✅ |
| `image` | 图片 | ❌ |
| `fetch` | fetch/XHR | ✅ |
| `audio` | 音频 | ❌ |
| `video` | 视频 | ❌ |
| `track` | WebVTT | ❌ |

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

## 九、JavaScript 动态控制

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

## 十、常见错误

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

## 十一、浏览器兼容性

| 属性 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| dns-prefetch | ✅ | ✅ | ✅ | ✅ |
| preconnect | ✅ | ✅ | ✅ | ✅ |
| prefetch | ✅ | ✅ | ⚠️ | ✅ |
| preload | ✅ | ✅ | ✅ | ✅ |
| modulepreload | ✅ | ✅ | ⚠️ 16.4+ | ✅ |

## 十二、性能优化检查清单

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
