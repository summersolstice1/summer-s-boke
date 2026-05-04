# Summer's Boke

这是一个本地静态存储的个人博客项目，基于 Next.js 构建。项目已经改造成星球风格界面，支持昼夜主题切换、小猫开场动画、首页模块自由搭配、照片本地管理和 AI 工具分享模块。

## 项目结构

```text
.
├── public/                  静态资源目录
│   ├── blogs/               博客文章 Markdown、配置和文章图片
│   ├── images/              首页、照片墙、分享卡片等图片资源
│   ├── music/               音乐播放器资源
│   ├── favicon.png          网站图标
│   └── manifest.json        PWA 基础配置
├── scripts/                 项目脚本
│   └── gen-svgs-index.js    SVG 图标索引生成脚本
├── src/
│   ├── app/                 Next.js App Router 页面
│   │   ├── (home)/          首页模块和首页配置
│   │   ├── blog/            文章列表和文章详情
│   │   ├── bloggers/        AI 工具分享和 API Key 分类
│   │   ├── pictures/        照片墙和本地照片编辑
│   │   ├── projects/        项目展示页
│   │   ├── share/           推荐分享页
│   │   ├── snippets/        代码片段页
│   │   └── write/           本地写作编辑页面
│   ├── components/          通用组件
│   │   ├── cat-opening.tsx  小猫主题开场动画
│   │   ├── nav-card.tsx     全局导航模块
│   │   ├── music-card.tsx   音乐模块
│   │   └── theme-toggle.tsx 昼夜主题切换
│   ├── config/              站点和首页模块默认配置
│   ├── hooks/               公共 Hooks
│   ├── layout/              全局布局、背景和页面外层组件
│   ├── lib/                 工具函数和静态模式辅助逻辑
│   ├── styles/              全局样式、主题变量和文章样式
│   └── svgs/                SVG 图标资源
├── start-site.bat           Windows 一键启动脚本
├── package.json             项目依赖和命令
├── pnpm-lock.yaml           pnpm 锁定文件
├── next.config.ts           Next.js 配置
└── tsconfig.json            TypeScript 配置
```

## 核心功能

- 首页星球风格视觉背景，支持白天和夜晚主题切换。
- 首页模块可以在「首页管理」中显示、隐藏、排序、改尺寸和拖拽位置。
- 图片页支持本地新增、删除照片和编辑备注。
- AI 工具分享页支持对话助手、创作工具、API Key 分类，并支持本地增删查改和排序。
- 小猫主题开场动画会在每个浏览器会话中显示一次。
- 项目内容以静态文件和浏览器本地存储为主，不再依赖导入密钥或 GitHub App 写入。

## 常用命令

```powershell
corepack pnpm install
corepack pnpm dev
corepack pnpm build
```

开发服务器默认运行在：

```text
http://127.0.0.1:2025
```

Windows 下也可以直接双击根目录的 `start-site.bat` 启动项目。

## 主要配置文件

- `src/config/site-content.json`：站点标题、主题色、首页图片和部分功能开关。
- `src/config/card-styles.json`：首页模块默认尺寸、顺序、偏移和启用状态。
- `src/app/bloggers/list.json`：AI 工具分享默认数据。
- `src/app/pictures/list.json`：照片墙默认数据。
- `src/app/projects/list.json`：项目展示默认数据。
- `src/app/share/list.json`：推荐分享默认数据。

## 本地存储说明

当前项目偏向本地静态博客体验。部分编辑内容会保存到浏览器 `localStorage`，例如首页模块布局、AI 工具分享和照片墙编辑结果。更换浏览器或清理浏览器数据后，本地编辑内容可能会恢复为项目文件中的默认数据。

