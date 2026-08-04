import type { Router, RouterScrollBehavior } from 'vue-router'
import { nextTick } from 'vue'
import { isHomePaginationPath, lockNavbarScrollReaction } from '../navigation'
import {
  beginHomeHistoryRestoration,
  homeHistoryRestorationState,
  settleHomeHistoryRestoration,
} from './home-history-state'

type RouterScrollResult = Awaited<ReturnType<RouterScrollBehavior>>

/** 等待中的单次滚动行为任务。 */
interface PendingScrollTask {
  /** 任务所属导航代次。 */
  generation: number
  /** 本任务负责完成的首页恢复代次。 */
  homeRestorationGeneration?: number
  /** 当前等待或释放阶段持有的动画帧 ID。 */
  frameId?: number
  /** Promise 是否已经返回滚动结果。 */
  settled: boolean
  /** 以安全滚动结果完成任务。 */
  resolve: (result: RouterScrollResult) => void
  /** 以原始错误拒绝任务。 */
  reject: (reason?: unknown) => void
}

/** 单个 Router 的稳定滚动行为控制器。 */
interface HomePaginationScrollController {
  scrollBehavior: RouterScrollBehavior
}

/** Vite HMR 在模块替换间保留的最小数据接口。 */
interface HotModuleState {
  data: Record<string, unknown>
}

const hotModule = (import.meta as ImportMeta & { hot?: HotModuleState }).hot
const persistedControllers = hotModule?.data.lolimeowHomePaginationScrollControllers

/** 按 Router 隔离安装状态；弱键不会阻止 SSR 请求级 Router 被回收。 */
const homePaginationScrollControllers
  = (persistedControllers instanceof WeakMap
    ? persistedControllers
    : new WeakMap()) as WeakMap<Router, HomePaginationScrollController>

if (hotModule)
  hotModule.data.lolimeowHomePaginationScrollControllers = homePaginationScrollControllers

/**
 * 为首页分页路由稳定安装滚动行为，并在分页切换时短暂锁定导航栏滚动响应。
 *
 * 同一 Router 只安装一次；首页历史恢复通过显式导航代次与文章流握手，不使用固定超时。
 *
 * @param router - 当前应用的 Vue Router 实例。
 */
