# base 配置

## 定义

`base` 指定应用在开发和生产环境服务时的公共基础路径。

**类型**：`string`

**默认值**：`'/'`

此值会同时影响：
- 开发服务器的基础路径
- 生产构建后资源的引用路径前缀
- `index.html` 中资源注入的路径前缀

## 可选值与使用方式

### 1. 绝对路径（最常用）

```javascript
// 默认值 - 部署在域名根路径
base: '/'

// 子路径部署
base: '/base-path/'
```

**效果示例**：

```javascript
// base: '/'
<script src="/assets/index-abc123.js"></script>
<img src="/images/logo.png">

// base: '/app/'
<script src="/app/assets/index-abc123.js"></script>
<img src="/app/images/logo.png">
```

### 2. 完整 URL（CDN 部署）

```javascript
// 部署到 CDN
base: 'https://cdn.example.com/my-app/'
base: 'https://example.com/'

// 不同环境使用不同 CDN
base: process.env.CDN_URL || '/'
```

**效果示例**：

```javascript
// base: 'https://cdn.example.com/app/'
<script src="https://cdn.example.com/app/assets/index-abc123.js"></script>
<link href="https://cdn.example.com/app/styles/main-def456.css">
```

### 3. 相对路径

```javascript
// 使用相对路径（适用于不确定部署路径的情况）
base: './'
```

**效果示例**：

```javascript
// base: './' 生成相对路径引用
<script src="./assets/index-abc123.js"></script>
```

**注意**：相对路径会导致每个 HTML 文件使用不同的路径来解析资源。

### 4. 空字符串

```javascript
base: ''  // 等同于 base: '/'
```

## 运行时访问

在代码中可以通过 `import.meta.env.BASE_URL` 获取配置的 base 值：

```javascript
// 在 Vue 组件中
const baseUrl = import.meta.env.BASE_URL  // '/app/'

// 动态构建资源路径
const imageUrl = `${import.meta.env.BASE_URL}images/logo.png`
```

## 生效后的结果示例

### 开发环境

```javascript
// vite.config.js
export default {
  base: '/admin/',
  server: {
    port: 5173
  }
}
```

访问地址变为：`http://localhost:5173/admin/`

### 生产构建

```javascript
// vite.config.js
export default {
  base: '/my-app/',
  build: {
    outDir: 'dist'
  }
}
```

构建后的 `dist/index.html`：

```html
<!-- 构建前 -->
<script src="/src/main.js"></script>

<!-- 构建后 -->
<script src="/my-app/assets/index-abc123.js"></script>
<link href="/my-app/assets/main-def456.css">
```

构建产物目录结构：

```
dist/
├── index.html
└── assets/
    ├── index-abc123.js
    └── main-def456.css
```

部署到服务器时，需要将 `dist` 目录内容部署到 `/my-app/` 路径下。

## 使用场景

### 1. 子路径部署

应用部署在域名的子路径下，而非根路径。

```javascript
// 部署到 https://example.com/admin/
export default {
  base: '/admin/'
}
```

### 2. GitHub Pages 部署

```javascript
// 部署到 https://username.github.io/repo-name/
export default {
  base: '/repo-name/'
}
```

### 3. CDN 部署

静态资源托管在 CDN，HTML 与资源分离：

```javascript
// 开发环境使用本地路径
// 生产环境使用 CDN
export default defineConfig(({ mode }) => ({
  base: mode === 'production'
    ? 'https://cdn.example.com/my-app/'
    : '/'
}))
```

### 4. 多环境配置

```javascript
// .env.production
VITE_BASE_URL=https://cdn.example.com/app/

// vite.config.js
export default {
  base: process.env.VITE_BASE_URL || '/'
}
```

### 5. Monorepo 多应用

```javascript
// apps/admin/vite.config.js
export default {
  base: '/admin/',
  build: {
    outDir: '../../dist/admin'
  }
}

// apps/app/vite.config.js
export default {
  base: '/app/',
  build: {
    outDir: '../../dist/app'
  }
}
```

## 注意事项

### 1. 路径格式规范

```javascript
// ✅ 正确：以 / 开头和结尾
base: '/app/'
base: '/'

// ⚠️ 不推荐：不以 / 结尾（Vite 会自动处理）
base: '/app'  // Vite 会自动转为 /app/

// ❌ 错误：不以 / 开头
base: 'app/'  // 会导致路径解析错误
```

### 2. 路由器配置配合

使用前端路由时需要同步配置 base：

```javascript
// vite.config.js
export default {
  base: '/admin/'
}

// Vue Router
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/admin/'),  // 必须与 base 一致
  routes
})

// React Router
<BrowserRouter basename="/admin/">
  {/* ... */}
</BrowserRouter>
```

### 3. 相对路径的局限性

```javascript
base: './'  // 相对路径
```

使用相对路径时：
- 每个页面的资源解析路径不同
- 可能导致某些资源加载失败
- 仅适用于单页面或不涉及深层路径的场景

### 4. 环境变量优先级

通过环境变量设置的 base 会覆盖配置文件：

```bash
# 命令行设置优先级最高
vite build --base=/custom-path/
```

### 5. TypeScript 类型声明

```typescript
// vite-env.d.ts
/// <reference types="vite/client" />

// import.meta.env.BASE_URL 自动有类型提示
const baseUrl: string = import.meta.env.BASE_URL
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `root` | `base` 是相对于服务器根路径的前缀，与 `root` 无关 |
| `build.outDir` | `base` 影响构建产物中的路径引用，但不影响输出目录 |
| `build.assetsDir` | 完整资源路径 = `base` + `assetsDir` + 文件名 |
| `server.origin` | 跨域开发时，`origin` 配合 `base` 使用 |
| `publicDir` | `publicDir` 中文件的引用路径也会加上 `base` 前缀 |

## 完整示例

### GitHub Pages 部署

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages 仓库名为 my-vite-app
  base: '/my-vite-app/',

  build: {
    outDir: 'dist',
    // 确保 assets 目录配置正确
    assetsDir: 'assets'
  }
})

// src/router/index.js (Vue Router)
import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})
```

### 多环境配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  return {
    // 根据环境设置不同的 base
    base: mode === 'development'
      ? '/'                              // 开发环境：本地根路径
      : mode === 'staging'
        ? 'https://staging-cdn.example.com/app/'  // 预发布：测试 CDN
        : 'https://cdn.example.com/app/',         // 生产：正式 CDN

    build: {
      outDir: 'dist',
      assetsDir: 'static'
    }
  }
})
```

### 动态 Base（不推荐，但可行）

```javascript
// vite.config.js
export default {
  base: process.env.BASE_URL || '/'
}
```

```bash
# 构建时指定
BASE_URL=/custom-path/ vite build
```

## 常见问题

### 问题 1：刷新页面 404

**原因**：`base` 配置与服务器配置不匹配

**解决**：确保服务器将所有请求重定向到 `index.html`

```nginx
# nginx 配置
location /app/ {
    try_files $uri $uri/ /app/index.html;
}
```

### 问题 2：资源加载失败

**原因**：`base` 与路由器 `basename` 不一致

**解决**：同步配置

```javascript
// vite.config.js
base: '/admin/'

// Vue Router
history: createWebHistory('/admin/')
```

### 问题 3：本地开发正常，部署后 404

**原因**：生产服务器未配置子路径

**解决**：根据部署方式配置服务器

```apache
# Apache .htaccess
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /app/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /app/index.html [L]
</IfModule>
```

## 官方文档

[Shared Config: base - Vite 官方文档](https://cn.vitejs.dev/config/shared-options.html#base)
