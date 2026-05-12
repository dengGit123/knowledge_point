# preview 配置

## 定义

`preview` 配置预览服务器（用于预览生产构建）的行为。

## 属性层级结构

```
preview
├── host
├── port
├── strictPort
├── https
│   ├── key
│   ├── cert
│   └── passphrase
├── open
├── proxy
│   └── {pattern}
│       ├── target
│       ├── changeOrigin
│       └── rewrite
├── cors
│   └── origin
└── headers
```

## 用法

```javascript
// vite.config.js
export default {
  preview: {
    host: true,
    port: 4173,
    strictPort: false,
    https: false,
    open: true,
    proxy: {},
    cors: true,
    headers: {}
  }
}
```

## 子属性详解

### host

指定预览服务器监听的地址。

```javascript
host: 'localhost'
host: true         // 监听所有地址
```

### port

指定预览服务器端口，默认 `4173`。

```javascript
port: 8080
port: 0            // 自动选择可用端口
```

### strictPort

端口被占用时是否退出。

```javascript
strictPort: true   // 端口占用则退出
```

### https

启用 HTTPS。

```javascript
https: true
https: {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
}
```

### open

启动时自动打开浏览器。

```javascript
open: true
open: '/dist'
```

### proxy

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

配置 CORS。

```javascript
cors: true
cors: {
  origin: 'http://example.com'
}
```

### headers

响应头配置。

```javascript
headers: {
  'X-Custom-Header': 'value'
}
```

## 作用

- 提供生产构建的本地预览
- 模拟生产环境的服务器配置
- 支持静态文件服务

## 使用场景

1. **构建预览**：本地测试生产构建结果
2. **部署前验证**：确认打包后的应用正常运行
3. **API 代理**：预览时也需要代理 API

## 注意事项

- `preview` 配置不会影响 `build` 输出
- 需要先运行 `vite build` 才能使用 `vite preview`
- `preview` 不支持 HMR
- `server` 和 `preview` 的配置大部分相同但不完全一致

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
```

## 示例

```javascript
export default {
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

    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff'
    }
  }
}
```

## 工作流程

```
1. vite build       → 生成 dist/ 目录
2. vite preview     → 启动服务器提供 dist/ 内容
3. 访问 localhost:4173 → 预览生产构建
```
