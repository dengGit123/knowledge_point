# CSS filter 属性详解

> CSS `filter` 属性为元素提供图形效果处理，包括模糊、锐化、色彩调整等，是实现视觉效果的强大工具。

## 一、基础语法

### 1.1 基本语法

```css
/* 单个滤镜 */
filter: blur(5px);

/* 多个滤镜 */
filter: blur(5px) contrast(1.2) brightness(1.1);

/* 无滤镜 */
filter: none;

/* 继承 */
filter: inherit;
```

### 1.2 滤镜函数列表

| 函数 | 说明 | 单位 |
|------|------|------|
| `blur()` | 高斯模糊 | 长度单位 |
| `brightness()` | 亮度 | 无单位（倍数）或 % |
| `contrast()` | 对比度 | 无单位（倍数）或 % |
| `saturate()` | 饱和度 | 无单位（倍数）或 % |
| `grayscale()` | 灰度 | 无单位（倍数）或 % |
| `sepia()` | 复古褐色 | 无单位（倍数）或 % |
| `hue-rotate()` | 色相旋转 | 角度（deg） |
| `invert()` | 反色 | 无单位（倍数）或 % |
| `opacity()` | 透明度 | 无单位（倍数）或 % |
| `drop-shadow()` | 阴影 | 阴影参数 |
| `url()` | SVG 滤镜引用 | URL |

## 二、模糊效果 blur()

### 2.1 基本用法

```css
/* 高斯模糊 */
img {
  filter: blur(0px);     /* 无模糊 */
  filter: blur(5px);     /* 轻微模糊 */
  filter: blur(10px);    /* 明显模糊 */
}
```

### 2.2 实际效果

```
原图          blur(3px)      blur(5px)
┌─────┐       ┌─────┐       ┌─────┐
│ 清晰 │  →    │ 朦胧 │  →    │ 模糊 │
└─────┘       └─────┘       ┌─────┐
                              │...  │
                              └─────┘
```

### 2.3 应用场景

```css
/* 背景模糊（毛玻璃效果） */
.glass-effect {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* 图片聚焦效果 */
.image-gallery img {
  filter: blur(5px);
  transition: filter 0.3s;
}

.image-gallery img:hover,
.image-gallery img:focus {
  filter: blur(0);
}

/* 加载占位符 */
.placeholder {
  filter: blur(20px);
}

.placeholder.loaded {
  filter: blur(0);
  transition: filter 0.5s;
}
```

### 2.4 模糊强度参考

| 值 | 效果 | 适用场景 |
|----|------|----------|
| `0-2px` | 轻微模糊 | 细腻处理 |
| `3-5px` | 明显模糊 | 背景处理 |
| `10-20px` | 重度模糊 | 完全模糊背景 |
| `20px+` | 极度模糊 | 抽象背景 |

## 三、亮度调节 brightness()

### 3.1 基本用法

```css
img {
  filter: brightness(0);      /* 全黑 */
  filter: brightness(0.5);    /* 变暗 50% */
  filter: brightness(1);      /* 原始亮度 */
  filter: brightness(1.5);    /* 变亮 50% */
  filter: brightness(200%);   /* 变亮 100% */
}
```

### 3.2 效果对比

```
brightness(0.5)    brightness(1)      brightness(1.5)
┌─────────┐       ┌─────────┐       ┌─────────┐
│ ▓▓▓▓▓▓▓ │       │ ░░░░░░░ │       │ □□□□□□□ │
│ ▓▓▓▓▓▓▓ │       │ ░░░░░░░ │       │ □□□□□□□ │
└─────────┘       └─────────┘       └─────────┘
   变暗              原图              变亮
```

### 3.3 应用场景

```css
/* 深色模式图片适配 */
@media (prefers-color-scheme: dark) {
  img {
    filter: brightness(0.8);
  }
}

/* 悬停高亮 */
.card-image {
  filter: brightness(0.9);
  transition: filter 0.3s;
}

.card-image:hover {
  filter: brightness(1.1);
}

/* 禁用状态 */
button:disabled img {
  filter: brightness(0.5);
}

/* 选中状态 */
.selected {
  filter: brightness(1.2) contrast(1.1);
}
```

