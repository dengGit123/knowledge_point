# .gitignore 文件

## 简介

`.gitignore` 文件用于指定 Git 需要忽略的文件和目录，这些文件不会被 Git 追踪。

## 工作原理

当 Git 处理文件时，会按以下顺序检查：

1. 检查文件是否已被缓存（已 `git add`）
2. 检查 `.gitignore` 规则是否匹配
3. 决定是否追踪该文件

**重要**：`.gitignore` 只能忽略未被追踪的文件，对已提交的文件无效。

## 文件位置

```
project-root/
├── .gitignore           # 项目级（提交到仓库）
├── .git/
│   └── info/exclude     # 仓库级（本地，不提交）
└── ...
```

全局配置位置：
- `~/.gitignore` 或 `~/.config/git/ignore`（用户级）
- 通过 `git config --global core.excludesFile` 指定

## 匹配语法

### 基本规则

| 模式 | 说明 | 示例 |
|------|------|------|
| `#` | 注释 | `# 这是注释` |
| `空行` | 无匹配 | - |
| `file` | 精确匹配文件 | `config.js` |
| `*.ext` | 匹配所有 .ext 文件 | `*.log` |
| `dir/` | 匹配目录 | `node_modules/` |
| `/file` | 匹配根目录文件 | `/package-lock.json` |
| `dir/` | 匹配目录（含子目录） | `build/` |

### 通配符

| 符号 | 说明 | 示例 |
|------|------|------|
| `*` | 匹配任意字符（除 `/`） | `*.js` |
| `**` | 匹配任意多层目录 | `**/test.js` |
| `?` | 匹配单个字符 | `file?.txt` |
| `[abc]` | 匹配括号内任一字符 | `index.[0-9].js` |
| `[!abc]` | 匹配非括号内字符 | `[!abc].js` |
| `\` | 转义字符 | `\*.js` 匹配字面量 `*.js` |

### 否定规则

以 `!` 开头表示不忽略（重新包含）：

```gitignore
# 忽略所有 .js 文件
*.js

# 但不忽略 lib.js
!lib.js

# 忽略 build 目录
build/

# 但不忽略 build/prod.js
!build/prod.js
```

### 范围限定

| 模式 | 说明 |
|------|------|
| `/pattern` | 只匹配根目录 |
| `pattern/` | 只匹配目录 |
| `pattern` | 匹配文件和目录 |

```gitignore
# 只忽略根目录的 config.json
/config.json

# 允许子目录的 config.json 被追踪
src/config.json  # ✅ 会被追踪
```

## 目录分隔符

```gitignore
# 推荐写法：末尾加斜杠表示目录
node_modules/
dist/
.cache/

# 不加斜杠：文件和目录都匹配
*.log         # 匹配所有 .log 文件和名为 log 的目录
```

## 双星号 `**`

```gitignore
# 匹配所有层级目录下的 test.js
**/test.js

# 等同于 test.js
test.js

# 匹配 a/b/c/.../test.js
**/test.js    # ✅ a/test.js, a/b/test.js, a/b/c/test.js

# 匹配目录下的任意文件
a/**/b        # a/b, a/x/b, a/x/y/b
```

## 完整配置示例

### 通用项目

```gitignore
# 操作系统文件
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
desktop.ini

# IDE 和编辑器
.vscode/
.idea/
*.swp
*.swo
*~
.project
.classpath
.settings/
*.sublime-project
*.sublime-workspace

# 日志文件
*.log
logs/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# 依赖目录
node_modules/
jspm_packages/

# 构建产物
dist/
build/
out/
*.tgz

# 环境配置
.env
.env.local
.env.*.local
!.env.example

# 临时文件
*.tmp
*.temp
.cache/
.parcel-cache/

# 测试覆盖率
coverage/
.nyc_output/

# 其他
*.pid
*.seed
*.pid.lock
```

### 前端项目（Vue/React）

```gitignore
# 依赖
node_modules/
jspm_packages/

