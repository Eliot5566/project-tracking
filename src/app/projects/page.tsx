'use client';


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Modal, Form, Input, DatePicker, Select, message, Space, Card, Progress, Tabs, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BarsOutlined, ScheduleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import GanttChart from '../components/GanttChart';
import ExportButton from '../components/ExportButton';
import ProjectTasksTable from './ProjectTasksTable';
import { Task, ViewMode } from 'gantt-task-react';
import { useI18n } from '../components/I18nProvider';

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
  const router = useRouter();
  const { t, locale } = useI18n();
  const dateLocale = locale === 'en' ? 'en-US' : locale === 'ja' ? 'ja-JP' : 'zh-TW';
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLogin = localStorage.getItem('isLogin') === '1';
      if (!isLogin) {
        router.replace('/login');
      }
    }
  }, []);


  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'gantt'
  // 篩選狀態
  const [selectedManagers, setSelectedManagers] = useState<number[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
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
        message.error(t('projects.error.fetchTeamMembers') || '獲取團隊成員列表失敗');
      }
    } catch (err) {
      console.error('獲取團隊成員列表錯誤:', err);
      message.error(t('projects.error.fetchTeamMembers') || '獲取團隊成員列表失敗');
    }
  };

  // 獲取專案數據
  const fetchProjects = async (managerIds?: number[], projectIds?: number[]) => {
    setLoading(true);
    try {
      let url = '/api/projects';
      const params: string[] = [];
      if (managerIds && managerIds.length > 0) params.push(`managerId=${managerIds.join(',')}`);
      if (projectIds && projectIds.length > 0) params.push(`projectId=${projectIds.join(',')}`);
      if (params.length > 0) url += '?' + params.join('&');
      const response = await fetch(url);
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
        message.error(t('projects.error.fetch') || '獲取專案數據失敗');
      }
    } catch (error) {
      console.error('獲取專案失敗:', error);
      message.error(t('projects.error.fetch') || '獲取專案數據失敗');
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
    fetchProjects(selectedManagers, selectedProjects);
    fetchTeamMembers();
  }, [selectedManagers, selectedProjects]);

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
        message.success(t('common.delete.success') || '刪除成功');
        fetchProjects();
      } else {
        message.error(t('common.delete.fail') || '刪除失敗');
      }
    } catch (err) {
      console.error('刪除專案錯誤:', err);
      message.error(t('common.delete.fail') || '刪除失敗');
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
        message.success(editingProject ? (t('common.update.success') || '更新成功') : (t('common.create.success') || '創建成功'));
        setModalVisible(false);
        fetchProjects();
      } else {
        message.error(editingProject ? (t('common.update.fail') || '更新失敗') : (t('common.create.fail') || '創建失敗'));
      }
    } catch (err) {
      console.error('提交表單錯誤:', err);
      message.error(t('common.submit.fail') || '提交失敗');
    }
  };

  const columns: ColumnsType<Project> = [
    {
      title: t('projects.columns.name'),
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
      title: t('projects.columns.manager'),
      dataIndex: 'managerId',
      key: 'managerId',
      render: (text, record) => (
        <span>{teamMembers.find(member => member.id === record.managerId)?.name || '未指定'}</span>
      )
    },
    {
      title: t('projects.columns.status'),
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
                  message.success(t('common.update.success') || '狀態更新成功');
                  fetchProjects();
                } else {
                  message.error(t('common.update.fail') || '狀態更新失敗');
                }
              } catch (err) {
                console.error('更新狀態錯誤:', err);
                message.error(t('common.update.fail') || '狀態更新失敗');
              }
            }}
          >
            <Option value="進行中">{t('projects.status.inProgress')}</Option>
            <Option value="已完成">{t('projects.status.completed')}</Option>
            <Option value="已暫停">{t('projects.status.paused')}</Option>
            <Option value="已取消">{t('projects.status.canceled')}</Option>
          </Select>
        );
      }
    },
    {
      title: t('projects.columns.progress'),
      key: 'progress',
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Progress
            percent={Math.round(record.averageProgress || 0)}
            size="small"
            status={record.averageProgress === 100 ? 'success' : 'active'}
          />
          <span style={{ fontSize: '12px', color: '#666' }}>
            {record.taskCount || 0} {t('tasks.title')}
          </span>
        </Space>
      )
    },
    {
      title: t('projects.columns.time'),
      key: 'time',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <span>
            {t('projects.time.start')}
            {new Date(record.startDate).toLocaleDateString(dateLocale, { year: 'numeric', month: '2-digit', day: '2-digit' })}
          </span>
          <span>
            {t('projects.time.end')}
            {new Date(record.endDate).toLocaleDateString(dateLocale, { year: 'numeric', month: '2-digit', day: '2-digit' })}
          </span>
        </Space>
      )
    },
    {
      title: t('projects.columns.actions'),
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t('common.edit') || '編輯'}
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            {t('common.delete') || '刪除'}
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
        title={t('projects.title')}
        extra={
          <Space>
            <ExportButton
              data={exportData}
              columns={exportColumns}
              fileName={t('projects.actions.exportReport')}
              buttonText={t('projects.actions.exportButton')}
            />
            <Button 
              type={viewMode === 'list' ? 'primary' : 'default'} 
              onClick={() => setViewMode('list')}
              icon={<BarsOutlined />}
            >
              {t('projects.actions.view.list')}
            </Button>
            <Button 
              type={viewMode === 'gantt' ? 'primary' : 'default'} 
              onClick={() => setViewMode('gantt')}
              icon={<ScheduleOutlined />}
            >
              {t('projects.actions.view.gantt')}
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
              {t('projects.actions.add')}
            </Button>
          </Space>
        }
      >
        {/* 篩選區塊 */}
        <Space style={{ marginBottom: 16 }}>
          <Select
            mode="multiple"
            allowClear
            style={{ minWidth: 180 }}
            placeholder={t('projects.filter.manager')}
            value={selectedManagers}
            onChange={setSelectedManagers}
          >
            {teamMembers.map(member => (
              <Option key={member.id} value={member.id}>{member.name}</Option>
            ))}
          </Select>
          <Select
            mode="multiple"
            allowClear
            style={{ minWidth: 180 }}
            placeholder={t('projects.filter.project')}
            value={selectedProjects}
            onChange={setSelectedProjects}
          >
            {projects.map(project => (
              <Option key={project.id} value={project.id}>{project.name}</Option>
            ))}
          </Select>
        </Space>
        {viewMode === 'list' ? (
          <Table
            columns={columns}
            dataSource={projects}
            rowKey="id"
            loading={loading}
            expandable={{
              expandedRowRender: (record) => <ProjectTasksTable projectId={record.id} />,
              expandRowByClick: true,
            }}
          />
        ) : (
          <GanttChart tasks={ganttTasks} />
        )}
      </Card>

      <Modal
        title={editingProject ? t('projects.modal.edit') : t('projects.modal.add')}
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
            label={t('projects.form.name')}
            rules={[{ required: true, message: t('projects.form.name.required') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="managerId"
            label={t('projects.form.manager')}
            rules={[{ required: true, message: t('projects.form.manager.required') }]}
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
            label={t('projects.form.description')}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="status"
            label={t('projects.form.status')}
            rules={[{ required: true, message: t('projects.form.status.required') }]}
          >
            <Select>
              <Option value="進行中">{t('projects.status.inProgress')}</Option>
              <Option value="已完成">{t('projects.status.completed')}</Option>
              <Option value="已暫停">{t('projects.status.paused')}</Option>
              <Option value="已取消">{t('projects.status.canceled')}</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="startDate"
            label={t('projects.form.startDate')}
            rules={[{ required: true, message: t('projects.form.startDate.required') }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="endDate"
            label={t('projects.form.endDate')}
            rules={[{ required: true, message: t('projects.form.endDate.required') }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" onClick={handleSubmit} block>
              {editingProject ? t('projects.actions.update') : t('projects.actions.add')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}