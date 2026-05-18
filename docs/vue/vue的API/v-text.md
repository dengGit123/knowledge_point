# v-text

用于更新元素的 textContent，绑定值会被作为纯文本插入。

## 语法

```html
<div v-text="textContent"></div>
```

## 参数

- `expression`: 一个字符串表达式

## 基础用法

```vue
<template>
  <div>
    <p v-text="message"></p>
    <!-- 等价于 -->
    <p>{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('Hello Vue!')
</script>
```

## 与 v-html 的区别

```vue
<template>
  <div>
    <!-- v-text: 显示纯文本，HTML 标签会转义 -->
    <div v-text="htmlContent"></div>
    <!-- 输出: <strong>加粗文字</strong> -->

    <!-- v-html: 解析 HTML -->
    <div v-html="htmlContent"></div>
    <!-- 输出: 加粗文字 (实际加粗显示) -->

    <!-- {{ }}: 相当于 v-text -->
    <div>{{ htmlContent }}</div>
    <!-- 输出: <strong>加粗文字</strong> -->
  </div>
</template>

<script setup>
import { ref } from 'vue'

const htmlContent = ref('<strong>加粗文字</strong>')
</script>
```

## 覆盖元素内容

```vue
<template>
  <div>
    <!-- v-text 会覆盖所有子内容 -->
    <div v-text="message">
      这段内容会被覆盖
      <span>包括这个 span</span>
    </div>

    <!-- 使用 {{ }} 可以保留其他内容 -->
    <div>
      {{ message }}
      <span>这段内容会保留</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('覆盖的内容')
</script>
```

## 动态文本内容

```vue
<template>
  <div>
    <select v-model="selectedLang">
      <option value="zh">中文</option>
      <option value="en">English</option>
      <option value="ja">日本語</option>
    </select>
    <p v-text="greeting"></p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const selectedLang = ref('zh')

const greetings = {
  zh: '你好，欢迎！',
  en: 'Hello, Welcome!',
  ja: 'こんにちは、ようこそ！'
}

const greeting = computed(() => greetings[selectedLang.value])
</script>
```

## 表单标签

```vue
<template>
  <form>
    <label for="username" v-text="usernameLabel"></label>
    <input id="username" type="text" v-model="username" />

    <label for="password" v-text="passwordLabel"></label>
    <input id="password" type="password" v-model="password" />

    <button type="submit" v-text="submitText"></button>
  </form>
</template>

<script setup>
import { ref } from 'vue'

const username = ref('')
const password = ref('')
const usernameLabel = ref('用户名：')
const passwordLabel = ref('密码：')
const submitText = ref('登录')
</script>
```

## 计数器

```vue
<template>
  <div>
    <button @click="count--">-</button>
    <span v-text="count"></span>
    <button @click="count++">+</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>
```

## 加载状态

```vue
<template>
  <div>
    <button v-text="loading ? '加载中...' : '点击加载'" @click="loadData"></button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const loading = ref(false)

async function loadData() {
  loading.value = true
  await new Promise(resolve => setTimeout(resolve, 2000))
  loading.value = false
}
</script>
```

## 文本拼接

```vue
<template>
  <div>
    <p v-text="greeting + ', ' + name + '!'"></p>
    <!-- 等价于 -->
    <p>{{ greeting }}, {{ name }}!</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const greeting = ref('Hello')
const name = ref('Vue')
</script>
```

## 条件文本

```vue
<template>
  <div>
    <p v-text="isLoggedIn ? welcomeMessage : loginPrompt"></p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isLoggedIn = ref(false)
const welcomeMessage = ref('欢迎回来！')
const loginPrompt = ref('请先登录')
</script>
```

## 价格显示

```vue
<template>
  <div>
    <p>商品价格: <span v-text="'¥' + price.toFixed(2)"></span></p>
    <p>折扣价: <span v-text="'¥' + discountedPrice.toFixed(2)"></span></p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const price = ref(99.9)
const discount = ref(0.8)

const discountedPrice = computed(() => price.value * discount.value)
</script>
```

## 数组/对象内容

```vue
<template>
  <div>
    <p v-text="JSON.stringify(user, null, 2)"></p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const user = ref({
  name: '张三',
  age: 25,
  city: '北京'
})
</script>
```

## 错误消息

```vue
<template>
  <div>
    <div class="error" v-if="error" v-text="error"></div>
    <div class="success" v-else v-text="success"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const error = ref('')
const success = ref('操作成功')
</script>
```

## 表单验证消息

```vue
<template>
  <form @submit.prevent="submit">
    <input type="email" v-model="email" />
    <div class="error" v-if="emailError" v-text="emailError"></div>

    <input type="password" v-model="password" />
    <div class="error" v-if="passwordError" v-text="passwordError"></div>
  </form>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const emailError = ref('')
const passwordError = ref('')

function submit() {
  emailError.value = email.value ? '' : '请输入邮箱'
  passwordError.value = password.value ? '' : '请输入密码'
}
</script>
```

## 动态占位符

```vue
<template>
  <div>
    <input
      type="text"
      v-model="searchQuery"
      :placeholder="searchPlaceholder"
      v-text="searchPlaceholder"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const searchType = ref('products')

const searchPlaceholder = computed(() => {
  const placeholders = {
    products: '搜索产品...',
    users: '搜索用户...',
    orders: '搜索订单...'
  }
  return placeholders[searchType.value]
})
</script>
```

## 与文本内容混合

```vue
<template>
  <div>
    <!-- {{ }} 更适合混合场景 -->
    <p>
      Hello, {{ name }}! You have {{ count }} messages.
    </p>

    <!-- v-text 适合完整替换 -->
    <p v-text="fullMessage"></p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const name = ref('Vue')
const count = ref(5)

const fullMessage = computed(() => {
  return `Hello, ${name.value}! You have ${count.value} messages.`
})
</script>
```

## SEO 优化的文本

```vue
<template>
  <div>
    <h1 v-text="pageTitle"></h1>
    <p v-text="pageDescription"></p>
    <span v-text="metaKeywords"></span>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const pageTitle = ref('欢迎来到我的网站')
const pageDescription = ref('这是一个使用 Vue 3 构建的网站')
const metaKeywords = ref('Vue, JavaScript, 前端')
</script>
```

## 注意事项

1. **转义 HTML**：v-text 会自动转义 HTML 标签，更安全

2. **覆盖内容**：v-text 会替换元素的所有子内容

3. **与 {{ }} 的选择**：
   - 需要混合文本和元素 → 用 `{{ }}`
   - 完整替换内容 → 用 `v-text` 或 `{{ }}`

4. **比 v-html 安全**：不会执行脚本，适合显示用户输入

5. **性能**：与 `{{ }}` 性能相同，选择更符合语义的即可

```vue
<!-- 推荐：简洁明了 -->
<p>{{ message }}</p>

<!-- 也行：更明确表达意图 -->
<p v-text="message"></p>
```

6. **不能用于自闭合标签**：v-text 不适用于 `<input>`、`<img>` 等自闭合元素
