# TypeScript 装饰器

## 一、什么是装饰器

**装饰器（Decorator）** 是一种特殊的声明，可以附加到**类、方法、属性、参数和访问符**上，用于修改或扩展其行为。

装饰器的本质是一个**函数**，接受目标对象作为参数，返回修改后的对象或元数据。

```typescript
// 装饰器的基本语法
@decoratorName
class MyClass {}
```

### 核心概念

装饰器模式是一种设计模式，允许在不修改原始代码的情况下，动态地为对象添加功能。在 TypeScript 中，装饰器提供了一种**声明式**的语法来实现这一模式。

**类比理解**：
- 就像给手机贴膜、戴壳——不改变手机本身，但增加了保护功能
- 就像给函数包装一层逻辑（高阶函数），在执行前后添加额外行为

### 执行时机

装饰器在**编译时**（而非运行时）执行，这意味着：
- 装饰器在代码定义阶段就会应用
- 可以在类实例化前修改类的结构和行为

## 二、装饰器的分类

TypeScript 中的装饰器根据作用目标不同，分为以下五种：

| 装饰器类型 | 作用目标 | 参数个数 | 说明 |
|-----------|---------|---------|------|
| 类装饰器 | 类声明 | 1 个（constructor） | 用于修改或替换类的定义 |
| 方法装饰器 | 类的方法 | 3 个（target, propertyKey, descriptor） | 用于修改方法的行为 |
| 属性装饰器 | 类的属性 | 2 个（target, propertyKey） | 用于修改属性的行为 |
| 访问符装饰器 | getter/setter | 3 个（target, propertyKey, descriptor） | 用于修改访问符的行为 |
| 参数装饰器 | 方法的参数 | 3 个（target, propertyKey, parameterIndex） | 用于标记或验证参数 |

## 三、文档导航

本目录下按装饰器类型和应用场景分类，包含以下文档：

### 基础篇
- [类装饰器](./类装饰器.md) — Class Decorator 的用法与示例
- [方法装饰器](./方法装饰器.md) — Method Decorator 的用法与示例
- [属性装饰器](./属性装饰器.md) — Property Decorator 的用法与示例
- [访问符装饰器](./访问符装饰器.md) — Accessor Decorator 的用法与示例
- [参数装饰器](./参数装饰器.md) — Parameter Decorator 的用法与示例

### 进阶篇
- [装饰器执行顺序](./装饰器执行顺序.md) — 多个装饰器叠加时的执行顺序规则
- [装饰器应用场景](./装饰器应用场景.md) — AOP、依赖注入、路由、缓存等实际应用
- [装饰器注意事项](./装饰器注意事项.md) — 类型安全、性能、兼容性等注意事项

## 四、启用装饰器

在 `tsconfig.json` 中启用：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

> **注意**：TypeScript 5.0+ 开始支持新的 ECMAScript Stage 3 装饰器标准，与旧版实验性装饰器不兼容，使用时需注意版本选择。详见 [装饰器注意事项](./装饰器注意事项.md)。

## 五、装饰器工厂

当装饰器需要接收参数时，需要使用**装饰器工厂**模式——一个返回装饰器函数的函数：

```typescript
// 装饰器工厂：接收参数，返回装饰器
function AddMetadata(metadata: string) {
  return function (constructor: Function) {
    constructor.prototype.metadata = metadata;
  };
}

@AddMetadata('这是元数据')
class UserService {}

console.log(new UserService().metadata); // 这是元数据
```

## 六、参考链接

- [TypeScript 官方文档 — Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [TC39 装饰器提案](https://github.com/tc39/proposal-decorators)
