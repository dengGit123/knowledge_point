### `is`（类型谓词（Type Predicate））
* `is` 用于自定义类型守卫，在函数返回值中声明参数的类型范围，帮助 TypeScript 缩小类型。
```ts
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function process(value: string | number) {
  if (isString(value)) {
    // 在此块中，TypeScript 知道 value 类型为 string
    console.log(value.toUpperCase());
  } else {
    // 这里 value 类型为 number
    console.log(value.toFixed(2));
  }
}
```