<template>
  <div
    ref="rootEl"
    class="page-magnifier"
    @mouseenter="handleSurfaceEnter"
    @mousemove="handleSurfaceMove"
    @mouseleave="handleSurfaceLeave"
  >
    <slot />

    <div
      v-if="isMagnifierEnabled"
      class="page-magnifier-overlay"
      :style="magnifierOverlayStyle"
      aria-hidden="true"
    >
      <div class="page-magnifier-scroll-layer" :style="magnifierScrollLayerStyle">
        <slot name="scroll-overlay" />    
      </div>

      <div class="page-magnifier-fixed-layer" :style="magnifierFixedLayerStyle">
        <slot name="fixed-overlay" />    
      </div>
    </div>

    <div
      v-if="isMagnifierEnabled && showMagnifierLens"
      class="page-magnifier-lens"
      :style="magnifierLensStyle"
      aria-hidden="true"
    ></div>

    <button
      type="button"
      class="page-magnifier-toggle-button"
      :class="{ active: isMagnifierEnabled }"
      :style="toggleButtonStyle"
      :title="isMagnifierEnabled ? enabledTitle : disabledTitle"
      :aria-pressed="isMagnifierEnabled ? 'true' : 'false'"
      @click="toggleMagnifier"
    >
      <slot name="toggle-icon">
        <svg viewBox="0 0 24 24" class="page-magnifier-toggle-icon" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="5.5"></circle>
          <line x1="15" y1="15" x2="20" y2="20"></line>
        </svg>
      </slot>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import debounce from '@/utils/debounce'

const props = withDefaults(defineProps<{
  radius?: number
  zoomLevel?: number
  enabledTitle?: string
  disabledTitle?: string
  buttonOffsetBottom?: number
  buttonOffsetLeft?: number
  buttonOffsetBottomMobile?: number
  buttonOffsetLeftMobile?: number
  buttonSize?: number
  buttonSizeMobile?: number
}>(), {
  radius: 60,
  zoomLevel: 1.8,
  enabledTitle: '关闭放大镜',
  disabledTitle: '打开放大镜',
  buttonOffsetBottom: 80,
  buttonOffsetLeft: 20,
  buttonOffsetBottomMobile: 63,
  buttonOffsetLeftMobile: 15,
  buttonSize: 48,
  buttonSizeMobile: 40
})

// Template ref
const rootEl = ref<HTMLElement | null>(null)

// State
const isMagnifierEnabled = ref(false)
const showMagnifierLens = ref(false)
const mouseX = ref(0)
const mouseY = ref(0)
const surfaceLeft = ref(0)
const surfaceTop = ref(0)
const surfaceWidth = ref(0)
const scrollTranslateY = ref(0)
const lastScrollTop = ref(0)
let scrollMotionTimeout: ReturnType<typeof setTimeout> | null = null

// Computed
const magnifierOverlayStyle = computed(() => {
  const clipPath = showMagnifierLens.value
    ? `circle(${props.radius}px at ${mouseX.value}px ${mouseY.value}px)`
    : 'circle(0px at 0 0)'

  return {
    clipPath: clipPath,
    WebkitClipPath: clipPath
  }
})

const magnifierScrollLayerStyle = computed(() => {
  const localMouseX = mouseX.value - surfaceLeft.value
  const localMouseY = mouseY.value - surfaceTop.value
  const translateX = (1 - props.zoomLevel) * localMouseX
  const translateY = (1 - props.zoomLevel) * localMouseY

  return {
    left: `${surfaceLeft.value}px`,
    top: `${surfaceTop.value}px`,
    width: `${surfaceWidth.value}px`,
    transform: `translate(${translateX}px, ${translateY}px) scale(${props.zoomLevel})`
  }
})

const magnifierFixedLayerStyle = computed(() => {
  const translateX = (1 - props.zoomLevel) * mouseX.value
  const translateY = (1 - props.zoomLevel) * mouseY.value

  return {
    transform: `translate(${translateX}px, ${translateY}px) scale(${props.zoomLevel})`
  }
})

const magnifierLensStyle = computed(() => {
  const diameter = props.radius * 2

  return {
    width: `${diameter}px`,
    height: `${diameter}px`,
    left: `${mouseX.value - props.radius}px`,
    top: `${mouseY.value - props.radius}px`
  }
})

const toggleButtonStyle = computed(() => ({
  '--page-magnifier-button-size': `${props.buttonSize}px`,
  '--page-magnifier-button-size-mobile': `${props.buttonSizeMobile}px`,
  '--page-magnifier-button-bottom': `${props.buttonOffsetBottom}px`,
  '--page-magnifier-button-left': `${props.buttonOffsetLeft}px`,
  '--page-magnifier-button-bottom-mobile': `${props.buttonOffsetBottomMobile}px`,
  '--page-magnifier-button-left-mobile': `${props.buttonOffsetLeftMobile}px`,
  '--page-magnifier-button-scroll-y': `${scrollTranslateY.value}px`
}))

