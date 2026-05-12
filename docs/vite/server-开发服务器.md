# server 配置

## 定义

`server` 配置开发服务器的行为。

## 属性层级结构

```
server
├── host
├── port
├── strictPort
├── https
│   ├── key
│   ├── cert
│   ├── ca
│   ├── pfx
│   └── passphrase
├── open
├── proxy
│   └── {pattern}
│       ├── target
│       ├── changeOrigin
│       ├── rewrite
│       ├── configure
│       ├── ws
│       ├── xfwd
│       ├── secure
│       ├── headers
│       ├── timeout
│       └── onError
├── cors
│   ├── origin
│   ├── methods
│   ├── allowedHeaders
│   ├── credentials
│   └── maxAge
├── headers
├── hmr
│   ├── protocol
│   ├── host
│   ├── port
│   ├── clientPort
│   ├── path
│   └── overlay
│       ├── errors
│       └── warnings
├── watch
│   ├── ignored
│   ├── usePolling
│   └── interval
├── fs
│   ├── strict
│   ├── allow
│   ├── deny
│   └── cwd
└── origin
```

## 用法

```javascript
// vite.config.js
export default {
  server: {
    host: true,
    port: 3000,
    strictPort: false,
    https: false,
    open: true,
    proxy: {},
    cors: true,
    headers: {},
    hmr: {},
    watch: {},
    fs: {},
    origin: ''
  }
}
```

## 子属性详解

### host

**类型**：`string | boolean`

**默认值**：`'localhost'`

指定服务器监听的地址。

| 值 | 说明 |
|----|------|
| `'localhost'` | 仅 localhost 可访问 |
| `true` / `'0.0.0.0'` | 监听所有地址，包括局域网 |
| `'::1'` | IPv6 localhost |
| 具体 IP | 绑定到指定 IP |

```javascript
// 字符串形式
host: 'localhost'  // 仅本机访问
host: '0.0.0.0'    // 所有网络接口
host: '192.168.1.100' // 指定 IP

// 布尔形式
host: true         // 等同于 '0.0.0.0'
host: false        // 等同于 'localhost'
```

### port

**类型**：`number`

**默认值**：`5173`

指定服务器端口。

```javascript
// 指定端口
port: 3000
port: 8080
port: 5173  // 默认端口

// 自动选择可用端口
port: 0     // 让系统自动分配可用端口
```

### strictPort

**类型**：`boolean`

**默认值**：`false`

端口被占用时是否退出。

```javascript
strictPort: false  // 端口占用时尝试下一个可用端口（默认）
strictPort: true   // 端口占用时直接退出，报错
```

### https

**类型**：`boolean | HTTPSOptions`

**默认值**：`false`

启用 HTTPS。

```javascript
// 布尔形式 - 使用自签名证书
https: true

// 对象形式 - 自定义证书
https: {
  key: fs.readFileSync('path/to/key.pem'),
  cert: fs.readFileSync('path/to/cert.pem')
}

// 完整选项
https: {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  ca: fs.readFileSync('ca.pem'),         // CA 证书
  pfx: fs.readFileSync('cert.pfx'),      // PFX 文件
  passphrase: 'secret',                  // 证书密码
  // 或使用 passphrase 函数
  passphrase: () => 'secret'
}
```

### open

**类型**：`boolean | string | string[]`

**默认值**：`false`

启动时自动打开浏览器。

```javascript
// 布尔形式
open: true   // 打开默认浏览器
open: false  // 不打开

// 字符串形式 - 指定路径
open: '/docs'
open: '#/about'
open: 'index.html'

// 字符串形式 - 指定浏览器
open: 'google-chrome'
open: 'firefox'
open: 'microsoft-edge'

// 数组形式 - 打开多个页面
open: ['index.html', '/docs']
open: ['/dashboard', '/settings']
open: ['google-chrome', '/index.html']

// 对象形式（高级）
open: {
  app: {
    name: 'google-chrome',
    arguments: ['--incognito']  // 传递参数
  }
}
```

### proxy

**类型**：`Record<string, string | ProxyOptions>`

API 代理配置，使用 `http-proxy` 中间件。

