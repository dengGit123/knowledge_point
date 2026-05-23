# YAML 格式详解

## 1. YAML 简介

YAML（YAML Ain't Markup Language，一种人类可读的数据序列化格式）是一种专为人类阅读设计的配置语言。它于 2001 年首次发布，旨在提供一种比 XML 更简洁、比 JSON 更易读的数据表示方式。

### 核心设计理念

- **人类可读性**：YAML 的首要设计目标就是让数据容易被人类阅读和编写
- **跨语言支持**：支持大多数编程语言的数据结构映射
- **层次结构**：通过缩进表达数据的层级关系
- **纯文本格式**：可使用任何文本编辑器编辑

### 与其他格式的对比

| 特性 | YAML | JSON | XML |
|------|------|------|-----|
| 可读性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| 语法简洁度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| 数据类型支持 | 丰富 | 中等 | 需schema |
| 注释支持 | ✅ | ❌ | ✅ |
| 配置文件适用性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

---

## 2. 核心概念

### 2.1 键值对（Key-Value Pairs）

YAML 的基础结构是键值对，格式为 `key: value`：

```yaml
name: 张三
age: 25
city: 北京
```

### 2.2 文档分隔符

使用 `---` 分隔多个 YAML 文档：

```yaml
---
title: 文档1
content: 内容1
---
title: 文档2
content: 内容2
```

### 2.3 数据结构类型

YAML 支持三种主要数据结构：

| 类型 | 说明 | 示例 |
|------|------|------|
| 标量（Scalar） | 单个值 | `name: 张三` |
| 序列（Sequence） | 列表/数组 | `- item1` |
| 映射（Mapping） | 键值对集合 | `key: value` |

---

## 3. 标量（Scalars）

标量是单个的、不可分割的值。

### 3.1 字符串（String）

```yaml
# 普通字符串（无需引号）
name: 张三

# 双引号字符串（支持转义）
description: "第一行\n第二行"

# 单引号字符串（保留转义原意）
path: 'C:\Users\Documents'

# 多行字符串
content: |
  这是第一行
  这是第二行
  这是第三行

# 折叠字符串（换行变空格）
content: >
  这是一个折叠的
  多行字符串
  段落
```

### 3.2 数字（Number）

```yaml
# 整数
count: 42
negative: -10

# 浮点数
price: 19.99
scientific: 1.5e-3

# 八进制（以 0 开头）
octal: 0777

# 十六进制（以 0x 开头）
hex: 0xFF

# 特殊数值
infinity: .inf
not_a_number: .nan
```

### 3.3 布尔值（Boolean）

```yaml
# true 的多种表示
is_active: true
is_valid: yes
is_enabled: on

# false 的多种表示
is_deleted: false
is_pending: no
is_disabled: off
```

### 3.4 空值（Null）

```yaml
# 使用 null 或 ~
name: null
email: ~
```

### 3.5 日期和时间

```yaml
date: 2024-01-15
time: 10:30:00
datetime: 2024-01-15 10:30:00
iso_datetime: 2024-01-15T10:30:00Z
```

---

## 4. 序列（Sequences）

序列是元素的有序列表，类似数组。

### 4.1 块格式序列（Block Sequence）

```yaml
# 使用 - 表示列表项
fruits:
  - 苹果
  - 香蕉
  - 橙子

# 内联格式
colors: [红色, 绿色, 蓝色]

# 嵌套序列
matrix:
  - [1, 2, 3]
  - [4, 5, 6]
  - [7, 8, 9]
```

### 4.2 混合类型序列

```yaml
mixed:
  - 字符串
  - 123
  - true
  - null
```

### 4.3 序列的嵌套

```yaml
departments:
  - name: 技术部
    employees:
      - 张三
      - 李四
  - name: 市场部
    employees:
      - 王五
      - 赵六
```

---

## 5. 映射（Mappings）

映射是键值对的集合，类似字典或对象。

### 5.1 基本映射

```yaml
person:
  name: 张三
  age: 30
  occupation: 工程师
```

### 5.2 复杂嵌套映射

```yaml
company:
  name: 示例科技
  founded: 2020
  address:
    country: 中国
    city: 北京
    street: 中关村大街1号
  departments:
    - name: 技术部
      headcount: 50
    - name: 市场部
      headcount: 20
```

### 5.3 键的特殊写法

```yaml
# 使用双引号包裹的键
"special-key": 值

# 使用单引号包裹的键
'simple key': 值

# 问号表示复杂键
? |
  多行
  键
: 值
```

---

## 6. 高级特性

### 6.1 锚点与别名（Anchors & Aliases）

使用锚点定义重复内容，通过别名引用：

```yaml
defaults: &defaults
  timeout: 30
  retries: 3

server1:
  <<: *defaults
  host: 192.168.1.1

server2:
  <<: *defaults
  host: 192.168.1.2
```

展开后：

