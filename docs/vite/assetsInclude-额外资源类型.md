# assetsInclude 配置

## 定义

`assetsInclude` 指定额外的静态资源文件类型，这些文件会被作为资源导入并返回 URL。

**类型**：`string[] | (string => boolean)`

**默认值**：`[]`（内置列表已包含常见类型）

## 可选值与使用方式

### 1. 字符串数组

```javascript
// glob 模式匹配
export default {
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.hdr']
}

// 精确扩展名
export default {
  assetsInclude: ['.abc', '.special']
}
```

### 2. 函数形式

```javascript
// 自定义判断逻辑
export default {
  assetsInclude: (filePath) => {
    return filePath.endsWith('.myasset') ||
           filePath.includes('/assets/models/')
  }
}
```

### 3. 混合配置

```javascript
export default {
  assetsInclude: [
    '**/*.gltf',
    '**/*.glb',
    // 函数也可以
    (file) => file.endsWith('.custom')
  ]
}
```

## Vite 默认资源类型

Vite 内置支持的资源类型（无需配置）：

```
图片：.png, .jpg, .jpeg, .gif, .webp, .avif, .svg, .ico
字体：.woff, .woff2, .eot, .ttf, .otf
媒体：.mp4, .webm, .ogg, .mp3, .wav, .flac, .aac
其他：.wasm, .pdf, .webmanifest
```

## 生效后的结果示例

### 添加 3D 模型支持

```javascript
// vite.config.js
export default {
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.fbx']
}
```

```javascript
// src/main.js
import modelUrl from './models/car.glb'
import sceneUrl from './models/scene.gltf'

// 使用 Three.js 加载
loader.load(modelUrl, (gltf) => {
  scene.add(gltf.scene)
})
```

### 自定义资源类型

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

### 函数判断

```javascript
// vite.config.js
export default {
  assetsInclude: (filePath) => {
    // 匹配特定目录下的所有文件
    if (filePath.includes('/assets/special/')) {
      return true
    }
    // 匹配特定扩展名
    if (filePath.endsWith('.bin')) {
      return true
    }
    return false
  }
}
```

## 导入语法

### 默认导入（返回 URL）

```javascript
import imgUrl from './image.png'
console.log(imgUrl) // /assets/image-abc123.png
```

### 显式 URL 导入

```javascript
import imgUrl from './image.png?url'
```

### 获取原始内容

```javascript
import rawContent from './data.txt?raw'
```

### 内联为 base64

```javascript
import img from './icon.png?inline'
```

### Worker 脚本

```javascript
import Worker from './worker.js?worker'
```

## 使用场景

### 1. 3D 模型

```javascript
// vite.config.js
export default {
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.hdr', '**/*.exr']
}
```

### 2. 特殊数据格式

```javascript
// vite.config.js
export default {
  assetsInclude: ['**/*.vrm', '**/*.json']  // .json 通常需要单独配置
}
```

### 3. 字体文件

```javascript
// vite.config.js
export default {
  assetsInclude: ['**/*.otf', '**/*.ttf']  // 通常已内置
}
```

### 4. 数据文件

```javascript
// vite.config.js
export default {
  assetsInclude: [
    '**/*.csv',
    '**/*.xml',
    '**/*.yaml',
    '**/*.yml'
  ]
}
```

### 5. 音视频

```javascript
// vite.config.js
export default {
  assetsInclude: [
    '**/*.mov',
    '**/*.avi',
    '**/*.flv'
  ]
}
```

## 注意事项

### 1. 与 build.assetsInlineLimit 配合

```javascript
export default {
  assetsInclude: ['**/*.svg'],
  build: {
    // 小于此值的资源会被内联为 base64
    assetsInlineLimit: 4096  // 4kb
  }
}
```

### 2. 与 publicDir 的区别

| 特性 | assetsInclude | publicDir |
|------|----------------|------------|
| 处理方式 | 被打包处理 | 直接复制 |
| 哈希化 | 自动添加哈希 | 不添加哈希 |
| 引用方式 | import 导入 | 绝对路径引用 |
| 转换 | 可被插件处理 | 不处理 |

```javascript
// public/logo.png → 直接复制，无哈希
// src/assets/logo.png → 打包处理，添加哈希
```

### 3. Glob 模式匹配

```javascript
// ✅ 正确
assetsInclude: ['**/*.gltf']           // 所有 .gltf 文件
assetsInclude: ['src/models/**']      // models 目录下所有文件

// ❌ 错误
assetsInclude: ['*.gltf']             // 缺少 **/
```

### 4. JSON 文件特殊处理

```javascript
// JSON 文件默认有特殊处理（具名导出）
// 如果想作为 URL 导入，需要显式指定
import jsonFile from './data.json?url?url'
```

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `build.assetsInlineLimit` | 影响资源是否被内联为 base64 |
| `build.assetsDir` | 资源输出目录 |
| `publicDir` | 不处理的静态资源目录 |

## 完整示例

### 3D 应用完整配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  // 扩展资源类型
  assetsInclude: [
    '**/*.gltf',
    '**/*.glb',
    '**/*.hdr',
    '**/*.exr',
    '**/*.vrm',
    '**/*.fbx'
  ],

  build: {
    // 3D 资源通常较大，禁用内联
    assetsInlineLimit: 0,

    // 单独输出目录
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
export default defineConfig({
  assetsInclude: [
    // 音频
    '**/*.flac',
    '**/*.wav',
    '**/*.aac',
    // 视频
    '**/*.mov',
    '**/*.avi',
    '**/*.flv',
    '**/*.wmv'
  ],

  build: {
    assetsInlineLimit: 0  // 大文件不内联
  }
})
```

### 自定义类型处理

```javascript
// vite.config.js
export default defineConfig({
  assetsInclude: [
    '**/*.custom',
    (filePath) => {
      // 自定义逻辑：特定目录下的所有文件
      return filePath.startsWith('/src/assets/special/')
    }
  ]
})
```

### 完整资源配置

```javascript
// vite.config.js
export default defineConfig({
  // 额外资源类型
  assetsInclude: [
    '**/*.gltf',
    '**/*.glb',
    '**/*.hdr',
    '**/*.exr'
  ],

  build: {
    // 资源目录
    assetsDir: 'assets',

    // 内联阈值
    assetsInlineLimit: 4096,

    rollupOptions: {
      output: {
        // 资源文件命名
        assetFileNames: 'assets/[name]-[hash][extname]',
        // 图片单独目录
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    }
  }
})
```

## 常见问题

### 问题 1：资源导入失败

**原因**：未配置到 `assetsInclude`

```javascript
// ❌ 报错
import model from './model.gltf'

// ✅ 解决
export default {
  assetsInclude: ['**/*.gltf']
}
```

### 问题 2：资源未被哈希化

**原因**：文件放在 `publicDir` 中

**解决**：移到 `src` 目录并通过 import 导入

```javascript
// public/model.glb → 不哈希化
// src/assets/model.glb + import → 哈希化
```

### 问题 3：Glob 匹配无效

**原因**：Glob 模式不正确

```javascript
// ❌ 错误
assetsInclude: ['*.gltf']

// ✅ 正确
assetsInclude: ['**/*.gltf']
```

## 官方文档

[Shared Config: assetsInclude - Vite 官方文档](https://cn.vitejs.dev/config/shared-options.html#assetsinclude)

[Static Assets - Vite 官方文档](https://cn.vitejs.dev/guide/assets.html)
