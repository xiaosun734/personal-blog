<template>
  <div class="home-page">
    <!-- 头部 -->
    <HeaderComponent />
    <!-- fullpage 容器 -->
    <div id="fullpage">
      <!-- 英雄区域 -->
      <div class="section hero">
        <div class="container">
          <h2 class="hero-title">欢迎来到我的个人博客</h2>
          <p class="hero-subtitle">探索代码、设计与创新的交汇点</p>
          <button class="cta-button" @click="goTextHomepage">开始阅读</button>
        </div>
      </div>
      <!-- 最新文章 -->
      <div class="section latest-posts">
        <div class="container">
          <h3 class="section-title">最新文章</h3>
          <div class="posts-grid">
            <article 
              class="post-card" 
              v-for="(item,index) in posts" 
              :key="index" 
              @click="goToArticle(item.id)" 
              :class="{ 'animate-in': isLatestPostsVisible }"
              :style="{ 'transition-delay': `${index * 0.2}s` }"
              ref="postCards"
              style="cursor: pointer;"
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
              <a href="#" class="read-more">阅读更多</a>
            </article>
          </div>
        </div>
      </div>
      <!-- 关于我 -->
      <div class="section about">
        <div class="container">
          <h3 class="section-title">关于我</h3>
          <div class="about-content">
            <div class="about-text">
              <p>我是一名热爱技术的开发者，通过这个博客，我希望分享我的学习心得和技术见解。</p>
              <p>在这里，你会找到关于编程、设计、科技趋势的文章。让我们一起探索这个充满无限可能的数字世界。</p>
            </div>
            <div class="about-image">
              <img src="https://cdn.imgos.cn/vip/2026/04/13/69dc4e3878df1.jpg" alt="关于我" class="about-image-img">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import HeaderComponent from '../components/header-component.vue'
