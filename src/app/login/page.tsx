'use client';

import { useState } from 'react';
import { Form, Input, Button, Card, message, Checkbox, Typography } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useI18n } from '../components/I18nProvider';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [form] = Form.useForm();
  const { t } = useI18n();

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
        message.success(t('login.submit'));
        // 直接 reload，確保 Navbar 立即顯示
        window.location.href = '/';
      } else {
        message.error(result.error || t('login.password.required'));
      }
    } catch (error) {
      console.error('登入錯誤:', error);
      message.error(t('login.password.required'));
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
          <Typography.Title level={3} style={{ marginBottom: 0 }}>{t('login.title')}</Typography.Title>
          <Typography.Text type="secondary">{t('login.subtitle')}</Typography.Text>
        </div>
        <Form
          form={form}
          onFinish={handleLogin}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="employeeId"
            rules={[{ required: true, message: t('login.username.required') }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#1677ff' }} />}
              placeholder={t('login.username')}
              autoComplete="username"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: t('login.password.required') }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#1677ff' }} />}
              placeholder={t('login.password')}
              autoComplete="current-password"
            />
          </Form.Item>
          <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 8 }}>
            <Checkbox>{t('login.remember')}</Checkbox>
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
              {t('login.submit')}
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: 24, color: '#888', fontSize: 13 }}>
          <span>© {new Date().getFullYear()} {t('footer.copyright')}</span>
        </div>
      </Card>
    </div>
  );
} 