// Methods
const syncSurfaceBounds = () => {
  if (!rootEl.value) {
    return
  }

  const rect = rootEl.value.getBoundingClientRect()
  surfaceLeft.value = rect.left
  surfaceTop.value = rect.top
  surfaceWidth.value = rect.width
}

const handleViewportBlur = () => {
  showMagnifierLens.value = false
}

const handleScrollMotion = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0
  const scrollDelta = scrollTop - lastScrollTop.value

  scrollTranslateY.value = Math.max(Math.min(scrollTranslateY.value + scrollDelta * 0.2, 10), -10)
  lastScrollTop.value = scrollTop

  if (scrollMotionTimeout) {
    clearTimeout(scrollMotionTimeout)
  }

  scrollMotionTimeout = setTimeout(() => {
    scrollTranslateY.value = 0
    scrollMotionTimeout = null
  }, 150)
}

const updatePointer = (event: MouseEvent) => {
  mouseX.value = event.clientX
  mouseY.value = event.clientY
}

const addViewportListeners = () => {
  window.addEventListener('scroll', debouncedSyncSurfaceBounds, { passive: true })
  window.addEventListener('resize', syncSurfaceBounds)
  window.addEventListener('blur', handleViewportBlur)
}

const removeViewportListeners = () => {
  window.removeEventListener('scroll', debouncedSyncSurfaceBounds)
  window.removeEventListener('resize', syncSurfaceBounds)
  window.removeEventListener('blur', handleViewportBlur)
}

const toggleMagnifier = () => {
  isMagnifierEnabled.value = !isMagnifierEnabled.value

  if (isMagnifierEnabled.value) {
    syncSurfaceBounds()
    addViewportListeners()
    return
  }

  showMagnifierLens.value = false
  removeViewportListeners()
}

const handleSurfaceEnter = (event: MouseEvent) => {
  if (!isMagnifierEnabled.value) {
    return
  }

  updatePointer(event)
  showMagnifierLens.value = true
}

const handleSurfaceMove = (event: MouseEvent) => {
  if (!isMagnifierEnabled.value) {
    return
  }

  updatePointer(event)
  showMagnifierLens.value = true
}

const handleSurfaceLeave = () => {
  showMagnifierLens.value = false
}

// Debounced handlers
const debouncedHandleScrollMotion = debounce(handleScrollMotion, 80, { leading: true, trailing: true })
const debouncedSyncSurfaceBounds = debounce(syncSurfaceBounds, 80, { leading: true, trailing: true })

// Lifecycle
onMounted(() => {
  lastScrollTop.value = window.pageYOffset || document.documentElement.scrollTop || 0
  syncSurfaceBounds()
  window.addEventListener('scroll', debouncedHandleScrollMotion, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', debouncedHandleScrollMotion)
  removeViewportListeners()
  debouncedHandleScrollMotion.cancel()
  debouncedSyncSurfaceBounds.cancel()
  if (scrollMotionTimeout) {
    clearTimeout(scrollMotionTimeout)
  }
})
</script>

<style scoped>
.page-magnifier {
  width: 100%;
}

.page-magnifier-overlay {
  position: fixed;
  inset: 0;
  z-index: 920;
  overflow: hidden;
  pointer-events: none;
}

.page-magnifier-scroll-layer,
.page-magnifier-fixed-layer {
  position: absolute;
  left: 0;
  width: 100%;
  transform-origin: top left;
  pointer-events: none;
}

.page-magnifier-scroll-layer {
  min-height: 100vh;
}

.page-magnifier-fixed-layer {
  top: 0;
  height: 100vh;
}

.page-magnifier-lens {
  position: fixed;
  z-index: 930;
  pointer-events: none;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.95);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.22);
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: saturate(1.05);
}

.page-magnifier-toggle-button {
  width: var(--page-magnifier-button-size, 48px);
  height: var(--page-magnifier-button-size, 48px);
  border-radius: 50%;
  background-color: #ffffff;
  border: 1px solid #e1e8ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: fixed;
  bottom: var(--page-magnifier-button-bottom, 80px);
  left: var(--page-magnifier-button-left, 20px);
  z-index: 1000;
  transform: translateY(var(--page-magnifier-button-scroll-y, 0px));
}

.page-magnifier-toggle-button:hover {
  transform: translateY(calc(var(--page-magnifier-button-scroll-y, 0px) - 2px));
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #414548;
}

.page-magnifier-toggle-button.active {
  background-color: #f8fafc;
  border-color: #414548;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.14);
}

.page-magnifier-toggle-icon {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: #2c3e50;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: stroke 0.3s ease;
}

.page-magnifier-toggle-button:hover .page-magnifier-toggle-icon,
.page-magnifier-toggle-button.active .page-magnifier-toggle-icon {
  stroke: #414548;
}

@media (max-width: 768px) {
  .page-magnifier-toggle-button {
    width: var(--page-magnifier-button-size-mobile, 40px);
    height: var(--page-magnifier-button-size-mobile, 40px);
    bottom: var(--page-magnifier-button-bottom-mobile, 63px);
    left: var(--page-magnifier-button-left-mobile, 15px);
  }

  .page-magnifier-toggle-icon {
    width: 18px;
    height: 18px;
  }
}
</style>
