# mode 配置

## 定义

`mode` 指定运行模式，默认值为开发环境的 `development`（通过 CLI 覆盖）。

## 用法

```javascript
// vite.config.js
export default {
  mode: 'production'
}
```

或在命令行中指定：

```bash
vite build --mode staging
```

## 作用

- 决定加载哪个环境变量文件（`.env.[mode]`）
- 影响构建的默认行为（开发模式启用 HMR，生产模式优化构建）
- 可通过 `import.meta.env.MODE` 在代码中访问

## 使用场景

1. **多环境配置**：开发、测试、预发布、生产环境
2. **自定义构建模式**：如 `staging`、`preview` 等自定义环境
3. **条件编译**：根据模式执行不同逻辑

## 注意事项

- `mode` 不等于 `NODE_ENV`，但 Vite 会自动设置 `NODE_ENV`
- 默认模式：`vite` 和 `vite dev` 为 `development`，`vite build` 为 `production`
- `.env` 文件始终加载，`.env.[mode]` 根据模式加载
- 模式名称只能包含字母、数字和下划线

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `envDir` | 环境变量文件的查找目录 |
| `envPrefix` | 环境变量暴露到客户端的前缀 |
| `define` | 常与 `mode` 配合做条件编译 |
| `build.minify` | 生产模式下默认启用压缩 |

## 环境变量加载优先级

```
1. .env.local          (始终加载，被 git 忽略)
2. .env.[mode].local   (指定模式加载，被 git 忽略)
3. .env                (始终加载)
4. .env.[mode]         (指定模式加载)
```

## 示例

```javascript
// vite.config.js
export default {
  mode: process.env.NODE_ENV || 'development',

  // 根据模式配置不同行为
  define: {
    __APP_INFO__: JSON.stringify({
      mode: import.meta.env.MODE,
      isDev: import.meta.env.DEV,
      isProd: import.meta.env.PROD
    })
  }
}

// 源代码中使用
if (import.meta.env.MODE === 'development') {
  console.log('开发模式')
}
```

```bash
# .env.staging
VITE_API_BASE_URL=https://staging-api.example.com
```
