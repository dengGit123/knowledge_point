### `tsconfig.json`
* 主要由三部分组成：
  1. `compilerOptions`：编译选项
  2. `include`/`exclude`/`files`：文件范围控制（决定哪些文件参与编译）
  3. `extends`/`references`：工程化配置

### 一、`compilerOptions`
#### 1. 基础环境设置
| 配置项 | 描述与作用 |
|:--:|:--:|
| `target` | 指定编译后的 `JS` 版本，现代项目（`Node.js 14+` 或现代浏览器）建议设置为 `es2020` |
| `module` | 指定编译后的 `JS` 使用哪种模块系统，`Node.js` 项目用 `commonjs`，现代项目通常用 `esnext` 或 `node16` |
| `lib` | 指定编译时需要包含的库文件，解决 `console.log()` 报错等问题。建议设为 `["esnext", "dom", "dom.iterable"]` |
#### 2. 模块解析相关
| 配置项 | 描述与作用 |
|:--:|:--:|
| `moduleResolution` | 指定模块解析策略，现代项目默认采用 `node`（`Node.js` 解析策略） |
| `baseUrl` | 设置解析非相对模块名的基准目录，配合 `paths` 使用 |
| `paths` | 设置路径别名映射，必须配合 `baseUrl` 或 `rootDirs` 使用 |
| `resolveJsonModule` | 允许直接 `import` 和类型检查 `.json` 文件 |
| `esModuleInterop` | 启用此项可以让 `import React from 'react'` 这样的 `ES` 模块导入在 `CommonJS` 模块上正常工作 |

#### 3. 输出控制
| 配置项 | 描述与作用 |
|:--:|:--:|
| `outDir` | 指定编译生成的 `.js` 等文件存放的目录 |
| `rootDir` | 指定输入文件的根目录，用于控制输出目录的结构 |
| `sourceMap` | 生成 `.map` 文件，用于在浏览器中调试原始的 `.ts` 代码 |
| `declaration` | 为项目生成 `.d.ts` 文件，当项目作为库被发布时非常有用 |
| `outFile` | 将所有全局作用域中的代码合并输出到一个单独的文件中 |
| `removeComments` | 移除编译后 `JS` 文件中的注释 |
| `incremental` | 首次编译后生成一个 `.tsbuildinfo` 信息文件，后续编译将基于该文件只对改动的文件进行增量编译，能显著提升大型项目的二次编译速度 |

#### 4. 类型检查严格模式
| 配置项 | 描述与作用 |
|:--:|:--:|
| `strict` | 启用此选项会同时开启所有严格类型检查的选项，新项目强烈推荐将其设为 `true` |
| `noImplicitAny` | 在表达式或声明中使用了隐式的 `any` 类型时会报错，需要显式声明类型 |
| `strictNullChecks` | 严格检查 `null` 和 `undefined`，防止出现运行时"对象 `undefined`"的错误 |
| `strictFunctionTypes` | 对函数参数进行更严格的逆变检查，提高函数类型的安全性 |
| `strictBindCallApply` | 对 `bind`、`call`、`apply` 方法进行更严格的类型检查 |
|useUnknownInCatchVariables|将 catch 语句中的变量类型从 any 改为 unknown，强制对错误对象进行类型检查|
|exactOptionalPropertyTypes|不允许将 undefined 赋值给可选属性|

#### 5. 额外代码质量检查
|配置项|描述与作用|
|:--:|:--:|
|noUnusedLocals|检查并报告未使用的局部变量，有助于保持代码整洁|
|noUnusedParameters|检查并报告未使用的函数参数，同样是为了保持代码整洁|
|noImplicitReturns|要求代码中的所有路径都必须有返回值，防止忘记 return|
|noFallthroughCasesInSwitch|检查 switch 语句中可能出现的 fallthrough 错误（忘记 break）|

