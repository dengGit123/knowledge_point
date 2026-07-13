### 一、概述

> 📖 [聚合（modules）参考](https://maven.apache.org/guides/introduction/introduction-to-the-pom.html#Project_Inheritance_vs_Project_Aggregation)

`modules` 标签用来实现「**聚合**」——在父项目里声明它包含哪些子模块，从而能**一条命令构建所有子模块**。它是搭建多模块项目的两个核心机制之一（另一个是继承 `parent`）。

大白话：`modules` 是父项目的「**子女名册**」——写上「我有 common、service、web 三个子模块」。然后在父项目执行 `mvn install`，Maven 会**自动把三个子模块一起构建**，按依赖关系排好顺序。

| 你将学到 | 说明 |
| --- | --- |
| `modules` 作用 | 聚合子模块，一键构建 |
| `module` 的值 | 子模块的路径 |
| 聚合 vs 继承 | 两个不同的概念（重点） |
| 构建顺序 | 反应堆自动排序 |

> 💡 **提示：** 「**聚合**」和「**继承**」是两个容易混淆的概念。本篇讲聚合，[[../多模块/聚合与继承]] 会专门对比这两个。

---

### 二、`modules` 的基本写法

```xml
<!-- 父项目 pom.xml -->
<project>
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>my-app</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>          <!-- ⭐ 父项目必须 packaging=pom -->

    <!-- 聚合：声明子模块 -->
    <modules>
        <module>my-app-common</module>
        <module>my-app-service</module>
        <module>my-app-web</module>
    </modules>
</project>
```

#### `module` 的值是「相对路径」

`module` 标签的值是**子模块相对于父项目的路径**：

```xml
<modules>
    <!-- 子模块和父项目同级目录 -->
    <module>my-app-common</module>

    <!-- 子模块在子目录里 -->
    <module>modules/my-app-service</module>

    <!-- 用相对路径回到上一级再进入（子模块和父项目平级） -->
    <module>../my-app-web</module>
</modules>
```

最常见、最规整的结构是**子模块作为父项目的直接子目录**：

```
my-app/                    ← 父项目（packaging=pom）
├── pom.xml                ← 含 <modules>
├── my-app-common/         ← 子模块1
│   └── pom.xml
├── my-app-service/        ← 子模块2
│   └── pom.xml
└── my-app-web/            ← 子模块3
    └── pom.xml
```

---

### 三、聚合的效果：一键构建

在**父项目根目录**执行：

```bash
mvn clean install
```

Maven 会构建一个「**反应堆（Reactor）**」：

1. 扫描父 pom 的 `modules`，找到所有子模块
2. 分析子模块之间的依赖关系
3. **按依赖顺序**依次构建（被依赖的先构建）
4. 全部构建完成

```
mvn clean install（在 my-app/ 根目录）
    │
    ▼ 反应堆分析依赖关系
    │
    ├─ 1. my-app-common    （被其他模块依赖，先构建）
    ├─ 2. my-app-service   （依赖 common，后构建）
    └─ 3. my-app-web       （依赖 service，最后构建）
```

> 💡 **提示：** 你不用关心先 build 哪个——Maven 反应堆自动分析依赖、自动排序。这就是聚合的核心价值：**一条命令，所有模块按正确顺序构建**。

#### 部分构建

```bash
mvn clean install -pl my-app-service          # 只构建 service 模块
mvn clean install -pl my-app-service -am      # 构建 service 及它依赖的（common）
mvn clean install -pl my-app-web -amd         # 构建 web 及依赖它的（service、common）
```

参数含义见 [[../生命周期与命令]]。

---

### 四、聚合的关键：父项目必须是 `packaging=pom`

```xml
<packaging>pom</packaging>
```

聚合项目（父项目）本身**不产出任何制品（不打 jar/war）**，它只是一个「**组织者**」——声明子模块、提供共享配置。所以必须配 `packaging=pom`，告诉 Maven「我这个项目本身不编译打包，只负责组织」。

> ⚠️ **注意：** 父项目如果忘了配 `packaging=pom`，Maven 会尝试编译打包，但父项目通常没有 `src/`，报错。

---

### 五、聚合 vs 继承（初步对比）

这是最容易混淆的点，先建立直觉：

| 概念 | 做什么 | 用什么标签 | 方向 |
| --- | --- | --- | --- |
| **聚合** | 把多个模块**凑一起构建** | 父 pom 写 `modules` | 父 → 子（父知道有哪些子） |
| **继承** | 子模块**复用父 pom 的配置** | 子 pom 写 `parent` | 子 → 父（子知道自己父是谁） |

```
聚合：父 pom 写 <modules>     →  父 → 知道子（为了"一起构建"）
继承：子 pom 写 <parent>      →  子 → 认父（为了"复用配置"）
```

> 💡 **提示：** 聚合和继承是**两个独立**的机制，可以单独使用。但**实际项目里通常同时用**——父 pom 既写 `modules`（聚合），子 pom 也写 `parent`（继承）。详见 [[../多模块/聚合与继承]]。

---

### 六、可以只聚合、不继承吗

**可以**。父项目写 `modules`，但子项目**不写 `parent`**——这种情况下父项目只是「构建组织者」，子模块不继承父的配置。

适用场景：把几个**本来无关**的项目凑在一起批量构建。

```
batch-build/                     ← 聚合项目（packaging=pom）
├── pom.xml                      ← <modules>project-a, project-b</modules>
├── project-a/                   ← 不写 parent，独立项目
│   └── pom.xml
└── project-b/                   ← 不写 parent，独立项目
    └── pom.xml
```

但**大多数情况，聚合和继承是配对出现的**。

---

### 七、完整多模块项目结构示例

#### 父 pom.xml（`my-app/pom.xml`）

```xml
<project>
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>my-app</artifactId>
    <version>1.0.0</version>
    <packaging>pom</packaging>

    <!-- ① 聚合：声明子模块 -->
    <modules>
        <module>my-app-common</module>
        <module>my-app-service</module>
        <module>my-app-web</module>
    </modules>

    <!-- ② 继承：父 pom 的共享配置（子模块继承） -->
    <properties>
        <java.version>17</java.version>
        <spring.version>6.1.5</spring.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>com.example</groupId>
                <artifactId>my-app-common</artifactId>
                <version>${project.version}</version>
            </dependency>
        </dependencies>
    </dependencyManagement>
</project>
```

> 💡 **提示：** 这个父 pom **同时**用了聚合（`modules`）和继承（提供 `properties` / `dependencyManagement` 给子模块）。这是标准多模块项目结构。完整搭建步骤见 [[../多模块/多模块实战]]。

---

### 八、是否必须配置

| 场景 | 是否用 `modules` |
| --- | --- |
| 单模块项目 | ❌ 不用 |
| 多模块项目 | ✅ 必须（否则只能逐个模块手动构建） |
| 批量构建多个项目 | ✅ 用聚合 |

---

### 九、常见问题与注意事项

#### 1. `module` 路径写错

报「Child module xxx does not exist」。`module` 的值是**相对于父 pom 的路径**，仔细核对目录结构。

#### 2. 循环依赖导致反应堆报错

模块 A 依赖 B，B 又依赖 A，Maven 无法排序，报 `Cycle in the dependency graph`。重新设计模块依赖关系。

#### 3. 父项目忘了 `packaging=pom`

父项目尝试编译打包，报错或生成无意义的 jar。聚合/父项目必须 `packaging=pom`。

#### 4. 子模块构建顺序不对

你不用手动排序，反应堆自动按依赖关系排。如果顺序「不对」，通常是依赖声明有问题（子模块没正确依赖它需要的模块）。

#### 5. 只想构建一个模块却全构建了

用 `-pl` 指定模块：`mvn install -pl my-app-service`，详见 [[../生命周期与命令]]。

---

### 十、总结

| 要点 | 说明 |
| --- | --- |
| `modules` 作用 | 聚合子模块，一条命令构建全部 |
| `module` 值 | 子模块相对父项目的路径 |
| 父项目要求 | `packaging=pom` |
| 反应堆 | 自动分析依赖、排序构建 |
| 聚合 vs 继承 | 聚合（父写 modules）vs 继承（子写 parent） |

相关文档：[[../多模块/聚合与继承]]、[[../多模块/父模块]]、[[../多模块/多模块实战]]、[[../生命周期与命令]]。

系列导航：[[../README]]。
