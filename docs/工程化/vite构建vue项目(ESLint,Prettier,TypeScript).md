# Vite + Vue 项目集成 ESLint、Prettier、TypeScript 完整指南

## 目录
- [一、项目初始化](#一项目初始化)
- [二、TypeScript 配置](#二typescript-配置)
- [三、Prettier 配置](#三prettier-配置)
- [四、ESLint 配置](#四eslint-配置)
- [五、Vue 支持](#五vue-支持)
- [六、完整配置示例](#六完整配置示例)
- [七、VS Code 配置](#七vs-code-配置)
- [八、常见问题](#八常见问题)

---

## 一、项目初始化

### 1. 创建 Vite + Vue + TypeScript 项目

```bash
# 使用 TypeScript 模板创建项目
npm create vite@latest my-vue-app -- --template vue-ts

# 或使用 pnpm
pnpm create vite my-vue-app --template vue-ts

# 进入项目目录
cd my-vue-app

# 安装依赖
npm install
```

### 2. 项目结构说明

```
my-vue-app/
├── .vscode/                  # VS Code 配置目录
│   ├── settings.json         # 项目级别的编辑器设置
│   └── extensions.json       # 推荐安装的插件列表
├── public/                   # 静态资源目录
│   └── vite.svg
├── src/                      # 源代码目录
│   ├── assets/               # 资源文件
│   ├── components/           # 组件目录
│   ├── App.vue              # 根组件
│   └── main.ts              # 入口文件
├── .eslintrc.cjs            # ESLint 配置（旧版，已废弃）
├── eslint.config.js         # ESLint 配置（新版，ESLint 9+）
├── .prettierrc              # Prettier 配置文件
├── .prettierignore          # Prettier 忽略文件配置
├── .editorconfig            # 编辑器配置（统一不同编辑器的编码风格）
├── tsconfig.json            # TypeScript 配置文件
├── tsconfig.node.json       # TypeScript 配置（Node.js 环境）
├── tsconfig.app.json        # TypeScript 配置（应用代码）
├── vite.config.ts           # Vite 配置文件
├── package.json             # 项目依赖和脚本
├── package-lock.json        # 依赖版本锁定文件
└── README.md                # 项目说明文档
```

---

## 二、TypeScript 配置

### 1. 安装依赖

```bash
# TypeScript 核心（vue-ts 模板已包含）
npm install -D typescript

# TypeScript ESLint 支持
npm install -D @typescript-eslint/parser
npm install -D @typescript-eslint/eslint-plugin
```

### 2. 依赖详解

| 依赖包 | 作用 | 必需性 |
|--------|------|--------|
| `typescript` | TypeScript 编译器核心，负责类型检查和编译 | ✅ 必需 |
| `@typescript-eslint/parser` | ESLint 的解析器，让 ESLint 能理解 TypeScript 语法 | ✅ 必需 |
| `@typescript-eslint/eslint-plugin` | TypeScript 专用的 ESLint 规则集，包含 TS 最佳实践规则 | ✅ 必需 |

### 3. tsconfig.json 配置

**文件作用：** TypeScript 编译器的主配置文件，控制 TS 的编译行为和类型检查规则。

```json
{
  // 继承基础配置
  "extends": "@vue/tsconfig/tsconfig.dom.json",

  "compilerOptions": {
    // === 编译目标 ===
    "target": "ES2020",              // 编译目标 ECMAScript 版本
    "useDefineForClassFields": true, // 使用 class 字段定义标准语义

    // === 模块配置 ===
    "module": "ESNext",              // 使用最新模块系统
    "lib": ["ES2020", "DOM", "DOM.Iterable"],  // 包含的类型声明库
    "skipLibCheck": true,            // 跳过 .d.ts 文件的类型检查，加快编译

    // === 模块解析（Bundler 模式） ===
    "moduleResolution": "bundler",   // 使用 bundler 模式解析模块（适合 Vite）
    "allowImportingTsExtensions": true,  // 允许直接导入 .ts 文件
    "resolveJsonModule": true,       // 允许导入 JSON 文件
    "isolatedModules": true,         // 每个文件作为独立模块处理（Vite 要求）
    "noEmit": true,                  // 不生成编译输出文件（由 Vite 处理）
    "jsx": "preserve",               // 保留 JSX 语法（由 Vue 处理）

    // === 类型检查（严格模式） ===
    "strict": true,                  // 启用所有严格类型检查选项
    "noUnusedLocals": true,          // 检查未使用的局部变量
    "noUnusedParameters": true,      // 检查未使用的函数参数
    "noFallthroughCasesInSwitch": true,  // 检查 switch 语句中的 fallthrough
    "noImplicitReturns": true,       // 函数所有分支必须有返回值
    "noUncheckedIndexedAccess": true,  // 索引访问时添加 undefined 检查

    // === 路径别名 ===
    "baseUrl": ".",                  // 解析非相对模块的基础路径
    "paths": {
      "@/*": ["./src/*"]             // @ 符号映射到 src 目录
    }
  },

  // === 包含的文件 ===
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "src/**/*.vue"
  ],

  // === 引用其他配置文件 ===
  "references": [
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.app.json" }
  ]
}
```

**配置项详解：**

- **target**: 指定编译后的 JS 版本，`ES2020` 支持现代浏览器特性
- **module**: 模块系统，`ESNext` 支持最新的模块特性
- **moduleResolution**: 模块解析策略，`bundler` 是专为构建工具设计的模式
- **strict**: 启用严格模式，包含多个子选项（noImplicitAny、strictNullChecks 等）
- **paths**: 路径映射，可以用 `@/components/Header.vue` 代替相对路径

### 4. tsconfig.app.json 配置

**文件作用：** 专门配置应用代码（src 目录）的编译选项。

```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": ["env.d.ts", "src/**/*", "src/**/*.vue"],
  "exclude": ["src/**/__tests__/*"],
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./app.tsbuildinfo",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 5. tsconfig.node.json 配置

**文件作用：** 配置 Node.js 环境的 TypeScript，用于 Vite 配置文件和脚本文件。

```json
{
  "extends": "@tsconfig/node20/tsconfig.json",
  "include": [
    "vite.config.*",
    "vitest.config.*",
    "cypress.config.*",
    "nightwatch.conf.*",
    "playwright.config.*"
  ],
  "compilerOptions": {
    "composite": true,
    "noEmit": true,
    "tsBuildInfoFile": "./node.tsbuildinfo",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "types": ["node"]
  }
}
```

### 6. env.d.ts 配置

**文件作用：** TypeScript 声明文件，让 TS 识别 .vue 文件和 Vite 的环境变量。

```typescript
/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// 环境变量类型声明
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## 三、Prettier 配置

### 1. 安装依赖

```bash
# 安装 Prettier
npm install -D prettier

# 安装 ESLint 集成依赖
npm install -D eslint-config-prettier
npm install -D eslint-plugin-prettier
```

### 2. 依赖详解

| 依赖包 | 作用 | 必需性 |
|--------|------|--------|
| `prettier` | 代码格式化工具，负责统一代码风格 | ✅ 必需 |
| `eslint-config-prettier` | 关闭 ESLint 中与 Prettier 冲突的规则 | ✅ 推荐 |
| `eslint-plugin-prettier` | 将 Prettier 格式检查作为 ESLint 规则运行 | ⚪ 可选 |

**为什么需要 eslint-config-prettier？**

ESLint 和 Prettier 有些功能重叠，比如：
- ESLint 的 `quotes` 规则 vs Prettier 的 `singleQuote`
- ESLint 的 `semi` 规则 vs Prettier 的 `semi`

`eslint-config-prettier` 会关闭所有与 Prettier 冲突的 ESLint 规则，让 Prettier 专门负责格式化，ESLint 专注于代码质量。

### 3. .prettierrc 配置文件

**文件作用：** Prettier 的配置文件，定义代码格式化规则。支持多种格式：`.prettierrc`、`.prettierrc.json`、`prettier.config.js`。

```json
{
  "$schema": "https://json.schemastore.org/prettierrc",

  // === 格式化规则 ===
  "printWidth": 100,                  // 每行最大字符数，超过会自动换行
  "tabWidth": 2,                      // 缩进层级（空格数）
  "useTabs": false,                   // 使用空格缩进，false 表示用空格

  // === 标点符号 ===
  "semi": true,                       // 语句末尾添加分号
  "singleQuote": true,                // 使用单引号而非双引号
  "quoteProps": "as-needed",          // 对象属性引号策略
                                       // - "as-needed": 仅在需要时添加引号
                                       // - "always": 始终添加引号
                                       // - "preserve": 保留用户输入

  // === JSX/Vue ===
  "jsxSingleQuote": false,            // JSX 中使用双引号
  "htmlWhitespaceSensitivity": "css", // HTML 空白敏感度
                                       // - "css": 遵循 CSS display 属性
                                       // - "strict": 空格敏感
                                       // - "ignore": 忽略空白

  "vueIndentScriptAndStyle": false,   // Vue 文件中 <script> 和 <style> 不额外缩进

  // === 数组/对象 ===
  "trailingComma": "es5",             // 尾随逗号策略
                                       // - "es5": ES5 有效位置添加（对象、数组）
                                       // - "none": 不添加尾随逗号
                                       // - "all": 所有可能位置都添加

  "bracketSpacing": true,             // 对象字面量括号内添加空格 { foo: bar }
  "bracketSameLine": false,           // 多行 HTML 元素 > 符号放在最后一行末尾

  // === 其他 ===
  "arrowParens": "always",            // 箭头函数参数始终使用括号 (x) => x
  "endOfLine": "lf",                  // 换行符类型
                                       // - "lf": Unix 风格 \n
                                       // - "crlf": Windows 风格 \r\n
                                       // - "auto": 保持现有

  "singleAttributePerLine": false     // 每个属性单独一行
}
```

**配置示例对比：**

```javascript
// semi: true, singleQuote: true
const message = 'Hello';

// semi: false, singleQuote: false
const message = "Hello"

// trailingComma: "es5"
const obj = {
  a: 1,
  b: 2,
}

// trailingComma: "none"
const obj = {
  a: 1,
  b: 2
}
```

### 4. .prettierignore 忽略文件

**文件作用：** 指定 Prettier 不需要格式化的文件和目录。

```
# === 依赖目录 ===
node_modules/
pnpm-lock.yaml
package-lock.json
yarn.lock
bun.lockb

# === 构建产物 ===
dist/
build/
.cache/
.next/
.nuxt/
out/

# === 配置文件 ===
.vscode/
.idea/
*.local
*.config.js
*.config.ts

# === 日志文件 ===
*.log
logs/

# === 测试覆盖率 ===
coverage/
.nyc_output/

# === 其他 ===
min/
static/
public/
```

### 5. package.json 添加脚本

```json
{
  "scripts": {
    "format": "prettier --write .",                    // 格式化所有文件
    "format:check": "prettier --check .",              // 检查格式（不修改）
    "format:src": "prettier --write \"src/**/*.{js,ts,vue,json,css,scss,md}\""
  }
}
```

**脚本使用：**

```bash
# 格式化所有文件
npm run format

# 检查文件格式（CI 环境使用）
npm run format:check

# 仅格式化 src 目录
npm run format:src
```

---

## 四、ESLint 配置

### 1. 安装依赖

```bash
# ESLint 核心
npm install -D eslint

# TypeScript 支持
npm install -D @typescript-eslint/parser
npm install -D @typescript-eslint/eslint-plugin

# Prettier 集成
npm install -D eslint-config-prettier
npm install -D eslint-plugin-prettier

# Vue 支持
npm install -D eslint-plugin-vue
npm install -D vue-eslint-parser
```

### 2. 依赖详解

| 依赖包 | 作用 | 必需性 |
|--------|------|--------|
| `eslint` | ESLint 核心库，负责代码质量检查 | ✅ 必需 |
| `@typescript-eslint/parser` | 让 ESLint 理解 TypeScript 语法 | ✅ 必需 |
| `@typescript-eslint/eslint-plugin` | TypeScript 专用规则集 | ✅ 必需 |
| `eslint-plugin-vue` | Vue 文件检查规则（Vue 3） | ✅ 必需 |
| `vue-eslint-parser` | 解析 .vue 文件 | ✅ 必需 |
| `eslint-config-prettier` | 关闭与 Prettier 冲突的规则 | ✅ 必需 |
| `eslint-plugin-prettier` | 将 Prettier 作为 ESLint 规则 | ⚪ 可选 |

### 3. eslint.config.js 配置（ESLint 9+ 扁平化配置）

**文件作用：** ESLint 9+ 的新配置格式，使用扁平化的配置数组（替代旧版的 .eslintrc.js）。

```javascript
// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  // ============================================
  // 1. 全局忽略配置
  // ============================================
  {
    ignores: [
      'dist/**',           // 构建产物
      'node_modules/**',   // 依赖
      'build/**',          // 构建目录
      '*.config.js',       // 配置文件
      '*.config.ts',
      '.vscode/**',
      '.idea/**'
    ]
  },

  // ============================================
  // 2. JavaScript 基础推荐规则
  // ============================================
  js.configs.recommended,

  // ============================================
  // 3. TypeScript 配置
  // ============================================
  ...tseslint.configs.recommended,

  // ============================================
  // 4. Vue 配置
  // ============================================
  ...pluginVue.configs['flat/essential'],

  // ============================================
  // 5. 为 .vue 文件配置 TypeScript 解析器
  // ============================================
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: pluginVue.parser,              // 使用 Vue 解析器
      parserOptions: {
        parser: tseslint.parser,             // 在 <script> 中使用 TS 解析器
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    }
  },

  // ============================================
  // 6. 为 TypeScript 文件配置解析器
  // ============================================
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    }
  },

  // ============================================
  // 7. Prettier 集成
  // ============================================
  {
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      'prettier/prettier': 'error'  // 将 Prettier 格式问题作为 ESLint 错误
    }
  },

  // ============================================
  // 8. 关闭与 Prettier 冲突的规则（必须放在最后）
  // ============================================
  prettierConfig,

  // ============================================
  // 9. 自定义规则
  // ============================================
  {
    rules: {
      // =================== TypeScript 规则 ===================
      '@typescript-eslint/no-explicit-any': 'warn',        // any 类型警告
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',   // 忽略 _开头的参数
          varsIgnorePattern: '^_',   // 忽略 _开头的变量
          caughtErrorsIgnorePattern: '^_'  // 忽略 catch 中的 _
        }
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',  // ! 非空断言警告
      '@typescript-eslint/explicit-function-return-type': 'off',  // 不要求显式返回类型
      '@typescript-eslint/explicit-module-boundary-types': 'off', // 不要求导出函数类型

      // =================== Vue 规则 ===================
      'vue/multi-word-component-names': 'off',            // 允许单词组件名
      'vue/no-v-html': 'warn',                             // v-html 使用警告（XSS 风险）
      'vue/require-default-prop': 'off',                  // props 不需要默认值
      'vue/require-prop-types': 'error',                  // props 必须指定类型
      'vue/no-unused-vars': 'error',                      // 检查未使用的变量
      'vue/html-self-closing': ['error', {
        html: {
          void: 'always',     // <img> 等自闭合
          normal: 'always',   // 自定义元素自闭合
          component: 'always' // 组件自闭合
        }
      }],

      // =================== 通用规则 ===================
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-var': 'error',                                 // 禁止使用 var
      'prefer-const': 'error',                           // 优先使用 const
      'no-duplicate-imports': 'error'                    // 禁止重复导入
    }
  },

  // ============================================
  // 10. 为不同文件类型设置不同规则
  // ============================================
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',       // 测试文件允许 any
      'no-unused-expressions': 'off'                     // 允许断言表达式
    }
  }
];
```

### 4. 配置项详解

**配置层级说明（顺序很重要）：**

1. **ignores**: 忽略文件检查
2. **基础规则集**: js.configs.recommended、tseslint.configs.recommended
3. **解析器配置**: 为不同文件类型配置解析器
4. **Prettier 集成**: prettier/prettier 规则
5. **eslint-config-prettier**: 关闭冲突规则（必须在最后）
6. **自定义规则**: 项目特定的规则

**为什么 eslint-config-prettier 要放在最后？**

```javascript
// 错误的顺序
prettierConfig,              // 先关闭冲突规则
{ rules: { 'semi': 'error' } }  // 然后又开启 semi 规则

// 正确的顺序
{ rules: { 'semi': 'error' } },  // 先设置规则
prettierConfig                      // 然后关闭冲突规则
```

### 5. package.json 添加脚本

```json
{
  "scripts": {
    "lint": "eslint . --fix",              // 检查并自动修复
    "lint:check": "eslint .",              // 仅检查不修复
    "lint:src": "eslint src --fix"
  }
}
```

**脚本使用：**

```bash
# 检查并自动修复所有问题
npm run lint

# 仅检查不修复（CI 环境）
npm run lint:check

# 仅检查 src 目录
npm run lint:src
```

---

## 五、Vue 支持

### 1. Vue 项目特殊配置

Vue 单文件组件（SFC）包含三个部分：
- `<template>`: HTML 模板
- `<script>`: JavaScript/TypeScript 逻辑
- `<style>`: CSS 样式

需要特殊配置才能正确解析和检查。

### 2. Vue 解析器配置

**vue-eslint-parser** 是解析 .vue 文件的关键：

```javascript
{
  files: ['**/*.vue'],
  languageOptions: {
    parser: pluginVue.parser,              // 主解析器
    parserOptions: {
      parser: tseslint.parser,             // <script> 中的解析器
      ecmaVersion: 'latest',
      sourceType: 'module'
    }
  }
}
```

### 3. Vue 特有规则

```javascript
{
  rules: {
    // 组件命名
    'vue/multi-word-component-names': 'off',  // 允许 <Header /> 单词组件

    // 模板规则
    'vue/no-v-html': 'warn',                  // 警告 v-html（XSS 风险）
    'vue/html-self-closing': 'error',         // 自闭合标签规范
    'vue/no-template-shadow': 'error',        // 禁止覆盖保留属性

    // Props 规则
    'vue/require-prop-types': 'error',        // props 必须指定类型
    'vue/require-default-prop': 'off',        // props 不强制默认值
    'vue/no-boolean-default': 'error',        // 布尔类型默认值检查

    // 代码质量
    'vue/no-unused-vars': 'error',            // 未使用变量检查
    'vue/no-side-effects-in-computed-properties': 'error',  // 计算属性无副作用
    'vue/no-mutating-props': 'error',         // 禁止修改 props
    'vue/require-v-for-key': 'error',         // v-for 必须有 key

    // 样式
    'vue/no-duplicate-attributes': 'error',   // 禁止重复属性
    'vue/no-static-inline-styles': 'off'      // 允许内联样式
  }
}
```

---

## 六、完整配置示例

### 1. 完整的 eslint.config.js

```javascript
// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  // 忽略文件
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'build/**',
      '*.config.js',
      '*.config.ts'
    ]
  },

  // 基础规则
  js.configs.recommended,

  // TypeScript 规则
  ...tseslint.configs.recommended,

  // Vue 规则
  ...pluginVue.configs['flat/essential'],

  // .vue 文件解析器配置
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: pluginVue.parser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    }
  },

  // TypeScript 文件解析器配置
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    }
  },

  // Prettier 集成
  {
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      'prettier/prettier': 'error'
    }
  },

  // 关闭冲突规则
  prettierConfig,

  // 自定义规则
  {
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],

      // Vue
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'warn',

      // 通用
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-var': 'error',
      'prefer-const': 'error'
    }
  }
];
```

### 2. 完整的 .prettierrc

```json
{
  "$schema": "https://json.schemastore.org/prettierrc",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "htmlWhitespaceSensitivity": "css",
  "vueIndentScriptAndStyle": false,
  "endOfLine": "lf"
}
```

### 3. 完整的 tsconfig.json

```json
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.app.json" }
  ]
}
```

### 4. vite.config.ts 配置路径别名

**文件作用：** Vite 配置文件，路径别名需要与 tsconfig.json 保持一致。

```typescript
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')  // 与 tsconfig.json 保持一致
    }
  },

  server: {
    port: 3000,
    open: true
  }
});
```

**使用路径别名：**

```vue
<!-- App.vue -->
<script setup lang="ts">
import HelloWorld from '@/components/HelloWorld.vue';
import { useStore } from '@/stores/store';
</script>
```

---

## 七、VS Code 配置

### 1. .vscode/settings.json

**文件作用：** 项目级别的 VS Code 设置，推荐团队成员使用统一配置。

```json
{
  // ============================================
  // 编辑器基础设置
  // ============================================
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,    // 不自动检测缩进
  "editor.formatOnSave": true,          // 保存时自动格式化
  "editor.defaultFormatter": "esbenp.prettier-vscode",  // 默认格式化工具
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"  // 保存时自动修复 ESLint 问题
  },

  // ============================================
  // 文件类型格式化工具
  // ============================================
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
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },

  // ============================================
  // ESLint 配置
  // ============================================
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact",
    "vue"
  ],
  "eslint.format.enable": false,  // 禁用 ESLint 格式化，让 Prettier 处理

  // ============================================
  // TypeScript 配置
  // ============================================
  "typescript.tsdk": "node_modules/typescript/lib",  // 使用项目的 TypeScript
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "typescript.preferences.quoteStyle": "single",

  // ============================================
  // Vue 配置
  // ============================================
  "volar.autoCompleteRefs": true,       // Vue 3 自动补全
  "volar.codeLens.pugTools": false,
  "volar.completion.autoImportComponent": true,

  // ============================================
  // 其他配置
  // ============================================
  "files.eol": "\n",                    // 换行符使用 LF
  "files.trimTrailingWhitespace": true, // 删除行尾空格
  "files.insertFinalNewline": true,     // 文件末尾插入新行
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true
  }
}
```

### 2. .vscode/extensions.json

**文件作用：** 推荐团队成员安装的 VS Code 插件。

```json
{
  "recommendations": [
    // === 必需插件 ===
    "Vue.volar",                    // Vue 3 语言支持
    "dbaeumer.vscode-eslint",       // ESLint 插件
    "esbenp.prettier-vscode",       // Prettier 插件

    // === TypeScript ===
    "usernamehw.errorlens",         // 行内显示错误信息

    // === 代码质量 ===
    "streetsidesoftware.code-spell-checker",  // 拼写检查

    // === 其他 ===
    "eamodio.gitlens",              // Git 增强
    "christian-kohler.path-intellisense",     // 路径智能提示
    "bradlc.vscode-tailwindcss"     // Tailwind CSS（如果使用）
  ]
}
```

### 3. .editorconfig

**文件作用：** 统一不同编辑器的编码风格（VS Code、WebStorm、Sublime 等）。

```ini
# EditorConfig 配置
# https://editorconfig.org

root = true

[*]
charset = utf-8                    # 字符编码
indent_style = space               # 缩进风格（space/tab）
indent_size = 2                    # 缩进大小
end_of_line = lf                   # 换行符类型
insert_final_newline = true        # 文件末尾插入新行
trim_trailing_whitespace = true    # 删除行尾空格

[*.md]
trim_trailing_whitespace = false   # Markdown 文件保留行尾空格（用于换行）

[*.{yml,yaml}]
indent_size = 2                    # YAML 文件缩进

[*.{js,ts,vue,json}]
indent_size = 2                    # JS/TS/Vue 文件缩进
```

---

## 八、常见问题

### 1. 路径别名 @ 无法解析

**问题：**
```typescript
import HelloWorld from '@/components/HelloWorld.vue';
// 报错：Cannot find module '@/components/HelloWorld.vue'
```

**解决方案：**

需要在两个地方配置路径别名：

**① tsconfig.json**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**② vite.config.ts**
```typescript
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### 2. ESLint 与 Prettier 冲突

**问题：** 保存时格式化不一致，有时 ESLint 的规则会覆盖 Prettier 的格式。

**解决方案：**

确保 `eslint-config-prettier` 在配置数组最后：

```javascript
// eslint.config.js
export default [
  // ... 其他配置

  // 关闭与 Prettier 冲突的规则（必须放在最后）
  prettierConfig
];
```

### 3. .vue 文件报错

**问题：** .vue 文件无法识别，ESLint 报错 `Parsing error: Unexpected token <`

**解决方案：**

配置 Vue 解析器：

```javascript
// eslint.config.js
import pluginVue from 'eslint-plugin-vue';

export default [
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: pluginVue.parser,
      parserOptions: {
        parser: tseslint.parser  // <script lang="ts"> 使用 TS 解析器
      }
    }
  }
];
```

### 4. Prettier 格式化不生效

**问题：** 保存时不自动格式化。

**解决方案：**

**① 检查 VS Code 设置：**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

**② 检查是否安装 Prettier 插件：**
- 安装 `Prettier - Code formatter` 插件

**③ 检查 .prettierignore：**
- 确保文件没有被忽略

**④ 手动运行 Prettier：**
```bash
npm run format
```

### 5. TypeScript 编译报错

**问题：** `Cannot find module 'vue'`

**解决方案：**

检查 `tsconfig.app.json` 的 `compilerOptions.types`：

```json
{
  "compilerOptions": {
    "types": ["vite/client"]  // 包含 Vite 类型声明
  }
}
```

确保 `env.d.ts` 文件存在：
```typescript
/// <reference types="vite/client" />
```

### 6. Vite 构建时包含 ESLint 检查

**问题：** 想要在构建时自动运行 ESLint 检查。

**解决方案：**

**方案一：使用 npm scripts（推荐）**
```json
{
  "scripts": {
    "build": "npm run lint && vite build",
    "lint": "eslint . --fix"
  }
}
```

**方案二：使用 Vite 插件（不推荐，会拖慢开发服务器）**

```typescript
// vite.config.ts
import eslintPlugin from 'vite-plugin-eslint';

export default defineConfig({
  plugins: [
    vue(),
    eslintPlugin({  // 不推荐，会影响开发服务器启动速度
      cache: false,
      include: ['src/**/*.vue', 'src/**/*.ts']
    })
  ]
});
```

### 7. 保存时格式化两次

**问题：** 保存时代码格式化两次，导致光标跳动。

**解决方案：**

在 `.vscode/settings.json` 中关闭 ESLint 的格式化功能：

```json
{
  "eslint.format.enable": false,  // 关闭 ESLint 格式化
  "editor.formatOnSave": true,    // 只使用 Prettier 格式化
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

### 8. 忽略特定文件的规则

**问题：** 某个文件需要禁用 ESLint 检查。

**解决方案：**

**方案一：在文件顶部注释**
```vue
<!-- eslint-disable -->
<template>
  <!-- 这个文件不会被 ESLint 检查 -->
</template>

<script>
// eslint-disable-next-line
const someCode = 'xxx';
</script>
```

**方案二：在配置中排除**
```javascript
// eslint.config.js
export default [
  {
    ignores: ['src/legacy/**/*.ts']  // 忽略整个目录
  }
];
```

### 9. 未使用的变量报错

**问题：** 使用 `_变量名` 表示有意未使用，但仍报错。

**解决方案：**

配置忽略规则：

```javascript
// eslint.config.js
export default [
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',   // 忽略 _参数
          varsIgnorePattern: '^_',   // 忽略 _变量
          caughtErrorsIgnorePattern: '^_'  // 忽略 catch (e) { _e }
        }
      ]
    }
  }
];
```

### 10. 环境变量类型定义

**问题：** 使用 `import.meta.env.VITE_XXX` 报类型错误。

**解决方案：**

在 `env.d.ts` 中定义类型：

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_TITLE: string;
  // 添加其他环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

## 九、完整工作流程

### 1. 初始化项目

```bash
# 1. 创建项目
npm create vite@latest my-app -- --template vue-ts
cd my-app
npm install

# 2. 安装所有依赖
npm install -D typescript
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D eslint-plugin-vue vue-eslint-parser eslint-config-prettier
```

### 2. 创建配置文件

```bash
# 创建配置文件
touch .prettierrc
touch .prettierignore
touch .editorconfig
touch eslint.config.js
```

### 3. 添加脚本

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --fix",
    "format": "prettier --write ."
  }
}
```

### 4. 配置 VS Code

创建 `.vscode/settings.json` 和 `.vscode/extensions.json`（见上文）

### 5. 验证配置

```bash
# 运行检查
npm run lint

# 格式化代码
npm run format

# 启动开发服务器
npm run dev
```

---

## 十、最佳实践

### 1. 配置文件优先级

- 使用 `.prettierrc` 而不是 `prettier.config.js`（更简洁）
- 使用 `eslint.config.js`（ESLint 9+ 推荐）
- `.editorconfig` 放在项目根目录

### 2. Git Hooks（可选）

使用 husky 和 lint-staged 在提交前自动检查：

```bash
npm install -D husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

**package.json 配置：**
```json
{
  "lint-staged": {
    "*.{js,ts,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,scss,md}": [
      "prettier --write"
    ]
  }
}
```

### 3. CI/CD 集成

在 `.github/workflows/ci.yml` 中添加检查：

```yaml
name: CI

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint:check
      - run: npm run format:check
      - run: npm run build
```

### 4. 团队协作

- 将所有配置文件提交到 Git
- 使用 `.vscode/settings.json` 统一编辑器配置
- 在 README 中说明如何安装依赖和运行脚本

---

## 总结

### 核心配置文件清单

| 文件 | 作用 | 必需性 |
|------|------|--------|
| `tsconfig.json` | TypeScript 配置 | ✅ 必需 |
| `tsconfig.app.json` | 应用代码 TS 配置 | ✅ 必需 |
| `tsconfig.node.json` | Node 环境 TS 配置 | ✅ 必需 |
| `env.d.ts` | 类型声明文件 | ✅ 必需 |
| `.prettierrc` | Prettier 格式化配置 | ✅ 必需 |
| `.prettierignore` | Prettier 忽略文件 | ✅ 必需 |
| `eslint.config.js` | ESLint 配置 | ✅ 必需 |
| `.editorconfig` | 编辑器配置 | ⚪ 推荐 |
| `.vscode/settings.json` | VS Code 配置 | ⚪ 推荐 |
| `.vscode/extensions.json` | VS Code 插件推荐 | ⚪ 推荐 |

### 工作职责划分

- **TypeScript**: 类型检查、编译
- **ESLint**: 代码质量检查、最佳实践
- **Prettier**: 代码格式化（统一风格）

### 关键原则

1. **Prettier 负责格式，ESLint 负责质量**
2. **eslint-config-prettier 必须放在配置数组最后**
3. **路径别名需要在 tsconfig.json 和 vite.config.ts 同时配置**
4. **不要在 Vite 中集成 Prettier 插件**（影响开发服务器速度）
5. **使用编辑器的"保存时格式化"体验最好**

---

## 参考文档

- [Vite 官方文档](https://vitejs.dev/)
- [Vue 3 官方文档](https://vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [ESLint 官方文档](https://eslint.org/)
- [Prettier 官方文档](https://prettier.io/)
- [eslint-plugin-vue 文档](https://eslint.vuejs.org/)
- [typescript-eslint 文档](https://typescript-eslint.io/)
