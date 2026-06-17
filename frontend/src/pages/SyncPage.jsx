import { useState, useEffect, useRef } from 'react'
import {
  Card, Row, Col, Statistic, Progress, Button, Space, Table, Tag,
  Modal, message, Badge, Tooltip, Alert, Divider
} from 'antd'
import {
  CloudUploadOutlined, CloudDownloadOutlined, CloudSyncOutlined,
  DeleteOutlined, WifiOutlined, WifiOffOutlined, ClockCircleOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined,
  ReloadOutlined, ExperimentOutlined, AppstoreOutlined, DatabaseOutlined,
  ProfileOutlined, CameraOutlined, FolderOpenOutlined
} from '@ant-design/icons'
import axios from 'axios'
import localforage from 'localforage'
import dayjs from 'dayjs'
import { uploadPending, downloadAll, getSyncStatus, clearAllCache } from '../utils/sync'
import { getOffline, isOnline } from '../utils/offline'

const TABLE_META = [
  { key: 'sites', label: '遗址', icon: <ExperimentOutlined />, color: '#1890ff' },
  { key: 'trenches', label: '探方', icon: <AppstoreOutlined />, color: '#52c41a' },
  { key: 'artifacts', label: '文物', icon: <DatabaseOutlined />, color: '#722ed1' },
  { key: 'stratigraphies', label: '地层', icon: <ProfileOutlined />, color: '#fa8c16' },
  { key: 'photos', label: '照片', icon: <CameraOutlined />, color: '#eb2f96' },
  { key: 'others', label: '其他', icon: <FolderOpenOutlined />, color: '#8c8c8c' }
]

const PENDING_KEYS = [
  { urlPattern: /\/sites/, key: 'sites' },
  { urlPattern: /\/trenches/, key: 'trenches' },
  { urlPattern: /\/artifacts/, key: 'artifacts' },
  { urlPattern: /\/stratigraphies/, key: 'stratigraphies' },
  { urlPattern: /\/photos/, key: 'photos' }
]

const classifyPending = (pendingRequests = []) => {
  const counts = { sites: 0, trenches: 0, artifacts: 0, stratigraphies: 0, photos: 0, others: 0 }
  pendingRequests.forEach(req => {
    const matched = PENDING_KEYS.find(p => p.urlPattern.test(req.url || ''))
    if (matched) {
      counts[matched.key]++
    } else {
      counts.others++
    }
  })
  return counts
}

