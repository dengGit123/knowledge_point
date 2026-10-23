# preview 配置

> 📖 [官方文档：Preview Options](https://cn.vitejs.dev/config/preview-options.html)

## 定义

`preview` 配置预览服务器（`vite preview`，用于本地预览生产构建产物）的行为。除非特别说明，本节选项只作用于预览阶段；除 `port` 外，绝大多数选项默认继承 `server` 的同名配置。

**类型**：

```typescript
{
  host?: string | boolean
  allowedHosts?: string[] | true
  port?: number
  strictPort?: boolean
  https?: https.ServerOptions
  open?: boolean | string
  proxy?: Record<string, string | ProxyOptions>
  cors?: boolean | CorsOptions
  headers?: OutgoingHttpHeaders
}
```

**默认值**（未配置时继承 `server` 同名选项）：

```javascript
{
  host: 继承 server.host,            // server.host 默认 'localhost'
  allowedHosts: 继承 server.allowedHosts,
  port: 4173,                        // 唯一有自己默认值的端口选项
  strictPort: 继承 server.strictPort,
  https: 继承 server.https,
  open: 继承 server.open,
  proxy: 继承 server.proxy,          // 开发与预览默认共用一套代理规则
  cors: 继承 server.cors             // server.cors 默认仅允许本机源
}
```

## 子属性详解

### host

**类型**：`string | boolean`

**默认值**：继承 `server.host`（`'localhost'`）

指定预览服务器监听的 IP 地址。`'0.0.0.0'` 或 `true` 表示监听所有地址（含局域网）。命令行可用 `--host 0.0.0.0` 或 `--host`。

```javascript
host: true  // 局域网内设备可访问预览页面
```

### allowedHosts

**类型**：`string[] | true`

**默认值**：继承 `server.allowedHosts`

允许 Vite 响应的主机名列表，默认放行 `localhost`、`.localhost` 子域和所有 IP。细节与安全注意事项见 `server.allowedHosts`。

### port

**类型**：`number`

**默认值**：`4173`

指定预览服务器端口。端口被占用时 Vite 会自动尝试下一个可用端口，实际监听端口可能不是配置值（除非配合 `strictPort`）。

```javascript
port: 8080
```

### strictPort

**类型**：`boolean`

**默认值**：继承 `server.strictPort`（`false`）

设为 `true` 时端口被占用直接退出，而不是自动尝试下一个可用端口。

### https

**类型**：`https.ServerOptions`

**默认值**：继承 `server.https`

启用 TLS + HTTP/2，值为传给 Node.js `https.createServer()` 的选项对象，需要提供有效证书（基础场景可配合 `@vitejs/plugin-basic-ssl` 自动生成自签名证书）。

### open

**类型**：`boolean | string`

**默认值**：继承 `server.open`（`false`）

预览服务器启动时自动在浏览器中打开应用。字符串值作为 URL 的 pathname 使用；指定浏览器可通过 `process.env.BROWSER` 与 `process.env.BROWSER_ARGS`（也可写在 `.env` 中）。

```javascript
open: true          // 启动即打开浏览器
open: '/docs/index.html'  // 打开指定路径
```

### proxy

**类型**：`Record<string, string | ProxyOptions>`

**默认值**：继承 `server.proxy`

预览服务器的代理规则，选项含义与 `server.proxy` 一致：请求路径以 key 开头即代理到 target，key 以 `^` 开头按 `RegExp` 解析，内部基于 `http-proxy-3`。由于默认继承 `server.proxy`，开发与预览通常共用一套代理，只有需要不同后端时才单独覆盖。

```javascript
proxy: {
  '/api': {
    target: 'http://api.example.com',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

### cors

**类型**：`boolean | CorsOptions`

**默认值**：继承 `server.cors`（即默认仅允许 `localhost`、`127.0.0.1`、`::1` 等本机源）

配置预览服务器的 CORS。

```javascript
cors: true   // 允许任何源（会向任意网站开放预览内容，慎用）
cors: false  // 关闭 CORS 处理
cors: {
  origin: ['http://localhost:3000', 'https://example.com']
}
```

### headers

**类型**：`OutgoingHttpHeaders`

指定预览服务器响应头。

```javascript
headers: {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff'
}
```

## 启动与输出

预览服务器服务的是 `build.outDir`（默认 `dist/`）中的构建产物，所以必须先构建：

```bash
vite build    # 生成 dist/
vite preview  # 本地静态服务 dist/
```

默认输出（只监听本机，因此只有 Local 一行；加 `--host` 后才会多出 Network 一行）：

```bash
VITE vX.X.X  preview server running at:

  ➜  Local:   http://localhost:4173/
  ➜  press h + enter to show help
```

## 使用场景

### 1. 构建预览

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist'
  },
  preview: {
    port: 4173,
    open: true
  }
})
```

```bash
vite build && vite preview
```

### 2. 部署前局域网验证

```javascript
export default defineConfig({
  preview: {
    host: true,    // 手机等设备通过局域网 IP 访问
    port: 8080
  }
})
```

### 3. 代理后端接口

预览页面里的 API 请求同样需要代理。默认继承 `server.proxy`，需要指向不同后端时再覆盖：

```javascript
export default defineConfig({
  preview: {
    proxy: {
      '/api': {
        target: 'http://api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### 4. 安全响应头

模拟生产环境的响应头，尽早发现部署配置问题：

```javascript
export default defineConfig({
  preview: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer'
    }
  }
})
```

## 注意事项

### 1. 必须先构建

预览服务器只做静态文件服务，不会执行任何构建。`dist/` 不存在时 Vite 会报错提示先执行 `vite build`。

### 2. 不支持 HMR

预览的是已构建产物，改动源码后需要重新 `vite build` 并重启 `vite preview` 才能看到效果。

### 3. server 与 preview 的继承关系

两者端口独立（开发 `5173`、预览 `4173`），但 `host`、`allowedHosts`、`strictPort`、`https`、`open`、`proxy`、`cors` 默认都继承 `server` 的同名配置，可在 `preview` 中按需覆盖：

```javascript
export default defineConfig({
  server: {
    port: 5173,
    proxy: { '/api': 'http://dev-backend:3000' }
  },
  preview: {
    port: 4173
    // 未配置时同样使用上面的 proxy 规则
  }
})
```

### 4. 与 base 配合

设置了 `base` 时，预览页面要访问对应的子路径：

```javascript
export default defineConfig({
  base: '/app/',
  preview: {
    port: 4173
  }
})
```

访问地址为 `http://localhost:4173/app/`。

