<template>
  <div>
    <header class="header" :class="{ 'header-hidden': headerHidden }">
      <div class="container">
        <router-link to="/" exact class="logo">Sunn</router-link>
        <nav ref="nav" class="nav" :class="{ 'nav-sliding': isIndicatorAnimating }">
          <button
            v-for="(link, index) in navLinks"
            :key="link.to"
            ref="navLinks"
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

<script>
export default {
  name: 'HeaderComponent',
  data() {
    return {
      headerHidden: false,
      lastScrollTop: 0,
      scrollThreshold: 100,
      indicatorWidth: 0,
      indicatorOffset: 0,
      indicatorReady: false,
      pendingNavIndex: null,
      disableIndicatorTransition: true,
      navigationTimer: null,
      animationTimer: null,
      isIndicatorAnimating: false
    }
  },
  computed: {
    navLinks() {
      return [
        { label: '首页', to: '/', matches: ['Home'] },
        { label: '关于', to: '/personal', matches: ['PersonalHomepage'] },
        { label: '博客', to: '/text-homepage', matches: ['TextHomePage', 'ClassificationPage', 'TextRead'] }
      ]
    },
    activeNavIndex() {
      const index = this.navLinks.findIndex(link => link.matches.includes(this.$route.name))
      return index === -1 ? 0 : index
    },
    displayNavIndex() {
      return this.pendingNavIndex === null ? this.activeNavIndex : this.pendingNavIndex
    },
    navIndicatorStyle() {
      return {
        width: `${this.indicatorWidth}px`,
        transform: `translateX(${this.indicatorOffset}px)`,
        opacity: this.indicatorReady ? 1 : 0,
        transition: this.disableIndicatorTransition
          ? 'none'
          : 'transform 0.52s cubic-bezier(0.22, 1, 0.36, 1), width 0.52s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.22s ease'
      }
    },
    shouldHideOnScroll() {
      const hidePages = ['TextHomePage', 'ClassificationPage', 'TextRead']
      return hidePages.includes(this.$route.name)
    }
  },
  watch: {
    $route() {
      this.pendingNavIndex = null
      this.$nextTick(() => {
        this.updateIndicator(this.activeNavIndex, true)
      })
    }
  },
  mounted() {
    if (this.shouldHideOnScroll) {
      window.addEventListener('scroll', this.handleScroll)
    }
    window.addEventListener('resize', this.handleResize)
    this.$nextTick(() => {
      this.updateIndicator(this.activeNavIndex, true)
    })
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll)
    window.removeEventListener('resize', this.handleResize)
    if (this.navigationTimer) {
      clearTimeout(this.navigationTimer)
    }
    if (this.animationTimer) {
      clearTimeout(this.animationTimer)
    }
  },
  methods: {
    handleScroll() {
      if (!this.shouldHideOnScroll) return

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop

      if (scrollTop > this.lastScrollTop && scrollTop > this.scrollThreshold) {
        this.headerHidden = true
      } else {
        this.headerHidden = false
      }

      this.lastScrollTop = scrollTop
    },
    handleResize() {
      this.updateIndicator(this.displayNavIndex, true)
    },
    getNavLinkElement(index) {
      const navLinks = this.$refs.navLinks
      const linkList = Array.isArray(navLinks) ? navLinks : [navLinks]
      return linkList[index] || null
    },
    updateIndicator(index = this.displayNavIndex, immediate = false) {
      const activeLinkElement = this.getNavLinkElement(index)

      if (!activeLinkElement || !this.$refs.nav) {
        this.indicatorReady = false
        return
      }

      this.disableIndicatorTransition = immediate
      this.indicatorWidth = activeLinkElement.offsetWidth
      this.indicatorOffset = activeLinkElement.offsetLeft
      this.indicatorReady = true

      if (immediate) {
        requestAnimationFrame(() => {
          this.disableIndicatorTransition = false
        })
      }
    },
    triggerIndicatorAnimation() {
      this.isIndicatorAnimating = false

      requestAnimationFrame(() => {
        this.isIndicatorAnimating = true
      })

      if (this.animationTimer) {
        clearTimeout(this.animationTimer)
      }

      this.animationTimer = setTimeout(() => {
        this.isIndicatorAnimating = false
        this.animationTimer = null
      }, 520)
    },
    handleNavClick(link, index) {
      if (index === this.activeNavIndex && this.$route.path === link.to) {
        return
      }

      this.pendingNavIndex = index
      this.triggerIndicatorAnimation()
      this.updateIndicator(index)

      if (this.navigationTimer) {
        clearTimeout(this.navigationTimer)
      }

      this.navigationTimer = setTimeout(() => {
        this.$router.push(link.to)
        this.navigationTimer = null
      }, 220)
    }
  }
}
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
  transition: transform 0.3s ease;
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

.nav-link:hover {
  transform: translateY(-1px);
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

