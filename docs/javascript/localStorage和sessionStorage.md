### 一、概述

`localStorage` 和 `sessionStorage` 是浏览器提供的 **Web Storage API**，用于在客户端（浏览器端）以键值对（key-value）的形式存储数据。它们都是 `Storage` 接口的实例，共享相同的 API 方法，但在**生命周期**和**作用域**上有本质区别。

> 📖 [MDN - Web Storage API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Storage_API)

### 二、localStorage 与 sessionStorage 核心区别

| 特性 | localStorage | sessionStorage |
| :--: | :--: | :--: |
| **生命周期** | 永久存储，除非手动清除或用户清除浏览器数据 | 当前会话（标签页）有效，关闭标签页后清除 |
| **作用域** | 同源（协议+域名+端口）下所有标签页共享 | 仅限当前标签页，不同标签页各自独立 |
| **存储大小** | 通常 5MB（不同浏览器略有差异） | 通常 5MB（不同浏览器略有差异） |
| **存储位置** | 浏览器本地磁盘 | 浏览器本地磁盘 |
| **随请求发送** | ❌ 不会随 HTTP 请求发送 | ❌ 不会随 HTTP 请求发送 |
| **API** | `window.localStorage` | `window.sessionStorage` |

### 三、Storage 接口通用 API

`localStorage` 和 `sessionStorage` 拥有完全相同的实例方法：

| 方法 / 属性 | 描述 | 返回值 |
| :--: | :--: | :--: |
| `setItem(key, value)` | 存储一条数据（键值对） | `undefined` |
| `getItem(key)` | 获取指定键的值 | 字符串 或 `null`（不存在时） |
| `removeItem(key)` | 删除指定键值对 | `undefined` |
| `clear()` | 清空当前 Storage 的所有数据 | `undefined` |
| `key(index)` | 获取指定索引位置的键名 | 字符串 或 `null` |
| `length`（属性） | 返回存储的键值对数量 | `number` |

#### 1. setItem —— 存储数据

```js
// 基本用法：存储字符串
localStorage.setItem('username', 'Alice');
localStorage.setItem('theme', 'dark');

// ⚠️ value 只能是字符串！传入非字符串会自动调用 toString()
localStorage.setItem('count', 100);         // 实际存储的是字符串 '100'
localStorage.setItem('flag', true);         // 实际存储的是字符串 'true'
localStorage.setItem('user', { name: 'Bob' }); // 实际存储的是 '[object Object]' → 数据丢失！

// ✅ 存储复杂数据类型：需要先用 JSON.stringify 序列化
const user = { name: 'Bob', age: 25, hobbies: ['reading', 'coding'] };
localStorage.setItem('user', JSON.stringify(user));

// 存储数组
const tags = ['javascript', 'vue', 'css'];
localStorage.setItem('tags', JSON.stringify(tags));

// 如果 key 已存在，会覆盖（更新）原来的值
localStorage.setItem('username', 'Charlie'); // 'Alice' 被覆盖为 'Charlie'
```

> 💡 **提示：** `setItem` 在存储空间已满时会抛出 `QuotaExceededError` 异常，建议用 `try...catch` 包裹。

```js
try {
  localStorage.setItem('data', largeString);
} catch (e) {
  console.error('存储空间已满', e.name); // QuotaExceededError
}
```

#### 2. getItem —— 读取数据

```js
// 读取字符串
const username = localStorage.getItem('username'); // 'Charlie'

// 读取不存在的 key → 返回 null（不是 undefined）
const notExist = localStorage.getItem('notExist'); // null

// 读取 JSON 序列化的数据：需要 JSON.parse 反序列化
const userStr = localStorage.getItem('user'); // '{"name":"Bob","age":25}'
const user = JSON.parse(userStr);            // { name: 'Bob', age: 25 }

// 安全读取：避免解析 null 导致报错
const safeParse = (key) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

const result = safeParse('user'); // { name: 'Bob', age: 25 }
const empty = safeParse('notExist'); // null（不会报错）
```

#### 3. removeItem —— 删除数据

```js
localStorage.removeItem('username'); // 删除 key 为 'username' 的数据
localStorage.removeItem('notExist'); // key 不存在也不报错，静默处理
```

#### 4. clear —— 清空所有数据

```js
localStorage.clear(); // 清空当前源（origin）下的所有 localStorage 数据
```

#### 5. key 和 length —— 遍历存储数据

