> 💡 提示：从最新版（`v9.0+`）开始，`ESLint` 的配置全面采用了更直观的 `Flat Config` 系统（扁平化）

> ⚠️ 独立的 `.eslintignore` 文件已失效：在 `Flat Config` 中，`eslint.config.js` 是唯一配置文件，旧版的 `.eslintignore` 文件不再生效，这是官方设计的改变

> 首选 `ignores`：将 `ignores` 放在一个独立的、没有 `files` 字段的配置对象中，这是最可靠且万无一失的做法

### 配置对象详解
| 属性名 | 类型 | 描述 | 示例 |
|:--:|:--:|:--:|:--:|
| `files` | `string[]` | 指定该配置应用于哪些文件（使用 `glob` 语法）。不指定，则应用于所有匹配的文件 | `”files”: [“src/**/*.ts”]` |
| `ignores` | `string[]` | 指定该配置排除哪些文件（使用 `glob` 语法）。如果在一个只包含 `ignores` 的空对象使用，会成为全局忽略规则 | `”ignores”: [“**/dist/”]` |
| `languageOptions` | `object` | 配置语言环境的语法与全局变量，是 `env`、`parser` 和 `parserOptions` 的整合版 | |
| `plugins` | `object` | 以对象形式引入插件，键是插件别名，值是插件对象。需搭配 `rules` 使用 | `js { plugins: { 'my-plugin': pluginObject } rules: { 'my-plugin/rule-name': 'error' } }` |
| `rules` | `object` | 具体的规则与它们的严重程度设置。规则 ID 是键，值是严重程度或一个 `[severity, ...options]` 数组 | `”rules”: { “eqeqeq”: “off”, “quotes”: [“warn”, “double”] }` |
| `extends` | `array` | 当前配置对象所继承或引用的预定义配置列表。允许多个”扩展” | `”extends”: [“eslint:recommended”, “plugin:my-plugin/recommended”]` |
| `processor` | `object/string` | 指定一个处理器，让 `ESLint` 处理非 `JS` 文件（如 `Markdown`、`HTML`）中嵌入的 `JS` 代码 | `”processor”: “my-plugin/markdown”` |
| `settings` | `object` | 提供全局共享配置，可被所有规则访问，常用于传递插件配置 | `”settings”: { sharedData: 'value' }` |
| `linterOptions` | `object` | 控制检查流程行为的选项 | `”linterOptions”: { ... }` |
| `name` | `string` | 为配置对象命名，便于调试时在终端和 `Config Inspector` 中识别 | `”name”: “my-project/node-files”` |
### 📌 深度解读与高级应用

#### 🏷️ `languageOptions`：代码环境的配置中心
* `ecmaVersion`：指定支持的 `ECMAScript` 语法版本。`6` 代表 `ES6`，`2020` 代表 `ES2020`
* `sourceType`：定义模块格式（`module` 或 `script`）
* `globals`：手动标识代码中会使用的全局变量
* `parser`：指定解析器，用于将代码转换为 `ESLint` 可读的抽象语法树（`AST`），默认是 `espree`。`TypeScript` 项目需配置 `@typescript-eslint/parser`
* `parserOptions`：传递给解析器的额外配置，例如设置 `project` 路径以启用 `TypeScript` 的类型检查规则

#### 🧩 `rules`：严重程度与可选参数
* 严重程度设置：一个规则通常有三种设置方式
  * `"off"` 或 `0`：关闭规则
  * `"warn"` 或 `1`：开启规则，仅抛出警告，不打断流程
  * `"error"` 或 `2`：开启规则，抛出错误，会打断流程
* 配置可选参数：当规则需要额外参数时，将值设为一个数组，第一个元素是严重程度，之后是具体配置项
  * 示例：通过数组配置 `quotes` 规则的效果：`"quotes": ["warn", "double"]` 表示警告级别，并强制使用双引号（`"`）
* 关闭规则：在文件开头用 `/* eslint-disable */`，或在行尾用 `// eslint-disable-line` 临时关闭

#### 🧩 `processor`：处理非 JS 文件
* `processor` 用于让 `ESLint` 处理非 `JS` 文件中的 `JS` 代码块。一个常见场景是在 `.md` 文件中检查 `JS` 代码片段的风格
 ```js
 export default [
    {
        files: ["**/*.md"],
        processor: "my-plugin/markdown" // 假设 my-plugin 提供了 markdown 处理器
    },
    // 为代码块内部应用规则
    {
        files: ["**/*.md/*.js"],
        rules: {
            "no-console": "off" // 在文档示例中允许 console
        }
    }
];
 ```
 ### 🔧 实用配置示例
 ```js
 // eslint.config.js
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
    // 1. 全局忽略：排除无需检查的文件和目录
    {
        ignores: ["**/node_modules/", "**/dist/", "**/.git/"]
    },

    // 2. 基础配置：为所有 JS/TS 文件设置通用规则和语言选项
    {
        files: ["src/**/*.js", "src/**/*.ts"],
        plugins: {
            "@typescript-eslint": tsPlugin
        },
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            parser: tsParser,
            parserOptions: {
                project: "./tsconfig.json"
            }
        },
        rules: {
            ...js.configs.recommended.rules,
            ...tsPlugin.configs.recommended.rules,
            "eqeqeq": ["error", "always"],
            "no-console": "warn",
            "camelcase": ["error", { properties: "always" }]
        }
    },

    // 3. 针对测试文件的特定配置：覆盖基础配置规则
    {
        files: ["**/*.test.js"],
        rules: {
            "no-console": "off"
        }
    }
];
 ```
 ### 忽略文件: 直接通过 ignores 属性（最推荐）
 * 首选 ignores：将 ignores 放在一个独立的、没有 files 字段的配置对象中，这是最可靠且万无一失的做法
 ```js
 // eslint.config.js
export default [
    {
        ignores: [
            "**/node_modules",
            "**/dist",
            "**/coverage",
            "**/*.min.js",
            "**/temp.js"
        ]
    },
    // ... 其他配置对象
];
 ```