# 浏览器 API

## IntersectionObserver

**作用**：异步监听目标元素与其祖先元素或视口的交叉状态（元素是否进入可视区域）

**应用场景**：图片懒加载、无限滚动、曝光埋点、动画触发

### 语法

```javascript
const observer = new IntersectionObserver(callback, options);
```

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| callback | Function | 交叉状态变化时的回调 |
| options | Object | 配置对象（可选） |

### options 配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| root | Element | null (视口) | 根元素 |
| rootMargin | string | '0px' | 根元素边距，类似 CSS margin |
| threshold | number/array | 0 | 触发阈值，0-1 之间 |

### callback 回调参数

```javascript
callback(entries, observer)

// entries 是数组，每个对象包含：
{
  target: Element,              // 目标元素
  isIntersecting: boolean,      // 是否相交
  boundingClientRect: DOMRect,  // 目标元素矩形
  intersectionRect: DOMRect,    // 相交区域矩形
  intersectionRatio: number,    // 相交比例 0-1
  rootBounds: DOMRect           // 根元素矩形
}
```

### 完整示例

```javascript
// 图片懒加载
const imgObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      observer.unobserve(img); // 加载后停止观察
    }
  });
}, {
  rootMargin: '50px', // 提前50px开始加载
  threshold: 0.01
});

document.querySelectorAll('img[data-src]').forEach(img => {
  imgObserver.observe(img);
});

// 无限滚动
const loadMore = () => {
  console.log('加载更多数据...');
};

const sentinelObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadMore();
  }
});

const sentinel = document.querySelector('#sentinel');
sentinelObserver.observe(sentinel);
```

### 注意事项

1. **兼容性**：IE 不支持，需要 polyfill
2. **性能**：本身是异步的，性能较好，但避免同时观察过多元素
3. **rootMargin**：注意写法，必须带单位（如 '100px'）

---

## MutationObserver

**作用**：监听 DOM 树的变化，包括属性变化、子节点增减、文本内容变化

**应用场景**：DOM 变化监听、自动保存、UI 响应式更新、第三方脚本监控

### 语法

```javascript
const observer = new MutationObserver(callback);
observer.observe(target, config);
```

### config 配置项

| 属性 | 类型 | 说明 |
|------|------|------|
| childList | boolean | 观察子节点的增减 |
| attributes | boolean | 观察属性变化 |
| characterData | boolean | 观察文本内容变化 |
| subtree | boolean | 观察所有后代节点 |
| attributeOldValue | boolean | 记录属性旧值 |
| characterDataOldValue | boolean | 记录文本旧值 |
| attributeFilter | array | 只观察特定属性 |

### mutation 对象属性

```javascript
{
  type: 'childList' | 'attributes' | 'characterData',
  target: Element,              // 变化的目标节点
  addedNodes: NodeList,         // 新增的节点
  removedNodes: NodeList,       // 移除的节点
  attributeName: string,        // 变化的属性名
  oldValue: string,             // 旧值（需配置对应选项）
  nextSibling: Node,            // 下一个兄弟节点
  previousSibling: Node         // 上一个兄弟节点
}
```

### 完整示例

```javascript
// 监听 class 变化
const classObserver = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
      console.log('class 变化了:', mutation.target.className);
    }
  });
});

classObserver.observe(element, {
  attributes: true,
  attributeFilter: ['class']
});

// 监听子节点变化（如动态加载的内容）
const contentObserver = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1) { // 元素节点
        console.log('新增元素:', node);
        // 处理新元素...
      }
    });
  });
});

contentObserver.observe(container, {
  childList: true,
  subtree: true
});

// 表单自动保存
const formObserver = new MutationObserver(() => {
  localStorage.setItem('formData', form.innerHTML);
});

formObserver.observe(form, {
  attributes: true,
  childList: true,
  subtree: true,
  characterData: true
});
```

### 注意事项

1. **自身变化**：`childList: true` 不会监听自身的变化，只监听子节点
2. **性能**：避免在回调中触发新的 DOM 变化，可能造成循环
3. **disconnect**：使用后记得断开，避免内存泄漏

---

## ResizeObserver

**作用**：监听元素尺寸变化（包括 content box 和 border box）

**应用场景**：响应式布局、Canvas/SVG 自适应、组件尺寸监听

### 语法

```javascript
const observer = new ResizeObserver(callback);
```

### callback 参数

```javascript
callback(entries, observer)

// entries 是数组，每个对象包含：
{
  target: Element,              // 目标元素
  contentRect: {                // 内容区域矩形
    x, y, width, height,
    top, right, bottom, left
  },
  borderBoxSize: [{             // 边框盒尺寸
    inlineSize, blockSize
  }],
  contentBoxSize: [{            // 内容盒尺寸
    inlineSize, blockSize
  }],
  devicePixelContentBoxSize: [{}] // 设备像素内容盒尺寸
}
```

