'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, message, Space, Card, Progress, Tabs, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BarsOutlined, ScheduleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import GanttChart from '../components/GanttChart';
import ExportButton from '../components/ExportButton';
import { Task, ViewMode } from 'gantt-task-react';

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  taskCount?: number;
  averageProgress?: number;
  managerId?: number;
  managerName?: string;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
}

const { Option } = Select;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'gantt'

  // 甘特圖任務數據
  const [ganttTasks, setGanttTasks] = useState<Task[]>([]);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/team');
      const data = await response.json();
      if (data.success) {
        setTeamMembers(data.data);
      } else {
        message.error('獲取團隊成員列表失敗');
      }
    } catch (err) {
      console.error('獲取團隊成員列表錯誤:', err);
      message.error('獲取團隊成員列表失敗');
    }
  };

  // 獲取專案數據
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/projects');
      const result = await response.json();
      
      if (result.success) {
        setProjects(result.data);
        
        // 將專案數據轉換為甘特圖任務格式
        const ganttData = result.data.map((project: Project) => ({
          id: `Project-${project.id}`,
          name: project.name,
          start: new Date(project.startDate),
          end: new Date(project.endDate),
          progress: project.averageProgress ? project.averageProgress / 100 : 0,
          type: 'project',
          hideChildren: false,
          displayOrder: project.id,
          styles: { 
            backgroundColor: getStatusColor(project.status),
            progressColor: '#1890ff'
          }
        }));
        
        setGanttTasks(ganttData);
      } else {
        message.error('獲取專案數據失敗');
      }
    } catch (error) {
      console.error('獲取專案失敗:', error);
      message.error('獲取專案數據失敗');
    } finally {
      setLoading(false);
    }
  };

  // 獲取狀態顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case '進行中': return '#1890ff';
      case '已完成': return '#52c41a';
      case '延遲': return '#ff4d4f';
      case '等待中': return '#faad14';
      default: return '#d9d9d9';
    }
  };

  // 渲染狀態標籤
  const renderStatusTag = (status: string) => {
    let color = getStatusColor(status);
    return <Tag color={color}>{status}</Tag>;
  };

  useEffect(() => {
    fetchProjects();
    fetchTeamMembers();
  }, []);

  const handleAdd = () => {
    setEditingProject(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Project) => {
    setEditingProject(record);
    form.setFieldsValue({
      ...record,
      startDate: dayjs(record.startDate),
      endDate: dayjs(record.endDate)
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/projects?id=${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        message.success('刪除成功');
        fetchProjects();
      } else {
        message.error('刪除失敗');
      }
    } catch (err) {
      console.error('刪除專案錯誤:', err);
      message.error('刪除失敗');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const projectData = {
        ...values,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD')
      };

      const url = editingProject ? '/api/projects' : '/api/projects';
      const method = editingProject ? 'PUT' : 'POST';
      const body = editingProject ? { ...projectData, id: editingProject.id } : projectData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (data.success) {
        message.success(editingProject ? '更新成功' : '創建成功');
        setModalVisible(false);
        fetchProjects();
      } else {
        message.error(editingProject ? '更新失敗' : '創建失敗');
      }
    } catch (err) {
      console.error('提交表單錯誤:', err);
      message.error('提交失敗');
    }
  };

  const columns: ColumnsType<Project> = [
    {
      title: '專案名稱',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical" size="small">
          <span>{text}</span>
          <span style={{ color: '#666', fontSize: '12px' }}>{record.description}</span>
        </Space>
      )
    },
    {
      title: '負責人',
      dataIndex: 'managerId',
      key: 'managerId',
      render: (text, record) => (
        <span>{teamMembers.find(member => member.id === record.managerId)?.name || '未指定'}</span>
      )
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusColors = {
          '進行中': 'processing',
          '已完成': 'success',
          '已暫停': 'warning',
          '已取消': 'default'
        } as const;

        return (
          <Select
            value={status}
            style={{ width: 100 }}
            onChange={async (value) => {
              try {
                const response = await fetch('/api/projects', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ id: status, status: value })
                });
                const data = await response.json();
                if (data.success) {
                  message.success('狀態更新成功');
                  fetchProjects();
                } else {
                  message.error('狀態更新失敗');
                }
              } catch (err) {
                console.error('更新狀態錯誤:', err);
                message.error('狀態更新失敗');
              }
            }}
          >
            <Option value="進行中">進行中</Option>
            <Option value="已完成">已完成</Option>
            <Option value="已暫停">已暫停</Option>
            <Option value="已取消">已取消</Option>
          </Select>
        );
      }
    },
    {
      title: '進度',
      key: 'progress',
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Progress
            percent={Math.round(record.averageProgress || 0)}
            size="small"
            status={record.averageProgress === 100 ? 'success' : 'active'}
          />
          <span style={{ fontSize: '12px', color: '#666' }}>
            {record.taskCount || 0} 個任務
          </span>
        </Space>
      )
    },
    {
      title: '時間',
      key: 'time',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <span>開始：{dayjs(record.startDate).format('YYYY-MM-DD')}</span>
          <span>結束：{dayjs(record.endDate).format('YYYY-MM-DD')}</span>
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            編輯
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            刪除
          </Button>
        </Space>
      )
    }
  ];

  // 準備匯出數據
  const exportColumns = [
    { title: '專案名稱', dataIndex: 'name' },
    { title: '描述', dataIndex: 'description' },
    { title: '狀態', dataIndex: 'status' },
    { title: '進度', dataIndex: 'averageProgress' },
    { title: '開始日期', dataIndex: 'startDateFormatted' },
    { title: '結束日期', dataIndex: 'endDateFormatted' },
    { title: '任務數量', dataIndex: 'taskCount' },
  ];

  const exportData = projects.map(project => ({
    ...project,
    startDateFormatted: dayjs(project.startDate).format('YYYY-MM-DD'),
    endDateFormatted: dayjs(project.endDate).format('YYYY-MM-DD'),
    averageProgress: `${project.averageProgress || 0}%`,
  }));

  return (
    <div style={{ padding: '24px' }}>
      <Card 
        title="專案管理"
        extra={
          <Space>
            <ExportButton
              data={exportData}
              columns={exportColumns}
              fileName="專案報表"
              buttonText="匯出專案報表"
            />
            <Button 
              type={viewMode === 'list' ? 'primary' : 'default'} 
              onClick={() => setViewMode('list')}
              icon={<BarsOutlined />}
            >
              列表視圖
            </Button>
            <Button 
              type={viewMode === 'gantt' ? 'primary' : 'default'} 
              onClick={() => setViewMode('gantt')}
              icon={<ScheduleOutlined />}
            >
              甘特圖視圖
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingProject(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              新增專案
            </Button>
          </Space>
        }
      >
        {viewMode === 'list' ? (
          <Table
            columns={columns}
            dataSource={projects}
            rowKey="id"
            loading={loading}
          />
        ) : (
          <GanttChart tasks={ganttTasks} />
        )}
      </Card>

      <Modal
        title={editingProject ? '編輯專案' : '新增專案'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="專案名稱"
            rules={[{ required: true, message: '請輸入專案名稱' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="managerId"
            label="負責人"
            rules={[{ required: true, message: '請選擇負責人' }]}
          >
            <Select>
              {teamMembers.map((member) => (
                <Option key={member.id} value={member.id}>
                  {member.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="專案描述"
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="status"
            label="狀態"
            rules={[{ required: true, message: '請選擇狀態' }]}
          >
            <Select>
              <Option value="進行中">進行中</Option>
              <Option value="已完成">已完成</Option>
              <Option value="已暫停">已暫停</Option>
              <Option value="已取消">已取消</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="startDate"
            label="開始日期"
            rules={[{ required: true, message: '請選擇開始日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="結束日期"
            rules={[{ required: true, message: '請選擇結束日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" onClick={handleSubmit} block>
              {editingProject ? '更新專案' : '新增專案'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}