## 四、对比度调节 contrast()

### 4.1 基本用法

```css
img {
  filter: contrast(0);      /* 全灰 */
  filter: contrast(0.5);    /* 低对比度 */
  filter: contrast(1);      /* 原始对比度 */
  filter: contrast(2);      /* 高对比度 */
  filter: contrast(200%);   /* 高对比度 */
}
```

### 4.2 效果对比

```
contrast(0.5)      contrast(1)        contrast(2)
┌─────────┐       ┌─────────┐       ┌─────────┐
│ ▒▒▒▒▒▒▒ │       │ ░▒░▒░▒░▒ │       │ ▓░▓░▓░▓░ │
│ ▒▒▒▒▒▒▒ │       │ ░▒░▒░▒░▒ │       │ ▓░▓░▓░▓░ │
└─────────┘       └─────────┘       └─────────┘
   低对比            原图            高对比
```

### 4.3 应用场景

```css
/* 可读性增强 */
.text-enhance {
  filter: contrast(1.2);
}

/* 图片风格化 */
.high-contrast {
  filter: contrast(1.5) brightness(1.1);
}

/* 打印优化 */
@media print {
  img {
    filter: contrast(1.2) brightness(0.9);
  }
}

/* 无障碍 - 高对比度模式 */
@media (prefers-contrast: high) {
  img {
    filter: contrast(1.5);
  }
}
```

## 五、饱和度调节 saturate()

### 5.1 基本用法

```css
img {
  filter: saturate(0);      /* 完全灰度 */
  filter: saturate(0.5);    /* 半饱和 */
  filter: saturate(1);      /* 原始饱和度 */
  filter: saturate(2);      /* 高饱和度 */
  filter: saturate(200%);   /* 高饱和度 */
}
```

### 5.2 效果对比

```
saturate(0)        saturate(1)        saturate(2)
┌─────────┐       ┌─────────┐       ┌─────────┐
│ ▓▓▓▓▓▓▓ │       │ ░▓▓▓▓▓░ │       │ ██▓██▓█ │
│ ▓▓▓▓▓▓▓ │       │ ░▓▓▓▓▓░ │       │ ██▓██▓█ │
└─────────┘       └─────────┘       └─────────┘
   灰度              原图            高饱和
```

### 5.3 应用场景

```css
/* 灰度到彩色的过渡效果 */
.color-transition {
  filter: saturate(0);
  transition: filter 0.5s;
}

.color-transition:hover {
  filter: saturate(1);
}

/* 产品图片增强 */
.product-image {
  filter: saturate(1.2);
}

/* 黑白照片效果 */
.bw-photo {
  filter: saturate(0);
}

/* 艺术效果 */
.vivid {
  filter: saturate(2) contrast(1.1);
}
```

## 六、灰度效果 grayscale()

### 6.1 基本用法

```css
img {
  filter: grayscale(0);      /* 原始颜色 */
  filter: grayscale(0.5);    /* 半灰度 */
  filter: grayscale(1);      /* 完全灰度 */
  filter: grayscale(100%);   /* 完全灰度 */
}
```

### 6.2 效果对比

```
原图              grayscale(0.5)        grayscale(1)
┌─────────┐       ┌─────────┐       ┌─────────┐
│ ██▓██▓█ │   →   │ ▓▓▓▓▓▓▓ │   →   │ ▓▓▓▓▓▓▓ │
│ ▓█▓█▓█▓ │       │ ▓▓▓▓▓▓▓ │       │ ▓▓▓▓▓▓▓ │
└─────────┘       └─────────┘       └─────────┘
```

### 6.3 应用场景

```css
/* 悬停恢复彩色 */
.grayscale-hover {
  filter: grayscale(1);
  transition: filter 0.3s;
}

.grayscale-hover:hover {
  filter: grayscale(0);
}

/* 哀悼模式 */
.mourning {
  filter: grayscale(1);
}

/* 禁用状态 */
.disabled {
  filter: grayscale(1);
}

/* 图片加载前 */
img {
  filter: grayscale(1) blur(10px);
  transition: filter 0.5s;
}

img.loaded {
  filter: grayscale(0) blur(0);
}
```

## 七、复古效果 sepia()

### 7.1 基本用法

