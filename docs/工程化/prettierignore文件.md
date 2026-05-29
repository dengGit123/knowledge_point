# .prettierignore 文件

## 简介

`.prettierignore` 文件用于指定 Prettier 需要忽略的文件和目录，这些文件将不会被格式化。

## 工作原理

Prettier 在格式化前会检查 `.prettierignore` 文件，匹配到的文件会被跳过。

**与 .gitignore 的区别**：
- `.prettierignore` 语法类似 `.gitignore`
- `.prettierignore` 只影响格式化，不影响 Git 追踪
- Prettier 会自动尊重 `.gitignore` 中的规则

## 文件位置

```
project-root/
├── .prettierignore      # 项目根目录
├── .prettierrc          # Prettier 配置
└── package.json         # 也可在 prettier.ignore 配置
```

## 语法规则

`.prettierignore` 使用与 [minimatch](https://github.com/isaacs/minimatch) 相同的模式匹配语法。

### 基本语法

| 模式 | 说明 | 示例 |
|------|------|------|
| `#` | 注释 | `# 这是注释` |
| `空行` | 无匹配 | - |
| `**/file.js` | 匹配所有目录下的 file.js | `**/test.js` |
| `*.js` | 匹配根目录所有 .js | `*.js` |
| `**/*.js` | 匹配所有目录的 .js | `**/*.js` |
| `dir/` | 匹配目录 | `build/` |
| `/file.js` | 只匹配根目录 | `/config.js` |

### 通配符

| 符号 | 说明 | 示例 |
|------|------|------|
| `*` | 匹配任意字符（除 `/`） | `*.js` |
| `**` | 匹配任意多层目录 | `**/test.js` |
| `?` | 匹配单个字符 | `file?.js` |
| `{a,b}` | 匹配 a 或 b | `*.{js,ts}` |
| `!` | 否定（重新包含） | `!src/index.js` |
| `[]` | 字符范围 | `src/[0-9]/*.js` |

## 完整配置示例

### 通用项目

```text
# ======== 依赖目录 ========
node_modules/
.pnpm-store/
.yarn/
.yarn/cache/
jspm_packages/

# ======== 构建产物 ========
dist/
build/
out/
.output/
.next/
.nuxt/
.vite/
.turbo/

# ======== 缓存目录 ========
.cache/
.parcel-cache/
.eslintcache
.stylelintcache
.tsbuildinfo

# ======== 环境配置 ========
.env
.env.*
!.env.example

# ======== 锁定文件 ========
package-lock.json
yarn.lock
pnpm-lock.yaml
bun.lockb

# ======== 文档和配置 ========
CHANGELOG.md
LICENSE
README.md
CONTRIBUTING.md

# ======== 静态资源 ========
**/*.svg
**/*.png
**/*.jpg
**/*.jpeg
**/*.gif
**/*.ico
**/*.webp
**/*.woff
**/*.woff2
**/*.ttf
**/*.eot

# ======== 压缩文件 ========
**/*.min.js
**/*.min.css
**/*.bundle.js

# ======== 其他生成文件 ========
coverage/
.nyc_output/
```


```

### Vue 项目

```text
# 依赖
node_modules/
.pnp/
.pnp.js

# 构建产物
dist/
dist-ssr/
*.local

# 缓存
.vite/
.nuxt/
.cache/
.parcel-cache/

# 配置文件
package-lock.json
yarn.lock
pnpm-lock.yaml

# 环境变量
.env
.env.local
.env.*.local

# 静态资源
public/assets/**/*.svg
public/assets/**/*.png

# 其他
coverage/
*.min.js
*.min.css
```

### React 项目

```text
# 依赖
node_modules/
.pnp/
.pnp.js

# 构建产物
build/
dist/
out/

# 缓存
.cache/
.parcel-cache/
.eslintcache
.turbo/

# 环境变量
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# 配置
package-lock.json
yarn.lock
pnpm-lock.yaml

# 其他
coverage/
*.min.js
*.min.css
**/*.svg
```

### Next.js 项目

```text
# 依赖
node_modules/
.pnp

# Next.js 构建产物
.next/
out/
build/
dist/

# 缓存
.turbo/
.cache/

# 环境变量
.env*.local

# 其他
coverage/
*.min.js
*.min.css
package-lock.json
yarn.lock
pnpm-lock.yaml
```

### Nuxt 3 项目

```text
# 依赖
node_modules/
.pnp/

# Nuxt 构建产物
.nuxt/
.output/

# 缓存
.vite/
.cache/

# 环境变量
.env
.env.*.local

# 其他
dist/
coverage/
*.min.js
*.min.css
```

### Vite 项目

```text
# 依赖
node_modules/

# Vite 缓存
.vite/
dist/

# 环境变量
.env

# 其他
.cache/
coverage/
*.min.js
*.min.css
```

### TypeScript 项目

```text
# 依赖
node_modules/

# 构建产物
dist/
build/
out/

# 类型生成
*.d.ts.map

# 缓存
.tsbuildinfo

# 其他
coverage/
*.min.js
```

### Monorepo 项目

```text
# 依赖
node_modules/
.pnpm-store/
.yarn/

# 构建产物
**/dist/
**/build/
**/out/
**/.next/
**/.nuxt/

# 缓存
**/.turbo/
**/.cache/
**/.vite/

# 锁定文件
**/package-lock.json
**/yarn.lock
**/pnpm-lock.yaml

# 环境变量
**/.env
**/.env.*
**/!.env.example

# 文档
**/CHANGELOG.md
**/LICENSE

# 压缩文件
**/*.min.js
**/*.min.css
```

## 如何生效

### 1. 命令行使用

```bash
# 检查哪些文件会被忽略
npx prettier --check "**/*.{js,ts,jsx,tsx,vue,css,scss,html,md}"

# 格式化（自动跳过 .prettierignore 中的文件）
npx prettier --write "**/*.{js,ts,jsx,tsx,vue,css,scss,html,md}"

# 显示调试信息
npx prettier --write "**/*.{js,ts}" --debug-check
```

### 2. npm scripts

```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "format:staged": "prettier --write"
  }
}
```

### 3. 与 lint-staged 结合

```json
{
  "lint-staged": {
    "*.{js,ts,jsx,tsx,vue}": [
      "prettier --write",
      "eslint --fix"
    ],
    "*.{css,scss,less}": [
      "prettier --write",
      "stylelint --fix"
    ]
  }
}
```

### 4. Git Hooks

```bash
# .husky/pre-commit
npx lint-staged
```

### 5. 编辑器集成

#### VS Code

安装 [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) 插件。

```json
// .vscode/settings.json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "prettier.requireConfig": true,
  "[javascript]": {
    "editor.formatOnSave": true
  },
  "[typescript]": {
    "editor.formatOnSave": true
  },
  "[vue]": {
    "editor.formatOnSave": true
  }
}
```

#### WebStorm

`Settings/Preferences` → `Languages & Frameworks` → `JavaScript` → `Prettier`：

- ✅ Run on save for files
- ✅ On 'Reformat Code' action

## 与 .gitignore 的关系

### 自动忽略

Prettier 会自动忽略 `.gitignore` 中的规则：

```
# .gitignore
node_modules/
dist/

