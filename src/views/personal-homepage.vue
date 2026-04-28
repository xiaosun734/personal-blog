<template>
  <div class="personal-homepage">
    <BackButton />
    <HeaderComponent />

    <main class="sections">
      <section
        class="section profile-section observe-section"
        data-section-id="profile"
        :class="sectionStates.profile"
      >
        <div class="container profile-layout">
          <div
            class="profile-card fade-item"
            style="--delay: 0.05s;"
            :class="{ hovered: isProfileHovered }"
            @mouseenter="showTagBoxes"
            @mouseleave="hideTagBoxes"
          >
            <div class="profile-avatar">
              <img src="https://cdn.imgos.cn/vip/2026/04/13/69dc4e3878df1.jpg" alt="个人头像" />
            </div>
            <h1 class="profile-name">Sunn</h1>
            <p class="profile-desc">前端开发者 | 技术爱好者 | 生活记录者</p>
          </div>

          <div
            v-for="(tag, index) in tagBoxes"
            :key="index"
            class="tag-box"
            :class="{ show: showTags }"
            :style="{
              left: showTags ? tag.targetX : tag.x,
              top: showTags ? tag.targetY : tag.y,
              transitionDelay: `${index * 0.08}s`
            }"
          >
            {{ tag.label }}
          </div>
        </div>
      </section>

      <section
        class="section contact-section observe-section"
        data-section-id="contact"
        :class="sectionStates.contact"
      >
        <div class="container">
          <h2 class="section-title fade-item" style="--delay: 0.05s;">联系方式</h2>

          <div class="contact-cards">
            <div class="contact-card fade-item" style="--delay: 0.14s;">
              <div class="contact-icon">📧</div>
              <h3>邮箱</h3>
              <p>990853641@qq.com</p>
            </div>

            <div class="contact-card fade-item" style="--delay: 0.22s;">
              <div class="contact-icon">🐱</div>
              <h3>GitHub</h3>
              <p><a href="https://github.com/xiaosun734" target="_blank" rel="noreferrer">github.com/xiaosun734</a></p>
            </div>

            <div
              class="contact-card fade-item"
              style="--delay: 0.3s;"
              @mouseenter="showQRCode('qq')"
              @mousemove="moveQRCode"
              @mouseleave="hideQRCode"
            >
              <div class="contact-icon">🐧</div>
              <h3>QQ</h3>
              <p>990853641</p>
            </div>

            <div class="contact-card fade-item" style="--delay: 0.38s;">
              <div class="contact-icon">📱</div>
              <h3>电话（微信同号）</h3>
              <p>17380552618</p>
            </div>
          </div>

          <div
            v-if="showQR"
            class="qr-code-container"
            :style="{ left: `${qrPosition.x}px`, top: `${qrPosition.y}px` }"
          >
            <div class="qr-code">
              <img :src="qrCodeSrc" alt="二维码" />
              <p>{{ qrCodeTitle }}</p>
            </div>
          </div>
        </div>
      </section>

      <section
        class="section links-section observe-section"
        data-section-id="links"
        :class="sectionStates.links"
      >
        <div class="container">
          <h2 class="section-title fade-item" style="--delay: 0.05s;">友链</h2>

          <div class="links-grid">
            <div
              v-for="(link, index) in friendLinks"
              :key="link.name"
              class="link-item fade-item"
              :style="{ '--delay': `${0.14 + index * 0.08}s` }"
            >
              <a :href="link.url" target="_blank" rel="noreferrer" :title="link.description">
                <h3>{{ link.name }}</h3>
                <p>{{ link.description }}</p>
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import HeaderComponent from '../components/header-component.vue'
import BackButton from '../components/back-button.vue'

