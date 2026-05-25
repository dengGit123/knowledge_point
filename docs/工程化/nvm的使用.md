# nvm 使用指南

---

## 一、nvm 是什么

**nvm (Node Version Manager)** 是 Node.js 版本管理工具。

### 有什么用

**解决的问题**：不同项目需要不同版本的 Node.js。

```
项目 A：需要 Node.js 16.x
项目 B：需要 Node.js 18.x
项目 C：需要 Node.js 20.x
```

没有 nvm：只能安装一个版本，切换项目需要重新安装 Node.js，非常麻烦。

使用 nvm：
- 同时安装多个 Node.js 版本
- 一行命令切换版本：`nvm use 18`
- 每个项目可以指定自己的 Node 版本（通过 .nvmrc）

**简单理解**：nvm 就像一个版本切换器，让你可以在不同 Node.js 版本之间自由切换。

---

## 二、详细安装步骤

### 2.1 macOS/Linux 安装

**步骤 1：下载安装脚本**

打开终端，执行：

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

**步骤 2：编辑 Shell 配置文件**

```bash
nano ~/.zshrc        # 如果你是 zsh（macOS 默认）
# 或
nano ~/.bash_profile # 如果你是 bash
```

**步骤 3：在文件末尾添加以下内容**

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

保存文件：按 `Ctrl + O`，然后 `Enter`，最后 `Ctrl + X` 退出。

**步骤 4：重新加载配置**

```bash
source ~/.zshrc        # zsh
# 或
source ~/.bash_profile # bash
```

**步骤 5：验证安装**

```bash
nvm --version
```

预期输出：`0.39.0`

### 2.2 Windows 安装

**步骤 1：下载安装程序**

访问：https://github.com/coreybutler/nvm-windows/releases

下载：`nvm-setup.exe`

**步骤 2：运行安装程序**

右键 `nvm-setup.exe` → 选择「以管理员身份运行」

**步骤 3：按提示完成安装**

默认安装路径：`C:\Users\你的用户名\AppData\Roaming\nvm`

**步骤 4：重新打开终端，验证**

```powershell
nvm version
```

---

## 三、详细配置说明

### 3.1 配置文件位置

配置文件取决于你使用的 Shell：

| Shell | 配置文件 | 位置 |
|-------|----------|------|
| zsh | .zshrc | `~/.zshrc` |
| bash | .bash_profile | `~/.bash_profile` |
| Windows | settings.txt | `%APPDATA%\nvm\settings.txt` |

### 3.2 基础配置

**配置项 1：NVM_DIR（nvm 安装目录）**

这是 nvm 的核心配置，指定 nvm 的安装目录。

```bash
# 在 ~/.zshrc 中添加
export NVM_DIR="$HOME/.nvm"
```

**配置项 2：加载 nvm 脚本**

```bash
# 在 ~/.zshrc 中添加（紧接 NVM_DIR 之后）
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

**配置项 3：命令补全（可选）**

```bash
# 在 ~/.zshrc 中添加
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
```

**配置项 4：国内镜像（可选，加速下载）**

```bash
# 在 ~/.zshrc 中添加
export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node/
```

### 3.3 完整配置示例

**macOS/Linux ~/.zshrc 完整配置：**

```bash
# ============================================
# nvm 配置
# ============================================
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# 国内镜像（可选）
export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node/
```

**Windows settings.txt 完整配置：**

```text
root: C:\Users\YourName\AppData\Roaming\nvm
arch: 64
proxy: none
```

### 3.4 配置生效

每次修改配置文件后，执行：

```bash
source ~/.zshrc        # zsh
# 或
source ~/.bash_profile # bash
```

---

## 四、指定 Node 安装目录

### 4.1 默认安装目录

不配置时，Node.js 默认安装位置：

```
$NVM_DIR/versions/node/
├── v16.20.0/
├── v18.19.0/
└── v20.0.0/
```

查看当前 NVM_DIR：

```bash
echo $NVM_DIR
# 输出：/Users/你的用户名/.nvm
```

### 4.2 自定义 Node 安装目录

**步骤 1：创建自定义目录**

```bash
sudo mkdir -p /opt/nvm
```

**步骤 2：设置目录权限**

```bash
sudo chown -R $USER:$USER /opt/nvm
```

**步骤 3：修改 NVM_DIR**

编辑配置文件：

```bash
nano ~/.zshrc
```

将原来的 `export NVM_DIR="$HOME/.nvm"` 改为：

```bash
export NVM_DIR="/opt/nvm"
```

**步骤 4：重新加载配置**

```bash
source ~/.zshrc
```

**步骤 5：验证**

```bash
echo $NVM_DIR
# 预期输出：/opt/nvm
```

**步骤 6：安装 Node.js**

```bash
nvm install 18
```

**步骤 7：验证安装位置**

```bash
which node
# 输出：/opt/nvm/versions/node/v18.x.x/bin/node

ls /opt/nvm/versions/node/
# 输出：v18.19.0/
```

### 4.3 Node 目录结构

```
$NVM_DIR/versions/node/v18.19.0/
├── bin/                    # 可执行文件
│   ├── node               # node 命令
│   ├── npm                # npm 命令
│   └── npx                # npx 命令
├── include/               # C/C++ 头文件
├── lib/                   # 库文件
│   └── node_modules/      # 全局安装的 npm 包
└── share/                 # 文档等
```

---

## 五、设置全局安装路径和缓存路径

### 5.1 默认全局安装路径

不配置时，全局包安装位置：

```bash
npm root -g
# 输出：$NVM_DIR/versions/node/v18.19.0/lib/node_modules

