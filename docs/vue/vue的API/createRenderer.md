# createRenderer

创建自定义渲染器，用于将 Vue 渲染到非 DOM 环境。

## 语法

```javascript
import { createRenderer } from 'vue'

const { createApp } = createRenderer({
  createElement,
  createComment,
  createText,
  insert,
  remove,
  patchProp,
  // ... 其他选项
})
```

## 参数

返回渲染器 API，包含 createApp 等方法

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
  insertStaticContent(content, parent, anchor, SVG) {}
})

export const createApp = renderer.createApp
```

## Canvas 渲染器示例

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

  patchProp(el, key, prevValue, nextValue) {
    el.props[key] = nextValue
  }
}

const patchOps = {
  // 声明周期补丁
  patchClass(el, value, isSVG) {
    el.props.class = value
  },

  patchStyle(el, prev, next) {
    el.props.style = next
  },

  patchAttr(el, key, value) {
    el.props[key] = value
  },

  patchDOMProp(el, key, prevValue, nextValue) {
    el.props[key] = nextValue
  },

  patchEvent(el, key, prevValue, nextValue) {
    el.props[key] = nextValue
  }
}

const renderer = createRenderer({
  ...nodeOps,
  ...patchOps
})

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

6. **替代方案**：
   - 对于 Canvas：考虑使用现有库如 vue-gpu
   - 对于终端：考虑使用 blessed 或 ink
   - 对于 Three.js：考虑使用 troika-three

7. **维护成本**：自定义渲染器需要持续维护以跟上 Vue 更新
