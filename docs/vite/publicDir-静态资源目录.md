# publicDir 配置

## 定义

`publicDir` 指定静态资源目录，该目录中的文件会被原封不动地复制到输出目录，可通过绝对路径直接访问。

**类型**：`string | false`

**默认值**：`'public'`（相对于 `root` 目录）

## 可选值与使用方式

### 1. 字符串路径

```javascript
// 默认值 - public 目录
export default {
  publicDir: 'public'
}

// 自定义目录名
export default {
  publicDir: 'static'
}

// 嵌套目录
export default {
  publicDir: 'assets/public'
}

// 绝对路径
import path from 'path'

export default {
  publicDir: path.resolve(__dirname, './shared/public')
}
```

### 2. 禁用静态资源目录

```javascript
// 完全禁用 publicDir 功能
export default {
  publicDir: false
}
```

## 生效后的结果示例

### 默认配置

```javascript
// 项目结构
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

// vite.config.js - 默认配置
export default {
  // publicDir: 'public'  // 默认值
  build: {
    outDir: 'dist'
  }
}
```

**开发环境访问**：

```html
<!-- index.html -->
<link rel="icon" href="/favicon.ico" />
<img src="/logo.png" />
```

**生产构建后**：

```
dist/
├── index.html
├── assets/
│   └── main-abc123.js
├── favicon.ico       ← 从 public 复制
├── logo.png          ← 从 public 复制
├── fonts/
│   └── custom.woff2  ← 从 public 复制
└── robots.txt        ← 从 public 复制
```

### 自定义 publicDir

```javascript
// vite.config.js
export default {
  publicDir: 'assets'  // 使用 assets 目录代替 public
}
```

```
project/
├── assets/           ← 静态资源目录
│   └── favicon.ico
├── src/
└── vite.config.js
```

### 禁用 publicDir

```javascript
// vite.config.js
export default {
  publicDir: false  // 不复制任何静态文件
}
```

构建后只会处理通过 import 导入的资源，不会复制 public 目录。

### 结合 base 使用

```javascript
// vite.config.js
export default {
  base: '/app/',
  publicDir: 'public'
}
```

```html
<!-- index.html -->
<img src="/logo.png" />
<!-- 实际访问路径：/app/logo.png -->
```

或使用 `import.meta.env.BASE_URL`：

```html
<img src="${import.meta.env.BASE_URL}logo.png" />
```

## 使用场景

### 1. 网站图标和元数据

```javascript
// 项目结构
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
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
```

### 2. SEO 文件

```javascript
// public/
├── robots.txt
├── sitemap.xml
└── humans.txt
```

```bash
# robots.txt
User-agent: *
Allow: /

# sitemap.xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
  </url>
</urlset>
```

### 3. PWA 资源

```javascript
// public/
├── manifest.json
├── sw.js
├── icons/
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
└── offline.html
```

### 4. 第三方脚本

```javascript
// public/scripts/
├── analytics.js
└── tracker.js
```

```html
<script src="/scripts/analytics.js"></script>
```

### 5. 大型资源文件

不经过打包处理的大型资源：

```javascript
// public/videos/
├── intro.mp4
└── background.webm

// public/models/
├── scene.gltf
└── character.glb
```

### 6. 字体文件

```javascript
// public/fonts/
├── inter.woff2
├── inter.woff
└── inter.ttf
```

```css
/* src/styles/global.css */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter.woff2') format('woff2');
}
```

## 注意事项

### 1. 文件不会被处理

```javascript
// public/ 目录下的文件
// - 不会被压缩
// - 不会添加 hash
// - 不会经过任何转换
// - 直接复制到输出目录

// 如果需要处理，应该通过 import 导入
import logoUrl from './assets/logo.png'  // 会被处理
```

### 2. 引用路径规则

```html
<!-- ✅ 正确：以 / 开头 -->
<img src="/logo.png" />
<link href="/favicon.ico" />

<!-- ❌ 错误：相对路径 -->
<img src="./logo.png" />
<img src="../public/logo.png" />

<!-- 使用 BASE_URL（推荐） -->
<img src={`${import.meta.env.BASE_URL}logo.png`} />
```

### 3. 与 base 配置配合

```javascript
// vite.config.js
export default {
  base: '/app/',
  // publicDir: 'public'
}
```

