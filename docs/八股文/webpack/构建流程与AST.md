# 构建流程与 AST

> 官方文档：[Webpack 构建流程](https://webpack.docschina.org/concepts/)

> 官方文档：[Compiler Hooks](https://webpack.docschina.org/api/compiler-hooks/)

---

## 一、Webpack 构建的整体流程

Webpack 的构建流程分为**三大阶段**：初始化、编译、输出。

```
┌─ Webpack 构建流程 ──────────────────────────────────────────────────┐
│                                                                      │
│  ① 初始化阶段                                                        │
│     读取配置 → 创建 Compiler → 注册 Plugin → 初始化编译环境           │
│                                                                      │
│  ② 编译阶段                                                          │
│     从 Entry 出发 → 调用 Loader 编译模块 →                           │
│     递归解析依赖 → 构建 Module Graph（模块依赖图） →                  │
│     转为 Chunk Graph → 生成代码                                       │
│                                                                      │
│  ③ 输出阶段                                                          │
│     根据 Chunk 生成最终文件 → 写入到 output.path 目录                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 二、初始化阶段

```
读取 webpack.config.js
        │
        ▼
合并 CLI 参数与配置文件
        │
        ▼
校验配置项
        │
        ▼
创建 Compiler 实例
        │
        ▼
注册所有 Plugin（调用 plugin.apply(compiler)）
        │
        ▼
触发 environment / afterEnvironment 钩子
        │
        ▼
触发 entryOption / afterPlugins 钩子
        │
        ▼
准备就绪，等待 run
```

```javascript
// 简化的初始化流程
const webpack = require('webpack')

// 1. 读取配置
const config = require('./webpack.config.js')

// 2. 创建 Compiler
const compiler = webpack(config)

// 3. 开始构建
compiler.run((err, stats) => {
  // 构建完成回调
})
```

---

## 三、编译阶段（核心）

### 编译流程

```
触发 make 钩子
      │
      ▼
从 Entry 入口开始
      │
      ▼
┌─ 模块构建循环 ─────────────────────────────────────┐
│                                                     │
│  ① 调用 Loader 编译源文件                           │
│       │                                             │
│       ▼                                             │
│  ② 使用 Parser 将源码转为 AST                       │
│       │                                             │
│       ▼                                             │
│  ③ 从 AST 中分析 import/require 依赖                │
│       │                                             │
│       ▼                                             │
│  ④ 对每个依赖递归执行 ①②③                           │
│       │                                             │
│       ▼                                             │
│  ⑤ 直到所有依赖构建完成                              │
│                                                     │
└─────────────────────────────────────────────────────┘
      │
      ▼
构建 Module Graph（模块依赖图）
      │
      ▼
触发 seal 钩子（停止接收新模块）
      │
      ▼
将 Module Graph 转为 Chunk Graph
      │
      ▼
优化 Chunk（代码分割、Tree Shaking 等）
      │
      ▼
生成最终代码（code generation）
```

### 模块构建详解

```javascript
// 单个模块的构建过程

// 1. 读取文件内容
const source = fs.readFileSync('./src/utils.js', 'utf-8')
// 内容: "import { add } from './math.js'\nexport function double(x) { return add(x, x) }"

// 2. 调用 Loader 链转换
// babel-loader 处理后的结果（可能不变）:
const loaderOutput = "import { add } from './math.js'\nexport function double(x) { return add(x, x) }"

// 3. Parser 解析为 AST
const ast = parser.parse(loaderOutput)
// AST 简化表示:
// {
//   type: 'Program',
//   body: [
//     { type: 'ImportDeclaration', source: { value: './math.js' }, ... },
//     { type: 'ExportNamedDeclaration', declaration: { id: { name: 'double' }, ... } }
//   ]
// }

// 4. 从 AST 提取依赖
const dependencies = ['./math.js']

// 5. 递归处理依赖
dependencies.forEach(dep => buildModule(dep))
```

---

## 四、AST 在 Webpack 中的作用

### 什么是 AST

AST（Abstract Syntax Tree，抽象语法树）是源代码的**树形结构表示**，每个节点对应代码中的一个语法结构。

```javascript
// 源代码
const a = 1 + 2

// 对应的 AST（简化版）
{
  type: 'Program',
  body: [{
    type: 'VariableDeclaration',
    declarations: [{
      type: 'VariableDeclarator',
      id: { type: 'Identifier', name: 'a' },
      init: {
        type: 'BinaryExpression',
        operator: '+',
        left: { type: 'Literal', value: 1 },
        right: { type: 'Literal', value: 2 }
      }
    }],
    kind: 'const'
  }]
}
```

> **通俗理解**：AST 就像代码的"解剖图"——把代码拆解成一个个零件（节点），让你可以精确地分析和修改代码的结构。

### Webpack 如何使用 AST

```
源代码
   │
   ▼ Parser（acorn）
   │
   ▼
AST（抽象语法树）
   │
   ├── HarmonyDetectionParserPlugin → 检测 ES Module（import/export）
   ├── ImportParserPlugin           → 收集 import 依赖
   ├── ExportParserPlugin           → 收集 export 导出
   ├── RequireEnsurePlugin          → 收集 require.ensure（代码分割）
   └── 其他 Parser 插件             → 收集各类依赖
   │
   ▼
依赖列表（模块依赖图的一部分）
```

### 依赖收集过程

```javascript
// 源代码
import { ref, computed } from 'vue'
import { createStore } from 'pinia'
import MyComponent from './MyComponent.vue'

export default {
  setup() {
    const count = ref(0)
    const doubled = computed(() => count.value * 2)
    return { count, doubled }
  }
}

// AST 解析后收集的依赖：
// [
//   { module: 'vue', imports: ['ref', 'computed'] },
//   { module: 'pinia', imports: ['createStore'] },
//   { module: './MyComponent.vue', imports: ['default'] }
// ]

// Webpack 将这些依赖添加到模块依赖图中，递归处理
```

### Tree Shaking 中的 AST 分析

```javascript
// math.js
export function add(a, b) { return a + b }
export function multiply(a, b) { return a * b }
export const PI = 3.14

// main.js
import { add } from './math.js'
console.log(add(1, 2))

// Webpack 通过 AST 分析：
// 1. math.js 导出了 add, multiply, PI
// 2. main.js 只使用了 add
// 3. multiply 和 PI 被标记为 unused
// 4. Terser 在压缩时移除 unused 的导出
```

---

## 五、输出阶段

```
Chunk Graph 构建
      │
      ▼
代码生成（Code Generation）
      │
      ├── 每个 Chunk 生成对应的渲染函数
      ├── 将模块代码包装为 Webpack 运行时可执行的格式
      └── 添加模块加载逻辑
      │
      ▼
触发 emit 钩子（输出前最后的修改机会）
      │
      ▼
创建 Seals（输出资源对象）
      │
      ▼
写入文件系统（output.path）
      │
      ▼
触发 afterEmit 钩子
      │
      ▼
触发 done 钩子（构建完成）
```

### 生成的代码结构（简化）

```javascript
// Webpack 打包后的简化代码结构
;(function (modules) {
  // 模块缓存
  var installedModules = {}

  // require 函数
  function __webpack_require__(moduleId) {
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports
    }
    var module = (installedModules[moduleId] = {
      exports: {}
    })
    modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    )
    return module.exports
  }

  // 入口模块
  __webpack_require__('./src/main.js')
})({
  './src/main.js': function (module, exports, __webpack_require__) {
    const { add } = __webpack_require__('./src/utils.js')
    console.log(add(1, 2))
  },
  './src/utils.js': function (module, exports, __webpack_require__) {
    function add(a, b) { return a + b }
    exports.add = add
  }
})
```

---

## 六、关键钩子时序

```
初始化钩子:
  environment → afterEnvironment → entryOption →
  afterPlugins → afterResolvers → beforeRun

