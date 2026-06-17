import { useState, useEffect } from 'react'
import {
  Row, Col, Select, Input, DatePicker, Table, Card,
  Tag, Space, Button, Empty
} from 'antd'
import {
  SearchOutlined, ReloadOutlined, FileTextOutlined,
  UserOutlined, ClockCircleOutlined
} from '@ant-design/icons'
import api from '../api'
import dayjs from 'dayjs'

const { Option } = Select
const { RangePicker } = DatePicker

const MODULE_OPTIONS = [
  { key: 'USER', label: '用户', color: '#1890ff' },
  { key: 'TRENCH', label: '探方', color: '#52c41a' },
  { key: 'ARTIFACT', label: '文物', color: '#722ed1' },
  { key: 'STRATIGRAPHY', label: '地层', color: '#fa8c16' },
  { key: 'SYNC', label: '同步', color: '#13c2c2' },
  { key: 'LOGIN', label: '登录', color: '#eb2f96' }
]

const OPERATION_TYPE_OPTIONS = [
  { key: 'CREATE', label: '新增', color: 'green' },
  { key: 'UPDATE', label: '更新', color: 'blue' },
  { key: 'DELETE', label: '删除', color: 'red' },
  { key: 'LOGIN', label: '登录', color: 'purple' },
  { key: 'LOGOUT', label: '登出', color: 'default' },
  { key: 'SYNC_UP', label: '上传同步', color: 'cyan' },
  { key: 'SYNC_DOWN', label: '下载同步', color: 'geekblue' }
]

const mockLogs = [
  {
    id: 1,
    userId: 1,
    username: 'admin',
    operationType: 'CREATE',
    moduleName: 'ARTIFACT',
    targetId: 3,
    targetName: '青花瓷片 (T0302-C001)',
    detail: '新增文物记录：3件青花瓷片，出土于扰土层',
    ipAddress: '192.168.1.100',
    deviceId: 'dev_20240615_abc123',
    createdAt: '2024-06-16 10:15:32'
  },
  {
    id: 2,
    userId: 1,
    username: 'admin',
    operationType: 'UPDATE',
    moduleName: 'TRENCH',
    targetId: 1,
    targetName: 'T0301',
    detail: '修改探方T0301：当前深度由0.750m更新为0.800m',
    ipAddress: '192.168.1.100',
    deviceId: 'dev_20240615_abc123',
    createdAt: '2024-06-15 16:45:20'
  },
  {
    id: 3,
    userId: 1,
    username: 'admin',
    operationType: 'CREATE',
    moduleName: 'STRATIGRAPHY',
    targetId: 1,
    targetName: 'T0301-N-080',
    detail: '新增地层剖面：T0301北壁，深度0.800m，共4层',
    ipAddress: '192.168.1.100',
    deviceId: 'dev_20240615_abc123',
    createdAt: '2024-06-15 15:30:10'
  },
  {
    id: 4,
    userId: 1,
    username: 'admin',
    operationType: 'LOGIN',
    moduleName: 'LOGIN',
    targetId: null,
    targetName: '登录系统',
    detail: '用户admin登录成功',
    ipAddress: '192.168.1.100',
    deviceId: 'dev_20240615_abc123',
    createdAt: '2024-06-15 09:00:00'
  },
  {
    id: 5,
    userId: 1,
    username: 'admin',
    operationType: 'CREATE',
    moduleName: 'ARTIFACT',
    targetId: 2,
    targetName: '磨制石斧 (T0301-S001)',
    detail: '新增石器记录：磨制石斧，青石质',
    ipAddress: '192.168.1.100',
    deviceId: 'dev_20240615_abc123',
    createdAt: '2024-06-15 14:20:00'
  },
  {
    id: 6,
    userId: 1,
    username: 'admin',
    operationType: 'SYNC_UP',
    moduleName: 'SYNC',
    targetId: null,
    targetName: '数据上传',
    detail: '批量上传同步：成功12条，失败0条',
    ipAddress: '192.168.1.100',
    deviceId: 'dev_20240615_abc123',
    createdAt: '2024-06-14 18:30:00'
  },
  {
    id: 7,
    userId: 1,
    username: 'admin',
    operationType: 'CREATE',
    moduleName: 'TRENCH',
    targetId: 3,
    targetName: 'T0401',
    detail: '新增探方T0401（第4行第1列），5m×5m',
    ipAddress: '192.168.1.100',
    deviceId: 'dev_20240615_abc123',
    createdAt: '2024-06-14 10:00:00'
  }
]

