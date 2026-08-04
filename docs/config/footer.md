# 页脚

页脚配置由 `themeConfig.footer` 控制，用于设置年份、图标、备案和 Powered by 信息。

## 基础配置

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    footer: {
      since: 2023,
      powered: true,
    },
  },
})
```

## 图标

页脚图标支持 Iconify 图标名或图片，`name` 与 `img` 二选一即可：

- `name`：使用 Iconify/UnoCSS 图标类名，例如 `i-ri-heart-fill`。
- `img`：使用图片地址，适合头像、站点标识或自定义图形。

如果同时配置 `name` 和 `img`，主题会优先渲染 `img`。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    footer: {
      icon: {
        enable: true,
        name: 'i-ri-heart-fill',
        color: 'var(--lm-c-brand)',
      },
    },
  },
})
```

也可以使用图片。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    footer: {
      icon: {
        enable: true,
        img: '/images/footer-icon.png',
        url: '/about/',
        title: 'About me',
      },
    },
  },
})
```

## 备案

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    footer: {
      icp: {
        text: '萌ICP备XXXXXXXX号',
        link: 'https://icp.gov.moe/',
      },
    },
  },
})
```

字符串写法默认用于普通备案文本。

```ts
export default defineValaxyConfig({
  theme: 'lolimeow',
  themeConfig: {
    footer: {
      icp: '粤ICP备XXXXXXXX号',
    },
  },
})
```

## 字段说明

| 字段      | 说明                     | 默认值 |
| --------- | ------------------------ | ------ |
| `since`   | 建站年份                 | `2023` |
| `icon`    | 页脚图标配置             | -      |
| `powered` | 是否显示 Powered by 信息 | `true` |
| `icp`     | 备案信息                 | -      |

### `icon` 字段

| 字段     | 说明                                      | 默认值              |
| -------- | ----------------------------------------- | ------------------- |
| `enable` | 是否显示页脚图标                          | `true`              |
| `name`   | Iconify/UnoCSS 图标类名，与 `img` 二选一  | `i-ri-heart-fill`   |
| `img`    | 图片地址，与 `name` 二选一                | -                   |
| `color`  | 图标颜色，仅对 `name` 图标生效            | `var(--lm-c-brand)` |
| `url`    | 点击图标时跳转的链接                      | -                   |
| `title`  | 图标标题，也会作为图片图标的 `alt` 兜底值 | -                   |

### `icp` 字段

`icp` 支持字符串或对象：

| 写法     | 说明                                 |
| -------- | ------------------------------------ |
| `string` | 直接显示备案文本，链接使用默认备案站 |
| `object` | 通过 `text` 和 `link` 自定义文本链接 |
