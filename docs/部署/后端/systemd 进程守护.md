### 一、概述

> 📖 [Spring Boot - Unix/Linux Services](https://docs.spring.io/spring-boot/reference/deployment/installing.html) ｜ [systemd 官方文档](https://www.freedesktop.org/wiki/Software/systemd/)

手动 `java -jar` 跑起来的应用，SSH 一断、进程就挂；服务器一重启，应用就「失踪」；程序崩溃，没人拉它起来。**systemd** 是 Linux 标准的进程管理器，把你的 Java 应用注册成**系统服务**——这三个问题一次性全解决。

大白话：手动跑应用像「**自己在家里看火**」，人一走火就灭；systemd 是「**雇了个保姆**」——火灭了自动重新点火（崩溃拉起）、停电后来电自动开火（开机自启）、搬家前把锅里菜端完（优雅停机）。

| 你将学到 | 说明 |
| --- | --- |
| systemd 是什么 | Linux 标准进程守护机制 |
| 编写 service 文件 | ExecStart、User、Restart 等核心指令 |
| 常用管理命令 | start/stop/status/journalctl |
| 优雅停机 | SIGTERM、SuccessExitStatus=143 |

> 💡 **提示：** 判断部署是否「生产级」的试金石：**把服务器重启，应用能自己起来吗？把进程 kill 掉，有人拉起来吗？** 这一篇就是让两个问题的答案都变成「能」。

---

### 二、编写 service 文件

在 `/etc/systemd/system/` 下创建 `myapp.service`：

```ini
[Unit]
Description=myapp - Spring Boot 应用
After=network.target          # 网络就绪后再启动

[Service]
User=appuser                  # ✅ 用专用用户跑，不用 root
Group=appuser
WorkingDirectory=/opt/myapp

# JDK 绝对路径，避免 systemd 环境里找不到 java
ExecStart=/usr/lib/jvm/java-17-openjdk-amd64/bin/java \
    -Xms1g -Xmx1g \
    -XX:+HeapDumpOnOutOfMemoryError \
    -XX:HeapDumpPath=/opt/myapp/dumps/ \
    -jar /opt/myapp/app.jar \
    --spring.profiles.active=prod

# JVM 收到 SIGTERM 退出码为 143（128+15），告诉 systemd 这是正常停止
SuccessExitStatus=143

Restart=on-failure            # 异常退出时自动拉起
RestartSec=10                 # 10 秒后重启，给系统喘息时间

[Install]
WantedBy=multi-user.target    # 多用户模式下启动（即开机自启）
```

#### 核心指令速查

| 指令 | 作用 | 注意 |
| --- | --- | --- |
| `User` / `Group` | 运行身份 | 必须提前创建该用户；用 root 是大忌 |
| `ExecStart` | 启动命令 | java 用**绝对路径**；命令不支持 shell 语法（`>`、`|` 不可用） |
| `Restart=on-failure` | 崩溃自动拉起 | 正常 stop 不拉起；`always` 则手动 stop 也会被拉起（慎用） |
| `SuccessExitStatus=143` | 把 143 视为正常退出 | 不配的话每次正常停机 systemd 都记「失败」 |
| `Environment=` | 注入环境变量 | 如 `Environment="DB_PASSWORD=xxx"`，敏感信息从这里进 |
| `TimeoutStopSec=` | 停机最长等待 | 默认 90s，超时后 systemd 发 SIGKILL 强杀 |

---

### 三、启用与管理服务

```bash
# ① 改了/新建了 service 文件，先让 systemd 重新加载
sudo systemctl daemon-reload

# ② 设置开机自启（创建软链接，一次性）
sudo systemctl enable myapp

# ③ 启动服务
sudo systemctl start myapp

# ④ 查看状态（是否 active (running)、最近日志）
sudo systemctl status myapp

# 其余常用命令
sudo systemctl stop myapp        # 停止（发 SIGTERM，走优雅停机）
sudo systemctl restart myapp     # 重启
sudo systemctl disable myapp     # 取消开机自启
```

`status` 正常输出：

```
● myapp.service - myapp - Spring Boot 应用
     Loaded: loaded (/etc/systemd/system/myapp.service; enabled)
     Active: active (running) since Fri 2026-08-29 10:00:00 CST; 5s ago
   Main PID: 12345 (java)
```

---

### 四、看日志：journalctl

systemd 会自动收集服务的标准输出/错误，用 `journalctl` 查看：

```bash
journalctl -u myapp -f            # 实时跟踪（类似 tail -f）
journalctl -u myapp -n 200        # 最近 200 行
journalctl -u myapp --since today # 今天的日志
journalctl -u myapp --since "2026-08-28 09:00" --until "2026-08-28 18:00"
```

> 💡 **提示：** `journalctl` 适合**临时排障**；应用的完整日志体系（文件落盘、按天轮转、错误告警）仍应在应用侧配置（`logging.file.name`），见下一篇 [[日志与监控]]。两者是补充关系，不是二选一。

---

### 五、优雅停机：别掐断正在处理的请求

`systemctl stop` 默认发 **SIGTERM** 信号。配合应用侧配置，可以让服务「**处理完手头的活再下班**」：

```yaml
# application-prod.yml（Spring Boot 2.3+ 支持）
server:
  shutdown: graceful          # 优雅停机：先停止接收新请求，等存量请求处理完
spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s   # 最多等 30s，默认值
```

完整链路：

```
systemctl stop myapp
    │
    ▼ systemd 发 SIGTERM
JVM 捕获信号（退出码将是 143）
    │
    ▼ Spring Boot graceful shutdown
① 停止接收新请求
② 等待存量请求处理完成（最多 timeout-per-shutdown-phase）
③ 销毁 Bean、释放连接池
    │
    ▼ 进程退出（143）
systemd 看到 SuccessExitStatus=143 → 记录为正常停止 ✅
```

> ⚠️ **注意：** 若不配 `SuccessExitStatus=143`，正常停机也会被 systemd 标记为 failed，监控会误报；若不配 `graceful`，stop 瞬间正在处理的请求直接被掐断，用户看到 502/连接重置。**两处配置缺一不可**。

---

### 六、版本发布与回滚

有了 systemd，发布流程可以标准化：

```bash
# ① 上传新版本 Jar（版本号命名）
rsync -avzP target/myapp-1.1.0.jar appuser@服务器:/opt/myapp/

# ② 切换软链接指向新版本
ln -sfn /opt/myapp/myapp-1.1.0.jar /opt/myapp/app.jar

# ③ 重启服务
sudo systemctl restart myapp

# ④ 验证
sudo systemctl status myapp
curl http://127.0.0.1:8080/actuator/health

# ⑤ 出问题？回滚 = 软链接指回旧版 + 重启，10 秒完成
ln -sfn /opt/myapp/myapp-1.0.0.jar /opt/myapp/app.jar
sudo systemctl restart myapp
```

---

### 七、注意事项汇总

| 类别 | 注意事项 |
| --- | --- |
| 🔴 改 service 文件后必须 `daemon-reload` | 不 reload，改动不生效，你以为配了其实没配 |
| 🔴 ExecStart 不能用 shell 语法 | 重定向、管道写不了；需要时用 `/bin/bash -c '...'` 包一层 |
| 别用 `Restart=always` + 手动 stop | 手动停了它又自己起来，你会怀疑人生 |
| Java 用绝对路径 | systemd 环境不加载 `/etc/profile`，裸 `java` 可能找不到 |
| `TimeoutStopSec` 与优雅停机配合 | 应用 30s 优雅停机 + systemd 默认 90s 强杀窗口，前者要小于后者 |
| 敏感信息走 `Environment=` 或环境文件 | 不要把密码明文写进 ExecStart（`ps` 能看到） |

### 八、总结

systemd 是后端部署「**从能跑 to 能活**」的分界线：`Restart=on-failure` 解决崩溃无人管，`enable` 解决重启后失踪，`SuccessExitStatus=143` + `graceful` 解决停机掐断请求。配好之后，日常操作收敛为三条命令：`start`、`status`、`journalctl -f`。最后一步，让应用「会说话」：[[日志与监控]]。
