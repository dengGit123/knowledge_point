### 一、概述

> 📖 [Spring Data Redis 官方文档](https://docs.spring.io/spring-data/redis/reference/) ｜ [Redis 命令参考](https://redis.io/commands/)

**Spring Data Redis** 是 Spring Data 家族里操作 **Redis** 的子项目。它封装了 Redis 的 Java 客户端（Lettuce / Jedis），让你用统一的 `RedisTemplate` API 操作 Redis 的各种数据结构。

大白话：直接用 Redis 命令行 `set key value`，你得自己管连接、管序列化；Spring Data Redis 提供了 `RedisTemplate`——像操作 Java 集合一样操作 Redis，`opsForValue().set(k, v)` 就存了，还自动帮你处理对象到字节序列的转换。

| 你将学到 | 说明 |
| --- | --- |
| 两种模板 | `RedisTemplate` vs `StringRedisTemplate` |
| 序列化配置 | 【重点坑】默认乱码怎么解决 |
| 五大数据结构 | String/Hash/List/Set/ZSet 怎么操作 |
| 应用场景 | 缓存、分布式锁、计数器 |

> 📌 配合 [[SpringData概述]]、[[SpringDataJPA]] 阅读。

---

### 二、引入与配置

#### 1. 依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

> 💡 **提示：** Spring Boot 2.x 起默认客户端是 **Lettuce**（基于 Netty，异步、线程安全），而非老牌的 Jedis。一般无需切换。

#### 2. 连接配置

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      password: 123456          # 没密码可省
      database: 0               # 选第几个库（Redis 默认 16 个）
      lettuce:
        pool:                   # 连接池配置（需引入 commons-pool2）
          max-active: 8
          max-idle: 4
          min-idle: 0
```

---

### 三、`RedisTemplate` vs `StringRedisTemplate`

Spring 提供两个模板类：

| 对比 | `RedisTemplate` | `StringRedisTemplate` |
| --- | --- | --- |
| 泛型 | `RedisTemplate<Object, Object>` | `RedisTemplate<String, String>` |
| 默认序列化 | **JDK 序列化**（存进去是二进制乱码） | **String 序列化**（可读） |
| 存对象 | 支持（但需配序列化器） | 只能存 String |
| 适用 | 存复杂对象 | 存字符串、JSON 字符串（推荐） |

```java
@Service
public class CacheService {

    @Autowired
    private StringRedisTemplate redis;   // 一般用这个，简单可控

    public void set(String key, String value) {
        redis.opsForValue().set(key, value);
    }
}
```

---

### 四、【重点】序列化器配置

> ⚠️ **这是 RedisTemplate 最大的坑**：默认用 JDK 序列化，存进 Redis 的内容是乱码二进制（如 `\xac\xed\x00\x05...`），用 `redis-cli` 看不懂、别的语言也读不了。

#### 解决方案一：用 `StringRedisTemplate` + 手动转 JSON（推荐，简单透明）

```java
@Autowired
private StringRedisTemplate redis;
@Autowired
private ObjectMapper mapper;   // Jackson

public void cacheUser(User user) throws Exception {
    String json = mapper.writeValueAsString(user);   // 对象转 JSON 字符串
    redis.opsForValue().set("user:" + user.getId(), json);
}

public User getUser(Long id) throws Exception {
    String json = redis.opsForValue().get("user:" + id);
    return json == null ? null : mapper.readValue(json, User.class);
}
```

#### 解决方案二：自定义 `RedisTemplate`，用 JSON 序列化

```java
@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);

        // key 用 String 序列化
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        // value 用 JSON 序列化（GenericJackson2JsonRedisSerializer 带类型信息）
        GenericJackson2JsonRedisSerializer jsonSerializer =
            new GenericJackson2JsonRedisSerializer();
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);

        template.afterPropertiesSet();
        return template;
    }
}
```

配好后，`RedisTemplate` 存对象会自动转成可读 JSON：

```java
@Autowired
private RedisTemplate<String, Object> redisTemplate;

redisTemplate.opsForValue().set("user:1", new User(1L, "张三"));
// Redis 里存的是：{"@class":"com.example.User","id":1,"name":"张三"}
```

> 💡 **提示：** `GenericJackson2JsonRedisSerializer` 会在 JSON 里带上 `@class` 类型信息，反序列化时能自动还原成原对象——这正是它能存任意对象的关键。

---

### 五、五大数据结构操作

Redis 有五种基本数据结构，`RedisTemplate` 用 `opsForXxx()` 对应：

| 方法 | 对应 Redis 结构 | 用途 |
| --- | --- | --- |
| `opsForValue()` | String | 普通键值对、计数器 |
| `opsForHash()` | Hash | 对象的字段存储 |
| `opsForList()` | List | 队列、最新列表 |
| `opsForSet()` | Set | 去重、交集并集 |
| `opsForZSet()` | ZSet（有序集合） | 排行榜 |

#### 1. String（`opsForValue`）

```java
// 增删改查
redis.opsForValue().set("name", "张三");
String name = redis.opsForValue().get("name");          // "张三"
redis.delete("name");