## 命令行用法

```bash
# 预览构建结果
vite preview

# 指定端口
vite preview --port 8080

# 监听所有地址（局域网可访问）
vite preview --host

# 自动打开浏览器
vite preview --open

# 端口被占用时直接退出
vite preview --strictPort

# 服务其他构建输出目录
vite preview --outDir dist-ssr

# 组合使用
vite preview --port 8080 --host --open
```

## 完整示例

### 生产预览配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist'
  },

  preview: {
    port: 4173,
    host: true,
    open: true,

    // 预览环境指向生产后端
    proxy: {
      '/api': {
        target: 'http://api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },

    // 安全响应头
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff'
    }
  }
})
```

### 本地 HTTPS 预览

```javascript
// vite.config.js
import fs from 'node:fs'
import { defineConfig } from 'vite'

export default defineConfig({
  preview: {
    https: {
      key: fs.readFileSync('./certs/key.pem'),
      cert: fs.readFileSync('./certs/cert.pem')
    }
  }
})
```

> ⚠️ **注意：** Vite 6 起 `https` 不再接受布尔值 `true`，必须显式提供 `key`/`cert`（可用 `@vitejs/plugin-basic-ssl` 自动生成自签名证书）。另注意监听 443 等特权端口需要相应权限。

### 多环境预览

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  return {
    preview: {
      port: mode === 'staging' ? 4174 : 4173,
      open: true
    }
  }
})
```

```bash
# 使用 staging 模式构建并预览
vite build --mode staging
vite preview --mode staging
```

## 常见问题

### 问题 1：预览服务器报错或 404

**原因**：未先构建、`build.outDir` 不是默认的 `dist`，或访问路径与 `base` 不匹配

```bash
# 先构建再预览；outDir 非默认时用 --outDir 指定
vite build && vite preview --outDir dist-ssr
```

### 问题 2：API 请求失败

**原因**：预览服务器没有命中代理规则（未配置 `proxy` 且 `server.proxy` 也为空，或路径前缀对不上）

```javascript
// 显式配置预览代理
export default defineConfig({
  preview: {
    proxy: {
      '/api': 'http://backend:3000'
    }
  }
})
```

### 问题 3：端口被占用

**原因**：默认端口 `4173` 已被占用，Vite 自动换到了下一个端口；如需固定端口则报错退出

```bash
# 显式换端口，或强制占用即退出
vite preview --port 8080
vite preview --strictPort
```
