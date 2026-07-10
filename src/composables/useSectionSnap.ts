import { reactive, ref, onMounted, onBeforeUnmount, type Ref } from 'vue'
import debounce from '@/utils/debounce'

interface SectionMetrics {
  index: number
  section: Element
  rect: DOMRect
}

export function useSectionSnap(
  elRef: Ref<HTMLElement | null>,
  sectionIds: string[],
  snapDenominator = 4
) {
  const sectionStates = reactive<Record<string, string>>(
    Object.fromEntries(sectionIds.map(id => [id, 'is-hidden-down']))
  )

  let snapTimer: ReturnType<typeof setTimeout> | null = null
  let snapAnimationId: number | null = null
  const isAutoSnapping = ref(false)
  const lastScrollTop = ref(0)
  const scrollDirection = ref<'down' | 'up'>('down')
  const activeSectionIndex = ref(0)

  const getSectionElements = (): Element[] => {
    if (!elRef.value) return []
    return Array.from(elRef.value.querySelectorAll('.observe-section'))
  }

  const getSectionMetrics = (): SectionMetrics[] => {
    return getSectionElements().map((section, index) => ({
      index,
      section,
      rect: section.getBoundingClientRect()
    }))
  }

  const getVisibleHeight = (rect: DOMRect, viewportHeight = window.innerHeight || document.documentElement.clientHeight): number => {
    const visibleTop = Math.max(rect.top, 0)
    const visibleBottom = Math.min(rect.bottom, viewportHeight)
    return Math.max(0, visibleBottom - visibleTop)
  }

  const getNearestSectionIndex = (metrics = getSectionMetrics()): number => {
    if (!metrics.length) return 0

    let nearestIndex = 0
    let nearestDistance = Number.POSITIVE_INFINITY

    metrics.forEach((item) => {
      const distance = Math.abs(item.rect.top)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = item.index
      }
    })

    return nearestIndex
  }

  const updateSectionViewportStates = () => {
    const sections = getSectionElements()
    if (!sections.length) return

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    const visibleBandTop = viewportHeight * 0.24
    const visibleBandBottom = viewportHeight * 0.76

    sections.forEach((section) => {
      const sectionEl = section as HTMLElement
      const sectionId = sectionEl.dataset.sectionId
      if (!sectionId) return

      const rect = section.getBoundingClientRect()
      const centerY = rect.top + rect.height / 2
      let nextState = 'is-visible'

      if (centerY < visibleBandTop) {
        nextState = 'is-hidden-up'
      } else if (centerY > visibleBandBottom) {
        nextState = 'is-hidden-down'
      }

      sectionStates[sectionId] = nextState
    })
  }

  const cancelAutoSnap = () => {
    if (snapAnimationId) {
      cancelAnimationFrame(snapAnimationId)
      snapAnimationId = null
    }
    isAutoSnapping.value = false
  }

  const animateSectionSnap = (targetScrollTop: number, targetIndex: number) => {
    cancelAutoSnap()

    const startScrollTop = window.pageYOffset || document.documentElement.scrollTop || 0
    const distance = targetScrollTop - startScrollTop
    const duration = Math.max(420, Math.min(760, Math.abs(distance) * 0.52))
    const startTime = performance.now()

    isAutoSnapping.value = true

    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration)
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2

      window.scrollTo(0, startScrollTop + distance * eased)
      updateSectionViewportStates()

      if (progress < 1 && isAutoSnapping.value) {
        snapAnimationId = requestAnimationFrame(step)
        return
      }

      snapAnimationId = null
      isAutoSnapping.value = false
      activeSectionIndex.value = targetIndex
      lastScrollTop.value = window.pageYOffset || document.documentElement.scrollTop || targetScrollTop
    }

    snapAnimationId = requestAnimationFrame(step)
  }

  const snapToDirectionalSection = () => {
    const metrics = getSectionMetrics()
    if (!metrics.length) return

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop || 0
    const nearestIndex = getNearestSectionIndex(metrics)

    if (
      activeSectionIndex.value < 0 ||
      activeSectionIndex.value >= metrics.length ||
      Math.abs(activeSectionIndex.value - nearestIndex) > 1 ||
      getVisibleHeight(metrics[activeSectionIndex.value].rect, viewportHeight) === 0
    ) {
      activeSectionIndex.value = nearestIndex
    }

    const baseIndex = activeSectionIndex.value
    const directionalIndex = scrollDirection.value === 'up'
      ? Math.max(0, baseIndex - 1)
      : Math.min(metrics.length - 1, baseIndex + 1)
    const directionalSection = metrics[directionalIndex]
    const directionalVisibleHeight = directionalSection
      ? getVisibleHeight(directionalSection.rect, viewportHeight)
      : 0

    let targetIndex = baseIndex
    if (directionalIndex !== baseIndex && directionalVisibleHeight >= viewportHeight / snapDenominator) {
      targetIndex = directionalIndex
    }

    const targetMetric = metrics[targetIndex]
    const targetScrollTop = Math.max(0, currentScrollTop + targetMetric.rect.top)

    if (Math.abs(targetScrollTop - currentScrollTop) < 4) {
      activeSectionIndex.value = targetIndex
      return
    }

    animateSectionSnap(targetScrollTop, targetIndex)
  }

  const queueSectionSnap = (delay = 18) => {
    if (snapTimer) {
      clearTimeout(snapTimer)
    }

    const runSnap = () => {
      snapTimer = null
      snapToDirectionalSection()
    }

    if (delay <= 0) {
      runSnap()
      return
    }

    snapTimer = setTimeout(runSnap, delay)
  }

  const handleSectionScroll = () => {
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop || 0
    if (currentScrollTop > lastScrollTop.value + 1) {
      scrollDirection.value = 'down'
    } else if (currentScrollTop < lastScrollTop.value - 1) {
      scrollDirection.value = 'up'
    }
    lastScrollTop.value = currentScrollTop

    updateSectionViewportStates()

    if (isAutoSnapping.value) return
    queueSectionSnap()
  }

  const handleViewportResize = () => {
    updateSectionViewportStates()

    if (isAutoSnapping.value) return
    activeSectionIndex.value = getNearestSectionIndex()
    queueSectionSnap(36)
  }

  const handleScrollEnd = () => {
    debouncedHandleSectionScroll.flush()

    if (isAutoSnapping.value) return
    queueSectionSnap(0)
  }

  const handleSnapInterrupt = () => {
    if (!isAutoSnapping.value) return
    cancelAutoSnap()
  }

  const initSectionObserver = () => {
    updateSectionViewportStates()
  }

  const debouncedHandleSectionScroll = debounce(handleSectionScroll, 90)

  onMounted(() => {
    lastScrollTop.value = window.pageYOffset || document.documentElement.scrollTop || 0
    activeSectionIndex.value = getNearestSectionIndex()
    updateSectionViewportStates()
    window.addEventListener('scroll', debouncedHandleSectionScroll, { passive: true })
    window.addEventListener('scrollend', handleScrollEnd)
    window.addEventListener('resize', handleViewportResize)
    window.addEventListener('wheel', handleSnapInterrupt, { passive: true })
    window.addEventListener('touchstart', handleSnapInterrupt, { passive: true })
    queueSectionSnap(48)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', debouncedHandleSectionScroll)
    window.removeEventListener('scrollend', handleScrollEnd)
    window.removeEventListener('resize', handleViewportResize)
    window.removeEventListener('wheel', handleSnapInterrupt)
    window.removeEventListener('touchstart', handleSnapInterrupt)

    if (snapTimer) {
      clearTimeout(snapTimer)
      snapTimer = null
    }

    if (snapAnimationId) {
      cancelAnimationFrame(snapAnimationId)
      snapAnimationId = null
    }

    debouncedHandleSectionScroll.cancel()
  })

  return {
    sectionStates,
    initSectionObserver,
    updateSectionViewportStates
  }
}
