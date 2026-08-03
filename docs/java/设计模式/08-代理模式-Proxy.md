# 代理模式（Proxy）⭐⭐⭐⭐⭐

> 参考资源：
> - [菜鸟教程 - 代理模式](https://www.runoob.com/design-pattern/proxy-pattern.html)
> - [Refactoring.Guru - 代理模式](https://refactoring.guru/zh/design-patterns/proxy)

---

## 一、概述

### 1. 是什么

**代理模式（Proxy）** 为其他对象提供一个**代理**以控制对这个对象的访问。代理对象在客户端和目标对象之间起到中介作用，可以在不修改目标对象的前提下增加额外功能。

### 2. 解决什么问题

- 想在访问目标对象前后加额外逻辑（日志、权限、缓存）
- 目标对象创建成本高，需要延迟加载
- 远程对象需要本地代理（RPC）
- 控制对目标对象的访问权限

### 3. 通俗类比

房东（目标对象）不直接面对租客，而是通过**中介（代理）**出租房子。中介可以在租房前后加上「带看房、签合同、收押金」等附加动作。

### 4. 类图简图

```
┌────────────────┐  uses   ┌────────────────┐  delegates   ┌────────────────┐
│    Client      │────────▶│   Proxy        │─────────────▶│   RealSubject  │
│                │         │ -realSubject   │              │ (目标对象)      │
└────────────────┘         │ +request()     │              │ +request()     │
                           └────────────────┘              └────────────────┘
                                  △
                                  │ 实现同一接口
                           ┌────────────────┐
                           │   Subject      │
                           │ +request()     │
                           └────────────────┘
```

**核心角色：**
- **Subject（抽象主题）**：代理和目标对象的共同接口
- **RealSubject（真实主题）**：被代理的目标对象
- **Proxy（代理）**：持有目标对象的引用，控制对其访问

---

## 二、三种实现方式

### 1. 静态代理

```java
interface UserService { void save(); }
// 目标对象
class UserServiceImpl implements UserService {
    public void save() { System.out.println("保存用户"); }
}
// 代理对象：与目标实现同一接口，在前后增加日志
class UserServiceProxy implements UserService {
    private final UserService target;
    public UserServiceProxy(UserService target) { this.target = target; }
    public void save() {
        System.out.println("[日志] 方法开始");      // 前置增强
        target.save();                              // 调用目标
        System.out.println("[日志] 方法结束");      // 后置增强
    }
}
// 使用
new UserServiceProxy(new UserServiceImpl()).save();
```

- **缺点**：每个目标类都要手写一个代理类，类爆炸。

---

### 2. JDK 动态代理（基于接口）

利用反射在**运行时**动态生成代理类，无需手写。要求目标对象**必须实现接口**。

```java
import java.lang.reflect.*;

// 通用调用处理器：可代理任意接口
class LogInvocationHandler implements InvocationHandler {
    private final Object target;
    public LogInvocationHandler(Object target) { this.target = target; }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("[日志] " + method.getName() + " 开始");
        Object result = method.invoke(target, args);   // 反射调用目标方法
        System.out.println("[日志] " + method.getName() + " 结束");
        return result;
    }
}

// 使用：Proxy.newProxyInstance 生成代理对象
UserService target = new UserServiceImpl();
UserService proxy = (UserService) Proxy.newProxyInstance(
        target.getClass().getClassLoader(),
        target.getClass().getInterfaces(),
        new LogInvocationHandler(target));
proxy.save();
```

**JDK 动态代理原理：**
1. `Proxy.newProxyInstance()` 在运行时动态生成代理类字节码
2. 生成的代理类继承了 `Proxy` 类并实现了目标接口
3. 调用方法时转发到 `InvocationHandler.invoke()`

---

### 3. CGLIB 动态代理（基于子类继承）

当目标类**没有实现任何接口**时，JDK 代理无法使用。CGLIB 通过**生成目标类的子类**来实现代理，不要求接口。

```java
import net.sf.cglib.proxy.*;

class LogMethodInterceptor implements MethodInterceptor {
    public Object intercept(Object obj, Method method, Object[] args, MethodProxy proxy) throws Throwable {
        System.out.println("[CGLIB] 方法开始");
        Object result = proxy.invokeSuper(obj, args);   // 调用父类（原方法）
        System.out.println("[CGLIB] 方法结束");
        return result;
    }
}
// 使用
Enhancer enhancer = new Enhancer();
enhancer.setSuperclass(UserServiceImpl.class);          // 设置父类（目标类）
enhancer.setCallback(new LogMethodInterceptor());
UserServiceImpl proxy = (UserServiceImpl) enhancer.create();
proxy.save();
```

**CGLIB 局限：** 无法代理 `final` 类和 `final` 方法（子类无法重写）。

---

## 三、三种代理对比

| 代理方式 | 实现机制 | 是否需要接口 | 性能 | 典型应用 |
| --- | --- | --- | --- | --- |
| 静态代理 | 编译时手写代理类 | 否 | 高 | 简单场景 |
| JDK 动态代理 | 反射 + 接口 | **是** | 中 | Spring AOP（默认，目标有接口时） |
| CGLIB 动态代理 | 字节码生成子类 | 否 | 较高 | Spring AOP（目标无接口时） |

> 💡 **提示：** Spring AOP 底层就是动态代理：目标类实现了接口用 JDK 代理，否则用 CGLIB。

---

## 四、适用场景

| 场景 | 例子 |
| --- | --- |
| 日志记录 | 记录方法调用前后日志 |
| 权限控制 | 调用前检查用户权限 |
| 缓存 | 缓存方法返回值 |
| 延迟加载 | 图片懒加载（先显示占位图） |
| 远程代理 | RPC 调用（本地代理远程对象） |

---

## 五、JDK / Spring 中的应用

| 框架 | 应用 |
| --- | --- |
| Spring | AOP（JDK 动态代理 / CGLIB）—— 事务、日志、权限 |
| RMI | 远程方法调用 —— 本地 Stub 代理远程对象 |
| MyBatis | Mapper 接口代理 —— 接口无实现类，运行时动态代理生成实现 |
| Hibernate | 延迟加载 —— 实体对象的关联属性用代理实现懒加载 |

---

## 六、注意事项

1. **JDK 代理必须基于接口** —— 没有接口的目标类只能用 CGLIB。
2. **CGLIB 不能代理 final** —— final 类和 final 方法无法被子类重写。
3. **代理对象调用自身方法不会被拦截** —— 因为内部调用不走代理。
4. **Spring AOP 自调用问题** —— 同一个类中方法互相调用，AOP 不会生效。

```java
// Spring AOP 自调用失效示例
@Service
public class UserService {
    public void methodA() {
        methodB();  // ❌ 这里 methodB 上的 @Transactional 不会生效
    }
    @Transactional
    public void methodB() { ... }
}
```

---

## 七、面试常见问题

### Q：动态代理 JDK 和 CGLIB 的区别？

**答：**
- **JDK 动态代理**：基于**接口**，目标类必须实现接口；通过 `Proxy.newProxyInstance` + `InvocationHandler` 实现；JDK 自带无需依赖。
- **CGLIB**：基于**继承**（生成目标类子类），不要求接口；通过 `Enhancer` + `MethodInterceptor` 实现；需引入 CGLIB 库。
- **Spring AOP 选择规则**：目标类实现了接口默认用 JDK 代理；否则用 CGLIB；可强制使用 CGLIB（`proxyTargetClass=true`）。
- **性能**：高版本 JDK 下 JDK 动态代理性能已大幅提升，两者差距不明显。

### Q：代理模式和装饰器模式的区别？

**答：** 见 [装饰器模式](./07-装饰器模式-Decorator.md) 中的对比。核心区别：代理控制访问（调用方无感），装饰器增强功能（调用方主动包装）。

### Q：Spring AOP 的实现原理？

**答：** Spring AOP 基于动态代理实现：
- 目标类实现了接口 → 使用 JDK 动态代理
- 目标类没有实现接口 → 使用 CGLIB 生成子类代理
- 通知（Advice）封装在 `InvocationHandler.invoke()` 或 `MethodInterceptor.intercept()` 中
- 通过 Pointcut 表达式匹配目标方法，在方法执行前后织入增强逻辑
