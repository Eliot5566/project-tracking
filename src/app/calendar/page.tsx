'use client';

import { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Modal, Form, Input, DatePicker, Select, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { PlusOutlined } from '@ant-design/icons';

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

const CalendarPage = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm<EventFormValues>();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calendar');
      const result = await response.json();
      
      if (result.success) {
        setEvents(result.data);
      } else {
        message.error('獲取行事曆事件失敗');
      }
    } catch (error) {
      console.error('獲取行事曆事件錯誤:', error);
      message.error('獲取行事曆事件失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async (values: EventFormValues) => {
    try {
      const [startDate, endDate] = values.dateRange;
      
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          type: values.type,
          startDate: startDate.format('YYYY-MM-DD HH:mm:ss'),
          endDate: endDate.format('YYYY-MM-DD HH:mm:ss'),
        }),
      });

      const result = await response.json();

      if (result.success) {
        message.success('新增事件成功');
        setIsModalVisible(false);
        form.resetFields();
        fetchEvents();
      } else {
        message.error('新增事件失敗');
      }
    } catch (error) {
      console.error('新增事件錯誤:', error);
      message.error('新增事件失敗');
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case '會議':
        return 'blue';
      case '任務':
        return 'green';
      case '提醒':
        return 'orange';
      case '其他':
        return 'gray';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<CalendarEvent> = [
    {
      title: '事件標題',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '類型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color={getEventTypeColor(type)}>{type}</Tag>
      ),
    },
    {
      title: '開始時間',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '結束時間',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
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
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
  ];

  return (
    <div className="p-6">
      <Card 
        title="行事曆" 
        className="mb-6"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            新增事件
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={events}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 個事件`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title="新增事件"
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
          onFinish={handleAddEvent}
        >
          <Form.Item
            name="title"
            label="事件標題"
            rules={[{ required: true, message: '請輸入事件標題' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="事件類型"
            rules={[{ required: true, message: '請選擇事件類型' }]}
          >
            <Select>
              <Select.Option value="會議">會議</Select.Option>
              <Select.Option value="任務">任務</Select.Option>
              <Select.Option value="提醒">提醒</Select.Option>
              <Select.Option value="其他">其他</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="時間範圍"
            rules={[{ required: true, message: '請選擇時間範圍' }]}
          >
            <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" />
          </Form.Item>

          <Form.Item
            name="description"
            label="事件描述"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CalendarPage; 