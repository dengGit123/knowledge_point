# Visual Studio Code 完全使用指南

## 概述

Visual Studio Code（简称 VSCode）是微软开发的免费、开源、跨平台的代码编辑器。它轻量级但功能强大，拥有丰富的插件生态系统，是目前最受欢迎的代码编辑器之一。

```
┌─────────────────────────────────────────────────────────────┐
│                    为什么选择 VSCode？                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ 免费、开源、跨平台（Windows/Mac/Linux）                   │
│  ✅ 轻量级启动快，但功能强大                                  │
│  ✅ 智能代码补全和语法高亮                                    │
│  ✅ 丰富的插件生态系统                                        │
│  ✅ 内置 Git 支持                                            │
│  ✅ 强大的调试功能                                            │
│  ✅ 高度可定制化                                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 一、安装与初始设置

### 1.1 下载安装

| 平台 | 下载地址 |
|------|----------|
| 官网 | [https://code.visualstudio.com/](https://code.visualstudio.com/) |
| Windows | `VSCodeUserSetup-x.x.x.exe` |
| macOS | `VSCode-darwin-universal.zip` |
| Linux | `.deb` / `.rpm` / `.tar.gz` |

<div style="background-color: #d1ecf1; border-left: 4px solid #0dcaf0; padding: 10px; margin: 10px 0;">
<strong>💡 推荐：</strong>macOS 用户可以通过 Homebrew 安装：<code>brew install --cask visual-studio-code</code>
</div>

### 1.2 中文界面设置

1. 按 `Ctrl+Shift+P`（Mac: `Cmd+Shift+P`）打开命令面板
2. 输入 `Configure Display Language`
3. 选择 `Install Additional Languages`
4. 搜索并安装 `Chinese (Simplified)` 语言包
5. 重启 VSCode

---

## 二、界面布局

```
┌─────────────────────────────────────────────────────────────────┐
│  标题栏: 项目名称 - VSCode                    ─ □ ✕           │
├──────────┬──────────────────────────────────────┬───────────────┤
│          │           菜单栏                       │               │
│  活动栏  ├──────────────────────────────────────┤               │
│          │                                          侧边栏      │
│          │           编辑器区域                    │               │
│          │                                          （可关闭）  │
│          │                                           │           │
│          │                                           │           │
│  ────────┴──────────────────────────────────────────┴───────────  │
│  状态栏                                                       │
└─────────────────────────────────────────────────────────────────┘
```

### 2.1 各区域功能

| 区域 | 快捷键 | 功能说明 |
|------|--------|----------|
| **活动栏** | `Ctrl+Shift+E` | 左侧图标栏（资源搜索器、搜索、Git等） |
| **侧边栏** | `Ctrl+B` | 显示/隐藏侧边栏 |
| **编辑器** | `Ctrl+\` | 打开多个编辑器窗口 |
| **面板** | `Ctrl+J` | 底部终端/输出/问题面板 |
| **命令面板** | `Ctrl+Shift+P` | 执行所有可用命令 |
| **状态栏** | - | 显示行列、Git分支、编码等信息 |

---

## 三、核心快捷键

### 3.1 通用快捷键

| 功能 | Windows/Linux | macOS |
|------|---------------|-------|
| 命令面板 | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| 快速打开文件 | `Ctrl+P` | `Cmd+P` |
| 新建文件 | `Ctrl+N` | `Cmd+N` |
| 保存文件 | `Ctrl+S` | `Cmd+S` |
| 保存全部 | `Ctrl+K S` | `Cmd+K S` |
| 关闭文件 | `Ctrl+W` | `Cmd+W` |
| 重新打开关闭的文件 | `Ctrl+Shift+T` | `Cmd+Shift+T` |

### 3.2 编辑操作

| 功能 | Windows/Linux | macOS |
|------|---------------|-------|
| 剪切行 | `Ctrl+X` | `Cmd+X` |
| 复制行 | `Ctrl+C` | `Cmd+C` |
| 移动行上/下 | `Alt+↑/↓` | `Opt+↑/↓` |
| 复制行上/下 | `Shift+Alt+↑/↓` | `Shift+Opt+↑/↓` |
| 删除行 | `Ctrl+Shift+K` | `Cmd+Shift+K` |
| 注释/取消注释 | `Ctrl+/` | `Cmd+/` |
| 切换块注释 | `Shift+Alt+A` | `Shift+Opt+A` |

### 3.3 光标移动

| 功能 | Windows/Linux | macOS |
|------|---------------|-------|
| 移动到行首/尾 | `Home`/`End` | `Cmd+←`/`Cmd+→` |
| 移动到文件首/尾 | `Ctrl+Home`/`Ctrl+End` | `Cmd+↑`/`Cmd+↓` |
| 移动到单词左/右 | `Ctrl+←`/`→` | `Opt+←`/`→` |
| 选中当前行 | `Ctrl+L` | `Cmd+L` |
| 选中当前单词 | `Ctrl+D` | `Cmd+D` |
| 多光标选择 | `Ctrl+Alt+↑/↓` | `Cmd+Opt+↑/↓` |
| 下一个匹配项 | `Ctrl+D` | `Cmd+D` |

### 3.4 视图操作

| 功能 | Windows/Linux | macOS |
|------|---------------|-------|
| 显示/隐藏侧边栏 | `Ctrl+B` | `Cmd+B` |
| 显示/隐藏终端 | `Ctrl+`` ` | `Cmd+`` ` |
| 分屏编辑器 | `Ctrl+\` | `Cmd+\` |
| 切换标签页 | `Ctrl+Tab` | `Ctrl+Tab` |
| 放大/缩小 | `Ctrl+ +/-` | `Cmd+ +/-` |
| 全屏模式 | `F11` | `Ctrl+Cmd+F` |

---

## 四、文件管理

### 4.1 资源管理器

```
资源管理器结构：
├── 📁 项目根目录
│   ├── 📁 src
│   │   ├── 📄 index.js
│   │   └── 📄 App.js
│   ├── 📁 public
│   ├── 📄 package.json
│   └── 📄 README.md
```

**常用操作：**
| 操作 | 快捷键/方法 |
|------|-------------|
| 新建文件/文件夹 | 右键 → New File/Folder |
| 重命名 | `F2` |
| 删除 | `Delete` |
| 复制/移动 | 拖拽文件 |
| 在资源管理器中显示 | 右键 → Reveal in Explorer |

### 4.2 快速打开文件

```javascript
// 按 Ctrl+P (Cmd+P) 打开快速打开

