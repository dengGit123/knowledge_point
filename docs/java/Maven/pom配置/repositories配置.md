### 一、概述

> 📖 [Repositories（仓库）参考](https://maven.apache.org/pom.html#Repositories) ｜ [DistributionManagement 参考](https://maven.apache.org/pom.html#Distribution_Management)

`repositories` 用来配置「**从哪里下载依赖**」，`distributionManagement` 用来配置「**把构建产物发布到哪里**」。一个是「进货」，一个是「出货」。

大白话：`repositories` 是项目的「**进货渠道**」——告诉 Maven 除了中央仓库，还能去哪些仓库（公司私服等）拉 jar；`distributionManagement` 是「**出货渠道**」——`mvn deploy` 时把打好的 jar 发到哪个仓库。

| 你将学到 | 说明 |
| --- | --- |
| `repositories` | 配置下载仓库 |
| `repository` 子标签 | id/url/releases/snapshots |
| `pluginRepositories` | 插件下载仓库 |
| `distributionManagement` | 发布配置（deploy 用） |

> 💡 **提示：** 加速下载一般配在 `settings.xml` 的镜像里（[[../仓库与镜像]]），仓库地址一般配在 `settings.xml` 或父 pom。本篇讲 `pom.xml` 里这两个标签的写法。

---

### 二、`repositories`：下载仓库

#### 基本结构

```xml
<repositories>
    <repository>
        <id>company-nexus</id>                            <!-- 唯一标识 -->
        <name>公司私服</name>                              <!-- 描述 -->
        <url>http://nexus.company.com/repository/public/</url>  <!-- 仓库地址 -->

        <releases>
            <enabled>true</enabled>                       <!-- 允许下载 release 版 -->
            <updatePolicy>always</updatePolicy>           <!-- 更新策略 -->
            <checksumPolicy>warn</checksumPolicy>         <!-- 校验失败策略 -->
        </releases>

        <snapshots>
            <enabled>true</enabled>                       <!-- 允许下载 snapshot 版 -->
            <updatePolicy>always</updatePolicy>
        </snapshots>
    </repository>
</repositories>
```

#### `repository` 各子标签

| 子标签 | 含义 | 常用值 |
| --- | --- | --- |
| `id` | 仓库唯一标识（要全局唯一） | `company-nexus` |
| `name` | 描述名 | `公司私服` |
| `url` | 仓库地址 | `http://...` |
| `releases.enabled` | 是否下载 release | `true`/`false` |
| `snapshots.enabled` | 是否下载 snapshot | `true`/`false` |
| `updatePolicy` | 更新检查频率 | `always`/`daily`/`never`/`interval:60` |
| `checksumPolicy` | 校验和失败处理 | `fail`/`warn`/`ignore` |
| `layout` | 仓库布局（一般不用改） | `default` |

#### `updatePolicy` 取值

| 值 | 含义 |
| --- | --- |
| `always` | 每次构建都检查更新 |
| `daily`（默认） | 每天检查一次 |
| `never` | 从不检查（只用本地缓存） |
| `interval:X` | 每 X 分钟检查一次 |

> 💡 **提示：** 想立即拉最新的 SNAPSHOT，命令行加 `-U` 强制更新，不用改 `updatePolicy`。

---

### 三、`releases` 和 `snapshots` 为什么分开配

一个仓库可以分别决定「是否提供 release」和「是否提供 snapshot」：

```xml
<repository>
    <id>company-public</id>
    <url>http://nexus.company.com/repository/public/</url>
    <releases>
        <enabled>true</enabled>      <!-- 这个仓库有 release -->
    </releases>
    <snapshots>
        <enabled>true</enabled>      <!-- 这个仓库也有 snapshot -->
    </snapshots>
</repository>

<repository>
    <id>central</id>
    <url>https://repo1.maven.org/maven2/</url>
    <releases>
        <enabled>true</enabled>      <!-- 中央仓库只有 release -->
    </releases>
    <snapshots>
        <enabled>false</enabled>     <!-- 中央仓库没有 snapshot -->
    </snapshots>
</repository>
```

> 💡 **提示：** 公司私服一般用 Nexus 的 **group 仓库**，一个地址同时包含 release 和 snapshot，所以两个都设 `enabled=true`。

---

### 四、`pluginRepositories`：插件下载仓库

插件也需要从仓库下载。`pluginRepositories` 配置**插件下载仓库**，结构和 `repositories` 一样：

```xml
<pluginRepositories>
    <pluginRepository>
        <id>company-plugins</id>
        <url>http://nexus.company.com/repository/public/</url>
        <releases><enabled>true</enabled></releases>
        <snapshots><enabled>true</enabled></snapshots>
    </pluginRepository>
</pluginRepositories>
```

> 💡 **提示：** 大多数情况，插件和普通依赖用同一个仓库，所以 `pluginRepositories` 和 `repositories` 配相同的地址。

---

### 五、`distributionManagement`：发布配置（deploy）

`mvn deploy` 时把打好的 jar 发到远程仓库，靠 `distributionManagement` 配置：

```xml
<distributionManagement>
    <!-- release 版发布到这里 -->
    <repository>
        <id>company-releases</id>
        <url>http://nexus.company.com/repository/maven-releases/</url>
    </repository>

    <!-- snapshot 版发布到这里 -->
    <snapshotRepository>
        <id>company-snapshots</id>
        <url>http://nexus.company.com/repository/maven-snapshots/</url>
    </snapshotRepository>

    <!-- 项目站点文档发布到这里（mvn site:deploy） -->
    <site>
        <id>company-site</id>
        <url>scp://site.company.com/path/</url>
    </site>
</distributionManagement>
```

| 子标签 | 含义 |
| --- | --- |
| `repository` | release 版发布仓库 |
| `snapshotRepository` | snapshot 版发布仓库 |
| `site` | 站点文档发布位置（少用） |

#### release 和 snapshot 为什么分两个仓库

| 仓库类型 | 放什么 | 特点 |
| --- | --- | --- |
| release 仓库 | 正式发布版 | **不可变**，同版本号不能重复上传 |
| snapshot 仓库 | 开发快照版 | **可变**，同版本号可反复上传覆盖 |

> 💡 **提示：** Nexus 默认 release 仓库**不允许覆盖上传**（同版本号第二次 deploy 会报错）。snapshot 仓库允许覆盖。这强制你遵循「release 不变、snapshot 可变」的规范。

#### 认证：发布需要账号密码

`distributionManagement` 里只配 `id` 和 `url`，**账号密码配在 `settings.xml` 的 `servers`**，靠 `id` 关联：

```xml
<!-- settings.xml -->
<servers>
    <server>
        <id>company-releases</id>          <!-- 必须和上面 repository 的 id 一致 -->
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

详见 [[../settings配置]] 和 [[../仓库与镜像]]。

---

### 六、完整实战示例（公司私服）

```xml
<!-- 父 pom.xml 配置公司私服（继承给所有子模块） -->
<repositories>
    <repository>
        <id>company-public</id>
        <url>http://nexus.company.com/repository/maven-public/</url>
        <releases><enabled>true</enabled></releases>
        <snapshots><enabled>true</enabled></snapshots>
    </repository>
</repositories>

<distributionManagement>
    <repository>
        <id>company-releases</id>
        <url>http://nexus.company.com/repository/maven-releases/</url>
    </repository>
    <snapshotRepository>
        <id>company-snapshots</id>
        <url>http://nexus.company.com/repository/maven-snapshots/</url>
    </snapshotRepository>
</distributionManagement>
```

```xml
<!-- settings.xml 配认证 -->
<servers>
    <server>
        <id>company-releases</id>
        <username>${env.NEXUS_USER}</username>
        <password>${env.NEXUS_PASS}</password>
    </server>
    <server>
        <id>company-snapshots</id>
        <username>${env.NEXUS_USER}</username>
        <password>${env.NEXUS_PASS}</password>
    </server>
</servers>
```

---

### 七、是否必须配置

| 标签 | 是否必须 | 说明 |
| --- | --- | --- |
| `repositories` | ❌ 可选 | 不配则用中央仓库（+settings 的镜像） |
| `pluginRepositories` | ❌ 可选 | 同上 |
| `distributionManagement` | ❌ 可选 | 不配则不能 `mvn deploy`（只到 install） |

> 💡 **提示：** 配中央仓库加速用 settings.xml 的 **镜像（mirror）** 更省事；配**公司私服**才需要在 pom 写 `repositories`；要**发布 jar** 必须配 `distributionManagement`。

---

### 八、常见问题与注意事项

#### 1. 私服 jar 下不下来

- `repositories` 的 `url` 写错
- `settings.xml` 的 `mirrorOf=*` 把私服也拦截了（改成 `central`）
- 私服里真没有这个 jar

#### 2. `deploy` 报 401/403（认证失败）

`settings.xml` 的 `server.id` 和 `distributionManagement` 的 `repository.id` **不一致**。严格对齐。

#### 3. `deploy` 报「release 仓库不允许覆盖」

release 版本号已存在，不能重复上传。要么改版本号，要么删私服里旧的。

#### 4. `deploy` 没反应、没上传

检查版本号：带 `-SNAPSHOT` 的会发到 `snapshotRepository`，不带的发到 `repository`。两个配反了会发错地方。

#### 5. 多个仓库都有同一个 jar

Maven 按 `repositories` 里**声明的顺序**依次找，先找到的用。调整顺序改变优先级。

---

### 九、总结

| 要点 | 说明 |
| --- | --- |
| `repositories` | 配置下载仓库（进货） |
| `repository` 子标签 | id/url + releases/snapshots |
| `pluginRepositories` | 插件下载仓库 |
| `distributionManagement` | 发布仓库（出货），deploy 用 |
| release vs snapshot 仓库 | release 不可覆盖，snapshot 可覆盖 |
| 认证 | `settings.xml` 的 `servers`，靠 id 关联 |

相关文档：[[../仓库与镜像]]、[[../settings配置]]、[[pom总览]]、[[../多模块/父模块]]。

系列导航：[[../README]]。