```html
<!-- 开发环境：http://localhost:5173/app/logo.png -->
<!-- 生产环境：https://example.com/app/logo.png -->
<img src="/logo.png" />
```

### 4. 与 build.assetsDir 的区别

```javascript
export default {
  publicDir: 'public',           // 直接复制到输出目录根目录
  build: {
    assetsDir: 'assets'          // 打包资源放在 assets 子目录
  }
}
```

```
dist/
├── index.html
├── favicon.ico           ← publicDir 内容（根目录）
├── robots.txt            ← publicDir 内容（根目录）
└── assets/               ← 打包资源目录
    ├── main-abc123.js
    └── main-def456.css
```

### 5. 文件大小限制

```javascript
// publicDir 中的文件不受 assetsInlineLimit 影响
// 所有文件都会作为单独文件复制

// 如果想内联文件，应该通过 import 导入
import smallSvg from './assets/icon.svg?inline'
```

### 6. 优先级规则

```javascript
// 同名文件优先级
// 1. 源代码中 import 的资源优先
// 2. publicDir 中的同名文件会被忽略

// src/assets/logo.png (通过 import 导入)
// public/logo.png (会被忽略)
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `root` | `publicDir` 默认路径相对于 `root` |
| `base` | 最终访问路径 = `base` + 文件相对路径 |
| `build.outDir` | `publicDir` 内容复制到 `outDir` 根目录 |
| `build.assetsDir` | 打包资源放在 `assetsDir`，publicDir 文件在根目录 |
| `build.copyPublicDir` | 控制是否复制 publicDir 内容 |
| `assetsInclude` | 控制哪些文件类型被视为资源 |

## 完整示例

### Vue 项目完整配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  // 静态资源配置
  publicDir: 'public',  // 默认值

  // 生产构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 控制是否复制 public 目录
    copyPublicDir: true
  },

  // 开发服务器配置
  server: {
    port: 5173
  }
})
```

### 不同环境不同 publicDir

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  return {
    // 开发环境使用更多的静态资源
    publicDir: mode === 'development' ? 'public-dev' : 'public'
  }
})
```

### Monorepo 共享 public 目录

```javascript
// 项目结构
workspace/
├── packages/
│   └── shared/
│       └── public/          // 共享的静态资源
│           ├── favicon.ico
│           └── fonts/
├── apps/
│   ├── web/
│   │   └── vite.config.js
│   └── admin/
│       └── vite.config.js

// apps/web/vite.config.js
import path from 'path'

export default {
  // 使用共享的 public 目录
  publicDir: path.resolve(__dirname, '../../packages/shared/public')
}
```

### 自定义静态资源处理

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  // 禁用默认 publicDir
  publicDir: false,

  plugins: [
    // 使用插件复制静态文件（可以自定义处理）
    viteStaticCopy({
      targets: [
        {
          src: 'public/images',
          dest: 'assets/images'
        },
        {
          src: 'public/fonts',
          dest: 'assets/fonts'
        }
      ]
    })
  ]
})
```

## 常见问题

### 问题 1：public 文件无法访问

**原因**：引用路径错误

```html
<!-- ❌ 错误 -->
<img src="public/logo.png" />
<img src="./logo.png" />

<!-- ✅ 正确 -->
<img src="/logo.png" />
```

### 问题 2：base 路径变化后资源 404

**原因**：未考虑 base 配置

```javascript
// vite.config.js
export default {
  base: '/app/'
}
```

```html
<!-- ❌ 错误：base 变化后路径不对 -->
<img src="/logo.png" />

<!-- ✅ 正确：使用 BASE_URL -->
<img src={`${import.meta.env.BASE_URL}logo.png`} />
```

### 问题 3：文件未更新

**原因**：浏览器缓存或服务端缓存

**解决**：
```bash
# 清除缓存
rm -rf node_modules/.vite
rm -rf dist

# 重启开发服务器
```

### 问题 4：大文件构建慢

**原因**：大文件每次都复制

**解决**：
```javascript
// 对于不常变动的大文件，考虑使用 CDN
export default {
  build: {
    // 不复制 public 目录
    copyPublicDir: false
  }
}
```

## 官方文档

[Shared Config: publicDir - Vite 官方文档](https://cn.vitejs.dev/config/shared-options.html#publicdir)

[Public Directory - Vite 官方文档](https://cn.vitejs.dev/guide/assets.html#the-public-directory)
