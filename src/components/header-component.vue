<template>
  <div>
    <header class="header" :class="{ 'header-hidden': headerHidden }">
      <div class="container">
        <router-link to="/" class="logo">Sunn</router-link>
        <nav class="nav">
          <router-link to="/">首页</router-link>
          <router-link to="/personal">关于</router-link>
          <router-link to="/text-homepage">博客</router-link>
          <router-link to="/contact">联系</router-link>
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
      lastScrollTop: 0,
      headerHidden: false
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    handleScroll() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollDelta = scrollTop - this.lastScrollTop;
      
      // 如果向下滚动超过25px，隐藏header
      if (scrollTop > 100 && scrollDelta > 0) {
        this.headerHidden = true;
      } 
      // 如果向上滚动或回到顶部，显示header
      else if (scrollDelta < 0 || scrollTop < 100) {
        this.headerHidden = false;
      }
      
      this.lastScrollTop = scrollTop;
    }
  }
}
</script>

<style scoped>
/* 容器 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 头部 */
.header {
  height: 120px;
  min-height: 120px;
  line-height: 120px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid #e1e8ed;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 100;
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
  padding: 0 20px; /* 仅左右内边距 */
  height: 100%;
}

.logo {
  font-size: 1.4rem;
  font-weight: 700;
  cursor: pointer;
  line-height: 72px;
  color: #2c3e50; /* 明确设置颜色 */
  text-shadow: 0 2px 4px rgba(44, 62, 80, 0.1); /* 明确设置阴影 */
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), text-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo:hover {
  transform: translateY(-5px);
  text-shadow: 0 8px 16px rgba(44, 62, 80, 0.3), 0 12px 24px rgba(44, 62, 80, 0.2);
}

.nav a {
  color: #7f8c8d;
  text-decoration: none;
  margin-left: 26px;
  line-height: 72px;
}

.container a{
  text-decoration: none;
}

.nav a:hover { color: #2c3e50; }

/* 响应式设计 */
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
  .nav a {
    margin: 0 12px;
    line-height: normal;
  }
}
</style>