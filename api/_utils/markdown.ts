import matter from 'gray-matter'

// ============================================================
// 配置：修改为你的 GitHub 用户名和文章仓库名
// ============================================================
const GITHUB_OWNER = 'xiaosun734'
const GITHUB_REPO = 'blog-articles'
const ARTICLES_PATH = 'articles' // 仓库内存放 .md 文件的目录

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

interface GitHubContentItem {
  name: string
  path: string
  download_url: string | null
  url: string
}

let cachedArticles: ParsedArticle[] | null = null
let loadPromise: Promise<ParsedArticle[]> | null = null

export async function loadAllArticles(): Promise<ParsedArticle[]> {
  if (cachedArticles) return cachedArticles

  // 防止并发重复请求
  if (loadPromise) return loadPromise

  loadPromise = fetchArticleFiles()
  cachedArticles = await loadPromise
  loadPromise = null

  return cachedArticles
}

async function fetchArticleFiles(): Promise<ParsedArticle[]> {
  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${ARTICLES_PATH}`

  const listRes = await fetch(apiUrl, {
    headers: { Accept: 'application/vnd.github.v3+json' }
  })

  if (!listRes.ok) {
    console.error(`GitHub API error: ${listRes.status} ${listRes.statusText}`)
    return []
  }

  const items: GitHubContentItem[] = await listRes.json()
  const mdFiles = items.filter(f => f.name.endsWith('.md'))

  const articles = await Promise.all(
    mdFiles.map(async (file) => {
      const downloadUrl = file.download_url || file.url
      const rawRes = await fetch(downloadUrl)
      if (!rawRes.ok) return null

      const raw = await rawRes.text()
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

  // 过滤掉加载失败的文件，按 id 排序
  return articles
    .filter((a): a is ParsedArticle => a !== null)
    .sort((a, b) => a.id - b.id)
}
