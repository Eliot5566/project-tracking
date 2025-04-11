'use client';

import { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Modal, Form, Input, Select, message, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { PlusOutlined, BellOutlined } from '@ant-design/icons';

interface Notification {
  id: number;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  projectId: number | null;
  taskId: number | null;
  projectName?: string;
  taskName?: string;
  createdAt: string;
  updatedAt: string;
}

const NotificationsPage = () => {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications');
      const result = await response.json();
      
      if (result.success) {
        setNotifications(result.data);
      } else {
        message.error('獲取通知列表失敗');
      }
    } catch (error) {
      console.error('獲取通知列表錯誤:', error);
      message.error('獲取通知列表失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleAddNotification = async (values: any) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (result.success) {
        message.success('新增通知成功');
        setIsModalVisible(false);
        form.resetFields();
        fetchNotifications();
      } else {
        message.error('新增通知失敗');
      }
    } catch (error) {
      console.error('新增通知錯誤:', error);
      message.error('新增通知失敗');
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          isRead: true,
        }),
      });

      const result = await response.json();

      if (result.success) {
        message.success('標記為已讀成功');
        fetchNotifications();
      } else {
        message.error('標記為已讀失敗');
      }
    } catch (error) {
      console.error('標記為已讀錯誤:', error);
      message.error('標記為已讀失敗');
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case '系統':
        return 'blue';
      case '專案':
        return 'green';
      case '任務':
        return 'orange';
      case '提醒':
        return 'red';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<Notification> = [
    {
      title: '標題',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text: string, record: Notification) => (
        <div>
          {!record.isRead && <Badge dot />}
          {text}
        </div>
      ),
    },
    {
      title: '類型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={getNotificationTypeColor(type)}>{type}</Tag>
      ),
    },
    {
      title: '內容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '關聯專案',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 150,
    },
    {
      title: '關聯任務',
      dataIndex: 'taskName',
      key: 'taskName',
      width: 150,
    },
    {
      title: '創建時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => handleMarkAsRead(record.id)}
          disabled={record.isRead}
        >
          標記為已讀
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card 
        title="通知中心" 
        className="mb-6"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            新增通知
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={notifications}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 個通知`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title="新增通知"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddNotification}
        >
          <Form.Item
            name="title"
            label="通知標題"
            rules={[{ required: true, message: '請輸入通知標題' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="通知類型"
            rules={[{ required: true, message: '請選擇通知類型' }]}
          >
            <Select>
              <Select.Option value="系統">系統</Select.Option>
              <Select.Option value="專案">專案</Select.Option>
              <Select.Option value="任務">任務</Select.Option>
              <Select.Option value="提醒">提醒</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="通知內容"
            rules={[{ required: true, message: '請輸入通知內容' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default NotificationsPage; 