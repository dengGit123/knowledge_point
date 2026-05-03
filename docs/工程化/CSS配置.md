### 1. 安装 PostCSS 和 Autoprefixer
```bash
npm install --save-dev postcss autoprefixer
```

### 2. 创建 `postcss.config.js` 文件（推荐）
```js
module.exports = {
  plugins: [
    require('autoprefixer')
  ]
}
```