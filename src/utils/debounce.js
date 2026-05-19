export default function debounce(callback, wait = 80, options = {}) {
  let timer = null
  let lastArgs = null
  let lastThis = null
  let pendingTrailingCall = false

  const leading = options.leading === true
  const trailing = options.trailing !== false

  const invoke = () => {
    if (!lastArgs) return
    callback.apply(lastThis, lastArgs)
    lastArgs = null
    lastThis = null
  }

  const debounced = function (...args) {
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
  }

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
