import type { IncomingMessage, ServerResponse } from 'http'
import { parse as parseUrl } from 'url'
import { loadComments, saveComment, type CommentData } from './_utils/comment-store'

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
  const { query, pathname } = parseUrl(req.url || '', true)
  const method = req.method || 'GET'

  // ---- GET /api/comments?articleId=1 ----
  if (method === 'GET') {
    const articleId = Number(query.articleId)
    if (!articleId || isNaN(articleId)) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: '缺少 articleId 参数' }))
      return
    }

    const comments = await loadComments(articleId)
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ comments }))
    return
  }

  // ---- POST /api/comments ----
  if (method === 'POST') {
    const raw = await readBody(req)
    let body: Partial<CommentData>
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

    const comment: CommentData = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      articleId,
      nickname,
      email: body.email || '',
      content,
      date: new Date().toISOString(),
    }

    await saveComment(comment)

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
