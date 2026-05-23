# EditorConfig

## 简介

[EditorConfig](https://editorconfig.org/) 是一个跨编辑器/IDE 的编码风格配置格式，帮助开发者在不同的编辑器和 IDE 之间保持一致的编码风格。

当你在项目中包含 `.editorconfig` 文件时，所有支持 EditorConfig 的编辑器都会自动按照该配置来格式化代码。

## 项目结构

```
project-root/
├── .editorconfig          # 项目根配置
├── src/
│   ├── .editorconfig      # 子目录配置（可选，覆盖根配置）
│   └── ...
└── ...
```

## 基本语法

### 文件格式

```ini
# 注释以 # 或 ; 开头
root = true  # 声明为根配置文件，停止向上查找

[*]          # 匹配所有文件
charset = utf-8

[*.js]       # 匹配所有 .js 文件
indent_style = space
indent_size = 2

[*.md]       # 匹配所有 .md 文件
trim_trailing_whitespace = false
```

### 通配符模式

| 模式 | 说明 | 示例 |
|------|------|------|
| `*` | 匹配任意文件（不包括 `/`） | `[*]` 所有文件 |
| `**` | 匹配任意字符串（包括 `/`） | `[**/*.js]` 所有子目录的 js |
| `?` | 匹配单个字符 | `[file?.txt]` |
| `[name]` | 匹配 name 中的任意字符 | `[*.{js,ts}]` |
| `[!name]` | 匹配不在 name 中的字符 | `[*.html!]` |
| `{s1,s2,s3}` | 匹配任意给定字符串 | `[*.{js,ts,vue}]` |
| `{num1..num2}` | 匹配 num1 到 num2 之间的整数 | `[file{1..5}.txt]` |

## 配置属性

### 基础属性

#### `root`
声明这是最顶层的配置文件，编辑器找到该文件后不会再向上查找。

```ini
root = true
```

#### `charset`
文件字符编码

| 值 | 说明 |
|---|---|
| `utf-8` | UTF-8 编码（推荐） |
| `utf-8-bom` | UTF-8 with BOM |
| `utf-16be` | UTF-16 Big Endian |
| `utf-16le` | UTF-16 Little Endian |
| `latin1` | ISO-8859-1 |

```ini
charset = utf-8
```

#### `indent_style`
缩进风格

| 值 | 说明 |
|---|---|
| `space` | 使用空格缩进（推荐） |
| `tab` | 使用制表符缩进 |

```ini
indent_style = space
```

#### `indent_size`
缩进大小（每级缩进的空格数）

```ini
indent_size = 2
```

当 `indent_style = tab` 时，若设为 `tab` 则表示使用 tab_width 的值：

```ini
indent_style = tab
indent_size = tab
```

#### `tab_width`
设置 tab 字符的宽度（空格数），默认与 indent_size 相同

```ini
tab_width = 4
```

#### `end_of_line`
行尾符格式

| 值 | 说明 |
|---|---|
| `lf` | `\n` - Unix/Linux/macOS（推荐） |
| `crlf` | `\r\n` - Windows |
| `cr` | `\r` - 旧版 Mac |

```ini
end_of_line = lf
```

#### `trim_trailing_whitespace`
删除行尾空白

```ini
trim_trailing_whitespace = true
```

#### `insert_final_newline`
文件末尾插入空行

```ini
insert_final_newline = true
```

#### `max_line_length`
单行最大长度（非强制，仅供参考）

```ini
max_line_length = 100
```

## 完整配置示例

```ini
# EditorConfig is awesome: https://EditorConfig.org

root = true

# 所有文件
[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

# Markdown 文件保留行尾空格（两个空格表示硬换行）
[*.md]
trim_trailing_whitespace = false

# JSON/YAML 文件使用 2 空格
[*.{json,yaml,yml}]
indent_size = 2

# HTML/Vue 文件
[*.{html,vue}]
indent_size = 2

# JS/TS 文件
[*.{js,ts,jsx,tsx}]
indent_size = 2

# CSS/SCSS 文件
[*.{css,scss,less}]
indent_size = 2

# Shell 脚本使用 4 空格
[*.sh]
indent_size = 4

# Python 文件使用 4 空格
[*.py]
indent_size = 4

# Makefile 必须使用 tab
[Makefile]
indent_style = tab

# 特定目录
[lib/**.{js,ts}]
indent_size = 4

# 排除模式（部分编辑器支持）
[*.min.js]
indent_style = ignore
indent_size = ignore
```

## 编辑器/IDE 配置

### VS Code

#### 方法一：内置支持
VS Code 原生支持 EditorConfig，无需额外配置。

#### 方法二：安装插件（推荐）
安装 [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig) 插件可获得更好的支持。

```bash
code --install-extension EditorConfig.EditorConfig
```

#### 配置
在 `settings.json` 中：

```json
{
  "editor.formatOnSave": true,
  "editor.tabSize": 2,
  "editor.insertSpaces": true
}
```

### WebStorm / IntelliJ IDEA

#### 内置支持
JetBrains IDEs 内置支持 EditorConfig。

#### 配置路径
`Settings/Preferences` → `Editor` → `Code Style` → `EditorConfig`

#### 启用步骤
1. 打开 Settings
2. 搜索 `EditorConfig`
3. 勾选 `Enable EditorConfig support`

### Vim / Neovim

#### 安装插件
使用 [editorconfig-vim](https://github.com/editorconfig/editorconfig-vim)

```vim
" 使用 vim-plug
Plug 'editorconfig/editorconfig-vim'

" 使用 Vundle
Plugin 'editorconfig/editorconfig-vim'

" 使用 dein.vim
call dein#add('editorconfig/editorconfig-vim')
```

#### 配置
```vim
" .vimrc
let g:EditorConfig_exclude_patterns = ['fugitive://.*', 'scp://.*']
let g:EditorConfig_max_line_indicator = 'line'
```

### Emacs

#### 安装插件
使用 [editorconfig-emacs](https://github.com/editorconfig/editorconfig-emacs)

```elisp
;; 使用 package.el
(package-install 'editorconfig)

;; 使用 use-package
(use-package editorconfig
  :ensure t
  :config
  (editorconfig-mode 1))
```

### Sublime Text

#### 安装插件
1. 通过 Package Control 安装 `EditorConfig`

#### 配置
```json
// Preferences -> Package Settings -> EditorConfig -> Settings - User
{
  "editorconfig_generations": [
    {
      "default": {
        "trim_trailing_whitespace_on_save": true
      }
    }
  ]
}
```

### Atom

#### 安装插件
```bash
apm install editorconfig
```

或通过 Settings → Install 搜索 `editorconfig`

### JetBrains 系列

所有 JetBrains IDE（WebStorm、IntelliJ IDEA、PyCharm 等）都内置支持：

1. `Settings/Preferences` → `Editor` → `Code Style`
2. 勾选 `Enable EditorConfig support`

### ESLint 集成

#### 安装插件
```bash
npm install --save-dev eslint-editorconfig
```

#### 配置
```javascript
// .eslintrc.js
const editorConfig = require('eslint-editorconfig')

module.exports = {
  ...editorConfig.resolve('.editorconfig').toESLint()
}
```

## 与其他工具配合

### Prettier

EditorConfig 和 Prettier 可以配合使用：

```ini
# .editorconfig
[*]
indent_style = space
indent_size = 2
```

```json
// .prettierrc
{
  "useTabs": false,
  "tabWidth": 2,
  "endOfLine": "lf"
}
```

**建议**：使用 Prettier 时，EditorConfig 作为补充配置，主要格式化由 Prettier 处理。

### Git Hooks

使用 [husky](https://github.com/typicode/husky) 和 [lint-staged](https://github.com/okonet/lint-staged) 自动检查：

```bash
npm install --save-dev husky lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*": "prettier --write --ignore-unknown"
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

## 注意事项

### 1. 文件编码
`.editorconfig` 文件必须使用 **UTF-8** 编码。

### 2. 属性优先级

1. 更具体的文件匹配模式优先
2. 后面定义的规则优先
3. 子目录的 `.editorconfig` 覆盖父目录

```ini
# 先定义所有文件
[*]
indent_size = 4

# 后定义特定文件，会覆盖
[*.js]
indent_size = 2
```

### 3. 不支持的属性

不同编辑器对某些属性支持程度不同：

- `max_line_length` - 大多数编辑器仅为参考
- `insert_final_newline` - VSCode 完整支持
- 部分编辑器忽略不支持属性，不会报错

### 4. 与编辑器设置冲突

当编辑器自带设置与 EditorConfig 冲突时：
- **优先级**：EditorConfig > 编辑器默认设置
- **手动设置**：编辑器手动设置 > EditorConfig

### 5. 缓存问题

某些编辑器可能需要重启才能使 `.editorconfig` 生效。

### 6. 版本控制

将 `.editorconfig` 提交到版本控制，确保团队统一：

```bash
git add .editorconfig
git commit -m "Add EditorConfig configuration"
```

### 7. Makefile 特殊处理

Makefile **必须** 使用 Tab 缩进：

```ini
[Makefile]
indent_style = tab
```

### 8. Python 项目

PEP 8 推荐使用 4 空格：

```ini
[*.py]
indent_style = space
indent_size = 4
max_line_length = 88
```

### 9. 多项目共用

在用户目录创建全局配置：

```ini
# ~/.editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
```

### 10. 调试技巧

编辑器未生效时检查：
1. 文件编码是否为 UTF-8
2. 文件名是否为 `.editorconfig`（无其他后缀）
3. 是否位于项目根目录
4. 编辑器是否安装/启用插件
5. 尝试重启编辑器

## 在线验证

使用 [EditorConfig 在线验证工具](https://editorconfig.org/) 验证配置是否正确。

## 最佳实践

```ini
# 推荐的基础配置
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

# 换行敏感
[*.{md,yml}]
trim_trailing_whitespace = false

# Tab 必需
[Makefile]
indent_style = tab
```

## 参考链接

- [EditorConfig 官网](https://editorconfig.org/)
- [VS Code 插件](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
- [完整属性文档](https://github.com/editorconfig/editorconfig/wiki/EditorConfig-Properties)