```js
// 存入一些数据
localStorage.setItem('name', 'Alice');
localStorage.setItem('age', '25');
localStorage.setItem('city', 'Beijing');

// 获取数量
console.log(localStorage.length); // 3

// 通过索引获取键名
console.log(localStorage.key(0)); // 'name'（注意：顺序不保证，取决于浏览器实现）

// 遍历所有键值对
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  console.log(key, value);
}
```

#### 6. 点语法 / 方括号语法访问（不推荐）

```js
// 可以像对象属性一样读写，但不推荐
localStorage.color = 'red';
console.log(localStorage.color); // 'red'

delete localStorage.color;

// ⚠️ 不推荐的原因：
// 1. 无法存储键名包含特殊字符的数据（如 'user-name'、'user name'）
// 2. 可能与 Storage 对象的原型属性冲突（如 'length'、'setItem' 等内置属性名）
localStorage.setItem('length', '10');       // ✅ 正常存储
localStorage.length;                        // 数字（如 3），不是 '10'！被内置属性覆盖

// 3. 无法在存储满时捕获异常
// 所以始终推荐使用 setItem / getItem / removeItem
```

### 四、localStorage 详解

#### 1. 生命周期

`localStorage` 的数据是**持久化**的：

- 浏览器关闭后数据依然存在
- 重新打开浏览器，数据仍然可用
- 只有在以下情况下才会被清除：
  - 通过代码调用 `localStorage.clear()` 或 `localStorage.removeItem(key)`
  - 用户手动清除浏览器数据（设置 → 清除浏览数据）
  - 浏览器存储空间耗尽时（浏览器可能自动清理，行为不一致）

#### 2. 作用域 —— 同源共享

```js
// 在 https://example.com 页面存储的数据
localStorage.setItem('token', 'abc123');

// 在 https://example.com 的其他标签页、iframe 中可以读取
const token = localStorage.getItem('token'); // 'abc123'

// ❌ 以下情况无法读取：
// - https://other.com          → 域名不同
// - http://example.com         → 协议不同（http vs https）
// - https://example.com:8080   → 端口不同
```

#### 3. 典型应用场景

- **用户偏好设置**：主题（暗色/亮色）、语言选择、字体大小等
- **持久化令牌**：JWT Token、登录状态
- **表单数据暂存**：用户填到一半的表单内容，防止意外丢失
- **离线数据缓存**：不经常变化的数据，减少网络请求
- **购物车数据**：未登录用户的购物车信息

```js
// 示例：保存用户主题偏好
function setTheme(theme) {
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// 页面加载时恢复主题
loadTheme();

// 示例：表单数据自动暂存
const form = document.querySelector('#myForm');
const AUTO_SAVE_KEY = 'form_draft';

// 输入时自动保存
form.addEventListener('input', () => {
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);
  localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(data));
});

// 页面加载时恢复
function restoreForm() {
  const saved = localStorage.getItem(AUTO_SAVE_KEY);
  if (!saved) return;
  const data = JSON.parse(saved);
  Object.entries(data).forEach(([name, value]) => {
    const input = form.querySelector(`[name="${name}"]`);
    if (input) input.value = value;
  });
}
restoreForm();
```

### 五、sessionStorage 详解

#### 1. 生命周期 —— 会话级

`sessionStorage` 的数据只在**当前标签页会话**内有效：

- **关闭标签页**：数据立即清除
- **刷新页面**：数据仍然保留
- **恢复标签页**：浏览器恢复之前关闭的标签页时，部分浏览器会恢复 sessionStorage 数据
- **新建标签页**：即使打开同一个 URL，也是一个全新的 sessionStorage，数据不共享

```js
// 在标签页 A 中存储
sessionStorage.setItem('tempData', 'some value');

// 刷新标签页 A → 数据仍然存在
console.log(sessionStorage.getItem('tempData')); // 'some value'

// 关闭标签页 A 后重新打开 → 数据已清除
console.log(sessionStorage.getItem('tempData')); // null
```

#### 2. 作用域 —— 标签页隔离

这是 `sessionStorage` 与 `localStorage` 最大的区别：**每个标签页拥有独立的 sessionStorage**。

```js
// 标签页 A
sessionStorage.setItem('pageId', 'A');

// 标签页 B（同一 URL）
console.log(sessionStorage.getItem('pageId')); // null（不是 'A'）

// 但通过链接打开的新标签页会继承 sessionStorage（浏览器行为，非规范要求）
// <a href="same-page.html" target="_blank">打开新标签页</a>
// 新标签页初始时会复制一份当前标签页的 sessionStorage 快照
// 之后两者完全独立，互不影响
```

#### 3. 典型应用场景

