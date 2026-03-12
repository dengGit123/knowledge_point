### 1. typeof关键字(类型查询) 主要两种使用场景：
- 1. 判断**值**的类型(与js的使用一样，返回字符串，如 "`string`", "`object`" 等)
```typescript
let str = "hello";
console.log(typeof str); // 输出 "string"

console.log(typeof "hello");     // "string"
console.log(typeof 42);          // "number"
console.log(typeof true);        // "boolean"
console.log(typeof undefined);   // "undefined"
console.log(typeof null);        // "object"
console.log(typeof {});          // "object"
console.log(typeof []);          // "object"
console.log(typeof function(){});// "function"
console.log(typeof Symbol());    // "symbol"
```
- 2. 在typsscript的**类型上下文**中，`typeof`关键字用于获取一个变量或属性的**类型**(即得到的是类型)。
```typescript
const person = {
  name: "Alice",
  age: 30,
  address: {
    city: "New York",
    zip: "10001"
  }
};

// 类型查询
type Person = typeof person;
// 等价于：
// type Person = {
//   name: string;
//   age: number;
//   address: {
//     city: string;
//     zip: string;
//   };
// }

const numbers = [1, 2, 3];
type NumbersType = typeof numbers; // number[]
```
### 2. 类型查询的详细用法
#### 1. 获取变量类型
```typescript
const userName = "John";
type UserNameType = typeof userName; // string

const userAge = 25;
type UserAgeType = typeof userAge; // number

const isActive = true;
type IsActiveType = typeof isActive; // boolean
```
#### 2. 获取对象属性类型
```typescript
const config = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
  retry: true,
  headers: {
    "Content-Type": "application/json"
  }
};

type ConfigType = typeof config;
/* 等价于：
type ConfigType = {
  apiUrl: string;
  timeout: number;
  retry: boolean;
  headers: {
    "Content-Type": string;
  };
}
*/

// 获取特定属性的类型
type ApiUrlType = typeof config.apiUrl; // string
type HeadersType = typeof config.headers; // { "Content-Type": string; }
```
#### 3 获取函数类型
```typescript
function greet(name: string): string {
  return `Hello, ${name}!`;
}

type GreetFunction = typeof greet;
// 等价于：type GreetFunction = (name: string) => string

const add = (x: number, y: number): number => x + y;
type AddFunction = typeof add; // (x: number, y: number) => number

// 获取函数返回类型
type GreetReturnType = ReturnType<typeof greet>; // string
type AddReturnType = ReturnType<typeof add>; // number
```
#### 4. 获取数组和元组类型
```typescript
const colors = ["red", "green", "blue"];
type ColorsType = typeof colors; // string[]

const numbers = [1, 2, 3] as const;
type NumbersType = typeof numbers; // readonly [1, 2, 3]

const user = ["John", 30] as const;
type UserType = typeof user; // readonly ["John", 30]
```
### 3. 高级用法
#### 1. 与 `keyof` 结合使用
```typescript
const user = {
  id: 1,
  name: "John",
  email: "john@example.com"
};

type User = typeof user;
type UserKeys = keyof typeof user; // "id" | "name" | "email"

// 动态获取键的类型
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// 使用
const userName = getProperty(user, "name"); // 类型为 string
```
#### 2. 获取枚举类型
```typescript
enum Status {
  Active = "ACTIVE",
  Inactive = "INACTIVE",
  Pending = "PENDING"
}

type StatusType = typeof Status;
// 获取枚举值的联合类型
type StatusValues = keyof typeof Status; // "Active" | "Inactive" | "Pending"
```
#### 4. 创建类型安全的配置对象
```typescript
const config = {
  server: {
    host: "localhost",
    port: 8080
  },
  db: {
    url: "mongodb://localhost:27017",
    name: "testdb"
  }
} as const;

type Config = typeof config;
/* 等价于：
type Config = {
  readonly server: {
    readonly host: "localhost";
    readonly port: 8080;
  };
  readonly db: {
    readonly url: "mongodb://localhost:27017";
    readonly name: "testdb";
  };
}
*/

// 使用配置类型
function setupApp(config: Config) {
  console.log(`Server: ${config.server.host}:${config.server.port}`);
}
```
#### 5. 类型守卫中使用
```typescript
function processValue(value: string | number) {
  if (typeof value === "string") {
    // 这里 value 的类型被缩小为 string
    console.log(value.toUpperCase());
  } else {
    // 这里 value 的类型被缩小为 number
    console.log(value.toFixed(2));
  }
}
```

### 4. 注意事项
#### 1. 与 JavaScript `typeof` 的区别
```typescript
// TypeScript 类型查询（编译时）
const value = "hello";
type ValueType = typeof value; // string

// JavaScript typeof 运算符（运行时）
const typeString = typeof value; // "string" (字符串值)
```
#### 2. `const` 断言的影响
```typescript
// 没有 as const
const colors = ["red", "green", "blue"];
type Colors1 = typeof colors; // string[]

// 使用 as const
const colorsConst = ["red", "green", "blue"] as const;
type Colors2 = typeof colorsConst; // readonly ["red", "green", "blue"]
```
#### 3. 不能用于类型别名,同样也不能对接口使用`typeof`
```typescript
type User = { name: string; age: number };
// 错误用法：不能直接使用 typeof 来获取类型别名本身
type UserTypeAlias = typeof User; // Error!

// 正确做法是使用泛型和映射类型
type GetUserType<T> = T extends object ? { [K in keyof T]: T[K] } : never;
type UserType = GetUserType<User>; // 等价于 type UserType = User
```