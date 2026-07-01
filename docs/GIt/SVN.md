# SVN（Subversion）版本控制工具

> 📖 官方网站：[Apache Subversion](https://subversion.apache.org/)
> 📖 官方手册：[Version Control with Subversion（SVN Book）](https://svnbook.redbean.com/)
> 📖 中文手册：[Subversion 中文站](http://svnbook.subversion.org.cn/)

---

## 一、概述

### 1.1 什么是 SVN

**SVN**（全称 **Subversion**）是一个**集中式版本控制系统**（Centralized Version Control System，简称 CVCS），由 Apache 软件基金会维护。它用来记录和管理文件的历史变化，让团队可以协作开发、随时回溯历史版本。

用大白话说：**SVN 就像是一个"公司档案室"**。

```
公司档案室                         SVN
─────────────────────────────────────────────────
所有档案只存在档案室        →       所有代码只存在中央服务器
想看档案要去档案室取副本    →       checkout 下载工作副本到本地
改完要交回档案室归档        →       commit 直接提交回中央服务器
取最新档案要看档案室        →       update 从服务器同步最新版本
只有一个权威档案室          →       只有一个中央仓库，它是唯一真相
```

### 1.2 SVN 的定位

SVN 是 **CVS**（更老的版本控制工具）的继任者，设计目标是"做一个更好的 CVS"。它在 2000 年发布，曾在企业中广泛使用。

虽然近年来 **Git 已成为主流**，但 SVN 仍在很多传统企业、政府项目、大型存量系统中使用，原因包括：

| 仍使用 SVN 的原因 | 说明 |
|------------------|------|
| 严格的权限控制 | 可对目录/文件细粒度授权，企业刚需 |
| 集中式更易管控 | 所有代码在服务器，便于审计、保密 |
| 大文件友好 | 二进制文件、大文件管理比 Git 稳定 |
| 学习成本低 | 概念少，操作直观（检出-更新-提交） |
| 历史包袱 | 大量存量项目迁移成本高 |

### 1.3 SVN 与 Git 的本质区别（先建立认知）

```
SVN（集中式）                         Git（分布式）
──────────────────────────           ──────────────────────────
        ┌──────────┐                 ┌──────────┐  ┌──────────┐
        │ 中央服务器 │  唯一权威       │ 开发者A   │  │ 开发者B   │
        │  （仓库） │                 │（完整库） │  │（完整库） │
        └────┬─────┘                 └────┬─────┘  └────┬─────┘
       ↗     ↖                            │             │
   检出     提交                          └──────┬──────┘
   ↓         ↑                                   ↓
┌─────┐   ┌─────┐                          远程仓库（同步用）
│ A   │   │ B   │  只有工作副本            本地即可提交，离线工作
└─────┘   └─────┘  没有完整历史
```

> 💡 **一句话区分：** SVN 离线不能提交（必须连服务器），Git 离线也能提交（本地就有完整仓库）。

---

## 二、核心概念（必须先理解）

### 2.1 SVN 的三要素

理解 SVN 关键抓住三个概念：

```
┌──────────────┐   checkout/update    ┌──────────────┐
│              │  ◄─────────────────  │              │
│   工作副本    │                      │   中央仓库    │
│ Working Copy │                      │  Repository  │
│ （本地）      │  ──────────────────► │  （服务器）   │
│              │      commit          │              │
└──────────────┘                      └──────────────┘
你在本地编辑的文件                      存放所有版本历史的地方
```

| 概念 | 英文 | 说明 | 类比 |
|------|------|------|------|
| **仓库** | Repository | 存放所有版本历史的服务器端数据库 | 档案室 |
| **工作副本** | Working Copy | 你 checkout 下来的本地文件目录 | 从档案室借出的副本 |
| **修订版本** | Revision | 每次提交后的全局版本号（r1, r2...） | 档案的卷宗号 |

### 2.2 修订版本号（Revision）

SVN 和 Git 一个**重大区别**：SVN 用**全局递增的整数**作为版本号，而不是哈希值。

```
提交历史：
r1  项目初始化              ← 第一次提交，整个仓库版本变成 r1
r2  添加登录功能            ← 第二次提交，整个仓库版本变成 r2
r3  修复购物车 bug          ← 第三次提交，整个仓库版本变成 r3
                  ▲
               HEAD（仓库当前最新版本）

特点：
- 版本号是"仓库级别"的，不是"提交级别"的
- 每次提交，整个仓库的版本号 +1（哪怕只改了一个文件）
- 简单直观：r3 一定比 r2 新
```

常用的版本号关键字：

| 关键字 | 含义 |
|--------|------|
| `HEAD` | 仓库里最新的版本 |
| `BASE` | 工作副本当前所基于的版本 |
| `COMMITTED` | 工作副本最后一次提交的版本 |
| `PREV` | `COMMITTED` 的前一个版本 |

```bash
# 用法示例
svn update -r 3            # 把工作副本更新到第 3 版
svn log -r HEAD            # 查看最新版本的日志
svn diff -r 3:5 file.txt   # 查看第 3 版到第 5 版的差异
```

### 2.3 标准仓库布局

SVN 社区约定俗成的仓库目录结构（强烈推荐遵循）：

```
项目仓库根目录
├── trunk/          主干：日常开发的主线（相当于 Git 的 main）
│
├── branches/       分支目录：存放各个开发分支
│   ├── feature-v2/
│   └── hotfix-login/
│
└── tags/           标签目录：存放各个发布版本的快照
    ├── v1.0.0/
    └── v1.1.0/
```

| 目录 | 作用 | Git 中对应 |
|------|------|-----------|
| `trunk/` | 主开发线 | `main` / `master` 分支 |
| `branches/` | 存放所有分支 | 各个 branch |
| `tags/` | 存放版本标签 | 各个 tag |

> 💡 **提示：** 这种布局不是 SVN 强制的，但是**社区最佳实践**。`trunk`、`branches`、`tags` 也只是普通目录，SVN 靠 `svn copy` 命令来"创建分支/标签"。

---

## 三、安装与初次配置

### 3.1 安装 SVN 客户端

```bash
# macOS（系统自带，或用 Homebrew 安装新版）
svn --version                  # 查看是否已安装
brew install subversion        # 安装/更新

# Ubuntu / Debian
sudo apt-get install subversion

# CentOS / RHEL
sudo yum install subversion

# Windows
# 推荐 TortoiseSVN（图形化）：https://tortoisesvn.net/
# 或下载命令行版：https://subversion.apache.org/packages.html

# 验证安装
svn --version                  # 输出类似：svn, version 1.14.0
```

### 3.2 常见 URL 协议

SVN 通过不同协议访问仓库：

| 协议 | 示例 | 说明 |
|------|------|------|
| `svn://` | `svn://server/repo` | SVN 原生协议，需要 svnserve 服务 |
| `svn+ssh://` | `svn+ssh://server/repo` | 通过 SSH 隧道的 SVN 协议，更安全 |
| `http://` / `https://` | `https://server/svn/repo` | 基于 WebDAV，可浏览器访问 |
| `file://` | `file:///path/to/repo` | 访问本地仓库（本机服务器） |

### 3.3 配置（可选）

SVN 的全局配置文件位于：
- Linux/macOS：`~/.subversion/config`
- Windows：`%APPDATA%\Subversion\config`

```ini
# 设置全局忽略的文件（类似 .gitignore 的全局版）
global-ignores = *.o *.lo *.la *.al .libs *.so *.so.[0-9]* *.a *.pyc *.pyo
                 *.rej *~ #*# .#* .DS_Store [Tt]humbs.db node_modules

# 让 SVN 存储密码（明文/加密，视环境而定）
store-passwords = yes

# 设置默认的文本编辑器
editor-cmd = vim
```

---

## 四、基本工作流程

> 这是日常使用 SVN **最核心的循环**，对比 Git，SVN 的流程更简单。

### 4.1 完整工作流图示

```
┌──────────────────────────────────────────────────────────────┐
│                     SVN 日常开发循环                          │
│                                                              │
│   1. svn checkout     第一次：从服务器检出完整工作副本         │
│        ▼                                                     │
│   ┌─── 循环开始 ───────────────────────────────────────┐    │
│   │                                                     │    │
│   │   2. svn update       同步服务器最新代码             │    │
│   │        ▼                                             │    │
│   │   3. 修改文件          在工作副本里编写/修改          │    │
│   │        ▼                                             │    │
│   │   4. svn status       查看改了哪些文件                │    │
│   │        ▼                                             │    │
│   │   5. svn add          新文件要先 add（加入版本控制）   │    │
│   │        ▼                                             │    │
│   │   6. svn commit       提交到中央服务器                │    │
│   │        ▼                                             │    │
│   └─────── 循环 ─────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘

⚠️ 关键区别（对比 Git）：
- SVN 没有"暂存区"，add 只是让新文件纳入版本控制
- SVN 的 commit 直接提交到服务器，不需要先 commit 再 push
- SVN 必须先 update 再 commit，否则容易冲突
```

### 4.2 检出工作副本（checkout）

```bash
# 第一次从服务器下载整个项目到本地（生成工作副本）
svn checkout https://server/svn/project/trunk
# 简写：svn co

# 检出到指定目录
svn co https://server/svn/project/trunk my-project

# 检出指定版本
svn co -r 10 https://server/svn/project/trunk

# 只检出某个子目录（节省空间）
svn co https://server/svn/project/trunk/src my-src

# 输出示例：
# A    trunk/index.html        （A = 新增到工作副本）
# A    trunk/css
# A    trunk/css/style.css
# Checked out revision 15.      ← 当前工作副本基于 r15
```

### 4.3 查看状态（status）

```bash
# 查看工作副本的状态（最常用）
svn status
# 简写：svn st

# 输出示例：
# ?      new-file.txt          （? = 未纳入版本控制）
# A      added.js              （A = 已 svn add，待提交）
# M      index.html            （M = 已修改）
# D      old-file.js           （D = 已 svn delete，待提交）
# C      config.json           （C = 冲突，需手动解决）
# !      missing.txt           （! = 文件丢失/被误删）
```

#### 状态标记速查

| 标记 | 含义 | 说明 |
|------|------|------|
| `?` | 未跟踪 | 文件不在版本控制下 |
| `A` | 已添加 | `svn add` 过，等待提交 |
| `M` | 已修改 | 文件内容有改动，未提交 |
| `D` | 已删除 | `svn delete` 过，等待提交 |
| `C` | 冲突 | update 时发生冲突，需解决 |
| `!` | 丢失 | 文件被误删，不在版本控制预期位置 |
| `R` | 已替换 | 文件被替换（如文件变目录） |
| `X` | 外部引用 | 由 svn:externals 引入 |

> 💡 **提示：** 第一列表示"文件本身"的状态，第二列表示"属性"的状态。大多时候只看第一列。

### 4.4 更新（update）

```bash
# 从服务器拉取最新改动，合并到工作副本（必须联网）
svn update
# 简写：svn up

# 更新指定文件
svn update index.html

# 更新到指定版本
svn update -r 10

# 输出示例：
# U    index.html        （U = Updated，服务器更新合并进来了）
# A    new.js            （A = 新文件从服务器下载）
# D    old.js            （D = 文件在服务器被删除，本地也删了）
# G    config.json       （G = merGed，服务器改动与本地无冲突地合并了）
# C    style.css         （C = Conflict，发生冲突！需手动解决）
# Updated to revision 18.
```

### 4.5 添加与提交

```bash
# 新建的文件，SVN 默认不会跟踪（这是和 Git 的共同点）
# 需要先 add，让它纳入版本控制
svn add new-file.js          # 添加单个文件
svn add new-dir              # 添加目录（会递归添加里面所有文件）

# 只添加目录本身，不含内容
svn add --non-recursive new-dir

# 提交到中央服务器
svn commit -m "feat: 添加用户登录功能"
# 简写：svn ci

# 只提交指定文件
svn commit index.html -m "fix: 修复首页样式"

# 提交前自动先 update（好习惯，避免冲突）
svn update && svn commit -m "feat: 完成功能开发"
```

> ⚠️ **注意：** SVN 提交是**直接到达服务器**的。如果网络断了，提交会失败。提交前**务必先 `svn update`**，否则可能因版本过旧而被服务器拒绝。

### 4.6 查看日志与差异

```bash
# 查看提交历史
svn log
# 输出：
# ------------------------------------------------------------------------
# r18 | zhangsan | 2026-06-01 14:30:00 +0800 (周一) | 1 行
# feat: 添加用户登录功能
# ------------------------------------------------------------------------
# r17 | lisi | 2026-06-01 10:00:00 +0800 (周一) | 1 行
# fix: 修复购物车 bug

# 只看最近 5 条
svn log -l 5

# 查看某次提交改了什么（带差异）
svn log -r 18 -v          # -v 显示涉及的文件
svn log -r 18 --diff      # 显示具体差异

# 查看某个文件的修改历史
svn log index.html

# 查看工作副本相对服务器的差异（还没提交的改动）
svn diff
# 简写：svn di

# 查看指定文件的差异
svn diff index.html

# 查看两个版本之间的差异
svn diff -r 15:18 index.html

# 查看某文件每行是谁、在哪个版本修改的（追责神器）
svn blame index.html
# 别名：svn praise / svn annotate / svn ann
```

---

## 五、撤销操作

### 5.1 SVN 撤销的全景图

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   工作副本改动          已提交到服务器                         │
│                                                              │
│   svn revert           svn merge -c -N + commit              │
│      ▲                     │                                 │
│      │                     ▼                                 │
│   丢弃本地未提交改动     用"逆向合并"撤销某次提交              │
│                                                              │
│   ⚠️ svn 没有"取消上次提交"的命令                             │
│      已提交的内容只能用 merge 逆向覆盖，再提交一次             │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 撤销工作副本的修改（revert）

```bash
# 场景：改乱了文件，想丢弃改动，恢复到工作副本的基础版本
svn revert index.html

# 递归撤销整个目录
svn revert --recursive .         # 撤销当前目录所有未提交改动

# ⚠️ revert 只能撤销"未提交"的本地改动，已提交的动不了！
```

### 5.3 撤销已提交的内容（逆向合并）

SVN **没有**像 Git `reset` 那样"抹掉历史"的命令。撤销已提交内容的方法是**做一个逆向修改再提交**：

```bash
# 场景：r18 是一次错误的提交，想撤销它
# 方法：把 r18 引起的改动"反着"合并回来

# 语法：svn merge -r 撤销的目标版本:它的前一版本 文件
svn merge -r 18:17 index.html     # 撤销 r18 对 index.html 的改动
svn commit -m "revert: 撤销 r18 的错误修改"

# 或者用 -c（change）的负数形式，更直观
svn merge -c -18 .                # 撤销 r18 的改动（注意 -18 前面的负号）
svn commit -m "revert: 撤销 r18"
```

```
撤销原理：

r17: 原始内容                撤销操作（merge -r 18:17）
  │                              │
  ▼                              ▼
r18: 加了错误代码    ──────►    r19: 错误代码被移除

历史保留：r18 依然存在，只是 r19 把它的改动抵消了
（类似 Git 的 revert，SVN 不能像 Git reset 那样抹掉历史）
```

> ⚠️ **注意：** SVN 的历史是**不可篡改**的。已经提交的内容永远在服务器上，只能用新提交去抵消，无法真正删除。这一点和 Git 不同。

### 5.4 恢复误删的文件

```bash
# 场景：不小心删了版本控制下的文件
svn revert deleted-file.js        # 如果还没 commit，直接 revert 找回

# 如果已经 commit 了删除，需要从历史版本恢复
svn copy https://server/svn/repo/trunk/deleted-file.js@17 deleted-file.js
svn commit -m "restore: 恢复误删的 deleted-file.js"
```

---

## 六、分支与标签

### 6.1 SVN 的"分支"本质

SVN 的分支和 Git 的分支**完全不是一回事**：

```
Git 的分支：一个轻量指针，几乎不占空间，瞬间创建
SVN 的分支：仓库里的一个普通目录（用 svn copy 创建）

SVN 创建分支 = 在 branches/ 目录下复制一份 trunk/
```

> 💡 **提示：** SVN 的 `svn copy` 是"廉价复制"（cheap copy）——服务器内部不会真的复制所有文件，只记录"这个新目录是从哪复制来的"，所以创建分支很快、不占空间。但概念上，分支就是一个目录。

### 6.2 创建分支

```bash
# 假设仓库布局：
# https://server/svn/project/
#   ├── trunk/
#   ├── branches/
#   └── tags/

# 创建分支：把 trunk 复制到 branches/ 下
svn copy https://server/svn/project/trunk \
         https://server/svn/project/branches/feature-v2 \
         -m "创建 feature-v2 分支"
# 简写：svn cp

# 也可以在本地工作副本里操作（记得最后 commit）
svn copy trunk branches/feature-v2
svn commit -m "创建 feature-v2 分支"
```

### 6.3 创建标签（tag）

标签和分支**用的是完全一样的命令**（都是 `svn copy`），只是放到 `tags/` 目录，表示"这是一个不再修改的快照"：

```bash
# 创建发布标签
svn copy https://server/svn/project/trunk \
         https://server/svn/project/tags/v1.0.0 \
         -m "发布 v1.0.0 版本"
```

> ⚠️ **注意：** SVN 的 tag **只是约定**，服务器不会阻止你修改 tag 目录。团队要自觉遵守"tag 创建后不再修改"的约定（必要时用服务器钩子 hook 强制）。

### 6.4 切换分支（switch）

在 SVN 中"切换分支"用 `svn switch`：

```bash
# 把当前工作副本切换到另一个分支（目录）
svn switch https://server/svn/project/branches/feature-v2
# 简写：svn sw

# 切回主干
svn switch https://server/svn/project/trunk

# 查看当前工作副本对应的仓库地址
svn info | grep URL
```

> 💡 **提示：** `svn switch` 会保留你未提交的本地改动（如果它们在新分支也适用）。这和直接重新 checkout 一个新目录不同。

### 6.5 合并分支（merge）

把分支的改动合并回主干：

```bash
# 场景：feature-v2 开发完了，要合并回 trunk

# 1. 先切换到目标（trunk）并更新
svn switch https://server/svn/project/trunk
svn update

# 2. 合并 feature-v2 分支的所有改动
svn merge https://server/svn/project/branches/feature-v2

# 3. 解决冲突（如果有）后提交
svn commit -m "merge: 合并 feature-v2 分支到主干"
```

#### 合并的几种形式

```bash
# 合并某个分支的全部改动（最常用）
svn merge https://server/svn/project/branches/feature-v2

# 合并指定版本范围的改动（如 r10 到 r15）
svn merge -r 10:15 https://server/svn/project/branches/feature-v2

# 合并指定的某一次改动（如只合并 r12）
svn merge -c 12 https://server/svn/project/branches/feature-v2

# 逆向合并（撤销）指定版本
svn merge -c -12 https://server/svn/project/branches/feature-v2

# 预演合并（不真的改文件，只看会改什么）—— 用 --dry-run
svn merge --dry-run https://server/svn/project/branches/feature-v2
```

> ⚠️ **注意：** SVN 1.5+ 支持**合并跟踪**（merge tracking），服务器会记录"哪些改动已经合并过"，避免重复合并。合并前务必先 `svn update` 拿到最新版本。

---

## 七、解决冲突

### 7.1 冲突是怎么产生的

```
你和同事都基于 r20 修改了同一个文件：
- 你改了 config.json，提交后变成 r21
- 同事也改了 config.json 的同一处，提交时……

svn commit config.json
# svn: E155011: Commit failed (details follow):
# File 'config.json' is out of date
# → 服务器拒绝，因为你的副本太旧了

于是同事先 svn update，结果同一处都被改了 → 冲突（C）
```

### 7.2 冲突时的文件

`svn update` 出现 `C`（冲突）时，SVN 会生成三个辅助文件：

```
config.json            ← 包含冲突标记的主文件（你要编辑它）
config.json.mine       ← 你本地的版本
config.json.r20        ← 你修改前的基础版本（BASE）
config.json.r21        ← 服务器上的最新版本
```

主文件里的冲突标记：

```
<<<<<<< .mine
这是你本地的内容
=======
这是服务器上的内容
>>>>>>> .r21
```

### 7.3 解决冲突的步骤

```bash
# 1. 手动编辑 config.json，保留正确的内容，删掉 <<<<<<< ======= >>>>>>> 标记

# 2. 标记冲突已解决（旧版 SVN 用 resolved，1.6+ 之后推荐用 resolve）
svn resolve --accept working config.json
# 或老命令：
svn resolved config.json     # ⚠️ 只删除辅助文件，不检查内容

# --accept 选项（推荐）：
svn resolve --accept mine-full config.json    # 用你的版本
svn resolve --accept theirs-full config.json  # 用服务器的版本
svn resolve --accept working config.json      # 用你手动编辑后的版本（最常用）

# 3. 提交
svn commit -m "fix: 解决 config.json 合并冲突"
```

> 💡 **提示：** TortoiseSVN（Windows 图形客户端）有可视化的冲突解决界面，比命令行直观得多。

---

## 八、忽略文件（svn:ignore）

### 8.1 SVN 的忽略机制

SVN **没有**像 Git 那样的 `.gitignore` 文件。它的忽略是通过**目录属性** `svn:ignore` 实现的。

```bash
# 让当前目录忽略 node_modules 目录
svn propset svn:ignore "node_modules" .
svn commit -m "chore: 忽略 node_modules"

# 忽略多个文件/目录（用换行分隔）
svn propset svn:ignore "node_modules
dist
*.log
.env" .
svn commit -m "chore: 配置忽略规则"

# 查看当前目录的忽略规则
svn propget svn:ignore .

# 编辑忽略规则（用编辑器，推荐）
svn propedit svn:ignore .
```

### 8.2 全局忽略

如果某些文件类型在所有项目都要忽略，配置全局忽略更方便：

```ini
# ~/.subversion/config
[miscellany]
global-ignores = *.o *.lo *.pyc .DS_Store node_modules dist *.log
```

### 8.3 SVN 1.8+ 的全局忽略属性

```bash
# svn:global-ignores 会作用于该目录及所有子目录（类似 .gitignore 的递归）
svn propset svn:global-ignores "node_modules
dist
*.log" .
```

### 8.4 忽略机制对比

| 特性 | Git (.gitignore) | SVN (svn:ignore) |
|------|------------------|-------------------|
| 配置方式 | 一个文本文件 | 目录属性 |
| 作用范围 | 当前目录及子目录 | 仅当前目录（1.8+ 用 global-ignores 可递归） |
| 易用性 | 简单直观 | 略繁琐，需要 propset |
| 已跟踪文件 | 无法忽略 | 同样无法忽略 |

> ⚠️ **注意：** 和 Git 一样，已经被 SVN 跟踪的文件，再加忽略规则是无效的。需要先 `svn delete --keep-local 文件` 取消跟踪。

---

## 九、高级用法

### 9.1 导出干净代码（export）

```bash
# 场景：要发布上线，但不想要 .svn 隐藏目录
# export 会下载一份"干净"的代码，不带任何版本控制信息

svn export https://server/svn/project/trunk release-v1.0
# 导出的 release-v1.0 目录里没有 .svn，不能 commit/update

# 从工作副本导出（去除 .svn 目录）
svn export my-working-copy clean-output
```

#### export 与 checkout 的区别

| 命令 | 是否含 .svn | 能否 update/commit | 用途 |
|------|-------------|---------------------|------|
| `svn checkout` | ✅ 有 | ✅ 能 | 日常开发 |
| `svn export` | ❌ 没有 | ❌ 不能 | 部署上线、交付代码 |

### 9.2 文件锁定（lock）

对于二进制文件（图片、文档），无法合并，SVN 提供"加锁"机制防止冲突：

```bash
# 锁定文件（其他人就不能提交对它的修改）
svn lock logo.png -m "正在修改 logo"

# 解锁
svn unlock logo.png

# 配合 svn:needs-lock 属性，强制必须先锁才能改
svn propset svn:needs-lock "*" logo.png
svn commit -m "强制 logo.png 需要先锁定"
```

> 💡 **提示：** Git 没有（也不需要）原生锁机制，因为 Git 鼓励合并。SVN 对二进制文件加锁是它的一个特色优势。

### 9.3 外部引用（svn:externals）

把其他仓库/目录"嵌"进当前工作副本（类似 Git submodule）：

```bash
# 在当前目录引入外部项目
svn propset svn:externals "shared-lib https://server/svn/shared-lib/trunk" .
svn commit -m "引入外部共享库"
svn update       # update 后会拉取 shared-lib

# 支持指定版本
svn propset svn:externals "^/shared-lib/trunk@15 shared-lib" .
```

### 9.4 属性操作（properties）

SVN 给文件/目录附加的"元数据"：

```bash
# 设置属性
svn propset svn:eol-style native index.html      # 统一换行符
svn propset svn:mime-type "text/plain" readme.txt
svn propset svn:executable "*" deploy.sh          # 标记为可执行

# 查看属性
svn proplist index.html        # 列出所有属性
svn propget svn:eol-style index.html   # 查看某属性的值

# 删除属性
svn propdel svn:executable deploy.sh
```

常用内置属性：

| 属性 | 作用 |
|------|------|
| `svn:ignore` | 目录的忽略规则 |
| `svn:global-ignores` | 递归忽略规则（1.8+） |
| `svn:eol-style` | 统一换行符（解决跨平台 CRLF/LF 问题） |
| `svn:executable` | 标记可执行权限 |
| `svn:mime-type` | 文件 MIME 类型 |
| `svn:needs-lock` | 强制修改前先加锁 |
| `svn:externals` | 外部引用 |
| `svn:keywords` | 关键字替换（如 $Id$、$Date$） |

### 9.5 关键字替换

让 SVN 在文件里自动填入版本信息：

```bash
# 开启关键字替换
svn propset svn:keywords "Id Date Author Revision" source.js
svn commit -m "开启关键字替换"
```

在 `source.js` 里写上：

```js
// SVN 会自动把下面的占位符替换成实际信息
// $Id$      → $Id: source.js 18 2026-06-01 14:30:00Z zhangsan $
// $Date$    → $Date: 2026-06-01 14:30:00 +0800 (周一) $
// $Author$  → $Author: zhangsan $
// $Rev$     → $Rev: 18 $
```

### 9.6 清理（cleanup）

```bash
# 场景：update/commit 中途断了，工作副本被锁住（出现 .svn/lock）
svn cleanup            # 清理未完成的操作，解除锁定
```

### 9.7 不检出完整仓库（稀疏检出）

大仓库只想取部分目录：

```bash
# 只检出顶层目录结构，不含子目录内容
svn co --depth immediates https://server/svn/project proj
cd proj

# 逐步把需要的子目录"拉满"
svn update --set-depth infinity trunk      # 完整拉取 trunk
svn update --set-depth empty branches      # branches 只要目录名
```

---

## 十、常见场景实战

### 10.1 场景：从零开始一个 SVN 项目

```bash
# 1. 在服务器创建仓库（通常由管理员做，或本地测试用）
svnadmin create /path/to/repo

# 2. 创建标准目录结构（trunk/branches/tags）
svn mkdir -m "初始化仓库结构" \
  file:///path/to/repo/trunk \
  file:///path/to/repo/branches \
  file:///path/to/repo/tags

# 3. 导入项目代码到 trunk
svn import my-local-project file:///path/to/repo/trunk \
  -m "init: 导入项目初始代码"

# 4. 检出工作副本开始开发
svn co file:///path/to/repo/trunk my-project
cd my-project
```

### 10.2 场景：日常开发的标准流程

```bash
# 每天开工第一件事：更新到最新版本
svn update

# ... 编写代码 ...

# 查看改了什么
svn status
svn diff

# 新文件要 add
svn add new-feature.js

# 提交前再次 update（避免冲突）
svn update

# 提交
svn commit -m "feat: 完成新功能开发"
```

### 10.3 场景：开发一个独立功能（用分支）

```bash
# 1. 从 trunk 创建功能分支
svn copy https://server/svn/project/trunk \
         https://server/svn/project/branches/feature-payment \
         -m "创建支付功能分支"

# 2. 切换到功能分支开发
svn switch https://server/svn/project/branches/feature-payment
# ... 开发并多次 commit ...

# 3. 开发完成，切回 trunk 合并
svn switch https://server/svn/project/trunk
svn update
svn merge https://server/svn/project/branches/feature-payment
# 解决冲突...
svn commit -m "merge: 合并支付功能"

# 4. 删除已合并的分支
svn delete https://server/svn/project/branches/feature-payment \
  -m "删除已合并的支付分支"
```

### 10.4 场景：发布版本（打标签）

```bash
# 给当前 trunk 状态打一个标签
svn copy https://server/svn/project/trunk@HEAD \
         https://server/svn/project/tags/v2.0.0 \
         -m "发布 v2.0.0 正式版"

# 之后可以从这个 tag 检出当时的代码
svn co https://server/svn/project/tags/v2.0.0 v2.0.0-release
```

### 10.5 场景：找回某次提交前的代码

```bash
# 想看 r15 之前的某个文件长什么样
svn cat -r 14 index.html            # 直接输出 r14 的文件内容

# 把 r14 的文件内容保存出来
svn cat -r 14 index.html > index-r14.html

# 或者检出整个旧版本
svn co -r 14 https://server/svn/project/trunk old-version
```

---

## 十一、SVN 命令速查表

```
┌────────────────┬──────────────────────────────────────────────────┐
│  命令          │  作用                                            │
├────────────────┼──────────────────────────────────────────────────┤
│  svn co/up     │  checkout 检出 / update 更新                     │
├────────────────┼──────────────────────────────────────────────────┤
│  svn st/di     │  status 状态 / diff 差异                          │
├────────────────┼──────────────────────────────────────────────────┤
│  svn add       │  添加新文件到版本控制                            │
├────────────────┼──────────────────────────────────────────────────┤
│  svn ci        │  commit 提交到服务器                             │
├────────────────┼──────────────────────────────────────────────────┤
│  svn log       │  查看提交历史                                    │
├────────────────┼──────────────────────────────────────────────────┤
│  svn revert    │  撤销未提交的本地改动                            │
├────────────────┼──────────────────────────────────────────────────┤
│  svn cp/mv/rm  │  copy 分支标签 / move 重命名 / delete 删除       │
├────────────────┼──────────────────────────────────────────────────┤
│  svn sw        │  switch 切换分支                                 │
├────────────────┼──────────────────────────────────────────────────┤
│  svn merge     │  合并分支 / 逆向撤销                             │
├────────────────┼──────────────────────────────────────────────────┤
│  svn resolve   │  标记冲突已解决                                  │
├────────────────┼──────────────────────────────────────────────────┤
│  svn export    │  导出不含 .svn 的干净代码                        │
├────────────────┼──────────────────────────────────────────────────┤
│  svn lock      │  锁定文件（防二进制冲突）                        │
├────────────────┼──────────────────────────────────────────────────┤
│  svn blame     │  查看每行的最后修改者                            │
├────────────────┼──────────────────────────────────────────────────┤
│  svn cleanup   │  清理被锁住的工作副本                            │
├────────────────┼──────────────────────────────────────────────────┤
│  svn info/cat  │  info 查看信息 / cat 查看文件内容                │
└────────────────┴──────────────────────────────────────────────────┘
```

---

## 十二、SVN 与 Git 深度对比

### 12.1 核心机制对比

| 维度 | SVN | Git |
|------|-----|-----|
| **架构** | 集中式（唯一中央服务器） | 分布式（每份克隆都是完整仓库） |
| **版本号** | 全局整数（r1, r2, r3...） | SHA-1 哈希值 |
| **离线提交** | ❌ 不行，必须联网 | ✅ 可以，本地提交 |
| **暂存区** | ❌ 没有（add 只纳入跟踪） | ✅ 有，精确控制提交内容 |
| **分支** | 目录（branches/） | 轻量指针 |
| **存储模型** | 基于差异（delta） | 基于快照 |
| **权限控制** | ✅ 目录/文件级别 | ❌ 通常整个仓库一个权限 |
| **二进制文件** | ✅ 支持 lock，友好 | ⚠️ 不支持锁，大文件吃力 |
| **历史修改** | ❌ 不可篡改 | ✅ 可 rebase/reset 改写（本地） |

### 12.2 命令对照表

| 操作 | SVN | Git |
|------|-----|-----|
| 检出/克隆 | `svn checkout` | `git clone` |
| 获取更新 | `svn update` | `git pull` / `git fetch` |
| 查看状态 | `svn status` | `git status` |
| 查看差异 | `svn diff` | `git diff` |
| 添加文件 | `svn add` | `git add` |
| 提交 | `svn commit` | `git commit` + `git push` |
| 查看日志 | `svn log` | `git log` |
| 撤销修改 | `svn revert` | `git restore` / `git checkout` |
| 创建分支 | `svn copy` | `git branch` |
| 切换分支 | `svn switch` | `git checkout` / `git switch` |
| 合并 | `svn merge` | `git merge` |
| 撤销提交 | `svn merge -c -N` | `git revert` |
| 暂存改动 | ❌ 无 | `git stash` |
| 标签 | `svn copy`（到 tags/） | `git tag` |

### 12.3 如何选择

```
┌─────────────────────────────────────────────────────────────┐
│  ✅ 选 SVN 的场景                                            │
├─────────────────────────────────────────────────────────────┤
│  · 企业需要严格的目录级权限控制                              │
│  · 大量二进制文件（设计稿、视频、文档）                      │
│  · 代码保密要求高，必须集中存储                              │
│  · 维护老旧存量项目                                          │
│  · 团队习惯集中式，不愿改变                                  │
├─────────────────────────────────────────────────────────────┤
│  ✅ 选 Git 的场景                                            │
├─────────────────────────────────────────────────────────────┤
│  · 开源项目、多人协作                                       │
│  · 需要频繁分支、离线工作                                    │
│  · 现代前端/全栈开发（默认选择）                             │
│  · 想要丰富的生态（GitHub、GitLab）                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 十三、常见问题与注意事项

### 13.1 高频踩坑点

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| **提交被拒绝（out of date）** | 工作副本太旧 | 先 `svn update` 再 commit |
| **`.svn` 目录被误删** | 工作副本损坏 | 重新 `svn checkout` |
| **冲突标记没删就提交** | 忘记解决冲突 | 提交前 `svn status` 检查 `C` |
| **新文件没 add 就提交** | SVN 不自动跟踪 | `svn add` 后再 commit |
| **中文文件名乱码** | locale 设置问题 | 设置 `LANG=zh_CN.UTF-8` |
| **提交卡住不动** | 工作副本被锁 | `svn cleanup` |
| **大仓库检出太慢** | 全量下载 | 用稀疏检出 `--depth` |

### 13.2 最佳实践

```bash
# ✅ 提交前一定先 update
svn update && svn commit -m "..."

# ✅ 提交信息写清楚（和 Git 一样遵循规范）
svn commit -m "feat(user): 添加用户登录功能"

# ✅ 小步提交，一次只做一件事
# ❌ 不要攒一大堆改动一次提交

# ✅ 删除/重命名用 SVN 命令，不要用系统命令
svn delete old.js        # ✅ 保留历史
rm old.js                # ❌ 丢失历史关联

# ✅ 遵守标准仓库布局 trunk/branches/tags
```

### 13.3 SVN 的 `.svn` 目录

```
工作副本/
├── index.html
├── .svn/             ← SVN 的"版本控制元数据"目录（隐藏）
│   ├── entries       版本库信息
│   ├── wc.db         工作副本数据库（1.7+ 用 SQLite）
│   └── pristine/     基础版本的文件缓存
└── ...

⚠️ 绝对不要手动修改或删除 .svn 目录！
   删除后工作副本会损坏，需要重新 checkout。
   （1.7 之后只有根目录有 .svn，更干净）
```

> ⚠️ **注意：** 这点和 Git 的 `.git` 目录一样，都是版本控制的"心脏"，千万别动。

---

## 十四、总结

### 14.1 核心心智模型

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   1. 三要素：工作副本 ←→ 中央仓库（服务器是唯一权威）         │
│                                                             │
│   2. 日常循环：update → 改代码 → add（新文件）→ commit       │
│                                                             │
│   3. 版本号：全局整数 r1, r2...，每次提交仓库整体 +1          │
│                                                             │
│   4. 分支/标签：本质是目录，用 svn copy 创建                 │
│                                                             │
│   5. 撤销：本地用 revert，已提交用 merge -c -N 逆向合并      │
│                                                             │
│   6. 切换分支：svn switch（不是重新 checkout）              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 14.2 与 Git 的关键差异速记

| 要点 | SVN | Git |
|------|-----|-----|
| 提交目标 | 直接提交到服务器 | 先本地提交，再 push |
| 离线工作 | 不行 | 可以 |
| 版本标识 | r1, r2 整数 | 哈希值 |
| 分支 | 目录 | 指针 |
| 暂存区 | 没有 | 有 |
| 撤销历史 | 不能抹掉，只能逆向合并 | 本地可 reset 改写 |

### 14.3 学习路径建议

```
1. 理解集中式架构       ← 工作副本 vs 中央仓库
        │
        ▼
2. 掌握日常循环         ← checkout / update / status / add / commit
        │
        ▼
3. 学会查看历史         ← log / diff / blame / cat
        │
        ▼
4. 理解分支标签         ← svn copy / switch / merge
        │
        ▼
5. 处理冲突             ← update 冲突 / resolve
        │
        ▼
6. 进阶用法             ← export / lock / externals / 属性
```

> 💡 **提示：** 如果你已经熟悉 Git，学 SVN 很快——核心就记住"**提交即推送、改前先更新、分支是目录**"这三句话，日常使用就够用了。新项目建议直接用 Git，SVN 主要用于维护存量系统和有特殊权限要求的企业场景。
