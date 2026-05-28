# preview 配置

## 定义

`preview` 配置预览服务器（用于预览生产构建）的行为。

**类型**：

```typescript
{
  host?: string | boolean
  port?: number
  strictPort?: boolean
  open?: boolean | string
  proxy?: Record<string, string | ProxyOptions>
  cors?: boolean | CorsOptions
  headers?: Record<string, string>
}
```

## 子属性详解

### host

**类型**：`string | boolean`

**默认值**：`'localhost'`

指定预览服务器监听的地址。

```javascript
host: 'localhost'
host: true         // 监听所有地址
host: '0.0.0.0'
```

### port

**类型**：`number`

**默认值**：`4173`

指定预览服务器端口。

```javascript
port: 8080
port: 0            // 自动选择可用端口
```

### strictPort

**类型**：`boolean`

**默认值**：`false`

端口被占用时是否退出。

```javascript
strictPort: true   // 端口占用则退出
```

### open

**类型**：`boolean | string`

**默认值**：`false`

启动时自动打开浏览器。

```javascript
open: true
open: '/dist'
```

### proxy

**类型**：`Record<string, string | ProxyOptions>`

**默认值**：`{}`

API 代理配置（与 server.proxy 相同）。

```javascript
proxy: {
  '/api': {
    target: 'http://backend:3000',
    changeOrigin: true
  }
}
```

### cors

**类型**：`boolean | CorsOptions`

**默认值**：`false`

配置 CORS。

```javascript
cors: true
cors: {
  origin: 'http://example.com'
}
```

### headers

**类型**：`Record<string, string>`

**默认值**：`{}`

响应头配置。

```javascript
headers: {
  'X-Custom-Header': 'value'
}
```

## 可选值与使用方式

### 默认配置

```javascript
// vite.config.js
export default {
  preview: {
    host: 'localhost',
    port: 4173,
    strictPort: false,
    open: false,
    proxy: {},
    cors: false,
    headers: {}
  }
}
```

### 基本预览配置

```javascript
export default {
  preview: {
    port: 8080,
    host: true,
    open: true
  }
}
```

### 带代理的预览

```javascript
export default {
  preview: {
    port: 4173,
    proxy: {
      '/api': {
        target: 'http://api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
}
```

### CORS 配置

```javascript
export default {
  preview: {
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }
}
```

## 生效后的结果示例

### 默认启动

```bash
# 构建后
vite build

# 预览
vite preview
```

```bash
VITE v5.0.0  preview server running at:

  > Local:    http://localhost:4173/
  > Network:  http://192.168.1.100:4173/

  press h + enter to show help
```

### 自定义端口

```javascript
// vite.config.js
export default {
  preview: {
    port: 9000
  }
}
```

```bash
  > Local:    http://localhost:9000/
```

### 自动打开浏览器

```javascript
export default {
  preview: {
    port: 4173,
    host: true,
    open: true
  }
}
```

## 使用场景

### 1. 构建预览

```javascript
// vite.config.js
export default {
  build: {
    outDir: 'dist'
  },
  preview: {
    port: 4173,
    open: true
  }
}
```

```bash
vite build && vite preview
```

### 2. 部署前验证

```javascript
export default {
  preview: {
    host: true,
    port: 8080,
    proxy: {
      '/api': 'http://api.example.com'
    }
  }
}
```

### 3. CORS 配置

```javascript
export default {
  preview: {
    cors: {
      origin: ['http://localhost:3000', 'https://example.com']
    }
  }
}
```

### 4. 安全响应头

```javascript
export default {
  preview: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block'
    }
  }
}
```

## 注意事项

### 1. 需要先构建

```bash
# ❌ 错误：没有构建直接预览
vite preview

# ✅ 正确：先构建再预览
vite build
vite preview
```

### 2. 不支持 HMR

预览服务器不支持热更新，需要重新构建。

### 3. server 和 preview 配置独立

```javascript
export default {
  server: {
    port: 5173,     // 开发服务器
    proxy: { ... }
  },
  preview: {
    port: 4173,     // 预览服务器
    proxy: { ... }    // 需要单独配置
  }
}
```

### 4. 与 base 配合

```javascript
export default {
  base: '/app/',
  preview: {
    port: 4173
  }
}
```

访问：`http://localhost:4173/app/`

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `build.outDir` | preview 服务的是 `outDir` 目录 |
| `base` | 影响 preview 的基础路径 |
| `server` | server 和 preview 配置相似但独立 |

## 命令行用法

```bash
# 预览构建结果
vite preview

# 指定端口
vite preview --port 8080

# 指定主机
vite preview --host

# 自动打开浏览器
vite preview --open

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

    // 预览时也需要代理
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
import fs from 'fs'

export default {
  preview: {
    port: 443,
    https: {
      key: fs.readFileSync('./certs/key.pem'),
      cert: fs.readFileSync('./certs/cert.pem')
    }
  }
}
```

### 多环境预览

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  return {
    preview: {
      port: mode === 'staging' ? 4174 : 4173,
      open: mode === 'development'
    }
  }
})
```

## 工作流程

```bash
1. vite build       → 生成 dist/ 目录
2. vite preview     → 启动服务器提供 dist/ 内容
3. 访问 localhost:4173 → 预览生产构建
```

## 常见问题

### 问题 1：预览服务器 404

**原因**：未先构建或输出目录错误

```bash
# ✅ 解决
vite build && vite preview
```

### 问题 2：API 请求失败

**原因**：预览服务器缺少代理配置

```javascript
// ✅ 解决：配置代理
export default {
  preview: {
    proxy: {
      '/api': 'http://backend:3000'
    }
  }
}
```

### 问题 3：端口被占用

**原因**：默认端口 4173 被占用

```bash
# ✅ 解决：使用其他端口
vite preview --port 8080
```

## 官方文档

[Server Options: preview - Vite 官方文档](https://cn.vitejs.dev/config/server-options.html#preview-server-options)

[Preview Mode - Vite 官方文档](https://cn.vitejs.dev/guide/build.html#previewing-locally)
