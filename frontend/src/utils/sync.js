import api from '../api'
import { saveToOffline, getOffline, isOnline, syncOfflineData } from './offline'

const TABLE_KEYS = {
  sites: 'offline_sites',
  trenches: 'offline_trenches',
  artifacts: 'offline_artifacts',
  stratigraphies: 'offline_stratigraphies'
}

export const uploadPending = async () => {
  if (!isOnline()) {
    return { success: false, message: '当前离线，无法上传', synced: 0, failed: 0 }
  }
  return await syncOfflineData()
}

export const downloadAll = async () => {
  if (!isOnline()) {
    return { success: false, message: '当前离线，无法下载' }
  }

  const results = {}
  let totalDownloaded = 0
  let hasError = false

  try {
    const sitesRes = await api.get('/sites/')
    const sites = sitesRes?.data || []
    await saveToOffline(TABLE_KEYS.sites, sites)
    results.sites = sites.length
    totalDownloaded += sites.length
  } catch (error) {
    console.error('下载遗址数据失败:', error)
    results.sites = 0
    hasError = true
  }

  try {
    const trenchesRes = await api.get('/trenches/')
    const trenches = trenchesRes?.data || []
    await saveToOffline(TABLE_KEYS.trenches, trenches)
    results.trenches = trenches.length
    totalDownloaded += trenches.length
  } catch (error) {
    console.error('下载探方数据失败:', error)
    results.trenches = 0
    hasError = true
  }

  try {
    const artifactsRes = await api.get('/artifacts/')
    const artifacts = artifactsRes?.data || []
    await saveToOffline(TABLE_KEYS.artifacts, artifacts)
    results.artifacts = artifacts.length
    totalDownloaded += artifacts.length
  } catch (error) {
    console.error('下载文物数据失败:', error)
    results.artifacts = 0
    hasError = true
  }

  try {
    const stratigraphiesRes = await api.get('/stratigraphies/')
    const stratigraphies = stratigraphiesRes?.data || []
    await saveToOffline(TABLE_KEYS.stratigraphies, stratigraphies)
    results.stratigraphies = stratigraphies.length
    totalDownloaded += stratigraphies.length
  } catch (error) {
    console.error('下载地层数据失败:', error)
    results.stratigraphies = 0
    hasError = true
  }

  return {
    success: !hasError,
    message: hasError ? '部分数据下载失败' : `全量下载完成，共${totalDownloaded}条`,
    totalDownloaded,
    details: results
  }
}

export const getSyncStatus = async () => {
  const pendingRequests = await getOffline('pending_requests') || []
  const status = {
    pendingUpload: pendingRequests.length,
    tables: {}
  }

  for (const [tableName, key] of Object.entries(TABLE_KEYS)) {
    const cachedData = await getOffline(key) || []
    status.tables[tableName] = {
      cachedCount: cachedData.length,
      cachedKey: key
    }
  }

  const methodCount = { POST: 0, PUT: 0, PATCH: 0, DELETE: 0 }
  pendingRequests.forEach(req => {
    const method = (req.method || 'POST').toUpperCase()
    if (methodCount[method] !== undefined) {
      methodCount[method]++
    }
  })
  status.uploadBreakdown = methodCount

  return status
}

export const clearAllCache = async () => {
  for (const key of Object.values(TABLE_KEYS)) {
    await saveToOffline(key, [])
  }
  await saveToOffline('pending_requests', [])
  return { success: true, message: '缓存已清空' }
}
