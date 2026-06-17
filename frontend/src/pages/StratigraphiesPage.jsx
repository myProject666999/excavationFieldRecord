import { useState, useEffect } from 'react'
import {
  Row, Col, Select, Input, Button, Table, Modal, Form,
  InputNumber, DatePicker, Card, Drawer, Tabs, Descriptions,
  Tag, Space, message, Tooltip, Popconfirm, Divider, Empty,
  List, Collapse
} from 'antd'
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, ProfileOutlined, FundOutlined,
  EnvironmentOutlined, CameraOutlined, InfoCircleOutlined
} from '@ant-design/icons'
import api from '../api'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs
const { Panel } = Collapse

const WALL_DIRECTIONS = [
  { key: 'NORTH', label: '北壁', short: 'N', color: '#1890ff' },
  { key: 'SOUTH', label: '南壁', short: 'S', color: '#52c41a' },
  { key: 'EAST', label: '东壁', short: 'E', color: '#fa8c16' },
  { key: 'WEST', label: '西壁', short: 'W', color: '#722ed1' }
]

const SOIL_COLOR_MAP = {
  '浅黄褐色': '#E8D5A8',
  '黄褐色': '#C9A96E',
  '灰褐色': '#8B7355',
  '深灰褐色': '#5C4A3D',
  '灰色': '#9E9E9E',
  '黑褐色': '#3E2723',
  '红色': '#B71C1C',
  '浅黄色': '#FFF9C4',
  '黑灰色': '#37474F',
  '棕褐色': '#795548'
}

const SOIL_TEXTURE_OPTIONS = ['疏松', '较疏松', '较致密', '致密', '粘土质', '沙质', '粉砂质', '壤质']
const SOIL_STRUCTURE_OPTIONS = ['团粒状', '块状', '柱状', '片状', '棱柱状', '碎块状']

const mockSites = [
  { id: 1, siteCode: 'YZ-2024-001', siteName: '李家村遗址' }
]

const mockTrenches = [
  { id: 1, trenchCode: 'T0301', siteId: 1, currentDepth: 0.800 },
  { id: 2, trenchCode: 'T0302', siteId: 1, currentDepth: 0.650 },
  { id: 3, trenchCode: 'T0401', siteId: 1, currentDepth: 0.400 }
]

const mockStratigraphies = [
  {
    id: 1,
    stratigraphyCode: 'T0301-N-080',
    trenchId: 1,
    siteId: 1,
    wallDirection: 'NORTH',
    recordDepth: 0.800,
    drawDate: '2024-06-15',
    drafterId: 1,
    description: 'T0301北壁剖面，地层堆积清晰，共分4层，未见打破关系。',
    status: 1,
    layers: [
      { id: 1, layerNumber: '①耕土层', topDepth: 0.000, bottomDepth: 0.150, thickness: 0.150, soilColor: '浅黄褐色', soilTexture: '疏松', soilStructure: '团粒状', inclusions: '现代垃圾残片、少量近现代瓷片', artifactCount: 0, layerNote: '现代耕土层，含大量植物根系', sortOrder: 1 },
      { id: 2, layerNumber: '②扰土层', topDepth: 0.150, bottomDepth: 0.350, thickness: 0.200, soilColor: '黄褐色', soilTexture: '较疏松', soilStructure: '碎块状', inclusions: '近现代瓷片、砖瓦碎块、铁钉', artifactCount: 1, layerNote: '明清以来扰土层，文化内涵混杂', sortOrder: 2 },
      { id: 3, layerNumber: '③A层', topDepth: 0.350, bottomDepth: 0.580, thickness: 0.230, soilColor: '灰褐色', soilTexture: '较致密', soilStructure: '团粒状', inclusions: '少量泥质陶片、红烧土颗粒', artifactCount: 1, layerNote: '龙山文化时期堆积，陶片以红陶为主', sortOrder: 3 },
      { id: 4, layerNumber: '③B层', topDepth: 0.580, bottomDepth: 0.800, thickness: 0.220, soilColor: '深灰褐色', soilTexture: '致密', soilStructure: '块状', inclusions: '较多夹砂陶片、炭粒、兽骨残片、石器', artifactCount: 1, layerNote: '龙山文化晚期，文化内涵丰富，出土遗物较多', sortOrder: 4 }
    ]
  }
]

