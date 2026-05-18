# v-html

用于更新元素的 innerHTML，绑定值会被解析为 HTML 并插入。

## 语法

```html
<div v-html="htmlContent"></div>
```

## 参数

- `expression`: 一个包含 HTML 字符串的表达式

## 基础用法

```vue
<template>
  <div>
    <p>普通文本: {{ rawHtml }}</p>
    <p>解析HTML: <span v-html="rawHtml"></span></p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const rawHtml = ref('<strong>加粗文字</strong>')
</script>

<!-- 输出:
  普通: <strong>加粗文字</strong>
  解析HTML: <strong>加粗文字</strong> (实际加粗显示)
-->
```

## 富文本内容

```vue
<template>
  <div class="rich-text">
    <div v-html="articleContent"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const articleContent = ref(`
  <h2>文章标题</h2>
  <p>这是一段<strong>重要</strong>的内容。</p>
  <ul>
    <li>列表项1</li>
    <li>列表项2</li>
    <li>列表项3</li>
  </ul>
`)
</script>
```

## 动态 HTML 内容

```vue
<template>
  <div>
    <select v-model="selectedTemplate">
      <option value="welcome">欢迎模板</option>
      <option value="error">错误模板</option>
      <option value="success">成功模板</option>
    </select>
    <div v-html="currentTemplate"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const selectedTemplate = ref('welcome')

const templates = {
  welcome: '<h1>欢迎!</h1><p>感谢您的访问</p>',
  error: '<h1 style="color:red">错误</h1><p>发生了一些问题</p>',
  success: '<h1 style="color:green">成功!</h1><p>操作已完成</p>'
}

const currentTemplate = computed(() => {
  return templates[selectedTemplate.value]
})
</script>
```

## Markdown 渲染

```vue
<template>
  <div>
    <textarea v-model="markdown" rows="10"></textarea>
    <div class="preview" v-html="renderedMarkdown"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'

const markdown = ref('# 标题\n\n这是**加粗**文字')

const renderedMarkdown = computed(() => {
  return marked(markdown.value)
})
</script>
```

## 安全注意事项

```vue
<template>
  <div>
    <!-- 危险！不要使用用户输入作为 v-html 的值 -->
    <div v-html="userInput"></div>

    <!-- 应该先进行清理 -->
    <div v-html="sanitizedInput"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DOMPurify from 'dompurify'

const userInput = ref('<img src=x onerror=alert(1)>')

// 错误：直接使用用户输入
// const dangerousHtml = userInput.value

// 正确：先清理再使用
const sanitizedInput = computed(() => {
  return DOMPurify.sanitize(userInput.value)
})
</script>
```

## 使用 DOMPurify 清理 HTML

```vue
<template>
  <div>
    <textarea v-model="rawContent" placeholder="输入HTML内容"></textarea>
    <button @click="render">渲染</button>
    <div class="output" v-html="cleanContent"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DOMPurify from 'dompurify'

const rawContent = ref('<p>安全内容</p><script>alert("XSS")<\/script>')

const cleanContent = computed(() => {
  return DOMPurify.sanitize(rawContent.value, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'u', 'strong', 'em'],
    ALLOWED_ATTR: []
  })
})
</script>
```

## 简单的 HTML 清理函数

```vue
<script setup>
// 简单的 HTML 清理（只允许基本标签）
function sanitizeHtml(html) {
  const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'b', 'i']
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  const elements = tempDiv.querySelectorAll('*')
  elements.forEach(el => {
    if (!allowedTags.includes(el.tagName.toLowerCase())) {
      el.replaceWith(...el.childNodes)
    }
  })

  return tempDiv.innerHTML
}

const rawHtml = ref('<p>安全</p><script>alert(1)<\/script>')
const safeHtml = computed(() => sanitizeHtml(rawHtml.value))
</script>
```

## 编辑器内容显示

```vue
<template>
  <div>
    <div
      contenteditable
      @input="updateContent"
      class="editor"
    ></div>
    <div class="preview" v-html="content"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const content = ref('<p>开始编辑...</p>')

function updateContent(event) {
  content.value = event.target.innerHTML
}
</script>

<style>
.editor {
  border: 1px solid #ccc;
  min-height: 100px;
  padding: 10px;
  margin-bottom: 20px;
}

.preview {
  border: 1px solid #eee;
  padding: 10px;
  background: #f9f9f9;
}
</style>
```

## 邮件模板预览

```vue
<template>
  <div class="email-preview">
    <h3>邮件预览</h3>
    <div class="email-content" v-html="emailTemplate"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emailTemplate = ref(`
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #333;">尊敬的用户</h2>
    <p>感谢您的注册！</p>
    <p>请点击下面的链接验证您的邮箱：</p>
    <a href="#" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">验证邮箱</a>
    <p style="color: #999; font-size: 12px; margin-top: 30px;">
      如果您没有注册，请忽略此邮件。
    </p>
  </div>
`)
</script>
```

## 代码高亮显示

```vue
<template>
  <div class="code-display">
    <pre><code v-html="highlightedCode"></code></pre>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Prism } from 'prismjs'

const code = ref(`function hello() {
  console.log('Hello, World!')
}`)

const highlightedCode = computed(() => {
  return Prism.highlight(code.value, Prism.languages.javascript, 'javascript')
})
</script>
```

## 与 v-text 的区别

```vue
<template>
  <div>
    <!-- v-text: 显示纯文本 -->
    <div v-text="htmlContent"></div>
    <!-- 输出: <strong>加粗</strong> -->

    <!-- v-html: 解析 HTML -->
    <div v-html="htmlContent"></div>
    <!-- 输出: 加粗 (实际加粗显示) -->

    <!-- {{ }} 语法: 相当于 v-text -->
    <div>{{ htmlContent }}</div>
    <!-- 输出: <strong>加粗</strong> -->
  </div>
</template>

<script setup>
import { ref } from 'vue'

const htmlContent = ref('<strong>加粗</strong>')
</script>
```

## SVG 图标显示

```vue
<template>
  <div>
    <div v-html="iconSvg" class="icon"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const iconSvg = ref(`
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
    <path fill="currentColor" d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
  </svg>
`)
</script>
```

## 动态组件内容

```vue
<template>
  <div>
    <button @click="currentView = 'home'">首页</button>
    <button @click="currentView = 'about'">关于</button>
    <div v-html="currentContent"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const currentView = ref('home')

const views = {
  home: `
    <h1>欢迎来到首页</h1>
    <p>这是我们的网站</p>
  `,
  about: `
    <h1>关于我们</h1>
    <p>我们是一家很棒的公司</p>
  `
}

const currentContent = computed(() => views[currentView.value])
</script>
```

## 注意事项

1. **XSS 风险**：永远不要将用户输入直接用于 v-html，必须先进行清理

2. **只信任可信来源**：只对自己生成的内容使用 v-html

3. **作用域样式不生效**：v-html 插入的内容不会受 scoped 样式影响

```vue
<style scoped>
/* 这不会影响 v-html 插入的内容 */
.content p {
  color: red;
}
</style>
```

4. **使用深度选择器**：如果需要样式 v-html 内容，使用 `:deep()`

```vue
<style scoped>
.content :deep(p) {
  color: red;
}
</style>
```

5. **不插值 Mustache 语法**：v-html 会覆盖任何子内容

```vue
<!-- 错误 -->
<div v-html="content">{{ content }}</div>

<!-- 正确 -->
<div v-html="content"></div>
```

6. **性能考虑**：频繁更新 v-html 可能影响性能
