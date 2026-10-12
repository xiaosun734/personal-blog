<template>
  <main class="content">
    <article class="article">
      <header class="article-header">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <span class="author">作者：{{ article.author }}</span>
          <span class="date">发布日期：{{ formatDate(article.date) }}</span>
          <span class="category">分类：{{ article.category }}</span>
        </div>
      </header>

      <div ref="contentEl" class="article-content" v-html="article.content"></div>

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
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import type { Article } from '@/types/article'
import { formatDate } from '@/utils/format'

const props = defineProps<{
  article: Article
}>()

const contentEl = ref<HTMLElement | null>(null)

// 正文是 v-html 注入的，marked 只在 <code> 上标了 language-xxx 类，
// CSS 选择器拿不到这个类名，这里把语言名提升到 <pre data-lang> 供角标使用
function markCodeLanguage() {
  const root = contentEl.value
  if (!root) return
  root.querySelectorAll<HTMLElement>('pre > code').forEach((code) => {
    const pre = code.parentElement
    const lang = /language-([\w-]+)/.exec(code.className)?.[1]
    if (pre && lang) pre.dataset.lang = lang
  })
}

onMounted(markCodeLanguage)

// 路由切换文章时 v-html 会重新渲染，需要重新标记
watch(() => props.article, async () => {
  await nextTick()
  markCodeLanguage()
})
</script>

