# cacheDir 配置

## 定义

`cacheDir` 指定缓存文件目录，默认值为 `node_modules/.vite`。

## 用法

```javascript
// vite.config.js
export default {
  cacheDir: '.vite-cache'
}
```

## 作用

- 存储预构建依赖的缓存
- 存储转换后的源码缓存
- 提高 Vite 启动和 HMR 速度

## 使用场景

1. **自定义缓存位置**：不想污染 `node_modules`
2. **Docker 构建**：将缓存目录挂载到持久化存储
3. **CI/CD**：缓存目录可被 CI 系统缓存加速构建
4. **Monorepo**：多个项目共享缓存

## 注意事项

- 缓存目录会自动创建
- 删除缓存目录可以强制重新预构建
- 路径相对于 `root` 目录
- 建议将缓存目录加入 `.gitignore`

## 缓存内容

```
.vite-cache/
├── deps/           # 预构建依赖缓存
├── fs/             # 文件系统缓存
└── metadata.json   # 缓存元数据
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `root` | 默认路径相对于 `root` |
| `optimizeDeps` | 预构建依赖存放在 `cacheDir/deps` |
| `server.force` | 强制重新构建时清除相关缓存 |

## 示例

```javascript
// 基本配置
export default {
  cacheDir: '.vite'
}

// 环境特定配置
export default {
  cacheDir: process.env.NODE_ENV === 'test'
    ? '.vite-test'
    : '.vite'
}

// 清除缓存的命令
// 删除缓存目录后重启开发服务器
rm -rf node_modules/.vite
```

## .gitignore 配置

```gitignore
# Vite 缓存目录
.vite
.vite-cache
node_modules/.vite
```
