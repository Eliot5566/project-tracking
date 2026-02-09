'use client';

import { Layout, Menu, Button, Dropdown, Space } from 'antd';
import { UserOutlined, LogoutOutlined, FileTextOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import GlobalReminders from './GlobalReminders'; // 假設這是全域提醒組件的路徑
import { useI18n } from './I18nProvider';

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
  const { t } = useI18n();

  const baseMenuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: t('navbar.home'),
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: t('navbar.projects'),
    },
    {
      key: '/task',
      icon: <ProjectOutlined />,
      label: t('navbar.tasks'),
    },
    // 依權限再決定是否加入 worklogs / team
    {
      key: '/calendar',
      icon: <CalendarOutlined />,
      label: t('navbar.calendar'),
    },
    // {
    //   key: '/notifications',
    //   icon: <BellOutlined />,
    //   label: '通知'
    // },
    {
      key: '/progress',
      icon: <BarChartOutlined />,
      label: t('navbar.progress'),
    },
    {
      key: '/dashboard',
      icon: <ProjectOutlined />,
      label: t('navbar.dashboard'),
    },
    {
      key: '/documents',
      icon: <ProjectOutlined />,
      label: t('navbar.documents'),
    },
    {
      key: '/notes',
      icon: <FileTextOutlined />,
      label: t('navbar.notes'),
    },
    {
      key: '/audit',
      icon: <TeamOutlined />,
      label: t('navbar.audit'),
    },

    // {
    //   key: '/notifications',
    //   icon: <BellOutlined />,
    //   label: '通知'
    // }
  ];

  // 取得登入者資訊
  const [user, setUser] = useState<{ name: string; position: string; department?: string; role?: string } | null>(
    null
  );
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          setUser({ name: u.name, position: u.position, department: u.department, role: u.role });
        }
      } catch {}
    }
  }, []);

  const isIT = !!user?.department && /資訊|系統|資安|IT/i.test(user.department);
  const menuItems = [
    ...baseMenuItems,
    ...(isIT ? [
      { key: '/worklogs', icon: <BulbOutlined />, label: t('navbar.worklogs') },
      { key: '/team', icon: <TeamOutlined />, label: t('navbar.team') },
    ] : []),
  ];

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
        {t('navbar.logout')}
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
          {t('app.headerTitle')}
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
