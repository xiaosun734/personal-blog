import type { IncomingMessage, ServerResponse } from 'http'
import { parse as parseUrl } from 'url'
import { getSupabase } from '../lib/supabase.js'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const { query } = parseUrl(req.url || '', true)
  const id = query.id ? Number(query.id) : null
  const category = query.category as string | undefined

  const supabase = getSupabase()

  // 单篇文章详情
  if (id) {
    const { data: article, error } = await supabase
      .from('articles')
      .select('id, title, author, "desc", date, category, content')
      .eq('id', id)
      .single()

    if (error || !article) {
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
  let query_builder = supabase
    .from('articles')
    .select('id, title, author, "desc", date, category')
    .order('id', { ascending: true })

  if (category) {
    query_builder = query_builder.eq('category', category)
  }

  const { data: articles, error } = await query_builder

  if (error) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Failed to fetch articles' }))
    return
  }

  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'public, s-maxage=60')
  res.end(JSON.stringify({ articles }))
}
