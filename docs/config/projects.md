# 项目展示

项目展示页用于展示作者自己的作品、开源项目、产品 Demo 或实验项目。

## 页面入口

新建一个 Markdown 页面并指定 `layout: projects`：

```md
---
layout: projects
title: 项目
cover: /images/projects-cover.jpg
---

这里可以写项目页介绍
```

导航栏中可以添加项目页入口：

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    navbar: [
      { text: '项目', link: '/projects/', icon: 'i-ri-apps-2-line' },
    ],
  },
})
```

## 基础配置

项目数据配置在 `themeConfig.projects.groups` 中。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    projects: {
      groups: [
        {
          title: 'Open Source',
          desc: '一些开源项目与工具。',
          items: [
            {
              name: 'your project name',
              desc: 'A cute and clean Valaxy theme.',
              link: 'https://example.com/',
              repo: 'https://github.com/yourname/yourprojectname',
              docs: 'https://example.com/docs/',
              demo: 'https://example.com/demo/',
              cover: '/images/project-cover.png',
              icon: 'i-ri-vuejs-line',
              iconImg: '/images/project-icon.png',
              color: '#66CCFF',
              tags: ['Valaxy', 'Vue', 'Theme'],
              status: 'active',
              featured: true,
            },
          ],
        },
      ],
    },
  },
})
```

## 字段说明

### `projects`

| 字段     | 说明     | 默认值 |
| -------- | -------- | ------ |
| `groups` | 项目分组 | `[]`   |

### `ProjectGroup`

| 字段    | 说明     | 必填 |
| ------- | -------- | ---- |
| `title` | 分组标题 | 否   |
| `desc`  | 分组描述 | 否   |
| `items` | 项目列表 | 是   |

### `ProjectItem`

| 字段       | 说明                                         | 必填 |
| ---------- | -------------------------------------------- | ---- |
| `name`     | 项目名称                                     | 是   |
| `desc`     | 项目简介                                     | 否   |
| `link`     | 主链接，点击卡片时优先使用                   | 否   |
| `repo`     | 仓库地址                                     | 否   |
| `docs`     | 文档地址                                     | 否   |
| `demo`     | 在线演示地址                                 | 否   |
| `cover`    | 项目封面图                                   | 否   |
| `icon`     | Iconify/UnoCSS 图标类名                      | 否   |
| `iconImg`  | 图标图片地址，配置后优先于 `icon` 显示       | 否   |
| `color`    | 项目强调色                                   | 否   |
| `tags`     | 技术栈或项目标签                             | 否   |
| `status`   | 项目状态，可选 `active` / `archived` / `wip` | 否   |
| `featured` | 是否作为精选项目，会显示更明显的顶部强调线   | 否   |

## 使用建议

- 如果项目有视觉封面，优先配置 `cover`。
- 如果是工具库或开源包，可以只配置 `icon`、`repo` 和 `tags`。
- 如果需要使用图片作为项目图标，配置 `iconImg`；同时配置 `iconImg` 和 `icon` 时会优先显示 `iconImg`。
- `link`、`repo`、`docs`、`demo` 会自动渲染为操作按钮。
