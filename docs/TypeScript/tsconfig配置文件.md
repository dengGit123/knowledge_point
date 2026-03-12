```json
/**
* 两个 /** 代表任意目录；一个 /* 代表任意文件
 */
{
  // 用来指定哪些文件需要被编译;
  "include":[
    "src/**/*.ts",
  ],
  // 用来指定哪些文件不需要被编译
  "exclude":[
    "node_modules",
    "**/*.spec.ts"
  ],
  /**
   * 用来指定编译文件的列表
   * 如果没有指定 include 和 exclude，则会编译当前目录下的所有 ts 文件
   */
  "files":[],
  // 编译选项
  "compilerOptions": {
    "target": "esnext", // 用来指定编译后的js版本
    "module": "esnext", // 用来指定要使用的模块化规范，比如es6，commonjs，amd等
    "lib":[], // 用来指定项目中要包含的库文件
    "outDir": "./dist", // 用来指定编译后文件的存放位置
    "outFile": "./dist/app.js", // 用来指定将所有的文件编译为一个js文件
    "allowJs": true, // 允许编译js文件
    "checkJs": true, // 检查js代码是否符合语法规范
    "removeComments": true, // 删除注释
    "noEmit": false, // 是否生成编译后的文件
    "noEmitOnError": false, // 编译错误时是否生成文件

    "alwaysStrict": true, // 在代码中注入'use strict'
    "noImplicitAny": true, // 在表达式和声明上有隐含的 any 类型时报错
    "noImplicitThis": true, // 不允许 this 不明确类型
    "strictNullChecks": true, // 严格检查null和undefined
    "strict": true, // 启用所有严格类型检查(所有严格选项都会开启)，等同于开启了所有严格检查；
  }
}
```