const StratigraphySVG = ({ stratigraphy, width = 800, height = 500 }) => {
  if (!stratigraphy?.layers?.length) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height, background: '#fafafa', border: '1px solid #e8e8e8', borderRadius: 8 }}>
        <Empty description="暂无地层数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    )
  }

  const PADDING = { top: 50, right: 160, bottom: 40, left: 80 }
  const innerW = width - PADDING.left - PADDING.right
  const innerH = height - PADDING.top - PADDING.bottom
  const layers = [...stratigraphy.layers].sort((a, b) => a.sortOrder - b.sortOrder)

  const maxDepth = Math.max(...layers.map(l => Number(l.bottomDepth)), 0.5)
  const scaleY = innerH / maxDepth

  const layerPolygons = layers.map((layer, idx) => {
    const yTop = PADDING.top + Number(layer.topDepth) * scaleY
    const yBottom = PADDING.top + Number(layer.bottomDepth) * scaleY
    const layerH = yBottom - yTop
    const fillColor = SOIL_COLOR_MAP[layer.soilColor] || '#BDBDBD'

    return {
      ...layer,
      yTop,
      yBottom,
      layerH,
      fillColor
    }
  })

  const depthTicks = []
  const tickStep = maxDepth <= 1 ? 0.2 : 0.5
  for (let d = 0; d <= maxDepth + tickStep; d += tickStep) {
    const y = PADDING.top + d * scaleY
    if (y <= PADDING.top + innerH) {
      depthTicks.push({ depth: d.toFixed(2), y })
    }
  }

  return (
    <div style={{ overflow: 'auto' }}>
      <svg width={width} height={height} style={{ background: '#fff', display: 'block', margin: '0 auto' }}>
        <defs>
          <pattern id="texture-loose" patternUnits="userSpaceOnUse" width="8" height="8">
            <circle cx="2" cy="2" r="1" fill="rgba(0,0,0,0.08)" />
            <circle cx="6" cy="6" r="0.8" fill="rgba(0,0,0,0.05)" />
          </pattern>
          <pattern id="texture-dense" patternUnits="userSpaceOnUse" width="6" height="6">
            <circle cx="1" cy="1" r="0.8" fill="rgba(0,0,0,0.1)" />
            <circle cx="4" cy="4" r="0.6" fill="rgba(0,0,0,0.08)" />
          </pattern>
        </defs>

        <text x={width / 2} y={24} fontSize="16" fontWeight="bold" fill="#262626" textAnchor="middle">
          {stratigraphy.stratigraphyCode} 地层剖面图
          （{WALL_DIRECTIONS.find(w => w.key === stratigraphy.wallDirection)?.label}，深{stratigraphy.recordDepth}m）
        </text>

        {depthTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={PADDING.left - 5} y1={t.y}
              x2={PADDING.left} y2={t.y}
              stroke="#333" strokeWidth="1"
            />
            <text
              x={PADDING.left - 10} y={t.y + 4}
              fontSize="11" fill="#555" textAnchor="end"
              fontFamily="monospace"
            >
              {t.depth}m
            </text>
            <line
              x1={PADDING.left} y1={t.y}
              x2={PADDING.left + innerW} y2={t.y}
              stroke="#eee" strokeWidth="0.5" strokeDasharray="3,3"
            />
          </g>
        ))}

        {layerPolygons.map((layer, idx) => {
          const pattern = layer.soilTexture?.includes('致密') ? 'url(#texture-dense)' : 'url(#texture-loose)'
          return (
            <g key={idx}>
              <rect
                x={PADDING.left}
                y={layer.yTop}
                width={innerW}
                height={layer.layerH}
                fill={layer.fillColor}
                stroke="#666"
                strokeWidth="1"
              />
              <rect
                x={PADDING.left}
                y={layer.yTop}
                width={innerW}
                height={layer.layerH}
                fill={pattern}
              />

              <line
                x1={PADDING.left - 10} y1={layer.yBottom}
                x2={PADDING.left + innerW + 10} y2={layer.yBottom}
                stroke="#333" strokeWidth="1.2"
              />

              <g>
                <text
                  x={PADDING.left + 10}
                  y={layer.yTop + layer.layerH / 2 + 5}
                  fontSize="15"
                  fontWeight="bold"
                  fill="#fff"
                  style={{ paintOrder: 'stroke', stroke: '#333', strokeWidth: '2px' }}
                >
                  {layer.layerNumber}
                </text>
                <text
                  x={PADDING.left + 10}
                  y={layer.yTop + layer.layerH / 2 + 5}
                  fontSize="15"
                  fontWeight="bold"
                  fill="#fff"
                >
                  {layer.layerNumber}
                </text>
              </g>
            </g>
          )
        })}

        <g>
          {layerPolygons.map((layer, idx) => {
            const labelX = PADDING.left + innerW + 20
            const labelY = layer.yTop + 8
            return (
              <g key={idx}>
                <text x={labelX} y={labelY} fontSize="12" fontWeight="600" fill="#262626">
                  {layer.layerNumber}（{layer.thickness.toFixed(3)}m）
                </text>
                <text x={labelX} y={labelY + 16} fontSize="11" fill="#595959">
                  土色：{layer.soilColor}
                </text>
                <text x={labelX} y={labelY + 30} fontSize="11" fill="#595959">
                  土质：{layer.soilTexture}
                </text>
                {layer.soilStructure && (
                  <text x={labelX} y={labelY + 44} fontSize="11" fill="#595959">
                    结构：{layer.soilStructure}
                  </text>
                )}
                {layer.artifactCount > 0 && (
                  <Tag color="blue" style={{ position: 'absolute' }}>
                    出文物{layer.artifactCount}件
                  </Tag>
                )}
              </g>
            )
          })}
        </g>

        <text
          x={PADDING.left + innerW / 2}
          y={height - 10}
          fontSize="12"
          fill="#888"
          textAnchor="middle"
        >
          ← 西 &nbsp;&nbsp; 探方 {stratigraphy.trenchCode || ''} 剖面方向 &nbsp;&nbsp; 东 →
        </text>
      </svg>
    </div>
  )
}

