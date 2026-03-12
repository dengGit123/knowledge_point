### InterSectionObserver
* 主要是用来监听元素进入可视区域
* 用于异步监听目标元素与其祖先元素或视口的交叉状态
#### 语法
- `IntersectionObserver(callback, options)`
  * `callback`: 回调函数，当目标元素与根元素的交叉状态发生变化时触发
    * `entries`: 交叉信息数组，每个对象包含交叉信息
      * `target`: 目标元素  
      * `isIntersecting`: 元素是否与根元素的交叉状态
      * `boundingClientRect`: 目标元素矩形区域
      * `intersectionRect`: 交叉区域矩形
      * `intersectionRatio`: 交叉区域占目标元素的比例
  * `options`: 配置对象，可选
    * `root`: 根元素，默认为视口
    * `rootMargin`: 根元素边距，默认为'0px'
    * `threshold`: 触发阈值，默认为0
    * ...
```javascript
// 创建观察器
const observer = new IntersectionObserver(callback, options);
// 配置选项
const options = {
  root: null,           // 根元素，默认为视口
  rootMargin: '0px',    // 根元素边距
  threshold: 0.5        // 触发阈值（0-1或数组）
};
// 回调函数
const callback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 元素进入视口
      console.log('元素可见:', entry.target);
      // 可选：停止观察
      observer.unobserve(entry.target);
    }
  });
};

// 开始观察元素
const target = document.querySelector('.lazy-load');
observer.observe(target);

// 停止观察
observer.unobserve(target);

// 断开所有观察
observer.disconnect();
```
### Mutationobserver
* 主要用来监听DOM变化，属性变化，子节点增减等
#### 语法
- `MutationObserver(callback, options)`
  * `callback`: 回调函数，当DOM变化时触发
    * `mutations`: DOM变化信息数组
      * `type`: 变化类型（'childList', 'attributes', 'characterData'）
      * `target`: 目标元素
      * `addedNodes`: 新增的子节点列表
      * `removedNodes`: 被移除的子节点列表
      * ...
  * `options`: 配置对象，可选
    * `childList`: 是否观察子节点的增减
    * `attributes`: 是否观察属性变化
    * `subtree`: 是否深入观察所有后代节点
    * ...
```javascript
// 创建观察器
const observer = new MutationObserver(callback);
// 配置选项
const config = {
  attributes: true,              // 观察属性变化
  attributeFilter: ['class'],    // 只观察特定属性
  attributeOldValue: true,       // 记录旧值
  childList: true,               // 观察子节点变化
  subtree: true,                 // 观察所有后代节点
  characterData: true            // 观察文本内容变化
};

// 回调函数
const callback = (mutationsList, observer) => {
  for (const mutation of mutationsList) {
    switch (mutation.type) {
      case 'attributes':
        console.log('属性变化:', mutation.attributeName);
        console.log('旧值:', mutation.oldValue);
        break;
      case 'childList':
        mutation.addedNodes.forEach(node => console.log('添加节点:', node));
        mutation.removedNodes.forEach(node => console.log('移除节点:', node));
        break;
    }
  }
};

// 开始观察
const target = document.getElementById('observable');
observer.observe(target, config);

// 停止观察
observer.disconnect();
```
### ResizeObserver
* 主要用来监听元素尺寸变化
#### 语法
- `ResizeObserver(callback)`
  * `callback`: 回调函数，当元素尺寸变化时触发
    * `entries`: 尺寸信息数组
      * `target`: 目标元素
      * `contentRect`: 内容矩形区域（width, height）
```javascript
// 创建观察器
const observer = new ResizeObserver(callback);

// 回调函数
const callback = (entries, observer) => {
  entries.forEach(entry => {
    const { width, height } = entry.contentRect;
    const target = entry.target;
    
    console.log(`元素尺寸变化: ${width} x ${height}`);
    
    // 根据尺寸调整布局
    if (width < 600) {
      target.classList.add('mobile');
    } else {
      target.classList.remove('mobile');
    }
  });
};

// 开始观察
const elements = document.querySelectorAll('.resizable');
elements.forEach(el => observer.observe(el));

// 停止观察特定元素
observer.unobserve(element);

// 停止所有观察
observer.disconnect();
```
### requestAnimationFrame
* 在浏览器下一次重绘之前执行回调函数
* 专为动画设计，保证与浏览器的刷新率同步（通常60fps）
* 当页面切换到后台标签页时，动画会自动暂停，节省资源
#### 语法
- `requestAnimationFrame(callback)`
  * `callback`: 回调函数，在浏览器下一次重绘之前执行
```javascript
// 使用示例：创建简单的动画效果
function animate() {
  const element = document.getElementById('animate');
  let position = 0;
  
  function step() {
    position += 1;
    element.style.transform = `translateX(${position}px)`;
    if (position < window.innerWidth) {
      requestAnimationFrame(step);
    }
  }
  
  requestAnimationFrame(step);
}

animate(); // 开始动画
```
#### requestAnimationFrame注意事项
* 不要嵌套调用：避免在回调中再次调用，可能导致性能问题
* 清理工作：动画结束后调用`cancelAnimationFrame`
#### requestAnimationFrame与setTimeout/setInterval
* `requestAnimationFrame`更适合动画，因为它与浏览器的刷新率同步
* `setTimeout/setInterval`适用于不需要精确控制时间间隔的场景（如轮询）
* 使用`requestAnimationFrame`可以避免不必要的重绘和回流，提高性能
* 动画结束后，使用`cancelAnimationFrame(requestId)`取消回调函数，避免内存泄漏
### requestIdleCallback
* 浏览器在空闲时会执行回调函数
* 用于执行**低**优先级的任务，如懒加载图片、分析代码等
#### 语法
- `requestIdleCallback(callback, options)`
  * `callback`: 回调函数，在浏览器空闲时执行
    * `deadline`: 一个对象，包含`timeRemaining()`方法（返回剩余时间）和`didTimeout`属性（是否超时）
  * `options`: 可选配置对象
    * `timeout`: 超时阈值，默认为50ms，如果空闲期超过此时间仍未执行，则强制在下一帧执行
```javascript
// 使用示例：懒加载图片
function lazyLoadImage() {
  const images = document.querySelectorAll('img[data-src]');
  images.forEach(image => {
    if (isInViewport(image)) {
      image.src = image.getAttribute('data-src');
      image.removeAttribute('data-src');
    }
  });
}
```
#### requestIdleCallback注意事项
1. 任务拆分：将大任务拆分成小任务，每次空闲时间只执行一部分
2. 超时设置：谨慎设置timeout，避免影响用户体验
3. 任务可中断：确保任务可以安全地中断和恢复