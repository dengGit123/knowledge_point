# Git 版本控制工具

> 📖 官方文档：[Git Documentation](https://git-scm.com/doc)
> 📖 在线书籍：[Pro Git（中文版）](https://git-scm.com/book/zh/v2)
> 📖 命令手册：[Git Reference](https://git-scm.com/docs)

---

## 一、概述

### 1.1 什么是 Git

**Git** 是一个**分布式版本控制系统**（Distributed Version Control System，简称 DVCS），用来记录和管理文件内容的变化，让开发者可以随时回溯到任意历史版本。

用大白话说：**Git 就像是一个"游戏存档器"**。

```
游戏存档器                          Git
─────────────────────────────────────────────────
随时保存进度              →       随时提交代码快照（commit）
读档回到某个关卡          →       回到任意历史版本
开个新存档不影响主存档    →       创建分支独立开发
把两个朋友的存档合并      →       合并多条开发分支
```

### 1.2 为什么需要版本控制

没有 Git 之前，很多人是这样管理文件版本的：

```
项目文档_最终版.docx
项目文档_最终版_修改.docx
项目文档_最终版_真的最终版.docx
项目文档_最终版_打死不改版.docx
项目文档_最终版_老板说再改一版.docx   😱
```

**痛点：**
- ❌ 不知道每个版本改了什么
- ❌ 想回到某个旧版本很困难
- ❌ 多人协作时，互相覆盖文件
- ❌ 代码丢失无法找回

**Git 的价值：**

| 能力 | 说明 |
|------|------|
| 版本历史 | 完整记录每次修改，可随时回溯 |
| 分支管理 | 并行开发多个功能，互不干扰 |
| 多人协作 | 团队成员可以同时修改、最终合并 |
| 数据备份 | 分布式存储，每个克隆都是完整备份 |
| 追溯责任 | 清楚知道"谁、在什么时候、改了什么、为什么改" |

### 1.3 Git 的诞生

Git 由 **Linus Torvalds**（Linux 之父）在 **2005 年**用两周时间开发完成。

起因：当时 Linux 内核团队使用的商业版本控制工具 BitKeeper 收回免费授权，Linus 一怒之下自己写了一个，并且设计得非常快、非常强大。

> 💡 **提示：** Git 这个名字的含义，按照 Linus 的说法是 "The stupid content tracker"（愚蠢的内容跟踪器），他自称是个暴躁的人。

---

## 二、核心概念（必须先理解）

### 2.1 Git 的三个工作区域

理解 Git 最关键的就是搞清楚**三个区域**：

```
┌──────────────┐      git add       ┌──────────────┐     git commit      ┌──────────────┐
│              │  ───────────────►  │              │  ────────────────►  │              │
│   工作区      │                    │   暂存区      │                      │   版本库      │
│  Working Dir │                    │  Staging Area│                      │  Repository  │
│              │  ◄───────────────  │   (Index)    │  ◄────────────────  │  (.git目录)  │
└──────────────┘     git restore    └──────────────┘     git reset       └──────────────┘

你在编辑器里          准备提交的            已经永久记录的
直接修改的文件         "待发货清单"           历史快照
```

| 区域 | 英文名 | 说明 | 类比 |
|------|--------|------|------|
| **工作区** | Working Directory | 你能直接看到、编辑的文件目录 | 工厂车间（干活的地方） |
| **暂存区** | Staging Area / Index | 临时存放"准备提交"的改动 | 发货清单（挑选要发的货） |
| **版本库** | Repository | 永久保存所有提交历史的地方 | 仓库（已入库的货物） |

> 💡 **提示：** 暂存区是 Git 区别于其他版本控制系统的核心设计，它让你可以**精确控制**每次提交包含哪些改动，而不是一股脑全部提交。

### 2.2 文件的四种状态

工作区中的文件会处于以下状态之一：

```
┌─────────────┐
│  Untracked  │  未跟踪（Git 完全不管它）
│  未跟踪      │
└──────┬──────┘
       │ git add
       ▼
┌─────────────┐
│  Staged     │  已暂存（在暂存区，等待提交）
│  已暂存      │
└──────┬──────┘
       │ git commit
       ▼
┌─────────────┐
│  Committed  │  已提交（保存在版本库）
│  已提交      │
└──────┬──────┘
       │ 修改了文件内容
       ▼
┌─────────────┐
│  Modified   │  已修改（相对于上次提交有改动）
│  已修改      │ ──► git add 再次进入 Staged
└─────────────┘
```

### 2.3 提交（Commit）与哈希值

每一次 `git commit` 都会生成一个**唯一标识符**（一串 SHA-1 哈希值），代表当时项目的一个**完整快照**：

```bash
commit a1b2c3d4e5f6789012345678... (HEAD -> main)
Author: 张三 <zhangsan@example.com>
Date:   2026-06-01 14:30:00

    feat: 添加用户登录功能
```

```
HEAD（指向当前所在位置）
  │
  ▼
[a1b2c3] feat: 添加用户登录功能
   │
   ▼
[b9c8d7] fix: 修复首页样式问题
   │
   ▼
[c5e4f3] init: 项目初始化
```

> 💡 **提示：** `HEAD` 是一个特殊指针，永远指向"当前所在的位置"（当前分支的最新提交）。

---

## 三、Git 与其他版本控制系统对比

### 3.1 集中式 vs 分布式

```
集中式（SVN）                          分布式（Git）
──────────────────────────           ──────────────────────────
        ┌──────────┐                 ┌──────────┐  ┌──────────┐
        │ 中央服务器 │                 │ 开发者A   │  │ 开发者B   │
        │ （唯一库） │                 │（完整库） │  │（完整库） │
        └────┬─────┘                 └────┬─────┘  └────┬─────┘
             │                            │             │
        ┌────┴─────┐                      └──────┬──────┘
        ▼          ▼                             ▼
     开发者A     开发者B                     远程仓库（同步用）
   （无完整库）（无完整库）
```

### 3.2 详细对比

| 特性 | Git（分布式） | SVN（集中式） |
|------|--------------|---------------|
| 仓库位置 | 每台机器都有完整仓库 | 只有一个中央服务器 |
| 离线工作 | ✅ 可以，本地即可提交 | ❌ 必须连接服务器 |
| 分支 | 轻量、快速、鼓励使用 | 笨重，很少用 |
| 速度 | 大部分操作本地完成，极快 | 依赖网络，较慢 |
| 数据安全 | 多份完整副本，更安全 | 服务器挂了风险大 |
| 学习曲线 | 相对陡峭 | 相对平缓 |

### 3.3 Git 的核心设计特点

| 特点 | 说明 |
|------|------|
| **快照而非差异** | 每次提交保存的是完整快照，不是逐个文件的差异 |
| **几乎所有操作本地化** | 不需要网络就能查看历史、提交、分支 |
| **数据完整性** | 用 SHA-1 校验和保证数据不被篡改、损坏 |
| **一般只追加数据** | 几乎所有操作都只增加数据，难以丢失 |

---

## 四、安装与初次配置

### 4.1 安装 Git

```bash
# macOS（任选其一）
brew install git

# Ubuntu / Debian
sudo apt-get install git

# Windows
# 下载安装包：https://git-scm.com/download/win

# 验证安装
git --version          # 输出类似：git version 2.43.0
```

### 4.2 初次配置（必做）

安装后第一件事：配置你的身份信息。**每次提交都会带上这些信息**。

```bash
# 配置用户名和邮箱（全局生效）
git config --global user.name "张三"
git config --global user.email "zhangsan@example.com"

# 配置默认分支名为 main（旧版本默认是 master）
git config --global init.defaultBranch main

# 让 Git 输出带颜色，更好看
git config --global color.ui auto

# 配置默认的文本编辑器（写提交信息时用）
git config --global core.editor "code --wait"   # 使用 VS Code

# 查看所有配置
git config --list
```

### 4.3 配置的三个级别

```
┌────────────────────────────────────────────────────┐
│  优先级： 仓库级 > 全局级 > 系统级                   │
├────────────────────────────────────────────────────┤
│  仓库级（最高）  git config          写在 .git/config   │
│  全局级          git config --global 写在 ~/.gitconfig │
│  系统级（最低）  git config --system  写在 /etc/gitconfig│
└────────────────────────────────────────────────────┘
```

> 💡 **提示：** 公司项目和开源项目用不同身份时，可以在项目目录里用 `git config user.email "..."`（不加 `--global`）单独设置仓库级身份。

---

## 五、基本工作流程

> 这是日常使用 Git 最核心的循环，**90% 的时间都在重复这几步**。

### 5.1 完整工作流图示

```
┌──────────────────────────────────────────────────────────────┐
│                     日常开发循环                              │
│                                                              │
│   1. git status        查看改了哪些文件                        │
│        ▼                                                     │
│   2. 修改文件           在工作区编写/修改代码                   │
│        ▼                                                     │
│   3. git add .         把改动放进暂存区                        │
│        ▼                                                     │
│   4. git commit -m     把暂存区的改动永久记录                  │
│        ▼                                                     │
│   5. git push           推送到远程仓库（与团队共享）            │
│        ▼                                                     │
│   6. git pull           拉取团队其他人的最新代码                │
│        ▼                                                     │
│        ↺  循环                                                │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 从零创建一个仓库

```bash
# 1. 创建并进入项目目录
mkdir my-project
cd my-project

# 2. 初始化 Git 仓库（会生成一个隐藏的 .git 目录）
git init

# 输出：Initialized empty Git repository in .../my-project/.git/

# 3. 创建一个文件
echo "# 我的项目" > README.md

# 4. 查看状态
git status
# 会显示：
# Untracked files:
#   (use "git add <file>..." to include in what will be committed)
#         README.md

# 5. 添加到暂存区
git add README.md        # 添加单个文件
git add .                # 添加当前目录所有改动（最常用）

# 6. 提交
git commit -m "init: 项目初始化"

# 7. 查看提交历史
git log
```

### 5.3 查看状态与差异

```bash
# 查看当前工作区状态（最常用的命令，没有之一）
git status

# 查看工作区相对于暂存区的差异（还没 add 的改动）
git diff

# 查看暂存区相对于最近一次提交的差异（已 add 但还没 commit）
git diff --staged       # 等价于 git diff --cached

# 查看简洁的状态（一行一个文件，推荐）
git status -s
# 输出示例：
#  M index.html        （M = Modified，已修改未暂存）
# M  style.css         （M 在左 = 已暂存）
# A  new-file.js       （A = Added，新增已暂存）
# ?? logo.png          （?? = Untracked，未跟踪）
```

### 5.4 提交历史查看

```bash
# 查看完整提交历史
git log

# 简洁版（一行一个提交，推荐日常使用）
git log --oneline
# 输出：
# a1b2c3d (HEAD -> main, origin/main) feat: 添加用户登录
# b9c8d7e fix: 修复首页样式
# c5e4f3a init: 项目初始化

# 显示每次提交具体改了什么
git log -p

# 显示最近 3 次提交
git log -3

# 图形化显示分支（可视化分支结构，强烈推荐）
git log --oneline --graph --all
# 输出：
# * a1b2c3d (HEAD -> main) feat: 登录功能
# *   b9c8d7e Merge branch 'dev'
# |\
# | * c5e4f3a dev: 开发完成
# |/
# * d6f5e4a init: 初始化

# 查看某个文件的修改历史
git log -- index.html
```

---

## 六、分支管理

### 6.1 什么是分支

**分支**就是把开发工作分离开来，让你可以在不影响主干（如 `main`）的情况下，独立开发新功能。

```
main:     A ─── B ─── C ──────────── F（合并）
                        \           /
feature:                 D ─── E ───
```

> 💡 **提示：** Git 的分支非常轻量——它只是一个指向某个提交的"指针"，创建分支几乎不占空间、瞬间完成。这是 Git 鼓励频繁使用分支的根本原因。

### 6.2 常用分支命令

```bash
# 查看所有本地分支（* 号表示当前所在分支）
git branch
# * main
#   develop
#   feature/login

# 查看所有分支（包括远程分支）
git branch -a

# 创建新分支（但不切换过去）
git branch feature/login

# 切换到指定分支
git checkout feature/login       # 传统写法
git switch feature/login         # 推荐写法（Git 2.23+）

# 创建并切换到新分支（最常用）
git checkout -b feature/login    # 传统写法
git switch -c feature/login      # 推荐写法

# 删除分支（必须先切换到其他分支）
git branch -d feature/login      # 安全删除（未合并会警告）
git branch -D feature/login      # 强制删除

# 重命名当前分支
git branch -m new-name
```

### 6.3 合并分支（merge）

把另一个分支的改动合并到当前分支：

```bash
# 场景：把 feature/login 合并到 main
git checkout main                 # 1. 先切到目标分支
git merge feature/login           # 2. 合并
git branch -d feature/login       # 3. 合并后删除临时分支
```

#### 合并的两种情况

**情况一：快进合并（Fast-forward）**

```
合并前：main 落后于 feature，main 没有新提交
main:     A ─── B ──── (HEAD)
                    \
feature:              C ─── D

合并后：main 直接"快进"到 feature 的位置
main:     A ─── B ─── C ─── D (HEAD)
```

**情况二：三方合并（产生合并提交）**

```
合并前：两条分支都有各自的新提交
main:     A ─── B ─── C ───────── (HEAD)
                        \
feature:                 D ─── E

合并后：生成一个新的"合并提交" M
main:     A ─── B ─── C ───────── M (HEAD)
                        \         /
feature:                 D ─── E ─
```

```bash
# 强制使用三方合并（保留分支历史，更清晰）
git merge --no-ff feature/login -m "merge: 合并登录功能"

# 强制使用快进合并（如果可以的话，历史更线性）
git merge --ff-only feature/login
```

### 6.4 推荐的分支策略

业界最常见的是 **Git Flow** 简化版：

```
┌────────────────────────────────────────────────────────────┐
│  分支名        │  作用           │  说明                    │
├────────────────────────────────────────────────────────────┤
│  main/master  │  生产环境        │  永远是可发布的稳定版本   │
│  develop      │  开发主干        │  集成最新开发成果         │
│  feature/*    │  功能分支        │  开发新功能，如 feature/  │
│               │                 │  login                   │
│  hotfix/*     │  紧急修复        │  修复线上 bug            │
│  release/*    │  发布分支        │  准备发版本              │
└────────────────────────────────────────────────────────────┘

命名约定：类型/描述，如 feature/user-auth、hotfix/login-crash
```

---

## 七、远程仓库操作

### 7.1 远程仓库是什么

```
┌─────────────┐         ┌─────────────┐
│  你的电脑    │  ◄────► │  远程仓库    │
│  本地仓库    │  push   │  (GitHub/   │
│  (.git)     │  pull   │   Gitee/    │
│             │         │   GitLab)   │
└─────────────┘         └─────────────┘
                        ┌─────────────┐
                        │  同事的电脑  │
                        │  本地仓库    │
                        └─────────────┘
```

常见的远程托管平台：
- **GitHub**：全球最大，开源为主（https://github.com）
- **Gitee（码云）**：国内访问快（https://gitee.com）
- **GitLab**：可私有部署，企业常用（https://gitlab.com）

### 7.2 克隆已有仓库

```bash
# 把远程仓库完整下载到本地
git clone https://github.com/user/repo.git

# 克隆到指定目录
git clone https://github.com/user/repo.git my-folder

# 克隆指定分支
git clone -b develop https://github.com/user/repo.git

# 只克隆最近一次提交（大仓库加速，节省空间）
git clone --depth 1 https://github.com/user/repo.git
```

### 7.3 关联远程仓库

```bash
# 查看已关联的远程仓库
git remote -v
# origin  https://github.com/user/repo.git (fetch)
# origin  https://github.com/user/repo.git (push)

# 本地已有仓库，关联到远程
git remote add origin https://github.com/user/repo.git

# 修改远程地址
git remote set-url origin https://github.com/user/new-repo.git

# 删除远程关联
git remote remove origin
```

### 7.4 推送与拉取

```bash
# 第一次推送本地分支到远程，并建立关联（-u = --set-upstream）
git push -u origin main

# 以后推送，直接
git push

# 推送指定分支
git push origin feature/login

# 推送所有分支
git push --all

# 拉取远程更新并合并到本地（fetch + merge）
git pull

# 拉取指定分支
git pull origin main

# 只获取远程更新，不自动合并（更安全，推荐）
git fetch
git fetch origin
```

### 7.5 push 与 pull 与 fetch 的区别

| 命令 | 方向 | 作用 | 是否修改工作区 |
|------|------|------|----------------|
| `git push` | 本地 → 远程 | 上传本地提交到远程 | ❌ |
| `git fetch` | 远程 → 本地 | 下载远程提交，但不合并 | ❌（只更新远程跟踪分支） |
| `git pull` | 远程 → 本地 | `fetch` + `merge`，下载并合并 | ✅ |

> ⚠️ **注意：** `git pull` 会直接修改你的工作区。如果担心冲突，建议先 `git fetch` 查看变化，再手动 `git merge`。

---

## 八、撤销操作

> 这一块是新手最容易出错的地方，务必理解每种撤销的区别。

### 8.1 撤销操作全景图

```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│   工作区          暂存区          版本库（已提交）              │
│                                                               │
│   git restore   git restore    git reset --soft HEAD~1        │
│   <file>        --staged        ──────────────►               │
│      ▲             <file>       git reset HEAD~1 (--mixed)    │
│      │               ▲          ──────────────────►           │
│      │               │          git reset --hard HEAD~1       │
│      └───────────────┴────────  ────────────────────►         │
│   git checkout -- <file>                                      │
│                                                               │
│   已推送的提交：用 git revert 生成一个反向提交（安全）          │
└───────────────────────────────────────────────────────────────┘
```

### 8.2 撤销工作区的修改

```bash
# 场景：改乱了文件，想丢弃工作区的修改，恢复到暂存区的状态
git restore index.html           # 推荐写法（Git 2.23+）
git checkout -- index.html       # 传统写法

# ⚠️ 这个操作不可逆！丢弃的改动找不回来
```

### 8.3 撤销已暂存的文件（add 错了）

```bash
# 场景：git add 了文件，但又不想提交它了
git restore --staged index.html  # 推荐写法：把文件移出暂存区，改动保留在工作区
git reset HEAD index.html        # 传统写法，效果相同
```

### 8.4 修改最后一次提交

```bash
# 场景：刚 commit 完，发现提交信息写错了，或者漏了文件
git commit --amend              # 修改提交信息
git commit --amend --no-edit    # 把新改动并入上次提交，不改信息

# 例如：忘记 add 一个文件
git add forgotten-file.js
git commit --amend --no-edit    # 把这个文件并进上次提交
```

> ⚠️ **注意：** `--amend` 会改变提交的哈希值。**如果该提交已经 push 到远程，就不要再 amend**，否则会让团队协作混乱。

### 8.5 回退到历史版本（reset）

```bash
# 场景：想撤销最近几次提交

# --soft：只移动 HEAD 指针，改动全部回到暂存区
git reset --soft HEAD~1

# --mixed（默认）：移动 HEAD，改动回到工作区（未暂存）
git reset HEAD~1

# --hard：彻底丢弃，工作区和暂存区的改动全部清空（危险！）
git reset --hard HEAD~1

# 回退到指定提交
git reset --hard a1b2c3d
```

#### reset 三种模式对比

| 模式 | 版本库 | 暂存区 | 工作区 | 说明 |
|------|--------|--------|--------|------|
| `--soft` | ✅ 回退 | ❌ 保留 | ❌ 保留 | 只撤销提交，改动变成已暂存 |
| `--mixed`（默认） | ✅ 回退 | ✅ 回退 | ❌ 保留 | 撤销提交 + 暂存，改动变成未暂存 |
| `--hard` | ✅ 回退 | ✅ 回退 | ✅ 回退 | **全部清空**，慎用 |

```
示例：当前在 C，想回到 B

--soft           --mixed          --hard
HEAD→B           HEAD→B           HEAD→B
暂存区=C的改动    工作区=C的改动    啥都没了
工作区=C的改动    暂存区=空        干干净净
```

### 8.6 用反向提交撤销（revert）

```bash
# 场景：想撤销某个提交，但又不想破坏提交历史（已 push 的提交推荐用这个）
git revert a1b2c3d

# revert 不会删除原提交，而是生成一个"相反操作"的新提交
git revert HEAD                 # 撤销最近一次提交
```

```
reset：把历史"擦掉"（像没发生过）
A ─── B ─── C  ──reset C──►  A ─── B

revert：新增一个"反向操作"提交（历史保留）
A ─── B ─── C  ──revert C──►  A ─── B ─── C ─── C'
                                              （C' 抵消了 C）
```

#### reset 与 revert 对比

| 命令 | 是否改写历史 | 适用场景 | 安全性 |
|------|--------------|----------|--------|
| `git reset` | ✅ 改写 | 本地未推送的提交 | 危险（`--hard`） |
| `git revert` | ❌ 不改写 | 已推送、协作中的提交 | 安全 |

> ⚠️ **注意：** **黄金法则**：已经推送到远程、且其他人可能基于它工作的提交，**永远不要用 `reset` 改写**，只能用 `revert`。

---

## 九、高级用法

### 9.1 暂存当前改动（stash）

```bash
# 场景：写到一半，突然要切分支去修个紧急 bug，但当前改动还不想提交
git stash                # 把当前改动临时藏起来，工作区变干净
git checkout hotfix      # 切去修 bug
# ... 修完 bug ...
git checkout feature     # 切回来
git stash pop            # 把刚才藏起来的改动取回来

# 查看所有 stash
git stash list

# 查看 stash 的内容
git stash show -p

# 应用但不删除 stash
git stash apply

# 清空所有 stash
git stash clear
```

```
stash 工作流：

工作区（有改动）              工作区（干净）
┌──────────┐   git stash    ┌──────────┐  ┌────────┐
│  改动A    │  ──────────►  │          │  │ 改动A  │ stash 列表
│  改动B    │               │          │  │ 改动B  │
└──────────┘               └──────────┘  └────────┘
                                            ▲
                                            │ git stash pop
                                            │ （取回并删除）
```

### 9.2 变基（rebase）

`rebase`（变基）是另一种整合分支的方式，可以把提交历史"整理"成一条直线。

```bash
# 场景：在 feature 分支开发时，main 有了新提交，
# 想让 feature 基于最新的 main 继续

git checkout feature
git rebase main
```

```
rebase 前：
main:     A ─── B ─── C
                    \
feature:              D ─── E

rebase 后（feature 的提交被"摘下来"重新放到 main 末尾）：
main:     A ─── B ─── C
                      \
feature:                D' ─── E'
```

#### merge 与 rebase 的对比

| 命令 | 历史 | 适用场景 |
|------|------|----------|
| `git merge` | 保留完整的分支合并记录 | 团队协作，记录真实开发过程 |
| `git rebase` | 历史是一条干净的直线 | 个人分支整理，提交更整洁 |

> ⚠️ **注意：** rebase 的黄金法则——**不要对已经推送到公共分支的提交执行 rebase**，因为它会重写提交哈希，导致协作者的历史混乱。

#### 为什么不能 rebase 公共分支？——混乱效果详解

**根本原因：rebase 会"重写"提交，给被移动的每一个提交生成全新的哈希值。**

```
为什么哈希会变？

一个提交的哈希 = 内容(变更) + 父提交哈希 + 作者 + 时间戳 的综合指纹

rebase 把提交"摘下来"放到新位置时：
- 父提交变了  →  哈希必然变
- 于是 D 变成 D'，E 变成 E'，整条链都是全新的

  rebase 前                        rebase 后
  D（哈希 abc111）       ──►      D'（哈希 xyz999）  ← 全新的提交！
  E（哈希 def222）       ──►      E'（哈希 qrs000）  ← 全新的提交！

  表面上看起来一样，但在 Git 眼里 D 和 D' 是两个毫无关系的提交
```

**混乱效果：远程历史和协作者的本地历史"分叉"**

```
假设 feature 是团队公共分支，小张和小李都在用。

【初始状态】大家历史一致
origin/feature:  ... ─── D ─── E
                                ▲
                              HEAD

小张已经 pull 过，本地基于 E 继续开发：
小张本地的 feature:  ... ─── D ─── E ─── 张1 ─── 张2


【小李对公共分支 feature 执行了 rebase，并 force push】

小李的 git rebase + git push -f 操作后：
origin/feature:  ... ─── D' ─── E'      ← 远程历史整条都"换"了（D→D'，E→E'）


【灾难来了 —— 小张本地的状态】

小张本地的 feature:  ... ─── D ─── E ─── 张1 ─── 张2     ← 还是旧哈希
小张的 origin/feature: ... ─── D' ─── E'                   ← 指向新哈希
                          ↕
                   Git 认为两条历史"分叉"了！
                   （因为 E 和 E' 是不同的提交，没有继承关系）
```

**协作者（小张）会遇到的具体问题：**

```
问题1：push 被拒绝
┌─────────────────────────────────────────────────────┐
│ 小张 git push                                        │
│                                                      │
│ ! [rejected]  feature -> feature (non-fast-forward)  │
│ error: failed to push some refs                      │
│ → 远程的 E' 和本地的 E 不是同一条线，Git 拒绝推送     │
└─────────────────────────────────────────────────────┘

问题2：pull 时一团乱麻
┌─────────────────────────────────────────────────────┐
│ 小张 git pull                                        │
│                                                      │
│ 若是 merge 模式：Git 会把 D/E 和 D'/E' 当作两条线合并 │
│   → 历史里同时出现 D、E、D'、E' 四个提交             │
│   → 看起来像同样的代码改了两次（重复提交）😱          │
│                                                      │
│ 若是 rebase 模式：可能产生大量莫名其妙的冲突          │
└─────────────────────────────────────────────────────┘

问题3：互相覆盖的恶性循环
┌─────────────────────────────────────────────────────┐
│ 小张一气之下也 git push -f                           │
│ → 把小李的 rebase 成果又覆盖回旧历史                  │
│ → 小李 pull 时发现自己的 rebase 白做了...             │
│ → 两人反复 force push，历史反复横跳 😵                │
└─────────────────────────────────────────────────────┘
```

**对比图：merge vs rebase 对公共分支的影响**

```
✅ 用 merge 处理公共分支（安全）：
   原来的提交 D、E 原封不动，只是新增一个合并提交 M
   协作者的历史完全兼容，pull/push 都正常

   ... ─── D ─── E ─── M（新增）
                      └── 张1 ─── 张2 ──┘

❌ 用 rebase 处理公共分支（灾难）：
   D、E 被替换成全新的 D'、E'
   协作者基于的旧提交 D、E "悬空"了，历史分叉

   ... ─── D' ─── E'              ← 远程（新）
   ... ─── D ─── E ─── 张1 ─── 张2 ← 小张本地（旧）
```

**如果已经不小心 rebase 了公共分支，怎么办？**

```bash
# 情况一：rebase 后还没 push —— 赶紧撤销
git rebase --abort                            # 中途可直接取消
git reset --hard ORIG_HEAD                    # rebase 完成后用这个回到 rebase 前

# 情况二：已经 force push 了 —— 通知所有协作者！
# 让每个协作者执行（放弃本地旧历史，对齐远程）：
git fetch origin
git reset --hard origin/feature               # ⚠️ 本地未推送的改动会丢失，需提前备份

# 正确做法：公共分支只用 merge，rebase 只用于自己的私有分支
```

> 💡 **一句话记忆：** rebase 会给提交"换身份证号"（新哈希）。**只有还没推给别人、别人看不见的私有分支**，才能安全 rebase；只要别人可能已经基于它工作，就只能用 merge。

### 9.3 挑选提交（cherry-pick）

```bash
# 场景：只想把某个分支的某一次提交搬过来，不要整个分支
git cherry-pick a1b2c3d

# 把多个提交搬过来
git cherry-pick a1b2c3d e5f6g7h

# 把一个范围的提交搬过来
git cherry-pick A..B
```

```
main:     A ─── B ──── C ──── D ──── (HEAD)
feature:           └ E ─── F

只想把 feature 的 E 搬到 main：
git cherry-pick E

结果：
main:     A ─── B ──── C ──── D ──── E' (HEAD)
feature:           └ E ─── F
```

### 9.4 命令日志（reflog）——后悔药

```bash
# reflog 记录了 HEAD 的所有移动，包括被 reset 丢弃的提交
git reflog
# 输出：
# a1b2c3d HEAD@{0}: reset: moving to HEAD~1
# b9c8d7e HEAD@{1}: commit: feat: 新功能    ← 被丢弃的提交还能找回！
# c5e4f3a HEAD@{2}: commit: init

# 找回误删的提交：用 reflog 找到哈希，再 reset 回去
git reset --hard b9c8d7e
```

> 💡 **提示：** 只要你提交过（哪怕是 `--hard` 丢弃的），`git reflog` 一般都能找回。Git 默认 90 天内不会真正删除这些对象。

### 9.5 标签管理（tag）

标签用来标记**重要的版本节点**，比如发版 v1.0.0。

```bash
# 查看所有标签
git tag

# 创建轻量标签
git tag v1.0.0

# 创建附注标签（推荐，带说明信息）
git tag -a v1.0.0 -m "正式版 1.0 发布"

# 给历史提交打标签
git tag -a v0.9.0 -m "beta 版" a1b2c3d

# 查看标签详细信息
git show v1.0.0

# 推送标签到远程（tag 不会随 push 自动推送）
git push origin v1.0.0
git push origin --tags       # 推送所有标签

# 删除标签
git tag -d v1.0.0                       # 删除本地
git push origin --delete v1.0.0         # 删除远程
```

---

## 十、常见场景实战

### 10.1 场景：第一次把本地项目推到 GitHub

```bash
# 1. 在 GitHub 上新建一个空仓库（不要勾选 README）

# 2. 本地初始化并提交
git init
git add .
git commit -m "init: 项目初始化"
git branch -M main                       # 重命名为 main

# 3. 关联远程并推送
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

### 10.2 场景：开发新功能的标准流程

```bash
# 1. 从最新的 main 切出新分支
git checkout main
git pull                                # 先更新 main
git checkout -b feature/user-profile

# 2. 开发、提交（小步多次提交）
# ... 写代码 ...
git add .
git commit -m "feat: 添加用户资料页面"
# ... 继续写 ...
git add .
git commit -m "feat: 添加头像上传功能"

# 3. 推送到远程
git push -u origin feature/user-profile

# 4. 在 GitHub 上发起 Pull Request，团队 Review 后合并
```

### 10.3 场景：合并时遇到冲突

```bash
git merge feature/login
# Auto-merging index.html
# CONFLICT (content): Merge conflict in index.html
# Automatic merge failed; fix conflicts and then commit the result.
```

打开冲突文件，会看到：

```html
<<<<<<< HEAD
<div>当前分支（main）的内容</div>
=======
<div>要合并分支（feature）的内容</div>
>>>>>>> feature/login
```

处理方法：

```bash
# 1. 手动编辑文件，保留正确的内容，删掉 <<<<<<< ======= >>>>>>> 标记
# 2. 标记冲突已解决
git add index.html
# 3. 完成合并
git commit -m "merge: 解决登录功能合并冲突"
```

> 💡 **提示：** 用 `git status` 可以随时查看还有哪些冲突未解决。VS Code 等编辑器有可视化的冲突解决界面。

### 10.4 场景：撤销已经 push 的错误提交

```bash
# 错误做法：reset 后强制 push（会改写历史，协作时危险）
# git reset --hard HEAD~1 && git push -f   ← 慎用！

# 正确做法：用 revert 生成反向提交
git revert HEAD
git push
```

### 10.5 场景：把某次提交的改动撤销一半

```bash
# 用 checkout 只恢复某个文件的旧版本
git checkout a1b2c3d -- index.html
```

### 10.6 场景：修改已经提交的作者信息

```bash
# 修改最近一次提交的作者
git commit --amend --author="新名字 <new@email.com>"

# 修改最后一次提交的时间为现在
git commit --amend --no-edit --reset-author
```

---

## 十一、.gitignore 忽略文件

### 11.1 什么是 .gitignore

在项目根目录创建 `.gitignore` 文件，告诉 Git 哪些文件**不要跟踪**（如依赖、编译产物、密钥等）。

### 11.2 常用 .gitignore 模板

```gitignore
# ===== 依赖目录 =====
node_modules/
.pnp/

# ===== 构建产物 =====
dist/
build/
*.local

# ===== 日志 =====
logs/
*.log
npm-debug.log*

# ===== 编辑器/系统文件 =====
.vscode/
.idea/
.DS_Store
Thumbs.db

# ===== 环境变量（含敏感信息，务必忽略）=====
.env
.env.local
.env.*.local

# ===== 测试覆盖率 =====
coverage/

# ===== TypeScript 缓存 =====
*.tsbuildinfo
```

### 11.3 .gitignore 语法

```gitignore
# 注释
node_modules/        # 末尾 / 表示目录
*.log                # * 匹配任意字符，忽略所有 .log 文件
!important.log       # ! 表示取反（例外），不忽略这个文件
temp/*.txt           # 忽略 temp 目录下的 txt 文件
temp/**/*.txt        # ** 匹配多级目录
build/               # 忽略整个 build 目录
```

> ⚠️ **注意：** `.gitignore` 只对**未被跟踪**的文件生效。如果文件已经被 `git add` 跟踪了，再加进 `.gitignore` 是无效的，需要先取消跟踪：
> ```bash
> git rm --cached 文件名     # 从暂存区移除，但保留本地文件
> ```

---

## 十二、配置别名（提升效率）

每次敲长命令太累？可以设置别名：

```bash
# 设置常用别名
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.lg "log --oneline --graph --all"

# 之后就能简写
git st          # = git status
git co main     # = git checkout main
git lg          # 漂亮的图形化日志
```

---

## 十三、常见问题与注意事项

### 13.1 高频踩坑点

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| **提交时身份不对** | user.email 配置错误 | `git config user.email` 检查并修改 |
| **.gitignore 不生效** | 文件已被跟踪 | `git rm --cached 文件` |
| **pull 时一堆冲突** | 双方都改了同一处 | 手动解决冲突后 `git add` + `git commit` |
| **push 被拒绝** | 远程有你没有的提交 | 先 `git pull` 再 `push` |
| **误删了分支** | 看似丢失 | `git reflog` 找回 |
| **commit 乱码** | 中文编码问题 | `git config --global core.quotepath false` |

### 13.2 提交信息规范（Conventional Commits）

业界通用的提交信息格式，让历史更规范、便于自动生成 changelog：

```
<类型>(<范围>): <描述>

类型说明：
feat     新功能（feature）
fix      修复 bug
docs     文档改动
style    代码格式（不影响功能）
refactor 重构（既不是新功能也不是修 bug）
perf     性能优化
test     测试相关
chore    构建/工具变动
```

```bash
# 规范的提交示例
git commit -m "feat(user): 添加用户登录功能"
git commit -m "fix(cart): 修复购物车数量不更新的问题"
git commit -m "docs: 更新 README 使用说明"
```

### 13.3 安全注意事项

```bash
# 1. 不要把敏感信息提交进仓库！
#    API Key、密码、数据库连接串等放进 .env 并加入 .gitignore

# 2. 如果不小心提交了密钥
git rm --cached .env                  # 移除跟踪
# 然后修改 .gitignore
# 注意：历史记录里还有，需要用 BFG 或 git filter-repo 清理历史
# 最重要的是：立即更换泄露的密钥！

# 3. 强制 push 前三思
git push -f                           # 危险！会覆盖远程历史
git push --force-with-lease           # 相对安全（如果远程有别人的提交会拒绝）
```

---

## 十四、Git 工作区域与命令速查表

```
┌─────────────────────────────────────────────────────────────────┐
│                        Git 核心命令速查                           │
├────────────────┬────────────────────────────────────────────────┤
│  配置          │  git config --global user.name "名字"            │
│                │  git config --global user.email "邮箱"           │
├────────────────┼────────────────────────────────────────────────┤
│  初始化/克隆    │  git init  /  git clone <url>                  │
├────────────────┼────────────────────────────────────────────────┤
│  查看状态      │  git status  /  git diff  /  git log --oneline  │
├────────────────┼────────────────────────────────────────────────┤
│  暂存与提交    │  git add .  /  git commit -m "msg"              │
├────────────────┼────────────────────────────────────────────────┤
│  分支          │  git branch / git switch -c <名> / git merge    │
├────────────────┼────────────────────────────────────────────────┤
│  远程          │  git push / git pull / git fetch / git remote   │
├────────────────┼────────────────────────────────────────────────┤
│  撤销          │  git restore / git reset / git revert           │
├────────────────┼────────────────────────────────────────────────┤
│  暂存改动      │  git stash / git stash pop                      │
├────────────────┼────────────────────────────────────────────────┤
│  标签          │  git tag -a v1.0 -m "msg" / git push --tags     │
├────────────────┼────────────────────────────────────────────────┤
│  后悔药        │  git reflog                                    │
└────────────────┴────────────────────────────────────────────────┘
```

---

## 十五、总结

### 15.1 核心心智模型

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   1. 三个区域：工作区 ──add──► 暂存区 ──commit──► 版本库      │
│                                                             │
│   2. 日常循环：改代码 → add → commit → push → pull           │
│                                                             │
│   3. 分支隔离：多线并行开发，最后 merge 合并                  │
│                                                             │
│   4. 安全撤销：本地用 reset，已推送用 revert                 │
│                                                             │
│   5. 终极后悔药：reflog 几乎能找回一切                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 15.2 黄金法则速记

| 法则 | 内容 |
|------|------|
| **频繁提交** | 小步提交，每次只做一件事，便于回溯 |
| **提交信息有意义** | 写清楚"做了什么"，而非"改了文件" |
| **先 pull 再 push** | 避免不必要的冲突 |
| **不要提交敏感信息** | 密钥、密码绝不进版本库 |
| **公共分支不 rebase/reset** | 已推送的提交只用 revert |
| **用分支隔离工作** | 永远不要直接在 main 上开发大功能 |

### 15.3 学习路径建议

```
1. 掌握基本流程        ← init / add / commit / status / log
        │
        ▼
2. 学会分支与合并      ← branch / merge / 解决冲突
        │
        ▼
3. 玩转远程协作        ← clone / push / pull / fetch / PR
        │
        ▼
4. 理解撤销操作        ← restore / reset / revert / amend
        │
        ▼
5. 进阶技巧           ← stash / rebase / cherry-pick / reflog
```

> 💡 **提示：** 不用一次全部记住，把日常的 **add → commit → push → pull** 用熟，遇到问题再回来查对应的高级用法即可。
