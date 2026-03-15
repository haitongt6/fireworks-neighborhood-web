import { JSEncrypt } from 'jsencrypt'
import { getPublicKey } from '@/api/login'

/**
 * 获取公钥。每次加密前都重新请求，避免后端重启后密钥对更换导致解密失败。
 */
async function fetchPublicKey(): Promise<string> {
  const res = await getPublicKey()
  const key = res.data?.publicKey
  if (!key) throw new Error('获取公钥失败')
  return key
}

/**
 * 将 Base64 公钥转为 PEM 格式
 */
function toPemFormat(base64Key: string): string {
  const lines = base64Key.match(/.{1,64}/g) || [base64Key]
  return `-----BEGIN PUBLIC KEY-----\n${lines.join('\n')}\n-----END PUBLIC KEY-----`
}

/**
 * 使用 RSA 公钥加密密码
 * @param plainPassword 明文密码
 * @returns Base64 编码的密文，失败时抛出异常
 */
export async function encryptPassword(plainPassword: string): Promise<string> {
  if (!plainPassword?.trim()) throw new Error('密码不能为空')
  const base64Key = await fetchPublicKey()
  const pemKey = toPemFormat(base64Key)
  const encrypt = new JSEncrypt()
  encrypt.setPublicKey(pemKey)
  const encrypted = encrypt.encrypt(plainPassword.trim())
  if (!encrypted) throw new Error('密码加密失败，请刷新页面重试')
  return encrypted
}
