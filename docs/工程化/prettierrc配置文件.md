# .prettierrc 配置文件

## 简介

`.prettierrc` 是 Prettier 的配置文件，用于定义代码格式化规则。

## 配置文件格式

Prettier 支持多种配置文件格式：

| 文件名 | 格式 | 优先级 |
|--------|------|--------|
| `.prettierrc` | JSON / YAML | 1 |
| `.prettierrc.json` | JSON | 1 |
| `.prettierrc.yaml` / `.yml` | YAML | 1 |
| `.prettierrc.toml` | TOML | 1 |
| `prettier.config.js` / `.cjs` | JavaScript | 1 |
| `.prettierrc.js` | JavaScript | 1 |
| `package.json` 的 `prettier` 字段 | JSON | 2 |

## JSON 格式示例

```json
{
  "$schema": "https://json.schemastore.org/prettierrc",
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf"
}
```

## YAML 格式示例

```yaml
# .prettierrc.yaml
semi: true
trailingComma: es5
singleQuote: true
printWidth: 80
tabWidth: 2
useTabs: false
endOfLine: lf
```

## JavaScript 格式示例

```javascript
// prettier.config.js
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  endOfLine: 'lf',
};
```

## 配置属性详解

### 1. printWidth

指定单行最大字符数，超过此长度会尝试换行。

| 类型 | 默认值 |
|------|--------|
| number | `80` |

```json
{
  "printWidth": 100
}
```

#### 格式化效果

```javascript
// 配置: "printWidth": 40

// 输入
const result = someFunction(param1, param2, param3, param4);

// 输出 - 超过40字符时换行
const result = someFunction(
  param1,
  param2,
  param3,
  param4
);
```

---

### 2. tabWidth

指定缩进级别的空格数。

| 类型 | 默认值 |
|------|--------|
| number | `2` |

```json
{
  "tabWidth": 4
}
```

#### 格式化效果

```javascript
// 配置: "tabWidth": 4

// 输入
function hello() {
const message = "world";
}

// 输出
function hello() {
    const message = "world";
}
```

---

### 3. useTabs

使用 Tab 缩进还是空格缩进。

| 类型 | 默认值 |
|------|--------|
| boolean | `false` |

```json
{
  "useTabs": true
}
```

#### 格式化效果

```javascript
// 配置: "useTabs": false
function hello() {
  const message = "world";  // 使用空格
}

// 配置: "useTabs": true
function hello() {
	const message = "world";  // 使用 Tab
}
```

---

### 4. semi

是否在语句末尾添加分号。

| 类型 | 默认值 |
|------|--------|
| boolean | `true` |

```json
{
  "semi": false
}
```

#### 格式化效果

```javascript
// 配置: "semi": true
const name = "John";
console.log(name);

// 配置: "semi": false
const name = "John"
console.log(name)
```

---

### 5. singleQuote

使用单引号还是双引号。

| 类型 | 默认值 |
|------|--------|
| boolean | `false` |

```json
{
  "singleQuote": true
}
```

#### 格式化效果

```javascript
// 配置: "singleQuote": false
const message = "Hello World";

// 配置: "singleQuote": true
const message = 'Hello World';
```

---

### 6. quoteProps

对象属性的引号策略。

| 值 | 说明 |
|---|---|
| `"as-needed"` | 仅在需要时添加引号 |
| `"consistent"` | 如果对象中至少有一个属性使用了引号，则所有属性都加引号 |
| `"preserve"` | 保留用户输入的引号 |

**默认值**：`"as-needed"`

```json
{
  "quoteProps": "as-needed"
}
```

#### 格式化效果

```javascript
// 配置: "quoteProps": "as-needed"
const obj = {
  foo: "bar",
  "data-id": "123",  // 需要引号
  "my-key": "value"  // 需要引号
};

// 配置: "quoteProps": "consistent"
const obj = {
  "foo": "bar",
  "data-id": "123",
  "my-key": "value"
};

// 配置: "quoteProps": "preserve"
const obj = {
  foo: "bar",
  "data-id": "123",
  'my-key': "value"
};
```

