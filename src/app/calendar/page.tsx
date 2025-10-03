'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, Button, Modal, Form, Input, DatePicker, Select, message, Popconfirm, Tag, Space } from 'antd';
import dayjs from 'dayjs';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Calendar, dayjsLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dayjsLocalizer(dayjs as any);

// 移除直接導入伺服器端 API 路由
// import { fetchEvents, createEvent, updateEvent, deleteEvent } from '../api/calendar/route';

const { RangePicker } = DatePicker;

interface CalendarEventDTO {
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

interface CalendarEventUI extends CalendarEventDTO {
  start: Date;
  end: Date;
}

interface EventFormValues {
  title: string;
  type: string;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
  description: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEventUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEventUI | null>(null);
  const [form] = Form.useForm();
  const [viewDate, setViewDate] = useState(new Date());
  const [view, setView] = useState<any>(Views.MONTH);

  // 使用 fetch API 替換直接導入的函數
  const fetchCalendarEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/calendar');
      const result = await response.json();
      
      if (result.success) {
        const mapped: CalendarEventUI[] = result.data.map((e: CalendarEventDTO) => ({
          ...e,
          start: new Date(e.startDate),
            end: new Date(e.endDate)
        }));
        setEvents(mapped);
      } else {
        message.error('無法加載日曆事件');
      }
    } catch (error) {
      console.error('獲取事件發生錯誤:', error);
      message.error('無法加載日曆事件');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCalendarEvents(); }, [fetchCalendarEvents]);

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
        response = await fetch(`/api/calendar`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingEvent.id, ...eventPayload })
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

  const eventPropGetter = (event: CalendarEventUI) => {
    const base: any = { style: {} };
    const color = event.type === 'project' ? '#1677ff' : event.type === 'task' ? '#52c41a' : '#faad14';
    base.style.backgroundColor = color;
    base.style.border = 'none';
    base.style.color = '#fff';
    return base;
  };

  const onSelectSlot = (slotInfo: any) => {
    setEditingEvent(null);
    form.resetFields();
    form.setFieldsValue({
      dateRange: [dayjs(slotInfo.start), dayjs(slotInfo.end)],
    });
    setModalVisible(true);
  };

  const onSelectEvent = (e: CalendarEventUI) => {
    setEditingEvent(e);
    form.resetFields();
    form.setFieldsValue({
      title: e.title,
      description: e.description,
      type: e.type,
      dateRange: [dayjs(e.startDate), dayjs(e.endDate)]
    });
    setModalVisible(true);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="行事曆 (月/週/日)"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingEvent(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >新增事件</Button>
            <Select
              size="small"
              value={view}
              onChange={(v) => setView(v)}
              options={[{ value: Views.MONTH, label: '月' }, { value: Views.WEEK, label: '週' }, { value: Views.DAY, label: '日' }]}
            />
          </Space>
        }
      >
        <div style={{ height: 600 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            selectable
            popup
            view={view}
            onView={(v) => setView(v)}
            date={viewDate}
            onNavigate={(d) => setViewDate(d)}
            onSelectSlot={onSelectSlot}
            onSelectEvent={onSelectEvent}
            eventPropGetter={eventPropGetter}
            messages={{ today: '今天', previous: '上一頁', next: '下一頁', month: '月', week: '週', day: '日', agenda: '列表' }}
          />
        </div>
      </Card>

      <Modal title={editingEvent ? '編輯事件' : '新增事件'} open={modalVisible} onCancel={() => setModalVisible(false)} footer={null} destroyOnClose>
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
              <Select.Option value="other">其他</Select.Option>
            </Select>
          </Form.Item>
          {editingEvent && (
            <Popconfirm title="刪除此事件?" onConfirm={() => handleDeleteEvent(editingEvent.id)}>
              <Button danger icon={<DeleteOutlined />}>刪除</Button>
            </Popconfirm>
          )}
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