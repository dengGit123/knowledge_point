# assetsInclude 配置

## 定义

`assetsInclude` 指定额外的静态资源文件类型。

## 用法

```javascript
// vite.config.js
export default {
  assetsInclude: ['**/*.gltf', '**/*.glb']
}

// 或使用函数
assetsInclude: (file) => file.endsWith('.special')
```

## 作用

- 定义哪些文件应被视为静态资源
- 这些文件会被作为字符串导入，返回 URL
- 扩展默认的资源类型列表

## 默认资源类型

Vite 默认处理以下资源类型：

```
- 图片：.png, .jpg, .jpeg, .gif, .webp, .avif, .svg
- 字体：.woff, .woff2, .eot, .ttf, .otf
- 媒体：.mp4, .webm, .ogg, .mp3, .wav, .flac, .aac
- 其他：.wasm, .pdf, .webmanifest
```

## 使用场景

1. **3D 模型**：`.gltf`、`.glb` 等 3D 资源
2. **特殊格式**：项目特定的资源格式
3. **数据文件**：JSON 以外的数据格式

## 注意事项

- 资源通过 `?url` 或 `?raw` 导入时有不同行为
- 小于 `assetsInlineLimit` 的资源会被 base64 内联
- 使用 Glob 导入时也受此配置影响

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `build.assetsInlineLimit` | 影响资源是否被内联 |
| `publicDir` | 不处理的资源放在 publicDir |

## 示例

```javascript
// 3D 模型资源
export default {
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.fbx']
}

// 使用函数判断
export default {
  assetsInclude: (filePath) => {
    return filePath.endsWith('.myasset') || filePath.includes('/assets/')
  }
}

// 配合使用
export default {
  assetsInclude: ['**/*.abc'],
  build: {
    assetsInlineLimit: 0  // 禁用内联
  }
}

// 在代码中导入
import modelUrl from './model.glbt'
console.log(modelUrl) // /assets/model-abc123.glbt
```

## 导入语法

```javascript
// 默认：返回 URL
import img from './image.png'

// 显式 URL
import img from './image.png?url'

// 获取字符串内容
import txt from './data.txt?raw'

// 内联为 base64
import img from './image.png?inline'

// Worker 脚本
import worker from './worker.js?worker'
```
