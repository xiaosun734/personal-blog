import { readFile, writeFile, mkdir } from 'fs/promises'
import { resolve } from 'path'

const COMMENTS_DIR = resolve(process.cwd(), 'comments')

export interface CommentData {
  id: string
  articleId: number
  nickname: string
  email: string
  content: string
  date: string
}

/** 确保目录存在 */
async function ensureDir(): Promise<void> {
  try {
    await mkdir(COMMENTS_DIR, { recursive: true })
  } catch {
    // 目录已存在则忽略
  }
}

/** 获取文章评论文件的路径 */
function filePath(articleId: number): string {
  return resolve(COMMENTS_DIR, `${articleId}.json`)
}

/** 获取某篇文章的所有评论 */
export async function loadComments(articleId: number): Promise<CommentData[]> {
  await ensureDir()
  try {
    const raw = await readFile(filePath(articleId), 'utf-8')
    return JSON.parse(raw) as CommentData[]
  } catch {
    return []
  }
}

/** 追加一条评论 */
export async function saveComment(comment: CommentData): Promise<void> {
  await ensureDir()
  const list = await loadComments(comment.articleId)
  list.push(comment)
  await writeFile(filePath(comment.articleId), JSON.stringify(list, null, 2), 'utf-8')
}
