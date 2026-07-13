### 一、Maven 系列导读

> 📖 [Maven 官方文档](https://maven.apache.org/index.html) ｜ [POM Reference](https://maven.apache.org/pom.html) ｜ [Maven in 5 Minutes](https://maven.apache.org/guides/getting-started/maven-in-five-minutes.html)

Maven 是 Java 生态里**最主流的构建工具和项目管理工具**。它用一份 `pom.xml` 描述项目，自动完成「**下载依赖 → 编译 → 测试 → 打包 → 发布**」全流程。

本系列文档按「**先理解概念，再吃透 `pom.xml`，最后玩转多模块**」的顺序组织，每篇聚焦一个知识点。

---

### 二、文档地图

#### 📦 基础篇（先读这几篇，建立整体认知）

| 文档 | 核心知识点 |
| --- | --- |
| [[Maven概述]] | Maven 是什么、为什么用它、核心概念、安装、标准目录结构 |
| [[坐标与依赖]] | GAV 坐标、依赖范围（scope）、传递依赖、依赖冲突解决 |
| [[生命周期与命令]] | 三大生命周期、phase、goal、`mvn` 常用命令 |
| [[仓库与镜像]] | 本地仓库、中央仓库、私服、镜像（mirror） |
| [[settings配置]] | `settings.xml` 全局配置详解 |

#### 🧩 pom.xml 配置篇（逐个标签吃透，重点）

`pom.xml` 是 Maven 的「**灵魂**」——所有配置都在这里。本篇把 `pom.xml` 的每个标签拆成单独文档，讲清「**作用、怎么写、是否必须、与其他标签的关系**」。

| 文档 | 对应标签 | 是否必须 |
| --- | --- | --- |
| [[pom配置/pom总览]] | `pom.xml` 整体结构、Super POM、Effective POM | — |
| [[pom配置/项目坐标配置]] | `groupId` / `artifactId` / `version` / `packaging` | ⭐ 必须 |
| [[pom配置/properties属性配置]] | `properties` | 可选 |
| [[pom配置/dependencies依赖配置]] | `dependencies` / `dependency` | 几乎必用 |
| [[pom配置/dependencyManagement配置]] | `dependencyManagement` | 多模块必用 |
| [[pom配置/build构建配置]] | `build`（目录、资源、finalName） | 常用 |
| [[pom配置/plugins插件配置]] | `plugins` / `plugin` | 几乎必用 |
| [[pom配置/repositories配置]] | `repositories` / `distributionManagement` | 可选 |
| [[pom配置/profiles配置]] | `profiles`（多环境构建） | 可选 |
| [[pom配置/modules配置]] | `modules`（聚合） | 多模块必用 |

#### 🏗️ 多模块篇（企业项目必学）

| 文档 | 核心知识点 |
| --- | --- |
| [[多模块/父模块]] | 父 POM 怎么定义、`packaging = pom` |
| [[多模块/子模块]] | 子模块怎么继承父 POM、`relativePath` |
| [[多模块/聚合与继承]] | 聚合与继承的区别和联系 |
| [[多模块/多模块实战]] | 从零搭建完整多模块项目 + 注意事项 |

---

### 三、推荐学习路径

```
新手入门路线
│
├─ 1. Maven概述        ← 先搞懂 Maven 到底在干嘛
├─ 2. 生命周期与命令   ← 学会 mvn clean install 这种命令
├─ 3. 坐标与依赖       ← 理解 jar 包是怎么来的
├─ 4. 仓库与镜像       ← 理解 jar 包存在哪、怎么加速下载
│
   能用 Maven 构建-single 项目后 ↓
│
├─ 5. pom总览          ← 建立 pom.xml 全局视野
├─ 6. 逐个标签         ← 坐标 → properties → dependencies → plugins ...
│
   能看懂任何 pom.xml 后 ↓
│
└─ 7. 多模块篇         ← 企业级项目的标配
```

> 💡 **提示：** 如果只读一篇，读 [[Maven概述]]；如果只想速查某个标签，直接看「pom.xml 配置篇」对应文档。

---

### 四、一张图看懂 Maven 全貌

```
                    你的项目 pom.xml
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
      依赖管理         生命周期         插件机制
     (dependencies)    (lifecycle)      (plugins)
          │               │               │
          │      clean / default / site   │
          │               │               │
          ▼               ▼               ▼
       从仓库拉 jar ──► 触发 phase ──► 执行插件 goal
          │
   ┌──────┴──────┬──────────┐
   ▼             ▼          ▼
 本地仓库     中央仓库     私服(Nexus)
(.m2)     (Maven Central)  (公司内部)
```

---

### 五、术语速查

| 术语 | 含义 |
| --- | --- |
| **POM** | Project Object Model，项目对象模型，就是 `pom.xml` |
| **坐标（Coordinate）** | `groupId:artifactId:version`，唯一确定一个 jar |
| **GAV** | GroupId、ArtifactId、Version 三者的缩写 |
| **依赖（Dependency）** | 项目要用到的第三方 jar |
| **仓库（Repository）** | 存放 jar 包的地方 |
| **生命周期（Lifecycle）** | 一组有序的构建阶段（phase），如 compile → test → package |
| **插件（Plugin）** | 真正干活的工具，每个 phase 绑定插件的 goal |
| **goal** | 插件里一个具体的任务，如 `compiler:compile` |
| **Snapshot** | 快照版本，开发中可变，Maven 会自动拉最新 |
| **Release** | 发布版本，不可变，定了就不再变 |

---

### 六、总结

| 要点 | 说明 |
| --- | --- |
| Maven 干什么 | 自动管理依赖 + 标准化构建流程 |
| 核心配置文件 | `pom.xml`（项目级）+ `settings.xml`（全局级） |
| 三大核心机制 | 坐标与依赖、生命周期、插件 |
| 学习重点 | 先会用命令 → 再吃透 `pom.xml` → 最后玩转多模块 |

下一篇：[[Maven概述]]。
