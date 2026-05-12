# json 配置

## 定义

`json` 配置 JSON 文件的解析行为。

## 用法

```javascript
// vite.config.js
export default {
  json: {
    namedExports: true,
    stringify: false
  }
}
```

## 子属性详解

### namedExports

是否启用具名导出，默认 `true`。

```javascript
namedExports: true   // 支持具名导出
namedExports: false  // 仅支持默认导出
```

### stringify

是否将 JSON 转为 `export default JSON.stringify(...)`，默认 `false`。

```javascript
stringify: true
```

## 作用

- 控制 JSON 文件的导入方式
- 优化 JSON 处理性能

## 使用场景

1. **具名访问**：使用 `namedExports: true` 实现具名导入
2. **性能优化**：大型 JSON 文件使用 `stringify: true`
3. **兼容性**：某些工具需要特定格式

## 注意事项

- `namedExports: false` 时只能使用默认导入
- `stringify: true` 后 JSON 会被序列化，运行时需要 `JSON.parse()`

## 示例

```javascript
// data.json
{
  "name": "value",
  "items": [1, 2, 3]
}

// 使用具名导出（默认）
export default {
  json: {
    namedExports: true
  }
}

// import { name, items } from './data.json'
console.log(name, items)

// 仅默认导出
export default {
  json: {
    namedExports: false
  }
}

// import data from './data.json'
// console.log(data.name)

// 序列化模式
export default {
  json: {
    stringify: true
  }
}

// import data from './data.json'
// const parsed = JSON.parse(data)
```
