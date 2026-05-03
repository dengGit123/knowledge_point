### 1. 安装必要的包
- `@babel/core`、`@babel/preset-env`、`babel-loader`、`core-js`

### 2. 创建 Babel 配置文件
- `babel.config.js`（推荐）
```javascript
module.exports = {
  presets:[
    [
      '@babel/preset-env',
      // 配置项
      {
        useBuiltIns: 'usage', // 按需加载
        corejs: 3, // 使用 core-js 的版本
        targets: {
          /**
           * 配置兼容性目标
           * 可以不用配置，推荐新建一个文件 .browserslistrc
           */
          chrome: '60',
          ie: '11'
        }
      }
    ]
  ]
}
```