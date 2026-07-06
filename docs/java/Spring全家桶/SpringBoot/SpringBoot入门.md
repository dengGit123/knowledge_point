### 一、概述

> 📖 [Spring Boot Reference Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)

**Spring Boot** 是 Spring 家族的「**快速开发脚手架**」。它不是新框架，而是把 Spring 的使用「自动化」了——让你几分钟就搭起一个能跑的项目，**几乎零 XML 配置**。

大白话：以前用 Spring 像是「**买毛坯房自己装修**」（写一堆 XML、管一堆版本）；Spring Boot 像是「**拎包入住的精装房**」（自动配置好，启动就能用）。

| 解决的痛点 | Spring Boot 怎么做 |
| --- | --- |
| 配置繁琐 | **自动配置**（引入依赖就自动装配 Bean） |
| 依赖版本冲突 | **起步依赖 starter**（一个坐标引入一整套协调好的依赖） |
| 部署麻烦（要装 Tomcat、打 war） | **内嵌 Tomcat**，打成 jar 直接 `java -jar` 跑 |
| 缺乏生产监控 | **Actuator** 提供健康检查、指标监控端点 |

> 📌 本文是 SpringBoot 子目录的入口，后续深入 [[自动配置原理]]、[[配置文件与Profile]]、[[起步依赖]]。

---

### 二、Spring Boot 与 Spring 的关系

很多人会搞混，记住一句话：**Spring Boot 是 Spring 的「封装」，不是替代品。**

| 对比 | 传统 Spring 项目 | Spring Boot 项目 |
| --- | --- | --- |
| 配置方式 | 大量 XML / 注解 | 约定优于配置，自动配置 |
| 依赖管理 | 手动管理版本，易冲突 | starter 统一管理版本 |
| Web 容器 | 需要外部安装 Tomcat，打 war 部署 | 内嵌 Tomcat，打 jar 直接运行 |
| 启动方式 | 部署到容器后启动 | `main` 方法直接启动 |
| 上手成本 | 高 | 低 |

```
Spring Framework（核心引擎：IoC/AOP/事务）
        │
        │  封装 + 自动化 + 内嵌容器 + starter
        ▼
Spring Boot（开箱即用的脚手架）
```

---

### 三、第一个 Spring Boot 项目

#### 1. 引入依赖（pom.xml）

```xml
<!-- ① 继承 spring-boot-starter-parent：统一管理所有版本 -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
</parent>

<dependencies>
    <!-- ② 引入 web starter：自动带来 Spring MVC + 内嵌 Tomcat -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

#### 2. 启动类

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication   // 标记这是 Spring Boot 启动类（包含自动配置 + 组件扫描）
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);  // 启动内嵌 Tomcat 和 Spring 容器
    }
}
```

#### 3. 一个接口

```java
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/hello")
public class HelloController {

    @GetMapping
    public String hello() {
        return "Hello, Spring Boot!";
    }
}
```

#### 4. 运行

启动 `main` 方法，控制台看到 `Tomcat started on port 8080`，浏览器访问 `http://localhost:8080/hello` 即可。

> 💡 **提示：** 就这么几步，一个能响应 HTTP 的项目就跑起来了——这就是 Spring Boot「开箱即用」的威力。

---

### 四、项目结构约定

Spring Boot 推荐的标准结构：

```
my-project/
├── pom.xml
└── src/
    ├── main/
    │   ├── java/
    │   │   └── com/example/
    │   │       ├── Application.java       ← 启动类，建议放根包
    │   │       ├── controller/
    │   │       ├── service/
    │   │       └── dao/
    │   └── resources/
    │       ├── application.yml            ← 默认配置文件
    │       ├── static/                    ← 静态资源
    │       └── templates/                 ← 模板文件（如 Thymeleaf）
    └── test/
```

> ⚠️ **注意：** 启动类**必须放在根包**（如 `com.example`）下。因为 `@SpringBootApplication` 默认扫描「启动类所在包及其子包」。放错位置会导致其他包里的 Bean 扫描不到。

---

### 五、三种启动方式

| 方式 | 命令/操作 | 适用场景 |
| --- | --- | --- |
| IDE 运行 | 直接运行 `main` 方法 | 本地开发调试 |
| Maven 命令 | `mvn spring-boot:run` | 不想用 IDE 时 |
| 打包运行 | `mvn package` 后 `java -jar app.jar` | **生产部署**（最常用） |

打包后得到一个可执行 jar，里面包含了所有依赖和内嵌 Tomcat，**目标机器只要有 JDK 就能跑**，无需安装 Tomcat。

---

### 六、内嵌 Web 容器

Spring Boot 默认内嵌 **Tomcat**，但也支持切换：

| 容器 | 切换方式 | 特点 |
| --- | --- | --- |
| Tomcat（默认） | 引入 `starter-web` 自带 | 最主流 |
| Jetty | 排除 Tomcat，引入 `spring-boot-starter-jetty` | 轻量，长连接友好 |
| Undertow | 排除 Tomcat，引入 `spring-boot-starter-undertow` | 高性能，内存占用低 |

修改端口（`application.yml`）：

```yaml
server:
  port: 9090          # 改端口
  servlet:
    context-path: /api  # 加统一前缀
```

---

### 七、实际应用场景

1. **快速搭建 RESTful API 服务**：前后端分离后端的标准选择。
2. **微服务单体**：Spring Cloud 里每个微服务都是一个 Spring Boot 应用。详见 [[../SpringCloud微服务/微服务架构概述]]。
3. **快速原型开发**：几分钟验证一个想法。
4. **传统 Web 应用**：配合 Thymeleaf 做服务端渲染。

---

### 八、常见问题与注意事项

> ⚠️ **注意：**
> - **端口被占用**：`Port 8080 was already in use`——改 `server.port` 或关掉占用程序。
> - **Bean 找不到**：多半是启动类没放对位置，或忘了加 `@Component`/`@Service`。
> - **依赖版本不兼容**：Spring Boot 3.x 需要 **JDK 17+**，且 javax 包换成了 jakarta（如 `jakarta.servlet`）。用 JDK 8 就选 Boot 2.x。

> 💡 **提示：** Spring Boot 的「自动」很容易让人「知其然不知其所以然」。**理解 [[自动配置原理]] 是进阶的关键**——出问题时才知道怎么排查。

---

### 九、总结

- **Spring Boot = Spring 的快速开发封装**，自动配置 + starter + 内嵌容器。
- **三步上手**：继承 parent + 引入 starter + 写启动类。
- **启动类放根包**，保证组件扫描覆盖全项目。
- **打 jar 部署**，`java -jar` 直接运行，无需外部容器。
- **核心魔法是自动配置**，详见 [[自动配置原理]]。

下一篇，揭开自动配置的黑盒：[[自动配置原理]]。
