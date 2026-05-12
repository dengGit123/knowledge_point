# base 配置

## 定义

`base` 指定开发或生产环境服务的公共基础路径，默认值为 `/`。

## 用法

```javascript
// vite.config.js
export default {
  base: '/app/',
  // 或使用完整 URL
  base: 'https://example.com/'
}
```

## 作用

- 决定应用部署时的基础路径
- 影响所有资源引用路径的前缀
- 自动注入到 HTML 中的资源路径

## 使用场景

1. **子路径部署**：应用部署在域名的子路径下，如 `example.com/app/`
2. **CDN 部署**：静态资源托管在 CDN
3. **GitHub Pages**：部署到 `username.github.io/repo-name`
4. **多环境部署**：不同环境有不同的基础路径

## 注意事项

- `base` 必须以 `/` 开头和结尾
- 使用相对路径（如 `./`）时，资源路径会基于当前页面 URL
- 修改 `base` 后，路由配置（如 Vue Router）需要对应配置 `base` 选项
- 生产环境构建时会将 `base` 注入到资源引用中

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `root` | `base` 是相对于 `root` 的路径前缀 |
| `build.assetsDir` | `base` + `assetsDir` 构成完整资源路径 |
| `server.origin` | 开发环境跨域时需要配合 `origin` 使用 |

## 示例

```javascript
// 部署到子路径
export default {
  base: '/my-app/'
}

// 部署到 GitHub Pages
export default {
  base: '/repo-name/'
}

// 使用环境变量动态配置
export default {
  base: process.env.NODE_ENV === 'production'
    ? 'https://cdn.example.com/my-app/'
    : '/'
}

// 相对路径部署（适用于不确定路径的情况）
export default {
  base: './'  // 所有资源使用相对路径引用
}
```
