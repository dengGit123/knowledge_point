# HomeBrew 使用指南

## 什么是 HomeBrew

HomeBrew（简称 brew）是 macOS 上的**软件包管理器**，类似于 Linux 上的 apt、yum 或 Windows 上的 chocolatey。

> **通俗理解**：就像应用商店的命令行版本，可以一键安装、卸载、更新各种开发工具和软件。

## 官方链接

- 官网：[https://brew.sh](https://brew.sh)
- GitHub：[https://github.com/Homebrew/brew](https://github.com/Homebrew/brew)

## 为什么需要 HomeBrew

### 传统安装方式的痛点

```bash
# 传统方式安装软件的步骤
1. 打开浏览器搜索软件
2. 找到官网下载安装包
3. 双击安装
4. 拖拽到应用程序文件夹
5. 可能还需要手动配置环境变量
```

### 使用 HomeBrew 的优势

```bash
# 一行命令搞定
brew install nginx

# 自动完成：
# - 下载最新版本
# - 安装到统一位置
# - 配置环境变量
# - 管理依赖关系
```

## 安装 HomeBrew

### 系统要求

- macOS 10.10 或更高版本
- 或者 Linux 系统（HomeBrew Linux）
- 需要 Xcode Command Line Tools

### 安装步骤

#### 1. 安装 Xcode Command Line Tools

```bash
xcode-select --install
```

点击弹出窗口中的"安装"按钮，等待安装完成。

#### 2. 安装 HomeBrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 3. 配置环境变量（Apple Silicon Mac）

如果是 M1/M2/M3 等 Apple Silicon Mac，需要添加 HomeBrew 到 PATH：

```bash
# 对于 zsh（macOS 默认）
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"

# 对于 bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.bash_profile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

#### 4. 验证安装

```bash
brew --version
```

输出版本信息即表示安装成功。

## HomeBrew 目录结构

### Intel Mac

```
/usr/local/
├── Cellar/       # 已安装软件的实际位置
├── bin/          # 二进制文件链接
├── etc/          # 配置文件
├── Frameworks/   # 框架文件
├── lib/          # 库文件
├── opt/          # 软件链接
└── share/        # 共享文件
```

### Apple Silicon Mac

```
/opt/homebrew/    # HomeBrew 主目录
├── Cellar/
├── bin/
├── etc/
└── ...
```

### Cellar 目录详解

**Cellar** 是 HomeBrew 安装软件的核心目录，所有通过 `brew install` 安装的软件都存放在这里。

> **通俗理解**：Cellar 英文意思是"酒窖"，在这里比喻"存放软件（像酒一样）的地方"。

#### 目录结构示例

```
/opt/homebrew/Cellar/
├── nginx/                 # 软件按名称组织
│   ├── 1.23.0/           # 版本号目录
│   │   ├── bin/          # 可执行文件
│   │   │   └── nginx
│   │   ├── lib/          # 库文件
│   │   │   └── libnginx.so
│   │   ├── share/        # 共享资源
│   │   │   └── man/
│   │   └── .brew/        # HomeBrew 元数据
│   └── 1.24.0/           # 可以同时存在多个版本
│       └── bin/
│           └── nginx
├── git/
│   └── 2.40.0/
│       ├── bin/git
│       └── share/man/
└── node/
    └── 18.15.0/
        ├── bin/node
        └── lib/node_modules/
```

#### 为什么需要 Cellar？

1. **版本管理**：可以同时保留多个版本，方便切换
2. **隔离安装**：每个软件独立存放，互不干扰
3. **便于卸载**：删除对应目录即可完全卸载
4. **便于升级**：安装新版本，旧版本可选择性保留

#### 符号链接机制

HomeBrew 通过符号链接让命令可以直接使用：

```
/opt/homebrew/Cellar/nginx/1.23.0/bin/nginx  (实际文件)
                    ↓ 符号链接
/opt/homebrew/bin/nginx                      (链接文件)
                    ↓ 加入 PATH
用户可以直接运行: nginx
```

#### 查看实际文件

```bash
# 查看 Cellar 目录内容
ls /opt/homebrew/Cellar

# 查看某个软件的安装内容
ls -la /opt/homebrew/Cellar/nginx/

# 查看某个软件的所有版本
ls -la /opt/homebrew/Cellar/git/

# 查看符号链接指向
ls -la /opt/homebrew/bin/git
# 输出: git -> ../Cellar/git/2.40.0/bin/git

# 查看软件安装的详细信息
brew list git --verbose
```

#### 目录对比

| 架构 | HomeBrew 前缀 | Cellar 位置 | bin 位置 |
|------|--------------|------------|----------|
| Intel Mac | `/usr/local` | `/usr/local/Cellar` | `/usr/local/bin` |
| Apple Silicon | `/opt/homebrew` | `/opt/homebrew/Cellar` | `/opt/homebrew/bin` |

#### 查看当前架构

```bash
# 查看 HomeBrew 安装路径
brew --prefix

# 输出（Intel Mac）:
# /usr/local

# 输出（Apple Silicon）:
# /opt/homebrew

# 查看 Cellar 路径
brew --cellar

# 输出（Intel Mac）:
# /usr/local/Cellar

# 输出（Apple Silicon）:
# /opt/homebrew/Cellar
```

#### ⚠️ 重要提示

> **不要手动修改 Cellar 目录！**
>
> Cellar 目录完全由 HomeBrew 自动管理，手动修改可能导致：
> - 软件版本混乱
> - 符号链接断裂
> - `brew` 命令无法正常工作
> - 依赖关系出错
>
> 如果需要操作软件，始终使用 `brew` 命令：
> ```bash
> brew install nginx    # 安装
> brew upgrade nginx    # 升级
> brew switch nginx 1.23.0  # 切换版本
> brew uninstall nginx  # 卸载
> ```

## 基本概念

### Formula（配方）

Formula 是用 Ruby 编写的软件包描述文件，定义了如何安装软件。

> **通俗理解**：就像一份"菜谱"，告诉 HomeBrew 如何下载、编译、安装某个软件。

### Cask（木桶）

Cask 用于安装 macOS 原生应用程序（.app 格式）。

> **通俗理解**：用于安装带图形界面的应用，如 Chrome、VS Code 等。

### Tap（水龙头）

Tap 是第三方软件仓库的扩展。

> **通俗理解**：就像"插件源"，可以添加更多官方仓库没有的软件。

## 常用命令

### 查看帮助

```bash
brew help              # 查看帮助信息
brew help <command>    # 查看特定命令的帮助
```

### 搜索软件

```bash
# 搜索软件包
brew search nginx

# 搜索包含关键字的包
brew search python

# 仅搜索 formula
brew search --formula node

# 仅搜索 cask
brew search --cask visual
```

### 查看软件信息

```bash
# 查看软件详细信息
brew info nginx

# 查看已安装软件的信息
brew info --installed nginx

# 查看软件的依赖关系
brew deps nginx
```

### 安装软件

```bash
# 安装 formula（命令行工具）
brew install git

# 安装 cask（图形界面应用）
brew install --cask google-chrome

# 安装特定版本
brew install python@3.11

# 安装时显示详细信息
brew install --verbose nginx
```

### 查看已安装软件

```bash
# 查看所有已安装的软件
brew list

# 查看已安装的 formula
brew list --formula

# 查看已安装的 cask
brew list --cask

# 查看特定版本
brew list --versions nginx
```

### 更新软件

```bash
# 更新 HomeBrew 自身
brew update

# 检查哪些软件可以更新
brew outdated

# 更新所有已安装的软件
brew upgrade

# 更新特定软件
brew upgrade nginx

# 仅升级 formula
brew upgrade --formula

# 仅升级 cask
brew upgrade --cask
```

### 卸载软件

```bash
# 卸载软件
brew uninstall nginx

# 卸载软件及其依赖
brew uninstall --zap nginx

# 卸载软件并清除所有相关文件
brew uninstall --force nginx

# 卸载 cask
brew uninstall --cask google-chrome
```

### 清理系统

```bash
# 清理旧版本软件（保留最新版本）
brew cleanup

# 清理所有文件（包括缓存）
brew cleanup --prune=all

# 查看可以清理的文件大小
brew cleanup -n
```

### 查看系统状态

```bash
# 查看 HomeBrew 配置信息
brew config

# 查看系统诊断信息
brew doctor

# 查看使用统计
brew analytics info
```

## Cask 使用指南

### 搜索图形应用

```bash
# 搜索应用
brew search --cask chrome
brew search --cask wechat
```

### 安装图形应用

```bash
# 基本安装
brew install --cask visual-studio-code

# 常用应用示例
brew install --cask google-chrome      # Chrome 浏览器
brew install --cask firefox           # Firefox 浏览器
brew install --cask wechat            # 微信
brew install --cask qq                # QQ
brew install --cask dingtalk           # 钉钉
brew install --cask docker            # Docker
brew install --cask postman           # Postman
brew install --cask sequel-ace        # 数据库工具
brew install --cask sublime-text      # 编辑器
brew install --cask iterm2            # 终端
brew install --cask karabiner-elements # 键位修改
```

### 查看 cask 信息

```bash
brew info --cask visual-studio-code
```

## Tap 使用指南

### 查看已添加的 tap

```bash
brew tap
```

### 添加第三方仓库

```bash
# 添加 GitHub 上的 tap
brew tap user/repo

# 示例：添加字体仓库
brew tap homebrew/cask-fonts

# 示例：添加游戏相关的软件
brew tap nicohood/r-game-boy-emulator
```

### 删除 tap

```bash
brew untap user/repo
```

## 常用 Tap 仓库

### 官方扩展仓库

```bash
# 字体仓库
brew tap homebrew/cask-fonts

# 版本切换工具
brew tap homebrew/cask-versions
```

### 第三方仓库

```bash
# 科学计算
brew tap brewsci/science

# 图形处理
brew tap homebrew/cask-drivers

# 开发工具
brew tap mongodb/brew
```

## 版本管理

### 查看所有可用版本

```bash
# 查看软件的所有版本
brew info --all --versions python
```

### 安装特定版本

```bash
# 安装特定主版本
brew install python@3.11

# 查看 formula 历史
brew log python
```

### 切换版本

```bash
# 切换到特定版本
brew switch python 3.11.0
```

### 锁定版本

```bash
# 防止软件被自动升级
brew pin python

# 解除锁定
brew unpin python

# 查看已锁定的软件
brew list --pinned
```

## 服务管理

### 启动服务

```bash
# 启动服务
brew services start nginx

# 启动并设置为开机自启
brew services start --all
```

### 停止服务

```bash
# 停止服务
brew services stop nginx

# 停止所有服务
brew services stop --all
```

### 重启服务

```bash
brew services restart nginx
```

### 查看服务状态

```bash
# 查看所有服务状态
brew services list

# 查看特定服务状态
brew services info nginx
```

## 常用软件安装推荐

### 开发工具

```bash
# 版本管理
brew install git                # Git
brew install svn                # SVN
brew install mercurial          # Mercurial

# 编程语言
brew install python             # Python
brew install node               # Node.js
brew install go                 # Go
brew install ruby               # Ruby
brew install rust               # Rust
brew install java               # Java

# 构建工具
brew install cmake              # CMake
brew install maven              # Maven
brew install gradle             # Gradle

# 数据库
brew install postgresql          # PostgreSQL
brew install mysql              # MySQL
brew install redis              # Redis
brew install mongodb-community   # MongoDB
brew install sqlite             # SQLite
```

### 命令行工具

```bash
# 网络工具
brew install curl               # curl
brew install wget               # wget
brew install httpie             # HTTPie
brew install aria2              # aria2 下载工具

# 文本处理
brew install vim                # Vim
brew install neovim             # Neovim
brew install emacs              # Emacs
brew install micro              # Micro 编辑器

# 系统工具
brew install htop               # 进程监控
brew install btop               # 更好的进程监控
brew install tree               # 目录树
brew install ripgrep            # rg 搜索工具
brew install fd                 # fd 查找工具
brew install fzf                # 模糊搜索
brew install bat                # 更好的 cat
brew install exa                # 更好的 ls
brew install duf                # 更好的 du
brew install tldr               # 简化版 man

# 开发工具
brew install tmux               # tmux 终端复用
brew install jq                 # JSON 处理
brew install yq                 # YAML 处理
brew install docker             # Docker
brew install kubectl            # Kubernetes
brew install terraform          # Terraform
```

### 图形界面应用

```bash
# 浏览器
brew install --cask google-chrome
brew install --cask firefox
brew install --cask microsoft-edge

# 通讯工具
brew install --cask wechat
brew install --cask qq
brew install --cask dingtalk
brew install --cask slack
brew install --cask telegram

# 开发工具
brew install --cask visual-studio-code
brew install --cask sublime-text
brew install --cask tableplus
brew install --cask sequel-ace
brew install --cask postman
brew install --cask insomnia

# 效率工具
brew install --cask alfred
brew install --cask raycast
brew install --cask karabiner-elements
brew install --cask rectangle

# 其他
brew install --cask iterm2
brew install --cask docker
brew install --cask imageoptim
brew install --cask iina
```

## 环境变量配置

### 配置 PATH

HomeBrew 会自动将软件链接到 bin 目录，确保 PATH 包含：

```bash
# Intel Mac
export PATH="/usr/local/bin:$PATH"
export PATH="/usr/local/sbin:$PATH"

# Apple Silicon Mac
export PATH="/opt/homebrew/bin:$PATH"
export PATH="/opt/homebrew/sbin:$PATH"
```

### 查看当前配置

```bash
brew config
```

输出示例：
```
HOMEBREW_VERSION: 4.2.0
ORIGIN: https://github.com/Homebrew/brew
HEAD: 1234567890abcdef
Last commit: 2 days ago
Core tap ORIGIN: https://github.com/Homebrew/homebrew-core
Core tap HEAD: 1234567890abcdef
Core tap last commit: 1 day ago
HOMEBREW_PREFIX: /opt/homebrew
HOMEBREW_CASK_OPTS: []
HOMEBREW_DISPLAY: :0
Homebrew/homebrew-core: git
Homebrew/homebrew-cask: git
```

## 问题排查

### brew doctor

```bash
# 检查系统问题
brew doctor
```

常见问题和解决方法：

#### 1. 权限问题

```bash
# 修复权限
sudo chown -R $(whoami) /usr/local/*  # Intel Mac
sudo chown -R $(whoami) /opt/homebrew/*  # Apple Silicon Mac
```

#### 2. Git 配置问题

```bash
# 检查 git 配置
git config --global --list

# 如果没有配置，添加用户信息
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

#### 3. SSL 证书问题

```bash
# 更新证书
brew update
```

### 清理缓存

```bash
# 查看缓存大小
du -sh ~/Library/Caches/Homebrew

# 清理缓存
rm -rf ~/Library/Caches/Homebrew/*
```

### 重新安装

如果问题无法解决，可以考虑重新安装：

```bash
# 卸载 HomeBrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/uninstall.sh)"

# 重新安装
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## 禁用匿名统计

HomeBrew 默认会收集使用统计，可以禁用：

```bash
# 禁用统计
brew analytics off

# 查看统计状态
brew analytics state

# 查看统计信息
brew analytics info
```

## 高级用法

### 创建自己的 Formula

```bash
# 创建一个新的 formula
brew create https://example.com/software-1.0.tar.gz

# 编辑 formula
brew edit software
```

### 查看软件依赖树

```bash
# 查看依赖树
brew deps --tree --installed

# 查看被哪些软件依赖
brew uses --installed nginx
```

### 备份已安装软件

```bash
# 导出安装列表
brew bundle dump

# 导出到指定文件
brew bundle dump --file=~/Brewfile

# 根据 Brewfile 安装
brew bundle install --file=~/Brewfile
```

### Brewfile 示例

```ruby
# Brewfile
tap "homebrew/cask-fonts"
tap "homebrew/cask-versions"

brew "python"
brew "node"
brew "git"
brew "vim"

cask "google-chrome"
cask "visual-studio-code"
cask "wechat"
```

## 性能优化

### 并行安装

```bash
# 并行安装多个软件
brew install git node python go
```

### 使用本地镜像

如果访问 GitHub 较慢，可以配置镜像：

```bash
# 使用清华镜像（示例）
export HOMEBREW_BOTTLE_DOMAIN=https://mirrors.tuna.tsinghua.edu.cn/homebrew-bottles
```

## 注意事项

1. **软件安装位置**：不要手动修改 /usr/local/Cellar 或 /opt/homebrew/Cellar 目录
2. **权限问题**：避免使用 sudo 安装软件，除非必要
3. **更新频率**：定期执行 brew update 保持软件最新
4. **清理缓存**：定期执行 brew cleanup 释放磁盘空间
5. **版本冲突**：注意软件版本兼容性，特别是开发工具

## 快速参考

### 日常使用

```bash
brew update              # 更新 HomeBrew
brew upgrade             # 升级所有软件
brew cleanup             # 清理旧版本
brew outdated            # 查看过期软件
brew doctor              # 检查系统健康
```

### 软件管理

```bash
brew search <name>       # 搜索软件
brew info <name>          # 查看信息
brew install <name>       # 安装软件
brew uninstall <name>     # 卸载软件
brew list                # 查看已安装
```

### 服务管理

```bash
brew services start <name>    # 启动服务
brew services stop <name>     # 停止服务
brew services restart <name>  # 重启服务
brew services list            # 查看服务状态
```

## 常见问题

### Q：HomeBrew 和系统自带软件冲突怎么办？

**A**：HomeBrew 会尽量避免覆盖系统软件，使用 brew info 可以查看软件的安装位置和冲突情况。

### Q：如何卸载 HomeBrew？

**A**：使用官方提供的卸载脚本：
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/uninstall.sh)"
```

### Q：为什么有些软件需要 sudo？

**A**：某些系统级别的软件需要 root 权限才能安装，这是正常现象。

### Q：如何安装特定版本的软件？

**A**：
```bash
# 查看可用版本
brew info --all --versions <formula>

# 安装特定版本（通过历史提交）
brew install https://raw.githubusercontent.com/Homebrew/homebrew-core/<commit>/Formula/<formula>.rb
```

### Q：Cask 和 Formula 有什么区别？

**A**：
- **Formula**：命令行工具，通常是编译后的二进制文件
- **Cask**：图形界面应用，通常是 .app 文件

### Q：如何查看软件的安装日志？

**A**：
```bash
brew install --debug <formula>
```

### Q：为什么 brew install 很慢？

**A**：可能是网络问题，可以尝试：
1. 使用国内镜像
2. 检查网络连接
3. 使用 --verbose 查看详细输出

### Q：如何批量安装软件？

**A**：
```bash
# 方式1：一次安装多个
brew install git node python

# 方式2：使用 Brewfile
brew bundle install
```

## 相关资源

- [官方文档](https://docs.brew.sh)
- [Formula Cookbook](https://docs.brew.sh/Formula-Cookbook)
- [HomeBrew GitHub](https://github.com/Homebrew)
- [awesome-homebrew](https://github.com/Homebrew/awesome-homebrew) 社区维护的软件列表
