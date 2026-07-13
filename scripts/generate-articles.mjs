import { readdir, readFile, writeFile, mkdir } from 'fs/promises'
import { resolve, extname, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const matter = require('gray-matter')
const { marked } = require('marked')

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const ARTICLES_DIR = resolve(ROOT, 'articles')
const DATA_DIR = resolve(ROOT, 'api', '_data')

async function main() {
  await mkdir(DATA_DIR, { recursive: true })

  const entries = await readdir(ARTICLES_DIR, { withFileTypes: true })
  const mdFiles = entries.filter(f => f.isFile() && extname(f.name) === '.md')

  const articles = []
  for (const file of mdFiles) {
    const raw = await readFile(resolve(ARTICLES_DIR, file.name), 'utf-8')
    const { data, content } = matter(raw)
    const html = marked.parse(content.trim())
    articles.push({
      id: data.id,
      title: data.title,
      author: data.author,
      desc: data.desc,
      date: data.date,
      category: data.category,
      content: typeof html === 'string' ? html : '',
    })
  }

  articles.sort((a, b) => a.id - b.id)

  // 文章列表（不含 content，节省体积）
  const list = articles.map(({ content, ...rest }) => rest)
  const listContent = `// 由 scripts/generate-articles.mjs 自动生成，请勿手动编辑

export interface ArticleFrontmatter {
  id: number
  title: string
  author: string
  desc: string
  date: string
  category: string
}

const list: (ArticleFrontmatter & { link: string })[] = ${JSON.stringify(list.map(a => ({ ...a, link: '#' })), null, 2)}

export default list
`
  await writeFile(resolve(DATA_DIR, 'articles-list.ts'), listContent, 'utf-8')

  // 文章详情映射表（key 为 id，含 HTML content）
  const detailMap = {}
  for (const a of articles) {
    detailMap[a.id] = a
  }
  const detailContent = `// 由 scripts/generate-articles.mjs 自动生成，请勿手动编辑

export interface ArticleFrontmatter {
  id: number
  title: string
  author: string
  desc: string
  date: string
  category: string
}

interface ArticleDetail extends ArticleFrontmatter {
  content: string
  link: string
}

const detail: Record<number, ArticleDetail> = ${JSON.stringify(
    Object.fromEntries(
      Object.entries(detailMap).map(([id, a]) => [id, { ...a, link: '#' }])
    ),
    null,
    2
  )}

export default detail
`
  await writeFile(resolve(DATA_DIR, 'articles-detail.ts'), detailContent, 'utf-8')

  console.log(`✅ 已生成 ${articles.length} 篇文章 → api/_data/`)
}

main().catch(err => {
  console.error('❌ 文章生成失败：', err)
  process.exit(1)
})