```yaml
server1:
  timeout: 30
  retries: 3
  host: 192.168.1.1

server2:
  timeout: 30
  retries: 3
  host: 192.168.1.2
```

### 6.2 类型强制转换

```yaml
# 使用 !! 强制类型
string_number: !!str 123
int_string: !!int "42"
float_string: !!float "3.14"
```

### 6.3 显式数据类型标签

```yaml
# 字符串（显式）
text: !!str 2024

# 整数
count: !!int "42"

# 布尔值
flag: !!bool "true"

# 日期
date: !!timestamp 2024-01-15

# 二进制数据
data: !!binary "SGVsbG8gV29ybGQ="
```

### 6.4 多文档合并

```yaml
---
base: &base
  version: 1.0

development:
  <<: *base
  debug: true

production:
  <<: *base
  debug: false
```

---

## 7. 缩进规则

### 7.1 基本缩进要求

```yaml
# ✅ 正确的缩进
parent:
  child:
    grandchild: 值

# ❌ 错误的缩进（混用空格和Tab）
parent:
    child: 值
  sibling: 值
```

### 7.2 缩进规范

| 规范 | 说明 |
|------|------|
| **空格缩进** | 必须使用空格，**禁止使用 Tab** |
| **一致缩进** | 同级元素必须使用相同的缩进量 |
| **推荐缩进** | 2 个空格（最常用）或 4 个空格 |
| **嵌套层级** | 通过缩进表示嵌套深度 |

### 7.3 缩进示例对比

```yaml
# 2空格缩进（推荐）
app:
  name: MyApp
  config:
    host: localhost
    port: 8080

# 4空格缩进
app:
    name: MyApp
    config:
        host: localhost
        port: 8080
```

---

## 8. 注释（Comments）

### 8.1 单行注释

```yaml
# 这是一条注释
name: 张三  # 行尾注释

# 配置项说明
timeout: 30  # 连接超时时间（秒）
retries: 3   # 重试次数
```

### 8.2 多行注释

```yaml
# 这是
# 多行
# 注释块
config:
  value: 100
```

### 8.3 注释使用建议

```yaml
# ✅ 推荐：注释清晰说明用途
# 数据库配置
database:
  host: localhost
  port: 5432
  name: myapp

# ❌ 避免：注释过于繁琐或无用
# name: 张三  # 名字字段
# age: 30    # 年龄字段
```

---

## 9. 常用应用场景

### 9.1 配置文件

```yaml
# Docker Compose 配置
version: '3.8'
services:
  web:
    image: nginx:latest
    ports:
      - "80:80"
    volumes:
      - ./html:/usr/share/nginx/html

  database:
    image: postgres:14
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret
```

### 9.2 Kubernetes 配置

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
    environment: production
spec:
  containers:
    - name: nginx
      image: nginx:latest
      ports:
        - containerPort: 80
      resources:
        limits:
          memory: "128Mi"
          cpu: "500m"
```

### 9.3 GitHub Actions 工作流

```yaml
name: CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

### 9.4 Ansible 配置

```yaml
- name: 部署 Web 服务器
  hosts: webservers
  become: yes
  vars:
    nginx_version: "1.24.0"
  tasks:
    - name: 安装 Nginx
      apt:
        name: nginx
        state: present
    - name: 启动 Nginx
      service:
        name: nginx
        state: started
```

### 9.5 数据导出格式

```yaml
users:
  - id: 1
    name: 张三
    email: zhang@example.com
    roles:
      - admin
      - user
  - id: 2
    name: 李四
    email: li@example.com
    roles:
      - user
```

---

## 10. 与 JSON 的转换

### 10.1 YAML 转 JSON

```yaml
# YAML 格式
name: 张三
age: 30
 hobbies:
  - 读书
  - 编程
```

```json
// 对应的 JSON 格式
{
  "name": "张三",
  "age": 30,
  "hobbies": ["读书", "编程"]
}
```

### 10.2 JSON 转 YAML

```json
// JSON 格式
{
  "title": "示例文档",
  "version": "1.0.0",
  "enabled": true,
  "config": {
    "timeout": 30,
    "retries": 3
  }
}
```

```yaml
# 对应的 YAML 格式
title: 示例文档
version: 1.0.0
enabled: true
config:
  timeout: 30
  retries: 3
```

---

## 11. YAML 与其他格式对比

### 11.1 YAML vs JSON

| 对比项 | YAML | JSON |
|--------|------|------|
| 注释 | ✅ 支持 | ❌ 不支持 |
| 尾随逗号 | ✅ 支持 | ❌ 不支持 |
| 多行字符串 | ✅ 原生支持 | ❌ 需转义 |
| 键加引号 | ✅ 可选 | ⚠️ 仅字符串键需加 |
| 缩进敏感 | ✅ 敏感 | ❌ 不敏感 |
| 数据类型 | ✅ 自动转换 | ⚠️ 需显式声明 |
| 学习曲线 | 较平缓 | 平缓 |

