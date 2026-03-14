import request from '@/utils/request'

/** 获取 RSA 公钥（用于加密密码，登录前调用） */
export function getPublicKey() {
  return request.get<any, { code: number; message: string; data: { publicKey: string } }>(
    '/admin/publicKey'
  )
}

export interface LoginParam {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  tokenHead: string
  username: string
  nickname?: string
  email?: string
}

export function login(data: LoginParam) {
  return request.post<any, { code: number; message: string; data: LoginResult }>(
    '/admin/login',
    data
  )
}

export function logout() {
  return request.post<any, { code: number; message: string }>('/admin/logout')
}

/** 获取当前登录用户的权限标识列表（如 ums:admin:add） */
export function getCurrentUserPermissions() {
  return request.get<any, { code: number; message: string; data: string[] }>(
    '/admin/user/permissions'
  )
}

export interface ProfileInfo {
  username: string
  nickname?: string
  email?: string
}

export interface ProfileUpdateParam {
  nickname?: string
  email?: string
  password?: string
}

export function getProfile() {
  return request.get<any, { code: number; message: string; data: ProfileInfo }>(
    '/admin/user/profile'
  )
}

export function updateProfile(data: ProfileUpdateParam) {
  return request.put<any, { code: number; message: string }>(
    '/admin/user/profile',
    data
  )
}
