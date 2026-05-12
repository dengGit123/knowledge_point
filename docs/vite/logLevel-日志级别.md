# logLevel 配置

## 定义

`logLevel` 控制控制台输出日志的详细程度。

## 用法

```javascript
// vite.config.js
export default {
  logLevel: 'info'
}
```

## 可选值

| 值 | 说明 |
|----|------|
| `'silent'` | 不输出任何日志 |
| `'error'` | 仅输出错误信息 |
| `'warn'` | 输出警告和错误 |
| `'info'` | 输出信息、警告和错误（默认） |
| `'debug'` | 输出所有调试信息 |

## 作用

- 控制终端日志输出级别
- 减少 CI/CD 环境的日志噪音
- 调试时获取详细信息

## 使用场景

1. **调试**：使用 `debug` 获取详细日志
2. **CI/CD**：使用 `warn` 或 `error` 减少输出
3. **静默模式**：使用 `silent` 配合其他日志工具

## 注意事项

- 命令行选项 `--debug` 相当于 `logLevel: 'debug'`
- `--silent` 选项相当于 `logLevel: 'silent'`
- 修改日志级别不影响错误堆栈追踪

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `clearScreen` | 控制是否清屏，与日志显示效果相关 |

## 示例

```javascript
// 调试模式
export default {
  logLevel: 'debug'
}

// 生产构建减少日志
export default {
  logLevel: 'warn'
}

// 完全静默（配合自定义日志）
export default {
  logLevel: 'silent'
}

// 命令行等价形式
// vite --debug
// vite --silent
```