// 输入文件名搜索
index.js    → 精确匹配
index       → 模糊匹配
*.js        → 通配符搜索

// 符号导航（输入 @）
@handleClick    → 搜索函数
@MyComponent    → 搜索类
#useState       → 搜索变量

// 行号跳转（输入 :）
:25         → 跳转到第25行
:-10        → 跳转到倒数第10行
```

---

## 五、代码编辑技巧

### 5.1 代码片段（Snippets）

```json
// 创建自定义代码片段：File → Preferences → User Snippets

// JavaScript 示例
{
  "Console Log": {
    "prefix": "cl",
    "body": [
      "console.log('$1');",
      "$2"
    ],
    "description": "输出 console.log"
  },

  "React Component": {
    "prefix": "rfc",
    "body": [
      "import React from 'react';",
      "",
      "function $1({$2}) {",
      "  return (",
      "    <div>$3</div>",
      "  );",
      "}",
      "",
      "export default $1;"
    ],
    "description": "React Function Component"
  }
}
```

### 5.2 多光标编辑

```javascript
// 场景1：同时编辑多行
// 操作：按住 Alt (Opt) 点击多行，或 Ctrl+Alt+↓ (Cmd+Opt+↓)

// 场景2：批量修改相同变量
// 操作：选中变量，按 Ctrl+D (Cmd+D) 逐个选择

// 场景3：在所有匹配项插入光标
// 操作：Ctrl+Shift+L (Cmd+Shift+L)

// 示例：批量添加引号
// 操作前：
name, age, city

