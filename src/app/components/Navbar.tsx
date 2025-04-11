'use client';

import { Layout, Menu, Button } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import {
  DashboardOutlined,
  TeamOutlined,
  ProjectOutlined,
  CalendarOutlined,
  BellOutlined,
  BarChartOutlined,
  BulbOutlined
} from '@ant-design/icons';

const { Header } = Layout;

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function Navbar({ darkMode, setDarkMode }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '首頁'
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
    // {
    //   key: '/notifications',
    //   icon: <BellOutlined />,
    //   label: '通知'
    // },
    {
      key: '/progress',
      icon: <BarChartOutlined />,
      label: '進度追蹤'
    },
    {
      key: '/dashboard',
      icon: <ProjectOutlined />,
      label: '儀錶板'
    },
    {
      key: '/notifications',
      icon: <BellOutlined />,
      label: '通知'
    }
  ];

  return (
    <Header style={{ padding: 0, background: darkMode ? '#1f1f1f' : '#fff', borderBottom: '1px solid #f0f0f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', height: '100%', padding: '0 24px' }}>
        <div style={{ marginRight: '24px', fontSize: '18px', fontWeight: 'bold', color: darkMode ? '#ffffff' : '#000000' }}>
          專案追蹤系統
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          style={{ flex: 1, color: darkMode ? '#ffffff' : '#000000' }}
        />
        <Button
          icon={<BulbOutlined />}
          onClick={() => setDarkMode(!darkMode)}
          style={{
            backgroundColor: darkMode ? '#ffffff' : '#000000',
            color: darkMode ? '#000000' : '#ffffff',
            border: 'none',
            marginLeft: 'auto'
          }}
        >
          {darkMode ? '切換到亮色模式' : '切換到暗色模式'}
        </Button>
      </div>
    </Header>
  );
}