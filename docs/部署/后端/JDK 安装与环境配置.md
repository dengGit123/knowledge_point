### 一、概述

> 📖 [Spring Boot 系统要求](https://docs.spring.io/spring-boot/system-requirements.html) ｜ [Ubuntu - OpenJDK 文档](https://ubuntu.com/server/docs/how-to-install-and-configure-java-on-ubuntu)

Java 是「编译一次、到处运行」，但前提是**运行处必须有匹配版本的 JRE/JDK**。服务器上装 JDK，就是给你的 Jar 包准备「运动员上场前的跑道」——版本不对、变量没配，Jar 包寸步难行。

大白话：你的项目用 Java 17 写的，服务器上却装着 Java 8，就像 PS5 的光盘塞进了 PS3——不是质量好坏问题，是**根本读不了**。这一篇解决「装哪个版本、怎么装、怎么让系统认识它」。

| 你将学到 | 说明 |
| --- | --- |
| 版本选择 | JDK 版本必须与项目编译版本一致 |
| 安装方式 | apt / dnf 包管理器安装（推荐） |
| 环境变量 | JAVA_HOME 配置与持久化 |
| 多版本共存 | alternatives 切换默认版本 |

> 💡 **提示：** 只运行不编译的话，装 **JRE 就够**（更小）；但服务器上常需排查问题（如 `jmap`、`jstack`），建议直接装 **JDK**，这些诊断工具都在 JDK 里。

---

### 二、版本怎么选

| 项目情况 | 服务器 JDK 版本 |
| --- | :---: |
| Spring Boot 3.x | **Java 17+**（硬性要求，3.x 最低 Java 17） |
| Spring Boot 2.x | Java 8 及以上（2.7 兼容到 Java 21，推荐 8 或 11；2.x 已停止开源维护） |
| 看项目 `pom.xml` 的 `java.version` | 与之**保持一致或更高**（同为 17/21 大版本） |

```xml
<!-- 本地项目查版本：pom.xml -->
<properties>
    <java.version>17</java.version>   <!-- 项目要求 Java 17 -->
</properties>
```

> ⚠️ **注意：** Spring Boot 3.x 要求 **Java 17 及以上**，用 Java 8 服务器跑 Spring Boot 3 的 Jar 会直接报 `UnsupportedClassVersionError`（class 文件版本号高于 JVM 认识的版本）。部署前先看 `pom.xml`，再定 JDK 版本。

**发行版选择**：OpenJDK（各发行版仓库自带）或 Eclipse Temurin（原 AdoptOpenJDK，社区主流）。功能一致，选顺手即可；公司有规定（如必须 Temurin/Oracle JDK）以规定为准。

---

### 三、安装 JDK

#### 1. Ubuntu / Debian（apt）

```bash
# 更新软件源索引
sudo apt update

# 安装 JDK 17（OpenJDK）
sudo apt install openjdk-17-jdk -y

# 验证
java -version
# 输出示例：openjdk version "17.0.x" ...
javac -version
```

#### 2. CentOS / RHEL / Rocky / AlmaLinux（yum/dnf）

```bash
# 新系统用 dnf，老系统把 dnf 换成 yum
sudo dnf install java-17-openjdk-devel -y

# 验证
java -version
```

> ⚠️ **注意：** CentOS 7 已停止维护（2024 年 6 月 EOL），其官方源里**没有 OpenJDK 17**。要么升级系统，要么下载 Temurin 的 tar.gz 手动安装。

#### 3. 手动安装（tar.gz，适合无网/需精确版本）

```bash
# 下载 Temurin 17（示例路径以官网为准）
wget https://github.com/adoptium/temurin17-binaries/releases/download/.../OpenJDK17U-jdk_x64_linux_hotspot_17.0.xx_x.tar.gz

# 解压到统一目录
sudo mkdir -p /usr/lib/jvm
sudo tar -xzf OpenJDK17U-jdk_*.tar.gz -C /usr/lib/jvm

# 此时目录形如 /usr/lib/jvm/jdk-17.0.xx+xx
```

---

### 四、配置 JAVA_HOME

很多工具（Maven、部分框架脚本）依赖 `JAVA_HOME` 环境变量定位 JDK。

```bash
# ① 先找到 JDK 真实路径
readlink -f $(which java)
# 典型输出：/usr/lib/jvm/java-17-openjdk-amd64/bin/java
#          （去掉结尾的 /bin/java 就是 JAVA_HOME）

# ② 写入全局环境变量文件
sudo tee -a /etc/profile.d/java.sh << 'EOF'
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
EOF

# ③ 立即生效并验证
source /etc/profile.d/java.sh
echo $JAVA_HOME
```

> 💡 **提示：** 写在 `/etc/profile.d/*.sh` 对**所有用户**生效且登录时自动加载，比写 `~/.bashrc`（只对当前用户）更适合服务器场景。注意 systemd 服务**不会读取**这些文件，`ExecStart` 里请写 `java` 的绝对路径或依赖 `JAVA_HOME` 的 unit 配置。

---

### 五、多版本共存与切换

一台服务器可能同时要跑 Java 8 的老项目和 Java 17 的新项目，用 alternatives 管理：

```bash
# 查看已注册的 Java 版本并交互式选择默认版本
sudo update-alternatives --config java
# 输出示例：
#   选择        路径                                      优先级  状态
# * 0          /usr/lib/jvm/java-17-openjdk-amd64/bin/java  1711  自动模式
#   1          /usr/lib/jvm/java-8-openjdk-amd64/jre/bin/java 1081  手动模式
#   2          /usr/lib/jvm/java-17-openjdk-amd64/bin/java  1711  手动模式

# CentOS 系用 alternatives（命令名不同，用法相同）
sudo alternatives --config java
```

> 💡 **提示：** `update-alternatives` 切的是**系统默认**的 `java` 命令。更稳妥的做法是**应用级指定**：systemd 的 `ExecStart=/usr/lib/jvm/java-17-openjdk-amd64/bin/java -jar ...`，让每个服务明确用自己的 JDK，互不干扰——多服务共存时强烈推荐这么写。

---

### 六、验证清单

```bash
java -version            # 版本对不对
javac -version           # JDK 是否完整（JRE 没有这个）
echo $JAVA_HOME          # 变量是否生效
which java               # 指向是否符合预期
jps -l                   # JDK 诊断工具可用（后面排查问题全靠它们）
```

---

### 七、注意事项汇总

| 类别 | 注意事项 |
| --- | --- |
| 🔴 版本一致 | JDK 大版本必须 ≥ 项目 `java.version`；Spring Boot 3.x 至少 Java 17 |
| systemd 不读 bashrc | unit 文件里用绝对路径，或显式设 `Environment=JAVA_HOME=...` |
| 装 JDK 不装 JRE | 保留 `jmap`/`jstack` 等诊断能力，排障时 invaluable |
| 服务器 vs 本地 | 版本以**服务器/生产**为准，本地与生产不一致是「本地好好的」类问题的源头 |
| 别手动覆盖包管理器装的 JDK | tar.gz 与 apt 装的同版本并存容易混乱，统一一种方式 |

### 八、总结

JDK 安装本身是「一条命令」的事，真正要记住的是三件事：**版本与项目匹配**（先看 `pom.xml`）、**JAVA_HOME 配置持久化**、**systemd 场景用绝对路径**。跑道铺好了，下一站把应用打包成 Jar：[[打包与多环境配置]]。
