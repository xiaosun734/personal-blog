<template>
  <div class="text-read">
    <HeaderComponent />
    
    <main class="content">
      <article class="article">
        <header class="article-header">
          <h1 class="article-title">Vue 3 实战：组合式 API 进阶</h1>
          <div class="article-meta">
            <span class="author">作者：Sunn</span>
            <span class="date">发布日期：2026-03-20</span>
            <span class="category">分类：前端</span>
          </div>
        </header>
        
        <div class="article-content">
          <p>在 Vue 3 中，组合式 API 为我们提供了一种新的代码组织方式，使我们能够更好地逻辑复用和代码组织。本文将深入探讨组合式 API 的高级用法，从响应式系统到生命周期管理，帮助你掌握 Vue 3 的核心特性。</p>
          
          <h2>响应式系统的原理</h2>
          <p>Vue 3 的响应式系统基于 Proxy 对象，相比 Vue 2 的 Object.defineProperty，它提供了更全面的响应式能力。通过 reactive 和 ref 等 API，我们可以创建响应式数据，并在数据变化时自动触发视图更新。</p>
          
          <pre><code>import { reactive, ref } from 'vue'

// 使用 reactive 创建响应式对象
const state = reactive({
  count: 0,
  message: 'Hello Vue 3'
})

// 使用 ref 创建响应式变量
const count = ref(0)</code></pre>
          
          <h2>组合式 API 的优势</h2>
          <p>组合式 API 的主要优势在于：</p>
          <ul>
            <li>更好的逻辑复用：通过组合函数，我们可以将相关的逻辑提取到独立的函数中</li>
            <li>更清晰的代码组织：按照功能组织代码，而不是按照选项类型</li>
            <li>更好的 TypeScript 支持：类型推断更加准确</li>
            <li>更小的打包体积：Tree-shaking 更加有效</li>
          </ul>
          
          <h2>生命周期钩子</h2>
          <p>在组合式 API 中，生命周期钩子以函数的形式提供，我们可以在 setup 函数中使用它们：</p>
          
          <pre><code>import { onMounted, onUpdated, onUnmounted } from 'vue'

export default {
  setup() {
    onMounted(() => {
      console.log('组件挂载')
    })
    
    onUpdated(() => {
      console.log('组件更新')
    })
    
    onUnmounted(() => {
      console.log('组件卸载')
    })
    
    return {}
  }
}</code></pre>
          
          <h2>组件拆分策略</h2>
          <p>使用组合式 API，我们可以更灵活地拆分组件逻辑：</p>
          <ol>
            <li>按功能拆分：将相关的逻辑提取到独立的组合函数中</li>
            <li>按生命周期拆分：将不同生命周期的逻辑分开处理</li>
            <li>按状态管理拆分：将状态管理相关的逻辑提取到专门的函数中</li>
          </ol>
          
          <p>通过合理的组件拆分，我们可以构建更加可维护和可测试的应用。</p>
          
          <h2>总结</h2>
          <p>组合式 API 是 Vue 3 的重要特性，它为我们提供了一种新的代码组织方式，使我们能够更好地构建复杂的应用。通过掌握组合式 API 的高级用法，我们可以编写更加清晰、可维护的代码。</p>
          <p>希望本文对你有所帮助，如果你有任何问题或建议，欢迎在评论区留言。</p>
        </div>
        
        <footer class="article-footer">
          <div class="tags">
            <span class="tag">Vue 3</span>
            <span class="tag">组合式 API</span>
            <span class="tag">前端开发</span>
          </div>
          <div class="share">
            <span>分享到：</span>
            <a href="#" class="share-link">微信</a>
            <a href="#" class="share-link">微博</a>
            <a href="#" class="share-link">Twitter</a>
          </div>
        </footer>
      </article>
    </main>
  </div>
</template>

<script>
import HeaderComponent from './header-component.vue'

export default {
  name: 'TextTemplate',
  components: {
    HeaderComponent
  }
}
</script>

<style scoped>
.text-read {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f0ff 0%, #fdfdff 60%, #ffffff 100%);
  color: #2f3a4b;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.content {
  width: min(800px, 90vw);
  margin: 0 auto;
  padding: calc(72px + 40px) 0 60px;
}

.article {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 40px;
  margin-bottom: 40px;
}

.article-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5ecf8;
}

.article-title {
  font-size: 2.2rem;
  color: #1f2a38;
  margin: 0 0 15px;
  line-height: 1.3;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-size: 0.9rem;
  color: #7a8da5;
}

.article-content {
  line-height: 1.8;
  margin-bottom: 30px;
}

.article-content p {
  margin-bottom: 20px;
  color: #34495e;
}

.article-content h2 {
  font-size: 1.6rem;
  color: #213045;
  margin: 40px 0 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #d9e5f3;
}

.article-content ul,
.article-content ol {
  margin-bottom: 20px;
  padding-left: 25px;
}

.article-content li {
  margin-bottom: 8px;
  color: #34495e;
}

.article-content pre {
  background: #f8faff;
  border: 1px solid #e5ecf8;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  overflow-x: auto;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9rem;
  line-height: 1.4;
}

.article-content code {
  background: #f8faff;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9rem;
}

.article-footer {
  padding-top: 20px;
  border-top: 1px solid #e5ecf8;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag {
  background: #f8faff;
  border: 1px solid #e5ecf8;
  border-radius: 15px;
  padding: 5px 12px;
  font-size: 0.85rem;
  color: #4a90e2;
}

.share {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: #7a8da5;
}

.share-link {
  color: #4a90e2;
  text-decoration: none;
  transition: color 0.3s ease;
}

.share-link:hover {
  color: #2980b9;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .content {
    padding: calc(72px + 20px) 0 40px;
  }
  
  .article {
    padding: 25px;
  }
  
  .article-title {
    font-size: 1.8rem;
  }
  
  .article-meta {
    flex-direction: column;
    gap: 5px;
  }
  
  .article-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>