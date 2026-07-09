# TypeScript tsconfig.json 配置详解

> 📖 [TSConfig Reference —— TypeScript 官方文档](https://www.typescriptlang.org/tsconfig/)（每个选项都有独立页面）
> 📖 [What is a tsconfig.json —— TypeScript 官方文档](https://www.typescriptlang.org/docs/handbook/tsconfig/index.html)

## 一、概述

**`tsconfig.json`** 是 TypeScript 项目的**编译配置文件**，放在项目根目录，用来告诉 TypeScript 编译器（`tsc`）：

1. **编译哪些文件**（哪些算项目的一部分）；
2. **怎么编译**（输出什么版本的 JS、用什么模块规范、开启哪些检查）；
3. **输出到哪里**（编译后的 JS 放哪、要不要生成 source map、要不要生成 `.d.ts`）。

> 💡 **通俗理解：** 把 `tsconfig.json` 想象成给编译器的一份「**施工说明书**」——它不写业务代码，只规定「原材料范围」和「加工方式」。

一个最简的 `tsconfig.json` 长这样：

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "strict": true
  }
}
```

`compilerOptions` 里的每一项，下面会逐一详细讲解。

## 二、决定「编译哪些文件」：`include` / `exclude` / `files`

TypeScript 不会盲目编译所有文件，而是按下面几个字段圈定范围。

### 2.1 `include`

**作用**：指定**要参与编译的文件**，支持通配符（glob）。

```jsonc
{
  "include": [
    "src/**/*.ts",     // src 下任意层级目录里的所有 .ts
    "src/**/*.d.ts",   // 以及所有声明文件
    "src/**/*.vue"     // 以及 Vue 单文件组件
  ]
}
```

**通配符规则**（这是新手最常困惑的地方）：

| 写法 | 含义 |
| --- | --- |
| `*` | 匹配**一层路径**中的任意字符（不含 `/`），如 `src/*.ts` 匹配 `src/a.ts`，不匹配 `src/sub/b.ts` |
| `**` | 匹配**任意层级目录**，如 `src/**/*.ts` 匹配 `src` 下所有深度的 `.ts` |
| `?` | 匹配单个任意字符（不含 `/`） |
| `{a,b}` | 匹配 `a` 或 `b`，如 `src/**/*.{ts,vue}` |

> 💡 **提示：** 原来那句「两个 `**` 代表任意目录，一个 `*` 代表任意文件」说的就是这个——`**` 跨层级，`*` 不跨层级。`src/**/*.ts` 是最常用的「整个 src 目录的 TS 文件」写法。

### 2.2 `exclude`

**作用**：从 `include` 匹配到的文件里，**排除**掉这些。只对 `include` 起作用，不约束 `files`。

```jsonc
{
  "exclude": [
    "node_modules",      // 依赖目录（默认就会排除）
    "**/*.spec.ts",      // 单元测试文件不参与构建产物编译
    "dist"               // 构建产物目录
  ]
}
```

**生效效果与理解**：`include` 先圈一个大范围，`exclude` 再把不要的抠掉。被 `exclude` 的文件，如果被其它文件 `import`，**仍会被编译**——`exclude` 只是「不作为编译入口」，不是「彻底忽略」。

> ⚠️ **注意：** `exclude` **只能排除 `include` 圈进来的文件**。如果你用 `files` 明确列了某个文件，`exclude` 排除不了它。

### 2.3 `files`

**作用**：**逐个精确列出**要编译的文件（绝对或相对路径数组）。

```jsonc
{
  "files": ["src/index.ts", "src/app.ts"]
}
```

**理解与使用场景**：当项目非常小（只有几个核心文件），或要精确控制编译入口时用它。一旦指定了 `files`，`include`/`exclude` 就**不再生效**。

> 💡 **提示：** 三者的关系——
> - 有 `files` → 只编译 `files` 里列的；
> - 没有 `files`，有 `include` → 编译 `include` 匹配的，再扣掉 `exclude`；
> - 都没有 → 默认编译当前目录下所有 `.ts`/`.tsx`/`.d.ts`（不含 `exclude` 默认项 `node_modules` 等）。

## 三、顶层字段一览

除了上面三个，`tsconfig.json` 还有这些顶层字段：

| 字段 | 作用 | 关键理解 |
| --- | --- | --- |
| `compilerOptions` | 编译选项（核心，见第六节） | 绝大多数配置都在这里 |
| `extends` | 继承另一份 `tsconfig` | 复用基础配置，避免重复 |
| `references` | 项目引用（Project References） | 拆分大型项目 / monorepo |
| `include` / `exclude` / `files` | 圈定编译范围 | 见第二节 |
| `watchOptions` | 监听文件变化的策略 | 配合 `--watch` 使用 |
| `compileOnSave` | 是否在保存时自动编译 | 需要编辑器/工具支持 |
| `typeAcquisition` | 自动类型获取（JS 项目） | 控制 `@types` 自动引入 |

## 四、`extends`：继承配置

#### `extends`

**作用**：让当前配置**继承**另一份 `tsconfig`，再在其基础上覆盖或新增字段。

```jsonc
// tsconfig.json（项目根）
{
  "extends": "@vue/tsconfig/tsconfig.dom.json", // 继承 Vue 官方推荐配置
  "compilerOptions": {
    "strict": true      // 在继承的基础上，开启严格模式
  },
  "include": ["src"]
}
```

**生效效果与理解**：TypeScript 先加载被继承的配置，再用当前文件的配置**覆盖**同名项。数组的处理因字段而异（`include`/`exclude` 会用当前的替换，`compilerOptions` 里的数组类选项如 `lib`/`types` 一般也是覆盖而非合并）。

**使用场景**：

- monorepo 里多个子项目共享一套基础配置；
- 复用官方/社区预设（如 `@vue/tsconfig`、`@tsconfig/strictest`）；
- 把「类型检查用」和「构建用」两套配置拆开，后者继承前者。

> ⚠️ **注意：** 被继承配置里的 `include`/`exclude`/`files` **会**被继承过来，但通常你会想在子配置里重新指定自己的范围。

## 五、`references`：项目引用

#### `references`

**作用**：声明当前项目**依赖哪些其它 TypeScript 项目**，让编译器按依赖顺序、增量地编译。

```jsonc
{
  "references": [
    { "path": "../shared" },        // 依赖 shared 项目
    { "path": "../utils/tsconfig.build.json" }
  ]
}
```

**生效效果与理解**：开启后，被引用的项目必须设置 `composite: true`。编译时可以使用 `tsc --build`，TypeScript 会：

1. 按 `references` 的拓扑顺序构建各项目；
2. 只在依赖的项目变化时才重新构建（**增量编译**，更快）；
3. 对上游项目用它的 `.d.ts` 做类型边界，而不是直接读源码。

**使用场景**：

- **monorepo** 多包项目（每个包一个 `tsconfig`，互相引用）；
- 把大型项目拆成「前端 / 后端 / 共享」几块，分别编译；
- 库的「构建配置」和「测试配置」分离。

> ⚠️ **注意：** `references` 配合的是 `composite: true`（见 6.7），单独用 `references` 不开启 `--build` 不会有效果。它是偏大型的工程化特性，小项目用不上。

## 六、`compilerOptions` 详解（核心）

下面按功能分组讲解最常用的选项。每个选项都会说明**作用、生效效果、如何理解、注意事项、使用场景**。

---

### 6.1 目标与环境

#### `target`

**作用**：指定**编译产物（输出的 JS）的目标版本**，决定降级到哪种语法。

```jsonc
{ "compilerOptions": { "target": "ES2020" } }
```

**生效效果**：比如 `target: "ES2017"`，那么 `async/await` 不会被转成 `generator`（因为 ES2017 原生支持），但更高版本的特性（如顶层 `await`）会被降级或报错。

**如何理解**：`target` 回答的是「**生成的 JS 跑在多新的环境上**」。目标越低，降级越多、产物越大、兼容性越好；目标越高，产物越干净但要求运行环境够新。

**注意与场景**：

- 浏览器项目常设 `ESNext` 或较高版本（现代浏览器都支持），把语法降级交给 Vite/esbuild/Babel；
- 需要兼容老环境（旧 Node、老浏览器）时设低版本，如 `ES2015`；
- `target` 影响默认的 `lib`（见下条）。

> 💡 **提示：** 不要混淆 `target` 和 `lib`——`target` 管**输出 JS 的语法版本**，`lib` 管**可用的类型声明**（下一节）。

#### `module`

**作用**：指定编译产物使用的**模块规范**。

```jsonc
{ "compilerOptions": { "module": "ESNext" } }
```

**常见取值与场景**：

| 值 | 适用场景 |
| --- | --- |
| `CommonJS` | Node.js（传统）、`require` 写法 |
| `ESNext` / `ES2020` / `ES2022` | 浏览器、打包器（Vite/webpack）、现代 Node ESM |
| `Node16` / `NodeNext` | 现代 Node.js（区分 CJS/ESM） |
| `AMD` / `UMD` / `System` | 较老的模块方案 |
| `Preserve` | 让打包器完全接管模块处理（配合 `moduleResolution: bundler`） |

**生效效果**：决定输出的 `import`/`export` 是保留原样（ESM）、还是转成 `require`/`module.exports`（CommonJS）。

**如何理解**：`target` 管「语法降级到哪」，`module` 管「模块用什么协议装载」。两者是**正交**的——可以 `target: ES2017` + `module: CommonJS`（新语法但用 CommonJS 模块）。

#### `moduleResolution`

**作用**：指定**模块解析策略**，即 `import 'x'` 时 TypeScript 怎么找到 `x` 对应的文件。

```jsonc
{ "compilerOptions": { "moduleResolution": "Bundler" } }
```

**常见取值与场景**：

| 值 | 适用场景 | 特点 |
| --- | --- | --- |
| `Bundler` | **Vite / webpack 等打包器**（推荐） | 支持导入无后缀、JSON、目录；最宽松 |
| `NodeNext` / `Node16` | 现代 Node.js（ESM） | 严格，要求写全后缀，区分 CJS/ESM |
| `Node`（即 `Node10`） | 传统 Node.js | Node 旧版解析方式 |
| `Classic` | 早期 TS | 基本不用 |

**生效效果与理解**：同样是 `import './util'`，`Bundler` 能解析到 `util.ts`/`util/index.ts`；而 `NodeNext` 在 ESM 模式下要求写 `./util.ts`（带后缀）。解析策略直接影响「写 import 时要不要带后缀」「能不能省略 `index`」。

> 💡 **提示：** Vite 官方模板现在推荐 `module: "ESNext"` + `moduleResolution: "Bundler"`，因为实际的模块解析和打包都由 Vite 完成，TS 只负责类型检查。

#### `lib`

**作用**：指定项目中**可用的内置类型声明库**（告诉 TS 运行环境里有哪些全局 API）。

```jsonc
{ "compilerOptions": { "lib": ["ESNext", "DOM", "DOM.Iterable"] } }
```

**生效效果**：列出 `"DOM"` 才能用 `document`、`window`、`HTMLElement` 这些浏览器类型；列出 `"ES2020"` 才知道 `Promise.allSettled`、`BigInt` 等的类型。

**如何理解**：`lib` 是「**类型层面的运行环境**」。`target` 决定输出 JS 版本并**默认给一套对应版本的 `lib`**；一旦你**手动指定了 `lib`，默认值就被替换**（不是追加），所以要自己补齐需要的。

**注意与场景**：

- 浏览器项目：`["ESNext", "DOM", "DOM.Iterable"]`；
- Node.js 项目：不要 `DOM`，改用 `@types/node` 提供 Node 全局类型；
- 手动写 `lib` 时记得包含目标 ES 版本，否则连 `Array.prototype.map` 的类型都可能丢失。

> ⚠️ **注意：** `lib` 为空数组 `[]` 时（如原文档示例），**所有内置全局类型都会消失**，`Math`、`console` 等都会报错。示例里写 `[]` 只是占位演示，真实项目一定要填。

#### `jsx`

**作用**：指定 `.tsx`（JSX）文件如何被编译。

```jsonc
{ "compilerOptions": { "jsx": "preserve" } }
```

**常见取值**：

| 值 | 效果 |
| --- | --- |
| `preserve` | 保留 JSX 原样，交给下游（Vite/Babel）处理 |
| `react-jsx` | 用新版 JSX 转换（不需要 `import React`） |
| `react` | 转成 `React.createElement`（旧） |

**使用场景**：Vue 项目里写 JSX（`tsx`）时需要；纯 `.vue` + `ts` 的项目可省略。一般配合 `preserve`，把 JSX 转换留给构建工具。

---

### 6.2 严格类型检查

这一组选项决定 TypeScript **查得有多严**。生产项目几乎都建议开启 `strict`。

#### `strict`

**作用**：一个总开关，开启后会**同时启用下面这一整套严格选项**。

```jsonc
{ "compilerOptions": { "strict": true } }
```

`strict: true` 等价于同时打开：

| 子选项 | 作用 |
| --- | --- |
| `noImplicitAny` | 禁止隐式 `any`（参数/变量没标类型且推断不出来时报错） |
| `strictNullChecks` | `null`/`undefined` 不再能赋给任意类型，必须显式处理 |
| `strictFunctionTypes` | 函数参数类型开启**逆变**检查（更严谨） |
| `strictBindCallApply` | `bind`/`call`/`apply` 的参数严格校验 |
| `strictPropertyInitialization` | 类的属性必须在构造函数里初始化 |
| `noImplicitThis` | 禁止 `this` 隐式为 `any` |
| `useUnknownInCatchVariables` | `catch (e)` 的 `e` 类型为 `unknown` 而非 `any` |
| `alwaysStrict` | 编译出的 JS 顶部加 `'use strict'` |

**生效效果与理解**：开 `strict` 是「**把 TS 真正当成强类型语言用**」。它会帮你提前挡住大量「运行时才崩」的问题——最典型的是 `strictNullChecks`，让你必须处理「可能是 `null`」的情况，杜绝「`Cannot read property of undefined`」类错误。

**注意事项**：

- 开启后老项目会冒出一堆报错，这是正常的「还债」过程；
- 可以 `strict: true` 再单独关掉某项（如 `"strictNullChecks": false`）做渐进迁移。

> ⭐ **建议：新项目一律 `"strict": true`。** 这是 TypeScript 官方和社区的一致推荐。

下面挑最常被单独讨论的几项细说：

#### `noImplicitAny`

**效果**：函数参数、变量没有类型注解、又推断不出具体类型时，报错而不是默认当成 `any`。

```ts
// noImplicitAny: true 时报错：参数 s 隐式为 any
function len(s) {
  //     ^
  return s.length;
}
```

**理解**：`any` 等于放弃类型检查。`noImplicitAny` 强制你「要么标注类型，要么显式写 `any`」，杜绝「不知不觉写出 `any`」。

#### `strictNullChecks`

**效果**：`null` 和 `undefined` 只能赋给它们自己的类型（和 `void` 给 `undefined`），不能再塞给任意类型。

```ts
let name: string;
name = null; // strictNullChecks: true 时报错，必须写成 string | null
```

**理解**：这是「**最值得开**」的检查之一。它让 `null`/`undefined` 成为「需要主动处理」的值，从根上减少空指针。

#### `useUnknownInCatchVariables`

**效果**：`catch` 块里的错误对象类型从 `any` 变成 `unknown`。

```ts
try {
  //
} catch (e) {
  // e 是 unknown，不能直接 e.message，必须先收窄
  console.log(e.message); // ❌ 报错
  if (e instanceof Error) console.log(e.message); // ✅
}
```

**理解**：抛出来的东西类型未知（可能是 `Error`、字符串、任何值），用 `unknown` 强制你**收窄后再用**，更安全。

---

### 6.3 输入与输出

#### `rootDir`

**作用**：指定**源代码的根目录**，决定输出时的目录结构基准。

```jsonc
{ "compilerOptions": { "rootDir": "src" } }
```

**生效效果**：编译时会以 `rootDir` 为根，把目录结构**原样保留**到输出目录。不设的话，TS 会自动推断为所有输入文件的**最长公共父目录**。

**注意与场景**：如果 `rootDir: "src"`，但 `include` 里又包含了 `src` 外的文件（如 `../shared/x.ts`），会报错「文件在 `rootDir` 之外」。

#### `outDir`

**作用**：指定**编译产物的输出目录**。

```jsonc
{ "compilerOptions": { "outDir": "dist" } }
```

**生效效果**：编译后的 `.js` 放到 `dist` 下，并按 `rootDir` 的结构镜像。最常用的输出配置。

#### `outFile`

**作用**：把所有输入文件**合并成单个** JS 文件输出。

```jsonc
{ "compilerOptions": { "outFile": "./dist/app.js" } }
```

**注意与场景**：

- 只在不使用模块（`module: "none"`、`amd`、`system`）时有效；
- 现代打包场景应该用 Vite/webpack/Rollup，而不是 `outFile`；
> ⚠️ `outFile` 基本只用于「把多个全局脚本拼成一个」的老场景，新项目不要依赖它做打包。

#### `noEmit`

**作用**：**只做类型检查，不产生任何输出文件**。

```jsonc
{ "compilerOptions": { "noEmit": true } }
```

**使用场景**：**Vite 项目最常用**——因为实际的编译/打包由 Vite（esbuild）完成，`tsc` 只负责类型检查，所以设 `noEmit: true`，让 `tsc` 不要输出会和 Vite 产物冲突的 `.js`。

> 💡 **提示：** `noEmit` 和 `sourceMap`/`declaration`/`outDir` 等输出相关选项是互斥的——设了 `noEmit`，其它输出选项就没意义了。

#### `sourceMap`

**作用**：生成 **source map**（`.js.map` 文件），把编译后的 JS 映射回原始 TS。

```jsonc
{ "compilerOptions": { "sourceMap": true } }
```

**生效效果**：开启后，调试时浏览器/Node 能把报错位置和断点**定位到 TS 源码**而不是编译后的 JS。对调试至关重要，开发环境一般都开。

#### `declaration`（简称 `emitDeclarationOnly` 配套）

**作用**：为每个 `.ts` 文件**生成对应的 `.d.ts` 类型声明文件**。

```jsonc
{ "compilerOptions": { "declaration": true } }
```

**使用场景**：**开发要发布到 npm 的库**时必开，这样使用者才能获得类型提示（见 [[声明模块]]）。普通应用项目不需要。

---

### 6.4 模块互操作

#### `esModuleInterop`

**作用**：开启后，可以用**默认导入**的方式导入 CommonJS 模块，并生成辅助代码正确处理。

```ts
// esModuleInterop: true 时，可以这样导入 CommonJS 的 React/jQuery
import $ from 'jquery';       // ✅
// 否则需要：import * as $ from 'jquery';
```

**如何理解**：CommonJS 模块只有 `module.exports`（一个整体），没有 ESM 的「默认导出」概念。`esModuleInterop` 给它补一个「合成默认导出」，让两种模块规范能顺畅互操作。

**注意**：现代项目一般都开 `true`。它和 `allowSyntheticDefaultImports` 关系密切——`esModuleInterop: true` 会自动开启后者（后者只影响**类型检查**，不影响**输出**）。

#### `resolveJsonModule`

**作用**：允许 `import` JSON 文件，并正确推断类型。

```ts
import pkg from './package.json';
console.log(pkg.version); // 有完整的类型
```

**使用场景**：想在 TS 里导入 `package.json`、配置 JSON 时开启。Vite 项目常用。

#### `isolatedModules`

**作用**：保证每个文件都能被**单独转译**（single-file transpilation），而不依赖跨文件的类型信息。

```jsonc
{ "compilerOptions": { "isolatedModules": true } }
```

**生效效果与理解**：esbuild/Vite/Babel 这类工具是**逐文件**编译的（不做完整类型分析），它们要求源码满足「单文件可转译」。开启后，TS 会提前帮你检查那些「单文件转译会出错」的写法，比如：

- `const enum`（其它文件用它时需要跨文件信息）；
- `export type` 重导出时要写 `export type { T }`。

> 💡 **提示：** **Vite/ESBuild 项目强烈建议开 `isolatedModules: true`**，它和打包器的逐文件编译模型一致，能避免运行时和类型检查不一致的坑。

#### `verbatimModuleSyntax`

**作用**：强制 `import`/`export` **原样保留在输出中**，不再自动「移除只用做类型的 import」。

```jsonc
{ "compilerOptions": { "verbatimModuleSyntax": true } }
```

**生效效果与理解**：

- 它要求「**只用于类型的导入必须写成 `import type`**」；
- 普通的值导入保留、类型导入删除，规则更清晰可预测。

**注意**：它是较新的选项（TS 5.0+），取代了旧的 `importsNotUsedAsValues` + `preserveValueImports`。Vite 新模板里推荐用它配合 `isolatedModules`。

```ts
import { someValue } from './a';      // 值导入，保留
import type { SomeType } from './b';  // 纯类型导入，会被删除
```

---

### 6.5 JavaScript 支持

#### `allowJs`

**作用**：允许编译器**处理 `.js` 文件**（把它们纳入项目）。

```jsonc
{ "compilerOptions": { "allowJs": true } }
```

**使用场景**：项目正从 JS 迁移到 TS，希望 `.js` 和 `.ts` 共存。开启后才能 `import` JS 文件。

#### `checkJs`

**作用**：对 `.js` 文件也做**类型检查**（而不是只允许它们存在）。

```jsonc
{ "compilerOptions": { "allowJs": true, "checkJs": true } }
```

**注意**：通常配合 `allowJs` 使用。JS 没有类型，检查会比较宽松或依赖 JSDoc 注释提供类型。一般用 `// @ts-nocheck` 或 `// @ts-check` 在单文件级别控制。

