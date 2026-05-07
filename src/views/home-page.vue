<template>
  <div class="home-page">
    <HeaderComponent />

    <main class="sections">
      <section
        class="section hero observe-section"
        data-section-id="hero"
        :class="sectionStates.hero"
      >
        <div class="container hero-content">
          <h2 class="hero-title fade-item" style="--delay: 0.05s;">欢迎来到我的个人博客</h2>
          <p class="hero-subtitle fade-item" style="--delay: 0.15s;">探索代码、设计与创新的交汇点</p>
          <button class="cta-button fade-item" style="--delay: 0.25s;" @click="goTextHomepage">
            开始阅读
          </button>
        </div>
      </section>

      <section
        class="section latest-posts observe-section"
        data-section-id="latest"
        :class="sectionStates.latest"
      >
        <div class="container">
          <h3 class="section-title fade-item" style="--delay: 0.05s;">最新文章</h3>

          <div class="posts-grid">
            <article
              v-for="(item, index) in posts"
              :key="item.id || index"
              class="post-card fade-item"
              :style="{ '--delay': `${0.14 + index * 0.1}s` }"
              @click="goToArticle(item.id)"
            >
              <div
                class="post-image"
                :data-card-id="index"
                @mousemove="handleMouseMove"
                @mouseenter="handleMouseEnter"
                @mouseleave="handleMouseLeave"
              ></div>
              <h4>{{ item.title }}</h4>
              <p>{{ item.desc }}</p>
              <span class="read-more">阅读更多</span>
            </article>
          </div>
        </div>
      </section>

      <section
        class="section about observe-section"
        data-section-id="about"
        :class="sectionStates.about"
      >
        <div class="container">
          <h3 class="section-title fade-item" style="--delay: 0.05s;">关于我</h3>

          <div class="about-content">
            <div class="about-text fade-item" style="--delay: 0.14s;">
              <p>我是一名热爱技术的开发者，希望通过这个博客分享学习心得、项目经验和技术见解。</p>
              <p>这里会记录编程、设计和数字生活里的观察与思考，也欢迎你一起继续往下探索。</p>
            </div>

            <div class="about-image fade-item" style="--delay: 0.24s;">
              <img
                src="https://cdn.imgos.cn/vip/2026/04/13/69dc4e3878df1.jpg"
                alt="关于我"
                class="about-image-img"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import HeaderComponent from '../components/header-component.vue'
import articles from '../data/articles'