- **单页应用路由状态**：当前页面的临时 UI 状态
- **一次性提示/引导**：用户完成某个操作后的提示，关闭标签页后不再需要
- **表单防重复提交标记**
- **多步骤表单的中间数据**
- **页面间的临时传参**

```js
// 示例：多步骤表单，使用 sessionStorage 暂存每一步的数据
function saveStepData(step, data) {
  sessionStorage.setItem(`form_step_${step}`, JSON.stringify(data));
}

function getStepData(step) {
  const data = sessionStorage.getItem(`form_step_${step}`);
  return data ? JSON.parse(data) : null;
}

// 步骤 1：基本信息
saveStepData(1, { name: 'Alice', email: 'alice@example.com' });

// 步骤 2：地址信息
saveStepData(2, { city: 'Beijing', address: 'xxx街道' });

// 最终提交时汇总
function submitForm() {
  const step1 = getStepData(1);
  const step2 = getStepData(2);
  const allData = { ...step1, ...step2 };
  // 发送到服务器...
  sessionStorage.clear(); // 提交成功后清除
}
```

### 六、storage 事件 —— 跨标签页通信

当**同源**下的某个标签页修改了 `localStorage`（注意：`sessionStorage` 修改**不会**触发此事件），其他标签页会触发 `storage` 事件。

```js
// 在标签页 B 中监听
window.addEventListener('storage', (event) => {
  console.log('变化的 key：', event.key);           // 被修改的键名
  console.log('旧值：', event.oldValue);             // 修改前的值
  console.log('新值：', event.newValue);             // 修改后的值
  console.log('存储区域：', event.storageArea);      // localStorage 或 sessionStorage 对象
  console.log('来源页面：', event.url);              // 触发变化的页面 URL
});

// 在标签页 A 中修改 → 标签页 B 收到事件
localStorage.setItem('message', 'hello from tab A');
localStorage.removeItem('message');
localStorage.clear(); // 清空也会触发，此时 key 为 null
```

> ⚠️ **注意：**
> - 只有 `localStorage` 的变化会触发 `storage` 事件，`sessionStorage` 不会
> - **触发事件的标签页自身不会收到通知**，只有其他同源标签页才会收到
> - `event.key` 为 `null` 表示调用了 `clear()` 方法

#### 利用 storage 事件实现跨标签页通信

```js
// 封装：跨标签页消息通道
const CrossTabMessage = {
  // 发送消息
  send(type, data) {
    localStorage.setItem('__cross_tab_msg__', JSON.stringify({
      type,
      data,
      timestamp: Date.now(),
    }));
    // 发送后立即删除，确保下次相同消息也能触发事件
    localStorage.removeItem('__cross_tab_msg__');
  },

  // 监听消息
  onMessage(callback) {
    window.addEventListener('storage', (event) => {
      if (event.key !== '__cross_tab_msg__' || !event.newValue) return;
      try {
        const msg = JSON.parse(event.newValue);
        callback(msg.type, msg.data);
      } catch (e) {
        // 忽略解析错误
      }
    });
  },
};

// 标签页 A：发送
CrossTabMessage.send('USER_LOGOUT', { userId: 123 });

// 标签页 B：接收
CrossTabMessage.onMessage((type, data) => {
  if (type === 'USER_LOGOUT') {
    console.log('用户已在其他标签页登出', data.userId);
    // 跳转到登录页...
  }
});
```

### 七、封装工具函数

在实际项目中，推荐对 `localStorage` / `sessionStorage` 做一层封装，解决以下问题：

1. 自动 JSON 序列化 / 反序列化
2. 设置过期时间
3. 安全的类型处理
4. 异常捕获

