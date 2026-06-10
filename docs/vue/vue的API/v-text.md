### v-text

> 📖 [官方文档 - v-text](https://cn.vuejs.org/api/built-in-directives#v-text)

---

### 一、概述

`v-text` 是 Vue 3 提供的一个内置指令，用于**更新元素的纯文本内容**。它通过设置 DOM 元素的 `textContent` 属性来实现文本渲染，绑定值会被作为纯文本插入，HTML 标签会被自动转义而不会被解析。

**解决什么问题：**
- 需要将响应式数据以纯文本形式渲染到页面上
- 需要动态更新某个元素的完整文本内容
- 需要安全地展示用户输入或外部数据（防止 XSS 攻击）

**为什么需要它：**
- Vue 3 的模板语法中，`{{ }}` 插值表达式已经能满足大部分文本渲染需求，`v-text` 提供了一种更**显式、语义化**的方式来声明"这个元素的内容完全由数据驱动"
- 在某些场景下（如动态覆盖元素内容、代码规范要求指令风格统一），`v-text` 比插值表达式更合适

> 💡 **提示：** `v-text` 的功能与 `{{ }}` 插值表达式基本等价，但 `v-text` 会**完全覆盖**元素内的所有子内容，而 `{{ }}` 可以与静态文本和其他元素混合使用。

---

### 二、核心原理

`v-text` 指令的工作原理非常直接：

1. Vue 在编译模板时，识别到 `v-text` 指令
2. 运行时通过 `el.textContent = value` 设置元素的文本内容
3. 当绑定值发生变化时，Vue 会自动更新对应的 `textContent`

```typescript
// v-text 的底层实现（伪代码）
function directiveText(el: HTMLElement, binding: DirectiveBinding) {
  el.textContent = binding.value == null ? '' : String(binding.value)
}
```

**关键特性：**
- 设置的是 `textContent` 而非 `innerHTML`，因此 HTML 标签会被当作纯文本显示
- 会覆盖目标元素内的**所有**子节点（包括子元素、文本节点等）
- 值为 `null` 或 `undefined` 时，渲染为空字符串

---

### 三、详细用法

#### 1. 基本用法

**最简单的文本绑定：**

```vue
<template>
  <div>
    <!-- 使用 v-text 绑定响应式数据 -->
    <p v-text="message"></p>

    <!-- 等价于使用插值表达式 -->
    <p>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const message: string = ref<string>('Hello Vue 3!')
</script>
```

**绑定数字类型：**

```vue
<template>
  <div>
    <!-- v-text 会自动将数字转为字符串 -->
    <span v-text="count"></span>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref<number>(0)
</script>
```

**绑定计算属性：**

```vue
<template>
  <div>
    <p v-text="fullGreeting"></p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const firstName = ref<string>('张')
const lastName = ref<string>('三')

const fullGreeting = computed<string>(() => {
  return `你好，${firstName.value}${lastName.value}！欢迎回来。`
})
</script>
```

#### 2. 进阶用法

**结合三元表达式进行条件渲染：**

```vue
<template>
  <div>
    <!-- ✅ 正确：使用三元表达式切换文本 -->
    <span v-text="isLoggedIn ? welcomeText : loginPrompt"></span>

    <!-- ❌ 错误：v-text 不支持在值中使用语句 -->
    <!-- <span v-text="if (isLoggedIn) { welcomeText }"></span> -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isLoggedIn = ref<boolean>(false)
const welcomeText = ref<string>('欢迎回来！')
const loginPrompt = ref<string>('请先登录')
</script>
```

**文本拼接与格式化：**

```vue
<template>
  <div>
    <!-- 使用表达式进行拼接 -->
    <p v-text="`¥${price.toFixed(2)}`"></p>

    <!-- 调用方法格式化 -->
    <p v-text="formatPrice(discountedPrice)"></p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const price = ref<number>(99.9)
const discount = ref<number>(0.8)

const discountedPrice = computed<number>(() => price.value * discount.value)

function formatPrice(val: number): string {
  return `¥${val.toFixed(2)}`
}
</script>
```

**显示对象/数组的内容：**

```vue
<template>
  <div>
    <!-- 对象序列化显示 -->
    <pre v-text="JSON.stringify(userInfo, null, 2)"></pre>

    <!-- 数组拼接显示 -->
    <p v-text="tags.join('、')"></p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface UserInfo {
  name: string
  age: number
  email: string
}

const userInfo = ref<UserInfo>({
  name: '张三',
  age: 25,
  email: 'zhangsan@example.com'
})

const tags = ref<string[]>(['Vue', 'TypeScript', 'Vite'])
</script>
```

**结合 v-if / v-show 控制显示：**

```vue
<template>
  <div>
    <!-- ✅ 正确：v-if 和 v-text 配合使用 -->
    <div v-if="errorMessage" class="error" v-text="errorMessage"></div>

    <!-- ✅ 正确：显示加载状态 -->
    <button v-text="loading ? '加载中...' : '提交'" @click="handleSubmit"></button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const errorMessage = ref<string>('')
const loading = ref<boolean>(false)

async function handleSubmit(): Promise<void> {
  loading.value = true
  errorMessage.value = ''
  try {
    await new Promise<void>((resolve) => setTimeout(resolve, 2000))
  } catch {
    errorMessage.value = '提交失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>
```

**在组件上使用 v-text：**

```vue
<template>
  <div>
    <!-- ✅ v-text 可以用在组件根元素上（组件只有一个根元素时） -->
    <CustomButton v-text="buttonText" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CustomButton from './CustomButton.vue'

const buttonText = ref<string>('点击我')
</script>
```

#### 3. API 参数说明

| 参数 | 说明 | 类型 | 必填 |
| --- | --- | --- | --- |
| `expression` | 需要渲染的值，支持任意 JavaScript 表达式 | `string \| number \| boolean \| object \| null \| undefined` | 是 |

| 返回值 | 说明 |
| --- | --- |
| 无返回值 | 指令直接操作 DOM，设置元素的 `textContent` |

**值的转换规则：**

| 输入值 | 渲染结果 |
| --- | --- |
| `'Hello'` | `Hello` |
| `123` | `123` |
| `true` | `true` |
| `null` | _(空)_ |
| `undefined` | _(空)_ |
| `{ name: 'Vue' }` | `[object Object]` |
| `['a', 'b']` | `a,b` |

---

### 四、实现效果

**1. 纯文本渲染（HTML 自动转义）：**

```vue
<template>
  <div>
    <!-- v-text: HTML 标签被转义，以纯文本显示 -->
    <div v-text="htmlContent"></div>
    <!-- 页面显示：<strong>加粗文字</strong>（标签原样输出） -->

    <!-- 对比 v-html: HTML 标签被解析 -->
    <div v-html="htmlContent"></div>
    <!-- 页面显示：加粗文字（实际加粗显示） -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const htmlContent = ref<string>('<strong>加粗文字</strong>')
</script>
```

**2. 完全覆盖子内容：**

```vue
<template>
  <div>
    <!-- v-text 会完全替换元素内部所有内容 -->
    <div v-text="message">
      这段文字会被完全覆盖
      <span>这个子元素也会消失</span>
    </div>
    <!-- 最终 DOM：<div>新的内容</div> -->

    <!-- ✅ 如果需要混合内容，使用 {{ }} -->
    <div>
      前缀文字 - {{ message }} - 后缀文字
      <span>子元素保留</span>
    </div>
    <!-- 最终 DOM：<div>前缀文字 - 新的内容 - 后缀文字<span>子元素保留</span></div> -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const message = ref<string>('新的内容')
</script>
```

**3. 响应式更新：**

```vue
<template>
  <div>
    <button @click="count++">+1</button>
    <span v-text="count"></span>
    <!-- 点击按钮后，数字实时更新 -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const count = ref<number>(0)
</script>
```

---

### 五、使用场景

#### 1. 多语言/国际化文本切换

在多语言应用中，使用 `v-text` 动态绑定当前语言的文本内容。

```vue
<template>
  <div>
    <select v-model="locale">
      <option value="zh">中文</option>
      <option value="en">English</option>
      <option value="ja">日本語</option>
    </select>
    <h1 v-text="t('title')"></h1>
    <p v-text="t('description')"></p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

type Locale = 'zh' | 'en' | 'ja'

const locale = ref<Locale>('zh')

const messages: Record<Locale, Record<string, string>> = {
  zh: {
    title: '欢迎来到我的网站',
    description: '这是一个使用 Vue 3 构建的网站'
  },
  en: {
    title: 'Welcome to My Website',
    description: 'This is a website built with Vue 3'
  },
  ja: {
    title: '私のウェブサイトへようこそ',
    description: 'これは Vue 3 で構築されたウェブサイトです'
  }
}

function t(key: string): string {
  return messages[locale.value][key] ?? key
}
</script>
```

#### 2. 表单标签与按钮文字动态化

在可配置的表单系统中，使用 `v-text` 动态设置标签和按钮文字。

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div v-for="field in formFields" :key="field.key" class="form-item">
      <label :for="field.key" v-text="field.label"></label>
      <input
        :id="field.key"
        :type="field.type"
        v-model="formData[field.key]"
      />
    </div>
    <button type="submit" v-text="submitText"></button>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface FormField {
  key: string
  label: string
  type: string
}

const formFields = ref<FormField[]>([
  { key: 'username', label: '用户名', type: 'text' },
  { key: 'email', label: '邮箱地址', type: 'email' },
  { key: 'password', label: '密码', type: 'password' }
])

const formData = reactive<Record<string, string>>({
  username: '',
  email: '',
  password: ''
})

const submitText = ref<string>('注册')

function handleSubmit(): void {
  console.log('提交数据：', formData)
}
</script>
```

#### 3. 加载状态按钮文字切换

按钮在加载过程中展示不同的文本状态。

```vue
<template>
  <div>
    <button
      :disabled="loading"
      v-text="loading ? '加载中...' : '获取数据'"
      @click="fetchData"
    ></button>
    <div v-if="data" v-text="data"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const loading = ref<boolean>(false)
const data = ref<string>('')

async function fetchData(): Promise<void> {
  loading.value = true
  try {
    const response = await fetch('https://api.example.com/data')
    data.value = await response.text()
  } catch (error) {
    data.value = '请求失败'
  } finally {
    loading.value = false
  }
}
</script>
```

#### 4. 表单验证错误提示

在表单校验场景中，动态显示校验错误信息。

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <div class="field">
      <input v-model="email" type="email" placeholder="请输入邮箱" />
      <!-- 验证失败时显示错误文本 -->
      <span class="error" v-if="emailError" v-text="emailError"></span>
    </div>

    <div class="field">
      <input v-model="password" type="password" placeholder="请输入密码" />
      <span class="error" v-if="passwordError" v-text="passwordError"></span>
    </div>

    <button type="submit">提交</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const email = ref<string>('')
const password = ref<string>('')
const emailError = ref<string>('')
const passwordError = ref<string>('')

function validateEmail(value: string): string {
  if (!value) return '邮箱不能为空'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '邮箱格式不正确'
  return ''
}

function validatePassword(value: string): string {
  if (!value) return '密码不能为空'
  if (value.length < 6) return '密码长度不能少于 6 位'
  return ''
}

function handleSubmit(): void {
  emailError.value = validateEmail(email.value)
  passwordError.value = validatePassword(password.value)

  if (!emailError.value && !passwordError.value) {
    console.log('表单验证通过，提交数据')
  }
}
</script>
```

#### 5. 数据统计/计数器展示

在需要展示实时统计数据或计数器的场景中使用。

```vue
<template>
  <div class="counter">
    <button @click="decrement">-</button>
    <span v-text="count"></span>
    <button @click="increment">+</button>
    <p v-text="`当前库存：${inventory} 件`"></p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const count = ref<number>(0)
const maxInventory = 100

const inventory = computed<number>(() => maxInventory - count.value)

function increment(): void {
  if (count.value < maxInventory) count.value++
}

function decrement(): void {
  if (count.value > 0) count.value--
}
</script>
```

#### 6. 价格与货币格式化展示

在电商等场景中展示格式化后的价格信息。

```vue
<template>
  <div class="product">
    <h2 v-text="product.name"></h2>
    <p v-text="`原价：¥${product.originalPrice.toFixed(2)}`"></p>
    <p v-text="`折扣价：¥${discountPrice.toFixed(2)}`"></p>
    <p v-text="`已省：¥${savedAmount.toFixed(2)}`"></p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Product {
  name: string
  originalPrice: number
  discount: number
}

const product = ref<Product>({
  name: 'Vue 3 高级指南',
  originalPrice: 129.00,
  discount: 0.75
})

const discountPrice = computed<number>(() => {
  return product.value.originalPrice * product.value.discount
})

const savedAmount = computed<number>(() => {
  return product.value.originalPrice - discountPrice.value
})
</script>
```

#### 7. 状态标签/徽章文字

在列表项中显示状态标签文本，如订单状态、审核状态等。

```vue
<template>
  <div>
    <div v-for="order in orders" :key="order.id" class="order-item">
      <span v-text="order.id"></span>
      <span
        class="badge"
        :class="statusClass(order.status)"
        v-text="statusText(order.status)"
      ></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'

interface Order {
  id: string
  status: OrderStatus
}

const orders = ref<Order[]>([
  { id: 'ORD-001', status: 'pending' },
  { id: 'ORD-002', status: 'shipped' },
  { id: 'ORD-003', status: 'completed' }
])

const statusMap: Record<OrderStatus, string> = {
  pending: '待付款',
  paid: '已付款',
  shipped: '运输中',
  completed: '已完成',
  cancelled: '已取消'
}

function statusText(status: OrderStatus): string {
  return statusMap[status]
}

function statusClass(status: OrderStatus): string {
  return `status-${status}`
}
</script>
```

#### 8. 通知/消息提示文本

在全局通知或消息提示组件中，使用 `v-text` 动态绑定提示内容。

```vue
<template>
  <div>
    <div
      v-if="notification.show"
      class="notification"
      :class="notification.type"
    >
      <span v-text="notification.message"></span>
      <button @click="closeNotification">&times;</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

interface Notification {
  show: boolean
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

const notification = reactive<Notification>({
  show: true,
  message: '数据保存成功！',
  type: 'success'
})

function closeNotification(): void {
  notification.show = false
}

// 模拟显示通知
function showNotify(msg: string, type: Notification['type']): void {
  notification.message = msg
  notification.type = type
  notification.show = true
}
</script>
```

#### 9. 用户信息卡片

在用户信息展示中，使用 `v-text` 安全地渲染用户数据（防止 XSS）。

```vue
<template>
  <div class="user-card">
    <h3 v-text="user.displayName"></h3>
    <p v-text="`邮箱：${user.email}`"></p>
    <p v-text="`注册时间：${user.createdAt}`"></p>
    <!-- v-text 会自动转义 HTML，即使用户名中包含脚本也不会执行 -->
    <p v-text="user.bio"></p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface UserInfo {
  displayName: string
  email: string
  createdAt: string
  bio: string
}

// 即使 displayName 中包含 HTML/script 标签，v-text 也会转义显示
const user = ref<UserInfo>({
  displayName: '<script>alert("xss")</script>',  // 会被安全地转义为纯文本
  email: 'zhangsan@example.com',
  createdAt: '2024-01-15',
  bio: '一名热爱前端开发的工程师'
})
</script>
```

#### 10. 分页器文本

在数据列表的分页组件中，使用 `v-text` 展示分页信息。

```vue
<template>
  <div class="pagination">
    <button :disabled="page <= 1" @click="page--">上一页</button>
    <span v-text="`第 ${page} 页 / 共 ${totalPages} 页`"></span>
    <button :disabled="page >= totalPages" @click="page++">下一页</button>
    <span v-text="`共 ${total} 条记录`"></span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const page = ref<number>(1)
const pageSize = ref<number>(10)
const total = ref<number>(156)

const totalPages = computed<number>(() => {
  return Math.ceil(total.value / pageSize.value)
})
</script>
```

---

### 六、注意事项

#### 1. v-text 会完全覆盖元素的子内容

`v-text` 通过设置 `textContent` 工作，会替换元素内的**所有**子节点。

```vue
<template>
  <!-- ❌ 错误：子内容会被覆盖 -->
  <div v-text="message">
    <span>这段内容会消失</span>
    <p>这个段落也会消失</p>
  </div>

  <!-- ✅ 正确：需要混合内容时使用 {{ }} -->
  <div>
    <span>静态文本</span>
    {{ message }}
  </div>
</template>
```

#### 2. v-text 不会解析 HTML 标签

`v-text` 会将 HTML 标签作为纯文本显示，不会解析。如果需要解析 HTML，应使用 `v-html`。

```vue
<template>
  <div>
    <!-- v-text 输出纯文本 -->
    <div v-text="content"></div>
    <!-- 页面显示：<b>加粗</b> -->

    <!-- v-html 解析 HTML -->
    <div v-html="content"></div>
    <!-- 页面显示：加粗（实际加粗） -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const content = ref<string>('<b>加粗</b>')
</script>
```

#### 3. 不能用于自闭合标签

`v-text` 设置的是 `textContent`，对于 `<input>`、`<img>`、`<br>`、`<hr>` 等自闭合元素无效。

```vue
<template>
  <!-- ❌ 错误：input 没有 textContent，v-text 无效 -->
  <input v-text="placeholderText" />

  <!-- ✅ 正确：使用 placeholder 属性 -->
  <input :placeholder="placeholderText" />
</template>

<script setup lang="ts">
import { ref } from 'vue'

const placeholderText = ref<string>('请输入内容')
</script>
```

#### 4. 对象类型会显示为 [object Object]

直接将对象传给 `v-text` 时，会调用 `toString()` 方法，输出 `[object Object]`。

```vue
<template>
  <div>
    <!-- ❌ 错误：直接绑定对象 -->
    <div v-text="user"></div>
    <!-- 输出：[object Object] -->

    <!-- ✅ 正确：序列化对象或提取属性 -->
    <pre v-text="JSON.stringify(user, null, 2)"></pre>
    <div v-text="user.name"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const user = ref({ name: '张三', age: 25 })
</script>
```

#### 5. null 和 undefined 会渲染为空字符串

`v-text` 在值为 `null` 或 `undefined` 时不会报错，而是显示空字符串。

```vue
<template>
  <div>
    <!-- 不会报错，但页面显示为空白 -->
    <p v-text="maybeNull"></p>

    <!-- ✅ 建议提供默认值 -->
    <p v-text="maybeNull ?? '暂无数据'"></p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const maybeNull = ref<string | null>(null)
</script>
```

#### 6. v-text 与 {{ }} 的选择原则

两者性能完全一致，选择的关键在于代码可读性和使用场景：

```vue
<template>
  <!-- ✅ 完整替换内容 → 推荐用 v-text -->
  <span v-text="status"></span>

  <!-- ✅ 混合内容 → 推荐用 {{ }} -->
  <span>状态：{{ status }}</span>

  <!-- ❌ 不推荐：混合场景使用 v-text + 表达式拼接 -->
  <span v-text="'状态：' + status"></span>

  <!-- ✅ 推荐：混合场景直接使用 {{ }} -->
  <span>状态：{{ status }}</span>
</template>
```

#### 7. v-text 比 v-html 更安全

在展示用户输入的内容时，始终优先使用 `v-text` 而非 `v-html`，以防止 XSS（跨站脚本）攻击。

```vue
<template>
  <div>
    <!-- ✅ 安全：v-text 会转义 HTML -->
    <div v-text="userInput"></div>

    <!-- ⚠️ 危险：v-html 会执行恶意脚本 -->
    <!-- <div v-html="userInput"></div> -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 恶意用户输入
const userInput = ref<string>('<img src=x onerror="alert(\'XSS\')">')
</script>
```

> ⚠️ **注意：** 任何来自用户输入的内容，都应使用 `v-text` 或 `{{ }}` 渲染，绝对不要使用 `v-html`，除非你对该内容进行了严格的消毒处理。

#### 8. 表达式中避免复杂逻辑

`v-text` 的值虽然支持 JavaScript 表达式，但应避免在模板中编写复杂逻辑，复杂计算应放到 `computed` 或 `methods` 中。

```vue
<template>
  <div>
    <!-- ❌ 不推荐：模板中包含复杂逻辑 -->
    <span v-text="items.filter(i => i.active).map(i => i.name).join(', ')"></span>

    <!-- ✅ 推荐：使用 computed -->
    <span v-text="activeItemNames"></span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Item {
  name: string
  active: boolean
}

const items = ref<Item[]>([
  { name: '商品A', active: true },
  { name: '商品B', active: false },
  { name: '商品C', active: true }
])

const activeItemNames = computed<string>(() => {
  return items.value
    .filter((i) => i.active)
    .map((i) => i.name)
    .join('、')
})
</script>
```

#### 9. 在组件上使用时的行为

`v-text` 用在组件标签上时，会将文本内容传递给组件的默认插槽（`slot`）。

```vue
<template>
  <!-- v-text 传递文本给组件的默认插槽 -->
  <MyButton v-text="buttonText" />
  <!-- 等价于：<MyButton>{{ buttonText }}</MyButton> -->
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MyButton from './MyButton.vue'

const buttonText = ref<string>('提交')
</script>
```

> 💡 **提示：** 如果组件没有默认插槽，`v-text` 传递的内容将被忽略。

#### 10. 与其他指令的优先级

`v-text` 与 `v-if`、`v-for` 等指令可以同时使用，但要注意指令的执行顺序：`v-if` 优先于 `v-for`，`v-for` 优先于 `v-text`。

```vue
<template>
  <!-- ✅ v-if 控制是否渲染，v-text 控制显示内容 -->
  <div v-if="showMessage" v-text="message"></div>

  <!-- ✅ v-for 循环渲染，v-text 控制每项的文本 -->
  <div v-for="item in items" :key="item.id" v-text="item.name"></div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showMessage = ref<boolean>(true)
const message = ref<string>('Hello')

interface Item {
  id: number
  name: string
}

const items = ref<Item[]>([
  { id: 1, name: '苹果' },
  { id: 2, name: '香蕉' }
])
</script>
```

---

### 七、相关 API 对比

| 特性 | `v-text` | `{{ }}` 插值 | `v-html` |
| --- | --- | --- | --- |
| **作用** | 设置元素纯文本内容 | 插值渲染文本 | 设置元素 HTML 内容 |
| **底层实现** | `el.textContent` | `el.textContent`（编译后等同于 v-text） | `el.innerHTML` |
| **HTML 解析** | 不解析，自动转义 | 不解析，自动转义 | 解析 HTML 标签 |
| **XSS 安全** | 安全 | 安全 | 不安全（需手动消毒） |
| **覆盖子内容** | 完全覆盖 | 可混合使用 | 完全覆盖 |
| **适用元素** | 非自闭合元素 | 非自闭合元素 | 非自闭合元素 |
| **性能** | 高 | 高 | 略低（需要解析 HTML） |

**使用建议：**
- 日常开发中，**优先使用 `{{ }}` 插值**，更灵活且可读性更好
- 需要语义化声明"整个元素内容由数据驱动"时，使用 **`v-text`**
- 需要渲染 HTML 富文本时，谨慎使用 **`v-html`**，确保内容安全

```vue
<template>
  <div>
    <!-- 方式一：插值表达式（最常用） -->
    <p>{{ message }}</p>

    <!-- 方式二：v-text（显式声明） -->
    <p v-text="message"></p>

    <!-- 方式三：v-html（仅用于可信的 HTML 内容） -->
    <p v-html="richText"></p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const message = ref<string>('Hello Vue 3')
const richText = ref<string>('<strong>加粗的文字</strong>')
</script>
```

---

### 八、总结

`v-text` 是 Vue 3 中用于设置元素纯文本内容的内置指令，核心特点如下：

- **安全**：自动转义 HTML，防止 XSS 攻击，适合渲染用户输入
- **简洁**：语义明确，表达"整个元素的文本由数据驱动"
- **等价**：功能与 `{{ }}` 插值基本一致，但会完全覆盖子内容
- **响应式**：绑定值变化时自动更新 DOM

> 💡 **提示：** 在实际开发中，`{{ }}` 插值表达式因为可以与静态文本混合使用而更加灵活，因此使用频率更高。`v-text` 更适合在特定场景下使用，例如：需要完整替换元素内容、团队代码规范要求统一使用指令风格等。
