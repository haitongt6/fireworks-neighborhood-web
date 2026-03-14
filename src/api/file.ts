import request from '@/utils/request'

/**
 * 上传文件
 * @param file 文件
 * @param category main-主图 | video-主图视频 | desc-详情图
 * @returns 文件访问 URL，如 /api/file/xxx.jpg
 */
export function uploadFile(file: File, category: 'main' | 'video' | 'desc') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('category', category)
  return request.post<any, { code: number; message: string; data: string }>(
    '/admin/file/upload',
    formData
  )
}