### 完整示例

```javascript
// 响应式调整
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;
    const target = entry.target;

    if (width < 600) {
      target.classList.add('mobile');
      target.classList.remove('desktop');
    } else {
      target.classList.add('desktop');
      target.classList.remove('mobile');
    }

    // 调整 Canvas 大小
    if (target.tagName === 'CANVAS') {
      const dpr = window.devicePixelRatio || 1;
      target.width = width * dpr;
      target.height = height * dpr;
    }
  }
});

resizeObserver.observe(document.querySelector('.container'));

// 监听多个元素
const elements = document.querySelectorAll('.resizable');
elements.forEach(el => resizeObserver.observe(el));

// Canvas 自适应绘制
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const canvasObserver = new ResizeObserver(([entry]) => {
  const { width, height } = entry.contentRect;
  // 重绘内容
  drawChart(ctx, width, height);
});

canvasObserver.observe(canvas);
```

### 注意事项

1. **无限循环**：避免在回调中修改目标元素尺寸
2. **contentRect**：已被废弃，建议使用 `contentBoxSize`
3. **异步触发**：回调是异步批量执行的

---

## requestAnimationFrame

**作用**：在浏览器下一次重绘之前执行回调，专为动画设计

**特点**：与屏幕刷新率同步（通常 60fps），页面隐藏时自动暂停

### 语法

```javascript
const requestId = requestAnimationFrame(callback);
cancelAnimationFrame(requestId);
```

### 完整示例

```javascript
// 平滑动画
function animate() {
  const element = document.getElementById('box');
  let position = 0;
  let velocity = 2;

  function step() {
    position += velocity;
    element.style.transform = `translateX(${position}px)`;

    if (position < window.innerWidth - 100) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

animate();

// 带时间戳的动画（处理不同刷新率）
let lastTime = 0;
function animateWithTimestamp(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  // 使用 deltaTime 计算动画，保证不同刷新率下速度一致
  position += (velocity * deltaTime) / 16.67;

  requestAnimationFrame(animateWithTimestamp);
}

requestAnimationFrame(animateWithTimestamp);

// 可取消的动画类
class Animation {
  constructor() {
    this.requestId = null;
  }

  start() {
    const animate = (time) => {
      this.update(time);
      this.requestId = requestAnimationFrame(animate);
    };
    this.requestId = requestAnimationFrame(animate);
  }

  stop() {
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
      this.requestId = null;
    }
  }

  update(time) {
    // 动画逻辑
  }
}
```

### 与 setTimeout/setInterval 对比

| 特性 | requestAnimationFrame | setTimeout/setInterval |
|------|----------------------|------------------------|
| 刷新率同步 | ✓ | ✗ |
| 页面隐藏暂停 | ✓ | ✗ |
| 精确度 | 高 | 低 |
| 适用场景 | 动画 | 轮询、延迟执行 |

### 注意事项

1. **必须手动取消**：组件卸载时记得调用 `cancelAnimationFrame`
2. **时间戳处理**：使用 timestamp 处理不同刷新率
3. **避免嵌套**：不要在回调中重复创建新的 rAF

---

## requestIdleCallback

**作用**：在浏览器空闲时执行低优先级任务

**应用场景**：数据分析、非关键渲染、后台统计、懒加载

### 语法

```javascript
const handleId = requestIdleCallback(callback, options);
cancelIdleCallback(handleId);
```

### 参数

```javascript
callback(deadline)

// deadline 对象：
{
  timeRemaining(): number,  // 剩余时间（毫秒）
  didTimeout: boolean       // 是否超时
}

// options:
{
  timeout: number  // 超时时间（毫秒），强制执行
}
```

### 完整示例

```javascript
// 任务分块处理
function processLargeData(data) {
  let index = 0;
  const chunkSize = 50;

  function processChunk(deadline) {
    while (index < data.length && deadline.timeRemaining() > 0) {
      // 处理一条数据
      processData(data[index]);
      index++;
    }

    if (index < data.length) {
      // 还有数据，下次空闲继续
      requestIdleCallback(processChunk);
    } else {
      console.log('处理完成');
    }
  }

  requestIdleCallback(processChunk);
}

// 带超时的上报
function reportLog(data) {
  requestIdleCallback(
    () => {
      fetch('/log', { method: 'POST', body: JSON.stringify(data) });
    },
    { timeout: 2000 } // 最多等2秒
  );
}

// Polyfill（兼容不支持的浏览器）
window.requestIdleCallback = window.requestIdleCallback || function(cb) {
  const start = Date.now();
  return setTimeout(() => {
    cb({
      didTimeout: false,
      timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
    });
  }, 1);
};
```