---

### 7. jsxSingleQuote

JSX 中使用单引号。

| 类型 | 默认值 |
|------|--------|
| boolean | `false` |

```json
{
  "jsxSingleQuote": true
}
```

#### 格式化效果

```jsx
// 配置: "jsxSingleQuote": false
const element = <div className="container">Hello</div>;

// 配置: "jsxSingleQuote": true
const element = <div className='container'>Hello</div>;
```

---

### 8. trailingComma

多行时是否添加尾随逗号。

| 值 | 说明 | 适用场景 |
|---|---|---|
| `"none"` | 不添加尾随逗号 | - |
| `"es5"` | 在 ES5 允许的地方添加（对象、数组） | 兼容旧环境 |
| `"all"` | 尽可能添加（函数参数等） | 现代 JavaScript |

**默认值**：`"es5"`

```json
{
  "trailingComma": "all"
}
```

#### 格式化效果

```javascript
// 配置: "trailingComma": "none"
const obj = {
  foo: "bar",
  baz: "qux"
};

const arr = [
  1,
  2,
  3
];

function foo(
  a,
  b,
  c
) {}

// 配置: "trailingComma": "es5"
const obj = {
  foo: "bar",
  baz: "qux",  // ✅ 对象尾随逗号
};

const arr = [
  1,
  2,
  3,  // ✅ 数组尾随逗号
];

function foo(
  a,
  b,
  c  // ❌ 函数参数无尾随逗号
) {}

// 配置: "trailingComma": "all"
const obj = {
  foo: "bar",
  baz: "qux",  // ✅
};

const arr = [
  1,
  2,
  3,  // ✅
];

function foo(
  a,
  b,
  c,  // ✅ 函数参数也有尾随逗号
) {}
```

---

### 9. bracketSpacing

对象字面量括号内的空格。

| 类型 | 默认值 |
|------|--------|
| boolean | `true` |

```json
{
  "bracketSpacing": false
}
```

#### 格式化效果

```javascript
// 配置: "bracketSpacing": true
const obj = { foo: "bar", baz: "qux" };

// 配置: "bracketSpacing": false
const obj = {foo: "bar", baz: "qux"};
```

---

### 10. bracketSameLine

将 HTML/Vue/JSX 的 `>` 放在最后一行的末尾，而不是单独一行。

| 类型 | 默认值 |
|------|--------|
| boolean | `false` |

```json
{
  "bracketSameLine": true
}
```

#### 格式化效果

```jsx
// 配置: "bracketSameLine": false
const element = (
  <div
    className="container"
    style={{ color: "red" }}
  >
    Hello
  </div>
);

// 配置: "bracketSameLine": true
const element = (
  <div
    className="container"
    style={{ color: "red" }}>
    Hello
  </div>
);
```

---

### 11. arrowParens

箭头函数参数是否使用括号。

| 值 | 说明 |
|---|---|
| `"always"` | 始终包含括号 |
| `"avoid"` | 单个参数时省略括号 |

**默认值**：`"always"`

```json
{
  "arrowParens": "avoid"
}
```

#### 格式化效果

```javascript
// 配置: "arrowParens": "always"
const foo = (x) => x * 2;
const bar = () => {};

// 配置: "arrowParens": "avoid"
const foo = x => x * 2;
const bar = () => {};
```

---

### 12. proseWrap

Markdown 文本换行方式。

| 值 | 说明 |
|---|---|
| `"preserve"` | 保持原样 |
| `"always"` | 超过 printWidth 时换行 |
| `"never"` | 不换行 |

**默认值**：`"preserve"`

```json
{
  "proseWrap": "always"
}
```

#### 格式化效果

```markdown
<!-- 配置: "proseWrap": "preserve" -->
This is a very long line of text that will not be wrapped no matter how long it is.

<!-- 配置: "proseWrap": "always" -->
This is a very long line of text that will be wrapped when it exceeds the
printWidth limit.

<!-- 配置: "proseWrap": "never" -->
This is a very long line of text that will never be wrapped even if it exceeds the printWidth limit.
```

