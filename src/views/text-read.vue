<template>
  <div class="text-read-container">
    <TextTemplate :article="article" />
  </div>
</template>

<script>
import TextTemplate from '../components/text-template.vue'

export default {
  name: 'TextRead',
  components: {
    TextTemplate
  },
  data() {
    return {
      articles: [
        {
          id: 1,
          title: 'Vue 3 实战：组合式 API 进阶',
          desc: '从响应式、生命周期和组件拆分说起',
          date: '2026-03-20',
          category: '前端',
          link: '#'
        },
        {
          id: 2,
          title: 'Node.js 性能优化方案',
          desc: '高并发下的事件循环与资源控制',
          date: '2026-03-18',
          category: '后端',
          link: '#'
        },
        {
          id: 3,
          title: '写给新人程序员的 10 条习惯',
          desc: '代码、沟通、测试与持续学习',
          date: '2026-03-15',
          category: '成长',
          link: '#'
        }
      ],
      article: {}
    }
  },
  mounted() {
    // 根据路由参数获取文章数据
    const articleId = this.$route.params.id;
    this.article = this.articles.find(item => item.id == articleId) || this.articles[0];
  }
}
</script>

<style scoped>
.text-read-container {
  width: 100%;
}
</style>