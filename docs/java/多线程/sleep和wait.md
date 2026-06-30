# sleep 和 wait 的区别

> 📖 官方 API：[Thread.sleep (Java Platform SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Thread.html#sleep(long))
> 📖 官方 API：[Object.wait (Java Platform SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Object.html#wait())
> 📖 官方教程：[Guarded Blocks (Oracle)](https://docs.oracle.com/javase/tutorial/essential/concurrency/guardmeth.html)

## 一、概述

`sleep()` 和 `wait()` 都能让线程"停下来等一会"，但它们是**两个完全不同的东西**，来自不同的类、用法不同、行为也不同。这是 Java 多线程**最高频的面试题之一**。

本文把二者的区别彻底讲透，并给出完整对比和使用建议。

---

## 二、快速结论

先用一张表记住最核心的区别：

| 对比项 | `Thread.sleep()` | `Object.wait()` |
| --- | --- | --- |
| 所属类 | `Thread`（**静态方法**） | `Object`（**每个对象都有**） |
| **是否释放锁** | **不释放锁** | **释放锁** |
| 使用位置 | 任意位置 | **必须在 `synchronized` 块内** |
| 唤醒方式 | 时间到**自动唤醒** | `notify()`/`notifyAll()` 或超时 |
| 所处状态 | `TIMED_WAITING` | `WAITING` / `TIMED_WAITING` |
| 用途 | 让线程"睡一会" | 线程间**协作**（等某个条件） |

> 💡 **一句话记忆：** `sleep()` 是"抱着锁睡觉，到点自己醒"；`wait()` 是"放下锁去等，被别人叫醒"。

---

## 三、sleep() 详解

### 1. 基本用法

`Thread.sleep(ms)` 是 **`Thread` 类的静态方法**，让**当前线程**休眠指定毫秒。

```java
try {
    Thread.sleep(2000); // 当前线程睡 2 秒
} catch (InterruptedException e) {
    Thread.currentThread().interrupt();
}
```

### 2. 关键特点

- **休眠的是当前线程**（静态方法，与"哪个对象调用"无关）；
- **不释放锁**：如果在 `synchronized` 块内 `sleep`，锁仍然被持有；
- **时间到自动唤醒**，不需要别人叫醒；
- **可被 `interrupt()` 提前唤醒**，会抛 `InterruptedException`。

> 💡 **更多：** sleep 的详细用法见 [线程的休眠](./线程的休眠.md)。

---

## 四、wait() 详解

### 1. 基本用法

`wait()` 是 **`Object` 的方法**（每个对象都能调用），用于**线程间协作**：线程等待某个条件成立，等成立后由其他线程通知它。

```java
synchronized (lock) {
    while (!condition) {
        lock.wait(); // 释放 lock 的锁，进入等待；被唤醒后重新获取锁再继续
    }
    // 条件满足，执行逻辑
}
```

### 2. 关键特点

- **必须在 `synchronized` 块内调用**，且**锁对象要和调用 `wait` 的对象一致**，否则抛 `IllegalMonitorStateException`；
- **释放锁**：调用 `wait()` 后，当前线程会**释放它持有的锁**，让别的线程能进入临界区；
- **不会自动醒来**（无参版本），必须由 `notify()` / `notifyAll()` 唤醒，或用带超时的 `wait(ms)`；
- 被唤醒后要**重新竞争锁**，拿到锁后才能从 `wait()` 处继续往下执行。

### 3. 三种重载

| 方法 | 行为 |
| --- | --- |
| `wait()` | 无限等待，直到被 `notify`/`notifyAll` 唤醒 |
| `wait(long ms)` | 最多等 `ms` 毫秒，超时自动醒 |
| `wait(long ms, int ns)` | 等到毫秒+纳秒 |

> ⚠️ **注意：** 等待条件**必须用 `while` 循环判断**（不能用 `if`），防止"虚假唤醒"——线程醒来时条件可能已不成立，必须再次检查。

---

## 五、核心区别深入

### 1. 锁的处理（最重要的区别）

```java
// sleep：抱着锁睡，别的线程进不来
synchronized (lock) {
    Thread.sleep(5000); // 这 5 秒里，lock 一直被占着
}

// wait：放下锁去等，别的线程可以进来
synchronized (lock) {
    lock.wait(); // 立刻释放 lock，其他线程能拿到锁干活
}
```

这是设计目的决定的：`sleep()` 只是"暂停一下自己"，不涉及和别人协作，所以没必要放锁；`wait()` 是"等别人把条件准备好"，如果不放锁，别人就没法进临界区去准备条件，会**死锁**。

### 2. 唤醒机制

| | sleep | wait |
| --- | --- | --- |
| 正常唤醒 | 时间到自己醒 | 需要 `notify`/`notifyAll`（或超时） |
| 被中断 | 抛 `InterruptedException` | 抛 `InterruptedException` |

### 3. 所属与调用对象

- `Thread.sleep()`：**静态方法**，写 `Thread.sleep()`，作用于**当前线程**；
- `obj.wait()`：**实例方法**，作用于 **`obj` 这个对象的监视器**，必须持有 `obj` 的锁。

---

## 六、完整对比表

| 对比项 | `sleep()` | `wait()` |
| --- | --- | --- |
| 所属类 | `Thread` | `Object` |
| 方法类型 | 静态方法 | 实例方法 |
| 是否释放锁 | ❌ 不释放 | ✅ 释放 |
| 调用前提 | 任意位置 | 必须持有对象锁（synchronized 内） |
| 唤醒方式 | 时间到自动醒 | notify/notifyAll 或超时 |
| 用途 | 单纯暂停线程 | 线程间协作（等待/通知） |
| 状态 | `TIMED_WAITING` | `WAITING`（无参）/ `TIMED_WAITING`（带参） |
| 是否属于锁机制 | 否（不属于锁） | 是（属于 monitor 锁机制） |

---

## 七、使用场景对比

| 场景 | 用哪个 | 原因 |
| --- | --- | --- |
| 模拟耗时、定时、轮询间隔 | `sleep()` | 只是让线程停一会，不涉及协作 |
| 生产者-消费者（等队列非空/非满） | `wait/notify` | 需要等"条件成立"，且要让出锁 |
| 状态标志位轮询 | 都不理想，优先 `volatile`/`Condition` | 更优雅 |
| 限时等待某个条件 | `wait(ms)` | 既放锁又有超时 |

---

## 八、记忆口诀与面试速答

**面试简答模板**（按这个顺序答，逻辑清晰）：

1. **来源不同**：`sleep` 是 `Thread` 的静态方法，`wait` 是 `Object` 的方法；
2. **释放锁**：`sleep` **不释放锁**，`wait` **释放锁**（最核心区别）；
3. **使用位置**：`sleep` 任意位置，`wait` 必须在 `synchronized` 内；
4. **唤醒方式**：`sleep` 到时间自动醒，`wait` 要靠 `notify`/`notifyAll` 唤醒；
5. **用途**：`sleep` 用于暂停线程，`wait` 用于线程间协作。

> 💡 **口诀：** **"sleep 抱锁睡到点，wait 释锁等人唤。"**

---

## 九、常见误区

1. **"sleep 会释放锁"** ❌ —— sleep **不释放锁**，这是最常见的错误认知。
2. **"wait 可以在任意位置调用"** ❌ —— wait 必须在 `synchronized` 内，否则抛 `IllegalMonitorStateException`。
3. **"wait 用 if 判断条件"** ❌ —— 必须用 `while`，防止虚假唤醒。
4. **"sleep 和 wait 是一类东西"** ❌ —— 二者目的完全不同：sleep 是"暂停"，wait 是"协作"。

---

## 十、总结

| 问题 | sleep | wait |
| --- | --- | --- |
| 谁的方法 | Thread | Object |
| 释放锁吗 | 不释放 | 释放 |
| 哪里用 | 任意 | synchronized 内 |
| 怎么醒 | 时间到 | notify/超时 |
| 干嘛用 | 暂停 | 协作 |

> 💡 **提示：** 记住这条**生死线**——**`wait()` 会释放锁，`sleep()` 不会**。这一条决定了它们完全不同的使用场景：需要协作、要让出锁就用 `wait()`；只是想暂停一下自己、不想丢锁就用 `sleep()`。
