# 从输入 URL 到页面显示

> 深入理解浏览器从输入网址到渲染页面的完整工作流程，是前端性能优化和问题诊断的基础。

## 流程概览

```mermaid
graph TD
    A[输入 URL] --> B[URL 解析]
    B --> C[DNS 查询]
    C --> D[TCP 连接]
    D --> E[TLS 握手]
    E --> F[HTTP 请求]
    F --> G[服务器响应]
    G --> H[HTML 解析]
    H --> I[CSS 解析]
    I --> J[构建渲染树]
    J --> K[布局]
    K --> L[绘制]
    L --> M[合成]
    M --> N[页面显示]
```

整个流程可分为四个阶段：

| 阶段 | 核心任务 |
|------|----------|
| **网络阶段** | URL 解析 → DNS 查询 → TCP/TLS 连接 → HTTP 请求 |
| **解析阶段** | HTML → DOM 树，CSS → CSSOM 树 |
| **渲染阶段** | 渲染树 → 布局 → 绘制 → 合成 |
| **交互阶段** | 事件处理 → 脚本执行 → 视图更新 |

## 一、URL 解析

### 1.1 URL 结构

```
scheme://user:pass@host:port/path?query#fragment
```

| 组成部分 | 说明 | 示例 |
|----------|------|------|
| **scheme** | 协议类型 | `https`、`http`、`ftp` |
| **host** | 服务器地址 | `www.example.com` |
| **port** | 端口号（可省略） | `443`（HTTPS 默认）、`80`（HTTP 默认） |
| **path** | 资源路径 | `/path/page.html` |
| **query** | 查询参数 | `?id=1&name=test` |
| **fragment** | 页面锚点 | `#section` |

### 1.2 URL 规范化

浏览器会对用户输入进行规范化处理：

```javascript
// 浏览器自动处理
“example.com”        → “https://example.com”
“example.com:443”    → “https://example.com”  // 默认端口省略
“中文.com”           → “https://xn--fiqz9s.com” // Punycode 编码
“example.com/#top”   → “https://example.com/#”
```

### 1.3 HSTS 强制升级

[HSTS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Strict-Transport-Security)（HTTP Strict Transport Security）强制浏览器使用 HTTPS：

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

| 参数 | 说明 |
|------|------|
| `max-age` | 缓存时间（秒），`31536000` = 1 年 |
| `includeSubDomains` | 策略应用于所有子域名 |
| `preload` | 允许加入浏览器内置 HSTS 列表 |

## 二、DNS 查询

### 2.1 DNS 层级结构

```
用户查询 www.example.com

                根域名服务器
                     ↓
                .com 顶级域名服务器
                     ↓
            example.com 权威域名服务器
                     ↓
                返回 IP 地址
```

| 服务器类型 | 职责 | 数量 |
|------------|------|------|
| 根域名服务器 | 管理顶级域服务器 | 全球 13 组 |
| 顶级域服务器 | 管理特定顶级域（.com、.cn） | 数百个 |
| 权威域名服务器 | 存储具体域名的 DNS 记录 | 无数个 |

### 2.2 DNS 查询流程

```mermaid
graph LR
    A[浏览器] --> B{浏览器缓存?}
    B -->|命中| Z[返回 IP]
    B -->|未命中| C{系统缓存?}
    C -->|命中| Z
    C -->|未命中| D{hosts 文件?}
    D -->|命中| Z
    D -->|未命中| E[本地 DNS 服务器]
    E --> F[根服务器]
    F --> G[TLD 服务器]
    G --> H[权威服务器]
    H --> Z
```

### 2.3 DNS 记录类型

```bash
# 常见 DNS 记录类型
A 记录     域名 → IPv4 地址
AAAA 记录  域名 → IPv6 地址
CNAME 记录 域名 → 别名域名
MX 记录    邮件服务器
TXT 记录   文本信息（SPF、DKIM 等）
NS 记录    域名服务器
```

### 2.4 DNS 优化

```html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//cdn.example.com">

<!-- 预连接（包含 DNS + TCP + TLS） -->
<link rel="preconnect" href="https://api.example.com">

<!-- 预加载关键资源 -->
<link rel="preload" href="font.woff2" as="font" crossorigin>
```

| 优化方式 | 说明 | 适用场景 |
|----------|------|----------|
| **dns-prefetch** | 提前解析 DNS | 跨域资源、第三方脚本 |
| **preconnect** | 预先建立连接 | 关键 API、字体文件 |
| **preload** | 预加载资源 | 首屏关键资源 |

