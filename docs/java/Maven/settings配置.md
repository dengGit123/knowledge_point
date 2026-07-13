### 一、概述

> 📖 [Settings Reference](https://maven.apache.org/settings.html)

`settings.xml` 是 Maven 的**全局配置文件**，用来配置「**和具体项目无关、但和机器/用户有关**」的设置——比如本地仓库位置、镜像、私服账号密码等。

大白话：`pom.xml` 描述「**这个项目怎么样**」，`settings.xml` 描述「**我这台电脑上的 Maven 怎么样**」。一个项目级、一个机器级，互不干扰。

| 你将学到 | 说明 |
| --- | --- |
| settings.xml 的位置 | 全局配置 vs 用户配置 |
| 核心标签 | `localRepository` / `servers` / `mirrors` / `profiles` 等 |
| 实战配置 | 阿里云镜像、私服账号、JDK 版本 |
| settings 与 pom 的区别 | 谁管什么 |

---

### 二、settings.xml 的两个位置

| 位置 | 作用域 | 路径 |
| --- | --- | --- |
| **全局配置** | 本机所有用户共享 | `$MAVEN_HOME/conf/settings.xml` |
| **用户配置** | 当前用户（**优先级更高**） | `~/.m2/settings.xml` |

> 💡 **提示：** 优先级：**用户级 > 全局级**。一般推荐改 `~/.m2/settings.xml`（用户级），不动安装目录的全局配置——这样升级 Maven 时不会丢配置。

#### IDEA 里改了 settings.xml 不生效

`Settings → Build, Execution, Deployment → Build Tools → Maven → User settings file`，勾选 `Override`，指向你的 `settings.xml`，然后 `Reload` 项目。

---

### 三、settings.xml 整体结构

```xml
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
          https://maven.apache.org/xsd/settings-1.0.0.xsd">

    <localRepository/>       <!-- 本地仓库路径 -->
    <interactiveMode/>       <!-- 是否交互模式 -->
    <offline/>               <!-- 是否离线 -->
    <pluginGroups/>          <!-- 插件组（简化插件命令前缀） -->
    <servers/>               <!-- 私服认证（账号密码） -->
    <mirrors/>               <!-- 镜像 -->
    <proxies/>               <!-- 代理 -->
    <profiles/>              <!-- 一组配置（JDK 版本、仓库等） -->
    <activeProfiles/>        <!-- 默认激活的 profile -->

</settings>
```

---

### 四、核心标签详解

#### 1. `localRepository`：本地仓库位置

```xml
<localRepository>D:/maven-repo</localRepository>
```

不配的话默认 `~/.m2/repository`。建议配到空间大的磁盘，因为会越攒越多。

#### 2. `offline`：离线模式

```xml
<offline>false</offline>
```

设为 `true` 后 Maven 不联网，只用本地仓库。适合无网络环境，但本地没有的 jar 会报错。

#### 3. `servers`：私服/仓库认证（账号密码）

发布到私服、或访问受保护仓库时，需要账号密码：

```xml
<servers>
    <server>
        <id>company-releases</id>      <!-- 关键：id 要和 pom.xml 里的仓库 id 一致 -->
        <username>admin</username>
        <password>123456</password>
    </server>
    <server>
        <id>company-snapshots</id>
        <username>admin</username>
        <password>123456</password>
    </server>
</servers>
```

> ⚠️ **注意：** `server` 的 `id` 必须**严格对应** `pom.xml` 里 `<distributionManagement>` 或 `<repositories>` 中仓库的 `id`，否则认证不生效。

> 💡 **提示：** 账号密码明文写在 settings.xml 里不安全。生产环境可用 `${env.MAVEN_USER}` 这种环境变量引用，或用 [Maven 加密](https://maven.apache.org/guides/mini/guide-encryption.html)。

#### 4. `mirrors`：镜像（加速下载）

```xml
<mirrors>
    <mirror>
        <id>aliyun</id>
        <mirrorOf>*</mirrorOf>                  <!-- 拦截哪些仓库 -->
        <name>阿里云公共仓库</name>
        <url>https://maven.aliyun.com/repository/public</url>
    </mirror>
</mirrors>
```

详见 [[仓库与镜像]]。

#### 5. `proxies`：代理

公司网络需要走代理时配置：

```xml
<proxies>
    <proxy>
        <id>my-proxy</id>
        <active>true</active>
        <protocol>http</protocol>
        <host>proxy.company.com</host>
        <port>8080</port>
        <username>user</username>       <!-- 代理不需要认证可不写 -->
        <password>pass</password>
        <nonProxyHosts>localhost|127.0.0.1</nonProxyHosts>  <!-- 不走代理的地址 -->
    </proxy>
</proxies>
```

#### 6. `profiles`：配置组

`settings.xml` 里也能定义 profile，通常用来配置 **JDK 版本**和**默认仓库**：

```xml
<profiles>
    <profile>
        <id>jdk-17</id>
        <activation>
            <activeByDefault>true</activeByDefault>   <!-- 默认激活 -->
            <jdk>17</jdk>                              <!-- JDK 17 时自动激活 -->
        </activation>
        <properties>
            <maven.compiler.source>17</maven.compiler.source>
            <maven.compiler.target>17</maven.compiler.target>
            <maven.compiler.compilerVersion>17</maven.compiler.compilerVersion>
        </properties>
    </profile>
</profiles>
```

> 💡 **提示：** 全局指定编译 JDK 版本，避免每个项目都写。但项目级的 `pom.xml` 配置优先级更高。

#### 7. `activeProfiles`：默认激活的 profile

```xml
<activeProfiles>
    <activeProfile>jdk-17</activeProfile>     <!-- 手动激活 id 为 jdk-17 的 profile -->
</activeProfiles>
```

---

### 五、一份实战 settings.xml 模板

下面是一份**开箱即用**的 `settings.xml`（阿里云镜像 + 本地仓库 + JDK17），新手直接复制：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.2.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.2.0
          https://maven.apache.org/xsd/settings-1.2.0.xsd">

    <!-- ① 本地仓库路径（按需修改） -->
    <localRepository>D:/maven-repo</localRepository>

    <!-- ② 离线模式：false 表示联网 -->
    <offline>false</offline>

    <!-- ③ 阿里云镜像：加速下载 -->
    <mirrors>
        <mirror>
            <id>aliyun-public</id>
            <mirrorOf>*</mirrorOf>
            <name>阿里云公共仓库</name>
            <url>https://maven.aliyun.com/repository/public</url>
        </mirror>
    </mirrors>

    <!-- ④ 默认 JDK 版本 -->
    <profiles>
        <profile>
            <id>jdk-17</id>
            <activation>
                <activeByDefault>true</activeByDefault>
                <jdk>17</jdk>
            </activation>
            <properties>
                <maven.compiler.source>17</maven.compiler.source>
                <maven.compiler.target>17</maven.compiler.target>
                <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
                <project.reporting.outputEncoding>UTF-8</project.reporting.outputEncoding>
            </properties>
        </profile>
    </profiles>

    <!-- ⑤ 公司私服账号（如有） -->
    <!--
    <servers>
        <server>
            <id>company-releases</id>
            <username>admin</username>
            <password>123456</password>
        </server>
    </servers>
    -->

</settings>
```

---

### 六、settings.xml vs pom.xml（区别）

| 对比项 | `settings.xml` | `pom.xml` |
| --- | --- | --- |
| 作用域 | 机器/用户级（全局） | 项目级（单个项目） |
| 配什么 | 本地仓库、镜像、私服账号、代理、全局 JDK | 项目坐标、依赖、插件、打包方式 |
| 提交到 Git？ | ❌ 不提交（含账号密码） | ✅ 提交（团队共享） |
| 优先级 | 用户 settings > 全局 settings | 项目 pom > settings profile |

> 💡 **提示：** 原则——「**和机器/用户有关的放 settings，和项目有关的放 pom**」。镜像、本地仓库、私服账号属于机器级，放 settings；依赖、插件、打包属于项目级，放 pom。

---

### 七、常见问题与注意事项

#### 1. 改了 settings.xml 不生效

- IDEA 里检查 `User settings file` 路径对不对
- 改完要 `Reload Project`
- 命令行确认：`mvn help:effective-settings` 看生效的配置

#### 2. `server` 的 id 没对上

认证失败，检查 `settings.xml` 里 `server.id` 和 `pom.xml` 里仓库/发布的 `id` 是否**完全一致**（区分大小写）。

#### 3. 镜像配了还慢

- `mirrorOf` 写错
- settings.xml 路径不对，根本没被读取
- 加 `-U` 强制更新

#### 4. settings.xml 和 pom.xml 都配了仓库

`pom.xml` 里的优先级**高于** settings.xml 的 profile。但 mirror 的拦截对所有仓库生效（除非 `mirrorOf` 排除）。

#### 5. 账号密码明文不安全

用 Maven 的 [密码加密](https://maven.apache.org/guides/mini/guide-encryption.html) 机制，或用环境变量 / CI 的 secret。

---

### 八、总结

| 要点 | 说明 |
| --- | --- |
| settings.xml 作用 | 机器/用户级全局配置 |
| 位置 | 用户级 `~/.m2/` > 全局级 `$MAVEN_HOME/conf/` |
| 核心标签 | `localRepository` / `servers` / `mirrors` / `profiles` |
| 镜像加速 | `<mirrors>` 配阿里云，`mirrorOf=*` 拦截所有 |
| 私服认证 | `<servers>` 配账号，id 对应 pom 的仓库 id |
| 与 pom 区别 | settings 管机器，pom 管项目 |

相关文档：[[仓库与镜像]]、[[pom配置/profiles配置]]、[[pom配置/repositories配置]]。

系列导航：[[README]]。
