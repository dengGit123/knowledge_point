### 一、概述

> 📖 [Properties（属性）参考](https://maven.apache.org/pom.html#Properties)

`properties` 是 `pom.xml` 里定义「**变量**」的地方。定义后，可以在 pom 的其他位置用 `${变量名}` 引用。最常见的用途是**集中管理版本号**——改一处，处处生效。

大白话：`properties` 就像项目里的「**常量定义区**」。你把「Spring 版本 = 6.1.5」定义成一个变量 `spring.version`，后面所有用到 Spring 版本的地方写 `${spring.version}`。哪天要升级，只改 `properties` 里那一处就行。

| 你将学到 | 说明 |
| --- | --- |
| 自定义属性 | 怎么定义和引用变量 |
| 内置属性 | `${project.version}` 等自带变量 |
| 系统/环境变量 | Java 系统属性、环境变量 |
| 集中管理版本 | 最经典的实战用法 |

---

### 二、自定义属性（最常用）

#### 1. 定义

在 `properties` 标签里，**一个子标签就是一个变量**，标签名是变量名，内容是变量值：

```xml
<properties>
    <!-- 定义一个变量 spring.version，值为 6.1.5 -->
    <spring.version>6.1.5</spring.version>
    <java.version>17</java.version>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
</properties>
```

#### 2. 引用

用 `${变量名}` 引用：

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-core</artifactId>
    <version>${spring.version}</version>   <!-- 引用变量 -->
</dependency>

<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>${spring.version}</version>   <!-- 同一个变量，保证版本一致 -->
</dependency>
```

> 💡 **提示：** 变量名常用「`模块.版本`」的形式（如 `spring.version`、`junit.version`），点号 `.` 是允许的，语义更清晰。

---

### 三、最经典用法：集中管理版本号

多依赖用同一版本时，用 `properties` 集中管理，**升级只改一处**：

```xml
<properties>
    <spring.version>6.1.5</spring.version>
    <junit.version>4.13.2</junit.version>
    <mybatis.version>3.5.16</mybatis.version>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
</properties>

<dependencies>
    <!-- 所有 Spring 依赖用 ${spring.version}，版本统一 -->
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-core</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-context</artifactId>
        <version>${spring.version}</version>
    </dependency>
    <dependency>
        <groupId>org.springframework</groupId>
        <artifactId>spring-web</artifactId>
        <version>${spring.version}</version>
    </dependency>

    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
        <version>${junit.version}</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

升级 Spring 时，**只改 `spring.version` 一处**，所有依赖同步更新。

> ⭐ **最佳实践：所有版本号都提取到 `properties`，不在 `<version>` 里写死字面量。** 这样版本一目了然、便于升级。

---

### 四、内置属性（Maven 自带变量）

Maven 预定义了一组变量，不用自己定义就能用：

| 变量 | 含义 | 示例值 |
| --- | --- | --- |
| `${project.version}` | 项目版本 | `1.0.0` |
| `${project.groupId}` | 项目 groupId | `com.example` |
| `${project.artifactId}` | 项目 artifactId | `my-project` |
| `${project.name}` | 项目 name | `My Project` |
| `${project.basedir}` | 项目根目录（pom.xml 所在目录） | `/path/to/project` |
| `${project.build.sourceDirectory}` | 源码目录 | `src/main/java` |
| `${project.build.directory}` | 构建输出目录 | `target` |
| `${project.build.outputDirectory}` | 编译输出目录 | `target/classes` |
| `${project.build.finalName}` | 最终包名（不含扩展名） | `my-project-1.0.0` |

```xml
<!-- 比如在插件里引用源码目录 -->
<sourceDirectory>${project.build.sourceDirectory}</sourceDirectory>
```

---

### 五、特殊属性：编译相关的约定变量

有些 `properties` 变量会被 Maven 的**默认编译插件**识别，不用显式配插件就能控制编译行为：

```xml
<properties>
    <!-- 控制 javac -source 和 -target（编译版本） -->
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>

    <!-- 源码编码（影响 javac -encoding） -->
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>

    <!-- 报告输出编码 -->
    <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
</properties>
```

> 💡 **提示：** 这几个是 Maven 约定的「**隐式插件配置**」——`maven.compiler.source` 等同于在 `compiler` 插件里配 `<source>17</source>`。所以**指定 JDK 版本最简单的方式**就是配这两个属性，不必手写 compiler 插件。

---

### 六、系统属性和环境变量

#### 1. Java 系统属性

`${系统属性名}`，如：

```xml
${user.home}          <!-- 用户主目录 -->
${java.version}       <!-- Java 版本 -->
${java.io.tmpdir}     <!-- 临时目录 -->
```

#### 2. 环境变量

`${env.变量名}`：

```xml
${env.JAVA_HOME}      <!-- JAVA_HOME 环境变量 -->
${env.PATH}           <!-- PATH -->
```

#### 3. settings.xml 里的属性

`settings.xml` 的 profile 里定义的属性，也能在 pom 里引用：

```xml
<!-- settings.xml -->
<profiles>
    <profile>
        <id>dev</id>
        <properties>
            <db.url>jdbc:mysql://localhost/dev</db.url>
        </properties>
    </profile>
</profiles>
```

```xml
<!-- pom.xml 引用 -->
<url>${db.url}</url>
```

---

### 七、属性优先级

当一个变量名在多处都有定义，优先级从高到低：

```
1. 命令行 -D（最高）   mvn install -Dspring.version=6.1.6
2. pom.xml 的 properties
3. 父 pom 的 properties
4. settings.xml 的 profile 属性
5. Java 系统属性
6. 环境变量
```

> 💡 **提示：** 用 `mvn -D变量名=值` 可以**临时覆盖** pom 里的属性，调试时很有用。

---

### 八、多模块项目的属性继承

父 pom 定义的 `properties`，子 pom **自动继承**，不用重复定义：

```xml
<!-- 父 pom.xml -->
<properties>
    <spring.version>6.1.5</spring.version>   <!-- 子模块都能用 ${spring.version} -->
</properties>
```

```xml
<!-- 子 pom.xml：直接用，不用再定义 -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-core</artifactId>
    <version>${spring.version}</version>
</dependency>
```

> ⭐ **这就是多模块项目统一版本的根基**：父 pom 的 `properties` + `dependencyManagement` 配合，实现「一处定义，处处生效」。详见 [[../多模块/父模块]]。

---

### 九、常见问题与注意事项

#### 1. 变量名写错不报错

`${spring.version}` 拼错了（如 `${spring.verson}`），Maven **不会报错，而是原样保留**这个字符串，导致版本变成字面量 `spring.verson`。检查拼写。

#### 2. 属性值含特殊字符

属性值里有 `:`、`/` 等是合法的（如 URL），但 `${}` 嵌套要小心。

#### 3. 改了 properties 没生效

`Reload Project`。有些属性（如 `maven.compiler.source`）改完要重新编译才看到效果。

#### 4. 编译报错 `invalid target release: 17`

`maven.compiler.source/target` 配了 17，但实际用的 JDK 是低版本。检查 `JAVA_HOME` 和 IDEA 的 Project SDK。

#### 5. 属性值被父 pom 覆盖

子 pom 想覆盖父 pom 的属性，直接在子 pom 的 `properties` 里重定义即可（子优先于父）。

---

### 十、总结

| 要点 | 说明 |
| --- | --- |
| properties 作用 | 定义变量，用 `${}` 引用 |
| 最经典用法 | 集中管理版本号，升级只改一处 |
| 内置属性 | `${project.version}`、`${project.basedir}` 等 |
| 编译约定变量 | `maven.compiler.source/target` 控制 JDK 版本 |
| 优先级 | 命令行 -D > pom > 父 pom > settings > 系统属性 |
| 多模块 | 父 pom 的 properties 子模块继承 |

相关文档：[[dependencies依赖配置]]、[[dependencyManagement配置]]、[[../多模块/父模块]]。

系列导航：[[../README]]。
