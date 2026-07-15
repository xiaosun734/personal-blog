import { createClient } from '@supabase/supabase-js'
import { readFile, readdir } from 'fs/promises'
import { readFileSync, existsSync } from 'fs'
import { resolve, extname } from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

// ============================================================
// 从 .env 文件读取环境变量
// ============================================================
function loadEnv() {
  const envPath = resolve(process.cwd(), '.env')
  if (!existsSync(envPath)) {
    console.error('❌ 未找到 .env 文件，请在项目根目录创建 .env 文件并配置 SUPABASE_URL 和 SUPABASE_ANON_KEY')
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
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ 请在 .env 文件中配置 SUPABASE_URL 和 SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const ARTICLES_DIR = resolve(process.cwd(), 'articles')
const COMMENTS_DIR = resolve(process.cwd(), 'comments')

// ============================================================
// 迁移文章
// ============================================================
async function migrateArticles() {
  console.log('📄 迁移文章...')

  const entries = await readdir(ARTICLES_DIR, { withFileTypes: true })
  const mdFiles = entries
    .filter(f => f.isFile() && extname(f.name) === '.md')
    .sort((a, b) => a.name.localeCompare(b.name))  // 按文件名排序，确保ID顺序匹配

  let count = 0
  for (const file of mdFiles) {
    const raw = await readFile(resolve(ARTICLES_DIR, file.name), 'utf-8')
    const { data, content } = matter(raw)
    const html = marked.parse(content.trim())

    const article = {
      title: data.title,
      author: data.author,
      desc: data.desc,
      date: new Date(data.date).toISOString(),
      category: data.category,
      content: html,
    }

    // 先查是否已有同名文章（避免重复迁移）
    const { data: existing } = await supabase
      .from('articles')
      .select('id')
      .eq('title', data.title)
      .maybeSingle()

    if (existing) {
      console.log(`  ⏭️  文章 "${data.title}" 已存在，跳过`)
      count++
      continue
    }

    const { data: inserted, error } = await supabase
      .from('articles')
      .insert(article)
      .select('id')
      .single()

    if (error) {
      console.error(`  ❌ 文章 "${data.title}" 迁移失败:`, error.message)
    } else {
      console.log(`  ✅ 文章 "${data.title}" (id=${inserted.id})`)
      count++
    }
  }

  console.log(`  共迁移 ${count} 篇文章\n`)
}

// ============================================================
// 迁移评论
// ============================================================
async function migrateComments() {
  console.log('💬 迁移评论...')

  let entries = []
  try {
    entries = await readdir(COMMENTS_DIR)
  } catch {
    console.log('  未找到评论目录，跳过\n')
    return
  }

  const jsonFiles = entries.filter(f => extname(f) === '.json')
  if (jsonFiles.length === 0) {
    console.log('  没有评论数据，跳过\n')
    return
  }

  let count = 0
  for (const file of jsonFiles) {
    const articleId = parseInt(file.replace('.json', ''), 10)
    const raw = await readFile(resolve(COMMENTS_DIR, file), 'utf-8')
    const comments = JSON.parse(raw)

    for (const c of comments) {
      const comment = {
        article_id: articleId,
        nickname: c.nickname,
        email: c.email || '',
        content: c.content,
        date: c.date,
      }

      const { error } = await supabase
        .from('comments')
        .insert(comment)

      if (error) {
        console.error(`  ❌ 评论迁移失败 (article ${articleId}):`, error.message)
      } else {
        count++
      }
    }
  }

  console.log(`  共迁移 ${count} 条评论\n`)
}

// ============================================================
// 主流程
// ============================================================
async function main() {
  console.log('🚀 开始迁移数据到 Supabase...\n')

  await migrateArticles()
  await migrateComments()

  console.log('✅ 迁移完成！')
}

main().catch(err => {
  console.error('❌ 迁移失败:', err)
  process.exit(1)
})
