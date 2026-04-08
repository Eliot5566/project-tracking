'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Card, Select, DatePicker, Input, Button, Space, Tag, message, Collapse, Modal, Form } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

interface TodoItem {
  id: number;
  userId: number;
  userName?: string;
  title: string;
  content: string;
  dueDate?: string;
  status: string;
  priority: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TeamMember {
  id: number;
  name: string;
}

type DateRangeValue = [Dayjs | null, Dayjs | null] | null;

const statusColorMap: Record<string, string> = {
  pending: 'default',
  in_progress: 'processing',
  completed: 'success',
};

const priorityColorMap: Record<string, string> = {
  high: 'error',
  medium: 'warning',
  low: 'default',
};

const statusLabelMap: Record<string, string> = {
  pending: '待處理',
  in_progress: '進行中',
  completed: '已完成',
};

const priorityLabelMap: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

export default function TodosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<TodoItem[]>([]);
  const [users, setUsers] = useState<TeamMember[]>([]);

  const [selectedUserId, setSelectedUserId] = useState<string>('others');
  const [keyword, setKeyword] = useState('');
  const [dateRange, setDateRange] = useState<DateRangeValue>(null);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [priority, setPriority] = useState<string | undefined>(undefined);

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [createForm] = Form.useForm();
  const [createLoading, setCreateLoading] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<TodoItem | null>(null);
  const [editForm] = Form.useForm();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isLogin = localStorage.getItem('isLogin') === '1';
    if (!isLogin) {
      router.replace('/login');
      return;
    }

    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const id = Number(user.teamMemberId || user.id || user.userId);
        if (!Number.isNaN(id)) setCurrentUserId(id);
      }
    } catch {
      // ignore
    }
  }, [router]);

  const userOptions = useMemo(() => {
    const base = [
      { value: 'all', label: '全部使用者' },
    ];
    return base.concat(users.map((u) => ({ value: String(u.id), label: u.name })));
  }, [users]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/team');
      const json = await res.json();
      if (json.success) {
        setUsers((json.data || []).map((u: any) => ({ id: Number(u.id), name: u.name })));
      }
    } catch {
      message.error('取得使用者清單失敗');
    }
  };

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (selectedUserId === 'others') {
        const others = users
          .filter((u) => currentUserId == null || u.id !== currentUserId)
          .map((u) => u.id);
        if (others.length > 0) params.set('userIds', others.join(','));
      } else if (selectedUserId !== 'all') {
        params.set('userId', selectedUserId);
      }

      if (keyword.trim()) params.set('keyword', keyword.trim());
      if (status) params.set('status', status);
      if (priority) params.set('priority', priority);

      if (dateRange && dateRange[0] && dateRange[1]) {
        params.set('startDate', dateRange[0].format('YYYY-MM-DD'));
        params.set('endDate', dateRange[1].format('YYYY-MM-DD'));
      }

      const res2 = await fetch(`/api/todos?${params.toString()}`);
      const json = await res2.json();
      if (json.success) {
        setRows(json.data || []);
      } else {
        message.error(json.error || '查詢代辦事項失敗');
      }
    } catch {
      message.error('查詢代辦事項失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, currentUserId]);

  const handleClear = () => {
    setSelectedUserId('others');
    setKeyword('');
    setDateRange(null);
    setStatus(undefined);
    setPriority(undefined);
  };

  const handleCreate = async (values: any) => {
    if (!currentUserId) {
      message.error('無法取得登入者資訊');
      return;
    }
    setCreateLoading(true);
    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          title: values.title,
          content: values.content || '',
          dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
          status: values.status,
          priority: values.priority,
        }),
      });
      const json = await res.json();
      if (json.success) {
        message.success('新增代辦成功');
        createForm.resetFields();
        fetchTodos();
      } else {
        message.error(json.error || '新增代辦失敗');
      }
    } catch {
      message.error('新增代辦失敗');
    } finally {
      setCreateLoading(false);
    }
  };

  const openEdit = (row: TodoItem) => {
    setEditingItem(row);
    editForm.setFieldsValue({
      title: row.title,
      content: row.content,
      dueDate: row.dueDate ? dayjs(row.dueDate) : null,
      status: row.status,
      priority: row.priority,
    });
    setEditVisible(true);
  };

  const handleEditSave = async (values: any) => {
    if (!editingItem || !currentUserId) return;
    try {
      const res = await fetch('/api/todos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem.id,
          userId: currentUserId,
          title: values.title,
          content: values.content || '',
          dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
          status: values.status,
          priority: values.priority,
        }),
      });
      const json = await res.json();
      if (json.success) {
        message.success('更新成功');
        setEditVisible(false);
        setEditingItem(null);
        fetchTodos();
      } else {
        message.error(json.error || '更新失敗');
      }
    } catch {
      message.error('更新失敗');
    }
  };

  const handleDelete = (row: TodoItem) => {
    Modal.confirm({
      title: '確定刪除此代辦？',
      onOk: async () => {
        if (!currentUserId) return;
        const res = await fetch(`/api/todos?id=${row.id}&userId=${currentUserId}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          message.success('刪除成功');
          fetchTodos();
        } else {
          message.error(json.error || '刪除失敗');
        }
      },
    });
  };

  const columns: ColumnsType<TodoItem> = [
    {
      title: '使用者',
      dataIndex: 'userName',
      key: 'userName',
      width: 120,
      render: (_, r) => r.userName || r.userId,
    },
    {
      title: '代辦事項',
      dataIndex: 'title',
      key: 'title',
      width: 220,
      ellipsis: true,
    },
    {
      title: '內容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (v: string) => <Tag color={statusColorMap[v] || 'default'}>{statusLabelMap[v] || v}</Tag>,
    },
    {
      title: '優先級',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (v: string) => <Tag color={priorityColorMap[v] || 'default'}>{priorityLabelMap[v] || v}</Tag>,
    },
    {
      title: '截止日',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (v?: string) => (v ? dayjs(v).format('YYYY/MM/DD') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_, row) => {
        if (currentUserId !== row.userId) return null;
        return (
          <Space>
            <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(row)}>編輯</Button>
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(row)}>刪除</Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 16 }}>
        <Collapse
          defaultActiveKey={['query', 'create']}
          items={[
            {
              key: 'create',
              label: '新增代辦事項',
              children: (
                <Form form={createForm} layout="inline" onFinish={handleCreate}>
                  <Form.Item name="title" rules={[{ required: true, message: '請輸入代辦事項' }]}>
                    <Input style={{ width: 220 }} placeholder="代辦事項" />
                  </Form.Item>
                  <Form.Item name="content">
                    <Input style={{ width: 260 }} placeholder="內容" />
                  </Form.Item>
                  <Form.Item name="dueDate">
                    <DatePicker placeholder="截止日" />
                  </Form.Item>
                  <Form.Item name="status" initialValue="pending">
                    <Select
                      style={{ width: 120 }}
                      options={[
                        { value: 'pending', label: '待處理' },
                        { value: 'in_progress', label: '進行中' },
                        { value: 'completed', label: '已完成' },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item name="priority" initialValue="medium">
                    <Select
                      style={{ width: 120 }}
                      options={[
                        { value: 'high', label: '高' },
                        { value: 'medium', label: '中' },
                        { value: 'low', label: '低' },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" icon={<PlusOutlined />} htmlType="submit" loading={createLoading}>新增</Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'query',
              label: '查詢條件',
              children: (
                <Space wrap>
                  <Select
                    style={{ width: 220 }}
                    placeholder="選擇使用者"
                    value={selectedUserId}
                    onChange={setSelectedUserId}
                    options={userOptions}
                  />
                  <DatePicker.RangePicker
                    value={dateRange as any}
                    onChange={(v) => setDateRange((v as DateRangeValue) || null)}
                  />
                  <Input
                    style={{ width: 240 }}
                    placeholder="代辦關鍵字"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                  <Select
                    style={{ width: 140 }}
                    allowClear
                    placeholder="狀態"
                    value={status}
                    onChange={setStatus}
                    options={[
                      { value: 'pending', label: '待處理' },
                      { value: 'in_progress', label: '進行中' },
                      { value: 'completed', label: '已完成' },
                    ]}
                  />
                  <Select
                    style={{ width: 140 }}
                    allowClear
                    placeholder="優先級"
                    value={priority}
                    onChange={setPriority}
                    options={[
                      { value: 'high', label: '高' },
                      { value: 'medium', label: '中' },
                      { value: 'low', label: '低' },
                    ]}
                  />
                  <Button type="primary" onClick={fetchTodos}>
                    查詢
                  </Button>
                  <Button onClick={handleClear}>清除條件</Button>
                </Space>
              ),
            },
          ]}
        />
      </Card>

      <Card title="他人代辦事項">
        <Table<TodoItem>
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={rows}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title="編輯代辦事項"
        open={editVisible}
        onCancel={() => setEditVisible(false)}
        onOk={() => editForm.submit()}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSave}>
          <Form.Item name="title" label="代辦事項" rules={[{ required: true, message: '請輸入代辦事項' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label="內容">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="dueDate" label="截止日">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="狀態" rules={[{ required: true, message: '請選擇狀態' }]}>
            <Select
              options={[
                { value: 'pending', label: '待處理' },
                { value: 'in_progress', label: '進行中' },
                { value: 'completed', label: '已完成' },
              ]}
            />
          </Form.Item>
          <Form.Item name="priority" label="優先級" rules={[{ required: true, message: '請選擇優先級' }]}>
            <Select
              options={[
                { value: 'high', label: '高' },
                { value: 'medium', label: '中' },
                { value: 'low', label: '低' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
