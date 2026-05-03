### 1. `readonly` 修饰符
* 修饰符 `readonly` 可以用来修饰**属性**，表示该属性只能在声明时或者在构造函数中被赋值。

### 2. 在类中使用 - `class`
```typeScript
class Product {
  readonly id: string;
  readonly createdAt: Date = new Date();  // 直接初始化
  
  constructor(id: string, public name: string) {
    this.id = id;  // 构造函数中初始化
  }
  
  // 静态只读属性
  static readonly MAX_PRICE: number = 10000;
  
  // getter 返回只读值
  get productInfo(): Readonly<{ id: string; name: string }> {
    return { id: this.id, name: this.name };
  }
}

const product = new Product("P001", "Laptop");
console.log(Product.MAX_PRICE);  // 10000
// Product.MAX_PRICE = 20000;  // ❌ 错误：静态只读属性也不能修改
```
### 3. 在接口中使用 - `interface`
```typeScript
interface Point {
  readonly x: number;
  readonly y: number;
}

// 对象字面量
const point: Point = { x: 10, y: 20 };
// point.x = 30;  // ❌ 错误

// 类实现接口
class Circle implements Point {
  constructor(
    public readonly x: number,  // 使用参数属性
    public readonly y: number,
    public readonly radius: number
  ) {}
}
```
### 4. 在类型别名中使用 - `type`
```typeScript
type ReadonlyUser = {
  readonly id: number;
  readonly username: string;
  readonly profile: {
    readonly email: string;
    age: number;  // 非只读，可以修改
  };
};

const user: ReadonlyUser = {
  id: 1,
  username: "alice",
  profile: {
    email: "alice@example.com",
    age: 25
  }
};

// user.id = 2;  // ❌ 错误
// user.username = "bob";  // ❌ 错误
user.profile.age = 26;  // ✅ 允许：嵌套对象中的非只读属性
// user.profile.email = "new@example.com";  // ❌ 错误：嵌套对象中的只读属性
```