编译钩子:
  run → beforeCompile → compile → make →
  buildModule → succeedModule → finishMake →
  seal → optimizeDependencies → optimizeChunks →
  optimizeModules → optimizeTree → optimizeChunkModules →

输出钩子:
  emit → afterEmit → done
```

---

## 七、面试常见问题

### Q1：描述一下 Webpack 的完整构建流程？

1. **初始化**：读取配置文件，合并参数，创建 Compiler 实例，注册 Plugin
2. **编译**：从 Entry 出发，调用 Loader 编译每个模块，使用 Parser（acorn）将源码解析为 AST，从 AST 中提取依赖，递归处理所有依赖，构建模块依赖图
3. **输出**：将依赖图转为 Chunk，进行优化（Tree Shaking、代码分割），生成最终代码，写入文件系统

### Q2：Webpack 是如何识别依赖关系的？

Webpack 使用 **acorn** 库将源代码解析为 AST，然后遍历 AST 节点，识别出 `import`、`require`、`require.ensure`、`import()` 等语法中的依赖声明，将这些依赖记录到模块依赖图中，然后递归处理每个依赖模块。

### Q3：AST 在 Webpack 中有什么作用？

1. **依赖分析**：从 AST 中识别 `import`/`require` 语句，收集模块依赖
2. **Tree Shaking**：分析哪些导出被使用，标记未使用的代码
3. **作用域提升**（Scope Hoisting）：分析模块间的依赖关系，将模块合并到同一作用域
4. **代码转换**：Loader 中的 babel 等工具也使用 AST 进行代码转换

### Q4：Compiler 和 Compilation 的区别？

- **Compiler**：全局编译器实例，整个 Webpack 运行周期中只有一个，存储了配置信息、插件列表等
- **Compilation**：单次编译实例，每次文件变化重新编译时都会创建新的 Compilation，包含了当前编译的模块资源、chunk、生成的文件等信息
