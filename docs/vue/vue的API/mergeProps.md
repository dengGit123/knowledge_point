# mergeProps

## 作用

`mergeProps()` 用于合并多个 props 对象，处理特殊的 props 如 `class`、`style`、事件监听器等。

## 基本用法

```javascript
import { mergeProps, h } from 'vue'

export default {
  setup() {
    const props1 = { class: 'foo', onClick: () => {} }
    const props2 = { class: 'bar', onMousedown: () => {} }
    
    const merged = mergeProps(props1, props2)
    
    // class 会合并: 'foo bar'
    // 事件监听器会合并成数组
    
    return () => h('div', merged, 'Content')
  }
}
```

## 使用场景

### 1. 渲染函数中合并 props

```javascript
import { h, mergeProps } from 'vue'

export default {
  setup() {
    const baseProps = {
      class: 'btn',
      onClick: () => console.log('Base click')
    }
    
    const variantProps = {
      class: 'primary',
      type: 'button'
    }
    
    return () => h('button', mergeProps(baseProps, variantProps), 'Click me')
  }
}
```

### 2. 组件包装器

```javascript
import { h, mergeProps } from 'vue'

export function wrapWithLoading(component, props, isLoading) {
  const loadingProps = {
    disabled: isLoading,
    class: isLoading ? 'loading' : ''
  }
  
  return h(component, mergeProps(props, loadingProps))
}
```

### 3. 动态 props 合并

```javascript
import { h, mergeProps } from 'vue'

export default {
  setup() {
    const size = ref('large')
    const color = ref('blue')
    
    const props = computed(() => ({
      class: [`btn-${size.value}`, `btn-${color.value}`]
    }))
    
    return () => h('button', mergeProps(
      { type: 'button' },
      props.value,
      { onClick: handleClick }
    ), 'Click')
  }
}
```
