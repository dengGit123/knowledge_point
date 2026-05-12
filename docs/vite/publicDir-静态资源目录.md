# publicDir 配置

## 定义

`publicDir` 指定静态资源目录，默认值为 `root` 目录下的 `public`。

## 用法

```javascript
// vite.config.js
export default {
  publicDir: 'assets',
  // 或禁用
  publicDir: false
}
```

## 作用

- 存放不经过 Vite 处理的静态资源
- 资源会被原封不动复制到输出目录
- 可通过绝对路径直接引用这些资源

## 使用场景

1. **图片/图标**：favicon、logo 等静态图片
2. **字体文件**：不打包的字体文件
3. **robots.txt / sitemap.xml**：SEO 相关文件
4. **manifest.json**：PWA 配置文件
5. **第三方脚本**：需要直接引用的 JS 文件

## 注意事项

- `publicDir` 中的文件不会被处理、压缩或哈希化
- 引用方式：`/image.png`（相对于 `base` 路径）
- 支持嵌套目录结构
- 设置为 `false` 可完全禁用此功能

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `root` | 默认值为 `<root>/public` |
| `base` | 最终访问路径为 `base` + 资源相对路径 |
| `build.assetsDir` | `publicDir` 内容复制到根目录，`assetsDir` 是打包资源目录 |

## 示例

```javascript
// 基本配置
export default {
  publicDir: 'static'  // 使用 static 目录代替 public
}

// 完全禁用
export default {
  publicDir: false
}

// 多环境不同配置
export default {
  publicDir: process.env.NODE_ENV === 'development'
    ? 'public-dev'
    : 'public'
}
```

## 目录结构示例

```
project/
├── public/
│   ├── favicon.ico
│   ├── logo.png
│   └── fonts/
│       └── custom.woff2
├── src/
│   └── App.vue
└── vite.config.js

// 在代码中引用
<img src="/logo.png" />
// 或
<img src={`${import.meta.env.BASE_URL}logo.png`} />
```
