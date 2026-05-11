# keybindings.json 使用说明

## 概述

`keybindings.json` 用于自定义 Claude Code 的键盘快捷键，让你按自己的习惯操作。

## 文件位置

```
~/.claude/keybindings.json
```

## 配置结构

```json
{
  "submit": "ctrl+enter",
  "cancel": "escape",
  "interrupt": "ctrl+c"
}
```

## 可配置的快捷键

### 1. submit - 提交消息

发送用户输入给 Claude。

| 值 | 说明 |
|----|----|
| `ctrl+enter` | Ctrl + Enter（默认） |
| `enter` | 单独 Enter |
| `ctrl+s` | Ctrl + S |

### 2. cancel - 取消操作

取消当前输入或操作。

| 值 | 说明 |
|----|----|
| `escape` | Escape 键（默认） |
| `ctrl+c` | Ctrl + C |
| `ctrl+g` | Ctrl + G |

### 3. interrupt - 中断执行

中断正在运行的命令。

| 值 | 说明 |
|----|----|
| `ctrl+c` | Ctrl + C（默认） |
| `ctrl+x` | Ctrl + X |

### 4. quit - 退出程序

退出 Claude Code。

| 值 | 说明 |
|----|----|
| `ctrl+d` | Ctrl + D（默认） |
| `ctrl+q` | Ctrl + Q |

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
meta+    # Command/Meta
```

### 组合示例

```
ctrl+enter       # Ctrl + Enter
ctrl+shift+a     # Ctrl + Shift + A
alt+cmd+s        # Alt + Command + S
ctrl+alt+delete  # Ctrl + Alt + Delete
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
  "cancel": "escape"
}
```

### macOS

```json
{
  "submit": "cmd+enter",
  "cancel": "escape"
}
```

## 注意事项

1. **避免系统冲突**：不要使用系统保留的快捷键
2. **保持一致性**：使用与你常用工具一致的快捷键
3. **测试修改**：修改后测试确保没有问题
4. **备份配置**：修改前备份原配置
