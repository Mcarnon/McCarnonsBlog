/**
 * 标签页单篇文章条目。
 */
export interface TagEntry {
  path: string
  title: string
  date?: string | number | Date
}

/**
 * 标签页按标签聚合后的文章组。
 */
export interface TagGroup {
  id: string
  name: string
  count: number
  entries: TagEntry[]
}

/**
 * 标签云布局算法的输入项。
 */
export interface TagCloudSourceItem {
  id: string
  name: string
  count: number
}

/**
 * 标签云布局算法输出给 UI 的单个标签。
 */
export interface TagCloudViewItem extends TagCloudSourceItem {
  fontSize: string
  fontWeight: number
  opacity: number
  shiftX: string
  shiftY: string
}

/**
 * 标签云的一行布局结果。
 */
export interface TagCloudRow {
  id: string
  items: TagCloudViewItem[]
}