export default {
  name: 'PersonalHomepage',
  components: {
    HeaderComponent,
    BackButton
  },
  data() {
    return {
      showQR: false,
      qrPosition: { x: 0, y: 0 },
      qrCodeSrc: '',
      qrCodeTitle: '',
      observer: null,
      snapTimer: null,
      snapAnimationId: null,
      isAutoSnapping: false,
      lastScrollTop: 0,
      scrollDirection: 'down',
      activeSectionIndex: 0,
      sectionStates: {
        profile: 'is-hidden-down',
        contact: 'is-hidden-down',
        links: 'is-hidden-down'
      },
      friendLinks: [
        {
          name: 'Vue.js',
          url: 'https://vuejs.org/',
          description: '渐进式 JavaScript 框架'
        },
        {
          name: 'React',
          url: 'https://react.dev/',
          description: '用于构建用户界面的 JavaScript 库'
        },
        {
          name: 'Node.js',
          url: 'https://nodejs.org/',
          description: '基于 Chrome V8 引擎的 JavaScript 运行时'
        },
        {
          name: 'GitHub',
          url: 'https://github.com/',
          description: '面向开源与私有项目的协作平台'
        },
        {
          name: 'MDN Web Docs',
          url: 'https://developer.mozilla.org/',
          description: '常用的 Web 开发技术文档'
        },
        {
          name: 'Stack Overflow',
          url: 'https://stackoverflow.com/',
          description: '程序员问答社区'
        }
      ],
      showTags: false,
      isProfileHovered: false,
      hoverDebounceTimer: null,
      tagBoxes: [
        { label: '雅思托福没考', x: '50%', y: '50%', targetX: '10%', targetY: '30%' },
        { label: '国家级证件持有者', x: '50%', y: '50%', targetX: '80%', targetY: '40%' },
        { label: '华裔华人', x: '50%', y: '50%', targetX: '15%', targetY: '70%' },
        { label: '蜜雪冰城品鉴师', x: '50%', y: '50%', targetX: '75%', targetY: '60%' },
        { label: '诺贝尔奖观赛者', x: '50%', y: '50%', targetX: '45%', targetY: '0%' }
      ]
    }
  },
  mounted() {
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

    if (this.hoverDebounceTimer) {
      clearTimeout(this.hoverDebounceTimer)
    }

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
      if (directionalIndex !== baseIndex && directionalVisibleHeight >= viewportHeight / 3) {
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
    showTagBoxes() {
      if (this.hoverDebounceTimer) {
        clearTimeout(this.hoverDebounceTimer)
      }

      this.hoverDebounceTimer = setTimeout(() => {
        this.showTags = true
        this.isProfileHovered = true
      }, 100)
    },
    hideTagBoxes() {
      if (this.hoverDebounceTimer) {
        clearTimeout(this.hoverDebounceTimer)
      }

      this.hoverDebounceTimer = setTimeout(() => {
        this.showTags = false
        this.isProfileHovered = false
      }, 200)
    },
    showQRCode(type) {
      this.showQR = true

      if (type === 'qq') {
        this.qrCodeSrc = 'https://cdn.imgos.cn/vip/2026/04/14/69ddb17876def.png'
        this.qrCodeTitle = 'QQ 二维码'
      }
    },
    hideQRCode() {
      this.showQR = false
    },
    moveQRCode(event) {
      this.qrPosition.x = event.clientX + 10
      this.qrPosition.y = event.clientY + 10
    }
  }
}
</script>

<style scoped>
.personal-homepage {
  --section-fade-duration: 1.42s;
  --section-fade-distance: 86px;
  --section-fade-blur: 10px;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2f3a4b;
  background: linear-gradient(180deg, #e8f0ff 0%, #fdfdff 60%, #ffffff 100%);
}

.section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 160px 0 88px;
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
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

.observe-section .profile-card.fade-item {
  transition:
    opacity var(--section-fade-duration) cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0s),
    translate var(--section-fade-duration) cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0s),
    filter var(--section-fade-duration) cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0s),
    transform 0.32s ease,
    box-shadow 0.3s ease;
}

.observe-section .contact-card.fade-item {
  transition:
    opacity var(--section-fade-duration) cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0s),
    translate var(--section-fade-duration) cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0s),
    filter var(--section-fade-duration) cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0s),
    transform 0.32s ease,
    box-shadow 0.3s ease;
}

.observe-section .link-item.fade-item {
  transition:
    opacity var(--section-fade-duration) cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0s),
    translate var(--section-fade-duration) cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0s),
    filter var(--section-fade-duration) cubic-bezier(0.16, 1, 0.3, 1) var(--delay, 0s),
    transform 0.32s ease,
    box-shadow 0.3s ease;
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

.profile-layout {
  position: relative;
  min-height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-card {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  border: 1px solid #e1e8ed;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.32s ease,
    box-shadow 0.3s ease;
}

.profile-card.hovered {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.tag-box {
  position: absolute;
  z-index: 1;
  padding: 8px 16px;
  border: 1px solid #e1e8ed;
  border-radius: 20px;
  background: #ffffff;
  color: #2c3e50;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transform: scale(0.4) translate(-50%, -50%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    left 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    top 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.25s ease,
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.tag-box.show {
  z-index: 15;
  opacity: 1;
  transform: scale(1) translate(-50%, -50%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.profile-avatar {
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  border: 4px solid #f0f4f8;
  border-radius: 50%;
  overflow: hidden;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: right top;
}

.profile-name {
  margin: 0 0 10px;
  color: #2c3e50;
  font-size: 28px;
  font-weight: 700;
}

.profile-desc {
  margin: 0;
  color: #7f8c8d;
  font-size: 16px;
}

.section-title {
  margin: 0 0 30px;
  padding-bottom: 10px;
  border-bottom: 2px solid #d9e5f3;
  color: #2c3e50;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
}

.contact-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.contact-card {
  position: relative;
  z-index: 1;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 24px;
  background: #ffffff;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.32s ease,
    box-shadow 0.3s ease;
}

.contact-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.contact-icon {
  margin-bottom: 16px;
  color: #2c3e50;
  font-size: 22px;
  font-weight: 700;
}

.contact-card h3 {
  margin: 0 0 8px;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
}

.contact-card p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.contact-card a {
  color: #3498db;
  text-decoration: none;
  transition: color 0.3s ease;
}

.contact-card a:hover {
  color: #2980b9;
  text-decoration: underline;
}

.qr-code-container {
  position: fixed;
  z-index: 1000;
  pointer-events: none;
}

.qr-code {
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 10px;
  background: #ffffff;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.qr-code img {
  display: block;
  width: 150px;
  height: 150px;
  margin-bottom: 8px;
}

.qr-code p {
  margin: 0;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 500;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.link-item {
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 20px;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition:
    transform 0.32s ease,
    box-shadow 0.3s ease;
}

.link-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.link-item a {
  display: block;
  color: inherit;
  text-decoration: none;
}

.link-item h3 {
  margin: 0 0 8px;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  transition: color 0.3s ease;
}

.link-item p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.link-item:hover h3 {
  color: #3498db;
}

@media (prefers-reduced-motion: reduce) {
  .observe-section .fade-item,
  .profile-card,
  .contact-card,
  .link-item,
  .tag-box {
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

  .profile-card {
    padding: 30px 20px;
  }

  .contact-cards,
  .links-grid {
    grid-template-columns: 1fr;
  }
}
</style>
