import request from '@/utils/request'

export interface UmsRole {
  id: number
  name: string
  description?: string
  status: number
}

export interface UmsAdminWithRoles {
  id: number
  username: string
  nickname?: string
  email?: string
  status: number
  createTime: string
  roles: UmsRole[]
}

export interface AddUserParam {
  username: string
  password: string
  nickname?: string
  email?: string
  status?: number
  roleIds: number[]
}

export interface UpdateUserParam {
  roleIds: number[]
  nickname?: string
  email?: string
  status?: number
  /** 新密码，不修改请不传或传空 */
  password?: string
}

export function listUsers() {
  return request.get<any, { code: number; message: string; data: UmsAdminWithRoles[] }>(
    '/admin/user/list'
  )
}

export function addUser(data: AddUserParam) {
  return request.post<any, { code: number; message: string; data: unknown }>(
    '/admin/user',
    data
  )
}

export function updateUser(adminId: number, data: UpdateUserParam) {
  return request.put<any, { code: number; message: string }>(
    `/admin/user/${adminId}`,
    data
  )
}

export function listRoles() {
  return request.get<any, { code: number; message: string; data: UmsRole[] }>(
    '/admin/role/list'
  )
}

export function deleteUser(adminId: number) {
  return request.delete<any, { code: number; message: string }>(`/admin/user/${adminId}`)
}
