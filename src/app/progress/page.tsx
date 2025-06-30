'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Progress,
  Table,
  Tag,
  Tabs,
  Select,
  Row,
  Col,
  Statistic,
  Space,
  Alert,
  Spin,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
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
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import dayjs from 'dayjs';
import ExportButton from '../components/ExportButton';
import { UpOutlined, DownOutlined } from '@ant-design/icons';

// 專案進度介面
interface ProjectProgress {
  id: number;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  totalTasks: number;
  completedTasks: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

// 績效數據介面
interface PersonalPerformance {
  memberId: number;
  name: string;
  tasksAssigned: number;
  tasksCompleted: number;
  completionRate: number;
  onTimeRate: number;
  averageDelay: number;
}

interface ProjectCompletionRate {
  projectId: number;
  name: string;
  plannedDuration: number;
  actualDuration: number;
  efficiency: number;
  tasksOnTime: number;
  tasksDelayed: number;
  onTimeRate: number;
}

interface OverallStats {
  totalProjects: number;
  completedProjects: number;
  delayedProjects: number;
  projectCompletionRate: number;
  taskCompletionRate: number;
  averageTeamPerformance: number;
}

interface TimeTracking {
  date: string;
  tasksCompleted: number;
  hoursLogged: number;
  efficiency: number;
}

interface PerformanceData {
  personalPerformance: PersonalPerformance[];
  projectCompletionRate: ProjectCompletionRate[];
  overallStats: OverallStats;
  timeTracking: TimeTracking[];
}

// 頁面組件
const ProgressPage = () => {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLogin = localStorage.getItem('isLogin') === '1';
      if (!isLogin) {
        router.replace('/login');
      }
    }
  }, []);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<ProjectProgress[]>([]);
  const [performanceData, setPerformanceData] =
    useState<PerformanceData | null>(null);
  const [timeRange, setTimeRange] = useState('month');

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/progress');
      const result = await response.json();

      if (result.success) {
        setProgressData(result.data);
      } else {
        message.error('獲取進度資料失敗');
      }
    } catch (error) {
      console.error('獲取進度資料錯誤:', error);
      message.error('獲取進度資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/progress/performance?timeRange=${timeRange}`
      );
      const result = await response.json();

      if (result.success) {
        setPerformanceData(result.data);
      } else {
        message.error('獲取績效數據失敗');
      }
    } catch (error) {
      console.error('獲取績效數據錯誤:', error);
      message.error('獲取績效數據失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressData();
    fetchPerformanceData();
  }, [timeRange]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '進行中':
        return 'processing';
      case '已完成':
        return 'success';
      case '延遲':
        return 'error';
      case '等待中':
        return 'warning';
      default:
        return 'default';
    }
  };

  // 渲染專案進度表格
  const projectProgressColumns: ColumnsType<ProjectProgress> = [
    {
      title: '專案名稱',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: '進度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => <Progress percent={progress} size="small" />,
    },
    {
      title: '完成任務',
      key: 'tasks',
      render: (_, record) => `${record.completedTasks}/${record.totalTasks}`,
    },
    {
      title: '開始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '結束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
    },
  ];

  // 渲染個人績效表格
  const personalPerformanceColumns: ColumnsType<PersonalPerformance> = [
    {
      title: '成員姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '總任務數',
      dataIndex: 'tasksAssigned',
      key: 'tasksAssigned',
    },
    {
      title: '已完成任務',
      dataIndex: 'tasksCompleted',
      key: 'tasksCompleted',
    },
    {
      title: '完成率',
      dataIndex: 'completionRate',
      key: 'completionRate',
      render: (rate) => <Progress percent={rate} size="small" />,
    },
    {
      title: '按時完成率',
      dataIndex: 'onTimeRate',
      key: 'onTimeRate',
      render: (rate) => (
        <Progress
          percent={rate}
          size="small"
          status={rate < 80 ? 'exception' : 'success'}
        />
      ),
    },
    {
      title: '平均延遲天數',
      dataIndex: 'averageDelay',
      key: 'averageDelay',
      render: (delay) => (
        <Space>
          {delay.toFixed(1)}天{delay > 2 && <Tag color="error">需要注意</Tag>}
        </Space>
      ),
    },
  ];

  // 渲染專案完成率表格
  const projectCompletionColumns: ColumnsType<ProjectCompletionRate> = [
    {
      title: '專案名稱',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '計劃天數',
      dataIndex: 'plannedDuration',
      key: 'plannedDuration',
      render: (days) => `${days} 天`,
    },
    {
      title: '實際天數',
      dataIndex: 'actualDuration',
      key: 'actualDuration',
      render: (days) => `${days} 天`,
    },
    {
      title: '效率指數',
      dataIndex: 'efficiency',
      key: 'efficiency',
      render: (eff) => (
        <Space>
          {eff != null ? `${eff.toFixed(1)}%` : '0%'}
          {eff <= 100 ? (
            <UpOutlined style={{ color: 'green' }} />
          ) : (
            <DownOutlined style={{ color: 'red' }} />
          )}
        </Space>
      ),
    },
    {
      title: '按時完成率',
      dataIndex: 'onTimeRate',
      key: 'onTimeRate',
      render: (rate) => <Progress percent={rate} size="small" />,
    },
    {
      title: '按時/延遲任務數',
      key: 'taskCount',
      render: (_, record) => `${record.tasksOnTime} / ${record.tasksDelayed}`,
    },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF0000'];

  // 計算績效導出數據
  // const personalPerformanceExport = performanceData?.personalPerformance.map(p => ({
  //   ...p,
  //   completionRate: `${p.completionRate.toFixed(1)}%`,
  //   onTimeRate: `${p.onTimeRate.toFixed(1)}%`,
  //   averageDelay: `${p.averageDelay.toFixed(1)} 天`,
  // })) || [];

  const personalPerformanceExport =
    performanceData?.personalPerformance.map((p) => ({
      ...p,
      completionRate: `${(p.completionRate ?? 0).toFixed(1)}%`,
      onTimeRate: `${(p.onTimeRate ?? 0).toFixed(1)}%`,
      averageDelay: `${(p.averageDelay ?? 0).toFixed(1)} 天`,
    })) || [];

  // onTimeRate來自資料表 performanceData.projectCompletionRate
  const projectCompletionExport =
    performanceData?.projectCompletionRate.map((p) => ({
      ...p,
      efficiency: `${
        p.efficiency != null ? (p.efficiency * 100).toFixed(1) : '0'
      }%`,
      onTimeRate: `${p.onTimeRate != null ? p.onTimeRate.toFixed(1) : '0'}%`,
      plannedDuration: `${p.plannedDuration || 0} 天`,
      actualDuration: `${p.actualDuration || 0} 天`,
    })) || [];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="績效分析儀表板"
        extra={
          <Space>
            <Select
              defaultValue={timeRange}
              style={{ width: 120 }}
              onChange={setTimeRange}
              options={[
                { value: 'week', label: '本週' },
                { value: 'month', label: '本月' },
                { value: 'quarter', label: '本季度' },
                { value: 'year', label: '本年度' },
              ]}
            />
            <ExportButton
              data={personalPerformanceExport}
              columns={personalPerformanceColumns.map((c) => ({
                title: c.title as string,
                dataIndex: c.dataIndex as string,
              }))}
              fileName="團隊績效報表"
              buttonText="匯出績效報表"
            />
          </Space>
        }
      >
        <Tabs defaultActiveKey="overview">
          <Tabs.TabPane tab="總覽" key="overview">
            <Spin spinning={loading || !performanceData}>
              {performanceData?.overallStats && (
                <>
                  <Row gutter={16} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Card>
                        <Statistic
                          title="專案完成率"
                          value={
                            performanceData.overallStats
                              .projectCompletionRate != null
                              ? performanceData.overallStats
                                  .projectCompletionRate
                              : '-'
                          }
                          precision={
                            performanceData.overallStats
                              .projectCompletionRate != null
                              ? 1
                              : 0
                          }
                          suffix={
                            performanceData.overallStats
                              .projectCompletionRate != null
                              ? '%'
                              : ''
                          }
                          valueStyle={{
                            color:
                              performanceData.overallStats
                                .projectCompletionRate != null &&
                              performanceData.overallStats
                                .projectCompletionRate > 80
                                ? '#3f8600'
                                : '#cf1322',
                          }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Card>
                        <Statistic
                          title="任務完成率"
                          value={
                            performanceData.overallStats.taskCompletionRate
                          }
                          precision={1}
                          suffix="%"
                          valueStyle={{
                            color:
                              performanceData.overallStats.taskCompletionRate >
                              80
                                ? '#3f8600'
                                : '#cf1322',
                          }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Card>
                        <Statistic
                          title="團隊平均績效"
                          value={
                            performanceData.overallStats.averageTeamPerformance
                          }
                          precision={1}
                          suffix="%"
                          valueStyle={{
                            color:
                              performanceData.overallStats
                                .averageTeamPerformance > 80
                                ? '#3f8600'
                                : '#cf1322',
                          }}
                        />
                      </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                      <Card>
                        <Statistic
                          title="延遲專案比例"
                          value={(
                            (performanceData.overallStats.delayedProjects /
                              performanceData.overallStats.totalProjects) *
                            100
                          ).toFixed(1)}
                          precision={1}
                          suffix="%"
                          valueStyle={{
                            color:
                              performanceData.overallStats.delayedProjects /
                                performanceData.overallStats.totalProjects <
                              0.2
                                ? '#3f8600'
                                : '#cf1322',
                          }}
                        />
                      </Card>
                    </Col>
                  </Row>

                  {/* 圖表 */}
                  <Row gutter={16}>
                    <Col xs={24} lg={12} style={{ marginBottom: 16 }}>
                      <Card title="團隊成員完成率比較">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart
                            data={performanceData.personalPerformance}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Legend />
                            <Bar
                              dataKey="completionRate"
                              name="任務完成率"
                              fill="#8884d8"
                            />
                            <Bar
                              dataKey="onTimeRate"
                              name="按時完成率"
                              fill="#82ca9d"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </Card>
                    </Col>

                    <Col xs={24} lg={12} style={{ marginBottom: 16 }}>
                      <Card title="專案效率指數">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={performanceData.projectCompletionRate.map(
                                (p, idx) => ({
                                  name: p.name,
                                  value: p.onTimeRate,
                                  color: COLORS[idx % COLORS.length],
                                })
                              )}
                              cx="50%"
                              cy="50%"
                              label={false} // 移除原本的 label，避免重疊
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {performanceData.projectCompletionRate.map(
                                (entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                )
                              )}
                            </Pie>
                            <Tooltip
                              formatter={(value, name, props) => [
                                `${value}%`,
                                props.payload.name,
                              ]}
                            />
                            <Legend
                              layout="vertical"
                              align="right"
                              verticalAlign="middle"
                              payload={performanceData.projectCompletionRate.map(
                                (p, idx) => ({
                                  value: p.name,
                                  type: 'square',
                                  color: COLORS[idx % COLORS.length],
                                })
                              )}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Card>
                    </Col>
                  </Row>

                  {/* <Row gutter={16}>
                    <Col span={24} style={{ marginTop: 16 }}>
                      <Card title="每日完成任務與工時追蹤">
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={performanceData.timeTracking}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Line
                              yAxisId="left"
                              type="monotone"
                              dataKey="tasksCompleted"
                              name="完成任務數"
                              stroke="#8884d8"
                              activeDot={{ r: 8 }}
                            />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="hoursLogged"
                              name="記錄工時"
                              stroke="#82ca9d"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Card>
                    </Col>
                  </Row> */}
                </>
              )}
            </Spin>
          </Tabs.TabPane>

          <Tabs.TabPane tab="團隊成員績效" key="personal">
            <Spin spinning={loading || !performanceData}>
              {performanceData?.personalPerformance && (
                <>
                  <Alert
                    message="績效評估指標"
                    description="此表顯示團隊成員的績效指標，包括任務完成率、準時交付率和平均延遲天數。這些數據可用於識別表現優異的成員以及可能需要支援的成員。"
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <Table
                    dataSource={performanceData.personalPerformance}
                    columns={personalPerformanceColumns}
                    rowKey="memberId"
                  />
                </>
              )}
            </Spin>
          </Tabs.TabPane>

          <Tabs.TabPane tab="專案完成率" key="project">
            <Spin spinning={loading || !performanceData}>
              {performanceData?.projectCompletionRate && (
                <>
                  <Alert
                    message="專案效率分析"
                    description="此表分析各專案的計劃與實際時間對比、效率指數和任務按時完成率。效率指數低於100%表示專案進度超前，高於100%表示延遲。"
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <Table
                    dataSource={performanceData.projectCompletionRate}
                    columns={projectCompletionColumns}
                    rowKey="projectId"
                  />
                </>
              )}
            </Spin>
          </Tabs.TabPane>

          <Tabs.TabPane tab="傳統進度追蹤" key="progress">
            <Table
              dataSource={progressData}
              columns={projectProgressColumns}
              rowKey="id"
              loading={loading}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ProgressPage;