export function useHomePaginationScrollBehavior(router: Router) {
  if (homePaginationScrollControllers.has(router))
    return

  const previousScrollBehavior = router.options.scrollBehavior
  let releaseNavbarScrollLock: ReturnType<typeof lockNavbarScrollReaction> | undefined
  let navigationGeneration = 0
  let activeScrollTask: PendingScrollTask | undefined

  const routeNavigationGenerations = new WeakMap<object, number>()
  const routeHomeRestorationGenerations = new WeakMap<object, number>()

  /** 释放当前导航栏锁。 */
  const releaseActiveNavbarScrollLock = () => {
    releaseNavbarScrollLock?.()
    releaseNavbarScrollLock = undefined
  }

  /**
   * 取消旧帧并让尚未返回结果的旧 Promise 以 false 安全完成。
   */
  const cancelActiveScrollTask = () => {
    const task = activeScrollTask

    if (!task)
      return

    if (task.frameId !== undefined && typeof window !== 'undefined')
      window.cancelAnimationFrame(task.frameId)

    if (!task.settled) {
      task.settled = true
      task.resolve(false)
    }

    if (task.homeRestorationGeneration !== undefined)
      settleHomeHistoryRestoration(task.homeRestorationGeneration)

    activeScrollTask = undefined
  }

  /**
   * 开始新的导航代次，并同步取消上一代仍持有的滚动副作用。
   *
   * @returns 新导航代次。
   */
  const beginNavigationGeneration = () => {
    cancelActiveScrollTask()
    releaseActiveNavbarScrollLock()
    navigationGeneration += 1
    return navigationGeneration
  }

  /**
   * 判断当前文档是否能可靠地产生动画帧。
   *
   * @returns 可见浏览器文档支持 RAF 时返回 true。
   */
  const canWaitForAnimationFrame = () => {
    return typeof window !== 'undefined'
      && typeof window.requestAnimationFrame === 'function'
      && typeof document !== 'undefined'
      && document.visibilityState !== 'hidden'
  }

  /**
   * 将滚动结果绑定到可取消导航任务，并在 Router 消费结果后的下一布局帧完成首页握手。
   *
   * @param result - 当前滚动行为将交给 Router 的结果或异步结果。
   * @param taskGeneration - 当前导航代次。
   * @param homeRestorationGeneration - 可选的首页恢复握手代次。
   * @param waitForRestoredLayout - 返回结果前是否先等待 nextTick 与一帧布局。
   * @returns 可由更新导航安全取消的滚动结果 Promise。
   */
  const coordinateScrollResult = (
    result: ReturnType<RouterScrollBehavior>,
    taskGeneration: number,
    homeRestorationGeneration: number | undefined,
    waitForRestoredLayout: boolean,
  ): Promise<RouterScrollResult> => {
    return new Promise<RouterScrollResult>((resolve, reject) => {
      const task: PendingScrollTask = {
        generation: taskGeneration,
        homeRestorationGeneration,
        settled: false,
        resolve,
        reject,
      }

      activeScrollTask = task

      /** 当前任务仍属于最新导航且没有被替换时才允许继续。 */
      const isTaskActive = () => {
        return activeScrollTask === task && navigationGeneration === task.generation
      }

      /** 完成首页握手；异步滚动结果尚未完成时继续保留任务的取消能力。 */
      const releaseHomeRestoration = () => {
        if (!isTaskActive())
          return

        if (task.homeRestorationGeneration !== undefined)
          settleHomeHistoryRestoration(task.homeRestorationGeneration)

        task.homeRestorationGeneration = undefined

        if (task.settled)
          activeScrollTask = undefined
      }

      /**
       * 在下一帧释放握手；隐藏页签改用双微任务越过 Router 的 Promise 采纳层。
       */
      const scheduleHomeRestorationRelease = () => {
        if (task.homeRestorationGeneration === undefined)
          return

        if (!canWaitForAnimationFrame()) {
          Promise.resolve().then(() => Promise.resolve().then(releaseHomeRestoration))
          return
        }

        task.frameId = window.requestAnimationFrame(() => {
          task.frameId = undefined
          releaseHomeRestoration()
        })
      }

      /**
       * 返回滚动结果；savedPosition 在 Router 实际应用结果后的下一帧释放 Observer。
       */
      const finishWithResult = (scrollResult: RouterScrollResult) => {
        if (!isTaskActive())
          return

        task.settled = true
        task.resolve(scrollResult)

        if (task.homeRestorationGeneration === undefined) {
          activeScrollTask = undefined
          return
        }

        if (waitForRestoredLayout)
          scheduleHomeRestorationRelease()
      }

      /** 透传有效任务的错误，同时确保 Observer 不会永久停用。 */
      const failTask = (reason: unknown) => {
        if (!isTaskActive())
          return

        if (task.frameId !== undefined && typeof window !== 'undefined')
          window.cancelAnimationFrame(task.frameId)

        if (task.homeRestorationGeneration !== undefined)
          settleHomeHistoryRestoration(task.homeRestorationGeneration)

        activeScrollTask = undefined
        task.settled = true
        task.reject(reason)
      }

      /** 等待待委托结果，并进入 Router 消费与握手释放阶段。 */
      const resolveScrollResult = () => {
        Promise.resolve(result).then(finishWithResult, failTask)
      }

      if (!waitForRestoredLayout) {
        // 无 savedPosition 时独立释放握手，不受旧滚动行为异步结果是否结束影响。
        scheduleHomeRestorationRelease()
        resolveScrollResult()
        return
      }

      nextTick().then(() => {
        if (!isTaskActive())
          return

        // 后台标签页不会稳定触发 RAF；nextTick 后直接交还 savedPosition。
        if (!canWaitForAnimationFrame()) {
          resolveScrollResult()
          return
        }

        task.frameId = window.requestAnimationFrame(() => {
          task.frameId = undefined

          if (isTaskActive())
            resolveScrollResult()
        })
      }, failTask)
    })
  }

  router.beforeEach((to) => {
    const currentNavigationGeneration = beginNavigationGeneration()
    routeNavigationGenerations.set(to, currentNavigationGeneration)

    const pendingHomeGeneration = homeHistoryRestorationState.value.pending
      ? homeHistoryRestorationState.value.generation
      : undefined

    if (pendingHomeGeneration !== undefined)
      settleHomeHistoryRestoration(pendingHomeGeneration)

    if (isHomePaginationPath(to.path)) {
      const homeRestorationGeneration = beginHomeHistoryRestoration(to.fullPath)
      routeHomeRestorationGenerations.set(to, homeRestorationGeneration)
    }
  })

  router.afterEach((to, _from, failure) => {
    if (!failure)
      return

    const failedNavigationGeneration = routeNavigationGenerations.get(to)

    if (failedNavigationGeneration === navigationGeneration) {
      cancelActiveScrollTask()
      releaseActiveNavbarScrollLock()
    }

    const failedHomeGeneration = routeHomeRestorationGenerations.get(to)

    if (failedHomeGeneration !== undefined)
      settleHomeHistoryRestoration(failedHomeGeneration)
  })

  /**
   * 收敛导航守卫、异步组件或滚动行为抛出的未捕获错误。
   *
   * 仅错误目标仍属于当前导航代次时清理全局副作用；旧导航迟到的错误只移除自身映射，
   * 不得取消新导航的滚动任务、首页恢复握手或导航栏锁。
   *
   * @param _error - Router 捕获的原始导航错误，此处只负责收敛关联副作用。
   * @param to - 发生错误时正在进入的标准化路由。
   */
  router.onError((_error, to) => {
    const failedNavigationGeneration = routeNavigationGenerations.get(to)

    if (failedNavigationGeneration === navigationGeneration) {
      cancelActiveScrollTask()

      const failedHomeGeneration = routeHomeRestorationGenerations.get(to)

      if (failedHomeGeneration !== undefined)
        settleHomeHistoryRestoration(failedHomeGeneration)

      releaseActiveNavbarScrollLock()
    }

    routeNavigationGenerations.delete(to)
    routeHomeRestorationGenerations.delete(to)
  })

  /**
   * 处理首页分页滚动定位，并将非首页导航委托给安装前的滚动行为。
   *
   * @param to - 即将进入的标准化路由。
   * @param from - 当前离开的标准化路由。
   * @param savedPosition - 浏览器历史导航保存的滚动位置。
   * @returns Vue Router 可消费的滚动位置或旧滚动行为结果。
   */
  const handleHomePaginationScroll: RouterScrollBehavior = function handleHomePaginationScroll(
    to,
    from,
    savedPosition,
  ) {
    const taskGeneration = routeNavigationGenerations.get(to) ?? beginNavigationGeneration()

    if (taskGeneration !== navigationGeneration)
      return false

    cancelActiveScrollTask()
    releaseActiveNavbarScrollLock()

    const homeRestorationGeneration = isHomePaginationPath(to.path)
      ? routeHomeRestorationGenerations.get(to) ?? beginHomeHistoryRestoration(to.fullPath)
      : undefined

    if (savedPosition) {
      return coordinateScrollResult(
        savedPosition,
        taskGeneration,
        homeRestorationGeneration,
        true,
      )
    }

    /** 解析无 savedPosition 时沿用的滚动结果。 */
    const resolveDefaultScrollResult = (): ReturnType<RouterScrollBehavior> => {
      if (isHomePaginationPath(to.path) && isHomePaginationPath(from.path)) {
        releaseNavbarScrollLock = lockNavbarScrollReaction({ deferFrames: 2 })
        return to.hash
          ? { el: to.hash, top: 0 }
          : { top: 0 }
      }

      if (previousScrollBehavior)
        return previousScrollBehavior(to, from, savedPosition)

      if (to.path !== from.path)
        return { top: 0 }
    }

    let scrollResult: ReturnType<RouterScrollBehavior>

    try {
      scrollResult = resolveDefaultScrollResult()
    }
    catch (error) {
      if (homeRestorationGeneration !== undefined)
        settleHomeHistoryRestoration(homeRestorationGeneration)

      throw error
    }

    if (homeRestorationGeneration === undefined)
      return scrollResult

    // 即使没有 savedPosition，也在 Router 消费结果后按当前代次释放 Observer。
    return coordinateScrollResult(
      scrollResult,
      taskGeneration,
      homeRestorationGeneration,
      false,
    )
  }

  homePaginationScrollControllers.set(router, {
    scrollBehavior: handleHomePaginationScroll,
  })
  router.options.scrollBehavior = handleHomePaginationScroll
}
