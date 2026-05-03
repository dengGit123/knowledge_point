### 一、Prettier（https://prettier.nodejs.cn/docs）
* 代码格式化工具

#### 1. 第一步：安装 Prettier
```bash
npm install -D prettier
```

#### 2. 第二步：创建配置文件 `.prettierrc`
（https://prettier.nodejs.cn/docs/options）
```json
{
  "$schema": "https://json.schemastore.org/prettierrc",
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "jsxSingleQuote": true,
  "trailingComma": "none",
  "bracketSpacing": true,
  "objectWrap": "preserve",
  "bracketSameLine": true,
  "arrowParens": "always",
  "htmlWhitespaceSensitivity": "ignore",
  "vueIndentScriptAndStyle": true,
  "singleAttributePerLine": true
}

```

#### 3. 第三步：创建忽略文件 `.prettierignore`
```
node_modules
dist
build
```

#### 4. 第四步：添加运行脚本
* 在 `package.json` 中添加命令
```json
{
  "scripts": {
    "format": "prettier --write ."
  }
}
```

#### 5. 第五步：配置 VS Code
* 1. 安装插件：`Prettier - Code formatter`
* 2. 打开设置
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```
### 二。ESlint9+(https://zh-hans.eslint.org/)
* 主要用来负责代码质量，代码格式让`prettier`处理
#### 1.第一步: 安装依赖
```
# eslint-config-prettier: 关闭ESlint中与Prettier冲突的规则
# eslint-plugin-prettier: 让ESlint能运行Pretter的检查
npm install -D eslint eslint-config-prettier eslint-plugin-prettier
```
#### 2.第二步: 配置ESlint,创建`eslint.config.js` （新的配置方式：扁平化）
```js
// eslint.config.js
import js from '@eslint/js';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
export default [
  //基础js推荐规则
  js.config.recommended,
  //... 其他配置

  //启用Prettier插件(作为ESlint的一个规则运行)
  {
    plguins: {
      pretier:prettierPlugin
    },
    rules:{
      'prettier/prettier':'error' //将格式错误标记为ESlint错误
    }
  }，
  //(必须放在最后面，用于关闭ESlint的样式规则)
  prettierConfig
]
```
#### 3. 第三步: 添加npm脚步
```json
{
  scripts: {
    "lint": "eslint . --ext .js,.vue,.ts --fix",
    "format": "prettier --write ." //格式化项目里所有文件
  }
}
```
#### 4. 第四步: 配置`VS Code`
```json
{
  // 保存时自动修复 ESLint 错误
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
}
```
### 三。TypeScript(https://ts.nodejs.cn/download/)
#### 1. 第一步：安装依赖
```
# typescript: TypeScript 核心库
# @typescript-eslint/parser: 让 ESLint 能解析 TypeScript 的语法
# @typescript-eslint/eslint-plugin: 包含了一系列专为 TypeScript 设计的 ESLint 规则
npm install -D typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin
```
#### 2. 第二步: TypeScript 配置 `tsconfig.json`
```JSON
// tsconfig.json
```
#### 3. 第三步: 配置 ESLint
```js
//eslint.config.js 
import tseslint from 'typescript-eslint';
export default [
  //...
  rules: {
    // 推荐使用的规则集
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      // ...tseslint.configs.recommendedTypeChecked.rules, // 更严格的类型检查
  }
]
```
### 四。集成vue
#### 1. 安装插件(https://eslint.vuejs.org/user-guide/)
```
# eslint-plugin-vue: 官方Vue.js ESLint插件，用于检查.vue文件
npm install --save-dev eslint-plugin-vue
```
#### 2. eslint.config.js配置
```js
import pluginJs from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
// 导入 `typescript-eslint` 插件（ `typescript-eslint/parser` 和 `typescript-eslint/eslint-plugin`）。提供了对 TypeScript 的支持，包括 TS 的解析器和推荐的规则集，用于在 TypeScript 文件中进行 lint 检查。
import tseslint from "typescript-eslint";

export default [
  //... 
  // 引入`eslint-plugin-vue` 插件的基础规则
  ...pluginVue.configs["flat/essential"],
  // 针对 Vue 文件配置
  //为 `.vue` 文件指定了 TypeScript 解析器
  {files: ["**/*.vue"], languageOptions: {parserOptions: {parser: tseslint.parser}}},
]
```
### 注意事项
1. 不要安装 `vite-plugin-prettier`
* 除非有特殊构建需求，否则**不要**在`vite.config.js`中引入`Prettier`插件。这会拖慢开发服务器速度。直接使用编辑器的 **‘保存时格式化’**体验最好
2. TypeScript路径别名
* `tsconfig.json`的`paths`是否配置
* `vite.config.js`的`resolve.alias`的配置
3. 在ESLint配置中，必须最后加载`eslint-config-prettier`
* 正确顺序： 先加载所有业务规则，最后加载`Prettier`配置来‘洗清’冲突项
### VS Code配置
```json
// .vscode/settings.json
{
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "editor.formatOnSave": false, // 关掉保存时自动格式化
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit" // 让ESLint在保存时自动修复
  },
  "eslint.validate": [ // 让 ESLint 检查的文件类型
    "javascript",
    "javascriptreact",
    "typescript", 
    "typescriptreact",
    "vue",
    "html"
  ],
  "typescript.tsdk": "node_modules/typescript/lib" // 使用项目内部的 TypeScript 版本
}
```