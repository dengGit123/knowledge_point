import { defineConfig } from 'vitepress';
import path  from 'path';
import fs from 'fs';
import dirTree from 'directory-tree';

function getDirectories(targetPath) {
  // 解析为绝对路径
  const fullPath = path.resolve(targetPath)
  // 读取目录内容
  const items = fs.readdirSync(fullPath)
  // console.log(items)
  // 过滤出目录
  const directories = items.filter(item => {
    const itemPath = path.join(fullPath, item)
    return fs.statSync(itemPath).isDirectory()
  })
  console.log(directories)
  return directories
}
function createNav() {
  let nav = []
  const directories = getDirectories('./docs')
  directories.forEach((item) => {
    // 获取该目录下的第一个 .md 文件
    const dirPath = path.join('./docs', item);
    const files = fs.readdirSync(dirPath)
      .filter(f => f.endsWith('.md') && f !== 'index.md')
      .sort();

    let link;
    if (files.length > 0) {
      // 指向第一个非 index.md 的文件
      const firstFile = files[0].replace('.md', '');
      link = `/${item}/${firstFile}`;
    } else {
      // 如果没有文件，指向目录本身（会有 404 风险）
      link = `/${item}/`;
    }

    nav.push({
      text: item,
      link: link
    });
  })
  return nav
}
/**
 * 将目录树转换为侧边栏项目
 */
function toSidebarItems(tree = [], basePath = '') {
  if (!Array.isArray(tree)) return [];
  
  return tree.map(item => {
    if (item.children !== undefined) {
      // 处理子目录
      return {
        text: item.name,
        collapsible: true,
        collapsed: true,
        items: toSidebarItems(item.children, basePath)
      };
    } else {
      // 处理 .md 文件
      const fileName = item.name.replace('.md', '');
      const filePath = item.path.split('docs')[1].replace('.md', '');
      
      return {
        text: fileName === 'index' ? 'Index' :fileName,
        link: filePath
      };
    }
  });
}
function generateSidebar() {
  let sidebarConfig = {}
  // 解析为绝对路径
  const fullPath = path.resolve('./docs')
  const directories = getDirectories('./docs')

   // 遍历每个目录生成对应的侧边栏配置
  directories.forEach(dir => {
    const dirPath = path.join(fullPath, dir);
    const tree = dirTree(dirPath, {
      extensions: /\.md$/,
      normalizePath: true
    });
    if (tree && tree.children) {
      sidebarConfig[`/${dir}/`] = [
        {
          text: dir,
          collapsible: true,
          collapsed: false,
          items: toSidebarItems(tree.children, `/${dir}`)
        }
      ];
    }
  });
  return sidebarConfig
}
// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir:'docs',
  // 部署到 GitHub Pages 的 base 路径
  base: '/knowledge_point/',
  title: "知识点",
  description: "学习文档",
  // 忽略死链检查（脚注语法会被误认为是链接）
  ignoreDeadLinks: true,
  themeConfig: {
    outline: 'deep',
    outlineTitle:'当前页',
    // https://vitepress.dev/reference/default-theme-config
    nav: createNav(),
    sidebar: generateSidebar(),
    // 设置上一页和下一页显示中文
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    lastUpdated: {
      text: '更新日期',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'medium'
      }
    }
  }
})
