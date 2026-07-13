### 一、概述

> 📖 [dependencyManagement 参考](https://maven.apache.org/pom.html#Dependency_Management) ｜ [BOM（import scope）](https://maven.apache.org/guides/introduction/introduction-to-dependency-mechanism.html#Importing_Dependencies)

`dependencyManagement` 是**依赖版本管理**的标签。它只**声明版本**，**不真正引入依赖**；真正引入靠 `dependencies`。它是**多模块项目统一版本**的核心机制。

大白话：`dependencyManagement` 像一份「**价目表**」——上面写着「Spring = 6.1.5、MySQL = 8.0.33」。价目表本身**不买东西**，只是个标准。当 `dependencies`（购物清单）里写「我要 Spring」却没写版本时，就**照价目表上的 6.1.5 来**。

| 你将学到 | 说明 |
| --- | --- |
| 作用 | 统一管理依赖版本，但不引入 |
| 与 dependencies 的区别 | 「价目表」vs「购物清单」 |
| 多模块统一版本 | 父 pom 管版本，子 pom 只写坐标 |
| import scope | 引入 BOM（如 Spring BOM） |

---

### 二、`dependencyManagement` vs `dependencies`（核心区别）

| 对比项 | `dependencyManagement` | `dependencies` |
| --- | --- | --- |
| 是否真正引入依赖 | ❌ 否，只声明版本 | ✅ 是，真正引入 |
| 不写会怎样 | 不影响项目依赖 | 项目缺少该 jar |
| 作用 | 版本「标准」「价目表」 | 真正「使用」依赖 |
| 谁来用 | 父 pom 定义，子 pom 受约束 | 直接写需要的依赖 |

> 💡 **提示：** 一句话——**`dependencyManagement` 管「用什么版本」，`dependencies` 管「要不要用」**。

---

### 三、基本用法：声明版本标准

#### 父 pom 定义版本（不引入）

```xml
<!-- 父 pom.xml -->
<dependencyManagement>
    <dependencies>
        <!-- 只声明版本，不真正引入 spring-core -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
            <version>6.1.5</version>
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.33</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

> ⚠️ **注意：** 光在父 pom 的 `dependencyManagement` 里写，**项目里并没有 spring-core**——它没有真正引入。

#### 子 pom 真正引入（不写 version）

```xml
<!-- 子 pom.xml -->
<dependencies>
    <!-- 写在 dependencies 里才是真正引入 -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
        <!-- 不写 version，自动用父 pom dependencyManagement 声明的 6.1.5 -->
    </dependency>
</dependencies>
```

子 pom 只写 `groupId` + `artifactId`，版本由父 pom 的 `dependencyManagement` 决定。

---

### 四、为什么用 `dependencyManagement`（三大好处）

#### 好处一：多模块版本统一

多模块项目里，确保所有子模块用同一版本：

```
父 pom dependencyManagement:  spring = 6.1.5
    ├── 子模块 A: 引入 spring（版本自动是 6.1.5）
    ├── 子模块 B: 引入 spring（版本自动是 6.1.5）
    └── 子模块 C: 引入 spring（版本自动是 6.1.5）
```

升级时，**只改父 pom 一处**，所有子模块同步。

#### 好处二：统一管理传递依赖的版本

`dependencyManagement` **不仅约束直接依赖，也约束传递依赖**。比如 A、B 两个依赖都传递引入了 `commons-logging`，只要在 `dependencyManagement` 里锁定 `commons-logging` 的版本，所有传递引入都会用这个版本，**消除冲突**。

#### 好处三：子模块按需引入

`dependencyManagement` 定义了「**可选依赖清单**」，子模块**按需**在 `dependencies` 里声明要不要——避免了「父 pom 全引、所有子模块都胖」的问题。

---

### 五、配合 `properties` 集中管理版本（最佳实践）

版本号提取到 `properties`，`dependencyManagement` 引用，升级时**只改 properties 一处**：

```xml
<properties>
    <spring.version>6.1.5</spring.version>
    <mysql.version>8.0.33</mysql.version>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-core</artifactId>
            <version>${spring.version}</version>   <!-- 引用属性 -->
        </dependency>
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>${mysql.version}</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

> ⭐ **这是企业项目的标准写法**：`properties`（版本号）+ `dependencyManagement`（版本标准）+ 子 pom `dependencies`（按需引入）。

---

### 六、`import` scope：引入 BOM

BOM（Bill of Materials，物料清单）是一个**只包含 `dependencyManagement` 的特殊 pom**，专门用来统一管理一组相关依赖的版本。用 `import` scope 引入它。

#### 经典场景：引入 Spring BOM

Spring 提供了 `spring-framework-bom`，统一管理所有 Spring 模块的版本：

```xml
<dependencyManagement>
    <dependencies>
        <!-- 引入 Spring 的 BOM，统一所有 Spring 模块版本 -->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-framework-bom</artifactId>
            <version>6.1.5</version>
            <type>pom</type>          <!-- BOM 是 pom 类型 -->
            <scope>import</scope>     <!-- 用 import 引入 -->
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <!-- 现在引入任何 Spring 模块都不用写版本，BOM 已统一 -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
        <!-- 不用写 version -->
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-web</artifactId>
        <!-- 不用写 version -->
    </dependency>
</dependencies>
```

#### 常见的 BOM

| BOM | 作用 |
| --- | --- |
| `spring-framework-bom` | 统一 Spring Framework 各模块版本 |
| `spring-boot-dependencies` | 统一 Spring Boot 全家桶版本 |
| `jackson-bom` | 统一 Jackson 各模块版本 |
| `netflix-bom` | 统一 Netflix OSS 组件版本 |

> 💡 **提示：** Spring Boot 项目不用手动引 BOM，它继承的 `spring-boot-starter-parent` 已经内置了 `spring-boot-dependencies` BOM，所以 Spring Boot 项目里加 starter 都不用写版本。

---

### 七、是否必须配置

| 场景 | 是否必用 |
| --- | --- |
| 单模块小项目 | ❌ 可不用（直接在 dependencies 写 version） |
| 多模块项目 | ⭐ 强烈建议（统一版本） |
| 大型项目 / 企业项目 | ✅ 几乎必须 |
| 引入第三方 BOM（Spring Boot 等） | ✅ 必用 import |

> 💡 **提示：** `dependencyManagement` 不是语法必须，但**多模块项目不用它，版本会乱成一锅粥**。

---

### 八、常见问题与注意事项

#### 1. 写在 `dependencyManagement` 里却没有引入

最常见的误解：以为写了 `dependencyManagement` 就有依赖了。**它只是版本标准，必须在 `dependencies` 里再写一次才真正引入**。

#### 2. 子 pom 想用不同版本

在子 pom 的 `dependencies` 里**显式写 version**，会覆盖 `dependencyManagement` 的版本（子 pom 直接声明的优先级更高）。但不推荐这样做——破坏了统一管理。

#### 3. 多个 BOM 引入同一依赖不同版本

`import` 的顺序决定优先级，**先 import 的赢**。谨慎管理 BOM 引入顺序。

#### 4. `dependencyManagement` 不影响传递依赖的引入

它只「约束版本」，不会让传递依赖凭空出现或消失。传递依赖是否出现取决于 `dependencies` 和 scope 规则。

#### 5. 父 pom 的 `dependencyManagement` 被子 pom 继承

是的，**自动继承**，子 pom 不用重复写 `dependencyManagement`（除非要新增/覆盖）。

---

### 九、总结

| 要点 | 说明 |
| --- | --- |
| 作用 | 声明版本标准，不真正引入依赖 |
| 与 dependencies | 「价目表」vs「购物清单」 |
| 多模块统一版本 | 父 pom 定义，子 pom 只写坐标 |
| import scope | 引入 BOM（如 Spring BOM）统一一组相关依赖版本 |
| 最佳实践 | `properties` + `dependencyManagement` + 子 pom `dependencies` |

相关文档：[[dependencies依赖配置]]、[[properties属性配置]]、[[../多模块/父模块]]、[[../坐标与依赖]]。

系列导航：[[../README]]。
