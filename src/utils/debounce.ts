export interface DebounceOptions {
  leading?: boolean
  trailing?: boolean
}

export interface DebouncedFunction<T extends (...args: any[]) => void> {
  (...args: Parameters<T>): void
  cancel: () => void
  flush: () => void
}

export default function debounce<T extends (...args: any[]) => void>(
  callback: T,
  wait = 80,
  options: DebounceOptions = {}
): DebouncedFunction<T> {
  let timer: ReturnType<typeof setTimeout> | null = null
  let lastArgs: Parameters<T> | null = null
  let lastThis: any = null
  let pendingTrailingCall = false

  const leading = options.leading === true
  const trailing = options.trailing !== false

  const invoke = () => {
    if (!lastArgs) return
    callback.apply(lastThis, lastArgs)
    lastArgs = null
    lastThis = null
  }

  const debounced = function (this: any, ...args: Parameters<T>) {
    const shouldCallLeading = leading && !timer

    lastArgs = args
    lastThis = this

    if (timer) {
      pendingTrailingCall = true
      clearTimeout(timer)
    } else {
      pendingTrailingCall = false
    }

    timer = setTimeout(() => {
      timer = null

      if (trailing && (!leading || pendingTrailingCall)) {
        invoke()
      } else {
        lastArgs = null
        lastThis = null
      }

      pendingTrailingCall = false
    }, wait)

    if (shouldCallLeading) {
      callback.apply(lastThis, lastArgs)
    }
  } as DebouncedFunction<T>

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer)
    }

    timer = null
    lastArgs = null
    lastThis = null
    pendingTrailingCall = false
  }

  debounced.flush = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    if (trailing) {
      invoke()
    }

    pendingTrailingCall = false
  }

  return debounced
}
