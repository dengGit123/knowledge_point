# Transition

## 作用

`<Transition>` 是一个内置组件，用于为单个元素或组件添加进入/离开过渡效果。

> [官方文档：Transition](https://cn.vuejs.org/api/built-in-components#transition)

## 基本用法

```vue
<script setup>
import { ref } from 'vue'

const show = ref(true)
</script>

<template>
  <button @click="show = !show">切换</button>
  
  <Transition>
    <p v-if="show">Hello</p>
  </Transition>
</template>

<style>
/* Vue 会自动应用以下 class */
.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.v-enter-to,
.v-leave-from {
  opacity: 1;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease;
}
</style>
```

## 命名过渡

```vue
<template>
  <Transition name="fade">
    <p v-if="show">Hello</p>
  </Transition>
</template>

<style>
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
</style>
```

## CSS 过渡

```vue
<template>
  <Transition name="slide">
    <div v-if="show" class="box">滑动盒子</div>
  </Transition>
</template>

<style>
.slide-enter-active {
  transition: all 0.3s ease-out;
}

.slide-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
```

## JavaScript 钩子

```vue
<script setup>
import { ref } from 'vue'

const show = ref(true)

const onBeforeEnter = (el) => {
  console.log('进入之前')
}

const onEnter = (el, done) => {
  console.log('进入中')
  setTimeout(done, 1000)
}

const onAfterEnter = (el) => {
  console.log('进入之后')
}

const onBeforeLeave = (el) => {
  console.log('离开之前')
}

const onLeave = (el, done) => {
  console.log('离开中')
  setTimeout(done, 1000)
}

const onAfterLeave = (el) => {
  console.log('离开之后')
}
</script>

<template>
  <Transition
    @before-enter="onBeforeEnter"
    @enter="onEnter"
    @after-enter="onAfterEnter"
    @before-leave="onBeforeLeave"
    @leave="onLeave"
    @after-leave="onAfterLeave"
  >
    <div v-if="show">内容</div>
  </Transition>
</template>
```
