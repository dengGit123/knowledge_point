# logLevel 配置

> 📖 [官方文档：Shared Options](https://cn.vitejs.dev/config/shared-options.html)

## 定义

`logLevel` 用于调整控制台输出的详细程度，控制 Vite 在终端显示哪些级别的日志。

**类型**：`'info' | 'warn' | 'error' | 'silent'`

**默认值**：`'info'`

## 可选值与使用方式

### 日志级别对照表

| 值 | 级别 | 显示内容 | 使用场景 |
|----|------|----------|----------|
| `'silent'` | 静默 | 不输出任何日志，错误也不会显示 | 完全禁用输出 |
| `'error'` | 错误 | 仅错误 | 只关心报错 |
| `'warn'` | 警告 | 警告 + 错误 | CI/CD 环境 |
| `'info'` | 信息 | 信息 + 警告 + 错误 | 默认，日常开发 |

> 📝 级别越高，输出越少：设置为某一级别后，比它更详细的日志都会被隐藏。例如 `'warn'` 下不会显示服务器启动信息这类 info 级日志。

::: warning 注意
`'silent'` 会把错误输出也一起隐藏，排查问题时慎用。
:::

### 配置方式

```javascript
// vite.config.js
export default {
  logLevel: 'info' // 默认值
}
```

需要其他级别时，换成对应的字符串即可，例如 `logLevel: 'warn'`、`logLevel: 'error'`、`logLevel: 'silent'`。

### 命令行方式

```bash
# 通过 --logLevel 指定级别，会覆盖配置文件中的 logLevel
vite --logLevel warn
vite build --logLevel error

# 打开 Vite 的调试日志（独立的 CLI 选项，输出内部 debug 信息）
vite --debug
```

::: tip
`'debug'` 并不是 `logLevel` 的合法取值，它是独立的 CLI 调试选项。想看更详细的内部日志用 `vite --debug`，而不是设置 `logLevel: 'debug'`。
:::

## 生效后的结果示例

以下输出为示意，重点在于各级别分别显示、隐藏了哪些内容。

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

### warn 级别

```javascript
// vite.config.js
export default {
  logLevel: 'warn'
}
```

```bash
$ vite
# 启动信息（Ready、Local 地址等属于 info 级）不再显示
# 仅当出现警告或错误时，才输出对应内容
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
# 仅显示错误，警告与常规信息都被隐藏
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
# 终端无任何输出（包括错误），但服务器照常在后台启动
```

## 使用场景

### 1. 排查问题

```bash
# 配合 CLI 打开调试日志，查看 Vite 内部处理过程
vite --debug
```

### 2. CI/CD 环境

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  logLevel: process.env.CI ? 'warn' : 'info'
})
```

### 3. 静默模式

```javascript
// vite.config.js
export default {
  logLevel: 'silent' // 完全静默，错误也不输出
}
```

### 4. 按构建模式切换

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  return {
    logLevel: mode === 'production' ? 'warn' : 'info'
  }
})
```

## 注意事项

### 1. `'silent'` 会吞掉错误

`'silent'` 级别下错误也不会被打印，命令表现为"无输出但可能失败了"。只有在明确不需要任何反馈时才使用。

### 2. 命令行参数优先级

```bash
# --logLevel 会覆盖配置文件中的 logLevel
vite --logLevel error
```

### 3. 与 clearScreen 的配合

```javascript
export default {
  logLevel: 'info',
  clearScreen: false // 不清屏，保留日志历史
}
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `clearScreen` | 决定输出日志时是否清空终端，与 `logLevel` 共同影响终端呈现 |
| `customLogger` | 使用自定义 logger 时，`logLevel` 与 `clearScreen` 都不再生效 |

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
        ? 'silent'  // 测试：静默
        : 'warn'    // 生产：仅警告
  }
})
```

### CI 环境优化

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  // CI 环境减少日志输出
  logLevel: process.env.CI === 'true' ? 'warn' : 'info'
})
```

### 调试配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  clearScreen: false // 不清屏，保留完整日志历史
})
```

```bash
# 调试模式：保留日志 + 打开调试输出
vite --debug --clearScreen false
```

### 完全静默模式

```javascript
// vite.config.js
import { defineConfig, createLogger } from 'vite'
import { myLogger } from './logger'

const logger = createLogger('silent', {
  allowClearScreen: false
})

export default defineConfig({
  // Vite 自身完全静默后，用自己的 logger 接管输出
  // 注意：customLogger 需要实现完整的 Logger 接口，所以在 createLogger 的
  // 返回值上展开并覆盖，避免缺失 info / warnOnce / clearScreen 等方法
  customLogger: {
    ...logger,
    warn(msg) {
      myLogger.log(`[warn] ${msg}`)
    },
    error(msg) {
      myLogger.log(`[error] ${msg}`)
    }
  }
})
```

## 常见问题

### 问题 1：日志级别不生效

**原因**：命令行 `--logLevel` 参数会覆盖配置文件中的 `logLevel`。

```bash
# 这条命令会覆盖 vite.config.js 里的 logLevel
vite --logLevel error
```

**解决**：去掉命令行中的 `--logLevel` 参数，或直接用命令行参数控制级别。

### 问题 2：插件日志仍然显示

**原因**：`logLevel` 只作用于 Vite 自身 logger 的输出。插件内部直接使用 `console.log` / `console.info` 打印的内容不经过 Vite logger，因此不受 `logLevel` 控制。

**解决**：插件应使用 Rollup 风格的 `this.warn` / `this.error` 或 Vite 导出的 logger 来输出日志，由 `logLevel` 统一管控；也可以让插件自行控制输出。
