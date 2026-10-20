# keybindings.json 使用说明

> 📚 **官方文档**：[Claude Code Key Bindings](https://code.claude.com/docs/en/interactive-mode#keyboard-shortcuts)

> ⚠️ **注意**：自定义快捷键是较新的实验性功能，配置格式和可绑定的动作可能随版本变化，请以官方文档为准。

## 什么是 keybindings.json

`keybindings.json` 是**快捷键配置文件**，让你可以自定义键盘快捷键，按自己的习惯操作 Claude Code。

> **通俗理解**：就像软件的"快捷键设置"，你可以把常用的操作设置成自己喜欢的按键组合。

## 文件位置

```
~/.claude/keybindings.json
```

## 默认快捷键

| 操作 | 默认快捷键 |
|------|-----------|
| 提交消息 | `Enter`（换行 `\\` + `Enter` 或 `Option/Alt + Enter`） |
| 中断执行 | `Esc` |
| 多行换行 | `Shift + Enter`（部分终端） |
| 清屏 | `Ctrl + L` |
| 退出程序 | `Ctrl + C`（两次）或 `Ctrl + D` |

> 实际快捷键与终端有关，输入 `/help` 可查看当前环境的快捷键列表。

## 自定义场景

- 与其他工具保持一致
- 适应不同的键盘布局
- 个人操作习惯
- 避免按键冲突

## 配置格式

配置文件为 JSON，按键使用小写的组合表示，修饰键用 `+` 连接：

```json
{
  "submit": "ctrl+enter",
  "cancel": "escape",
  "interrupt": "ctrl+c"
}
```

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
meta+    # Command/Mac 键（也可写作 cmd+）
```

### 组合示例

```
ctrl+enter           # Ctrl + Enter
ctrl+shift+a         # Ctrl + Shift + A
alt+cmd+s            # Alt + Command + S
```

## 完整示例

```json
{
  "submit": "ctrl+enter",
  "cancel": "escape",
  "interrupt": "ctrl+c"
}
```

## 不同平台的建议配置

### Windows/Linux

```json
{
  "submit": "ctrl+enter",
  "cancel": "escape",
  "interrupt": "ctrl+c"
}
```

### macOS

```json
{
  "submit": "cmd+enter",
  "cancel": "escape",
  "interrupt": "ctrl+c"
}
```

### Vim 用户习惯

```json
{
  "submit": "ctrl+j",
  "cancel": "ctrl+["
}
```

## 常见配置场景

### 场景 1：避免与编辑器冲突

如果你常用的编辑器占用某些快捷键，换用其他组合：

```json
{
  "quit": "ctrl+q",
  "format": "ctrl+shift+f"
}
```

### 场景 2：保持终端习惯

与常用终端工具一致：

```json
{
  "submit": "enter",
  "cancel": "ctrl+c"
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
  "quit": "ctrl+alt+q"
}
```

> ⚠️ JSON 标准不支持注释，上面仅为示意，实际文件中请删除注释。

## 注意事项

1. **避免系统冲突**：不要使用系统保留的快捷键
   - macOS: `Cmd+Q` (退出应用)、`Cmd+W` (关闭窗口)
   - Windows: `Alt+Tab` (切换窗口)、`Ctrl+Alt+Delete` (任务管理器)

2. **保持一致性**：使用与你常用工具一致的快捷键
   - 如果常用 VS Code，参考其快捷键设置
   - 如果使用 Vim，保持 Vim 快捷键习惯

3. **测试修改**：修改后重启会话，逐一测试每个快捷键

4. **备份配置**：修改前备份原配置
   ```bash
   cp ~/.claude/keybindings.json ~/.claude/keybindings.json.backup
   ```

## 常见问题

### Q：修改后需要重启吗？

**A**：部分版本需要新开会话才能生效，修改后请测试确认。

### Q：如何恢复默认快捷键？

**A**：删除 `keybindings.json` 文件，会自动恢复默认设置。

### Q：一个操作可以设置多个快捷键吗？

**A**：视版本实现而定，多数情况下一个动作只绑定一个快捷键。

### Q：快捷键不生效怎么办？

**A**：
1. 检查快捷键是否被其他应用拦截
2. 确认 `keybindings.json` 是有效的 JSON
3. 尝试使用不同的快捷键组合
4. 该功能为实验性，确认所用版本是否支持
