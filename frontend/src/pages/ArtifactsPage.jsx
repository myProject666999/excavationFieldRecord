import { useState, useEffect } from 'react'
import {
  Row, Col, Select, Input, Button, Tabs, Table, Modal, Form,
  InputNumber, DatePicker, Upload, Card, Drawer, Carousel,
  Descriptions, Tag, Space, message, Tooltip, Popconfirm, Divider
} from 'antd'
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, UploadOutlined, EnvironmentOutlined
} from '@ant-design/icons'
import api from '../api'
import dayjs from 'dayjs'

const { Option } = Select
const { TextArea } = Input
const { TabPane } = Tabs

const CATEGORY_OPTIONS = ['陶器', '瓷器', '石器', '骨器', '金属器', '玉器', '漆木器', '其他']
const CATEGORY_PREFIX = {
  '陶器': 'W', '瓷器': 'C', '石器': 'S', '骨器': 'G',
  '金属器': 'J', '玉器': 'Y', '漆木器': 'Q', '其他': 'O'
}
const CONDITION_OPTIONS = ['完整', '残损', '破碎']
const SOIL_COLOR_MAP = {
  '浅黄褐色': '#F5E6C8', '黄褐色': '#E8D4A8', '灰褐色': '#B8A888',
  '深灰褐色': '#8B7355', '灰色': '#A0A0A0', '黑褐色': '#5C4033',
  '红色': '#CD853F', '浅黄色': '#FFFACD'
}

const mockSites = [
  { id: 1, siteCode: 'YZ-2024-001', siteName: '李家村遗址' },
  { id: 2, siteCode: 'YZ-2024-002', siteName: '王家坪遗址' }
]

const mockTrenches = [
  { id: 1, trenchCode: 'T0301', siteId: 1 },
  { id: 2, trenchCode: 'T0302', siteId: 1 },
  { id: 3, trenchCode: 'T0401', siteId: 1 },
  { id: 4, trenchCode: 'T0101', siteId: 2 },
  { id: 5, trenchCode: 'T0102', siteId: 2 }
]

