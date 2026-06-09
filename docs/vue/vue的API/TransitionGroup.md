# TransitionGroup

## 作用

`<TransitionGroup>` 用于为列表中的多个元素添加过渡效果。

> [官方文档：TransitionGroup](https://cn.vuejs.org/api/built-in-components#transitiongroup)

## 基本用法

```vue
<script setup>
import { ref } from 'vue'

const items = ref([1, 2, 3, 4, 5])

const add = () => {
  items.value.push(items.value.length + 1)
}

const remove = (index) => {
  items.value.splice(index, 1)
}
</script>

<template>
  <button @click="add">添加</button>
  <TransitionGroup name="list" tag="ul">
    <li v-for="(item, index) in items" :key="item">
      {{ item }}
      <button @click="remove(index)">删除</button>
    </li>
  </TransitionGroup>
</template>

<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.list-move {
  transition: transform 0.5s ease;
}
</style>
```

## 列表移动动画

```vue
<template>
  <TransitionGroup name="list" tag="div" class="list">
    <div
      v-for="item in items"
      :key="item.id"
      class="list-item"
    >
      {{ item.name }}
    </div>
  </TransitionGroup>
</template>

<style>
.list-item {
  transition: all 0.5s;
}

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.list-leave-active {
  position: absolute;
}
</style>
```
