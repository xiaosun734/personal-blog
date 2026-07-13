<template>
  <div>
    <header class="header" :class="{ 'header-hidden': headerHidden }">
      <div class="container">
        <router-link to="/" class="logo">Sunn</router-link>
        <nav ref="navEl" class="nav" :class="{ 'nav-sliding': isIndicatorAnimating }">
          <button
            v-for="(link, index) in navLinks"
            :key="link.to"
            :ref="(el) => { if (el) navLinkEls[index] = el }"
            type="button"
            class="nav-link"
            :class="{ 'is-active': index === displayNavIndex }"
            @click="handleNavClick(link, index)"
          >
            {{ link.label }}
          </button>
          <span class="nav-indicator" :style="navIndicatorStyle"></span>
        </nav>
      </div>
    </header>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import debounce from '@/utils/debounce'

interface NavLink {
  label: string
  to: string
  matches: string[]
}

const router = useRouter()
const route = useRoute()

// Template refs
const navEl = ref<HTMLElement | null>(null)
const navLinkEls: any[] = []

// State
const headerHidden = ref(false)
const lastScrollTop = ref(0)
const scrollThreshold = 72
const indicatorWidth = ref(0)
const indicatorOffset = ref(0)
const indicatorReady = ref(false)
const pendingNavIndex = ref<number | null>(null)
const disableIndicatorTransition = ref(true)
let navigationTimer: ReturnType<typeof setTimeout> | null = null
let animationTimer: ReturnType<typeof setTimeout> | null = null
const isIndicatorAnimating = ref(false)
let isScrollListenerBound = false

// Nav links (static)
const navLinks: NavLink[] = [
  { label: '首页', to: '/', matches: ['Home'] },
  { label: '关于', to: '/personal', matches: ['PersonalHomepage'] },
  { label: '博客', to: '/text-homepage', matches: ['TextHomePage', 'ClassificationPage', 'TextRead'] }
]

// Computed
const activeNavIndex = computed(() => {
  const index = navLinks.findIndex(link => link.matches.includes(route.name as string))
  return index === -1 ? 0 : index
})

const displayNavIndex = computed(() => {
  return pendingNavIndex.value === null ? activeNavIndex.value : pendingNavIndex.value
})

const navIndicatorStyle = computed(() => ({
  width: `${indicatorWidth.value}px`,
  transform: `translateX(${indicatorOffset.value}px)`,
  opacity: indicatorReady.value ? 1 : 0,
  transition: disableIndicatorTransition.value
    ? 'none'
    : 'transform 0.52s cubic-bezier(0.22, 1, 0.36, 1), width 0.52s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.22s ease'
}))

const shouldHideOnScroll = computed(() => {
  const hidePages = ['TextHomePage', 'ClassificationPage', 'TextRead']
  return hidePages.includes(route.name as string)
})

// Methods
const bindScrollListener = () => {
  if (isScrollListenerBound || !debouncedHandleScroll) return
  window.addEventListener('scroll', debouncedHandleScroll, { passive: true })
  isScrollListenerBound = true
}

const unbindScrollListener = () => {
  if (!isScrollListenerBound) return
  window.removeEventListener('scroll', debouncedHandleScroll)
  isScrollListenerBound = false
}

const handleScroll = () => {
  if (!shouldHideOnScroll.value) return

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0

  if (scrollTop > lastScrollTop.value && scrollTop > scrollThreshold) {
    headerHidden.value = true
  } else {
    headerHidden.value = false
  }

  lastScrollTop.value = scrollTop
}

const handleResize = () => {
  updateIndicator(displayNavIndex.value, true)
}

const getNavLinkElement = (index: number): HTMLElement | null => {
  return (navLinkEls[index] as unknown as HTMLElement) || null
}

const updateIndicator = (index: number = displayNavIndex.value, immediate = false) => {
  const activeLinkElement = getNavLinkElement(index)

  if (!activeLinkElement || !navEl.value) {
    indicatorReady.value = false
    return
  }

  disableIndicatorTransition.value = immediate
  indicatorWidth.value = activeLinkElement.offsetWidth
  indicatorOffset.value = activeLinkElement.offsetLeft
  indicatorReady.value = true

  if (immediate) {
    requestAnimationFrame(() => {
      disableIndicatorTransition.value = false
    })
  }
}

const triggerIndicatorAnimation = () => {
  isIndicatorAnimating.value = false

  requestAnimationFrame(() => {
    isIndicatorAnimating.value = true
  })

  if (animationTimer) {
    clearTimeout(animationTimer)
  }

  animationTimer = setTimeout(() => {
    isIndicatorAnimating.value = false
    animationTimer = null
  }, 520)
}

