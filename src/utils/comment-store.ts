import type { Comment } from '@/types/comment'

/** 获取某篇文章的所有评论 */
export async function getComments(articleId: number): Promise<Comment[]> {
  const res = await fetch(`/api/comments?articleId=${articleId}`)
  if (!res.ok) return []
  const data = await res.json()
  return (data.comments as Comment[]) || []
}