---

### 6.6 路径映射

#### `baseUrl`

**作用**：设置**解析非相对路径模块的基准目录**。

```jsonc
{ "compilerOptions": { "baseUrl": "./src" } }
```

**理解**：有了 `baseUrl`，`import 'utils/helper'` 会去 `src/utils/helper` 找（不再必须写 `./` 或 `../`）。

#### `paths`

**作用**：定义**模块路径别名**，把一个路径前缀映射到实际位置。

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],            // @/xxx → src/xxx
      "@components/*": ["src/components/*"]
    }
  }
}
```

**生效效果**：写 `import Button from '@/components/Button.vue'` 时，TS 能正确解析到 `src/components/Button.vue`。

> ⚠️ **注意（Vite 项目重点）：** `paths` **只解决 TypeScript 的类型解析**。运行时由 Vite/webpack 解析，所以**必须同时在构建工具里配置对应的别名**（Vite 的 `resolve.alias`、webpack 的 `resolve.alias`），否则「编译过了但运行时报找不到模块」。

#### `rootDirs`

**作用**：把**多个目录视为同一个逻辑根**，让不同目录下的文件互相 `import` 时路径更自然。

```jsonc
{ "compilerOptions": { "rootDirs": ["src", "generated"] } }
```

**使用场景**：源码和「代码生成器产物」分开放，但希望它们在导入路径上无缝衔接。较少用。

---

### 6.7 性能与工程化

#### `skipLibCheck`

**作用**：**跳过所有 `.d.ts` 声明文件的类型检查**（只检查你的 `.ts` 源码）。

```jsonc
{ "compilerOptions": { "skipLibCheck": true } }
```

**生效效果与理解**：第三方库的声明文件往往有细微的类型问题，逐个检查既慢又会冒出你无法修改的报错。`skipLibCheck` 跳过它们，**显著加快类型检查速度**，同时不影响对你自己代码的检查。

> 💡 **提示：** 生产项目基本都开 `skipLibCheck: true`。它只跳过声明文件，不影响 `.ts` 源码的严格检查。

#### `forceConsistentCasingInFileNames`

**作用**：**强制文件名大小写一致**。

```jsonc
{ "compilerOptions": { "forceConsistentCasingInFileNames": true } }
```

**理解**：macOS/Windows 文件系统**不区分大小写**（`App.ts` 和 `app.ts` 被视为同一个文件），但 Linux 区分。如果有人 `import './App'` 实际文件叫 `app.ts`，在 Mac 上能跑、部署到 Linux 就崩。这个选项强制大家大小写写对。

> 💡 **提示：** TS 5.0+ 该选项**默认为 `true`**，新项目不用管，知道它的作用即可。

#### `incremental`

**作用**：开启**增量编译**，把上次编译信息存到 `.tsbuildinfo` 文件，下次只重新编译变化的部分。

```jsonc
{ "compilerOptions": { "incremental": true } }
```

**使用场景**：大型项目提升 `tsc` 重复编译速度。配合 `composite`/`references` 使用。

#### `composite`

**作用**：把项目标记为可被**项目引用**的「组合项目」，强制一些约束（必须设 `rootDir`、所有输入文件都要被发现等）。

```jsonc
{ "compilerOptions": { "composite": true } }
```

**使用场景**：配合 `references` 做 monorepo / 大型项目拆分（见第五节）。

---

### 6.8 类型声明包（`types` / `typeRoots`）

这两个选项控制 **`@types` 声明包**（来自 [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) 社区仓库，或项目内的 `.d.ts` 目录）如何被自动引入。详见 [[声明模块]]。

> 📖 官方文档：[typeRoots](https://www.typescriptlang.org/tsconfig/#typeRoots)、[types](https://www.typescriptlang.org/tsconfig/#types)

#### 先理解：什么是 `@types` 包，什么是「自动引入」

很多 JS 库（如 Node.js、jQuery）本身不带类型。社区就在 [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) 上维护对应的类型声明包，命名规则是 `@types/库名`——比如 `@types/node`、`@types/jest`、`@types/lodash`。

装上这些包后，TypeScript 会做两件事：

1. 把它们的 `.d.ts` **自动纳入**项目（不用手动 `import` 声明文件本身）；
2. 如果包里有**全局声明**（顶层 `declare`，如 `@types/node` 提供的 `process`、`Buffer`），这些类型会**全局可见**——任何文件里都能直接用 `process.env` 而不报错。

`typeRoots` 和 `types` 就是控制上面这个「自动引入」行为的两个旋钮：

| 选项 | 管什么 | 比喻 |
| --- | --- | --- |
| `typeRoots` | **去哪些目录**找声明包 | 在哪些书架上找书 |
| `types` | 找到的包里**哪些**被自动启用 | 书架上哪些书允许拿下来看 |

#### `typeRoots`

**作用**：指定 TypeScript **去哪些目录查找** `@types` 声明包。

**默认行为**：TS 会把**所有可见的** `node_modules/@types` 目录纳入查找——这里的「可见」指**当前目录及所有祖先目录**里的 `node_modules/@types`（类似 Node 找模块的向上冒泡机制）。所以哪怕 `@types` 装在项目外层，也能被发现。

```jsonc
{
  "compilerOptions": {
    "typeRoots": [
      "./node_modules/@types",  // 默认位置（保留）
      "./my_custom_types"       // 自定义的声明目录
    ]
  }
}
```

> ⚠️ **注意：一旦显式设置了 `typeRoots`，默认行为就被完全替换**——TS 只会在你列出的目录里找，不再向上冒泡查找。所以即使只是想加一个自定义目录，也**记得把默认的 `./node_modules/@types` 一起写上**，否则原有的 `@types` 包会全部失效。

**自定义目录的结构要求**：`typeRoots` 里的每个目录，其**直接子目录名**会被当成包名。比如上面的 `./my_custom_types` 下要放 `./my_custom_types/my-lib/index.d.ts`，才能让 `my-lib` 这个「类型包」被发现并自动加载。

#### `types`

**作用**：在 `typeRoots` 找到的所有声明包里，控制**哪些会被自动包含**（成为**全局可见**）。

**命名规则**：数组里写的是**去掉 `@types/` 前缀**的包名——`@types/node` 写 `"node"`、`@types/jest` 写 `"jest"`。

| `types` 的值 | 行为 |
| --- | --- |
| **不设置**（默认） | 自动包含 `typeRoots` 下的**所有** `@types` 包 |
| **数组 `["node", "jest"]`** | **只**自动包含列出的这些包，其余被忽略 |
| **空数组 `[]`** | **不自动包含**任何 `@types` 包 |

```jsonc
{
  "compilerOptions": {
    // 只让 node 和 jest 的类型自动全局可见，其余 @types 包被忽略
    "types": ["node", "jest"]
  }
}
```

#### 关键理解：`types` 只管「自动注入到全局」的包

这是最容易误解的一点：**`types` 不影响通过 `import` 显式引入的模块类型。**

`@types` 包里的声明通常有两种形式：

- **全局声明**（顶层 `declare`，无 `export`）：自动注入全局，受 `types` 控制；
- **模块化声明**（带 `export`，按模块导出）：必须 `import` 才能用，**不受 `types` 限制**。

```ts
// 假设 types 只写了 ["node"]，没写 "lodash"
import _ from 'lodash'; // ✅ 模块化引入，不受 types 限制，照常有类型

