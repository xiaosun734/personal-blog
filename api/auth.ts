import type { IncomingMessage, ServerResponse } from 'http'
import { getSupabaseAdmin } from '../lib/supabase.js'

/** 读取请求体 JSON */
function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk: Buffer) => { body += chunk.toString() })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

/** 安全地返回 JSON 错误响应 */
function sendError(res: ServerResponse, statusCode: number, message: string) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ error: message }))
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // ---- 外层 try-catch，确保任何未捕获异常也返回 JSON ----
  try {
    // 只接受 POST
    if (req.method !== 'POST') {
      res.statusCode = 405
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Allow', 'POST')
      res.end(JSON.stringify({ error: '仅支持 POST 请求' }))
      return
    }

    const raw = await readBody(req)
    let body: { action?: string; email?: string; password?: string; username?: string }
    try {
      body = JSON.parse(raw)
    } catch {
      sendError(res, 400, '请求体格式错误')
      return
    }

    const { action, email, password, username } = body

    // ---- 初始化 Supabase Admin 客户端 ----
    let supabase
    try {
      supabase = getSupabaseAdmin()
    } catch (e) {
      console.error('[auth] getSupabaseAdmin 失败:', e)
      sendError(res, 500, '服务端配置错误：缺少 Supabase 环境变量，请检查 Vercel 环境变量设置')
      return
    }

    // ========== 注册 ==========
    if (action === 'register') {
      if (!email || !password || !username) {
        sendError(res, 400, '用户名、邮箱、密码为必填项')
        return
      }

      if (password.length < 6) {
        sendError(res, 400, '密码长度不能少于6位')
        return
      }

      // 使用 admin API 创建用户，email_confirm: true 跳过邮箱验证
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { username }
      })

      if (createError || !newUser?.user) {
        console.error('[auth] createUser 失败:', createError)
        const msg = createError?.message || '注册失败'
        if (msg.includes('already') || msg.includes('taken') || msg.includes('unique')) {
          sendError(res, 409, '该邮箱已被注册')
          return
        }
        sendError(res, 500, msg)
        return
      }

      // 注册成功后自动登录，获取 session
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError || !signInData?.session) {
        console.error('[auth] 自动登录失败:', signInError)
        // 注册成功但自动登录失败，返回用户信息让客户端手动登录
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          user: {
            id: newUser.user.id,
            username,
            email: newUser.user.email
          },
          session: null
        }))
        return
      }

      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({
        user: {
          id: newUser.user.id,
          username,
          email: newUser.user.email
        },
        session: {
          accessToken: signInData.session.access_token,
          refreshToken: signInData.session.refresh_token,
          expiresAt: signInData.session.expires_at
        }
      }))
      return
    }

    // ========== 登录 ==========
    if (action === 'login') {
      if (!email || !password) {
        sendError(res, 400, '邮箱和密码为必填项')
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error || !data?.user || !data?.session) {
        console.error('[auth] 登录失败:', error)
        const msg = error?.message || '登录失败'
        if (msg.includes('Invalid login') || msg.includes('invalid')) {
          sendError(res, 401, '邮箱或密码错误')
          return
        }
        sendError(res, 401, msg)
        return
      }

      const userMeta = data.user.user_metadata || {}
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({
        user: {
          id: data.user.id,
          username: (userMeta.username as string) || data.user.email?.split('@')[0] || '',
          email: data.user.email
        },
        session: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresAt: data.session.expires_at
        }
      }))
      return
    }

    // ========== 登出 ==========
    if (action === 'logout') {
      const authHeader = req.headers.authorization
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '')
        await supabase.auth.admin.signOut(token).catch(() => {})
      }

      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ success: true }))
      return
    }

    // 未知 action
    sendError(res, 400, '无效的 action，支持: register | login | logout')
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[auth] 未捕获异常:', msg)
    sendError(res, 500, `服务端内部错误: ${msg}`)
  }
}
