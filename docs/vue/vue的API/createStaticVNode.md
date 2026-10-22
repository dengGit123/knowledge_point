# createStaticVNode

> 📖 [Vue 官方文档 - 渲染函数 API](https://cn.vuejs.org/api/render-function.html)

创建静态虚拟节点：把一段原生 HTML 字符串整体作为一个静态 VNode 嵌入渲染函数，Vue 不会对它的内部做 diff，用于优化完全不变的静态内容。

## 语法

```javascript
import { createStaticVNode } from 'vue'

const vnode = createStaticVNode(content, numberOfNodes)
```

## 参数

- `content`: 静态 HTML 字符串，必须是**完整合法**的 HTML 片段（标签要正确闭合）
- `numberOfNodes`: `number`，**必填**。这段 HTML 顶层产生的 DOM 节点数量，SSR 水合（hydration）时必需

## 返回值

返回一个静态 VNode

## 基础用法

```javascript
import { createStaticVNode, h } from 'vue'

// 顶层只有 1 个 <div> 节点
const staticContent = createStaticVNode(`
  <div class="header">
    <h1>标题</h1>
    <nav>
      <a href="/">首页</a>
      <a href="/about">关于</a>
    </nav>
  </div>
`, 1)

// 在渲染函数中使用
export default {
  render() {
    return h('div', [
      staticContent,
      h('div', '动态内容')
    ])
  }
}
```

## 性能优化示例

```javascript
import { createStaticVNode, h, ref } from 'vue'

// 静态的 SVG 图标（顶层 1 个 <svg> 节点）
const icon = createStaticVNode(`
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
  </svg>
`, 1)

export default {
  setup() {
    const count = ref(0)

    return () => h('button', {
      onClick: () => count.value++
    }, [
      icon,
      ` 点击 ${count.value} 次`
    ])
  }
}
```

## 大量静态内容

```javascript
import { createStaticVNode, h } from 'vue'

// 大段静态文档（顶层仍是 1 个 <div> 节点，内部节点数无需关心）
const termsOfService = createStaticVNode(`
  <div class="terms">
    <h1>服务条款</h1>
    <p>欢迎使用我们的服务...</p>
    <p>这里有大量静态文字内容...</p>
    <p>这些内容不会变化...</p>
  </div>
`, 1)

export default {
  render() {
    return h('div', [
      termsOfService,
      h('button', '我同意')
    ])
  }
}
```

## 布局模板

```javascript
import { createStaticVNode, h } from 'vue'

// 静态页面布局（顶层 1 个 <div> 节点）
const layout = createStaticVNode(`
  <div class="page-layout">
    <header class="page-header">
      <div class="logo">My App</div>
      <nav class="main-nav">
        <a href="/">首页</a>
        <a href="/products">产品</a>
        <a href="/about">关于</a>
      </nav>
    </header>
    <main class="page-main">
      <!-- 内容将在这里 -->
    </main>
    <footer class="page-footer">
      <p>&copy; 2024 My App. All rights reserved.</p>
    </footer>
  </div>
`, 1)

export default {
  props: ['content'],
  render() {
    return h('div', [
      layout,
      this.content
    ])
  }
}
```

## SVG 图标库

```javascript
// icons.js
import { createStaticVNode } from 'vue'

export const icons = {
  home: createStaticVNode(`
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  `, 1),

  user: createStaticVNode(`
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  `, 1),

  settings: createStaticVNode(`
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L3.16 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
    </svg>
  `, 1)
}

// 使用
export default {
  props: ['name'],
  computed: {
    icon() {
      return icons[this.name] || icons.home
    }
  },
  render() {
    return this.icon
  }
}
```

## 表单模板

```javascript
import { createStaticVNode, h } from 'vue'

// 静态表单结构（顶层 1 个 <form> 节点）
const formTemplate = createStaticVNode(`
  <form class="contact-form">
    <div class="form-group">
      <label for="name">姓名</label>
      <input id="name" type="text" name="name" required />
    </div>
    <div class="form-group">
      <label for="email">邮箱</label>
      <input id="email" type="email" name="email" required />
    </div>
    <div class="form-group">
      <label for="message">消息</label>
      <textarea id="message" name="message" rows="5" required></textarea>
    </div>
    <button type="submit">提交</button>
  </form>
`, 1)

export default {
  render() {
    return h('div', { class: 'form-container' }, [
      formTemplate
    ])
  }
}
```

## 多个顶层节点

`numberOfNodes` 是顶层 DOM 节点的数量。当 HTML 字符串包含多个并列的顶层元素时，要如实计数（该数字在 SSR 水合时用于定位边界）：

```javascript
import { createStaticVNode, h } from 'vue'

// 顶层有 2 个节点：<p> 和 <p>
const intro = createStaticVNode(`
  <p>第一段介绍。</p>
  <p>第二段介绍。</p>
`, 2)

export default {
  render() {
    return h('article', [intro, h('p', '正文...')])
  }
}
```

## 注意事项

1. **性能优化**：用于完全静态、不会变化的内容

2. **numberOfNodes 必填且必须准确**：必须等于 HTML 字符串顶层产生的 DOM 节点数（不是全部节点数），SSR 水合依赖它

3. **安全风险**：不要用于包含用户输入的内容（XSS 风险）

4. **调试困难**：静态内容不经过 Vue 的 diff，DevTools 中只显示为一个 Static 节点

5. **适用场景**：
   - 大量静态文本
   - SVG 图标
   - 布局模板
   - 不变化的组件结构

6. **与 h() 的选择**：
   - 需要响应式更新 → 用 `h()`
   - 完全静态内容 → 用 `createStaticVNode()`

7. **HTML 必须完整合法**：标签要正确闭合，不能像「开头/结尾拆两半」那样包裹动态内容（拆开的字符串不是合法 HTML）

8. **Vue 编译**：Vue 编译器会自动将模板中的静态内容提升（静态提升），手动使用只在渲染函数等特殊场景需要