```javascript
// 字符串形式 - 简单代理
proxy: {
  '/api': 'http://localhost:8080'
}

// 对象形式 - 完整配置
proxy: {
  '/api': {
    target: 'http://localhost:8080',    // 目标服务器
    changeOrigin: true,                  // 改变请求头 origin
    rewrite: (path) => path.replace(/^\/api/, ''), // 路径重写
    configure: (proxy, options) => {     // 代理配置回调
      // proxy 是 'http-proxy' 实例
    }
  }
}

// WebSocket 代理
proxy: {
  '/socket.io': {
    target: 'ws://localhost:8080',
    ws: true                             // 启用 WebSocket 代理
  }
}

// 多个代理
proxy: {
  '/api': {
    target: 'http://api.example.com',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  },
  '/auth': {
    target: 'http://auth.example.com',
    changeOrigin: true
  },
  '/ws': {
    target: 'ws://localhost:3000',
    ws: true
  }
}

// 完整选项
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    rewrite: (path) => path,

    // http-proxy 选项
    ws: false,                    // WebSocket 代理
    xfwd: true,                   // 添加 x-forwarded 头
    secure: false,                // 不验证 SSL 证书
    prependPath: true,            // 预添加路径
    ignorePath: false,            // 忽略请求路径
    followRedirects: false,       // 跟随重定向

    // 头部修改
    headers: {
      'X-Custom-Header': 'value'
    },

    // 超时配置
    timeout: 5000,                // 毫秒
    proxyTimeout: 5000,

    // 配置回调
    configure: (proxy, options) => {
      proxy.on('proxyReq', (proxyReq, req, res) => {
        console.log('Proxying:', req.url)
      })
    },

    // 错误处理
    onError: (err, req, res) => {
      res.writeHead(500, { 'Content-Type': 'text/plain' })
      res.end('Proxy error')
    }
  }
}
```

### cors

**类型**：`boolean | CorsOptions`

**默认值**：`true`

配置 CORS（跨域资源共享）。

```javascript
// 启用（默认）
cors: true

// 禁用
cors: false

// 对象形式 - 详细配置
cors: {
  origin: '*',                                // 允许的源
  origin: 'http://example.com',               // 单个源
  origin: ['http://example.com', 'https://app.com'], // 多个源
  origin: (origin) => /example\.com$/.test(origin), // 函数判断

  methods: ['GET', 'POST', 'PUT', 'DELETE'], // 允许的方法
  allowedHeaders: ['Content-Type', 'Authorization'], // 允许的请求头
  exposedHeaders: ['Content-Range'],          // 暴露的响应头
  credentials: true,                          // 允许携带凭证
  maxAge: 86400,                              // 预检请求缓存时间（秒）

  // 预检请求处理
  preflightContinue: false,
  optionsSuccessStatus: 204
}
```

### headers

**类型**：`OutgoingHttpHeaders`

响应头配置。

```javascript
// 对象形式
headers: {
  'X-Custom-Header': 'value',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp'
}

// 安全相关头部
headers: {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'no-referrer'
}

// 使用函数动态设置
headers: (headers) => {
  return {
    ...headers,
    'X-Build-Time': new Date().toISOString()
  }
}
```

### hmr

**类型**：`boolean | HmrOptions`

**默认值**：`true`

热模块替换配置。

```javascript
// 启用/禁用
hmr: true
hmr: false

// 对象形式
hmr: {
  // WebSocket 协议
  protocol: 'ws',     // 或 'wss'（用于 HTTPS）

  // WebSocket 主机
  host: 'localhost',  // 或具体 IP
  host: null,         // 自动检测

  // WebSocket 端口
  port: 24678,        // HMR WebSocket 端口

  // 客户端端口
  clientPort: 24678,  // 客户端连接的端口

  // WebSocket 路径
  path: '/vite/hmr',  // 默认基于 base

  // 覆盖层配置
  overlay: true,
  overlay: {
    errors: true,     // 显示错误
    warnings: false,  // 显示警告
    // 或使用函数
    runtimeErrors: (error) => {
      if (error.message.includes('ignore')) return false
      return true
    }
  },

  // HMR 上下文（高级）
  // (context) => void
}
```

