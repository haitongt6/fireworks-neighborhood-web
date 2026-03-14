import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

service.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = localStorage.getItem('tokenHead') + token
    }
    return config
  },
  (error) => Promise.reject(error)
)

service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      if (res.code === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('tokenHead')
        localStorage.removeItem('user_info')
        window.location.href = '/login?msg=' + encodeURIComponent('您的登录已失效，请联系管理员')
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('tokenHead')
      localStorage.removeItem('user_info')
      window.location.href = '/login?msg=' + encodeURIComponent('您的登录已失效，请联系管理员')
      return Promise.reject(error)
    }
    ElMessage.error(error.response?.data?.message || '网络异常，请稍后重试')
    return Promise.reject(error)
  }
)

export default service