export default {
  name: 'HomePage',
  components: {
    HeaderComponent
  },
  data() {
    return {
      posts: [],
      cardStates: {},
      colorSchemes: [
        { start: { r: 52, g: 152, b: 219 }, end: { r: 155, g: 89, b: 182 } },
        { start: { r: 46, g: 204, b: 113 }, end: { r: 52, g: 152, b: 219 } },
        { start: { r: 231, g: 76, b: 60 }, end: { r: 241, g: 196, b: 15 } }
      ],
      observer: null,
      snapTimer: null,
      snapAnimationId: null,
      isAutoSnapping: false,
      lastScrollTop: 0,
      scrollDirection: 'down',
      activeSectionIndex: 0,
      sectionStates: {
        hero: 'is-hidden-down',
        latest: 'is-hidden-down',
        about: 'is-hidden-down'
      }
    }
  },
  mounted() {
    this.posts = [...articles]
      .sort((a, b) => a.id - b.id)
      .slice(-3)
      .reverse()

    this.$nextTick(() => {
      this.initSectionObserver()
      this.lastScrollTop = window.pageYOffset || document.documentElement.scrollTop || 0
      this.activeSectionIndex = this.getNearestSectionIndex()
      window.addEventListener('scroll', this.handleSectionScroll, { passive: true })
      window.addEventListener('scrollend', this.handleScrollEnd)
      window.addEventListener('resize', this.handleViewportResize)
      window.addEventListener('wheel', this.handleSnapInterrupt, { passive: true })
      window.addEventListener('touchstart', this.handleSnapInterrupt, { passive: true })
      this.queueSectionSnap(48)
    })
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleSectionScroll)
    window.removeEventListener('scrollend', this.handleScrollEnd)
    window.removeEventListener('resize', this.handleViewportResize)
    window.removeEventListener('wheel', this.handleSnapInterrupt)
    window.removeEventListener('touchstart', this.handleSnapInterrupt)

    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }

    if (this.snapTimer) {
      clearTimeout(this.snapTimer)
      this.snapTimer = null
    }

    if (this.snapAnimationId) {
      cancelAnimationFrame(this.snapAnimationId)
      this.snapAnimationId = null
    }

    Object.values(this.cardStates).forEach((state) => {
      if (state.animationId) {
        cancelAnimationFrame(state.animationId)
      }
    })
  },
  methods: {
    handleSectionScroll() {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop || 0
      if (currentScrollTop > this.lastScrollTop + 1) {
        this.scrollDirection = 'down'
      } else if (currentScrollTop < this.lastScrollTop - 1) {
        this.scrollDirection = 'up'
      }
      this.lastScrollTop = currentScrollTop

      this.updateSectionViewportStates()

      if (this.isAutoSnapping) return
      this.queueSectionSnap()
    },
    handleViewportResize() {
      this.updateSectionViewportStates()

      if (this.isAutoSnapping) return
      this.activeSectionIndex = this.getNearestSectionIndex()
      this.queueSectionSnap(36)
    },
    handleScrollEnd() {
      if (this.isAutoSnapping) return
      this.queueSectionSnap(0)
    },
    handleSnapInterrupt() {
      if (!this.isAutoSnapping) return
      this.cancelAutoSnap()
    },
    queueSectionSnap(delay = 18) {
      if (this.snapTimer) {
        clearTimeout(this.snapTimer)
      }

      const runSnap = () => {
        this.snapTimer = null
        this.snapToDirectionalSection()
      }

      if (delay <= 0) {
        runSnap()
        return
      }

      this.snapTimer = setTimeout(runSnap, delay)
    },
    getSectionElements() {
      return Array.from(this.$el.querySelectorAll('.observe-section'))
    },
    getSectionMetrics() {
      return this.getSectionElements().map((section, index) => ({
        index,
        section,
        rect: section.getBoundingClientRect()
      }))
    },
    getVisibleHeight(rect, viewportHeight = window.innerHeight || document.documentElement.clientHeight) {
      const visibleTop = Math.max(rect.top, 0)
      const visibleBottom = Math.min(rect.bottom, viewportHeight)
      return Math.max(0, visibleBottom - visibleTop)
    },
    getNearestSectionIndex(metrics = this.getSectionMetrics()) {
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
    },
    snapToDirectionalSection() {
      const metrics = this.getSectionMetrics()
      if (!metrics.length) return

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop || 0
      const nearestIndex = this.getNearestSectionIndex(metrics)

      if (
        this.activeSectionIndex < 0 ||
        this.activeSectionIndex >= metrics.length ||
        Math.abs(this.activeSectionIndex - nearestIndex) > 1 ||
        this.getVisibleHeight(metrics[this.activeSectionIndex].rect, viewportHeight) === 0
      ) {
        this.activeSectionIndex = nearestIndex
      }

      const baseIndex = this.activeSectionIndex
      const directionalIndex = this.scrollDirection === 'up'
        ? Math.max(0, baseIndex - 1)
        : Math.min(metrics.length - 1, baseIndex + 1)
      const directionalSection = metrics[directionalIndex]
      const directionalVisibleHeight = directionalSection
        ? this.getVisibleHeight(directionalSection.rect, viewportHeight)
        : 0

      let targetIndex = baseIndex
      if (directionalIndex !== baseIndex && directionalVisibleHeight >= viewportHeight / 4) {
        targetIndex = directionalIndex
      }

      const targetMetric = metrics[targetIndex]
      const targetScrollTop = Math.max(0, currentScrollTop + targetMetric.rect.top)

      if (Math.abs(targetScrollTop - currentScrollTop) < 4) {
        this.activeSectionIndex = targetIndex
        return
      }

      this.animateSectionSnap(targetScrollTop, targetIndex)
    },
    animateSectionSnap(targetScrollTop, targetIndex) {
      this.cancelAutoSnap()

      const startScrollTop = window.pageYOffset || document.documentElement.scrollTop || 0
      const distance = targetScrollTop - startScrollTop
      const duration = Math.max(420, Math.min(760, Math.abs(distance) * 0.52))
      const startTime = performance.now()

      this.isAutoSnapping = true

      const step = (now) => {
        const progress = Math.min(1, (now - startTime) / duration)
        const eased = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2

        window.scrollTo(0, startScrollTop + distance * eased)
        this.updateSectionViewportStates()

        if (progress < 1 && this.isAutoSnapping) {
          this.snapAnimationId = requestAnimationFrame(step)
          return
        }

        this.snapAnimationId = null
        this.isAutoSnapping = false
        this.activeSectionIndex = targetIndex
        this.lastScrollTop = window.pageYOffset || document.documentElement.scrollTop || targetScrollTop
      }

      this.snapAnimationId = requestAnimationFrame(step)
    },
    cancelAutoSnap() {
      if (this.snapAnimationId) {
        cancelAnimationFrame(this.snapAnimationId)
        this.snapAnimationId = null
      }

      this.isAutoSnapping = false
    },
    initSectionObserver() {
      this.updateSectionViewportStates()
    },
    updateSectionViewportStates() {
      const sections = this.getSectionElements()
      if (!sections.length) return

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight
      const visibleBandTop = viewportHeight * 0.24
      const visibleBandBottom = viewportHeight * 0.76

      sections.forEach((section) => {
        const { sectionId } = section.dataset
        if (!sectionId) return

        const rect = section.getBoundingClientRect()
        const centerY = rect.top + rect.height / 2
        let nextState = 'is-visible'

        if (centerY < visibleBandTop) {
          nextState = 'is-hidden-up'
        } else if (centerY > visibleBandBottom) {
          nextState = 'is-hidden-down'
        }

        this.$set(this.sectionStates, sectionId, nextState)
      })
    },
    goTextHomepage() {
      this.$router.push('/text-homepage')
    },
    goToArticle(id) {
      this.$router.push(`/article/${id}`)
    },
    getCardState(element) {
      const cardId = element.dataset.cardId

      if (!this.cardStates[cardId]) {
        const colorScheme = this.colorSchemes[parseInt(cardId, 10) % this.colorSchemes.length]
        this.cardStates[cardId] = {
          animationId: null,
          currentRadius: 0,
          targetRadius: 0,
          mouseX: 0,
          mouseY: 0,
          color: '#3498db',
          colorScheme
        }
      }

      return this.cardStates[cardId]
    },
    handleMouseMove(event) {
      const element = event.currentTarget
      const rect = element.getBoundingClientRect()
      const state = this.getCardState(element)

      state.mouseX = event.clientX - rect.left
      state.mouseY = event.clientY - rect.top

      const relX = state.mouseX / rect.width
      const relY = state.mouseY / rect.height
      const scheme = state.colorScheme
      const ratio = (relX + relY) / 2
      const r = Math.floor(scheme.start.r + (scheme.end.r - scheme.start.r) * ratio)
      const g = Math.floor(scheme.start.g + (scheme.end.g - scheme.start.g) * ratio)
      const b = Math.floor(scheme.start.b + (scheme.end.b - scheme.start.b) * ratio)

      state.color = `rgb(${r}, ${g}, ${b})`
      this.updateGradient(element, state)
    },
    handleMouseEnter(event) {
      const element = event.currentTarget
      const rect = element.getBoundingClientRect()
      const state = this.getCardState(element)

      state.mouseX = event.clientX - rect.left
      state.mouseY = event.clientY - rect.top
      state.currentRadius = 0
      state.targetRadius = 150

      this.animateGradient(element, state)
    },
    handleMouseLeave(event) {
      const element = event.currentTarget
      const state = this.getCardState(element)

      state.targetRadius = 0
      this.animateGradient(element, state)
    },
    animateGradient(element, state) {
      if (state.animationId) {
        cancelAnimationFrame(state.animationId)
      }

      const animate = () => {
        if (state.currentRadius < state.targetRadius) {
          state.currentRadius = Math.min(state.currentRadius + 10, state.targetRadius)
        } else if (state.currentRadius > state.targetRadius) {
          state.currentRadius = Math.max(state.currentRadius - 10, state.targetRadius)
        }

        this.updateGradient(element, state)

        if (state.currentRadius !== state.targetRadius) {
          state.animationId = requestAnimationFrame(animate)
        } else {
          state.animationId = null
        }
      }

      animate()
    },
    updateGradient(element, state) {
      if (state.currentRadius > 0) {
        element.style.background = `radial-gradient(circle ${state.currentRadius}px at ${state.mouseX}px ${state.mouseY}px, ${state.color}, transparent), linear-gradient(45deg, #ecf0f1, #bdc3c7)`
        return
      }

      element.style.background = 'linear-gradient(45deg, #ecf0f1, #bdc3c7)'
    }
  }
}
</script>