const syncScrollBehavior = () => {
  if (shouldHideOnScroll.value) {
    bindScrollListener()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0
    lastScrollTop.value = scrollTop
    headerHidden.value = scrollTop > scrollThreshold
    return
  }

  unbindScrollListener()
  headerHidden.value = false
  lastScrollTop.value = 0
}

const handleNavClick = (link: NavLink, index: number) => {
  if (index === activeNavIndex.value && route.path === link.to) {
    return
  }

  pendingNavIndex.value = index
  triggerIndicatorAnimation()
  updateIndicator(index)

  if (navigationTimer) {
    clearTimeout(navigationTimer)
  }

  navigationTimer = setTimeout(() => {
    router.push(link.to)
    navigationTimer = null
  }, 220)
}

// Debounced scroll handler
const debouncedHandleScroll = debounce(handleScroll, 80, { leading: true, trailing: true })

// Watch route changes
watch(() => route.name, () => {
  pendingNavIndex.value = null
  syncScrollBehavior()
  nextTick(() => {
    updateIndicator(activeNavIndex.value, true)
  })
})

// Lifecycle
onMounted(() => {
  window.addEventListener('resize', handleResize)
  syncScrollBehavior()
  nextTick(() => {
    updateIndicator(activeNavIndex.value, true)
  })
})

onBeforeUnmount(() => {
  unbindScrollListener()
  debouncedHandleScroll.cancel()
  window.removeEventListener('resize', handleResize)
  if (navigationTimer) {
    clearTimeout(navigationTimer)
  }
  if (animationTimer) {
    clearTimeout(animationTimer)
  }
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header {
  height: 120px;
  min-height: 120px;
  line-height: 120px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid #e1e8ed;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 100;
  box-sizing: border-box;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}

.header-hidden {
  transform: translateY(-100%);
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 100%;
}

.logo {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 1.4rem;
  font-weight: 700;
  cursor: pointer;
  line-height: 72px;
  color: #2c3e50;
  text-decoration: none;
  text-shadow: 0 2px 4px rgba(44, 62, 80, 0.1);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), text-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo:hover {
  transform: translateY(-5px);
  text-shadow: 0 8px 16px rgba(44, 62, 80, 0.3), 0 12px 24px rgba(44, 62, 80, 0.2);
}

.nav {
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 8px;
  padding: 5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.42);
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: 0 10px 30px rgba(99, 123, 148, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.nav-link {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  min-width: 60px;
  padding: 0 14px;
  color: #5f7184;
  text-decoration: none;
  line-height: 42px;
  white-space: nowrap;
  font-size: 0.95rem;
  font-weight: 500;
  font-family: inherit;
  border: none;
  background: transparent;
  border-radius: 999px;
  cursor: pointer;
  transition: color 0.3s ease, transform 0.3s ease;
}

.nav-link:hover,
.nav-link.is-active {
  color: #1f3246;
}



.nav-indicator {
  position: absolute;
  left: 0;
  top: 5px;
  bottom: 5px;
  z-index: 0;
  pointer-events: none;
  border-radius: 999px;
  will-change: transform, width;
  background: linear-gradient(135deg, rgba(210, 226, 241, 0.96), rgba(190, 208, 226, 0.96));
  border: 1px solid rgba(173, 194, 214, 0.75);
  box-shadow: 0 8px 18px rgba(108, 134, 160, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

.nav.nav-sliding .nav-indicator {
  animation: indicator-glow 0.52s ease;
}

.container a {
  text-decoration: none;
}

@keyframes indicator-glow {
  0% {
    box-shadow: 0 6px 14px rgba(108, 134, 160, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.55);
    filter: saturate(96%);
  }
  50% {
    box-shadow: 0 14px 28px rgba(108, 134, 160, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.75);
    filter: saturate(112%);
  }
  100% {
    box-shadow: 0 8px 18px rgba(108, 134, 160, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.65);
    filter: saturate(100%);
  }
}

@media (max-width: 768px) {
  .header {
    height: auto;
    line-height: normal;
  }

  .header .container {
    flex-direction: column;
    gap: 12px;
    padding: 10px 16px;
  }

  .nav {
    gap: 6px;
    padding: 4px;
  }

  .nav-link {
    min-width: 56px;
    padding: 0 12px;
    line-height: 38px;
    font-size: 0.9rem;
  }
}
</style>

