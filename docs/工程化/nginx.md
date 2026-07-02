# Nginx 使用详解

> 官方文档：[Nginx Documentation](https://nginx.org/en/docs/)

> 中文文档：[Nginx 中文文档](https://nginx.org/cn/docs/)

---

## 一、Nginx 是什么

Nginx（engine-x）是一款高性能的**开源 Web 服务器 / 反向代理服务器**，同时也可用作邮件代理（IMAP/POP3）和通用的 TCP/UDP 代理。

```
┌─ Nginx 的核心能力 ──────────────────────────────────────────────┐
│                                                                  │
│  ┌─ Web 服务器 ──────┐  ┌─ 反向代理 ──────┐  ┌─ 负载均衡 ──┐  │
│  │ 静态资源托管       │  │ 请求转发         │  │ 多后端分发   │  │
│  │ HTML/CSS/JS/图片   │  │ API 代理         │  │ 轮询/权重    │  │
│  │ Gzip 压缩          │  │ 跨域处理         │  │ 健康检查     │  │
│  └───────────────────┘  └─────────────────┘  └────────────┘  │
│                                                                  │
│  ┌─ 安全防护 ────────┐  ┌─ 缓存 ──────────┐  ┌─ 其他 ──────┐  │
│  │ HTTPS / SSL       │  │ 静态资源缓存     │  │ 虚拟主机     │  │
│  │ 访问控制          │  │ 代理缓存         │  │ URL 重写     │  │
│  │ 限流防刷           │  │ 浏览器缓存策略   │  │ 日志管理     │  │
│  └───────────────────┘  └─────────────────┘  └────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

> **通俗理解**：Nginx 就像一栋办公楼的"前台接待"——外部请求先到前台，前台根据规则决定把请求转给哪个部门（后端服务器）、或者直接回答（静态资源）、或者挡回去（访问控制）。

### 核心配置速览：必须 vs 按需（先看这个）

> 面对上百条 Nginx 指令，先搞清「**哪些不配会出事**」「**哪些配了锦上添花**」。下表按重要程度分级，每条给出作用与**配置后的效果现象**。

**🔴 必须配置（不配会有功能/安全问题）**

| 指令 | 所在块 | 作用 | 不配的后果 / 配置后现象 |
|------|--------|------|------------------------|
| `listen` | server | 监听端口 | 不配 Nginx 不知道在哪接请求 |
| `server_name` | server | 匹配域名 | 多站点不配则全部命中默认 server |
| `root` / `alias` | server / location | 静态文件根目录 | 静态托管不配 → 404 |
| `proxy_pass` | location | 反向代理目标 | 代理场景不配等于没代理 |
| `try_files` | location | SPA 路由回退 | 不配 → Vue/React history 路由刷新 404 |
| `ssl_certificate` / `ssl_certificate_key` | server | HTTPS 证书 | 开 HTTPS 不配 → 启动报错 |
| `error_log` | 全局 / http | 错误日志 | 不配 → 出问题无迹可查 |

**🟡 强烈建议（生产环境基本都配）**

| 指令 | 作用 | 配置后效果现象 |
|------|------|----------------|
| `worker_processes auto` | worker 数 = CPU 核数 | `ps -ef \| grep nginx` 看到 N 个 worker，CPU 利用更充分 |
| `sendfile on` | 零拷贝传文件 | 静态文件传输更快、CPU 占用低 |
| `gzip on` | 响应压缩 | 响应体缩小 60%~80%，响应头出现 `Content-Encoding: gzip` |
| `expires 1y` + `immutable` | 静态资源长缓存 | 二次访问状态码变为 `200 (disk cache)`，不再发请求 |
| `server_tokens off` | 隐藏版本号 | 响应头 `Server` 不再显示具体版本（更安全） |
| `client_max_body_size` | 请求体大小限制 | 默认 1m，上传大文件不调大 → `413 Request Entity Too Large` |
| `keepalive_timeout` | 长连接超时 | 复用 TCP 连接，减少重复握手 |
| `add_header HSTS` | 强制 HTTPS | 浏览器后续直接走 HTTPS，防降级攻击 |

**🟢 按需配置（有对应需求才配）**

| 指令 | 何时配 |
|------|--------|
| `upstream` | 多后端做负载均衡时 |
| `ip_hash` / `least_conn` | 需要会话保持 / 最少连接策略时 |
| `limit_req_zone` / `limit_conn` | 需要限流防刷时 |
| `auth_basic` | 需要用户名密码认证时 |
| `rewrite` / `return` | 需要 URL 重写 / 重定向时 |
| CORS `add_header` | 需要处理跨域时 |
| `valid_referers`（防盗链） | 不想被别人站点盗用图片时 |
| `stub_status` | 需要监控连接数时 |

**⚪ 有合理默认（一般不用动）**

| 指令 | 默认值 | 说明 |
|------|--------|------|
| `worker_connections` | 1024 | 高并发场景调到 10240+ |
| `default_type` | application/octet-stream | 通常够用 |
| `tcp_nopush` / `tcp_nodelay` | off | 开启 sendfile 时建议打开 |
| `ssl_protocols` | TLSv1.2/1.3 | 建议显式限定，禁用旧版本 |
| `keepalive_timeout` | 75s | 一般够用 |

> 💡 **记忆口诀**：🔴 必须配（让它能跑且不出事）→ 🟡 建议配（让它跑得快又安全）→ 🟢 按需配（满足特殊需求）→ ⚪ 不用动（默认就挺好）。

> ⚠️ **注意**：`gzip_comp_level` 不是越大越好（推荐 5）；`gzip_types` 别加图片/视频（已压缩，无效还费 CPU）；`location` 匹配有优先级，正则可能覆盖你的意图。

---

## 二、安装与常用命令

### 安装

```bash
# macOS
brew install nginx

# Ubuntu / Debian
sudo apt update
sudo apt install nginx

# CentOS / RHEL
sudo yum install nginx

# Docker
docker run -d --name nginx -p 80:80 -p 443:443 nginx:latest
```

### 常用命令

```bash
# 启动
nginx
sudo systemctl start nginx

# 停止
nginx -s stop              # 立即停止
nginx -s quit              # 优雅停止（处理完当前请求后停止）
sudo systemctl stop nginx

# 重新加载配置（不中断服务，最常用）
nginx -s reload
sudo systemctl reload nginx

# 重启
sudo systemctl restart nginx

# 检查配置文件语法
nginx -t                   # 测试默认配置
nginx -t -c /path/to/nginx.conf  # 测试指定配置

# 查看版本
nginx -v                   # 版本号
nginx -V                   # 版本号 + 编译参数

# 查看帮助
nginx -h
```

### 配置文件位置

| 系统 | 路径 |
|------|------|
| macOS（brew） | `/opt/homebrew/etc/nginx/nginx.conf` |
| Linux | `/etc/nginx/nginx.conf` |
| Docker | `/etc/nginx/nginx.conf` |

---

## 三、配置文件结构

### 整体结构

```nginx
# ─── 全局块 ────────────────────────────────────
user  nginx;                    # 运行用户
worker_processes  auto;         # Worker 进程数
error_log  /var/log/nginx/error.log warn;  # 错误日志
pid        /var/run/nginx.pid;  # PID 文件

# ─── events 块 ─────────────────────────────────
events {
    worker_connections  1024;   # 每个 Worker 的最大连接数
}

# ─── http 块 ───────────────────────────────────
http {
    include       mime.types;          # MIME 类型映射
    default_type  application/octet-stream;

    # 日志格式
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;          # 零拷贝传输
    tcp_nopush      on;          # 优化 TCP 包发送
    tcp_nodelay     on;          # 禁用 Nagle 算法
    keepalive_timeout  65;       # 长连接超时

    # Gzip 压缩
    gzip  on;

    # ─── server 块（虚拟主机）───────────────────
    server {
        listen       80;
        server_name  localhost;

        location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
        }
    }

    # 可以有多个 server 块
    # include /etc/nginx/conf.d/*.conf;  ← 引入额外配置
}
```

### 配置层级关系

```
nginx.conf
│
├── 全局块（main）          ← 进程、日志、PID 等全局配置
│
├── events 块               ← 网络连接相关配置
│
└── http 块                 ← HTTP 服务相关配置
    │
    ├── http 全局配置        ← MIME、日志、压缩等
    │
    └── server 块            ← 虚拟主机（可多个）
        │
        └── location 块      ← 路由规则（可多个）
```

---

## 四、全局块指令详解

| 指令 | 说明 | 示例 |
|------|------|------|
| `user` | Worker 进程的运行用户 | `user nginx;` |
| `worker_processes` | Worker 进程数量 | `worker_processes auto;`（自动 = CPU 核数） |
| `error_log` | 错误日志路径和级别 | `error_log /var/log/nginx/error.log warn;` |
| `pid` | 存放主进程 PID 的文件 | `pid /var/run/nginx.pid;` |
| `worker_rlimit_nofile` | Worker 进程最大打开文件数 | `worker_rlimit_nofile 65535;` |

**日志级别**（从低到高）：`debug` → `info` → `notice` → `warn` → `error` → `crit` → `alert` → `emerg`

```nginx
# 推荐的全局配置
user  nginx;
worker_processes  auto;
worker_rlimit_nofile  65535;

error_log  /var/log/nginx/error.log  warn;
pid        /var/run/nginx.pid;
```

> **效果现象**：`worker_processes auto` 后，`ps -ef | grep nginx` 可见 master + N 个 worker（N = CPU 核数）；`worker_rlimit_nofile 65535` 后，`cat /proc/$(pgrep -f 'nginx: worker')/limits` 能查到提升后的句柄上限；`error_log warn` 使日志只记录警告及以上，磁盘占用比 `info` 明显降低。

| 指令 | 必/选 | 不配或配错的现象 |
|------|-------|------------------|
| `worker_processes` | 🟡 建议 | 默认 1，多核机器只用单核 |
| `error_log` | 🔴 必须 | 故障无日志可查 |
| `pid` | ⚪ 默认 | 用默认值即可 |
| `user` | 🔧 按需 | 权限不对 → 403 / 启动失败 |
| `worker_rlimit_nofile` | 🟢 按需 | 高并发不调 → `Too many open files` |
```

---

## 五、events 块指令详解

| 指令 | 说明 | 示例 |
|------|------|------|
| `worker_connections` | 每个 Worker 的最大并发连接数 | `worker_connections 1024;` |
| `use` | 事件驱动模型 | `use epoll;`（Linux 推荐） |
| `multi_accept` | 是否一次性接受所有连接 | `multi_accept on;` |
| `accept_mutex` | 是否启用连接互斥锁（惊群问题） | `accept_mutex on;` |

```nginx
events {
    use               epoll;          # Linux 高性能事件模型
    worker_connections 10240;         # 单个 Worker 最大连接数
    multi_accept      on;             # 一次性接受所有新连接
}
```

> **最大并发连接数** = `worker_processes × worker_connections`

> **效果现象**：`use epoll` 让单个 worker 同时处理数千连接（Linux 推荐）；`worker_connections 10240` 配合 `worker_processes auto`，整机可承载「核数 × 10240」并发连接；`multi_accept on` 时一次冲击能接收所有新连接，减少突发下的连接丢失。

| 指令 | 必/选 | 说明 |
|------|-------|------|
| `worker_connections` | 🟡 建议 | 默认 1024，高并发必须调大 |
| `use` | 🟢 按需 | Nginx 通常自动选最优（Linux 自动 epoll），多数情况不用显式写 |
| `multi_accept` | ⚪ 默认 | 高并发突发连接场景可开 |
| `accept_mutex` | ⚪ 默认 | 用于解决惊群，现代 Nginx 默认已处理 |

---

## 六、http 块指令详解

### 基础配置

| 指令 | 说明 | 默认值 |
|------|------|--------|
| `include` | 引入外部配置文件 | — |
| `default_type` | 默认 MIME 类型 | `application/octet-stream` |
| `sendfile` | 是否使用零拷贝传输文件 | `off` |
| `tcp_nopush` | 在 sendfile 开启时优化 TCP 包发送 | `off` |
| `tcp_nodelay` | 禁用 Nagle 算法，减少延迟 | — |
| `keepalive_timeout` | 长连接超时时间（秒） | `75s` |
| `client_max_body_size` | 客户端请求体最大大小 | `1m` |
| `server_tokens` | 是否在响应头中显示 Nginx 版本 | `on`（建议 `off`） |

```nginx
http {
    include       mime.types;
    default_type  application/octet-stream;

    sendfile      on;
    tcp_nopush    on;
    tcp_nodelay   on;

    keepalive_timeout  65;

    # 上传文件大小限制
    client_max_body_size  50m;

    # 隐藏 Nginx 版本号（安全）
    server_tokens  off;

    # 连接超时
    client_body_timeout     12;
    client_header_timeout    12;
    send_timeout             10;
}
```

> **效果现象**：
> - `sendfile on` → 静态文件传输不经用户态，CPU 占用下降、吞吐上升
> - `client_max_body_size 50m` → 上传 50MB 内文件正常；超过 → `413 Request Entity Too Large`
> - `server_tokens off` → 响应头 `Server: nginx`（不再带版本号）
> - `keepalive_timeout 65` → 同一客户端后续请求复用 TCP 连接（抓包看不到重复三次握手）

| 指令 | 必/选 | 说明 |
|------|-------|------|
| `include mime.types` | 🔴 必须 | 否则浏览器按二进制流处理 CSS/JS，页面样式失效 |
| `default_type` | ⚪ 默认 | 兜底 MIME 类型 |
| `sendfile` | 🟡 建议 | 静态资源性能关键，建议 on |
| `tcp_nopush` / `tcp_nodelay` | 🟢 按需 | 开 sendfile 时配合打开 |
| `keepalive_timeout` | 🟡 建议 | 复用连接，减少握手 |
| `client_max_body_size` | 🔴 按需但重要 | 有上传功能必须调大，否则 413 |
| `server_tokens` | 🟡 建议 | 安全，建议 off |
| `*_timeout`（body/header/send） | 🟢 按需 | 防慢客户端长期占用连接 |
```

### Gzip 压缩

```nginx
http {
    # 开启 Gzip
    gzip  on;

    # 最小压缩阈值（小于此大小不压缩）
    gzip_min_length  1k;

    # 压缩缓冲区
    gzip_buffers     4 16k;

    # 压缩级别（1-9，越高压缩率越高但越慢，推荐 4-6）
    gzip_comp_level  5;

    # 压缩的 MIME 类型
    gzip_types
        text/plain
        text/css
        text/javascript
        application/javascript
        application/json
        application/xml
        image/svg+xml;

    # 是否在响应头中添加 Vary: Accept-Encoding
    gzip_vary  on;

    # 对代理请求也压缩
    gzip_proxied  any;

    # IE6 以下不压缩
    gzip_disable  "msie6";
}
```

| 压缩级别 | 压缩率 | CPU 消耗 | 推荐场景 |
|---------|--------|---------|---------|
| 1-3 | 低 | 低 | CPU 敏感 |
| **4-6** | **中** | **中** | **大多数场景 ✅** |
| 7-9 | 高 | 高 | 静态资源预压缩 |

> **效果现象**：开启后 `curl -I -H "Accept-Encoding: gzip" <url>` 响应头出现 `content-encoding: gzip`，`content-length` 大幅减小；DevTools Network 里 JS/CSS 体积变小、加载变快。
>
> **必/选**：🟡 **强烈建议**（生产必开）
> - `gzip on` 默认是 **off**，必须显式开启
> - `gzip_types` **必须**列出要压缩的类型（默认只压 `text/html`）
> - `gzip_comp_level` 推荐 **5**
> - `gzip_min_length 1k` 过小文件不压（收益小于开销）
>
> ⚠️ **不要压** `image/jpeg` `image/png` `video/*` `application/zip` 等已压缩格式——无效还费 CPU。

---

## 七、server 块（虚拟主机）

一个 `server` 块代表一个**虚拟主机**，可以配置多个 `server` 实现多站点。

### 基本结构

```nginx
server {
    # 监听端口
    listen       80;
    # listen       443 ssl http2;

    # 域名 / 主机名
    server_name  example.com www.example.com;

    # 字符集
    charset      utf-8;

    # 访问日志
    access_log   /var/log/nginx/example.com.access.log  main;

    # 根目录
    root         /usr/share/nginx/html;

    # 默认首页
    index        index.html index.htm;

    # location 路由规则
    location / { ... }
}
```

### server_name 匹配规则

| 匹配方式 | 示例 | 优先级 |
|---------|------|--------|
| 精确匹配 | `server_name example.com;` | 1（最高） |
| 前缀通配符 | `server_name *.example.com;` | 2 |
| 后缀通配符 | `server_name example.*;` | 3 |
| 正则表达式 | `server_name ~^www\d+\.example\.com$;` | 4 |
| 默认（default） | `server_name _;` | 最低 |

> **效果现象**：`listen 80` 后，浏览器 `http://域名` 命中该 server；多个 server 共用 80 端口时，Nginx 按 `server_name` 把请求分流到不同 server 块（虚拟主机）；不匹配任何 server_name 的请求会落到「默认 server」（标记 `default_server` 或第一个 server）。

| 指令 | 必/选 | 说明 |
|------|-------|------|
| `listen` | 🔴 必须 | 不配 → Nginx 不知在哪接请求 |
| `server_name` | 🟡 建议 | 单站点可省（默认 `_`）；多站点必须，否则全进默认 server |
| `root` / `index` | 🔴 必须（静态托管） | 不配 → 找不到文件、404 |
| `access_log` | 🟢 按需 | 默认记到全局 access.log，多站点建议分开记 |
| `charset` | ⚪ 默认 | 中文站点建议显式 `utf-8` |

---

## 八、location 块（路由规则）

`location` 是 Nginx 配置的核心，定义了**如何处理不同的 URL 请求**。

### 匹配语法

```nginx
location [修饰符] /uri/ {
    # 处理规则
}
```

| 修饰符 | 含义 | 匹配方式 | 优先级 |
|--------|------|---------|--------|
| `=` | 精确匹配 | 完全相等时匹配 | 1（最高） |
| `^~` | 前缀匹配 | 匹配后不再检查正则 | 2 |
| `~` | 正则匹配（区分大小写） | 正则表达式 | 3 |
| `~*` | 正则匹配（不区分大小写） | 正则表达式 | 4 |
| 无 | 普通前缀匹配 | 最长前缀匹配 | 5（最低） |

### 匹配优先级示例

```nginx
server {
    listen 80;

    # ① 精确匹配 —— 最高优先级
    location = / {
        # 只匹配 /
    }

    # ② 前缀匹配（优先于正则）
    location ^~ /images/ {
        # 匹配 /images/ 开头的所有请求
        # 匹配后不再检查正则
    }

    # ③ 正则匹配（区分大小写）
    location ~ \.php$ {
        # 匹配所有 .php 结尾的请求
    }

    # ④ 正则匹配（不区分大小写）
    location ~* \.(jpg|png|gif)$ {
        # 匹配所有 .jpg/.png/.gif 结尾的请求（不区分大小写）
    }

    # ⑤ 普通前缀匹配
    location / {
        # 匹配所有未被上面规则匹配的请求
    }

    # ⑥ 普通前缀匹配（更长前缀优先）
    location /api/ {
        # 匹配 /api/ 开头的请求
    }
}
```

### location 内常用指令

| 指令 | 说明 | 示例 |
|------|------|------|
| `root` | 资源根目录 | `root /usr/share/nginx/html;` |
| `alias` | 路径别名 | `alias /data/images/;` |
| `index` | 默认首页 | `index index.html;` |
| `proxy_pass` | 反向代理目标地址 | `proxy_pass http://backend;` |
| `try_files` | 按顺序查找文件 | `try_files $uri $uri/ /index.html;` |
| `return` | 直接返回响应 | `return 301 https://$host$request_uri;` |
| `rewrite` | URL 重写 | `rewrite ^/old(.*)$ /new$1 permanent;` |
| `limit_rate` | 限制响应速率 | `limit_rate 100k;` |

### root 与 alias 的区别

```nginx
# root —— 拼接路径
# 请求: /images/logo.png
# 实际: /usr/share/nginx/html/images/logo.png
location /images/ {
    root /usr/share/nginx/html;
}

# alias —— 替换路径
# 请求: /images/logo.png
# 实际: /data/static/logo.png（/images/ 被替换为 /data/static/）
location /images/ {
    alias /data/static/;
}
```

| 维度 | `root` | `alias` |
|------|--------|---------|
| 路径处理 | **拼接**到 root 后面 | **替换** location 路径 |
| 末尾斜杠 | 不影响 | **alias 必须以 `/` 结尾** |
| 适用场景 | 一般静态资源 | 精确映射目录 |

### try_files —— SPA 路由兜底

```nginx
# Vue / React 单页应用（SPA）的通用配置
location / {
    root   /usr/share/nginx/html;
    index  index.html;
    try_files $uri $uri/ /index.html;
    # 查找顺序：
    # 1. 请求的文件是否存在（$uri）
    # 2. 请求的目录是否存在（$uri/）
    # 3. 以上都不存在，返回 index.html（交给前端路由处理）
}
```

> **必/选**：
> - `location /` 🟡 几乎必写（兜底路由）
> - `try_files` 🔴 **SPA 必须配**，否则 history 路由刷新 404
> - `root` / `alias` 🔴 二选一（静态资源必须有一个）
> - `proxy_pass` 🔴 反向代理场景必须
> - `rewrite` / `return` 🟢 按需
>
> ⚠️ **注意修饰符优先级**：`=` > `^~` > `~`/`~*` > 无。写错修饰符会让请求落到错误的 location——例如一个过宽的正则可能「吞掉」本该走静态资源或 API 代理的请求。
```

---

## 九、反向代理

### 正向代理 vs 反向代理

```
正向代理（代理客户端）：
  客户端 → [代理服务器] → 目标服务器
  服务器不知道真正的客户端是谁（VPN、科学上网）

反向代理（代理服务器端）：
  客户端 → [Nginx] → 后端服务器1 / 后端服务器2
  客户端不知道真正的后端服务器是谁
```

### 基本反向代理配置

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://localhost:3000;   # 代理到 Node.js 服务
    }

    # 代理到不同路径
    location /api/ {
        proxy_pass http://localhost:8080;   # 代理到 Java 服务
    }

    location /ws/ {
        proxy_pass http://localhost:9000;   # 代理到 WebSocket 服务
    }
}
```

### 代理头信息传递

```nginx
location /api/ {
    proxy_pass http://localhost:8080;

    # 传递真实客户端信息
    proxy_set_header  Host              $host;
    proxy_set_header  X-Real-IP         $remote_addr;
    proxy_set_header  X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header  X-Forwarded-Proto $scheme;

    # 超时设置
    proxy_connect_timeout  60s;          # 连接超时
    proxy_send_timeout     60s;          # 发送超时
    proxy_read_timeout     120s;         # 读取超时

    # 缓冲设置
    proxy_buffering        on;           # 开启缓冲
    proxy_buffer_size      4k;           # 缓冲区大小
    proxy_buffers          8 4k;         # 缓冲区数量和大小
}
```

| 指令 | 说明 |
|------|------|
| `proxy_set_header Host` | 传递原始请求的 Host 头 |
| `proxy_set_header X-Real-IP` | 传递客户端真实 IP |
| `proxy_set_header X-Forwarded-For` | 传递代理链中的所有 IP |
| `proxy_set_header X-Forwarded-Proto` | 传递原始协议（http/https） |

### WebSocket 代理

```nginx
location /ws/ {
    proxy_pass http://localhost:9000;

    # WebSocket 必需配置
    proxy_http_version  1.1;
    proxy_set_header  Upgrade    $http_upgrade;
    proxy_set_header  Connection "upgrade";

    # 超时（WebSocket 长连接）
    proxy_read_timeout  3600s;
    proxy_send_timeout  3600s;
}
```

### proxy_pass 末尾斜杠的区别

```nginx
# 有斜杠 —— 替换 location 路径
location /api/ {
    proxy_pass http://backend/;
    # 请求 /api/users → 转发为 /users（/api/ 被替换为 /）
}

# 无斜杠 —— 拼接完整路径
location /api/ {
    proxy_pass http://backend;
    # 请求 /api/users → 转发为 /api/users（保留原始路径）
}
```

> **效果现象**：配置后浏览器请求 `/api/users` 由 Nginx 转发到后端，地址栏 URL 不变；后端日志里 `remote_addr` 默认是 **Nginx 的 IP**（要拿真实客户端 IP，必须配 `X-Forwarded-For` 并在后端读取该头）。

| 指令 | 必/选 | 说明 |
|------|-------|------|
| `proxy_pass` | 🔴 必须 | 不配等于没代理 |
| `proxy_set_header Host` | 🟡 建议 | 传原始 Host，否则后端拿到的是后端地址 |
| `proxy_set_header X-Real-IP` | 🟡 建议 | 传真实客户端 IP |
| `proxy_set_header X-Forwarded-For` | 🟡 建议 | 传代理链路 IP |
| `proxy_*_timeout` | 🟢 按需 | 默认 60s，慢接口要调大 |
| `proxy_buffering` | ⚪ 默认 | 默认 on；流式响应（SSE）要关 |

> ⚠️ **末尾斜杠是反向代理的头号坑**：带 `/` 会**替换** location 路径，不带 `/` 会**保留**。务必和后端接口路径对齐（后端接口是否带 `/api` 前缀决定你怎么写）。
```

---

## 十、负载均衡

### upstream 配置

```nginx
# 定义后端服务器组
upstream backend {
    # 负载均衡策略（默认轮询）
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
    server 192.168.1.103:8080  backup;  # 备用服务器
}

server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://backend;
    }
}
```

### 负载均衡策略

```nginx
# ① 轮询（默认）—— 依次分配
upstream backend {
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
}

# ② 加权轮询 —— 权重越高分配越多
upstream backend {
    server 192.168.1.101:8080  weight=5;   # 5/8 的请求
    server 192.168.1.102:8080  weight=3;   # 3/8 的请求
}

# ③ IP Hash —— 同一 IP 始终分配到同一服务器（会话保持）
upstream backend {
    ip_hash;
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
}

# ④ 最少连接 —— 优先分配给连接数最少的服务器
upstream backend {
    least_conn;
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
}

# ⑤ URL Hash —— 同一 URL 分配到同一服务器（缓存友好）
upstream backend {
    hash $request_uri consistent;
    server 192.168.1.101:8080;
    server 192.168.1.102:8080;
}
```

| 策略 | 指令 | 适用场景 |
|------|------|---------|
| 轮询 | （默认） | 无状态服务，服务器性能相近 |
| 加权轮询 | `weight=n` | 服务器性能不均 |
| IP Hash | `ip_hash` | 需要会话保持 |
| 最少连接 | `least_conn` | 请求处理时间差异大 |
| URL Hash | `hash $uri` | 需要缓存命中 |

> **效果现象**：`upstream` 多台后端时，请求被分发到不同后端（后端日志可见来源都是 Nginx 的 IP）；某台配 `max_fails=3 fail_timeout=30s` 连续失败 3 次后，30 秒内 Nginx 不再向它分发请求（自动故障转移）。

| 指令 | 必/选 | 说明 |
|------|-------|------|
| `upstream` + `server` | 🔴 必须 | 多后端负载均衡的前提 |
| 策略（轮询/权重/ip_hash/least_conn） | 🟢 按需 | 不写默认轮询；按业务选 |
| `backup` | 🟢 按需 | 备用机，主节点全挂才启用 |
| `max_fails` / `fail_timeout` | 🟡 建议 | 故障转移，生产建议配 |
| `ip_hash` | 🟢 按需 | 会话保持；副作用：节点变动时 hash 重分布、用户掉线 |

> 💡 **会话保持的现代做法**：优先用 Token / Redis 共享 Session，而非依赖 `ip_hash`（后者在后端扩缩容时会导致大量用户会话失效）。

### 健康检查与故障转移

```nginx
upstream backend {
    server 192.168.1.101:8080  max_fails=3  fail_timeout=30s;
    server 192.168.1.102:8080  max_fails=3  fail_timeout=30s;
    server 192.168.1.103:8080  backup;      # 所有主服务器不可用时启用
}

# max_fails      —— 最大失败次数（默认 1）
# fail_timeout   —— 失败后暂停时间（默认 10s）
# backup         —— 备用服务器
# down           —— 标记为不可用
```

---

## 十一、HTTPS / SSL 配置

### 基本 HTTPS 配置

```nginx
server {
    listen       443 ssl http2;                # 启用 SSL 和 HTTP/2
    server_name  example.com;

    # SSL 证书路径
    ssl_certificate      /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key  /etc/nginx/ssl/privkey.pem;

    # SSL 协议版本
    ssl_protocols  TLSv1.2 TLSv1.3;

    # 加密套件
    ssl_ciphers  ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers  on;

    # SSL 会话缓存
    ssl_session_cache    shared:SSL:10m;      # 10MB 缓存（约 4 万个会话）
    ssl_session_timeout  10m;                 # 会话超时 10 分钟

    # OCSP Stapling（在线证书状态检查）
    ssl_stapling          on;
    ssl_stapling_verify   on;
    resolver              8.8.8.8 8.8.4.4 valid=300s;

    location / {
        root  /usr/share/nginx/html;
        index index.html;
    }
}
```

### HTTP 自动跳转 HTTPS

```nginx
# HTTP → HTTPS 301 重定向
server {
    listen       80;
    server_name  example.com;
    return       301 https://$host$request_uri;
}

# 或者使用 rewrite
server {
    listen       80;
    server_name  example.com;
    rewrite ^(.*)$ https://$host$1 permanent;
}
```

> **效果现象**：配置后浏览器地址栏出现 🔒；`curl -vI https://域名` 可见 TLS 握手与证书信息；`ssl_session_cache` 让重复连接的握手开销显著降低；加上 HSTS 头后浏览器后续直接走 HTTPS（即使输入 http 也自动跳转）。

| 指令 | 必/选 | 说明 |
|------|-------|------|
| `listen 443 ssl` | 🔴 必须 | 开启 SSL 监听 |
| `ssl_certificate` / `ssl_certificate_key` | 🔴 必须 | 证书与私钥，没有无法启动 HTTPS |
| `ssl_protocols` | 🟡 建议 | 显式限定 TLSv1.2/1.3，禁用不安全旧版本 |
| `ssl_ciphers` | 🟢 按需 | 默认已合理，特殊合规要求才调 |
| `ssl_session_cache` / `ssl_session_timeout` | 🟡 建议 | 缓存会话，加速重复握手 |
| `ssl_stapling` | 🟢 按需 | OCSP 装订，提升证书验证速度 |
| HSTS 头 | 🟡 建议 | 强制 HTTPS，防降级攻击 |

> 💡 **证书来源**：免费用 Let's Encrypt（`certbot --nginx -d 域名` 自动申请 + 续期），或用云厂商免费 DV 证书。证书过期（Let's Encrypt 90 天）**必须续期**，否则站点报证书错误打不开。
```

---

## 十二、静态资源与缓存

### 静态资源托管

```nginx
server {
    listen       80;
    server_name  static.example.com;

    root         /data/static;

    # 静态资源缓存策略
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        expires     30d;                     # 图片缓存 30 天
        add_header  Cache-Control "public, immutable";
        access_log  off;                     # 不记录静态资源日志
    }

    location ~* \.(css|js)$ {
        expires     7d;                      # CSS/JS 缓存 7 天
        add_header  Cache-Control "public";
        access_log  off;
    }

    location ~* \.(woff|woff2|ttf|otf|eot)$ {
        expires     180d;                    # 字体缓存 180 天
        add_header  Cache-Control "public, immutable";
        access_log  off;
    }

    # 禁止缓存 HTML（确保用户获取最新版本）
    location ~* \.html$ {
        add_header  Cache-Control "no-cache, no-store, must-revalidate";
        add_header  Pragma "no-cache";
    }
}
```

> **效果现象**：图片/字体配 `expires 30d` + `immutable` 后，浏览器二次请求该资源状态码变为 `200 (disk cache)`、**完全不发网络请求**；HTML 配 `no-cache` 则每次都向服务器验证，保证用户拿到最新版本。

| 指令 | 必/选 | 说明 |
|------|-------|------|
| `expires` | 🟡 建议 | 设强缓存时间 |
| `add_header Cache-Control` | 🟡 建议 | `public, immutable` 用于带 hash 的不变资源 |
| HTML `no-cache` | 🔴 SPA 必配 | 入口 HTML 必须每次取最新，否则用户卡在旧版本 |
| 静态资源 `immutable` | 🟡 建议 | 带 hash 的文件可放心长缓存 |

> 💡 **核心法则**：**带 hash 的静态资源（js/css/图片）长缓存 + immutable，index.html 永不缓存**——同时满足「加载快」和「更新生效」。
```

### SPA 前端项目完整配置

```nginx
server {
    listen       80;
    server_name  www.example.com;
    root         /usr/share/nginx/html;
    index        index.html;
    charset      utf-8;

    # Gzip 压缩
    gzip             on;
    gzip_min_length  1k;
    gzip_comp_level  5;
    gzip_types       text/plain text/css application/javascript application/json;

    # SPA 路由兜底
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源长缓存（文件名含 hash）
    location /assets/ {
        expires    1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # API 代理
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

---

## 十三、URL 重写（rewrite）

### 语法

```nginx
rewrite regex replacement [flag];
```

| flag | 说明 |
|------|------|
| `last` | 停止当前 rewrite 检测，重新发起 location 匹配 |
| `break` | 停止当前 rewrite 检测，继续执行当前 location |
| `redirect` | 返回 302 临时重定向 |
| `permanent` | 返回 301 永久重定向 |

### 常用示例

```nginx
server {
    # 域名重定向
    rewrite ^ http://www.example.com$request_uri permanent;

    # HTTP → HTTPS
    rewrite ^(.*)$ https://$host$1 permanent;

    # 旧路径 → 新路径
    rewrite ^/old-page/(.*)$ /new-page/$1 permanent;

    # 去除 www（用命名捕获 ?<domain>，避免 $1 被 rewrite 自身正则覆盖）
    if ($host ~* ^www\.(?<domain>.+)$) {
        return 301 $scheme://$domain$request_uri;
    }

    # 去除末尾斜杠（SEO 优化）
    rewrite ^/(.*)/$ /$1 permanent;
}
```

### return 指令（更简洁的重定向方式）

```nginx
# 301 永久重定向
return 301 https://$host$request_uri;

# 302 临时重定向
return 302 /maintenance.html;

# 返回状态码和内容
return 403 "Access Denied";
return 200 "OK";
```

---

## 十四、安全配置

### 访问控制

```nginx
# IP 白名单
location /admin/ {
    allow 192.168.1.0/24;     # 允许内网
    allow 10.0.0.1;           # 允许特定 IP
    deny all;                  # 拒绝其他所有
}

# 基础认证（用户名密码）
location /admin/ {
    auth_basic           "Admin Area";
    auth_basic_user_file /etc/nginx/.htpasswd;
}

# 生成密码文件：htpasswd -c /etc/nginx/.htpasswd admin
```

### 防盗链

```nginx
location ~* \.(jpg|jpeg|png|gif|webp|mp4)$ {
    valid_referers none blocked server_names *.example.com example.com;
    if ($invalid_referer) {
        return 403;
        # 或返回防盗链图片：
        # rewrite ^(.*)$ /static/hotlink-denied.png break;
    }
}
```

### 限流防刷

```nginx
# 在 http 块中定义限流区域
http {
    # 按 IP 限制请求速率（每秒 10 个请求）
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

    # 按 IP 限制并发连接数
    limit_conn_zone $binary_remote_addr zone=conn_limit:10m;
}

server {
    location /api/ {
        # 应用限流
        limit_req zone=api_limit burst=20 nodelay;
        # burst=20    —— 允许突发 20 个请求排队
        # nodelay     —— 突发请求不延迟处理

        # 并发连接限制
        limit_conn zone=conn_limit 20;
        # 每个 IP 最多 20 个并发连接

        proxy_pass http://backend;
    }
}
```

### 安全头设置

```nginx
server {
    # 防止 MIME 类型嗅探
    add_header X-Content-Type-Options "nosniff" always;

    # XSS 防护
    add_header X-XSS-Protection "1; mode=block" always;

    # 防止点击劫持
    add_header X-Frame-Options "SAMEORIGIN" always;

    # HSTS（强制 HTTPS）
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # CSP（内容安全策略）
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'" always;

    # 隐藏 Nginx 版本
    server_tokens off;
}
```

| 配置 | 必/选 | 说明 |
|------|-------|------|
| `server_tokens off` | 🟡 建议 | 隐藏版本号，减少被针对性攻击的信息 |
| `X-Content-Type-Options nosniff` | 🟡 建议 | 防 MIME 嗅探 |
| `X-Frame-Options` | 🟡 建议 | 防点击劫持（要被第三方嵌入则需放开） |
| HSTS | 🟡 建议（HTTPS 站） | 强制 HTTPS，防降级 |
| CSP | 🟢 按需 | 最强的内容安全策略，但配置成本高 |
| IP 白名单 / `auth_basic` | 🟢 按需 | 后台、管理接口建议加 |
| 限流 `limit_req` | 🟢 按需 | 公开 API、登录接口建议加 |
| 防盗链 `valid_referers` | 🟢 按需 | 图片/视频资源站建议加 |

> 💡 **最低成本建议**：至少配齐 `server_tokens off` + 三个基础安全头（`nosniff` / `X-Frame-Options` / HSTS），几乎零成本、收益明显。
```

---

## 十五、日志管理

### 日志格式

```nginx
http {
    # 自定义日志格式
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    log_format  json  escape=json
                      '{'
                        '"time":"$time_iso8601",'
                        '"remote_addr":"$remote_addr",'
                        '"request":"$request",'
                        '"status":$status,'
                        '"body_bytes_sent":$body_bytes_sent,'
                        '"request_time":$request_time,'
                        '"http_referer":"$http_referer",'
                        '"http_user_agent":"$http_user_agent"'
                      '}';

    access_log  /var/log/nginx/access.log  main;
    # access_log /var/log/nginx/access.json.log  json;
}
```

### 常用日志变量

| 变量 | 说明 |
|------|------|
| `$remote_addr` | 客户端 IP |
| `$remote_user` | 认证用户名 |
| `$time_local` | 请求时间 |
| `$request` | 请求方法和 URL |
| `$status` | 响应状态码 |
| `$body_bytes_sent` | 响应体大小 |
| `$http_referer` | 来源页面 |
| `$http_user_agent` | 客户端 UA |
| `$request_time` | 请求处理总时间 |
| `$upstream_response_time` | 后端响应时间 |

---

## 十六、跨域配置（CORS）

```nginx
server {
    location /api/ {
        # 允许的源
        add_header Access-Control-Allow-Origin "https://www.example.com" always;
        # 或者允许所有源（不推荐生产环境）
        # add_header Access-Control-Allow-Origin "*" always;

        # 允许的方法
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;

        # 允许的请求头
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;

        # 允许携带凭证（Cookie）
        add_header Access-Control-Allow-Credentials "true" always;

        # 预检请求缓存时间
        add_header Access-Control-Max-Age 3600 always;

        # 处理 OPTIONS 预检请求
        if ($request_method = OPTIONS) {
            return 204;
        }

        proxy_pass http://backend;
    }
}
```

---

## 十七、常见配置模板

### 完整的前端项目部署配置

```nginx
# HTTP → HTTPS 重定向
server {
    listen       80;
    server_name  www.example.com;
    return 301 https://$host$request_uri;
}

# HTTPS 主配置
server {
    listen       443 ssl http2;
    server_name  www.example.com;

    # SSL 证书
    ssl_certificate      /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key  /etc/nginx/ssl/privkey.pem;
    ssl_protocols        TLSv1.2 TLSv1.3;

    # 网站根目录
    root  /usr/share/nginx/html;
    index index.html;

    # 安全头
    add_header X-Frame-Options        "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff"    always;
    add_header Strict-Transport-Security "max-age=31536000" always;
    server_tokens off;

    # Gzip 压缩
    gzip            on;
    gzip_min_length 1k;
    gzip_comp_level 5;
    gzip_types      text/plain text/css application/javascript
                    application/json image/svg+xml;

    # SPA 路由兜底
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源长缓存
    location /assets/ {
        expires    1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 禁止访问隐藏文件
    location ~ /\. {
        deny all;
    }

    # 错误页面
    error_page 404             /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

---

## 十八、面试常见问题

### Q1：正向代理和反向代理的区别？

- **正向代理**：代理**客户端**，服务器不知道真实客户端是谁（VPN）
- **反向代理**：代理**服务器端**，客户端不知道真实服务器是谁（Nginx）

Nginx 主要用作反向代理，将客户端请求转发到后端服务器集群。

### Q2：root 和 alias 的区别？

- `root`：请求路径**拼接**到 root 后面，如 `location /img/` + `root /data` → `/data/img/xxx`
- `alias`：将 location 路径**替换**为 alias 路径，如 `location /img/` + `alias /data/` → `/data/xxx`
- `alias` 末尾**必须**加 `/`

### Q3：Nginx 如何实现负载均衡？

通过 `upstream` 定义后端服务器组，在 `proxy_pass` 中引用。支持轮询、加权、IP Hash、最少连接等策略。配合 `max_fails` 和 `fail_timeout` 实现自动故障转移。

### Q4：如何配置 Nginx 支持 SPA 前端路由？

```nginx
location / {
    root  /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
}
```
所有未匹配到静态文件的请求都返回 `index.html`，由前端路由处理。

### Q5：location 的匹配优先级是什么？

从高到低：`=`（精确匹配）> `^~`（前缀匹配）> `~` / `~*`（正则匹配）> 无修饰符（普通前缀匹配）。同一优先级中，更长的前缀优先。

### Q6：Nginx 为什么性能高？

1. **事件驱动**：基于 epoll/kqueue 的事件模型，非阻塞 I/O
2. **多进程架构**：Master 进程管理 + 多个 Worker 进程处理请求
3. **零拷贝**：`sendfile` 直接在内核空间传输文件，无需用户空间中转
4. **内存池**：高效的内存管理机制
5. **异步非阻塞**：一个 Worker 可以同时处理数千个连接

### Q7：proxy_pass 末尾带不带斜杠有什么区别？

- **带斜杠** `proxy_pass http://backend/`：将 location 匹配的路径**替换**为 proxy_pass 的路径
- **不带斜杠** `proxy_pass http://backend`：**保留**原始请求路径拼接在后面

### Q8：如何限制某个 IP 的访问频率？

```nginx
# http 块中定义限流区域
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

# server/location 中应用
limit_req zone=api burst=20 nodelay;
```
`rate=10r/s` 表示每秒最多 10 个请求，`burst=20` 允许突发排队 20 个。