const LogsPage = () => {
  const [data, setData] = useState(mockLogs)
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: mockLogs.length })
  const [searchParams, setSearchParams] = useState({
    moduleName: null,
    operationType: null,
    username: '',
    dateRange: null
  })

  const fetchLogs = async (page = 1, pageSize = 20) => {
    setLoading(true)
    try {
      setData(mockLogs)
      setPagination({ current: page, pageSize, total: mockLogs.length })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs(1, 20)
  }, [])

  const handleSearch = () => {
    fetchLogs(1, pagination.pageSize)
  }

  const handleReset = () => {
    setSearchParams({
      moduleName: null,
      operationType: null,
      username: '',
      dateRange: null
    })
    fetchLogs(1, pagination.pageSize)
  }

  const getModuleInfo = (key) => MODULE_OPTIONS.find(m => m.key === key) || { label: key, color: '#888' }
  const getOperationInfo = (key) => OPERATION_TYPE_OPTIONS.find(o => o.key === key) || { label: key, color: 'default' }

  const columns = [
    {
      title: '时间', dataIndex: 'createdAt', key: 'createdAt', width: 170,
      render: v => (
        <Space size={4}>
          <ClockCircleOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
          <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{v}</span>
        </Space>
      ),
      defaultSortOrder: 'descend',
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    },
    {
      title: '模块', dataIndex: 'moduleName', key: 'moduleName', width: 100,
      render: v => {
        const info = getModuleInfo(v)
        return <Tag color={info.color}>{info.label}</Tag>
      }
    },
    {
      title: '操作类型', dataIndex: 'operationType', key: 'operationType', width: 100,
      render: v => {
        const info = getOperationInfo(v)
        return <Tag color={info.color}>{info.label}</Tag>
      }
    },
    {
      title: '操作对象', dataIndex: 'targetName', key: 'targetName', width: 200, ellipsis: true
    },
    {
      title: '操作详情', dataIndex: 'detail', key: 'detail', ellipsis: true
    },
    {
      title: '操作用户', dataIndex: 'username', key: 'username', width: 100,
      render: (v, record) => (
        <Space size={4}>
          <UserOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
          <span>{v || record.userId}</span>
        </Space>
      )
    },
    {
      title: 'IP地址', dataIndex: 'ipAddress', key: 'ipAddress', width: 130,
      render: v => v ? <code style={{ fontSize: 12, color: '#595959' }}>{v}</code> : '-'
    },
    {
      title: '设备', dataIndex: 'deviceId', key: 'deviceId', width: 150,
      render: v => v ? <span style={{ fontSize: 12, color: '#8c8c8c' }}>{v}</span> : '-'
    }
  ]

  return (
    <div style={{ padding: 16 }}>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="模块"
              style={{ width: '100%' }}
              allowClear
              value={searchParams.moduleName}
              onChange={v => setSearchParams({ ...searchParams, moduleName: v })}
            >
              {MODULE_OPTIONS.map(m => (
                <Option key={m.key} value={m.key}>{m.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="操作类型"
              style={{ width: '100%' }}
              allowClear
              value={searchParams.operationType}
              onChange={v => setSearchParams({ ...searchParams, operationType: v })}
            >
              {OPERATION_TYPE_OPTIONS.map(o => (
                <Option key={o.key} value={o.key}>{o.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Input
              placeholder="用户名"
              prefix={<UserOutlined />}
              allowClear
              value={searchParams.username}
              onChange={e => setSearchParams({ ...searchParams, username: e.target.value })}
            />
          </Col>
          <Col xs={24} sm={12} md={7}>
            <RangePicker
              style={{ width: '100%' }}
              value={searchParams.dateRange}
              onChange={v => setSearchParams({ ...searchParams, dateRange: v })}
              showTime
            />
          </Col>
          <Col xs={24} md={4} style={{ textAlign: 'right' }}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>操作日志</span>
            <Tag color="blue">{pagination.total} 条记录</Tag>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: t => `共 ${t} 条日志`,
            onChange: (page, pageSize) => fetchLogs(page, pageSize)
          }}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无操作日志" /> }}
        />
      </Card>
    </div>
  )
}

export default LogsPage
