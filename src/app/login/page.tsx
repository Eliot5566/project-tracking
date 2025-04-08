'use client';

import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

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
        // 儲存 token
        Cookies.set('token', result.data.token, { expires: 7 });
        // 儲存使用者資訊
        localStorage.setItem('user', JSON.stringify(result.data.user));
        message.success('登入成功');
        router.push('/');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-96">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">專案追蹤系統</h1>
          <p className="text-gray-500">請登入您的帳號</p>
        </div>

        <Form
          form={form}
          onFinish={handleLogin}
          layout="vertical"
        >
          <Form.Item
            name="employeeId"
            rules={[{ required: true, message: '請輸入工號' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="工號"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '請輸入密碼' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密碼"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
            >
              登入
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
} 