// 操作：选中逗号，Ctrl+Shift+L，输入引号
'name', 'age', 'city'
```

### 5.3 代码重构

| 功能 | 快捷键 | 说明 |
|------|--------|------|
| 重命名符号 | `F2` | 全局重命名变量/函数 |
| 提取函数 | `Ctrl+Shift+R` | 将代码提取为函数 |
| 格式化文档 | `Shift+Alt+F` | 自动格式化代码 |
| 转换大小写 | `Ctrl+K Ctrl+X` | 转小写 `Ctrl+K Ctrl+U` 转大写 |

---

## 六、终端与调试

### 6.1 集成终端

```bash
# 快捷键
Ctrl+` (Cmd+`)    # 打开/关闭终端
Ctrl+Shift+`      # 新建终端终端
Ctrl+C            # 终止当前进程

# 分屏终端
- 点击终端面板右上角的 "+" 号
- 右键 → Split Terminal
```

**终端操作：**
| 操作 | 说明 |
|------|------|
| `cd .` | 切换到项目根目录 |
| `code .` | 在 VSCode 中打开当前目录 |
| `code -r .` | 在当前窗口打开目录 |

### 6.2 断点调试

```javascript
// 设置断点：点击行号左侧，或按 F9

// 调试快捷键
F5              # 开始调试
F9              # 切换断点
F10             # 单步跳过
F11             # 单步进入
Shift+F11       # 单步退出
Shift+F5        # 停止调试

// 条件断点
// 右键行号 → Add Conditional Breakpoint
// 输入条件：count > 5
```

**launch.json 配置示例：**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "启动程序",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/index.js"
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "启动 Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

---

## 七、Git 集成

### 7.1 源代码管理

```
┌─────────────────────────────────────────┐
│  源代码管理面板                          │
├─────────────────────────────────────────┤
│  ✅ 已暂存的更改                         │
│  ⚪ 未暂存的更改                         │
│  🔵 合并冲突                             │
├─────────────────────────────────────────┤
│  常用操作：                              │
│  - 提交消息                              │
│  - 暂存/取消暂存                         │
│  - 放弃更改                              │
└─────────────────────────────────────────┘
```

### 7.2 Git 操作快捷键

| 操作 | 快捷键 |
|------|--------|
| 打开源代码管理 | `Ctrl+Shift+G` |
| 暂存文件 | `Ctrl+Enter` |
| 放弃更改 | `Ctrl+Shift+Backspace` |
| 提交 | `Ctrl+Enter` |
| 推送 | `F1` → Git: Push |

### 7.3 分支操作

```bash
# 在终端中操作
git branch              # 查看分支
git checkout -b 新分支    # 创建并切换分支
git checkout 分支名       # 切换分支
git merge 分支名         # 合并分支

# VSCode 界面操作
# 1. 点击状态栏的分支名称
# 2. 选择要切换或创建的分支
```

---

## 八、必备插件推荐

### 8.1 通用类

| 插件 | 说明 | 下载量 |
|------|------|--------|
| **Chinese (Simplified)** | 中文语言包 | 30M+ |
| **Material Icon Theme** | 文件图标主题 | 18M+ |
| **Bracket Pair Colorizer** | 括号配对着色 | 9M+ |
| **Auto Rename Tag** | 自动重命名标签 | 13M+ |
| **Path Intellisense** | 路径自动补全 | 11M+ |

### 8.2 前端开发

| 插件 | 说明 |
|------|------|
| **ESLint** | JavaScript 代码检查 |
| **Prettier** | 代码格式化 |
| **Vetur** | Vue 工具 |
| **Live Server** | 本地开发服务器 |
| **CSS Peek** | CSS 类名跳转 |

### 8.3 后端开发

| 插件 | 说明 |
|------|------|
| **Python** | Python 语言支持 |
| **Java Extension Pack** | Java 开发包 |
| **Go** | Go 语言支持 |
| **Docker** | Docker 支持 |
| **REST Client** | API 测试工具 |

### 8.4 效率提升

| 插件 | 说明 |
|------|------|
| **GitLens** | Git 超强增强 |
| **Todo Tree** | TODO 高亮显示 |
| **Code Spell Checker** | 拼写检查 |
| **Thunder Client** | API 测试 |
| **Remote - SSH** | 远程开发 |

---