## 三、TCP 连接

### 3.1 三次握手

```
客户端                                    服务器
  |                                        |
  | --------------- SYN -----------------> |  (第一次握手)
  |                                        |
  | <-------------- SYN+ACK --------------- |  (第二次握手)
  |                                        |
  | --------------- ACK -----------------> |  (第三次握手)
  |                                        |
  |            连接建立                    |
```

| 步骤 | 报文 | 说明 |
|------|------|------|
| 第一次 | SYN | 客户端发送连接请求，携带初始序列号 |
| 第二次 | SYN+ACK | 服务器确认请求，同时发送自己的初始序列号 |
| 第三次 | ACK | 客户端确认服务器的响应 |

三次握手的目的：同步双方的初始序列号（ISN），确保连接可靠。

### 3.2 连接复用

```
HTTP/1.0: 每个请求新建连接
HTTP/1.1: Keep-Alive，连接复用（串行）
HTTP/2:   多路复用（并发）
HTTP/3:   QUIC（无队头阻塞）
```

| 协议 | 连接特性 |
|------|----------|
| HTTP/1.0 | 每个请求需要新连接 |
| HTTP/1.1 | 持久连接，请求串行 |
| HTTP/2 | 多路复用，请求并发 |
| HTTP/3 | 基于 QUIC，无队头阻塞 |

### 3.3 拥塞控制

TCP 拥塞控制包含四个核心算法：

| 算法 | 作用 |
|------|------|
| **慢启动** | 连接初期逐步增加发送窗口，避免网络拥塞 |
| **拥塞避免** | 窗口增长到阈值后，平稳探测可用带宽 |
| **快速重传** | 收到 3 个重复 ACK 时立即重传，不等待超时 |
| **快速恢复** | 快速重传后窗口减半，而非从零开始 |

## 四、TLS/HTTPS 连接

### 4.1 TLS 握手流程

```
客户端                                    服务器
  |                                        |
  | ----------- ClientHello ------------> |  (支持的加密套件、随机数)
  |                                        |
  | <---------- ServerHello -------------- |  (选择的套件、随机数、证书)
  |                                        |
  | ----------- 证书验证 ----------------> |
  |                                        |
  | ----------- 密钥交换 ----------------> |
  |                                        |
  | <---------- Finished ----------------- |
  | ----------- Finished ---------------> |
  |                                        |
  |            安全连接建立                |
```

| 步骤 | 说明 |
|------|------|
| **ClientHello** | 发送 TLS 版本、加密套件列表、客户端随机数 |
| **ServerHello** | 选择加密套件、发送服务器随机数、证书 |
| **证书验证** | 验证证书是否由受信任 CA 签发、是否在有效期内 |
| **密钥交换** | 使用证书公钥加密预主密钥，生成会话密钥 |
| **完成** | 确认握手过程未被篡改 |

### 4.2 TLS 1.3 优化

| 特性 | TLS 1.2 | TLS 1.3 |
|------|---------|---------|
| 握手 RTT | 2-RTT | 1-RTT |
| 会话恢复 | 1-RTT | 0-RTT |
| 加密套件 | 复杂，存在不安全算法 | 简化，仅保留前向保密套件 |