### 11.2 YAML vs XML

| 对比项 | YAML | XML |
|--------|------|-----|
| 语法简洁度 | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 可读性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 注释 | ✅ 支持 | ✅ 支持 |
| 属性支持 | ❌ 无 | ✅ 支持 |
| Schema | ❌ 无 | ✅ 支持 |
| 命名空间 | ❌ 无 | ✅ 支持 |
| 处理难度 | 简单 | 复杂 |

---

## 12. 最佳实践

### 12.1 命名规范

```yaml
# ✅ 推荐：使用小写字母和连字符
database_name: myapp
connection_timeout: 30

# ✅ 推荐：嵌套配置使用一致的缩进层级
app:
  server:
    host: localhost
    port: 8080

# ❌ 避免：混合使用命名风格
databaseName: myapp
connectionTimeout: 30
```

### 12.2 结构设计

```yaml
# ✅ 推荐：清晰的层次结构
config:
  database:
    host: localhost
    port: 5432
    credentials:
      username: admin
      password: secret

# ✅ 推荐：使用锚点避免重复
default_settings: &defaults
  timeout: 30
  retries: 3
  debug: false

development:
  <<: *defaults
  debug: true

production:
  <<: *defaults
```

### 12.3 安全注意事项

```yaml
# ❌ 避免：在配置中硬编码敏感信息
password: my_secret_password

# ✅ 推荐：使用环境变量引用
password: ${DB_PASSWORD}

# ✅ 推荐：使用密钥管理服务
secrets:
  api_key: !vault secret/data/myapp
```

### 12.4 维护性建议

```yaml
# ✅ 推荐：添加注释说明复杂配置
# 限流配置：单位时间内允许的最大请求数
rate_limit:
  requests_per_minute: 100
  burst_size: 20

# ✅ 推荐：分组相关的配置项
server:
  host: localhost
  port: 8080
  ssl_enabled: true
  ssl_cert: /path/to/cert.pem
  ssl_key: /path/to/key.pem
```

---

## 13. 常见错误与避免方法

### 13.1 缩进错误

```yaml
# ❌ 错误：Tab 和空格混用
name: 张三
	age: 30

# ✅ 正确：统一使用空格
name: 张三
  age: 30
```

### 13.2 冒号后的空格

```yaml
# ❌ 错误：缺少冒号后的空格
name:张三
age:30

# ✅ 正确：冒号后添加空格
name: 张三
age: 30
```

### 13.3 列表项缩进

```yaml
# ❌ 错误：列表项缩进不一致
fruits:
  - 苹果
 - 香蕉
   - 橙子

# ✅ 正确：统一缩进
fruits:
  - 苹果
  - 香蕉
  - 橙子
```

### 13.4 多行字符串格式

```yaml
# ❌ 错误：多行字符串没有使用管道符
description: 这是第一行
这是第二行
这是第三行

# ✅ 正确：使用 | 或 >
description: |
  这是第一行
  这是第二行
  这是第三行

folded: >
  这是一段
  折叠的
  文本
```

---

## 14. YAML 验证工具

### 14.1 在线验证器

| 工具 | 网址 | 功能 |
|------|------|------|
| YAML Lint | yamllint.com | 语法验证 |
| YAML Validator | yamlvalidator.com | 在线验证 |
| Code Beautify | codebeautify.org/yaml-validator | 多格式转换 |

### 14.2 命令行工具

```bash
# 使用 Python 验证 YAML
python -c "import yaml; yaml.safe_load(open('config.yaml'))"

# 使用 yamllint 工具（需安装）
yamllint config.yaml

# 使用 yq 处理 YAML（需安装）
yq eval '.database.host' config.yaml
```

### 14.3 常用库

| 语言 | 推荐库 |
|------|--------|
| Python | PyYAML, ruamel.yaml |
| JavaScript | js-yaml |
| Java | SnakeYAML |
| Go | gopkg.in/yaml.v3 |
| Ruby | Psych |
| PHP | Symfony YAML |

---

## 15. 总结

YAML 是一种设计优雅、易于阅读和维护的数据序列化格式。其核心特点包括：

| 特点 | 说明 |
|------|------|
| **人类可读** | 通过缩进和简洁语法实现高度可读性 |
| **层次清晰** | 通过缩进表达嵌套关系 |
| **类型丰富** | 支持字符串、数字、布尔、日期、复杂对象等 |
| **注释支持** | 可添加注释说明配置意图 |
| **跨语言兼容** | 几乎所有编程语言都有 YAML 解析库 |
| **广泛应用** | 配置文件、数据交换、CI/CD 等场景 |

掌握 YAML 需要注意缩进规则（空格而非 Tab）、数据类型表示、锚点别名的使用，以及常见错误的避免。通过大量实践，可以熟练运用 YAML 进行配置管理和数据序列化。
