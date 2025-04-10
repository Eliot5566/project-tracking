"use client";

import { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Modal, Form, Input, Select, message, Tooltip } from 'antd';
import { PlusOutlined, BulbOutlined } from '@ant-design/icons';
import { ConfigProvider, theme } from 'antd';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  projectCount: number;
  taskCount: number;
  averageProgress: number;
  createdAt: string;
  updatedAt: string;
}

interface TeamMemberFormData {
  name: string;
  role: string;
  email: string;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [form] = Form.useForm();

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/team');
      const result = await response.json();
      
      if (result.success) {
        setMembers(result.data);
      } else {
        message.error('獲取團隊成員失敗');
      }
    } catch (error) {
      console.error('獲取團隊成員失敗:', error);
      message.error('獲取團隊成員失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAddMember = async (values: TeamMemberFormData) => {
    try {
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      const result = await response.json();
      if (result.success) {
        message.success('添加團隊成員成功');
        setModalVisible(false);
        form.resetFields();
        fetchMembers();
      } else {
        message.error(result.error || '添加團隊成員失敗');
      }
    } catch (error) {
      console.error('添加團隊成員失敗:', error);
      message.error('添加團隊成員失敗');
    }
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tooltip title={role === '管理員' ? '擁有管理權限' : '普通成員'}>
          <Tag color={role === '管理員' ? 'red' : 'blue'}>{role}</Tag>
        </Tooltip>
      ),
    },
    {
      title: '負責專案數',
      dataIndex: 'projectCount',
      key: 'projectCount',
    },
    {
      title: '負責任務數',
      dataIndex: 'taskCount',
      key: 'taskCount',
    },
    {
      title: '平均完成進度',
      dataIndex: 'averageProgress',
      key: 'averageProgress',
      render: (progress: number) => (
        <Tooltip title={`平均完成進度為 ${progress.toFixed(2)}%`}>
          {progress.toFixed(2)}%
        </Tooltip>
      ),
    },
    {
      title: '電子郵件',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '加入時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <ConfigProvider
      theme={{
        algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <div style={{ padding: '24px' }}>
        <Card
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>團隊管理</span>
              <Button
                icon={<BulbOutlined />}
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? '切換到亮色模式' : '切換到暗色模式'}
              </Button>
            </div>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              添加成員
            </Button>
          }
          style={{ borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
        >
          <Table
            columns={columns}
            dataSource={members}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 位成員`,
            }}
            style={{ borderRadius: '8px', overflow: 'hidden' }}
          />
        </Card>

        <Modal
          title="添加團隊成員"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddMember}
          >
            <Form.Item
              name="name"
              label="姓名"
              rules={[{ required: true, message: '請輸入姓名' }]}
            >
              <Input placeholder="輸入成員姓名" />
            </Form.Item>
            <Form.Item
              name="role"
              label="角色"
              rules={[{ required: true, message: '請選擇角色' }]}
            >
              <Select placeholder="選擇角色">
                <Select.Option value="管理員">管理員</Select.Option>
                <Select.Option value="成員">成員</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="email"
              label="電子郵件"
              rules={[
                { required: true, message: '請輸入電子郵件' },
                { type: 'email', message: '請輸入有效的電子郵件地址' },
              ]}
            >
              <Input placeholder="輸入電子郵件" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                確定
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
}