import type { ThemeConfig } from '../types'

/**
 * Default Config
 */
export const defaultThemeConfig: ThemeConfig = {
  valaxyDarkOptions: {
    circleTransition: false,
  },

  ui: {
    primary: '#66CCFF',
  },

  background: {
    type: 'none',
    preload: true,
    image: {
      light: '',
      dark: '',
      urls: [],
      apiUrls: [],
      random: false,
      rotationInterval: 12000,
      position: 'center center',
      size: 'cover',
      fixed: true,
      overlayOpacity: 0.3,
    },
    gradient: {
      light: '',
      dark: '',
    },
  },

  hero: {
    motto: '',
    mottoSource: 'config',
    hitokoto: {
      showFrom: false,
      fromSeparator: '——',
    },
    mottoInterval: 4000,
    typewriter: true,
    typingSpeed: 100,
    showSocialIcons: true,
    showScrollDown: true,
    height: '100vh',
    textAlign: 'center',
  },

  navbar: [],
  navbarOptions: {
    showFavicon: true,
    tools: ['toggleDark', 'search'],
    hamburgerStyle: 'uneven',
    autoHide: true,
  },

  notice: {
    enable: false,
    message: '',
    closable: true,
    scope: 'home',
  },

  pinned: {
    enable: false,
    title: 'Pinned',
    entries: [],
  },

  links: {
    statusCheck: false,
    groups: [],
  },

  projects: {
    groups: [],
  },

  postList: {
    title: 'Discovery',
    imageReversed: true,
    coverFallback: [],
    coverApiUrls: [],
    coverRandom: false,
    showExcerpt: true,
    excerptLength: 140,
    maxColumns: 1,
    minCardWidth: '18rem',
  },

  footer: {
    since: 2023,
    icon: {
      enable: true,
      name: 'i-ri-heart-fill',
      color: 'var(--lm-c-brand)',
      url: '',
      title: '',
    },

    powered: true,
  },

  pagination: {
    type: 'standard',
    animation: true,
    itemsPerPage: 10,
    infiniteScrollOptions: {
      preload: true,
      threshold: 200,
    },
  },
}

/**
 * generateSafelist by config
 * @param themeConfig
 */
export function generateSafelist(themeConfig: ThemeConfig) {
  const { navbar, footer, ui } = themeConfig
  const footerIcon = footer?.icon?.img
    ?? footer?.icon?.name
    ?? defaultThemeConfig.footer.icon?.img
    ?? defaultThemeConfig.footer.icon?.name

  const safelist: string[] = []

  if (footerIcon)
    safelist.push(footerIcon)

  navbar?.forEach((navbarItem) => {
    if (navbarItem.icon)
      safelist.push(navbarItem.icon)

    if (Array.isArray(navbarItem.items)) {
      navbarItem.items.forEach((item) => {
        if (item.icon)
          safelist.push(item.icon)
      })
    }
  })

  themeConfig.projects?.groups?.forEach((group) => {
    group.items?.forEach((item) => {
      if (item.icon)
        safelist.push(item.icon)
    })
  })

  if (ui?.toggleDarkBtn?.darkIcon)
    safelist.push(ui.toggleDarkBtn.darkIcon)
  if (ui?.toggleDarkBtn?.lightIcon)
    safelist.push(ui.toggleDarkBtn.lightIcon)

  return safelist
}
