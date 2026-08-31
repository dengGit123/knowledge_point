# Field——反射读写字段

> 📖 官方文档：[Field (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/reflect/Field.html) ｜ [Oracle 反射教程 - Getting and Setting Field Values](https://docs.oracle.com/javase/tutorial/reflect/member/fieldValues.html)

## 一、概述

`java.lang.reflect.Field` 代表类里的**一个具体成员变量**（字段），通过它可以运行时**读取（`get`）和写入（`set`）**对象的字段值——不管这个字段是 `public` 还是 `private`（后者需 `setAccessible(true)`）。

ORM 框架把数据库列值回填到实体类字段、JSON 框架把字段值序列化成键值对、Spring 把依赖注入到 `@Autowired` 字段——底层全是 `Field.get` / `Field.set`。

> 💡 **类比：** `Field` 对象像「保险箱的钥匙孔定位器」。平时你只能走正门（public 的 getter/setter）访问房间里的东西；`Field` 帮你直接定位到墙里的保险箱（private 字段），`setAccessible(true)` 相当于拿到了万能钥匙，可以绕过正门直接取放物品。

## 二、获取 Field 对象

```java
Class<User> cls = User.class;

// 1. public 字段（含继承的）
Field f1 = cls.getField("name");

// 2. 本类声明的字段（含 private）—— 最常用
Field f2 = cls.getDeclaredField("age");

// 3. 批量获取
Field[] allPublic = cls.getFields();
Field[] declared = cls.getDeclaredFields();

// 4. 静态字段同样这样获取
Field f3 = cls.getDeclaredField("count"); // public static int count
```

> ⚠️ **注意：** 要区分「字段」和「属性」：反射操作的是**字段（field）**；框架常说的「属性（property）」指 getter/setter 对应的逻辑名。字段名 `age` 对应的 getter 是 `getAge()`。Jackson 等框架默认按字段或属性名匹配 JSON 键。

## 三、读取字段值：get 系列

### 1. 通用读法 `get(Object obj)`

```java
import java.lang.reflect.Field;

User user = new User("张三", 20);

// 读 public 字段
Field nameField = User.class.getField("name");
Object name = nameField.get(user);        // 等价于 user.name
System.out.println(name);                 // 张三

// 读 private 字段：先解锁
Field ageField = User.class.getDeclaredField("age");
ageField.setAccessible(true);             // ✅ 关闭访问检查
Object age = ageField.get(user);          // 等价于 user.age（绕过 getter）
System.out.println(age);                  // 20
```

官方语义要点（javadoc）：字段是基本类型时，`get` 返回**自动装箱**后的包装对象；`obj` 传 `null` 且字段是实例字段时抛 `NullPointerException`；`obj` 不是声明类的实例（或其子类实例）时抛 `IllegalArgumentException`。

### 2. 类型化读法：getInt / getLong / getBoolean ...

对基本类型字段，用类型化的 getter 更直接，省去装箱拆箱：

| 方法 | 对应字段类型 |
| ---- | ---- |
| `getInt(obj)` / `setInt(obj, v)` | `int` |
| `getLong(obj)` / `setLong(obj, v)` | `long` |
| `getDouble(obj)` / `setDouble(obj, v)` | `double` |
| `getBoolean(obj)` / `setBoolean(obj, v)` | `boolean` |
| `getChar(obj)` / `setChar(obj, v)` | `char` |
| `getByte(obj)` / `getShort(obj)` / `getFloat(obj)` | `byte` / `short` / `float` |

```java
Field ageField = User.class.getDeclaredField("age");
ageField.setAccessible(true);
int age = ageField.getInt(user);          // 直接拿 int，不经 Integer
```

> 💡 **提示：** 字段是 `int` 时 `get()` 与 `getInt()` 都能用——`get()` 返回 `Integer` 装箱对象，`getInt()` 直接返回 `int`。但**用错类型化方法会抛 `IllegalArgumentException`**：对 `String` 字段调 `getInt()` 不行。

### 3. 读静态字段

静态字段不属于实例，`get` 的对象参数**传 `null`**：

```java
Field countField = User.class.getField("count");  // public static int count
Object v1 = countField.get(null);                 // ✅ 静态字段传 null
Object v2 = countField.get(user);                 // 也能传对象，但会被忽略（官方：静态字段忽略 obj）
```

## 四、写入字段值：set 系列

### 1. 基本写法

```java
User user = new User("张三", 20);

// 写 public 字段
Field nameField = User.class.getField("name");
nameField.set(user, "李四");               // 等价于 user.name = "李四"

// 写 private 字段：先解锁
Field ageField = User.class.getDeclaredField("age");
ageField.setAccessible(true);
ageField.setInt(user, 99);                // 等价于 user.age = 99（类型化写法）

// 通用写法 set(obj, Object value)：基本类型字段传包装类，自动拆箱
ageField.set(user, Integer.valueOf(88));
```

`set` 的类型匹配规则（官方 javadoc）：基本类型字段会尝试**拆箱转换**，拆箱失败抛 `IllegalArgumentException`；拆箱后仅允许**恒等或加宽转换**（如 `int` 字段可接受 `Byte`/`Short`/`Integer`，不接受 `Long`——`long` 到 `int` 是收窄）。

### 2. 修改 final 字段的限制（重要）

官方 javadoc 对 `final` 字段的写入给出了明确条件——`Field` 对象对 final 字段**有写权限，当且仅当**以下条件全部满足：

1. `setAccessible(true)` 成功
2. 字段是**非静态**的（`static final` 一律不可通过反射修改，会抛 `IllegalAccessException`）
3. 声明类不是隐藏类（hidden class）
4. 声明类不是 record 类

即便满足条件、值也确实改了，**还有一个更隐蔽的坑**——常量内联：

```java
public class Trap {
    private final int a = 100;                 // 实例 final，编译期已知
    private static final int B = 200;          // 编译期常量

    public int getA() { return a; }

    public static void main(String[] args) throws Exception {
        Trap t = new Trap();

        // 实例 final 字段：技术上能改
        Field fa = Trap.class.getDeclaredField("a");
        fa.setAccessible(true);
        fa.setInt(t, 999);
        System.out.println(fa.getInt(t));   // 999 —— 字段存储的值确实变了
        System.out.println(t.getA());       // 100 或 999（取决于 JIT 是否已把 a 内联进 getter）
    }
}
```

```java
// 编译期常量的内联是「编译期」就发生的，反射完全无效
System.out.println(Trap.B);   // 编译器直接替换成 200，运行时根本不再读字段
```

> ⚠️ **注意：** `static final` 的基本类型/字符串常量（编译期常量）在使用处会被编译器**内联成字面量**，反射改字段值不影响已编译好的调用处；且现代 JVM（JDK 12+ 起，JEP 302 之后方向）对 `static final` 字段的反射修改限制越来越严。**生产代码永远不要依赖反射改 final 字段。**

## 五、Field 的常用查询方法

| 方法 | 说明 |
| ---- | ---- |
| `getName()` | 字段名 |
| `getType()` | 字段声明类型的 `Class` 对象（如 `int.class`、`String.class`） |
| `getGenericType()` | 含泛型的类型（`Type` 对象），泛型字段用，详见 [反射与泛型.md](./反射与泛型.md) |
| `getModifiers()` | 修饰符整数（配合 `Modifier.toString` 解析） |
| `isEnumConstant()` | 是否枚举常量 |
| `isSynthetic()` | 是否编译器生成的合成字段 |
| `getDeclaringClass()` | 声明该字段的类 |
| `toGenericString()` | 含泛型的完整字段描述 |

一个「字段值通用转字符串」的小工具示例，综合运用类型判断与读取：

```java
public static String fieldToString(Object obj, Field f) throws Exception {
    f.setAccessible(true);
    Class<?> type = f.getType();
    if (type == int.class)    return String.valueOf(f.getInt(obj));
    if (type == long.class)   return String.valueOf(f.getLong(obj));
    if (type == boolean.class)return String.valueOf(f.getBoolean(obj));
    Object v = f.get(obj);                    // 其余类型统一走 get
    return String.valueOf(v);
}
```

## 六、注意事项

1. **`setAccessible(true)` 与 `get/set` 是两步操作**：`getDeclaredField` 只是「拿到」，不解锁直接 `get`/`set` 抛 `IllegalAccessException`。
2. **类型必须匹配**：`set` 传错包装类型（如对 `int` 字段 `set(obj, "abc")`）抛 `IllegalArgumentException`；类型化方法 `getInt` 用错字段类型同样抛。
3. **静态字段传 `null`**，实例字段传真实对象——传反了就是 `NullPointerException` 或 `IllegalArgumentException`。
4. **`static final` 字段反射不可改**（官方明确抛 `IllegalAccessException`）；实例 `final` 字段虽可改但有内联风险，不要依赖。
5. **`Field` 会触发类初始化**：首次 `get`/`set` 静态字段时，若声明类未初始化，会先初始化。
6. **继承链上的字段访问**：`getDeclaredField` 只查本类，读父类私有字段要先 `getSuperclass()`。

## 七、使用场景

| 场景 | 说明 |
| ---- | ---- |
| ORM 结果集映射 | 按列名找到实体字段，`setAccessible(true)` 后 `set` 回填值 |
| JSON 序列化/反序列化 | Jackson/Gson 遍历字段 `get` 出值拼 JSON；反序列化 `set` 填充对象 |
| Spring 字段注入 | `@Autowired` 标注的字段，容器反射 `set` 注入依赖 |
| 对象拷贝 / BeanUtils | 逐字段 `get` 源对象、`set` 到目标对象 |
| 单元测试 | 私有字段读断言、私有字段注入 mock 对象 |
| 枚举与常量处理 | `isEnumConstant()` 识别枚举常量做特殊处理 |

## 八、总结

- `Field` 代表类的一个具体字段：`getDeclaredField` 拿到（含 private）→ `setAccessible(true)` 解锁 → `get`/`set` 读写。
- 基本类型字段优先用类型化方法（`getInt`/`setInt`）避免装箱；`set` 对基本类型自动拆箱，仅接受恒等或加宽转换。
- 静态字段读写时对象参数传 `null`。
- `static final` 字段反射不可改（抛 `IllegalAccessException`）；实例 `final` 字段可改但存在常量内联与 JIT 优化风险，禁止在生产依赖此行为。
- `Field.getGenericType()` 是获取字段泛型实参（如 `List<String>` 里的 `String`）的唯一途径，详见 [反射与泛型.md](./反射与泛型.md)。
