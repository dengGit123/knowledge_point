# clearScreen 配置

> 📖 [官方文档：Shared Options](https://cn.vitejs.dev/config/shared-options.html)

## 定义

`clearScreen` 控制终端清屏行为：Vite 在输出某些日志消息时会清空终端屏幕，设为 `false` 可以禁止清屏，保留终端的历史输出。

**类型**：`boolean`

**默认值**：`true`

## 可选值与使用方式

### 基本用法

```javascript
// vite.config.js
export default {
  clearScreen: false // 保留终端历史日志；省略该配置时默认为 true（清屏）
}
```

### 命令行方式

```bash
# CLI 选项会覆盖配置文件中的 clearScreen
vite --clearScreen false
```

## 生效后的结果示例

### clearScreen: true（默认）

```javascript
// vite.config.js
export default {
  clearScreen: true
}
```

**效果**：输出日志时先清空终端屏幕

```bash
# 之前的日志被清除，屏幕从顶部重新开始显示

VITE v5.0.0  Ready in 523 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
➜  press h + enter to show help
```

### clearScreen: false

```javascript
// vite.config.js
export default {
  clearScreen: false
}
```

**效果**：保留之前的日志，新日志追加在历史内容后面

```bash
$ npm run build
# 构建日志...
Building for production...
✓ built in 1.23s

$ npm run dev
# 上面的构建日志仍然保留
# 开发服务器日志追加在后面

VITE v5.0.0  Ready in 523 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
➜  press h + enter to show help
```

## 使用场景

### 1. 调试模式

保留完整日志历史，便于追溯问题：

```javascript
// vite.config.js
export default {
  clearScreen: false // 保留日志，配合 vite --debug 查看详细输出
}
```

### 2. CI/CD 环境

避免清屏导致日志记录不完整：

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  clearScreen: !process.env.CI
})
```

### 3. 按构建模式切换

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  return {
    clearScreen: mode === 'development' // 仅开发环境清屏
  }
})
```

## 注意事项

### 1. 清屏发生的时机

清屏发生在 Vite 输出特定日志消息的时候，例如开发服务器启动、配置文件修改后自动重启。HMR 更新日志不会触发清屏，并非"只有启动那一刻"才可能清屏。

### 2. 终端兼容性

清屏通过向终端写入转义序列实现，只在可交互的终端（TTY）中执行；在 CI 或输出被重定向到文件等场景下，Vite 本身就不会清屏。

### 3. 与 logLevel 配合

```javascript
export default {
  clearScreen: false,
  logLevel: 'info'
}
```

::: tip
调试时用 CLI 组合最方便：`vite --debug --clearScreen false`，既输出调试日志又保留历史。
:::

## 与其他属性的关系

| 属性 / 命令 | 关系说明 |
|------|----------|
| `logLevel` | 共同决定终端呈现：`logLevel` 决定显示多少日志，`clearScreen` 决定是否保留历史 |
| `customLogger` | 使用自定义 logger 时，`clearScreen` 与 `logLevel` 都不再生效 |
| `--clearScreen false`（CLI） | 命令行选项，优先级高于配置文件中的 `clearScreen` |

## 完整示例

### 调试配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  const isDebug = process.env.DEBUG === 'true'

  return {
    // 调试模式保留日志
    clearScreen: !isDebug
  }
})
```

```bash
# 调试模式
DEBUG=true vite --clearScreen false
```

### CI 环境配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  // CI 环境保留日志
  clearScreen: !process.env.CI
})
```

### 开发体验配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  // 开发时清屏，保持界面整洁
  clearScreen: true,

  server: {
    port: 5173,
    open: true
  }
})
```

## 常见问题

### 问题 1：日志丢失

**原因**：`clearScreen: true`（默认）清除了历史日志。

**解决**：设置为 `false`

```javascript
export default {
  clearScreen: false
}
```

### 问题 2：CI 日志不完整

**原因**：清屏覆盖了之前输出的日志，导致 CI 记录缺失。

**解决**：

```javascript
export default defineConfig({
  clearScreen: !process.env.CI
})
```
