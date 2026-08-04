export interface UI {
  /**
   * primary color
   * @default '#66CCFF'
   */
  primary: string

  /**
   * Icon for the light/dark mode toggle button
   */
  toggleDarkBtn?: {
    darkIcon?: string
    lightIcon?: string
  }
}

export type UserUI = {
  [K in keyof UI]?: Partial<UI[K]>
}
