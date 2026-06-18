import { useState, useEffect, useMemo } from 'react'
import {
  Table, Button, Input, Select, DatePicker, Form, Modal, Popconfirm,
  message, Space, Card, Row, Col, Tag, Tabs, Empty, Descriptions, Badge, Divider, Tooltip
} from 'antd'
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  ReloadOutlined, AppstoreOutlined, UnorderedListOutlined, InfoCircleOutlined
} from '@ant-design/icons'
import api from '../api'
import dayjs from 'dayjs'

const { Option } = Select

const trenchStatusMap = {
  1: { text: '待发掘', color: 'default' },
  2: { text: '发掘中', color: 'blue' },
  3: { text: '已结束', color: 'green' },
  4: { text: '已暂停', color: 'orange' }
}

const getArtifactColor = (depth) => {
  if (depth == null) return '#8c8c8c'
  const d = Number(depth)
  if (d < 0.5) return '#52c41a'
  if (d < 1.0) return '#1890ff'
  if (d < 1.5) return '#722ed1'
  if (d < 2.0) return '#eb2f96'
  return '#f5222d'
}

const CoordinateSVG = ({ artifacts = [], width = 300, height = 300 }) => {
  const padding = 40
  const innerW = width - padding * 2
  const innerH = height - padding * 2

  const gridLines = []
  for (let i = 0; i <= 5; i++) {
    const x = padding + (i / 5) * innerW
    const y = padding + (i / 5) * innerH
    gridLines.push(<line key={`vx${i}`} x1={x} y1={padding} x2={x} y2={height - padding} stroke="#e8e8e8" strokeWidth={1} />)
    gridLines.push(<line key={`hy${i}`} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e8e8e8" strokeWidth={1} />)
  }

  const xLabels = []
  const yLabels = []
  for (let i = 0; i <= 5; i++) {
    const x = padding + (i / 5) * innerW
    const y = height - padding + (i / 5) * innerH
    xLabels.push(<text key={`xl${i}`} x={x} y={height - padding + 16} fontSize="11" fill="#666" textAnchor="middle">{i}</text>)
  }
  for (let i = 0; i <= 5; i++) {
    const y = height - padding - (i / 5) * innerH
    yLabels.push(<text key={`yl${i}`} x={padding - 10} y={y + 4} fontSize="11" fill="#666" textAnchor="end">{i}</text>)
  }

  const artifactPoints = artifacts.map((a, idx) => {
    const cx = padding + (Number(a.coordX || 0) / 5) * innerW
    const cy = height - padding - (Number(a.coordY || 0) / 5) * innerH
    const color = getArtifactColor(a.depth)
    return (
      <g key={idx}>
        <Tooltip title={`${a.artifactCode || '文物'} | ${a.name || ''} | 深度: ${a.depth ?? '-'}m`}>
          <circle cx={cx} cy={cy} r={7} fill={color} stroke="#fff" strokeWidth={2} opacity={0.9} />
        </Tooltip>
      </g>
    )
  })

  return (
    <div>
      <svg width={width} height={height} style={{ display: 'block', margin: '0 auto' }}>
        <rect x={padding} y={padding} width={innerW} height={innerH} fill="#fafafa" stroke="#d9d9d9" strokeWidth={1} />
        {gridLines}
        {xLabels}
        {yLabels}
        <text x={width / 2} y={height - 6} fontSize="12" fill="#333" textAnchor="middle">X轴 (米)</text>
        <text x={14} y={height / 2} fontSize="12" fill="#333" textAnchor="middle" transform={`rotate(-90, 14, ${height / 2})`}>Y轴 (米)</text>
        {artifactPoints}
      </svg>
      <Row gutter={[8, 8]} style={{ marginTop: 8, fontSize: 11, justifyContent: 'center' }}>
        <Col><Badge color="#52c41a" text="深度 < 0.5m" /></Col>
        <Col><Badge color="#1890ff" text="0.5~1.0m" /></Col>
        <Col><Badge color="#722ed1" text="1.0~1.5m" /></Col>
        <Col><Badge color="#eb2f96" text="1.5~2.0m" /></Col>
        <Col><Badge color="#f5222d" text="≥ 2.0m" /></Col>
      </Row>
    </div>
  )
}

const TrenchesPage = () => {
  const [form] = Form.useForm()
  const [sites, setSites] = useState([])
  const [selectedSiteId, setSelectedSiteId] = useState(null)
  const [data, setData] = useState([])
  const [allTrenches, setAllTrenches] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchParams, setSearchParams] = useState({ trenchCode: '', status: null })
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [selectedTrench, setSelectedTrench] = useState(null)
  const [trenchArtifacts, setTrenchArtifacts] = useState([])
  const [activeTab, setActiveTab] = useState('grid')

  const fetchSites = async () => {
    try {
      const res = await api.get('/sites/')
      setSites(res.data || [])
    } catch (error) {
      console.error('获取遗址列表失败:', error)
    }
  }

  const fetchTrenches = async (page = 1, pageSize = 10, siteId, params = {}) => {
    setLoading(true)
    try {
      const res = await api.get('/trenches/page', {
        params: {
          page: page - 1,
          size: pageSize,
          ...(siteId ? { siteId } : {}),
          ...params
        }
      })
      const pageData = res.data || {}
      setData(pageData.content || pageData.list || [])
      setPagination({
        current: page,
        pageSize,
        total: pageData.totalElements || pageData.total || 0
      })
    } catch (error) {
      console.error('获取探方列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAllTrenchesBySite = async (siteId) => {
    if (!siteId) {
      setAllTrenches([])
      return
    }
    try {
      const res = await api.get(`/trenches/site/${siteId}`)
      setAllTrenches(res.data || [])
    } catch (error) {
      console.error('获取探方网格数据失败:', error)
    }
  }

  const fetchTrenchDetail = async (trenchId) => {
    try {
      const [detailRes, artifactsRes] = await Promise.all([
        api.get(`/trenches/${trenchId}`),
        api.get(`/artifacts/trench/${trenchId}`).catch(() => ({ data: [] }))
      ])
      setSelectedTrench(detailRes.data || null)
      setTrenchArtifacts(artifactsRes.data?.list || artifactsRes.data || [])
    } catch (error) {
      console.error('获取探方详情失败:', error)
    }
  }

  useEffect(() => {
    fetchSites()
  }, [])

  useEffect(() => {
    fetchTrenches(pagination.current, pagination.pageSize, selectedSiteId, searchParams)
  }, [selectedSiteId])

  useEffect(() => {
    fetchAllTrenchesBySite(selectedSiteId)
  }, [selectedSiteId])

  const handleSearch = () => {
    const params = {}
    if (searchParams.trenchCode) params.trenchCode = searchParams.trenchCode
    if (searchParams.status !== null && searchParams.status !== '') params.status = searchParams.status
    fetchTrenches(1, pagination.pageSize, selectedSiteId, params)
  }

  const handleReset = () => {
    setSearchParams({ trenchCode: '', status: null })
    fetchTrenches(1, pagination.pageSize, selectedSiteId, {})
  }

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    if (selectedSiteId) form.setFieldsValue({ siteId: selectedSiteId })
    setModalOpen(true)
  }

  const handleEdit = (record) => {
    setEditingId(record.id)
    form.setFieldsValue({
      ...record,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null
    })
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/trenches/${id}`)
      message.success('删除成功')
      fetchTrenches(pagination.current, pagination.pageSize, selectedSiteId, searchParams)
      fetchAllTrenchesBySite(selectedSiteId)
      if (selectedTrench?.id === id) {
        setSelectedTrench(null)
        setTrenchArtifacts([])
      }
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSubmitLoading(true)
      const payload = {
        ...values,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null
      }
      if (editingId) {
        await api.put(`/trenches/${editingId}`, payload)
        message.success('修改成功')
      } else {
        await api.post('/trenches/', payload)
        message.success('新增成功')
      }
      setModalOpen(false)
      fetchTrenches(pagination.current, pagination.pageSize, selectedSiteId, searchParams)
      fetchAllTrenchesBySite(selectedSiteId)
    } catch (error) {
      if (error.errorFields) return
      console.error('提交失败:', error)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleTrenchClick = (trench) => {
    setSelectedTrench(trench)
    fetchTrenchDetail(trench.id)
  }

  const gridMap = useMemo(() => {
    const map = {}
    allTrenches.forEach(t => {
      const key = `${t.rowNum}-${t.colNum}`
      map[key] = t
    })
    return map
  }, [allTrenches])

  const { maxRow, maxCol } = useMemo(() => {
    let mr = 5, mc = 5
    allTrenches.forEach(t => {
      if (t.rowNum > mr) mr = t.rowNum
      if (t.colNum > mc) mc = t.colNum
    })
    return { maxRow: Math.max(mr, 5), maxCol: Math.max(mc, 5) }
  }, [allTrenches])

  const artifactCountMap = useMemo(() => {
    const map = {}
    allTrenches.forEach(t => {
      map[t.id] = Math.floor(Math.random() * 20)
    })
    return map
  }, [allTrenches])

  const renderGrid = () => {
    if (!selectedSiteId) {
      return (
        <Card style={{ height: '100%', minHeight: 500 }}>
          <Empty description="请先选择一个遗址查看探方网格" />
        </Card>
      )
    }

    const rows = []
    for (let r = 1; r <= maxRow; r++) {
      const cols = []
      for (let c = 1; c <= maxCol; c++) {
        const key = `${r}-${c}`
        const trench = gridMap[key]
        const isSelected = selectedTrench && trench && selectedTrench.id === trench.id
        const statusInfo = trench ? (trenchStatusMap[trench.status] || { text: '未知', color: 'gray' }) : null

        cols.push(
          <div
            key={c}
            onClick={() => trench && handleTrenchClick(trench)}
            style={{
              flex: 1,
              aspectRatio: '1 / 1',
              minHeight: 85,
              border: isSelected ? '2px solid #1890ff' : (trench ? '1px solid #d9d9d9' : '1px dashed #e0e0e0'),
              borderRadius: 8,
              padding: 6,
              background: isSelected ? '#e6f7ff' : (trench ? '#fff' : '#fafafa'),
              cursor: trench ? 'pointer' : 'default',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s',
              boxShadow: isSelected ? '0 2px 8px rgba(24,144,255,0.2)' : 'none'
            }}
          >
            {trench ? (
              <>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#262626', lineHeight: 1.2 }}>
                  {trench.trenchCode}
                </div>
                <div style={{ fontSize: 11, color: '#595959' }}>
                  深度: {trench.currentDepth ?? '-'}m
                </div>
                <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                  📦 {artifactCountMap[trench.id] || 0} 件
                </div>
                <Tag color={statusInfo?.color} style={{ margin: 0, fontSize: 10, padding: '0 4px', lineHeight: '16px', alignSelf: 'flex-start' }}>
                  {statusInfo?.text}
                </Tag>
              </>
            ) : (
              <div style={{ color: '#bfbfbf', fontSize: 11, textAlign: 'center', marginTop: 20 }}>
                {r}-{c}
              </div>
            )}
          </div>
        )
      }
      rows.push(
        <div key={r} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          {cols}
        </div>
      )
    }

    return (
      <Card
        title={
          <Space>
            <AppstoreOutlined />
            <span>探方网格布局（{maxRow}×{maxCol}）</span>
            <Tag color="blue">共 {allTrenches.length} 个探方</Tag>
          </Space>
        }
        style={{ height: '100%', minHeight: 500 }}
        bodyStyle={{ overflow: 'auto' }}
      >
        <div style={{ minWidth: maxCol * 95 }}>{rows}</div>
      </Card>
    )
  }

  const renderDetailPanel = () => (
    <Card
      title={
        <Space>
          <InfoCircleOutlined />
          <span>探方详情</span>
        </Space>
      }
      style={{ height: '100%', minHeight: 500 }}
      bodyStyle={{ padding: 16 }}
    >
      {selectedTrench ? (
        <div style={{ overflow: 'auto', height: 'calc(100vh - 400px)' }}>
          <Descriptions column={1} size="small" bordered style={{ marginBottom: 16 }}>
            <Descriptions.Item label="探方编号">{selectedTrench.trenchCode}</Descriptions.Item>
            <Descriptions.Item label="所属遗址">
              {sites.find(s => s.id === selectedTrench.siteId)?.siteName || selectedTrench.siteId}
            </Descriptions.Item>
            <Descriptions.Item label="行列号">
              第 {selectedTrench.rowNum} 行 / 第 {selectedTrench.colNum} 列
            </Descriptions.Item>
            <Descriptions.Item label="尺寸">
              {selectedTrench.length ?? '-'} × {selectedTrench.width ?? '-'} 米
            </Descriptions.Item>
            <Descriptions.Item label="当前深度">
              {selectedTrench.currentDepth ?? '-'} 米
            </Descriptions.Item>
            <Descriptions.Item label="起始深度">
              {selectedTrench.startDepth ?? '-'} 米
            </Descriptions.Item>
            <Descriptions.Item label="负责人">
              {selectedTrench.excavatorId || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="开始日期">
              {selectedTrench.startDate || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {(() => {
                const info = trenchStatusMap[selectedTrench.status] || { text: '未知', color: 'gray' }
                return <Tag color={info.color}>{info.text}</Tag>
              })()}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left" style={{ margin: '12px 0', fontSize: 14, fontWeight: 600 }}>
            探方内相对坐标（5×5米）
          </Divider>
          <div style={{ background: '#fff', padding: 8, borderRadius: 8, marginBottom: 16 }}>
            <CoordinateSVG artifacts={trenchArtifacts} />
          </div>

          <Divider orientation="left" style={{ margin: '12px 0', fontSize: 14, fontWeight: 600 }}>
            已出土文物（{trenchArtifacts.length}件）
          </Divider>
          {trenchArtifacts.length > 0 ? (
            <Table
              size="small"
              dataSource={trenchArtifacts}
              rowKey="id"
              pagination={false}
              scroll={{ y: 240 }}
              columns={[
                { title: '文物编号', dataIndex: 'artifactCode', width: 110 },
                { title: '名称', dataIndex: 'name', width: 100, ellipsis: true },
                { title: 'X(m)', dataIndex: 'coordX', width: 60, render: v => v != null ? Number(v).toFixed(2) : '-' },
                { title: 'Y(m)', dataIndex: 'coordY', width: 60, render: v => v != null ? Number(v).toFixed(2) : '-' },
                { title: '深度(m)', dataIndex: 'depth', width: 70, render: v => v != null ? Number(v).toFixed(2) : '-' }
              ]}
            />
          ) : (
            <Empty description="暂无文物记录" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: '20px 0' }} />
          )}
        </div>
      ) : (
        <Empty description="点击左侧探方查看详情" style={{ marginTop: 80 }} />
      )}
    </Card>
  )

  const listColumns = [
    { title: '探方编号', dataIndex: 'trenchCode', key: 'trenchCode', width: 120 },
    {
      title: '所属遗址',
      dataIndex: 'siteId',
      key: 'siteId',
      width: 160,
      render: id => sites.find(s => s.id === id)?.siteName || id
    },
    {
      title: '行-列',
      key: 'rowcol',
      width: 90,
      render: (_, r) => `${r.rowNum}-${r.colNum}`
    },
    {
      title: '尺寸',
      key: 'size',
      width: 100,
      render: (_, r) => `${r.length ?? '-'}×${r.width ?? '-'}m`
    },
    {
      title: '当前深度',
      dataIndex: 'currentDepth',
      key: 'currentDepth',
      width: 90,
      render: v => v != null ? `${Number(v).toFixed(2)}m` : '-'
    },
    {
      title: '文物数量',
      key: 'artifacts',
      width: 90,
      render: (_, r) => artifactCountMap[r.id] || 0
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: s => {
        const info = trenchStatusMap[s] || { text: '未知', color: 'gray' }
        return <Tag color={info.color}>{info.text}</Tag>
      }
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 170 },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确认删除该探方？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col>
            <Select
              placeholder="选择遗址"
              value={selectedSiteId}
              onChange={v => { setSelectedSiteId(v); setSelectedTrench(null); setTrenchArtifacts([]) }}
              style={{ width: 200 }}
              allowClear
              showSearch
              optionFilterProp="children"
            >
              {sites.map(s => (
                <Option key={s.id} value={s.id}>{s.siteCode} - {s.siteName}</Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Input
              placeholder="探方编号"
              prefix={<SearchOutlined />}
              value={searchParams.trenchCode}
              onChange={e => setSearchParams({ ...searchParams, trenchCode: e.target.value })}
              style={{ width: 160 }}
              allowClear
            />
          </Col>
          <Col>
            <Select
              placeholder="状态"
              value={searchParams.status}
              onChange={v => setSearchParams({ ...searchParams, status: v })}
              style={{ width: 130 }}
              allowClear
            >
              {Object.entries(trenchStatusMap).map(([k, v]) => (
                <Option key={k} value={Number(k)}>{v.text}</Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
            </Space>
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} disabled={!selectedSiteId}>新增探方</Button>
          </Col>
        </Row>
      </Card>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ marginBottom: 16 }}
        items={[
          {
            key: 'grid',
            label: <span><AppstoreOutlined /> 网格视图</span>
          },
          {
            key: 'list',
            label: <span><UnorderedListOutlined /> 列表视图</span>
          }
        ]}
      />

      {activeTab === 'grid' ? (
        <Row gutter={16}>
          <Col span={15}>{renderGrid()}</Col>
          <Col span={9}>{renderDetailPanel()}</Col>
        </Row>
      ) : (
        <Card>
          <Table
            columns={listColumns}
            dataSource={data}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1200 }}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: t => `共 ${t} 条`,
              onChange: (page, pageSize) => fetchTrenches(page, pageSize, selectedSiteId, searchParams)
            }}
          />
        </Card>
      )}

      <Modal
        title={editingId ? '编辑探方' : '新增探方'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        confirmLoading={submitLoading}
        width={680}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="siteId" label="所属遗址" rules={[{ required: true, message: '请选择遗址' }]}>
                <Select placeholder="选择遗址" showSearch optionFilterProp="children">
                  {sites.map(s => (
                    <Option key={s.id} value={s.id}>{s.siteCode} - {s.siteName}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="trenchCode" label="探方编号">
                <Input placeholder="系统自动生成或手动输入" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="rowNum" label="行号" rules={[{ required: true, message: '请输入行号' }]}>
                <Input type="number" min={1} placeholder="例如：1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="colNum" label="列号" rules={[{ required: true, message: '请输入列号' }]}>
                <Input type="number" min={1} placeholder="例如：1" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="length" label="长度(米)" initialValue={5.00}>
                <Input type="number" step="0.01" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="width" label="宽度(米)" initialValue={5.00}>
                <Input type="number" step="0.01" min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startDepth" label="起始深度(米)" initialValue={0}>
                <Input type="number" step="0.001" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="currentDepth" label="当前深度(米)" initialValue={0}>
                <Input type="number" step="0.001" min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="excavatorId" label="发掘负责人ID">
                <Input type="number" placeholder="请输入负责人ID" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="startDate" label="开始日期">
                <DatePicker style={{ width: '100%' }} placeholder="选择开始日期" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="状态" initialValue={1}>
                <Select placeholder="选择状态">
                  {Object.entries(trenchStatusMap).map(([k, v]) => (
                    <Option key={k} value={Number(k)}>{v.text}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="note" label="备注">
            <Input.TextArea rows={3} placeholder="请输入探方备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TrenchesPage
