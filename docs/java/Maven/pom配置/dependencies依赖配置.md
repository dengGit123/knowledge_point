### 一、概述

> 📖 [POM Dependencies 参考](https://maven.apache.org/pom.html#Dependencies) ｜ [依赖机制](https://maven.apache.org/guides/introduction/introduction-to-the-dependency-mechanism.html)

`dependencies` 标签用来声明项目**需要哪些第三方 jar**。它是 `pom.xml` 里**最常用、几乎必配**的部分——你写一个 Java 后端项目，不可能不用第三方库。

大白话：`dependencies` 是你的「**购物清单**」——写上「我要 Spring、我要 MySQL 驱动、我要 Lombok」，Maven 就自动去仓库把这些 jar 下回来、配进 classpath。

| 你将学到 | 说明 |
| --- | --- |
| `dependency` 结构 | 每个依赖有哪些子标签 |
| 各子标签含义 | `groupId`/`version`/`scope`/`exclusions` 等 |
| 是否必须 | 哪些子标签可省 |
| 实战示例 | 各种场景的依赖声明 |

> 💡 **提示：** 依赖的**范围（scope）、传递、冲突**等原理已在 [[../坐标与依赖]] 讲透。本篇聚焦 `pom.xml` 里 `dependency` 标签**怎么写**。

---

### 二、`dependencies` 与 `dependency` 的结构

```xml
<dependencies>              <!-- 依赖列表（复数，容器） -->
    <dependency>            <!-- 一个依赖 -->
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
        <version>6.1.5</version>
        <scope>compile</scope>
        <type>jar</type>
        <optional>false</optional>
        <exclusions>
            <exclusion>...</exclusion>
        </exclusions>
    </dependency>
    <!-- 更多 dependency... -->
</dependencies>
```

- `dependencies`：容器，里面放多个 `dependency`
- `dependency`：一个具体的依赖

---

### 三、`dependency` 各子标签详解

| 子标签 | 含义 | 是否必须 |
| --- | --- | --- |
| `groupId` | 依赖的组织 | ✅ 必须 |
| `artifactId` | 依赖的项目名 | ✅ 必须 |
| `version` | 依赖的版本 | ⚠️ 通常必须（`dependencyManagement` 管控时可省） |
| `scope` | 依赖范围 | ❌ 可选（默认 `compile`） |
| `type` | 依赖类型 | ❌ 可选（默认 `jar`） |
| `classifier` | 分类器（同一版本的不同构建） | ❌ 可选 |
| `optional` | 是否可选（不传递） | ❌ 可选（默认 `false`） |
| `exclusions` | 排除传递依赖 | ❌ 可选 |
| `systemPath` | scope=system 时指定本地 jar 路径 | ⚠️ 仅 system 时用 |

---

### 四、基本依赖声明

```xml
<dependencies>
    <!-- Spring 核心 -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
        <version>6.1.5</version>
    </dependency>

    <!-- JUnit（测试用） -->
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>4.13.2</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

> 💡 **提示：** 不写 `scope` 默认就是 `compile`（主程序、测试、打包都用）。

---

### 五、`scope`：依赖范围

scope 决定依赖「在哪些阶段有效、是否传递」。详见 [[../坐标与依赖]]，这里给速查表：

| scope | 主程序 | 测试 | 打包 | 典型 |
| --- | --- | --- | --- | --- |
| `compile`（默认） | ✅ | ✅ | ✅ | Spring |
| `test` | ❌ | ✅ | ❌ | JUnit |
| `provided` | ✅ | ✅ | ❌ | Servlet API、Lombok |
| `runtime` | ❌ | ✅ | ✅ | JDBC 驱动 |
| `system` | ✅ | ✅ | ❌ | 本地 jar |

```xml
<!-- Servlet API：运行时 Tomcat 提供，不打包 -->
<dependency>
    <groupId>jakarta.servlet</groupId>
    <artifactId>jakarta.servlet-api</artifactId>
    <version>6.0.0</version>
    <scope>provided</scope>
</dependency>

<!-- MySQL 驱动：编译不需要，运行时反射加载 -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.33</version>
    <scope>runtime</scope>
</dependency>
```

---

### 六、`version`：什么时候能省略

| 情况 | version 能否省 |
| --- | --- |
| 普通 `dependencies` 里的依赖 | ❌ 必须写 |
| 父 pom 的 `dependencyManagement` 管控了该依赖 | ✅ 可省（自动继承父版本） |
| 引入了 BOM（import scope） | ✅ 可省 |

```xml
<!-- 父 pom 的 dependencyManagement 定义了版本 -->
<!-- 子 pom 这里可省略 version -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-core</artifactId>
    <!-- 不写 version，继承父 pom 的 -->
</dependency>
```

详见 [[dependencyManagement配置]]。

> 💡 **提示：** 在父 pom 用 `dependencyManagement` + `properties` 统一版本，子 pom 只写 `groupId` + `artifactId`，是最规范的写法。

---

### 七、`exclusions`：排除传递依赖

某个依赖带进来的传递依赖你不想要（版本冲突、有漏洞、不需要），用 `exclusions` 排除：

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-core</artifactId>
    <version>6.1.5</version>
    <exclusions>
        <!-- 排除 spring-core 带过来的 spring-jcl -->
        <exclusion>
            <groupId>org.springframework</groupId>
            <artifactId>spring-jcl</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

#### 经典场景：排除 Spring 的 commons-logging（改用 slf4j）

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>6.1.5</version>
    <exclusions>
        <!-- 排除 Spring 自带的日志门面 -->
        <exclusion>
            <groupId>commons-logging</groupId>
            <artifactId>commons-logging</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

> ⚠️ **注意：** `exclusion` 里**只写 `groupId` + `artifactId`，不写 `version`**——因为排除是按坐标匹配的，不区分版本。

---

### 八、`optional`：可选依赖

```xml
<!-- 在被依赖的项目里声明：我这个依赖是可选的 -->
<dependency>
    <groupId>com.example</groupId>
    <artifactId>some-feature</artifactId>
    <version>1.0.0</version>
    <optional>true</optional>   <!-- 别人依赖我时，这个不传递 -->
</dependency>
```

| 对比 | `optional=true` | `exclusions` |
| --- | --- | --- |
| 谁控制 | 被依赖方（提供方） | 依赖方（使用方） |
| 目的 | 「这功能可选，要就自己加」 | 「我不要你带过来的某个 jar」 |

详见 [[../坐标与依赖]] 的「可选依赖」。

---

### 九、`type` 和 `classifier`

#### `type`：依赖类型

默认 `jar`。少数情况用 `war`、`ejb`、`test-jar` 等：

```xml
<!-- 引入某个项目的测试工具包 -->
<dependency>
    <groupId>com.example</groupId>
    <artifactId>my-test-utils</artifactId>
    <version>1.0.0</version>
    <type>test-jar</type>      <!-- 引入测试 jar -->
    <scope>test</scope>
</dependency>
```

#### `classifier`：分类器

同一版本、不同构建产物用 classifier 区分，如 `sources`（源码）、`javadoc`（文档）、`jdk17`（特定 JDK）：

```xml
<!-- 引入某个 jar 的源码包（IDEA 能关联源码） -->
<dependency>
    <groupId>com.example</groupId>
    <artifactId>some-lib</artifactId>
    <version>1.0.0</version>
    <classifier>sources</classifier>
</dependency>
```

> 💡 **提示：** `type` 和 `classifier` 平时很少用，了解即可。大多数依赖只配 GAV + scope。

---

### 十、`system` scope 和 `systemPath`（少用）

引入**本地手动管理的 jar**（不在仓库里）：

```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>local-lib</artifactId>
    <version>1.0.0</version>
    <scope>system</scope>
    <systemPath>${project.basedir}/lib/local-lib.jar</systemPath>
</dependency>
```

> ⚠️ **注意：** **强烈不推荐**用 `systemPath`——它破坏了 Maven 的依赖管理，jar 路径硬编码，团队协作、CI 构建都会出问题。正确做法是把第三方 jar **安装到本地仓库**或上传到私服：

```bash
# 把本地 jar 装进本地仓库，之后正常用 GAV 引用
mvn install:install-file -Dfile=local-lib.jar -DgroupId=com.example \
    -DartifactId=local-lib -Dversion=1.0.0 -Dpackaging=jar
```

---

### 十一、完整实战示例

```xml
<dependencies>
    <!-- ① Spring（compile） -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>${spring.version}</version>
        <exclusions>
            <exclusion>
                <groupId>commons-logging</groupId>
                <artifactId>commons-logging</artifactId>
            </exclusion>
        </exclusions>
    </dependency>

    <!-- ② Servlet API（provided） -->
    <dependency>
        <groupId>jakarta.servlet</groupId>
        <artifactId>jakarta.servlet-api</artifactId>
        <version>6.0.0</version>
        <scope>provided</scope>
    </dependency>

    <!-- ③ MySQL 驱动（runtime） -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.33</version>
        <scope>runtime</scope>
    </dependency>

    <!-- ④ Lombok（provided，编译期用） -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <version>1.18.30</version>
        <scope>provided</scope>
    </dependency>

    <!-- ⑤ 测试（test） -->
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>${junit.version}</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

---

### 十二、常见问题与注意事项

#### 1. 依赖版本冲突

多个依赖引入同一 jar 不同版本。用 `mvn dependency:tree` 排查，用 `exclusions` 排除，或用 [[dependencyManagement配置]] 统一版本。

#### 2. 找不到依赖（`Could not resolve`）

- 坐标写错，到 [MVNRepository](https://mvnrepository.com/) 核对
- 仓库里没有，配镜像或私服
- 本地仓库 jar 损坏，删除重新下载

#### 3. 编译通过，运行报 `ClassNotFoundException`

scope 配错（如把运行时需要的配成了 `provided` 或 `test`）。

#### 4. 打包后体积过大

检查是否有不必要的依赖被 `compile` scope 打进包。`provided` 的不会打包。

#### 5. 循环依赖

模块 A 依赖 B，B 又依赖 A，Maven 会报错。重新设计模块边界，抽取公共模块。

---

### 十三、总结

| 要点 | 说明 |
| --- | --- |
| 结构 | `dependencies` 容器 → 多个 `dependency` |
| 必须 | `groupId` + `artifactId`（version 通常也必须） |
| scope | 控制有效范围：compile/test/provided/runtime |
| version 省略条件 | 父 pom 的 `dependencyManagement` 或 BOM 管控时可省 |
| exclusions | 排除传递依赖（只写 groupId + artifactId） |
| optional | 标记可选，不向下游传递 |

相关文档：[[../坐标与依赖]]、[[dependencyManagement配置]]、[[properties属性配置]]、[[pom总览]]。

系列导航：[[../README]]。
