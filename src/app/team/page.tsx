"use client";

import { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Modal, Form, Input, Select, message, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

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
  department: string;
  status: string;
}

interface TeamMemberFormData {
  name: string;
  role: string;
  email: string;
  department: string;
  status: string;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
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

  const handleAddMember = async () => {
    try {
      const values = await form.validateFields();
      if (!values.department || !values.status) {
        message.error('請填寫所有必要欄位，包括部門和狀態');
        return;
      }
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (result.success) {
        message.success('新增團隊成員成功');
        setModalVisible(false);
        fetchMembers();
      } else {
        message.error(result.error || '新增團隊成員失敗');
      }
    } catch (error) {
      console.error('新增團隊成員失敗:', error);
      message.error('新增團隊成員失敗');
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
      title: '部門',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '活躍' : '非活躍'}
        </Tag>
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
    <div style={{ padding: '24px' }}>
      <Card
        title="團隊管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalVisible(true)}
          >
            添加成員
          </Button>
        }
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
        />
      </Card>

      <Modal
        title="新增團隊成員"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleAddMember}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '請輸入姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="電子郵件" rules={[{ required: true, message: '請輸入電子郵件' }, { type: 'email', message: '請輸入有效的電子郵件地址' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="職位" rules={[{ required: true, message: '請選擇職位' }]}>
            <Select options={[{ value: 'manager', label: '經理' }, { value: 'developer', label: '開發人員' }, { value: 'designer', label: '設計師' }]} />
          </Form.Item>
          <Form.Item name="department" label="部門" rules={[{ required: true, message: '請選擇部門' }]}>
            <Select options={[{ value: 'management', label: '管理部' }, { value: 'development', label: '技術部' }, { value: 'design', label: '設計部' }]} />
          </Form.Item>
          <Form.Item name="status" label="狀態" rules={[{ required: true, message: '請選擇狀態' }]}>
            <Select options={[{ value: 'active', label: '活躍' }, { value: 'inactive', label: '非活躍' }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}