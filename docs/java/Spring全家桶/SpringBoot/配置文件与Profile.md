### 一、概述

> 📖 [Spring Boot - Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)

Spring Boot 把所有可配置项集中到**配置文件**里，做到「**改配置不用改代码**」。配合 **Profile** 机制，还能轻松管理开发、测试、生产多套环境。

大白话：配置文件是项目的「**遥控器**」——数据库地址、端口、各种开关，都在这里调，不用动代码。Profile 则像「**频道**」——切到「dev 频道」就是开发配置，切到「prod 频道」就是生产配置。

| 你将学到 | 说明 |
| --- | --- |
| 配置文件格式 | `properties` vs `yml` |
| 读取配置 | `@Value` 与 `@ConfigurationProperties` |
| 多环境 | Profile 切换 dev/test/prod |
| 配置优先级 | 谁覆盖谁 |

> 📌 配合 [[SpringBoot入门]] 阅读。

---

### 二、两种配置文件格式

Spring Boot 默认找 `application.properties` 或 `application.yml`（放在 `src/main/resources/`）。

#### `properties` 格式（扁平）

```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/test
spring.datasource.username=root
spring.datasource.password=123456
```

#### `yml` 格式（层级，推荐 ⭐）

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/test
    username: root
    password: 123456
```

| 对比 | `properties` | `yml` |
| --- | --- | --- |
| 结构 | 扁平，重复前缀多 | **层级清晰**，减少重复 |
| 数据类型 | 纯字符串 | 支持列表、Map、布尔等 |
| 可读性 | 一般 | **好**（推荐） |
| 注意点 | — | **冒号后必须有空格**；对缩进敏感 |

> ⚠️ **注意：** yml 里 `key: value` 的冒号后**必须有一个空格**，写成 `port:8080` 会报错。层级靠**缩进**表达，统一用空格（别混 Tab）。

---

### 三、常用配置项示例

```yaml
server:
  port: 8080                    # 服务端口
  servlet:
    context-path: /api          # 接口统一前缀

spring:
  datasource:                   # 数据源
    url: jdbc:mysql://localhost:3306/test?useSSL=false
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:                          # JPA
    hibernate:
      ddl-auto: update
    show-sql: true

logging:                        # 日志
  level:
    com.example: debug          # 指定包的日志级别
    root: info
```

> 💡 **提示：** 所有可配置项都在官方文档的 [Common Application Properties](https://docs.spring.io/spring-boot/docs/current/reference/html/application-properties.html) 列出，有上百项，按需查阅。

---

### 四、读取配置的两种方式

#### 1. `@Value`（单个值，简单场景）

```java
@Component
public class SmsService {

    @Value("${sms.appkey}")           // 读 sms.appkey
    private String appKey;

    @Value("${sms.timeout:3000}")     // 冒号后是默认值：没配就用 3000
    private int timeout;
}
```

#### 2. `@ConfigurationProperties`（批量绑定，推荐 ⭐）

把一组配置绑定到一个 POJO，适合参数多的场景：

```yaml
sms:
  appkey: abc123
  timeout: 3000
  sign-name: 我的系统
```

```java
@Component
@ConfigurationProperties(prefix = "sms")   // 绑定 sms.* 开头的配置
public class SmsProperties {
    private String appkey;
    private int timeout;
    private String signName;   // 配置里的 sign-name 自动映射到 signName（松散绑定）

    // 必须有 getter/setter
    public String getAppkey() { return appkey; }
    public void setAppkey(String appkey) { this.appkey = appkey; }
    // ... 其他 getter/setter
}
```

| 对比 | `@Value` | `@ConfigurationProperties` |
| --- | --- | --- |
| 适用 | 单个值 | **一组相关配置** |
| 松散绑定 | 不支持（名字要精确） | 支持（`sign-name` ↔ `signName`） |
| 校验 | 不支持 | 支持（配合 `@Validated`） |
| 推荐 | 临时、零散的值 | 结构化配置 |

> 💡 **提示：** 「松散绑定」指 `sign-name`、`signName`、`SIGN_NAME` 都能映射到 `signName` 属性，配置写法更随意（仅 `@ConfigurationProperties` 支持）。

---

### 五、配置占位符与默认值

配置值里可以引用其他配置项，或给默认值：

```properties
app.name=MyApp
app.description=${app.name} 是一个很棒的系统    # 引用其他配置