# 构建产物
dist/
build/
out/

# 缓存
.cache/
.parcel-cache/
.vite/
.eslintcache

# 环境变量
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# 日志
*.log
logs/

# IDE
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# OS
.DS_Store
Thumbs.db

# 测试
coverage/
.nyc_output/

# 其他
*.tgz
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*
```

### Node.js 后端项目

```gitignore
# 依赖
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# 运行时数据
pids
*.pid
*.seed
*.pid.lock

# 目录
coverage/
.nyc_output/
dist/
build/

# 环境变量
.env
.env.local
.env.*.local

# 日志
logs/
*.log

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store

# 数据库
*.sqlite
*.db

# 上传文件
uploads/
public/uploads/
```

### Python 项目

```gitignore
# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# C extensions
*.so

# Distribution / packaging
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
share/python-wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# PyInstaller
*.manifest
*.spec

# Unit test / coverage reports
htmlcov/
.tox/
.nox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.py,cover
.hypothesis/
.pytest_cache/
cover/

# Translations
*.mo
*.pot

# Django
*.log
local_settings.py
db.sqlite3
db.sqlite3-journal

# Flask
instance/
.webassets-cache

# Scrapy
.scrapy

# Sphinx documentation
docs/_build/

# PyBuilder
.pybuilder/
target/

# Jupyter Notebook
.ipynb_checkpoints

# IPython
profile_default/
ipython_config.py

# pyenv
.python-version

# pipenv
Pipfile.lock

# poetry
poetry.lock

# PEP 582
__pypackages__/

# Celery
celerybeat-schedule
celerybeat.pid

# SageMath
*.sage.py

# Environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# Spyder
.spyderproject
.spyproject

# Rope
.ropeproject

# mkdocs
/site

# mypy
.mypy_cache/
.dmypy.json
dmypy.json

# Pyre
.pyre/

# pytype
.pytype/

# Cython
cython_debug/

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

## 如何生效

### 1. 文件已被追踪

如果文件已经被提交，需要先取消追踪：

```bash
# 取消追踪文件（保留本地文件）
git rm --cached filename

# 取消追踪目录
git rm -r --cached directory/

# 提交更改
git commit -m "Stop tracking file"
```

### 2. 清理缓存

强制 Git 重新读取 `.gitignore`：

```bash
# 清除缓存并重新添加
git rm -r --cached .
git add .
git commit -m "Update .gitignore"
```

### 3. 验证规则

检查某文件是否被忽略：

```bash
# 检查单个文件
git check-ignore -v filename

# 检查目录
git check-ignore -v directory/

# 调试模式
git check-ignore -v --no-index filename
```

### 4. 查看忽略规则

```bash
# 显示所有被忽略的文件
git ls-files --others --ignored --exclude-standard

# 显示被忽略的目录
git ls-files --others --ignored --exclude-standard | grep "/"
```

## 多级配置优先级

从高到低：

1. 命令行 `--exclude` 参数
2. 当前目录的 `.gitignore`
3. 父目录的 `.gitignore`（递归向上）
4. `.git/info/exclude`
5. `core.excludesFile` 配置文件

```gitignore
# 子目录 .gitignore 可以覆盖父目录规则
# project/.gitignore
*.log

# project/src/.gitignore
!important.log  # src/important.log 会被追踪
```

## 常见问题

### 1. 规则不生效

**原因**：文件已被 Git 追踪

**解决**：
```bash
git rm --cached --r .
git add .
git commit -m "Fix .gitignore"
```

### 2. 忽略已提交的文件

```bash
# 方法一：git rm（删除远程保留本地）
git rm --cached filename
echo "filename" >> .gitignore
git add .gitignore
git commit -m "Stop tracking filename"

# 方法二：git update-index
git update-index --assume-unchanged filename
# 恢复追踪
git update-index --no-assume-unchanged filename
```

### 3. 空目录无法被忽略

Git 不追踪空目录，需要在目录中添加 `.gitkeep`：