import articles from '../data/articles'
import fullpage from '../plugins/fullpage'
import 'fullpage.js/dist/fullpage.min.css'

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
      fullpageInstance: null,
      isLatestPostsVisible: false,
      observer: null
    }
  },
  mounted() {
    this.posts = articles
      .sort((a, b) => a.id - b.id)
      .slice(-3)
      .reverse();
    
    // 初始化滚动观察器
    this.$nextTick(() => {
      this.initScrollObserver();
      
      // 初始化 fullpage.js
      if (!this.fullpageInstance) {
        this.fullpageInstance = new fullpage('#fullpage', {
          autoScrolling: true,
          navigation: true, 
          anchors: ['hero', 'latest', 'about'],
          showActiveTooltip: false, 
          scrollingSpeed: 800, // 增加滚动速度，减少卡顿
          css3: true, // 启用css3 transform动画，提升性能
          scrollBar: true, // 打开scrollBar，确保可以继续滚动
          fitToSection: true, // 自动吸附到section，减少跳动
          easingcss3: 'cubic-bezier(0.645, 0.045, 0.355, 1)', // 使用更流畅的缓动曲线
          hashChange: false, 
          recordHistory: false,
          lockAnchors: true,
          menu: false,
          normalScrollElements: '.post-card, .about-text', // 允许特定元素正常滚动
          touchSensitivity: 15, // 降低触摸灵敏度
          continuousVertical: false, // 禁用连续滚动
          animateAnchor: false, // 禁用锚点动画
          onLeave: (origin, destination) => {
            // 当滚动到最新文章区域时触发动画
            if (destination.index === 1) { // latest section
              // 重新设置初始状态，确保每次进入都能触发动画
              this.isLatestPostsVisible = false;
              setTimeout(() => {
                this.isLatestPostsVisible = true;
              }, 300);
            } else {
              this.isLatestPostsVisible = false;
            }
          },
          afterLoad: (anchorLink, index) => {
            // 当加载完成后确保可以继续滚动
            if (index === 2) { // about section
              console.log('已到达关于我区域');
            }
          }
        });
        
        // 动态移除水印
        this.removeWatermark();
      }
    });
  },
  beforeDestroy() {
    if (this.fullpageInstance && this.fullpageInstance.destroy) {
      this.fullpageInstance.destroy('all');
      this.fullpageInstance = null;
    }
  },
  methods: {
    goTextHomepage() {
      this.$router.push('/text-homepage')
    },
    goToArticle(id) {
      this.$router.push(`/article/${id}`)
    },
    getCardState(element) {
      const cardId = element.dataset.cardId;
      if (!this.cardStates[cardId]) {
        const colorScheme = this.colorSchemes[parseInt(cardId) % this.colorSchemes.length];
        this.cardStates[cardId] = {
          animationId: null,
          currentRadius: 0,
          targetRadius: 0,
          mouseX: 0,
          mouseY: 0,
          color: '#3498db',
          colorScheme: colorScheme,
          isAnimating: false
        };
      }
      return this.cardStates[cardId];
    },
    handleMouseMove(event) {
      const element = event.currentTarget;
      const rect = element.getBoundingClientRect();
      const state = this.getCardState(element);
      state.mouseX = event.clientX - rect.left;
      state.mouseY = event.clientY - rect.top;
      const relX = state.mouseX / rect.width;
      const relY = state.mouseY / rect.height;
      const scheme = state.colorScheme;
      const r = Math.floor(scheme.start.r + (scheme.end.r - scheme.start.r) * (relX + relY) / 2);
      const g = Math.floor(scheme.start.g + (scheme.end.g - scheme.start.g) * (relX + relY) / 2);
      const b = Math.floor(scheme.start.b + (scheme.end.b - scheme.start.b) * (relX + relY) / 2);
      state.color = `rgb(${r}, ${g}, ${b})`;
      this.updateGradient(element, state);
    },
    handleMouseEnter(event) {
      const element = event.currentTarget;
      const rect = element.getBoundingClientRect();
      const state = this.getCardState(element);
      state.mouseX = event.clientX - rect.left;
      state.mouseY = event.clientY - rect.top;
      state.currentRadius = 0;
      state.targetRadius = 150;
      state.isAnimating = true;
      this.animateGradient(element, state);
    },
    handleMouseLeave(event) {
      const element = event.currentTarget;
      const state = this.getCardState(element);
      state.targetRadius = 0;
      this.animateGradient(element, state, true);
    },
    animateGradient(element, state, isLeaving = false) {
      if (state.animationId) {
        cancelAnimationFrame(state.animationId);
      }
      const animate = () => {
        if (state.currentRadius < state.targetRadius) {
          state.currentRadius += 10;
          if (state.currentRadius > state.targetRadius) {
            state.currentRadius = state.targetRadius;
          }
        } else if (state.currentRadius > state.targetRadius) {
          state.currentRadius -= 10;
          if (state.currentRadius < state.targetRadius) {
            state.currentRadius = state.targetRadius;
          }
        }
        this.updateGradient(element, state);
        if ((state.currentRadius < state.targetRadius || state.currentRadius > state.targetRadius)) {
          state.animationId = requestAnimationFrame(animate);
        } else {
          state.animationId = null;
          if (isLeaving) {
            state.isAnimating = false;
          }
        }
      };
      animate();
    },
    updateGradient(element, state) {
      if (state.currentRadius > 0) {
        element.style.background = `radial-gradient(circle ${state.currentRadius}px at ${state.mouseX}px ${state.mouseY}px, ${state.color}, transparent), linear-gradient(45deg, #ecf0f1, #bdc3c7)`;
      } else {
        element.style.background = 'linear-gradient(45deg, #ecf0f1, #bdc3c7)';
      }
    },
    removeWatermark() {
      // 多次尝试移除水印，确保生效
      const remove = () => {
        const selectors = [
          '.fp-watermark'
        ];
        
        selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            el.style.display = 'none';
            el.style.visibility = 'hidden';
            el.style.opacity = '0';
            el.remove(); // 直接移除元素
          });
        });
      };
      
      // 立即执行一次
      remove();
      
      // 延迟执行，确保fullpage.js完全加载
      setTimeout(remove, 500);
      // setTimeout(remove, 1000);
      // setTimeout(remove, 2000);
    },
    initScrollObserver() {
      // 使用Intersection Observer API监听元素可见性
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.isLatestPostsVisible = true;
            }
          });
        }, {
          threshold: 0.3, // 当30%的元素可见时触发
          rootMargin: '0px 0px -100px 0px' // 提前100px触发
        });
        
        // 观察最新文章区域
        const latestPostsSection = document.querySelector('.latest-posts');
        if (latestPostsSection) {
          this.observer.observe(latestPostsSection);
        }
      }
    }
  }
}
</script>

