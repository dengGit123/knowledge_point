# setCurrentScope

设置当前激活的 effectScope，用于手动控制作用域的激活状态。

## 语法

```javascript
import { setCurrentScope } from 'vue'

setCurrentScope(scope)
```

## 参数

- `scope`: 要设置为当前激活的 effectScope 实例，或 `null` 来清除当前作用域

## 返回值

返回之前激活的 effectScope 实例

## 基础用法

```javascript
import { effectScope, setCurrentScope, ref } from 'vue'

const scope1 = effectScope()
const scope2 = effectScope()

// 设置 scope1 为当前作用域
setCurrentScope(scope1)

// 在 scope1 中创建的响应式数据属于 scope1
const count1 = ref(0)

// 切换到 scope2
setCurrentScope(scope2)

// 在 scope2 中创建的响应式数据属于 scope2
const count2 = ref(0)
```

## 手动控制作用域

```javascript
import { effectScope, setCurrentScope, ref, computed } from 'vue'

const scope = effectScope()

// 手动设置当前作用域
setCurrentScope(scope)

// 创建响应式数据
const count = ref(0)
const doubled = computed(() => count.value * 2)

// 停止作用域后，这些响应式数据会停止工作
scope.stop()

// 恢复作用域（需要重新创建）
const newScope = effectScope()
setCurrentScope(newScope)
```

## 切换作用域创建数据

```javascript
import { effectScope, setCurrentScope, ref } from 'vue'

const userScope = effectScope()
const productScope = effectScope()

let user, product

// 在 userScope 中创建用户相关数据
setCurrentScope(userScope)
user = ref({
  name: 'Alice',
  age: 25
})

// 在 productScope 中创建产品相关数据
setCurrentScope(productScope)
product = ref({
  name: 'Laptop',
  price: 999
})

// 可以分别停止作用域
// userScope.stop() - 只清除用户相关响应式
// productScope.stop() - 只清除产品相关响应式
```

## 作用域链管理

```javascript
import { effectScope, setCurrentScope } from 'vue'

const parentScope = effectScope()
const childScope = effectScope()

// 进入父作用域
const previousScope = setCurrentScope(parentScope)

// 在父作用域中创建数据...

// 创建子作用域
childScope.run(() => {
  // 子作用域的代码...
})

// 恢复之前的作用域
setCurrentScope(previousScope)
```

## 与 detach 配合使用

```javascript
import { effectScope, setCurrentScope, ref } from 'vue'

const mainScope = effectScope()
const detachedScope = effectScope(true) // detached = true

// 设置主作用域
setCurrentScope(mainScope)
const mainData = ref('main')

// 设置分离作用域
setCurrentScope(detachedScope)
const detachedData = ref('detached')

// mainScope.stop() 不会影响 detachedData
// 因为 detachedScope 是分离的
```

## 条件作用域创建

```javascript
import { effectScope, setCurrentScope, ref } from 'vue'

function createScopedData(enableScoping) {
  if (enableScoping) {
    const scope = effectScope()
    setCurrentScope(scope)

    const data = ref('scoped')

    return { scope, data }
  } else {
    // 不使用作用域
    const data = ref('global')
    return { scope: null, data }
  }
}

const { scope: userScope, data: userData } = createScopedData(true)
const { scope: globalData, data: settingsData } = createScopedData(false)
```

## 调试作用域

```javascript
import { effectScope, setCurrentScope, ref, watchEffect } from 'vue'

const scope = effectScope()

setCurrentScope(scope)

const data = ref(0)

watchEffect(() => {
  console.log('数据变化:', data.value)
})

// 可以检查当前激活的作用域
console.log('当前作用域:', scope)

// 停止作用域
scope.stop()
```

## 临时切换作用域

```javascript
import { effectScope, setCurrentScope, ref } from 'vue'

const defaultScope = effectScope()
const tempScope = effectScope()

setCurrentScope(defaultScope)
const defaultData = ref('default')

// 临时切换到临时作用域
const previous = setCurrentScope(tempScope)
const tempData = ref('temporary')

// 恢复默认作用域
setCurrentScope(previous)

const moreDefaultData = ref('more default')
```

## 高级用法：作用域栈

```javascript
import { effectScope, setCurrentScope, ref } from 'vue'

class ScopeStack {
  constructor() {
    this.stack = []
  }

  push(scope) {
    const previous = setCurrentScope(scope)
    this.stack.push({ scope, previous })
    return scope
  }

  pop() {
    const entry = this.stack.pop()
    if (entry) {
      setCurrentScope(entry.previous)
      return entry.scope
    }
  }
}

const stack = new ScopeStack()

const scope1 = effectScope()
const scope2 = effectScope()

stack.push(scope1)
const data1 = ref('data1')

stack.push(scope2)
const data2 = ref('data2')

stack.pop() // 回到 scope1
stack.pop() // 回到默认作用域
```

## 注意事项

1. **高级 API**：这是高级 API，通常不需要手动使用

2. **自动管理**：Vue 会自动管理作用域，大部分情况下使用 `scope.run()` 即可

3. **恢复作用域**：记得保存并恢复之前的作用域

4. **作用域传播**：在 `setCurrentScope` 之后创建的响应式数据属于该作用域

5. **null 参数**：传入 `null` 可以清除当前作用域设置

```javascript
setCurrentScope(null)
const globalData = ref('不受任何作用域管理')
```

6. **与 run() 的区别**：
   - `scope.run(fn)` 在函数作用域内激活 scope
   - `setCurrentScope(scope)` 激活 scope 直到被重新设置
