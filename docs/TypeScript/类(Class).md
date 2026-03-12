### 1. 类 (Class)
* 定义：类是具有相同`属性`和`方法`的对象的集合。它将对象所共有的特性抽取出来，进行组合，每个对象都可以看作一个实例。
```typeScript
class Person {
  // 属性声明
  name: string;
  age: number;
  
  // 构造函数
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
  
  // 方法
  greet(): string {
    return `Hello, my name is ${this.name}`;
  }
}

// 实例化
const person = new Person("Alice", 30);
console.log(person.greet()); // "Hello, my name is Alice"
```
### 2. 访问修饰符
* 访问修饰符用于控制类成员的可见性。
- 1. `public`：默认值，可以在任何地方被访问。
- 2. `private`：只能在类内部被访问。
- 3. `protected`：只能在类内部和子类中被访问。
```typeScript
class BankAccount {
  public readonly accountNumber: string;  // 公共，只读
  private balance: number;                // 私有，只能在类内部访问
  protected owner: string;                // 受保护，类和子类可访问
  
  constructor(accountNumber: string, owner: string, initialBalance: number = 0) {
    this.accountNumber = accountNumber;
    this.owner = owner;
    this.balance = initialBalance;
  }
  
  public deposit(amount: number): void {
    if (amount > 0) {
      this.balance += amount;
    }
  }
  
  public getBalance(): number {
    return this.balance;
  }
  
  private validateAmount(amount: number): boolean {
    return amount > 0 && amount <= this.balance;
  }
}

const account = new BankAccount("12345", "Alice", 1000);
account.deposit(500);      // ✅ 可以访问
// account.balance = 10000;  // ❌ 错误：私有属性
// account.validateAmount(100); // ❌ 错误：私有方法
```
### 3. Getter/Setter
* 用于控制属性的访问和修改。
```typeScript
class User {
  private _email: string;
  
  constructor(email: string) {
    this._email = email;
  }
  
  // Getter
  get email(): string {
    return this._email;
  }
  
  // Setter
  set email(newEmail: string) {
    if (this.validateEmail(newEmail)) {
      this._email = newEmail;
    } else {
      throw new Error("Invalid email format");
    }
  }
  
  private validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

const user = new User("alice@example.com");
console.log(user.email);   // "alice@example.com"
user.email = "bob@example.com";  // 通过 setter 设置
```
### 4. 静态成员(静态属性和静态方法)
* 静态成员属于类本身，而不是类的实例。
```typeScript
class MathUtils {
  static readonly PI = 3.14159;
  
  static calculateCircleArea(radius: number): number {
    return this.PI * radius * radius;
  }
  
  static instanceCount = 0;
  
  constructor() {
    MathUtils.instanceCount++;
  }
}

console.log(MathUtils.PI);  // 3.14159
console.log(MathUtils.calculateCircleArea(5));  // 78.53975

const util1 = new MathUtils();
const util2 = new MathUtils();
console.log(MathUtils.instanceCount);  // 2
```