### 注意事项

1. **不保证执行**：如果浏览器一直忙碌，可能永远不会执行
2. **设置超时**：重要任务设置 timeout，保证最终执行
3. **兼容性**：Safari 和 Firefox 支持较差

---

## 其他常用 API

### Performance API - 性能监控

```javascript
// 测量代码执行时间
performance.mark('start');
// ... 代码
performance.mark('end');
performance.measure('myOperation', 'start', 'end');

const measure = performance.getEntriesByName('myOperation')[0];
console.log(`耗时: ${measure.duration}ms`);

// 获取页面加载性能
performance.getEntriesByType('navigation').forEach(entry => {
  console.log({
    DNS查询: entry.domainLookupEnd - entry.domainLookupStart,
    TCP连接: entry.connectEnd - entry.connectStart,
    请求响应: entry.responseEnd - entry.requestStart,
    DOM解析: entry.domContentLoadedEventEnd - entry.responseEnd,
    首次绘制: entry.responseStart
  });
});

// 获取资源加载性能
performance.getEntriesByType('resource').forEach(resource => {
  console.log(`${resource.name}: ${resource.duration}ms`);
});

// 清除性能数据
performance.clearMarks();
performance.clearMeasures();
```

### Clipboard API - 剪贴板

```javascript
// 复制文本
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log('复制成功');
  } catch (err) {
    console.error('复制失败:', err);
  }
}

// 读取剪贴板
async function readClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    return text;
  } catch (err) {
    console.error('读取失败:', err);
  }
}

// 检查权限
const permission = await navigator.permissions.query({ name: 'clipboard-read' });
console.log(permission.state); // 'granted' | 'denied' | 'prompt'
```

### Fullscreen API - 全屏

```javascript
// 进入全屏
document.documentElement.requestFullscreen();
// 或特定元素
element.requestFullscreen();

// 退出全屏
document.exitFullscreen();

// 监听全屏变化
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    console.log('进入全屏');
  } else {
    console.log('退出全屏');
  }
});

// 检查全屏状态
console.log(document.fullscreenElement); // 全屏元素或 null
```

### Online/Offline API - 网络状态

```javascript
// 监听网络状态
window.addEventListener('online', () => {
  console.log('网络已连接');
  syncData(); // 同步数据
});

window.addEventListener('offline', () => {
  console.log('网络已断开');
  showOfflineMessage();
});

// 检查当前状态
if (navigator.onLine) {
  console.log('在线');
} else {
  console.log('离线');
}
```

### Page Visibility API - 页面可见性

```javascript
// 监听页面可见性
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('页面隐藏，暂停动画/轮询');
    pauseAnimation();
    stopPolling();
  } else {
    console.log('页面显示，恢复动画/轮询');
    resumeAnimation();
    startPolling();
  }
});

// 检查当前状态
if (document.visibilityState === 'visible') {
  console.log('页面可见');
}

// 应用场景
// 1. 页面隐藏时暂停视频/动画
// 2. 停止轮询请求
// 3. 暂停 Canvas 渲染
```

### Geolocation API - 地理位置

```javascript
// 获取当前位置
navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log('经度:', position.coords.longitude);
    console.log('纬度:', position.coords.latitude);
    console.log('精度:', position.coords.accuracy);
  },
  (error) => {
    console.error('获取位置失败:', error.message);
  },
  {
    enableHighAccuracy: true,  // 高精度
    timeout: 5000,             // 超时时间
    maximumAge: 0              // 不使用缓存
  }
);

// 持续监听位置变化
const watchId = navigator.geolocation.watchPosition(
  (position) => {
    updateMap(position.coords);
  },
  handleError
);

// 停止监听
navigator.geolocation.clearWatch(watchId);
```

### Notification API - 桌面通知

```javascript
// 请求权限
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    // 显示通知
    new Notification('标题', {
      body: '通知内容',
      icon: '/icon.png',
      badge: '/badge.png',
      tag: 'unique-id',  // 相同 tag 会替换旧通知
      requireInteraction: true  // 需要用户点击才关闭
    });
  }
});

// 检查权限
if (Notification.permission === 'granted') {
  // 已授权
} else if (Notification.permission === 'denied') {
  // 已拒绝
}
```

## 性能优化建议

1. **批量操作 DOM**：使用 DocumentFragment 或模板字符串
2. **防抖节流**：对 scroll、resize 事件使用防抖
3. **虚拟列表**：大数据列表使用虚拟滚动
4. **懒加载**：图片、组件使用 IntersectionObserver
5. **Web Worker**：复杂计算放到 Worker
6. **避免同步布局**：读取和写入分开操作
