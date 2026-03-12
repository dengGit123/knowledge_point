### 1. any
#### any类型关闭类型检查
特点： 
1. **完全禁用类型检查:** 绕过TypeScript的**所有类型检查**，即编译器不会对`any`类型的变量进行类型检查。
2. **可赋值给任何类型:** `any`可以赋值给任何类型的变量
3. **可以进行任意操作:** 可以调用任何方法，访问任何属性
4. **任何类型可以赋值给`any`:** 任何类型都可以赋值给`any`类型变量
```typescript
let value: any;

value = 123;           // ✅ OK
value = "hello";       // ✅ OK
value = true;          // ✅ OK
value.foo.bar;         // ✅ 编译通过（运行时可能出错）
value();               // ✅ 编译通过（运行时可能出错）

let num: number = value;  // ✅ 可以将 any 赋值给其他类型
```
### 2. unknown 类型
#### unknown类型开启类型检查
特点： 
1. **类型检查:**TypeScirpt会对`unknown`类型的变量进行**类型检查**，但在**使用时需要明确指定其具体类型**,先进行类型检查或类型断言。
2. **不可随意赋值:** `unknown`只能赋值给`any`和`unknown`本身，不能直接赋值给其他类型
3. **不可直接操作:** 不能直接调用方法或访问属性，除非先进行类型断言
4. **任何类型可以赋值给`unknown`:** 任何值可以赋值给`unknown`类型变量
```typescript
let value: unknown;

value = 123;           // ✅ OK
value = "hello";       // ✅ OK
value = true;          // ✅ OK

// ❌ 以下操作都会编译报错：
// value.foo.bar;        // 错误：对象的类型为 "unknown"
// value();              // 错误：对象的类型为 "unknown"
// let num: number = value;  // 错误：不能将 unknown 赋值给 number

// ✅ 必须先进行类型检查或类型断言
if (typeof value === "number") {
  let num: number = value;  // ✅ 现在可以了
}

let str: string = value as string;  // ✅ 类型断言
```
### 3. 最佳实践
- **优先考虑使用`unknown`:** 除非有明确理由需要绕过类型检查，否则应优先选择`unknown`。
- **谨慎使用`any`:** `any`虽然灵活但会失去TypeScript的类型安全性优势，只在必要时使用。
### 4. 使用场景举例
#### 使用场景1：不确定数据来源
```typescript
function fetchData(): unknown {
  // 可能从外部API获取数据
  return JSON.parse(someJsonString); // someJsonString 可能来自网络请求或其他不可控源
}

const data = fetchData();
//类型检查或断言
if (typeof data === "string") {
  console.log("Received a string:", data);
} else if (Array.isArray(data)) {
  console.log("Received an array:", data);
}
```
#### 使用场景2：动态属性访问
```typescript
let obj: any;
obj = { name: "Alice", age: 25 };
console.log(obj.name); // 直接访问没有问题

let unkObj: unknown;
unkObj = { name: "Bob", occupation: "Developer" };
// console.log(unkObj.occupation);
// ❌ 直接访问会报错
if (typeof unkObj === "object" && unkObj !== null) {
  console.log((unkObj as any).occupation); // 使用类型断言
}
```
### 5. 使用建议
1. 永远不要使用`any`作为**函数参数**类型 - 使用`unknown`替代
2. 只在**确实需要绕过类型检查时使用`any`**
3. 优先考虑使用`unknown`，并通过类型检查或断言来安全地处理数据