const StratigraphiesPage = () => {
  const [form] = Form.useForm()
  const [layerForm] = Form.useForm()
  const [sites, setSites] = useState(mockSites)
  const [trenches, setTrenches] = useState(mockTrenches)
  const [filteredTrenches, setFilteredTrenches] = useState([])
  const [data, setData] = useState(mockStratigraphies)
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 1 })
  const [selectedSiteId, setSelectedSiteId] = useState(null)
  const [selectedTrenchId, setSelectedTrenchId] = useState(null)
  const [wallFilter, setWallFilter] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [detailItem, setDetailItem] = useState(null)
  const [layers, setLayers] = useState([])
  const [layerModalVisible, setLayerModalVisible] = useState(false)
  const [editingLayer, setEditingLayer] = useState(null)
  const [activeTab, setActiveTab] = useState('list')

  const fetchSites = async () => {
    try {
      const res = await api.get('/sites/')
      if (res?.data) setSites(res.data)
    } catch (e) { /* use mock */ }
  }

  const fetchTrenches = async () => {
    try {
      const res = await api.get('/trenches/')
      if (res?.data) setTrenches(res.data)
    } catch (e) { /* use mock */ }
  }

  const fetchStratigraphies = async (page = 1) => {
    setLoading(true)
    try {
      setData(mockStratigraphies)
      setPagination({ current: 1, pageSize: 10, total: mockStratigraphies.length })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSites()
    fetchTrenches()
    fetchStratigraphies(1)
  }, [])

  useEffect(() => {
    if (selectedSiteId) {
      setFilteredTrenches(trenches.filter(t => t.siteId === selectedSiteId))
    } else {
      setFilteredTrenches([])
    }
  }, [selectedSiteId, trenches])

  const handleSearch = () => {
    fetchStratigraphies(1)
  }

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    setLayers([])
    if (selectedTrenchId) {
      const t = trenches.find(tr => tr.id === selectedTrenchId)
      form.setFieldsValue({
        siteId: selectedSiteId || t?.siteId,
        trenchId: selectedTrenchId,
        drawDate: dayjs(),
        recordDepth: t?.currentDepth || 0
      })
    }
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingId(record.id)
    form.setFieldsValue({
      ...record,
      drawDate: record.drawDate ? dayjs(record.drawDate) : null
    })
    setLayers(record.layers ? [...record.layers] : [])
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/stratigraphies/${id}`)
      message.success('删除成功')
    } catch (e) {
      setData(data.filter(d => d.id !== id))
      message.success('删除成功')
    }
  }

  const handleViewDetail = (record) => {
    setDetailItem(record)
    setDrawerVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        ...values,
        drawDate: values.drawDate ? values.drawDate.format('YYYY-MM-DD') : null,
        layers
      }
      if (editingId) {
        await api.put(`/stratigraphies/${editingId}`, payload)
        message.success('修改成功')
      } else {
        await api.post('/stratigraphies/', payload)
        message.success('新增成功')
      }
      setModalVisible(false)
      fetchStratigraphies(pagination.current)
    } catch (e) {
      if (e?.errorFields) return
      message.error(e?.message || '操作失败')
    }
  }

  const handleAddLayer = () => {
    setEditingLayer(null)
    layerForm.resetFields()
    if (layers.length === 0) {
      layerForm.setFieldsValue({ topDepth: 0, sortOrder: 1 })
    } else {
      const lastLayer = layers[layers.length - 1]
      layerForm.setFieldsValue({
        topDepth: lastLayer.bottomDepth,
        bottomDepth: lastLayer.bottomDepth + 0.2,
        thickness: 0.2,
        sortOrder: layers.length + 1
      })
    }
    setLayerModalVisible(true)
  }

  const handleEditLayer = (layer) => {
    setEditingLayer(layer)
    layerForm.setFieldsValue(layer)
    setLayerModalVisible(true)
  }

  const handleDeleteLayer = (layerId) => {
    setLayers(layers.filter(l => l.id !== layerId && l._id !== layerId))
    message.success('已删除该层')
  }

  const handleSaveLayer = async () => {
    try {
      const values = await layerForm.validateFields()
      if (values.topDepth != null && values.bottomDepth != null) {
        values.thickness = Number((values.bottomDepth - values.topDepth).toFixed(3))
      }

      if (editingLayer) {
        setLayers(layers.map(l =>
          (l.id === editingLayer.id || l._id === editingLayer._id)
            ? { ...l, ...values }
            : l
        ))
        message.success('层位已更新')
      } else {
        const newLayer = {
          ...values,
          _id: Date.now()
        }
        const newLayers = [...layers, newLayer].sort((a, b) => Number(a.topDepth) - Number(b.topDepth))
        newLayers.forEach((l, i) => { l.sortOrder = i + 1 })
        setLayers(newLayers)
        message.success('层位已添加')
      }
      setLayerModalVisible(false)
    } catch (e) {
      if (e?.errorFields) return
    }
  }

  const getWallInfo = (key) => WALL_DIRECTIONS.find(w => w.key === key) || { label: key, color: '#888' }
  const getTrenchCode = (id) => trenches.find(t => t.id === id)?.trenchCode || '-'

  const columns = [
    {
      title: '剖面编号', dataIndex: 'stratigraphyCode', key: 'stratigraphyCode', width: 150,
      render: (v) => <b style={{ color: '#1890ff' }}>{v}</b>
    },
    { title: '探方', dataIndex: 'trenchId', key: 'trenchId', width: 100, render: v => getTrenchCode(v) },
    {
      title: '剖面方向', dataIndex: 'wallDirection', key: 'wallDirection', width: 90,
      render: v => {
        const info = getWallInfo(v)
        return <Tag color={info.color}>{info.label}</Tag>
      }
    },
    {
      title: '记录深度', dataIndex: 'recordDepth', key: 'recordDepth', width: 100,
      render: v => v != null ? `${Number(v).toFixed(3)}m` : '-'
    },
    { title: '层数', dataIndex: 'layers', key: 'layerCount', width: 80, render: v => v?.length || 0 },
    { title: '绘制日期', dataIndex: 'drawDate', key: 'drawDate', width: 110 },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: s => s === 1
        ? <Tag color="green">已审核</Tag>
        : <Tag color="orange">草稿</Tag>
    },
    {
      title: '操作', key: 'action', width: 180, fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>查看</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: 16 }}>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="选择遗址"
              style={{ width: '100%' }}
              allowClear
              value={selectedSiteId}
              onChange={v => { setSelectedSiteId(v); setSelectedTrenchId(null) }}
              showSearch
              optionFilterProp="children"
            >
              {sites.map(s => (
                <Option key={s.id} value={s.id}>{s.siteCode} - {s.siteName}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="选择探方"
              style={{ width: '100%' }}
              allowClear
              value={selectedTrenchId}
              onChange={setSelectedTrenchId}
              disabled={!selectedSiteId}
              showSearch
              optionFilterProp="children"
            >
              {filteredTrenches.map(t => (
                <Option key={t.id} value={t.id}>{t.trenchCode}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Select
              placeholder="剖面方向"
              style={{ width: '100%' }}
              allowClear
              value={wallFilter}
              onChange={setWallFilter}
            >
              {WALL_DIRECTIONS.map(w => (
                <Option key={w.key} value={w.key}>{w.label}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Input
              placeholder="搜索剖面编号"
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} md={6} style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增剖面
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab={<span><ProfileOutlined /> 列表视图</span>} key="list">
            <Table
              columns={columns}
              dataSource={data}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1100 }}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: t => `共 ${t} 条`
              }}
            />
          </TabPane>
          <TabPane tab={<span><FundOutlined /> 剖面视图</span>} key="chart">
            {data.length > 0 ? (
              <div style={{ textAlign: 'center' }}>
                <Select
                  style={{ width: 240, marginBottom: 16 }}
                  value={detailItem?.id || data[0]?.id}
                  onChange={v => {
                    const item = data.find(d => d.id === v)
                    setDetailItem(item)
                  }}
                >
                  {data.map(d => (
                    <Option key={d.id} value={d.id}>{d.stratigraphyCode}</Option>
                  ))}
                </Select>
                <StratigraphySVG stratigraphy={detailItem || data[0]} />
              </div>
            ) : (
              <Empty description="暂无剖面数据" />
            )}
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={editingId ? '编辑地层剖面' : '新增地层剖面'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={900}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="siteId" label="所属遗址" rules={[{ required: true, message: '请选择遗址' }]}>
                <Select placeholder="请选择遗址" onChange={(val) => {
                  form.setFieldsValue({ trenchId: null })
                  setFilteredTrenches(trenches.filter(t => t.siteId === val))
                }}>
                  {sites.map(s => <Option key={s.id} value={s.id}>{s.siteName}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="trenchId" label="所属探方" rules={[{ required: true, message: '请选择探方' }]}>
                <Select placeholder="请先选择遗址" disabled={!form.getFieldValue('siteId')}>
                  {(form.getFieldValue('siteId')
                    ? trenches.filter(t => t.siteId === form.getFieldValue('siteId'))
                    : []
                  ).map(t => <Option key={t.id} value={t.id}>{t.trenchCode}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="wallDirection" label="剖面方向" rules={[{ required: true, message: '请选择方向' }]}>
                <Select placeholder="请选择">
                  {WALL_DIRECTIONS.map(w => <Option key={w.key} value={w.key}>{w.label}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="recordDepth" label="记录深度(米)" rules={[{ required: true, message: '请输入深度' }]}>
                <InputNumber min={0} step={0.001} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="drawDate" label="绘制日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="剖面整体描述">
            <TextArea rows={2} placeholder="请输入剖面整体描述" />
          </Form.Item>

          <Divider orientation="left" style={{ margin: '8px 0 16px' }}>
            <Space>
              <span style={{ fontSize: 14, fontWeight: 600 }}>地层分层</span>
              <Tag color="blue">{layers.length} 层</Tag>
              <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={handleAddLayer}>
                添加层位
              </Button>
            </Space>
          </Divider>

          {layers.length > 0 ? (
            <div style={{ maxHeight: 280, overflow: 'auto' }}>
              <List
                size="small"
                bordered
                dataSource={[...layers].sort((a, b) => a.sortOrder - b.sortOrder)}
                renderItem={layer => (
                  <List.Item
                    actions={[
                      <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditLayer(layer)}>编辑</Button>,
                      <Popconfirm title="确定删除该层？" onConfirm={() => handleDeleteLayer(layer.id || layer._id)}>
                        <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
                      </Popconfirm>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <div style={{
                          width: 32, height: 32, borderRadius: 4,
                          background: SOIL_COLOR_MAP[layer.soilColor] || '#ccc',
                          border: '1px solid #999'
                        }} />
                      }
                      title={<b>{layer.layerNumber}</b>}
                      description={
                        <span style={{ fontSize: 12, color: '#666' }}>
                          {layer.topDepth?.toFixed(3)}-{layer.bottomDepth?.toFixed(3)}m
                          （厚{layer.thickness?.toFixed(3)}m）
                          · {layer.soilColor} · {layer.soilTexture}
                          {layer.artifactCount > 0 && ` · 出文物${layer.artifactCount}件`}
                        </span>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          ) : (
            <Empty description="尚未添加层位，点击'添加层位'开始记录" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: '20px 0' }} />
          )}
        </Form>
      </Modal>

      <Modal
        title={editingLayer ? '编辑地层' : '添加地层'}
        open={layerModalVisible}
        onCancel={() => setLayerModalVisible(false)}
        onOk={handleSaveLayer}
        width={600}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={layerForm} layout="vertical" preserve={false}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="layerNumber" label="层位号" rules={[{ required: true, message: '请输入层位号' }]}>
                <Input placeholder="如：①、②A、③B 等" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sortOrder" label="排序号" initialValue={1}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="topDepth"
                label="层顶深度(米)"
                rules={[{ required: true, message: '请输入' }]}
              >
                <InputNumber min={0} step={0.001} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="bottomDepth"
                label="层底深度(米)"
                rules={[{ required: true, message: '请输入' }]}
              >
                <InputNumber min={0} step={0.001} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="thickness" label="厚度(米)">
                <InputNumber disabled style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="soilColor" label="土色" rules={[{ required: true, message: '请输入土色' }]}>
                <Select placeholder="选择或输入土色" mode="tags">
                  {Object.keys(SOIL_COLOR_MAP).map(c => <Option key={c} value={c}>{c}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="soilTexture" label="土质" rules={[{ required: true, message: '请选择土质' }]}>
                <Select placeholder="请选择">
                  {SOIL_TEXTURE_OPTIONS.map(t => <Option key={t} value={t}>{t}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="soilStructure" label="土壤结构">
            <Select placeholder="请选择" allowClear>
              {SOIL_STRUCTURE_OPTIONS.map(s => <Option key={s} value={s}>{s}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="inclusions" label="包含物">
            <TextArea rows={2} placeholder="如：陶片、红烧土、炭粒、动物骨骼等" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="artifactCount" label="出土文物数量" initialValue={0}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="layerNote" label="层位备注">
            <TextArea rows={2} placeholder="备注说明" />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="地层剖面详情"
        placement="right"
        width={800}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          detailItem && (
            <Space>
              <Button icon={<EditOutlined />} onClick={() => {
                setDrawerVisible(false)
                handleEdit(detailItem)
              }}>编辑</Button>
            </Space>
          )
        }
      >
        {detailItem && (
          <div>
            <Card style={{ marginBottom: 16 }} bodyStyle={{ padding: 0 }}>
              <StratigraphySVG stratigraphy={detailItem} />
            </Card>

            <Descriptions title="基本信息" bordered column={2} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="剖面编号" span={2}>{detailItem.stratigraphyCode}</Descriptions.Item>
              <Descriptions.Item label="所属探方">{getTrenchCode(detailItem.trenchId)}</Descriptions.Item>
              <Descriptions.Item label="剖面方向">
                {getWallInfo(detailItem.wallDirection).label}
              </Descriptions.Item>
              <Descriptions.Item label="记录深度">{Number(detailItem.recordDepth).toFixed(3)} m</Descriptions.Item>
              <Descriptions.Item label="绘制日期">{detailItem.drawDate || '-'}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {detailItem.status === 1 ? <Tag color="green">已审核</Tag> : <Tag color="orange">草稿</Tag>}
              </Descriptions.Item>
            </Descriptions>

            <Collapse defaultActiveKey={['1']} style={{ marginBottom: 16 }}>
              <Panel header="分层明细" key="1">
                <List
                  size="small"
                  dataSource={detailItem.layers?.sort((a, b) => a.sortOrder - b.sortOrder) || []}
                  renderItem={layer => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <div style={{
                            width: 36, height: 36, borderRadius: 4,
                            background: SOIL_COLOR_MAP[layer.soilColor] || '#ccc',
                            border: '1px solid #999'
                          }} />
                        }
                        title={
                          <Space>
                            <b style={{ fontSize: 15 }}>{layer.layerNumber}</b>
                            <Tag color="blue">{layer.topDepth?.toFixed(3)}–{layer.bottomDepth?.toFixed(3)}m</Tag>
                            <Tag color="orange">厚{layer.thickness?.toFixed(3)}m</Tag>
                          </Space>
                        }
                        description={
                          <div style={{ fontSize: 12, color: '#666', lineHeight: 1.8 }}>
                            <div><b>土色：</b>{layer.soilColor} &nbsp; <b>土质：</b>{layer.soilTexture}
                              {layer.soilStructure && <> &nbsp; <b>结构：</b>{layer.soilStructure}</>}
                            </div>
                            {layer.inclusions && <div><b>包含物：</b>{layer.inclusions}</div>}
                            {layer.layerNote && <div><b>备注：</b>{layer.layerNote}</div>}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Panel>
            </Collapse>

            <Descriptions title="剖面描述" bordered column={1} size="small">
              <Descriptions.Item label="描述">
                {detailItem.description || '暂无描述'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default StratigraphiesPage
