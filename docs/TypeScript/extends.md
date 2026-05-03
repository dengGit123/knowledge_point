### extends
* 类型约束与条件判断
三种主要用途：
  1. 类继承（与 `ES6` 相同）
```ts
class Animal {}
class Dog extends Animal {}  // 类的继承
```
  2. 泛型约束（限制类型参数必须满足某种结构）
```ts
interface HasLength {
  length: number;
}

// T 必须包含 length 属性，类型为 number
function logLength<T extends HasLength>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength("hello");    // ✅ string 有 length
logLength([1, 2, 3]);  // ✅ 数组有 length
logLength(123);        // ❌ number 没有 length 属性
```
  3. 条件类型（三元运算 `T extends U ? X : Y`）
```ts
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">; // true
type B = IsString<number>;  // false

// 更复杂的嵌套
type NonNullable<T> = T extends null | undefined ? never : T;
```
条件类型可以结合 infer 提取类型：
```ts
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type Func = () => number;
type R = ReturnType<Func>; // number
```