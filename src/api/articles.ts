import { reactive } from 'vue'
import type { Article } from '@/types/article'

export interface ArticleSummary {
  id: number
  title: string
  author: string
  desc: string
  date: string
  category: string
}

interface ArticlesState {
  summaries: ArticleSummary[]
  loading: boolean
  error: string | null
  fetched: boolean
}

const state = reactive<ArticlesState>({
  summaries: [],
  loading: false,
  error: null,
  fetched: false
})

let fetchPromise: Promise<void> | null = null

/** 获取文章列表（模块级缓存，整个 SPA 生命周期只请求一次） */
export async function fetchArticleSummaries(): Promise<ArticlesState> {
  if (state.fetched) return state
  if (fetchPromise) {
    await fetchPromise
    return state
  }

  state.loading = true
  state.error = null

  fetchPromise = fetch('/api/articles')
    .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json() })
    .then(data => {
      state.summaries = data.articles
      state.fetched = true
    })
    .catch(e => { state.error = (e as Error).message })
    .finally(() => {
      state.loading = false
      fetchPromise = null
    })

  await fetchPromise
  return state
}

/** 获取单篇文章详情（含 HTML content） */
export async function fetchArticleById(id: number): Promise<Article | null> {
  const res = await fetch(`/api/articles?id=${id}`)
  if (!res.ok) return null
  const data = await res.json()
  return (data.article as Article) || null
}

/** 读取当前状态（不触发请求） */
export function getArticlesState(): Readonly<ArticlesState> {
  return state
}
