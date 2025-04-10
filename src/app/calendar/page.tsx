'use client';

import { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Modal, Form, Input, DatePicker, Select, message, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

// 移除直接導入伺服器端 API 路由
// import { fetchEvents, createEvent, updateEvent, deleteEvent } from '../api/calendar/route';

const { RangePicker } = DatePicker;

interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: string;
  projectId: number | null;
  taskId: number | null;
  projectName?: string;
  taskName?: string;
  createdAt: string;
  updatedAt: string;
}

interface EventFormValues {
  title: string;
  type: string;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
  description: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [form] = Form.useForm();

  // 使用 fetch API 替換直接導入的函數
  const fetchCalendarEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/calendar');
      const result = await response.json();
      
      if (result.success) {
        setEvents(result.data);
      } else {
        message.error('無法加載日曆事件');
      }
    } catch (error) {
      console.error('獲取事件發生錯誤:', error);
      message.error('無法加載日曆事件');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  const handleSaveEvent = async (values: any) => {
    try {
      const { dateRange, ...eventData } = values;
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      
      const eventPayload = {
        ...eventData,
        startDate,
        endDate
      };

      let response;
      
      if (editingEvent) {
        // 更新事件
        response = await fetch(`/api/calendar?id=${editingEvent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventPayload)
        });
      } else {
        // 創建事件
        response = await fetch('/api/calendar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(eventPayload)
        });
      }

      const result = await response.json();
      
      if (result.success) {
        message.success(editingEvent ? '事件更新成功' : '事件創建成功');
        setModalVisible(false);
        form.resetFields();
        fetchCalendarEvents();
      } else {
        message.error(result.error || '保存事件失敗');
      }
    } catch (error) {
      console.error('保存事件錯誤:', error);
      message.error('保存事件失敗');
    }
  };

  const handleDeleteEvent = async (id: number) => {
    try {
      const response = await fetch(`/api/calendar?id=${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        message.success('事件刪除成功');
        fetchCalendarEvents();
      } else {
        message.error(result.error || '刪除事件失敗');
      }
    } catch (error) {
      console.error('刪除事件錯誤:', error);
      message.error('刪除事件失敗');
    }
  };

  const columns: ColumnsType<CalendarEvent> = [
    {
      title: '標題',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '開始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '結束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '類型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color={type === 'project' ? 'blue' : 'green'}>{type}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingEvent(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          />
          <Popconfirm
            title="確定刪除此事件嗎？"
            onConfirm={() => handleDeleteEvent(record.id)}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="日曆事件管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingEvent(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            添加事件
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={events}
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editingEvent ? '編輯事件' : '添加事件'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveEvent}
        >
          <Form.Item
            name="title"
            label="標題"
            rules={[{ required: true, message: '請輸入標題' }]}
          >
            <Input placeholder="輸入事件標題" />
          </Form.Item>
          <Form.Item
            name="description"
            label="描述"
          >
            <Input.TextArea placeholder="輸入事件描述" />
          </Form.Item>
          <Form.Item
            name="dateRange"
            label="日期範圍"
            rules={[{ required: true, message: '請選擇日期範圍' }]}
          >
            <RangePicker />
          </Form.Item>
          <Form.Item
            name="type"
            label="類型"
            rules={[{ required: true, message: '請選擇類型' }]}
          >
            <Select placeholder="選擇事件類型">
              <Select.Option value="project">專案</Select.Option>
              <Select.Option value="task">任務</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}