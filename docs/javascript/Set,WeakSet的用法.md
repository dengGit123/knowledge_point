### 一。 Set（集合）
* ES6引入的一种数据结构
#### 1. 特点： 
  * 成员的值是唯一的，没有重复的值.
  * 1. 链式调用： `add` 方法返回 `Set` 对象本身，所以可以链式添加：`set.add(1).add(2).add(3)`;
  * 2. 遍历顺序：就是插入顺序。
  * 3. 任意类型：可以存储原始值或对象引用
  * 4. 唯一性：严格去重，使用 SameValueZero 算法判断相等：
        * `NaN === NaN` 为 `false`，但 `Set` 中 `NaN` 只能添加一次。
        * `+0` 与 `-0`视为相等。
> 💡 **提示：** 遍历时 `key`,`value`值一样; 即 `keys()`，`values()`获取到的是一样；
#### 2. 实例方法
|方法|描述|返回值|
|:--:|:--:|:--:|
|`add(value)`|添加一个值到 `Set` 中。如果值已存在，不做任何操作|`Set` 对象本身（支持链式调用）|
|`delete(value)`|删除 `Set` 中的指定值|`true`（删除成功）/ `false`（值不存在）|
|`has(value)`|判断 `Set` 中是否存在某个值|`true` / `false`|
|`clear()`|清空 Set 中的所有元素|`undefined`|
|`forEach(callbackFn, thisArg)`|按插入顺序遍历 Set 的每个元素。回调参数：`(value, key, set)`。注意 Set 中 key 与 value 相同|`undefined`|
|`keys()`|返回一个迭代器，包含 Set 中所有元素的值（与 `values()` 相同）|迭代器对象|
|`values()`|返回一个迭代器，包含 Set 中所有元素的值|迭代器对象|
|`entries()`|返回一个迭代器，包含 [value, value] 形式的数组，为了与 Map 保持一致|迭代器对象|
#### 3 实例属性
|属性|描述|类型|
|:--:|:--:|:--:|
|`size`|返回 Set 中元素的个数|只读属性（数字）|
```javascript
const s = new Set([1,2,3]);

// 添加
s.add(4).add(5);         // 链式调用

// 删除
s.delete(2);             // true
s.delete(100);           // false

// 判断
s.has(1);                // true

// 大小
s.size;                  // 4

// 遍历
s.forEach((value, key, set) => {
  console.log(value, key === value); // true
});

// 迭代器
const keys = s.keys();   // 与 s.values() 相同
console.log([...keys]);  // [1,3,4,5]

const entries = s.entries();
console.log([...entries]); // [[1,1],[3,3],[4,4],[5,5]]

// 清空
s.clear();
s.size;                  // 0
```
#### 4. 注意事项
##### 1.引用类型去重陷阱
```js
const set = new Set();
set.add({a:1});
set.add({a:1});  // 成功添加，因为两个对象引用不同
set.size;         // 2
```
##### 2.内存泄漏风险：Set 对元素是 **强引用** .如果存储大量 DOM 节点或临时对象，且忘记清除，这些对象将无法被垃圾回收，导致内存泄漏
```js
let obj = {data: 'big'};
const set = new Set([obj]);
obj = null;          // 原对象依然被 Set 引用，不会被回收
// 需要手动 set.delete(obj) 或 set.clear()
```
##### 3.无法直接修改元素：Set 中存储的是值的引用，要修改某个元素，通常需要先删除再添加新值

### 二. WeakSet（弱引用集合）
* WeakSet 是 Set 的“**弱引用**”版本，只能**存储对象**，并且不阻止垃圾回收
> 💡 **注意：** 添加的值只能是对象，尝试添加原始值会抛出 TypeError
#### 1. 基本用法
```javascript
// 创建（必须传入可迭代对象，元素只能是对象）
const ws = new WeakSet();
const obj1 = {name: 'Alice'};
const obj2 = {name: 'Bob'};

ws.add(obj1);
ws.add(obj2);
// ws.add(1);      // 报错！不能添加原始值
// ws.add('str');  // 报错

ws.has(obj1);      // true
ws.delete(obj2);   // true

// 注意：没有 size 属性，没有 clear 方法，不能遍历（无 keys/values/entries/forEach）
```
#### 2.特点
* **只接受对象：** 尝试添加原始值会抛出 TypeError；
* **弱引用：** WeakSet 内部对对象的引用是弱的，不会阻止垃圾回收。如果对象在其他地方没有强引用，它会被回收，同时 WeakSet 中对应的条目自动消失（不可观察，但实际已移除）
* **不可遍历：** 因为内部元素可能随时被回收，所以无法获取所有成员，没有 `size`、`forEach`、`keys` 等方法
* **不可清空：** 没有 clear 方法（但可以通过重新赋值 ws = new WeakSet() 来间接清空）
#### 3. 注意事项
* 不能存储原始值：数字、字符串、布尔、Symbol、BigInt 都不行
* 无法知道内部有多少对象：ws.size 为 undefined，也没有方法获取成员列表
* 无法清空：除非整个 WeakSet 对象被丢弃
* 调试困难：在控制台打印 WeakSet 往往显示 `WeakSet { <items unknown > }`，因为内部内容可能已被回收或不可见
* 内存自动清理：弱引用，适合临时存储对象
#### 4. 使用场景
* 1. DOM 节点标记：记录哪些节点已经被处理过，而不影响节点本身的垃圾回收
```js
const processed = new WeakSet();

function handleNode(node) {
  if (processed.has(node)) return;
  processed.add(node);
  // 处理 node...
  // 当 node 从 DOM 移除且无其他引用时，processed 中的条目会自动消失
}
```