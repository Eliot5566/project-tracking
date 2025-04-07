'use client';

import { Layout, Menu } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import {
  DashboardOutlined,
  TeamOutlined,
  ProjectOutlined,
  CalendarOutlined,
  BellOutlined,
  BarChartOutlined
} from '@ant-design/icons';

const { Header } = Layout;

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '儀表板'
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: '專案管理'
    },
    {
      key: '/task',
      icon: <ProjectOutlined />,
      label: '任務管理'
    },
    {
      key: '/team',
      icon: <TeamOutlined />,
      label: '團隊管理'
    },
    {
      key: '/calendar',
      icon: <CalendarOutlined />,
      label: '行事曆'
    },
    {
      key: '/notifications',
      icon: <BellOutlined />,
      label: '通知'
    },
    {
      key: '/progress',
      icon: <BarChartOutlined />,
      label: '進度追蹤'
    }
  ];

  return (
    <Header style={{ padding: 0, background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 24px' }}>
        <div style={{ marginRight: '24px', fontSize: '18px', fontWeight: 'bold' }}>
          專案追蹤系統
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          style={{ flex: 1 }}
        />
      </div>
    </Header>
  );
} 