```css
img {
  filter: sepia(0);      /* 原始颜色 */
  filter: sepia(0.5);    /* 半复古 */
  filter: sepia(1);      /* 完全复古 */
  filter: sepia(100%);   /* 完全复古 */
}
```

### 7.2 效果对比

```
原图              sepia(0.5)          sepia(1)
┌─────────┐       ┌─────────┐       ┌─────────┐
│ ██▓██▓█ │   →   │ █░▓░▓░█ │   →   │ █░▒░▒░█ │
│ ▓█▓█▓█▓ │       │ ▓░▒░▒░▓ │       │ ▓░▓░▓░▓ │
└─────────┘       └─────────┘       └─────────┘
                  淡褐色              深褐色
```

### 7.3 应用场景

```css
/* 复古照片效果 */
.vintage {
  filter: sepia(0.8);
}

/* 老照片风格 */
.old-photo {
  filter: sepia(1) contrast(0.9) brightness(0.9);
}

/* 悬停恢复 */
.vintage-hover {
  filter: sepia(0.6);
  transition: filter 0.3s;
}

.vintage-hover:hover {
  filter: sepia(0);
}

/* 暖色调调整 */
.warm {
  filter: sepia(0.3);
}
```

## 八、色相旋转 hue-rotate()

### 8.1 基本用法

```css
img {
  filter: hue-rotate(0deg);      /* 原始色相 */
  filter: hue-rotate(90deg);     /* 旋转 90 度 */
  filter: hue-rotate(180deg);    /* 旋转 180 度（反色） */
  filter: hue-rotate(270deg);    /* 旋转 270 度 */
  filter: hue-rotate(360deg);    /* 旋转 360 度（回到原色） */
}
```

### 8.2 色相环示意

```
        0° / 360° 红色
            ↑
            │
270° 蓝    │    90° 黄
    ←──────┼──────→
            │
240° 紫    │    120° 绿
            ↓
         180° 青色
```

### 8.3 效果对比

```
原图              hue-rotate(90deg)     hue-rotate(180deg)
┌─────────┐       ┌─────────┐       ┌─────────┐
│   红    │   →   │   蓝    │   →   │   青    │
│  ████   │       │  ▓▓▓▓   │       │  ░░░░   │
└─────────┘       └─────────┘       └─────────┘
```

### 8.4 应用场景

```css
/* 颜色变换动画 */
.color-shift {
  filter: hue-rotate(0deg);
  animation: hueRotate 5s linear infinite;
}

@keyframes hueRotate {
  from {
    filter: hue-rotate(0deg);
  }
  to {
    filter: hue-rotate(360deg);
  }
}

/* 悬停变色 */
.hover-shift {
  filter: hue-rotate(0deg);
  transition: filter 0.5s;
}

.hover-shift:hover {
  filter: hue-rotate(45deg);
}

/* 主题切换 */
.theme-alt .icon {
  filter: hue-rotate(180deg);
}

/* 彩虹效果 */
.rainbow {
  animation: rainbow 3s linear infinite;
}

@keyframes rainbow {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}
```

## 九、反色效果 invert()

### 9.1 基本用法

```css
img {
  filter: invert(0);      /* 原始颜色 */
  filter: invert(0.5);    /* 半反色 */
  filter: invert(1);      /* 完全反色 */
  filter: invert(100%);   /* 完全反色 */
}
```

### 9.2 效果对比

```
原图              invert(0.5)         invert(1)
┌─────────┐       ┌─────────┐       ┌─────────┐
│ 黑白图   │   →   │ 灰度图   │   →   │ 白黑图   │
│  ▓░░▓   │       │  ▒▒▒▒   │       │  ░▓▓░   │
└─────────┘       └─────────┘       └─────────┘
```

### 9.3 应用场景

```css
/* 夜间模式 */
@media (prefers-color-scheme: dark) {
  .theme-invert img {
    filter: invert(1);
  }
}

/* 反色效果 */
.invert-effect {
  filter: invert(1);
}

/* 悬停反色 */
.invert-hover {
  filter: invert(0);
  transition: filter 0.3s;
}

.invert-hover:hover {
  filter: invert(1);
}

/* 打印优化 */
@media print {
  body {
    filter: invert(1);
  }
}

/* OCR 优化（提高文字识别率）*/
.ocr-ready {
  filter: invert(1) contrast(2);
}
```

