### 1. Reflect对象
* 提供了一套统一的**操作对象**的静态方法(14个方法)，使得操作对象的行为更加统一和明确。
* 不可以使用`new`关键字来创建`Reflect`的实例，因为`Reflect`不是一个构造函数。

### 2. 操作对象的属性
`[target]`: 目标对象，即要操作的对象的引用。
`[propertyKey]`: 属性名，可以是字符串或Symbol。
`[receiver]`: 可选参数， 默认为`target`。在某些情况下，例如通过代理对象访问属性时，可能需要指定接收者(receiver)来正确地获取或设置属性的值。

* 1. 可以通过`Reflect.get(target, propertyKey[, receiver])`来获取对象的属性值。
* 2. 可以通过`Reflect.set(target, propertyKey, value[, receiver])`来设置对象的属性值。
* 3. 可以通过`Reflect.deleteProperty(target, propertyKey)`来删除对象的属性。
* 4. 可以通过`Reflect.has(target, propertyKey)`来检查对象是否有某个属性- `in 操作符`。
* 5. 可以通过`Reflect.ownKeys(target)`来获取对象自身的所有属性键，包括不可枚举的。
* 6. 可以通过`Reflect.getOwnPropertyDescriptor(target, propertyKey)`来获取对象的属性描述符。
* 7. 可以通过`Reflect.defineProperty(target, propertyKey, attributes)`来定义对象的属性。

```js

  const obj = { name: 'Alice', age: 25 };

  // 替代 obj.x = value
  Reflect.set(obj, 'name', 'Bob');
  console.log(obj.name); // 'Bob'

  // 替代 obj.x
  console.log(Reflect.get(obj, 'age')); // 25

  // 替代 'x' in obj
  console.log(Reflect.has(obj, 'name')); // true
  console.log(Reflect.has(obj, 'email')); // false

  // 替代 delete obj.x
  Reflect.deleteProperty(obj, 'age');
  console.log(obj); // { name: 'Bob' }

  // 替代 Object.keys()
  console.log(Reflect.ownKeys(obj)); // ['name']

  // 替代 Object.getOwnPropertyDescriptor()
  const descriptor = Reflect.getOwnPropertyDescriptor(obj, 'name');
  console.log(descriptor); // { value: 'Bob', writable: true, enumerable: true, configurable: true }

  const obj = {};

  // 替代 Object.defineProperty()
  const success = Reflect.defineProperty(obj, 'id', {
    value: 1,
    writable: false,
    enumerable: true,
    configurable: false
  });

  console.log(success); // true (操作是否成功)
  console.log(obj.id); // 1

  // 尝试定义只读属性的值
  const failSuccess = Reflect.defineProperty(obj, 'id', {
    value: 2,
    writable: true
  });
  console.log(failSuccess); // false (操作失败)
  console.log(obj.id); // 1 (原值未变)
```

### 3. 原型操作
* 8. 可以通过`Reflect.getPrototypeOf(target)`来获取对象的原型。
* 9. 可以通过`Reflect.setPrototypeOf(target, prototype)`来设置对象的原型。
* 10. 可以通过`Reflect.isExtensible(target)`来检查对象是否可扩展。
* 11. 可以通过`Reflect.preventExtensions(target)`来阻止对象扩展。
```js
 const parent = { parentMethod() { return 'parent'; } };
  const child = Object.create(parent);

  // 替代 Object.getPrototypeOf()
  const proto = Reflect.getPrototypeOf(child);
  console.log(proto === parent); // true

  // 替代 Object.setPrototypeOf()
  Reflect.setPrototypeOf(child, null);
  console.log(Reflect.getPrototypeOf(child)); // null

  // 替代 Object.isExtensible()
  console.log(Reflect.isExtensible(child)); // true

  // 替代 Object.preventExtensions()
  Reflect.preventExtensions(child);
  console.log(Reflect.isExtensible(child)); // false
```
### 4. 函数操作
* 12. 可以通过`Reflect.apply(target, thisArg, args)`来调用函数。
* 13. 可以通过`Reflect.construct(target, args[, newTarget])`来构造函数的实例。
```js
  function greet() {
    return `Hello, ${this.name}!`;
  }

  const obj = { name: 'Alice' };

  // 替代 Function.prototype.call 和 Function.prototype.apply
  console.log(Reflect.apply(greet, obj)); // Hello, Alice!

  class Person {
    constructor(name) {
      this.name = name;
    }
  }
 // 替代 new Person()
  const person = Reflect.construct(Person, ['Bob']);
  console.log(person); // Person { name: 'Bob' }
  ```

  ### 5. 其他操作
  * 14. 可以通过`Reflect.enumerate(target)`来遍历对象的属性。
  ```js
  const obj = { a: 1, b: 2 };
  for (const key of Reflect.enumerate(obj)) {
    console.log(key); // 'a', 'b'
  }
  ```
  ### 6. 与 Proxy 的配合使用
  * 可以通过`Reflect`与`Proxy`配合使用，实现更灵活和强大的对象操作。

  ```js
  const validator = {
    // receiver : 代理对象内部的this值
    set(target, prop, value, receiver) {
      if (prop === 'age' && (typeof value !== 'number' || value < 0 || value
   > 150)) {
        throw new Error('年龄必须是0-150之间的数字');
      }

      // 使用 Reflect 进行默认操作
      return Reflect.set(target, prop, value, receiver);
    },

    get(target, prop, receiver) {
      if (prop === 'secret') {
        return undefined; // 隐藏敏感属性
      }

      return Reflect.get(target, prop, receiver);
    },

    has(target, prop) {
      if (prop.startsWith('_')) {
        return false; // 隐藏私有属性
      }

      return Reflect.has(target, prop);
    }
  };

  const person = new Proxy({}, validator);
  person.name = 'Alice';
  person.age = 25;
  person.secret = 'hidden';
  person._private = 'private';

  console.log(person.name); // 'Alice'
  console.log('age' in person); // true
  console.log('secret' in person); // false
  console.log('_private' in person); // false

  person.age = -5; // Error: 年龄必须是0-150之间的数字
  ```