# .prettierignore 无需重复
```

### 禁用自动读取

如果只想用 `.prettierignore`，可以禁用：

```json
// package.json
{
  "prettier": {
    "ignorePath": ".prettierignore",
    "withNodeModules": false
  }
}
```

## 与 package.json 的关系

可以在 `package.json` 中配置：

```json
{
  "prettier": {
    "ignorePath": ".prettierignore",
    "overrides": [
      {
        "files": "*.test.js",
        "options": {
          "trailingComma": "es5"
        }
      }
    ]
  }
}
```

或在 `prettier.ignore` 字段（旧版本）：

```json
{
  "prettier": {
    "ignore": [
      "dist/**",
      "node_modules/**"
    ]
  }
}
```

## 配置优先级

从高到低：

1. 命令行 `--ignore-path` 参数
2. `.prettierignore` 文件
3. `.gitignore` 文件（自动读取）

```bash
# 使用自定义忽略文件
npx prettier --write . --ignore-path .prettierignore.custom
```

## 验证规则

### 检查文件是否被忽略

```bash
# 方法一：使用 debug-check
npx prettier --write "src/**/*.js" --debug-check

# 方法二：尝试格式化
npx prettier --write "path/to/file.js"

# 方法三：使用 --check 模式
npx prettier --check "src/**/*.js"
```

### 查看被格式化的文件

```bash
# 显示详细信息
npx prettier --write "src/**/*.js" --log-level debug