```bash
# 创建空目录占位符
touch empty-dir/.gitkeep
```

```gitignore
# 忽略除 .gitkeep 外的所有文件
empty-dir/*
!empty-dir/.gitkeep
```

### 4. 跟踪被忽略的文件

```bash
# 强制添加被忽略的文件
git add -f filename

# 或临时忽略规则
git add -f .gitignore
```

### 5. 排除目录但保留子目录

```gitignore
# 忽略 node_modules 但保留 node_modules/demo
node_modules/*
!node_modules/demo/
```

### 6. 特殊字符文件名

```gitignore
# 包含空格
file\ name.txt

# 包含 #
\#file#

# 包含 [
\[file]
```

## 全局配置

### 设置全局忽略文件

```bash
# 创建全局忽略文件
touch ~/.gitignore_global

# 配置 Git 使用
git config --global core.excludesFile ~/.gitignore_global
```

### Windows 路径

```bash
# Windows 需要使用完整路径
git config --global core.excludesFile "%USERPROFILE%\.gitignore_global"
```

### 常用全局配置

```gitignore
# ~/.gitignore_global

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.idea/
.vscode/
*.swp
*.swo

# 临时文件
*~
.*.swp
.*.swo
```

## 仓库级忽略（本地独有）

用于本地开发文件，不想提交到仓库：

```bash
# 编辑 .git/info/exclude
git config --local core.excludesFile .git/info/exclude

# 或者直接编辑文件
nano .git/info/exclude
```

```gitignore
# .git/info/exclude

# 本地环境配置
.local.env

# 本地测试数据
test-data/
```

## 生成工具

### 在线生成器

- [gitignore.io](https://www.toptal.com/developers/gitignore) - 根据技术栈生成
- [gitignore_template](https://github.com/github/gitignore) - GitHub 官方模板

### 命令行工具

```bash
# 使用 gi 命令（需要安装）
npm install -g gitignore
gi node,macos,linux > .gitignore
```

## 最佳实践

```gitignore
# ======== 推荐顺序 ========
# 1. 注释说明
# ======== 依赖目录 ========
node_modules/

# ======== 构建产物 ========
dist/
build/
*.tgz

# ======== 环境配置 ========
.env
.env.local
!.env.example

# ======== IDE ========
.vscode/
.idea/

# ======== 操作系统 ========
.DS_Store
Thumbs.db

# ======== 日志 ========
*.log
logs/

# ======== 临时文件 ========
*.tmp
.cache/
```

### 实用技巧

```gitignore
# 1. 精确匹配优先
/package-lock.json      # 只忽略根目录的
package-lock.json       # 忽略所有目录的

# 2. 目录优先
dist/                   # 推荐
dist                    # 也会匹配名为 dist 的文件

# 3. 否定规则要放在对应规则之后
*.js
!lib.js                 # ✅ 正确

!lib.js                 # ❌ 无效
*.js

# 4. 使用注释组织规则
# ========== 生产环境 ==========
.env.prod

# ========== 开发环境 ==========
.env.dev

# ========== 测试环境 ==========
.env.test
```

## 注意事项

1. **已追踪文件无效**：`.gitignore` 对已提交的文件不起作用
2. **空目录无法忽略**：Git 不追踪空目录
3. **规则按顺序匹配**：后面的规则可以覆盖前面的
4. **斜杠表示目录**：`node_modules/` 只匹配目录
5. **提交到仓库**：`.gitignore` 应该提交到版本控制
6. **敏感信息保护**：不要提交包含密钥的 `.env` 文件
7. **团队协作**：使用统一的 `.gitignore` 避免冲突
8. **定期检查**：使用 `git status` 确认是否有不该提交的文件

## 参考链接

- [Git - gitignore 文档](https://git-scm.com/docs/gitignore)
- [GitHub gitignore 模板](https://github.com/github/gitignore)
- [gitignore.io 在线生成](https://www.toptal.com/developers/gitignore)
