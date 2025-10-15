'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, Button, Modal, Form, Input, DatePicker, Select, message, Popconfirm, Space } from 'antd';
import dayjs from 'dayjs';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = dayjsLocalizer(dayjs as any);

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

interface CalendarEventUI extends CalendarEventDTO { start: Date; end: Date; }

export default function CalendarPage() {
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<CalendarEventUI[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEventUI | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const tempIdRef = useRef<number | null>(null);
  const [viewDate, setViewDate] = useState(new Date());
  // IME/輸入追蹤
  const composingRef = useRef(false);
  const composingDescRef = useRef(false);
  const titleInputRef = useRef<any>(null);
  const descInputRef = useRef<any>(null);
  useEffect(() => { setMounted(true); }, []);

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
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCalendarEvents(); }, [fetchCalendarEvents]);

  const handleSaveEvent = async (values?: any) => {
    try {
      setSubmitting(true);
      const v = values ?? form.getFieldsValue(true);
      // 取得與修剪欄位
      const rawTitle = v.title;
      const title: string = typeof rawTitle === 'string' ? rawTitle.trim() : '';
      const date = v.date;
      const type: string = (v.type ?? '').toString();
      const description = v.description ?? '';
      // 兼容：若 date 不是 dayjs，嘗試轉換
      const d = (date && typeof date.format === 'function') ? date : (date ? dayjs(date) : null);
      const startDate = d ? d.format('YYYY-MM-DD') : '';
      const endDate = startDate; // 單一天
      // 前置檢查，避免送出不完整 payload 造成 400
      if (!title || !startDate || !endDate || !type) {
        console.warn('缺少必要欄位，取消送出', { title, startDate, endDate, type });
        form.setFields([
          ...(title ? [] : [{ name: 'title', errors: ['請輸入標題'] }]),
          ...(d ? [] : [{ name: 'date', errors: ['請選擇日期'] }]),
          ...(type ? [] : [{ name: 'type', errors: ['請選擇類型'] }])
        ] as any);
        message.error('請完整填寫表單');
        return;
      }
      const eventPayload = { title, description, type, startDate, endDate };
      console.debug('送出事件 payload:', eventPayload);

      // 樂觀更新：編輯→立即覆蓋；新增→先推暫時事件
      if (editingEvent) {
        setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? { ...editingEvent, ...eventPayload, start: new Date(startDate), end: new Date(endDate) } : ev));
      } else {
        const tempId = Date.now();
        tempIdRef.current = tempId;
        setEvents(prev => ([{ id: tempId, description: eventPayload.description||'', type: eventPayload.type, title: eventPayload.title, startDate, endDate, start: new Date(startDate), end: new Date(endDate), projectId: null, taskId: null, createdAt: '', updatedAt: '' }, ...prev] as any));
      }

      const res = await fetch('/api/calendar', { method: editingEvent ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingEvent ? { id: editingEvent.id, ...eventPayload } : eventPayload) });
      const result = await res.json();
      if (result.success) {
        message.success(editingEvent ? '事件更新成功' : '事件建立成功');
        setModalVisible(false);
        form.resetFields();
        // 用正式資料取代暫時事件 / 或更新編輯後資料（再確保時間戳同步）
        if (editingEvent) {
          setEvents(prev => prev.map(ev => ev.id === editingEvent.id ? { ...ev, ...result.data, start: new Date(result.data.startDate), end: new Date(result.data.endDate) } : ev));
        } else if (tempIdRef.current) {
          const tid = tempIdRef.current;
            setEvents(prev => prev.map(ev => ev.id === tid ? { ...result.data, start: new Date(result.data.startDate), end: new Date(result.data.endDate) } : ev));
          tempIdRef.current = null;
        }
      } else {
        message.error(result.error || '保存事件失敗');
        // 回滾：重新抓取（簡化處理）
        fetchCalendarEvents();
      }
  } catch (error: any) {
        console.error('保存事件錯誤:', error);
        message.error('保存事件失敗');
    } finally { setSubmitting(false); }
  };

  const handleDeleteEvent = async (id: number) => {
    // 樂觀刪除 + 回滾
    const backup = events;
    setEvents(prev => prev.filter(e => e.id !== id));
    try {
      const response = await fetch(`/api/calendar?id=${id}`, { method: 'DELETE' });
      const result = await response.json();
      if (result.success) { message.success('事件刪除成功'); }
      else { message.error(result.error || '刪除事件失敗'); setEvents(backup); }
    } catch (error) { console.error('刪除事件錯誤:', error); message.error('刪除事件失敗'); setEvents(backup); }
  };

  const eventPropGetter = (event: CalendarEventUI) => {
    const color = event.type === 'project' ? '#1677ff' : event.type === 'task' ? '#52c41a' : '#faad14';
    return { style: { backgroundColor: color, border: 'none', color: '#fff' } };
  };

  const onSelectSlot = (slotInfo: any) => {
  console.log('[Calendar] onSelectSlot:', slotInfo);
    // 僅在從編輯轉成新增時重置
    if (editingEvent) form.resetFields();
    setEditingEvent(null);
    form.setFieldsValue({ date: dayjs(slotInfo.start), type: 'other' });
    setModalVisible(true);
  };

  const onSelectEvent = (e: CalendarEventUI) => {
  console.log('[Calendar] onSelectEvent:', e);
    setEditingEvent(e);
    form.resetFields();
    form.setFieldsValue({
      title: e.title,
      description: e.description,
      type: e.type,
  date: dayjs(e.startDate)
    });
    setModalVisible(true);
  };

  return (
    <div style={{ padding: 24 }}>
  {!mounted ? null : (<>
  <Card
        title="行事曆 (月)"
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { if (editingEvent) form.resetFields(); setEditingEvent(null); form.setFieldsValue({ type:'other', date: dayjs() }); setModalVisible(true); }}>新增事件</Button>
          </Space>
        }
      >
        <div style={{ height: 640 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            selectable
            popup
            views={['month']}
            date={viewDate}
            onNavigate={(d) => setViewDate(d)}
            onSelectSlot={onSelectSlot}
            onSelectEvent={onSelectEvent}
            eventPropGetter={eventPropGetter}
            messages={{ today: '今天', previous: '上一頁', next: '下一頁', month: '月', week: '週', day: '日', agenda: '列表' }}
          />
        </div>
      </Card>

      <Modal title={editingEvent ? '編輯事件' : '新增事件'} open={modalVisible} onCancel={() => setModalVisible(false)} footer={null}>
        <Form
          form={form}
          layout="vertical"
          onValuesChange={(changed, all)=>{
            if(Object.prototype.hasOwnProperty.call(changed, 'title')){
              console.log('[Form] title changed:', changed.title, { length: typeof changed.title === 'string' ? changed.title.length : undefined });
            }
            if(Object.prototype.hasOwnProperty.call(changed, 'description')){
              const dv = changed.description;
              console.log('[Form] description changed:', dv, { length: typeof dv === 'string' ? dv.length : undefined });
            }
          }}
          onFinish={(vals)=>{
            console.log('[Form] onFinish raw vals:', vals);
            const { title: fvTitle, date: fvDate, type: fvType, description: fvDescription } = form.getFieldsValue(['title','date','type','description']);
            console.log('[Form] getFieldsValue snapshot:', { fvTitle, fvDate, fvType, fvDescription, composingTitle: composingRef.current, composingDesc: composingDescRef.current });
            const rawTitle = (typeof fvTitle !== 'undefined') ? fvTitle : vals?.title;
            const title = (rawTitle ?? '').toString().trim();
            const errs:any[] = [];
            if(!title) errs.push({ name:'title', errors:['請輸入標題']});
            if(!vals?.date) errs.push({ name:'date', errors:['請選擇日期']});
            if(!vals?.type) errs.push({ name:'type', errors:['請選擇類型']});
            if(errs.length){ form.setFields(errs); const first = errs[0]?.errors?.[0]; if(first) message.error(first); return; }
            handleSaveEvent({ ...vals, title, description: typeof fvDescription !== 'undefined' ? fvDescription : vals?.description });
          }}
          onFinishFailed={(info)=>{
            const first = info.errorFields?.[0]?.errors?.[0];
            if(first) message.error(first); else message.error('請檢查表單欄位');
          }}
        >
          <Form.Item name="title" label="標題">
            <Input
              ref={titleInputRef}
              autoComplete="off"
              allowClear
              onCompositionStart={()=>{ composingRef.current = true; console.log('[Input.title] composition start'); }}
              onCompositionEnd={(e)=>{ composingRef.current = false; console.log('[Input.title] composition end:', (e.target as HTMLInputElement).value); }}
              onChange={(e)=>{ console.log('[Input.title] onChange:', e.target.value, { length: e.target.value?.length }); }}
              onBlur={(e)=>{ console.log('[Input.title] onBlur:', e.target.value); }}
            />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea
              ref={descInputRef}
              rows={3}
              onCompositionStart={()=>{ composingDescRef.current = true; console.log('[Input.description] composition start'); }}
              onCompositionEnd={(e)=>{ composingDescRef.current = false; console.log('[Input.description] composition end:', (e.target as HTMLTextAreaElement).value); }}
              onChange={(e)=>{ console.log('[Input.description] onChange:', e.target.value, { length: e.target.value?.length }); }}
              onBlur={(e)=>{ console.log('[Input.description] onBlur:', e.target.value); }}
            />
          </Form.Item>
          <Form.Item name="date" label="日期" rules={[{ required: true, message: '請選擇日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="type" label="類型" rules={[{ required: true, message: '請選擇類型' }]}>
            <Select options={[{ value: 'project', label: '專案' }, { value: 'task', label: '任務' }, { value: 'other', label: '其他' }]} />
          </Form.Item>
          {editingEvent && (
            <Popconfirm title="確定刪除此事件?" onConfirm={() => handleDeleteEvent(editingEvent.id)}>
              <Button danger icon={<DeleteOutlined />}>刪除事件</Button>
            </Popconfirm>
          )}
          <Form.Item style={{ marginTop: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={submitting}
              onClick={() => {
                try {
                  // 送出前強制結束輸入並 blur，避免 IME 尚在組字造成值未提交
                  titleInputRef.current?.blur?.();
                  descInputRef.current?.blur?.();
                  if (typeof window !== 'undefined') {
                    const ae = document.activeElement as HTMLElement | null;
                    ae?.blur?.();
                  }
                  const curr = form.getFieldValue('title');
                  const currDesc = form.getFieldValue('description');
                  console.log('[Button.save] before submit title:', curr, 'desc:', currDesc);
                } catch {}
              }}
            >保存</Button>
          </Form.Item>
        </Form>
  </Modal>
  </>)}
    </div>
  );
}