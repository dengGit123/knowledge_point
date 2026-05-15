# VSCode 配置完全指南

## 概述：配置系统架构

VSCode 的配置系统采用**层级覆盖**机制，理解配置的优先级是正确配置的关键。

```
┌─────────────────────────────────────────────────────────────────┐
│                      VSCode 配置层级与优先级                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  优先级从高到低（后者覆盖前者）：                                  │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  1. 工作区配置       .vscode/settings.json              │    │
│  │     ↓ 覆盖                                         ▲     │    │
│  │  2. 用户配置       settings.json（用户级）           │     │    │
│  │     ↓ 覆盖                                         ▲     │    │
│  │  3. 默认配置       VSCode 内置默认值               │     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  配置查找顺序：工作区 → 远程工作区 → 用户 → 默认                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 一、配置文件的位置

### 1.1 各平台配置文件路径

| 平台 | 用户配置 | 工作区配置 |
|------|----------|------------|
| **Windows** | `%APPDATA%\Code\User\settings.json` | `.vscode\settings.json` |
| **macOS** | `~/Library/Application Support/Code/User/settings.json` | `.vscode/settings.json` |
| **Linux** | `~/.config/Code/User/settings.json` | `.vscode/settings.json` |

### 1.2 配置文件结构

```
用户根目录
├── .config/Code/User/
│   ├── settings.json          # 用户配置
│   ├── keybindings.json       # 快捷键配置
│   ├── snippets/              # 代码片段
│   │   ├── javascript.json
│   │   └── python.json
│   └── locale.json            # 语言设置

项目根目录
└── .vscode/
    ├── settings.json          # 工作区配置
    ├── launch.json            # 调试配置
    ├── tasks.json             # 任务配置
    ├── extensions.json        # 推荐插件
    └── snippets/              # 项目代码片段
```

---

## 二、如何打开配置文件

### 2.1 打开方式对比

| 方式 | 操作步骤 | 适用场景 |
|------|----------|----------|
| **UI 界面** | `Ctrl+,` (Cmd+) | 初学者、可视化配置 |
| **settings.json** | `Ctrl+Shift+P` → "Preferences: Open User Settings" | 高级用户、精确配置 |
| **直接编辑** | 打开配置文件路径 | 批量配置、版本控制 |

### 2.2 打开配置的命令

```
按 Ctrl+Shift+P (Cmd+Shift+P) 打开命令面板，输入：

