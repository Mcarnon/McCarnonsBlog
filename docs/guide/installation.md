# 安装

本页介绍如何在 Valaxy 博客项目中安装并启用 Lolimeow 主题。

如果你是第一次使用 Valaxy，建议先了解 [Valaxy](https://valaxy.site/) 以及官方的 [快速开始](https://valaxy.site/guide/getting-started)。

## 兼容性

| Node.js     | Valaxy   |
| ----------- | -------- |
| Node.js LTS | 0.28.10+ |

## 创建 Valaxy 博客项目

推荐使用 pnpm 创建项目：

```bash
pnpm create valaxy
```

也可以使用 npm 或 yarn：

::: code-group

```bash [pnpm]
pnpm create valaxy
```

```bash [npm]
npm create valaxy
```

```bash [yarn]
yarn create valaxy
```

:::

创建过程中，`create valaxy` 会根据提示初始化项目并安装 Valaxy。

### 选择主题

在选择 Blog 类型后，你会看到主题选择提示：

- Yun：默认博客主题
- Press：面向文档的主题
- Custom：输入自定义主题名

如果在创建项目时选择 `Custom`，可以输入：

```text
valaxy-theme-lolimeow
```

`create valaxy` 会自动配置 `valaxy.config.ts` 中的 `theme` 字段，并在 `package.json` 中添加主题依赖。

如果创建项目时已经选择了 Lolimeow，可以跳过后面的手动安装主题步骤。

## 安装主题

进入刚创建的 Valaxy 项目目录，安装 Lolimeow：

::: code-group

```bash [pnpm]
pnpm add valaxy-theme-lolimeow
```

```bash [npm]
npm install valaxy-theme-lolimeow
```

```bash [yarn]
yarn add valaxy-theme-lolimeow
```

:::

## 启用主题

安装完成后，需要在 `valaxy.config.ts` 中启用主题。

```ts
import type { ThemeUserConfig } from 'valaxy-theme-lolimeow'
import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig<ThemeUserConfig>({
  theme: 'lolimeow',
})
```

主题名称来自包名 `valaxy-theme-lolimeow`，因此 `theme` 填写 `lolimeow`。

## 配置时区

建议在 `site.config.ts` 中显式指定时区。若服务端构建环境与客户端浏览器时区不同，文章日期等时间内容可能出现 SSR 水合不一致。

```ts
import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  timezone: 'Asia/Shanghai',
})
```

## 安装依赖

如果创建项目时没有安装依赖，可以手动安装：

::: code-group

```bash [pnpm]
pnpm install
```

```bash [npm]
npm install
```

```bash [yarn]
yarn
```

:::

## 启动博客

::: code-group

```bash [pnpm]
pnpm dev
```

```bash [npm]
npm run dev
```

```bash [yarn]
yarn dev
```

:::

启动后访问终端输出的本地地址即可预览主题。

## 更新主题

建议经常更新 Valaxy 与主题版本，以获得修复和改进。

::: code-group

```bash [pnpm]
pnpm update valaxy valaxy-theme-lolimeow
```

```bash [npm]
npm update valaxy valaxy-theme-lolimeow
```

```bash [yarn]
yarn upgrade valaxy valaxy-theme-lolimeow
```

:::

如果使用了评论插件，也可以一并更新：

```bash
pnpm update valaxy-addon-waline
```

更新后建议重新运行开发服务器，并执行一次构建确认配置兼容。

## 构建与部署

构建命令：

::: code-group

```bash [pnpm]
pnpm build
```

```bash [npm]
npm run build
```

```bash [yarn]
yarn build
```

:::

Valaxy 支持多种部署方式。具体部署流程建议以 [Valaxy 部署文档](https://valaxy.site/guide/deploy) 为准。