> [TLS 1.3 规范](https://datatracker.ietf.org/doc/html/rfc8446)

### 4.3 中间人攻击防护

HTTPS 通过证书链验证防止中间人攻击：

```
浏览器信任根证书
        ↓
    验证中间证书
        ↓
    验证服务器证书
        ↓
      确认域名匹配
```

只有当攻击者拥有由受信任 CA 签发的有效证书时，才能成功进行中间人攻击，否则浏览器会警告用户。

## 五、HTTP 请求与响应

### 5.1 HTTP 请求结构

```http
GET /api/users HTTP/1.1
Host: api.example.com
User-Agent: Mozilla/5.0
Accept: application/json
Authorization: Bearer token123
```

| 方法 | 说明 | 幂等性 |
|------|------|--------|
| GET | 获取资源 | ✅ |
| POST | 提交数据 | ❌ |
| PUT | 更新资源 | ✅ |
| DELETE | 删除资源 | ✅ |
| HEAD | 获取响应头 | ✅ |
| OPTIONS | 查询支持的方法 | ✅ |
| PATCH | 部分更新 | ❌ |

### 5.2 HTTP 响应结构

```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 1234
Cache-Control: max-age=3600
ETag: "abc123"

{"id": 1, "name": "John"}
```

| 状态码 | 含义 | 示例 |
|--------|------|------|
| 2xx | 成功 | 200 OK、201 Created、204 No Content |
| 3xx | 重定向 | 301 永久重定向、302 临时重定向、304 未修改 |
| 4xx | 客户端错误 | 400 请求错误、401 未授权、403 禁止、404 未找到 |
| 5xx | 服务器错误 | 500 内部错误、502 网关错误、503 服务不可用 |

### 5.3 HTTP/2 与 HTTP/3

| 特性 | HTTP/1.1 | HTTP/2 | HTTP/3 |
|------|----------|--------|--------|
| 传输协议 | TCP | TCP | QUIC (UDP) |
| 多路复用 | ❌ | ✅ | ✅ |
| 头部压缩 | ❌ | HPACK | QPACK |
| 队头阻塞 | ✅ | ✅ | ❌ |
| 二进制分帧 | ❌ | ✅ | ✅ |
| 服务器推送 | ❌ | ✅ | ❌ |

> [HTTP/2 规范](https://datatracker.ietf.org/doc/html/rfc7540) | [HTTP/3 规范](https://datatracker.ietf.org/doc/html/rfc9114)

## 六、浏览器渲染流程

### 6.1 关键渲染路径

```mermaid
graph LR
    A[HTML] --> B[DOM 树]
    C[CSS] --> D[CSSOM 树]
    B --> E[渲染树]
    D --> E
    E --> F[布局 Layout]
    F --> G[绘制 Paint]
    G --> H[合成 Composite]
```

### 6.2 DOM 树构建

HTML 解析器从上到下扫描文档，将标签转换为 DOM 节点：

```html
<html>
  <head>
    <title>页面标题</title>
  </head>
  <body>
    <div class="container">
      <h1>标题</h1>
      <p>段落</p>
    </div>
  </body>
</html>
```

```
DOM 树结构：
├── html
│   ├── head
│   │   └── title
│   └── body
│       └── div.container
│           ├── h1
│           └── p
```

**脚本处理策略**：

| 属性 | 下载时机 | 执行时机 | 顺序保证 |
|------|----------|----------|----------|
| 无属性 | 同步，阻塞解析 | 立即执行 | ✅ |
| `async` | 异步 | 下载完成后立即执行 | ❌ |
| `defer` | 异步 | DOM 解析完成后 | ✅ |

```html
<!-- 推荐：非阻塞脚本 -->
<script defer src="app.js"></script>

<!-- 异步脚本，不保证执行顺序 -->
<script async src="analytics.js"></script>
```

### 6.3 CSSOM 树构建

CSS 解析与 HTML 解析并行进行，但 CSS 具有渲染阻塞特性：

```css
.container {
  width: 100%;
  max-width: 1200px;
}

.container h1 {
  color: #333;
  font-size: 2rem;
}
```

**CSS 选择器匹配**：采用"从右向左"策略

```css
/* 匹配过程 */
.container .item p {  /* 1. 找到所有 p 元素 */
                       /* 2. 检查父元素是否有 .item */
                       /* 3. 再检查父元素是否有 .container */
  color: red;
}
```

**CSS 层叠优先级**：

```
!important > 内联样式 > ID 选择器 > 类选择器 > 元素选择器
```

### 6.4 渲染树构建

渲染树 = DOM 树 + CSSOM 树（只包含可见元素）：

| DOM 元素 | 是否进入渲染树 |
|----------|----------------|
| `<head>`、`<meta>` | ❌ |
| `display: none` | ❌ |
| `visibility: hidden` | ✅ |
| 普通元素 | ✅ |

### 6.5 布局（Layout）

计算每个节点的几何信息：位置、尺寸、排列方式。

```
盒模型：
    margin
  ┌─────────┐
  │ border  │
  │ ┌─────┐ │
  │ │ pad │ │
  │ │ ┌───┤ │ │
  │ │ │con│ │ │
  │ │ │ten│ │ │
  │ │ └───┤ │ │
  │ └─────┘ │
  └─────────┘
```

**触发布局的操作**：

| 操作 | 触发 |
|------|------|
| 添加/删除 DOM 元素 | ✅ |
| 修改几何属性 | ✅ |
| 修改字体 | ✅ |
| 读取布局属性 | ✅（强制同步布局） |

### 6.6 绘制（Paint）

将渲染树转换为屏幕像素，按顺序执行绘制操作：

1. 背景和边框
2. 背景图片
3. 文字阴影
4. 轮廓和装饰

**图层（Layers）机制**：某些元素会创建独立图层

```css
/* 触发图层创建的属性 */
.element {
  transform: translate3d(0, 0, 0);  /* 3D 变换 */
  will-change: transform;           /* 提示浏览器 */
  opacity: 0.9;                     /* 透明度 */
}
```

### 6.7 合成（Composite）

合成器运行在 GPU 进程，将多个图层合成为最终画面：

| 属性 | 触发的阶段 |
|------|------------|
| `transform` | 仅合成 |
| `opacity` | 仅合成 |
| `color` | 绘制 + 合成 |
| `width` | 布局 + 绘制 + 合成 |

> **性能提示**：优先使用 `transform` 和 `opacity` 做动画，避免触发布局和重绘。

## 七、性能优化

### 7.1 渲染阻塞优化

**CSS 优化**：

```html
<!-- 关键 CSS 内联 -->
<style>
  /* 首屏关键样式 */
  .header { display: flex; }
</style>

<!-- 非关键 CSS 延迟加载 -->
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">

<!-- 媒体查询条件加载 -->
<link rel="stylesheet" href="print.css" media="print">
```

**JavaScript 优化**：

```html
<!-- 推荐：defer 脚本 -->
<script defer src="app.js"></script>

<!-- 独立脚本 -->
<script async src="analytics.js"></script>

<!-- 动态加载 -->
<script>
  function loadScript(src) {
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  }
</script>
```

### 7.2 重排与重绘优化

```javascript
// ❌ 触发多次重排
element.style.width = '100px';
console.log(element.offsetHeight); // 强制同步布局
element.style.height = '100px';

// ✅ 批量操作，减少重排
element.style.cssText = 'width: 100px; height: 100px';

// ✅ 使用 DocumentFragment 批量添加 DOM
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  fragment.appendChild(div);
}
document.body.appendChild(fragment);
```

### 7.3 资源加载优化

```html
<!-- 图片懒加载 -->
<img loading="lazy" src="image.jpg" alt="">

<!-- 预加载关键资源 -->
<link rel="preload" href="font.woff2" as="font" crossorigin>
<link rel="preload" href="critical.css" as="style">

<!-- 预连接 -->
<link rel="preconnect" href="https://api.example.com">
<link rel="dns-prefetch" href="//cdn.example.com">
```

### 7.4 性能指标

| 指标 | 说明 | 推荐值 |
|------|------|--------|
| FCP | 首次内容绘制 | < 1.8s |
| LCP | 最大内容绘制 | < 2.5s |
| FID | 首次输入延迟 | < 100ms |
| CLS | 累积布局偏移 | < 0.1 |
| TTI | 可交互时间 | < 3.8s |

> [Web Vitals](https://web.dev/vitals/) 是 Google 推荐的核心性能指标。

## 八、流程总结

```mermaid
graph TD
    A[输入 URL] --> B[URL 解析/HSTS]
    B --> C[DNS 查询]
    C --> D[TCP 三次握手]
    D --> E[TLS 握手]
    E --> F[HTTP 请求]
    F --> G[接收响应]
    G --> H[解析 HTML → DOM]
    H --> I[解析 CSS → CSSOM]
    I --> J[构建渲染树]
    J --> K[布局计算]
    K --> L[绘制]
    L --> M[合成]
    M --> N[页面显示]
```

| 阶段 | 耗时 | 优化方向 |
|------|------|----------|
| DNS 查询 | ~20-100ms | DNS 预解析、CDN |
| TCP 连接 | ~20-100ms | HTTP/2 连接复用 |
| TLS 握手 | ~40-100ms | TLS 1.3、会话恢复 |
| TTFB | ~100-500ms | CDN、缓存优化 |
| DOM 构建 | ~50-200ms | 优化 HTML 结构 |
| 渲染 | ~100-500ms | 减少重排重绘 |

---

> **参考资料**：
> - [MDN - Web 性能](https://developer.mozilla.org/zh-CN/docs/Web/Performance)
> - [HTTP/3 规范](https://datatracker.ietf.org/doc/html/rfc9114)
> - [TLS 1.3 规范](https://datatracker.ietf.org/doc/html/rfc8446)