<style scoped>
.home-page {
  --section-fade-duration: 1.42s;
  --section-fade-distance: 86px;
  --section-fade-blur: 10px;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 50%, #f5f5f5 100%);
}

.sections {
  position: relative;
}

.section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 160px 0 88px;
  overflow: hidden;
}

.container {
  width: 100%;
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 18px;
}

.observe-section .fade-item {
  --section-shift: var(--section-fade-distance);
  --section-blur: var(--section-fade-blur);
  opacity: 0;
  translate: 0 var(--section-shift);
  filter: blur(var(--section-blur));
  transition:
    opacity var(--section-fade-duration) cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0s),
    translate var(--section-fade-duration) cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0s),
    filter var(--section-fade-duration) cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0s);
  will-change: opacity, translate, filter;
}

.observe-section .hero-title.fade-item {
  transition:
    opacity var(--section-fade-duration) cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0s),
    translate var(--section-fade-duration) cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0s),
    filter var(--section-fade-duration) cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0s),
    transform 0.3s ease,
    text-shadow 0.3s ease;
}

.observe-section .cta-button.fade-item {
  transition:
    opacity var(--section-fade-duration) cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0s),
    translate var(--section-fade-duration) cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0s),
    filter var(--section-fade-duration) cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0s),
    transform 0.3s ease,
    box-shadow 0.3s ease,
    background 0.3s ease;
}

