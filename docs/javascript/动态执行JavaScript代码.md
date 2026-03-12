### 1. eval() 函数
* 执行字符串形式的JavaScript代码，并返回执行结果。
* 在**当前作用域**中执行代码，这意味着你可以访问当前作用域中的变量和函数。
```js
<script>
    let a = 10;
    function goto(){
      let a = 20
      let code = 'console.log(a);' // 这里的a是局部的
      let func = eval(code)
      console.log(func)
    }
    goto()
  </script>
```

**注意**: `eval` 具有安全隐患，因为它会执行传入的任意代码，并且可能会被恶意利用。此外，它还会影响性能，因为引擎无法对这段代码进行优化。

### 2. new Function()
* `new Function([arg1[, arg2[, ...argN]],] functionBody)`: 
  * `arg1, arg2, ...`：函数参数（字符串形式）
  * `functionBody`：函数体（字符串形式）
* 创建一个新的函数对象，并将字符串作为函数体
* 在**全局作用域**中执行，不能访问局部变量,只能访问全局变量。
```js
<script>
    let a = 10; // 全局变量
    function goto(){
      let a = 20 // 局部变量
      let code = 'console.log(a)' // 这里的a是全局的，不是局部的
      let func = new Function(code)
      console.log(func)
      func()
    }
    goto()
  </script>
```


### 3. setTimeout 和 setInterval
* 这两个函数可以用来延迟执行或定期执行字符串形式的代码
```js
<script>
    let a = 10; // 全局变量
    function goto(){
      let a = 20 // 局部变量
      let code = 'console.log(a);' // 这里的a是全局的，不是局部的
      setTimeout(code, 1000)
      // setInterval(code, 1000);
    }
    goto()
  </script>
```

### 4.  script 标签注入
* 动态创建 `<script>` 标签来执行代码。这种方式通常用于加载并执行外部脚本，但也可以用于内联脚本。
```js
<script>
    let a = 10; // 全局变量
    function goto(){
      let a = 20 // 局部变量
      let code = 'console.log(a);' // 这里的a是全局的，不是局部的
      let script = document.createElement('script');
      script.textContent = code;
      document.body.appendChild(script);
    }
    goto()
    </script>
```



