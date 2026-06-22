# JVM 调优

> 官方文档：[Java Garbage Collection Tuning Guide](https://docs.oracle.com/en/java/javase/21/gctuning/) ｜ 菜鸟教程：[Java JVM 调优](https://www.runoob.com/java/jvm-tuning.html)

---

## 一、概述

程序写完了、上线了，并不代表万事大吉。随着业务量增长，往往会遇到这些问题：

- 线上突然 **OOM（内存溢出）**，服务直接挂掉；
- 接口响应越来越慢，发现是 **GC 停顿（STW）** 卡住了所有线程；
- 系统吞吐量上不去，CPU 看着没满，但请求就是堆积；
- 内存占用居高不下，怀疑有 **内存泄漏**。

这些问题很多时候不能靠"改业务代码"解决，而是要靠 **JVM 调优**——通过合理配置 **JVM 内存参数** 和 **垃圾回收（GC）策略**，让程序跑得又快又稳。

> 💡 **通俗类比**：JVM 调优就像"调校汽车引擎"。
> - **内存参数**（`-Xms`/`-Xmx`）相当于给引擎分配多少"油箱"；
> - **GC 收集器**相当于选择什么类型的"清道夫"来回收废料；
> - **调优目标**就是让这辆车的"油耗（内存）""提速（响应延迟）""最高时速（吞吐量）"达到平衡。
>
> 引擎本身没坏，但调校得好，性能能差出几倍。

### 调优的三大核心目标

| 目标 | 含义 | 适用场景 | 关注指标 |
|------|------|---------|---------|
| **低停顿（Low Latency）** | GC 造成的 STW 时间尽量短 | 交易系统、即时通讯、游戏服务器 | GC 停顿时间（ms） |
| **高吞吐量（Throughput）** | GC 占总运行时间的比例尽量低 | 离线计算、批处理、大数据 | 吞吐量百分比（如 99%） |
| **低内存占用（Footprint）** | 用尽量少的内存完成任务 | 容器化部署、嵌入式设备 | 堆内存大小（MB/GB） |

> ⚠️ **注意：** 这三个目标往往是**互相矛盾**的——"又想马儿跑，又想马儿不吃草"很难兼得。例如降低停顿通常会牺牲吞吐量，减少内存会增加 GC 频率。调优的本质是在三者间找到**最适合业务的平衡点**。

### 什么时候需要调优？

并不是所有项目都需要调优。以下是常见的**调优触发时机**：

```
┌────────────────────────────────────────────────────────────┐
│                    何时需要 JVM 调优？                       │
├────────────────────────────────────────────────────────────┤
│ ① 频繁 Full GC，系统卡顿明显                                │
│ ② 出现 OOM（OutOfMemoryError），服务崩溃                    │
│ ③ 接口响应时间突增，排查发现是 GC 停顿导致                    │
│ ④ 内存占用过高，怀疑内存泄漏                                  │
│ ⑤ CPU 使用率飙高，但业务流量并没增加                          │
│ ⑥ 上线前/压测阶段，需要预估合理资源                           │
└────────────────────────────────────────────────────────────┘
```

> 💡 **提示：** "不要为了调优而调优"。JVM 默认参数对绝大多数应用已经足够好，只有在出现明确的性能瓶颈时才动手。

---

## 二、JVM 参数体系（重点）

JVM 启动参数是调优的核心手段。所有参数都以 `-` 开头，按规范分为**三大类**：

```
┌─────────────────────────────────────────────────────────────┐
│                    JVM 参数分类                              │
├──────────┬────────────────────────┬─────────────────────────┤
│  类别     │  说明                   │  示例                    │
├──────────┼────────────────────────┼─────────────────────────┤
│ 标准参数  │ 所有 JVM 都支持，最稳定  │ -version、-help          │
│ -X 参数  │ 非标准，各 JVM 较通用    │ -Xms、-Xmx、-Xss         │
│ -XX 参数 │ 高级，可调 JVM 内部行为  │ -XX:+UseG1GC             │
└──────────┴────────────────────────┴─────────────────────────┘
```

### 1. 标准参数

以 `-` 开头，所有 JDK 版本、所有 JVM 实现都必须支持，最稳定。

```bash
java -version          # 查看 JDK 版本
java -help             # 查看帮助
java -showversion      # 启动前先打印版本信息
java -server           # 以 Server 模式运行（64 位 JVM 默认）
```

### 2. -X 参数（非标准参数）

以 `-X` 开头，是日常调优最常用的一类，主要用于**设置内存大小**。

```bash
java -Xms512m -Xmx2g -jar app.jar    # 初始堆 512m，最大堆 2g
```

> 💡 **提示：** `-X` 参数本质上是 `-XX` 参数的"简化写法"，比如 `-Xms` 等价于 `-XX:InitialHeapSize`，`-Xmx` 等价于 `-XX:MaxHeapSize`。

### 3. -XX 参数（高级参数）

以 `-XX` 开头，用于调整 JVM 内部行为（GC 算法、JIT 编译等），分两种形式：

| 形式 | 语法 | 说明 | 示例 |
|------|------|------|------|
| **Boolean 型** | `-XX:+<选项>` / `-XX:-<选项>` | 开启（`+`）或关闭（`-`）某功能 | `-XX:+UseG1GC`、`-XX:-UseGCOverheadLimit` |
| **键值型（KV）** | `-XX:<选项>=<值>` | 设置某个参数的具体值 | `-XX:MaxGCPauseMillis=200` |

```bash
# 开启 G1 收集器，并设置最大 GC 停顿 200ms
java -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -jar app.jar
```

> ⚠️ **注意：** 用 `java -XX:+PrintFlagsFinal -version` 可以打印出 JVM **所有参数及默认值**，是查参数的最权威方式。

---

## 三、常用内存参数详解（重点）

这是 JVM 调优最核心的部分，掌握下面这张表就能应对 80% 的场景。

### 内存参数速查表

| 参数 | 作用 | 默认值（JDK 21） | 推荐设置 |
|------|------|----------------|---------|
| `-Xms` | 初始堆大小 | 物理内存的 1/64 | 与 `-Xmx` 相同 |
| `-Xmx` | 最大堆大小 | 物理内存的 1/4 | 物理内存的 60%~80% |
| `-Xmn` | 新生代大小 | 堆的 1/3 | 一般不动，让 G1 自适应 |
| `-Xss` | 每个线程的栈大小 | 512KB~1MB | 默认即可，深递归可调大 |
| `-XX:MetaspaceSize` | 元空间初始大小（触发 Full GC 阈值） | 平台相关 | 256m |
| `-XX:MaxMetaspaceSize` | 元空间最大大小 | 无上限（受物理内存限制） | 512m |
| `-XX:SurvivorRatio` | Eden 与 Survivor 的比例 | 8（即 8:1:1） | 默认 |
| `-XX:NewRatio` | 老年代与新生代的比例 | 2（即老:新 = 2:1） | 默认 |
| `-XX:MaxTenuringThreshold` | 对象晋升老年代的年龄阈值 | 15（G1 为 15） | 默认 |

### 1. 堆大小参数（最常用）

```bash
java -Xms4g -Xmx4g -jar app.jar
#      │       │
#      │       └─ 最大堆 4GB（程序最多能用这么多堆内存）
#      └───────── 初始堆 4GB（JVM 启动就分配这么多）
```

> 💡 **为什么 `-Xms` 和 `-Xmx` 建议设成相同？**
> 如果两者不同，JVM 会根据负载动态扩容/缩容堆。每次扩容都可能触发 **Full GC**，缩容也带来性能开销。设成相同后，堆大小固定，**避免了动态调整带来的 GC 抖动**，特别适合生产环境。

### 2. 元空间参数（Java 8+ 替代永久代）

```bash
java -XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=512m -jar app.jar
```

- `MetaspaceSize` 不是"初始大小"，而是**触发 Full GC 的阈值**——元空间使用量超过它就会触发 Full GC 并扩容。
- `MaxMetaspaceSize` 是元空间的上限，不设的话默认无上限，可能一直涨直到耗尽物理内存。

> ⚠️ **注意：** 大量使用动态代理、CGLIB、反射生成类的框架（如 Spring、MyBatis、Groovy 脚本）容易出现**元空间溢出**（`OutOfMemoryError: Metaspace`），务必设置 `MaxMetaspaceSize`。

### 3. 新生代 / 老年代比例

```
┌─────────────────── 堆（Heap）──────────────────────┐
│                                                    │
│   新生代（Young）          老年代（Old）             │
│  ┌─────┬────┬────┐                                 │
│  │Eden │ S0 │ S1 │                                 │
│  │ 8   │ 1  │ 1  │                                 │
│  └─────┴────┴────┘                                 │
│   ←—— SurvivorRatio=8 ——→                          │
│                                                    │
│   ←——— NewRatio=2（老:新=2:1）———————→              │
└────────────────────────────────────────────────────┘
```

```bash
# Eden : Survivor = 8 : 1（默认），即 Eden:S0:S1 = 8:1:1
java -XX:SurvivorRatio=8 -jar app.jar

# 老年代 : 新生代 = 2 : 1（默认）
java -XX:NewRatio=2 -jar app.jar
```

### 4. 线程栈大小

```bash
java -Xss256k -jar app.jar    # 每个线程分配 256KB 栈空间
```

- 默认 512KB~1MB，一般够用。
- 调**小**（如 256KB）：能创建更多线程（栈小了，同样内存能开更多线程）。
- 调**大**（如 2MB）：适合**递归很深**的程序，避免 `StackOverflowError`。

### 5. 常用 GC 参数

| 参数 | 作用 | 示例 |
|------|------|------|
| `-XX:+UseG1GC` | 使用 G1 收集器（JDK 9+ 默认） | `-XX:+UseG1GC` |
| `-XX:+UseParallelGC` | 使用 Parallel 收集器（JDK 8 默认） | `-XX:+UseParallelGC` |
| `-XX:+UseZGC` | 使用 ZGC（超低延迟） | `-XX:+UseZGC` |
| `-XX:MaxGCPauseMillis` | 期望最大 GC 停顿时间（ms） | `-XX:MaxGCPauseMillis=200` |
| `-XX:ParallelGCThreads` | GC 线程数 | `-XX:ParallelGCThreads=4` |
| `-XX:ConcGCThreads` | 并发 GC 线程数 | `-XX:ConcGCThreads=2` |

---

## 四、JDK 自带监控与诊断工具（重点）

JDK 自带了一整套命令行工具，无需安装，**线上排查必备**。下面逐个讲解。

### 工具速览表

| 工具 | 作用 | 典型命令 |
|------|------|---------|
| `jps` | 查看 Java 进程 | `jps -l` |
| `jstat` | 监控 GC、类加载 | `jstat -gc pid 1000` |
| `jstack` | 查看线程堆栈 | `jstack pid` |
| `jmap` | 查看内存、dump 堆 | `jmap -dump:format=b,file=heap.hprof pid` |
| `jhat` | 分析 heap dump（已过时） | 建议用 MAT |
| `jcmd` | 综合命令（Java 8+ 推荐） | `jcmd pid VM.flags` |

### 1. jps —— 查看 Java 进程

类似 `ps`，但只列 Java 进程，并显示主类名。

```bash
$ jps -l
12345 com.example.MainApplication
23456 sun.tools.jps.Jps
```

| 选项 | 说明 |
|------|------|
| `-q` | 只输出进程 ID |
| `-l` | 输出完整包名 / jar 路径 |
| `-m` | 输出 main 方法的参数 |
| `-v` | 输出 JVM 启动参数 |

### 2. jstat —— 监控 GC 与类加载

**排查 GC 问题首选工具**，可以实时查看各代内存使用和 GC 次数。

```bash
# 每 1000ms 打印一次 pid 的 GC 情况，共打印 10 次
$ jstat -gc 12345 1000 10
 S0C    S1C    ...   YGC   YGCT   FGC   FGCT   GCT
1024.0 1024.0  ...   15    0.234   2    0.156  0.390
```

**关键列含义**：

| 列名 | 含义 |
|------|------|
| `S0C` / `S1C` | Survivor0 / Survivor1 **当前**容量（KB） |
| `S0U` / `S1U` | Survivor0 / Survivor1 **已用**（KB） |
| `EC` / `EU` | Eden 当前容量 / 已用 |
| `OC` / `OU` | 老年代当前容量 / 已用 |
| `MC` / `MU` | 元空间当前容量 / 已用 |
| `YGC` / `YGCT` | Young GC **次数** / **总耗时**（秒） |
| `FGC` / `FGCT` | Full GC **次数** / **总耗时**（秒） |
| `GCT` | 所有 GC 总耗时 |

> 💡 **排查思路**：重点关注 `FGC`（Full GC 次数）和 `FGCT`（Full GC 耗时）。如果短时间内 `FGC` 飙升，说明老年代频繁被填满，需要排查内存泄漏或调大堆。

常用选项：

```bash
jstat -gcutil pid 1000      # 只看各代使用率百分比（更直观）
jstat -gcnew pid            # 只看新生代
jstat -gcold pid            # 只看老年代
jstat -class pid            # 查看类加载情况
jstat -gccause pid          # 额外显示上次 GC 原因
```

### 3. jstack —— 查看线程堆栈

**排查 CPU 飙高、死锁、线程阻塞的利器**。它会打印 JVM 中所有线程的调用栈。

```bash
jstack 12345 > thread_dump.txt    # 导出所有线程堆栈
jstack -l 12345                   # 额外打印锁信息（排查死锁）
```

输出片段示例：

```
"http-nio-8080-exec-3" #25 daemon prio=5 os_prio=31 tid=0x... nid=0x... waiting on condition
   java.lang.Thread.State: WAITING (parking)
        at sun.misc.Unsafe.park(Native Method)
        - parking to wait for  <0x...> (a java.util.concurrent.locks.ReentrantLock)
        ...
```

> 💡 **关键字段**：
> - `Thread.State`：线程状态（`RUNNABLE` 运行中、`BLOCKED` 阻塞、`WAITING` 等待）。
> - `nid`：线程的**操作系统层面的 ID（十六进制）**，配合 `top -Hp` 可定位高 CPU 线程。
> - jstack 末尾会自动检测并打印死锁（`Found Java-level deadlock`）。

### 4. jmap —— 查看内存与 dump 堆

```bash
# 查看堆内存概况（各代大小、使用率）
jmap -heap 12345

# 查看对象统计（按占用大小排序，前 20 个）
jmap -histo 12345 | head -20

# 只看存活对象（会触发 Full GC，慎用！）
jmap -histo:live 12345 | head -20

# 导出堆 dump 文件（用于 MAT 分析，最常用）
jmap -dump:format=b,file=heap.hprof 12345

# 导出存活对象的 dump（会先触发 Full GC）
jmap -dump:live,format=b,file=heap.hprof 12345
```

> ⚠️ **注意：** `jmap -histo:live` 和 `jmap -dump:live` 会**触发一次 Full GC**，生产环境慎用，建议在低峰期执行。JDK 8 较新版本起，推荐用 `jcmd pid GC.heap_dump` 替代，更安全。

### 5. jhat —— 分析 heap dump（已过时）

`jhat` 可启动一个 Web 服务来浏览 heap dump，但它**启动慢、吃内存、已废弃**，从 JDK 9 起被移除。

> 💡 **现代替代方案**：使用 **Eclipse MAT（Memory Analyzer Tool）**，分析速度快、可视化好，能自动定位内存泄漏嫌疑对象。

### 6. jcmd —— 综合命令（Java 8+ 推荐）

`jcmd` 是一个"瑞士军刀"，整合了 jps、jstack、jmap 等工具的能力，**官方推荐**。

```bash
jcmd                           # 列出所有 Java 进程
jcmd pid help                  # 查看该进程支持的所有命令
jcmd pid VM.flags              # 查看 JVM 启动参数
jcmd pid Thread.print          # 等价于 jstack
jcmd pid GC.heap_info          # 等价于 jmap -heap
jcmd pid GC.class_histogram    # 等价于 jmap -histo
jcmd pid GC.heap_dump dump.hprof   # 等价于 jmap -dump（更安全）
jcmd pid GC.run                # 主动触发一次 GC
```

---

## 五、可视化与第三方工具

命令行工具适合快速排查，可视化工具更适合**深入分析**。

| 工具 | 类型 | 特点 | 适用场景 |
|------|------|------|---------|
| **jconsole** | JDK 自带 | 基于 JMX，实时监控内存/线程/类 | 快速查看运行状态 |
| **jvisualvm** | JDK 自带（8 之前） | 可视化、可装插件、支持 heap dump | 本地开发调试 |
| **Arthas** | 阿里开源（免费） | 线上诊断神器，无需重启应用 | 线上问题排查 |
| **MAT** | Eclipse 开源（免费） | 专业分析 heap dump，找内存泄漏 | OOM 分析 |
| **JProfiler** | 商业（收费） | 功能强大，CPU/内存/线程全覆盖 | 深度性能分析 |
| **YourKit** | 商业（收费） | 轻量高效，UI 友好 | 深度性能分析 |

### 1. jconsole / jvisualvm

```bash
jconsole       # 启动后选择进程即可连接
jvisualvm      # 启动后可查看本地/远程 JVM
```

> 💡 **提示：** 从 JDK 9 起，`jvisualvm` 不再随 JDK 一起发布，需要单独从 [VisualVM 官网](https://visualvm.github.io/) 下载。

### 2. Arthas（线上诊断神器）

阿里巴巴开源的 Java 诊断工具，**不用重启应用、不用改代码**就能在线排查问题。

```bash
# 下载并启动
curl -O https://arthas.aliyun.com/arthas-boot.jar
java -jar arthas-boot.jar    # 选择要诊断的 Java 进程
```

常用命令：

| 命令 | 作用 |
|------|------|
| `dashboard` | 实时面板（线程、内存、GC） |
| `thread` | 查看线程信息，`thread -n 3` 找 CPU 最高的 3 个线程 |
| `trace 类 方法` | 查看方法内部调用链耗时 |
| `watch 类 方法 '{params, returnObj}'` | 查看方法入参和返回值 |
| `jad 类` | 反编译指定类（看线上真实代码） |
| `heapdump /tmp/dump.hprof` | 导出堆 dump |

### 3. MAT（Memory Analyzer Tool）

Eclipse 基金会开源，**分析 heap dump、定位内存泄漏**的专业工具。

**核心功能**：
- **Histogram**：按类统计对象数量和大小。
- **Dominator Tree**：按对象"支配关系"排序，快速找到占内存最大的对象。
- **Leak Suspects Report**：自动生成内存泄漏嫌疑报告。

> 💡 **排查 OOM 的标准流程**：`jmap` dump → MAT 打开 → 看 Leak Suspects 报告 → 定位泄漏对象 → 找到代码。

---

## 六、GC 日志与分析

GC 日志是判断 GC 是否健康的"病历本"，**生产环境必须开启**。

### 1. 开启 GC 日志

**JDK 9 及以上**（统一日志框架 `-Xlog`）：

```bash
java -Xlog:gc*=info:file=/var/log/gc.log:time,uptime,level,tags:filecount=5,filesize=20m -jar app.jar
#      └─ gc*=info  记录所有 gc 相关日志，级别 info
#                   └─ 输出到文件，附带时间/运行时长/级别/标签
#                                  └─ 滚动：最多 5 个文件，每个 20MB
```

**JDK 8**（旧式参数）：

```bash
java -XX:+PrintGCDetails -XX:+PrintGCDateStamps -Xloggc:/var/log/gc.log -XX:+UseGCLogFileRotation -XX:NumberOfGCLogFiles=5 -XX:GCLogFileSize=20M -jar app.jar
```

> ⚠️ **注意：** JDK 9+ 强烈建议用 `-Xlog`，旧的 `-XX:+PrintGCDetails` 已废弃。

### 2. GC 日志分析工具

手动看 GC 日志很费眼，推荐用工具：

| 工具 | 类型 | 特点 |
|------|------|------|
| **GCViewer** | 开源（本地） | 离线分析，生成图表 |
| **GCEasy** | 在线（gceasy.io） | 上传日志，自动出报告，最简单 |
| **JDK Mission Control (JMC)** | Oracle 官方 | 配合 JFR 深度分析 |

**GCEasy 关键指标**：

- **吞吐量**（Throughput）：非 GC 时间占比，建议 > 95%。
- **平均 GC 停顿**：建议 < 200ms。
- **最大 GC 停顿**：评估是否影响用户体验。
- **Young GC / Full GC 次数与耗时分布**。

---

## 七、常见调优场景（重点）

### 场景一：内存溢出（OOM）排查

**现象**：服务抛出 `OutOfMemoryError: Java heap space` 后崩溃或重启。

**排查步骤**：

```
┌──────────────────────────────────────────────────────────┐
│                  OOM 排查流程                              │
├──────────────────────────────────────────────────────────┤
│ ① 加启动参数，让 OOM 时自动 dump                           │
│    -XX:+HeapDumpOnOutOfMemoryError                       │
│    -XX:HeapDumpPath=/data/dump/                          │
│                                                          │
│ ② 用 MAT 打开 heap dump 文件                              │
│                                                          │
│ ③ 查看 Leak Suspects 报告，找到嫌疑对象                    │
│                                                          │
│ ④ Dominator Tree 找占用最大的对象                          │
│                                                          │
│ ⑤ 定位到具体代码（哪个集合/缓存持续增长）                   │
│                                                          │
│ ⑥ 修复代码（限制缓存大小、及时释放资源）                     │
└──────────────────────────────────────────────────────────┘
```

**推荐启动参数**（生产环境必备）：

```bash
java -Xms4g -Xmx4g \
     -XX:+HeapDumpOnOutOfMemoryError \
     -XX:HeapDumpPath=/data/dump/ \
     -jar app.jar
```

> 💡 **常见 OOM 根因**：静态集合不断 put 不 remove（缓存泄漏）、ThreadLocal 没清理、大文件一次性读入内存、`ArrayList` 误用导致无限增长。

### 场景二：CPU 飙高排查

**现象**：服务 CPU 使用率持续飙到 90%+，但流量并未明显增加。

**标准排查三连**（`top` → `top -Hp` → `jstack`）：

```bash
# 第 1 步：用 top 找出 CPU 最高的 Java 进程
$ top
  PID  USER      %CPU  COMMAND
  12345 appuser   98.6  java            # ← 找到 pid 12345

# 第 2 步：用 top -Hp 找出该进程中 CPU 最高的线程
$ top -Hp 12345
  PID    USER  %CPU  COMMAND
  12378  appuser 95.2  java             # ← 线程 pid 12378

# 第 3 步：把线程 pid 转成十六进制
$ printf "%x\n" 12378
304a                                   # ← 十六进制 nid = 0x304a

# 第 4 步：用 jstack 找到该线程的堆栈
$ jstack 12345 | grep -A 30 "nid=0x304a"
"http-nio-80-exec-3" nid=0x304a runnable
   at com.example.Service.slowMethod(Service.java:88)   # ← 定位到代码行
```

> 💡 **原理**：`top -Hp` 看到的是**操作系统线程 ID（十进制）**，而 jstack 输出的 `nid` 是**十六进制**，两者要转换后才能对应。CPU 飙高常见根因：死循环、频繁 GC、正则灾难、加密计算。

### 场景三：频繁 Full GC 调优

**现象**：`jstat -gcutil` 看到 `FGC` 次数快速上涨，系统卡顿。

**排查思路**：

| 可能原因 | 排查方式 | 解决方案 |
|---------|---------|---------|
| 老年代空间不足 | `jstat -gc` 看 `OU` 接近 `OC` | 调大 `-Xmx` 或排查大对象 |
| 内存泄漏 | dump 后用 MAT 分析 | 修复泄漏代码 |
| 大对象直接进老年代 | 代码中频繁创建大数组/大字符串 | 优化业务，避免大对象 |
| 元空间不足触发 | `jstat -gc` 看 `MU` 接近 `MC` | 调大 `MaxMetaspaceSize` |
| 显式调用 `System.gc()` | 代码搜索 `System.gc` | 加 `-XX:+DisableExplicitGC` 禁用 |

```bash
# 禁用代码里的 System.gc()，防止程序员乱触发 Full GC
java -XX:+DisableExplicitGC -jar app.jar
```

### 场景四：请求响应慢

**现象**：接口 RT（响应时间）突增，但 CPU、内存都不高。

**排查思路**：

```
1. 看 GC 日志：是否有长时间 STW 停顿？
       └─ 是 → 调 GC 收集器（换 G1/ZGC）或优化堆
       └─ 否 → 继续

2. 用 jstack 连续抓 3 次线程栈：是否有大量线程 BLOCKED/WAITING？
       └─ 是 → 排查锁竞争、外部调用超时、数据库慢查询
       └─ 否 → 继续

3. 用 Arthas trace 看方法调用链耗时：哪一步最慢？
       └─ 定位到具体慢调用（如远程接口、数据库）
```

---

## 八、GC 收集器选择（重点对比）

不同 GC 收集器适用于不同场景。选对收集器，调优就成功了一半。

### GC 收集器对比表

| 收集器 | 分代 | 算法 | 停顿时间 | 吞吐量 | 适用版本 | 适用场景 |
|--------|------|------|---------|--------|---------|---------|
| **Serial** | 新生代/老年代 | 复制/标记整理 | 长 | 一般 | 全版本 | 单核、小内存、客户端 |
| **Parallel Scavenge** | 新生代 | 复制 | 中 | **高** | JDK 8 默认 | 后台计算、批处理 |
| **ParNew + CMS** | 新生代/老年代 | 复制/标记清除 | **短** | 中 | JDK 8 之前 | Web 服务（CMS 已废弃） |
| **G1** | 整堆（Region） | 整体标记整理 + 局部复制 | **可控** | 较高 | **JDK 9+ 默认** | 大堆（>4G）、平衡场景 |
| **ZGC** | 整堆 | 染色指针 + 读屏障 | **<10ms** | 高 | JDK 11+（15 转正） | 超大堆、超低延迟 |
| **Shenandoah** | 整堆 | Brooks 转发指针 | **<10ms** | 高 | OpenJDK 12+ | 超大堆、超低延迟 |

### 各代际关系图

```
┌──────────────────────────────────────────────────────────────┐
│                    GC 收集器演进时间线                          │
├──────────────────────────────────────────────────────────────┤
│  JDK 1.3  ：Serial            （单线程，基本款）                │
│  JDK 1.4  ：Parallel           （多线程，吞吐量优先）           │
│  JDK 1.5  ：CMS                （并发，低停顿）                 │
│  JDK 7   ：G1                  （Region 化）                    │
│  JDK 9   ：G1 成为默认          （CMS 标记废弃）                 │
│  JDK 11  ：ZGC 实验性          （<10ms 停顿）                   │
│  JDK 14  ：CMS 被移除                                           │
│  JDK 15  ：ZGC 转正（生产可用）  Shenandoah 转正                │
│  JDK 21  ：分代 ZGC（JEP 439）  （性能进一步提升）               │
└──────────────────────────────────────────────────────────────┘
```

### 选择建议

| 场景 | 堆大小 | 延迟要求 | 推荐收集器 |
|------|--------|---------|-----------|
| 单核 / 嵌入式 | <512MB | 不敏感 | **Serial**（`-XX:+UseSerialGC`） |
| 离线计算 / 大数据 | 任意 | 不敏感 | **Parallel**（`-XX:+UseParallelGC`） |
| 通用 Web 服务（4G~8G） | 中等 | 平衡 | **G1**（`-XX:+UseG1GC`，默认） |
| 大堆 / 低延迟（>8G） | 大 | <200ms | **G1** 调优 |
| 超大堆 / 超低延迟 | 任意 | <10ms | **ZGC**（`-XX:+UseZGC`） |

> 💡 **提示：** 大多数应用直接用默认的 **G1** 即可，它本身就是为"平衡吞吐和延迟"设计的。只有堆特别大（几十 G）或对延迟极其敏感（<10ms）才考虑 ZGC。

### G1 收集器核心参数

```bash
java -XX:+UseG1GC \
     -XX:MaxGCPauseMillis=200 \      # 期望最大停顿 200ms（软目标）
     -XX:G1HeapRegionSize=16m \      # Region 大小（1~32m，默认自适应）
     -XX:InitiatingHeapOccupancyPercent=45 \  # 堆使用达 45% 触发并发标记
     -XX:G1NewSizePercent=20 \        # 新生代最小占比
     -XX:G1MaxNewSizePercent=60 \     # 新生代最大占比
     -jar app.jar
```

> ⚠️ **注意：** `MaxGCPauseMillis` 是 **软目标**，G1 会努力达到但不保证。设得太小（如 10ms）反而会让 G1 频繁 GC，吞吐量暴跌。

---

## 九、实战调优案例

### 案例一：堆设置过小导致频繁 GC

**现象**：一个电商服务上线后，`jstat -gcutil` 显示：

```
  S0     S1     E      O      M     YGC   YGCT   FGC   FGCT   GCT
  0.00  85.42  92.31  78.55  95.20  432   12.3    45   38.6   50.9
```

**问题分析**：
- `FGC=45`，Full GC 次数异常多；
- `O=78.55%`，老年代使用率高，频繁触发 Full GC；
- 原 JVM 参数只有 `-Xms512m -Xmx512m`，堆太小。

**调优过程**：

```bash
# 调整前
java -Xms512m -Xmx512m -jar app.jar

# 调整后：扩大堆，并设相同，用 G1
java -Xms4g -Xmx4g -XX:+UseG1GC -XX:MaxGCPauseMillis=200 -jar app.jar
```

**调优后效果**：Full GC 次数从 45 次/小时降到 1~2 次/天，接口平均 RT 下降 60%。

### 案例二：元空间溢出

**现象**：一个使用大量 CGLIB 动态代理的服务报错：

```
java.lang.OutOfMemoryError: Metaspace
```

**问题分析**：
- 服务频繁加载新类（动态生成代理类）；
- `MaxMetaspaceSize` 没设，元空间不断增长直到耗尽内存；
- 类加载后无法被卸载（存在引用）。

**调优过程**：

```bash
# 调整前：没有设置元空间上限
java -jar app.jar

# 调整后：限制元空间大小，并排查是否有类泄漏
java -XX:MetaspaceSize=256m -XX:MaxMetaspaceSize=512m -jar app.jar
```

**进一步排查**：用 `jcmd pid GC.class_histogram` 看类数量，发现有几千个 `xxx$$EnhancerByCGLIB$$xxxx` 类，最终定位到某处循环里反复生成代理类，改为缓存代理类后解决。

---

## 十、调优注意事项与陷阱

调优不是"凭感觉改参数"，而是一门**数据驱动**的工程。以下是几条铁律：

### 1. 先监控，后调优

> ⚠️ **最大忌讳**：不抓数据、盲目改参数。

调优前必须先用 `jstat`、GC 日志、监控平台（如 Prometheus + Grafana）**采集基线数据**，明确瓶颈在哪里（是 GC 停顿？内存泄漏？CPU？锁？），再对症下药。

### 2. 一次只改一个参数

改一个参数 → 观察 → 再改下一个。否则无法判断哪个改动起作用，甚至多个改动互相抵消。

### 3. `-Xms` 与 `-Xmx` 设为相同

避免堆动态扩缩容带来的 GC 抖动，生产环境**必须**相同。

### 4. 避免使用过大的堆

堆越大，Full GC 停顿越长（除非用 ZGC/Shenandoah）。一般单实例堆**不超过 32G**（指针压缩在 32G 后失效，对象引用会变大）。

```
普通对象指针压缩（CompressedOops）
├─ 堆 ≤ 32G：开启，引用 4 字节
└─ 堆 > 32G：关闭，引用 8 字节，反而更耗内存
```

### 5. 调优前先确定目标

- 是要**吞吐量**（选 Parallel / G1 调大吞吐）？
- 还是要**低延迟**（选 G1 调小停顿 / ZGC）？
- 还是要**低内存**（调小堆、用 Serial）？

目标不清，调优无从谈起。

### 6. 容器环境下注意内存限制

Docker/K8s 中，JVM 可能**误判**容器内存（尤其老版本 JDK 8），导致 OOM Killed。

```bash
# JDK 8u191+ / JDK 10+，JVM 能识别容器内存限制
java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -jar app.jar
#      └─ 开启容器支持（默认开）   └─ 使用容器内存的 75% 作为堆
```

> 💡 **提示：** 容器内不要用 `-Xmx` 硬编码绝对值（如 `-Xmx2g`），改用 `MaxRAMPercentage`，让 JVM 根据容器内存自动适配，更灵活。

### 7. 生产环境务必开启 GC 日志和 OOM 自动 dump

这是**线上排障的最后保险**，没开的话真出问题时会"两眼一抹黑"。

```bash
java -Xms4g -Xmx4g \
     -XX:+HeapDumpOnOutOfMemoryError \
     -XX:HeapDumpPath=/data/dump/ \
     -Xlog:gc*=info:file=/var/log/gc.log:time,uptime:filecount=5,filesize=20m \
     -jar app.jar
```

---

## 十一、面试常见问题

### Q1：常用的 JVM 参数有哪些？

**核心回答**：

| 类别 | 参数 | 作用 |
|------|------|------|
| 堆内存 | `-Xms` / `-Xmx` | 初始堆 / 最大堆 |
| 新生代 | `-Xmn` | 新生代大小 |
| 栈 | `-Xss` | 线程栈大小 |
| 元空间 | `-XX:MetaspaceSize` / `-XX:MaxMetaspaceSize` | 元空间大小 |
| GC | `-XX:+UseG1GC` / `-XX:MaxGCPauseMillis` | 选择 G1，设停顿目标 |
| OOM | `-XX:+HeapDumpOnOutOfMemoryError` | OOM 自动 dump |

### Q2：jstack、jmap、jstat 各有什么用途？

- **jstack**：打印线程堆栈，排查 **CPU 飙高、死锁、线程阻塞**。
- **jmap**：查看堆内存、dump 堆快照，排查 **OOM、内存泄漏**。
- **jstat**：监控 GC、类加载，排查 **频繁 GC、内存使用**。

### Q3：线上 CPU 飙高怎么排查？

经典四步：

1. `top` 找到 CPU 最高的 Java **进程** pid；
2. `top -Hp <pid>` 找到 CPU 最高的**线程** pid；
3. `printf "%x\n" <线程pid>` 转成**十六进制** nid；
4. `jstack <pid> | grep <nid>` 定位到**代码行**。

### Q4：线上 OOM 怎么排查？

1. 启动时加 `-XX:+HeapDumpOnOutOfMemoryError`，OOM 时自动 dump；
2. 用 **MAT** 打开 dump 文件；
3. 看 **Leak Suspects** 报告找嫌疑对象；
4. 用 **Dominator Tree** 找占用最大的对象；
5. 定位到具体代码并修复（通常是集合无限增长、缓存不清理、资源不释放）。

### Q5：如何选择 GC 收集器？

- **吞吐量优先**（批处理、大数据）：Parallel。
- **平衡吞吐和延迟**（大多数 Web 服务）：**G1**（JDK 9+ 默认）。
- **超低延迟**（<10ms，超大堆）：**ZGC** 或 Shenandoah。
- **小内存/单核**：Serial。

口诀：**小用 Serial，算用 Parallel，通用 G1，极致 ZGC**。

### Q6：为什么 `-Xms` 和 `-Xmx` 建议设为相同？

避免 JVM 动态扩容/缩容堆带来的 **GC 抖动** 和性能开销。堆大小固定后，运行更平稳，特别适合生产环境。

### Q7：JVM 调优的基本原则是什么？

1. **先监控后调优**，用数据说话；
2. **一次只改一个参数**，便于归因；
3. **明确目标**（吞吐 vs 延迟 vs 内存）；
4. **避免过大堆**（GC 停顿长、指针压缩失效）；
5. **生产环境开 GC 日志和 OOM dump**；
6. **不要为了调优而调优**，默认参数往往已够好。

### Q8：Full GC 频繁怎么排查？

依次检查：

1. 老年代是否空间不足（`jstat -gc` 看 OU/OC）→ 调大堆或查大对象；
2. 是否有内存泄漏 → dump + MAT 分析；
3. 元空间是否不足（看 MU/MC）→ 调大 `MaxMetaspaceSize`；
4. 是否代码调用 `System.gc()` → 加 `-XX:+DisableExplicitGC`；
5. 是否大对象直接进老年代 → 优化业务代码。

---

## 十二、总结

JVM 调优不是玄学，而是一套**有章可循的工程方法**。核心要点回顾：

```
┌──────────────────────────────────────────────────────────────┐
│                    JVM 调优核心知识地图                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  【三大目标】低停顿 · 高吞吐 · 低内存（互相制衡）             │
│       │                                                      │
│       ▼                                                      │
│  【两大手段】                                                 │
│   ├─ 内存参数：-Xms/-Xmx/-Xmn/-Xss/MetaspaceSize             │
│   └─ GC 策略： G1（默认）· ZGC（超低延迟）· Parallel（吞吐）  │
│       │                                                      │
│       ▼                                                      │
│  【诊断工具】                                                 │
│   ├─ 命令行： jps · jstat · jstack · jmap · jcmd             │
│   ├─ 可视化： jconsole · jvisualvm · Arthas · MAT            │
│   └─ 日志：   GC 日志（GCEasy 分析）+ OOM 自动 dump           │
│       │                                                      │
│       ▼                                                      │
│  【排查套路】                                                 │
│   ├─ OOM：   jmap dump → MAT → 定位泄漏对象                  │
│   ├─ CPU高： top → top -Hp → 十六进制 → jstack                │
│   ├─ Full GC： jstat 看各代 → 查泄漏/大对象/元空间            │
│   └─ 响应慢： GC 日志 + jstack 锁竞争 + Arthas trace          │
│       │                                                      │
│       ▼                                                      │
│  【六条铁律】                                                 │
│   先监控后调优 · 一次一参 · Xms=Xmx · 不用过大堆               │
│   明确目标 · 生产开日志+dump                                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**一句话总结**：调优的本质是**在停顿、吞吐、内存三者间为业务找到最佳平衡**，手段是**调内存参数 + 选 GC 收集器**，方法是**用工具观测 + 数据驱动决策**，禁忌是**盲目改参、一改一堆**。

---

> 📖 **相关文档**：JVM 调优的前提是理解 JVM 内存结构，强烈建议先阅读 [内存.md](./内存.md)，了解堆、栈、方法区、新生代/老年代等核心概念，再回头看本文档会更顺畅。
