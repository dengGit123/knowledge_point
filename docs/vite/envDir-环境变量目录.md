# envDir 配置

## 定义

`envDir` 指定环境变量文件的目录，默认值为 `root` 目录。

## 用法

```javascript
// vite.config.js
export default {
  envDir: './env'
}
```

## 作用

- 指定 `.env` 文件的存放位置
- 支持将环境变量文件集中管理

## 使用场景

1. **集中管理**：将环境变量文件放在统一目录
2. **多项目共享**：多个项目共享同一份环境变量
3. **安全考虑**：将敏感文件隔离

## 注意事项

- `.env.local` 文件始终被忽略（加入 `.gitignore`）
- 只有以 `envPrefix` 开头的变量才会暴露给客户端
- 环境变量文件名格式：`.env`、`.env.[mode]`、`.env.local`、`.env.[mode].local`

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `root` | 默认值使用 `root` 目录 |
| `envPrefix` | 控制哪些变量暴露给客户端 |
| `mode` | 决定加载哪个 `.env.[mode]` 文件 |

## 示例

```javascript
// 基本配置
export default {
  envDir: './config/env'
}

// 目录结构
// project/
// ├── config/
// │   └── env/
// │       ├── .env
// │       ├── .env.local
// │       ├── .env.development
// │       └── .env.production
// ├── src/
// └── vite.config.js
```
