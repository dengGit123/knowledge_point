# clearScreen 配置

## 定义

`clearScreen` 控制终端屏幕清除行为，决定开发服务器启动时是否清空终端屏幕。

**类型**：`boolean`

**默认值**：`true`

## 可选值与使用方式

### 基本用法

```javascript
// vite.config.js
export default {
  clearScreen: true   // 默认值，启动时清屏
}

export default {
  clearScreen: false  // 保留终端历史日志
}
```

## 生效后的结果示例

### clearScreen: true（默认）

```javascript
// vite.config.js
export default {
  clearScreen: true
}
```

**效果**：每次启动时清空终端屏幕

```bash
# 之前的日志被清除
# 屏幕清空...

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

**效果**：保留之前的日志

```bash
$ npm run build
# 构建日志...
Building for production...
✓ built in 1.23s

$ npm run dev
# 之前的构建日志保留
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
  clearScreen: false,  // 保留日志
  logLevel: 'debug'    // 详细日志
}
```

### 2. CI/CD 环境

避免清屏操作影响日志记录：

```javascript
// vite.config.js
export default defineConfig({
  clearScreen: process.env.CI === 'true' ? false : true
})
```

### 3. 开发调试

查看之前的操作记录：

```javascript
// vite.config.js
export default {
  clearScreen: false  // 开发时保留日志
}
```

### 4. 生产构建

构建时不需要清屏：

```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  return {
    clearScreen: mode === 'development'  // 仅开发环境清屏
  }
})
```

## 注意事项

### 1. 仅影响启动时

`clearScreen` 只在开发服务器启动时生效，热更新不会清屏。

### 2. 终端兼容性

某些终端可能不支持清屏操作，此时设置无效。

### 3. 与 logLevel 配合

```javascript
export default {
  clearScreen: false,
  logLevel: 'debug'  // 调试时配合使用
}
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `logLevel` | 配合控制日志显示效果 |
| `server` | 开发服务器启动时生效 |

## 完整示例

### 调试配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => {
  const isDebug = process.env.DEBUG === 'true'

  return {
    // 调试模式保留日志
    clearScreen: !isDebug,
    logLevel: isDebug ? 'debug' : 'info'
  }
})
```

### CI 环境配置

```javascript
// vite.config.js
export default defineConfig({
  // CI 环境保留日志
  clearScreen: process.env.CI === 'true' ? false : true
})
```

### 开发体验配置

```javascript
// vite.config.js
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

**原因**：`clearScreen: true` 清除了历史日志

**解决**：设置为 `false`

```javascript
export default {
  clearScreen: false
}
```

### 问题 2：CI 日志不完整

**原因**：CI 环境中清屏导致日志丢失

**解决**：

```javascript
export default defineConfig({
  clearScreen: process.env.CI ? false : true
})
```

## 官方文档

[Shared Config: clearScreen - Vite 官方文档](https://cn.vitejs.dev/config/shared-options.html#clearscreen)