---

### 13. htmlWhitespaceSensitivity

HTML 空白敏感度。

| 值 | 说明 |
|---|---|
| `"css"` | 遵循 CSS `white-space` 属性 |
| `"strict"` | 空格敏感 |
| `"ignore"` | 空格不敏感 |

**默认值**：`"css"`

```json
{
  "htmlWhitespaceSensitivity": "strict"
}
```

#### 格式化效果

```html
<!-- 配置: "htmlWhitespaceSensitivity": "css" -->
<div>
  <span> Hello </span>
  <span> World </span>
</div>

<!-- 配置: "htmlWhitespaceSensitivity": "strict" -->
<div>
  <span>Hello</span>
  <span>World</span>
</div>
```

---

### 14. vueIndentScriptAndStyle

Vue 文件中 `<script>` 和 `<style>` 标签的缩进。

| 类型 | 默认值 |
|------|--------|
| boolean | `false` |

```json
{
  "vueIndentScriptAndStyle": true
}
```

#### 格式化效果

```vue
<!-- 配置: "vueIndentScriptAndStyle": false -->
<template>
  <div>Hello</div>
</template>
<script>
const message = "world";
</script>
<style>
.container {
  color: red;
}
</style>

<!-- 配置: "vueIndentScriptAndStyle": true -->
<template>
  <div>Hello</div>
</template>
<script>
  const message = "world";
</script>
<style>
  .container {
    color: red;
  }
</style>
```

---

### 15. endOfLine

行尾符风格。

| 值 | 说明 |
|---|---|
| `"lf"` | `\n` - Unix / macOS |
| `"crlf"` | `\r\n` - Windows |
| `"cr"` | `\r` - 旧版 Mac |
| `"auto"` | 保持现有 |

**默认值**：`"lf"`

```json
{
  "endOfLine": "lf"
}
```

#### 格式化效果

```javascript
// 配置: "endOfLine": "lf"
const message = "Hello";\n

// 配置: "endOfLine": "crlf"
const message = "Hello";\r\n
```

---

### 16. embeddedLanguageFormatting

控制是否格式化嵌入代码（如 Markdown 中的代码块）。

| 值 | 说明 |
|---|---|
| `"auto"` | 自动格式化 |
| `"off"` | 不格式化 |

**默认值**：`"auto"`

```json
{
  "embeddedLanguageFormatting": "off"
}
```

#### 格式化效果

```markdown
<!-- 配置: "embeddedLanguageFormatting": "auto" -->
# JavaScript 示例

\`\`\`javascript
const foo = function() { return "bar" }
\`\`\`
<!-- 会被格式化 -->

<!-- 配置: "embeddedLanguageFormatting": "off" -->
# JavaScript 示例

\`\`\`javascript
const foo = function() { return "bar" }
\`\`\`
<!-- 保持原样 -->
```

---

### 17. singleAttributePerLine

HTML/Vue/JSX 中每个属性单独一行。

| 类型 | 默认值 |
|------|--------|
| boolean | `false` |

```json
{
  "singleAttributePerLine": true
}
```

#### 格式化效果

```jsx
// 配置: "singleAttributePerLine": false
const element = (
  <div id="app" className="container" style={{ color: "red" }}>
    Hello
  </div>
);

// 配置: "singleAttributePerLine": true
const element = (
  <div
    id="app"
    className="container"
    style={{ color: "red" }}
  >
    Hello
  </div>
);
```

---

## 完整配置示例

### JavaScript/TypeScript 项目

```json
{
  "$schema": "https://json.schemastore.org/prettierrc",
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf",
  "arrowParens": "always",
  "bracketSpacing": true,
  "bracketSameLine": false
}
```

### Vue 项目

