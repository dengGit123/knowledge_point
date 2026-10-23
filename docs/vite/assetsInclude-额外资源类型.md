# assetsInclude 配置

> 📖 [官方文档：Shared Options](https://cn.vitejs.dev/config/shared-options.html)

## 定义

`assetsInclude` 通过 [picomatch](https://github.com/micromatch/picomatch) 模式指定**额外的**静态资源类型。命中的文件会被当作静态资源处理：

- 导入时返回解析后的 URL（小于 `build.assetsInlineLimit` 的文件内联为 data URL）
- 从插件的转换管线中排除，不会被当作 JS 等模块解析
- 在 HTML 中引用或被 fetch/XHR 直接请求时也不会经过插件处理

**类型**：`string | RegExp | (string | RegExp)[]`

**默认值**：`[]`（未配置时使用 Vite 内置资源类型列表）

## 可选值与使用方式

### 1. 字符串 / 字符串数组（picomatch 通配模式）

```javascript
// vite.config.js
export default {
  // 常见写法：**/*.扩展名，匹配任意层级
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.hdr']
}
```

```javascript
// 单个字符串也可以
export default {
  assetsInclude: '**/*.gql'
}
```

### 2. 正则 / 正则数组

```javascript
export default {
  assetsInclude: [/\.(gltf|glb|hdr)$/]
}
```

### 3. 字符串与正则混用

```javascript
export default {
  assetsInclude: [
    '**/*.gltf',
    '**/*.glb',
    /\.(hdr|exr)$/
  ]
}
```

> 💡 **提示：** 只支持字符串（通配模式）与正则两种形式，不支持函数。

## Vite 内置资源类型

以下类型无需配置即可作为资源导入（来自 Vite 源码的 `KNOWN_ASSET_TYPES`，不同版本可能略有增补）：

```text
图片：.png  .jpg/.jpeg  .jfif  .pjpeg  .pjp  .gif  .svg  .ico  .webp  .avif
字体：.woff  .woff2  .eot  .ttf  .otf
音视频：.mp4  .webm  .ogg  .mp3  .wav  .flac  .aac  .opus  .mov  .m4a  .vtt
其他：.webmanifest  .pdf  .txt
```

## 生效后的结果示例

### 导入 3D 模型

```javascript
// vite.config.js
export default {
  assetsInclude: ['**/*.gltf', '**/*.glb']
}
```

```javascript
// src/main.js
import modelUrl from './models/car.glb'

// 拿到的是 URL，交给 Three.js 等库加载
loader.load(modelUrl, (gltf) => {
  scene.add(gltf.scene)
})
```

### 自定义扩展名

```javascript
// vite.config.js
export default {
  assetsInclude: ['**/*.myasset']
}
```

```javascript
// src/main.js
import myAssetUrl from './data/file.myasset'
console.log(myAssetUrl) // /assets/file-abc123.myasset
```

### 正则匹配特定目录

```javascript
// vite.config.js
export default {
  assetsInclude: [
    /\/assets\/special\//,   // 特定目录下的所有文件
    /\.bin$/                 // 特定扩展名
  ]
}
```

## 导入语法（对资源文件通用）

```javascript
// 默认导入：返回 URL（构建后带哈希）
import imgUrl from './image.png'

// 显式 URL 导入
import url from './file.bin?url'

// 原始内容（字符串）
import raw from './file.bin?raw'

// 强制内联为 base64 data URL
import inline from './icon.png?inline'

// Worker 脚本
import MyWorker from './worker.js?worker'
```

## 使用场景

### 1. 3D 模型与贴图

```javascript
export default {
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.hdr', '**/*.exr', '**/*.vrm']
}
```

### 2. 数据文件（JSON 除外）

```javascript
export default {
  assetsInclude: ['**/*.csv', '**/*.xml', '**/*.yaml', '**/*.yml']
}
```

> ⚠️ **注意：** 不要把 `.json` 加进 `assetsInclude`。JSON 由 `json` 配置专门处理（解析为对象、支持具名导出）；想拿到 JSON 文件的 URL，用显式后缀 `import url from './data.json?url'` 即可，无需任何配置。

### 3. 补充音视频格式

```javascript
export default {
  // 内置列表之外的封装格式
  assetsInclude: ['**/*.avi', '**/*.flv', '**/*.wmv', '**/*.mkv']
}
```

## 注意事项

### 1. 与 build.assetsInlineLimit 配合

```javascript
export default {
  assetsInclude: ['**/*.bin'],
  build: {
    // 小于该值（字节）的资源会被内联为 base64 data URL
    assetsInlineLimit: 4096
  }
}
```

### 2. 与 publicDir 的区别

| 特性 | assetsInclude 命中的文件 | publicDir 目录 |
|------|--------------------------|----------------|
| 处理方式 | 参与打包 | 原样复制 |
| 文件名 | 自动加哈希 | 不加哈希 |
| 引用方式 | import 导入 | 根绝对路径引用 |
| 插件处理 | 排除在转换管线外（作为资源） | 不处理 |

```javascript
// public/logo.png      → 复制到 dist 根目录，用 /logo.png 引用
// src/assets/logo.png  → import 导入，产物带哈希
```

### 3. 通配模式要匹配完整路径

```javascript
// ✅ 正确：匹配任意层级
assetsInclude: ['**/*.gltf']

// ❌ 错误：单层 * 不能跨越路径分隔符，匹配不到子目录中的文件
assetsInclude: ['*.gltf']
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `build.assetsInlineLimit` | 小于阈值的资源内联为 base64 |
| `build.assetsDir` | 资源输出目录 |
| `publicDir` | 静态复制目录，不参与打包 |

## 完整示例

### 3D 应用

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  assetsInclude: [
    '**/*.gltf',
    '**/*.glb',
    '**/*.hdr',
    '**/*.exr',
    '**/*.vrm',
    '**/*.fbx'
  ],
  build: {
    // 3D 资源通常较大，不内联
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/models/[name]-[hash][extname]'
      }
    }
  }
})
```

### 多媒体项目

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  assetsInclude: [
    '**/*.avi',
    '**/*.flv',
    '**/*.wmv',
    '**/*.mkv'
  ],
  build: {
    // 大文件不内联
    assetsInlineLimit: 0
  }
})
```

## 常见问题

### 问题 1：导入自定义类型文件报错

**原因**：类型未加入 `assetsInclude`，Vite 尝试把它当作模块解析。

```javascript
// ❌ 报错
import model from './model.gltf'

// ✅ 解决
export default {
  assetsInclude: ['**/*.gltf']
}
```

### 问题 2：文件名没有哈希

**原因**：文件放在 `publicDir` 目录中，该目录只做原样复制。

**解决**：移到 `src` 下通过 import 导入。

```javascript
// public/model.glb      → 无哈希
// src/assets/model.glb  → import 后带哈希
```

### 问题 3：通配匹配无效

**原因**：模式没有覆盖到文件的完整路径。

```javascript
// ❌ 错误
assetsInclude: ['*.gltf']

// ✅ 正确
assetsInclude: ['**/*.gltf']
```
