"use client";

import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Typography, 
  Card,
  message,
  Modal
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import TaskForm from '../components/TaskForm';

const { Title } = Typography;
const { confirm } = Modal;

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assignedTo: number;
  assignedToName: string;
  projectId: number;
  projectName: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

interface TaskFormData {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  assignedTo: number;
  projectId: number;
}

export default function TaskPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [loading, setLoading] = useState(false);

  // 獲取任務列表
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tasks');
      const result = await response.json();
      if (result.success) {
        setTasks(result.data);
      } else {
        message.error('獲取任務列表失敗');
      }
    } catch (error) {
      message.error('獲取任務列表失敗');
      console.error('獲取任務列表失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleOpenDialog = (task?: Task) => {
    setSelectedTask(task);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedTask(undefined);
    setOpenDialog(false);
  };

  const handleCreateTask = async (taskData: TaskFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...taskData,
          status: 'pending',
          progress: 0,
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        setTasks(prev => [...prev, result.data]);
        message.success('任務創建成功');
        handleCloseDialog();
      } else {
        message.error('創建任務失敗');
      }
    } catch (error) {
      message.error('創建任務失敗');
      console.error('創建任務失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (taskData: TaskFormData) => {
    if (!selectedTask) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedTask.id,
          ...taskData,
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        setTasks(prev => prev.map(t => t.id === selectedTask.id ? result.data : t));
        message.success('任務更新成功');
        handleCloseDialog();
      } else {
        message.error('更新任務失敗');
      }
    } catch (error) {
      message.error('更新任務失敗');
      console.error('更新任務失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    confirm({
      title: '確認刪除',
      content: '確定要刪除這個任務嗎？',
      async onOk() {
        setLoading(true);
        try {
          const response = await fetch(`/api/tasks?id=${taskId}`, {
            method: 'DELETE',
          });
          
          const result = await response.json();
          if (result.success) {
            setTasks(prev => prev.filter(t => t.id !== taskId));
            message.success('任務刪除成功');
          } else {
            message.error('刪除任務失敗');
          }
        } catch (error) {
          message.error('刪除任務失敗');
          console.error('刪除任務失敗:', error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'in_progress':
        return 'processing';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: '任務名稱',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '專案',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === 'pending' ? '待處理' : 
           status === 'in_progress' ? '進行中' : 
           status === 'completed' ? '已完成' : status}
        </Tag>
      ),
    },
    {
      title: '優先級',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority === 'high' ? '高' : 
           priority === 'medium' ? '中' : 
           priority === 'low' ? '低' : priority}
        </Tag>
      ),
    },
    {
      title: '進度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => `${progress}%`,
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
    {
      title: '負責人',
      dataIndex: 'assignedToName',
      key: 'assignedToName',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Task) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleOpenDialog(record)}
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteTask(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <Card>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1rem' 
        }}>
          <Title level={3} style={{ margin: 0 }}>
            任務管理
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenDialog()}
          >
            新增任務
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={tasks}
          rowKey="id"
          loading={loading}
        />

        <TaskForm
          open={openDialog}
          onClose={handleCloseDialog}
          onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
          initialData={selectedTask}
        />
      </Card>
    </div>
  );
}
