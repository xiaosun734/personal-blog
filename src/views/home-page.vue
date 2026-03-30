<template>
  <div class="home-page">
    <!-- 头部 -->
    <HeaderComponent />

    <!-- 主要内容 -->
    <main class="main">
      <!-- 英雄区域 -->
      <section class="hero">
        <div class="container">
          <h2 class="hero-title">欢迎来到我的个人博客</h2>
          <p class="hero-subtitle">探索代码、设计与创新的交汇点</p>
          <button class="cta-button" @click="goTextHomepage">开始阅读</button>
        </div>
      </section>

      <!-- 最新文章 -->
      <section class="latest-posts">
        <div class="container">
          <h3 class="section-title">最新文章</h3>
          <div class="posts-grid">
            <article class="post-card" v-for="(item,index) in posts" :key="index" @click="goToArticle(item.id)" style="cursor: pointer;">
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
      </section>

      <!-- 关于我 -->
      <section class="about">
        <div class="container">
          <h3 class="section-title">关于我</h3>
          <div class="about-content">
            <div class="about-text">
              <p>我是一名热爱技术的开发者，通过这个博客，我希望分享我的学习心得和技术见解。</p>
              <p>在这里，你会找到关于编程、设计、科技趋势的文章。让我们一起探索这个充满无限可能的数字世界。</p>
            </div>
            <div class="about-image">
              <img src="https://picui.ogmua.cn/s1/2026/03/30/69c9e32d3425c.webp" alt="关于我" class="about-image-img">
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- 底部 -->
    <footer class="footer">
      <div class="container">
        <p>&copy; 2024 我的个人博客. 保留所有权利.</p>
      </div>
    </footer>
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
      cardStates: {} // 为每个卡片维护独立的状态
    }
  },
  mounted() {
    // 对文章按id排序，取最后三篇（id最靠后的）
    this.posts = articles
      .sort((a, b) => a.id - b.id) // 按id升序排序
      .slice(-3) // 取最后三篇
      .reverse(); // 反转顺序，使最新的文章在前面
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
        this.cardStates[cardId] = {
          animationId: null,
          currentRadius: 0,
          targetRadius: 0,
          mouseX: 0,
          mouseY: 0,
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
      
      // 无论是否在动画中，都更新渐变位置
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
          state.currentRadius += 5;
          if (state.currentRadius > state.targetRadius) {
            state.currentRadius = state.targetRadius;
          }
        } else if (state.currentRadius > state.targetRadius) {
          state.currentRadius -= 5;
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
        element.style.background = `radial-gradient(circle ${state.currentRadius}px at ${state.mouseX}px ${state.mouseY}px, #3498db, transparent), linear-gradient(45deg, #ecf0f1, #bdc3c7)`;
      } else {
        element.style.background = 'linear-gradient(45deg, #ecf0f1, #bdc3c7)';
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

/* 公共容器 */
.container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 18px;
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
}

.post-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  border-color: rgba(52, 152, 219, 0.2);
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
  background: linear-gradient(135deg, rgba(236, 240, 241, 0.5) 0%, rgba(255, 255, 255, 0.8) 100%);
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
  background: linear-gradient(135deg, #3498db, #9b59b6);
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 8px 30px rgba(52, 152, 219, 0.3);
  position: relative;
}

.about-image::before {
  content: '';
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  background: linear-gradient(135deg, #9b59b6, #3498db);
  border-radius: 50%;
  z-index: -1;
  opacity: 0.3;
}

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