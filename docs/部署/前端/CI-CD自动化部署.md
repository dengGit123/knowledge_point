### 一、概述

> 📖 [GitHub Actions 文档](https://docs.github.com/en/actions) ｜ [GitHub Pages 部署](https://docs.github.com/en/pages)

CI/CD（持续集成 / 持续部署）让前端部署**完全自动化**：你只要 `git push` 代码，服务器自动**构建 → 打包 → 部署**，不用再手动 build、手动上传。这是现代工程的标配。

大白话：以前部署是「**手动搬砖**」——本地 build、scp 上传、登服务器重启，繁琐易错。CI/CD 像「**自动流水线**」——你把代码推上去，机器自动完成构建和部署，你喝杯咖啡回来就上线了。

| 你将学到 | 说明 |
| --- | --- |
| CI/CD 是什么 | 持续集成、持续部署 |
| 工作流 | 触发 → 构建 → 部署 |
| GitHub Actions | 最流行的 CI/CD 工具 |
| 实战示例 | 自动部署到服务器 |
| 其他方案 | Vercel、Webhook |

> 💡 **提示：** CI/CD 不只是省事，更是**规范**——保证每次部署都经过统一的构建、测试流程，避免「本地能跑线上不行」。

---

### 二、CI/CD 概念

| 缩写 | 全称 | 含义 |
| --- | --- | --- |
| **CI** | Continuous Integration | 持续集成：代码 push 后**自动构建+测试** |
| **CD** | Continuous Delivery/Deployment | 持续交付/部署：自动**发布到生产** |

#### 完整流程

```
开发者 push 代码 ──► CI 自动构建、测试
                        │ 通过
                        ▼
                     CD 自动部署到服务器
                        │
                        ▼
                     用户访问到新版本
```

---

### 三、常见 CI/CD 工具

| 工具 | 特点 | 适用 |
| --- | --- | --- |
| **GitHub Actions** | GitHub 内置，免费额度，YAML 配置 | GitHub 项目（最常用） |
| **GitLab CI** | GitLab 内置 | GitLab 项目 |
| **Jenkins** | 老牌，自建，功能强 | 企业自建 |
| **Vercel / Netlify** | 零配置，自动部署 | 前端项目（最省心） |
| **Cloudflare Pages** | 自动部署 + CDN | 前端项目 |

> 💡 **提示：** 前端项目如果代码在 GitHub，用 **GitHub Actions** 最顺手；如果只想省事，用 **Vercel/Netlify**（连配置都不用写）。

---

### 四、GitHub Actions 基础

#### 1. 工作流文件

在项目根目录创建 `.github/workflows/deploy.yml`：

```yaml
name: Build and Deploy       # 工作流名称

on:                          # 触发条件
  push:
    branches: [ main ]       # push 到 main 时触发

jobs:                        # 任务
  build-and-deploy:
    runs-on: ubuntu-latest   # 运行环境（GitHub 提供的虚拟机）
    steps:                   # 步骤
      - uses: actions/checkout@v4    # 拉代码
      - run: echo "开始构建"
```

#### 2. 核心概念

| 概念 | 说明 |
| --- | --- |
| **workflow** | 工作流，一个 YAML 文件 |
| **on** | 触发条件（push、PR、定时、手动） |
| **job** | 任务，多个 job 并行/串行 |
| **step** | 步骤，job 内的执行单元 |
| **action** | 可复用的步骤（如 `actions/checkout`） |
| **runner** | 执行机器（ubuntu-latest 等） |

---

### 五、实战1：自动部署到自己的服务器（SSH）

push 到 main 后，自动 build，然后通过 SSH 把 dist 传到你的服务器：

```yaml
# .github/workflows/deploy.yml
name: Deploy to Server

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      # 1. 拉代码
      - uses: actions/checkout@v4

      # 2. 装 Node
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm

      # 3. 装依赖、构建
      - run: npm ci
      - run: npm run build         # 生成 dist/

      # 4. 通过 SSH 上传 dist 到服务器
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}       # 服务器 IP（存为 secret）
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}    # 私钥
          script: |
            # 服务器上拉取最新文件、重启
            rsync -avz --delete ./dist/ /usr/share/nginx/html/myapp/
            nginx -s reload
```

> 💡 **提示：** 上面的 `secrets.XXX` 是 **GitHub Secrets**（仓库设置里加密存储的变量），用来放密码、密钥等敏感信息，**绝不能写在 YAML 明文里**。

---

### 六、实战2：自动部署到对象存储 / OSS

把静态资源传到阿里云 OSS / AWS S3（配合 CDN 效果最佳）：

```yaml
- name: Upload to OSS
  uses: manyuanrong/setup-ossutil@v3.0
  with:
    endpoint: oss-cn-hangzhou.aliyuncs.com
    access-key-id: ${{ secrets.OSS_KEY_ID }}
    access-key-secret: ${{ secrets.OSS_KEY_SECRET }}

- run: ossutil cp -rf dist/ oss://my-bucket/ --update
```

---

### 七、实战3：自动构建 Docker 镜像

push 代码 → 自动构建 Docker 镜像 → 推到镜像仓库（见 [[Docker部署]]）：

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [ main ]

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: username/my-frontend:latest
```

服务器端只需 `docker pull && docker run`，或用 Webhook 触发。

---

### 八、零配置方案：Vercel / Netlify

如果不想写 YAML，**Vercel / Netlify / Cloudflare Pages** 提供零配置自动部署：

#### Vercel 流程

```
1. 注册 Vercel，关联 GitHub 仓库
2. 选框架（Vue/React/Vite 自动识别）
3. 每次 push → Vercel 自动 build → 部署
4. 给一个 xxx.vercel.app 域名（可绑自定义域名）
```

#### 为什么这么省心

- 自动识别框架、构建命令、产物目录
- 自动配 HTTPS、CDN、SPA 路由回退
- 预览部署（每个 PR 一个预览地址）
- 免费额度够个人项目用

> 💡 **提示：** 个人项目 / 小项目**强烈推荐 Vercel/Netlify**，零配置、免费、自动 HTTPS+CDN。企业项目再考虑自建 + GitHub Actions。

---

### 九、Webhook 触发部署

CI 构建完后，通过 **Webhook** 通知服务器拉取最新代码/镜像：

```
GitHub Actions 构建完成
   │
   ▼ 发 HTTP 请求（Webhook）
服务器接收 → 拉新镜像 → 重启容器
```

```yaml
- name: Notify server
  run: |
    curl -X POST https://your-server.com/deploy-webhook \
      -H "X-Webhook-Secret: ${{ secrets.WEBHOOK_SECRET }}"
```

服务器端用一个轻量服务接收 Webhook，执行 `docker pull && docker-compose up -d`。

---

### 十、环境变量与密钥管理

CI/CD 中要用到密码、密钥，**绝不能写在代码里**：

| 方式 | 说明 |
| --- | --- |
| **GitHub Secrets** | 仓库设置里加密存储，`${{ secrets.XXX }}` 引用 |
| 环境变量 | 构建时注入（如 API 地址） |
| .env 文件 | 本地用，加入 .gitignore |

```yaml
# 构建时注入生产环境 API 地址
- run: npm run build
  env:
    VITE_API_BASE: https://api.example.com
```

> ⚠️ **注意：** **私钥、密码、Token 必须放 Secrets**。一旦明文提交到 Git，要立即吊销重置（Git 历史删不干净）。

---

### 十一、常见问题与注意事项

#### 1. CI 构建失败

- 依赖没装好：用 `npm ci`（比 `npm install` 更严格、更快）
- Node 版本不对：`setup-node` 指定版本
- 看 Actions 日志定位

#### 2. 部署后白屏

构建时的环境变量（API 地址）和生产不一致。确认 CI 里的 `env` 配置正确。

#### 3. 密钥泄露

私钥别明文写。用 Secrets，且**给 CI 专用的最小权限密钥**，不要用主账号密钥。

#### 4. 构建慢

- 用 `npm ci` + `cache: npm` 缓存依赖
- 用多阶段 Dockerfile
- 只在必要时全量构建

#### 5. 回滚

保留历史镜像/产物，出问题切回上一个版本。镜像按版本打 tag（`myapp:v1.2` 而非只用 `latest`）。

---

### 十二、实际应用场景

| 场景 | 方案 |
| --- | --- |
| 个人项目 | Vercel/Netlify（零配置） |
| GitHub 项目 | GitHub Actions + SSH |
| Docker 化项目 | Actions build → push 镜像 → Webhook 部署 |
| 企业项目 | Jenkins / GitLab CI |
| 多环境 | 不同分支触发部署到不同环境（dev/prod） |

---

### 十三、总结

| 要点 | 说明 |
| --- | --- |
| CI | 自动构建 + 测试 |
| CD | 自动部署到生产 |
| 主流工具 | GitHub Actions（代码在 GitHub 时） |
| 工作流文件 | `.github/workflows/xxx.yml` |
| 流程 | push → checkout → build → deploy |
| 密钥 | 用 Secrets，不明文 |
| 省心方案 | Vercel / Netlify 零配置 |

一句话：**push 代码 → CI 自动 build → CD 自动部署**。代码在 GitHub 用 Actions，想省事用 Vercel。

相关文档：[[Docker部署]]、[[Nginx部署]]、[[部署概述]]、[[CDN部署]]。