```js
/**
 * Storage 工具类
 * 支持自动序列化、过期时间、命名空间
 */
class StorageUtil {
  constructor(storage = localStorage, prefix = '') {
    this.storage = storage;
    this.prefix = prefix;
  }

  // 获取带前缀的完整 key
  _getKey(key) {
    return `${this.prefix}${key}`;
  }

  /**
   * 存储数据
   * @param {string} key - 键名
   * @param {*} value - 值（任意类型，自动序列化）
   * @param {number} [expireMs] - 过期时间（毫秒），可选
   */
  set(key, value, expireMs) {
    const data = {
      value,
      timestamp: Date.now(),
      expire: expireMs || null,
    };
    try {
      this.storage.setItem(this._getKey(key), JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Storage 存储失败:', e);
      return false;
    }
  }

  /**
   * 获取数据
   * @param {string} key - 键名
   * @param {*} [defaultValue] - 默认值
   * @returns {*} 存储的值，已过期或不存在则返回 defaultValue
   */
  get(key, defaultValue = null) {
    try {
      const raw = this.storage.getItem(this._getKey(key));
      if (!raw) return defaultValue;

      const data = JSON.parse(raw);

      // 检查是否过期
      if (data.expire && Date.now() - data.timestamp > data.expire) {
        this.remove(key);
        return defaultValue;
      }

      return data.value;
    } catch (e) {
      console.error('Storage 读取失败:', e);
      return defaultValue;
    }
  }

  /** 删除指定 key */
  remove(key) {
    this.storage.removeItem(this._getKey(key));
  }

  /** 清空带前缀的所有数据 */
  clear() {
    if (!this.prefix) {
      this.storage.clear();
      return;
    }
    const keysToRemove = [];
    for (let i = 0; i < this.storage.length; i++) {
      const k = this.storage.key(i);
      if (k && k.startsWith(this.prefix)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => this.storage.removeItem(k));
  }
}

// 使用示例
const localStore = new StorageUtil(localStorage, 'app_');
const sessionStore = new StorageUtil(sessionStorage, 'app_');

// 存储数据（带过期时间：7天）
localStore.set('token', 'abc123', 7 * 24 * 60 * 60 * 1000);

// 存储对象
localStore.set('userInfo', { name: 'Alice', role: 'admin' });

// 读取数据
const token = localStore.get('token');          // 'abc123'
const user = localStore.get('userInfo');         // { name: 'Alice', role: 'admin' }
const notExist = localStore.get('notFound', {}); // {}（使用默认值）

// 删除
localStore.remove('token');

// 会话级存储
sessionStore.set('wizardStep', 2);
```

### 八、与 Cookie 的对比

| 特性 | localStorage | sessionStorage | Cookie |
| :--: | :--: | :--: | :--: |
| 容量 | ~5MB | ~5MB | ~4KB |
| 生命周期 | 永久 | 会话级（标签页） | 可设过期时间 |
| 随 HTTP 请求发送 | ❌ | ❌ | ✅ 每次 HTTP 请求都会携带 |
| API 易用性 | 简洁（setItem/getItem） | 简洁 | 需手动拼接字符串 |
| 跨标签页共享 | ✅ | ❌ | ✅ |
| 服务端访问 | ❌ | ❌ | ✅ |
| 安全性 | 同源策略 | 同源策略 + 标签页隔离 | 可设 HttpOnly、Secure、SameSite |

### 九、注意事项与最佳实践

#### 1. 存储容量限制

```js
// 浏览器通常限制 5MB，超出会抛出异常
// 安全地检测剩余空间
function getStorageSize(storage) {
  let total = 0;
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    const value = storage.getItem(key);
    // 每个字符占 2 字节（UTF-16 编码）
    total += (key.length + value.length) * 2;
  }
  return (total / 1024 / 1024).toFixed(2) + ' MB';
}

console.log(getStorageSize(localStorage)); // '0.03 MB'
```

#### 2. 只能存储字符串

```js
// ❌ 错误：直接存数字、布尔值、对象
localStorage.setItem('count', 42);
localStorage.getItem('count'); // '42'（字符串！）
typeof localStorage.getItem('count'); // 'string'

// ✅ 正确：用 JSON.stringify / JSON.parse 处理复杂数据
localStorage.setItem('count', JSON.stringify(42));
const count = JSON.parse(localStorage.getItem('count')); // 42（数字）
```

#### 3. 安全性考虑

```js
// ❌ 不要在 localStorage 中存储敏感信息（如密码、银行卡号）
// localStorage 可被同源页面的任何 JS 代码访问，容易受 XSS 攻击

// ✅ 敏感数据应使用 Cookie + HttpOnly + Secure
// 或使用服务端 Session

// ✅ Token 存储建议：
// - 短期 Token → sessionStorage（关闭标签页即失效）
// - 长期 Token → localStorage（配合短期有效期 + 刷新机制）
// - 关键操作需要重新验证身份
```

#### 4. 隐私 / 无痕模式

```js
// 在浏览器的隐私/无痕模式下：
// - Safari：localStorage 可用，但关闭窗口后完全清除
// - Chrome：localStorage 可用，关闭窗口后清除
// - 部分旧版浏览器：可能直接抛出异常

// 安全检测
function isStorageAvailable(storage) {
  try {
    const testKey = '__storage_test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}

if (isStorageAvailable(localStorage)) {
  // 可以使用 localStorage
} else {
  // 降级方案：使用内存对象、Cookie 等
  const fallbackStore = new Map();
}
```

