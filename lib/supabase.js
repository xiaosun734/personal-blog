import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

let client = null
let adminClient = null

function getEnv(key) {
  // Vercel 生产环境注入
  if (process.env[key]) return process.env[key]
  // 本地开发时 fallback 到 .env 文件
  try {
    const envPath = resolve(process.cwd(), '.env')
    if (existsSync(envPath)) {
      const content = readFileSync(envPath, 'utf-8')
      for (const line of content.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx === -1) continue
        const k = trimmed.slice(0, eqIdx).trim()
        const v = trimmed.slice(eqIdx + 1).trim()
        if (!process.env[k]) {
          process.env[k] = v
        }
      }
    }
  } catch {}
  return process.env[key]
}

export function getSupabase() {
  if (!client) {
    const url = getEnv('SUPABASE_URL')
    const key = getEnv('SUPABASE_ANON_KEY')
    if (!url || !key) {
      throw new Error('缺少 SUPABASE_URL 或 SUPABASE_ANON_KEY 环境变量')
    }
    client = createClient(url, key)
  }
  return client
}

/** 使用 service_role key 的 admin 客户端，用于服务端管理操作 */
export function getSupabaseAdmin() {
  if (!adminClient) {
    const url = getEnv('SUPABASE_URL')
    const key = getEnv('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !key) {
      throw new Error('缺少 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY 环境变量')
    }
    adminClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  return adminClient
}
