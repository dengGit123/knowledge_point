# envPrefix 配置

## 定义

`envPrefix` 指定暴露给客户端的环境变量前缀，默认值为 `VITE_`。

## 用法

```javascript
// vite.config.js
export default {
  envPrefix: 'VITE_',
  // 或使用数组支持多个前缀
  envPrefix: ['VITE_', 'APP_']
}
```

## 作用

- 控制哪些环境变量可以暴露给客户端代码
- 防止敏感环境变量泄露

## 安全原则

```
只有以 envPrefix 开头的变量才能通过 import.meta.env 访问
```

## 使用场景

1. **自定义前缀**：使用 `APP_`、`PUBLIC_` 等前缀
2. **多前缀**：支持多种命名约定
3. **安全控制**：确保只有非敏感变量暴露

## 注意事项

- 设置为空字符串 `''` 会暴露所有环境变量（不推荐）
- 客户端可以访问这些变量，不要存储敏感信息
- 后端环境变量（不含前缀）仅在构建时可访问

## 内置环境变量

```javascript
import.meta.env.MODE        // 运行模式
import.meta.env.BASE_URL    // 基础路径
import.meta.env.PROD        // 是否为生产环境
import.meta.env.DEV         // 是否为开发环境
import.meta.env.SSR         // 是否为 SSR
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `envDir` | 环境变量文件所在目录 |
| `define` | 可以手动定义全局变量 |

## 示例

```javascript
// 自定义前缀
export default {
  envPrefix: 'APP_'
}

// 多前缀
export default {
  envPrefix: ['VITE_', 'PUBLIC_']
}

// .env 文件
# 只有这些变量会暴露给客户端
VITE_API_URL=https://api.example.com
PUBLIC_APP_NAME=My App
VITE_ENABLED=true

# 这些变量不会暴露（构建时可访问）
DATABASE_URL=postgresql://...
SECRET_KEY=abc123

// 在代码中使用
console.log(import.meta.env.VITE_API_URL)
console.log(import.meta.env.PUBLIC_APP_NAME)
```
