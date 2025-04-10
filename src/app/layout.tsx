"use client";

// src/app/layout.tsx (Client Component)
import { Inter } from 'next/font/google';
import { ConfigProvider, theme } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import Layout from './components/Layout';
import './globals.css';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import Navbar from './components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: PropsWithChildren) {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <ConfigProvider
      locale={zhTW}
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <html lang="zh-TW">
        <body className={inter.className}>
          <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
          <Layout>{children}</Layout>
        </body>
      </html>
    </ConfigProvider>
  );
}
