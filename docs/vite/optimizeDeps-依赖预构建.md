# optimizeDeps 配置

## 定义

`optimizeDeps` 配置依赖预构建行为。

## 属性层级结构

```
optimizeDeps
├── include
├── exclude
├── needsInterop
├── esbuildOptions
│   ├── target
│   ├── define
│   ├── jsx
│   ├── loader
│   └── plugins
├── force
├── disabled
├── noDiscovery
└── entries
```

## 用法

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    include: [],
    exclude: [],
    needsInterop: [],
    esbuildOptions: {},
    force: false,
    disabled: false,
    noDiscovery: false,
    entries: []
  }
}
```

## 子属性详解

### include

强制预构建的依赖。

```javascript
include: ['vue', 'vue-router', 'axios']
```

### exclude

排除预构建的依赖。

```javascript
exclude: ['your-local-package']
```

### needsInterop

需要转换 CommonJS 的 ESM 依赖。

```javascript
needsInterop: ['some-esm-package']
```

### esbuildOptions

传递给 esbuild 的选项。

```javascript
esbuildOptions: {
  target: 'es2015',
  define: {
    global: 'globalThis'
  },
  plugins: []
}
```

### force

强制重新预构建。

```javascript
force: true
```

### disabled

完全禁用依赖预构建。

```javascript
disabled: 'build'      // 仅在构建时禁用
disabled: true         // 完全禁用
```

### noDiscovery

禁用自动依赖发现。

```javascript
noDiscovery: true      // 仅预构建 include 中的依赖
```

### entries

指定入口文件用于依赖扫描。

```javascript
entries: ['src/main.js', 'src/renderer.js']
```

## 作用

- 加速开发服务器启动
- 将 CommonJS 转换为 ESM
- 缓存转换结果避免重复处理
- 提升热更新速度

## 使用场景

1. **本地包**：Monorepo 中的本地包需要预构建
2. **特殊依赖**：某些 ESM 包需要特殊处理
3. **调试**：强制重新预构建排查问题
4. **性能**：排除大型不常用的依赖

## 注意事项

- 修改 `optimizeDeps` 配置后需要重启服务器
- 预构建缓存存储在 `cacheDir` 中
- `disabled: 'build'` 常用于 SSR 应用

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `cacheDir` | 预构建缓存存储位置 |
| `resolve.alias` | 别名影响依赖解析 |
| `build.commonjsOptions` | 生产构建的 CJS 处理配置 |

## 工作原理

```
┌─────────────────────────────────────┐
│  1. 扫描项目中的依赖                 │
│  2. 将 CJS 转换为 ESM               │
│  3. 使用 esbuild 打包                │
│  4. 缓存到 node_modules/.vite/deps  │
│  5. 后续直接使用缓存                 │
└─────────────────────────────────────┘
```

## 示例

```javascript
// 基本配置
export default {
  optimizeDeps: {
    include: ['vue', 'element-plus'],
    exclude: ['@monorepo/local-pkg']
  }
}

// esbuild 选项
export default {
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
      jsx: 'automatic',
      loader: {
        '.js': 'jsx'
      }
    }
  }
}

// SSR 应用配置
export default {
  optimizeDeps: {
    disabled: 'build'
  }
}

// 强制重新构建
export default {
  optimizeDeps: {
    force: true
  }
}

// 仅预构建指定依赖
export default {
  optimizeDeps: {
    noDiscovery: true,
    include: ['vue', 'vue-router']
  }
}
```

## 常见问题

**问题：本地包没有正确预构建**

```javascript
// 解决方案：使用 include
optimizeDeps: {
  include: ['@monorepo/shared']
}
```

**问题：ESM 包需要 default 导出**

```javascript
// 解决方案：使用 needsInterop
optimizeDeps: {
  needsInterop: ['some-esm-package']
}
```
