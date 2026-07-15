import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

// ============================================================
// 从 .env 文件读取环境变量
// ============================================================
function loadEnv() {
  const envPath = resolve(process.cwd(), '.env')
  if (!existsSync(envPath)) {
    console.error('❌ 未找到 .env 文件')
    process.exit(1)
  }
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

loadEnv()

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ 请在 .env 文件中配置 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// ============================================================
// 获取命令行参数
// ============================================================
const filePath = process.argv[2]

if (!filePath) {
  console.log('用法: node scripts/import-article.mjs <markdown文件路径>')
  console.log('示例: node scripts/import-article.mjs articles/示例文章.md')
  process.exit(1)
}

const fullPath = resolve(process.cwd(), filePath)

if (!existsSync(fullPath)) {
  console.error(`❌ 文件不存在: ${fullPath}`)
  process.exit(1)
}

// ============================================================
// 解析并导入
// ============================================================
async function importArticle() {
  const raw = readFileSync(fullPath, 'utf-8')
  const { data, content } = matter(raw)

  // 字段校验
  const required = ['title', 'author', 'desc', 'date', 'category']
  const missing = required.filter(f => !data[f])
  if (missing.length > 0) {
    console.error(`❌ 缺少必填字段: ${missing.join(', ')}`)
    console.log('Markdown 文件头格式示例:')
    console.log('---')
    console.log('title: 文章标题')
    console.log('author: 作者')
    console.log('desc: 简短描述')
    console.log('date: 2026-07-15')
    console.log('category: 分类')
    console.log('---')
    process.exit(1)
  }

  const article = {
    title: data.title,
    author: data.author,
    desc: data.desc,
    date: new Date(data.date).toISOString(),
    category: data.category,
    content: marked.parse(content.trim()),
  }

  const { data: inserted, error } = await supabase
    .from('articles')
    .insert(article)
    .select('id')
    .single()

  if (error) {
    console.error('❌ 导入失败:', error.message)
    process.exit(1)
  }

  console.log(`✅ 文章 "${data.title}" 导入成功！ID: ${inserted.id}`)
}

importArticle()