```json
{
  "$schema": "https://json.schemastore.org/prettierrc",
  "semi": false,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf",
  "vueIndentScriptAndStyle": false,
  "singleAttributePerLine": false
}
```

### React 项目

```json
{
  "$schema": "https://json.schemastore.org/prettierrc",
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "jsxSingleQuote": false,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf",
  "arrowParens": "always",
  "bracketSameLine": false,
  "singleAttributePerLine": true
}
```

### Markdown 项目

```json
{
  "$schema": "https://json.schemastore.org/prettierrc",
  "proseWrap": "preserve",
  "htmlWhitespaceSensitivity": "css",
  "endOfLine": "lf"
}
```

## 覆盖配置 (overrides)

针对不同文件类型使用不同配置：

```json
{
  "semi": true,
  "singleQuote": true,
  "overrides": [
    {
      "files": "*.md",
      "options": {
        "proseWrap": "always",
        "semi": false
      }
    },
    {
      "files": [".prettierrc", ".eslintrc"],
      "options": {
        "parser": "json"
      }
    },
    {
      "files": "*.vue",
      "options": {
        "singleQuote": true,
        "semi": false
      }
    },
    {
      "files": ["*.tsx", "*.jsx"],
      "options": {
        "jsxSingleQuote": false
      }
    }
  ]
}
```

## 配置优先级

从高到低：

1. 命令行参数 `--config`
2. 项目配置文件 `.prettierrc`
3. `package.json` 的 `prettier` 字段
4. Prettier 默认配置

```bash
# 使用指定配置文件
npx prettier --write . --config .prettierrc.custom
```

## 禁用规则

### 单行禁用

```javascript
// prettier-ignore
const matrix = [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
];
```

### 文件禁用

在文件顶部添加：

```javascript
// @prettier
const arr = [1,2,3,4]; // 不会被格式化
```

### 配置文件中排除

使用 `.prettierignore`：

```prettierignore
# 忽略整个文件
config.js

# 忽略目录
dist/
```

## 验证配置

### 检查配置文件

```bash
# 查找配置文件路径
npx prettier --find-config-path src/index.js

# 验证配置
npx prettier --check "**/*.{js,ts,jsx,tsx,vue}"
```

### 查看效果

```bash
# 检查格式（不修改文件）
npx prettier --check "**/*.{js,ts}"

# 格式化并显示详情
npx prettier --write "**/*.{js,ts}" --log-level debug

# 列出需要格式化的文件
npx prettier --list-different "**/*.{js,ts}"
```

## 配置文件冲突

### 与 ESLint 冲突

安装 `eslint-config-prettier` 禁用冲突规则：

```bash
npm install --save-dev eslint-config-prettier
```

```json
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'prettier' // 必须放在最后
  ]
};
```

### 与 EditorConfig 冲突

配置相同的规则避免冲突：

```ini
# .editorconfig
[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

```json
// .prettierrc
{
  "useTabs": false,
  "tabWidth": 2,
  "endOfLine": "lf"
}
```

## 最佳实践

### 推荐配置（Vue3 + TypeScript）

```json
{
  "$schema": "https://json.schemastore.org/prettierrc",
  "semi": false,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "none",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "vueIndentScriptAndStyle": false,
  "singleAttributePerLine": false,
  "overrides": [
    {
      "files": "*.md",
      "options": {
        "proseWrap": "preserve",
        "htmlWhitespaceSensitivity": "css"
      }
    }
  ]
}
```

### 团队协作建议

1. **提交配置文件**：将 `.prettierrc` 提交到版本控制
2. **统一规则**：团队成员使用相同配置
3. **自动化**：配置 Git Hooks 自动格式化
4. **文档化**：在 README 中说明配置规则

### npm scripts

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "format:staged": "prettier --write"
  }
}
```

## 参考链接

- [Prettier 官方文档 - Options](https://prettier.io/docs/en/options.html)
- [Prettier 在线编辑器](https://prettier.io/playground/)
- [.prettierrc Schema](https://json.schemastore.org/prettierrc)
