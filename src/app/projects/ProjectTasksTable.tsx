// import { useEffect, useState } from 'react';
// import { Table, Button, Space, Tag, Input, message } from 'antd';
// import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
// import TaskForm from '../components/TaskForm';

// // 與 TaskForm 的 Task interface 對齊
// interface Task {
//   id: number;
//   title: string;
//   description: string;
//   status: string;
//   priority: string;
//   startDate: string;
//   dueDate: string;
//   assignedTo: number;
//   assignedToName: string;
//   projectId: number;
//   projectName: string;
//   progress: number;
//   createdAt: string;
//   updatedAt: string;
// }

// interface Props {
//   projectId: number;
// }

// export default function ProjectTasksTable({ projectId }: Props) {
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [search, setSearch] = useState('');
//   const [editModalOpen, setEditModalOpen] = useState(false);
//   const [editingTask, setEditingTask] = useState<Task | null>(null);

//   const fetchTasks = async () => {
//     setLoading(true);
//     try {
//       let url = `/api/tasks?projectId=${projectId}`;
//       if (search) url += `&search=${encodeURIComponent(search)}`;
//       const res = await fetch(url);
//       const data = await res.json();
//       if (data.success) setTasks(data.data);
//       else message.error('取得任務失敗');
//     } catch {
//       message.error('取得任務失敗');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchTasks(); }, [projectId, search]);

//   const handleEdit = (task: Task) => {
//     setEditingTask(task);
//     setEditModalOpen(true);
//   };

//   const handleUpdate = async (values: any) => {
//     try {
//       const res = await fetch('/api/tasks', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ ...values, id: editingTask?.id, projectId }),
//       });
//       const data = await res.json();
//       if (data.success) {
//         message.success('任務更新成功');
//         setEditModalOpen(false);
//         setEditingTask(null);
//         fetchTasks();
//       } else {
//         message.error('任務更新失敗');
//       }
//     } catch {
//       message.error('任務更新失敗');
//     }
//   };

//   const columns = [
//     { title: '標題', dataIndex: 'title', key: 'title' },
//     { title: '描述', dataIndex: 'description', key: 'description' },
//     { title: '狀態', dataIndex: 'status', key: 'status', render: (v: string) => <Tag>{v}</Tag> },
//     { title: '優先度', dataIndex: 'priority', key: 'priority' },
//     { title: '負責人', dataIndex: 'assignedToName', key: 'assignedToName' },
//     { title: '開始', dataIndex: 'startDate', key: 'startDate' },
//     { title: '截止', dataIndex: 'dueDate', key: 'dueDate' },
//     { title: '進度', dataIndex: 'progress', key: 'progress', render: (v: number) => `${v || 0}%` },
//     {
//       title: '操作',
//       key: 'action',
//       render: (_: unknown, record: Task) => (
//         <Space>
//           <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>編輯</Button>
//           <Button icon={<DeleteOutlined />} size="small" danger>刪除</Button>
//         </Space>
//       )
//     }
//   ];

//   return (
//     <div style={{ background: '#f6faff', margin: 0, padding: 12 }}>
//       <Space style={{ marginBottom: 8 }}>
//         <Input.Search
//           placeholder="搜尋任務標題/描述"
//           allowClear
//           onSearch={setSearch}
//           style={{ width: 220 }}
//         />
//         <Button icon={<PlusOutlined />} type="primary" size="small">新增任務</Button>
//       </Space>
//       <Table
//         columns={columns}
//         dataSource={tasks}
//         rowKey="id"
//         size="small"
//         loading={loading}
//         pagination={{ pageSize: 5 }}
//       />
//       <TaskForm
//         open={editModalOpen}
//         onClose={() => { setEditModalOpen(false); setEditingTask(null); }}
//         onSubmit={handleUpdate}
//         initialData={editingTask || undefined}
//       />
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Space,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  startDate?: string;
  dueDate?: string;
  assignedTo?: number;
  assignedToName?: string;
}

interface TeamMember {
  id: number;
  name: string;
}

interface Props {
  projectId: number;
}