# 默认值语法：${key:默认值}
sms.timeout=${sms.timeout:5000}                  # sms.timeout 没配就用 5000
```

---

### 六、多环境 Profile（核心功能）

实际开发有 dev/test/prod 多套环境，数据库、端口都不同。Profile 让你**用一份代码切多套配置**。

#### 1. 按环境命名文件

```
application.yml           ← 公共配置（所有环境生效）
application-dev.yml       ← 开发环境
application-test.yml      ← 测试环境
application-prod.yml      ← 生产环境
```

#### 2. 激活某个环境

```yaml
# application.yml
spring:
  profiles:
    active: dev    # 激活 dev 环境，加载 application-dev.yml
```

也可用命令行参数激活（**优先级最高**，常用于生产）：

```bash
java -jar app.jar --spring.profiles.active=prod
```

#### 3. 用 `@Profile` 控制 Bean 按环境加载

```java
@Configuration
public class DataSourceConfig {

    @Bean
    @Profile("dev")              // 只在 dev 环境创建
    public DataSource devDataSource() {
        return new H2DataSource();
    }

    @Bean
    @Profile("prod")             // 只在 prod 环境创建
    public DataSource prodDataSource() {
        return new MysqlDataSource();
    }
}
```

> 💡 **提示：** 也可以在一个 yml 文件里用 `---` 分隔多段、用 `spring.config.activate.on-profile` 标注（多文档写法），但分文件更清晰，推荐。

---

### 七、配置优先级（谁覆盖谁）

Spring Boot 配置来源很多，**高优先级覆盖低优先级**：

```
① 命令行参数（--xxx=yyy）                     ← 最高
② 环境变量
③ application-{profile}.yml（特定环境）
④ application.yml（公共）                     ← 较低
⑤ 代码里 @PropertySource 指定的文件
```

> ⚠️ **注意：** 生产环境**敏感信息**（数据库密码、密钥）**不要写进 yml 提交到 Git**，应通过**环境变量**或**命令行参数**注入，既安全又利用了高优先级覆盖。

---

### 八、实际应用场景

1. **切换数据库**：dev 用本地 MySQL、prod 用云数据库，靠 Profile 切换。
2. **调日志级别**：dev 开 debug、prod 只保留 info+错误。
3. **第三方密钥注入**：短信、支付密钥用环境变量注入，不落代码库。
4. **功能开关**：用 `@ConditionalOnProperty` 实现「配置里开了才启用某功能」。

---

### 九、常见问题与注意事项

> ⚠️ **注意：**
> - `@Value` 注入的值是**启动时绑定**的，**运行时改配置文件不会自动生效**（除非配合配置中心，见 [[../SpringCloud微服务/配置中心]]）。
> - yml 的**冒号后空格、缩进**是两大常见低级错误。
> - `@ConfigurationProperties` 的类**必须有 setter**（或用 Lombok 的 `@Data`），否则绑定不上。
> - 中文乱码：`properties` 文件默认 ISO-8859-1，中文要转 Unicode 或改用 yml（yml 默认 UTF-8）。

> 💡 **提示：** 推荐用 yml 做主配置文件，结构清晰、支持复杂数据类型。配合 `@ConfigurationProperties` 把配置组织成强类型对象，可读性和可维护性都更好。

---

### 十、总结

- **配置文件**：推荐 `application.yml`，层级清晰。
- **读取**：单个值用 `@Value`，一组值用 `@ConfigurationProperties`。
- **多环境**：`application-{profile}.yml` + `spring.profiles.active` 激活。
- **优先级**：命令行参数 > 环境变量 > profile 配置 > 公共配置。
- **敏感信息**：用环境变量/命令行注入，别提交到代码库。

SpringBoot 子目录完成。下一步进入 Web 开发：[[../SpringMVC/SpringMVC工作原理]]。
