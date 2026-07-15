import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

let client: SupabaseClient | null = null

/** Vercel 生产环境从 process.env 读取，本地开发从 .env 文件加载 */
function getEnv(key: string): string | undefined {
  // Vercel 会注入环境变量，优先读取
  if (process.env[key]) return process.env[key]
  // 本地开发时 fallback 到 .env 文件
  const envPath = resolve(process.cwd(), '.env')
  if (!existsSync(envPath)) return undefined
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
  return process.env[key]
}

export function getSupabase(): SupabaseClient {
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
