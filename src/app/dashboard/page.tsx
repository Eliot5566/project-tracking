'use client';

import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Progress, Tag, Space } from 'antd';
import { Line } from '@ant-design/charts';
import {
  ProjectOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';

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
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          status: 'delayed',
        },
      ],
    };

    setData(mockData);
    setLoading(false);
  }, []);

  const columns = [
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
      render: (status: string) => (
        <Tag color={
          status === 'completed' ? 'success' :
          status === 'in_progress' ? 'processing' :
          'error'
        }>
          {status === 'completed' ? '已完成' :
           status === 'in_progress' ? '進行中' :
           '延遲'}
        </Tag>
      ),
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  if (loading) {
    return <div>載入中...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic
              title="總專案數"
              value={data?.projectStats.totalProjects}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="進行中專案"
              value={data?.projectStats.activeProjects}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成專案"
              value={data?.projectStats.completedProjects}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="延遲專案"
              value={data?.projectStats.delayedProjects}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={16}>
          <Card title="專案進度">
            <Table
              dataSource={data?.projectProgress}
              columns={[
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
                    <Progress percent={progress} size="small" />
                  ),
                },
                {
                  title: '狀態',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status: string) => (
                    <Tag color={
                      status === 'completed' ? 'success' :
                      status === 'in_progress' ? 'processing' :
                      'error'
                    }>
                      {status === 'completed' ? '已完成' :
                       status === 'in_progress' ? '進行中' :
                       '延遲'}
                    </Tag>
                  ),
                },
              ]}
              pagination={false}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="團隊統計">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Statistic
                title="團隊成員"
                value={data?.teamStats.totalMembers}
                prefix={<TeamOutlined />}
              />
              <Statistic
                title="活躍成員"
                value={data?.teamStats.activeMembers}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
              <Statistic
                title="平均任務完成率"
                value={data?.teamStats.averageTaskCompletion}
                suffix="%"
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="最近活動" style={{ marginTop: '16px' }}>
        <Table
          columns={columns}
          dataSource={data?.recentActivities}
          pagination={false}
        />
      </Card>
    </div>
  );
} 