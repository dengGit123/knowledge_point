# publicDir 配置

> 📖 [官方文档：Shared Options](https://cn.vitejs.dev/config/shared-options.html)

## 定义

`publicDir` 指定作为静态资源服务的目录。该目录中的文件在开发期间于 `/` 根路径下直接提供，构建期间**原样复制**到 `outDir` 根目录，全程不做任何转换。值可以是文件系统的绝对路径，也可以是相对于项目根目录的相对路径。

**类型**：`string | false`

**默认值**：`'public'`（相对于项目根目录）

设为 `false` 可关闭此项功能。

相关官方指南：[静态资源处理 · `public` 目录](https://cn.vitejs.dev/guide/assets.html#the-public-directory)。

## 可选值与使用方式

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
  // 默认值：项目根目录下的 public
  publicDir: 'public',

  // 或自定义目录名 / 嵌套目录
  // publicDir: 'static',
  // publicDir: 'assets/public',

  // 或指向项目外的绝对路径（如 monorepo 共享目录）
  // publicDir: path.resolve(__dirname, './shared/public'),

  // 或完全禁用静态资源目录
  // publicDir: false
})
```

## 生效后的结果示例

### 默认配置

```text
project/
├── public/
│   ├── favicon.ico
│   ├── logo.png
│   ├── fonts/
│   │   └── custom.woff2
│   └── robots.txt
├── src/
│   └── main.js
├── index.html
└── vite.config.js
```

开发环境直接以根绝对路径访问：

```html
<!-- index.html -->
<link rel="icon" href="/favicon.ico" />
<img src="/logo.png" />
```

构建后 `public/` 的内容被原样复制到 `dist/` 根目录：

```text
dist/
├── index.html
├── assets/
│   └── main-abc123.js     ← 打包产物
├── favicon.ico            ← 来自 public，文件名不变
├── logo.png               ← 来自 public，文件名不变
├── fonts/
│   └── custom.woff2       ← 来自 public，文件名不变
└── robots.txt             ← 来自 public，文件名不变
```

### 禁用 publicDir

```javascript
// vite.config.js
export default {
  publicDir: false // 不提供、也不复制任何静态文件
}
```

### 与 base 配置配合

```javascript
// vite.config.js
export default {
  base: '/app/',
  publicDir: 'public'
}
```

此时 public 资源的最终访问路径是 `base` + 文件路径：开发环境为 `http://localhost:5173/app/logo.png`，生产环境为 `https://example.com/app/logo.png`。在代码中引用时拼接 `import.meta.env.BASE_URL` 最稳妥：

```vue
<script setup>
// BASE_URL 就是 base 配置的值（以 / 结尾）
const logoUrl = `${import.meta.env.BASE_URL}logo.png`
</script>

<template>
  <img :src="logoUrl" alt="logo" />
</template>
```

## 使用场景

官方建议：当资源**不会被源码引用**（如 `robots.txt`）、**必须保持原文件名**（不经过 hash），或者只是想要一个稳定的 URL 时，才放入 `public` 目录；其他资源优先通过 `import` 引入以获得处理与加速能力。

### 1. 网站图标和元数据

```text
public/
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
├── apple-touch-icon.png
└── site.webmanifest
```

```html
<!-- index.html -->
<link rel="icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
```

### 2. SEO 文件

```text
public/
├── robots.txt
└── sitemap.xml
```

```text
# robots.txt
User-agent: *
Allow: /
```

```xml
<!-- sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
  </url>
</urlset>
```

### 3. 不参与打包的大文件

视频、3D 模型等大体积文件放 `public` 可避免被打包管线处理，直接按 URL 访问：

```text
public/
├── videos/
│   ├── intro.mp4
│   └── background.webm
└── models/
    ├── scene.gltf
    └── character.glb
```

### 4. 字体文件

```text
public/fonts/
├── inter.woff2
└── inter.woff
```

```css
/* src/styles/global.css */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
}
```

### 5. 第三方脚本

```html
<!-- index.html：引入不参与打包的统计脚本 -->
<script src="/scripts/analytics.js"></script>
```

## 注意事项

### 1. 文件不会被处理

`public` 中的文件不会被压缩、不会添加 hash、不会经过任何转换，只是原样复制。需要 hash 与压缩的资源应通过 `import` 引入：

```javascript
// 经打包处理：会压缩、会加 hash，返回处理后的 URL
import logoUrl from './assets/logo.png'
```

### 2. 引用路径规则

始终使用根绝对路径引用 public 资源——`public/icon.png` 在源码中写作 `/icon.png`：

