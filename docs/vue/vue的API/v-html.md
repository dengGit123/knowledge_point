> 📖 [Vue 官方文档 - v-html](https://cn.vuejs.org/api/built-in-directives#v-html)
>
> 📖 [Vue 官方文档 - 原始 HTML](https://cn.vuejs.org/guide/essentials/template-syntax#raw-html)

### 一、概述

`v-html` 是 Vue 3 提供的一个内置指令，用于**将数据作为真实 HTML 插入到页面中**。

在 Vue 模板中，使用双花括号 `{{ }}` 插值会将内容当作**纯文本**渲染——即使文本里包含 HTML 标签，浏览器也不会解析它们，而是原样显示标签字符串。当你需要渲染富文本内容（比如从后端接口获取的 HTML 格式文章、邮件模板等）时，就需要用到 `v-html`。

简单来说：`v-html` 的作用等同于原生 JavaScript 的 `element.innerHTML = value`，它会将绑定的字符串作为 HTML 解析后插入到目标元素内部。

> ⚠️ **注意：** `v-html` 存在 XSS（跨站脚本攻击）安全风险，只应对**可信内容**使用，**绝不要**将用户输入直接作为 `v-html` 的值。

### 二、核心原理

#### 1. 工作机制

`v-html` 指令的底层行为如下：

- 接收一个**字符串类型**的值
- 将该字符串设置为目标 DOM 元素的 `innerHTML` 属性
- 浏览器会解析这个字符串中的 HTML 标签并渲染到页面
- **Vue 模板语法不会被解析**：`v-html` 中包含的 `{{ }}`、`v-bind`、`v-if` 等 Vue 指令都会被当作普通字符串，不会被编译

#### 2. 与文本插值的对比

```
数据源：<strong style="color: red;">加粗文字</strong>

{{ rawHtml }}   → 页面显示：<strong style="color: red;">加粗文字</strong>（原样输出标签字符串）
v-html="rawHtml" → 页面显示：加粗文字（实际加粗且变红）
```

- `{{ }}` 和 `v-text`：设置 `textContent`，内容转义后原样显示
- `v-html`：设置 `innerHTML`，内容作为 HTML 解析渲染

### 三、详细用法

#### 1. 基本用法

最简单的用法，将一个响应式变量绑定到元素的 `v-html` 指令上：

```vue
<template>
  <div>
    <!-- 使用双花括号：标签被当作纯文本 -->
    <p>文本插值：{{ rawHtml }}</p>

    <!-- 使用 v-html：标签被解析为真实 HTML -->
    <p>v-html：<span v-html="rawHtml"></span></p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// ✅ 绑定值必须是 string 类型
const rawHtml: string = '<strong style="color: red;">加粗文字</strong>'
</script>

<!-- 页面渲染结果：
  文本插值：<strong style="color: red;">加粗文字</strong>
  v-html：加粗文字（实际加粗且为红色）
-->
```

#### 2. 进阶用法

##### (1) 配合 computed 动态生成 HTML

```vue
<template>
  <div>
    <select v-model="selectedStatus">
      <option value="success">成功</option>
      <option value="warning">警告</option>
      <option value="error">错误</option>
    </select>

    <!-- 根据选择状态动态渲染不同样式的提示信息 -->
    <div v-html="statusHtml"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

type Status = 'success' | 'warning' | 'error'

const selectedStatus = ref<Status>('success')

// ✅ 使用 computed 动态计算 HTML 内容
const statusHtml = computed<string>(() => {
  const config: Record<Status, { color: string; text: string }> = {
    success: { color: '#52c41a', text: '操作成功！' },
    warning: { color: '#faad14', text: '请注意！' },
    error: { color: '#f5222d', text: '操作失败！' }
  }
  const { color, text } = config[selectedStatus.value]
  return `<div style="padding: 12px; border-radius: 4px; background: ${color}22; color: ${color}; border: 1px solid ${color};">
    <strong>${text}</strong>
  </div>`
})
</script>
```

##### (2) 渲染 Markdown 内容

```vue
<template>
  <div class="markdown-editor">
    <textarea v-model="markdownText" rows="8" placeholder="输入 Markdown 内容" />
    <div class="preview" v-html="renderedHtml"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { marked } from 'marked'

const markdownText = ref<string>('# 标题\n\n这是一段 **加粗** 文字\n\n- 列表项 1\n- 列表项 2')

// ✅ 将 Markdown 转为 HTML 后渲染
const renderedHtml = computed<string>(() => {
  return marked(markdownText.value) as string
})
</script>

<style scoped>
.markdown-editor {
  display: flex;
  gap: 20px;
}
.markdown-editor textarea {
  flex: 1;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  resize: vertical;
}
.preview {
  flex: 1;
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fafafa;
}
</style>
```

##### (3) 代码高亮显示

```vue
<template>
  <div class="code-block">
    <pre><code v-html="highlightedCode"></code></pre>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'

const sourceCode: string = `function greet(name: string): string {
  console.log(\`Hello, \${name}!\`)
  return \`Hello, \${name}!\`
}

greet('Vue')`

// ✅ 使用 Prism.js 对代码进行语法高亮
const highlightedCode = computed<string>(() => {
  return Prism.highlight(sourceCode, Prism.languages.typescript, 'typescript')
})
</script>
```

##### (4) SVG 图标动态渲染

```vue
<template>
  <div class="icon-container">
    <!-- 动态渲染不同的 SVG 图标 -->
    <span v-html="iconSvg" class="icon-wrapper"></span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

type IconName = 'home' | 'user' | 'settings'

const currentIcon = ref<IconName>('home')

const icons: Record<IconName, string> = {
  home: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>',
  user: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  settings: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>'
}

const iconSvg = computed<string>(() => icons[currentIcon.value])
</script>

<style scoped>
.icon-wrapper {
  display: inline-flex;
  align-items: center;
}
</style>
```

#### 3. API 参数说明

| 属性 | 说明 |
|------|------|
| **指令名称** | `v-html` |
| **期望绑定值类型** | `string` |
| **作用** | 更新元素的 `innerHTML`，将绑定值作为真实 HTML 插入 |
| **编译行为** | 插入的 HTML 不会被 Vue 模板编译器解析（`{{ }}`、指令等均无效） |
| **元素内容** | 会完全覆盖元素的现有子内容 |
| **scoped 样式** | 插入的内容**不受** `scoped` 样式影响 |
| **安全性** | 动态渲染任意 HTML 非常危险，容易导致 XSS 攻击 |

### 四、实现效果

使用 `v-html` 后，绑定的字符串会被浏览器解析为真实 HTML 并渲染：

```vue
<template>
  <div>
    <!-- 1. 文本插值：纯文本输出 -->
    <p>{{ content }}</p>
    <!-- 页面显示：<em>斜体</em> 和 <u>下划线</u> -->

    <!-- 2. v-html：HTML 解析渲染 -->
    <p v-html="content"></p>
    <!-- 页面显示：斜体 和 下划线（实际斜体和下划线效果） -->
  </div>
</template>

<script setup lang="ts">
const content: string = '<em>斜体</em> 和 <u>下划线</u>'
</script>
```

### 五、使用场景

#### 1. 富文本编辑器内容展示

从后端获取富文本编辑器（如 TinyMCE、WangEditor）生成的 HTML 内容并渲染到页面。

```vue
<template>
  <article class="article-detail">
    <h1>{{ article.title }}</h1>
    <div class="article-body" v-html="article.content"></div>
  </article>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Article {
  title: string
  content: string
}

const article = ref<Article>({ title: '', content: '' })

onMounted(async () => {
  // 从 API 获取后端存储的富文本 HTML
  const res = await fetch('/api/articles/1')
  article.value = await res.json()
})
</script>
```

#### 2. Markdown 编辑器实时预览

将用户输入的 Markdown 实时转换为 HTML 并预览显示。

```vue
<template>
  <div class="md-editor">
    <div class="editor-pane">
      <textarea v-model="markdownSource" placeholder="请输入 Markdown..." />
    </div>
    <div class="preview-pane" v-html="htmlOutput"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { marked } from 'marked'

const markdownSource = ref<string>('# 你好世界\n\n这是 **Markdown** 实时预览')

const htmlOutput = computed<string>(() => {
  return marked.parse(markdownSource.value) as string
})
</script>

<style scoped>
.md-editor {
  display: flex;
  gap: 16px;
  height: 500px;
}
.editor-pane,
.preview-pane {
  flex: 1;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow-y: auto;
}
.editor-pane textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
  font-family: monospace;
}
</style>
```

#### 3. 邮件模板预览

在后台管理系统中预览即将发送的邮件 HTML 模板。

```vue
<template>
  <div class="email-preview-wrapper">
    <h3>邮件预览</h3>
    <div class="email-container" v-html="emailHtml"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface EmailData {
  username: string
  actionUrl: string
}

const emailData: EmailData = {
  username: '张三',
  actionUrl: 'https://example.com/verify'
}

// ✅ 拼接邮件模板 HTML（模板内容来自服务端或本地模板字符串）
const emailHtml = computed<string>(() => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">尊敬的 ${emailData.username}：</h2>
      <p>感谢您注册我们的服务！</p>
      <p>请点击下方按钮完成邮箱验证：</p>
      <a href="${emailData.actionUrl}"
         style="display: inline-block; background: #1677ff; color: #fff; padding: 10px 24px; text-decoration: none; border-radius: 4px;">
        验证邮箱
      </a>
      <p style="color: #999; font-size: 12px; margin-top: 24px;">
        如果按钮无法点击，请复制以下链接到浏览器打开：<br/>
        ${emailData.actionUrl}
      </p>
    </div>
  `
})
</script>
```

#### 4. 代码语法高亮展示

在技术博客或文档站点中展示带有语法高亮的代码片段。

```vue
<template>
  <div class="code-snippet">
    <div class="code-header">
      <span>{{ language }}</span>
      <button @click="copyCode">复制</button>
    </div>
    <pre><code v-html="highlightedCode"></code></pre>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'

const props = defineProps<{
  code: string
  language?: string
}>()

// ✅ 使用 Prism.js 将源代码转为带高亮标签的 HTML
const highlightedCode = computed<string>(() => {
  const grammar = Prism.languages[props.language || 'javascript']
  return Prism.highlight(props.code, grammar, props.language || 'javascript')
})

function copyCode(): void {
  navigator.clipboard.writeText(props.code)
}
</script>
```

#### 5. 动态通知 / 消息提示

根据业务状态渲染不同样式的系统通知，支持带格式的富文本消息。

```vue
<template>
  <div class="notification-center">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      class="notification-item"
      v-html="notification.html"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Notification {
  id: number
  html: string
}

const notifications = ref<Notification[]>([
  {
    id: 1,
    html: '<div style="padding: 8px 12px; background: #f6ffed; border: 1px solid #b7eb8f; border-radius: 4px;"><strong>成功</strong>：数据已保存</div>'
  },
  {
    id: 2,
    html: '<div style="padding: 8px 12px; background: #fff7e6; border: 1px solid #ffd591; border-radius: 4px;"><strong>警告</strong>：存储空间不足，请及时清理</div>'
  },
  {
    id: 3,
    html: '<div style="padding: 8px 12px; background: #fff2f0; border: 1px solid #ffccc7; border-radius: 4px;"><strong>错误</strong>：网络连接失败，<a href="#" onclick="location.reload()">点击重试</a></div>'
  }
])
</script>
```

#### 6. 后端 CMS 内容渲染

内容管理系统（CMS）中，页面内容由后台管理人员通过可视化编辑器维护，前端负责渲染。

```vue
<template>
  <div class="cms-page">
    <!-- 渲染 CMS 管理后台维护的页面内容 -->
    <section v-html="pageContent"></section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DOMPurify from 'dompurify'

const pageContent = ref<string>('')

onMounted(async () => {
  const res = await fetch('/api/cms/pages/home')
  const data = await res.json()

  // ✅ 即使是 CMS 内容，也建议进行安全过滤
  pageContent.value = DOMPurify.sanitize(data.html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'p', 'a', 'img', 'ul', 'ol', 'li',
      'strong', 'em', 'b', 'i', 'u', 'br', 'div', 'span', 'table',
      'thead', 'tbody', 'tr', 'th', 'td', 'blockquote', 'pre', 'code'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target']
  })
})
</script>
```

#### 7. SVG 图标系统

后端或配置文件维护 SVG 图标集合，前端通过 `v-html` 动态渲染。

```vue
<template>
  <div class="icon-demo">
    <button
      v-for="icon in iconList"
      :key="icon.name"
      class="icon-btn"
      @click="selectedIcon = icon.name"
    >
      <span v-html="icon.svg"></span>
      <span class="icon-name">{{ icon.name }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface IconItem {
  name: string
  svg: string
}

// ✅ 图标数据可来自后端接口或本地配置
const iconList = ref<IconItem[]>([
  {
    name: '首页',
    svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>'
  },
  {
    name: '搜索',
    svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>'
  },
  {
    name: '用户',
    svg: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
  }
])

const selectedIcon = ref<string>('')
</script>

<style scoped>
.icon-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}
.icon-name {
  font-size: 12px;
  color: #666;
}
</style>
```

#### 8. 帮助文档 / 公告系统

系统中展示带格式的帮助文档或系统公告，支持标题、列表、链接等 HTML 排版。

```vue
<template>
  <div class="announcement">
    <div class="announcement-body" v-html="sanitizedAnnouncement"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DOMPurify from 'dompurify'

const announcement = ref<string>(`
  <h3>系统升级公告</h3>
  <p>尊敬的用户，系统将于 <strong>2025 年 7 月 1 日 02:00 - 06:00</strong> 进行升级维护，届时将暂停服务。</p>
  <p>本次升级内容：</p>
  <ul>
    <li>优化页面加载速度</li>
    <li>新增数据导出功能</li>
    <li>修复已知问题</li>
  </ul>
  <p>如有疑问，请联系 <a href="mailto:support@example.com">技术支持</a>。</p>
`)

// ✅ 对 HTML 内容进行安全过滤
const sanitizedAnnouncement = computed<string>(() => {
  return DOMPurify.sanitize(announcement.value)
})
</script>
```

#### 9. 国际化（i18n）富文本消息

在多语言场景下，某些翻译内容包含 HTML 格式（如链接、加粗），需要通过 `v-html` 渲染。

```vue
<template>
  <div class="i18n-demo">
    <!-- 纯文本翻译用 {{ }} -->
    <p>{{ t('greeting') }}</p>

    <!-- 包含 HTML 格式的翻译用 v-html -->
    <p v-html="t('termsNotice')"></p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Locale = 'zh' | 'en'

const currentLocale = ref<Locale>('zh')

const messages: Record<Locale, Record<string, string>> = {
  zh: {
    greeting: '欢迎使用本系统',
    termsNotice: '注册即表示您同意 <a href="/terms">服务条款</a> 和 <a href="/privacy">隐私政策</a>'
  },
  en: {
    greeting: 'Welcome to the system',
    termsNotice: 'By registering, you agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>'
  }
}

function t(key: string): string {
  return messages[currentLocale.value][key] || key
}
</script>
```

#### 10. 数据表格中的富文本单元格

在表格组件中，某些列的内容包含 HTML 格式（如带颜色的状态标签、带链接的操作项）。

```vue
<template>
  <table class="data-table">
    <thead>
      <tr>
        <th>名称</th>
        <th>状态</th>
        <th>操作</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in tableData" :key="row.id">
        <td>{{ row.name }}</td>
        <!-- ✅ 状态列使用 v-html 渲染带颜色的标签 -->
        <td v-html="row.statusHtml"></td>
        <!-- ✅ 操作列使用 v-html 渲染带链接的操作按钮 -->
        <td v-html="row.actionsHtml"></td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface TableRow {
  id: number
  name: string
  statusHtml: string
  actionsHtml: string
}

const tableData = ref<TableRow[]>([
  {
    id: 1,
    name: '项目 A',
    statusHtml: '<span style="color: #52c41a; background: #f6ffed; padding: 2px 8px; border-radius: 4px;">运行中</span>',
    actionsHtml: '<a href="/detail/1" style="color: #1677ff;">查看</a> | <a href="/edit/1" style="color: #1677ff;">编辑</a>'
  },
  {
    id: 2,
    name: '项目 B',
    statusHtml: '<span style="color: #faad14; background: #fffbe6; padding: 2px 8px; border-radius: 4px;">已暂停</span>',
    actionsHtml: '<a href="/detail/2" style="color: #1677ff;">查看</a> | <a href="/edit/2" style="color: #1677ff;">编辑</a>'
  }
])
</script>
```

### 六、注意事项

#### 1. XSS 安全风险（最重要）

`v-html` 会将内容作为真实 HTML 插入页面，如果内容中包含恶意脚本，会被直接执行。**绝不要将用户输入直接用于 `v-html`**。

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import DOMPurify from 'dompurify'

const userInput = ref('<img src=x onerror="alert(document.cookie)">')

// ❌ 危险：直接使用用户输入
// <div v-html="userInput"></div>

// ✅ 安全：先使用 DOMPurify 过滤
const safeHtml = computed<string>(() => {
  return DOMPurify.sanitize(userInput.value)
})
</script>
```

#### 2. scoped 样式不生效

`v-html` 插入的内容**不受** `<style scoped>` 的影响，因为 scoped 样式通过给元素添加 `data-v-xxx` 属性选择器实现，但 `v-html` 插入的 HTML 不在 Vue 模板编译的范围内。

```vue
<template>
  <div class="content" v-html="htmlContent"></div>
</template>

<style scoped>
/* ❌ 不会生效：scoped 样式无法影响 v-html 插入的内容 */
.content p {
  color: red;
}

/* ✅ 正确做法：使用 :deep() 深度选择器 */
.content :deep(p) {
  color: red;
}
</style>
```

> 💡 **提示：** 除了 `:deep()` 深度选择器，还可以使用 CSS Modules 或在组件中添加一个不带 `scoped` 的全局 `<style>` 块，配合 BEM 命名策略避免样式冲突。

#### 3. Vue 模板语法不会被解析

`v-html` 插入的 HTML 中的 Vue 模板语法（`{{ }}`、`v-bind`、`v-if`、`@click` 等）会被当作普通字符串，**不会被编译执行**。

```vue
<template>
  <!-- ❌ 错误理解：期望点击事件能生效 -->
  <div v-html="htmlWithClick"></div>
</template>

<script setup lang="ts">
// 这段 HTML 中的 @click 和 {{ }} 都不会被 Vue 解析
const htmlWithClick: string = '<button @click="handleClick">点击 {{ count }}</button>'
</script>
```

如果需要动态交互，应该使用 Vue 组件而不是 `v-html`。

#### 4. 会覆盖子内容

`v-html` 会**完全替换**元素的子内容，不要在 `v-html` 元素内放置其他内容。

```vue
<template>
  <!-- ❌ 错误：子内容会被 v-html 的值完全覆盖 -->
  <div v-html="content">
    <p>这段文字不会显示</p>
  </div>

  <!-- ✅ 正确：v-html 元素内不要放置子内容 -->
  <div v-html="content"></div>
</template>
```

#### 5. 不适合用 v-html 编写模板

如果你发现自己正在用 `v-html` 来编写包含逻辑的模板内容，请重新考虑使用 Vue 组件来实现。

```vue
<template>
  <!-- ❌ 不推荐：用 v-html 拼接模板 -->
  <div v-html="templateHtml"></div>

  <!-- ✅ 推荐：使用 Vue 组件 -->
  <UserCard v-for="user in users" :key="user.id" :user="user" />
</template>
```

#### 6. 性能考虑

频繁更新大量 `v-html` 内容可能导致性能问题，因为每次更新都会触发完整的 innerHTML 重新解析和 DOM 重建。

```vue
<script setup lang="ts">
// ❌ 避免：高频更新大量 v-html 内容（如实时数据流）
// setInterval(() => {
//   hugeHtmlContent.value = generateLargeHtml()
// }, 100)

// ✅ 正确做法：
// 1. 减少更新频率，使用防抖
// 2. 分页或虚拟滚动加载
// 3. 对不变的部分考虑使用 v-once
</script>
```

#### 7. SSR 中的注意事项

在服务端渲染（SSR）场景中使用 `v-html` 时，确保内容在服务端和客户端一致，否则可能导致**hydration mismatch**（水合不匹配）错误。

```vue
<template>
  <!-- ⚠️ 如果 htmlContent 在 SSR 和 CSR 时内容不同，会导致 hydration 错误 -->
  <div v-html="htmlContent"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const htmlContent = ref<string>('')

onMounted(() => {
  // ✅ 仅在客户端加载的内容，可以放在 onMounted 中
  htmlContent.value = '<p>客户端渲染的内容</p>'
})
</script>
```

#### 8. 不要在 `<template>` 标签上使用

`v-html` 只能用在真实的 DOM 元素上，不能用在 `<template>` 标签上。

```vue
<template>
  <!-- ❌ 错误：<template> 不是真实 DOM 元素 -->
  <template v-html="content"></template>

  <!-- ✅ 正确：使用真实 DOM 元素 -->
  <div v-html="content"></div>
</template>
```

#### 9. 图片和资源的加载时序

通过 `v-html` 插入的 `<img>` 标签在内容被渲染后才会开始加载资源，这可能导致图片加载延迟或闪烁。

```vue
<template>
  <div v-html="articleWithImages"></div>
</template>

<script setup lang="ts">
// ⚠️ 图片只有在 v-html 渲染后才开始加载
const articleWithImages: string = `
  <h2>文章标题</h2>
  <img src="/large-image.jpg" alt="大图" />
  <p>文章内容...</p>
`
</script>
```

#### 10. 事件委托处理

由于 `v-html` 插入的内容中的 Vue 事件绑定不会生效，如果需要对插入内容中的元素绑定事件，需要使用原生 DOM 事件或事件委托。

```vue
<template>
  <!-- ✅ 使用事件委托：在父元素上监听事件，通过事件冒泡处理 -->
  <div v-html="linkListHtml" @click="handleClick"></div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const linkListHtml = ref<string>(`
  <ul>
    <li><a href="/page/1" data-id="1">页面 1</a></li>
    <li><a href="/page/2" data-id="2">页面 2</a></li>
    <li><a href="/page/3" data-id="3">页面 3</a></li>
  </ul>
`)

// ✅ 通过事件委托捕获子元素点击
function handleClick(event: MouseEvent): void {
  const target = event.target as HTMLElement
  if (target.tagName === 'A') {
    event.preventDefault()
    const id = target.getAttribute('data-id')
    console.log('点击了链接，ID:', id)
  }
}
</script>
```

### 七、相关 API 对比

| 特性 | `{{ }}` 插值 | `v-text` | `v-html` |
|------|-------------|----------|----------|
| **设置属性** | `textContent` | `textContent` | `innerHTML` |
| **HTML 解析** | 不解析，原样显示 | 不解析，原样显示 | 解析为真实 HTML |
| **XSS 风险** | 无（自动转义） | 无（自动转义） | 有（不转义） |
| **部分更新** | 支持（可插入元素内部某处） | 不支持（覆盖整个元素内容） | 不支持（覆盖整个元素内容） |
| **Vue 指令编译** | 不涉及 | 不涉及 | 内部指令不编译 |
| **使用位置** | 元素内部 | 元素属性上 | 元素属性上 |

```vue
<template>
  <div>
    <!-- 三种方式对比 -->
    <p>{{ htmlStr }}</p>
    <!-- 显示：<strong>加粗</strong> -->

    <p v-text="htmlStr"></p>
    <!-- 显示：<strong>加粗</strong> -->

    <p v-html="htmlStr"></p>
    <!-- 显示：加粗（实际加粗效果） -->
  </div>
</template>

<script setup lang="ts">
const htmlStr: string = '<strong>加粗</strong>'
</script>
```

> 💡 **提示：** 如果只是显示纯文本内容，优先使用 `{{ }}` 插值语法，更安全也更简洁。只有明确需要渲染 HTML 时才使用 `v-html`。

### 八、总结

- **`v-html` 的作用**：将字符串作为真实 HTML 插入到元素内部，等同于设置 `innerHTML`
- **核心场景**：渲染富文本内容、Markdown 预览、代码高亮、邮件模板、CMS 内容、SVG 图标等
- **安全第一**：永远不要将未过滤的用户输入用于 `v-html`，推荐使用 [DOMPurify](https://github.com/cure53/DOMPurify) 进行 HTML 消毒
- **scoped 样式**：不生效，需使用 `:deep()` 深度选择器或全局样式
- **Vue 语法不编译**：`v-html` 中的 `{{ }}`、指令等不会被 Vue 编译
- **优先考虑组件**：如果需要动态交互逻辑，使用 Vue 组件而不是拼接 HTML 字符串
