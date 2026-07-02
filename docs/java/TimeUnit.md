# TimeUnit 详解

> 📖 官方文档：[TimeUnit (Java SE 17)](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/TimeUnit.html)

> 📖 中文参考：[TimeUnit 中文文档](https://www.matools.com/manual/java/java-api-concurrent/java/util/concurrent/TimeUnit.html)

---

## 一、TimeUnit 是什么

`TimeUnit` 是 Java 提供的一个表示**时间单位**的枚举（enum），位于 `java.util.concurrent` 包下，从 **Java 5** 开始引入。

```
┌─ TimeUnit 的两大核心能力 ──────────────────────────────────────────┐
│                                                                      │
│  ┌─ 时间单位换算 ──────────────┐  ┌─ 并发编程的等待/定时 ────────┐ │
│  │ 纳秒 ↔ 微秒 ↔ 毫秒 ↔ 秒    │  │ Thread.sleep                │ │
│  │ 秒 ↔ 分钟 ↔ 小时 ↔ 天       │  │ Future.get 带超时            │ │
│  │ 避免 * 1000 / 1000 手写换算 │  │ Lock.tryLock 带超时          │ │
│  │                              │  │ 阻塞队列 offer/poll 带超时  │ │
│  │                              │  │ 定时任务调度               │ │
│  └──────────────────────────────┘  └──────────────────────────────┘ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

> **通俗理解**：`TimeUnit` 就像一个「时间翻译官」——你告诉它「我要等 5 秒」，它自动帮你把「5 秒」翻译成「5000 毫秒」或「5000000 微秒」，不用你自己去心算乘除法。更关键的是，Java 并发包（线程、锁、Future、阻塞队列）里的很多「等待」方法都接收 `TimeUnit` 作为参数，让等待时间的表达统一、清晰、不易写错。

### 为什么需要它（没有它会怎样）

```java
// ❌ 没有 TimeUnit：到处是裸数字，单位全靠注释，容易算错
Thread.sleep(5000);                 // 5000 是什么？毫秒？要等几秒？
future.get(3000, java.util.concurrent.TimeUnit.MILLISECONDS);  // 还行，但还得手动算毫秒
lock.tryLock(2, java.util.concurrent.TimeUnit.SECONDS);        // 每次都要写全限定名

// ✅ 有 TimeUnit：语义一目了然，换算交给枚举
TimeUnit.SECONDS.sleep(5);          // 等 5 秒，清清楚楚
future.get(3, TimeUnit.SECONDS);    // 等 3 秒
lock.tryLock(2, TimeUnit.SECONDS);  // 等 2 秒
```

---

## 二、7 个时间单位

`TimeUnit` 枚举内部定义了 7 个常量，覆盖从纳秒到天的时间粒度：

| 枚举常量 | 中文 | 换算关系 | 引入版本 |
|----------|------|----------|----------|
| `NANOSECONDS` | 纳秒 | 1 秒 = 1,000,000,000 纳秒 | Java 5 |
| `MICROSECONDS` | 微秒 | 1 秒 = 1,000,000 微秒 | Java 5 |
| `MILLISECONDS` | 毫秒 | 1 秒 = 1,000 毫秒 | Java 5 |
| `SECONDS` | 秒 | 基本单位 | Java 5 |
| `MINUTES` | 分钟 | 1 分钟 = 60 秒 | **Java 6** 新增 |
| `HOURS` | 小时 | 1 小时 = 60 分钟 | **Java 6** 新增 |
| `DAYS` | 天 | 1 天 = 24 小时 | **Java 6** 新增 |

> 💡 **提示**：`TimeUnit` 在 Java 5 引入时只有前 4 个（纳秒~秒），`MINUTES`、`HOURS`、`DAYS` 是 **Java 6** 才补充的。现代 Java（8+）开发中 7 个都能直接用，无需关心版本。

---

## 三、核心用法之一：时间单位换算

`TimeUnit` 最基础的能力，是在不同时间单位之间做换算，避免手写 `* 1000`、`/ 1000` 这种容易出错的算术。

### 1. toXxx 系列 —— 从当前单位换算到目标单位

每个 `TimeUnit` 实例都自带一组 `toXxx` 方法，把「以当前单位表示的数值」换算成另一种单位：

```java
import java.util.concurrent.TimeUnit;

public class Demo {
    public static void main(String[] args) {
        // 当前单位是 SECONDS（秒），把 5 秒换算成其他单位
        long s = 5;

        System.out.println(TimeUnit.SECONDS.toNanos(s));      // 5000000000 纳秒
        System.out.println(TimeUnit.SECONDS.toMicros(s));     // 5000000 微秒
        System.out.println(TimeUnit.SECONDS.toMillis(s));     // 5000 毫秒
        System.out.println(TimeUnit.SECONDS.toMinutes(s));    // 0 分钟（5 不足 1 分钟，取整）
        System.out.println(TimeUnit.SECONDS.toHours(s));      // 0 小时
        System.out.println(TimeUnit.SECONDS.toDays(s));       // 0 天

        // 当前单位是 HOURS（小时），把 2 小时换算成分钟
        System.out.println(TimeUnit.HOURS.toMinutes(2));      // 120 分钟

        // 当前单位是 DAYS（天），把 3 天换算成秒
        System.out.println(TimeUnit.DAYS.toSeconds(3));       // 259200 秒
    }
}
```

| 方法 | 作用 |
|------|------|
| `toNanos(long)` | 当前单位 → 纳秒 |
| `toMicros(long)` | 当前单位 → 微秒 |
| `toMillis(long)` | 当前单位 → 毫秒 |
| `toSeconds(long)` | 当前单位 → 秒 |
| `toMinutes(long)` | 当前单位 → 分钟 |
| `toHours(long)` | 当前单位 → 小时 |
| `toDays(long)` | 当前单位 → 天 |

> ⚠️ **注意取整方向**：从大单位换算到小单位（如秒→毫秒）是「放大」，结果精确；从小单位换算到大单位（如秒→分钟）是「缩小」，结果会**向下取整**丢弃余数。例如 `SECONDS.toMinutes(59)` 的结果是 `0`，不是四舍五入。

### 2. convert —— 任意单位之间互转

`toXxx` 是「固定换到某个目标单位」，而 `convert` 更灵活，可以指定源单位：

```java
// convert(数值, 源单位) —— 把「源单位的数值」转成「当前单位」
// 把 5 秒换算成毫秒（当前单位是 MILLISECONDS）
long millis = TimeUnit.MILLISECONDS.convert(5, TimeUnit.SECONDS);
System.out.println(millis);   // 5000

// 把 2 小时换算成分钟（当前单位是 MINUTES）
long minutes = TimeUnit.MINUTES.convert(2, TimeUnit.HOURS);
System.out.println(minutes);  // 120

// 把 90 秒换算成分钟（当前单位是 MINUTES）
System.out.println(TimeUnit.MINUTES.convert(90, TimeUnit.SECONDS)); // 1（向下取整）
```

> 💡 **提示**：`toXxx` 和 `convert` 本质是一回事——`SECONDS.toMillis(5)` 完全等价于 `TimeUnit.MILLISECONDS.convert(5, TimeUnit.SECONDS)`。`toXxx` 写法更短，适合「我知道当前单位，想转成某个固定单位」的场景；`convert` 更通用，当源单位是动态变量时用它。

---

## 四、核心用法之二：并发编程中的应用

这才是 `TimeUnit` 真正大显身手的地方。Java 并发包里凡是涉及「等待多久」「隔多久执行」的 API，几乎都接收一个 `TimeUnit` 参数，让超时时间的表达统一又清晰。

### 1. 替代 Thread.sleep（最常用）

```java
// ❌ 传统写法：5000 是裸数字，单位要靠注释，还得自己把秒算成毫秒
Thread.sleep(5000);  // 休眠 5 秒？要乘 1000

// ✅ TimeUnit 写法：自解释，单位写明
TimeUnit.SECONDS.sleep(5);    // 休眠 5 秒
TimeUnit.MINUTES.sleep(1);    // 休眠 1 分钟
TimeUnit.MILLISECONDS.sleep(500);  // 休眠 500 毫秒
```

`TimeUnit.SECONDS.sleep(5)` 内部其实就是调用了 `Thread.sleep()`，但读起来语义明确，且不用你自己算毫秒。

> ⚠️ **注意**：`sleep` 会响应线程中断，必须处理 `InterruptedException`：
> ```java
> try {
>     TimeUnit.SECONDS.sleep(5);
> } catch (InterruptedException e) {
>     // 线程在睡眠期间被打断，恢复中断状态是好习惯
>     Thread.currentThread().interrupt();
> }
> ```

### 2. Future 获取结果带超时

```java
ExecutorService executor = Executors.newSingleThreadExecutor();
Future<String> future = executor.submit(() -> {
    TimeUnit.SECONDS.sleep(10);  // 模拟耗时任务
    return "任务结果";
});

try {
    // 最多等 3 秒，超时会抛 TimeoutException
    String result = future.get(3, TimeUnit.SECONDS);
    System.out.println(result);
} catch (TimeoutException e) {
    System.out.println("任务超时，还没返回结果");
    future.cancel(true);  // 中断并取消任务
} catch (Exception e) {
    e.printStackTrace();
} finally {
    executor.shutdown();
}
```

### 3. 显式锁的超时获取（Lock.tryLock）

```java
import java.util.concurrent.locks.ReentrantLock;
import java.util.concurrent.TimeUnit;

Lock lock = new ReentrantLock();

// 尝试在 3 秒内获取锁
if (lock.tryLock(3, TimeUnit.SECONDS)) {
    try {
        System.out.println("拿到锁了，执行业务逻辑");
    } finally {
        lock.unlock();  // 一定要在 finally 里释放
    }
} else {
    System.out.println("3 秒内没拿到锁，放弃");
}
```

### 4. 阻塞队列的定时存取（BlockingQueue）

```java
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeUnit;

BlockingQueue<String> queue = new ArrayBlockingQueue<>(10);

// 在 2 秒内尝试放入元素（队列满则等待，超时返回 false）
boolean added = queue.offer("数据", 2, TimeUnit.SECONDS);

// 在 2 秒内尝试取出元素（队列空则等待，超时返回 null）
String data = queue.poll(2, TimeUnit.SECONDS);
```

### 5. 定时任务调度（ScheduledExecutorService）

```java
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

// ① 延迟 5 秒后执行一次
scheduler.schedule(() -> System.out.println("5 秒后执行"), 5, TimeUnit.SECONDS);

// ② 固定速率：初始延迟 0 秒，之后每隔 1 分钟执行一次
scheduler.scheduleAtFixedRate(
    () -> System.out.println("每分钟执行"),
    0, 1, TimeUnit.MINUTES
);

// ③ 固定延迟：上一次执行结束后，再等 30 秒执行下一次
scheduler.scheduleWithFixedDelay(
    () -> System.out.println("间隔 30 秒执行"),
    0, 30, TimeUnit.SECONDS
);

// 注意：实际项目记得在合适时机 scheduler.shutdown()
```

### 6. timedWait / timedJoin —— 封装传统等待

`TimeUnit` 还封装了两个比较「老」的等待方法，本质是对 `Object.wait` 和 `Thread.join` 的包装：

```java
Object lock = new Object();

// timedWait：相当于 lock.wait(timeout)，会自动把 TimeUnit 换算成最合适的毫秒+纳秒
synchronized (lock) {
    while (!条件满足) {
        TimeUnit.SECONDS.timedWait(lock, 3);  // 最多等 3 秒，必须先持有 lock 的锁
    }
}

// timedJoin：相当于 thread.join(timeout)，最多等某线程结束 3 秒
Thread worker = new Thread(() -> { /* ... */ });
worker.start();
TimeUnit.SECONDS.timedJoin(worker, 3);  // 最多等 worker 跑完 3 秒
```

> 💡 **提示**：`timedWait` 和 `timedJoin` 现在用得不多（现代代码更倾向用 `Lock`、`Future`、`CountDownLatch` 等更高级的并发工具），了解即可。重点是知道：它们都接收 `TimeUnit` 作为时间表达方式。

---

## 五、完整 API 参考

### 实例方法

| 方法签名 | 作用 | 抛出异常 |
|----------|------|----------|
| `long convert(long duration, TimeUnit unit)` | 把 `unit` 单位的 `duration` 转为当前单位 | — |
| `long toNanos(long duration)` | 当前单位 → 纳秒 | — |
| `long toMicros(long duration)` | 当前单位 → 微秒 | — |
| `long toMillis(long duration)` | 当前单位 → 毫秒 | — |
| `long toSeconds(long duration)` | 当前单位 → 秒 | — |
| `long toMinutes(long duration)` | 当前单位 → 分钟 | — |
| `long toHours(long duration)` | 当前单位 → 小时 | — |
| `long toDays(long duration)` | 当前单位 → 天 | — |
| `void sleep(long timeout)` | 线程休眠 `timeout`（当前单位） | `InterruptedException` |
| `void timedWait(Object obj, long timeout)` | 对 `obj` 调用 `wait`，等待 `timeout` | `InterruptedException` |
| `void timedJoin(Thread thread, long timeout)` | 等待 `thread` 结束，最多 `timeout` | `InterruptedException` |

### Java 9+ 新增：toXxxExact（防溢出版本）

| 方法签名 | 作用 |
|----------|------|
| `long toMillisExact(long duration)` | 精确转毫秒，**溢出抛 `ArithmeticException`** |
| `long toMicrosExact(long duration)` | 精确转微秒，溢出抛异常 |
| `long toNanosExact(long duration)` | 精确转纳秒，溢出抛异常 |
| `long toSecondsExact(long duration)` | 精确转秒，溢出抛异常 |
| `long toMinutesExact(long duration)` | 精确转分钟，溢出抛异常 |
| `long toHoursExact(long duration)` | 精确转小时，溢出抛异常 |
| `long toDaysExact(long duration)` | 精确转天，溢出抛异常 |

> ⚠️ **注意普通 `toNanos` 的溢出陷阱**：`DAYS.toNanos(1000)` 这类「天→纳秒」的大跨度换算会超出 `long` 的范围（约 9.2×10¹⁸ 纳秒 ≈ 106 天），结果会被**静默截断**得到错误的负数或乱码值，且不会报错！如果担心溢出，用 Java 9+ 的 `toNanosExact`，溢出时会直接抛 `ArithmeticException` 提醒你。

---

## 六、实际应用场景

### 场景 1：让代码里所有「时间常量」语义化

```java
// 假设要写一个带各种超时配置的 HTTP 客户端
public class HttpClientConfig {
    // 用 TimeUnit 让超时配置一眼可读
    public static final long CONNECT_TIMEOUT = TimeUnit.SECONDS.toMillis(10);   // 连接超时 10 秒
    public static final long READ_TIMEOUT    = TimeUnit.SECONDS.toMillis(30);   // 读取超时 30 秒
    public static final long CACHE_TTL       = TimeUnit.MINUTES.toSeconds(5);   // 缓存有效期 5 分钟
    public static final long RETRY_INTERVAL  = TimeUnit.HOURS.toMillis(1);      // 重试间隔 1 小时
}
```

### 场景 2：实现「带超时」的任务等待

```java
// 主线程提交任务，最多等待 5 秒，超时则走降级逻辑
ExecutorService executor = Executors.newCachedThreadPool();
Future<String> future = executor.submit(() -> callRemoteService());

String result;
try {
    result = future.get(5, TimeUnit.SECONDS);          // 等 5 秒
} catch (TimeoutException e) {
    result = "默认降级结果";                              // 超时降级
    future.cancel(true);
}
```

### 场景 3：轮询等待某个条件成立（带超时保护）

```java
// 每 200 毫秒检查一次条件，最多等待 5 秒，避免无限阻塞
long deadline = System.currentTimeMillis() + TimeUnit.SECONDS.toMillis(5);
while (!isReady()) {
    if (System.currentTimeMillis() > deadline) {
        throw new RuntimeException("等待超时");
    }
    TimeUnit.MILLISECONDS.sleep(200);   // 间隔轮询
}
```

### 场景 4：定时清理任务

```java
// 每天凌晨清理一次过期数据（简化：每隔 24 小时）
ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
scheduler.scheduleAtFixedRate(
    () -> cleanExpiredData(),
    0,
    TimeUnit.DAYS.toSeconds(1),   // 用 TimeUnit 表达「1 天」，清晰明了
    TimeUnit.SECONDS              // 调度器接收的最终单位是秒
);
```

---

## 七、注意事项与最佳实践

### 1. 警惕 toNanos / toMillis 的溢出

```java
// ❌ 危险：天 → 纳秒 跨度太大，结果溢出但不会报错
long wrong = TimeUnit.DAYS.toNanos(1000);   // 得到一个错误值，且无异常！

// ✅ 安全：Java 9+ 用 Exact 版本，溢出直接抛异常
long safe = TimeUnit.DAYS.toNanosExact(1);  // 1 天能正常转，86400000000000
// TimeUnit.DAYS.toNanosExact(1000);        // ❌ 抛 ArithmeticException，提醒你别这么干
```

**规则**：当从大单位换算到纳秒/微秒/毫秒，且数值较大时，优先用 `toXxxExact`（Java 9+）或在换算前评估范围。

### 2. sleep / timedWait 会响应中断

凡是会阻塞线程的方法（`sleep`、`timedWait`、`timedJoin`）都会抛 `InterruptedException`。正确处理中断的方式：

```java
// ❌ 错误：吞掉异常，中断信号丢失
try {
    TimeUnit.SECONDS.sleep(5);
} catch (InterruptedException e) {
    // 啥也不干 —— 中断状态被吞了，上层无法感知
}

// ✅ 正确：恢复中断标志，让上层能感知
try {
    TimeUnit.SECONDS.sleep(5);
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();   // 恢复中断状态
    return;                                // 或做其他收尾
}
```

### 3. 别在循环里反复 new，TimeUnit 是单例

`TimeUnit.SECONDS` 等枚举常量本身就是**单例**，全局共享，可以放心到处引用，没有任何创建开销。但也别把它当字符串来比较——它就是个普通枚举，用 `==` 或 `equals` 都行。

### 4. 现代 Java 的时间处理有更多选择

`TimeUnit` 主要服务于**并发编程**。如果只是做时间的运算、格式化、日期处理，更推荐 Java 8+ 的 `java.time` 包：

| 需求 | 推荐方案 |
|------|----------|
| 线程休眠、并发等待、定时任务 | `TimeUnit`（配合并发包） |
| 计算两个日期/时间的差 | `java.time.Duration` / `Period` |
| 获取/格式化当前日期时间 | `LocalDateTime` / `DateTimeFormatter` |
| 时间戳与日期互转 | `Instant` / `ZonedDateTime` |

---

## 八、面试常见问题

### Q1：TimeUnit 是什么？为什么要用它？

`TimeUnit` 是 `java.util.concurrent` 包下的时间单位枚举，主要两个作用：① 在不同时间单位之间做换算，避免手写乘除法；② 作为 Java 并发 API（sleep、Future、Lock、阻塞队列等）中「等待时长」的标准化参数，让时间表达统一、可读、不易出错。

### Q2：toXxx 和 convert 有什么区别？

- `toXxx(值)`：以**当前枚举值**为单位，把传入的值换算成 `Xxx` 单位。如 `SECONDS.toMillis(5)` = 5000。
- `convert(值, 源单位)`：把**任意源单位**的值换算成当前单位。如 `MILLISECONDS.convert(5, SECONDS)` = 5000。

两者本质相同，`SECONDS.toMillis(5)` 等价于 `MILLISECONDS.convert(5, SECONDS)`。`toXxx` 更简洁，`convert` 更灵活（源单位可为变量）。

### Q3：toNanos 会有什么问题？

`toNanos` 在「大单位 → 纳秒」且数值较大时（如 `DAYS.toNanos(1000)`）会**溢出 `long` 范围**，结果被静默截断成错误值且不报错。Java 9+ 提供了 `toNanosExact`，溢出时会抛 `ArithmeticException`。

### Q4：TimeUnit.SECONDS.sleep(5) 和 Thread.sleep(5000) 有什么区别？

行为上没有区别——`TimeUnit.SECONDS.sleep(5)` 内部就是调用 `Thread.sleep`。区别在**可读性**：前者语义明确「睡 5 秒」，后者是裸数字「5000」，读代码的人还得猜单位。生产代码推荐用 `TimeUnit` 版本。

### Q5：MINUTES、HOURS、DAYS 是 Java 5 就有的吗？

不是。`TimeUnit` 在 Java 5 引入时只有 `NANOSECONDS`、`MICROSECONDS`、`MILLISECONDS`、`SECONDS` 四个；`MINUTES`、`HOURS`、`DAYS` 是 **Java 6** 才补充进来的。Java 9 又增加了防溢出的 `toXxxExact` 系列方法。

### Q6：sleep 时收到 InterruptedException 该怎么处理？

不能简单吞掉。最佳实践是调用 `Thread.currentThread().interrupt()` **恢复中断标志**，然后做收尾（return 或抛出），让上层的调用者能感知到「线程被中断了」。否则中断信号被吞，上层逻辑会误以为线程仍在正常运行。

---

## 九、总结

> `TimeUnit` = **时间单位的枚举 + 单位换算工具 + 并发等待的标准化参数**。

记住这几点就够用了：

1. **7 个单位**：纳秒、微秒、毫秒、秒、分钟、小时、天。
2. **换算两招**：`toXxx(值)` 固定转目标单位；`convert(值, 源单位)` 任意单位互转。
3. **并发必备**：`sleep`、`Future.get`、`Lock.tryLock`、`BlockingQueue`、`ScheduledExecutorService` 都用 `TimeUnit` 表达时间。
4. **注意溢出**：大单位转纳秒/微秒/毫秒可能溢出，用 `toXxxExact`（Java 9+）。
5. **正确处理中断**：`sleep` 等会抛 `InterruptedException`，别吞，要 `interrupt()` 恢复。
6. **职责区分**：并发等待用 `TimeUnit`，日期/时长运算用 `java.time`（`Duration` / `Period`）。