## 十、透明度 opacity()

### 10.1 基本用法

```css
.element {
  filter: opacity(0);      /* 完全透明 */
  filter: opacity(0.5);    /* 半透明 */
  filter: opacity(1);      /* 完全不透明 */
  filter: opacity(100%);   /* 完全不透明 */
}
```

### 10.2 与 opacity 属性的区别

```css
/* CSS opacity 属性 */
.element {
  opacity: 0.5;
}

/* CSS filter: opacity() */
.element {
  filter: opacity(50%);
}
```

| 特性 | `opacity` 属性 | `filter: opacity()` |
|------|----------------|---------------------|
| 语法 | `opacity: 0-1` | `opacity: 0-1` 或 `%` |
| 性能 | 可能触发重绘 | 在滤镜层处理 |
| 组合 | 独立属性 | 可与其他滤镜组合 |
| 继承 | 不继承 | 不继承 |

### 10.3 应用场景

```css
/* 滤镜组合中使用 */
.combined {
  /* 同时应用模糊和透明度 */
  filter: blur(5px) opacity(0.8);
}

/* 禁用状态 */
button:disabled {
  filter: opacity(0.5);
}

/* 加载状态 */
.loading {
  filter: opacity(0.3) blur(2px);
}
```

## 十一、阴影效果 drop-shadow()

### 11.1 基本用法

```css
/* 语法与 box-shadow 类似，但有区别 */
filter: drop-shadow(10px 10px 10px rgba(0, 0, 0, 0.5));

/* 完整语法 */
filter: drop-shadow(offset-x | offset-y | blur-radius | spread-radius | color);

/* 简写语法 */
filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.5));
filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
```

### 11.2 与 box-shadow 的区别

```css
/* box-shadow - 只给盒子加阴影，不透明 */
.box {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* drop-shadow - 给元素轮廓加阴影（含透明区域） */
.box {
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
}
```

**关键区别**：

```
box-shadow                drop-shadow
┌──────────┐             ┌──────────┐
│    ╱╲    │             │    ╱╲    │
│   ╱  ╲   │             │   ╱  ╲   │
│  ╱    ╲  │             │  ╱    ╲  │
│ ╱______╲ │             │ ╱______╲ │
└──────────┘             │    ▓     │
    ▓ ▓ ▓                 ▓   ▓   ▓
  (矩形阴影)              (轮廓阴影)

透明 PNG 图片：
box-shadow → 给整个图片矩形加阴影
drop-shadow → 给图片中非透明内容加阴影
```

### 11.3 应用场景

```css
/* 透明图片阴影 */
.logo {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

/* SVG 图标阴影 */
.icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

/* 文字阴影（跨浏览器） */
.text-shadow {
  filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.5));
}

/* 多层阴影 */
.multi-shadow {
  filter:
    drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))
    drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

/* 动态阴影 */
.dynamic-shadow {
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  transition: filter 0.3s;
}

.dynamic-shadow:hover {
  filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.2));
}
```

### 11.4 实战示例

```css
/* 卡片阴影系统 */
.card {
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.12))
          drop-shadow(0 1px 2px rgba(0, 0, 0, 0.24));
}

.card:hover {
  filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.25))
          drop-shadow(0 10px 10px rgba(0, 0, 0, 0.22));
}

/* 按钮阴影 */
.button {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.button:active {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
}
```

## 十二、SVG 滤镜 url()

### 12.1 基本用法

```css
/* 引用 SVG 滤镜 */
.filter-custom {
  filter: url(#filter-id);
}

/* 外部 SVG 文件 */
.filter-external {
  filter: url('filters.svg#filter-id');
}
```

### 12.2 SVG 滤镜定义

```html
<svg style="display: none;">
  <defs>
    <!-- 自定义滤镜 -->
    <filter id="wavy">
      <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="2" />
      <feDisplacementMap in="SourceGraphic" scale="10" />
    </filter>

    <!-- 纸张效果 -->
    <filter id="paper">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" />
      <feDiffuseLighting lighting-color="#fff" surfaceScale="2">
        <feDistantLight azimuth="45" elevation="60" />
      </feDiffuseLighting>
    </filter>

    <!-- 发光效果 -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
</svg>
```

