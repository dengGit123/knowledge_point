# macOS M2 开发环境安装指南（手动安装版）

本文档详细介绍在 Apple Silicon (M2/M1/M3) 芯片的 Mac 上**手动下载安装** Java 开发所需的核心工具，不依赖 Homebrew 等包管理器。

> **适用于：** macOS 11+ (Big Sur 及以上) | Apple Silicon (M1/M2/M3)

<br>

## 目录

- [一、JDK 安装](#一jdk-安装)
- [二、Maven 安装](#二maven-安装)
- [三、MySQL 安装](#三mysql-安装)
- [四、Redis 安装](#四redis-安装)
- [五、环境变量配置](#五环境变量配置)
- [六、常用命令速查](#六常用命令速查)
- [七、常见问题](#七常见问题)
- [八、卸载指南](#八卸载指南)
- [九、参考资源](#九参考资源)
- [十、安装检查清单](#十安装检查清单)

<br>
<br>

---

## 一、JDK 安装

<br>

### 选择安装方案

<br>

> **推荐选择：** Eclipse Temurin（免费、开源、商业友好）
>
> Oracle JDK 需要商业许可证，个人学习可以使用，但企业项目建议选择 Temurin。

<br>
<br>

---

### 方案一：Eclipse Temurin（推荐）

<br>

#### 步骤 1：下载 JDK

<br>

访问 [Adoptium 官网](https://adoptium.net/) 下载

<br>

**下载链接：**

<br>

- **JDK 21** — 最新 LTS，新项目首选
  - [macOS ARM64 pkg](https://github.com/adoptium/temurin21-binaries/releases/latest/jdk-21_macos-aarch64_bin.pkg.gz)

<br>

- **JDK 17** — 稳定 LTS，广泛使用
  - [macOS ARM64 pkg](https://github.com/adoptium/temurin17-binaries/releases/latest/jdk-17_macos-aarch64_bin.pkg.gz)

<br>

- **JDK 11** — 旧系统兼容
  - [macOS ARM64 pkg](https://github.com/adoptium/temurin11-binaries/releases/latest/jdk-11_macos-aarch64_bin.pkg.gz)

<br>

- **JDK 8** — 遗留项目
  - [macOS ARM64 pkg](https://github.com/adoptium/temurin8-binaries/releases/latest/jdk-8_macos-aarch64_bin.pkg.gz)

<br>
<br>

---

#### 步骤 2：安装

<br>

双击下载的 `.pkg` 文件

按安装向导完成安装

<br>
<br>

---

#### 步骤 3：验证安装

<br>

打开终端，执行以下命令：

<br>

```bash
java -version
javac -version
```

<br>

**成功输出示例：**

```
openjdk version "21.0.1" 2023-10-17
OpenJDK Runtime Environment Temurin-21.0.1+12 (build 21.0.1+12)
OpenJDK 64-Bit Server VM Temurin-21.0.1+12 (build 21.0.1+12, mixed mode)
```

<br>
<br>

---

### 方案二：Oracle JDK（商业项目）

<br>

#### 步骤 1：下载 JDK

<br>

访问 [Oracle JDK 下载页面](https://www.oracle.com/java/technologies/downloads/)

<br>

**下载链接：**

<br>

- **JDK 17 (LTS)**
  - [macOS ARM64 PKG](https://download.oracle.com/java/17/latest/jdk-17_macos-aarch64_bin.pkg)

<br>

- **JDK 21 (LTS)**
  - [macOS ARM64 PKG](https://download.oracle.com/java/21/latest/jdk-21_macos-aarch64_bin.pkg)

<br>

> **注意：** 需选择 **macOS Installer** → **ARM64 架构**

<br>
<br>

---

#### 步骤 2：安装

<br>

双击 `.pkg` 文件

按安装向导完成安装

<br>
<br>

---

#### 步骤 3：验证安装

<br>

```bash
java -version
javac -version
```

<br>
<br>

---

### JDK 安装位置

<br>

所有 JDK 安装后统一存放在：

<br>

```
/Library/Java/JavaVirtualMachines/
```

<br>

**示例路径：**

<br>

- `/Library/Java/JavaVirtualMachines/temurin-21.jdk/`

- `/Library/Java/JavaVirtualMachines/jdk-17.jdk/`

<br>
<br>

---

### 多版本管理

<br>

#### 查看已安装的 JDK

<br>

```bash
/usr/libexec/java_home -V
```

<br>

**输出示例：**

```
Matching Java Virtual Machines (2):
    21, arm64:	"Eclipse Temurin 21"	/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home
    17.0.9, arm64:	"Eclipse Temurin 17"	/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
```

<br>
<br>

---

#### 临时切换版本

<br>
<br>

---

##### 切换到 JDK 17

<br>

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
java -version
```

<br>
<br>

---

##### 切换到 JDK 21

<br>

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
java -version
```

<br>

> **注意：** 以上切换仅对当前终端会话有效，永久切换请参考 [环境变量配置](#五环境变量配置)

<br>
<br>

---

**官方文档：** [Adoptium Temurin](https://adoptium.net/) | [Oracle JDK](https://www.oracle.com/java/technologies/downloads/)

<br>
<br>
<br>

---

## 二、Maven 安装

<br>
<br>

### 步骤 1：下载 Maven

<br>

访问 [Maven 官网下载页](https://maven.apache.org/download.cgi) 获取最新版本

<br>

或使用以下命令下载：

<br>

**步骤 1.1：进入下载目录**

<br>

```bash
cd ~/Downloads
```

<br>
<br>

**步骤 1.2：下载 Maven**

<br>

```bash
curl -O https://dlcdn.apache.org/maven/maven-3/3.9.9/binaries/apache-maven-3.9.9-bin.tar.gz
```

<br>
<br>

---

### 步骤 2.1：创建开发工具目录

<br>

```bash
sudo mkdir -p /opt/devtools
```

<br>
<br>

---

### 步骤 2.2：解压文件

<br>

```bash
tar -xzf apache-maven-3.9.9-bin.tar.gz
```

<br>
<br>

---

### 步骤 2.3：移动到固定位置

<br>

```bash
sudo mv apache-maven-3.9.9 /opt/devtools/maven
```

<br>
<br>

---

### 步骤 2.4：清理下载文件

<br>

```bash
rm apache-maven-3.9.9-bin.tar.gz
```

<br>
<br>

---

### 步骤 3：配置环境变量

<br>

编辑 shell 配置文件：

<br>

```bash
vim ~/.zshrc
```

<br>

添加以下内容：

<br>

```bash
# Maven
export M2_HOME=/opt/devtools/maven
export MAVEN_HOME=$M2_HOME
export PATH="$M2_HOME/bin:$PATH"
```

<br>

使配置生效：

<br>

```bash
source ~/.zshrc
```

<br>
<br>

---

### 步骤 4：验证安装

<br>

```bash
mvn -version
```

<br>

**成功输出示例：**

```
Apache Maven 3.9.9 (8e8579a9e76a7b34ff6f3f2b6d1e658e3c1b5dc5)
Maven home: /opt/devtools/maven
Java version: 17.0.9, vendor: Eclipse Adoptium
Default locale: zh_CN, platform encoding: UTF-8
OS name: "mac os x", version: "14.0", arch: "aarch64", family: "mac"
```

<br>
<br>

---

### （可选）配置国内镜像源

<br>

使用阿里云镜像可显著提升依赖下载速度

<br>

**创建配置目录：**

<br>

```bash
mkdir -p ~/.m2
```

<br>

**编辑配置文件：**

<br>

```bash
vim ~/.m2/settings.xml
```

<br>

**添加以下内容：**

<br>

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

<br>
<br>

---

**官方文档：** [Apache Maven](https://maven.apache.org/)

<br>
<br>
<br>

---

## 三、MySQL 安装

<br>

> **说明：** 以下步骤适用于 MySQL Community Server 官方安装包

<br>
<br>

### 步骤 1：下载 MySQL

<br>

访问 [MySQL 官网下载页](https://dev.mysql.com/downloads/mysql/)

<br>

**选择选项：**

- **Select Operating System:** macOS
- **Select OS Version:** macOS 14 (ARM, DMG Archive)

<br>

> **重要：** 必须选择 **macOS ARM** 版本才能在 M2 芯片上运行

<br>

或直接下载：[macOS ARM DMG](https://dev.mysql.com/downloads/mysql/)

<br>
<br>

---

### 步骤 2：安装 MySQL

<br>

**操作步骤：**

<br>

1. 双击下载的 `.dmg` 文件

<br>

2. 安装组件：

<br>

**必需组件：**

- `mysql.pkg` — MySQL 服务器 ✅ 必须安装

<br>

**可选组件：**

- `MySQL.prefPane` — 系统偏好设置面板
- `MySQLStartupItem.pkg` — 开机自启

<br>

3. 安装过程中设置 **root 密码**，请妥善保存

<br>
<br>

---

### 步骤 3：启动 MySQL 服务

<br>

#### 方式一：系统偏好设置

<br>

1. 打开 `系统设置` → `MySQL`

2. 点击 `Start MySQL Server`

<br>
<br>

---

#### 方式二：命令行

<br>

**启动服务：**

<br>

```bash
sudo /usr/local/mysql/support-files/mysql.server start
```

<br>

**停止服务：**

<br>

```bash
sudo /usr/local/mysql/support-files/mysql.server stop
```

<br>

**重启服务：**

<br>

```bash
sudo /usr/local/mysql/support-files/mysql.server restart
```

<br>

**查看状态：**

<br>

```bash
sudo /usr/local/mysql/support-files/mysql.server status
```

<br>
<br>

---

### 步骤 4：连接 MySQL

<br>

```bash
mysql -u root -p
```

<br>

输入安装时设置的密码

<br>

**连接成功后，会看到 MySQL 提示符：**

<br>

```
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 8
Server version: 8.0.35 MySQL Community Server

mysql>
```

<br>
<br>

---

### 步骤 5：（可选）修改 root 密码

<br>

```bash
# 登录 MySQL
mysql -u root -p
```

<br>

**在 MySQL 命令行中执行：**

<br>

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';
FLUSH PRIVILEGES;
EXIT;
```

<br>
<br>

---

### MySQL 图形化管理工具

<br>

#### 推荐工具

<br>

**DBeaver** ⭐⭐⭐⭐⭐

- 类型：免费
- 特点：开源、支持多数据库
- 下载：[dbeaver.io/download](https://dbeaver.io/download/)

<br>

**MySQL Workbench** ⭐⭐⭐⭐

- 类型：免费
- 特点：官方工具、功能全
- 下载：[dev.mysql.com/downloads/workbench](https://dev.mysql.com/downloads/workbench/)

<br>

**Sequel Ace** ⭐⭐⭐⭐

- 类型：免费
- 特点：macOS 原生、轻量
- 下载：[GitHub Releases](https://github.com/Sequel-Ace/Sequel-Ace/releases)

<br>

**TablePlus** ⭐⭐⭐⭐

- 类型：付费
- 特点：界面美观、体验好
- 下载：[tableplus.com](https://tableplus.com/)

<br>
<br>

---

### MySQL 安装位置

<br>

| 项目 | 路径 |
|:---|:---|
| 安装目录 | `/usr/local/mysql/` |
| 配置文件 | `/usr/local/mysql/my.cnf` |
| 数据目录 | `/usr/local/mysql/data/` |
| 日志文件 | `/usr/local/mysql/data/*.err` |
| 命令行工具 | `/usr/local/mysql/bin/mysql` |

<br>
<br>

---

**官方文档：** [MySQL 官网](https://www.mysql.com/) | [MySQL 参考手册](https://dev.mysql.com/doc/)

<br>
<br>
<br>

---

## 四、Redis 安装

<br>

> **说明：** Redis 没有官方 macOS 安装包，需要通过源码编译安装

<br>
<br>

### 步骤 1：安装编译工具

<br>

确保已安装 Xcode 命令行工具：

<br>

```bash
xcode-select --install
```

<br>
<br>

---

### 步骤 2.1：进入下载目录

<br>

```bash
cd ~/Downloads
```

<br>
<br>

---

### 步骤 2.2：下载 Redis

<br>

下载 Redis 7.2.5（稳定版）

<br>

```bash
curl -O https://github.com/redis/redis/archive/refs/tags/7.2.5.tar.gz
```

<br>
<br>

---

### 步骤 2.3：解压文件

<br>

**解压压缩包：**

<br>

```bash
tar -xzf 7.2.5.tar.gz
```

<br>
<br>

**进入目录：**

<br>

```bash
cd redis-7.2.5
```

<br>
<br>

---

### 步骤 2.4：编译 Redis

<br>

编译约需 2-3 分钟

<br>

```bash
make
```

<br>
<br>

---

### 步骤 2.5：测试编译（可选）

<br>

此步骤耗时较长，可跳过

<br>

```bash
make test
```

<br>
<br>

---

### 步骤 2.6：安装到系统目录

<br>

```bash
sudo make install
```

<br>

**编译完成后，可执行文件安装到 `/usr/local/bin/`：**

<br>

- `redis-server` — Redis 服务器

- `redis-cli` — 命令行客户端

<br>
<br>

---

### 步骤 3.1：创建配置目录

<br>

```bash
sudo mkdir -p /usr/local/etc/redis
```

<br>
<br>

---

### 步骤 3.2：复制默认配置

<br>

```bash
sudo cp ~/Downloads/redis-7.2.5/redis.conf /usr/local/etc/redis/redis.conf
```

<br>
<br>

---

### 步骤 3.3：编辑配置文件

<br>

```bash
sudo vim /usr/local/etc/redis/redis.conf
```

<br>

**推荐配置项：**

<br>

```text
# 网络配置
bind 127.0.0.1
port 6379

# 安全配置
requirepass your_password

# 持久化配置
save 900 1
save 300 10
save 60 10000

# 内存配置
maxmemory 256mb
maxmemory-policy allkeys-lru

# 运行模式
daemonize yes

# 日志配置
logfile /usr/local/var/redis/redis.log
loglevel notice
```

<br>
<br>

---

### 步骤 4.1：创建目录

<br>

```bash
sudo mkdir -p /usr/local/var/redis
```

<br>
<br>

---

### 步骤 4.2：设置权限

<br>

```bash
sudo chown $(whoami) /usr/local/var/redis
```

<br>
<br>

---

### 步骤 5.1：前台启动（用于调试）

<br>

```bash
redis-server
```

<br>
<br>

---

### 步骤 5.2：后台启动（使用配置文件）

<br>

```bash
redis-server /usr/local/etc/redis/redis.conf
```

<br>
<br>

---

### 步骤 5.3：验证运行状态

<br>

```bash
ps aux | grep redis
```

<br>
<br>

---

### 步骤 6.1：连接 Redis

<br>

```bash
redis-cli
```

<br>
<br>

---

### 步骤 6.2：测试命令

<br>

**执行 ping 测试：**

<br>

```
127.0.0.1:6379> ping
PONG
```

<br>

**存取数据测试：**

<br>

```
127.0.0.1:6379> set hello "world"
OK

127.0.0.1:6379> get hello
"world"

127.0.0.1:6379> exit
```

<br>
<br>

---

### 步骤 6.3：使用密码连接

<br>

```bash
redis-cli -a your_password
```

<br>
<br>

---

### （可选）设置开机自启

<br>

**步骤 1：创建 LaunchAgent 配置文件**

<br>

```bash
vim ~/Library/LaunchAgents/io.redis.redis-server.plist
```

<br>

**步骤 2：添加以下内容**

<br>

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

<br>
<br>

**步骤 3：加载服务（开机自启）**

<br>

```bash
launchctl load ~/Library/LaunchAgents/io.redis.redis-server.plist
```

<br>
<br>

**步骤 4：停止服务（如需要）**

<br>

```bash
launchctl unload ~/Library/LaunchAgents/io.redis.redis-server.plist
```

<br>
<br>

---

### Redis 图形化管理工具

<br>

**AnotherRedisDesktopManager**

- 类型：免费
- 下载：[GitHub Releases](https://github.com/qishibo/AnotherRedisDesktopManager/releases)

<br>

**RedisInsight（官方）**

- 类型：免费
- 下载：[redis.com/redis-insight](https://redis.com/redis-enterprise/redis-insight/)

<br>
<br>

---

**官方文档：** [Redis 官网](https://redis.io/) | [Redis GitHub](https://github.com/redis/redis)

<br>
<br>
<br>

---

## 五、环境变量配置

<br>
<br>

### 统一配置环境变量

<br>

编辑 shell 配置文件：

<br>

```bash
vim ~/.zshrc
```

<br>

**添加以下内容：**

<br>

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
```

<br>

**使配置生效：**

<br>

```bash
source ~/.zshrc
```

<br>
<br>

---

### 验证所有环境

<br>

**验证 Java：**

<br>

```bash
java -version
```

<br>
<br>

**验证 Maven：**

<br>

```bash
mvn -version
```

<br>
<br>

**验证 MySQL：**

<br>

```bash
mysql --version
```

<br>
<br>

**验证 Redis：**

<br>

```bash
redis-cli --version
```

<br>
<br>

**一键验证脚本（可选）：**

<br>

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

<br>

**预期输出：**

<br>

```
========== 环境验证 ==========
Java: openjdk version "17.0.9" 2023-10-17
Maven: Apache Maven 3.9.6
MySQL: mysql Ver 8.0.35 for macos14.0 on arm64 (MySQL Community Server)
Redis: redis-cli 7.2.4
==========================
```

<br>
<br>
<br>

---

## 六、常用命令速查

<br>
<br>

### Java 命令

<br>

**查看已安装版本：**

<br>

```bash
/usr/libexec/java_home -V
```

<br>

**切换版本（临时）：**

<br>

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

<br>

**编译文件：**

<br>

```bash
javac MyClass.java
```

<br>

**运行程序：**

<br>

```bash
java MyClass
```

<br>
<br>

---

### Maven 命令

<br>

**创建新项目：**

<br>

```bash
mvn archetype:generate -DgroupId=com.example -DartifactId=my-app
```

<br>

**编译项目：**

<br>

```bash
mvn compile
```

<br>

**运行测试：**

<br>

```bash
mvn test
```

<br>

**打包项目：**

<br>

```bash
mvn package
```

<br>

**清理构建：**

<br>

```bash
mvn clean
```

<br>

**跳过测试打包：**

<br>

```bash
mvn package -DskipTests
```

<br>
<br>

---

### MySQL 命令

<br>

**启动服务：**

<br>

```bash
sudo /usr/local/mysql/support-files/mysql.server start
```

<br>

**停止服务：**

<br>

```bash
sudo /usr/local/mysql/support-files/mysql.server stop
```

<br>

**重启服务：**

<br>

```bash
sudo /usr/local/mysql/support-files/mysql.server restart
```

<br>

**连接数据库：**

<br>

```bash
mysql -u root -p
```

<br>

**导入 SQL 文件：**

<br>

```bash
mysql -u root -p database_name < backup.sql
```

<br>

**导出数据库：**

<br>

```bash
mysqldump -u root -p database_name > backup.sql
```

<br>
<br>

---

### Redis 命令

<br>

**启动服务器：**

<br>

```bash
redis-server /usr/local/etc/redis/redis.conf
```

<br>

**连接 Redis：**

<br>

```bash
redis-cli
```

<br>

**使用密码连接：**

<br>

```bash
redis-cli -a your_password
```

<br>

**测试连接：**

<br>

```bash
redis-cli ping
```

<br>

**查看所有 key：**

<br>

```bash
redis-cli keys '*'
```

<br>

**清空当前数据库：**

<br>

```bash
redis-cli flushdb
```

<br>

**清空所有数据库：**

<br>

```bash
redis-cli flushall
```

<br>

**查看信息：**

<br>

```bash
redis-cli info
```

<br>

**关闭服务器：**

<br>

```bash
redis-cli shutdown
```

<br>
<br>
<br>

---

## 七、常见问题

<br>
<br>

### Q1: 如何确认是否下载了 ARM 版本？

<br>

**检查 Mac 架构：**

<br>

```bash
uname -m
# 输出: arm64
```

<br>

**提示：** M2/M1/M3 芯片的 Mac 必须选择 **ARM64** 或 **aarch64** 版本的软件。

<br>
<br>

---

### Q2: 出现 "Bad CPU type" 错误怎么办？

<br>

这表示尝试运行 x86_64 架构的软件。

<br>

**解决方案：**

<br>

1. 重新下载 ARM 原生版本（推荐）

2. 或安装 Rosetta 2 转译层（性能较差）

<br>

```bash
# 安装 Rosetta 2
softwareupdate --install-rosetta
```

<br>
<br>

---

### Q3: MySQL 无法启动如何排查？

<br>

**步骤 1：查看错误日志**

<br>

```bash
tail -n 50 /usr/local/mysql/data/*.err
```

<br>

**步骤 2：检查常见问题**

<br>

| 问题 | 解决方案 |
|:---|:---|
| 权限问题 | `sudo chown -R mysql:mysql /usr/local/mysql/data` |
| 端口被占用 | `lsof -i :3306` 然后 `sudo kill -9 <PID>` |
| 配置文件错误 | `sudo vim /usr/local/mysql/my.cnf` |

<br>
<br>

---

### Q4: Redis 连接被拒绝？

<br>

**步骤 1：检查 Redis 是否运行**

<br>

```bash
ps aux | grep redis
```

<br>
<br>

**步骤 2：测试连接**

<br>

```bash
redis-cli ping
```

<br>
<br>

**步骤 3：如果未运行，重新启动**

<br>

```bash
redis-server /usr/local/etc/redis/redis.conf
```

<br>
<br>

---

### Q5: 如何永久切换 Java 版本？

<br>

**步骤 1：编辑 ~/.zshrc**

<br>

```bash
vim ~/.zshrc
```

<br>

**步骤 2：修改版本号（如改为 21）**

<br>

```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
```

<br>
<br>

**步骤 3：使配置生效**

<br>

```bash
source ~/.zshrc
java -version
```

<br>
<br>

---

### Q6: 提示 "command not found" 怎么办？

<br>

**步骤 1：确认环境变量**

<br>

```bash
echo $PATH
```

<br>
<br>

**步骤 2：使配置生效**

<br>

```bash
source ~/.zshrc
```

<br>
<br>

**步骤 3：检查文件是否存在**

<br>

```bash
ls /usr/local/mysql/bin/mysql
ls /usr/local/bin/redis-cli
ls /opt/devtools/maven/bin/mvn
```

<br>
<br>

---

### Q7: MySQL 密码忘记如何重置？

<br>

**步骤 1：停止 MySQL**

<br>

```bash
sudo /usr/local/mysql/support-files/mysql.server stop
```

<br>
<br>

**步骤 2：安全模式启动**

<br>

```bash
sudo /usr/local/mysql/bin/mysqld_safe --skip-grant-tables &
```

<br>
<br>

**步骤 3：无密码登录**

<br>

```bash
mysql -u root
```

<br>
<br>

**步骤 4：在 MySQL 中执行**

<br>

```sql
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';
EXIT;
```

<br>
<br>

**步骤 5：重启 MySQL**

<br>

```bash
sudo /usr/local/mysql/support-files/mysql.server restart
```

<br>
<br>
<br>

---

## 八、卸载指南

<br>
<br>

### 卸载 JDK

<br>

**步骤 1：列出所有已安装的 JDK**

<br>

```bash
/usr/libexec/java_home -V
```

<br>
<br>

**步骤 2：删除指定版本**

<br>

```bash
sudo rm -rf /Library/Java/JavaVirtualMachines/jdk-17.jdk
sudo rm -rf /Library/Java/JavaVirtualMachines/temurin-21.jdk
```

<br>
<br>

**步骤 3：验证删除**

<br>

```bash
/usr/libexec/java_home -V
```

<br>
<br>

---

### 卸载 Maven

<br>

**步骤 1：删除 Maven 目录**

<br>

```bash
sudo rm -rf /opt/devtools/maven
```

<br>
<br>

**步骤 2：删除环境变量配置**

<br>

```bash
vim ~/.zshrc
```

<br>

删除 Maven 相关行后，使配置生效：

<br>

```bash
source ~/.zshrc
```

<br>
<br>

**步骤 3：删除本地仓库（可选）**

<br>

```bash
rm -rf ~/.m2
```

<br>
<br>

---

### 卸载 MySQL

<br>

**步骤 1：停止 MySQL 服务**

<br>

```bash
sudo /usr/local/mysql/support-files/mysql.server stop
```

<br>
<br>

**步骤 2：删除 MySQL 主程序**

<br>

```bash
sudo rm -rf /usr/local/mysql
```

<br>
<br>

**步骤 3：删除系统配置**

<br>

```bash
sudo rm -rf /Library/StartupItems/MySQLCOM
sudo rm -rf /Library/PreferencePanes/MySQL*
sudo rm -rf /Library/Receipts/mysql*.pkg
```

<br>
<br>

**步骤 4：删除配置和数据（谨慎操作！）**

<br>

```bash
sudo rm -rf /etc/my.cnf
sudo rm -rf /usr/local/mysql/data
```

<br>
<br>

---

### 卸载 Redis

<br>

**步骤 1：停止 Redis 服务**

<br>

```bash
redis-cli shutdown
```

<br>
<br>

**步骤 2：删除可执行文件**

<br>

```bash
sudo rm -f /usr/local/bin/redis-*
```

<br>
<br>

**步骤 3：删除配置和数据**

<br>

```bash
sudo rm -rf /usr/local/etc/redis
sudo rm -rf /usr/local/var/redis
```

<br>
<br>

**步骤 4：删除开机自启配置**

<br>

```bash
rm ~/Library/LaunchAgents/io.redis.redis-server.plist
```

<br>
<br>
<br>

---

## 九、参考资源

<br>
<br>

### 官方文档

<br>

**Eclipse Temurin**

- [adoptium.net/temurin/documentation](https://adoptium.net/temurin/documentation)

<br>

**Oracle JDK**

- [docs.oracle.com/en/java/javase](https://docs.oracle.com/en/java/javase/)

<br>

**Apache Maven**

- [maven.apache.org/guides](https://maven.apache.org/guides/)

<br>

**MySQL**

- [dev.mysql.com/doc](https://dev.mysql.com/doc/)

<br>

**Redis**

- [redis.io/docs](https://redis.io/docs)

<br>
<br>
<br>

---

## 十、安装检查清单

<br>

完成安装后，使用以下清单验证：

<br>

| 项目 | 验证命令 | 预期结果 |
|:---|:---|:---|
| ✅ JDK 已安装 | `/usr/libexec/java_home -V` | 显示 JDK 版本列表 |
| ✅ Java 命令可用 | `java -version` | 显示版本信息 |
| ✅ Maven 已安装 | `ls /opt/devtools/maven` | 目录存在 |
| ✅ Maven 命令可用 | `mvn -version` | 显示版本信息 |
| ✅ MySQL 服务运行 | `sudo /usr/local/mysql/support-files/mysql.server status` | 显示 "SUCCESS!" |
| ✅ MySQL 可连接 | `mysql -u root -p` | 成功登录 |
| ✅ Redis 服务运行 | `ps aux \| grep redis` | 显示 redis-server 进程 |
| ✅ Redis 可连接 | `redis-cli ping` | 返回 PONG |
| ✅ 环境变量已配置 | `cat ~/.zshrc` | 包含各工具配置 |
| ✅ PATH 正确 | `echo $PATH` | 包含各工具 bin 路径 |

<br>
<br>

---

> **提示：** 如遇问题，请参考 [常见问题](#七常见问题) 章节。

<br>
<br>

---

*文档最后更新：2025年*
