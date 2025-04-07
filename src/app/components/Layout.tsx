'use client';
import { Layout as AntLayout } from 'antd';
import Navbar from './Navbar';
import type { PropsWithChildren } from 'react';

const { Content } = AntLayout;

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Navbar />
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        {children}
      </Content>
    </AntLayout>
  );
};

export default Layout;
