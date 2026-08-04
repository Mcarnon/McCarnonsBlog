export type ProjectStatus = 'active' | 'archived' | 'wip'

export interface ProjectItem {
  /**
   * Project name.
   */
  name: string

  /**
   * Short project description.
   */
  desc?: string

  /**
   * Primary project link. Used as the main card target when provided.
   */
  link?: string

  /**
   * Repository URL.
   */
  repo?: string

  /**
   * Documentation URL.
   */
  docs?: string

  /**
   * Demo URL.
   */
  demo?: string

  /**
   * Project cover image.
   */
  cover?: string

  /**
   * Iconify/UnoCSS icon class.
   */
  icon?: string

  /**
   * Icon image URL. Takes precedence over icon when provided.
   */
  iconImg?: string

  /**
   * Accent color used by the project card.
   */
  color?: string

  /**
   * Technology stack or project tags.
   */
  tags?: string[]

  /**
   * Project status.
   */
  status?: ProjectStatus

  /**
   * Whether this project should be highlighted.
   */
  featured?: boolean
}

export interface ProjectGroup {
  title?: string
  desc?: string
  items: ProjectItem[]
}

export interface Projects {
  groups: ProjectGroup[]
}
