import type { IncomingMessage, ServerResponse } from 'http'
import { parse as parseUrl } from 'url'
import { marked } from 'marked'
import { loadAllArticles } from './_utils/markdown'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const { query } = parseUrl(req.url || '', true)
  const id = query.id ? Number(query.id) : null
  const category = query.category as string | undefined

  const articles = await loadAllArticles()

  // 单篇文章详情
  if (id) {
    const article = articles.find(a => a.id === id)
    if (!article) {
      res.statusCode = 404
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Article not found' }))
      return
    }
    const html = marked.parse(article.content) as string
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'public, s-maxage=60')
    res.end(JSON.stringify({
      article: { ...article, content: html, link: '#' }
    }))
    return
  }

  // 按分类筛选
  let filtered = articles
  if (category) {
    filtered = articles.filter(a => a.category === category)
  }

  // 列表（不含 content，节省带宽）
  const summaries = filtered.map(({ content, ...rest }) => rest)

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'public, s-maxage=60')
  res.end(JSON.stringify({ articles: summaries }))
}
