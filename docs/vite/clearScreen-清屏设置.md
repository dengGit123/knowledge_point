# clearScreen 配置

## 定义

`clearScreen` 控制终端屏幕清除行为，默认值为 `true`。

## 用法

```javascript
// vite.config.js
export default {
  clearScreen: false
}
```

## 作用

- 开发服务器启动时是否清屏
- 影响日志的可读性

## 使用场景

1. **保留日志**：启动时保留之前的日志信息
2. **调试**：需要查看完整日志历史
3. **CI 环境**：避免清屏操作

## 注意事项

- 默认为 `true`，会清屏后显示欢迎信息
- 设置为 `false` 可以保留终端历史

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `logLevel` | 配合控制日志输出行为 |

## 示例

```javascript
// 保留屏幕内容
export default {
  clearScreen: false
}

// 调试时保留完整日志
export default {
  clearScreen: false,
  logLevel: 'debug'
}
```