#### 5. 同步阻塞

```js
// localStorage 的所有操作都是同步的，会阻塞主线程
// 如果存储大量数据，可能影响页面性能

// ❌ 避免在动画循环、滚动事件等高频场景中频繁读写
window.addEventListener('scroll', () => {
  // ❌ 不要这样做
  localStorage.setItem('scrollPos', window.scrollY);
});

// ✅ 应该使用节流/防抖
function throttle(fn, delay) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= delay) {
      last = now;
      fn(...args);
    }
  };
}

window.addEventListener('scroll', throttle(() => {
  localStorage.setItem('scrollPos', String(window.scrollY));
}, 500));
```

#### 6. 数据命名与组织

```js
// ✅ 使用前缀 / 命名空间避免冲突
const APP_PREFIX = 'myapp_';

// 不同模块使用不同前缀
localStorage.setItem('myapp_user_token', 'xxx');
localStorage.setItem('myapp_cart_items', JSON.stringify(items));
localStorage.setItem('myapp_settings_theme', 'dark');

// ✅ 或使用统一的 key 管理常量
const STORAGE_KEYS = {
  TOKEN: 'myapp_token',
  USER_INFO: 'myapp_user',
  THEME: 'myapp_theme',
  CART: 'myapp_cart',
};

localStorage.setItem(STORAGE_KEYS.TOKEN, token);
```

### 十、在 Vue 3 中的使用

#### 1. 组合式 API 封装

```js
// composables/useStorage.js
import { ref, watch } from 'vue';

/**
 * 响应式的 localStorage / sessionStorage
 * @param {string} key - 存储键名
 * @param {*} defaultValue - 默认值
 * @param {object} options - 配置项
 */
export function useStorage(key, defaultValue, options = {}) {
  const {
    storage = localStorage,
    watch: shouldWatch = true,
  } = options;

  // 读取初始值
  const readValue = () => {
    try {
      const raw = storage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const data = ref(readValue());

  // 写入
  const write = (value) => {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage 写入失败:', e);
    }
  };

  // 监听变化，自动同步
  if (shouldWatch) {
    watch(data, (newVal) => {
      write(newVal);
    }, { deep: true });
  }

  // 监听其他标签页的变化
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === key && e.newValue !== null) {
        data.value = JSON.parse(e.newValue);
      }
    });
  }

  // 删除
  const remove = () => {
    storage.removeItem(key);
    data.value = defaultValue;
  };

  return { data, remove };
}
```

```vue
<!-- 在组件中使用 -->
<script setup>
import { useStorage } from '@/composables/useStorage';

// 响应式主题：修改 data.value 即自动持久化
const { data: theme, remove: removeTheme } = useStorage('app_theme', 'light');

// 响应式购物车
const { data: cart } = useStorage('app_cart', [], { storage: sessionStorage });

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
}
</script>

<template>
  <div :data-theme="theme">
    <button @click="toggleTheme">
      当前主题：{{ theme }}
    </button>
    <p>购物车商品数：{{ cart.length }}</p>
  </div>
</template>
```

#### 2. Pinia 持久化插件

```js
// stores/cart.js
import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useCartStore = defineStore('cart', () => {
  const items = ref(
    JSON.parse(localStorage.getItem('cart_items') || '[]')
  );

  // 自动持久化
  watch(
    items,
    (newVal) => {
      localStorage.setItem('cart_items', JSON.stringify(newVal));
    },
    { deep: true }
  );

  function addItem(product) {
    const existing = items.value.find((i) => i.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      items.value.push({ ...product, quantity: 1 });
    }
  }

  function removeItem(productId) {
    items.value = items.value.filter((i) => i.id !== productId);
  }

  return { items, addItem, removeItem };
});
```

### 十一、总结

| | localStorage | sessionStorage |
| :--: | :--: | :--: |
| 适合场景 | 持久化的用户偏好、令牌、缓存 | 临时数据、单次会话状态、表单暂存 |
| 关闭浏览器后 | ✅ 保留 | ❌ 清除 |
| 跨标签页 | ✅ 共享 | ❌ 隔离 |
| 跨标签页事件 | ✅ 触发 storage 事件 | ❌ 不触发 |
| 容量 | ~5MB | ~5MB |

**选择建议：**
- 需要在用户下次访问时仍然保留的数据 → `localStorage`
- 只在当前浏览会话中使用的数据 → `sessionStorage`
- 需要随请求发送到服务端的数据 → `Cookie`
- 大量结构化数据 → `IndexedDB`