const SyncPage = () => {
  const [online, setOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [syncStatus, setSyncStatus] = useState({
    pendingUpload: 0,
    pendingByTable: { sites: 0, trenches: 0, artifacts: 0, stratigraphies: 0, photos: 0, others: 0 },
    tables: {}
  })
  const [logs, setLogs] = useState([])
  const [uploadProgress, setUploadProgress] = useState({ visible: false, percent: 0, log: [] })
  const [downloadProgress, setDownloadProgress] = useState({ visible: false, percent: 0, log: [] })
  const [loading, setLoading] = useState({
    upload: false,
    download: false,
    incremental: false,
    clear: false,
    refresh: false
  })
  const logIdRef = useRef(0)

  const addLog = (entry) => {
    logIdRef.current++
    setLogs(prev => [{
      id: logIdRef.current,
      time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      ...entry
    }, ...prev].slice(0, 200))
  }

  const loadStatus = async () => {
    setLoading(prev => ({ ...prev, refresh: true }))
    try {
      const [status, pendingRequests] = await Promise.all([
        getSyncStatus(),
        getOffline('pending_requests') || []
      ])
      const pendingByTable = classifyPending(pendingRequests || [])
      setSyncStatus({
        pendingUpload: status?.pendingUpload ?? (pendingRequests?.length || 0),
        pendingByTable,
        tables: status?.tables || {}
      })
    } catch (error) {
      console.error('加载同步状态失败:', error)
    } finally {
      setLoading(prev => ({ ...prev, refresh: false }))
    }
  }

  useEffect(() => {
    loadStatus()
    const handleOnline = () => { setOnline(true); message.success('网络已恢复，当前在线') }
    const handleOffline = () => { setOnline(false); message.warning('网络已断开，当前离线') }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleUpload = async () => {
    if (!isOnline()) {
      message.error('当前离线，无法上传，请检查网络连接')
      return
    }
    if (syncStatus.pendingUpload === 0) {
      message.info('暂无待上传数据')
      return
    }
    setLoading(prev => ({ ...prev, upload: true }))
    setUploadProgress({ visible: true, percent: 0, log: [] })

    const pendingRequests = await getOffline('pending_requests') || []
    const total = pendingRequests.length
    let success = 0
    let failed = 0

    try {
      const result = await uploadPending()

      for (let i = 0; i < total; i++) {
        const req = pendingRequests[i]
        await new Promise(r => setTimeout(r, 30))
        const percent = Math.round(((i + 1) / total) * 100)
        setUploadProgress(prev => ({
          ...prev,
          percent,
          log: [...prev.log, `[${i + 1}/${total}] 处理: ${req.method?.toUpperCase()} ${req.url}`]
        }))
      }

      success = result?.synced || 0
      failed = result?.failed || 0

      addLog({
        direction: 'upload',
        directionText: '↑ 上传',
        tableName: 'ALL',
        count: total,
        status: failed === 0 ? 'success' : 'partial',
        statusText: failed === 0 ? '成功' : `部分失败(${failed}条)`,
        duration: '-',
        error: failed > 0 ? `${failed}条失败` : null
      })

      if (failed === 0) {
        message.success(result?.message || `上传完成，共${success}条`)
      } else {
        message.warning(result?.message || `上传完成，成功${success}条，失败${failed}条`)
      }
    } catch (error) {
      console.error('上传失败:', error)
      addLog({
        direction: 'upload',
        directionText: '↑ 上传',
        tableName: 'ALL',
        count: 0,
        status: 'error',
        statusText: '失败',
        duration: '-',
        error: error.message || '未知错误'
      })
      message.error('上传失败: ' + (error.message || '未知错误'))
    } finally {
      setLoading(prev => ({ ...prev, upload: false }))
      setTimeout(() => setUploadProgress({ visible: false, percent: 0, log: [] }), 1500)
      loadStatus()
    }
  }

  const handleDownload = async () => {
    if (!isOnline()) {
      message.error('当前离线，无法下载，请检查网络连接')
      return
    }
    Modal.confirm({
      title: '确认全量下载？',
      icon: <ExclamationCircleOutlined />,
      content: '全量下载将从服务器重新拉取所有数据并覆盖本地缓存，建议仅首次同步时使用。是否继续？',
      okText: '确认下载',
      cancelText: '取消',
      onOk: async () => {
        setLoading(prev => ({ ...prev, download: true }))
        setDownloadProgress({ visible: true, percent: 0, log: ['开始全量下载...'] })

        try {
          const steps = [
            { key: 'sites', text: '下载遗址数据...' },
            { key: 'trenches', text: '下载探方数据...' },
            { key: 'artifacts', text: '下载文物数据...' },
            { key: 'stratigraphies', text: '下载地层数据...' }
          ]

          for (let i = 0; i < steps.length; i++) {
            setDownloadProgress(prev => ({
              ...prev,
              percent: Math.round(((i) / steps.length) * 100),
              log: [...prev.log, steps[i].text]
            }))
            await new Promise(r => setTimeout(r, 200))
          }

          const result = await downloadAll()
          setDownloadProgress(prev => ({ ...prev, percent: 100, log: [...prev.log, result?.message || '下载完成'] }))

          const totalDownloaded = result?.totalDownloaded || 0
          const details = result?.details || {}
          Object.entries(details).forEach(([table, count]) => {
            addLog({
              direction: 'download',
              directionText: '↓ 下载',
              tableName: table,
              count,
              status: 'success',
              statusText: '成功',
              duration: '-',
              error: null
            })
          })

          if (result?.success) {
            message.success(result?.message || `全量下载完成，共${totalDownloaded}条`)
          } else {
            message.warning(result?.message || '部分数据下载失败')
          }
        } catch (error) {
          console.error('下载失败:', error)
          addLog({
            direction: 'download',
            directionText: '↓ 下载',
            tableName: 'ALL',
            count: 0,
            status: 'error',
            statusText: '失败',
            duration: '-',
            error: error.message || '未知错误'
          })
          message.error('下载失败: ' + (error.message || '未知错误'))
        } finally {
          setLoading(prev => ({ ...prev, download: false }))
          setTimeout(() => setDownloadProgress({ visible: false, percent: 0, log: [] }), 2000)
          loadStatus()
        }
      }
    })
  }

  const handleIncremental = async () => {
    if (!isOnline()) {
      message.error('当前离线，无法同步，请检查网络连接')
      return
    }
    setLoading(prev => ({ ...prev, incremental: true }))
    message.loading({ content: '正在执行增量同步...', key: 'incSync', duration: 0 })

    try {
      const uploadResult = await uploadPending()
      const downloadResult = await downloadAll()

      const success = uploadResult?.success && downloadResult?.success
      addLog({
        direction: 'incremental',
        directionText: '⇅ 增量同步',
        tableName: 'ALL',
        count: (uploadResult?.synced || 0) + (downloadResult?.totalDownloaded || 0),
        status: success ? 'success' : 'partial',
        statusText: success ? '成功' : '部分完成',
        duration: '-',
        error: !success ? '部分步骤失败' : null
      })

      message.success({
        content: `增量同步完成：上传${uploadResult?.synced || 0}条，下载${downloadResult?.totalDownloaded || 0}条`,
        key: 'incSync'
      })
    } catch (error) {
      console.error('增量同步失败:', error)
      addLog({
        direction: 'incremental',
        directionText: '⇅ 增量同步',
        tableName: 'ALL',
        count: 0,
        status: 'error',
        statusText: '失败',
        duration: '-',
        error: error.message || '未知错误'
      })
      message.error({ content: '增量同步失败: ' + (error.message || '未知错误'), key: 'incSync' })
    } finally {
      setLoading(prev => ({ ...prev, incremental: false }))
      loadStatus()
    }
  }

  const handleClearCache = async () => {
    Modal.confirm({
      title: '确认清空本地缓存？',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>此操作将删除本地所有缓存数据，包括：</p>
          <ul style={{ margin: '8px 0 8px 20px' }}>
            <li>已缓存的遗址、探方、文物、地层数据</li>
            <li>待上传的离线请求队列（{syncStatus.pendingUpload}条）</li>
          </ul>
          <p style={{ color: '#ff4d4f', fontWeight: 500 }}>⚠️ 待上传数据删除后将无法恢复，请确认已完成同步。</p>
        </div>
      ),
      okText: '确认清空',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        setLoading(prev => ({ ...prev, clear: true }))
        try {
          const result = await clearAllCache()
          addLog({
            direction: 'clear',
            directionText: '🗑 清缓存',
            tableName: 'ALL',
            count: syncStatus.pendingUpload,
            status: 'success',
            statusText: '已清空',
            duration: '-',
            error: null
          })
          message.success(result?.message || '本地缓存已清空')
        } catch (error) {
          message.error('清空失败: ' + (error.message || '未知错误'))
        } finally {
          setLoading(prev => ({ ...prev, clear: false }))
          loadStatus()
        }
      }
    })
  }

  const logColumns = [
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
      width: 170,
      render: t => <span style={{ color: '#595959', fontFamily: 'monospace', fontSize: 12 }}>{t}</span>
    },
    {
      title: '同步方向',
      dataIndex: 'directionText',
      key: 'direction',
      width: 100,
      render: (text, record) => {
        const colorMap = {
          upload: '#1890ff',
          download: '#52c41a',
          incremental: '#722ed1',
          clear: '#fa8c16'
        }
        return <Tag color={colorMap[record.direction] || 'default'} style={{ margin: 0 }}>{text}</Tag>
      }
    },
    { title: '表名', dataIndex: 'tableName', key: 'tableName', width: 110, render: v => <code style={{ fontSize: 12 }}>{v}</code> },
    { title: '记录数', dataIndex: 'count', key: 'count', width: 80, align: 'right', render: v => <b>{v}</b> },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s, record) => {
        const map = {
          success: { icon: <CheckCircleOutlined />, color: 'success', text: record.statusText || '成功' },
          partial: { icon: <ExclamationCircleOutlined />, color: 'warning', text: record.statusText || '部分' },
          error: { icon: <CloseCircleOutlined />, color: 'error', text: record.statusText || '失败' }
        }
        const info = map[s] || { icon: <ClockCircleOutlined />, color: 'default', text: s }
        return <Tag icon={info.icon} color={info.color}>{info.text}</Tag>
      }
    },
    { title: '耗时', dataIndex: 'duration', key: 'duration', width: 80, render: v => v || '-' },
    {
      title: '错误信息',
      dataIndex: 'error',
      key: 'error',
      ellipsis: true,
      render: v => v ? <span style={{ color: '#ff4d4f', fontSize: 12 }}>{v}</span> : '-'
    }
  ]

  return (
    <div>
      <Card style={{ marginBottom: 16 }} bodyStyle={{ padding: '16px 24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space size="large">
              <Space size={8}>
                <Badge
                  color={online ? '#52c41a' : '#bfbfbf'}
                  status={online ? 'success' : 'default'}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <span style={{
                    display: 'inline-block',
                    width: 10, height: 10, borderRadius: '50%',
                    background: online ? '#52c41a' : '#bfbfbf',
                    boxShadow: online ? '0 0 6px #52c41a' : 'none'
                  }} />
                  <span style={{ marginLeft: 8, fontWeight: 500, color: online ? '#52c41a' : '#8c8c8c' }}>
                    {online ? '在线' : '离线'}
                  </span>
                </Badge>
                {online ? <WifiOutlined style={{ color: '#52c41a' }} /> : <WifiOffOutlined style={{ color: '#bfbfbf' }} />}
              </Space>
            </Space>
          </Col>
          <Col>
            <Space>
              <Tag color="blue">待上传请求: <b>{syncStatus.pendingUpload}</b> 条</Tag>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadStatus}
                loading={loading.refresh}
                size="small"
              >刷新状态</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {!online && (
        <Alert
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
          message="当前处于离线状态"
          description="数据操作将自动缓存到本地队列，待网络恢复后可点击"上传所有待同步数据"按钮进行同步。"
          icon={<WifiOffOutlined />}
        />
      )}

      <Card
        title={
          <Space>
            <CloudSyncOutlined />
            <span>同步状态概览</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
        extra={<span style={{ color: '#8c8c8c', fontSize: 12 }}>本地待上传（离线队列）</span>}
      >
        <Row gutter={[16, 16]}>
          {TABLE_META.map(meta => (
            <Col xs={12} sm={8} md={4} key={meta.key}>
              <Card
                size="small"
                style={{
                  borderLeft: `3px solid ${meta.color}`,
                  borderRadius: 8,
                  background: `linear-gradient(135deg, #fff 0%, ${meta.color}10 100%)`
                }}
                bodyStyle={{ padding: 16 }}
              >
                <Space align="start" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <Statistic
                      title={<span style={{ color: '#595959', fontSize: 13 }}>{meta.label}</span>}
                      value={syncStatus.pendingByTable[meta.key] || 0}
                      valueStyle={{ color: meta.color, fontSize: 28, fontWeight: 700 }}
                    />
                  </div>
                  <div style={{
                    fontSize: 28, color: meta.color, opacity: 0.6, lineHeight: 1
                  }}>
                    {meta.icon}
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        <Divider style={{ margin: '20px 0 16px' }} />

        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space justify="space-between" style={{ width: '100%' }}>
                <span style={{ fontWeight: 500 }}>
                  待上传请求队列 <Tag color="blue">{syncStatus.pendingUpload} 条</Tag>
                </span>
                <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                  POST {syncStatus.pendingUpload > 0 ? '+' : ''} PUT {syncStatus.pendingUpload > 0 ? '+' : ''} DELETE
                </span>
              </Space>
              <Progress
                percent={syncStatus.pendingUpload === 0 ? 100 : Math.round((1 - syncStatus.pendingUpload / Math.max(syncStatus.pendingUpload, 1)) * 100)}
                showInfo={false}
                strokeColor={syncStatus.pendingUpload === 0 ? '#52c41a' : '#1890ff'}
                status={syncStatus.pendingUpload === 0 ? 'success' : 'active'}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {(uploadProgress.visible || downloadProgress.visible) && (
        <Card style={{ marginBottom: 16 }} bodyStyle={{ padding: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            {uploadProgress.visible && (
              <>
                <div style={{ fontWeight: 500, color: '#1890ff' }}>🔼 上传进度 {uploadProgress.percent}%</div>
                <Progress percent={uploadProgress.percent} status={loading.upload ? 'active' : 'success'} strokeColor="#1890ff" />
                <div style={{ maxHeight: 100, overflow: 'auto', background: '#fafafa', padding: 8, borderRadius: 4, fontSize: 12, fontFamily: 'monospace' }}>
                  {uploadProgress.log.map((l, i) => <div key={i} style={{ color: '#595959' }}>{l}</div>)}
                </div>
              </>
            )}
            {downloadProgress.visible && (
              <>
                <div style={{ fontWeight: 500, color: '#52c41a' }}>🔽 下载进度 {downloadProgress.percent}%</div>
                <Progress percent={downloadProgress.percent} status={loading.download ? 'active' : 'success'} strokeColor="#52c41a" />
                <div style={{ maxHeight: 100, overflow: 'auto', background: '#fafafa', padding: 8, borderRadius: 4, fontSize: 12, fontFamily: 'monospace' }}>
                  {downloadProgress.log.map((l, i) => <div key={i} style={{ color: '#595959' }}>{l}</div>)}
                </div>
              </>
            )}
          </Space>
        </Card>
      )}

      <Card
        title={
          <Space>
            <CloudUploadOutlined />
            <span>同步操作</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={[16, 16]} justify="center">
          <Col xs={12} sm={6}>
            <Tooltip title={!online ? '当前离线，无法上传' : '将本地离线队列中的所有请求发送到服务器'}>
              <Button
                type="primary"
                size="large"
                icon={<CloudUploadOutlined />}
                onClick={handleUpload}
                loading={loading.upload}
                disabled={!online || loading.download || loading.incremental || loading.clear}
                style={{ width: '100%', height: 64, fontSize: 15, borderRadius: 8, boxShadow: '0 2px 8px rgba(24,144,255,0.25)' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2 }}>
                  <span style={{ fontSize: 20, marginBottom: 4 }}>🔼 上传</span>
                  <span style={{ fontSize: 11, opacity: 0.9, fontWeight: 'normal' }}>所有待同步数据</span>
                </div>
              </Button>
            </Tooltip>
          </Col>
          <Col xs={12} sm={6}>
            <Tooltip title={!online ? '当前离线，无法下载' : '首次同步时使用，全量拉取所有数据覆盖本地'}>
              <Button
                size="large"
                icon={<CloudDownloadOutlined />}
                onClick={handleDownload}
                loading={loading.download}
                disabled={!online || loading.upload || loading.incremental || loading.clear}
                style={{ width: '100%', height: 64, fontSize: 15, borderRadius: 8, borderColor: '#52c41a', color: '#52c41a' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2 }}>
                  <span style={{ fontSize: 20, marginBottom: 4 }}>🔽 全量下载</span>
                  <span style={{ fontSize: 11, opacity: 0.9, fontWeight: 'normal' }}>首次同步用</span>
                </div>
              </Button>
            </Tooltip>
          </Col>
          <Col xs={12} sm={6}>
            <Tooltip title={!online ? '当前离线，无法同步' : '先上传本地修改，再下载最新数据'}>
              <Button
                size="large"
                icon={<CloudSyncOutlined />}
                onClick={handleIncremental}
                loading={loading.incremental}
                disabled={!online || loading.upload || loading.download || loading.clear}
                style={{ width: '100%', height: 64, fontSize: 15, borderRadius: 8, borderColor: '#722ed1', color: '#722ed1' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2 }}>
                  <span style={{ fontSize: 20, marginBottom: 4 }}>⏫ 增量同步</span>
                  <span style={{ fontSize: 11, opacity: 0.9, fontWeight: 'normal' }}>上传+下载</span>
                </div>
              </Button>
            </Tooltip>
          </Col>
          <Col xs={12} sm={6}>
            <Tooltip title="清空本地所有缓存（含待上传队列），请先确认数据已同步">
              <Button
                size="large"
                danger
                icon={<DeleteOutlined />}
                onClick={handleClearCache}
                loading={loading.clear}
                disabled={loading.upload || loading.download || loading.incremental}
                style={{ width: '100%', height: 64, fontSize: 15, borderRadius: 8 }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2 }}>
                  <span style={{ fontSize: 20, marginBottom: 4 }}>🗑️ 清缓存</span>
                  <span style={{ fontSize: 11, opacity: 0.9, fontWeight: 'normal' }}>清空本地数据</span>
                </div>
              </Button>
            </Tooltip>
          </Col>
        </Row>
      </Card>

      <Card
        title={
          <Space>
            <ClockCircleOutlined />
            <span>同步日志</span>
            <Tag color="default">{logs.length} 条记录</Tag>
          </Space>
        }
        extra={
          <Button
            size="small"
            onClick={() => setLogs([])}
            disabled={logs.length === 0}
          >清空日志</Button>
        }
      >
        <Table
          columns={logColumns}
          dataSource={logs}
          rowKey="id"
          size="small"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: t => `共 ${t} 条`
          }}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无同步日志，执行一次同步操作后显示" /> }}
        />
      </Card>
    </div>
  )
}

export default SyncPage
