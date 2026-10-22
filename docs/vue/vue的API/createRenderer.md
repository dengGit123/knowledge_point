# createRenderer

> 📖 [Vue 官方文档 - createRenderer](https://cn.vuejs.org/api/custom-renderer.html#createrenderer)

创建自定义渲染器。通过提供平台特定的节点创建与操作 API，复用 Vue 的核心运行时（响应式、虚拟 DOM、diff），把 Vue 渲染到非 DOM 环境（Canvas、WebGL/Three.js、终端、PDF 等）。Vue 自己的 DOM 运行时 `@vue/runtime-dom` 也是用同一套 API 实现的。

## 语法

```javascript
import { createRenderer } from 'vue'

// 返回 { render, createApp }
const { render, createApp } = createRenderer({
  patchProp,
  insert,
  remove,
  createElement
  // ... 其他选项
})
```

## 参数

`RendererOptions`：平台节点的创建与操作函数。前 10 个为**必需**，后 4 个为可选：

| 选项 | 必需 | 说明 |
|------|------|------|
| `patchProp(el, key, prevValue, nextValue, namespace?, parentComponent?)` | ✅ | 更新元素上的 prop / attribute / 事件 / class / style |
| `insert(el, parent, anchor?)` | ✅ | 在 parent 中 anchor 之前插入节点 |
| `remove(el)` | ✅ | 从父节点中移除节点 |
| `createElement(type, namespace?, isCustomizedBuiltIn?, vnodeProps?)` | ✅ | 创建元素节点 |
| `createText(text)` | ✅ | 创建文本节点 |
| `createComment(text)` | ✅ | 创建注释节点 |
| `setText(node, text)` | ✅ | 设置文本节点的内容 |
| `setElementText(el, text)` | ✅ | 设置元素的文本内容 |
| `parentNode(node)` | ✅ | 获取父节点 |
| `nextSibling(node)` | ✅ | 获取下一个兄弟节点 |
| `querySelector(selector)` | 可选 | 选择器查询（Transition 等特性需要） |
| `setScopeId(el, id)` | 可选 | 应用作用域 ID（scoped 样式需要） |
| `cloneNode(node)` | 可选 | 克隆节点 |
| `insertStaticContent(content, parent, anchor, namespace, start?, end?)` | 可选 | 插入静态 HTML 内容，返回首尾节点（静态提升/hydration 需要） |

返回值：`{ render, createApp }`——`render` 是底层渲染函数，`createApp` 创建使用该渲染器的应用实例。此外 Vue 还导出了配套的 `createHydrationRenderer()`，用于需要水合（hydration）的自定义渲染器场景。

## 基础结构

```javascript
import { createRenderer } from 'vue'

const renderer = createRenderer({
  // 创建元素
  createElement(tag, isSVG, is) {
    return { tag, children: [] }
  },

  // 创建注释节点
  createComment(text) {
    return { type: 'comment', text }
  },

  // 创建文本节点
  createText(text) {
    return { type: 'text', text }
  },

  // 插入节点
  insert(child, parent, anchor) {
    parent.children.push(child)
  },

  // 移除节点
  remove(child) {
    const parent = child.parent
    const index = parent.children.indexOf(child)
    parent.children.splice(index, 1)
  },

  // 更新属性
  patchProp(el, key, prevValue, nextValue) {
    el[key] = nextValue
  },

  // 设置元素文本
  setElementText(el, text) {
    el.text = text
  },

  // 设置文本节点文本
  setText(node, text) {
    node.text = text
  },

  // 获取父节点
  parentNode(node) {
    return node.parent
  },

  // 获取下一个兄弟节点
  nextSibling(node) {
    const parent = node.parent
    const index = parent.children.indexOf(node)
    return parent.children[index + 1]
  },

  // 查询选择器（可选）
  querySelector(selector) {},

  // 设置作用域 ID（可选）
  setScopeId(el, id) {},

  // 克隆节点（可选）
  cloneNode(node) {},

  // 插入静态内容（可选）
  insertStaticContent(content, parent, anchor, isSVG) {}
})

export const createApp = renderer.createApp
```

## 自定义节点操作示例

> ⚠️ **注意：** `createRenderer` 只接收 `patchProp` 一个属性更新入口，**没有** `patchClass` / `patchStyle` / `patchAttr` / `patchDOMProp` / `patchEvent` 这些选项——它们是 Vue 内部 `@vue/runtime-dom` 的实现细节，class、style、attribute、DOM property、事件的分发逻辑都需要你在自己的 `patchProp` 里处理。

```javascript
import { createRenderer } from 'vue'

const nodeOps = {
  createElement(tag) {
    return {
      type: 'element',
      tag,
      props: {},
      children: []
    }
  },

  createText(text) {
    return { type: 'text', text }
  },

  setElementText(node, text) {
    node.text = text
  },

  setText(node, text) {
    node.text = text
  },

  insert(child, parent, anchor) {
    child.parent = parent
    if (!parent.children) {
      parent.children = []
    }
    if (anchor) {
      const index = parent.children.indexOf(anchor)
      parent.children.splice(index, 0, child)
    } else {
      parent.children.push(child)
    }
  },

  remove(child) {
    const parent = child.parent
    if (parent) {
      const index = parent.children.indexOf(child)
      parent.children.splice(index, 1)
    }
  },

  parentNode(node) {
    return node.parent
  },

  nextSibling(node) {
    const parent = node.parent
    if (!parent) return null
    const index = parent.children.indexOf(node)
    return parent.children[index + 1]
  },

  // class / style / attribute / 事件全部在这里分发
  patchProp(el, key, prevValue, nextValue) {
    if (key === 'class') {
      el.props.class = nextValue
    } else if (key === 'style') {
      el.props.style = nextValue
    } else if (key.startsWith('on') && /^on[a-z]/.test(key)) {
      // 事件：onClick -> click
      const event = key.slice(2).toLowerCase()
      el.handlers = el.handlers || {}
      el.handlers[event] = nextValue
    } else {
      el.props[key] = nextValue
    }
  }
}

const renderer = createRenderer(nodeOps)

export const createApp = renderer.createApp
```

## 简单文本渲染器

```javascript
import { createRenderer } from 'vue'

function createTextRenderer() {
  const containers = new WeakMap()

  return createRenderer({
    createElement(tag) {
      return { tag, children: [], props: {} }
    },

    createText(text) {
      return { text }
    },

    setElementText(node, text) {
      node.text = text
    },

    insert(child, parent) {
      if (!parent.children) {
        parent.children = []
      }
      parent.children.push(child)
      child.parent = parent
    },

    remove(child) {
      const parent = child.parent
      if (parent) {
        const index = parent.children.indexOf(child)
        parent.children.splice(index, 1)
      }
    },

    parentNode(node) {
      return node.parent
    },

    nextSibling(node) {
      const parent = node.parent
      if (!parent) return null
      const index = parent.children.indexOf(node)
      return parent.children[index + 1]
    },

    patchProp(el, key, prevValue, nextValue) {
      el.props[key] = nextValue
    },

    // 自定义方法：生成文本
    toString(node) {
      if (node.text) return node.text
      if (node.tag === 'br') return '\n'
      if (node.tag === 'img') return '[图片]'

      let result = ''
      if (node.children) {
        result = node.children.map(child => this.toString(child)).join('')
      }
      return result
    }
  })
}

const renderer = createTextRenderer()

const app = renderer.createApp({
  data() {
    return {
      message: 'Hello World'
    }
  },
  template: '<div>{{ message }}</div>'
})
```

## Three.js 渲染器集成

```javascript
import { createRenderer } from 'vue'
import * as THREE from 'three'

const nodeOps = {
  createElement(tag) {
    switch (tag) {
      case 'scene':
        return new THREE.Scene()
      case 'mesh':
        return new THREE.Mesh(
          new THREE.BoxGeometry(),
          new THREE.MeshBasicMaterial()
        )
      case 'camera':
        return new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        )
      default:
        return new THREE.Object3D()
    }
  },

  createText(text) {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ color: 0xffffff })
    })
    sprite.userData.text = text
    return sprite
  },

  insert(child, parent, anchor) {
    parent.add(child)
  },

  remove(child) {
    const parent = child.parent
    if (parent) {
      parent.remove(child)
    }
  },

  parentNode(node) {
    return node.parent
  },

  nextSibling(node) {
    const parent = node.parent
    if (!parent) return null
    const index = parent.children.indexOf(node)
    return parent.children[index + 1]
  },

  patchProp(el, key, prevValue, nextValue) {
    if (key === 'position') {
      el.position.set(nextValue.x, nextValue.y, nextValue.z)
    } else if (key === 'rotation') {
      el.rotation.set(nextValue.x, nextValue.y, nextValue.z)
    } else if (key === 'scale') {
      el.scale.set(nextValue.x, nextValue.y, nextValue.z)
    } else {
      el[key] = nextValue
    }
  }
}

const renderer = createRenderer(nodeOps)

export const createApp = renderer.createApp
```

## 终端 UI 渲染器

```javascript
import { createRenderer } from 'vue'

const nodeOps = {
  createElement(tag) {
    return {
      type: 'element',
      tag,
      props: {},
      children: [],
      x: 0,
      y: 0,
      width: 0,
      height: 0
    }
  },

  createText(text) {
    return { type: 'text', text }
  },

  setElementText(node, text) {
    node.text = text
  },

  insert(child, parent, anchor) {
    child.parent = parent
    if (!parent.children) {
      parent.children = []
    }
    if (anchor) {
      const index = parent.children.indexOf(anchor)
      parent.children.splice(index, 0, child)
    } else {
      parent.children.push(child)
    }
  },

  remove(child) {
    const parent = child.parent
    if (parent) {
      const index = parent.children.indexOf(child)
      parent.children.splice(index, 1)
    }
  },

  parentNode(node) {
    return node.parent
  },

  nextSibling(node) {
    const parent = node.parent
    if (!parent) return null
    const index = parent.children.indexOf(node)
    return parent.children[index + 1]
  },

  patchProp(el, key, prevValue, nextValue) {
    switch (key) {
      case 'color':
        el.props.color = nextValue
        break
      case 'bg':
        el.props.bg = nextValue
        break
      case 'bold':
        el.props.bold = nextValue
        break
      case 'width':
        el.width = nextValue
        break
      case 'height':
        el.height = nextValue
        break
      default:
        el.props[key] = nextValue
    }
  },

  // 终端渲染方法
  render(node, x = 0, y = 0) {
    if (!node) return ''

    let result = ''
    let currentX = x
    let currentY = y

    if (node.type === 'text') {
      const { text, props } = node
      const style = []
      if (props?.color) style.push(props.color)
      if (props?.bold) style.push('bold')
      result += text
      currentX += text.length
    } else if (node.type === 'element') {
      const { tag, children, props } = node

      if (tag === 'br') {
        result += '\n'
        currentX = x
        currentY++
      } else if (tag === 'div') {
        for (const child of children) {
          result += this.render(child, currentX, currentY)
        }
      }
    }

    return result
  }
}

const renderer = createRenderer(nodeOps)

export const createApp = renderer.createApp
```

## PDF 渲染器

```javascript
import { createRenderer } from 'vue'
import { jsPDF } from 'jspdf'

const nodeOps = {
  createElement(tag) {
    return {
      type: 'element',
      tag,
      props: {},
      children: [],
      x: 0,
      y: 0
    }
  },

  createText(text) {
    return { type: 'text', text }
  },

  insert(child, parent, anchor) {
    child.parent = parent
    if (!parent.children) {
      parent.children = []
    }
    if (anchor) {
      const index = parent.children.indexOf(anchor)
      parent.children.splice(index, 0, child)
    } else {
      parent.children.push(child)
    }
  },

  remove(child) {
    const parent = child.parent
    if (parent) {
      const index = parent.children.indexOf(child)
      parent.children.splice(index, 1)
    }
  },

  parentNode(node) {
    return node.parent
  },

  nextSibling(node) {
    const parent = node.parent
    if (!parent) return null
    const index = parent.children.indexOf(node)
    return parent.children[index + 1]
  },

  patchProp(el, key, prevValue, nextValue) {
    el.props[key] = nextValue
  }
}

const renderer = createRenderer(nodeOps)

// 使用 PDF 库渲染
function renderToPDF(vnode, filename = 'output.pdf') {
  const doc = new jsPDF()

  function traverse(node, x = 10, y = 10) {
    if (node.type === 'text') {
      doc.text(node.text, x, y)
      return y + 7
    } else if (node.type === 'element') {
      let currentY = y
      if (node.children) {
        for (const child of node.children) {
          currentY = traverse(child, x + 5, currentY)
        }
      }
      return currentY
    }
    return y
  }

  traverse(vnode)
  doc.save(filename)
}

export { createApp, renderToPDF }
```

## 注意事项

1. **复杂性**：创建自定义渲染器是一个高级任务，需要深入理解 Vue 内部机制

2. **性能**：自定义渲染器的性能取决于节点操作的实现效率

3. **完整性**：必须实现所有必需的节点操作方法

4. **错误处理**：需要妥善处理边界情况和错误

5. **测试**：充分测试渲染器的各种场景

6. **替代方案**：动手之前，先确认对应环境是否已有成熟方案，避免重复造轮子：
   - Canvas / WebGL：多数场景直接操作 Canvas API 或使用 Three.js 等库更简单；Vue 生态也有基于自定义渲染器的 Three.js 方案（如 Trois）可参考
   - 终端：React 生态有 Ink，Vue 侧可参考社区的自定义终端渲染器实现思路
   - 服务端：SSR 用 Vue 官方的 `@vue/server-renderer`，不需要自建渲染器

7. **维护成本**：自定义渲染器需要持续维护以跟上 Vue 更新
