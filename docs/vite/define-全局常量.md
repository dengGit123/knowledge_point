# define 配置

## 定义

`define` 定义全局常量替换。

## 用法

```javascript
// vite.config.js
export default {
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),
    __DEV__: 'true',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }
}
```

## 作用

- 在构建时进行字符串替换
- 定义条件编译常量
- 注入全局变量

## 使用场景

1. **版本号**：注入应用版本号
2. **功能开关**：条件编译
3. **环境变量**：传递 Node.js 环境变量
4. **调试信息**：注入调试相关常量

## 注意事项

- 值必须是字符串或会被转换为字符串的表达式
- 如果值是对象或数组，需要使用 `JSON.stringify()`
- 替换是直接文本替换，不是运行时赋值
- TypeScript 项目需要配合类型声明

## 与其他属性的关系

| 属性 | 关系说明 |
|------|----------|
| `envPrefix` | `define` 可以手动注入非前缀环境变量 |
| `mode` | 常与 `mode` 配合做条件编译 |

## 示例

```javascript
// 基本配置
export default {
  define: {
    __VERSION__: JSON.stringify('1.0.0'),
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
}

// TypeScript 类型声明
// global.d.ts
declare const __VERSION__: string
declare const __DEV__: boolean

// 使用
if (__DEV__) {
  console.log('Development mode')
}

// 环境变量注入
export default {
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'http://localhost:3000'
    )
  }
}

// 条件功能
export default {
  define: {
    __ENABLE_ANALYTICS__: JSON.stringify(
      process.env.ENABLE_ANALYTICS === 'true'
    )
  }
}

// 在代码中使用
if (__ENABLE_ANALYTICS__) {
  initAnalytics()
}
```

## 常见模式

```javascript
// 完整的环境变量注入
export default defineConfig(({ mode }) => {
  return {
    define: {
      __APP_ENV__: JSON.stringify(mode),
      __VERSION__: JSON.stringify(process.env.npm_package_version),
      'process.env': JSON.stringify(process.env)
    }
  }
})
```