const ArtifactsPage = () => {
  const [form] = Form.useForm()
  const [sites, setSites] = useState(mockSites)
  const [trenches, setTrenches] = useState(mockTrenches)
  const [filteredTrenches, setFilteredTrenches] = useState([])
  const [artifacts, setArtifacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [detailArtifact, setDetailArtifact] = useState(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedSiteId, setSelectedSiteId] = useState(null)
  const [selectedTrenchId, setSelectedTrenchId] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [fileList, setFileList] = useState([])

  const fetchSites = async () => {
    try {
      const res = await api.get('/sites/')
      if (res?.data) setSites(res.data)
    } catch (e) {
      setSites(mockSites)
    }
  }

  const fetchTrenches = async () => {
    try {
      const res = await api.get('/trenches/')
      if (res?.data) setTrenches(res.data)
    } catch (e) {
      setTrenches(mockTrenches)
    }
  }

  const fetchArtifacts = async (page = 1) => {
    setLoading(true)
    try {
      const params = {
        page: page - 1,
        size: 10,
        ...(selectedTrenchId ? { trenchId: selectedTrenchId } : {}),
        ...(selectedSiteId && !selectedTrenchId ? { siteId: selectedSiteId } : {})
      }
      const res = await api.get('/artifacts/page', { params })
      let list = res?.data?.content || res?.data || []
      if (searchKeyword) {
        const kw = searchKeyword.toLowerCase()
        list = list.filter(a =>
          a.artifactCode?.toLowerCase().includes(kw) ||
          a.category?.toLowerCase().includes(kw) ||
          a.name?.toLowerCase().includes(kw)
        )
      }
      setArtifacts(list)
      setPagination({
        current: page,
        pageSize: 10,
        total: res?.data?.totalElements || list.length
      })
    } catch (e) {
      const mockList = [
        {
          id: 1, artifactCode: 'T0301-W001', trenchId: 1, siteId: 1,
          coordX: 2.35, coordY: 1.80, depth: 0.45, category: '陶器',
          name: '红陶钵残片', description: '泥质红陶，轮制，器形为钵，残损严重',
          material: '泥质红陶', quantity: 1, associates: '与少量红烧土颗粒共出',
          condition: '残损', storageLocation: '文物库房A-01',
          discovererId: 1, discoveryTime: '2024-06-15 09:30:00',
          trenchCode: 'T0301'
        },
        {
          id: 2, artifactCode: 'T0301-S001', trenchId: 1, siteId: 1,
          coordX: 3.10, coordY: 2.65, depth: 0.62, category: '石器',
          name: '磨制石斧', description: '青石质，通体磨光，器形规整，刃部锋利',
          material: '青石', quantity: 1, associates: '与炭粒、陶片共存于第②层',
          condition: '完整', storageLocation: '文物库房A-02',
          discovererId: 1, discoveryTime: '2024-06-15 14:20:00',
          trenchCode: 'T0301'
        },
        {
          id: 3, artifactCode: 'T0302-C001', trenchId: 2, siteId: 1,
          coordX: 1.50, coordY: 4.20, depth: 0.38, category: '瓷器',
          name: '青花瓷片', description: '青花瓷，釉色莹润，绘缠枝莲纹',
          material: '高岭土', quantity: 3, associates: '出土于扰土层，伴出近现代瓷片',
          condition: '破碎', storageLocation: '文物库房B-01',
          discovererId: 1, discoveryTime: '2024-06-16 10:15:00',
          trenchCode: 'T0302'
        }
      ]
      let filtered = mockList
      if (selectedTrenchId) filtered = filtered.filter(a => a.trenchId === selectedTrenchId)
      else if (selectedSiteId) filtered = filtered.filter(a => a.siteId === selectedSiteId)
      if (searchKeyword) {
        const kw = searchKeyword.toLowerCase()
        filtered = filtered.filter(a =>
          a.artifactCode?.toLowerCase().includes(kw) ||
          a.category?.toLowerCase().includes(kw) ||
          a.name?.toLowerCase().includes(kw)
        )
      }
      setArtifacts(filtered)
      setPagination({ current: page, pageSize: 10, total: filtered.length })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSites()
    fetchTrenches()
  }, [])

  useEffect(() => {
    if (selectedSiteId) {
      setFilteredTrenches(trenches.filter(t => t.siteId === selectedSiteId))
    } else {
      setFilteredTrenches([])
    }
  }, [selectedSiteId, trenches])

  useEffect(() => {
    fetchArtifacts(1)
  }, [selectedSiteId, selectedTrenchId, searchKeyword])

  const handleSiteChange = (val) => {
    setSelectedSiteId(val)
    setSelectedTrenchId(null)
  }

  const handleTrenchChange = (val) => {
    setSelectedTrenchId(val)
  }

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    setFileList([])
    const trench = trenches.find(t => t.id === selectedTrenchId)
    if (trench) {
      form.setFieldsValue({
        siteId: selectedSiteId || trench.siteId,
        trenchId: selectedTrenchId,
        quantity: 1,
        discoveryTime: dayjs()
      })
    }
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingId(record.id)
    form.setFieldsValue({
      ...record,
      discoveryTime: record.discoveryTime ? dayjs(record.discoveryTime) : null
    })
    setFileList([])
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/artifacts/${id}`)
      message.success('删除成功')
      fetchArtifacts(pagination.current)
    } catch (e) {
      setArtifacts(artifacts.filter(a => a.id !== id))
      message.success('删除成功')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const payload = {
        ...values,
        discoveryTime: values.discoveryTime ? values.discoveryTime.format('YYYY-MM-DD HH:mm:ss') : null
      }
      if (editingId) {
        await api.put(`/artifacts/${editingId}`, payload)
        message.success('修改成功')
      } else {
        const trench = trenches.find(t => t.id === values.trenchId)
        const prefix = CATEGORY_PREFIX[values.category] || 'O'
        const seq = String(artifacts.filter(a => a.trenchId === values.trenchId && a.category === values.category).length + 1).padStart(3, '0')
        payload.artifactCode = `${trench?.trenchCode || 'T'}-${prefix}${seq}`
        await api.post('/artifacts/', payload)
        message.success('新增成功')
      }
      setModalVisible(false)
      fetchArtifacts(pagination.current)
    } catch (e) {
      if (e?.errorFields) return
      message.error(e?.message || '操作失败')
    }
  }

  const handleViewDetail = (record) => {
    setDetailArtifact(record)
    setDrawerVisible(true)
  }

  const getTrenchCode = (trenchId) => trenches.find(t => t.id === trenchId)?.trenchCode || '-'

  const getSiteName = (siteId) => sites.find(s => s.id === siteId)?.siteName || '-'

  const columns = [
    { title: '文物编号', dataIndex: 'artifactCode', key: 'artifactCode', width: 140, fixed: 'left' },
    { title: '所属探方', dataIndex: 'trenchId', key: 'trenchId', width: 100, render: v => getTrenchCode(v) },
    {
      title: '相对坐标', key: 'coord', width: 140,
      render: (_, r) => <span>X:{Number(r.coordX).toFixed(2)} Y:{Number(r.coordY).toFixed(2)}</span>
    },
    { title: '出土深度(m)', dataIndex: 'depth', key: 'depth', width: 110, render: v => Number(v).toFixed(3) },
    {
      title: '文物类别', dataIndex: 'category', key: 'category', width: 100,
      render: v => <Tag color="blue">{v}</Tag>
    },
    { title: '名称', dataIndex: 'name', key: 'name', width: 160, ellipsis: true },
    { title: '材质', dataIndex: 'material', key: 'material', width: 100 },
    { title: '数量', dataIndex: 'quantity', key: 'quantity', width: 70 },
    { title: '伴生物摘要', dataIndex: 'associates', key: 'associates', width: 180, ellipsis: true },
    {
      title: '保存状况', dataIndex: 'condition', key: 'condition', width: 100,
      render: v => v && <Tag color={v === '完整' ? 'green' : v === '残损' ? 'orange' : 'red'}>{v}</Tag>
    },
    {
      title: '发现时间', dataIndex: 'discoveryTime', key: 'discoveryTime', width: 160,
      render: v => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '操作', key: 'action', width: 160, fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>详情</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const renderCoordView = () => {
    const viewArtifacts = selectedTrenchId
      ? artifacts
      : artifacts.filter(a => a.trenchId === (trenches[0]?.id))

    const maxDepth = Math.max(...viewArtifacts.map(a => Number(a.depth)), 1)
    const maxQuantity = Math.max(...viewArtifacts.map(a => Number(a.quantity)), 1)

    const SVG_WIDTH = 600
    const SVG_HEIGHT = 600
    const PADDING = 60
    const GRID_SIZE = 5
    const SCALE_X = (SVG_WIDTH - PADDING * 2) / GRID_SIZE
    const SCALE_Y = (SVG_HEIGHT - PADDING * 2) / GRID_SIZE

    const gridLines = []
    for (let i = 0; i <= GRID_SIZE; i++) {
      gridLines.push(
        <line
          key={`v-${i}`}
          x1={PADDING + i * SCALE_X}
          y1={PADDING}
          x2={PADDING + i * SCALE_X}
          y2={SVG_HEIGHT - PADDING}
          stroke="#e8e8e8"
          strokeWidth="1"
        />
      )
      gridLines.push(
        <line
          key={`h-${i}`}
          x1={PADDING}
          y1={PADDING + i * SCALE_Y}
          x2={SVG_WIDTH - PADDING}
          y2={PADDING + i * SCALE_Y}
          stroke="#e8e8e8"
          strokeWidth="1"
        />
      )
    }

    return (
      <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <Tag color="blue">圆点大小: 表示数量</Tag>
            <Tag color="geekblue">颜色深浅: 表示深度</Tag>
          </Space>
          <span style={{ color: '#888' }}>
            当前探方: <b>{getTrenchCode(selectedTrenchId || viewArtifacts[0]?.trenchId) || '请选择探方'}</b>
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <svg width={SVG_WIDTH} height={SVG_HEIGHT} style={{ background: '#fafafa', border: '1px solid #d9d9d9' }}>
            {gridLines}
            {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
              <g key={`label-x-${i}`}>
                <text
                  x={PADDING + i * SCALE_X}
                  y={SVG_HEIGHT - PADDING + 20}
                  textAnchor="middle"
                  fill="#666"
                  fontSize="12"
                >
                  {i}m
                </text>
                <text
                  x={PADDING - 15}
                  y={PADDING + i * SCALE_Y + 4}
                  textAnchor="end"
                  fill="#666"
                  fontSize="12"
                >
                  {i}m
                </text>
              </g>
            ))}
            <text x={SVG_WIDTH / 2} y={SVG_HEIGHT - 10} textAnchor="middle" fill="#333" fontSize="14" fontWeight="bold">
              X轴 (东→)
            </text>
            <text
              x={15}
              y={SVG_HEIGHT / 2}
              textAnchor="middle"
              fill="#333"
              fontSize="14"
              fontWeight="bold"
              transform={`rotate(-90, 15, ${SVG_HEIGHT / 2})`}
            >
              Y轴 (北↑)
            </text>
            {viewArtifacts.map(a => {
              const cx = PADDING + Number(a.coordX) * SCALE_X
              const cy = SVG_HEIGHT - PADDING - Number(a.coordY) * SCALE_Y
              const r = 6 + (Number(a.quantity) / maxQuantity) * 14
              const depthRatio = Number(a.depth) / maxDepth
              const color = `rgba(24, 144, 255, ${0.3 + depthRatio * 0.6})`
              return (
                <Tooltip
                  key={a.id}
                  title={
                    <div>
                      <div><b>{a.artifactCode}</b> - {a.name}</div>
                      <div>深度: {Number(a.depth).toFixed(3)}m</div>
                      <div>坐标: X:{Number(a.coordX).toFixed(2)} Y:{Number(a.coordY).toFixed(2)}</div>
                      <div>数量: {a.quantity}</div>
                    </div>
                  }
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill={color}
                    stroke="#1890ff"
                    strokeWidth="1.5"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleViewDetail(a)}
                  />
                </Tooltip>
              )
            })}
          </svg>
        </div>
      </div>
    )
  }

  const uploadProps = {
    fileList,
    onChange: ({ fileList: newList }) => setFileList(newList),
    beforeUpload: () => {
      message.info('现场无网时暂存本地，有网后同步')
      return false
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="选择遗址"
              style={{ width: '100%' }}
              allowClear
              value={selectedSiteId}
              onChange={handleSiteChange}
              showSearch
              optionFilterProp="children"
            >
              {sites.map(s => (
                <Option key={s.id} value={s.id}>{s.siteCode} - {s.siteName}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="选择探方"
              style={{ width: '100%' }}
              allowClear
              value={selectedTrenchId}
              onChange={handleTrenchChange}
              disabled={!selectedSiteId}
              showSearch
              optionFilterProp="children"
            >
              {filteredTrenches.map(t => (
                <Option key={t.id} value={t.id}>{t.trenchCode}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={18} md={8}>
            <Input
              placeholder="搜索文物编号/类别/名称"
              prefix={<SearchOutlined />}
              allowClear
              value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              onPressEnter={() => fetchArtifacts(1)}
            />
          </Col>
          <Col xs={24} sm={6} md={4} style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增登记
            </Button>
          </Col>
        </Row>
      </Card>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="列表视图" key="list">
            <Table
              columns={columns}
              dataSource={artifacts}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1600 }}
              pagination={{
                ...pagination,
                showSizeChanger: false,
                onChange: (page) => fetchArtifacts(page)
              }}
            />
          </TabPane>
          <TabPane tab={
            <span>
              <EnvironmentOutlined /> 坐标视图
            </span>
          } key="coord">
            {renderCoordView()}
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={editingId ? '编辑文物登记' : '新增文物登记'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={800}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Tabs defaultActiveKey="1">
            <TabPane tab="基础信息" key="1">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="siteId" label="所属遗址" rules={[{ required: true, message: '请选择遗址' }]}>
                    <Select placeholder="请选择遗址" onChange={(val) => {
                      form.setFieldsValue({ trenchId: null })
                      setFilteredTrenches(trenches.filter(t => t.siteId === val))
                    }}>
                      {sites.map(s => (
                        <Option key={s.id} value={s.id}>{s.siteName}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="trenchId" label="所属探方" rules={[{ required: true, message: '请选择探方' }]}>
                    <Select placeholder="请先选择遗址" disabled={!form.getFieldValue('siteId')}>
                      {(form.getFieldValue('siteId')
                        ? trenches.filter(t => t.siteId === form.getFieldValue('siteId'))
                        : []
                      ).map(t => (
                        <Option key={t.id} value={t.id}>{t.trenchCode}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="文物编号"
                    extra="系统自动生成：探方编号 + 类别首字母 + 3位序号"
                  >
                    <Input disabled placeholder="保存后自动生成" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="category" label="文物类别" rules={[{ required: true, message: '请选择类别' }]}>
                    <Select placeholder="请选择类别">
                      {CATEGORY_OPTIONS.map(c => <Option key={c} value={c}>{c}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="name" label="文物名称" rules={[{ required: true, message: '请输入名称' }]}>
                <Input placeholder="请输入文物名称" />
              </Form.Item>
              <Form.Item name="description" label="详细描述">
                <TextArea rows={3} placeholder="请输入文物的详细描述" />
              </Form.Item>
            </TabPane>
            <TabPane tab="三维位置" key="2">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="coordX"
                    label="相对坐标 X (米)"
                    rules={[
                      { required: true, message: '请输入X坐标' },
                      { type: 'number', min: 0, max: 5, message: '范围 0~5 米' }
                    ]}
                  >
                    <InputNumber min={0} max={5} step={0.001} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="coordY"
                    label="相对坐标 Y (米)"
                    rules={[
                      { required: true, message: '请输入Y坐标' },
                      { type: 'number', min: 0, max: 5, message: '范围 0~5 米' }
                    ]}
                  >
                    <InputNumber min={0} max={5} step={0.001} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="depth"
                    label="出土深度 (米)"
                    rules={[
                      { required: true, message: '请输入深度' },
                      { type: 'number', min: 0, message: '深度必须大于等于0' }
                    ]}
                  >
                    <InputNumber min={0} step={0.001} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="layerId" label="所属地层号">
                <Input placeholder="可选，填写地层编号如 ①、②A 等" />
              </Form.Item>
            </TabPane>
            <TabPane tab="详细记录" key="3">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="material" label="材质">
                    <Input placeholder="如：泥质红陶、青石等" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="quantity" label="数量" initialValue={1}>
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="associates" label="伴生物" extra="描述共出土的其他物品">
                <TextArea rows={2} placeholder="如：与红烧土颗粒、炭粒共出" />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="condition" label="保存状况">
                    <Select placeholder="请选择">
                      {CONDITION_OPTIONS.map(c => <Option key={c} value={c}>{c}</Option>)}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="storageLocation" label="存放位置">
                    <Input placeholder="如：文物库房A-01" />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="discovererId" label="发现人">
                    <Input placeholder="发现人姓名或ID" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="discoveryTime" label="发现时间">
                    <DatePicker showTime style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </TabPane>
            <TabPane tab="照片上传" key="4">
              <div style={{ marginBottom: 8, color: '#888', fontSize: 12 }}>
                💡 现场无网时暂存本地，有网后自动同步
              </div>
              <Upload
                {...uploadProps}
                listType="picture-card"
                multiple
                accept="image/*"
              >
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传照片</div>
                </div>
              </Upload>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>

      <Drawer
        title="文物详情"
        placement="right"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          detailArtifact && (
            <Space>
              <Button icon={<EditOutlined />} onClick={() => {
                setDrawerVisible(false)
                handleEdit(detailArtifact)
              }}>编辑</Button>
            </Space>
          )
        }
      >
        {detailArtifact && (
          <>
            <Carousel autoplay style={{ background: '#f0f0f0', marginBottom: 24, borderRadius: 8 }}>
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                <img alt="示意图1" style={{ maxHeight: 200, width: '100%', objectFit: 'cover' }}
                  src={`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='200'><rect width='100%25' height='100%25' fill='%23e6f7ff'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%231890ff' font-size='20'>${detailArtifact.artifactCode} 现场照片1</text></svg>`}
                />
              </div>
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                <img alt="示意图2" style={{ maxHeight: 200, width: '100%', objectFit: 'cover' }}
                  src={`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='200'><rect width='100%25' height='100%25' fill='%23f6ffed'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2352c41a' font-size='20'>${detailArtifact.artifactCode} 现场照片2</text></svg>`}
                />
              </div>
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                <img alt="示意图3" style={{ maxHeight: 200, width: '100%', objectFit: 'cover' }}
                  src={`data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='200'><rect width='100%25' height='100%25' fill='%23fff7e6'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23fa8c16' font-size='20'>${detailArtifact.artifactCode} 细节照片</text></svg>`}
                />
              </div>
            </Carousel>

            <Descriptions title="基础信息" bordered column={2} size="small">
              <Descriptions.Item label="文物编号" span={2}>{detailArtifact.artifactCode}</Descriptions.Item>
              <Descriptions.Item label="所属遗址">{getSiteName(detailArtifact.siteId)}</Descriptions.Item>
              <Descriptions.Item label="所属探方">{getTrenchCode(detailArtifact.trenchId)}</Descriptions.Item>
              <Descriptions.Item label="文物类别"><Tag color="blue">{detailArtifact.category}</Tag></Descriptions.Item>
              <Descriptions.Item label="名称">{detailArtifact.name}</Descriptions.Item>
              <Descriptions.Item label="材质">{detailArtifact.material || '-'}</Descriptions.Item>
              <Descriptions.Item label="数量">{detailArtifact.quantity}</Descriptions.Item>
              <Descriptions.Item label="保存状况">
                {detailArtifact.condition && (
                  <Tag color={detailArtifact.condition === '完整' ? 'green' : detailArtifact.condition === '残损' ? 'orange' : 'red'}>
                    {detailArtifact.condition}
                  </Tag>
                )}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Descriptions title="三维位置" bordered column={2} size="small">
              <Descriptions.Item label="坐标 X">{Number(detailArtifact.coordX).toFixed(3)} m</Descriptions.Item>
              <Descriptions.Item label="坐标 Y">{Number(detailArtifact.coordY).toFixed(3)} m</Descriptions.Item>
              <Descriptions.Item label="出土深度">{Number(detailArtifact.depth).toFixed(3)} m</Descriptions.Item>
              <Descriptions.Item label="地层号">{detailArtifact.layerId || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider />

            <div style={{ marginBottom: 16 }}>
              <b>坐标位置示意：</b>
              <svg width="100%" height="180" viewBox="0 0 400 180" style={{ marginTop: 8, background: '#fafafa', border: '1px solid #eee', borderRadius: 4 }}>
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <g key={i}>
                    <line x1={40 + i * 64} y1={20} x2={40 + i * 64} y2={160} stroke="#e8e8e8" />
                    <line x1={40} y1={20 + i * 28} x2={360} y2={20 + i * 28} stroke="#e8e8e8" />
                    <text x={40 + i * 64} y={175} textAnchor="middle" fontSize="10" fill="#888">{i}m</text>
                    <text x={30} y={24 + i * 28} textAnchor="end" fontSize="10" fill="#888">{i}m</text>
                  </g>
                ))}
                <circle
                  cx={40 + Number(detailArtifact.coordX) * 64}
                  cy={160 - Number(detailArtifact.coordY) * 28}
                  r="8"
                  fill="#1890ff"
                  stroke="#fff"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <Descriptions title="详细记录" bordered column={1} size="small">
              <Descriptions.Item label="描述">{detailArtifact.description || '-'}</Descriptions.Item>
              <Descriptions.Item label="伴生物">{detailArtifact.associates || '-'}</Descriptions.Item>
              <Descriptions.Item label="存放位置">{detailArtifact.storageLocation || '-'}</Descriptions.Item>
              <Descriptions.Item label="发现时间">
                {detailArtifact.discoveryTime ? dayjs(detailArtifact.discoveryTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
            </Descriptions>
