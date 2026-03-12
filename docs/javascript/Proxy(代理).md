### 1. Proxy
* new Proxy(target, handler) 创建一个代理对象，target为目标对象，handler是一个包含捕获器（trap）的对象
* handler对象的属性有14种，和Relfect(反射)一一对应
```js
const target = { name: 'Alice', age: 25 };

  const handler = {
    get: function(obj, prop) {
      console.log(`读取属性: ${prop}`);
      return obj[prop];
    },

    set: function(obj, prop, value) {
      console.log(`设置属性: ${prop} = ${value}`);
      obj[prop] = value;
      return true;
    }
  };

  const proxy = new Proxy(target, handler);

  proxy.name; // 输出: 读取属性: name
  proxy.age = 26; // 输出: 设置属性: age = 26

```
### 2. handler对象属性
* 1. get(target, prop, receiver)
  * 当读取代理对象的属性时触发，返回属性的值。
  * `receiver`参数是**代理对象**本身，可以用来保持正确的`this`绑定。
* 2. set(target, prop, value, receiver)
  * 当设置代理对象的属性时触发，返回一个布尔值表示是否成功设置。
  * `value`参数是设置的值，`receiver`参数是代理对象本身。
* 3. has(target, prop)
  * 当检查代理对象是否有某个属性时触发，返回一个布尔值。
* 4. deleteProperty(target, prop)
  * 当删除代理对象的属性时触发，返回一个布尔值表示是否成功删除。
* 5. ownKeys(target)
  * 当获取代理对象的所有自身属性名时触发，返回一个数组。
* 6. apply(target, thisArg, argumentsList)
  * 当调用代理对象作为函数时的行为进行拦截。
* 7. construct(target, argumentsList, newTarget)
  * 当使用new操作符创建代理对象实例时的行为进行拦截。
* 8. getOwnPropertyDescriptor(target, prop)
  * 当获取代理对象上某个属性的描述信息时触发，返回该属性的描述对象或undefined。
* 9. defineProperty(target, prop, descriptor)
  * 当定义代理对象上的新属性或者修改现有属性时触发，返回一个布尔
  * 值表示是否成功定义或修改。
* 10. getPrototypeOf(target)
  * 当获取代理对象的原型时触发，返回原型的引用。
* 11. setPrototypeOf(target, proto)
  * 当设置代理对象的原型时触发，返回一个布尔值表示是否成功设置。
* 12. isExtensible(target)
  * 当检查代理对象是否可扩展时触发，返回一个布尔值。
  * 可扩展性指的是对象是否可以添加新的属性
* 13. preventExtensions(target) 
  * 当阻止代理对象扩展时触发，返回一个布尔值表示是否成功阻止。
* 14. enumerate(target)
  * 当枚举代理对象的属性时触发，返回一个迭代器对象。
  * 枚举指的是获取对象所有可枚举属性的键值对

### 3. this指向
* 在Proxy的get捕获器中，如果要保持正确的this绑定（即让方法中的`this`指向**代理对象本身**），应该使用Reflect.get(target, prop, receiver)而不是直接访问属性。
```js
const obj = {
    name: 'Alice',
    getName() {
      return this.name;
    }
  };

  const proxy = new Proxy(obj, {
    // target: 目标对象，prop: 属性名，receiver: Proxy 或继承Proxy的对象
    get(target, prop, receiver) {
      // 使用 receiver 保持正确的 this 绑定，this指向 proxy 对象
      return Reflect.get(target, prop, receiver);
    }
  });

  console.log(proxy.getName()); // 'Alice'

  // 如果不用 Reflect，this 会指向原对象
  const badProxy = new Proxy(obj, {
    get(target, prop) {
      return target[prop]; // this 指向 obj
    }
  });

  console.log(badProxy.getName()); // 'Alice' (但如果 obj.name 改变，结果可能不同)

```
### 4. 注意
* 性能开销比直接操作对象大，因为每次访问或修改属性都会触发捕获器。

