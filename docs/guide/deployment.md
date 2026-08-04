# 部署

Lolimeow 是 Valaxy 主题，部署方式跟随 Valaxy 项目本身。

主题不会限制部署平台。你可以部署到 GitHub Pages、Netlify、Vercel、Cloudflare Pages 或自己的服务器。

::: tip
更完整的部署方式请参考 [Valaxy 部署文档](https://valaxy.site/guide/deploy)。
:::

## 构建站点

在 Valaxy 博客项目中执行构建命令：

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

构建完成后，Valaxy 会生成静态站点产物。部署时应上传构建产物目录，而不是直接上传源码目录。

## 部署前检查

部署前建议确认：

- `site.config.ts` 中已经配置正确的 `url`
- `site.config.ts` 中已经显式配置 `timezone`
- 文章中的图片路径可以在生产环境访问
- 如果使用搜索，已经启用 Fuse 本地搜索
- 如果使用评论，评论服务已经允许生产域名访问
- 如果需要自定义 404 页面，构建产物根目录中应存在 `404.html`

## 404 页面

Lolimeow 提供了主题内置的 `404` 布局，但 Valaxy 需要站点侧存在一个实际页面，静态托管平台才会在构建产物中拿到根目录的 `404.html`。

在你的 Valaxy 博客项目中添加：

```md
---
layout: 404
---
```

然后重新构建站点，确认构建产物目录中生成了 `404.html`。

GitHub Pages 和 Cloudflare Pages 会优先读取发布根目录下的 `404.html` 作为自定义 404 页面。如果没有这个文件，平台会显示默认 404 页面，而不是主题的 404 页面。

## GitHub Pages

GitHub Pages 是常见的静态站点部署方式。

通常你需要：

1. 在仓库中添加 GitHub Actions 工作流
2. 安装依赖
3. 执行构建命令
4. 将构建产物发布到 Pages 分支或 Pages 环境

如果站点部署在仓库子路径，需要根据 Valaxy 文档配置对应的站点路径；如果使用自定义域名，通常可以保持根路径部署。

## Netlify

Netlify 部署时通常填写：

```text
Build command: pnpm build
Publish directory: dist
```

实际产物目录以你的 Valaxy 项目构建结果为准。

## Vercel

Vercel 可以直接导入 Git 仓库。构建命令通常为：

```text
pnpm build
```

输出目录根据 Valaxy 构建产物配置填写。

## Cloudflare Pages

Cloudflare Pages 常用配置：

```text
Build command: pnpm build
Build output directory: dist
```

如果项目使用 pnpm，建议在平台环境变量中指定 pnpm 版本或启用 Corepack。

## 更新后重新部署

更新 Valaxy、主题或插件后，建议重新执行：

```bash
pnpm install
pnpm build
```

确认本地构建通过后再部署到生产环境。
