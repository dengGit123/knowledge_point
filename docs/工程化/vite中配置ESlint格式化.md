
### 1. 在vite中使用`eslint` + `Prettier`
- 1. 安装依赖`eslint`:
*  npm install `eslint` `vite-plugin-eslint` --save-dev
- 2. 安装依赖`prettier`:
* npm install `prettier` `eslint-config-prettier` `eslint-plugin-prettier` --save-dev
### 2 .eslintrt.js
```js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', //TypeScript项目
    'plugin:vue/vue3-recommended', //vue3项目
    // 'plugin:prettier/recommended' 实际上做了三件事
    //3.启用eslint-plugin-prettier
    //2.设置prettier/prettier规则为"error"
    // 3.扩展eslint-config-prettier（关闭与Prettier冲突的规则）
    'plugin:prettier/recommended', // 必须放在最后;确保将Prettier配置放在extends数组的最后，这样Prettier的规则可以覆盖ESLint中冲突的规则
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    ...
  }
}
```
### 3. .prettierrc.js
```
// .prettierrc.js
module.exports = {
  // 一行最多 80 字符
  printWidth: 80,
  // 使用 2 个空格缩进
  tabWidth: 2,
  // 不使用 tab 缩进，而使用空格
  useTabs: false,
  // 行尾需要有分号
  semi: true,
  // 使用单引号代替双引号
  singleQuote: true,
  // 对象的 key 仅在必要时用引号
  quoteProps: 'as-needed',
  // jsx 不使用单引号，而使用双引号
  jsxSingleQuote: false,
  // 尾随逗号
  trailingComma: 'es5',
  // 大括号内的首尾需要空格
  bracketSpacing: true,
  // jsx 标签的反尖括号需要换行
  jsxBracketSameLine: false,
  // 箭头函数，只有一个参数的时候，也需要括号
  arrowParens: 'always',
  // 每个文件格式化的范围是文件的全部内容
  rangeStart: 0,
  rangeEnd: Infinity,
  // 不需要写文件开头的 @prettier
  requirePragma: false,
  // 不需要自动在文件开头插入 @prettier
  insertPragma: false,
  // 使用默认的折行标准
  proseWrap: 'preserve',
  // 根据显示样式决定 html 要不要折行
  htmlWhitespaceSensitivity: 'css',
  // 换行符使用 lf
  endOfLine: 'lf'
};
```
### 4. 添加忽略文件
- #### 1. .eslintignore
```
node_modules/
dist/
*.min.js
coverage/
*.config.js
```
-  #### 2. .prettierignore
```
// .prettierignore
# 忽略目录
node_modules/
dist/
build/
coverage/

# 忽略文件
*.log
*.min.js
*.min.css

# 忽略特定文件
package-lock.json
yarn.lock
pnpm-lock.yaml

# 忽略配置文件
*.config.js
*.config.ts
vite.config.*

# 忽略文档文件
*.md
*.txt

# 忽略图片资源
*.png
*.jpg
*.jpeg
*.gif
*.svg
```
### 5. 在开发时自动修复`ESLint`(可选)
* 在开发服务器运行时，`ESLint` 错误将会在控制台显示，并且保存时自动修复
- 安装 `npm install vite-plugin-eslint --save-dev`
```js
  //vite.config.js
  import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import eslintPlugin from 'vite-plugin-eslint'

export default defineConfig({
  plugins: [vue(), eslintPlugin(
    {
  cache: true, // 启用缓存提高性能
  fix: true, // 自动修复
  include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
  exclude: ['node_modules', 'dist'],
  formatter: 'stylish', // 格式化输出
  emitWarning: true, // 开发时显示警告
  emitError: true, // 构建时错误会失败
  failOnWarning: false, // 警告不导致构建失败
  failOnError: true, // 错误导致构建失败
}
  )],
})
  ```  
### 6. package.json 脚本(可选)
```json
{
  "scripts": {
    "build":"npm run lint && vite build",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx,.vue",
    "format": "prettier --write ."
  }
}
```
### 7.编辑器集成
- 1. 安装 eslint
- 2. Preitter-Code formatter
```
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.stylelint": true
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ]
}
```
### 8.Git Hooks 配置
- #### 1. 使用 husky
* 1. 安装husky
* npm install --save-dev `husky`
* 2. 执行命令生成`.husky`目录
* npx husky install
* 3. 生成`pre-commit`文件: `git commit`的时候会执行的命令
* npm husky add .husky/pre-commit 'npm run lint'