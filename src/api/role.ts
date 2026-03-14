import request from '@/utils/request'

export interface UmsPermission {
  id: number
  pid: number
  name: string
  value?: string
  icon?: string
  type: number
}

export interface UmsRoleWithPermissions {
  id: number
  name: string
  description?: string
  status: number
  permissions: UmsPermission[]
}

export interface AddRoleParam {
  name: string
  description?: string
  status?: number
  permissionIds: number[]
}

export interface UpdateRoleParam {
  description?: string
  status?: number
  permissionIds: number[]
}

export function listRolesWithPermissions() {
  return request.get<any, { code: number; message: string; data: UmsRoleWithPermissions[] }>(
    '/admin/role/listWithPermissions'
  )
}

export function listAllPermissions() {
  return request.get<any, { code: number; message: string; data: UmsPermission[] }>(
    '/admin/permission/list'
  )
}

/** 权限树节点，供角色表单级联勾选（目录 -> 菜单 -> 按钮） */
export interface PermissionTreeNode {
  id: number
  name: string
  value?: string
  type: number
  leaf?: boolean
  children?: PermissionTreeNode[]
}

export function listPermissionTree() {
  return request.get<any, { code: number; message: string; data: PermissionTreeNode[] }>(
    '/admin/permission/tree'
  )
}

export function addRole(data: AddRoleParam) {
  return request.post<any, { code: number; message: string; data: unknown }>(
    '/admin/role',
    data
  )
}

export function updateRole(roleId: number, data: UpdateRoleParam) {
  return request.put<any, { code: number; message: string }>(
    `/admin/role/${roleId}`,
    data
  )
}

export function deleteRole(roleId: number) {
  return request.delete<any, { code: number; message: string }>(
    `/admin/role/${roleId}`
  )
}
