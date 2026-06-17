import axios from 'axios'
import { message } from 'antd'
import localforage from 'localforage'
import { isOnline, saveToOffline } from '../utils/offline'

const getDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId')
  if (!deviceId) {
    deviceId = 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    localStorage.setItem('deviceId', deviceId)
  }
  return deviceId
}

const api = axios.create({
  baseURL: '/api',
  timeout: 15000
})

api.interceptors.request.use(
  config => {
    config.headers['deviceId'] = getDeviceId()
    return config
  },
  error => Promise.reject(error)
)

api.interceptors.response.use(
  response => {
    const res = response.data
    if (res && res.code !== undefined && res.code !== 200) {
      message.error(res.message || '请求失败')
      return Promise.reject(res)
    }
    return res
  },
  async error => {
    const config = error.config
    if (config && ['post', 'put', 'patch'].includes(config.method?.toLowerCase())) {
      if (!isOnline() || error.code === 'ERR_NETWORK') {
        try {
          const pendingRequests = await localforage.getItem('pending_requests') || []
          pendingRequests.push({
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            method: config.method,
            url: config.url,
            data: config.data,
            headers: config.headers,
            timestamp: Date.now()
          })
          await saveToOffline('pending_requests', pendingRequests)
          message.warning('当前网络不可用，请求已缓存，待联网后自动同步')
          return { code: 202, message: '已缓存到离线队列', cached: true }
        } catch (cacheErr) {
          console.error('缓存请求失败:', cacheErr)
        }
      }
    }
    message.error(error.message || '网络异常，请稍后重试')
    return Promise.reject(error)
  }
)

export default api