.observe-section .post-card.fade-item {
  transition:
    opacity var(--section-fade-duration) cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0s),
    translate var(--section-fade-duration) cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0s),
    filter var(--section-fade-duration) cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0s),
    transform 0.32s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease;
}

.observe-section.is-visible .fade-item {
  opacity: 1;
  --section-shift: 0px;
  --section-blur: 0px;
}

.observe-section.is-hidden-down .fade-item {
  opacity: 0;
  --section-shift: var(--section-fade-distance);
  --section-blur: var(--section-fade-blur);
}

.observe-section.is-hidden-up .fade-item {
  opacity: 0;
  --section-shift: calc(var(--section-fade-distance) * -1);
  --section-blur: var(--section-fade-blur);
}

.hero {
  text-align: center;
  /* background: #fff; */
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-title {
  display: inline-block;
  margin-bottom: 20px;
  font-size: 3rem;
  color: #2c3e50;
  text-shadow: 0 2px 4px rgba(44, 62, 80, 0.1);
  transition: transform 0.3s ease, text-shadow 0.3s ease;
  cursor: pointer;
}

.hero-title:hover {
  transform: translateY(-5px);
  text-shadow: 0 8px 16px rgba(44, 62, 80, 0.3), 0 12px 24px rgba(44, 62, 80, 0.2);
}

.hero-subtitle {
  margin-bottom: 40px;
  font-size: 1.2rem;
  color: #7f8c8d;
}

.cta-button {
  border: none;
  border-radius: 25px;
  padding: 15px 30px;
  background: linear-gradient(45deg, #3498db, #2980b9);
  color: #ffffff;
  font-size: 1.1rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
  background: linear-gradient(45deg, #2980b9, #21618c);
}

.latest-posts,
.about {
  background: transparent;
}

.section-title {
  margin-bottom: 50px;
  font-size: 2.5rem;
  color: #2c3e50;
  text-align: center;
  text-shadow: 0 0 8px rgba(44, 62, 80, 0.2);
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.post-card {
  border: 1px solid rgba(189, 195, 199, 0.3);
  border-radius: 12px;
  padding: 25px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition:
    transform 0.32s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease;
}

.post-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  border-color: rgba(52, 152, 219, 0.2);
}

.post-image {
  position: relative;
  height: 150px;
  margin-bottom: 15px;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(45deg, #ecf0f1, #bdc3c7);
}

.post-image::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, rgba(52, 152, 219, 0.1), rgba(155, 89, 182, 0.1));
}

.post-card h4 {
  margin-bottom: 10px;
  color: #2c3e50;
  font-weight: 600;
}

.post-card p {
  margin-bottom: 15px;
  color: #7f8c8d;
  line-height: 1.6;
}

.read-more {
  color: #3498db;
  font-weight: 600;
}

.about-content {
  display: flex;
  align-items: center;
  gap: 50px;
}

.about-text {
  flex: 1;
}

.about-text p {
  margin-bottom: 20px;
  line-height: 1.7;
  color: #7f8c8d;
  font-size: 1.1rem;
}

.about-image {
  width: 200px;
  height: 200px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 6px 24px rgba(44, 62, 80, 0.1), 0 1.5px 6px rgba(52, 152, 219, 0.1);
}

.about-image-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: right top;
  border-radius: 50%;
}

@media (prefers-reduced-motion: reduce) {
  .observe-section .fade-item,
  .post-card,
  .cta-button,
  .hero-title {
    transition: none;
  }

  .observe-section .fade-item {
    opacity: 1;
    translate: 0 0;
    filter: none;
  }
}

@media (max-width: 768px) {
  .section {
    padding: 132px 0 64px;
  }

  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .section-title {
    margin-bottom: 36px;
    font-size: 2rem;
  }

  .about-content {
    flex-direction: column;
    text-align: center;
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
