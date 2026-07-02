### 一、概述

> 📖 [try_files 指令（Nginx）](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files) ｜ [Vue Router History 模式](https://router.vuejs.org/zh/guide/essentials/history-mode.html)

Vue / React 等单页应用（SPA）使用**前端路由**，部署时最经典的一个坑就是：**首页能打开，但刷新子路由（或直接访问子路由）就报 404**。本文讲清原因和解决办法。

大白话：SPA 只有一个真实的 `index.html` 文件，所有页面（`/home`、`/user/123`）都是 JS 在浏览器里「假装」出来的。当你**直接访问** `/user/123` 时，Nginx 以为你要找服务器上的 `/user/123/index.html` 文件——但这文件根本不存在，于是返回 404。解决办法就是告诉 Nginx：**找不到文件时，统统回退到 `index.html`，让前端路由自己处理。**

| 你将学到 | 说明 |
| --- | --- |
| SPA 路由原理 | 为什么刷新会 404 |
| hash vs history | 两种路由模式 |
| try_files | Nginx 解决 404 的核心指令 |
| 其他服务器配置 | Apache、对象存储等 |

> 💡 **提示：** 这是前端部署**最常见**的坑，几乎所有新手都会遇到。一行 `try_files` 就能解决。

---

### 二、SPA 路由原理

#### 1. 单页应用只有一个 HTML

SPA（如 Vue 项目）打包后只有一个 `index.html`：

```
dist/
├── index.html        ← 唯一的真实 HTML
└── assets/...
```

页面切换（如 `/home` → `/about`）**不会真的请求新 HTML**，而是 JS 拦截 URL 变化，局部更新页面。

#### 2. history 模式下，URL 长得像真实路径

```
https://example.com/home
https://example.com/user/123
```

这些 URL **看起来像服务器上的真实路径**，但服务器上根本没有 `/home` 这个目录。

#### 3. 为什么刷新报 404

```
浏览器首次打开 example.com        → Nginx 返回 index.html ✅（首页正常）
点击导航到 /home                 → JS 拦截，前端路由处理 ✅（不请求服务器）
在 /home 按 F5 刷新              → 浏览器真的请求 example.com/home
                                  → Nginx 找 /home/index.html ❌ 不存在 → 404！
```

> 💡 **提示：** 首页能进、点链接也正常，**唯独刷新子路由 / 直接访问子路由 404**——这就是 SPA history 模式的经典症状。

---

### 三、hash 模式 vs history 模式

Vue Router（等）有两种路由模式：

| 模式 | URL 形式 | 刷新 | 服务器配置 |
| --- | --- | --- | --- |
| **hash** | `example.com/#/home` | ✅ 不 404 | 不需要 |
| **history** | `example.com/home` | ❌ 需配置 | **需要 try_files** |

#### hash 模式

```
https://example.com/#/user/123
                   ↑ # 后面叫 hash（片段标识符）
```

`#` 后面的部分**不会发给服务器**，服务器永远只看到 `example.com`，所以刷新不会 404。但 URL 不好看（有个 `#`）。

#### history 模式

```
https://example.com/user/123
```

URL 干净漂亮，但需要**服务器配合**（把所有路径回退到 index.html）。

> 💡 **提示：** 现代项目**普遍用 history 模式**（URL 干净）。代价是必须配置服务器。本文重点讲 history 的配置。

---

### 四、Nginx 解决方案：try_files

核心指令 `try_files`，作用是**按顺序尝试多个路径，都找不到就用最后一个兜底**：

```nginx
location / {
    try_files $uri $uri/ /index.html;
    #         │   │     │
    #         │   │     └─ 都找不到时，回退到 index.html（让前端路由处理）
    #         │   └─ 再找 $uri/ （作为目录）
    #         └─ 先找 $uri（原始请求，如 /assets/app.js）
}
```

#### try_files 的工作过程

```
请求 /user/123
   │
   ├─ 找 $uri：/usr/share/nginx/html/user/123      → 不存在
   ├─ 找 $uri/：/usr/share/nginx/html/user/123/    → 不存在
   └─ 回退：返回 index.html                         → ✅ 前端路由接管，显示用户页
```

```
请求 /assets/app.js
   │
   └─ 找 $uri：/usr/share/nginx/html/assets/app.js  → 存在！直接返回该 JS
```

> 💡 **提示：** `try_files` 的妙处：**真实存在的静态文件正常返回，不存在的路由路径回退到 index.html**。这样静态资源和前端路由两不误。

#### 完整配置

```nginx
server {
    listen 80;
    server_name www.example.com;
    root /usr/share/nginx/html/myapp;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 生效

```bash
sudo nginx -t
sudo nginx -s reload
```

---

### 五、try_files 的进阶写法

#### 1. 指定状态码回退

```nginx
# 如果 index.html 也不存在，返回 404 而不是死循环
try_files $uri $uri/ /index.html =404;
```

#### 2. 静态资源不走回退（优化）

把静态资源单独匹配，避免无谓的 try_files：

```nginx
# 静态资源直接找，找不到就 404（不走 index.html）
location ~* \.(js|css|png|jpg|svg|woff2?)$ {
    try_files $uri =404;
    expires 1y;
}

# 其他路由回退 index.html
location / {
    try_files $uri $uri/ /index.html;
}
```

> 💡 **提示：** 这样静态资源 404 是真 404（说明文件确实没部署上），而页面路由 404 会正确回退——**问题定位更清晰**。

---

### 六、其他服务器的等价配置

### 1. Apache（.htaccess）

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

#### 2. Vercel / Netlify（自动处理）

这些平台**自动处理 SPA 路由回退**，不用配置（这也是它们省心的原因）。

#### 3. 对象存储（OSS/S3）

对象存储默认不认 SPA 路由。需要配置「**静态网站托管**」+「**默认首页 / 错误文档都设为 index.html**」：

```
默认首页：index.html
404 错误文档：index.html   ← 关键：404 也返回 index.html
```

#### 4. Node 服务器（Express）

```javascript
// Express 配合 history 模式
app.use(express.static('dist'));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});
```

---

### 七、常见问题与注意事项

#### 1. 配了 try_files 还是 404

检查：
- `root` 路径对不对（文件实际在哪）
- `index.html` 真的在 root 目录下吗
- nginx 是否 reload

#### 2. 静态资源也被回退成 index.html

如果 `try_files` 写在最外层且静态资源路径错，会把对 `app.js` 的请求也回退成 HTML（浏览器收到 HTML 当 JS 解析，报错）。

解决：**静态资源单独 location 处理**（见上文进阶写法）。

#### 3. 二级目录部署的坑

如果项目部署在子路径（如 `example.com/myapp/`），要同时改：
- `vite.config.js` 的 `base: '/myapp/'`
- 路由的 `base`
- Nginx 的 location 和 root

```nginx
location /myapp/ {
    alias /usr/share/nginx/html/myapp/;
    try_files $uri $uri/ /myapp/index.html;
}
```

#### 4. URL 大小写

Linux 服务器文件系统**区分大小写**，URL 路径大小写要和文件一致。

#### 5. 嵌套路由 / 动态路由

无论路由多深（`/a/b/c/d`），`try_files` 都会正确回退到 index.html，前端路由自行处理。无需为每层单独配置。

---

### 八、实际应用场景

| 场景 | 配置 |
| --- | --- |
| Vue + history 路由 | `try_files $uri $uri/ /index.html` |
| React + history 路由 | 同上 |
| 用 hash 路由 | 不需要 try_files |
| 子路径部署 | 同时配 base + location |
| Vercel/Netlify | 自动处理，无需配置 |

---

### 九、总结

| 要点 | 说明 |
| --- | --- |
| 问题 | history 路由刷新子路由 404 |
| 原因 | 服务器找不到对应「文件」 |
| 解决 | `try_files $uri $uri/ /index.html` |
| hash 模式 | URL 带 #，不用配置 |
| history 模式 | URL 干净，需服务器配置 |
| 静态资源 | 单独 location，避免误回退 |

一句话：**SPA 部署用 history 路由，Nginx 加一行 `try_files $uri $uri/ /index.html` 解决 404**。

相关文档：[[Nginx部署]]、[[部署概述]]、[[反向代理与跨域]]。
