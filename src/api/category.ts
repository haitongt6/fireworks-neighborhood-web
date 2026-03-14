import request from '@/utils/request'

export interface PmsProductCategory {
  id: number
  name: string
  sort: number
  status: number
  createTime?: string
}

export interface AddCategoryParam {
  name: string
  sort?: number
  status?: number
}

export interface UpdateCategoryParam {
  name?: string
  sort?: number
  status?: number
}

export function listCategories() {
  return request.get<any, { code: number; message: string; data: PmsProductCategory[] }>(
    '/admin/category/list'
  )
}

export function addCategory(data: AddCategoryParam) {
  return request.post<any, { code: number; message: string; data: PmsProductCategory }>(
    '/admin/category',
    data
  )
}

export function updateCategory(id: number, data: UpdateCategoryParam) {
  return request.put<any, { code: number; message: string }>(
    `/admin/category/${id}`,
    data
  )
}

export function deleteCategory(id: number) {
  return request.delete<any, { code: number; message: string }>(
    `/admin/category/${id}`
  )
}
