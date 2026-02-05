"use client";

// src/app/layout.tsx (Client Component)
import { Inter } from 'next/font/google';
import { ConfigProvider, theme } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import Layout from './components/Layout';
import './globals.css';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: PropsWithChildren) {
  const [darkMode, setDarkMode] = useState(false);
  const [isLogin, setIsLogin] = useState<undefined | boolean>(undefined);
  const pathname = usePathname?.() || '';

  // 僅 client 檢查登入狀態
  require('react').useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLogin(localStorage.getItem('isLogin') === '1');
    }
  }, []);

  return (
    <ConfigProvider
      locale={zhTW}
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <html lang="zh-TW">
        <body className={inter.className}>
          {/* 在 /AIv2 強制隱藏 Navbar；其他路由維持原本僅登入才顯示 */}
          {pathname.startsWith('/AIv2') ? null : (isLogin === true && <Navbar darkMode={darkMode} />)}
          <Layout>{children}</Layout>
        </body>
      </html>
    </ConfigProvider>
  );
}