## 九、用户配置

### 9.1 常用配置

```json
// File → Preferences → Settings (settings.json)

{
  // 编辑器
  "editor.fontSize": 14,
  "editor.tabSize": 2,
  "editor.wordWrap": "on",
  "editor.minimap.enabled": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },

  // 文件
  "files.autoSave": "afterDelay",
  "files.autoSaveDelay": 1000,
  "files.exclude": {
    "**/.git": true,
    "**/node_modules": true,
    "**/.DS_Store": true
  },

  // 主题
  "workbench.colorTheme": "One Dark Pro",
  "workbench.iconTheme": "material-icon-theme",

  // 终端
  "terminal.integrated.fontSize": 13,
  "terminal.integrated.shell.osx": "/bin/zsh",

  // 其他
  "workbench.startupEditor": "none",
  "telemetry.telemetryLevel": "off"
}
```

### 9.2 工作区配置

```json
// .vscode/settings.json（项目级配置）

{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

---

## 十、高级技巧

### 10.1 任务自动化

```json
// .vscode/tasks.json

{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "运行开发服务器",
      "type": "shell",
      "command": "npm run dev",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "构建项目",
      "type": "shell",
      "command": "npm run build"
    }
  ]
}
```

### 10.2 多根工作区

```javascript
// File → Open Folder → 添加多个文件夹
// 或 File → Save Workspace As...

// 应用场景：
// - 同时编辑前端和后端项目
// - 微服务架构开发
// - 文档和代码一起编辑
```

### 10.3 远程开发

```bash
# 安装 Remote - SSH 插件

# 配置 SSH Host
# 1. F1 → Remote-SSH: Open SSH Configuration File
# 2. 添加配置：

Host myserver
    HostName 192.168.1.100
    User username
    IdentityFile ~/.ssh/id_rsa

# 3. 连接到远程服务器
# F1 → Remote-SSH: Connect to Host
```

### 10.4 自定义快捷键

```json
// File → Preferences → Keyboard Shortcuts (keybindings.json)

[
  {
    "key": "ctrl+shift+d",
    "command": "editor.action.deleteLines",
    "when": "editorTextFocus"
  },
  {
    "key": "ctrl+shift+s",
    "command": "workbench.action.files.saveAll"
  }
]
```

---

## 十一、故障排除

### 11.1 常见问题

| 问题 | 解决方案 |
|------|----------|
| 编辑器卡顿 | 禁用不必要的插件、关闭大型文件监视 |
| Git 无法识别 | 检查 git.path 配置 |
| 格式化冲突 | 配置 defaultFormatter |
| 插件无法安装 | 检查网络/代理设置 |
| 终端无法启动 | 检查 shell 路径配置 |

### 11.2 重置设置

```bash
# 重置所有设置（谨慎操作）
# 1. 关闭 VSCode
# 2. 删除配置文件夹

# Windows
%APPDATA%\Code\User

# macOS
~/Library/Application Support/Code/User

# Linux
~/.config/Code/User
```

---

## 十二、快捷键速查表

```
┌───────────────────────────────────────────────────────────────┐
│                        VSCode 快捷键速查                        │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  【文件操作】                                                  │
│  Ctrl+P          快速打开文件                                  │
│  Ctrl+N          新建文件                                      │
│  Ctrl+S          保存文件                                      │
│  Ctrl+Shift+P    命令面板                                      │
│                                                               │
│  【编辑操作】                                                  │
│  Ctrl+C/X        复制/剪切行                                   │
│  Ctrl+D          选中下一个相同的词                             │
│  Alt+↑/↓         移动行                                        │
│  Ctrl+/          注释/取消注释                                 │
│  Ctrl+Shift+K    删除行                                        │
│                                                               │
│  【视图操作】                                                  │
│  Ctrl+B          显示/隐藏侧边栏                               │
│  Ctrl+`          显示/隐藏终端                                 │
│  Ctrl+\           分屏编辑器                                   │
│                                                               │
│  【调试操作】                                                  │
│  F9              设置/取消断点                                 │
│  F5              开始调试                                      │
│  F10             单步跳过                                      │
│  F11             单步进入                                      │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```
