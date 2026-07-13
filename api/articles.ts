import type { IncomingMessage, ServerResponse } from 'http'
import { parse as parseUrl } from 'url'
import articlesList from './_data/articles-list'
import articlesDetail from './_data/articles-detail'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const { query } = parseUrl(req.url || '', true)
  const id = query.id ? Number(query.id) : null
  const category = query.category as string | undefined

  // 单篇文章详情
  if (id) {
    const article = articlesDetail[id]
    if (!article) {
      res.statusCode = 404
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Article not found' }))
      return
    }
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Cache-Control', 'public, s-maxage=60')
    res.end(JSON.stringify({ article }))
    return
  }

  // 按分类筛选
  let filtered = articlesList
  if (category) {
    filtered = articlesList.filter(a => a.category === category)
  }

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'public, s-maxage=60')
  res.end(JSON.stringify({ articles: filtered }))
}