```html
<!-- ✅ 正确：以 / 开头的根绝对路径 -->
<img src="/logo.png" />
<link href="/favicon.ico" />

<!-- ❌ 错误：相对路径，dev 与构建后都会 404 -->
<img src="./logo.png" />
<img src="../public/logo.png" />
```

> ⚠️ **注意：** `public` 中的资源**无法通过 JavaScript `import` 导入**，Vite 会给出警告；需要 import 处理的资源应放在源码目录（如 `src/assets`）。

### 3. 与 build.assetsDir 的区别

```javascript
// vite.config.js
export default {
  publicDir: 'public', // 内容原样复制到 outDir 根目录
  build: {
    assetsDir: 'assets' // 打包产物资源存放的子目录（默认 'assets'）
  }
}
```

`publicDir` 管的是"不经处理的静态文件"，`assetsDir` 管的是"打包后的资源放哪个子目录"，两者互不相干。

### 4. 不受 assetsInlineLimit 影响

`public` 中的文件不会被内联，无论多小都会作为独立文件复制。内联能力只作用于被 import 的资源：

```javascript
// Vite 6+ 支持 ?inline / ?no-inline 后缀，显式控制导入资源是否内联为 base64
import inlineIcon from './assets/icon.svg?inline'
```

### 5. 与 import 资源的产物区别

`public/logo.png` 原样复制、无 hash；`import logoUrl from './assets/logo.png'` 生成 `logo-abc123.png` 这类带 hash 的产物。二者互不冲突，但引用方式完全不同：要处理就 import，要原样 URL 就放 `public`。

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `root` | `publicDir` 默认相对于项目根目录 |
| `base` | 最终访问路径 = `base` + 文件根绝对路径 |
| `build.outDir` | 构建时 `publicDir` 内容复制到 `outDir` 根目录 |
| `build.assetsDir` | 打包资源放 `assetsDir` 子目录，public 文件在根目录 |
| `build.copyPublicDir` | 设为 `false` 可在构建时跳过复制 public 目录 |
| `assetsInclude` | 只影响被 `import` 的资源类型识别，与 publicDir 无关 |

## 完整示例

### Vue 项目完整配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  publicDir: 'public', // 默认值，显式写出便于团队识别

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    copyPublicDir: true // 构建时复制 public 目录（默认 true）
  },

  server: {
    port: 5173
  }
})
```

### 不同环境使用不同 publicDir

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  return {
    // 例如开发环境挂一份带 mock 数据的资源目录
    publicDir: mode === 'development' ? 'public-dev' : 'public'
  }
})
```

### Monorepo 共享静态资源

```text
workspace/
├── packages/
│   └── shared/
│       └── public/          ← 共享的静态资源
│           ├── favicon.ico
│           └── fonts/
└── apps/
    ├── web/
    │   └── vite.config.js
    └── admin/
        └── vite.config.js
```

```javascript
// apps/web/vite.config.js
import path from 'node:path'

export default {
  // 多个应用共用同一份静态资源
  publicDir: path.resolve(__dirname, '../../packages/shared/public')
}
```

### 用插件精细控制复制

需要改名、过滤、复制到子目录时，可禁用默认行为并交给插件处理：

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  publicDir: false,

  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'public/images', dest: 'assets/images' },
        { src: 'public/fonts', dest: 'assets/fonts' }
      ]
    })
  ]
})
```

## 常见问题

### 问题 1：public 文件无法访问

**原因**：引用路径没有以 `/` 开头，或把 `public` 目录名写进了 URL。

```html
<!-- ❌ 错误 -->
<img src="public/logo.png" />
<img src="./logo.png" />

<!-- ✅ 正确：public 本身不出现在 URL 中，从根路径开始 -->
<img src="/logo.png" />
```

### 问题 2：base 路径变化后资源 404

**原因**：部署在 `/app/` 子路径下，硬编码的根路径没有带上 base。

**解决**：在 JS 与模板中统一拼接 `import.meta.env.BASE_URL`：

```vue
<script setup>
const logoUrl = `${import.meta.env.BASE_URL}logo.png`
</script>

<template>
  <img :src="logoUrl" alt="logo" />
</template>
```

### 问题 3：修改 public 文件后内容未更新

**原因**：public 文件不经过 Vite 的编译与缓存流程，通常是浏览器缓存了旧响应。

**解决**：开发时硬刷新（`Cmd/Ctrl + Shift + R`）或在 DevTools 中禁用缓存；构建产物异常时重新执行 `vite build`。

### 问题 4：大文件导致构建与部署变慢

**解决**：体积大且不常变动的文件优先放 CDN，再用 `base` 指向 CDN 地址；确需跳过复制时设置 `build.copyPublicDir: false`（此时 public 目录不会进入产物，需自行处理这些文件的部署）。
