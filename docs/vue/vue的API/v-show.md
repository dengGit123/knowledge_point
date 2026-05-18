# v-show

## 作用

`v-show` 根据表达式的值切换元素的显示状态，通过 CSS `display` 属性实现。

## 基本用法

```vue
<template>
  <div v-show="isVisible">显示或隐藏</div>
  <button @click="isVisible = !isVisible">切换</button>
</template>

<script setup>
import { ref } from 'vue'
const isVisible = ref(true)
</script>
```

## 与 v-if 的区别

- **v-show**: 元素始终在 DOM 中，只切换 CSS display
- **v-if**: 条件为 false 时元素不存在于 DOM

| 特性 | v-show | v-if |
|------|--------|------|
| 初始渲染 | 始终渲染 | 按需渲染 |
| 切换成本 | 低（只改 CSS） | 高（销毁/创建） |
| 适用场景 | 频繁切换 | 条件很少改变 |

## 使用场景

```vue
<template>
  <!-- 频繁切换的标签页 -->
  <div v-show="currentTab === 'home'">首页</div>
  <div v-show="currentTab === 'profile'">个人资料</div>
  
  <!-- 条件显示的表单字段 -->
  <div v-show="hasAddress">
    <input placeholder="省份" />
    <input placeholder="城市" />
  </div>
  
  <!-- 加载状态 -->
  <button>
    <span v-show="!loading">提交</span>
    <span v-show="loading">提交中...</span>
  </button>
</template>
```

## 注意事项

```vue
<template>
  <!-- ❌ 错误：v-show 不能用在 template 上 -->
  <template v-show="visible">
    <div>内容</div>
  </template>
  
  <!-- ✅ 正确 -->
  <div v-show="visible">
    <div>内容</div>
  </div>
</template>
```
