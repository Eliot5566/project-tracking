'use client';

import { useEffect, useState } from 'react';
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
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    // 這裡將來可以連接到真實 API 獲取數據
    async function fetchDashboardData() {
      setLoading(true);
      try {
        // 模擬 API 呼叫延遲
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 模擬數據
        const mockData: DashboardData = {
          projectStats: {
            totalProjects: 12,
            activeProjects: 8,
            completedProjects: 3,
            delayedProjects: 1,
          },
          taskStats: {
            totalTasks: 156,
            completedTasks: 89,
            inProgressTasks: 45,
            delayedTasks: 22,
          },
          teamStats: {
            totalMembers: 25,
            activeMembers: 20,
            averageTaskCompletion: 85,
          },
          recentActivities: [
            {
              key: '1',
              project: '專案 A',
              activity: '完成系統架構設計',
              status: 'completed',
              date: '2024-03-20',
            },
            {
              key: '2',
              project: '專案 B',
              activity: '開始進行用戶測試',
              status: 'in_progress',
              date: '2024-03-19',
            },
            {
              key: '3',
              project: '專案 C',
              activity: '延遲：等待客戶反饋',
              status: 'delayed',
              date: '2024-03-18',
            },
          ],
          projectProgress: [
            {
              project: '專案 A',
              progress: 75,
              status: 'in_progress',
            },
            {
              project: '專案 B',
              progress: 45,
              status: 'in_progress',
            },
            {
              project: '專案 C',
              progress: 90,
              status: 'in_progress',
            },
            {
              project: '專案 D',
              progress: 100,
              status: 'completed',
            },
          ],
          // 新增模擬數據
          teamWorkload: [
            { name: '張小明', activeProjects: 3, activeTasks: 12, completionRate: 85 },
            { name: '李大偉', activeProjects: 2, activeTasks: 8, completionRate: 92 },
            { name: '陳美玲', activeProjects: 4, activeTasks: 15, completionRate: 78 },
            { name: '王建國', activeProjects: 1, activeTasks: 6, completionRate: 95 },
            { name: '林佳怡', activeProjects: 3, activeTasks: 10, completionRate: 88 },
          ],
          weeklyProgress: [
            { day: '週一', completed: 8, created: 12 },
            { day: '週二', completed: 10, created: 8 },
            { day: '週三', completed: 12, created: 10 },
            { day: '週四', completed: 9, created: 15 },
            { day: '週五', completed: 14, created: 7 },
            { day: '週六', completed: 3, created: 2 },
            { day: '週日', completed: 1, created: 1 },
          ],
          taskByStatus: [
            { name: '已完成', value: 89, color: statusColors.completed },
            { name: '進行中', value: 45, color: statusColors.in_progress },
            { name: '延遲', value: 22, color: statusColors.delayed },
            { name: '待處理', value: 34, color: statusColors.pending },
          ],
        };
        
        setData(mockData);
      } catch (error) {
        console.error('獲取儀表板數據失敗:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [timeRange]);

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
                  data={data?.taskByStatus || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data?.taskByStatus.map((entry, index) => (
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
              dataSource={data?.projectProgress || []}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="團隊工作量" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={data?.teamWorkload || []}
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
              dataSource={data?.recentActivities || []}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}