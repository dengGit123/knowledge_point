# createStaticVNode

创建静态虚拟节点，用于优化不会变化的静态内容。

## 语法

```javascript
import { createStaticVNode } from 'vue'

const vnode = createStaticVNode(html, count)
```

## 参数

- `html`: 静态 HTML 字符串
- `count`: 子节点数量（可选）

## 返回值

返回一个静态 VNode

## 基础用法

```javascript
import { createStaticVNode, h } from 'vue'

// 创建静态 HTML
const staticContent = createStaticVNode(`
  <div class="header">
    <h1>标题</h1>
    <nav>
      <a href="/">首页</a>
      <a href="/about">关于</a>
    </nav>
  </div>
`)

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

// 静态的 SVG 图标
const icon = createStaticVNode(`
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/>
  </svg>
`)

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

// 大段静态文档
const termsOfService = createStaticVNode(`
  <div class="terms">
    <h1>服务条款</h1>
    <p>欢迎使用我们的服务...</p>
    <p>这里有大量静态文字内容...</p>
    <p>这些内容不会变化...</p>
  </div>
`, 50) // 50个子节点

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

// 静态页面布局
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
`, 10)

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
  `),

  user: createStaticVNode(`
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  `),

  settings: createStaticVNode(`
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L3.16 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
    </svg>
  `)
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

// 静态表单结构
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
`, 10)

export default {
  render() {
    return h('div', { class: 'form-container' }, [
      formTemplate
    ])
  }
}
```

## 组件包装器

```javascript
import { createStaticVNode, h, defineComponent } from 'vue'

// 静态包装器内容
const wrapperStart = createStaticVNode('<div class="card-wrapper"><div class="card">')
const wrapperEnd = createStaticVNode('</div></div>')

export const Card = defineComponent({
  name: 'Card',
  render() {
    return h('div', [
      wrapperStart,
      this.$slots.default?.(),
      wrapperEnd
    ])
  }
})
```

## 注意事项

1. **性能优化**：用于完全静态、不会变化的内容

2. **子节点数量**：正确指定 count 参数帮助 Vue 优化

3. **安全风险**：不要用于包含用户输入的内容

4. **调试困难**：静态内容难以调试，谨慎使用

5. **适用场景**：
   - 大量静态文本
   - SVG 图标
   - 布局模板
   - 不变化的组件结构

6. **与 h() 的选择**：
   - 需要响应式更新 → 用 `h()`
   - 完全静态内容 → 用 `createStaticVNode()`

7. **HTML 解析**：内容必须是有效的 HTML

8. **Vue 编译**：Vue 编译器会自动将静态内容提升，手动使用只在特殊场景需要
