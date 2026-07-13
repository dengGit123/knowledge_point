### 一、概述

> 📖 [Maven 官方文档](https://maven.apache.org/index.html) ｜ [Maven 简介](https://maven.apache.org/guides/introduction/introduction-to-the-pom.html) ｜ [Maven in 5 Minutes](https://maven.apache.org/guides/getting-started/maven-in-five-minutes.html)

Maven 是 Apache 基金会的**项目管理和构建工具**。它基于「**项目对象模型（POM）**」的概念，用一份 `pom.xml` 描述整个项目，然后自动完成依赖管理、编译、测试、打包、发布等工作。

大白话：**写 Java 代码要靠一堆第三方 jar 包**（MySQL 驱动、Spring、Log4j……）。手动下载这些 jar、配置 classpath、处理版本冲突，是噩梦。Maven 就是那个「**帮你管理一切**」的管家——你只要在 `pom.xml` 里写一句「我要用 Spring 6.1.5」，它就自动下载 jar、处理好依赖关系、编译打包一条龙服务。

| 你将学到 | 说明 |
| --- | --- |
| 为什么需要 Maven | 解决了手动管理 jar 的痛点 |
| 核心概念 | POM、坐标、依赖、仓库、生命周期、插件 |
| 安装与配置 | 安装 JDK + Maven、配置环境变量、IDEA 集成 |
| 标准目录结构 | Maven 约定的项目骨架 |

> 💡 **提示：** 本篇是 Maven 系列的起点。理解了这里的「**6 大核心概念**」，后面所有 `pom.xml` 配置都只是在这几个概念上做文章。

---

### 二、为什么需要 Maven（痛点与解药）

#### 没有 Maven 的世界（手动管理 jar）

1. **手动下载**：去官网一个个下载 jar，扔进项目 `lib` 目录
2. **classpath 地狱**：每个 jar 都要手动加到 classpath
3. **依赖传递**：A 依赖 B，B 依赖 C……你得把 C 也下载了，否则报 `ClassNotFoundException`
4. **版本冲突**：A 要 `commons-logging 1.1`，B 要 `1.2`，到底用哪个？
5. **团队协作**：你把 `lib/`（几百 MB 的 jar）也提交到 Git？还是每个人重新下？

#### 有了 Maven 的世界

```xml
<!-- pom.xml 里写这一句 -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-core</artifactId>
    <version>6.1.5</version>
</dependency>
```

然后 Maven 自动：

- 从仓库下载 `spring-core-6.1.5.jar`
- 发现它还依赖 `spring-jcl`，**自动连带着一起下载**
- 处理版本冲突
- 编译、测试、打包时自动把这些 jar 加到 classpath

> ⭐ **一句话总结：Maven 让「依赖管理」和「构建流程」标准化、自动化。**

---

### 三、六大核心概念

Maven 的所有设计都围绕这 6 个概念，理解了它们就理解了 Maven：

#### 1. POM（Project Object Model，项目对象模型）

POM 就是 `pom.xml` 文件，是 Maven 项目的**唯一描述文件**。它告诉 Maven：

- 这个项目叫什么（坐标）
- 依赖哪些 jar
- 怎么编译、打包
- 用哪些插件

> Maven 的核心理念是「**约定优于配置（Convention over Configuration）**」——只要按 Maven 的约定放好目录、写好 POM，很多事不用你管。

#### 2. 坐标（Coordinate）

Maven 用 **GAV** 唯一确定世界上任何一个 jar：

| 坐标元素 | 含义 | 示例 |
| --- | --- | --- |
| `groupId` | 组织/公司 | `com.alibaba` |
| `artifactId` | 项目/模块名 | `fastjson` |
| `version` | 版本 | `1.2.83` |

合起来 `com.alibaba:fastjson:1.2.83` 就能在全球唯一定位这个 jar，就像身份证号。详见 [[坐标与依赖]]。

#### 3. 依赖（Dependency）

项目用到的第三方 jar 就是「依赖」。在 `pom.xml` 的 `dependencies` 里声明，Maven 自动从仓库下载并加入 classpath。

依赖之间会**传递**（A 依赖 B，B 依赖 C，则 A 也能用 C），也可能**冲突**（多个依赖引入同一 jar 的不同版本）。详见 [[坐标与依赖]]。

#### 4. 仓库（Repository）

仓库就是**存放 jar 的地方**，分三层：

```
本地仓库 (.m2)         ← 你电脑上的缓存
    │ 找不到就向远程仓库要
    ▼
私服 (Nexus)           ← 公司内部的仓库（可选）
    │ 找不到就向中央仓库要
    ▼
中央仓库 (Maven Central) ← 全球公共仓库
```

详见 [[仓库与镜像]]。

#### 5. 生命周期（Lifecycle）

Maven 内置了三套**生命周期**，每套是一组有序的阶段（phase）：

- `clean`：清理（删除 `target/`）
- `default`：主流程（编译 → 测试 → 打包 → 安装 → 发布）
- `site`：生成项目站点文档

执行某个 phase 时，**它前面的所有 phase 都会先执行**。比如 `mvn package` 会先 compile、再 test、最后 package。详见 [[生命周期与命令]]。

#### 6. 插件（Plugin）

生命周期只是「**规定步骤**」，真正干活的是**插件**。每个 phase 绑定了一个插件的某个 goal（任务）：

| phase | 绑定的插件 goal | 干的活 |
| --- | --- | --- |
| `compile` | `maven-compiler-plugin:compile` | 编译 `.java` → `.class` |
| `test` | `maven-surefire-plugin:test` | 跑单元测试 |
| `package` | `maven-jar-plugin:jar` | 打成 jar |

> 💡 **提示：** 生命周期 = 流程框架，插件 = 干活的工人。Maven 的可扩展性就来自插件——想要什么功能，加个插件即可。详见 [[pom配置/plugins插件配置]]。

#### 六大概念的关系图

```
   pom.xml（项目描述）
      │
      ├── 坐标 GAV ──────► 唯一标识本项目 & 它依赖的 jar
      │                        │
      ├── 依赖 dependencies     │ 这些 jar 从哪来？
      │                        ▼
      ├── 仓库 repository ◄── 本地/私服/中央仓库
      │
      └── 生命周期 lifecycle ──► 规定构建步骤
                │                     │
                └── 绑定插件 plugin ◄──┘ 真正干活
```

---

### 四、安装与配置

#### 1. 前置：安装 JDK

Maven 需要 JDK（Java 17+ 推荐）。检查：

```bash
java -version
javac -version
```

#### 2. 安装 Maven

**方式一：手动下载（推荐）**

1. 到 [Maven 下载页](https://maven.apache.org/download.cgi) 下载 `apache-maven-x.x.x-bin.zip`
2. 解压到某个目录，如 `/usr/local/apache-maven-3.9.6`
3. 配置环境变量：

```bash
# macOS / Linux：编辑 ~/.zshrc 或 ~/.bashrc
export MAVEN_HOME=/usr/local/apache-maven-3.9.6
export PATH=$PATH:$MAVEN_HOME/bin
```

```bash
# Windows：在「系统环境变量」里新增
MAVEN_HOME = C:\apache-maven-3.9.6
PATH 追加 ;%MAVEN_HOME%\bin
```

4. 验证安装：

```bash
mvn -version
# 输出类似：
# Apache Maven 3.9.6 (...)
# Maven home: /usr/local/apache-maven-3.9.6
# Java version: 17.0.10
```

**方式二：IDEA 自带 Maven**

IntelliJ IDEA 内置了 Maven，但**建议下载独立版本**统一管理，避免 IDEA 升级后路径变化。

#### 3. 配置本地仓库位置

默认本地仓库在 `~/.m2/repository`。可以改到别处（比如 D 盘），编辑 `~/.m2/settings.xml`（或 `MAVEN_HOME/conf/settings.xml`）：

```xml
<settings>
    <!-- 本地仓库路径 -->
    <localRepository>D:/maven-repo</localRepository>
</settings>
```

详见 [[settings配置]]。

#### 4. 配置国内镜像（加速下载，强烈推荐）

中央仓库在国外，下载慢。配阿里云镜像：

```xml
<!-- settings.xml 中的 <mirrors> 标签内 -->
<mirrors>
    <mirror>
        <id>aliyun</id>
        <mirrorOf>central</mirrorOf>
        <name>阿里云公共仓库</name>
        <url>https://maven.aliyun.com/repository/public</url>
    </mirror>
</mirrors>
```

详见 [[仓库与镜像]]。

#### 5. IDEA 集成

`Settings → Build, Execution, Deployment → Build Tools → Maven`：

- `Maven home path`：指向你安装的 Maven 目录
- `User settings file`：勾选 Override，指向你的 `settings.xml`
- `Local repository`：自动从 settings.xml 读取

---

### 五、标准目录结构（约定优于配置）

Maven **约定**了一套标准目录结构，只要按这个结构放文件，Maven 就知道去哪找源码、去哪找测试、去哪找资源。

```
my-project/
├── pom.xml                      ← 项目描述文件（必须）
├── src/
│   ├── main/                    ← 主程序（最终打包的内容）
│   │   ├── java/                ← 源代码 .java 文件
│   │   │   └── com/example/
│   │   │       └── App.java
│   │   └── resources/           ← 配置文件（application.yml、log4j.xml 等）
│   └── test/                    ← 测试代码（不会打包进 jar）
│       ├── java/                ← 测试 .java 文件
│       │   └── com/example/
│       │       └── AppTest.java
│       └── resources/           ← 测试用资源
└── target/                      ← 编译/打包输出（自动生成，别提交到 Git）
    ├── classes/                 ← 编译后的 .class
    └── my-project-1.0.0.jar     ← 打包结果
```

| 目录 | 作用 | 是否必须 |
| --- | --- | --- |
| `pom.xml` | 项目描述 | ✅ 必须 |
| `src/main/java/` | 源代码 | ✅ 推荐 |
| `src/main/resources/` | 配置文件 | 常用 |
| `src/test/java/` | 测试代码 | 推荐 |
| `src/test/resources/` | 测试资源 | 可选 |
| `target/` | 输出目录 | 自动生成，**不要手动创建或提交** |

> ⚠️ **注意：** `target/` 是 Maven 自动生成的，每次 `mvn clean` 会被清空。**不要把它提交到 Git**，在 `.gitignore` 里加上 `target/`。

---

### 六、第一个 Maven 项目

#### 方式一：用命令行骨架生成

```bash
mvn archetype:generate \
    -DgroupId=com.example \
    -DartifactId=my-first-maven \
    -DarchetypeArtifactId=maven-archetype-quickstart \
    -DinteractiveMode=false
```

这会自动生成一个标准 Maven 项目骨架。

#### 方式二：IDEA 创建

`New Project → Maven → 填 GroupId / ArtifactId → Finish`。

#### 最小 pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <!-- POM 模型版本，固定 4.0.0 -->
    <modelVersion>4.0.0</modelVersion>

    <!-- 项目坐标 GAV -->
    <groupId>com.example</groupId>
    <artifactId>my-first-maven</artifactId>
    <version>1.0.0</version>

    <!-- 打包方式，默认 jar -->
    <packaging>jar</packaging>

</project>
```

> 💡 **提示：** 这就是一个能用的最小 `pom.xml`。各标签的含义详见 [[pom配置/项目坐标配置]]。

#### 常用命令速览

```bash
mvn clean              # 清理 target 目录
mvn compile            # 编译主程序
mvn test               # 运行测试
mvn package            # 打包（生成 jar/war）
mvn install            # 打包并安装到本地仓库
mvn clean package      # 组合：先清理再打包
```

详见 [[生命周期与命令]]。

---

### 七、Maven vs 其他构建工具

| 特性 | Maven | Gradle | Ant |
| --- | --- | --- | --- |
| 配置文件 | `pom.xml`（声明式 XML） | `build.gradle`（Groovy/Kotlin DSL） | `build.xml`（过程式 XML） |
| 依赖管理 | ✅ 内置，强大 | ✅ 内置，更灵活 | ❌ 需搭配 Ivy |
| 约定优于配置 | ✅ 强约定 | ⚠️ 可灵活自定义 | ❌ 全靠手写 |
| 学习曲线 | 平缓，约定清晰 | 较陡，需学 DSL | 一般 |
| 构建速度 | 一般 | ✅ 增量编译、缓存，快 | 一般 |
| 适用场景 | 中大型 Java 项目（尤其后端） | Android、追求性能的项目 | 老项目、遗留系统 |

> 💡 **提示：** **Spring Boot、Spring Cloud 生态默认用 Maven**。新手学 Java 后端，Maven 是首选。Gradle 在 Android 开发中更主流。

---

### 八、常见问题与注意事项

#### 1. Maven 和 JDK 版本不匹配

Maven 3.9.x 建议 JDK 8+；某些新版本要求 JDK 17+。报错类似 `Unsupported class file major version`，检查版本搭配。

#### 2. 下载依赖卡住 / 报错连接超时

中央仓库慢，配国内镜像（阿里云 / 华为云）。详见 [[仓库与镜像]]。

#### 3. IDEA 里改了 pom.xml 不生效

- 右键 `pom.xml → Maven → Reload Project`
- 或点 Maven 面板的「刷新」按钮

#### 4. 本地仓库越占越大

`.m2/repository` 会越攒越多。**可以随时整个删除**，下次构建会重新下载需要的。

#### 5. 版本号 `SNAPSHOT` 是什么

带 `-SNAPSHOT` 的版本是「快照版」，表示开发中、还在变。Maven 会定期从远程拉最新；不带的是 Release 发布版，固定不变。详见 [[坐标与依赖]]。

---

### 九、总结

| 要点 | 说明 |
| --- | --- |
| Maven 是什么 | Java 的项目管理和构建工具 |
| 核心文件 | `pom.xml`（项目级）+ `settings.xml`（全局级） |
| 六大核心概念 | POM、坐标、依赖、仓库、生命周期、插件 |
| 核心理念 | 约定优于配置 |
| 解决的痛点 | 依赖管理自动化、构建流程标准化 |

理解了本篇的 6 大核心概念，接下来：

- 想懂 jar 包怎么来 → [[坐标与依赖]]
- 想懂 `mvn` 命令 → [[生命周期与命令]]
- 想懂 jar 包存哪、怎么加速 → [[仓库与镜像]]
- 想逐个吃透 `pom.xml` 标签 → [[pom配置/pom总览]]

系列导航：[[README]]。
