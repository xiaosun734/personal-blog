import type { IncomingMessage, ServerResponse } from 'http'
import { parse as parseUrl } from 'url'
import { getSupabase } from '../lib/supabase'

/** 读取请求体 JSON */
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk: Buffer) => { body += chunk.toString() })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const { query } = parseUrl(req.url || '', true)
  const method = req.method || 'GET'

  const supabase = getSupabase()

  // ---- GET /api/comments?articleId=1 ----
  if (method === 'GET') {
    const articleId = Number(query.articleId)
    if (!articleId || isNaN(articleId)) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: '缺少 articleId 参数' }))
      return
    }

    const { data: comments, error } = await supabase
      .from('comments')
      .select('id, article_id, nickname, email, content, date')
      .eq('article_id', articleId)
      .order('date', { ascending: false })

    if (error) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Failed to fetch comments' }))
      return
    }

    // 字段名映射：article_id → articleId
    const mapped = (comments || []).map((c: Record<string, unknown>) => ({
      id: c.id,
      articleId: c.article_id,
      nickname: c.nickname,
      email: c.email,
      content: c.content,
      date: c.date,
    }))

    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ comments: mapped }))
    return
  }

  // ---- POST /api/comments ----
  if (method === 'POST') {
    const raw = await readBody(req)
    let body: Record<string, unknown>
    try {
      body = JSON.parse(raw)
    } catch {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: '请求体格式错误' }))
      return
    }

    const { articleId, nickname, content } = body

    if (!articleId || !nickname || !content) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'articleId、nickname、content 为必填项' }))
      return
    }

    const newComment = {
      article_id: Number(articleId),
      nickname: String(nickname),
      email: String(body.email || ''),
      content: String(content),
    }

    const { data: inserted, error } = await supabase
      .from('comments')
      .insert(newComment)
      .select('id, article_id, nickname, email, content, date')
      .single()

    if (error || !inserted) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Failed to save comment' }))
      return
    }

    // 字段名映射：article_id → articleId
    const comment = {
      id: inserted.id,
      articleId: inserted.article_id,
      nickname: inserted.nickname,
      email: inserted.email,
      content: inserted.content,
      date: inserted.date,
    }

    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ comment }))
    return
  }

  // 其他方法
  res.statusCode = 405
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Allow', 'GET, POST')
  res.end(JSON.stringify({ error: '不支持的请求方法' }))
}
