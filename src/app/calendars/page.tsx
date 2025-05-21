'use client';

import { useEffect, useState } from 'react';
import { Card, Spin, message, Modal, Input, Button } from 'antd';
import { Calendar, momentLocalizer, Event } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export default function CalendarsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEvent, setModalEvent] = useState<any>(null);
  const [modalTitle, setModalTitle] = useState('');

  // 載入事件
  const fetchEvents = () => {
    setLoading(true);
    fetch('/api/calendars')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const fixedEvents = data.data.map((evt: any) => ({
            ...evt,
            start: new Date(evt.start),
            end: new Date(evt.end),
          }));
          setEvents(fixedEvents);
        } else {
          message.error('載入日曆資料失敗');
        }
      })
      .catch(() => message.error('載入日曆資料失敗'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // 點擊空白區新增
  const handleSelectSlot = (slotInfo: any) => {
    setModalEvent({
      id: null,
      type: 'task',
      start: slotInfo.start,
      end: slotInfo.end,
    });
    setModalTitle('');
    setModalOpen(true);
  };

  // 點擊事件編輯
  const handleSelectEvent = (event: any) => {
    setModalEvent(event);
    setModalTitle(event.title.replace(/^\[.*?\]\s*/, ''));
    setModalOpen(true);
  };

  // 新增/編輯事件
  const handleModalOk = async () => {
    if (!modalTitle) {
      message.error('請輸入標題');
      return;
    }
    setLoading(true);
    if (modalEvent.id) {
      // 編輯
      await fetch('/api/calendars', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...modalEvent,
          title: modalTitle,
          start: modalEvent.start,
          end: modalEvent.end,
        }),
      });
    } else {
      // 新增
      await fetch('/api/calendars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: modalTitle,
          start: modalEvent.start,
          end: modalEvent.end,
          type: modalEvent.type,
        }),
      });
    }
    setModalOpen(false);
    fetchEvents();
  };

  // 刪除事件
  const handleDelete = async () => {
    if (!modalEvent?.id) return;
    setLoading(true);
    await fetch(`/api/calendars?id=${modalEvent.id}&type=${modalEvent.type}`, {
      method: 'DELETE',
    });
    setModalOpen(false);
    fetchEvents();
  };

  return (
    <Card title="日曆檢視" style={{ margin: 24 }}>
      <Spin spinning={loading}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
          popup
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
        />
      </Spin>
      <Modal
        open={modalOpen}
        title={modalEvent?.id ? '編輯事件' : '新增事件'}
        onOk={handleModalOk}
        onCancel={() => setModalOpen(false)}
        footer={[
          modalEvent?.id && (
            <Button danger key="delete" onClick={handleDelete}>
              刪除
            </Button>
          ),
          <Button key="cancel" onClick={() => setModalOpen(false)}>
            取消
          </Button>,
          <Button key="ok" type="primary" onClick={handleModalOk}>
            儲存
          </Button>,
        ]}
      >
        <Input
          value={modalTitle}
          onChange={e => setModalTitle(e.target.value)}
          placeholder="請輸入標題"
        />
      </Modal>
    </Card>
  );
}