export default function ProjectTasksTable({ projectId }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // 取得任務
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks?projectId=${projectId}`);
      const data = await res.json();
      if (data.success) setTasks(data.data);
    } finally {
      setLoading(false);
    }
  };

  // 取得團隊成員
  const fetchTeamMembers = async () => {
    try {
      const res = await fetch('/api/team');
      const data = await res.json();
      if (data.success) setTeamMembers(data.data);
    } catch {}
  };

  useEffect(() => {
    fetchTasks();
    fetchTeamMembers();
  }, [projectId]);

  // 新增或編輯任務
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        projectId,
        startDate: values.startDate
          ? values.startDate.format('YYYY-MM-DD')
          : undefined,
        dueDate: values.dueDate
          ? values.dueDate.format('YYYY-MM-DD')
          : undefined,
      };
      let url = '/api/tasks';
      let method = editingTask ? 'PUT' : 'POST';
      if (editingTask) payload.id = editingTask.id;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        message.success(editingTask ? '任務更新成功' : '任務新增成功');
        setModalOpen(false);
        setEditingTask(null);
        form.resetFields();
        fetchTasks();
      } else {
        message.error(data.error || '操作失敗');
      }
    } catch {
      message.error('請完整填寫表單');
    }
  };

  // 編輯
  const handleEdit = (task: Task) => {
    setEditingTask(task);
    form.setFieldsValue({
      ...task,
      startDate: task.startDate ? dayjs(task.startDate) : undefined,
      dueDate: task.dueDate ? dayjs(task.dueDate) : undefined,
    });
    setModalOpen(true);
  };

  // 刪除
  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '確定要刪除這個任務嗎？',
      onOk: async () => {
        const res = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          message.success('刪除成功');
          fetchTasks();
        } else {
          message.error('刪除失敗');
        }
      },
    });
  };

  const columns = [
    { title: '任務名稱', dataIndex: 'title', key: 'title' },
    { title: '負責人', dataIndex: 'assignedToName', key: 'assignedToName' },
    { title: '狀態', dataIndex: 'status', key: 'status' },
    { title: '開始日期', dataIndex: 'startDate', key: 'startDate' },
    { title: '截止日期', dataIndex: 'dueDate', key: 'dueDate' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Task) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#f6faff', margin: 0, padding: 12 }}>
      <Button
        icon={<PlusOutlined />}
        type="primary"
        size="small"
        style={{ marginBottom: 12 }}
        onClick={() => {
          setEditingTask(null);
          form.resetFields();
          setModalOpen(true);
        }}
      >
        新增任務
      </Button>
      <Table
        columns={columns}
        dataSource={tasks}
        rowKey="id"
        size="small"
        loading={loading}
        pagination={{ pageSize: 5 }}
      />
      <Modal
        title={editingTask ? '編輯任務' : '新增任務'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingTask(null);
          form.resetFields();
        }}
        onOk={handleSubmit}
        okText={editingTask ? '更新' : '新增'}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="任務名稱"
            rules={[{ required: true, message: '請輸入任務名稱' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="assignedTo"
            label="負責人"
            rules={[{ required: true, message: '請選擇負責人' }]}
          >
            <Select>
              {teamMembers.map((member) => (
                <Select.Option key={member.id} value={member.id}>
                  {member.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="狀態"
            rules={[{ required: true, message: '請選擇狀態' }]}
          >
            <Select>
              <Select.Option value="pending">pending</Select.Option>
              <Select.Option value="in_progress">in_progress</Select.Option>
              <Select.Option value="completed">completed</Select.Option>
            </Select>
          </Form.Item>
          {/* 優先度 */}
          {/* <Form.Item name="priority" label="優先度" rules={[{ required: true, message: '請選擇優先度' }]}>
            <Select>
              <Select.Option value="低">低</Select.Option>
              <Select.Option value="中">中</Select.Option>
              <Select.Option value="高">高</Select.Option>
            </Select>
          </Form.Item> */}
          {/* <Tag color={getPriorityColor(priority)}>
                    {priority === 'high' ? '高' : 
                     priority === 'medium' ? '中' : 
                     priority === 'low' ? '低' : priority}
                  </Tag> */}
          <Form.Item name="priority" label="優先度">
            <Select>
              <Select.Option value="low">低</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="high">高</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="startDate" label="開始日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="dueDate" label="截止日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
