// src/app/layout.tsx (Server Component)
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ConfigProvider } from 'antd';
import zhTW from 'antd/locale/zh_TW';
import Layout from './components/Layout';
import './globals.css';
import type { PropsWithChildren } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '專案追蹤系統',
  description: '一個簡單的專案追蹤系統',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <ConfigProvider locale={zhTW}>
          <Layout>{children}</Layout>
        </ConfigProvider>
      </body>
    </html>
  );
}
