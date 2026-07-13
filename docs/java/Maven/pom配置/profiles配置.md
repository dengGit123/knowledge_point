### 一、概述

> 📖 [Profiles（构建配置文件）参考](https://maven.apache.org/guides/introduction/introduction-to-profiles.html)

`profiles` 用来实现「**多环境构建**」——同一份代码，在不同环境（开发/测试/生产）用不同的配置（数据库地址、资源文件等），通过**激活不同的 profile** 来切换。

大白话：`profile` 就是「**预设套餐**」。你准备「开发套餐」「测试套餐」「生产套餐」，每个套餐有不同的数据库地址、不同的依赖。打包时指定要哪个套餐（`mvn package -Pprod`），Maven 就用那套配置。

| 你将学到 | 说明 |
| --- | --- |
| `profile` 结构 | 一个 profile 能配什么 |
| `activation` | 怎么自动/手动激活 profile |
| 命令行激活 | `-P` 参数 |
| 实战 | 多环境打包（dev/test/prod） |

---

### 二、什么是 profile，解决什么问题

#### 没有 profile 的痛点

```
开发环境：数据库 localhost:3306
测试环境：数据库 192.168.1.100:3306
生产环境：数据库 prod-db:3306
```

如果都写死在 `application.yml` 里，每次切环境都要改文件、重新打包——**容易出错、容易把生产配置带到开发环境**。

#### 用 profile 解决

定义三个 profile（dev/test/prod），各自持有自己的数据库配置。打包时用 `-P` 指定，**自动切换**：

```bash
mvn package -Pdev      # 打开发包
mvn package -Ptest     # 打测试包
mvn package -Pprod     # 打生产包
```

---

### 三、`profile` 的结构

一个 profile 可以包含 `pom.xml` 里几乎所有可变配置：

```xml
<profiles>
    <profile>
        <id>dev</id>                        <!-- profile 唯一标识 -->

        <activation>                        <!-- 激活条件 -->
            <activeByDefault>true</activeByDefault>
        </activation>

        <!-- profile 里可以配这些（和 pom 顶层一样） -->
        <properties>...</properties>         <!-- 属性 -->
        <dependencies>...</dependencies>     <!-- 依赖 -->
        <dependencyManagement>...</dependencyManagement>
        <build>...</build>                   <!-- 构建配置 -->
        <repositories>...</repositories>     <!-- 仓库 -->
        <distributionManagement>...</distributionManagement>
        <modules>...</modules>
        <reporting>...</reporting>
    </profile>
</profiles>
```

> 💡 **提示：** profile 本质是「**一份可选的 pom 片段**」，激活时它的内容会**合并**进 pom 生效。

---

### 四、`activation`：激活条件

profile 可以「**自动激活**」（满足条件）或「**手动激活**」（`-P`）。`activation` 配自动激活的条件。

#### 1. 默认激活

```xml
<profile>
    <id>dev</id>
    <activation>
        <activeByDefault>true</activeByDefault>   <!-- 没指定其他 profile 时，默认激活 dev -->
    </activation>
</profile>
```

#### 2. 按 JDK 版本激活

```xml
<activation>
    <jdk>17</jdk>                       <!-- JDK 17 时激活 -->
    <!-- <jdk>[1.8,17)</jdk> -->        <!-- 也支持范围：1.8 到 17 之间 -->
</activation>
```

#### 3. 按操作系统激活

```xml
<activation>
    <os>
        <name>Windows 10</name>
        <family>Windows</family>        <!-- windows/unix/mac -->
        <arch>x86_64</arch>
    </os>
</activation>
```

#### 4. 按系统属性激活

```xml
<activation>
    <property>
        <name>env</name>                <!-- 当存在 -Denv=prod 属性时激活 -->
        <value>prod</value>
    </property>
</activation>
```

```bash
mvn package -Denv=prod    # 命令行传属性，激活对应 profile
```

#### 5. 按文件存在性激活

```xml
<activation>
    <file>
        <exists>${basedir}/prod.flag</exists>    <!-- 存在 prod.flag 文件时激活 -->
        <missing>${basedir}/dev.flag</missing>   <!-- 不存在 dev.flag 时激活 -->
    </file>
</activation>
```

---

### 五、手动激活 profile（`-P`）

用命令行 `-P` 指定激活哪个 profile：

```bash
mvn package -Pdev                # 激活 dev profile
mvn package -Pprod               # 激活 prod profile
mvn package -Pdev,test           # 同时激活多个（逗号分隔）
mvn package -P!dev               # 激活 dev 之外的（感叹号排除）
```

也可以在 `settings.xml` 里默认激活（对所有项目生效）：

```xml
<activeProfiles>
    <activeProfile>dev</activeProfile>
</activeProfiles>
```

---

### 六、实战：多环境打包（最经典用法）

#### 1. 定义属性（各环境不同）

```xml
<profiles>
    <!-- 开发环境 -->
    <profile>
        <id>dev</id>
        <activation>
            <activeByDefault>true</activeByDefault>   <!-- 默认开发环境 -->
        </activation>
        <properties>
            <env>dev</env>
            <jdbc.url>jdbc:mysql://localhost:3306/dev_db</jdbc.url>
            <jdbc.username>root</jdbc.username>
            <jdbc.password>123456</jdbc.password>
        </properties>
    </profile>

    <!-- 测试环境 -->
    <profile>
        <id>test</id>
        <properties>
            <env>test</env>
            <jdbc.url>jdbc:mysql://192.168.1.100:3306/test_db</jdbc.url>
            <jdbc.username>test_user</jdbc.username>
            <jdbc.password>test_pass</jdbc.password>
        </properties>
    </profile>

    <!-- 生产环境 -->
    <profile>
        <id>prod</id>
        <properties>
            <env>prod</env>
            <jdbc.url>jdbc:mysql://prod-db:3306/prod_db</jdbc.url>
            <jdbc.username>prod_user</jdbc.username>
            <jdbc.password>prod_pass</jdbc.password>
        </properties>
    </profile>
</profiles>
```

#### 2. 资源文件里用变量

`src/main/resources/jdbc.properties`：

```properties
env=${env}
url=${jdbc.url}
username=${jdbc.username}
password=${jdbc.password}
```

#### 3. 开启资源过滤

```xml
<build>
    <resources>
        <resource>
            <directory>src/main/resources</directory>
            <filtering>true</filtering>     <!-- 开启变量替换 -->
        </resource>
    </resources>
</build>
```

#### 4. 按环境打包

```bash
mvn clean package -Pdev      # jdbc.properties 里是 localhost 配置
mvn clean package -Ptest     # 是测试环境配置
mvn clean package -Pprod     # 是生产环境配置
```

> 💡 **提示：** 这是「**编译时替换**」的方案。Spring Boot 更推荐用 `application-{profile}.yml` 在**运行时**切换（`java -jar app.jar --spring.profiles.active=prod`），打包一次到处运行。

---

### 七、profile 里配依赖、插件

profile 不仅能配属性，还能配依赖、插件、仓库——在不同环境用不同的：

```xml
<profile>
    <id>dev</id>
    <dependencies>
        <!-- 开发环境用 H2 内存数据库 -->
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <!-- 开发环境开启热部署插件 -->
            <plugin>...</plugin>
        </plugins>
    </build>
</profile>

<profile>
    <id>prod</id>
    <dependencies>
        <!-- 生产环境用 MySQL -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <scope>runtime</scope>
        </dependency>
    </dependencies>
</profile>
```

---

### 八、是否必须配置

| 场景 | 是否必用 profiles |
| --- | --- |
| 单环境简单项目 | ❌ 不用 |
| 多环境（dev/test/prod） | ⭐ 常用 |
| 不同 JDK 版本不同配置 | ✅ 用 |
| 公司项目发布到不同仓库 | ✅ 用 |

> 💡 **提示：** `profiles` 不是语法必须，但**但凡项目要部署到多个环境，几乎都要用**。

---

### 九、常见问题与注意事项

#### 1. 多个 profile 同时激活

`-Pdev,test` 可同时激活，配置会**合并**。如果有同名属性冲突，**声明的 profile 顺序决定**（pom 里靠后的覆盖靠前的，较复杂，建议避免冲突）。

#### 2. `activeByDefault` 失效

一旦你用 `-P` 显式激活了任意 profile，所有 `activeByDefault=true` 的 profile **会被禁用**。这是 Maven 的设计。

#### 3. 怎么看当前激活了哪些 profile

```bash
mvn help:active-profiles    # 查看当前激活的 profile
mvn help:all-profiles       # 查看所有可用 profile
```

#### 4. profile 写在 pom 还是 settings.xml

| 写在哪 | 作用域 | 能配什么 |
| --- | --- | --- |
| **pom.xml** | 项目级（团队共享，提交 Git） | 几乎所有（依赖、插件、属性等） |
| **settings.xml** | 用户/机器级（不提交） | 限 properties、repositories 等，**不能配 dependencies** |

> 💡 **提示：** 项目相关的多环境配在 **pom.xml**（团队统一）；与机器/用户相关的（如私服账号）配在 **settings.xml**。

#### 5. 属性没替换

检查资源是否开了 `filtering=true`，见 [[build构建配置]]。

---

### 十、总结

| 要点 | 说明 |
| --- | --- |
| profile 作用 | 多环境构建，切换不同配置 |
| activation | 自动激活条件（默认/JDK/OS/属性/文件） |
| 手动激活 | `mvn -P<id>`，多个用逗号 |
| profile 内容 | 可配 properties/dependencies/build/repositories 等 |
| 多环境打包 | profile 定义属性 + 资源过滤替换 |
| profile 位置 | 项目相关放 pom，机器相关放 settings |

相关文档：[[build构建配置]]、[[properties属性配置]]、[[../settings配置]]、[[pom总览]]。

系列导航：[[../README]]。