### 12.3 应用场景

```css
/* 波浪效果 */
.wavy-text {
  filter: url(#wavy);
}

/* 纸张纹理 */
.paper-effect {
  filter: url(#paper);
}

/* 发光文字 */
.glow-text {
  filter: url(#glow);
}

/* 复杂组合滤镜 */
.complex-filter {
  filter: url(#complex);
}
```

## 十三、滤镜组合

### 13.1 组合规则

```css
/* 多个滤镜按顺序应用 */
.element {
  filter: blur(5px) brightness(1.2) contrast(1.1);
}

/* 应用顺序很重要 */
/* 顺序不同，效果不同 */
.element-1 {
  filter: grayscale(1) brightness(1.5);  /* 先灰度，再提亮 */
}

.element-2 {
  filter: brightness(1.5) grayscale(1);  /* 先提亮，再灰度 */
}
```

### 13.2 常用组合

```css
/* 黑白电影效果 */
.film-noir {
  filter: grayscale(1) contrast(1.2) brightness(0.9);
}

/* 复古照片 */
.vintage-photo {
  filter: sepia(0.8) contrast(1.1) brightness(0.9);
}

/* 赛博朋克效果 */
.cyberpunk {
  filter: saturate(2) hue-rotate(180deg) contrast(1.3);
}

/* 梦幻效果 */
.dreamy {
  filter: blur(2px) brightness(1.1) saturate(1.2);
}

/* 美颜效果 */
.beautify {
  filter: contrast(1.1) saturate(1.1) brightness(1.05);
}

/* 夜视效果 */
.night-vision {
  filter: brightness(1.2) contrast(1.3) saturate(0);
}

/* 热成像效果 */
.thermal {
  filter: invert(1) hue-rotate(180deg) saturate(2);
}

/* 漫画效果 */
.comic {
  filter: contrast(1.5) saturate(1.5) brightness(1.1);
}

/* 陈旧照片效果 */
.old-photo {
  filter: sepia(0.5) contrast(0.9) brightness(0.95);
}

/* 冷色调 */
.cool {
  filter: saturate(1.2) hue-rotate(30deg) brightness(1.1);
}

/* 暖色调 */
.warm {
  filter: saturate(1.2) sepia(0.2) brightness(1.05);
}
```

### 13.3 性能优化

```css
/* 使用 will-change 优化 */
.animated-filter {
  will-change: filter;
}

/* 避免频繁改变滤镜值 */
/* ❌ 不好 */
.element {
  animation: badFilter 1s infinite;
}

@keyframes badFilter {
  0% { filter: blur(0); }
  25% { filter: blur(5px); }
  50% { filter: contrast(2); }
  75% { filter: brightness(2); }
  100% { filter: blur(0); }
}

/* ✅ 好 - 使用 transform 代替 */
.element {
  animation: goodTransform 1s infinite;
}

@keyframes goodTransform {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

## 十四、背景滤镜 backdrop-filter

### 14.1 基本用法

```css
/* 语法与 filter 相同 */
.glass {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px); /* Safari */
}

/* 毛玻璃效果 */
.frosted-glass {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
}
```

### 14.2 应用场景

```css
/* 模态框背景 */
.modal-backdrop {
  backdrop-filter: blur(5px);
}

