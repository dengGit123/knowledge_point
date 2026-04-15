### 一. Map 的详细用法
#### 1. 构造与初始化
```
// 空 Map
const map1 = new Map();

// 从可迭代对象（如数组）初始化，每个元素是 [key, value] 形式的数组
const map2 = new Map([
  ['name', 'Alice'],
  ['age', 25],
  ['job', 'Engineer']
]);

// 也可以从其他 Map 或生成器创建
const map3 = new Map(map2);
```
#### 2. 全部实例方法
|方法|描述|返回值|
|:--:|:--:|:--:|
|`set(key, value)`|添加/更新键值对，返回 Map 自身（可链式调用）|`Map`|
|`get(key)`|获取键对应的值，不存在返回 undefined|任意类型|
|`has(key)`|检查键是否存在|`boolean`|
|`delete(key)`|删除键值对，成功返回 `true`，失败返回 `false`|`boolean`|
|`clear()`|清空所有键值对|`undefined`|
|`size (属性)`|返回键值对的数量|`number`|
> 💡 **提示：** key可以任意类型
#### 3. 键的特殊行为
##### 1. 键的相等性
* 使用 SameValueZero 算法（类似 `===`，但 `NaN` 等于 `NaN`）
* `0`和 `-0`被视为相等
```
const map = new Map();
map.set(NaN, 'not a number');
map.get(NaN);        // 'not a number'

map.set(0, 'positive');
map.get(-0);         // 'positive'（因为 0 和 -0 被视为相同）
```
##### 2. 对象作为键
```
const user1 = { id: 1 };
const user2 = { id: 2 };

const map = new Map();
map.set(user1, 'admin');
map.set(user2, 'guest');

map.get(user1);   // 'admin'
map.get({ id: 1 }); // undefined（不同对象引用）
```
#### 4. 遍历方法
* Map 是可迭代的，默认迭代器返回 `[key, value]` 对
* 遍历顺序为插入顺序
```js
const map = new Map([
  ['a', 1],
  ['b', 2],
  ['c', 3]
]);

// 1. forEach（按插入顺序）
map.forEach((value, key, map) => {
  console.log(key, value);
});

// 2. for...of
for (const [key, value] of map) {
  console.log(key, value);
}

// 3. 使用迭代器方法
for (const key of map.keys()) { ... }      // 键迭代器
for (const value of map.values()) { ... }  // 值迭代器
for (const entry of map.entries()) { ... } // 条目迭代器（等同于 map[Symbol.iterator]）
```
#### 5. 注意事项
* 内存泄漏风险：Map 持有对键对象的强引用。如果键是一个**大对象**，且你忘记删除它，即使该对象在其他地方不再被引用，它仍然会留在 Map 中，无法被垃圾回收。
```
let element = document.getElementById('btn');
const map = new Map();
map.set(element, 'click handler');
element.remove();   // 元素从 DOM 移除
element = null;     // 但 map 中仍然持有 element 的引用，无法回收 → 内存泄漏
// 需要手动调用 map.delete(element) 或使用 WeakMap
```
* 性能陷阱：当键是对象时，每次查找使用的是引用比较，不是深比较。如果使用字面量对象作为键，必须保持同一引用才能取到值。
```
map.set({}, 'value');
map.get({});  // undefined，因为 {} !== {}
```
* 迭代期间修改：在 `forEach `或 `for...of` 中**删除或添加键**，应避免在遍历时修改集合（除非你知道具体后果）。
* 正确做法：先收集要删除的键，再遍历删除 。
```
const toDelete = [];
map.forEach((value, key) => {
  if (value < 2) toDelete.push(key);
});
toDelete.forEach(key => map.delete(key));
```
### 二。 WeakMap 详解
#### 1. 限制与特性
* 1. 键必须是**对象**（`null`也不行），值可以是**任意类型**。
* 2. `弱引用:`如果一个**键对象**除了 `WeakMap` 外不再有其他引用，垃圾回收（GC）会回收该对象，同时该**键值对**自动从 `WeakMap` 中消失。
* 3. 不可迭代：没有 `keys()`、`values()`、`entries()`、`forEach`、`size`、`clear()`
* 4. 无法获知内部有多少条目，也无法清空（除非重新赋值整个 WeakMap）
```
let obj = { data: 'important' };
const wm = new WeakMap();
wm.set(obj, 'secret info');
obj = null;   // 此时对象只有 WeakMap 的弱引用，很快会被垃圾回收
// wm 中的条目自动消失，但无法确定具体时机，也无法观察到
```
> 💡 **提示：** 无法直接验证条目是否被回收，因为无法枚举。只能通过内存分析工具或确保没有副作用来推断。
#### 2. 可用方法
|方法|描述|
|:--:|:--:|
|`set(key, value)`|添加/更新，返回 `WeakMap` 自身|
|`get(key)`|获取值，不存在返回 `undefined`|
|`has(key)`|检查是否存在|
|`delete(key)`|删除，返回 `boolean`|
#### 3. 注意事项
* **不可迭代：** 无法获取 `WeakMap` 中的键或值列表，也无法得知其大小。这保证了垃圾回收的实现自由。
* **不可清空：** 没有 clear 方法，只能逐个 delete（但通常你无法枚举，所以难以清空所有）。若需要完全释放，只能让 WeakMap 实例本身被回收。
* **值不是弱引用：** 如果值引用了键对象，可能形成循环引用，但此时键仍然可能被回收？需要小心
```js
const wm = new WeakMap();
let obj = {};
wm.set(obj, obj);  // 值引用了键，但键是弱引用，仍然可以回收
obj = null;        // 整个循环不可达，正常回收
```
#### 4. 典型应用场景
* 1. 缓存 DOM 节点相关数据（避免内存泄漏）
```js
const nodeMetadata = new WeakMap();

function setMetadata(node, metadata) {
  nodeMetadata.set(node, metadata);
}

function getMetadata(node) {
  return nodeMetadata.get(node);
}

// 当节点从 DOM 移除且 JS 中无引用时，metadata 自动释放
```
* 2. 注册监听器或观察者时附加数据
```js
const listeners = new WeakMap();

function addListener(obj, callback) {
  const existing = listeners.get(obj) || [];
  existing.push(callback);
  listeners.set(obj, existing);
}

// 当 obj 被销毁，相关回调列表自动消失
```
* 3. 防止内存泄漏的缓存
```javascript
let cache = new WeakMap();

function process(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const result = /* 昂贵计算 */;
  cache.set(obj, result);
  return result;
}
// 不需要手动清理，obj 无引用后自动从 cache 移除
```
### 3. 与 Map 的内存对比
```javascript
// Map 版本：内存不会释放
let map = new Map();
(function() {
  let hugeObj = { data: new Array(1000000).fill('x') };
  map.set(hugeObj, 'big data');
})(); // hugeObj 离开作用域，但 map 仍持有它 → 内存占用一直存在

// WeakMap 版本：内存自动释放
let wm = new WeakMap();
(function() {
  let hugeObj = { data: new Array(1000000).fill('x') };
  wm.set(hugeObj, 'big data');
})(); // hugeObj 失去所有强引用，WeakMap 的弱引用不会阻止 GC → 内存被回收
```