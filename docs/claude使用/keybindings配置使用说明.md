# keybindings.json 使用说明

## 什么是 keybindings.json

`keybindings.json` 是**快捷键配置文件**，让你可以自定义键盘快捷键，按自己的习惯操作 Claude Code。

> **通俗理解**：就像软件的"快捷键设置"，你可以把常用的操作设置成自己喜欢的按键组合。

## 文件位置

```
~/.claude/keybindings.json
```

## 为什么需要自定义快捷键

### 默认快捷键

| 操作 | 默认快捷键 |
|------|-----------|
| 提交消息 | `Ctrl + Enter` |
| 取消操作 | `Escape` |
| 中断执行 | `Ctrl + C` |
| 退出程序 | `Ctrl + D` |

### 自定义场景

- 与其他工具保持一致
- 适应不同的键盘布局
- 个人操作习惯
- 避免按键冲突

## 配置结构

```json
{
  "submit": "ctrl+enter",
  "cancel": "escape",
  "interrupt": "ctrl+c",
  "quit": "ctrl+d"
}
```

## 可配置的快捷键

### 1. submit - 提交消息

发送用户输入给 Claude。

| 值 | 说明 |
|----|------|
| `ctrl+enter` | Ctrl + Enter（默认） |
| `enter` | 单独 Enter |
| `ctrl+s` | Ctrl + S |

**使用场景**：
- 默认 `Ctrl+Enter` 避免误提交
- 改为 `Enter` 适合快速对话
- 改为 `Ctrl+S` 适合保存习惯

### 2. cancel - 取消操作

取消当前输入或操作。

| 值 | 说明 |
|----|------|
| `escape` | Escape 键（默认） |
| `ctrl+c` | Ctrl + C |
| `ctrl+g` | Ctrl + G |

### 3. interrupt - 中断执行

中断正在运行的命令。

| 值 | 说明 |
|----|------|
| `ctrl+c` | Ctrl + C（默认） |
| `ctrl+x` | Ctrl + X |
| `ctrl+shift+c` | Ctrl + Shift + C |

### 4. quit - 退出程序

退出 Claude Code。

| 值 | 说明 |
|----|------|
| `ctrl+d` | Ctrl + D（默认） |
| `ctrl+q` | Ctrl + Q |
| `ctrl+shift+q` | Ctrl + Shift + Q |

### 5. clear - 清除历史

清除对话历史。

| 值 | 说明 |
|----|------|
| `ctrl+l` | Ctrl + L |

### 6. help - 显示帮助

显示帮助信息。

| 值 | 说明 |
|----|------|
| `ctrl+h` | Ctrl + H |

### 7. historyUp / historyDown

浏览历史输入。

| 值 | 说明 |
|----|------|
| `ctrl+p` / `ctrl+n` | 上一个/下一个历史 |

## 按键格式

### 基本按键

```
a, b, c, ..., z          # 字母键
0, 1, 2, ..., 9          # 数字键
enter, escape, space, tab
backspace, delete
up, down, left, right    # 方向键
home, end, pageup, pagedown
```

### 修饰键

```
ctrl+    # Control
alt+     # Alt/Option
shift+   # Shift
meta+    # Command/Mac 键
```

### 组合示例

```
ctrl+enter           # Ctrl + Enter
ctrl+shift+a         # Ctrl + Shift + A
alt+cmd+s            # Alt + Command + S
ctrl+alt+delete      # Ctrl + Alt + Delete
```

## 完整示例

```json
{
  "submit": "ctrl+enter",
  "cancel": "escape",
  "interrupt": "ctrl+c",
  "quit": "ctrl+d",
  "clear": "ctrl+l",
  "help": "ctrl+h",
  "historyUp": "ctrl+p",
  "historyDown": "ctrl+n"
}
```

## 不同平台的建议配置

### Windows/Linux

```json
{
  "submit": "ctrl+enter",
  "cancel": "escape",
  "interrupt": "ctrl+c",
  "quit": "ctrl+d"
}
```

### macOS

```json
{
  "submit": "cmd+enter",
  "cancel": "escape",
  "interrupt": "ctrl+c",
  "quit": "cmd+q"
}
```

### Vim 用户习惯

```json
{
  "submit": "ctrl+j",
  "cancel": "ctrl+[",
  "interrupt": "ctrl+c",
  "quit": "shift+zz"
}
```

### Emacs 用户习惯

```json
{
  "submit": "ctrl+x ctrl+s",
  "cancel": "ctrl+g",
  "interrupt": "ctrl+c",
  "quit": "ctrl+x ctrl+c"
}
```

## 常见配置场景

### 场景 1：避免与编辑器冲突

如果你常用的编辑器使用某些快捷键：

```json
{
  // VS Code 使用 Ctrl+D，改用其他
  "quit": "ctrl+q",

  // JetBrains 使用 Ctrl+Alt+L，避免冲突
  "format": "ctrl+shift+f"
}
```

### 场景 2：单手操作

方便单手使用的配置：

```json
{
  "submit": "ctrl+enter",
  "cancel": "escape",
  "interrupt": "ctrl+c",
  "quit": "ctrl+q"
}
```

### 场景 3：保持终端习惯

与常用终端工具一致：

```json
{
  "submit": "enter",
  "cancel": "ctrl+c",
  "interrupt": "ctrl+shift+c",
  "quit": "ctrl+d"
}
```

## 按键冲突处理

### 检测冲突

如果设置的快捷键与系统或其他应用冲突：

1. 尝试使用快捷键
2. 观察是否有预期效果
3. 如果没有效果，可能是被其他应用拦截

### 解决方案

```json
{
  // 尝试不同的修饰键组合
  "submit": "ctrl+shift+enter",

  // 使用不常用的组合
  "quit": "ctrl+alt+q",

  // 添加更多修饰键
  "interrupt": "ctrl+shift+alt+c"
}
```

## 注意事项

1. **避免系统冲突**：不要使用系统保留的快捷键
   - macOS: `Cmd+Q` (退出应用)、`Cmd+W` (关闭窗口)
   - Windows: `Alt+Tab` (切换窗口)、`Ctrl+Alt+Delete` (任务管理器)

2. **保持一致性**：使用与你常用工具一致的快捷键
   - 如果常用 VS Code，参考其快捷键设置
   - 如果使用 Vim，保持 Vim 快捷键习惯

3. **测试修改**：修改后测试确保没有问题
   - 逐一测试每个快捷键
   - 确认没有冲突

4. **备份配置**：修改前备份原配置
   ```bash
   cp ~/.claude/keybindings.json ~/.claude/keybindings.json.backup
   ```

## 常见问题

### Q：修改后需要重启吗？

**A**：不需要。快捷键修改后立即生效。

### Q：如何恢复默认快捷键？

**A**：删除 `keybindings.json` 文件，会自动恢复默认设置。

### Q：可以设置多个快捷键吗？

**A**：目前一个操作只能设置一个快捷键。

### Q：快捷键不生效怎么办？

**A**：
1. 检查快捷键是否被其他应用拦截
2. 确认 `keybindings.json` 格式正确
3. 尝试使用不同的快捷键组合

### Q：macOS 上如何设置 Command 键？

**A**：使用 `meta` 或 `cmd`：
```json
{
  "submit": "cmd+enter"
}
```
