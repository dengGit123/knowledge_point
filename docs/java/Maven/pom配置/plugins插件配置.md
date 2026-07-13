### 一、概述

> 📖 [Plugins（插件）参考](https://maven.apache.org/pom.html#Plugins) ｜ [生命周期与插件绑定](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)

Maven 的**插件（Plugin）是真正干活的工具**。生命周期规定了「步骤」，插件负责「执行」。编译、跑测试、打包、生成源码、打可执行 jar……全是插件完成的。本篇讲怎么在 `pom.xml` 里配置插件。

大白话：**插件就是流水线上的「工人」**。生命周期（phase）是工位编号，插件 goal 是工人在工位上干的活。你通过 `plugins` 标签「**雇佣工人、给他们派活**」。

| 你将学到 | 说明 |
| --- | --- |
| `plugin` 结构 | 坐标、配置、执行 |
| `configuration` | 给插件传参数 |
| `executions` | 把 goal 绑定到生命周期 |
| `pluginManagement` | 插件版本管理（类似 dependencyManagement） |
| 常用插件 | compiler / surefire / source / shade 等 |

> 💡 **提示：** Maven 自带的 Super POM 已经默认绑定了一组核心插件（编译、测试、打包），所以不配插件也能构建。配插件通常是为了「**自定义参数**」或「**加新功能**」。

---

### 二、`plugin` 的基本结构

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>   <!-- 插件组织 -->
            <artifactId>maven-compiler-plugin</artifactId> <!-- 插件名 -->
            <version>3.13.0</version>                      <!-- 版本 -->
            <configuration>...</configuration>             <!-- 配置参数 -->
            <executions>...</executions>                   <!-- 执行绑定 -->
            <dependencies>...</dependencies>               <!-- 插件自身依赖 -->
        </plugin>
    </plugins>
</build>
```

| 子标签 | 含义 | 是否必须 |
| --- | --- | --- |
| `groupId` | 插件组织 | ✅ 必须（官方插件 `org.apache.maven.plugins` 可省） |
| `artifactId` | 插件名 | ✅ 必须 |
| `version` | 插件版本 | ⭐ 建议写（不写可能解析不到稳定版本） |
| `configuration` | 插件参数 | ❌ 可选 |
| `executions` | 执行配置（绑生命周期） | ❌ 可选 |
| `dependencies` | 插件依赖 | ❌ 可选 |

---

### 三、`configuration`：给插件传参数

每个插件有自己的一组参数，通过 `configuration` 配置。**参数名对应插件 MOJO（goal）的 setter 方法**。

#### 示例：编译插件指定 JDK 版本

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-compiler-plugin</artifactId>
    <version>3.13.0</version>
    <configuration>
        <source>17</source>          <!-- 等价 javac -source 17 -->
        <target>17</target>          <!-- 等价 javac -target 17 -->
        <encoding>UTF-8</encoding>   <!-- 源码编码 -->
    </configuration>
</plugin>
```

> 💡 **提示：** 这个插件配置等价于在 `properties` 里写 `maven.compiler.source=17`、`maven.compiler.target=17`（[[properties属性配置]] 介绍过）。两者是同一件事的两种写法，**用 properties 更简洁**。

#### `configuration` 的参数怎么查

每个插件的参数不同，去插件的官方文档查。比如 `maven-compiler-plugin` 的参数在 [它的文档](https://maven.apache.org/plugins/maven-compiler-plugin/compile-mojo.html)。

---

### 四、`executions`：绑定 goal 到生命周期（重要）

有些插件的 goal **不会自动绑定**到生命周期，需要你手动用 `executions` 声明「在哪个 phase 执行它」。

#### 示例：打 jar 时同时生成源码包

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-source-plugin</artifactId>
    <version>3.3.1</version>
    <executions>
        <execution>
            <id>attach-sources</id>                 <!-- 本次执行的 id -->
            <phase>package</phase>                  <!-- 绑定到 package 阶段 -->
            <goals>
                <goal>jar-no-fork</goal>            <!-- 执行 source 插件的 jar-no-fork 目标 -->
            </goals>
        </execution>
    </executions>
</plugin>
```

效果：执行 `mvn package` 时，自动调用 `maven-source-plugin` 的 `jar-no-fork`，生成源码 jar。

#### `execution` 的子标签

| 子标签 | 含义 |
| --- | --- |
| `id` | 本次执行的唯一标识 |
| `phase` | 绑定到哪个生命周期阶段 |
| `goals` | 执行插件的哪些 goal |
| `configuration` | 本次执行专属的配置（覆盖全局 configuration） |

> 💡 **提示：** 一个插件可以有多 `execution`，分别绑不同 phase、执行不同 goal。比如 `maven-antrun-plugin` 可以在不同阶段跑不同 Ant 任务。

#### 绑定的本质

```
mvn package
   └─ 执行 package 阶段（及之前的所有 phase）
        └─ package 阶段绑定的 goal：
              ├── maven-jar-plugin:jar        （Super POM 默认）
              └── maven-source-plugin:jar-no-fork  （你用 executions 加的）
```

---

### 五、`pluginManagement`：插件版本管理

和 `dependencyManagement` 类似，`pluginManagement` 只**声明插件的版本和默认配置**，**不真正激活**。子模块要用时只写坐标，版本自动继承。

#### 父 pom 声明（不激活）

```xml
<build>
    <pluginManagement>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.13.0</version>
                <configuration>
                    <source>17</source>
                    <target>17</target>
                </configuration>
            </plugin>
        </plugins>
    </pluginManagement>
</build>
```

#### 子 pom 激活（不写版本）

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-compiler-plugin</artifactId>
            <!-- 不写 version 和 configuration，继承父 pom 的 -->
        </plugin>
    </plugins>
</build>
```

> 💡 **提示：** 多模块项目用 `pluginManagement` 统一插件版本，是标准做法。详见 [[../多模块/父模块]]。

---

### 六、Super POM 默认绑定的插件（不用配就有）

下面这些插件在 Super POM 里**默认绑定**，所以你啥都不配，`mvn package` 也能编译、测试、打包：

| 生命周期 phase | 默认绑定的插件 | 干的活 |
| --- | --- | --- |
| `process-resources` | `maven-resources-plugin:resources` | 复制资源文件 |
| `compile` | `maven-compiler-plugin:compile` | 编译主程序 |
| `process-test-resources` | `maven-resources-plugin:testResources` | 复制测试资源 |
| `test-compile` | `maven-compiler-plugin:testCompile` | 编译测试代码 |
| `test` | `maven-surefire-plugin:test` | 跑单元测试 |
| `package` | `maven-jar-plugin:jar`（jar 项目） | 打包 |

> 💡 **提示：** 理解这点很重要——**你配的 compiler 插件，其实是覆盖了 Super POM 的默认 compiler 插件**，给它加了自定义参数。用 `mvn help:effective-pom` 能看到完整的默认绑定。

---

### 七、常用插件速查

| 插件 | 作用 | 常用场景 |
| --- | --- | --- |
| `maven-compiler-plugin` | 编译 Java | 指定 JDK 版本、编码 |
| `maven-surefire-plugin` | 跑单元测试 | 配置测试、跳过规则 |
| `maven-jar-plugin` | 打 jar | 指定 manifest、排除文件 |
| `maven-war-plugin` | 打 war | Web 项目打包 |
| `maven-source-plugin` | 打源码 jar | 发布时附源码 |
| `maven-javadoc-plugin` | 生成/打 javadoc | 发布时附文档 |
| `maven-shade-plugin` | 打可执行 fat jar | 把依赖打进一个 jar |
| `maven-assembly-plugin` | 自定义打包 | 打 zip、含依赖的完整包 |
| `maven-resources-plugin` | 处理资源文件 | 变量替换 |
| `maven-install-plugin` | 装到本地仓库 | （默认绑定，很少手配） |
| `maven-deploy-plugin` | 发布到远程仓库 | （默认绑定，很少手配） |
| `maven-clean-plugin` | 清理 target | （默认绑定） |
| `maven-enforcer-plugin` | 构建规则检查 | 强制 JDK 版本、依赖版本 |
| `tomcat7-maven-plugin` | 嵌入式 Tomcat | `mvn tomcat7:run` 启动 Web 项目 |
| `spring-boot-maven-plugin` | Spring Boot 打包 | 打可执行 jar/war |

---

### 八、经典插件配置示例

#### 1. 编译插件（指定 JDK 版本）

```xml
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
```

#### 2. 打包时附源码和 javadoc（发布到中央仓库常见）

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-source-plugin</artifactId>
    <version>3.3.1</version>
    <executions>
        <execution>
            <id>attach-sources</id>
            <phase>package</phase>
            <goals><goal>jar-no-fork</goal></goals>
        </execution>
    </executions>
</plugin>

<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-javadoc-plugin</artifactId>
    <version>3.6.3</version>
    <executions>
        <execution>
            <id>attach-javadocs</id>
            <phase>package</phase>
            <goals><goal>jar</goal></goals>
        </execution>
    </executions>
</plugin>
```

#### 3. Spring Boot 打包插件（打可执行 jar）

```xml
<plugin>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-maven-plugin</artifactId>
    <version>3.2.0</version>
    <executions>
        <execution>
            <goals>
                <goal>repackage</goal>   <!-- 把依赖打进 jar -->
            </goals>
        </execution>
    </executions>
</plugin>
```

#### 4. 打可执行 fat jar（shade 插件）

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-shade-plugin</artifactId>
    <version>3.5.2</version>
    <executions>
        <execution>
            <phase>package</phase>
            <goals><goal>shade</goal></goals>
            <configuration>
                <transformers>
                    <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                        <mainClass>com.example.Main</mainClass>   <!-- 主类 -->
                    </transformer>
                </transformers>
            </configuration>
        </execution>
    </executions>
</plugin>
```

---

### 九、是否必须配置

| 场景 | 是否要配 plugins |
| --- | --- |
| 最简单的 jar 项目 | ❌ 不配也能编译打包（Super POM 默认插件） |
| 指定 JDK 版本 | ⭐ 配 compiler 或用 properties |
| 打源码/javadoc 包 | ✅ 配 source/javadoc 插件 |
| 打可执行 jar | ✅ 配 shade 或 spring-boot 插件 |
| 自定义打包 | ✅ 配 assembly 插件 |
| 多模块统一插件版本 | ⭐ 父 pom 配 pluginManagement |

> 💡 **提示：** 指定 JDK 版本用 `properties`（`maven.compiler.source/target`）比配 compiler 插件更简洁，两者等价。

---

### 十、常见问题与注意事项

#### 1. 插件配置不生效

- `Reload Project`
- `mvn help:effective-pom` 查看插件是否被正确合并
- 检查 `executions` 的 `phase` 拼写

#### 2. 插件版本不写导致构建不稳定

不写 `version`，Maven 会尝试解析最新版本，可能不同时间构建结果不同。**固定写版本号**。

#### 3. `configuration` 参数没效果

参数名可能拼错（区分大小写），或参数属于特定 goal。查插件文档对应 goal 的参数列表。

#### 4. 插件 goal 不自动执行

有些 goal 没默认绑定到生命周期（如 `source:jar`），要用 `executions` 手动绑，或命令行直接调 `mvn source:jar`。

#### 5. 多模块插件重复配置

用 `pluginManagement` 在父 pom 统一配，子模块只声明使用。

---

### 十一、总结

| 要点 | 说明 |
| --- | --- |
| 插件作用 | 真正执行构建任务 |
| `configuration` | 给插件传参数 |
| `executions` | 把 goal 绑定到生命周期 phase |
| `pluginManagement` | 插件版本管理（父 pom 声明，子 pom 继承） |
| 默认插件 | Super POM 默认绑定 compiler/surefire/jar 等 |
| 指定 JDK | 用 properties 最简洁，等价于 compiler 插件 |

相关文档：[[build构建配置]]、[[../生命周期与命令]]、[[properties属性配置]]、[[../多模块/父模块]]。

系列导航：[[../README]]。
