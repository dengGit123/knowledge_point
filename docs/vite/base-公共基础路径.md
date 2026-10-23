# base 配置

> 📖 [官方文档：Shared Options](https://cn.vitejs.dev/config/shared-options.html)

## 定义

`base` 指定应用在开发和生产环境服务时的公共基础路径。

**类型**：`string`（Vite 6 起支持 `false`，实验性，用于关闭所有基于 base 的路径重写）

**默认值**：`'/'`

此值会同时影响：

- 开发服务器的基础路径（访问 URL 前缀）
- 构建产物中 js/css/图片等资源引用的路径前缀
- `index.html` 中注入资源的路径前缀

## 可选值与使用方式

官方规定的合法取值形式：

| 形式 | 示例 | 说明 |
|------|------|------|
| 绝对路径 | `/foo/` | 最常用，部署在域名子路径 |
| 完整 URL | `https://foo.com/` | 资源托管在独立 CDN 域名 |
| 空字符串或 `./` | `''`、`'./'` | 嵌入式用法，产物内使用相对路径 |

### 1. 绝对路径（最常用）

```javascript
// vite.config.js
export default {
  base: '/app/' // 应用部署在 https://example.com/app/ 下
}
```

构建后 `index.html` 中注入的引用都会带上前缀：

```html
<script type="module" src="/app/assets/index-abc123.js"></script>
<link rel="stylesheet" href="/app/assets/index-def456.css" />
```

### 2. 完整 URL（CDN 部署）

```javascript
// vite.config.js
export default {
  base: 'https://cdn.example.com/my-app/'
}
```

```html
<script type="module" src="https://cdn.example.com/my-app/assets/index-abc123.js"></script>
```

### 3. 相对路径（嵌入式用法）

```javascript
// vite.config.js
export default {
  base: './' // 产物使用相对路径引用资源
}
```

> ⚠️ **注意：** 相对路径下每个 HTML 页面按自身位置解析资源，页面层级较深时可能加载失败，仅适合单页面或嵌入式场景。

### 4. 空字符串

`base: ''` 与 `./` 同属嵌入式用法，官方将两者归为一类，不要把它当作 `'/'` 的等价写法。

> 💡 **提示：** Vite 6 起 `base: false` 会同时关闭资源与导入路径的 base 重写。

## 运行时访问

代码中通过 `import.meta.env.BASE_URL` 读取配置的 base 值：

```javascript
// Vue 组件中
const baseUrl = import.meta.env.BASE_URL // '/app/'

// 动态拼接公共资源路径
const imageUrl = `${import.meta.env.BASE_URL}images/logo.png`
```

## 生效后的结果示例

### 开发环境

```javascript
// vite.config.js
export default {
  base: '/admin/'
}
```

开发服务器访问地址变为 `http://localhost:5173/admin/`。

### 生产构建

```javascript
// vite.config.js
export default {
  base: '/my-app/'
}
```

```html
<!-- 构建前 index.html -->
<script type="module" src="/src/main.js"></script>

<!-- 构建后 dist/index.html -->
<script type="module" src="/my-app/assets/index-abc123.js"></script>
```

部署时需要把 `dist` 目录内容放到服务器的 `/my-app/` 路径下。

## 使用场景

### 1. 子路径部署（GitHub Pages 等）

```javascript
// 部署到 https://username.github.io/repo-name/
export default {
  base: '/repo-name/'
}
```

### 2. CDN 部署（按环境区分）

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  // 生产走 CDN，开发走根路径
  base: mode === 'production' ? 'https://cdn.example.com/my-app/' : '/'
}))
```

### 3. 配合环境变量

```bash
# .env.production
VITE_BASE_URL=https://cdn.example.com/app/
```

```javascript
// vite.config.js
export default {
  base: process.env.VITE_BASE_URL || '/'
}
```

### 4. Monorepo 多应用

每个子应用配置各自的部署前缀与输出目录：

```javascript
// apps/admin/vite.config.js
export default {
  base: '/admin/',
  build: { outDir: '../../dist/admin' }
}

// apps/app/vite.config.js
export default {
  base: '/app/',
  build: { outDir: '../../dist/app' }
}
```

## 注意事项

### 1. 路径格式规范

```javascript
// ✅ 推荐：以 / 开头并以 / 结尾
base: '/app/'
base: '/'

// ⚠️ 能运行但不规范：Vite 会自动补全斜杠，但可能输出警告
base: '/app' // 自动规范化为 /app/
base: 'app/' // 自动规范化为 /app/
```

### 2. 与前端路由的 base 保持一致

```javascript
// vite.config.js
export default {
  base: '/admin/'
}
```

Vue Router 必须使用相同前缀，通常直接读 `import.meta.env.BASE_URL`：

```javascript
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // 与 vite 的 base 一致
  routes
})
```

### 3. CLI 优先级高于配置文件

命令行 `--base`（简写 `-b`）会覆盖配置文件中的 `base`：

```bash
vite build --base=/custom-path/
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `root` | `base` 是 URL 路径前缀，`root` 是文件系统路径，两者独立 |
| `import.meta.env.BASE_URL` | 代码中读取 base 的官方途径 |
| `build.assetsDir` | 产物完整路径 = `base` + `assetsDir` + 文件名 |
| `server.origin` | 跨域开发时指定资源来源，与 base 配合使用 |
| `publicDir` | public 目录下资源的引用路径同样会加上 `base` 前缀 |

## 完整示例

### GitHub Pages 部署（Vue 项目）

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/my-vite-app/', // 仓库名为 my-vite-app
  plugins: [vue()]
})
```

```javascript
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})
```

### 多环境 base

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  return {
    base:
      mode === 'development'
        ? '/' // 开发环境：本地根路径
        : mode === 'staging'
          ? 'https://staging-cdn.example.com/app/' // 预发布：测试 CDN
          : 'https://cdn.example.com/app/' // 生产：正式 CDN
  }
})
```

## 常见问题

### 问题 1：刷新页面 404

**原因**：`base` 配置与服务器配置不匹配，子路径下的请求没有回退到入口 HTML。

**解决**：让服务器把该前缀下的所有请求重定向到 `index.html`：

```nginx
# nginx 配置
location /app/ {
    try_files $uri $uri/ /app/index.html;
}
```

### 问题 2：资源加载失败

**原因**：`vite.config.js` 的 `base` 与前端路由的 base 不一致，页面内生成的链接指向了错误前缀。

**解决**：两边统一使用 `import.meta.env.BASE_URL`（见「注意事项 2」）。

### 问题 3：本地开发正常，部署后 404

**原因**：生产服务器未配置子路径回退规则。

**解决**：根据服务器类型配置回退：

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
