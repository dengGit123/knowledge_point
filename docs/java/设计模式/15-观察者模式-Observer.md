# 观察者模式（Observer）⭐⭐⭐⭐⭐

> 参考资源：
> - [菜鸟教程 - 观察者模式](https://www.runoob.com/design-pattern/observer-pattern.html)
> - [Refactoring.Guru - 观察者模式](https://refactoring.guru/zh/design-patterns/observer)

---

## 一、概述

### 1. 是什么

**观察者模式（Observer）** 定义对象间的**一对多**依赖关系：当一个对象（主题/被观察者）的状态发生变化时，所有依赖于它的对象（观察者）都会得到通知并自动更新。

### 2. 解决什么问题

- 一个对象状态变化，需要通知多个其他对象
- 对象之间存在发布-订阅关系
- 需要实现事件监听机制

### 3. 通俗类比

微信公众号——你关注了某个公众号（注册成为观察者），公众号发文时所有粉丝都会收到推送（通知）。Vue 的「响应式」底层就是观察者模式。

### 4. 类图简图

```
┌──────────────────┐  notify   ┌──────────────────┐
│  Subject(主题)   │──────────▶│ <<interface>>    │
│ -observers:List  │ register  │  Observer        │
│ +attach()        │◀──────────│ +update()        │
│ +detach()        │           └────────┬─────────┘
│ +notify()        │                    △
└────────┬─────────┘            ┌───────┴────┬────────┐
         △ extends              │            │        │
┌────────┴─────────┐     ┌──────┴───┐ ┌──────┴─┐ ┌────┴───┐
│ ConcreteSubject  │     │ ObserverA│ │ ObsB   │ │ ObsC   │
│ +getState()      │     └──────────┘ └────────┘ └────────┘
└──────────────────┘
```

**核心角色：**
- **Subject（主题）**：被观察者，维护观察者列表，提供注册/注销方法
- **Observer（观察者）**：定义更新接口
- **ConcreteSubject（具体主题）**：状态变化时通知所有观察者
- **ConcreteObserver（具体观察者）**：收到通知后执行更新逻辑

---

## 二、代码示例：天气广播

```java
import java.util.*;

// 观察者接口
interface Observer { void update(float temperature); }
// 主题（被观察者）
class WeatherStation {
    private final List<Observer> observers = new ArrayList<>();   // 观察者列表
    private float temperature;
    public void attach(Observer o) { observers.add(o); }          // 注册
    public void detach(Observer o) { observers.remove(o); }       // 注销
    public void setTemperature(float t) {
        this.temperature = t;
        notifyAllObservers();                                     // 状态变化时通知
    }
    private void notifyAllObservers() {
        for (Observer o : observers) o.update(temperature);
    }
}
// 具体观察者：手机显示屏
class PhoneDisplay implements Observer {
    public void update(float t) { System.out.println("手机显示：当前温度 " + t + "℃"); }
}
// 具体观察者：窗户显示屏
class WindowDisplay implements Observer {
    public void update(float t) { System.out.println("窗户显示：当前温度 " + t + "℃"); }
}

// 使用
WeatherStation station = new WeatherStation();
station.attach(new PhoneDisplay());
station.attach(new WindowDisplay());
station.setTemperature(26.5f);   // 温度变化，两个显示屏同时更新
```

---

## 三、推模型 vs 拉模型

### 1. 推模型（Push）

主题把详细信息推送给观察者（上面示例就是推模型）。

```java
// 推模型：主题把完整数据推给观察者
public void notifyAllObservers() {
    for (Observer o : observers) {
        o.update(temperature, humidity, pressure);  // 推送所有数据
    }
}
```

### 2. 拉模型（Pull）

主题只通知「有变化」，观察者按需拉取具体数据。

```java
// 拉模型：观察者自己拉取需要的数据
interface Observer {
    void update(Subject subject);  // 传入主题引用
}
class PhoneDisplay implements Observer {
    public void update(Subject subject) {
        // 按需拉取
        float temp = subject.getTemperature();
        System.out.println("手机显示：当前温度 " + temp + "℃");
    }
}
```

> 💡 **提示：** 拉模型更灵活（观察者可以自己决定要什么数据），推模型更简单直接。

---

## 四、适用场景

| 场景 | 例子 |
| --- | --- |
| 事件监听 | GUI 按钮点击、键盘输入 |
| 发布-订阅 | 微信公众号、消息队列 |
| 数据同步 | 数据库数据变化同步到缓存 |
| 响应式编程 | Vue 响应式、RxJava |
| 状态监控 | 服务器状态变化通知管理员 |

---

## 五、JDK / Spring 中的应用

| 框架 | 应用 |
| --- | --- |
| JDK | `java.util.Observable` 类 + `Observer` 接口（Java 9 已废弃） |
| JDK | `PropertyChangeListener` —— JavaBean 属性变化监听 |
| JDK | AWT/Swing 事件监听器（`ActionListener`、`MouseListener`） |
| Spring | `ApplicationEvent` + `ApplicationListener` —— 事件机制 |
| Spring | `@EventListener` 注解 —— 声明式事件监听 |
| MQ | Kafka、RabbitMQ —— 发布-订阅（分布式观察者） |

---

## 六、Spring 事件机制示例

```java
// 1. 定义事件
public class OrderCreatedEvent extends ApplicationEvent {
    private String orderId;
    public OrderCreatedEvent(Object source, String orderId) {
        super(source);
        this.orderId = orderId;
    }
    public String getOrderId() { return orderId; }
}

// 2. 发布事件
@Service
public class OrderService {
    @Autowired ApplicationEventPublisher publisher;
    public void createOrder(String orderId) {
        // ... 创建订单逻辑
        publisher.publishEvent(new OrderCreatedEvent(this, orderId));
    }
}

// 3. 监听事件
@Component
public class EmailListener {
    @EventListener
    public void onOrderCreated(OrderCreatedEvent event) {
        System.out.println("发送邮件：订单 " + event.getOrderId() + " 已创建");
    }
}
```

---

## 七、注意事项

1. **观察者顺序不确定** —— 通知观察者的顺序不保证，不要依赖顺序。
2. **内存泄漏** —— 观察者注册后要记得注销，否则主题持有观察者引用无法 GC。
3. **循环调用** —— 观察者中修改主题状态可能引发无限循环。
4. **性能问题** —— 观察者太多时，逐个通知会变慢，考虑异步通知。

---

## 八、面试常见问题

### Q：观察者模式和发布-订阅模式是一回事吗？

**答：** 严格区分的话：
- **观察者模式**：主题（Subject）**直接通知**观察者，二者有直接依赖，通常同步。
- **发布-订阅模式**：发布者和订阅者**互不认识**，通过一个**事件总线/消息代理（Broker）**间接通信，通常异步、跨进程。
- 日常开发中常把两者混用，但分布式场景（如 Kafka、RabbitMQ）严格属于发布-订阅。

### Q：观察者模式在哪些框架中有应用？

**答：**
- **Spring**：`ApplicationEvent` + `ApplicationListener` 事件机制
- **JDK**：AWT/Swing 事件监听、`PropertyChangeListener`
- **Vue**：响应式系统的核心就是观察者模式
- **消息队列**：Kafka、RabbitMQ 是分布式的发布-订阅（观察者模式的扩展）
