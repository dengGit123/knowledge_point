# toRaw

## 作用

`toRaw()` 返回 `reactive()` 或 `readonly()` 代理的原始对象。这是一个转义口，可用于临时读取而不引起代理访问/跟踪开销，或用于写入而不触发更改。

## 基本用法

```javascript
import { reactive, toRaw } from 'vue'

const foo = {}
const bar = reactive(foo)

console.log(toRaw(bar) === foo) // true
```

## 使用场景

### 1. 获取原始对象进行比较

```javascript
import { reactive, toRaw } from 'vue'

const original = { id: 1 }
const proxy = reactive(original)

function isSameObject(a, b) {
  return toRaw(a) === toRaw(b)
}

console.log(isSameObject(proxy, original)) // true
```

### 2. 直接修改原始对象

```javascript
import { reactive, toRaw } from 'vue'

const state = reactive({
  count: 0
})

// 直接修改原始对象，不触发更新
const raw = toRaw(state)
raw.count = 100 // 不会触发响应式更新
```

### 3. 与第三方库交互

```javascript
import { reactive, toRaw } from 'vue'

const state = reactive({
  items: []
})

// 某些库需要原始对象
const rawItems = toRaw(state.items)
someLibrary.process(rawItems)
```

## 注意事项

```javascript
import { reactive, toRaw } from 'vue'

const state = reactive({ count: 0 })

const raw = toRaw(state)

// ⚠️ 对原始对象的修改不会触发响应
raw.count = 100 // state.count 不会更新

// ✅ 应该修改代理对象
state.count = 100 // 正确的方式
```
