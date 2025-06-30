'use client';

import { useState } from 'react';
import { Form, Input, Button, Card, message, Checkbox, Typography } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [form] = Form.useForm();

  const handleLogin = async (values: { employeeId: string; password: string }) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        // 儲存登入狀態
        localStorage.setItem('isLogin', '1');
        localStorage.setItem('user', JSON.stringify(result.data.user));
        message.success('登入成功');
        // 直接 reload，確保 Navbar 立即顯示
        window.location.href = '/';
      } else {
        message.error(result.error || '登入失敗');
      }
    } catch (error) {
      console.error('登入錯誤:', error);
      message.error('登入失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `url('/bg.jpg') center 80px / 1900px no-repeat, linear-gradient(135deg, #f0f4ff 0%, #e6f7ff 50%)`,
        backgroundAttachment: 'fixed',
      }}
    >
      <Card
        style={{ width: 380, borderRadius: 16, boxShadow: '0 4px 32px #0001', padding: 0 }}
        bodyStyle={{ padding: 32 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Image src="/next.svg" alt="logo" width={48} height={48} style={{ marginBottom: 8 }} />
          <Typography.Title level={3} style={{ marginBottom: 0 }}>專案追蹤系統</Typography.Title>
          <Typography.Text type="secondary">請登入您的帳號</Typography.Text>
        </div>
        <Form
          form={form}
          onFinish={handleLogin}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="employeeId"
            rules={[{ required: true, message: '請輸入工號' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#1677ff' }} />}
              placeholder="工號"
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '請輸入密碼' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#1677ff' }} />}
              placeholder="密碼"
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 8 }}>
            <Checkbox>記住我</Checkbox>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              icon={<LoginOutlined />}
              style={{ fontWeight: 600, letterSpacing: 2 }}
            >
              登入
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: 24, color: '#888', fontSize: 13 }}>
          <span>© {new Date().getFullYear()} Project Tracking System</span>
        </div>
      </Card>
    </div>
  );
} 