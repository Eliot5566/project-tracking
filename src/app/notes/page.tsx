'use client';

import { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, DatePicker, Tag, Space, message, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface MeetingNote {
  id: number;
  meetingDate: string;
  title: string;
  summary: string;
  unitAResponsibility: string | null;
  unitADueDate: string | null;
  unitAStatus: string | null;
  unitBResponsibility: string | null;
  unitBDueDate: string | null;
  unitBStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function NotesPage() {
  const [data, setData] = useState<MeetingNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MeetingNote | null>(null);
  const [form] = Form.useForm();

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notes');
      const json = await res.json();
      if (json.success) setData(json.data);
      else message.error(json.error || '載入失敗');
    } catch (e) {
      message.error('取得會議記錄失敗');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchNotes(); }, []);

  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (record: MeetingNote) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      meetingDate: record.meetingDate ? dayjs(record.meetingDate) : null,
      unitADueDate: record.unitADueDate ? dayjs(record.unitADueDate) : null,
      unitBDueDate: record.unitBDueDate ? dayjs(record.unitBDueDate) : null
    });
    setModalOpen(true);
  };

  const save = async (values: any) => {
    const payload = {
      ...values,
      meetingDate: values.meetingDate?.format('YYYY-MM-DD') || null,
      unitADueDate: values.unitADueDate?.format('YYYY-MM-DD') || null,
      unitBDueDate: values.unitBDueDate?.format('YYYY-MM-DD') || null,
      id: editing?.id
    };
    try {
      const res = await fetch('/api/notes' + (editing ? '' : ''), {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        message.success(editing ? '已更新' : '已建立');
        setModalOpen(false); form.resetFields(); fetchNotes();
      } else message.error(json.error || '保存失敗');
    } catch { message.error('保存失敗'); }
  };

  const remove = async (record: MeetingNote) => {
    try {
      const res = await fetch('/api/notes?id=' + record.id, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) { message.success('已刪除'); fetchNotes(); }
      else message.error(json.error || '刪除失敗');
    } catch { message.error('刪除失敗'); }
  };

  const statusTag = (s: string | null) => {
    if (!s) return <Tag>未設定</Tag>;
    const color = s === '完成' ? 'green' : s === '進行中' ? 'blue' : s === '延遲' ? 'red' : 'default';
    return <Tag color={color}>{s}</Tag>;
  };

  const columns: ColumnsType<MeetingNote> = [
    { title: '會議日期', dataIndex: 'meetingDate', render: d => d ? dayjs(d).format('YYYY-MM-DD') : '-' },
    { title: '標題', dataIndex: 'title' },
    { title: '摘要', dataIndex: 'summary', ellipsis: true },
    { title: 'A單位內容', dataIndex: 'unitAResponsibility', width: 160, ellipsis: true },
    { title: 'A完成日', dataIndex: 'unitADueDate', render: d => d ? dayjs(d).format('YYYY-MM-DD') : '-' },
    { title: 'A狀態', dataIndex: 'unitAStatus', render: statusTag },
    { title: 'B單位內容', dataIndex: 'unitBResponsibility', width: 160, ellipsis: true },
    { title: 'B完成日', dataIndex: 'unitBDueDate', render: d => d ? dayjs(d).format('YYYY-MM-DD') : '-' },
    { title: 'B狀態', dataIndex: 'unitBStatus', render: statusTag },
    { title: '操作', key: 'actions', fixed: 'right', render: (_, r) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} />
        <Popconfirm title="確定刪除?" onConfirm={() => remove(r)}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm>
      </Space>
    ) }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="會議紀錄 (Notes)" extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增紀錄</Button>}>
        <Table
          dataSource={data}
            scroll={{ x: 1300 }}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
      <Modal title={editing ? '編輯會議紀錄' : '新增會議紀錄'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={save}>
          <Form.Item name="meetingDate" label="會議日期" rules={[{ required: true, message: '請選擇日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="title" label="標題" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="summary" label="摘要">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Card size="small" title="A 單位">
            <Form.Item name="unitAResponsibility" label="負責內容"><Input /></Form.Item>
            <Form.Item name="unitADueDate" label="完成日"><DatePicker style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="unitAStatus" label="狀態">
              <Input placeholder="例如: 進行中 / 完成 / 延遲" />
            </Form.Item>
          </Card>
          <Card size="small" title="B 單位" style={{ marginTop: 12 }}>
            <Form.Item name="unitBResponsibility" label="負責內容"><Input /></Form.Item>
            <Form.Item name="unitBDueDate" label="完成日"><DatePicker style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="unitBStatus" label="狀態">
              <Input placeholder="例如: 進行中 / 完成 / 延遲" />
            </Form.Item>
          </Card>
          <Form.Item style={{ marginTop: 16 }}>
            <Button type="primary" htmlType="submit" block>{editing ? '更新' : '建立'}</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
