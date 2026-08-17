### 1. Proxy
* new Proxy(target, handler) 创建一个代理对象，target为目标对象，handler是一个包含捕获器（trap）的对象
* handler对象的属性有13种，和Relfect(反射)一一对应
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

> ⚠️ **注意：** 早期草案中还有第 14 个捕获器 `enumerate`（配合 `for...in`），但在 ES2015 正式发布前被移除，现在的 `for...in` 不经过 Proxy 拦截。

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

  // 如果不用 Reflect，方法被调用时 this 会指向**原对象 target**而非代理
  const badProxy = new Proxy(obj, {
    get(target, prop) {
      return target[prop]; // this 指向 obj
    }
  });

  console.log(badProxy.getName()); // 'Alice'（本例碰巧一致）

  // 两者真正产生差异的场景：属性在原型上且是 getter 时
  // getter 里的 this 由"接收者"（receiver）决定，this 是谁就读谁的 data
  const base = { get level() { return this.data; } };
  const child = Object.create(base); // child 自身没有 data

  const view1 = { data: '视图1的数据' };
  const view2 = { data: '视图2的数据' };

  Reflect.get(child, 'level', view1); // '视图1的数据'（getter 的 this 是 view1）
  Reflect.get(child, 'level', view2); // '视图2的数据'（getter 的 this 是 view2）
  child.level;                        // undefined（不传 receiver 时 this 是 child，而 child 没有 data）

  // 在 Proxy 中的意义：通过代理访问 p.level 时，receiver 就是 p 本身。
  // 把 receiver 传给 Reflect.get，原型上 getter 的 this 就指向代理而非原始对象，
  // getter 里再读 this.xxx 时会继续经过代理的 get 拦截器（Vue 3 响应式依赖这个机制）

```
### 4. 注意
* 性能开销比直接操作对象大，因为每次访问或修改属性都会触发捕获器。

