# v-pre

## 作用

`v-pre` 跳过该元素及其所有子元素的编译过程，直接原样输出。也就是说，元素中的 Vue 模板语法（如 `{{ }}`、指令等）不会被解析，而是作为普通文本显示。

📖 [Vue 官方文档 - v-pre](https://cn.vuejs.org/api/built-in-directives#v-pre)

## 基本用法

```vue
<template>
  <!-- 正常编译 -->
  <p>{{ message }}</p>
  <!-- 输出：Hello Vue -->

  <!-- 跳过编译，原样显示 -->
  <span v-pre>{{ message }}</span>
  <!-- 输出：{{ message }} -->
</template>

<script setup>
import { ref } from 'vue'
const message = ref('Hello Vue')
</script>
```

## 使用场景

### 1. 展示 Vue 模板语法文档

```vue
<template>
  <div class="vue-docs">
    <h2>Vue 模板语法示例</h2>

    <!-- 无需转义，直接显示模板语法 -->
    <div v-pre>
      <p>文本插值：{{ message }}</p>
      <p>属性绑定：v-bind:href="url"</p>
      <p>事件绑定：@click="handler"</p>
      <p>条件渲染：v-if="show"</p>
      <p>列表渲染：v-for="item in list"</p>
    </div>
  </div>
</template>
```

### 2. 代码展示组件

```vue
<template>
  <div class="code-example">
    <h3>示例代码：</h3>
    <pre v-pre><code>&lt;template&gt;
  &lt;div&gt;
    &lt;h1&gt;{{ title }}&lt;/h1&gt;
    &lt;p v-if="show"&gt;{{ content }}&lt;/p&gt;
  &lt;/div&gt;
&lt;/template&gt;</code></pre>
  </div>
</template>
```

### 3. 批量跳过编译（提升性能）

```vue
<template>
  <!-- 包含大量纯静态内容的区域，用 v-pre 跳过编译 -->
  <div v-pre>
    <h1>关于我们</h1>
    <p>这是一段很长的纯文本内容，不需要 Vue 编译。</p>
    <p>公司成立于 2020 年，专注于...</p>
    <ul>
      <li>产品 A</li>
      <li>产品 B</li>
      <li>产品 C</li>
    </ul>
  </div>
</template>
```

### 4. API 文档页面

```vue
<template>
  <div class="api-docs">
    <h2>API 参考</h2>

    <section>
      <h3>指令语法</h3>
      <div v-pre>
        <p>v-text: 更新元素的 textContent</p>
        <p>v-html: 更新元素的 innerHTML</p>
        <p>v-show: 通过 CSS display 控制显示</p>
        <p>v-if / v-else / v-else-if: 条件渲染</p>
        <p>v-for: 列表渲染，如 v-for="item in items"</p>
        <p>v-on: 事件绑定，简写 @，如 @click="handler"</p>
        <p>v-bind: 属性绑定，简写 :，如 :href="url"</p>
        <p>v-model: 双向绑定，如 v-model="message"</p>
      </div>
    </section>

    <section>
      <h3>插值语法</h3>
      <div v-pre>
        <p>文本：{{ expression }}</p>
        <p>JS 表达式：{{ ok ? 'YES' : 'NO' }}</p>
        <p>原始 HTML：使用 v-html 指令</p>
      </div>
    </section>
  </div>
</template>
```

### 5. 在线编辑器/文档中的 Vue 语法高亮

```vue
<template>
  <div class="tutorial">
    <h3>Vue 基础教程</h3>

    <!-- 语法展示区域 -->
    <div class="code-block">
      <pre v-pre><code>{{ greeting }}</code></pre>
      <p class="description">使用双花括号进行文本插值</p>
    </div>

    <div class="code-block">
      <pre v-pre><code>v-bind:src="imageUrl"</code></pre>
      <p class="description">使用 v-bind 动态绑定属性</p>
    </div>

    <!-- 正常交互区域 -->
    <div class="playground">
      <p>{{ greeting }}</p>
      <input v-model="greeting" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const greeting = ref('Hello Vue!')
</script>
```

### 6. 混合使用（部分编译，部分不编译）

```vue
<template>
  <div class="page">
    <!-- 这部分正常编译 -->
    <h1>{{ pageTitle }}</h1>
    <p>当前用户：{{ userName }}</p>

    <!-- 这部分跳过编译 -->
    <div class="syntax-reference" v-pre>
      <h2>模板语法参考</h2>
      <p>变量输出：{{ variable }}</p>
      <p>条件渲染：v-if="condition"</p>
      <p>循环渲染：v-for="item in list" :key="item.id"</p>
    </div>

    <!-- 这部分又正常编译 -->
    <footer>© {{ year }}</footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const pageTitle = ref('Vue 教程')
const userName = ref('张三')
const year = ref(new Date().getFullYear())
</script>
```

## 注意事项

### 1. 会跳过所有子元素

```vue
<template>
  <!-- ⚠️ v-pre 会跳过所有子元素的编译 -->
  <div v-pre>
    <!-- 这些都不会被编译 -->
    <span>{{ message }}</span>
    <button @click="handleClick">点击</button>
    <input v-model="value" />
  </div>
</template>
```

### 2. 不能选择性跳过

```vue
<template>
  <!-- ❌ 无法在 v-pre 内部让某个元素正常编译 -->
  <div v-pre>
    <span>{{ staticText }}</span>
    <!-- 这个也不会编译 -->
    <span>{{ dynamicText }}</span>
  </div>

  <!-- ✅ 解决方案：拆分成不同的区域 -->
  <div v-pre>
    <span>{{ staticText }}</span>
  </div>
  <span>{{ dynamicText }}</span>
</template>
```

### 3. 与 v-for 不兼容

```vue
<template>
  <!-- ❌ v-pre 内的 v-for 不会被编译 -->
  <div v-pre>
    <li v-for="item in list">{{ item }}</li>
    <!-- 输出原样：<li v-for="item in list">{{ item }}</li> -->
  </div>
</template>
```

### 4. 注意 HTML 转义

```vue
<template>
  <!-- v-pre 中可以直接写 < > 等 HTML 字符，但推荐使用 HTML 实体 -->
  <div v-pre>
    <p>标签：&lt;div&gt;content&lt;/div&gt;</p>
  </div>
</template>
```

## 最佳实践

1. **文档和教程页面**：在需要展示 Vue 模板语法的文档页面中使用，避免手动转义
2. **纯静态内容优化**：对大量不需要编译的纯静态内容使用 `v-pre`，减少编译开销
3. **最小范围使用**：只在需要跳过编译的元素上添加 `v-pre`，避免影响正常编译的元素
4. **代码展示**：配合 `<pre>` 和 `<code>` 标签使用，展示代码示例
