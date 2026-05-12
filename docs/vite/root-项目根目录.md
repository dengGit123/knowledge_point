# root 配置

## 定义

`root` 指定项目根目录（索引文件所在的位置），默认值为 `process.cwd()`。

## 用法

```javascript
// vite.config.js
export default {
  root: './src'
}
```

## 作用

- 定义 Vite 项目的根目录路径
- 所有相对路径的解析基准点
- 影响 `index.html` 和 `public` 目录的查找位置

## 使用场景

1. **单仓库多应用**：在一个仓库中管理多个应用时
2. **自定义目录结构**：项目根目录与源码目录分离
3. **特定工作流**：需要从特定目录启动开发服务器

## 注意事项

- `root` 应该是绝对路径或相对于配置文件所在目录的相对路径
- 修改 `root` 后，`publicDir` 和 `cacheDir` 的默认解析位置也会改变
- 确保 `index.html` 位于指定的 `root` 目录下

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `publicDir` | 默认值为 `<root>/public`，受 `root` 影响 |
| `cacheDir` | 默认值为 `<root>/node_modules/.vite`，受 `root` 影响 |
| `base` | `base` 是相对于 `root` 的公共路径 |
| `configFile` | 配置文件的查找从 `root` 开始向上搜索 |

## 示例

```javascript
// 多应用项目结构
// my-repo/
//   ├── apps/
//   │   ├── admin/
//   │   └── app/
//   └── vite.config.js

// apps/admin/vite.config.js
export default {
  root: './',
  build: {
    outDir: '../../dist/admin'
  }
}
```
