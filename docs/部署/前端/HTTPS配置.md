### 一、概述

> 📖 [Nginx HTTPS 配置](https://nginx.org/en/docs/http/configuring_https_servers.html) ｜ [Let's Encrypt](https://letsencrypt.org/)

现在的网站**几乎都必须上 HTTPS**——浏览器会把 HTTP 网站标记「不安全」，HTTPS 也是 HTTP/2、PWA、新 Web API 的前提。本文讲怎么给前端部署配置 HTTPS。

大白话：HTTP 像「**明信片**」，传输内容谁都能看；HTTPS 像「**密封信**」，内容加密传输，还能证明网站身份。要上 HTTPS，你需要一张**SSL 证书**（像网站的身份证），在 Nginx 里配上就行。

| 你将学到 | 说明 |
| --- | --- |
| HTTPS 原理 | 为什么要上 HTTPS（详见 [[../java/网络/HTTPS]]） |
| 获取证书 | 免费的 Let's Encrypt |
| Nginx 配置 | 监听 443、配证书 |
| HTTP 跳转 | 自动跳 HTTPS |
| 证书续期 | 证书有有效期 |

> 💡 **提示：** HTTPS 的加密原理（对称/非对称、证书、握手）见 [[../java/网络/HTTPS]]。本文聚焦**怎么部署配置**。

---

### 二、HTTPS 部署三要素

```
① 域名（已解析到服务器 IP）
② SSL 证书（证书文件 + 私钥）
③ 服务器监听 443 端口，配置证书
```

| 端口 | 协议 |
| --- | --- |
| 80 | HTTP（明文） |
| 443 | HTTPS（加密） |

---

### 三、获取 SSL 证书

#### 1. 免费：Let's Encrypt（推荐）

Let's Encrypt 提供**免费、自动化**的证书，3 个月有效期，用 `certbot` 工具自动申请和续期：

```bash
# Ubuntu 安装 certbot
sudo apt install certbot python3-certbot-nginx

# ✅ 自动申请证书并配置 Nginx
sudo certbot --nginx -d www.example.com -d example.com
```

certbot 会自动：
- 验证域名所有权
- 申请证书
- 修改 Nginx 配置
- 设置自动续期

> 💡 **提示：** **Let's Encrypt + certbot 是最省心的免费 HTTPS 方案**，一条命令搞定申请+配置+续期。

#### 2. 云厂商免费证书

阿里云、腾讯云等都提供**免费单域名证书**（DV 证书），在控制台申请，下载证书文件（`.pem` + `.key`）手动配置。

#### 3. 付费证书

企业级（OV/EV 证书）需付费，适合电商、金融等高可信场景。

---

### 四、Nginx 配置 HTTPS

#### 1. 证书文件

申请后，你会拿到两个文件：

| 文件 | 说明 |
| --- | --- |
| `fullchain.pem`（或 `.crt`） | 证书文件（公钥） |
| `privkey.pem`（或 `.key`） | 私钥文件（**绝不能泄露**） |

放在服务器上，如 `/etc/nginx/ssl/`。

#### 2. 基础 HTTPS 配置

```nginx
server {
    listen 443 ssl;                         # ✅ 监听 443，开启 ssl
    server_name www.example.com;

    # ✅ 指定证书和私钥
    ssl_certificate     /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    root /usr/share/nginx/html/myapp;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 3. HTTP 自动跳转 HTTPS

让用户访问 HTTP 时**自动跳转到 HTTPS**：

```nginx
server {
    listen 80;
    server_name www.example.com;
    # ✅ 所有 HTTP 请求 301 永久跳转到 HTTPS
    return 301 https://$host$request_uri;
}
```

#### 4. 生效

```bash
sudo nginx -t
sudo nginx -s reload
```

访问 `http://www.example.com` 会自动跳到 `https://`，浏览器地址栏显示🔒。

---

### 五、完整生产级配置

```nginx
# HTTP 跳转 HTTPS
server {
    listen 80;
    server_name www.example.com;
    return 301 https://$host$request_uri;
}

# HTTPS 主配置
server {
    listen 443 ssl http2;       # ✅ 同时开启 HTTP/2（需 HTTPS）
    server_name www.example.com;

    # 证书
    ssl_certificate     /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # ✅ 安全相关优化
    ssl_protocols TLSv1.2 TLSv1.3;          # 只用安全的协议版本
    ssl_ciphers HIGH:!aNULL:!MD5;           # 强加密套件
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;       # 会话缓存，加速握手
    ssl_session_timeout 10m;

    # 安全响应头
    add_header Strict-Transport-Security "max-age=31536000" always;  # ✅ HSTS

    root /usr/share/nginx/html/myapp;
    index index.html;

    # gzip、缓存、try_files 等配置...
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 几个关键优化

| 配置 | 作用 |
| --- | --- |
| `http2` | 开启 HTTP/2（多路复用，更快，**必须配合 HTTPS**） |
| `ssl_protocols TLSv1.2 TLSv1.3` | 禁用老旧不安全的 TLS 1.0/1.1 |
| `HSTS` | 强制浏览器以后都用 HTTPS（防降级攻击） |
| `ssl_session_cache` | 缓存 TLS 会话，加速重复连接 |

> 💡 **提示：** `http2` 配合 HTTPS 是标配——HTTPS 是 HTTP/2 的前提，开了 HTTPS 顺手开 HTTP/2，性能进一步提升。

---

### 六、证书续期

#### Let's Encrypt 证书 90 天过期

Let's Encrypt 证书有效期只有 **90 天**，要及时续期。certbot 会自动设置定时任务：

```bash
# 测试自动续期是否正常
sudo certbot renew --dry-run

# 续期后重载 Nginx
sudo certbot renew --deploy-hook "systemctl reload nginx"
```

> ⚠️ **注意：** **证书过期网站会打不开**（浏览器报证书错误）。务必设置自动续期。云厂商证书一般 1 年，记得续。

#### 云厂商证书

手动续期：到期前在控制台重新申请，下载新证书替换，reload Nginx。

---

### 七、常见问题与注意事项

#### 1. 证书错误（浏览器警告）

- 证书过期 → 续期
- 域名不匹配 → 证书绑定的域名要和访问的域名一致
- 自签名证书 → 用受信任 CA 签发的证书（Let's Encrypt）

#### 2. 443 端口不通

- 防火墙没开放 443（云服务器安全组要放行 443）
- `listen 443 ssl` 写错

#### 3. 混合内容（Mixed Content）

HTTPS 页面里引用了 HTTP 资源（图片、JS），浏览器会拦截。**所有资源都要走 HTTPS**。

```html
<!-- ❌ HTTPS 页面引用 HTTP 资源，被拦截 -->
<img src="http://example.com/logo.png">

<!-- ✅ 用 HTTPS -->
<img src="https://example.com/logo.png">
```

#### 4. 证书文件权限

私钥文件要严格保护权限：

```bash
sudo chmod 600 /etc/nginx/ssl/privkey.pem
```

#### 5. HTTP/2 需要 HTTPS

`listen 443 ssl http2` 的 http2 依赖 HTTPS。HTTP 上开不了 HTTP/2（HTTP/3 才行）。

---

### 八、实际应用场景

| 场景 | 方案 |
| --- | --- |
| 个人/小项目 | Let's Encrypt + certbot（免费自动化） |
| 企业网站 | 云厂商证书或付费 OV/EV |
| 全站 HTTPS | 80 跳 443 + HSTS |
| 多域名 | 通配符证书或多域名证书（SAN） |
| 内网 | 自签名证书（仅内网，浏览器会警告） |

---

### 九、总结

| 要点 | 说明 |
| --- | --- |
| 必要性 | 现代网站标配，浏览器要求 |
| 三要素 | 域名 + 证书 + 443 端口 |
| 免费证书 | Let's Encrypt + certbot |
| Nginx 配置 | `listen 443 ssl` + 证书路径 |
| HTTP 跳转 | `return 301 https://...` |
| 优化 | TLS 1.2/1.3、HTTP/2、HSTS |
| 续期 | Let's Encrypt 90 天，自动续 |

一句话：**用 certbot 一条命令申请免费证书，Nginx 配 `listen 443 ssl`，80 跳 443**，全站 HTTPS 即可。

相关文档：[[Nginx部署]]、[[../java/网络/HTTPS]]、[[部署概述]]。
