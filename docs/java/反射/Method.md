# Method——反射调用方法

> 📖 官方文档：[Method (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/reflect/Method.html) ｜ [Oracle 反射教程 - Invoking Methods](https://docs.oracle.com/javase/tutorial/reflect/member/methodInvocation.html)

## 一、概述

`java.lang.reflect.Method` 代表类里的**一个具体方法**，调用它的 `invoke(对象, 实参...)` 即可在运行时动态执行该方法——等价于 `对象.方法(实参...)`，但方法是运行时才确定的。

它是反射体系中使用频率最高的类：Spring MVC 根据 `@RequestMapping` 找到处理方法后 `invoke` 执行、MyBatis 的 Mapper 接口由动态代理 `invoke` 转发、JUnit 对 `@Test` 方法逐个 `invoke`——几乎所有框架的「方法分发」都靠它。

> 💡 **类比：** `Method` 对象就像「电视遥控器上的一个按键」，`invoke` 就是「按下这个按键」。按键是运行时从遥控器（`Class` 对象）上取下来的，想按哪个、按几台电视（传哪个对象），都可以临时决定。

## 二、获取 Method 对象

```java
Class<User> cls = User.class;

// 1. public 方法（含继承自父类/Object 的）
Method m1 = cls.getMethod("setName", String.class);

// 2. 本类声明的方法（含 private）
Method m2 = cls.getDeclaredMethod("secret", String.class);

// 3. 无参方法：参数类型列表为空
Method m3 = cls.getMethod("getName");

// 4. 批量获取
Method[] allPublic = cls.getMethods();
Method[] declared = cls.getDeclaredMethods();

// 5. 静态方法同样用这两个方法获取（它也是「类的方法」）
Method m4 = cls.getDeclaredMethod("staticHelper");
```

> ⚠️ **注意：** 方法有重载，必须精确写出参数类型列表：`getMethod("foo")` 与 `getMethod("foo", String.class)` 指向不同方法。找不到时抛受检异常 `NoSuchMethodException`。

## 三、invoke 调用方法

### 1. 基本用法

官方签名：

```java
public Object invoke(Object obj, Object... args)
        throws IllegalAccessException, IllegalArgumentException,
               InvocationTargetException
```

- `obj`：方法所属的**实例对象**；**静态方法传 `null`**（会被忽略）
- `args`：实参列表，可变参数；无参方法传空或不传
- 返回值：`Object`——方法有返回值则返回（基本类型自动装箱）；`void` 方法返回 `null`

```java
import java.lang.reflect.Method;

public class Demo {
    public static void main(String[] args) throws Exception {
        User user = new User();

        // 调用有参方法
        Method setName = User.class.getMethod("setName", String.class);
        setName.invoke(user, "张三");                       // 等价于 user.setName("张三")

        // 调用无参方法，接收返回值
        Method getName = User.class.getMethod("getName");
        Object result = getName.invoke(user);              // 等价于 user.getName()
        System.out.println(result);                        // 张三

        // 基本类型返回值自动装箱：假设有 int getAge()
        Method getAge = User.class.getMethod("getAge");
        Integer age = (Integer) getAge.invoke(user);       // int → Integer 装箱
    }
}
```

### 2. 调用 private 方法

两步走：`getDeclaredMethod` 拿到 → `setAccessible(true)` 解锁。

```java
Method secret = User.class.getDeclaredMethod("secret", String.class);
secret.setAccessible(true);                    // ✅ 关闭访问检查
Object out = secret.invoke(user, "暗号");       // 等价于 user.secret("暗号")
```

> ⚠️ **注意：** 漏掉 `setAccessible(true)` 直接 `invoke`，会抛 `IllegalAccessException`。「拿到 `Method`」和「能调用」是两回事，详见 [setAccessible.md](./setAccessible.md)。

### 3. 调用静态方法

静态方法不属于实例，`invoke` 的第一个参数传 `null`（官方 javadoc：`If the underlying method is static, then the specified obj argument is ignored. It may be null.`）。

```java
public class MathUtil {
    public static int add(int a, int b) { return a + b; }
}

Method add = MathUtil.class.getMethod("add", int.class, int.class);
Object sum = add.invoke(null, 3, 5);   // obj 传 null，实参 3、5 自动装箱为 Integer
System.out.println(sum);               // 8
```

### 4. 多态行为：invoke 走的是运行时类型（动态查找）

官方 javadoc 明确：实例方法按 Java 语言规范的**动态方法查找**执行——「基于目标对象运行时类型的重写（overriding）会发生」。也就是说，**反射调用实例方法同样具有多态性**。

```java
class Animal {
    public void speak() { System.out.println("动物叫"); }
}

class Dog extends Animal {
    @Override
    public void speak() { System.out.println("汪汪"); }
}

Animal a = new Dog();                     // 父类引用指向子类对象
Method m = Animal.class.getMethod("speak");
m.invoke(a);                              // 输出：汪汪 —— 调的是 Dog 重写后的方法
```

### 5. 可变参数方法（varargs）的调用

可变参数方法 `void log(String format, Object... args)` 反射获取时有两个特征：

```java
Method log = Logger.class.getMethod("log", String.class, Object[].class);
// ① 参数类型要写「数组类型」Object[].class，因为 varargs 编译后就是一个数组参数
System.out.println(log.isVarArgs()); // true —— ② isVarArgs() 可判断是否为可变参数方法

// 调用：invoke(Object obj, Object... args) 本身也是可变参数，
// 想让 varargs 形参收到 {"张三", 20} 这个数组，要整体包一层再传
Object[] varargsValue = new Object[] {"张三", 20};          // 期望传给 log 的可变参数内容
log.invoke(loggerObj, "name=%s, age=%d", (Object) varargsValue); // ✅ format + varargs 数组
```

> ⚠️ **注意：** 两层可变参数嵌套是反射调用最容易踩的类型陷阱：直接 `log.invoke(loggerObj, "fmt", "张三", 20)` 会让 varargs 形参收到 `{"张三", 20}` 吗？不会——实参会被 `invoke` 的 `Object...` 逐个摊平，`args` 数组变成三个元素，与目标形参 `String, Object[]` 对不上，抛 `IllegalArgumentException`。拿不准时把实参组装成 `Object[]` 一次性传入，并确保长度与目标形参个数一致。

## 四、invoke 的异常体系

`invoke` 抛出的异常分两类，必须严格区分：

| 异常 | 含义 | 处理方式 |
| ---- | ---- | ---- |
| `IllegalAccessException` | 方法不可访问（private 未解锁、跨模块受限） | `setAccessible(true)` 或调整模块导出 |
| `IllegalArgumentException` | 实参与形参不匹配：个数不同、拆箱失败、类型无法转换 | 检查参数列表 |
| `NullPointerException` | 实例方法传了 `null` 对象 | 传入真实实例 |
| `InvocationTargetException` | **被调方法内部抛出了异常**，被包装后重新抛出 | `getCause()` 还原真实异常 |
| `ExceptionInInitializerError`（`Error`，不包装直接外抛） | 该方法**触发**的类初始化失败——静态代码块里抛了异常 | 修复静态初始化代码 |

`InvocationTargetException` 值得单独强调：

```java
// 目标方法内部抛了 RuntimeException
public void risky() {
    throw new IllegalStateException("业务炸了");
}

// 反射调用方
try {
    Method m = Service.class.getMethod("risky");
    m.invoke(service);
} catch (InvocationTargetException e) {
    // ❌ e 本身不含业务信息
    // ✅ getCause() 才是被调方法里真正抛出的异常
    Throwable real = e.getCause();
    System.out.println(real); // java.lang.IllegalStateException: 业务炸了
}
```

> ⚠️ **注意：** 官方 javadoc 对 `InvocationTargetException` 的定义是「wraps an exception thrown by an invoked method or constructor」——它只是个「包装壳」。框架代码里到处都是 `catch (InvocationTargetException e) { throw new RuntimeException(e.getCause()); }` 这样的解包逻辑，因为不还原异常链，日志就定位不了问题。

## 五、Method 的常用查询方法

| 方法 | 说明 |
| ---- | ---- |
| `getName()` | 方法名 |
| `getReturnType()` | 返回值类型的 `Class` 对象 |
| `getParameterTypes()` | 参数类型数组 `Class<?>[]` |
| `getExceptionTypes()` | throws 声明的异常类型数组 |
| `getModifiers()` | 修饰符整数（配合 `Modifier` 解析） |
| `isVarArgs()` | 是否可变参数方法 |
| `isBridge()` | 是否桥接方法（泛型擦除产生的合成方法） |
| `isDefault()` | 是否接口的 default 方法 |
| `isSynthetic()` | 是否编译器生成的合成方法 |
| `toGenericString()` | 含泛型、修饰符的完整方法签名描述 |
| `getDeclaringClass()` | 声明该方法的类（判断方法来自父类还是本类） |

```java
Method m = User.class.getDeclaredMethod("secret", String.class);

System.out.println(m.getName());            // secret
System.out.println(m.getReturnType());      // class java.lang.String
System.out.println(m.getParameterTypes().length); // 1
System.out.println(m.toGenericString());    // private java.lang.String User.secret(java.lang.String)
System.out.println(m.getDeclaringClass());  // class User
```

> 💡 **提示：** 泛型方法反射时会看到 `isBridge()` 为 `true` 的「同名同参数」方法——那是编译器为泛型擦除生成的桥接方法。框架按名称查找方法时要注意用 `isBridge()` 过滤，否则可能拿到语义不对的那一个。泛型详见 [反射与泛型.md](./反射与泛型.md)。

## 六、注意事项

1. **性能**：`getMethod` 查找 + `invoke` 检查比直接调用慢；热点路径要缓存 `Method` 对象，并 `setAccessible(true)` 跳过访问检查（能明显提速），详见 [反射性能优化.md](./反射性能优化.md)。
2. **`invoke` 对实例方法做动态查找**，具有多态性——调的永远是目标对象**运行时类型**的重写版本，反射**无法绕过重写**去调用父类版本（即使 `Method` 是从父类拿的、传入的是父类引用也一样）。确实需要「绕过分发」时，只能用 `MethodHandles.Lookup.findSpecial`（对应字节码 `invokespecial` 语义），普通反射做不到。
3. **`invoke` 会触发类初始化**：调用静态方法时，若声明类尚未初始化，会先初始化（执行静态代码块）。
4. **`void` 方法返回 `null`**：不要假设 `invoke` 一定返回有效对象，先判 `getReturnType() == void.class` 或直接判空。
5. **`InvocationTargetException` 必须解包**：`getCause()` 拿真实异常，否则丢根因。

## 七、使用场景

| 场景 | 说明 |
| ---- | ---- |
| Spring MVC | 请求到达时，根据 `@RequestMapping` 找到 Controller 方法并 `invoke(request参数...)` |
| JUnit / 测试框架 | 扫描 `@Test` 注解的方法，反射实例化类后逐个 `invoke` |
| MyBatis Mapper | Mapper 接口的方法调用被动态代理拦截，转发给 SQL 执行引擎 |
| 事件回调 | 简易事件总线：注册「对象 + Method」，事件到达时 `invoke` |
| getter/setter 调用 | ORM、JSON 框架按属性名拼出 `get Xxx`/`setXxx` 方法名后反射调用 |
| 跨版本兼容 | 运行时探测某方法是否存在（`getMethod` + `NoSuchMethodException`），存在则用新逻辑 |

## 八、总结

- `Method` 代表类的一个具体方法，`getMethod`（public 含继承）或 `getDeclaredMethod`（本类声明含 private）获取，`invoke(obj, args...)` 动态执行。
- `invoke` 第一参数是实例（**静态方法传 `null`**）；返回值统一装箱为 `Object`，`void` 返回 `null`。
- 反射调用实例方法同样遵循**动态查找（多态）**，调的是目标对象运行时类型的重写版本。
- 被调方法内部抛出的异常被包装成 `InvocationTargetException`，**必须 `getCause()` 还原**，这是反射排障第一坑。
- `Method` 自带丰富元信息（返回类型、参数类型、桥接方法判断等），是框架做「方法分发」的基础设施。