npm bin -g
# 输出：$NVM_DIR/versions/node/v18.19.0/bin
```

**注意**：每个 Node 版本有独立的全局包目录，互不干扰。

### 5.2 自定义全局安装路径

**步骤 1：创建全局包目录**

```bash
mkdir -p ~/.npm-global/lib
mkdir -p ~/.npm-global/bin
```

**步骤 2：配置 npm prefix**

```bash
npm config set prefix "$HOME/.npm-global"
```

**步骤 3：添加到 PATH**

编辑配置文件：

```bash
nano ~/.zshrc
```

在 nvm 配置之后添加：

```bash
export PATH="$HOME/.npm-global/bin:$PATH"
```

**步骤 4：重新加载配置**

```bash
source ~/.zshrc
```

**步骤 5：验证**

```bash
npm config get prefix
# 预期输出：/Users/你的用户名/.npm-global

npm root -g
# 输出：/Users/你的用户名/.npm-global/lib/node_modules

npm bin -g
# 输出：/Users/你的用户名/.npm-global/bin
```

**步骤 6：测试安装全局包**

```bash
npm install -g pnpm

which pnpm
# 输出：/Users/你的用户名/.npm-global/bin/pnpm
```

### 5.3 设置缓存路径

**步骤 1：创建缓存目录**

```bash
mkdir -p ~/.npm-cache
```

**步骤 2：配置 npm cache**

```bash
npm config set cache "$HOME/.npm-cache"
```

**步骤 3：验证**

```bash
npm config get cache
# 预期输出：/Users/你的用户名/.npm-cache
```

### 5.4 查看所有 npm 配置

```bash
npm config list
```

输出示例：

```
; "user" config from ~/.npmrc

prefix = "/Users/你的用户名/.npm-global"
cache = "/Users/你的用户名/.npm-cache"
registry = "https://registry.npmjs.org/"
```

---

## 六、配置作用范围说明

### 6.1 各配置的作用对象

| 配置 | 作用对象 | 配置文件 | 说明 |
|------|----------|----------|------|
| `NVM_DIR` | nvm | ~/.zshrc | nvm 的安装目录 |
| `NVM_NODEJS_ORG_MIRROR` | nvm | ~/.zshrc | nvm 下载 Node.js 的镜像 |
| `npm config set prefix` | npm | ~/.npmrc | npm 全局包安装路径 |
| `npm config set cache` | npm | ~/.npmrc | npm 缓存路径 |
| `npm config set registry` | npm | ~/.npmrc | npm 包下载镜像 |

### 6.2 配置文件优先级

npm 配置优先级（从高到低）：

```
1. 项目级 .npmrc          （项目根目录）
2. 用户级 ~/.npmrc         （用户主目录）
3. 全局级 $PREFIX/etc/npmrc（nvm 管理的 Node 目录）
4. npm 内置默认配置
```

### 6.3 清晰划分

```
┌─────────────────────────────────────────────────────┐
│                     配置划分                        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  nvm 配置 → ~/.zshrc                                │
│  ├─ NVM_DIR              # nvm 目录                 │
│  ├─ 加载 nvm.sh          # 加载 nvm                 │
│  └─ NVM_NODEJS_ORG_MIRROR # Node.js 下载镜像        │
│                                                     │
│  npm 配置 → ~/.npmrc                               │
│  ├─ prefix               # 全局包路径              │
│  ├─ cache                # 缓存路径                │
│  └─ registry             # npm 镜像                 │
│                                                     │
│  项目配置 → 项目/.npmrc                            │
│  └─ 项目级配置覆盖全局配置                          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 6.4 实际配置示例

**~/.zshrc（nvm 配置）：**

```bash
# nvm 配置
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node/
```

**~/.npmrc（npm 配置）：**

```bash
# npm 全局配置
prefix=/Users/你的用户名/.npm-global
cache=/Users/你的用户名/.npm-cache
registry=https://registry.npmmirror.com
```

**项目/.npmrc（项目配置）：**

```bash
# 项目级配置（优先级最高）
registry=https://registry.npmmirror.com
save-exact=true
```

---

## 七、常用命令

### 7.1 nvm 命令

```bash
nvm install 18          # 安装 Node.js 18
nvm use 18              # 切换到 Node.js 18
nvm ls                  # 查看已安装版本
nvm ls-remote           # 查看所有可用版本
nvm alias default 18    # 设置默认版本
nvm current             # 查看当前版本
nvm dir                 # 查看 nvm 目录
```

### 7.2 npm 配置命令

```bash
npm config set prefix <路径>    # 设置全局安装路径
npm config set cache <路径>     # 设置缓存路径
npm config set registry <URL>   # 设置镜像
npm config get prefix           # 查看全局安装路径
npm config get cache            # 查看缓存路径
npm config list                 # 查看所有配置
npm config edit                 # 编辑配置文件
```

---

## 八、总结

```
┌─────────────────────────────────────────────────────┐
│                   配置汇总                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  nvm 配置文件：~/.zshrc                             │
│  ├─ NVM_DIR                    # nvm 目录          │
│  └─ NVM_NODEJS_ORG_MIRROR       # Node.js 镜像      │
│                                                     │
│  npm 配置文件：~/.npmrc                            │
│  ├─ prefix                     # 全局包路径        │
│  ├─ cache                      # 缓存路径          │
│  └─ registry                   # npm 镜像          │
│                                                     │
│  目录位置：                                          │
│  ├─ Node 版本：    $NVM_DIR/versions/node/         │
│  ├─ 全局包（默认）：$NVM_DIR/versions/node/vXX/lib/ │
│  ├─ 全局包（自定义）：~/.npm-global/lib/           │
│  └─ 缓存（自定义）： ~/.npm-cache/                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

> 官方文档：https://github.com/nvm-sh/nvm
