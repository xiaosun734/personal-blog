import type { IncomingMessage, ServerResponse } from 'http'
import { parse as parseUrl } from 'url'
import { getSupabase, getSupabaseAdmin } from '../lib/supabase.js'

/** 读取请求体 JSON */
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk: Buffer) => { body += chunk.toString() })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

/** 从请求头中提取 Bearer token */
function extractToken(req: IncomingMessage): string | null {
  const auth = req.headers.authorization
  if (!auth) return null
  const parts = auth.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null
  return parts[1]
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const { query } = parseUrl(req.url || '', true)
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

      const supabase = getSupabase()
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
      // 1. 验证 JWT
      const token = extractToken(req)
      if (!token) {
        res.statusCode = 401
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: '请先登录后再评论' }))
        return
      }

      const adminClient = getSupabaseAdmin()
      const { data: authData, error: authError } = await adminClient.auth.getUser(token)

      if (authError || !authData?.user) {
        res.statusCode = 401
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: '登录已过期，请重新登录' }))
        return
      }

      const authUser = authData.user
      const userMeta = authUser.user_metadata || {}

      // 2. 解析请求体
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

      const { articleId, content } = body

      if (!articleId || !content) {
        res.statusCode = 400
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'articleId、content 为必填项' }))
        return
      }

      // 3. 使用 JWT 中验证过的用户信息（忽略请求体中的 nickname/email）
      const newComment = {
        article_id: Number(articleId),
        nickname: (userMeta.username as string) || authUser.email?.split('@')[0] || '用户',
        email: authUser.email || '',
        content: String(content),
      }

      const supabase = getSupabase()
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
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[comments] 未捕获异常:', msg)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: `服务端内部错误: ${msg}` }))
  }
}