### watch

**类型**：`{ ignored?: string | RegExp | (string | RegExp)[]; usePolling?: boolean; interval?: number }`

文件监听配置。

```javascript
// 基本配置
watch: {
  // 忽略的文件/目录
  ignored: ['**/node_modules/**', '**/.git/**'],

  // 或使用正则
  ignored: [/node_modules/, /\.git/],

  // 或使用函数
  ignored: (path) => path.includes('node_modules'),

  // 使用轮询（Docker、WSL 等环境）
  usePolling: false,
  usePolling: true,

  // 轮询间隔（毫秒）
  interval: 100
}

// Docker 环境配置
watch: {
  usePolling: true,
  interval: 1000,
  ignored: /node_modules/
}
```

### fs

**类型**：`{ strict?: boolean; allow?: string[]; deny?: string[]; cwd?: string }`

文件系统访问控制。

```javascript
// 基本配置
fs: {
  // 严格模式 - 限制在项目根目录内
  strict: true,
  strict: false,  // 允许访问任意文件

  // 允许访问的目录
  allow: ['..'],               // 允许访问父目录
  allow: ['/path/to/dir'],     // 允许特定目录
  allow: ['src', 'public'],    // 多个目录

  // 禁止访问的文件/目录
  deny: ['.env', '.env.*'],    // 禁止特定文件
  deny: ['**/secret/**'],      // 禁止特定目录

  // 工作目录
  cwd: process.cwd()           // 默认为项目根目录
}

// 安全配置示例
fs: {
  strict: true,
  allow: ['.'],
  deny: [
    '.env',
    '.env.*',
    '**/config/secrets/**',
    '**/*.key',
    '**/*.pem'
  ]
}
```

### origin

**类型**：`string`

用于 HMR 的源地址（跨域场景）。

```javascript
origin: 'http://example.com'
origin: 'https://app.example.com'

// 使用环境变量
origin: process.env.VITE_DEV_ORIGIN
```

## 作用

- 配置开发环境服务器行为
- 支持 API 代理解决跨域
- 提供 HMR 热更新功能
- 控制文件访问权限

## 使用场景

1. **API 代理**：解决跨域问题
2. **局域网访问**：移动端调试
3. **HTTPS 开发**：测试需要 HTTPS 的功能
4. **自定义端口**：避免端口冲突

## 注意事项

- 修改 `server` 配置需要重启开发服务器
- `proxy` 配置使用 `http-proxy` 中间件，选项与 `http-proxy` 一致
- `fs.strict` 开启后，只能访问项目根目录下的文件
- `https` 选项需要提供有效的证书文件

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `base` | `base` 路径影响代理和路由 |
| `preview` | 部分配置（如 proxy）不适用于 preview |
| `hmr.base` | HMR WebSocket 路径受 `base` 影响 |

## 示例

```javascript
// 完整的开发服务器配置
export default {
  server: {
    // 网络配置
    host: true,
    port: 3000,
    strictPort: false,
    open: true,

    // HTTPS
    https: {
      key: fs.readFileSync('./certs/key.pem'),
      cert: fs.readFileSync('./certs/cert.pem')
    },

    // API 代理
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err)
          })
        }
      },
      '/socket.io': {
        target: 'ws://localhost:8080',
        ws: true
      }
    },

    // CORS
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:8080'],
      credentials: true
    },

    // 自定义响应头
    headers: {
      'Access-Control-Allow-Origin': '*'
    },

    // HMR
    hmr: {
      overlay: {
        errors: true,
        warnings: false
      }
    },

    // 文件监听
    watch: {
      usePolling: process.env.USE_POLLING === 'true'
    },

    // 文件系统
    fs: {
      strict: true,
      deny: ['.env', '.env.*']
    }
  }
}

// 局域网调试配置
export default {
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: false  // 不自动打开，手动在设备上访问
  }
}

// Docker 环境配置
export default {
  server: {
    host: '0.0.0.0',
    watch: {
      usePolling: true,
      interval: 1000
    }
  }
}
```
