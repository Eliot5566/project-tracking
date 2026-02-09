'use client';

import {
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Card,
  message,
  Modal,
  Tooltip,
  Select,
  Input,
} from 'antd';
const { Option } = Select;
interface Project {
  id: number;
  name: string;
}

interface TeamMember {
  id: number;
  name: string;
}

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TaskForm from '@/app/components/TaskForm';
import TaskDependencyModal from '@/app/components/TaskDependencyModal';
import GanttChart from '@/app/components/GanttChart';
import ImportTaskModal from '@/app/components/ImportTaskModal';
import { Task as GanttTask, ViewMode } from 'gantt-task-react';
import { useI18n } from '../components/I18nProvider';

const { Title } = Typography;
const { confirm } = Modal;

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
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
  startDate: string;
  dueDate: string;
  assignedTo: number;
  projectId: number;
}

export default function TaskPage() {
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>();
  const [loading, setLoading] = useState(false);
  const [dependencyModalVisible, setDependencyModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list');
  const [dependencies, setDependencies] = useState<any[]>([]); // 所有依賴關係
  const [importModalVisible, setImportModalVisible] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [search, setSearch] = useState('');

  // 取得專案與人員選項
  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success) setProjects(data.data);
    } catch {}
  };
  const fetchTeamMembers = async () => {
    try {
      const res = await fetch('/api/team');
      const data = await res.json();
      if (data.success) setTeamMembers(data.data);
    } catch {}
  };

  // 同時獲取任務與依賴，支援篩選
  const fetchTasksAndDependencies = async () => {
    setLoading(true);
    try {
      let url = '/api/tasks?';
      const params: string[] = [];
      if (selectedProjects.length > 0)
        params.push(`projectId=${selectedProjects.join(',')}`);
      if (selectedMembers.length > 0)
        params.push(`assignedTo=${selectedMembers.join(',')}`);
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (params.length > 0) url += params.join('&');
      const [tasksRes, depRes] = await Promise.all([
        fetch(url),
        fetch('/api/tasks/dependencies/all'),
      ]);
      const tasksJson = await tasksRes.json();
      const depJson = await depRes.json();
      if (tasksJson.success) setTasks(tasksJson.data);
      else message.error(t('tasks.error.fetch') || '獲取任務列表失敗');
      if (depJson.success) setDependencies(depJson.data);
      else message.error(t('tasks.error.fetchDependencies') || '獲取依賴關係失敗');
    } catch (error) {
      message.error(t('tasks.error.fetchAll') || '獲取任務或依賴失敗');
      console.error('獲取任務或依賴失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    fetchTasksAndDependencies();
  }, [selectedProjects, selectedMembers, search]);

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
        setTasks((prev) => [...prev, result.data]);
        message.success(t('tasks.create.success') || '任務創建成功');
        handleCloseDialog();
      } else {
        message.error(t('tasks.create.fail') || '創建任務失敗');
      }
    } catch (error) {
      message.error(t('tasks.create.fail') || '創建任務失敗');
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
        setTasks((prev) =>
          prev.map((t) => (t.id === selectedTask.id ? result.data : t))
        );
        message.success(t('tasks.update.success') || '任務更新成功');
        handleCloseDialog();
      } else {
        message.error(t('tasks.update.fail') || '更新任務失敗');
      }
    } catch (error) {
      message.error(t('tasks.update.fail') || '更新任務失敗');
      console.error('更新任務失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    confirm({
      title: t('common.delete.confirmTitle') || '確認刪除',
      content: t('common.delete.confirmContent') || '確定要刪除這個任務嗎？',
      async onOk() {
        setLoading(true);
        try {
          const response = await fetch(`/api/tasks?id=${taskId}`, {
            method: 'DELETE',
          });

          const result = await response.json();
          if (result.success) {
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
            message.success(t('tasks.delete.success') || '任務刪除成功');
          } else {
            message.error(t('tasks.delete.fail') || '刪除任務失敗');
          }
        } catch (error) {
          message.error(t('tasks.delete.fail') || '刪除任務失敗');
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

  // 處理打開依賴關係管理
  const handleDependencyManage = (task: Task) => {
    setSelectedTask(task);
    setDependencyModalVisible(true);
  };

  // 建立依賴查詢 Map
  const depByTaskId = new Map<number, { pre: any[]; post: any[] }>();
  dependencies.forEach((dep) => {
    if (!depByTaskId.has(dep.taskId))
      depByTaskId.set(dep.taskId, { pre: [], post: [] });
    if (!depByTaskId.has(dep.dependsOnTaskId))
      depByTaskId.set(dep.dependsOnTaskId, { pre: [], post: [] });
    depByTaskId.get(dep.taskId)!.pre.push(dep); // 此任務的前置依賴
    depByTaskId.get(dep.dependsOnTaskId)!.post.push(dep); // 被依賴
  });

  // 定義表格列
  const columns = [
    // 依賴關係列
    {
      title: t('tasks.columns.dependencies'),
      key: 'dependencies',
      render: (_: any, record: Task) => {
        const pre = depByTaskId.get(record.id)?.pre || [];
        const post = depByTaskId.get(record.id)?.post || [];
        return (
          <Space size="small">
            {pre.length > 0 && (
              <Tooltip title={pre.map((d) => d.dependsOnTaskTitle).join(', ')}>
                <Tag color="blue">{t('tasks.dependencies.pre')}:{pre.length}</Tag>
              </Tooltip>
            )}
            {post.length > 0 && (
              <Tooltip title={post.map((d) => d.taskTitle).join(', ')}>
                <Tag color="purple">{t('tasks.dependencies.post')}:{post.length}</Tag>
              </Tooltip>
            )}
            {pre.length === 0 && post.length === 0 && (
              <Tag color="default">{t('tasks.dependencies.none')}</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: t('tasks.columns.name'),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('tasks.columns.project'),
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: t('tasks.columns.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === 'pending'
            ? t('tasks.status.pending')
            : status === 'in_progress'
            ? t('tasks.status.in_progress')
            : status === 'completed'
            ? t('tasks.status.completed')
            : status}
        </Tag>
      ),
    },
    {
      title: t('tasks.columns.priority'),
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority === 'high'
            ? t('tasks.priority.high')
            : priority === 'medium'
            ? t('tasks.priority.medium')
            : priority === 'low'
            ? t('tasks.priority.low')
            : priority}
        </Tag>
      ),
    },
    //{
    //  title: '進度',
    //  dataIndex: 'progress',
    //  key: 'progress',
    //  render: (progress: number) => `${progress}%`,
    //},
    {
      title: t('tasks.columns.startDate'),
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => {
        const d = new Date(date);
        return isNaN(d.getTime())
          ? ''
          : d.toLocaleDateString(dateLocale, {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            });
      },
    },
    {
      title: t('tasks.columns.dueDate'),
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => {
        const d = new Date(date);
        return isNaN(d.getTime())
          ? ''
          : d.toLocaleDateString(dateLocale, {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            });
      },
    },
    {
      title: t('tasks.columns.assignee'),
      dataIndex: 'assignedToName',
      key: 'assignedToName',
    },
    {
      title: t('tasks.columns.actions'),
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
            icon={<NodeIndexOutlined />}
            onClick={() => handleDependencyManage(record)}
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

  // 將任務轉換為 Gantt chart 格式，帶入 dependencies
  const ganttTasks: GanttTask[] = tasks.map((task) => {
    // 找出此任務的所有前置依賴（dependsOnTaskId）
    const pre = dependencies.filter((dep) => dep.taskId === task.id);
    return {
      id: String(task.id),
      name: `${task.projectName} - ${task.title}`,
      start: new Date(task.startDate),
      end: new Date(task.dueDate),
      progress: task.progress || 0,
      type: 'task',
      project: String(task.projectId),
      styles: {
        backgroundColor:
          task.status === 'completed'
            ? '#52c41a'
            : task.status === 'in_progress'
            ? '#1890ff'
            : '#faad14',
        progressColor: '#1890ff',
      },
      dependencies: pre.map((dep) => String(dep.dependsOnTaskId)),
      isDisabled: false,
      hideChildren: false,
      displayOrder: task.id,
    };
  });

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto', padding: '2rem' }}>
      <Card>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            {t('tasks.title')}
          </Title>
          <Space>
            <Button type="default" onClick={() => setImportModalVisible(true)}>
              {t('tasks.actions.import')}
            </Button>
            <ImportTaskModal
              open={importModalVisible}
              onClose={() => setImportModalVisible(false)}
              onSuccess={fetchTasksAndDependencies}
            />
            <Button
              type={viewMode === 'list' ? 'primary' : 'default'}
              onClick={() => setViewMode('list')}
            >
              {t('tasks.actions.view.list')}
            </Button>
            <Button
              type={viewMode === 'gantt' ? 'primary' : 'default'}
              onClick={() => setViewMode('gantt')}
            >
              {t('tasks.actions.view.gantt')}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenDialog()}
            >
              {t('tasks.actions.add')}
            </Button>
          </Space>
        </div>
        {/* 篩選區塊 */}
        <Space style={{ marginBottom: 16 }}>
          <Select
            mode="multiple"
            allowClear
            style={{ minWidth: 180 }}
            placeholder={t('tasks.filter.project')}
            value={selectedProjects}
            onChange={setSelectedProjects}
          >
            {projects.map((project) => (
              <Option key={project.id} value={project.id}>
                {project.name}
              </Option>
            ))}
          </Select>
          <Select
            mode="multiple"
            allowClear
            style={{ minWidth: 180 }}
            placeholder={t('tasks.filter.assignee')}
            value={selectedMembers}
            onChange={setSelectedMembers}
          >
            {teamMembers.map((member) => (
              <Option key={member.id} value={member.id}>
                {member.name}
              </Option>
            ))}
          </Select>
          <Input.Search
            placeholder={t('tasks.search.placeholder')}
            allowClear
            onSearch={setSearch}
            style={{ width: 220 }}
          />
        </Space>

        {viewMode === 'list' ? (
          <Table
            columns={columns}
            dataSource={tasks}
            rowKey="id"
            loading={loading}
          />
        ) : (
          <GanttChart tasks={ganttTasks} />
        )}

        <TaskForm
          open={openDialog}
          onClose={handleCloseDialog}
          onSubmit={selectedTask ? handleUpdateTask : handleCreateTask}
          initialData={selectedTask}
        />

        <TaskDependencyModal
          visible={dependencyModalVisible}
          task={selectedTask ?? null}
          onClose={() => setDependencyModalVisible(false)}
        />
      </Card>
    </div>
  );
}
//       onOk={handleCreateMember}
