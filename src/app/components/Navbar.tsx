'use client';

import { Layout, Menu, Button, Dropdown, Space } from 'antd';
import { UserOutlined, LogoutOutlined, FileTextOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import GlobalReminders from './GlobalReminders'; // 假設這是全域提醒組件的路徑

import {
  DashboardOutlined,
  TeamOutlined,
  ProjectOutlined,
  CalendarOutlined,
  BellOutlined,
  BarChartOutlined,
  BulbOutlined,
} from '@ant-design/icons';

const { Header } = Layout;

interface NavbarProps {
  darkMode: boolean;
}

export default function Navbar({ darkMode }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '首頁',
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: '專案管理',
    },
    {
      key: '/task',
      icon: <ProjectOutlined />,
      label: '任務管理',
    },
    {
      key: '/worklogs',
      icon: <BulbOutlined />,
      label: '工作日誌',
    },
    {
      key: '/todos',
      icon: <FileTextOutlined />,
      label: '代辦事項',
    },
    {
      key: '/team',
      icon: <TeamOutlined />,
      label: '團隊管理',
    },
    {
      key: '/calendar',
      icon: <CalendarOutlined />,
      label: '行事曆',
    },
    // {
    //   key: '/notifications',
    //   icon: <BellOutlined />,
    //   label: '通知'
    // },
    {
      key: '/progress',
      icon: <BarChartOutlined />,
      label: '進度追蹤',
    },
    {
      key: '/dashboard',
      icon: <ProjectOutlined />,
      label: '儀錶板',
    },
    {
      key: '/documents',
      icon: <ProjectOutlined />,
      label: '文件管理',
    },
    {
      key: '/notes',
      icon: <FileTextOutlined />,
      label: '會議記錄',
    },
    {
      key: '/audit',
      icon: <TeamOutlined />,
      label: '稽核專區',
    },

    // {
    //   key: '/notifications',
    //   icon: <BellOutlined />,
    //   label: '通知'
    // }
  ];

  // 取得登入者資訊
  const [user, setUser] = useState<{ name: string; position: string } | null>(
    null
  );
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          setUser({ name: u.name, position: u.position });
        }
      } catch {}
    }
  }, []);

  // 登出
  const handleLogout = () => {
    localStorage.removeItem('isLogin');
    localStorage.removeItem('user');
    router.replace('/login');
    window.location.reload();
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        登出
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      style={{
        padding: 0,
        background: darkMode ? '#1f1f1f' : '#fff',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '100%',
          padding: '0 24px',
        }}
      >
        <div
          style={{
            marginRight: '24px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: darkMode ? '#ffffff' : '#000000',
          }}
        >
          專案追蹤系統
        </div>
        <Menu
          mode="horizontal"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => router.push(key)}
          style={{ flex: 1, color: darkMode ? '#ffffff' : '#000000' }}
        />
        <GlobalReminders />
        {user && (
          <Dropdown overlay={userMenu} placement="bottomRight">
            <Button icon={<UserOutlined />} style={{ marginLeft: 16 }}>
              <Space>
                {user.name}（{user.position}）
              </Space>
            </Button>
          </Dropdown>
        )}
      </div>
    </Header>
  );
}
