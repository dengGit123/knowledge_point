### 1. `void`
* `void` 表示没有返回任何值的类型，通常用在不需要返回任何值的方法中。

### 2. 函数返回类型
* 在 `TypeScript` 中，如果一个函数没有返回值，你可以在函数的返回类型位置使用 `void`。
```typescript
// 没有返回值的函数
function logMessage(message: string): void {
  console.log(message);
  // 没有 return 语句，或者只有 return; 没有返回值
}

// 等价于：
const logMessage2: () => void = () => {
  console.log("Hello");
};
```
### 3. 变量类型
* 你可以将 `void` 类型用于变量，表示该变量的值只能是 `undefined`（在严格模式下）。
```typescript
let nothing: void = undefined;
// nothing = null; // 这样会报错
```
### 4. `void` vs `undefined` vs `never`
| 类型 | 用途 | 示例 |
| --- | --- | --- |
| `void` | 表示没有任何返回值，通常用于函数没有返回值的情况 | `function doSomething(): void { ... }` |
| `undefined` | 表示只有一个值，即 `undefined`。通常用于初始化变量时表示”未定义”的状态 | `let x: undefined = undefined;` |
| `never` | 表示那些永不存在的值的类型。例如，函数中**抛出异常**或**无限循环**的情况 | `function errorFunction(): never { throw new Error(“An error occurred”); }` |
```typescript
// 对比示例
function returnsVoid(): void {
  // 可以不写 return，或写 return; 或 return undefined;
  return; // 显式返回 void
  // return undefined; // 或者这样也行，但不推荐因为冗余
  
}

function returnsUndefined(): undefined {
  return undefined; // 必须明确返回 undefined
}

function returnsNever(): never {
  throw new Error("Oops"); // 永远不会正常返回
  // 或 while(true) {}
}
```
### 5. `tsconfig.json` 配置
`strictNullChecks`
```typescript
// 当 strictNullChecks 为 false 时
let v: void = undefined; // ✅
let v2: void = null;     // ✅

// 当 strictNullChecks 为 true 时
let v3: void = undefined; // ✅
let v4: void = null;      // ❌ 错误：不能将 null 赋值给 void 类型
```

### 6. 常见误区 - `void` 的正确使用
```typescript
// ❌ 错误理解：void 函数不能有 return 语句
// 调用方不用到返回值时，可以返回任意类型的值
function process(): void {
  if (condition) {
    return; // ✅ 允许，没有返回值
  }
  return undefined; // ✅ 也允许
}

// ❌ 错误：将 void 值用于需要具体类型的地方
function getData(): void {
  // 不返回
}

const data = getData(); // data 是 void
// console.log(data.toUpperCase()); // ❌ 错误：void 类型没有 toUpperCase 方法

// ✅ 正确处理：明确类型守卫
function maybeString(): string | void {
  if (Math.random() > 0.5) {
    return "hello";
  }
}

const result = maybeString();
if (typeof result === "string") {
  console.log(result.toUpperCase()); // ✅ 安全
}
```