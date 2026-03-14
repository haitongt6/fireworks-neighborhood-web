import request from '@/utils/request'

export interface MenuTreeNode {
  id: number
  name: string
  path: string
  icon: string
  children: MenuTreeNode[]
}

export interface MenuManageItem {
  id: number
  pid?: number | null
  name: string
  value?: string
  icon?: string
  type: number
  level: number
}

export function getMenuTree() {
  return request.get<any, { code: number; message: string; data: MenuTreeNode[] }>(
    '/admin/menu/tree'
  )
}

export function addRootMenu(data: { type: number; name: string; value?: string; icon?: string }) {
  return request.post<any, { code: number; message: string; data: unknown }>(
    '/admin/menu/root',
    data
  )
}

export function listMenuManage() {
  return request.get<any, { code: number; message: string; data: MenuManageItem[] }>(
    '/admin/menu/listAll'
  )
}

export function addButton(data: { menuId: number; name: string; value: string }) {
  return request.post<any, { code: number; message: string; data: unknown }>(
    '/admin/menu/button',
    data
  )
}

export function updateButton(buttonId: number, data: { name?: string; value?: string }) {
  return request.put<any, { code: number; message: string }>(
    `/admin/menu/button/${buttonId}`,
    data
  )
}

export function deleteButton(buttonId: number) {
  return request.delete<any, { code: number; message: string }>(
    `/admin/menu/button/${buttonId}`
  )
}

export function deleteDirectoryOrMenu(id: number) {
  return request.delete<any, { code: number; message: string }>(
    `/admin/menu/directory/${id}`
  )
}
