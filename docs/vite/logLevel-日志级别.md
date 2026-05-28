# logLevel 配置

## 定义

`logLevel` 控制控制台输出日志的详细程度，用于调整 Vite 在终端显示的日志级别。

**类型**：`'silent' | 'error' | 'warn' | 'info' | 'debug'`

**默认值**：`'info'`

## 可选值与使用方式

### 日志级别对照表

| 值 | 级别 | 显示内容 | 使用场景 |
|----|------|----------|----------|
| `'silent'` | 静默 | 无日志 | 完全禁用日志输出 |
| `'error'` | 错误 | 仅错误 | 仅显示错误信息 |
| `'warn'` | 警告 | 警告 + 错误 | CI/CD 环境 |
| `'info'` | 信息 | 信息 + 警告 + 错误 | 默认，日常开发 |
| `'debug'` | 调试 | 全部日志 | 调试问题 |

### 配置方式

```javascript
// vite.config.js
export default {
  logLevel: 'info'  // 默认值
}

// 静默模式
export default {
  logLevel: 'silent'
}

// 仅错误
export default {
  logLevel: 'error'
}

// 警告级别
export default {
  logLevel: 'warn'
}

// 调试级别
export default {
  logLevel: 'debug'
}
```

### 命令行方式

```bash
# 等同于 logLevel: 'debug'
vite --debug

# 等同于 logLevel: 'silent'
vite --silent
```

## 生效后的结果示例

### info 级别（默认）

```javascript
// vite.config.js
export default {
  logLevel: 'info'
}
```

```bash
$ vite

VITE v5.0.0  Ready in 523 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
➜  press h + enter to show help
```

### debug 级别

```javascript
// vite.config.js
export default {
  logLevel: 'debug'
}
```

```bash
$ vite

[VITE] Debug: Loaded env from ./env
[VITE] Debug: Resolved config from vite.config.js
[VITE] Debug: Optimizing dependencies...
[VITE] Debug: Dependencies optimized in 1234ms
[VITE] v5.0.0  Ready in 1523 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
```

### silent 级别

```javascript
// vite.config.js
export default {
  logLevel: 'silent'
}
```

```bash
$ vite

# 无任何输出，仅服务器启动
```

### warn 级别

```javascript
// vite.config.js
export default {
  logLevel: 'warn'
}
```

```bash
$ vite

⚠ [Vite] Warning: Some package is missing
➜  Local:   http://localhost:5173/
```

### error 级别

```javascript
// vite.config.js
export default {
  logLevel: 'error'
}
```

```bash
$ vite

❌ [Vite] Error: Cannot find module
```

## 使用场景

### 1. 调试问题

```javascript
// vite.config.js
export default {
  logLevel: 'debug'  // 显示详细日志
}
```

### 2. CI/CD 环境

```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  return {
    logLevel: process.env.CI ? 'warn' : 'info'
  }
})
```

### 3. 静默模式

```javascript
// vite.config.js
export default {
  logLevel: 'silent'  // 完全静默
}
```

### 4. 生产构建

```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  return {
    logLevel: mode === 'production' ? 'warn' : 'info'
  }
})
```

## 注意事项

### 1. 不影响错误堆栈追踪

无论 `logLevel` 设置为何值，错误堆栈信息都会完整显示。

### 2. 命令行参数优先级

```bash
# 命令行参数覆盖配置文件
vite --debug  # 相当于 logLevel: 'debug'
vite --silent # 相当于 logLevel: 'silent'
```

### 3. 文件监听日志

`logLevel` 控制的是 Vite 自身的日志，不包括插件日志。

### 4. 与 clearScreen 的配合

```javascript
export default {
  logLevel: 'debug',
  clearScreen: false  // 保留日志历史
}
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `clearScreen` | 配合控制日志显示效果 |
| `customLogger` | 自定义 logger 时 `logLevel` 可能不生效 |

## 完整示例

### 根据环境调整日志级别

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  return {
    logLevel: mode === 'development'
      ? 'info'      // 开发：正常日志
      : mode === 'test'
        ? 'silent'   // 测试：静默
        : 'warn'     // 生产：仅警告
  }
})
```

### CI 环境优化

```javascript
// vite.config.js
export default defineConfig({
  // CI 环境减少日志输出
  logLevel: process.env.CI === 'true' ? 'warn' : 'info'
})
```

### 调试配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  const isDebug = process.env.DEBUG === 'true'

  return {
    logLevel: isDebug ? 'debug' : 'info',
    clearScreen: !isDebug  // 调试时不清屏
  }
})
```

```bash
# 调试模式
DEBUG=true vite
```

### 完全静默模式

```javascript
// vite.config.js
export default {
  logLevel: 'silent',
  clearScreen: false
}
```

配合自定义日志处理：

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import { myLogger } from './logger'

export default defineConfig({
  logLevel: 'silent',
  plugins: [
    {
      name: 'custom-logger',
      configureServer(server) {
        server.httpServer?.on('listening', () => {
          myLogger.log('Server started')
        })
      }
    }
  ]
})
```

## 常见问题

### 问题 1：日志级别不生效

**原因**：命令行参数覆盖

```bash
# vite --debug 会覆盖配置文件中的 logLevel
vite --debug
```

**解决**：不使用命令行参数

### 问题 2：插件日志仍显示

**原因**：`logLevel` 不控制插件日志

```javascript
// 插件需要自行控制日志输出
```

## 官方文档

[Shared Config: logLevel - Vite 官方文档](https://cn.vitejs.dev/config/shared-options.html#loglevel)

[CLI: Debug - Vite 官方文档](https://cn.vitejs.dev/guide/cli.html#debug)
