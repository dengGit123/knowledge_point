# setAccessible——突破访问检查

> 📖 官方文档：[AccessibleObject (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/reflect/AccessibleObject.html)

## 一、概述

`setAccessible(boolean flag)` 定义在 `java.lang.reflect.AccessibleObject` 类上，作用是**开关反射对象的「Java 语言访问检查」**。

- 传 `true`：**抑制**访问检查——后续通过这个反射对象访问成员时，不再校验 public/protected/默认/private 的语言级权限。这就是「突破 private」的来源。
- 传 `false`：恢复（强制）访问检查。

`Field`、`Method`、`Constructor` 都继承自 `AccessibleObject`，所以三者都有此方法：

```text
AccessibleObject（提供 setAccessible / trySetAccessible / canAccess）
   ▲
   ├── Field
   ├── Method
   └── Constructor
```

> 💡 **澄清一个常见误解：** `setAccessible(true)` 并不是「把成员改成 public」，它只影响**这一个反射对象**后续操作的检查行为——类的定义没有任何改变。而且它的名字有误导性（官方都承认）：`isAccessible()` 早已被废弃，因为「accessible」听起来像「是否可访问」，实际含义是「是否抑制了访问检查」。Java 9 引入 `canAccess()` 来做真正的「能否访问」判断。

## 二、基本用法

```java
import java.lang.reflect.Field;
import java.lang.reflect.Method;

public class Demo {
    public static void main(String[] args) throws Exception {
        User user = new User("张三", 20);

        // 访问 private 字段
        Field ageField = User.class.getDeclaredField("age");
        ageField.setAccessible(true);        // ✅ 必须先解锁
        System.out.println(ageField.get(user)); // 20

        // 调用 private 方法
        Method secret = User.class.getDeclaredMethod("secret", String.class);
        secret.setAccessible(true);
        secret.invoke(user, "暗号");

        // public 成员不需要 setAccessible
        Field nameField = User.class.getField("name");
        nameField.set(user, "李四");          // ✅ public 字段直接用
    }
}
```

> ⚠️ **注意：** 顺序是「先 `setAccessible(true)`，再 `get`/`set`/`invoke`」。反过来的话，第一次访问就会抛 `IllegalAccessException`。

## 三、Java 9+ 的新姿势：trySetAccessible 与 canAccess

Java 9 引入模块系统后，`setAccessible(true)` 在「跨模块访问非公开成员」时**不再万能**——会直接抛出 `InaccessibleObjectException`（`setAccessible(boolean)` 的官方 javadoc 明确列出了该异常）。为此官方新增了两个 API：

### 1. `trySetAccessible()`：安全版开关（Java 9+）

语义：**尽力**把 accessible 标志设为 `true`；设不上**不抛异常**，返回 `false`。官方 javadoc 原文要义：「如果无法启用访问……本方法返回 `false`（相对地，`setAccessible(true)` 失败时会抛 `InaccessibleObjectException`）」。

```java
Method m = targetClass.getDeclaredMethod("privateMethod");

if (m.trySetAccessible()) {
    // ✅ 解锁成功，可以放心 invoke
    m.invoke(target);
} else {
    // ❌ 模块未开放等原因导致解锁失败 —— 走降级逻辑
    System.out.println("无法访问该成员（模块未 open）");
}
```

### 2. `canAccess(Object obj)`：真正的「能否访问」判断（Java 9+）

语义：测试**调用方当前能否访问**这个反射对象。返回 `true` 的两种情况（官方 javadoc）：accessible 标志已是 `true`（检查已被抑制），或调用方按语言规则本就有权访问。

```java
Field f = User.class.getDeclaredField("age");
System.out.println(f.canAccess(user));    // false —— private 且未解锁

f.setAccessible(true);
System.out.println(f.canAccess(user));    // true
```

使用约束（官方 javadoc）：实例方法/字段要传**声明类的实例**；静态成员必须传 `null`（传非 `null` 抛 `IllegalArgumentException`），构造器只能传 `null`。另外传 `null` 时若成员不是静态的，同样抛 `IllegalArgumentException`。

### 3. 三个 API 的对比

| API | 引入版本 | 失败时的行为 | 适用场景 |
| ---- | ---- | ---- | ---- |
| `setAccessible(true)` | 1.2 | 抛 `InaccessibleObjectException`（模块拒绝时） | 明确知道能解锁的场景 |
| `trySetAccessible()` | 9 | 返回 `false`，不抛异常 | ✅ 框架代码防御性写法首选 |
| `canAccess(obj)` | 9 | ——（它是查询，不是修改） | 访问前探测，避免异常 |

## 四、模块系统下的限制（Java 9+）

Java 9 模块系统（JPMS）引入后，访问规则多了一层「模块边界」：

- 只有一个模块把包含目标类的包**开放（open）**给调用方模块时，才能对其非公开成员 `setAccessible(true)`。
- `JDK` 自身的核心模块（如 `java.base`）默认不开放内部包，直接反射 `java.lang` 等包下的非 public 成员会被拒绝。
- 解决方式有两种：
  - **代码方式**：用 `trySetAccessible()` 探测，失败就降级；
  - **启动参数方式**：加 JVM 参数打开指定模块的包——

```bash
# 打开某个模块的某个包给所有未命名模块（深度反射）
java --add-opens java.base/java.lang=ALL-UNNAMED MyApp.jar

# 打开 JDK 内部包的常见写法（如反射访问 sun.misc）
java --add-opens java.base/sun.net.util=ALL-UNNAMED MyApp.jar
```

> ⚠️ **注意：** 老项目升级 JDK 17+ 时，大量「以前能跑的反射代码」开始抛 `InaccessibleObjectException`，九成是撞上了模块限制。先判断目标类在哪个模块哪个包，再用 `--add-opens` 打开。`setAccessible` 的静态批量版本 `AccessibleObject.setAccessible(AccessibleObject[] array, boolean flag)` 也遵循同样的规则。

## 五、setAccessible(true) 的性能副作用

`setAccessible(true)` 除了突破访问限制，还有一个广为人知的**提速效果**：跳过每次 `get`/`set`/`invoke` 时的访问权限检查。

调用 `Field.get` 这类方法时，JDK 内部每次都要做「调用方类是否有权访问目标成员」的安全检查；设置 accessible 标志后该检查被跳过，高频调用下差距可观。

```java
// ✅ 框架常见套路：初始化时解析一次 + 解锁 + 缓存，运行期零查找零检查
private static final Field AGE_FIELD;

static {
    try {
        AGE_FIELD = User.class.getDeclaredField("age");
        AGE_FIELD.setAccessible(true);   // 解锁 + 提速，一步两得
    } catch (NoSuchFieldException e) {
        throw new ExceptionInInitializerError(e);
    }
}
```

> 💡 **提示：** 「缓存 + setAccessible(true)」是反射优化的黄金组合，能把反射调用的开销从「慢 10~50 倍」压到「慢 2~5 倍」。完整优化手段见 [反射性能优化.md](./反射性能优化.md)。

## 六、注意事项

1. **它只影响单个反射对象**：对同一个方法再 `getDeclaredMethod` 拿一个新的 `Method` 对象，需要重新 `setAccessible`。所以要配合缓存使用——缓存的是「已解锁」的反射对象。
2. **`isAccessible()` 已废弃**（Java 9 起）：名字有歧义，判断「能否访问」请用 `canAccess()`。
3. **安全管理器场景**：若存在 `SecurityManager`，`setAccessible(true)` 需要 `ReflectPermission("suppressAccessChecks")` 权限，缺失时抛 `SecurityException`。（`SecurityManager` 在 JDK 17 起被标记废弃，但理解其历史行为对阅读老代码有用。）
4. **别用它做「偷窥式设计」**：反射破坏封装是把双刃剑，业务代码里大量访问他人类的 private 成员是坏味道；它的正确归宿是框架和工具层。
5. **record 类与隐藏类**：对 record 类的 final 字段、隐藏类成员，即使 `setAccessible(true)` 也拿不到写权限（`Field.set` 会抛 `IllegalAccessException`），这是官方 javadoc 明确写死的规则。

## 七、使用场景

| 场景 | 说明 |
| ---- | ---- |
| ORM / JSON 框架 | 实体类字段大量是 private，框架解锁后直接读写，不依赖 getter/setter |
| Spring 依赖注入 | `@Autowired` 字段解锁注入；`@Value` 同理 |
| 测试框架 | 读写被测类的私有状态、调用私有方法（谨慎使用，优先测公开行为） |
| 序列化兼容 | 反序列化时解锁 final 字段做「重建对象」——官方 javadoc 认可的场景之一 |
| 反射性能优化 | 初始化时解锁并缓存反射对象，消除运行期访问检查开销 |

## 八、总结

- `setAccessible(true)` 抑制语言级访问检查，让 `Field`/`Method`/`Constructor` 能操作 private 成员；它不改类的定义，只影响当前反射对象。
- Java 9+ 优先用 `trySetAccessible()`（失败返回 `false` 不抛异常）替代 `setAccessible(true)`；用 `canAccess(obj)` 探测真实可访问性。
- 模块系统下跨模块访问非公开成员需要目标包被 open，JDK 内部包要 `--add-opens`。
- `setAccessible(true)` 同时是反射提速手段：跳过每次访问的权限检查，与缓存配合是框架的标准优化。
- 记住官方的废弃信号：`isAccessible()` 废弃、`Class.newInstance()` 废弃——反射 API 正朝「更明确、更安全」的方向演进。