# 只列出要格式化的文件
npx prettier --list-different "src/**/*.js"
```

## 常见问题

### 1. 规则不生效

**原因**：文件路径或语法错误

**解决**：
```bash
# 检查语法是否正确
npx prettier --find-config-path path/to/file.js

# 使用绝对路径测试
npx prettier --write /absolute/path/to/file.js
```

### 2. 想格式化被忽略的文件

```bash
# 方法一：使用 --ignore-path 指向空文件
npx prettier --write path/to/file.js --ignore-path /dev/null

# 方法二：使用 --no-ignore-path（不推荐）
npx prettier --write path/to/file.js --no-ignore-path

# 方法三：直接指定文件
npx prettier --write path/to/ignored/file.js
```

### 3. 否定规则不生效

```text
# 错误示例
**/*.js
!src/index.js    # ❌ 可能不生效

# 正确写法：更具体的模式
**/*.js
src/index.js    # ✅ 使用更具体的规则覆盖
```

### 4. 忽略所有但保留部分

```text
# 忽略所有
**/*.js

# 保留 src 目录
!src/**/*.js
```

### 5. 与 ESLint 集成冲突

```json
// .eslintrc.js
module.exports = {
  extends: ['plugin:prettier/recommended'] // 确保 prettier 是最后
}
```

## 最佳实践

### 推荐结构

```text
# ========== 1. 注释说明 ==========
# Prettier 忽略文件配置

# ========== 2. 依赖目录 ==========
node_modules/
.yarn/

# ========== 3. 构建产物 ==========
dist/
build/
out/

# ========== 4. 缓存 ==========
.cache/
.vite/

# ========== 5. 环境配置 ==========
.env*
!.env.example

# ========== 6. 锁定文件 ==========
package-lock.json
yarn.lock
pnpm-lock.yaml

# ========== 7. 压缩文件 ==========
**/*.min.js
**/*.min.css

# ========== 8. 静态资源 ==========
**/*.{png,jpg,jpeg,gif,svg,ico,woff,woff2,ttf,eot}

# ========== 9. 文档 ==========
CHANGELOG.md
LICENSE

# ========== 10. 其他 ==========
coverage/
```

### 实用技巧

```text
# 1. 使用双星号匹配所有层级
**/dist/
**/coverage/

# 2. 匹配特定文件类型
**/*.{test,spec}.{js,ts}

# 3. 排除特定文件但保留其他
dist/**
!dist/index.html

# 4. 匹配模式文件
**/config.*.js

# 5. 使用注释分组
# ======== 生产环境 ==========
.env.prod
.env.production

# ======== 开发环境 ==========
.env.dev
.env.development

# ======== 测试环境 ==========
.env.test
```

## 注意事项

1. **编码要求**：`.prettierignore` 文件必须使用 UTF-8 编码
2. **行尾符**：建议使用 LF（Unix 风格）
3. **路径分隔符**：统一使用正斜杠 `/`
4. **空格处理**：规则行首尾不要有空格
5. **注释位置**：注释可以单独一行或规则后
6. **自动 gitignore**：会自动读取 `.gitignore`，无需重复
7. **文件更新**：修改后无需重启，立即生效
8. **团队统一**：提交到版本控制，确保团队一致
9. **位置要求**：放在项目根目录
10. **否定规则**：`!` 规则放在被否定规则之后

## 与其他工具配合

### ESLint

```json
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended' // Prettier 规则优先
  ]
}
```

### Stylelint

```json
// .stylelintrc.js
module.exports = {
  extends: ['stylelint-prettier/recommended']
}
```

### husky + lint-staged

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{js,ts,jsx,tsx,vue,css,scss,html,md}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

## 参考链接

- [Prettier 官方文档 - Ignoring Code](https://prettier.io/docs/en/ignore.html)
- [minimatch 文档](https://github.com/isaacs/minimatch)
- [.prettierignore 在线生成](https://www.toptal.com/developers/gitignore#generated)
