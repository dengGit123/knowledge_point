### 1. keyof：类型操作符
* 用于获取**对象类型**的所有键（属性名）组成的联合类型。
```typescript
interface User {
  id: number;
  name: string;
  age: number;
}
type UserKeys = keyof User;  // "id" | "name" | "age"
// 使用示例
const key1: UserKeys = "id";     // ✅ 正确
const key2: UserKeys = "name";   // ✅ 正确
const key3: UserKeys = "age";    // ✅ 正确
const key4: UserKeys = "email";  // ❌ 错误，'email' 不在 User 的键中
```
### 2. 使用场景
#### 2.1 类型安全的对象属性访问
```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user: User = { id: 1, name: "Alice", age: 25 };

// 类型安全，自动推断返回类型
const name = getProperty(user, "name");  // string 类型
const age = getProperty(user, "age");    // number 类型

// getProperty(user, "email");  // ❌ 编译错误，不存在此属性
```
#### 2.2 约束泛型参数
```typescript
// 确保第二个参数是第一个对象的有效键
function updateProperty<T, K extends keyof T>(
  obj: T,
  key: K,
  value: T[K]
): void {
  obj[key] = value;
}

updateProperty(user, "name", "Bob");  // ✅ 正确
// updateProperty(user, "name", 123);  // ❌ 类型不匹配
// updateProperty(user, "email", "test");  // ❌ 属性不存在
```
### 3. 高级用法
#### 3.1 与映射类型结合
```typescript
// 创建所有属性为只读的类型
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// 创建所有属性为可选的类型
type Partial<T> = {
  [P in keyof T]?: T[P];
};
```
#### 3.2 实现 Pick 和 Omit
```typescript
// 内置 Pick 类型的实现原理
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};
type UserNameAndAge = MyPick<User, "name" | "age">;
// 等价于 { name: string; age: number; }

// 内置 Omit 类型的实现原理（TypeScript 3.5+）
type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

type UserWithoutAge = MyOmit<User, "age">;
// 等价于 { id: number; name: string; }
```
#### 3.3 条件类型中使用
```typescript
// 获取函数类型的键
type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

interface Api {
  id: number;
  fetchData: () => Promise<void>;
  update: (data: any) => void;
}

type ApiMethods = FunctionKeys<Api>;  // "fetchData" | "update"
```
### 4. 实际应用场景
#### 4.1 动态表单配置
```typescript
interface FormValues {
  username: string;
  email: string;
  password: string;
}

type FormConfig<T> = {
  [K in keyof T]: {
    label: string;
    required: boolean;
    type: "text" | "email" | "password";
  };
};

const config: FormConfig<FormValues> = {
  username: { label: "用户名", required: true, type: "text" },
  email: { label: "邮箱", required: true, type: "email" },
  password: { label: "密码", required: true, type: "password" },
  // ❌ 不能添加不存在的字段
};
```
#### 4.2 API 响应包装器
```typescript
interface UserResponse {
  id: number;
  name: string;
  email: string;
}

type ApiResponse<T> = {
  data: T;
  success: boolean;
  message: string;
};

type UserKeys = keyof UserResponse;  // "id" | "name" | "email"

function createResponse<T>(
  data: T,
  include?: (keyof T)[]  // 只能包含 T 的键
): ApiResponse<Partial<T>> {
  // ... 实现
}
```
#### 4.3 事件处理器
```typescript
interface ComponentEvents {
  click: (event: MouseEvent) => void;
  change: (value: string) => void;
  submit: (data: FormData) => void;
}

type EventHandlers = {
  [K in keyof ComponentEvents as `on${Capitalize<K>}`]?: ComponentEvents[K];
};

const handlers: EventHandlers = {
  onClick: (e) => console.log("clicked"),  // ✅ 正确
  onChange: (value) => console.log(value), // ✅ 正确
  // ❌ 不能添加不存在的事件
};
```
### 5. 注意事项
- keyof 在编译时工作：它只处理类型信息，不影响运行时
- keyof 作用于**类型**，不是值：不能用于 JavaScript 对象
- 处理可能为 undefined 的键: 
  ```typescript
  // 处理索引签名
  interface Dictionary {
  [key: string]: number;
  }

  type DictKeys = keyof Dictionary;  // string | number
  ```