"use client";

// src/app/layout.tsx (Client Component)
import { Inter } from 'next/font/google';
import { ConfigProvider, theme } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import enUS from 'antd/locale/en_US';
import jaJP from 'antd/locale/ja_JP';
import Layout from './components/Layout';
import { I18nProvider, useI18n } from './components/I18nProvider';
import LanguageSwitcher from './components/LanguageSwitcher';
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

  const AppShell = ({ children }: PropsWithChildren) => {
    const { locale } = useI18n();
    const antdLocale = locale === 'zh-TW' ? zhTW : locale === 'en' ? enUS : jaJP;
    return (
      <ConfigProvider
        locale={antdLocale}
        theme={{
          algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        {/* 在 /AIv2 強制隱藏 Navbar；其他路由維持原本僅登入才顯示 */}
        {pathname.startsWith('/AIv2') ? null : (isLogin === true && <Navbar darkMode={darkMode} />)}
        {/* 全域語言切換器（固定於右上角） */}
        <LanguageSwitcher />
        <Layout>{children}</Layout>
      </ConfigProvider>
    );
  };

  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <I18nProvider>
          <AppShell>{children}</AppShell>
        </I18nProvider>
      </body>
    </html>
  );
}
