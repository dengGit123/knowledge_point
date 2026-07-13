### 一、概述

> 📖 [POM Reference](https://maven.apache.org/pom.html) ｜ [POM 简介](https://maven.apache.org/guides/introduction/introduction-to-the-pom.html)

`pom.xml`（Project Object Model）是 Maven 项目的**核心配置文件**，描述「这个项目长什么样、依赖什么、怎么构建」。本篇是 pom.xml 配置系列的总纲——先建立全局视野，看清整个 pom.xml 的骨架、哪些是必须的、各标签之间什么关系，再逐个深入。

大白话：`pom.xml` 就是项目的「**户口本 + 说明书**」。户口本部分写「我叫什么、家住哪」（坐标），说明书部分写「我需要什么、怎么把我做出来」（依赖、插件、构建）。

| 你将学到 | 说明 |
| --- | --- |
| pom.xml 整体结构 | 完整骨架有哪些部分 |
| modelVersion | 固定值 4.0.0 |
| 最小 pom | 能跑的最简配置 |
| Super POM | Maven 自带的「祖宗 POM」 |
| Effective POM | 最终生效的完整 POM |
| 必填项总表 | 哪些必须配、哪些可选 |

> 💡 **提示：** 看完本篇，你对 pom.xml 会有「地图感」。后续每个标签的详解，都是在这张地图上深入某个区域。

---

### 二、pom.xml 整体结构（全景图）

一个完整的 `pom.xml` 包含这些顶层标签（按常见顺序，**只有 GAV 是必须的**）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <!-- ① 模型版本：固定 4.0.0，必须 -->
    <modelVersion>4.0.0</modelVersion>

    <!-- ② 项目坐标 GAV：必须 -->
    <groupId>com.example</groupId>
    <artifactId>my-project</artifactId>
    <version>1.0.0</version>

    <!-- ③ 打包方式：可选，默认 jar -->
    <packaging>jar</packaging>

    <!-- ④ 项目基本信息：可选 -->
    <name>My Project</name>
    <description>项目描述</description>
    <url>https://example.com</url>

    <!-- ⑤ 属性定义：可选 -->
    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <spring.version>6.1.5</spring.version>
    </properties>

    <!-- ⑥ 依赖：几乎必用 -->
    <dependencies>
        <dependency>...</dependency>
    </dependencies>

    <!-- ⑦ 依赖版本管理：可选（多模块常用） -->
    <dependencyManagement>
        <dependencies>...</dependencies>
    </dependencyManagement>

    <!-- ⑧ 构建配置：常用 -->
    <build>
        <plugins>...</plugins>
    </build>

    <!-- ⑨ 仓库：可选 -->
    <repositories>...</repositories>

    <!-- ⑩ 发布配置：可选 -->
    <distributionManagement>...</distributionManagement>

    <!-- ⑪ 多环境配置：可选 -->
    <profiles>...</profiles>

    <!-- ⑫ 父项目：可选（多模块/继承用） -->
    <parent>...</parent>

    <!-- ⑬ 聚合模块：可选（多模块用） -->
    <modules>...</modules>

</project>
```

#### 各部分职责一览

| 标签 | 作用 | 是否必须 | 详解文档 |
| --- | --- | --- | --- |
| `modelVersion` | POM 模型版本 | ✅ 必须 | 本篇 |
| `groupId` / `artifactId` / `version` | 项目坐标 GAV | ✅ 必须 | [[项目坐标配置]] |
| `packaging` | 打包方式 | ⭐ 默认 jar | [[项目坐标配置]] |
| `name` / `description` / `url` | 项目描述信息 | ❌ 可选 | [[项目坐标配置]] |
| `properties` | 属性定义 | ❌ 可选 | [[properties属性配置]] |
| `dependencies` | 依赖 | ⭐ 几乎必用 | [[dependencies依赖配置]] |
| `dependencyManagement` | 版本统一管理 | ❌ 多模块必用 | [[dependencyManagement配置]] |
| `build` | 构建配置 | ⭐ 常用 | [[build构建配置]] |
| `plugins`（在 build 内） | 插件 | ⭐ 常用 | [[plugins插件配置]] |
| `repositories` | 下载仓库 | ❌ 可选 | [[repositories配置]] |
| `distributionManagement` | 发布仓库 | ❌ 可选 | [[repositories配置]] |
| `profiles` | 多环境配置 | ❌ 可选 | [[profiles配置]] |
| `parent` | 父项目（继承） | ❌ 多模块用 | [[../多模块/子模块]] |
| `modules` | 聚合子模块 | ❌ 多模块用 | [[modules配置]] |

> ⭐ 标星的是「虽非语法强制，但实际项目几乎都会配」的。

---

### 三、`modelVersion`：固定 4.0.0

```xml
<modelVersion>4.0.0</modelVersion>
```

这是 POM 模型的版本号。**目前固定写 `4.0.0`**，不用改。它告诉 Maven 这份 POM 用的是哪个版本的 XML 结构规范。Maven 4 未来可能引入新版本，但目前所有 Maven 3 项目都是 `4.0.0`。

---

### 四、最小 pom.xml

能满足 Maven 构建要求的**最小配置**：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">

    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>my-project</artifactId>
    <version>1.0.0</version>

</project>
```

就这 4 行核心（`modelVersion` + GAV），`mvn package` 就能跑——因为剩下的（编译插件、打包插件等）都从 **Super POM** 继承来了。

> 💡 **提示：** `xmlns` 那几行是 XML 命名空间声明，IDEA 创建 Maven 项目会自动带上，照抄即可，不用纠结。

---

### 五、Super POM：Maven 的「祖宗 POM」

#### 1. 什么是 Super POM

Maven 内置了一份「**超级 POM**」，所有项目的 pom.xml 都**隐式继承**它。Super POM 里定义了：

- 中央仓库地址（所以默认能下 jar）
- 默认的目录结构（`src/main/java`、`src/test/java`）
- 默认的输出目录（`target/`）
- 默认绑定的插件（编译、打包等）

这就是为什么你的最小 pom.xml 啥插件都没写，`mvn package` 还能编译打包——**因为这些插件在 Super POM 里默认绑定了**。

#### 2. 继承链

```
Super POM（Maven 内置）
    ▲
    │ 隐式继承
    │
你的 pom.xml（或父 pom → 子 pom）
```

---

### 六、Effective POM：最终生效的 POM

你的 pom.xml 看起来很短，但**真正生效的 POM** 是合并了 Super POM、父 POM、当前 POM 后的「**最终版**」——这叫 **Effective POM**。

```bash
# 查看最终生效的完整 POM
mvn help:effective-pom
```

你会看到几百行的输出，里面包含了编译插件、资源插件、打包插件的完整配置——这些都是从 Super POM 继承来的。

> 💡 **提示：** 遇到「明明没配却生效了某插件/某配置」的疑惑，用 `mvn help:effective-pom` 查 Effective POM，真相大白。

#### IDEA 查看 Effective POM

打开 `pom.xml`，底部切到 **「Effective POM」** 标签页，可视化查看。

---

### 七、各标签之间的关系图

```
pom.xml
  │
  ├── 项目身份 ──── groupId / artifactId / version / packaging
  │                  （唯一标识项目）
  │
  ├── 继承关系 ──── parent（指向父 pom）
  │                  ↓ 父 pom 的配置会继承下来
  │
  ├── 属性定义 ──── properties（定义变量，供其他地方 ${} 引用）
  │                  ↓
  ├── 依赖管理 ──── dependencyManagement（只管版本，不真正引入）
  │                  ↓ 约束下面 dependencies 的版本
  ├── 依赖声明 ──── dependencies（真正引入的 jar）
  │
  ├── 构建配置 ──── build
  │                  ├── finalName / outputDirectory（输出相关）
  │                  ├── resources（资源文件）
  │                  ├── plugins（插件：编译/测试/打包...）
  │                  └── pluginManagement（插件版本管理）
  │
  ├── 仓库配置 ──── repositories（下载源）
  │                  distributionManagement（发布目标）
  │
  ├── 多环境 ────── profiles（不同环境不同配置）
  │
  └── 聚合 ──────── modules（声明子模块，用于聚合构建）
```

**关键关系**：

- `properties` 定义变量，`dependencies` / `plugins` 用 `${变量}` 引用 → **版本集中管理**
- `dependencyManagement` 约束 `dependencies` 的版本 → **多模块统一版本**
- `parent` 让子 pom 继承父 pom 的上述所有配置 → **减少重复**
- `modules` 让父项目能一键构建所有子模块 → **聚合**

---

### 八、必填项 vs 可选 总表

| 标签 | 是否必须 | 不配会怎样 |
| --- | --- | --- |
| `modelVersion` | ✅ 必须 | — |
| `groupId` | ✅ 必须（继承父 pom 时可省） | 无法定位项目 |
| `artifactId` | ✅ 必须 | 无法定位项目 |
| `version` | ✅ 必须（继承父 pom 时可省） | 无法定位项目 |
| `packaging` | ❌ 可选 | 默认 `jar` |
| `name` / `description` | ❌ 可选 | 只是描述信息 |
| `properties` | ❌ 可选 | 无属性可引用 |
| `dependencies` | ❌ 可选 | 项目没有第三方依赖（极少） |
| `dependencyManagement` | ❌ 可选 | 版本各自声明 |
| `build` | ❌ 可选 | 用默认构建配置 |
| `plugins` | ❌ 可选 | 用 Super POM 默认插件 |
| `repositories` | ❌ 可选 | 用中央仓库 |
| `distributionManagement` | ❌ 可选 | 不能 `mvn deploy` |
| `profiles` | ❌ 可选 | 无多环境支持 |
| `parent` | ❌ 可选 | 不继承父项目 |
| `modules` | ❌ 可选 | 不聚合子模块 |

> 💡 **提示：** 严格来说**只有 `modelVersion`、`groupId`、`artifactId`、`version` 四项必须**（且继承父 pom 时 GAV 还能省略）。但实际项目里 `properties`、`dependencies`、`build`+`plugins` 几乎是标配。

---

### 九、XML 头部那些是什么（新手常问）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
```

| 部分 | 含义 |
| --- | --- |
| `<?xml ...?>` | XML 声明，固定写法 |
| `xmlns="..."` | 默认命名空间，指明这是 Maven 4.0.0 的 POM |
| `xmlns:xsi` | 引入 XML Schema 实例命名空间 |
| `xsi:schemaLocation` | 指向 POM 的 XSD 校验文件（IDEA 靠它做标签提示） |

照抄即可，不用深究。

---

### 十、常见问题与注意事项

#### 1. pom.xml 标签顺序报错

Maven 对顶层标签的**顺序没有强制要求**（XSD 里是 `all` 类型），但**约定俗成的顺序**是：`modelVersion → parent → groupId → ... → dependencies → build → ...`。IDEA 会自动整理。

#### 2. 改了 pom.xml 不生效

右键 `pom.xml → Maven → Reload Project`，或点 Maven 面板刷新按钮。

#### 3. 某个配置不知道从哪来的

用 `mvn help:effective-pom` 看 Effective POM，定位是继承来的还是 Super POM 默认的。

#### 4. XML 报红「Element xxx is not allowed here」

标签写错位置或拼错。对照 [[#二、pom.xml 整体结构（全景图）]] 检查标签层级，或看 IDEA 的 XSD 提示。

#### 5. VitePress 构建报错 `Element is missing end tag`

如果 pom.xml 内容写进 markdown 文档，**不要在正文裸写 `<dependencies>`**，要用反引号包成 `` `<dependencies>` `` 或放进代码块。详见项目 CLAUDE.md。

---

### 十一、总结

| 要点 | 说明 |
| --- | --- |
| pom.xml 是什么 | Maven 项目的核心配置文件 |
| 必须项 | `modelVersion`（4.0.0）+ GAV（继承时可省） |
| 最小 pom | modelVersion + groupId + artifactId + version |
| Super POM | Maven 内置，提供默认仓库、目录、插件 |
| Effective POM | 合并后的最终生效 POM，用 `mvn help:effective-pom` 查看 |
| 核心标签 | 坐标、properties、dependencies、build+plugins、profiles、parent、modules |

理解了全局结构，接下来逐个深入：

- 项目身份怎么配 → [[项目坐标配置]]
- 属性怎么定义和使用 → [[properties属性配置]]
- 依赖怎么写 → [[dependencies依赖配置]]
- 版本怎么统一管 → [[dependencyManagement配置]]
- 构建和插件 → [[build构建配置]] / [[plugins插件配置]]

系列导航：[[../README]]。
