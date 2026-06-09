# defineSlots

## 作用

`defineSlots()` 用于在 `<script setup>` 中访问插槽内容。在某些高级场景中很有用。

> 官方文档：[defineSlots](https://cn.vuejs.org/api/sfc-script-setup#defineslots)

## 基本用法

```vue
<script setup>
import { defineSlots } from 'vue'

const slots = defineSlots()

// 检查插槽是否存在
if (slots.default) {
  console.log('默认插槽存在')
}

// 检查具名插槽
if (slots.header) {
  console.log('header 插槽存在')
}
</script>

<template>
  <div>
    <slot name="header">默认头部</slot>
    <slot />
  </div>
</template>
```

## 动态渲染插槽

```vue
<script setup>
import { defineSlots } from 'vue'

const slots = defineSlots()

function renderSlot(name, props = {}) {
  if (slots[name]) {
    return slots[name](props)
  }
  return null
}
</script>

<template>
  <div>
    <component :is="() => renderSlot('header')" />
    <component :is="() => renderSlot('default')" />
  </div>
</template>
```

## 插槽 Props

```vue
<script setup>
import { defineSlots } from 'vue'

const slots = defineSlots()

function hasContent(slotName) {
  return !!slots[slotName]
}
</script>

<template>
  <div>
    <div v-if="hasContent('header')">
      <slot name="header" />
    </div>
    <slot v-bind="{ message: 'Hello' }" />
  </div>
</template>
```

## 条件插槽

```vue
<script setup>
import { defineSlots, computed } from 'vue'

const slots = defineSlots()

const hasHeader = computed(() => {
  return !!slots.header
})

const hasFooter = computed(() => {
  return !!slots.footer
})
</script>

<template>
  <div class="card">
    <div v-if="hasHeader" class="card-header">
      <slot name="header" />
    </div>
    <div class="card-body">
      <slot />
    </div>
    <div v-if="hasFooter" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>
```