<style scoped>
/* 全局样式 */
.home-page {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #2c3e50;
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 50%, #f5f5f5 100%);
  min-height: 100vh;
}

#fullpage {
  height: 100vh;
}

.section {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transform: translateZ(0); /* 启用GPU加速 */
  backface-visibility: hidden; /* 优化渲染性能 */
  perspective: 1000px; /* 启用3D变换优化 */
}

/* 公共容器 */
.container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 18px;
}

:deep(.fp-is-overflow .fp-overflow),
:deep(.fp-is-overflow .fp-overflow.fp-auto-height),
:deep(.fp-is-overflow .fp-overflow.fp-auto-height-responsive) {
  overflow: visible !important;
  max-height: none !important;
}

/* 主要内容 */
.main {
  padding-top: 80px;
}

/* 英雄区域 */
.hero {
  text-align: center;
  padding: 100px 0;
  background: linear-gradient(45deg, rgba(44, 62, 80, 0.03), rgba(44, 62, 80, 0.01));
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(44,62,80,0.08)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.4;
  pointer-events: none;
}

.hero-title {
  font-size: 3rem;
  color: #2c3e50;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(44, 62, 80, 0.1);
  transition: transform 0.3s ease, text-shadow 0.3s ease;
  cursor: pointer;
  position: relative;
  z-index: 10;
  display: inline-block;
}

.hero-title:hover {
  transform: translateY(-5px);
  text-shadow: 0 8px 16px rgba(44, 62, 80, 0.3), 0 12px 24px rgba(44, 62, 80, 0.2);
}

.hero-subtitle {
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-bottom: 40px;
}

.cta-button {
  background: linear-gradient(45deg, #3498db, #2980b9);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.1rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(52, 152, 219, 0.4);
  background: linear-gradient(45deg, #2980b9, #21618c);
}

/* 最新文章 */

.latest-posts {
  padding: 80px 0;
  background: transparent;
}

.section-title {
  font-size: 2.5rem;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 50px;
  text-shadow: 0 0 8px rgba(44, 62, 80, 0.2);
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.post-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(189, 195, 199, 0.3);
  border-radius: 12px;
  padding: 25px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  opacity: 0;
  transform: translateY(50px);
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.post-card.animate-in {
  opacity: 1;
  transform: translateY(0);
}

.post-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  border-color: rgba(52, 152, 219, 0.2);
}

.post-card.animate-in:hover {
  transform: translateY(-8px);
}

.post-image {
  height: 150px;
  background: linear-gradient(45deg, #ecf0f1, #bdc3c7);
  border-radius: 8px;
  margin-bottom: 15px;
  position: relative;
  overflow: hidden;
}

.post-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(52, 152, 219, 0.1), rgba(155, 89, 182, 0.1));
}

.post-card h4 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 600;
}

.post-card p {
  color: #7f8c8d;
  margin-bottom: 15px;
  line-height: 1.6;
}

.read-more {
  color: #3498db;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.read-more:hover {
  color: #2980b9;
  text-decoration: underline;
}

/* 关于我 */
.about {
  padding: 80px 0;
  background: transparent;
}

.about-content {
  display: flex;
  align-items: center;
  gap: 50px;
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
  background: #ffffff;
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  z-index: 1;
  box-shadow: 0 6px 24px rgba(44,62,80,0.10), 0 1.5px 6px rgba(52,152,219,0.10);
  transition: box-shadow 0.3s cubic-bezier(.25,.8,.25,1);
}

.about-image-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: right top; /* 调整图片显示部位，60% 40%表示显示图片的顶部右侧 */
  border-radius: 50%;
}

/* .about-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  box-shadow: 0 8px 30px rgba(52, 152, 219, 0.2);
  z-index: -1; 
}
*/
/* 底部 */
.footer {
  background: rgba(44, 62, 80, 0.95);
  padding: 25px 0;
  text-align: center;
  border-top: 1px solid rgba(52, 73, 94, 0.3);
  color: #ecf0f1;
}

.footer p {
  color: #bdc3c7;
  margin: 0;
  font-size: 0.9rem;
}

/* 动画 */
@keyframes glow {
  from {
    text-shadow: 0 0 15px #2c3e50;
  }
  to {
    text-shadow: 0 0 25px #2c3e50, 0 0 35px #2c3e50;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
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