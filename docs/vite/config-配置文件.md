# configFile 配置

## 定义

`configFile` 指定配置文件的路径，默认为 `vite.config.js` 或项目根目录下的 `vite.config.ts/js/mjs/cjs/mts/cts`。

## 用法

```javascript
// 通过 CLI 指定
vite --config my-config.js

// 或在代码中指定
export default {
  configFile: false  // 禁用配置文件
}
```

## 作用

- 自定义配置文件的名称和位置
- 可以完全禁用配置文件使用默认配置

## 使用场景

1. **多配置文件**：同一项目需要不同配置
2. **Monorepo**：不同子包使用不同配置
3. **无配置模式**：使用 Vite 默认配置，无需配置文件
4. **特定命名**：配置文件使用非标准名称

## 注意事项

- 设置为 `false` 时，Vite 将使用默认配置
- 配置文件必须是 ES Module 格式（`.mjs`）或包含 `type: "module"` 的 `package.json`
- `configFile` 的查找从 `root` 目录开始向上搜索

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `root` | 配置文件的查找起点 |
| `mode` | 配置文件可以通过 `mode` 获取当前运行模式 |

## 示例

```javascript
// 使用不同配置文件
// vite.admin.config.js
export default {
  root: './admin',
  build: {
    outDir: '../dist/admin'
  }
}

// vite.app.config.js
export default {
  root: './app',
  build: {
    outDir: '../dist/app'
  }
}

// CLI 使用
vite --config vite.admin.config.js
vite --config vite.app.config.js

// 禁用配置文件
vite --configFile false
```
