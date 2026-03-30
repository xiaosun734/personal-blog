<template>
  <div class="text-homepage">
    <HeaderComponent />

    <main class="content">
      <div class="content-wrapper">
        <div class="main-content">
          <section class="hero">
            <h1 class="hero-title">欢迎来到我的博客</h1>
            <p>这里记录了我的前端、后端、生活思考与成长路线，持续更新。</p>
          </section>

          <section class="articles">
            <h2>全部文章</h2>
            <ul class="article-list">
              <li class="article-item" v-for="item in articles" :key="item.id">
                <router-link :to="{ name: 'TextRead', params: { id: item.id } }">
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.desc }}</p>
                  <span class="meta">{{ item.date }} · {{ item.category }}</span>
                </router-link>
              </li>
            </ul>
          </section>
        </div>
        
        <aside class="sidebar">
          <ClassificationComponent />
        </aside>
      </div>
    </main>
  </div>
</template>

<script>
import HeaderComponent from '../components/header-component.vue'
import ClassificationComponent from '../components/classification-component.vue'
import articles from '../data/articles'

export default {
  name: 'TextHomepage',
  components: {
    HeaderComponent,
    ClassificationComponent
  },
  data() {
    return {
      articles: [],
    }
  },
  mounted() {
    this.articles = articles
      .sort((a, b) => a.id - b.id) // 按id升序排序
      .slice(-4) // 取最后四篇
      .reverse(); // 反转顺序，使最新的文章在前面
  }
}
</script>

<style scoped>
.text-homepage {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f0ff 0%, #fdfdff 60%, #ffffff 100%);
  color: #2f3a4b;
}

.content {
  width: min(1100px, 92vw);
  margin: 0 auto;
  padding: calc(120px + 30px) 0 40px; /* 留出 header 空间 */
}

.content-wrapper {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.main-content {
  flex: 1;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
}

.hero {
  padding: 36px 28px;
  margin-bottom: 26px;
  background: #ffffff;
  border-left: 4px solid #4a90e2;
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(32, 52, 80, 0.08);
}

.hero .hero-title{
  margin: 0 0 10px;
  font-size: 2.2rem;
  color: #1f2a38;
}

.hero p {
  margin: 0;
  color: #546775;
  font-size: 1.05rem;
  line-height: 1.6;
}

.articles h2 {
  margin: 0 0 14px;
  font-size: 1.8rem;
  color: #213045;
  border-bottom: 2px solid #d9e5f3;
  padding-bottom: 10px;
}

.article-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}

.article-item {
  background: #ffffff;
  border: 1px solid #e5ecf8;
  border-radius: 12px;
  transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease;
  position: relative;
  overflow: visible;
}

.article-item::before,
.article-item::after,
.article-item a::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 12px;
  transition: transform .3s ease;
  z-index: -1;
}

.article-item::before {
  background: #ffffff;
  border: 1px solid #e5ecf8;
  transform: translate(0, 0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.article-item::after {
  background: #ffffff;
  border: 1px solid #e5ecf8;
  transform: translate(0, 0);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.article-item a {
  display: block;
  padding: 18px;
  text-decoration: none;
  color: inherit;
  position: relative;
  z-index: 3;
  opacity: 1;
  transition: transform .3s ease;
}

.article-item:hover {
  transform: translate(0, 0);
  box-shadow: 0 10px 22px rgba(31, 49, 76, 0.12);
  border-color: #e5ecf8;
}

.article-item:hover::before {
  transform: translate(4px, 4px);
}

.article-item:hover::after {
  transform: translate(8px, 8px);
}

.article-item:hover a {
  transform: translate(4px, 4px);
}

.article-item h3 {
  margin: 0 0 8px;
  font-size: 1.15rem;
  color: #172238;
}

.article-item p {
  margin: 0 0 10px;
  color: #64748b;
  font-size: .96rem;
}

.meta {
  display: inline-block;
  font-size: .82rem;
  color: #7a8da5;
}

.categories {
  margin-top: 40px;
  padding: 0;
  background: transparent;
  border-radius: 0;
  box-shadow: none;
}

.categories h2 {
  margin: 0 0 20px;
  font-size: 1.8rem;
  color: #213045;
  border-bottom: 2px solid #d9e5f3;
  padding-bottom: 10px;
}

.category-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.category-item {
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.category-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  /* border-color: #4a90e2; */
}

.category-item h3 {
  margin: 0 0 8px;
  font-size: 1.1rem;
  color: #172238;
}

.category-item p {
  margin: 0 0 12px;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.4;
}

.category-count {
  font-size: 0.8rem;
  color: #7a8da5;
  font-weight: 500;
}

@media (max-width: 992px) {
  .content-wrapper {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
  
  .classification-container {
    position: relative;
    top: 0;
    width: 100%;
  }
  
  .classification-list {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  .classification-item {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 26px 18px;
  }

  .hero .hero-title{
    font-size: 1.75rem;
  }

  .content {
    padding: calc(120px + 16px) 0 24px;
  }
}
</style>