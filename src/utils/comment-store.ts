import type { Comment } from '@/types/comment'

/** 获取某篇文章的所有评论 */
export async function getComments(articleId: number): Promise<Comment[]> {
  const res = await fetch(`/api/comments?articleId=${articleId}`)
  if (!res.ok) return []
  const data = await res.json()
  return (data.comments as Comment[]) || []
}

/** 新增一条评论，返回是否成功 */
export async function addComment(comment: Comment): Promise<boolean> {
  const res = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(comment),
  })
  return res.ok
}