### 二。顶层配置 (Root Fields)
|配置项|描述与作用|
|:--:|:--:|
|files|指定一个需要包含的文件白名单数组，通常用于文件数量很少的小项目|
|include|使用 *, ?, **/ 等通配符模式指定需要包含的文件或目录 (配置示例: "include": ["src/**/*", "tests/**/*"])|
|exclude|指定在 include 中包含的文件里需要排除的文件或目录 (默认值: ["node_modules", "bower_components", "jspm_packages"]) (配置示例: "exclude": ["node_modules", "src/**/*.test.ts"])|
|extends|继承另一个配置文件的属性。当前文件的配置会覆盖被继承文件中的同名配置 (配置示例: "extends": "./configs/base.json")|
|references|用于大型 monorepo 或多子项目构建的 "项目引用"，可以将代码库组织成更小的部分 (配置示例: "references": [{ "path": "./packages/utils" }]|

### 三。常用且实用的其他选项
* allowJs: 允许 TypeScript 编译器处理 .js 文件。在将 JavaScript 项目逐步迁移到 TypeScript 时非常有用
* checkJs: 与 allowJs 配合使用，允许 TypeScript 编译器对引入的 .js 文件进行类型检查和错误报告
* skipLibCheck: 跳过对所有声明文件（.d.ts）的类型检查，可以显著提升编译速度，是一项推荐开启的优化
* forceConsistentCasingInFileNames: 在不同操作系统中强制执行文件名大小写的一致性，避免因大小写不敏感的文件系统导致的"文件找不到"错误
* noEmit: 不生成编译输出文件。当你只想用 TypeScript 进行类型检查，而不想用它来生成 JavaScript 文件时（比如在 Vite 等构建工具配合下
* noEmitOnError: 如果 TypeScript 编译时发现任何错误，就不生成任何输出文件，保证输出代码的正确性
* alwaysStrict: 确保每个文件都在"严格模式"下解析，并且输出文件会包含 "use strict" 指令

### 四。 typeRoots 与 types
* 两个选项是专门用来管理 TypeScript 全局类型声明（.d.ts 文件）的
  * typeRoots 定义在哪里找类型声明，好比设置“图书馆”
  * types 确定具体使用哪些类型，好比指定“借阅书单”
#### typeRoots：设定范围-"图书馆"
typeRoots 定义了 TypeScript 编译器在何处寻找全局类型定义文件（.d.ts）
* 默认值: ["node_modules/@types"]
* 行为: 设置后，会完全覆盖默认搜索路径，编译器只在你列出的目录中查找。这意味着node_modules/@types里的包不会被自动包含，需要你手动添加回
配置示例: 如需同时查找默认目录和本地自定义类型，正确配置方式如下：
```JSON
{
  "compilerOptions": {
    "typeRoots": [
      "./node_modules/@types",  // 手动保留默认目录
      "./src/custom-types"      // 添加自定义类型目录
    ]
  }
}
```
#### types：精确筛选-"书单"
types 指定了哪些具体的全局类型包（@types/*）应该被包含进编译
* 默认行为: 当 types 为空或未设置时，编译器会包含 typeRoots 目录下所有能找到的类型包，这也是我们日常印象中"TS 自动工作"的方式
* 设置后的行为: 只有在 types 数组内明确列出的类型包才会被包含，形成 “白名单” 机制。常用于精细化控制，避免全局命名空间冲突
```JSON
{
  "compilerOptions": {
    "types": ["node", "jest"]  // ✅ 包含Node.js和Jest的类型
  }
}
```

### 场景1
* 一个类型声明文件全局生效，不需要在每个文件里手动引入
  * 直接在你的项目中创建一个 .d.ts 文件（比如 global.d.ts），并把它放在 TypeScript 编译的包含目录（比如 src/）下，然后正常书写 declare ... 语句即可

✅ 标准做法：**利用自动包含**
* TypeScript **默认**会包含项目中的所有 *.ts、*.tsx、*.d.ts 文件（除非被 exclude 排除）。 例如:
1. 在 src/ 下创建 global.d.ts
2. 写入全局声明: 
```ts
// src/global.d.ts
interface MyGlobalInterface {
  foo: string;
}

declare const MY_VERSION: string;
```
3. 然后在你项目的任何 .ts 文件里，都可以直接使用 MyGlobalInterface 和 MY_VERSION，无需任何 import 或 reference 指令