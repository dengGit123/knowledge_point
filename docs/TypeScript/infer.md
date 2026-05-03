### infer
* **只能**在条件类型（`conditional type`）的 `extends` 子句中使用
* 作用：从一个已知的类型结构中提取出一个子类型，并将其绑定到一个类型变量上，供后续分支使用
### 1. 基本语法
```ts
type SomeType<T> = T extends SomePattern<infer U> ? U : Fallback;
```
当 `T` 匹配 `SomePattern` 类型模式时，TypeScript 会尝试推断出 `infer` 声明的类型变量的具体类型，并在 `true` 分支中可以使用该类型变量；如果不匹配，则使用 `Fallback`
### 2. 典型入门例子
#### 1. 提取函数返回值类型 - `ReturnType`
```ts
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type F1 = () => number;
type R1 = ReturnType<F1>; // number

type F2 = (x: string) => boolean;
type R2 = ReturnType<F2>; // boolean
```
#### 2. 提取函数参数类型（作为元组）- `Parameters`
```ts
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

type F3 = (a: string, b: number) => void;
type P3 = Parameters<F3>; // [string, number]
```
#### 3. 提取 `Promise` 内部类型
```ts
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type A = UnwrapPromise<Promise<string>>; // string
type B = UnwrapPromise<number>;          // number（没有改变）
```
#### 4. 提取数组元素类型 - `ArrayElement`
```ts
type ArrayElement<T> = T extends (infer U)[] ? U : never;

type E1 = ArrayElement<string[]>; // string
type E2 = ArrayElement<number[]>; // number
```
### 3. 高级用法与模式
#### 1. 多个 `infer` 同时使用
```ts
// 同时提取参数列表和返回值
type FunctionInfo<T> = T extends (...args: infer Args) => infer Return
  ? { args: Args; return: Return }
  : never;
type F = (x: number, y: string) => boolean;
type Info = FunctionInfo<F>; // { args: [number, string]; return: boolean }
```
### 4. 常见陷阱与注意事项
#### 1. 只能在**条件类型**的 `extends` 子句中使用
* 只能在 T extends ... ? ... : ... 中的模式匹配里使用
```ts
// ❌ 错误：不能独立使用
type Bad = infer X;

// ✅ 必须嵌套在条件类型中
type Good<T> = T extends infer X ? X : never;
```
#### 2. infer 仅匹配具体结构，不进行额外的类型变换
```ts
type GetArg<T> = T extends (arg: infer A) => void ? A : never;

type F1 = (x: string | number) => void;
type Arg1 = GetArg<F1>; // string | number ✅

type F2 = <T>(arg: T) => void;  // 泛型函数
type Arg2 = GetArg<F2>;         // unknown ❓（因为调用签名中的参数类型未被实例化）
```