// 而 @types/node 的 process 是全局声明：
process.env.PORT; // 是否能用，取决于 "node" 是否在 types 里（或被默认自动包含）
```

换句话说：**把一个包从 `types` 数组里去掉，只会让它提供的「全局类型」失效；只要它的类型是按模块导出的，照样能 `import` 用。**

#### 使用场景

**场景 1：避免全局污染 / 类型冲突**

同时装了 `@types/jest` 和 `@types/mocha` 时，它们都会往全局注入 `describe`/`it`/`test`，两边定义可能打架。用 `types` 只启用实际要用的那个：

```jsonc
{
  "compilerOptions": {
    "types": ["node", "jest"] // 启用 jest 的全局类型，忽略 mocha
  }
}
```

**场景 2：前后端环境隔离（拆分 `tsconfig`）**

前端代码不该出现 `process`、`Buffer` 这类 Node 全局变量，但构建脚本（如 `vite.config.ts`）又需要它们。做法是拆成两份配置，各自配 `types`：

```jsonc
// tsconfig.app.json —— 浏览器环境：不自动引入 @types/node
{
  "compilerOptions": {
    "types": [], // 不自动注入任何全局声明
    "lib": ["ESNext", "DOM", "DOM.Iterable"]
  },
  "include": ["src"]
}

