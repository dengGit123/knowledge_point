# Vite 配置完整文档索引

本文档包含 Vite `vite.config.js` 的所有配置属性详细说明。

## 核心配置

| 配置 | 说明 | 文档 |
|------|------|------|
| root | 项目根目录 | [查看](./root-项目根目录.md) |
| base | 公共基础路径 | [查看](./base-公共基础路径.md) |
| mode | 运行模式 | [查看](./mode-运行模式.md) |
| configFile | 配置文件路径 | [查看](./config-配置文件.md) |

## 路径解析

| 配置 | 说明 | 文档 |
|------|------|------|
| resolve | 模块解析配置 | [查看](./resolve-模块解析.md) |
| publicDir | 静态资源目录 | [查看](./publicDir-静态资源目录.md) |
| cacheDir | 缓存目录 | [查看](./cacheDir-缓存目录.md) |

## 服务器

| 配置 | 说明 | 文档 |
|------|------|------|
| server | 开发服务器配置 | [查看](./server-开发服务器.md) |
| preview | 预览服务器配置 | [查看](./preview-预览服务器.md) |

## 构建

| 配置 | 说明 | 文档 |
|------|------|------|
| build | 生产构建配置 | [查看](./build-生产构建.md) |

## 依赖优化

| 配置 | 说明 | 文档 |
|------|------|------|
| optimizeDeps | 依赖预构建配置 | [查看](./optimizeDeps-依赖预构建.md) |

## 样式

| 配置 | 说明 | 文档 |
|------|------|------|
| css | CSS 处理配置 | [查看](./css-样式处理.md) |
| assetsInclude | 额外资源类型 | [查看](./assetsInclude-额外资源类型.md) |

## 插件与扩展

| 配置 | 说明 | 文档 |
|------|------|------|
| plugins | 插件配置 | [查看](./plugins-插件配置.md) |

## SSR 与 Worker

| 配置 | 说明 | 文档 |
|------|------|------|
| ssr | 服务端渲染配置 | [查看](./ssr-服务端渲染.md) |
| worker | Web Worker 配置 | [查看](./worker-WebWorker.md) |

## 环境变量

| 配置 | 说明 | 文档 |
|------|------|------|
| envDir | 环境变量文件目录 | [查看](./envDir-环境变量目录.md) |
| envPrefix | 环境变量前缀 | [查看](./envPrefix-环境变量前缀.md) |
| define | 全局常量定义 | [查看](./define-全局常量.md) |

## 其他

| 配置 | 说明 | 文档 |
|------|------|------|
| logLevel | 日志级别 | [查看](./logLevel-日志级别.md) |
| clearScreen | 清屏行为 | [查看](./clearScreen-清屏设置.md) |
| json | JSON 解析配置 | [查看](./json-JSON解析.md) |

## 配置模板

```javascript
import { defineConfig } from 'vite'

export default defineConfig({
  // 核心配置
  root: './',
  base: '/',
  mode: 'development',

  // 路径解析
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  publicDir: 'public',
  cacheDir: 'node_modules/.vite',

  // 开发服务器
  server: {
    port: 5173,
    open: true
  },

  // 构建
  build: {
    outDir: 'dist',
    sourcemap: false
  },

  // 依赖优化
  optimizeDeps: {
    include: ['vue']
  },

  // 插件
  plugins: [],

  // 环境变量
  envPrefix: 'VITE_',
  define: {},

  // 其他
  logLevel: 'info',
  clearScreen: true
})
```
