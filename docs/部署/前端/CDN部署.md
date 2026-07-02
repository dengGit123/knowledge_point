### 一、概述

> 📖 [CDN（维基百科）](https://zh.wikipedia.org/wiki/%E5%85%A7%E5%AE%B9%E5%82%B3%E9%81%9E%E7%B6%B2%E8%B7%AF) ｜ [Vite base 配置](https://vitejs.dev/guide/build.html#public-base-path)

CDN（Content Delivery Network，内容分发网络）是前端**加速**的核心手段。它把你的静态资源**分发到全球各地的节点**，用户访问时从**离自己最近的节点**拿文件，大幅降低延迟。

大白话：你的服务器在北京，广州用户访问要绕半个中国，慢。CDN 像在全国各地开「**连锁仓库**」——把文件复制到每个城市的仓库，广州用户从广州仓库取，秒开。

| 你将学到 | 说明 |
| --- | --- |
| CDN 原理 | 就近访问、回源 |
| 前端上 CDN | 改 publicPath（base） |
| 哪些上 CDN | 静态资源上，HTML 不上 |
| 配合缓存 | CDN 缓存策略 |

> 💡 **提示：** 用户遍布全国/全球的 C 端应用，CDN 是**必备**。配合 [[缓存策略]] 的 hash 文件名，效果最佳。

---

### 二、CDN 的工作原理

#### 1. 就近访问

```
没有 CDN：
  广州用户 ─────► 北京源服务器（远，慢）

有 CDN：
  广州用户 ─► 广州 CDN 节点（近，快！）
                 │（首次/缓存过期时）
                 ▼ 回源
              北京源服务器
```

#### 2. 回源（Origin Pull）

CDN 节点没有用户要的文件时，会去**源服务器**（你的服务器）拉取，这叫「回源」。拉取后缓存在节点，下次直接给用户。

```
用户请求 cdn.example.com/app.js
   │
   ▼
CDN 节点有缓存？ ── 是 ── 直接返回（命中，最快）
   │
   否（首次或过期）
   ▼
回源到源服务器拉取 → 缓存到节点 → 返回用户
```

> 💡 **提示：** CDN 的价值就是**让绝大多数请求命中节点缓存**，不用每次回源。命中率越高，加速效果越好。

---

### 三、前端上 CDN 的方案

#### 方案：静态资源走 CDN，HTML 走源站

```
访问 www.example.com           → 源站 Nginx 返回 index.html
HTML 里引用 cdn.example.com/xxx.js → CDN 节点返回 JS
```

**关键：HTML 必须从源站拿（保证最新），静态资源从 CDN 拿（加速）。**

为什么 HTML 不上 CDN？因为 HTML 是入口，必须每次拿最新的（详见 [[缓存策略]]），放 CDN 反而可能更新不及时。

---

### 四、Vite 配置资源路径（base）

打包时，让静态资源的引用地址指向 CDN 域名：

#### vite.config.js

```javascript
import { defineConfig } from 'vite'

export default defineConfig({
  // ✅ 关键：把静态资源的公共路径改成 CDN 地址
  base: 'https://cdn.example.com/assets/',

  build: {
    assetsDir: 'assets',
  },
})
```

打包后，`index.html` 里的资源引用变成：

```html
<!-- 打包前（默认） -->
<script src="/assets/index-a3f2.js"></script>

<!-- 打包后（base 指向 CDN） -->
<script src="https://cdn.example.com/assets/index-a3f2.js"></script>
```

> 💡 **提示：** `base` 就是 Vite/Webpack 的 `publicPath`——**决定打包后资源引用的前缀**。改成 CDN 域名，资源就走 CDN 了。

#### 环境区分

开发和生产用不同的 base：

```javascript
export default defineConfig({
  // 开发用相对路径，生产用 CDN
  base: process.env.NODE_ENV === 'production'
    ? 'https://cdn.example.com/assets/'
    : '/',
})
```

---

### 五、部署流程（CDN + 源站）

```
① 本地打包（base 指向 CDN）
   npm run build

② 上传 index.html 到源站服务器
   scp dist/index.html → 服务器（Nginx）

③ 上传静态资源（assets/）到 CDN
   上传到对象存储（OSS/S3）→ CDN 回源到对象存储
   或：CDN 直接回源到你的服务器

④ 配置 CDN 回源地址
   CDN 控制台设置源站为你的服务器/对象存储
```

#### 两种常见架构

```
架构A：CDN + 对象存储（推荐）
  CDN ──回源──► 对象存储（OSS/S3，存静态资源）
  源站 Nginx ── 只放 index.html + 转发 API

架构B：CDN + 自建服务器
  CDN ──回源──► 你的 Nginx（静态资源 + HTML 都在这）
```

> 💡 **提示：** 架构 A 更标准——静态资源放对象存储（海量、便宜、稳定），CDN 加速，源站只管动态内容（HTML + API）。

---

### 六、CDN 缓存与更新

#### 1. CDN 缓存

CDN 节点也会缓存资源。配合 hash 文件名（见 [[缓存策略]]）：

- 带 hash 的 JS/CSS → CDN 长缓存（内容变 hash 变，新文件自动回源）
- index.html → CDN **不缓存**或短缓存（保证拿到最新 HTML）

#### 2. 更新后刷新 CDN 缓存

部署新版本后，**旧的 HTML 可能被 CDN 缓存**。需要：

- 配置 CDN 对 HTML **不缓存**
- 或手动在 CDN 控制台**刷新缓存**（预热/刷新 URL）

> ⚠️ **注意：** 带 hash 的静态资源不用担心（hash 变了是新文件），**主要是 HTML 要确保不缓存**，否则用户拿到旧 HTML → 引用旧 hash 文件 → 看到旧版本。

---

### 七、第三方库上 CDN（externals）

除了自己打包的资源，第三方库（Vue、React、Element-UI）也可以直接用公共 CDN：

#### vite.config.js（external）

```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      external: {
        vue: 'Vue',           // 不打包 vue，运行时从 CDN 加载
      },
    },
  },
})
```

```html
<!-- index.html 里手动引入 CDN 的 vue -->
<script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js"></script>
```

好处：第三方库走公共 CDN，**不占自己打包体积，加载快**。

> 💡 **提示：** 把稳定的大库（vue、echarts、element）放到 CDN externals，能显著减小自己的打包体积。

---

### 八、常见问题与注意事项

#### 1. 资源 404

`base` 配置和实际上传路径不一致。比如 `base` 是 `/assets/`，但传到了 `/myapp/`。两者要对齐。

#### 2. CDN 缓存导致更新不生效

HTML 被 CDN 缓存。配置 CDN 对 HTML 不缓存，或部署后刷新 CDN。

#### 3. HTTPS 混合内容

源站是 HTTPS，CDN 域名也要是 HTTPS（不然混合内容被拦）。给 CDN 域名也配证书。

#### 4. 跨域问题

CDN 域名和源站不同源。静态资源一般要配 CORS（CDN 控制台开启），字体文件尤其需要。

#### 5. CDN 成本

CDN 按流量/带宽计费。大流量站点要关注成本，配合缓存命中率降低回源。

#### 6. base 末尾斜杠

`base: 'https://cdn.example.com/assets/'` **末尾要有 `/`**，否则路径拼接出错。

---

### 九、实际应用场景

| 场景 | CDN 用法 |
| --- | --- |
| 全国/全球 C 端应用 | 静态资源全上 CDN |
| 高流量网站 | 对象存储 + CDN |
| 第三方库 | externals + 公共 CDN |
| 中小项目 | 可不上 CDN，Nginx 够用 |
| 内网应用 | 不需要 CDN |

#### 主流 CDN 服务商

| 类型 | 服务商 |
| --- | --- |
| 国内 | 阿里云 CDN、腾讯云 CDN、Cloudflare China |
| 国际 | Cloudflare、AWS CloudFront、jsDelivr（开源库） |
| 对象存储 | 阿里云 OSS、腾讯云 COS、AWS S3 |

---

### 十、总结

| 要点 | 说明 |
| --- | --- |
| 作用 | 就近访问，加速 |
| 原理 | 节点缓存 + 回源 |
| 方案 | 静态资源上 CDN，HTML 留源站 |
| Vite 配置 | `base` 指向 CDN 域名 |
| 缓存配合 | hash 文件长缓存，HTML 不缓存 |
| 更新 | 改 hash + 刷新 CDN |

一句话：**`base` 指向 CDN，静态资源传 CDN（或对象存储），HTML 留源站**，配合 hash 缓存策略，用户全球秒开。

相关文档：[[缓存策略]]、[[压缩配置]]、[[部署概述]]、[[Nginx部署]]。