Preferences: Open User Settings (JSON)     → 打开用户配置
Preferences: Open Workspace Settings (JSON) → 打开工作区配置
Preferences: Open Language Settings         → 打开语言特定配置
```

---

## 三、配置分类详解

### 3.1 编辑器配置 (editor.*)

```json
{
  // ========== 字体与外观 ==========
  "editor.fontSize": 14,                    // 字体大小
  "editor.fontFamily": "'Fira Code', monospace",  // 字体族
  "editor.fontLigatures": true,             // 启用连字（如 != 变成 ≠）
  "editor.lineHeight": 0,                   // 行高（0=自动，通常为1.5倍字体大小）
  "editor.letterSpacing": 0,                // 字符间距

  // ========== 缩进与空格 ==========
  "editor.tabSize": 2,                      // Tab 键等于多少个空格
  "editor.insertSpaces": true,              // 按 Tab 插入空格而非制表符
  "editor.detectIndentation": true,         // 自动检测文件缩进方式
  "editor.trimAutoWhitespace": true,        // 自动删除行尾空格

  // ========== 显示选项 ==========
  "editor.minimap.enabled": true,           // 显示代码缩略图
  "editor.minimap.maxColumn": 80,           // 缩略图最大宽度
  "editor.minimap.renderCharacters": true,  // 缩略图显示字符
  "editor.renderWhitespace": "selection",   // 空白符显示：boundary/selection/all
  "editor.renderControlCharacters": false,  // 显示控制字符
  "editor.cursorBlinking": "blink",         // 光标闪烁样式
  "editor.cursorStyle": "line",             // 光标样式：line/block/underline/line-thin
  "editor.lineNumbers": "on",               // 行号显示：on/off/relative/on

  // ========== 滚动与显示 ==========
  "editor.smoothScrolling": true,           // 平滑滚动
  "editor.cursorSurroundingLines": 0,       // 光标上下保留的行数（0=自动）
  "editor.scrollBeyondLastLine": true,      // 允许滚动到最后一行之后

  // ========== 代码编辑 ==========
  "editor.wordWrap": "off",                 // 自动换行：off/on/on
  "editor.wordWrapColumn": 80,              // 换行列数
  "editor.wrappingIndent": "same",          // 换行缩进：none/same/indent/double
  "editor.autoClosingBrackets": "beforeWhitespace",  // 自动闭合括号
  "editor.autoClosingQuotes": "languageDefined",     // 自动闭合引号
  "editor.autoSurround": "languageDefined",  // 自动包围选中内容
  "editor.formatOnPaste": false,            // 粘贴时自动格式化
  "editor.formatOnType": false,             // 输入时自动格式化
  "editor.formatOnSave": true,              // 保存时自动格式化 ⭐
  "editor.suggestSelection": "first",       // 补全建议选择：first/recentlyUsed

  // ========== 括号与引导线 ==========
  "editor.guides.bracketPairs": true,       // 显示括号对引导线
  "editor.bracketPairColorization.enabled": true,  // 括号配对着色
  "editor.matchBrackets": "always",         // 匹配括号高亮

  // ========== 代码折叠 ==========
  "editor.foldingStrategy": "auto",         // 折叠策略：auto/indentation
  "editor.foldingHighlight": true,          // 折叠区域高亮
  "editor.showFoldingControls": "mouseover", // 显示折叠按钮：always/mouseover

  // ========== 智能提示 ==========
  "editor.quickSuggestions": {
    "other": true,    // 其他代码的快速提示
    "comments": false, // 注释中的快速提示
    "strings": false  // 字符串中的快速提示
  },
  "editor.suggest.snippetsPreventQuickSuggestions": true,  // 片段阻止快速提示
  "editor.acceptSuggestionOnCommitCharacter": true,  // 按确认字符接受建议

  // ========== 验证与检查 ==========
  "editor.codeActionsOnSave": {             // 保存时执行的代码操作 ⭐
    "source.fixAll.eslint": "explicit",     // 自动修复 ESLint 错误
    "source.organizeImports": "explicit"    // 自动整理导入
  }
}
```

### 3.2 文件配置 (files.*)

```json
{
  // ========== 自动保存 ==========
  "files.autoSave": "afterDelay",           // 自动保存：off/afterDelay/onFocusChange
  "files.autoSaveDelay": 1000,              // 自动保存延迟（毫秒）

  // ========== 文件关联 ==========
  "files.associations": {                   // 文件名到语言的映射
    "*.js": "javascript",
    "*.jsx": "javascriptreact",
    "*.vue": "vue",
    "*.wxml": "wxml",
    "*.wxss": "css"
  },

  // ========== 编码 ==========
  "files.encoding": "utf8",                 // 默认文件编码
  "files.autoGuessEncoding": true,          // 自动猜测文件编码

  // ========== 行尾符 ==========
  "files.eol": "\n",                        // 行尾符：\n (LF) / \r\n (CRLF)
  "files.insertFinalNewline": true,         // 文件末尾插入空行
  "files.trimTrailingWhitespace": true,     // 删除行尾空格

  // ========== 文件排除 ==========
  "files.exclude": {                        // 资源管理器中隐藏的文件 ⭐
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/.next": true,
    "**/coverage": true
  },
  "files.watcherExclude": {                 // 不监视的文件（性能优化）
    "**/node_modules/**": true,
    "**/dist/**": true,
    "**/.git/objects/**": true
  },

  // ========== 最大尺寸 ==========
  "files.maxMemoryForLargeFilesMB": 4096,   // 大文件最大内存占用

  // ========== 默认语言格式化程序 ==========
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### 3.3 工作台配置 (workbench.*)

```json
{
  // ========== 主题 ==========
  "workbench.colorTheme": "One Dark Pro",   // 颜色主题
  "workbench.iconTheme": "material-icon-theme",  // 文件图标主题
  "workbench.productIconTheme": "default", // 产品图标主题

  // ========== 布局 ==========
  "workbench.startupEditor": "none",        // 启动时显示：none/welcomePage/readme
  "workbench.sideBar.location": "left",     // 侧边栏位置：left/right
  "workbench.statusBar.visible": true,      // 显示状态栏
  "workbench.activityBar.visible": true,    // 显示活动栏
  "workbench.panel.defaultLocation": "bottom",  // 面板位置：bottom/left/right

  // ========== 编辑器布局 ==========
  "workbench.editor.enablePreview": false,  // 禁用预览模式（单击文件打开新标签）
  "workbench.editor.showTabs": true,        // 显示编辑器标签
  "workbench.editor.tabCloseButton": "right",  // 关闭按钮位置
  "workbench.editor.wrapTabs": false,       // 标签过多时换行
  "workbench.editor.limit.enabled": false,  // 限制打开的编辑器数量
  "workbench.editor.decorations.colors": true,  // 显示颜色装饰器

  // ========== 增强 ==========
  "workbench.list.smoothScrolling": true,   // 列表平滑滚动
  "workbench.tree.indent": 20,              // 树缩进宽度
  "workbench.editor.highlightModifiedTabs": true,  // 高亮修改过的标签

  // ========== 标题 ==========
  "window.title": "${dirty}${activeEditorShort}${separator}${rootName}",  // 窗口标题样式
  "window.titleSeparator": " - "            // 标题分隔符
}
```

### 3.4 终端配置 (terminal.*)

```json
{
  // ========== 外观 ==========
  "terminal.integrated.fontSize": 13,       // 终端字体大小
  "terminal.integrated.fontFamily": "Menlo, Monaco, 'Courier New', monospace",
  "terminal.integrated.lineHeight": 1.2,    // 行高
  "terminal.integrated.letterSpacing": 0,   // 字符间距
  "terminal.integrated.cursorBlinking": true,  // 光标闪烁
  "terminal.integrated.cursorStyle": "block",  // 光标样式

  // ========== Shell 配置 ==========
  "terminal.integrated.defaultProfile": {
    "windows": "PowerShell",                // Windows 默认 Shell
    "linux": "bash",                        // Linux 默认 Shell
    "osx": "zsh"                            // macOS 默认 Shell
  },

  // ========== 行为 ==========
  "terminal.integrated.scrollback": 10000,  // 滚动缓冲区行数
  "terminal.integrated.env.osx": {          // macOS 环境变量
    "LANG": "zh_CN.UTF-8"
  },

  // ========== 分割 ==========
  "terminal.integrated.tabs.enabled": true, // 启用终端标签
  "terminal.integrated.tabs.location": "right"  // 终端标签位置
}
```

### 3.5 搜索配置 (search.*)

```json
{
  "search.exclude": {                       // 搜索时排除的文件/文件夹 ⭐
    "**/node_modules": true,
    "**/bower_components": true,
    "**/dist": true,
    "**/build": true,
    "**/*.code-search": true,
    "**/.git": true,
    "**/.next": true
  },
  "search.useIgnoreFiles": true,            // 使用 .gitignore 等
  "search.followSymlinks": false,           // 不跟随符号链接
  "search.smartCase": true,                 // 智能大小写（含大写字母才区分）
  "search.location": "sidebar"              // 搜索位置：sidebar/panel
}
```

### 3.6 Git 配置 (git.*)

```json
{
  "git.enabled": true,                      // 启用 Git
  "git.path": null,                         // Git 可执行文件路径（null=自动检测）
  "git.autofetch": true,                    // 自动获取更新
  "git.confirmSync": false,                 // 同步前确认
  "git.enableSmartCommit": true,            // 智能提交（无暂存更改时提交所有）
  "git.postCommitCommand": "none",          // 提交后操作：none/push/sync
  "git.decorations.enabled": true,          // 显示 Git 装饰器

  // ========== Git 操作 ==========
  "git.ignoreLimitWarning": true,           // 忽略文件数量限制警告
  "git.openDiffOnClick": true,              // 点击文件打开差异视图
  "git.suggestSmartCommit": true,           // 建议智能提交

  // ========== GitHub ==========
  "github.copilot.enable": {
    "*": true,
    "markdown": true
  }
}
```

### 3.7 调试配置 (debug.*)

```json
{
  "debug.allowBreakpointsEverywhere": false,  // 允许在任何位置设置断点
  "debug.console.closeOnEnd": false,          // 调试结束时关闭控制台
  "debug.openDebug": "openOnDebugBreak",      // 调试时打开调试视图
  "debug.internalConsoleOptions": "openOnSessionStart",  // 内部控制台选项
  "debug.toolBarLocation": "docked"           // 调试工具栏位置
}
```

### 3.8 HTTP 配置 (http.*)

```json
{
  "http.proxyStrictSSL": true,               // 代理严格 SSL
  "http.proxyAuthorization": null,           // 代理授权
  // 代理配置示例：
  // "http.proxy": "http://proxy.example.com:8080"
  // "http.proxy": "http://username:password@proxy.example.com:8080"
}
```

### 3.9 遥测与隐私 (telemetry.*)

```json
{
  "telemetry.telemetryLevel": "off",         // 遥测级别：all/error/off
  "telemetry.enableCrashReporter": false,    // 崩溃报告
  "telemetry.enableTelemetry": false         // 启用遥测
}
```

### 3.10 更新配置 (update.*)

```json
{
  "update.mode": "manual",                   // 更新模式：none/manual/start
  "update.showReleaseNotes": true,           // 显示更新说明
  "extensions.autoUpdate": false,            // 自动更新扩展
  "extensions.autoCheckUpdates": false       // 自动检查扩展更新
}
```

---

## 四、语言特定配置

### 4.1 为特定语言配置

```json
{
  // ========== JavaScript/TypeScript ==========
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": "explicit"
    }
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },

  // ========== Vue ==========
  "[vue]": {
    "editor.defaultFormatter": "Vue.volar",
    "editor.formatOnSave": true
  },

  // ========== Python ==========
  "[python]": {
    "editor.defaultFormatter": "ms-python.python",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.organizeImports": "explicit"
    }
  },

  // ========== 样式文件 ==========
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[scss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[less]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },

  // ========== 标记语言 ==========
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.wordWrap": "on",
    "editor.quickSuggestions": {
      "comments": "off",
      "strings": "off",
      "other": "off"
    }
  }
}
```

---

## 五、工作区 vs 用户配置

### 5.1 对比表

| 特性 | 用户配置 | 工作区配置 |
|------|----------|------------|
| **位置** | 用户目录 | 项目 `.vscode` 文件夹 |
| **作用范围** | 所有项目 | 当前项目 |
| **优先级** | 低 | 高 |
| **版本控制** | 不建议提交 | 应该提交 |
| **典型内容** | 主题、字体、通用设置 | 项目特定设置、格式化规则 |

### 5.2 使用建议

```json
// ========== 用户配置 (settings.json) ==========
// 用于：个人偏好设置
{
  "editor.fontSize": 14,
  "editor.fontFamily": "'Fira Code', monospace",
  "workbench.colorTheme": "One Dark Pro",
  "workbench.iconTheme": "material-icon-theme",
  "files.autoSave": "afterDelay"
}

// ========== 工作区配置 (.vscode/settings.json) ==========
// 用于：项目特定设置
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "vue"],
  "typescript.tsdk": "node_modules/typescript/lib",
  "vite.devPort": 3000
}
```

---

## 六、配置实战：最佳实践

### 6.1 前端开发配置

```json
{
  // ========== 编辑器基础 ==========
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",

  // ========== ESLint + Prettier ==========
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.fixAll.stylelint": "explicit"
  },

  // ========== 文件排除 ==========
  "files.exclude": {
    "**/.git": true,
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/.next": true,
    "**/coverage": true
  },

  // ========== JavaScript/TypeScript ==========
  "javascript.suggest.autoImports": true,
  "typescript.suggest.autoImports": true,
  "javascript.updateImportsOnFileMove.enabled": "always",
  "typescript.updateImportsOnFileMove.enabled": "always",

  // ========== Vue/React ==========
  "volar.autoCompleteRefs": true,
  "emmet.includeLanguages": {
    "vue": "html",
    "javascript": "javascriptreact"
  },

  // ========== 样式 ==========
  "stylelint.enable": true,
  "css.validate": true,
  "scss.validate": true,
  "less.validate": true,

  // ========== 其他 ==========
  "liveServer.settings.donotShowInfoMsg": true,
  "bracket-pair-colorizer-2.colors": ["Gold", "Orchid", "LightSkyBlue"]
}
```

### 6.2 Python 开发配置

```json
{
  // ========== Python 路径 ==========
  "python.defaultInterpreterPath": "python3",
  "python.terminal.activateEnvironment": true,

  // ========== 格式化 ==========
  "[python]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "ms-python.black-formatter",
    "editor.codeActionsOnSave": {
      "source.organizeImports": "explicit"
    }
  },

  // ========== Linting ==========
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": false,
  "python.linting.flake8Enabled": true,
  "python.linting.mypyEnabled": true,

  // ========== 测试 ==========
  "python.testing.pytestEnabled": true,
  "python.testing.pytestArgs": [
    "tests"
  ],

  // ========== 文件排除 ==========
  "files.exclude": {
    "**/.git": true,
    "**/__pycache__": true,
    "**/.pytest_cache": true,
    "**/.venv": true,
    "**/venv": true
  },

  // ========== Jupyter ==========
  "jupyter.askForKernelRestart": false,
  "notebook.formatOnSave.enabled": true
}
```

### 6.3 Go 开发配置

```json
{
  // ========== Go 工具 ==========
  "go.useLanguageServer": true,
  "go.autocompleteUnimportedPackages": true,
  "go.docsTool": "gogetdoc",
  "go.goroot": "/usr/local/go",
  "go.gopath": "~/go",

  // ========== 格式化 ==========
  "[go]": {
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.organizeImports": "explicit"
    }
  },
  "go.formatTool": "goimports",
  "go.lintTool": "golangci-lint",
  "go.lintOnSave": true,

  // ========== 测试 ==========
  "go.testFlags": ["-v"],
  "go.testTimeout": "30s",

  // ========== 代码覆盖 ==========
  "go.coverOnSingleTest": true,
  "go.coverageDecorator": {
    "type": "gutter"
  }
}
```

---

## 七、配置同步

### 7.1 Settings Sync

```
┌─────────────────────────────────────────────────────────────┐
│                    VSCode 设置同步                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  使用 GitHub 或 Microsoft 账号同步：                          │
│                                                              │
│  1. 点击左下角的齿轮图标 ⚙                                    │
│  2. 选择 "Turn on Settings Sync..."                          │
│  3. 选择同步服务（GitHub / Microsoft）                        │
│  4. 选择要同步的内容：                                        │
│     ✓ Settings        用户配置                               │
│     ✓ Keyboard Shortcuts  快捷键                             │
│     ✓ Snippets        代码片段                               │
│     ✓ Extensions      扩展列表                               │
│     ✓ UI State        UI 状态                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 手动备份配置

```bash
# macOS/Linux
# 备份配置文件
cp -r ~/.config/Code/User ~/vscode-backup/

# Windows
# 备份配置文件
xcopy %APPDATA%\Code\User C:\vscode-backup\ /E /I

# 或使用 Git 仓库管理
git init --bare $HOME/dotfiles
alias config='/usr/bin/git --git-dir=$HOME/dotfiles/ --work-tree=$HOME'
config add .config/Code/User/settings.json
config commit -m "Update VSCode settings"
```

---

## 八、配置速查表

### 8.1 常用配置项

| 配置项 | 推荐值 | 说明 |
|--------|--------|------|
| `editor.formatOnSave` | `true` | 保存时自动格式化 |
| `editor.tabSize` | `2` | Tab 为 2 空格 |
| `editor.fontSize` | `14` | 字体大小 |
| `editor.wordWrap` | `on` | 自动换行 |
| `files.autoSave` | `afterDelay` | 延迟自动保存 |
| `editor.minimap.enabled` | `false` | 关闭缩略图（大屏可开） |
| `workbench.startupEditor` | `"none"` | 启动时不显示欢迎页 |
| `telemetry.telemetryLevel` | `"off"` | 关闭遥测 |

### 8.2 配置命令速查

```
Ctrl+Shift+P → Preferences: Open User Settings (JSON)
Ctrl+Shift+P → Preferences: Open Workspace Settings (JSON)
Ctrl+Shift+P → Preferences: Configure Language Specific Settings
Ctrl+Shift+P → Preferences: Color Theme
Ctrl+Shift+P → Preferences: File Icon Theme
```

---

## 九、故障排除

### 9.1 配置不生效

| 问题 | 解决方案 |
|------|----------|
| 工作区配置覆盖用户配置 | 检查 `.vscode/settings.json` |
| 语言特定配置无效 | 确保使用正确的语言标识符 |
| 格式化工具冲突 | 设置 `editor.defaultFormatter` |
| 配置语法错误 | 检查 JSON 语法，注意逗号 |

### 9.2 重置配置

```json
// 方法1：删除配置文件，恢复默认
// 备份后删除 settings.json

// 方法2：使用命令面板重置
// Ctrl+Shift+P → "Preferences: Open Settings (JSON)"
// 点击右上角 "Reset to Defaults"

// 方法3：重置单个配置
// 在设置 UI 中，点击配置项旁边的 "Reset" 按钮
```
