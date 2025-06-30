'use client';
 
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Row, Col, Statistic, Table, Progress, Tag, Space, Tabs, Select, DatePicker } from 'antd';
import {
  ProjectOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
 
interface DashboardData {
  projectStats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    delayedProjects: number;
  };
  taskStats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    delayedTasks: number;
  };
  teamStats: {
    totalMembers: number;
    activeMembers: number;
    averageTaskCompletion: number;
  };
  recentActivities: Array<{
    key: string;
    project: string;
    activity: string;
    status: string;
    date: string;
  }>;
  projectProgress: Array<{
    project: string;
    progress: number;
    status: string;
  }>;
  // 新增數據結構
  teamWorkload: Array<{
    name: string;
    activeProjects: number;
    activeTasks: number;
    completionRate: number;
  }>;
  weeklyProgress: Array<{
    day: string;
    completed: number;
    created: number;
  }>;
  taskByStatus: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}
 
// 狀態顏色設置
const statusColors = {
  completed: '#52c41a',
  in_progress: '#1890ff',
  delayed: '#ff4d4f',
  pending: '#faad14',
};
 
// 圓餅圖顏色
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
 
export default function DashboardPage() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLogin = localStorage.getItem('isLogin') === '1';
      if (!isLogin) {
        router.replace('/login');
      }
    }
  }, []);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
 
  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const result = await response.json();
 
        // 修正專案名稱顯示問題
        const fixedProjectProgress = result.projectProgress.map(p => ({
          ...p,
          project: p.projectName || '未命名專案',
        }));

        // 直接用 taskStats.completionRate 作為任務完成率
        setData({
          ...result,
          teamStats: {
            ...result.teamStats,
            averageTaskCompletion: result.taskStats.completionRate || 0,
          },
          taskStats: {
            ...result.taskStats,
            completionRate: result.taskStats.completionRate || 0,
          },
          projectProgress: fixedProjectProgress
        });
      } catch (error) {
        console.error('獲取儀表板數據失敗:', error);
      } finally {
        setLoading(false);
      }
    }
 
    fetchDashboardData();
  }, []);
 
  // 修正數據顯示邏輯，確保處理空數據情況
  const taskByStatusData = Array.isArray(data?.taskByStatus) ? data.taskByStatus : [];
  const projectProgressData = Array.isArray(data?.projectProgress) ? data.projectProgress : [];
  const teamWorkloadData = Array.isArray(data?.teamWorkload) ? data.teamWorkload : [];
  const recentActivitiesData = Array.isArray(data?.recentActivities) ? data.recentActivities : [];
 
  // 活動狀態標籤渲染
  const renderStatusTag = (status: string) => {
    let color = '';
    let text = '';
 
    switch (status) {
      case 'completed':
        color = statusColors.completed;
        text = '已完成';
        break;
      case 'in_progress':
        color = statusColors.in_progress;
        text = '進行中';
        break;
      case 'delayed':
        color = statusColors.delayed;
        text = '延遲';
        break;
      default:
        color = statusColors.pending;
        text = '待處理';
    }
 
    return <Tag color={color}>{text}</Tag>;
  };
 
  // 活動列表表格列定義
  const activityColumns = [
    {
      title: '專案',
      dataIndex: 'project',
      key: 'project',
    },
    {
      title: '活動',
      dataIndex: 'activity',
      key: 'activity',
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: renderStatusTag,
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
  ];
 
  // 專案進度表格列定義
  const progressColumns = [
    {
      title: '專案',
      dataIndex: 'project',
      key: 'project',
    },
    {
      title: '進度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress percent={progress} status={progress === 100 ? 'success' : 'active'} />
      ),
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: renderStatusTag,
    },
  ];
 
  return (
    <div style={{ padding: '24px' }}>
      {/* 時間範圍選擇 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card>
            <Space>
              <span style={{ marginRight: 8 }}>數據範圍：</span>
              <Select
                defaultValue="week"
                style={{ width: 120 }}
                onChange={value => setTimeRange(value)}
                options={[
                  { value: 'today', label: '今日' },
                  { value: 'week', label: '本週' },
                  { value: 'month', label: '本月' },
                  { value: 'quarter', label: '本季度' },

                ]}
              />
              <DatePicker.RangePicker style={{ marginLeft: 16 }} />
            </Space>
          </Card>
        </Col>
      </Row>
 
      {/* 統計數字卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="總專案數"
              value={data?.projectStats.totalProjects || 0}
              prefix={<ProjectOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <span style={{ color: statusColors.in_progress }}>
                {data?.projectStats.activeProjects || 0} 進行中
              </span>
              {' | '}
              <span style={{ color: statusColors.completed }}>
                {data?.projectStats.completedProjects || 0} 已完成
              </span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="總任務數"
              value={data?.taskStats.totalTasks || 0}
              prefix={<CheckCircleOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <span style={{ color: statusColors.completed }}>
                {data?.taskStats.completedTasks || 0} 已完成
              </span>
              {' | '}
              <span style={{ color: statusColors.delayed }}>
                {data?.taskStats.delayedTasks || 0} 延遲
              </span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="團隊成員"
              value={data?.teamStats.totalMembers || 0}
              prefix={<TeamOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <span>
                {data?.teamStats.activeMembers || 0} 活躍成員
              </span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="任務完成率"
              value={data?.teamStats.averageTaskCompletion || 0}
              suffix="%"
              prefix={<ClockCircleOutlined />}
            />
            <div style={{ marginTop: 8 }}>
              <Progress
                percent={data?.teamStats.averageTaskCompletion || 0}
                size="small"
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
      </Row>
 
      {/* 任務統計圖表 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="每週任務進度" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.weeklyProgress || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#52c41a" name="完成任務" />
                <Line type="monotone" dataKey="created" stroke="#1890ff" name="創建任務" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="任務狀態分佈" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskByStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {Array.isArray(data?.taskByStatus) && data.taskByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
 
      {/* 專案進度和團隊工作量 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="專案進度" loading={loading}>
            <Table
              columns={progressColumns}
              dataSource={projectProgressData}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="團隊工作量" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={teamWorkloadData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="activeProjects" name="進行中專案" fill="#8884d8" />
                <Bar dataKey="activeTasks" name="進行中任務" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
 
      {/* 最近活動 */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="最近活動" loading={loading}>
            <Table
              columns={activityColumns}
              dataSource={recentActivitiesData}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}