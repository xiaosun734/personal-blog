import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

let client: SupabaseClient | null = null

/** 从 .env 文件加载环境变量（本地开发时 Vite SSR 不会自动注入非 VITE_ 前缀的变量） */
function loadEnvFromFile() {
  const envPath = resolve(process.cwd(), '.env')
  if (!existsSync(envPath)) return
  const content = readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim()
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

function getEnv(key: string): string | undefined {
  // 优先用 process.env（Vercel 生产环境会注入），其次从 .env 文件加载
  if (process.env[key]) return process.env[key]
  loadEnvFromFile()
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
