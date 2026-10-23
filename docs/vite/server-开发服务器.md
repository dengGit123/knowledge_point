# server 配置

> 📖 [官方文档：Server Options](https://cn.vitejs.dev/config/server-options.html)

## 定义

`server` 配置开发服务器（`vite dev`）的行为，控制监听地址、端口、HTTPS、代理、CORS、HMR、文件系统访问等开发环境相关功能。除非特别说明，本节选项只作用于开发阶段。

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
  hmr?: boolean | { overlay?: boolean }
  ws?: false | {
    protocol?: string
    host?: string
    port?: number
    path?: string
    timeout?: number
    clientPort?: number
    server?: Server
  }
  watch?: object | null
  warmup?: { clientFiles?: string[], ssrFiles?: string[] }
  middlewareMode?: boolean | { server: http.Server }
  fs?: { strict?: boolean, allow?: string[], deny?: string[] }
  origin?: string
  sourcemapIgnoreList?: false | ((sourcePath: string, sourcemapPath: string) => boolean)
}
```

**默认值**（仅列官方文档给出的默认值，其余选项未配置时按各小节说明的内置行为工作）：

```javascript
{
  host: 'localhost',
  allowedHosts: [],   // localhost、*.localhost 与所有 IP 默认放行
  port: 5173,
  // Vite 6.2 起默认只允许本机源（localhost / 127.0.0.1 / ::1），不再默认允许任何源
  cors: { origin: /^https?:\/\/(?:(?:[^:]+\.)?localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/ },
  fs: {
    strict: true,     // Vite 2.7 起默认开启
    deny: ['.env', '.env.*', '*.{crt,pem,key,p12,pfx,cer,der}', '.npmrc', '.yarnrc.yml', '**/.git/**']
  },
  // 默认把 node_modules 下的源码加入 sourcemap 忽略清单
  sourcemapIgnoreList: (sourcePath) => /(?:^|[\\/])node_modules(?:[\\/]|$)/.test(sourcePath)
}
```

## 属性层级结构

```
server
├── host
├── allowedHosts
├── port
├── strictPort
├── https
├── open
├── proxy
│   └── {pattern}
│       ├── target
│       ├── changeOrigin
│       ├── rewrite
│       ├── rewriteWsOrigin
│       ├── ws
│       ├── secure
│       ├── headers
│       └── configure
├── cors
├── headers
├── hmr
│   └── overlay
├── ws
│   ├── protocol
│   ├── host
│   ├── port
│   ├── path
│   ├── clientPort
│   ├── timeout
│   └── server
├── warmup
│   ├── clientFiles
│   └── ssrFiles
├── watch
├── middlewareMode
├── fs
│   ├── strict
│   ├── allow
│   └── deny
├── origin
└── sourcemapIgnoreList
```

## 用法

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,          // 监听所有地址，局域网内设备可访问
    port: 3000,
    open: true,
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
```

## 子属性详解

### host

**类型**：`string | boolean`

**默认值**：`'localhost'`

指定服务器监听的 IP 地址。

| 值 | 说明 |
|----|------|
| `'localhost'` | 默认值，仅本机可访问 |
| `true` / `'0.0.0.0'` | 监听所有地址，包括局域网和公网地址 |
| `'127.0.0.1'` | 仅 IPv4 回环地址 |
| 具体 IP | 绑定到指定网卡 |

```javascript
host: 'localhost'      // 默认，仅本机访问
host: true             // 等同于 '0.0.0.0'，局域网可访问
host: '192.168.1.100'  // 绑定到指定 IP
```

命令行等价写法：`--host 0.0.0.0` 或 `--host`。

> 💡 **提示：** 使用 `localhost` 或通配地址（如 `0.0.0.0`）时，其他服务可能抢先响应导致浏览器访问的不是 Vite（Vite 检测到解析地址不一致时会在终端打印实际地址）。WSL2 下从局域网访问还需额外的端口转发配置。

### allowedHosts

**类型**：`string[] | true`

**默认值**：`[]`

允许 Vite 响应的主机名列表。`localhost`、`.localhost` 子域和所有 IP 地址默认放行；使用 HTTPS 时跳过该检查。

```javascript
allowedHosts: ['dev.example.com']  // 只响应 dev.example.com
allowedHosts: ['.example.com']     // 响应 example.com 及其所有子域
```

> ⚠️ **注意：** 设为 `true` 表示响应任意主机名，会使任意网站可通过 DNS rebinding 攻击下载你的源码与内容，官方强烈建议始终使用显式列表。

### port

**类型**：`number`

**默认值**：`5173`

指定服务器端口。端口被占用时 Vite 会自动尝试下一个可用端口，因此实际监听端口可能不是配置值（除非配合 `strictPort`）。

```javascript
port: 3000  // 指定端口
```

### strictPort

**类型**：`boolean`

**默认值**：`false`

```javascript
strictPort: false  // 默认：端口占用时自动尝试下一个可用端口
strictPort: true   // 端口占用时直接退出并报错，而不是换端口
```

### https

**类型**：`https.ServerOptions`

启用 TLS + HTTP/2。值为传给 Node.js `https.createServer()` 的选项对象，需要提供有效证书。

```javascript
// vite.config.js
import fs from 'node:fs'

export default {
  server: {
    https: {
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem')
    }
  }
}
```

> 💡 **提示：** 基础场景可在插件中加入 `@vitejs/plugin-basic-ssl`，它会自动创建并缓存自签名证书（官方更推荐自建证书）。布尔写法 `https: true` 自 Vite 6 起不再支持。

### open

**类型**：`boolean | string`

**默认值**：`false`

服务器启动时自动在浏览器中打开应用。字符串值会作为 URL 的 pathname 使用。

```javascript
open: true                  // 打开默认浏览器
open: '/docs/index.html'    // 打开指定路径
```

想用指定浏览器打开时，通过环境变量 `process.env.BROWSER`（如 `firefox`）设置，并可用 `process.env.BROWSER_ARGS` 传附加参数（如 `--incognito`）；两者也可以写在 `.env` 文件里。

### proxy

**类型**：`Record<string, string | ProxyOptions>`

为开发服务器配置自定义代理规则：请求路径以某个 key 开头时，请求会被代理到对应 target。key 以 `^` 开头时按 `RegExp` 解析。命中代理规则的请求不会再被 Vite 转换。使用非相对的 `base` 时，每个 key 都要加上该 base 前缀。

内部基于 `http-proxy-3`（旧版本为 `http-proxy`），选项与其一致。

```javascript
export default {
  server: {
    proxy: {
      // 字符串简写：
      // http://localhost:5173/foo -> http://localhost:4567/foo
      '/foo': 'http://localhost:4567',

      // 对象配置 + 路径重写：
      // http://localhost:5173/api/bar -> http://jsonplaceholder.typicode.com/bar
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,                             // 覆盖请求头中的 host/origin 为 target
        rewrite: (path) => path.replace(/^\/api/, '')   // 转发前重写路径
      },

      // 正则匹配：
      // http://localhost:5173/fallback/xxx -> http://jsonplaceholder.typicode.com/xxx
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, '')
      },

      // WebSocket 代理（如 socket.io）：
      // ws://localhost:5173/socket.io -> ws://localhost:5174/socket.io
      '/socket.io': {
        target: 'ws://localhost:5174',
        ws: true,
        rewriteWsOrigin: true  // 重写 origin 为 target，注意可能放开来源校验
      }
    }
  }
}
```

常用 `ProxyOptions`（均可省略）：

| 选项 | 说明 |
|------|------|
| `target` | 代理目标地址，如 `http://localhost:8080` |
| `changeOrigin` | 将请求头的 host/origin 改写为 target |
| `rewrite` | `(path) => string`，转发前重写请求路径 |
| `ws` | 是否代理 WebSocket |
| `rewriteWsOrigin` | 重写 WebSocket 握手的 origin 头 |
| `secure` | 是否校验目标的 SSL 证书 |
| `headers` | 追加到代理请求的响应头 |
| `configure` | `(proxy, options) => void`，拿到代理实例以监听事件或添加自定义逻辑 |

```javascript
// 通过 configure 监听代理实例事件
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    configure: (proxy, options) => {
      proxy.on('error', (err, req, res) => {
        console.log('proxy error', err)
      })
    }
  }
}
```

> ⚠️ **注意：** Vite 在代理前不会校验 WebSocket 请求的 origin，代理目标应自行校验 `Origin` 头；`rewriteWsOrigin` 会把 origin 重写为目标地址并绕过来源检查，慎用。

### cors

**类型**：`boolean | CorsOptions`

**默认值**：`{ origin: /^https?:\/\/(?:(?:[^:]+\.)?localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/ }`（仅允许 `localhost`、`127.0.0.1`、`::1`）

配置开发服务器的 CORS（跨域资源共享）。传入 `cors` 中间件的选项对象可细粒度控制。

```javascript
cors: true    // 允许任何源（见下方安全提示）
cors: false   // 关闭 dev 服务器的 CORS 处理

// 对象形式：细粒度配置
cors: {
  origin: ['http://localhost:5173', 'https://app.example.com'], // 允许的源
  methods: ['GET', 'POST', 'PUT', 'DELETE'],                    // 允许的方法
  allowedHeaders: ['Content-Type', 'Authorization'],            // 允许的请求头
  credentials: true,                                            // 允许携带凭证
  maxAge: 86400                                                 // 预检结果缓存时间（秒）
}

// origin 也可以是函数，返回是否放行该源
cors: {
  origin: (origin) => /example\.com$/.test(origin)
}
```

> ⚠️ **注意：** `cors: true` 会允许任何网站向开发服务器发请求并下载源码与内容，官方建议始终使用显式的源列表。

### headers

**类型**：`OutgoingHttpHeaders`

指定服务器响应头。

```javascript
headers: {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'X-Content-Type-Options': 'nosniff'
}
```

### hmr

**类型**：`boolean | { overlay?: boolean }`

配置或禁用 HMR（热模块替换），默认启用。

```javascript
hmr: true                // 默认：启用 HMR
hmr: false               // 禁用 HMR，不再建立 HMR WebSocket 连接
hmr: { overlay: false }  // 关闭服务器报错遮罩层（错误仍会输出到浏览器控制台）
```

> ⚠️ **注意：** 旧版本 `hmr` 上的 WebSocket 相关选项（`protocol`、`host`、`port`、`path`、`clientPort`、`timeout` 等）已废弃，统一由下方 `server.ws` 接管；旧配置会被自动同步，仍然生效。

### ws

**类型**：`false | { protocol?, host?, port?, path?, timeout?, clientPort?, server? }`

配置 HMR WebSocket 连接选项。设为 `false` 时彻底关闭 WebSocket 连接。

```javascript
export default {
  server: {
    ws: {
      protocol: 'wss',    // 'ws' 或 'wss'（HTTPS 场景用 'wss'）
      host: 'localhost',  // WebSocket 服务器主机
      port: 3001,         // WebSocket 服务器端口
      path: '/hmr',       // WebSocket 路径
      clientPort: 443,    // 客户端侧使用的端口（与服务端口不同时指定）
      timeout: 30000      // 连接超时（毫秒），默认 30000
    }
  }
}
```

默认配置下，位于 Vite 前面的反向代理需要支持代理 WebSocket；否则 HMR 客户端会绕过反向代理直连 Vite（浏览器会出现可忽略的连接报错）。要避免该报错，可以：让反向代理转发 WebSocket；或设置 `strictPort: true` 并把 `ws.clientPort` 配成与 `server.port` 相同；或给 `ws.port` 配一个不同于 `server.port` 的值。

### warmup

**类型**：`{ clientFiles?: string[], ssrFiles?: string[] }`

预热文件：提前转换并缓存结果，改善冷启动后的首屏加载，避免转换瀑布。`clientFiles` 是仅客户端使用的文件，`ssrFiles` 是仅 SSR 使用的文件，接受相对 `root` 的路径数组或 `tinyglobby` 模式。

```javascript
warmup: {
  clientFiles: ['./src/components/*.vue', './src/utils/big-utils.js'],
  ssrFiles: ['./src/server/modules/*.js']
}
```

> 💡 **提示：** 只把高频使用的文件加入预热，避免拖慢开发服务器启动。

### watch

**类型**：`object | null`

文件系统监听选项，透传给 `chokidar`。

默认监听项目 `root`，并自动跳过 `.git/`、`node_modules/`、`test-results/`、Vite 的 `cacheDir` 与 `build.outDir` 目录。设为 `null` 时不监听任何文件。

```javascript
// Docker、WSL2 等文件事件不可靠的环境可改用轮询（CPU 占用较高）
watch: {
  usePolling: true,
  interval: 1000,          // 轮询间隔（毫秒），chokidar 选项
  ignored: '**/test/**'    // 追加忽略的文件/目录，支持 glob、正则
}
```

> ⚠️ **注意：** 目前无法监听 `node_modules` 内的文件与包。WSL2 下由 Windows 应用编辑文件时监听会失效，推荐用 WSL2 内的编辑器，或设置 `usePolling: true`。

### middlewareMode

**类型**：`boolean | { server: http.Server }`

**默认值**：`false`

以中间件模式创建 Vite 服务器，常用于把 Vite 接入自建的 HTTP 服务器（如 Express）。若代理了 WebSocket，需通过 `{ server }` 提供要绑定的 HTTP 服务器。

```javascript
import express from 'express'
import { createServer as createViteServer } from 'vite'

async function createServer() {
  const app = express()

  // 以中间件模式创建 Vite 服务器
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom' // 不使用 Vite 默认的 HTML 处理中间件
  })
  // 把 Vite 的 connect 实例作为中间件挂载
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // appType 为 'custom' 时需自行返回响应
  })
}

createServer()
```

### fs

文件系统访问控制，限制开发服务器能通过 HTTP 服务哪些文件。

#### fs.strict

**类型**：`boolean`

**默认值**：`true`（Vite 2.7 起默认开启）

限制服务 workspace root 之外的文件，`false` 时解除该限制。

#### fs.allow

**类型**：`string[]`

限制可通过 `/@fs/` 访问的文件。`fs.strict` 开启时，访问列表之外且未被允许文件引用的文件会返回 403。目录和文件都可以。

Vite 会自动向上搜索 workspace root 作为默认允许范围，满足以下条件的目录视为 workspace，否则回退到项目 root：

- `package.json` 含 `workspaces` 字段
- 存在 `lerna.json` 或 `pnpm-workspace.yaml`

一旦手动配置 `fs.allow`，自动探测即关闭，可用工具函数补回：

```javascript
import { defineConfig, searchForWorkspaceRoot } from 'vite'

export default defineConfig({
  server: {
    fs: {
      // 允许服务上一级目录
      allow: ['..'],

      // 或：自动搜索 workspace root，再追加自定义目录
      // allow: [
      //   searchForWorkspaceRoot(process.cwd()),
      //   '/path/to/custom/allow_directory'
      // ]
    }
  }
})
```

#### fs.deny

**类型**：`string[]`

**默认值**：`['.env', '.env.*', '*.{crt,pem,key,p12,pfx,cer,der}', '.npmrc', '.yarnrc.yml', '**/.git/**']`

敏感文件黑名单，优先级高于 `fs.allow`，支持 picomatch 模式。

```javascript
fs: {
  strict: true,
  deny: ['.env', '.env.*', '**/*.key', '**/config/secrets/**']
}
```

> ⚠️ **注意：** 黑名单不作用于 `public` 目录——其中的文件构建时直接复制到输出目录，会被原样服务，敏感文件不要放在 public 下。

### origin

**类型**：`string`

定义开发时生成的资源 URL 的 origin。

```javascript
export default {
  server: {
    // 资源 URL 以该 origin 开头，适用于页面访问地址与 dev 服务器地址不一致的场景
    origin: 'http://127.0.0.1:8080'
  }
}
```

### sourcemapIgnoreList

**类型**：`false | (sourcePath: string, sourcemapPath: string) => boolean`

**默认值**：`(sourcePath) => /(?:^|[\\/])node_modules(?:[\\/]|$)/.test(sourcePath)`

是否在服务器 sourcemap 中忽略指定源文件，结果用于填充 `x_google_ignoreList` 扩展（调试器据此决定是否单步跟进这些文件）。

```javascript
export default {
  server: {
    // 默认值：把路径中包含 node_modules 的源文件加入忽略清单
    sourcemapIgnoreList(sourcePath, sourcemapPath) {
      return /(?:^|[\\/])node_modules(?:[\\/]|$)/.test(sourcePath)
    }
  }
}
```

传 `false` 可关闭忽略行为；它需要与构建侧的 sourcemap 忽略配置分别设置，不会从构建选项继承默认值。

## 作用

- 提供开发期 HTTP(S) 服务与 HMR 热更新
- 通过 `proxy` 代理解决开发期接口跨域
- 控制可访问的主机、端口、文件范围与响应头

## 使用场景

1. **API 代理**：开发时把 `/api` 转发到后端服务，规避跨域
2. **局域网访问**：`host: true` 让手机等设备访问开发页面调试
3. **HTTPS 开发**：测试仅能在 HTTPS 下工作的能力（如某些 Web API）
4. **自定义端口 / 端口占用策略**：配合 `port` 与 `strictPort`

## 注意事项

- `vite.config.js` 变更时 Vite 会自动重启开发服务器，多数配置改动无需手动重启
- `proxy` 基于 `http-proxy-3`，选项与其一致；命中代理的请求不再经过 Vite 转换
- `fs.deny` 优先级高于 `fs.allow`，且不作用于 `public` 目录
- `cors` 默认仅允许本机源；`allowedHosts: true` 与 `cors: true` 都会扩大攻击面，按需放行

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `base` | 使用非相对 `base` 时，`proxy` 的每个 key 都要加上该 base 前缀 |
| `preview` | `preview` 的 `host`、`port`、`proxy`、`cors`、`open` 等默认继承 `server` 同名配置，端口相互独立（5173 与 4173） |
| `hmr` / `ws` | `hmr` 的 WebSocket 选项已废弃，由 `server.ws` 统一配置 |
| `build.outDir`、`cacheDir` | `watch` 默认跳过这些目录 |

## 示例

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import fs from 'node:fs'

// 完整的开发服务器配置
export default defineConfig({
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
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/socket.io': {
        target: 'ws://localhost:8080',
        ws: true
      }
    },

    // CORS：显式列出允许的源
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:8080'],
      credentials: true
    },

    // 报错遮罩层
    hmr: { overlay: true },

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
})

// 局域网调试：手机等设备通过局域网 IP 访问
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: false // 不自动打开，改为在设备上手动访问
  }
})

// Docker 环境：开启轮询监听
export default defineConfig({
  server: {
    host: '0.0.0.0',
    watch: {
      usePolling: true,
      interval: 1000
    }
  }
})
```