// tsconfig.node.json —— Node 环境（构建脚本用）
{
  "compilerOptions": {
    "types": ["node"] // 只引入 @types/node，可用 process、Buffer
  },
  "include": ["vite.config.ts"]
}
```

> 💡 **提示：** 这种「按环境拆分 `tsconfig` + 不同 `types`」正是 Vite 官方模板的默认做法（见 7.1 节的 `tsconfig.app.json` / `tsconfig.node.json` 拆分）。

#### 常见坑与注意事项

- **设了 `types: []` 后，`process`、`Buffer` 等 Node 全局类型会突然报错**——因为它们依赖 `@types/node` 被自动包含。前端项目想隔离 Node 环境时这是预期效果，但要清楚原因。
- **`extends` 时 `types` 是覆盖、不是合并**——子配置写了 `types`，父配置的 `types` 会被替换掉，而不是两者相加。
- **`types` 数组里写包名不带 `@types/` 前缀**，写 `"node"` 而不是 `"@types/node"`。
- **别和 `typeAcquisition` 混淆**：

| 选项 | 作用场景 |
| --- | --- |
| `types` / `typeRoots` | 控制 TS 项目里 `@types` 包的**自动包含** |
| `typeAcquisition` | 只对**纯 JS 项目**（`allowJs`）生效，控制编辑器是否**自动下载**缺失的 `@types` 包 |

> 💡 **一句话总结：** 多数项目**不用显式配** `types` / `typeRoots`——默认自动包含所有 `@types` 即可。只有遇到「全局类型打架」「想按环境隔离全局变量」时，才需要用 `types` 精确收窄。

---

## 七、常见项目配置模板

### 7.1 Vue 3 + Vite 项目（推荐模板）

这是 Vite 官方脚手架生成 Vue + TS 项目时的典型配置：

```jsonc
// tsconfig.json —— 顶层只做引用拆分
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },   // 应用代码配置
    { "path": "./tsconfig.node.json" }   // vite.config.ts 等 Node 配置
  ]
}
```

```jsonc
// tsconfig.app.json —— 应用代码（浏览器环境）
{
  "extends": "@vue/tsconfig/tsconfig.dom.json", // 继承 Vue 官方 DOM 配置
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUnusedLocals": true,           // 禁止未使用的局部变量
    "noUnusedParameters": true,       // 禁止未使用的参数
    "noFallthroughCasesInSwitch": true, // switch 必须 break/return
    "isolatedModules": true,          // 适配 esbuild 逐文件编译
    "verbatimModuleSyntax": true,     // import 原样保留，类型导入用 import type
    "noEmit": true,                   // Vite 负责打包，tsc 只做检查
    "jsx": "preserve",
    "lib": ["ESNext", "DOM", "DOM.Iterable"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"]
}
```

> 💡 **提示：** 关键点有三个——`moduleResolution: "Bundler"`（Vite 解析）、`isolatedModules: true`（esbuild 兼容）、`noEmit: true`（不抢 Vite 的活）。

### 7.2 Node.js 项目

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",           // 现代 Node ESM
    "moduleResolution": "NodeNext", // 配套，import 要带后缀
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": ["node"]               // 引入 @types/node
  },
  "include": ["src"]
}
```

### 7.3 库 / npm 包开发

```jsonc
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "declaration": true,            // 生成 .d.ts，使用者才有类型
    "declarationMap": true,         // .d.ts 的 source map
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

## 八、常见问题与注意事项

### 8.1 改了 `tsconfig` 不生效？

排查方向：

- IDE（VSCode）可能缓存了配置，**重启 TS Server**（命令面板搜 `TypeScript: Restart TS Server`）；
- 项目里可能存在**多个 `tsconfig.json`**（Vite 项目常见根配置 + `tsconfig.app.json`），改错文件了；
- 用 `tsc --showConfig` 可以查看**最终生效的合并后配置**，用来确认 `extends` 是否如预期。

### 8.2 `target` vs `lib` 怎么区分？

- `target`：**输出 JS 的语法版本**（降级与否）；
- `lib`：**类型层面可用的内置 API**（`Math`、`DOM`、`Promise.allSettled` 等）。
- `target` 会给一个**默认 `lib`**，但手动设了 `lib` 就会**完全替换**默认值。

### 8.3 `module` vs `moduleResolution` 怎么区分？

- `module`：**产物用什么模块规范**（输出长什么样）；
- `moduleResolution`：**`import` 时怎么找文件**（解析逻辑）。
- 二者通常配套：`module: "ESNext"` + `moduleResolution: "Bundler"`（打包器），或 `module: "NodeNext"` + `moduleResolution: "NodeNext"`（Node）。

### 8.4 Vite 项目里 `tsconfig` 到底起什么作用？

Vite 用 esbuild/rollup 做实际的转译和打包，**`tsc` 只负责类型检查**。所以：

- `noEmit: true`——不输出 JS；
- `isolatedModules` / `verbatimModuleSyntax`——适配打包器的逐文件模型；
- `target`/`module` 在 Vite 项目里**主要影响类型检查的严格度和 IDE 行为**，真正的语法降级由 Vite 按 `build.target` 决定。

### 8.5 注释能用吗？

`tsconfig.json` **支持注释**（`//` 和 `/* */`），因为 TS 用的是宽松的 JSON 解析器。但如果用 `import` 方式把它当 JSON 读取，注释可能丢失。推荐用 `.jsonc` 编辑器语法高亮。

## 九、速查表：高频选项

| 选项 | 一句话作用 | 推荐值（前端项目） |
| --- | --- | --- |
| `target` | 产物 JS 语法版本 | `ESNext` |
| `module` | 产物模块规范 | `ESNext` |
| `moduleResolution` | 模块解析策略 | `Bundler` |
| `lib` | 内置类型声明库 | `["ESNext","DOM","DOM.Iterable"]` |
| `strict` | 严格模式总开关 | `true` |
| `isolatedModules` | 单文件可转译 | `true` |
| `verbatimModuleSyntax` | import 原样保留 | `true` |
| `noEmit` | 只检查不输出 | `true`（Vite） |
| `skipLibCheck` | 跳过声明文件检查 | `true` |
| `esModuleInterop` | CJS/ESM 互操作 | `true` |
| `resolveJsonModule` | 允许导入 JSON | `true` |
| `jsx` | JSX 处理方式 | `preserve` |
| `paths` | 路径别名 | 配合构建工具别名 |
| `sourceMap` | 生成 source map | 开发开 |
| `declaration` | 生成 `.d.ts` | 库项目才开 |
| `types` / `typeRoots` | 控制自动引入的 `@types` 包 | 多数项目不用配 |

## 十、总结

- `tsconfig.json` 是 TypeScript 的**编译说明书**：管「编译范围」和「怎么编译」；
- `include`/`exclude`/`files` 圈定**编译范围**，记住 glob 规则：`**` 跨层级、`*` 不跨层级；
- `extends` 复用配置，`references` 拆分大项目（配合 `composite`）；
- `compilerOptions` 是核心，分这几类：
  - **目标环境**：`target` / `module` / `moduleResolution` / `lib` / `jsx`；
  - **严格检查**：`strict`（总开关，新项目必开）及子项；
  - **输入输出**：`rootDir` / `outDir` / `noEmit` / `sourceMap` / `declaration`；
  - **模块互操作**：`esModuleInterop` / `resolveJsonModule` / `isolatedModules` / `verbatimModuleSyntax`；
  - **路径与性能**：`baseUrl` / `paths` / `skipLibCheck` / `incremental`；
- **Vite 项目三件套**：`moduleResolution: "Bundler"` + `isolatedModules` + `noEmit`；
- 配 `paths` 别名时，**记得在 Vite/webpack 里同步配别名**，否则类型过了运行时挂。

> 💡 **一句话记忆：** `tsconfig.json` = 圈定文件（`include`）+ 继承拆分（`extends`/`references`）+ 编译规则（`compilerOptions`），其中 `compilerOptions` 又分「目标环境」「严格检查」「输入输出」「模块互操作」四块。
