import { useState } from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Space } from 'antd'
import {
  ExperimentOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  ProfileOutlined,
  SyncOutlined,
  FileTextOutlined,
  UserOutlined
} from '@ant-design/icons'
import SitesPage from './pages/SitesPage'
import TrenchesPage from './pages/TrenchesPage'
import ArtifactsPage from './pages/ArtifactsPage'
import StratigraphiesPage from './pages/StratigraphiesPage'
import SyncPage from './pages/SyncPage'
import LogsPage from './pages/LogsPage'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/sites', icon: <ExperimentOutlined />, label: '遗址管理' },
  { key: '/trenches', icon: <AppstoreOutlined />, label: '探方管理' },
  { key: '/artifacts', icon: <DatabaseOutlined />, label: '文物登记' },
  { key: '/stratigraphies', icon: <ProfileOutlined />, label: '地层剖面' },
  { key: '/sync', icon: <SyncOutlined />, label: '数据同步' },
  { key: '/logs', icon: <FileTextOutlined />, label: '操作日志' }
]

const PlaceholderPage = ({ title }) => (
  <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
    <h2>{title}</h2>
    <p>页面开发中...</p>
  </div>
)

function App() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const userMenuItems = [
    { key: 'profile', label: '个人中心' },
    { key: 'settings', label: '设置' },
    { type: 'divider' },
    { key: 'logout', label: '退出登录' }
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 20 : 16,
          fontWeight: 'bold',
          background: 'rgba(255,255,255,0.1)'
        }}>
          {collapsed ? '考古' : '考古记录系统'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems.map(item => ({
            ...item,
            label: <Link to={item.key}>{item.label}</Link>
          }))}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ExperimentOutlined style={{ fontSize: 24, color: '#1890ff', marginRight: 12 }} />
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>考古发掘现场记录系统</h1>
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>管理员</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: 16 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/sites" replace />} />
            <Route path="/sites" element={<SitesPage />} />
            <Route path="/trenches" element={<TrenchesPage />} />
            <Route path="/artifacts" element={<ArtifactsPage />} />
            <Route path="/stratigraphies" element={<StratigraphiesPage />} />
            <Route path="/sync" element={<SyncPage />} />
            <Route path="/logs" element={<LogsPage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
