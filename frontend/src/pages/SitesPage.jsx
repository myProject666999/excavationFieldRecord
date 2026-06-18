import { useState, useEffect } from 'react'
import {
  Table, Button, Input, Select, DatePicker, Form, Modal, Popconfirm,
  message, Space, Card, Row, Col, Tag
} from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons'
import api from '../api'
import dayjs from 'dayjs'

const { Option } = Select

const statusMap = {
  1: { text: '进行中', color: 'blue' },
  2: { text: '已结束', color: 'default' }
}

const SitesPage = () => {
  const [form] = Form.useForm()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchParams, setSearchParams] = useState({ siteCode: '', siteName: '', status: null })
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)

  const fetchData = async (page = 1, pageSize = 10, params = {}) => {
    setLoading(true)
    try {
      const res = await api.get('/sites/page', { params: { page: page - 1, size: pageSize, ...params } })
      const pageData = res.data || {}
      setData(pageData.content || pageData.list || [])
      setPagination({
        current: page,
        pageSize,
        total: pageData.totalElements || pageData.total || 0
      })
    } catch (error) {
      console.error('获取遗址列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize, searchParams)
  }, [])

  const handleSearch = () => {
    const params = {}
    if (searchParams.siteCode) params.siteCode = searchParams.siteCode
    if (searchParams.siteName) params.siteName = searchParams.siteName
    if (searchParams.status !== null && searchParams.status !== '') params.status = searchParams.status
    fetchData(1, pagination.pageSize, params)
  }

  const handleReset = () => {
    setSearchParams({ siteCode: '', siteName: '', status: null })
    fetchData(1, pagination.pageSize, {})
  }

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
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
      await api.delete(`/sites/${id}`)
      message.success('删除成功')
      fetchData(pagination.current, pagination.pageSize, searchParams)
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
        await api.put(`/sites/${editingId}`, payload)
        message.success('修改成功')
      } else {
        await api.post('/sites/', payload)
        message.success('新增成功')
      }
      setModalOpen(false)
      fetchData(pagination.current, pagination.pageSize, searchParams)
    } catch (error) {
      if (error.errorFields) return
      console.error('提交失败:', error)
    } finally {
      setSubmitLoading(false)
    }
  }

  const columns = [
    { title: '遗址编号', dataIndex: 'siteCode', key: 'siteCode', width: 120 },
    { title: '遗址名称', dataIndex: 'siteName', key: 'siteName', width: 160 },
    { title: '地理位置', dataIndex: 'location', key: 'location', width: 200, ellipsis: true },
    {
      title: '经纬度',
      key: 'coords',
      width: 180,
      render: (_, record) => (
        record.latitude && record.longitude
          ? `${Number(record.latitude).toFixed(4)}, ${Number(record.longitude).toFixed(4)}`
          : '-'
      )
    },
    { title: '领队', dataIndex: 'leaderId', key: 'leaderId', width: 80, render: v => v || '-' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: s => {
        const info = statusMap[s] || { text: '未知', color: 'gray' }
        return <Tag color={info.color}>{info.text}</Tag>
      }
    },
    { title: '开始日期', dataIndex: 'startDate', key: 'startDate', width: 110 },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 170 },
    {
      title: '操作',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确认删除该遗址？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
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
            <Input
              placeholder="遗址编号"
              prefix={<SearchOutlined />}
              value={searchParams.siteCode}
              onChange={e => setSearchParams({ ...searchParams, siteCode: e.target.value })}
              style={{ width: 160 }}
              allowClear
            />
          </Col>
          <Col>
            <Input
              placeholder="遗址名称"
              prefix={<SearchOutlined />}
              value={searchParams.siteName}
              onChange={e => setSearchParams({ ...searchParams, siteName: e.target.value })}
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
              <Option value={1}>进行中</Option>
              <Option value={2}>已结束</Option>
            </Select>
          </Col>
          <Col>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
            </Space>
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增遗址</Button>
          </Col>
        </Row>
      </Card>

      <Card>
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
            showTotal: t => `共 ${t} 条`,
            onChange: (page, pageSize) => fetchData(page, pageSize, searchParams)
          }}
        />
      </Card>

      <Modal
        title={editingId ? '编辑遗址' : '新增遗址'}
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
              <Form.Item name="siteCode" label="遗址编号" rules={[{ required: true, message: '请输入遗址编号' }]}>
                <Input placeholder="请输入遗址编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="siteName" label="遗址名称" rules={[{ required: true, message: '请输入遗址名称' }]}>
                <Input placeholder="请输入遗址名称" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="location" label="地理位置" rules={[{ required: true, message: '请输入地理位置' }]}>
            <Input placeholder="请输入地理位置" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="latitude" label="纬度">
                <Input type="number" step="0.0000001" placeholder="例如：34.2658000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="longitude" label="经度">
                <Input type="number" step="0.0000001" placeholder="例如：108.9541000" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startDate" label="开始日期">
                <DatePicker style={{ width: '100%' }} placeholder="选择开始日期" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="leaderId" label="领队ID">
                <Input type="number" placeholder="请输入领队ID" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="状态" initialValue={1}>
                <Select placeholder="选择状态">
                  <Option value={1}>进行中</Option>
                  <Option value={2}>已结束</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入遗址描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default SitesPage
