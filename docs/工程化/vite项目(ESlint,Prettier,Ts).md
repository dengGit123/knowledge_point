# Vite 构建 Vue3 项目：ESLint / Prettier / TypeScript 分类集成指南

> 📖 官方文档：[Vite 中文官网](https://cn.vitejs.dev/) ｜ [Vue 3 中文官网](https://cn.vuejs.org/)
> 📖 [TypeScript 中文文档](https://ts.nodejs.cn/) ｜ [ESLint 中文文档](https://zh-hans.eslint.org/) ｜ [Prettier 中文文档](https://prettier.nodejs.cn/)
> 📖 [eslint-plugin-vue](https://eslint.vuejs.org/) ｜ [typescript-eslint](https://typescript-eslint.io/)

## 一、概述

本文档讲清楚一件事：**用 Vite 创建一个 Vue3 项目后，怎么分别把 TypeScript、Prettier、ESLint 三个工具集成进来**。

三个工具各司其职、互不替代：

| 工具          | 解决什么问题                 | 一句话职责                       | 管理范围             |
| ------------- | ---------------------------- | -------------------------------- | -------------------- |
| **TypeScript**| 代码写错了吗（类型层面）     | 静态类型检查                     | 类型错误             |
| **ESLint**    | 代码写得好不好（质量层面）   | 代码质量 + 规范检查（可自动修复）| 语法/逻辑/最佳实践   |
| **Prettier**  | 代码长得好不好看（格式层面） | 代码格式化（统一风格）           | 缩进/引号/分号/换行  |

> 💡 **本文的核心特点：分类介绍、能独立集成。** 下面第三、四、五章分别是 TypeScript、Prettier、ESLint 的**独立集成方案**——你可以只看其中一章，只装一个工具就能用起来；三者同时使用时如何避免冲突，见第六章。

**职责划分口诀**：TypeScript 管**类型**，ESLint 管**质量**，Prettier 管**格式**。三者有重叠时，让"更专业"的那个说了算——格式问题交给 Prettier，质量规则交给 ESLint。

---

## 二、前置：用 Vite 创建 Vue3 项目

后面所有集成都在这个项目上进行。

### 1. 创建项目

```bash
# 使用 Vite 创建 Vue3 + TS 项目（推荐）
npm create vite@latest my-vue-app -- --template vue-ts

# 或使用 pnpm
pnpm create vite my-vue-app --template vue-ts

cd my-vue-app
npm install          # 安装依赖
```

> 💡 **提示：** 模板 `vue-ts` 会自动带好 TypeScript 的基础配置（开箱即用）；如果选 `vue`（纯 JS）模板，则需手动集成 TypeScript（见第三章）。

### 2. 项目结构

```
my-vue-app/
├── .vscode/                 # VS Code 配置（团队共享，建议提交 Git）
│   ├── settings.json        # 编辑器设置
│   └── extensions.json      # 推荐插件清单
├── public/                  # 静态资源（原样拷贝，不经过打包）
├── src/
│   ├── assets/              # 需要被打包处理的资源
│   ├── components/          # 组件
│   ├── App.vue              # 根组件
│   └── main.ts              # 入口文件
├── env.d.ts                 # TS 声明文件（声明 .vue 文件和环境变量类型）
├── index.html               # 入口 HTML
├── tsconfig.json            # TypeScript 配置（根）
├── tsconfig.app.json        # TypeScript 配置（应用代码 src）
├── tsconfig.node.json       # TypeScript 配置（Node 环境，如 vite.config.ts）
├── vite.config.ts           # Vite 配置
└── package.json             # 依赖和脚本
```

### 3. Vite 与 TypeScript 的关系（重要）

> ⚠️ **注意：Vite 本身不做类型检查。**

- Vite 内部用 **esbuild** 把 `.ts` 文件**转译**成 JS（只去掉类型，不做校验），速度极快。
- 真正的**类型检查**由 **`vue-tsc`**（Vue 官方的 TS 检查器）或 **`tsc`** 完成。

所以 `package.json` 里的构建脚本通常写成：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",   // ✅ 先类型检查，通过后再打包
    "preview": "vite preview"
  }
}
```

---

## 三、独立集成 TypeScript（类型检查）

> 本章目标：让项目支持 TypeScript。**只装 TypeScript 一个工具就能用**，与 ESLint/Prettier 无关。

### 1. 它解决什么问题

TypeScript 在**写代码时**就能发现类型错误（比如把 `string` 当 `number` 用），并带来智能提示。类型检查是"**写错了吗**"的问题。

### 2. 安装

| 依赖包        | 作用                              | 是否必须               |
| ------------- | --------------------------------- | ---------------------- |
| `typescript`  | TypeScript 编译器，负责类型检查   | ✅ 必须（核心）        |
| `vue-tsc`     | Vue 官方的类型检查器，能检查 .vue | ✅ 必须（Vue 项目）    |

```bash
# 如果用的是 vue-ts 模板，这两个已经自带；否则手动安装：
npm install -D typescript vue-tsc
```

> 💡 **提示：** `@typescript-eslint/parser` 和 `@typescript-eslint/eslint-plugin` 是 **ESLint 检查 TS 的依赖**，属于 ESLint 那一章，TypeScript 本身用不到，这里**不需要装**。

### 3. 必要文件

#### ① `tsconfig.json`（必须）—— 主配置，统筹全局

```jsonc
{
  "files": [],
  // 通过 references 引用子配置，分而治之
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

#### ② `tsconfig.app.json`（必须）—— 应用代码（src）的配置

```jsonc
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",  // 继承 Vue 官方推荐基础配置
  "include": ["env.d.ts", "src/**/*", "src/**/*.vue"],  // 要检查的文件
  "exclude": ["src/**/__tests__/*"],             // 排除测试文件
  "compilerOptions": {
    "composite": true,                           // 允许被 references 引用
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",

    // === 路径别名 ===
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]                         // @ 指向 src 目录
    }
  }
}
```

#### ③ `tsconfig.node.json`（必须）—— Node 环境配置（vite.config.ts 等）

```jsonc
{
  "extends": "@tsconfig/node20/tsconfig.json",   // 继承 Node20 推荐配置
  "include": ["vite.config.*"],                  // 检查 Vite 配置文件
  "compilerOptions": {
    "composite": true,
    "noEmit": true,                              // 只检查不输出编译文件（Vite 负责打包）
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "types": ["node"]                            // 注入 Node 类型
  }
}
```

#### ④ `env.d.ts`（必须）—— 让 TS 认识 `.vue` 文件和环境变量

```typescript
/// <reference types="vite/client" />

// ✅ 告诉 TS：导入 .vue 文件时，它的类型是一个 Vue 组件
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>;
  export default component;
}

// ✅ 给自定义环境变量补上类型提示（否则 import.meta.env.VITE_XXX 报错）
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_BASE_URL: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### 4. 验证

```bash
# 运行类型检查（不打包）
npx vue-tsc --noEmit
```

### 5. TypeScript 独立使用的 VS Code 配置

只需确保装了 **Vue - Official**（原 Volar）插件，VS Code 会自动读取项目的 `tsconfig.json` 做类型检查和提示。

```jsonc
// .vscode/settings.json（TS 相关部分）
{
  "typescript.tsdk": "node_modules/typescript/lib",  // ✅ 用项目里的 TS 版本，而非 VS Code 自带的
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

> ⚠️ **注意：** 路径别名 `@` 要在 `tsconfig.app.json` 的 `paths` 和 `vite.config.ts` 的 `resolve.alias` **两处都配**，缺一个就会"编辑器不报错但运行找不到"或反之。

---

## 四、独立集成 Prettier（代码格式化）

> 本章目标：统一代码风格（缩进、引号、分号……）。**只装 Prettier 一个工具就能用**，与 ESLint 无关。

### 1. 它解决什么问题

Prettier 是一个**"有主见"的格式化工具**——你不需要纠结该用单引号还是双引号，它按统一规则帮你格式化，团队所有人的代码风格自动一致，再也不用在 Code Review 里争论格式。格式是"**好不好看**"的问题。

### 2. 安装

| 依赖包                   | 作用                                          | 是否必须               |
| ------------------------ | --------------------------------------------- | ---------------------- |
| `prettier`               | 格式化核心                                    | ✅ 必须（核心）        |
| `eslint-config-prettier` | 关闭 ESLint 中与 Prettier 冲突的格式规则      | 🔗 配合 ESLint 时才需要|
| `eslint-plugin-prettier` | 把 Prettier 检查作为一条 ESLint 规则运行      | 🔗 配合 ESLint 时才需要（可选）|

```bash
# 只用 Prettier，装这一个就够：
npm install -D prettier

# 如果之后要和 ESLint 配合，再补这两个：
npm install -D eslint-config-prettier eslint-plugin-prettier
```

> 💡 **提示：** `eslint-config-prettier` 和 `eslint-plugin-prettier` 属于"ESLint 与 Prettier 集成"的范畴。**单独用 Prettier 时不需要它们**，本章先讲独立用法，集成见第六章。

### 3. 必要文件

#### ① `.prettierrc`（必须）—— 格式化规则

```jsonc
{
  "$schema": "https://json.schemastore.org/prettierrc",  // 让编辑器有配置提示

  // === 缩进/换行 ===
  "printWidth": 100,                 // 每行最多 100 字符，超过自动换行
  "tabWidth": 2,                     // 一个缩进 = 2 个空格
  "useTabs": false,                  // 用空格而非 tab
  "endOfLine": "lf",                 // 换行符统一为 LF（跨平台一致）

  // === 标点符号 ===
  "semi": true,                      // 语句末尾加分号
  "singleQuote": true,               // 字符串用单引号
  "trailingComma": "none",           // 尾随逗号：none 不加 / es5 / all
  "bracketSpacing": true,            // 对象大括号内加空格 { foo: bar }
  "arrowParens": "always",           // 箭头函数参数始终加括号 (x) => x

  // === HTML/Vue ===
  "htmlWhitespaceSensitivity": "ignore",  // HTML 空白敏感度
  "vueIndentScriptAndStyle": false,  // .vue 中 <script>/<style> 不额外缩进
  "singleAttributePerLine": true     // 多属性时每行一个属性
}
```

**常见配置效果对比：**

```javascript
// semi: true, singleQuote: true, trailingComma: 'none'
const obj = {
  name: '张三',
  age: 18
};

// semi: false, singleQuote: false, trailingComma: 'all'
const obj = {
  name: "张三",
  age: 18,
}
```

#### ② `.prettierignore`（必须）—— 指定不格式化的文件

```
# 依赖和锁文件
node_modules/
pnpm-lock.yaml
package-lock.json

# 构建产物
dist/
build/

# 配置文件（通常不需要格式化）
*.config.js
*.config.ts

# 静态资源
public/
```

### 4. 添加脚本

```jsonc
// package.json
{
  "scripts": {
    "format": "prettier --write .",                       // ✅ 格式化全部文件
    "format:check": "prettier --check ."                  // 只检查不修改（CI 用）
  }
}
```

```bash
npm run format          # 格式化整个项目
npm run format:check    # 仅检查（CI 流水线里用）
```

### 5. Prettier 独立使用的 VS Code 配置

只需装 **Prettier - Code formatter** 插件（`esbenp.prettier-vscode`），然后开启"保存时格式化"：

```jsonc
// .vscode/settings.json（Prettier 相关部分）
{
  "editor.formatOnSave": true,                              // ✅ 保存时自动格式化
  "editor.defaultFormatter": "esbenp.prettier-vscode",      // ✅ 指定 Prettier 为默认格式化器
  "[javascript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[typescript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[vue]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[json]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[css]": { "editor.defaultFormatter": "esbenp.prettier-vscode" }
}
```

> 💡 **提示：** 独立用 Prettier 时，保存即格式化，体验最好，**不要**把它做成 Vite 插件塞进 `vite.config.ts`——那会拖慢开发服务器。

---

## 五、独立集成 ESLint（代码质量）

> 本章目标：检查代码质量问题（未使用变量、隐式 any、`var`、`==`……）并支持自动修复。**只装 ESLint（+ Vue 解析器）就能用**。

### 1. 它解决什么问题

ESLint 检查的是**代码质量**和**潜在 bug**，比如：定义了却没用的变量、用 `var` 而非 `let/const`、`==` 隐式类型转换、`console.log` 残留等。它能帮你避免低级错误、统一编码规范。质量是"**写得好不好**"的问题。

> ⚠️ **注意：** ESLint 9 默认使用**扁平化配置（Flat Config）**，配置文件是 `eslint.config.js`（数组形式），**旧的 `.eslintrc.*` 已废弃**。本文所有配置基于 ESLint 9。

### 2. 安装

| 依赖包                              | 作用                                       | 是否必须                 |
| ----------------------------------- | ------------------------------------------ | ------------------------ |
| `eslint`                            | ESLint 核心                                | ✅ 必须                  |
| `@eslint/js`                        | ESLint 官方 JS 推荐规则集                  | ✅ 必须                  |
| `eslint-plugin-vue`                 | Vue 专用规则 + `.vue` 解析器（二合一）     | ✅ 必须（Vue 项目）      |
| `typescript-eslint`                 | TS 解析器 + TS 规则的整合包                | 🔗 项目用 TS 才需要      |
| `@typescript-eslint/parser`         | 让 ESLint 能解析 TS 语法                   | 🔗 用 TS 才需要（已被 typescript-eslint 整合包包含）|
| `@typescript-eslint/eslint-plugin`  | TS 专用规则集                              | 🔗 用 TS 才需要（同上）  |
| `globals`                           | 提供浏览器/Node 全局变量定义               | ✅ 推荐                  |

```bash
# 最小可用（JS + Vue 项目）：
npm install -D eslint @eslint/js eslint-plugin-vue globals

# 如果项目用 TypeScript，再加：
npm install -D typescript-eslint
```

> 💡 **提示：** 新版 `typescript-eslint` 是一个**整合包**，已经包含 `@typescript-eslint/parser` 和 `@typescript-eslint/eslint-plugin`，无需再单独安装那两个（旧版才需要）。

### 3. 必要文件

#### `eslint.config.js`（必须）—— 扁平化配置数组

下面是**纯 ESLint（JS + Vue，不含 TS）**的最小配置：

```javascript
// eslint.config.js
import js from '@eslint/js';               // 官方 JS 推荐规则
import pluginVue from 'eslint-plugin-vue';  // Vue 规则 + 解析器
import globals from 'globals';              // 全局变量定义

export default [
  // ===== 1. 全局忽略（替代 .eslintignore）=====
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js']
  },

  // ===== 2. JS 基础推荐规则 =====
  js.configs.recommended,

  // ===== 3. Vue 规则（flat/essential 是最基础的规则集）=====
  ...pluginVue.configs['flat/essential'],

  // ===== 4. 全局自定义规则 =====
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }  // 声明浏览器和 Node 全局变量
    },
    rules: {
      'no-console': 'warn',                  // console 警告
      'no-debugger': 'warn',                 // debugger 警告
      'no-var': 'error',                     // 禁止 var
      'prefer-const': 'error',              // 优先用 const
      'vue/multi-word-component-names': 'off' // 允许单词组件名（如 App.vue）
    }
  }
];
```

> 💡 **提示：** 扁平化配置是一个**数组**，**从上到下**顺序执行、后者覆盖前者。所以"关闭冲突规则"的配置一定要放在最后（见第六章）。

### 4. 让 ESLint 检查 TypeScript（可选）

如果项目用了 TS，在上述数组中追加 TS 相关项：

```javascript
import tseslint from 'typescript-eslint';

export default [
  // ...前面的 ignores、js.configs.recommended 等

  // ✅ 展开 TS 推荐规则集
  ...tseslint.configs.recommended,

  // ✅ 让 .vue 文件的 <script lang="ts"> 用 TS 解析器
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser   // Vue 解析器内部再用 TS 解析器解析 <script>
      }
    }
  }
];
```

### 5. 添加脚本

```jsonc
// package.json
{
  "scripts": {
    "lint": "eslint . --fix",        // ✅ 检查并自动修复
    "lint:check": "eslint ."         // 只检查不修复（CI 用）
  }
}
```

> ⚠️ **注意（修正常见错误）：** ESLint 9 扁平化配置中，文件类型由配置对象的 `files` 字段匹配，**`--ext` 参数已被废弃**。不要再写 `eslint . --ext .js,.vue,.ts`，直接 `eslint .` 即可。

```bash
npm run lint          # 检查并自动修复
npm run lint:check    # 仅检查
```

### 6. ESLint 独立使用的 VS Code 配置

装 **ESLint** 插件（`dbaeumer.vscode-eslint`），开启"保存时自动修复"：

```jsonc
// .vscode/settings.json（ESLint 相关部分）
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"   // ✅ 保存时自动修复 ESLint 能修的问题
  },
  "eslint.validate": ["javascript", "typescript", "vue"]  // 让 ESLint 检查这些文件
}
```

> 💡 **提示：** `source.fixAll.eslint` 的值 `"explicit"` 是新版 VS Code 推荐写法（旧版用 `true`）。

---

## 六、三者同时使用：解决冲突（关键）

当 ESLint 和 Prettier 同时存在，它们会**打架**：ESLint 有一堆格式规则（如 `quotes`、`semi`），Prettier 也有格式规则，两者不一致就会"保存时 ESLint 改一遍、Prettier 又改一遍"，甚至互相冲突报错。

### 1. 解决思路：明确分工

| 关注点 | 交给谁         | 怎么做                                  |
| ------ | -------------- | --------------------------------------- |
| 格式   | **Prettier**   | 用 `eslint-config-prettier` 关掉 ESLint 的格式规则 |
| 质量   | **ESLint**     | ESLint 只保留质量规则                   |

### 2. 两个集成包的作用

| 依赖包                   | 作用                                          | 必须？ | 推荐？ |
| ------------------------ | --------------------------------------------- | ------ | ------ |
| `eslint-config-prettier` | 关闭 ESLint 所有与 Prettier 冲突的格式规则    | ✅ 是  | 强烈推荐 |
| `eslint-plugin-prettier` | 把 Prettier 当成一条 ESLint 规则来跑          | ❌ 否  | 可选（见下方说明） |

> 💡 **现代推荐做法（只装 eslint-config-prettier）：**
>
> - 让 **Prettier 单独负责格式**（通过 `npm run format` 或编辑器保存格式化）。
> - 让 **ESLint 只管质量**，用 `eslint-config-prettier` 把它的格式规则全关掉。
> - **不装** `eslint-plugin-prettier`（官方也已不再推荐把格式检查混进 ESLint，会让 ESLint 变慢）。
>
> 这种"Prettier 管格式 + ESLint 管质量，井水不犯河水"的分工最清晰。

### 3. 完整的 `eslint.config.js`（三者集成版）

```javascript
// eslint.config.js  ——  TypeScript + Vue + ESLint + Prettier 集成版
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import prettierConfig from 'eslint-config-prettier';  // ✅ 关闭冲突规则
import globals from 'globals';

export default [
  // 1. 全局忽略
  { ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.ts'] },

  // 2. JS 基础规则
  js.configs.recommended,

  // 3. TypeScript 规则
  ...tseslint.configs.recommended,

  // 4. Vue 规则
  ...pluginVue.configs['flat/essential'],

  // 5. .vue 文件用 TS 解析器解析 <script lang="ts">
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser }
    }
  },

  // 6. 自定义规则（只管质量，不管格式）
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node }
    },
    rules: {
      // —— TypeScript ——
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',         // 以 _ 开头的参数不报未使用
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',  // 用 any 时警告

      // —— Vue ——
      'vue/multi-word-component-names': 'off',

      // —— 通用质量 ——
      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-var': 'error',
      'prefer-const': 'error'
    }
  },

  // 7. ✅ 关闭与 Prettier 冲突的格式规则 —— 必须放在最后！
  prettierConfig
];
```

> ⚠️ **注意：** `prettierConfig`（`eslint-config-prettier`）**必须放在数组最后**。因为它的工作是"把前面的格式规则关掉"，放在前面会被后面的规则重新打开，就失效了。

### 4. 三者集成后的 npm 脚本汇总

```jsonc
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "lint": "eslint . --fix",          // ESLint 检查+修复质量
    "format": "prettier --write .",    // Prettier 格式化
    "format:check": "prettier --check ."
  }
}
```

---

## 七、VS Code 如何配合使用

VS Code 配合得好，能实现"**保存即自动格式化 + 自动修复**"的无感体验。

### 1. 必装插件（`extensions.json`）

创建 `.vscode/extensions.json`，团队成员打开项目时 VS Code 会提示安装：

```jsonc
{
  "recommendations": [
    "Vue.volar",                   // ✅ Vue 3 官方语言支持（原名 Volar，现 Vue - Official）
    "dbaeumer.vscode-eslint",      // ✅ ESLint 支持（代码里波浪线提示 + 自动修复）
    "esbenp.prettier-vscode",      // ✅ Prettier 格式化支持
    "usernamehw.errorlens"         // 推荐：把错误信息直接显示在行末
  ]
}
```

> 💡 **提示：** Vue3 用 **Vue - Official**（`Vue.volar`，原 Volar）。**不要**再用 Vetur（那是 Vue2 的，已停止维护）。

### 2. 推荐设置（`settings.json`）

`.vscode/settings.json` 完整配置（含格式化器指定 + 保存自动修复）：

```jsonc
{
  // ===== 编辑器基础 =====
  "editor.tabSize": 2,                  // 缩进 2 空格
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,    // 不自动猜测缩进（用统一设置）
  "files.eol": "\n",                    // 换行符统一 LF
  "files.insertFinalNewline": true,     // 文件末尾留一个空行
  "files.trimTrailingWhitespace": true, // 删除行尾空格

  // ===== Prettier（管格式）=====
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[typescript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[vue]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[json]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[css]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },

  // ===== ESLint（管质量，保存时自动修复）=====
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": ["javascript", "typescript", "vue"],
  "eslint.format.enable": false,        // ✅ 关闭 ESLint 的格式化能力，格式交给 Prettier

  // ===== TypeScript =====
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### 3. `.editorconfig`（统一不同编辑器）

跨编辑器（VS Code、WebStorm…）统一基础风格，推荐提交到 Git：

```ini
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false   # Markdown 保留行尾空格（用于换行）
```

### 4. 保存时的执行顺序（理解"双修"现象）

配置了上面的 `settings.json` 后，按 `Ctrl+S` / `Cmd+S` 保存时 VS Code 会**依次**做：

```
保存文件
   │
   ├──▶ 1. Prettier 格式化（formatOnSave）        → 处理格式
   │
   └──▶ 2. ESLint 自动修复（codeActionsOnSave）   → 处理质量 + 可修的问题
```

> ⚠️ **注意（避免"保存时格式化两次"）：** 上面配置里设了 `"eslint.format.enable": false`，就是为了让**格式只由 Prettier 一个人负责**，避免 ESLint 和 Prettier 重复格式化导致光标跳动。

---

## 八、独立集成矩阵与必要文件清单

### 1. 独立集成速查表

| 你想要的能力     | 最少要装什么                                              | 必要文件                          |
| ---------------- | --------------------------------------------------------- | --------------------------------- |
| **只要类型检查** | `typescript` + `vue-tsc`                                  | `tsconfig*.json`、`env.d.ts`      |
| **只要格式化**   | `prettier`                                                | `.prettierrc`、`.prettierignore`  |
| **只要代码质量** | `eslint` + `@eslint/js` + `eslint-plugin-vue`             | `eslint.config.js`                |
| **质量 + TS**    | 上面 + `typescript-eslint`                                | `eslint.config.js`（加 TS 配置）  |
| **三者全要**     | 全部 + `eslint-config-prettier`                           | 全部文件                          |

### 2. 所有必要文件清单

| 文件                    | 归属         | 作用                       | 必须？ |
| ----------------------- | ------------ | -------------------------- | ------ |
| `tsconfig.json`         | TypeScript   | 主配置（统筹）             | ✅      |
| `tsconfig.app.json`     | TypeScript   | 应用代码配置               | ✅      |
| `tsconfig.node.json`    | TypeScript   | Node 环境配置              | ✅      |
| `env.d.ts`              | TypeScript   | `.vue` 和环境变量类型声明  | ✅      |
| `.prettierrc`           | Prettier     | 格式化规则                 | ✅      |
| `.prettierignore`       | Prettier     | 不格式化的文件             | ✅      |
| `eslint.config.js`      | ESLint       | 扁平化配置                 | ✅      |
| `.editorconfig`         | 通用         | 跨编辑器基础风格           | ⚪ 推荐 |
| `.vscode/settings.json`| VS Code      | 编辑器设置                 | ⚪ 推荐 |
| `.vscode/extensions.json`| VS Code    | 推荐插件清单               | ⚪ 推荐 |

---

## 九、常见问题与注意事项

### 1. 路径别名 `@` 失效

**现象：** `import X from '@/components/X.vue'` 编辑器报红或运行报错。

**解决：** 必须在**两个地方**都配置：

```jsonc
// ① tsconfig.app.json —— 让 TS 和编辑器认识 @
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

```typescript
// ② vite.config.ts —— 让 Vite 打包时认识 @
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  }
});
```

### 2. ESLint 和 Prettier 冲突（保存后格式又变回去）

**解决：** 确保 `eslint-config-prettier` 放在 `eslint.config.js` **数组最后**，并设 `"eslint.format.enable": false`，让格式完全交给 Prettier。

### 3. `.vue` 文件报 `Parsing error`

**现象：** ESLint 报 `Parsing error: Unexpected token <`。

**解决：** 引入 `eslint-plugin-vue` 并展开 `...pluginVue.configs['flat/essential']`，它会自带 `.vue` 解析器。

### 4. `import.meta.env.VITE_XXX` 报类型错误

**解决：** 在 `env.d.ts` 中声明 `ImportMetaEnv` 接口（见第三章 3.④）。

### 5. ESLint 9 报 `--ext` 不识别 / 配置不生效

**解决：** ESLint 9 是扁平化配置，**删除 `--ext` 参数**，直接 `eslint .`；配置文件用 `eslint.config.js`（数组），不要用旧的 `.eslintrc.*`。

### 6. 不要把 Prettier 做成 Vite 插件

**不要**装 `vite-plugin-prettier` 之类塞进 `vite.config.ts`——它会**拖慢开发服务器**。直接用编辑器"保存时格式化"或 `npm run format` 体验最好。

### 7. 类型检查和打包分离

构建脚本 `vue-tsc && vite build` 表示**先做类型检查，通过后才打包**。如果嫌 `build` 慢，CI 里可单独跑 `npm run lint:check && npm run format:check && vue-tsc`。

---

## 十、总结

### 三个工具的职责一句话

| 工具         | 管什么   | 触发方式               |
| ------------ | -------- | ---------------------- |
| TypeScript   | **类型** | 编辑器实时 + `vue-tsc` |
| ESLint       | **质量** | 编辑器波浪线 + `npm run lint` |
| Prettier     | **格式** | 保存自动 + `npm run format` |

### 集成关键原则

1. **分类独立**：三者各自独立可用，最小依赖装齐就能跑。
2. **明确分工**：Prettier 管格式、ESLint 管质量、TS 管类型。
3. **`eslint-config-prettier` 必须放最后**，关闭冲突格式规则。
4. **路径别名 `@` 要在 `tsconfig` 和 `vite.config` 双配**。
5. **VS Code 设 `eslint.format.enable: false`**，格式只交给 Prettier，避免"双修"。
6. **不要把 Prettier 做成 Vite 插件**，编辑器保存格式化体验最佳。

### 推荐的最小集成组合（开箱即用）

```bash
# Vue3 + TS 项目（vue-ts 模板已含 TS）后，补装 ESLint + Prettier：
npm install -D eslint @eslint/js eslint-plugin-vue typescript-eslint globals
npm install -D prettier eslint-config-prettier
```

> 💡 **一句话记忆：** Vite 建项目 → TypeScript 自带类型 → Prettier 接管格式 → ESLint 接管质量 → `eslint-config-prettier` 垫底消冲突 → VS Code 保存即自动格式化+修复。
