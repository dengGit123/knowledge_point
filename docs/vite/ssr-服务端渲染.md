# ssr 配置

## 定义

`ssr` 配置服务端渲染（SSR）相关选项。

## 用法

```javascript
// vite.config.js
export default {
  ssr: {
    noExternal: [],
    external: [],
    target: 'node',
    ssrLoadModule: undefined
  }
}
```

## 子属性详解

### noExternal

强制将依赖进行 SSR 打包（即使它们是 ESM）。

```javascript
noExternal: ['vue', 'vue-router'],
noExternal: true,              // 全部打包
noExternal: /^@scope\/.*/      // 正则匹配
```

### external

强制将依赖标记为外部依赖（不打包）。

```javascript
external: ['koa', 'express']
```

### target

SSR 构建目标。

```javascript
target: 'node',      // Node.js
target: 'webworker'  // Web Worker
```

### ssrLoadModule

自定义 SSR 模块加载函数。

```javascript
ssrLoadModule: (url) => {
  // 自定义加载逻辑
}
```

## 作用

- 配置服务端渲染的打包行为
- 控制哪些依赖需要打包
- 优化 SSR 构建产物

## 使用场景

1. **SSR 应用**：Nuxt、Astro 等
2. **Node.js 服务**：需要运行在服务端的应用
3. **依赖控制**：某些 ESM 包在 SSR 时需要打包

## 注意事项

- `noExternal: true` 会打包所有依赖（包括 node_modules）
- SSR 构建不处理 CSS（由框架处理）
- 需要使用 `ssrLoadModule` 时通常意味着需要特定加载器

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `optimizeDeps.disabled` | SSR 构建时通常禁用依赖预构建 |
| `build.ssr` | 是否生成 SSR 构建产物 |
| `build.ssrManifest` | 生成 CSS 资源清单 |

## 示例

```javascript
// 基本配置
export default {
  ssr: {
    noExternal: ['vue', 'vue-router'],
    external: ['express', 'koa']
  }
}

// 全部打包
export default {
  ssr: {
    noExternal: true
  }
}

// 使用正则
export default {
  ssr: {
    noExternal: /^@my-scope\/.*/
  }
}

// SSR 构建命令
// vite build --ssr src/entry-server.js
```
