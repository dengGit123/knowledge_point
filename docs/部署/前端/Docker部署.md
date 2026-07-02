### 一、概述

> 📖 [Docker 官方文档](https://docs.docker.com/) ｜ [Nginx Docker 镜像](https://hub.docker.com/_/nginx)

Docker 把前端项目**打包成一个镜像**（包含 Nginx + 你的静态文件），然后在任何服务器上**一键运行**。它解决了「在我电脑上能跑、到服务器就不行」的环境问题，是现代部署的标配。

大白话：传统部署要「装 Nginx → 配置 → 上传文件」，每换一台服务器重来一遍。Docker 像「**预制板房**」——把 Nginx 和你的代码打包成一个整体（镜像），搬到哪台服务器，一拉就起来，环境完全一致。

| 你将学到 | 说明 |
| --- | --- |
| 为什么用 Docker | 环境一致、方便迁移 |
| Dockerfile | 描述怎么构建镜像 |
| 多阶段构建 | 构建 + 运行分离，镜像更小 |
| 运行容器 | docker run |
| docker-compose | 多容器编排 |

> 💡 **提示：** Docker 让前端部署**标准化、可复现**。配合 CI/CD，push 代码 → 自动构建镜像 → 部署，全自动化。

---

### 二、为什么用 Docker 部署前端

| 优势 | 说明 |
| --- | --- |
| 环境一致 | 本地、测试、生产环境完全一样 |
| 方便迁移 | 镜像一拉就能跑，不挑服务器 |
| 易于回滚 | 出问题切回旧镜像即可 |
| 配合 CI/CD | 镜像即版本，自动化友好 |
| 资源隔离 | 容器间互不干扰 |

#### 传统部署 vs Docker 部署

```
传统：服务器装 Nginx → 手动配置 → 上传 dist → 改配置易出错
Docker：Dockerfile 描述 → build 成镜像 → 一条命令运行（配置都在镜像里）
```

---

### 三、Dockerfile：构建前端镜像

#### 1. 最简单的 Dockerfile

```dockerfile
# 基于官方 Nginx 镜像
FROM nginx:alpine

# 把本地 dist 拷进 Nginx 的默认目录
COPY dist/ /usr/share/nginx/html/

# 拷贝自定义的 Nginx 配置（可选）
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

这个 Dockerfile 假设你**本地已经 `npm run build` 生成了 `dist/`**。

#### 2. 构建 + 运行

```bash
# 构建镜像（-t 起名字，. 表示当前目录）
docker build -t my-frontend:1.0 .

# 运行容器（-d 后台，-p 端口映射：宿主机80→容器80）
docker run -d -p 80:80 --name myapp my-frontend:1.0
```

访问服务器 80 端口，前端页面就出来了。

---

### 四、多阶段构建（推荐！）

上面要求**先在本地 build**。更好的做法：**在 Docker 里直接构建**——用多阶段构建，第一阶段 build，第二阶段运行，最终镜像只有 Nginx + 静态文件，**非常小**。

```dockerfile
# ===== 第一阶段：构建阶段（用 Node 环境）=====
FROM node:18-alpine AS builder

WORKDIR /app
# 先拷 package.json，利用 Docker 缓存
COPY package*.json ./
RUN npm install

# 拷源码并打包
COPY . .
RUN npm run build        # 生成 /app/dist

# ===== 第二阶段：运行阶段（用 Nginx）=====
FROM nginx:alpine

# 从第一阶段拷贝构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 拷贝 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

#### 多阶段构建的好处

| 好处 | 说明 |
| --- | --- |
| 不依赖本地环境 | 不用本地装 Node，Docker 里全搞定 |
| 镜像小 | 最终镜像只有 Nginx + dist，**没有 node_modules、源码** |
| 一致性强 | 任何人 build 出的镜像都一样 |

> 💡 **提示：** **多阶段构建是前端 Docker 部署的标准做法**。第一阶段用 Node 构建，第二阶段用 Nginx 运行，最终镜像又小又干净。

---

### 五、配套的 nginx.conf

容器里 Nginx 的配置（处理 SPA 路由、缓存等，见前面几篇）：

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # SPA 路由（见 [[SPA路由部署]]）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # gzip 压缩（见 [[压缩配置]]）
    gzip on;
    gzip_types text/css application/javascript application/json;

    # 静态资源缓存（见 [[缓存策略]]）
    location ~* \.(js|css|png|jpg|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 代理（见 [[反向代理与跨域]]）
    location /api/ {
        proxy_pass http://backend:8080/;
    }
}
```

> 💡 **提示：** 注意 `proxy_pass http://backend:8080/`——用容器名 `backend` 而非 `localhost`（因为容器有独立网络）。配合 docker-compose 自动联调。

---

### 六、.dockerignore（重要）

构建时排除不必要的文件，**减小上下文、加速构建**：

```
# .dockerignore
node_modules
dist
.git
npm-debug.log
Dockerfile
.dockerignore
```

> ⚠️ **注意：** **务必排除 `node_modules`**！否则会把本地 GB 级的 node_modules 传给 Docker，构建巨慢。

---

### 七、docker-compose：编排多个容器

前端通常要配合后端一起跑。`docker-compose.yml` 一次管理多个容器：

```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:                    # 前端容器
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:                     # 后端容器
    image: my-backend:1.0
    ports:
      - "8080:8080"

  db:                          # 数据库容器
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: 123456
    ports:
      - "3306:3306"
```

#### 启动

```bash
# 一键启动所有服务（按依赖顺序）
docker-compose up -d

# 查看状态
docker-compose ps

# 停止
docker-compose down
```

> 💡 **提示：** docker-compose 里**容器间用服务名互相访问**（前端代理 `http://backend:8080`）。compose 自动建网络，容器互通。

---

### 八、镜像的发布与分发

构建好的镜像可以**推送到镜像仓库**，别的服务器拉取即可运行：

```bash
# 登录镜像仓库（如 Docker Hub / 阿里云 ACR）
docker login

# 给镜像打标签
docker tag my-frontend:1.0 username/my-frontend:1.0

# 推送
docker push username/my-frontend:1.0

# 其他服务器拉取并运行
docker pull username/my-frontend:1.0
docker run -d -p 80:80 username/my-frontend:1.0
```

#### 常见镜像仓库

| 仓库 | 说明 |
| --- | --- |
| Docker Hub | 官方，公开免费 |
| 阿里云 ACR | 国内快 |
| 腾讯云 TCR | 国内 |
| Harbor | 私有仓库（企业自建） |

---

### 九、常见问题与注意事项

#### 1. 容器里改了配置不生效

镜像里的配置是构建时定死的。改配置要**重新 build 镜像**，或用**挂载卷（volume）**把宿主机的配置映射进去：

```bash
# 用宿主机的 nginx.conf 覆盖容器里的
docker run -d -p 80:80 -v /my/nginx.conf:/etc/nginx/conf.d/default.conf my-frontend
```

#### 2. 端口冲突

宿主机 80 被占。换端口 `-p 8080:80`，或停掉占 80 的程序。

#### 3. 容器访问不到后端

容器是独立网络，`localhost` 指容器自己，不是宿主机。
- 后端在宿主机：`proxy_pass http://host.docker.internal:8080/`
- 后端也是容器：用 docker-compose + 服务名 `http://backend:8080`

#### 4. 镜像太大

用多阶段构建 + `alpine` 基础镜像，前端镜像能压到 **20~30MB**。

#### 5. 构建缓存失效

Dockerfile 里 `COPY . .` 放最后，`COPY package.json` 放前面，利用层缓存（源码变了不会重新 npm install）。

---

### 十、实际应用场景

| 场景 | 用法 |
| --- | --- |
| 标准化部署 | Dockerfile + 多阶段构建 |
| 前后端联调 | docker-compose 编排 |
| K8s 集群 | 镜像推仓库，K8s 拉取部署 |
| CI/CD | 自动 build → push → 部署 |
| 多环境 | 一个镜像跑测试/生产（配环境变量区分） |

---

### 十一、总结

| 要点 | 说明 |
| --- | --- |
| 价值 | 环境一致、易迁移、易回滚 |
| Dockerfile | 描述如何构建镜像 |
| 多阶段构建 | Node 构建 + Nginx 运行，镜像最小 |
| 运行 | `docker run -d -p 80:80` |
| 编排 | docker-compose 管理多容器 |
| 分发 | 推镜像仓库，他处拉取 |

一句话：**写个多阶段 Dockerfile（Node build + Nginx run），`docker build` 成镜像，`docker run` 一键部署**，环境一致、迁移方便。

相关文档：[[Nginx部署]]、[[SPA路由部署]]、[[CI-CD自动化部署]]、[[部署概述]]。