<style scoped>
.content {
  width: min(800px, 90vw);
  margin: 0 auto;
  padding: calc(72px + 60px) 0 60px;
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

/* 正文由 v-html 注入，标签上不会带 scoped 属性，内部选择器必须用 :deep() 才能命中 */
.article-content {
  line-height: 1.85;
  margin-bottom: 30px;
  color: #34495e;
  overflow-wrap: break-word;
  word-break: break-word;
  text-align: left; /* 覆盖 #app 的全局居中 */
}

/* ---------- 标题 ---------- */
.article-content :deep(h1) {
  font-size: 1.9rem;
  color: #1f2a38;
  margin: 4px 0 30px;
  line-height: 1.35;
}

.article-content :deep(h1)::after {
  content: '';
  display: block;
  width: 56px;
  height: 4px;
  margin-top: 14px;
  border-radius: 2px;
  background: linear-gradient(90deg, #5b8def, #8fb6ff);
}

.article-content :deep(h2) {
  font-size: 1.45rem;
  color: #213045;
  margin: 44px 0 20px;
  padding-left: 14px;
  border-left: 4px solid #5b8def;
  line-height: 1.4;
}

.article-content :deep(h3) {
  font-size: 1.2rem;
  color: #213045;
  margin: 34px 0 16px;
  line-height: 1.45;
}

.article-content :deep(h4) {
  font-size: 1.08rem;
  color: #2f6fd0;
  margin: 28px 0 14px;
  line-height: 1.5;
}

.article-content :deep(h5) {
  font-size: 1rem;
  color: #3b6fd4;
  margin: 26px 0 12px;
  padding: 3px 0 3px 12px;
  border-left: 3px solid #cbd9f0;
  line-height: 1.5;
}

.article-content :deep(h6) {
  font-size: 0.95rem;
  color: #5f7184;
  margin: 22px 0 10px;
}

/* ---------- 段落与强调 ---------- */
.article-content :deep(p) {
  margin: 0 0 18px;
  color: #34495e;
}

.article-content :deep(strong) {
  color: #1f2a38;
  font-weight: 600;
}

.article-content :deep(em) {
  font-style: normal;
  color: #3b6fd4;
}

/* ---------- 分割线 ---------- */
.article-content :deep(hr) {
  border: none;
  height: 1px;
  margin: 38px 0;
  background: linear-gradient(90deg, transparent, #d9e5f3 18%, #d9e5f3 82%, transparent);
}

/* ---------- 列表 ---------- */
.article-content :deep(ul),
.article-content :deep(ol) {
  margin: 0 0 18px;
  padding-left: 26px;
}

.article-content :deep(li) {
  margin-bottom: 8px;
  color: #34495e;
}

.article-content :deep(li::marker) {
  color: #5b8def;
  font-weight: 600;
}

.article-content :deep(li > ul),
.article-content :deep(li > ol) {
  margin: 8px 0 0;
}

/* ---------- 链接 ---------- */
.article-content :deep(a) {
  color: #4a90e2;
  text-decoration: none;
  border-bottom: 1px solid rgba(74, 144, 226, 0.35);
  transition: color 0.2s ease, border-color 0.2s ease;
}

.article-content :deep(a:hover) {
  color: #2f6fd0;
  border-bottom-color: #2f6fd0;
}

/* ---------- 图片 ---------- */
.article-content :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 26px auto;
  border-radius: 10px;
  box-shadow: 0 4px 18px rgba(31, 42, 56, 0.12);
}

/* 老文章里手写的 style="float:left" 会让图片脱离文档流、挤乱后续内容，
   且 !important 压不过内联样式，只能靠这条 !important 规则兜底覆盖 */
.article-content :deep(img[style*="float"]) {
  float: none !important;
  width: auto !important;
  max-width: 100%;
  height: auto;
}

/* ---------- 引用块 ---------- */
.article-content :deep(blockquote) {
  margin: 0 0 18px;
  padding: 12px 18px;
  border-left: 4px solid #b9cdf0;
  border-radius: 0 10px 10px 0;
  background: #f4f8ff;
  color: #4a5f7a;
}

.article-content :deep(blockquote p:last-child) {
  margin-bottom: 0;
}

/* ---------- 表格 ---------- */
.article-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 22px;
  font-size: 0.92rem;
}

.article-content :deep(th),
.article-content :deep(td) {
  border: 1px solid #e5ecf8;
  padding: 10px 14px;
  text-align: left;
}

.article-content :deep(th) {
  background: #f8faff;
  color: #213045;
  font-weight: 600;
}

.article-content :deep(tbody tr:nth-child(even) td) {
  background: #fbfdff;
}

/* ---------- 行内代码 ---------- */
.article-content :deep(code) {
  background: #eef4ff;
  border: 1px solid #dbe6f8;
  padding: 2px 6px;
  border-radius: 5px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.88em;
  color: #2f6fd0;
}

/* ---------- 代码块（深色） ---------- */
.article-content :deep(pre) {
  position: relative;
  margin: 0 0 22px;
  padding: 0;
  border-radius: 10px;
  background: #1b2230;
  box-shadow: 0 6px 20px rgba(18, 26, 42, 0.22);
}

/* 横向滚动交给内部 code，这样右上角的语言角标不会被滚走 */
.article-content :deep(pre code) {
  display: block;
  overflow-x: auto;
  padding: 20px;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: #dbe4f0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.88rem;
  line-height: 1.6;
  white-space: pre;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
}

.article-content :deep(pre code::-webkit-scrollbar) {
  height: 8px;
}

.article-content :deep(pre code::-webkit-scrollbar-track) {
  background: transparent;
}

.article-content :deep(pre code::-webkit-scrollbar-thumb) {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 4px;
}

/* 语言角标：语言名由 markCodeLanguage() 写到 data-lang 上 */
.article-content :deep(pre[data-lang])::before {
  content: attr(data-lang);
  position: absolute;
  top: 10px;
  right: 12px;
  padding: 2px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #7f93b5;
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  pointer-events: none;
}

.article-content :deep(.photo-gallery) {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 440px));
  justify-content: center;
  gap: 24px;
  margin: 36px 0;
}

.article-content :deep(.photo-item) {
  background: #fafbfc;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.article-content :deep(.photo-item:hover) {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.article-content :deep(.photo-item img) {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 6px;
  margin-bottom: 12px;
}

.article-content :deep(.photo-caption) {
  text-align: center;
  font-size: 0.9rem;
  color: #7a8da5;
  margin: 0;
  line-height: 1.5;
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
    padding: 20px 0 40px;
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

  /* 手机端正文排版 */
  .article-content {
    line-height: 1.75;
  }

  .article-content :deep(h1) {
    font-size: 1.55rem;
  }

  .article-content :deep(h2) {
    font-size: 1.25rem;
    margin: 34px 0 16px;
    padding-left: 11px;
    border-left-width: 3px;
  }

  .article-content :deep(h4) {
    font-size: 1.02rem;
  }

  .article-content :deep(pre code) {
    padding: 14px;
    font-size: 0.8rem;
  }

  .article-content :deep(pre[data-lang])::before {
    top: 8px;
    right: 8px;
    font-size: 0.65rem;
  }

  .article-content :deep(img) {
    margin: 20px auto;
    border-radius: 8px;
  }
}
</style>
