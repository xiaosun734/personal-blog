import matter from 'gray-matter'
import { readdir, readFile } from 'fs/promises'
import { resolve, extname } from 'path'

// ============================================================
// 文章存放目录（相对于项目根目录）
// ============================================================
const ARTICLES_DIR = resolve(process.cwd(), 'articles')

export interface ArticleFrontmatter {
  id: number
  title: string
  author: string
  desc: string
  date: string
  category: string
}

export interface ParsedArticle extends ArticleFrontmatter {
  content: string
}

export async function loadAllArticles(): Promise<ParsedArticle[]> {
  // 本地文件读取足够快，不缓存，确保每次都读到最新内容
  return loadArticlesFromDisk()
}

async function loadArticlesFromDisk(): Promise<ParsedArticle[]> {
  try {
    const entries = await readdir(ARTICLES_DIR, { withFileTypes: true })
    const mdFiles = entries.filter(f => f.isFile() && extname(f.name) === '.md')

    const articles = await Promise.all(
      mdFiles.map(async (file) => {
        const raw = await readFile(resolve(ARTICLES_DIR, file.name), 'utf-8')
        const { data, content } = matter(raw)

        return {
          id: (data as ArticleFrontmatter).id,
          title: (data as ArticleFrontmatter).title,
          author: (data as ArticleFrontmatter).author,
          desc: (data as ArticleFrontmatter).desc,
          date: (data as ArticleFrontmatter).date,
          category: (data as ArticleFrontmatter).category,
          content: content.trim()
        }
      })
    )

    // 过滤掉解析失败的文件，按 id 排序
    return articles
      .filter((a): a is ParsedArticle => a !== null)
      .sort((a, b) => a.id - b.id)
  } catch {
    console.error(`articles 目录不存在或无法读取：${ARTICLES_DIR}`)
    return []
  }
}
