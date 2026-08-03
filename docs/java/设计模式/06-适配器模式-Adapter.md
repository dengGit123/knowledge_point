# 适配器模式（Adapter）⭐⭐⭐⭐⭐

> 参考资源：
> - [菜鸟教程 - 适配器模式](https://www.runoob.com/design-pattern/adapter-pattern.html)
> - [Refactoring.Guru - 适配器模式](https://refactoring.guru/zh/design-patterns/adapter)

---

## 一、概述

### 1. 是什么

**适配器模式（Adapter）** 将一个类的接口转换成客户希望的另一个接口，使原本**接口不兼容**的类可以一起工作。

### 2. 解决什么问题

- 老系统/第三方库的接口与新系统不兼容
- 多个类的接口不统一，想统一调用
- 复用已有类，但接口不符合需求

### 3. 通俗类比

出国旅游，插座形状不对，需要带一个**转换插头（适配器）**。插头本身不变，适配器负责「翻译」——把当地插座形状转成你设备的插头形状。

### 4. 类图简图（对象适配器）

```
┌──────────────┐   target    ┌──────────────┐  delegate   ┌──────────────┐
│  Target(目标) │◀───────────│  Adapter     │────────────▶│ Adaptee(被适配)│
│ +request()   │             │ +request()   │             │ +specificReq()│
└──────────────┘             └──────────────┘             └──────────────┘
```

**核心角色：**
- **Target（目标接口）**：客户端期望的接口
- **Adaptee（被适配者）**：已有的、接口不兼容的类
- **Adapter（适配器）**：把 Adaptee 的接口转成 Target

---

## 二、两种实现方式

### 1. 类适配器（通过继承）

```java
// 目标接口（客户端期望的接口）
interface Target { void request(); }
// 被适配者（接口不兼容，比如第三方/老系统）
class Adaptee { public void specificRequest() { System.out.println("老接口方法"); } }

// 类适配器：通过继承 Adaptee
class ClassAdapter extends Adaptee implements Target {
    public void request() { super.specificRequest(); }
}
```

- **缺点**：Java 单继承，继承 Adaptee 后无法再继承其他类，灵活性差。

### 2. 对象适配器（通过组合，推荐）

```java
// 对象适配器：通过组合持有 Adaptee
class ObjectAdapter implements Target {
    private final Adaptee adaptee;                  // 组合
    public ObjectAdapter(Adaptee adaptee) { this.adaptee = adaptee; }
    public void request() { adaptee.specificRequest(); }  // 转发调用
}
```

- **优点**：组合比继承更灵活，符合合成复用原则。

---

## 三、实战示例：支付接口适配

```java
// 目标接口：新系统期望的统一支付接口
interface NewPayService {
    void pay(String orderId, double amount);
    void refund(String orderId, double amount);
}

// 被适配者 A：支付宝老接口（方法名不同）
class AliPayOld {
    public void aliPay(double amount, String order) {
        System.out.println("支付宝支付 " + amount + " 元，订单：" + order);
    }
}

// 被适配者 B：微信支付老接口
class WechatPayOld {
    public void wxPay(String order, double money) {
        System.out.println("微信支付 " + money + " 元，订单：" + order);
    }
}

// 支付宝适配器
class AliPayAdapter implements NewPayService {
    private final AliPayOld aliPay;
    public AliPayAdapter(AliPayOld aliPay) { this.aliPay = aliPay; }
    public void pay(String orderId, double amount) {
        aliPay.aliPay(amount, orderId);   // 转发调用
    }
    public void refund(String orderId, double amount) {
        System.out.println("支付宝退款 " + amount + " 元");
    }
}

// 微信适配器
class WechatPayAdapter implements NewPayService {
    private final WechatPayOld wechatPay;
    public WechatPayAdapter(WechatPayOld wechatPay) { this.wechatPay = wechatPay; }
    public void pay(String orderId, double amount) {
        wechatPay.wxPay(orderId, amount);
    }
    public void refund(String orderId, double amount) {
        System.out.println("微信退款 " + amount + " 元");
    }
}

// 使用：统一调用
NewPayService payService = new AliPayAdapter(new AliPayOld());
payService.pay("ORDER_001", 99.0);
```

---

## 四、适用场景

| 场景 | 例子 |
| --- | --- |
| 整合老系统 | 老接口与新系统不兼容 |
| 整合第三方库 | 不同厂商的 SDK 接口不统一 |
| 统一多个类的接口 | 多个数据源查询接口统一 |
| 版本升级兼容 | 新版本接口兼容旧版本调用方 |

---

## 五、JDK / Spring 中的应用

| 框架 | 应用 |
| --- | --- |
| JDK | `InputStreamReader` —— 把字节流 `InputStream` 适配成字符流 `Reader` |
| JDK | `OutputStreamWriter` —— 把字节流 `OutputStream` 适配成字符流 `Writer` |
| JDK | `java.util.Arrays.asList()` —— 把数组适配成 List |
| Spring | `HandlerAdapter` —— 适配不同类型的 Controller（@RequestMapping、Controller 接口等） |

---

## 六、注意事项

1. **优先用对象适配器** —— 组合优于继承，更灵活。
2. **适配器是「补救」设计** —— 在设计阶段就应避免接口不兼容的问题，适配器用于事后补救。
3. **不要过度适配** —— 如果适配逻辑太复杂，考虑重构被适配者。
4. **双向适配器** —— 有时需要双向转换，可以实现双向适配。

---

## 七、面试常见问题

### Q：适配器模式和装饰器模式、代理模式的区别？

**答：** 三者结构相似但**目的不同**：

| 模式 | 目的 | 关注点 |
| --- | --- | --- |
| 适配器 | **接口转换** | 让不兼容的接口能协同工作 |
| 装饰器 | **功能增强** | 动态给对象增加新功能 |
| 代理 | **访问控制** | 控制对目标对象的访问 |

一句话：适配器是「翻译官」，装饰器是「增强器」，代理是「守门人」。