// 计数（值必须是数字）
redis.opsForValue().set("count", "0");
redis.opsForValue().increment("count");                 // +1
redis.opsForValue().increment("count", 5);              // +5
```

#### 2. Hash（`opsForHash`）

```java
// 一个 key 下存多个字段（适合存对象）
redis.opsForHash().put("user:1", "name", "张三");
redis.opsForHash().put("user:1", "age", "20");

Object age = redis.opsForHash().get("user:1", "age");   // "20"
Map<Object, Object> user = redis.opsForHash().entries("user:1");  // 整个 hash
```

#### 3. List（`opsForList`）

```java
// 当队列用（左进右出）
redis.opsForList().leftPush("queue", "msg1");
redis.opsForList().leftPush("queue", "msg2");
String msg = redis.opsForList().rightPop("queue");      // 取出最早的 msg1（FIFO）
```

#### 4. Set（`opsForSet`）

```java
// 去重 + 集合运算
redis.opsForSet().add("tags:user:1", "java", "spring");
redis.opsForSet().add("tags:user:2", "spring", "redis");

Set<String> common = redis.opsForSet().intersect("tags:user:1", "tags:user:2"); // 交集 [spring]
Boolean isMember = redis.opsForSet().isMember("tags:user:1", "java");           // true
```

#### 5. ZSet（`opsForZSet`，有序集合）

```java
// 排行榜：带分数自动排序
redis.opsForZSet().add("rank:score", "player1", 100);
redis.opsForZSet().add("rank:score", "player2", 200);
redis.opsForZSet().add("rank:score", "player3", 150);

// 取前三名（按分数倒序）
Set<String> top3 = redis.opsForZSet().reverseRange("rank:score", 0, 2);
// → [player2, player3, player1]
```

---

### 六、设置过期时间

```java
// 方式一：单独设过期
redis.opsForValue().set("code", "123456");
redis.expire("code", 5, TimeUnit.MINUTES);              // 5 分钟后自动删除

// 方式二：存入时直接指定（推荐）
redis.opsForValue().set("token", "abc", 30, TimeUnit.MINUTES);
```

> ⚠️ **注意：** 验证码、token 等一定要设过期时间，否则会一直占用 Redis 内存。

---

### 七、实际应用场景

1. **缓存**：数据库查询结果缓存到 Redis，减轻数据库压力（最常见）。配合 Spring Cache 注解更省事，见 [[../Spring其他生态/缓存抽象]]。
2. **分布式锁**：用 `setnx`（`setIfAbsent`）实现互斥锁。
3. **计数器**：文章点赞数、商品库存，用 `increment` 原子操作。
4. **排行榜**：用 ZSet 的分数排序，天然适合。
5. **限流**：用计数 + 过期时间实现简单的接口限流。

#### 分布式锁示例（简化版）

```java
public boolean tryLock(String key, String value, long timeout) {
    Boolean ok = redis.opsForValue().setIfAbsent(key, value, timeout, TimeUnit.SECONDS);
    return Boolean.TRUE.equals(ok);   // setnx 成功 = 抢到锁
}

public void unlock(String key, String expectedValue) {
    // 实际要用 Lua 脚本保证「判断+删除」原子性，这里简化
    if (expectedValue.equals(redis.opsForValue().get(key))) {
        redis.delete(key);
    }
}
```

---

### 八、常见问题与注意事项

> ⚠️ **注意：**
> - **默认 JDK 序列化乱码**：必须配 JSON 序列化器或用 `StringRedisTemplate`，否则 Redis 里全是二进制。
> - **缓存与数据库一致性**：先更新数据库、再删缓存（Cache Aside 模式），尽量短地接受不一致窗口。
> - **大 key 问题**：一个 key 存几 MB 的数据会阻塞 Redis，避免把大对象塞一个 key。
> - **`GenericJackson2JsonRedisSerializer` 存 `List`**：反序列化需要无参构造器，否则报错。
> - 连接池要用 `lettuce-pool`，需额外引入 `commons-pool2` 依赖。

> 💡 **提示：** Redis 是内存数据库，**任何放进去的数据都要考虑「什么时候清掉」**——设过期时间，或用淘汰策略（`maxmemory-policy`）兜底，防止内存撑爆。

---

### 九、总结

- **Spring Data Redis** 封装了 Redis 客户端，用 `RedisTemplate` 统一操作。
- **两个模板**：`RedisTemplate`（通用，存对象）vs `StringRedisTemplate`（专 String，推荐）。
- **必配序列化器**：默认 JDK 序列化是乱码，改 JSON 序列化才可读。
- **五大结构**：`opsForValue`/`opsForHash`/`opsForList`/`opsForSet`/`opsForZSet`。
- **应用**：缓存、分布式锁、计数器、排行榜——Redis 是 Java 后端的高频搭档。

SpringData 子目录完成。下一篇，安全框架：[[../SpringSecurity/SpringSecurity入门]]。
