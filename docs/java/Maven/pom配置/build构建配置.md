### 一、概述

> 📖 [Build（构建配置）参考](https://maven.apache.org/pom.html#Build) ｜ [BaseBuild Element](https://maven.apache.org/pom.html#Build_BaseBuild)

`build` 标签是 `pom.xml` 里控制「**怎么构建**」的地方——配置输出目录、最终包名、资源文件处理、插件等。本篇讲 `build` 本身的配置（目录、资源、命名），**插件（plugins）单独有一篇**详解。

大白话：`build` 是项目的「**施工方案**」——告诉 Maven「编译结果放哪、打包叫什么名、配置文件怎么处理、用哪些施工工具（插件）」。

| 你将学到 | 说明 |
| --- | --- |
| `build` 整体结构 | 有哪些子标签 |
| 输出目录 | `directory` / `outputDirectory` / `finalName` |
| 资源文件 | `resources`（配置文件处理） |
| 插件入口 | `plugins` / `pluginManagement`（详见插件篇） |

> 💡 **提示：** 大多数项目 `build` 里**真正需要手配的就是 `finalName` 和 `plugins`**，其他用默认值即可。本篇重点讲前两个，插件见 [[plugins插件配置]]。

---

### 二、`build` 的两种形态

`build` 有两种位置，含义略有不同：

| 位置 | 名称 | 作用 |
| --- | --- | --- |
| `<project><build>` | **Project Build** | 全局构建配置（最常用） |
| `<profile><build>` | **Profile Build** | 特定 profile 激活时的构建配置 |

本文讲 Project Build，两者子标签基本相同。

#### `build` 整体结构

```xml
<build>
    <!-- 输出相关 -->
    <finalName>my-app</finalName>
    <directory>${project.basedir}/target</directory>
    <outputDirectory>${project.build.directory}/classes</outputDirectory>
    <testOutputDirectory>${project.build.directory}/test-classes</testOutputDirectory>

    <!-- 默认执行的目标 -->
    <defaultGoal>install</defaultGoal>

    <!-- 资源文件处理 -->
    <resources>...</resources>
    <testResources>...</testResources>

    <!-- 过滤的属性文件 -->
    <filters>...</filters>

    <!-- 插件配置（重要，单独成篇） -->
    <plugins>...</plugins>
    <pluginManagement>...</pluginManagement>

    <!-- 扩展 -->
    <extensions>...</extensions>
</build>
```

---

### 三、输出目录相关配置

| 标签 | 含义 | 默认值 |
| --- | --- | --- |
| `directory` | 构建输出根目录（`target`） | `${project.basedir}/target` |
| `outputDirectory` | 主程序编译输出（`.class`） | `${project.build.directory}/classes` |
| `testOutputDirectory` | 测试编译输出 | `${project.build.directory}/test-classes` |
| `finalName` | 最终打包文件名（不含扩展名） | `${artifactId}-${version}` |

```xml
<build>
    <!-- 编译输出目录，默认 target，一般不改 -->
    <directory>${project.basedir}/target</directory>

    <!-- 最终包名：默认 my-project-1.0.0.jar -->
    <!-- 改成只叫 my-project.jar（不带版本号） -->
    <finalName>my-project</finalName>
</build>
```

> 💡 **提示：** `directory`、`outputDirectory` 这些默认值符合 Maven 约定，**几乎从不需要改**。**`finalName` 偶尔要改**——比如部署时要求固定文件名（如 `app.jar`）。

#### `finalName` 实战

```xml
<!-- 默认：打包成 my-project-1.0.0.jar -->
<finalName>${project.artifactId}-${project.version}</finalName>

<!-- 部署要求固定名：打包成 app.jar -->
<finalName>app</finalName>

<!-- 加日期（需配合插件，finalName 本身不支持日期函数） -->
<finalName>app-${project.version}</finalName>
```

---

### 四、`defaultGoal`：默认执行目标

```xml
<build>
    <!-- 直接 mvn（不带参数）时，执行 install -->
    <defaultGoal>install</defaultGoal>
</build>
```

不配的话，直接 `mvn` 会报错（没指定要干什么）。配了 `defaultGoal`，光敲 `mvn` 就执行配置的目标。**很少用**。

---

### 五、`resources`：资源文件处理（重要）

#### 1. 什么是资源文件

`src/main/resources/` 下的文件（`application.yml`、`logback.xml`、`mybatis-config.xml` 等）叫「**资源文件**」。它们**不参与编译**，但**会被复制到 classpath**（打进的 jar 里）。

#### 2. Maven 对资源文件的默认行为

- `src/main/resources/` 下的文件 → 复制到 `target/classes/`
- `src/test/resources/` 下的文件 → 复制到 `target/test-classes/`

#### 3. 为什么有时要手动配 `resources`

**场景一：资源文件里要替换变量（filtering）**

比如 `application.yml` 里写 `active: ${spring.profiles.active}`，希望打包时用实际值替换：

```xml
<build>
    <resources>
        <resource>
            <directory>src/main/resources</directory>
            <filtering>true</filtering>   <!-- 开启变量替换 -->
        </resource>
    </resources>
</build>
```

`filtering=true` 后，资源文件里的 `${xxx}` 会被 pom 的 `properties` 值替换。详见后文「资源过滤」。

**场景二：非标准目录的资源**

源码目录（如 `src/main/java`）里除了 `.java` 还有 MyBatis 的 `*.xml` 映射文件，要让 Maven 把这些 xml 也当资源复制：

```xml
<build>
    <resources>
        <!-- 默认资源目录 -->
        <resource>
            <directory>src/main/resources</directory>
        </resource>
        <!-- 额外：src/main/java 下的 xml 也作为资源 -->
        <resource>
            <directory>src/main/java</directory>
            <includes>
                <include>**/*.xml</include>   <!-- 包含所有 xml -->
            </includes>
            <filtering>false</filtering>
        </resource>
    </resources>
</build>
```

> 💡 **提示：** 这是 **MyBatis 项目常见配置**——mapper 接口和 `mapper.xml` 放一起，需要让 xml 也被打包。

#### 4. `resource` 的子标签

| 子标签 | 含义 |
| --- | --- |
| `directory` | 资源目录（必须） |
| `includes` | 包含哪些文件（`**/*.xml`） |
| `excludes` | 排除哪些文件 |
| `filtering` | 是否开启变量替换（默认 `false`） |
| `targetPath` | 复制到 classpath 的哪个子目录（默认根） |

```xml
<resource>
    <directory>src/main/resources</directory>
    <includes>
        <include>**/*.properties</include>   <!-- 只要 properties -->
        <include>**/*.xml</include>
    </includes>
    <excludes>
        <exclude>**/*.dev.properties</exclude>  <!-- 排除 dev 配置 -->
    </excludes>
    <filtering>true</filtering>                 <!-- 开启变量替换 -->
</resource>
```

---

### 六、资源过滤（filtering）详解

开启 `filtering=true` 后，资源文件里的 `${变量名}` 会被替换。

#### 1. 定义变量

```xml
<properties>
    <jdbc.url>jdbc:mysql://localhost:3306/mydb</jdbc.url>
    <jdbc.username>root</jdbc.username>
</properties>
```

#### 2. 资源文件里用变量

`src/main/resources/jdbc.properties`：

```properties
url=${jdbc.url}
username=${jdbc.username}
```

#### 3. 开启 filtering

```xml
<build>
    <resources>
        <resource>
            <directory>src/main/resources</directory>
            <filtering>true</filtering>
        </resource>
    </resources>
</build>
```

打包后，`target/classes/jdbc.properties` 变成：

```properties
url=jdbc:mysql://localhost:3306/mydb
username=root
```

> 💡 **提示：** 配合 [[profiles配置]]，不同环境（dev/test/prod）用不同变量值，实现「**一次打包，多环境部署**」。

---

### 七、`filters`：外部属性文件过滤

除了从 pom 的 `properties` 取值，还能从外部 `.properties` 文件取值：

```xml
<build>
    <filters>
        <!-- 用 db.properties 里的值替换资源文件变量 -->
        <filter>src/main/filters/db.properties</filter>
    </filters>
    <resources>
        <resource>
            <directory>src/main/resources</directory>
            <filtering>true</filtering>
        </resource>
    </resources>
</build>
```

---

### 八、插件相关：`plugins` 和 `pluginManagement`

`build` 里最重要的两个子标签：

```xml
<build>
    <!-- 真正激活、参与构建的插件 -->
    <plugins>
        <plugin>...</plugin>
    </plugins>

    <!-- 只声明版本，子模块按需激活（类似 dependencyManagement） -->
    <pluginManagement>
        <plugins>...</plugins>
    </pluginManagement>
</build>
```

> 💡 **提示：** 插件配置非常丰富，单独成篇。详见 [[plugins插件配置]]。这里只要知道「`build` 里通过 `plugins` 配置插件」即可。

---

### 九、完整 `build` 配置示例

```xml
<build>
    <!-- 最终包名 -->
    <finalName>${project.artifactId}</finalName>

    <!-- 资源处理：开启过滤，额外包含 java 目录下的 xml -->
    <resources>
        <resource>
            <directory>src/main/resources</directory>
            <filtering>true</filtering>
        </resource>
        <resource>
            <directory>src/main/java</directory>
            <includes>
                <include>**/*.xml</include>
            </includes>
        </resource>
    </resources>

    <plugins>
        <!-- 编译插件（指定 JDK 17） -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <version>3.13.0</version>
            <configuration>
                <source>17</source>
                <target>17</target>
                <encoding>UTF-8</encoding>
            </configuration>
        </plugin>

        <!-- 打包插件 -->
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-jar-plugin</artifactId>
            <version>3.4.1</version>
        </plugin>
    </plugins>
</build>
```

---

### 十、常见问题与注意事项

#### 1. `finalName` 改了不生效

检查是不是被 Super POM 或父 pom 的 `finalName` 覆盖；`Reload Project`。

#### 2. MyBatis 的 xml 没打进 jar

mapper.xml 放在 `src/main/java` 下，默认不会作为资源复制。要手动配 `resources`，把 `**/*.xml` 包含进来（见上文场景二）。

#### 3. 资源文件里的 `${}` 没被替换

`filtering` 没设成 `true`。注意：**默认 `filtering=false`**。

#### 4. 改了 `directory` 导致 IDEA 找不到输出

一般不要改 `directory` 和 `outputDirectory`，保持 Maven 默认约定。

#### 5. `resources` 配了反而把默认资源丢了

一旦你显式配了 `<resources>`，**Maven 的默认资源行为会被完全替换**（不是追加）。所以配的时候记得把默认的 `src/main/resources` 也写上。

---

### 十一、总结

| 要点 | 说明 |
| --- | --- |
| `build` 作用 | 配置构建过程（输出、资源、插件） |
| 常用配置 | `finalName`（包名）、`resources`（资源）、`plugins`（插件） |
| 默认不改 | `directory` / `outputDirectory`（保持约定） |
| `resources` | 控制哪些文件作为资源复制到 classpath |
| filtering | 资源文件变量替换，配合 profile 实现多环境 |
| 插件 | `build/plugins` 配置，详见 [[plugins插件配置]] |

相关文档：[[plugins插件配置]]、[[profiles配置]]、[[properties属性配置]]、[[pom总览]]。

系列导航：[[../README]]。
