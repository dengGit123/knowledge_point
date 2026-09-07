# SCSS 知识点目录

> 📖 [Sass 官方文档](https://sass-lang.com/documentation/)

SCSS（Sassy CSS）是 CSS 的预处理器扩展，提供变量、嵌套、混入、函数、模块化等能力。本目录按知识点分类，每篇独立成文，建议按序号顺序阅读。

## 目录

| 序号 | 文档 | 内容 |
| --- | --- | --- |
| 01 | [SCSS 基础与安装使用](./01-SCSS基础与安装使用.md) | Sass 与 SCSS 的关系、安装方式、编译、输出格式 |
| 02 | [变量与数据类型](./02-变量与数据类型.md) | `$` 变量、作用域、`!default`/`!global`、7 种数据类型、与 CSS 变量对比 |
| 03 | [嵌套与父选择器](./03-嵌套与父选择器.md) | 选择器嵌套、`&` 父选择器、BEM 拼接、属性嵌套、`%` 占位符 |
| 04 | [混入 @mixin](./04-混入%28@mixin%29.md) | `@mixin`/`@include`、参数、可变参数、`@content`、断点 mixin |
| 05 | [继承 @extend 与占位符](./05-继承%28@extend%29与占位符.md) | `@extend` 原理、`%placeholder`、`!optional`、与 mixin 选型 |
| 06 | [控制指令](./06-控制指令%28@if,@each,@for,@while%29.md) | `@if/@else`、`@each`、`@for`、`@while`、真假值规则 |
| 07 | [映射 Map](./07-映射%28Map%29.md) | map 语法、`sass:map` 函数、不可变性、主题/断点管理 |
| 08 | [模块化 @use 与 @forward](./08-模块化%28@use与@forward%29.md) | 模块系统、命名空间、`with` 配置、`@forward`、`@import` 废弃说明 |
| 09 | [函数](./09-函数.md) | `@function`、运算符、内置模块（math/color/string/list/map/meta/selector） |
| 10 | [插值与 @at-root](./10-插值与@at-root.md) | `#{}` 插值的位置与陷阱、`@at-root`、动态选择器生成 |
| 11 | [调试指令](./11-调试指令%28@debug,@warn,@error%29.md) | `@debug`/`@warn`/`@error` 的选择与用法 |
| 12 | [Vite 与 Webpack 集成](./12-Vite与Webpack中集成SCSS.md) | 构建工具配置、`additionalData` 全局注入、多主题方案 |
| 13 | [最佳实践与常见坑](./13-最佳实践与常见坑.md) | 7-1 架构、命名规范、八大高频坑、自查清单 |

## 学习路线建议

- **入门**：01 → 02 → 03（变量和嵌套就够日常使用了）
- **进阶**：04 → 05 → 06 → 07（复用与批量生成）
- **工程化**：08 → 09 → 10 → 11 → 12 → 13（模块化、函数库、构建集成、规范）
