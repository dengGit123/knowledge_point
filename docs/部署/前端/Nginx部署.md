### 一、概述

> 📖 [Nginx 官方文档](https://nginx.org/en/docs/) ｜ [Nginx Beginner's Guide](https://nginx.org/en/docs/beginners_guide.html)

Nginx 是前端部署**最主流的 Web 服务器**。它接收浏览器的请求，把服务器上的静态文件（HTML/CSS/JS）返回给浏览器。本文讲清楚：怎么用 Nginx 把打包好的前端项目跑起来。

大白话：Nginx 是一个「**前台接待员**」，站在服务器门口。浏览器来要 `index.html`，它就去找 `index.html` 递出去；要 `app.js`，就找 `app.js`。你只要告诉它「文件放在哪个目录」「监听哪个端口」，它就能对外服务。

| 你将学到 | 说明 |
| --- | --- |
| 安装与目录 | Nginx 装在哪、配置文件在哪 |
| server 配置 | 监听端口、域名、根目录 |
| root vs alias | 两个易混淆的指令 |
| location 匹配 | 路由规则 |
| 部署前端 | 完整配置示例 |

> 💡 **提示：** 本文是 Nginx 基础。路由 404、压缩、HTTPS、跨域等专题见本目录其他文档。

---

### 二、安装 Nginx

#### Linux（以 Ubuntu/Debian 为例）

```bash
# 安装
sudo apt update
sudo apt install nginx

# 启动 / 停止 / 重载配置
sudo systemctl start nginx      # 启动
sudo systemctl stop nginx       # 停止
sudo systemctl reload nginx     # ✅ 改完配置重载（不停机）
sudo systemctl restart nginx    # 重启

# 设置开机自启
sudo systemctl enable nginx
```

#### CentOS / RHEL

```bash
sudo yum install nginx
sudo systemctl start nginx
```

#### 验证安装

```bash
nginx -v                # 查看版本
nginx -t                # ✅ 测试配置文件语法（改完配置必跑）
```

浏览器访问服务器 IP，看到 Nginx 欢迎页就说明装好了。

---

### 三、Nginx 目录结构

| 路径 | 说明 |
| --- | --- |
| `/etc/nginx/nginx.conf` | **主配置文件** |
| `/etc/nginx/conf.d/` | 子配置目录（每个站点一个 `.conf`） |
| `/usr/share/nginx/html/` | 默认静态文件目录 |
| `/var/log/nginx/` | 日志目录（access.log / error.log） |

> 💡 **提示：** 习惯上不在主配置 `nginx.conf` 里直接改，而是**在 `conf.d/` 下新建一个 `.conf` 文件**，Nginx 会自动 include。这样多个站点互不干扰。

---

### 四、最小前端部署配置

假设前端打包产物在 `/usr/share/nginx/html/myapp/`：

```nginx
# /etc/nginx/conf.d/myapp.conf

server {
    listen       80;                          # 监听 80 端口（HTTP）
    server_name  www.example.com;             # 绑定的域名

    root   /usr/share/nginx/html/myapp;       # ✅ 静态文件根目录
    index  index.html;                        # 默认入口文件

    location / {
        # try_files 解决 SPA history 路由 404，见 [[SPA路由部署]]
        try_files $uri $uri/ /index.html;
    }
}
```

#### 让配置生效

```bash
sudo nginx -t                 # ✅ 先测试语法
sudo nginx -s reload          # 重载配置
```

访问 `http://www.example.com`，页面正常显示即部署成功。

---

### 五、root vs alias（易混淆！）

这两个指令都用来指定文件目录，但行为不同，是 Nginx 最容易踩的坑。

#### root

`root` 会把**完整 URL 路径拼接在 root 后面**找文件：

```nginx
location /static/ {
    root /var/www;
}
# 请求 /static/logo.png
# 实际查找：/var/www/static/logo.png   ← URL 的 /static/ 部分被保留
```

#### alias

`alias` 会把** location 匹配的部分替换掉**：

```nginx
location /static/ {
    alias /var/www/files/;
}
# 请求 /static/logo.png
# 实际查找：/var/www/files/logo.png   ← /static/ 被替换成 /var/www/files/
```

#### 区别总结

| 对比 | root | alias |
| --- | --- | --- |
| 行为 | 拼接完整路径 | 替换匹配部分 |
| 结尾斜杠 | 不强求 | **必须以 `/` 结尾** |
| 适用 | 大部分场景 | 映射到不同目录 |

> ⚠️ **注意：** `alias` 后面**必须以 `/` 结尾**（`alias /var/www/files/;`），否则会找不到文件。

> 💡 **提示：** 简单部署用 `root` 就够了，记住 **root 是「拼接」，alias 是「替换」**。

---

### 六、location 匹配规则

`location` 决定「**什么 URL 走什么规则**」。

```nginx
# 精确匹配（优先级最高）
location = /favicon.ico {
    return 204;          # 直接返回，不记日志
}

# 前缀匹配（常用）
location /static/ {
    # 静态资源
}

# 正则匹配（~ 区分大小写，~* 不区分）
location ~* \.(jpg|png|gif|css|js)$ {
    expires 30d;         # 这些文件缓存 30 天
}

# 默认匹配
location / {
    try_files $uri $uri/ /index.html;
}
```

#### 匹配优先级（从高到低）

1. `=` 精确匹配
2. `^~` 前缀匹配（不再检查正则）
3. `~` / `~*` 正则匹配
4. 普通前缀匹配

> 💡 **提示：** 前端部署常见用法：用正则把**静态资源**（js/css/图片）单独匹配出来配置缓存，其余走默认 `try_files`。

---

### 七、完整生产级配置示例

一个结合了静态资源、SPA 路由、缓存、日志的完整配置：

```nginx
server {
    listen 80;
    server_name www.example.com;
    root /usr/share/nginx/html/myapp;
    index index.html;

    # gzip 压缩（详见 [[压缩配置]]）
    gzip on;
    gzip_types text/plain text/css application/javascript application/json;

    # 入口 HTML：不缓存（保证用户拿到最新版本）
    location = /index.html {
        add_header Cache-Control "no-cache";
    }

    # 带 hash 的静态资源：长期强缓存（详见 [[缓存策略]]）
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由回退
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 访问日志
    access_log /var/log/nginx/myapp.access.log;
    error_log  /var/log/nginx/myapp.error.log;
}
```

> 💡 **提示：** 这个配置涵盖了前端部署的几大核心（路由、压缩、缓存）。各部分原理见对应专题文档。

---

### 八、上传前端文件到服务器

#### 方式1：scp（简单）

```bash
# 本地打包后，直接传到服务器
scp -r dist/* root@your-server-ip:/usr/share/nginx/html/myapp/
```

#### 方式2：rsync（增量同步，推荐）

```bash
# 只传变化的文件，适合频繁部署
rsync -avz --delete dist/ root@your-server-ip:/usr/share/nginx/html/myapp/
```

#### 方式3：CI/CD 自动化

见 [[CI-CD自动化部署]]，push 代码自动构建部署。

---

### 九、常见问题与注意事项

#### 1. 改了文件没生效

- 配置改了：`nginx -s reload`
- 文件换了：浏览器**强刷**（Ctrl+Shift+R），或检查缓存策略
- 404：检查 `root` 路径对不对、文件在不在

#### 2. 权限问题（403 Forbidden）

Nginx 进程没有权限读取文件：

```bash
# 检查文件权限，确保 Nginx 用户（www-data / nginx）能读
sudo chown -R nginx:nginx /usr/share/nginx/html/myapp
sudo chmod -R 755 /usr/share/nginx/html/myapp
```

#### 3. 端口被占用

```bash
# 80 端口被占（可能 Apache 在用）
sudo lsof -i :80
# 停掉占用进程，或改 Nginx 监听别的端口
```

#### 4. 配置语法错误

```bash
sudo nginx -t    # 改完配置必跑，会提示哪一行错
```

#### 5. location / 和 location = /index.html 的区别

`location /` 匹配所有以 `/` 开头的（兜底）；`location = /index.html` 只精确匹配这一个。配置缓存时要用 `=` 精确匹配 index.html。

---

### 十、实际应用场景

| 场景 | 配置要点 |
| --- | --- |
| 单个前端项目 | 一个 server，root 指向 dist |
| 多个项目同服务器 | 多个 server（不同 server_name 或端口） |
| 静态资源 + API 代理 | location /api/ 反向代理（见 [[反向代理与跨域]]） |
| 只托管静态资源 | 配置 expires 缓存 |
| 内网部署 | listen 内网 IP，不绑域名 |

---

### 十一、总结

| 要点 | 说明 |
| --- | --- |
| 安装 | `apt install nginx`，`systemctl` 管理服务 |
| 配置位置 | `/etc/nginx/conf.d/xxx.conf` |
| 核心指令 | `listen`、`server_name`、`root`、`index`、`location` |
| root vs alias | root 拼接，alias 替换 |
| 生效 | `nginx -t && nginx -s reload` |
| 前端关键 | `try_files` 解决 SPA 路由 |

一句话：**Nginx 部署前端 = 监听端口 + root 指向 dist + try_files 处理路由**。掌握这个骨架，再叠加压缩/缓存/HTTPS/代理。

相关文档：[[部署概述]]、[[SPA路由部署]]、[[缓存策略]]、[[HTTPS配置]]、[[反向代理与跨域]]。
