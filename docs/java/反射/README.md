# 反射（Reflection）知识库

> 📖 官方文档：[Java Reflection API 教程 (Oracle)](https://docs.oracle.com/javase/tutorial/reflect/) ｜ [java.lang.reflect API (Java SE 21)](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/reflect/package-summary.html)

本目录按知识点颗粒度拆分反射的各个专题，每篇独立成文，可按需查阅。

## 📚 目录导航

### 入门与核心

| 文档 | 内容 | 难度 |
| ---- | ---- | ---- |
| [Class对象.md](./Class对象.md) | 反射的入口：什么是 `Class` 对象、获取它的三种方式、加载与初始化的区别 | ⭐ |
| [获取类结构信息.md](./获取类结构信息.md) | `getXxx` 与 `getDeclaredXxx` 的区别、获取字段/方法/构造器/内部类的全套 API | ⭐⭐ |

### 三大成员操作

| 文档 | 内容 | 难度 |
| ---- | ---- | ---- |
| [Constructor.md](./Constructor.md) | 反射创建对象：构造器的获取、`newInstance`、废弃的 `Class.newInstance` | ⭐⭐ |
| [Method.md](./Method.md) | 反射调用方法：`invoke` 的参数规则、静态方法、可变参数、`InvocationTargetException` | ⭐⭐ |
| [Field.md](./Field.md) | 反射读写字段：`get`/`set`、类型化读写、静态字段、final 字段的限制 | ⭐⭐ |

### 访问控制与修饰符

| 文档 | 内容 | 难度 |
| ---- | ---- | ---- |
| [setAccessible.md](./setAccessible.md) | 突破 private 访问检查：`setAccessible`、`trySetAccessible`、`canAccess`、模块系统限制 | ⭐⭐ |
| [Modifier.md](./Modifier.md) | 读取与解析修饰符：`getModifiers`、`Modifier.toString`、位标志原理 | ⭐ |

### 进阶主题

| 文档 | 内容 | 难度 |
| ---- | ---- | ---- |
| [反射与数组.md](./反射与数组.md) | `java.lang.reflect.Array` 动态创建数组、按索引读写、多维数组 | ⭐⭐ |
| [反射与泛型.md](./反射与泛型.md) | 为什么泛型会被擦除、`Type` 体系、获取字段/方法的泛型实参 | ⭐⭐⭐ |
| [反射与注解.md](./反射与注解.md) | 运行时读取注解：`AnnotatedElement`、`getAnnotation`、元注解与 `RUNTIME` 保留策略 | ⭐⭐ |
| [动态代理.md](./动态代理.md) | 反射的高级应用：`Proxy` 与 `InvocationHandler`、AOP 的原理 | ⭐⭐⭐ |

### 实战与避坑

| 文档 | 内容 | 难度 |
| ---- | ---- | ---- |
| [反射常见异常.md](./反射常见异常.md) | 反射全家桶异常速查：触发原因、处理方式、异常链还原 | ⭐⭐ |
| [反射性能优化.md](./反射性能优化.md) | 为什么反射慢、缓存、`setAccessible` 提速、`MethodHandle` 替代方案 | ⭐⭐⭐ |
| [反射应用场景.md](./反射应用场景.md) | Spring IoC、JDBC 驱动加载、JSON 序列化、ORM 映射、动态代理等真实案例 | ⭐ |

## 🗺️ 学习路线建议

```text
第一遍（建立认知）：
Class对象 → 获取类结构信息 → Constructor → Method → Field

第二遍（深入理解）：
setAccessible → Modifier → 反射常见异常 → 反射性能优化

第三遍（进阶实战）：
反射与数组 → 反射与泛型 → 反射与注解 → 动态代理 → 反射应用场景
```

> 💡 **提示：** 反射是 Spring、MyBatis、Jackson 等框架的基石。学完本目录后，建议对照 [../注解.md](../注解.md) 与 [./动态代理.md](./动态代理.md) 一起阅读，能打通"注解 + 反射 + 代理"这条框架设计的核心链路。
