import localforage from 'localforage'
import api from '../api'

localforage.config({
  name: 'excavationOfflineDB',
  storeName: 'excavation_data'
})

export const isOnline = () => {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine
  }
  return true
}

export const saveToOffline = async (key, data) => {
  try {
    await localforage.setItem(key, data)
    return true
  } catch (error) {
    console.error('保存离线数据失败:', error)
    return false
  }
}

export const getOffline = async (key) => {
  try {
    const data = await localforage.getItem(key)
    return data
  } catch (error) {
    console.error('读取离线数据失败:', error)
    return null
  }
}

export const removeOffline = async (key) => {
  try {
    await localforage.removeItem(key)
    return true
  } catch (error) {
    console.error('删除离线数据失败:', error)
    return false
  }
}

export const syncOfflineData = async () => {
  if (!isOnline()) {
    return { success: false, message: '当前离线，无法同步', synced: 0, failed: 0 }
  }

  const pendingRequests = await getOffline('pending_requests') || []
  if (pendingRequests.length === 0) {
    return { success: true, message: '无待同步数据', synced: 0, failed: 0 }
  }

  let synced = 0
  let failed = 0
  const remaining = []

  for (const req of pendingRequests) {
    try {
      const config = {
        method: req.method,
        url: req.url,
        data: req.data,
        headers: req.headers || {}
      }
      await api(config)
      synced++
    } catch (error) {
      failed++
      remaining.push(req)
    }
  }

  if (remaining.length > 0) {
    await saveToOffline('pending_requests', remaining)
  } else {
    await removeOffline('pending_requests')
  }

  return {
    success: failed === 0,
    message: `同步完成：成功${synced}条，失败${failed}条`,
    synced,
    failed,
    remaining: remaining.length
  }
}

export const getPendingCount = async () => {
  const pendingRequests = await getOffline('pending_requests') || []
  return pendingRequests.length
}
