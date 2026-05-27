# macOS M2 开发环境安装指南（手动安装版）

本文档详细介绍在 Apple Silicon (M2/M1/M3) 芯片的 Mac 上**手动下载安装** Java 开发所需的核心工具，不依赖 Homebrew 等包管理器。

## 目录

- [JDK 安装](#jdk-安装)
- [Maven 安装](#maven-安装)
- [MySQL 安装](#mysql-安装)
- [Redis 安装](#redis-安装)
- [环境变量配置](#环境变量配置)

---

## JDK 安装

### 方案一：Oracle JDK（推荐用于商业项目）

#### 1. 下载 JDK

访问 [Oracle JDK 下载页面](https://www.oracle.com/java/technologies/downloads/)：

| 版本 | 下载链接 |
|------|---------|
| JDK 17 (LTS) | [macOS ARM64 PKG](https://download.oracle.com/java/17/latest/jdk-17_macos-aarch64_bin.pkg) |
| JDK 21 (LTS) | [macOS ARM64 PKG](https://download.oracle.com/java/21/latest/jdk-21_macos-aarch64_bin.pkg) |

> **注意：** 选择 **macOS Installer** 类型中的 **ARM64 架构**，适用于 M2 芯片

#### 2. 安装

双击下载的 `.pkg` 文件，按照安装向导完成安装。

#### 3. 验证安装

```bash
java -version
javac -version
```

### 方案二：Eclipse Temurin（OpenJDK 发行版，免费）

#### 1. 下载 JDK

访问 [Adoptium 官网](https://adoptium.net/) 或直接下载：

| 版本 | 下载链接 |
|------|---------|
| JDK 8 (LTS) | [macOS ARM64 pkg](https://github.com/adoptium/temurin8-binaries/releases/latest/jdk-8_macos-aarch64_bin.pkg.gz) |
| JDK 11 (LTS) | [macOS ARM64 pkg](https://github.com/adoptium/temurin11-binaries/releases/latest/jdk-11_macos-aarch64_bin.pkg.gz) |
| JDK 17 (LTS) | [macOS ARM64 pkg](https://github.com/adoptium/temurin17-binaries/releases/latest/jdk-17_macos-aarch64_bin.pkg.gz) |
| JDK 21 (LTS) | [macOS ARM64 pkg](https://github.com/adoptium/temurin21-binaries/releases/latest/jdk-21_macos-aarch64_bin.pkg.gz) |

#### 2. 安装

双击 `.pkg` 文件完成安装。

### JDK 安装位置

Oracle JDK 和 Temurin 安装后会自动放置到：
```
/Library/Java/JavaVirtualMachines/
```

例如：
- `/Library/Java/JavaVirtualMachines/jdk-17.jdk/`
- `/Library/Java/JavaVirtualMachines/temurin-17.jdk/`

### 管理多个 JDK 版本

查看已安装的所有 Java 版本：

```bash
/usr/libexec/java_home -V
```

输出示例：
```
Matching Java Virtual Machines (2):
    21, x86_64:	"Java SE 21"	/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home
    17.0.9, x86_64:	"Eclipse Temurin 17"	/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
```

临时切换 Java 版本：

```bash
# 切换到 JDK 17
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

# 切换到 JDK 21
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
```

**官方文档：** [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) | [Adoptium Temurin](https://adoptium.net/)

---

## Maven 安装

### 下载并手动安装

#### 1. 下载 Maven

访问 [Maven 官网下载页](https://maven.apache.org/download.cgi) 或使用以下命令下载：

```bash
# 创建开发工具目录（可选）
sudo mkdir -p /opt/devtools

# 下载 Maven 3.9.6（或最新版本）
cd ~/Downloads
curl -O https://dlcdn.apache.org/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.tar.gz
```

#### 2. 解压并移动

```bash
# 解压
tar -xzf apache-maven-3.9.6-bin.tar.gz

# 移动到合适位置
sudo mv apache-maven-3.9.6 /opt/devtools/maven

# 清理下载文件
rm apache-maven-3.9.6-bin.tar.gz
```

#### 3. 配置环境变量

编辑 shell 配置文件（macOS 默认使用 zsh）：

```bash
vim ~/.zshrc
```

添加以下内容：

```bash
# Maven
export M2_HOME=/opt/devtools/maven
export MAVEN_HOME=$M2_HOME
export PATH="$M2_HOME/bin:$PATH"
```

使配置生效：

```bash
source ~/.zshrc
```

#### 4. 验证安装

```bash
mvn -version
```

输出示例：
```
Apache Maven 3.9.6 (bc0240f3c744dd6b6ec2920b3cd08dcc29516158)
Maven home: /opt/devtools/maven
Java version: 17.0.9, vendor: Eclipse Adoptium
```

### 配置国内镜像源（可选）

创建 Maven 配置目录并编辑配置文件：

```bash
mkdir -p ~/.m2
vim ~/.m2/settings.xml
```

添加以下内容以使用阿里云镜像加速：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
          http://maven.apache.org/xsd/settings-1.0.0.xsd">

    <mirrors>
        <mirror>
            <id>aliyunmaven</id>
            <mirrorOf>*</mirrorOf>
            <name>阿里云公共仓库</name>
            <url>https://maven.aliyun.com/repository/public</url>
        </mirror>
    </mirrors>
</settings>
```

**官方文档：** [Apache Maven 官网](https://maven.apache.org/)

---

## MySQL 安装

### 方案一：MySQL Community Server（官方安装包）

#### 1. 下载 MySQL

访问 [MySQL 官网下载页](https://dev.mysql.com/downloads/mysql/)，选择以下选项：

- **Select Operating System:** macOS
- **Select OS Version:** macOS 14 (ARM, DMG Archive)

> **重要：** 必须选择 **macOS ARM** 版本，才能在 M2 芯片上运行

或直接下载最新版本：[macOS ARM DMG](https://dev.mysql.com/downloads/mysql/)

#### 2. 安装

1. 双击下载的 `.dmg` 文件
2. 双击 `mysql.pkg` 安装 MySQL Server
3. 双击 `MySQL.prefPane` 安装系统偏好设置面板（可选）
4. 双击 `MySQLStartupItem.pkg` 设置开机自启（可选）

安装过程中会提示设置 **root 密码**，请记住此密码。

#### 3. 启动/停止 MySQL 服务

**方式一：通过系统偏好设置**

1. 打开 `系统设置` → `MySQL`
2. 点击 `Start MySQL Server` 按钮

**方式二：通过命令行**

```bash
# 启动 MySQL
sudo /usr/local/mysql/support-files/mysql.server start

# 停止 MySQL
sudo /usr/local/mysql/support-files/mysql.server stop

# 重启 MySQL
sudo /usr/local/mysql/support-files/mysql.server restart

# 查看状态
sudo /usr/local/mysql/support-files/mysql.server status
```

#### 4. 连接 MySQL

```bash
# 首次连接（安装时设置的密码）
mysql -u root -p

# 或使用 mysql_safe 跳过密码（仅用于忘记密码时）
sudo /usr/local/mysql/bin/mysqld_safe --skip-grant-tables
```

#### 5. 修改 root 密码（如需要）

```bash
# 登录 MySQL
mysql -u root -p

# 在 MySQL 命令行中执行
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;
EXIT;
```

### MySQL 图形化管理工具

推荐以下可视化管理工具：

| 工具 | 特点 | 下载地址 |
|------|------|---------|
| **MySQL Workbench** | 官方工具，功能最全 | [官网下载](https://dev.mysql.com/downloads/workbench/) |
| **DBeaver** | 免费开源，支持多数据库 | [官网下载](https://dbeaver.io/download/) |
| **TablePlus** | macOS 热门，界面简洁 | [官网下载](https://tableplus.com/) |
| **Sequel Ace** | macOS 免费开源 | [GitHub Releases](https://github.com/Sequel-Ace/Sequel-Ace/releases) |
| **Navicat** | 商业软件，功能强大 | [官网下载](https://www.navicat.com/) |

#### MySQL Workbench 使用步骤（推荐）

**1. 下载安装**

访问 [MySQL Workbench 下载页](https://dev.mysql.com/downloads/workbench/)，选择 macOS ARM 版本下载并安装。

**2. 创建连接**

1. 打开 MySQL Workbench
2. 点击首页的 `+` 图标创建新连接
3. 填写连接信息：
   - **Connection Name**: 本地 MySQL（或任意名称）
   - **Hostname**: 127.0.0.1
   - **Port**: 3306
   - **Username**: root
   - **Password**: 点击 Store in Keychain，输入安装时设置的密码
4. 点击 `Test Connection` 测试连接
5. 成功后点击 `OK` 保存

**3. 常用操作**

| 操作 | 说明 |
|------|------|
| 查询数据 | 点击查询图标，输入 SQL，按 `⌘ + Enter` 执行 |
| 创建数据库 | 右侧 `Schemas` 右键 → Create Schema |
| 创建表 | 展开数据库 → Tables 右键 → Create Table |
| 导入数据 | Server → Data Import |
| 导出数据 | Server → Data Export |

#### DBeaver 使用步骤（免费开源）

**1. 下载安装**

访问 [DBeaver 下载页](https://dbeaver.io/download/)，下载 macOS ARM 版本的 `.dmg` 文件安装。

**2. 创建连接**

1. 打开 DBeaver
2. 点击 `数据库` → `新建数据库连接`
3. 选择 `MySQL`
4. 配置连接信息：
   - **主机**: 127.0.0.1
   - **端口**: 3306
   - **数据库**: mysql（或留空）
   - **用户名**: root
   - **密码**: 输入安装时设置的密码
5. 点击 `测试连接`
6. 成功后点击 `完成`

**3. 常用操作**

| 操作 | 快捷键/说明 |
|------|------|
| 执行 SQL | `⌘ + Enter` |
| 格式化 SQL | `⌘ + F` |
| 新建 SQL 编辑器 | `⌘ + N` |
| 浏览数据表 | 双击表名 |

#### TablePlus 使用步骤（macOS 推荐）

**1. 下载安装**

访问 [TablePlus 官网](https://tableplus.com/) 下载并安装。

**2. 创建连接**

1. 打开 TablePlus
2. 点击 `+` 创建新连接
3. 选择 `MySQL`
4. 填写连接信息：
   - **Name**: 本地 MySQL
   - **Host**: 127.0.0.1
   - **Port**: 3306
   - **User**: root
   - **Password**: 安装时设置的密码
5. 点击 `Connect` 连接

**3. 常用操作**

| 操作 | 快捷键/说明 |
|------|------|
| 执行 SQL | `⌘ + Return` |
| 新建查询窗口 | `⌘ + T` |
| 查看表数据 | 双击表名 |
| 筛选数据 | 选中表 → 点击 `Filter` 按钮 |

#### Sequel Ace 使用步骤（免费轻量）

**1. 下载安装**

访问 [Sequel Ace GitHub](https://github.com/Sequel-Ace/Sequel-Ace/releases) 下载最新版本 `.dmg` 文件安装。

**2. 创建连接**

1. 打开 Sequel Ace
2. 填写连接信息：
   - **Name**: 本地 MySQL
   - **Host**: 127.0.0.1
   - **Username**: root
   - **Password**: 安装时设置的密码
   - **Database**:（可选）
   - **Port**: 3306
3. 点击 `Connect` 连接

**3. 特色功能**

- 可视化表结构设计
- 查询结果直接编辑
- 支持导出为 CSV、SQL 等格式
- 轻量级，启动快速

### MySQL 安装位置

| 项目 | 路径 |
|------|------|
| 安装目录 | `/usr/local/mysql/` |
| 配置文件 | `/usr/local/mysql/my.cnf` 或 `/etc/my.cnf` |
| 数据目录 | `/usr/local/mysql/data/` |
| 日志文件 | `/usr/local/mysql/data/*.err` |
| 命令行工具 | `/usr/local/mysql/bin/mysql` |

**官方文档：** [MySQL 官网](https://www.mysql.com/) | [MySQL Reference Manual](https://dev.mysql.com/doc/)

---

## Redis 安装

### 方案一：手动编译安装（推荐）

Redis 没有官方的 macOS 安装包，需要手动编译。

#### 1. 安装 Xcode 命令行工具

```bash
xcode-select --install
```

#### 2. 下载并编译 Redis

```bash
# 下载 Redis（使用稳定版）
cd ~/Downloads
curl -O https://github.com/redis/redis/archive/refs/tags/7.2.4.tar.gz
tar -xzf 7.2.4.tar.gz
cd redis-7.2.4

# 编译（约需 2-3 分钟）
make

# 测试编译（可选，耗时较长）
make test

# 安装到系统目录
sudo make install
```

编译完成后，Redis 可执行文件会安装到 `/usr/local/bin/`：
- `redis-server` - Redis 服务器
- `redis-cli` - Redis 命令行客户端

#### 3. 创建配置文件

```bash
# 创建 Redis 配置目录
sudo mkdir -p /usr/local/etc/redis

# 复制默认配置
sudo cp ~/Downloads/redis-7.2.4/redis.conf /usr/local/etc/redis/redis.conf

# 编辑配置
sudo vim /usr/local/etc/redis/redis.conf
```

常用配置项：

```conf
# 绑定地址（默认只允许本机访问）
bind 127.0.0.1

# 端口
port 6379

# 设置密码（生产环境推荐）
requirepass your_password_here

# 持久化配置
save 900 1
save 300 10
save 60 10000

# 最大内存限制
maxmemory 256mb
maxmemory-policy allkeys-lru

# 后台运行
daemonize yes

# 日志文件
logfile /usr/local/var/redis/redis.log
```

#### 4. 创建数据目录

```bash
sudo mkdir -p /usr/local/var/redis
sudo chown $(whoami) /usr/local/var/redis
```

#### 5. 启动 Redis

```bash
# 前台启动（用于调试）
redis-server

# 后台启动（使用配置文件）
redis-server /usr/local/etc/redis/redis.conf

# 查看进程
ps aux | grep redis
```

#### 6. 测试连接

```bash
# 连接 Redis
redis-cli

# 测试命令
127.0.0.1:6379> ping
PONG

127.0.0.1:6379> set hello "world"
OK

127.0.0.1:6379> get hello
"world"

# 使用密码连接
redis-cli -a your_password_here
```

#### 7. 设置开机自启（可选）

创建 LaunchAgent 配置：

```bash
vim ~/Library/LaunchAgents/io.redis.redis-server.plist
```

添加以下内容：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>io.redis.redis-server</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/redis-server</string>
        <string>/usr/local/etc/redis/redis.conf</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
```

加载服务：

```bash
launchctl load ~/Library/LaunchAgents/io.redis.redis-server.plist

# 停止服务
launchctl unload ~/Library/LaunchAgents/io.redis.redis-server.plist
```

### Redis 图形化管理工具

推荐以下工具：

| 工具 | 下载地址 |
|------|---------|
| AnotherRedisDesktopManager | [GitHub Releases](https://github.com/qishibo/AnotherRedisDesktopManager/releases) |
| RedisInsight (官方) | [官网下载](https://redis.com/redis-enterprise/redis-insight/) |

下载对应的 `.dmg` 文件安装即可。

**官方文档：** [Redis 官网](https://redis.io/) | [Redis GitHub](https://github.com/redis/redis)

---

## 环境变量配置

### 统一配置环境变量

在 `~/.zshrc` 中添加所有必要的环境变量（macOS 默认使用 zsh）：

```bash
# 打开配置文件
vim ~/.zshrc
```

添加以下内容：

```bash
# ==================== Java 开发环境配置 ====================

# Java - 自动使用系统安装的 JDK
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
export PATH="$JAVA_HOME/bin:$PATH"

# Maven
export M2_HOME=/opt/devtools/maven
export MAVEN_HOME=$M2_HOME
export PATH="$M2_HOME/bin:$PATH"

# MySQL
export PATH="/usr/local/mysql/bin:$PATH"

# Redis（编译安装后已自动添加到 /usr/local/bin）
# 如果需要指定版本
# export PATH="/usr/local/bin:$PATH"
```

使配置生效：

```bash
source ~/.zshrc
```

### 验证所有环境

```bash
echo "========== 环境验证 =========="

# 检查 Java
echo -n "Java: "
java -version 2>&1 | head -n 1

# 检查 Maven
echo -n "Maven: "
mvn -version 2>&1 | head -n 1

# 检查 MySQL
echo -n "MySQL: "
mysql --version

# 检查 Redis
echo -n "Redis: "
redis-cli --version

echo "=========================="
```

预期输出：

```
========== 环境验证 ==========
Java: openjdk version "17.0.9" 2023-10-17
Maven: Apache Maven 3.9.6
MySQL: mysql Ver 8.0.35 for macos14.0 on arm64 (MySQL Community Server)
Redis: redis-cli 7.2.4
==========================
```

---

## 常用命令速查

### Java

```bash
# 查看已安装的 Java 版本
/usr/libexec/java_home -V

# 切换 Java 版本（临时）
export JAVA_HOME=$(/usr/libexec/java_home -v 17)

# 编译 Java 文件
javac MyClass.java

# 运行 Java 程序
java MyClass
```

### Maven

```bash
# 创建新项目
mvn archetype:generate -DgroupId=com.example -DartifactId=my-app

# 编译项目
mvn compile

# 运行测试
mvn test

# 打包项目
mvn package

# 清理构建
mvn clean

# 跳过测试打包
mvn package -DskipTests
```

### MySQL

```bash
# 启动/停止/重启服务
sudo /usr/local/mysql/support-files/mysql.server start
sudo /usr/local/mysql/support-files/mysql.server stop
sudo /usr/local/mysql/support-files/mysql.server restart

# 连接数据库
mysql -u root -p

# 导入 SQL 文件
mysql -u root -p database_name < backup.sql

# 导出数据库
mysqldump -u root -p database_name > backup.sql

# 查看所有数据库
mysql -u root -p -e "SHOW DATABASES;"
```

### Redis

```bash
# 启动 Redis 服务器
redis-server /usr/local/etc/redis/redis.conf

# 连接 Redis
redis-cli

# 使用密码连接
redis-cli -a your_password

# 查看所有 key
redis-cli keys '*'

# 清空当前数据库
redis-cli flushdb

# 清空所有数据库
redis-cli flushall

# 查看 Redis 信息
redis-cli info
```

---

## 常见问题

### Q1: M2 芯片兼容性问题

Apple Silicon 使用 ARM 架构，下载时务必选择 **ARM64** 或 **aarch64** 版本的软件。

如何确认下载了正确的版本：
```
# 检查当前架构
uname -m
# 输出: arm64
```

### Q2: "Bad CPU type" 错误

这表示尝试运行 x86_64 架构的软件。

解决方案：
- 重新下载 ARM 原生版本
- 或使用 Rosetta 转译（不推荐，性能较差）

安装 Rosetta 2（如需要）：
```bash
softwareupdate --install-rosetta
```

### Q3: MySQL 无法启动

检查错误日志：
```bash
tail -n 50 /usr/local/mysql/data/*.err
```

常见原因和解决：

```bash
# 权限问题
sudo chown -R mysql:mysql /usr/local/mysql/data

# 配置文件问题
sudo vim /usr/local/mysql/my.cnf

# 端口被占用
lsof -i :3306
sudo kill -9 <PID>
```

### Q4: Redis 连接拒绝

检查 Redis 是否运行：
```bash
ps aux | grep redis
# 或
redis-cli ping
```

如果未运行，重新启动：
```bash
redis-server /usr/local/etc/redis/redis.conf
```

### Q5: Java 版本切换

永久切换默认 Java 版本，修改 `~/.zshrc`：

```bash
# 将版本号改为你想要的默认版本
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
```

### Q6: 找不到命令

如果提示 `command not found`，检查：

```bash
# 确认环境变量已配置
echo $PATH

# 确认配置文件已生效
source ~/.zshrc

# 检查文件是否存在
ls /usr/local/mysql/bin/mysql
ls /usr/local/bin/redis-cli
ls /opt/devtools/maven/bin/mvn
```

### Q7: MySQL 密码忘记

重置 MySQL root 密码：

```bash
# 1. 停止 MySQL
sudo /usr/local/mysql/support-files/mysql.server stop

# 2. 以安全模式启动
sudo /usr/local/mysql/bin/mysqld_safe --skip-grant-tables &

# 3. 登录（无需密码）
mysql -u root

# 4. 在 MySQL 中重置密码
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
EXIT;

# 5. 重启 MySQL
sudo /usr/local/mysql/support-files/mysql.server restart
```

---

## 卸载指南

### 卸载 JDK

```bash
# 列出所有已安装的 JDK
/usr/libexec/java_home -V

# 删除指定版本
sudo rm -rf /Library/Java/JavaVirtualMachines/jdk-17.jdk
sudo rm -rf /Library/Java/JavaVirtualMachines/temurin-17.jdk
```

### 卸载 Maven

```bash
# 删除 Maven 目录
sudo rm -rf /opt/devtools/maven

# 删除环境变量配置
vim ~/.zshrc  # 删除 Maven 相关行
source ~/.zshrc

# 删除本地仓库（可选）
rm -rf ~/.m2
```

### 卸载 MySQL

```bash
# 停止 MySQL 服务
sudo /usr/local/mysql/support-files/mysql.server stop

# 删除 MySQL
sudo rm -rf /usr/local/mysql
sudo rm -rf /Library/StartupItems/MySQLCOM
sudo rm -rf /Library/PreferencePanes/MySQL*

# 删除系统偏好设置面板
sudo rm -rf /Library/Receipts/mysql*.pkg

# 删除配置和数据（谨慎操作）
sudo rm -rf /etc/my.cnf
sudo rm -rf /usr/local/mysql/data
```

### 卸载 Redis

```bash
# 停止 Redis 服务
redis-cli shutdown

# 删除 Redis 可执行文件
sudo rm -f /usr/local/bin/redis-*

# 删除配置和数据
sudo rm -rf /usr/local/etc/redis
sudo rm -rf /usr/local/var/redis

# 删除开机自启配置
rm ~/Library/LaunchAgents/io.redis.redis-server.plist
```

---

## 参考资源

| 工具 | 官方文档 |
|------|---------|
| Oracle JDK | [docs.oracle.com/en/java/javase](https://docs.oracle.com/en/java/javase/) |
| Adoptium Temurin | [adoptium.net/temurin/documentation](https://adoptium.net/temurin/documentation) |
| Apache Maven | [maven.apache.org/guides](https://maven.apache.org/guides/) |
| MySQL | [dev.mysql.com/doc](https://dev.mysql.com/doc/) |
| Redis | [redis.io/docs](https://redis.io/docs) |

---

## 安装检查清单

- [ ] JDK 17/21 已安装
- [ ] `java -version` 输出正常
- [ ] Maven 已安装到 `/opt/devtools/maven`
- [ ] `mvn -version` 输出正常
- [ ] MySQL 已安装并可连接
- [ ] MySQL root 密码已设置
- [ ] Redis 已编译安装
- [ ] `redis-cli ping` 返回 PONG
- [ ] 环境变量已配置到 `~/.zshrc`
- [ ] 所有工具命令可直接使用
