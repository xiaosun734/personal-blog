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

export default async function handler(req: IncomingMessage, res: ServerResponse) {
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
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: '请求体格式错误' }))
    return
  }

  const { action, email, password, username } = body
  const supabase = getSupabaseAdmin()

  // ========== 注册 ==========
  if (action === 'register') {
    if (!email || !password || !username) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: '用户名、邮箱、密码为必填项' }))
      return
    }

    if (password.length < 6) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: '密码长度不能少于6位' }))
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
      const msg = createError?.message || '注册失败'
      // 邮箱已存在
      if (msg.includes('already') || msg.includes('taken') || msg.includes('unique')) {
        res.statusCode = 409
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: '该邮箱已被注册' }))
        return
      }
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: msg }))
      return
    }

    // 注册成功后自动登录，获取 session
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError || !signInData?.session) {
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
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: '邮箱和密码为必填项' }))
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error || !data?.user || !data?.session) {
      const msg = error?.message || '登录失败'
      if (msg.includes('Invalid login') || msg.includes('invalid')) {
        res.statusCode = 401
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: '邮箱或密码错误' }))
        return
      }
      res.statusCode = 401
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: msg }))
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
    // 登出主要由客户端清除本地 token 完成
    // 服务端可选：使 refresh token 失效
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
  res.statusCode = 400
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ error: '无效的 action，支持: register | login | logout' }))
}
