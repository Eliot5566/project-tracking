'use client';
import { useEffect, useState, useRef } from 'react';
import { Card, Table, Button, Modal, Form, Input, DatePicker, Tag, Space, message, Popconfirm, Divider, Select } from 'antd';
import { PlusCircleOutlined, HolderOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
interface NoteItem { id?: number; unitName: string; responsibility: string; dueDate?: string | null; status?: string | null; orderIndex?: number }
interface MeetingNote { id: number; meetingDate: string; title: string; summary: string; createdAt: string; updatedAt: string; items?: NoteItem[] }
export default function NotesPage() { const [data, setData] = useState<MeetingNote[]>([]); const [loading, setLoading] = useState(false); const [modalOpen, setModalOpen] = useState(false); const [editing, setEditing] = useState<MeetingNote | null>(null); const [form] = Form.useForm(); const [search,setSearch] = useState(''); const searchRef = useRef<any>();
  const fetchNotes = async (q?:string) => { setLoading(true); try { const url = '/api/notes'+(q?`?q=${encodeURIComponent(q)}`:''); const res = await fetch(url); const json = await res.json(); if (json.success) setData(json.data); else message.error(json.error || '載入失敗'); } catch { message.error('取得會議記錄失敗'); } finally { setLoading(false); } };
  useEffect(() => { fetchNotes(); }, []);
  // debounce search
  useEffect(()=>{ const h = setTimeout(()=>fetchNotes(search.trim()), 400); return ()=>clearTimeout(h); }, [search]);
  const openCreate = () => { setEditing(null); form.resetFields(); setModalOpen(true); };
  const openEdit = (record: MeetingNote) => {
    setEditing(record);
    form.setFieldsValue({
      meetingDate: record.meetingDate ? dayjs(record.meetingDate) : null,
      title: record.title,
      summary: record.summary,
      items: (record.items || []).map(it => ({
        unitName: it.unitName,
        responsibility: it.responsibility,
        dueDate: it.dueDate ? dayjs(it.dueDate) : null,
        status: it.status
      }))
    });
    setModalOpen(true);
  };
  const save = async (values: any) => {
    const payload = {
      id: editing?.id,
      meetingDate: values.meetingDate?.format('YYYY-MM-DD') || null,
      title: values.title,
      summary: values.summary || '',
      items: (values.items || []).map((it: any, idx: number) => ({
        unitName: it.unitName,
        responsibility: it.responsibility || '',
        dueDate: it.dueDate ? it.dueDate.format('YYYY-MM-DD') : null,
        status: it.status || null,
        orderIndex: idx
      }))
    };
    try {
      // 樂觀更新：先更新前端
      if (editing) {
        setData(prev => prev.map(n => n.id === editing.id ? { ...n, ...payload, items: payload.items } as any : n));
      }
      const createTempId = Date.now();
      if (!editing) {
        setData(prev => [{ id: createTempId, meetingDate: payload.meetingDate||'', title: payload.title, summary: payload.summary, createdAt:'', updatedAt:'', items: payload.items }, ...prev]);
      }
      const res = await fetch('/api/notes', { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await res.json();
      if (json.success) {
        message.success(editing ? '已更新' : '已建立');
        setModalOpen(false); form.resetFields();
        if (!editing) {
          // 取代暫時 id
            setData(prev => prev.map(n => n.id === createTempId ? json.data : n));
        } else {
          setData(prev => prev.map(n => n.id === json.data.id ? json.data : n));
        }
      } else {
        message.error(json.error || '保存失敗');
        fetchNotes(search);
      }
    } catch { message.error('保存失敗'); }
  };
  const remove = async (record: MeetingNote) => { const backup = data; setData(prev => prev.filter(n => n.id !== record.id)); try { const res = await fetch('/api/notes?id=' + record.id, { method: 'DELETE' }); const json = await res.json(); if (json.success) { message.success('已刪除'); } else { message.error(json.error || '刪除失敗'); setData(backup); } } catch { message.error('刪除失敗'); setData(backup); } };
  const statusTag = (s: string | null | undefined) => { if (!s) return <Tag>未設定</Tag>; const color = s === '完成' ? 'green' : s === '進行中' ? 'blue' : s === '延遲' ? 'red' : 'default'; return <Tag color={color}>{s}</Tag>; };
  const columns: ColumnsType<MeetingNote> = [
    { title: '會議日期', dataIndex: 'meetingDate', render: d => d ? dayjs(d).format('YYYY-MM-DD') : '-' },
    { title: '標題', dataIndex: 'title' },
    { title: '摘要', dataIndex: 'summary', ellipsis: true },
    { title: '單位項目數', render: (_, r) => r.items?.length || 0 },
  { title: '進度概要', render: (_, r) => (r.items||[]).slice(0,3).map(it => <Tag key={it.unitName+it.orderIndex}>{it.unitName}:{it.status||'—'}</Tag>) },
    { title: '操作', key: 'actions', fixed: 'right', render: (_, r) => (<Space><Button size="small" icon={<EditOutlined />} onClick={() => openEdit(r)} /><Popconfirm title="確定刪除?" onConfirm={() => remove(r)}><Button size="small" danger icon={<DeleteOutlined />} /></Popconfirm></Space>) }
  ];
  return (
    <div style={{ padding: 24 }}>
  <Card title="會議紀錄 (Notes)" extra={<Space> <Input.Search allowClear placeholder="搜尋標題 / 摘要 / 單位 / 行動項..." style={{ width:320 }} onChange={e=>setSearch(e.target.value)} /> <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增紀錄</Button></Space>}>
        <Table dataSource={data} scroll={{ x: 1000 }} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} expandable={{ expandedRowRender: (record) => (
          <div>
            {(record.items||[]).map(it => (
              <div key={it.unitName+it.orderIndex} style={{ display:'flex', gap:8, padding:'4px 0', alignItems:'center', flexWrap:'wrap' }}>
                <Tag color="geekblue">{it.unitName}</Tag>
                <span style={{ flex:1 }}>{it.responsibility}</span>
                {it.dueDate && <Tag color="purple">{dayjs(it.dueDate).format('MM/DD')}</Tag>}
                {statusTag(it.status||null)}
              </div>
            ))}
            {!(record.items||[]).length && <i style={{ color:'#999' }}>無項目</i>}
          </div>
        ) }} />
      </Card>
      <Modal width={880} title={editing ? '編輯會議紀錄' : '新增會議紀錄'} open={modalOpen} onCancel={() => setModalOpen(false)} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={save} initialValues={{ items: [{ unitName:'A單位', responsibility:'' }, { unitName:'B單位', responsibility:'' }] }}>
          <Form.Item name="meetingDate" label="會議日期" rules={[{ required: true, message: '請選擇日期' }]}><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="title" label="標題" rules={[{ required: true }]}><Input placeholder="如：專案啟動會 / 例行週會" /></Form.Item>
            <Form.Item name="summary" label="摘要"><Input.TextArea rows={3} placeholder="本次重點、決議、風險..." /></Form.Item>
          <Divider orientation="left">單位 / 任務項目</Divider>
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {fields.map((field, index) => (
                  <Card size="small" key={field.key} bodyStyle={{ padding:12 }}
                    title={<Space style={{ cursor:'move' }} draggable onDragStart={(e)=>{ e.dataTransfer.setData('text/plain', String(index)); }} onDragOver={e=>e.preventDefault()} onDrop={e=>{ const from = Number(e.dataTransfer.getData('text/plain')); if (from===index) return; const items = [...(form.getFieldValue('items')||[])]; const moved = items.splice(from,1)[0]; items.splice(index,0,moved); form.setFieldsValue({ items }); }}>
                      <HolderOutlined />
                      <Form.Item {...field} name={[field.name,'unitName']} noStyle rules={[{ required:true, message:'請輸入單位名稱' }]}><Input placeholder="單位 / 組別 / 角色" /></Form.Item>
                    </Space>}
                    extra={<Popconfirm title="刪除此項目?" onConfirm={() => remove(field.name)}><Button size="small" danger>移除</Button></Popconfirm>}>
                    <Space direction="vertical" style={{ width:'100%' }} size="small">
                      <Form.Item name={[field.name,'responsibility']} label="負責內容" rules={[{ required:true, message:'請輸入負責內容' }]}><Input.TextArea autoSize placeholder="交付項 / 行動項 (Action Item)" /></Form.Item>
                      <Space wrap>
                        <Form.Item name={[field.name,'dueDate']} label="完成日"><DatePicker /></Form.Item>
                        <Form.Item name={[field.name,'status']} label="狀態">
                          <Select style={{ width:140 }} allowClear placeholder="選擇" options={[ '未開始','進行中','完成','延遲','阻塞' ].map(v=>({ value:v, label:v }))} />
                        </Form.Item>
                      </Space>
                    </Space>
                  </Card>
                ))}
                <Button type="dashed" icon={<PlusCircleOutlined />} onClick={() => add({ unitName:'', responsibility:'' })}>新增單位 / 項目</Button>
              </div>
            )}
          </Form.List>
          <Form.Item style={{ marginTop: 24 }}>
            <Space style={{ width:'100%', justifyContent:'space-between' }}>
              {editing && (
                <Popconfirm title="確定刪除此會議紀錄?" onConfirm={async () => { if(!editing) return; try { const r = await fetch('/api/notes?id='+editing.id, { method:'DELETE' }); const j = await r.json(); if(j.success){ message.success('已刪除'); setModalOpen(false); fetchNotes(); } else message.error(j.error||'刪除失敗'); } catch { message.error('刪除失敗'); } }}>
                  <Button danger>刪除紀錄</Button>
                </Popconfirm>
              )}
              <Button type="primary" htmlType="submit" style={{ minWidth:160 }}>{editing ? '更新紀錄' : '建立紀錄'}</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