/* 导航栏 */
.navbar {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

/* 卡片悬浮 */
.card {
  backdrop-filter: blur(5px);
  background: rgba(255, 255, 255, 0.1);
}

/* 侧边栏 */
.sidebar {
  backdrop-filter: blur(20px);
  background: rgba(0, 0, 0, 0.5);
}
```

### 14.3 兼容性处理

```css
/* 降级方案 */
.glass {
  background: rgba(255, 255, 255, 0.8);
}

@supports (backdrop-filter: blur(10px)) {
  .glass {
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
  }
}
```

## 十五、实际应用示例

### 15.1 图片编辑器

```css
/* 滤镜预设 */
.filter-none { filter: none; }
.filter-grayscale { filter: grayscale(1); }
.filter-sepia { filter: sepia(1); }
.filter-vintage { filter: sepia(0.5) contrast(1.2); }
.filter-cool { filter: saturate(1.1) hue-rotate(30deg); }
.filter-warm { filter: saturate(1.1) sepia(0.2); }
.filter-dramatic { filter: contrast(1.5) brightness(0.9); }
.filter-pop { filter: contrast(1.2) saturate(1.5); }
```

### 15.2 响应式设计

```css
/* 根据设备性能调整 */
@media (prefers-reduced-motion: reduce) {
  .animated {
    filter: none !important;
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  img {
    filter: brightness(0.8) contrast(1.1);
  }
}

/* 打印优化 */
@media print {
  .no-print {
    filter: invert(1);
  }
}
```

### 15.3 交互效果

```css
/* 图片悬停效果 */
img {
  filter: grayscale(1);
  transition: filter 0.3s ease;
}

img:hover {
  filter: grayscale(0);
}

/* 加载动画 */
.loading-image {
  filter: blur(10px);
  transition: filter 0.5s ease;
}

.loading-image.loaded {
  filter: blur(0);
}

/* 焦点样式 */
.focusable:focus {
  filter: brightness(1.2) drop-shadow(0 0 5px currentColor);
}
```

## 十六、浏览器兼容性

| 滤镜函数 | Chrome | Firefox | Safari | Edge |
|----------|--------|---------|--------|------|
| `blur()` | 18+ | 35+ | 9+ | 13+ |
| `brightness()` | 18+ | 35+ | 9+ | 13+ |
| `contrast()` | 18+ | 35+ | 9+ | 13+ |
| `grayscale()` | 18+ | 35+ | 9+ | 13+ |
| `sepia()` | 18+ | 35+ | 9+ | 13+ |
| `saturate()` | 18+ | 35+ | 9+ | 13+ |
| `hue-rotate()` | 18+ | 35+ | 9+ | 13+ |
| `invert()` | 18+ | 35+ | 9+ | 13+ |
| `opacity()` | 18+ | 35+ | 9+ | 13+ |
| `drop-shadow()` | 18+ | 35+ | 9+ | 13+ |
| `url()` | 18+ | 35+ | 9+ | 13+ |
| `backdrop-filter` | 76+ | 103+ | 9+ | 79+ |

### 前缀处理

```css
/* 旧版浏览器前缀 */
.element {
  -webkit-filter: blur(5px);
  filter: blur(5px);
}

/* backdrop-filter 前缀 */
.glass {
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}
```

### 降级方案

```css
/* 检测支持 */
@supports (filter: blur(5px)) {
  .blur-effect {
    filter: blur(5px);
  }
}

@supports not (filter: blur(5px)) {
  .blur-effect {
    /* 降级方案 */
    opacity: 0.5;
  }
}
```

## 十七、性能注意事项

### 17.1 性能影响

```css
/* ❌ 避免：在大型元素上使用复杂滤镜 */
.large-element {
  filter: blur(20px) contrast(2) saturate(2);
}

/* ✅ 推荐：使用 GPU 加速的属性 */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}
```

### 17.2 优化建议

```css
/* 1. 使用 will-change 提示浏览器 */
.animated {
  will-change: filter;
}

/* 2. 动画结束后移除 will-change */
.animated.finished {
  will-change: auto;
}

/* 3. 避免同时使用多个复杂滤镜 */
/* ❌ 不好 */
.heavy {
  filter: blur(10px) contrast(2) saturate(2) brightness(1.5);
}

/* ✅ 更好 */
.light {
  filter: contrast(1.5);
}

/* 4. 优先使用 backdrop-filter 而非 filter + 伪元素 */
/* ❌ 不好 */
.glass::before {
  content: '';
  filter: blur(10px);
}

/* ✅ 更好 */
.glass {
  backdrop-filter: blur(10px);
}
```

---

> 参考资料：
> - [MDN - filter](https://developer.mozilla.org/zh-CN/docs/Web/CSS/filter)
> - [MDN - backdrop-filter](https://developer.mozilla.org/zh-CN/docs/Web/CSS/backdrop-filter)
> - [CSS Filter Effects Specification](https://www.w3.org/TR/filter-effects/)
