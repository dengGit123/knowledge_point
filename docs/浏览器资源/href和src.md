# href 和 src 的区别

## 作用

| 属性 | 全称 | 作用 |
|------|------|------|
| **href** | Hypertext Reference | 建立与外部资源的**链接关系**，不会阻塞页面解析 |
| **src** | Source | 将外部资源**嵌入**到当前文档中，会替换当前元素 |

## 使用场景

### href 用于

```html
<!-- 超链接跳转 -->
<a href="https://example.com">点击跳转</a>

<!-- 引入样式表 -->
<link href="styles.css" rel="stylesheet">

<!-- 定义图标 -->
<link href="favicon.ico" rel="icon">

<!-- 图片热区 -->
<area href="page.html" shape="rect" coords="0,0,100,100">
```

### src 用于

```html
<!-- 图片 -->
<img src="image.jpg" alt="图片描述">

<!-- JavaScript 文件 -->
<script src="app.js"></script>

<!-- 内嵌框架 -->
<iframe src="page.html"></iframe>

<!-- 音频 -->
<audio src="audio.mp3" controls></audio>

<!-- 视频 -->
<video src="video.mp4" controls></video>
```

## 核心区别

```
href: 建立关联 → 资源并行下载，不阻塞页面解析
src: 嵌入资源 → 资源会替换元素，阻塞页面解析
```

### 解析行为差异

| 特性 | href | src |
|------|------|-----|
| 资源加载 | 并行下载，不阻塞 HTML 解析 | 阻塞页面解析（除 script async/defer） |
| 元素内容 | 保留原有内容 | 替换元素内容 |
| 典型元素 | `<a>`, `<link>` | `<img>`, `<script>`, `<iframe>` |

## 特殊情况：script 标签

```html
<!-- 正常加载脚本 -->
<script src="app.js"></script>

<!-- src 存在时，标签内代码会被忽略！ -->
<script src="app.js">
  console.log('这段代码不会执行'); // ❌ 被忽略
</script>

<!-- 没有 src 时才执行内联代码 -->
<script>
  console.log('这段代码会执行'); // ✅
</script>
```

## 注意事项

### 1. link 标签用 href，不用 src

```html
<link href="style.css" rel="stylesheet">  <!-- ✅ 正确 -->
<link src="style.css" rel="stylesheet">  <!-- ❌ 错误 -->
```

### 2. a 标签的 href="#" 会跳转顶部

```html
<!-- 会跳转到页面顶部 -->
<a href="#">返回顶部</a>

<!-- 阻止跳转的方法 -->
<a href="javascript:void(0)">不跳转</a>
<a href="#" onclick="event.preventDefault()">不跳转</a>
```

### 3. img 的 alt 属性

```html
<!-- 推荐：始终提供 alt 文本 -->
<img src="photo.jpg" alt="风景照片">

<!-- 图片加载失败时显示 alt 内容 -->
```

### 4. 路径写法

```html
<!-- 相对路径 -->
<link href="./css/style.css">     <!-- 同级目录 -->
<link href="../css/style.css">    <!-- 上级目录 -->

<!-- 绝对路径 -->
<link href="/css/style.css">      <!-- 网站根目录 -->
<link href="https://cdn.com/style.css">  <!-- 完整 URL -->
```

### 5. script 的加载优化

```html
<!-- 默认：阻塞 HTML 解析 -->
<script src="app.js"></script>

<!-- defer：HTML 解析完再执行，按顺序执行 -->
<script defer src="app1.js"></script>
<script defer src="app2.js"></script>

<!-- async：下载后立即执行，不保证顺序 -->
<script async src="app.js"></script>
```

## 记忆口诀

```
href = 关联关系 (relation)   → link, a
src  = 内容替换 (source)      → img, script, iframe
```
