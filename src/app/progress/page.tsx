"use client";

import { useEffect, useState } from 'react';
import { Card, Progress, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

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

const ProgressPage = () => {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<ProjectProgress[]>([]);

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

  useEffect(() => {
    fetchProgressData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case '進行中':
        return 'processing';
      case '已完成':
        return 'success';
      case '已延期':
        return 'warning';
      case '已取消':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns: ColumnsType<ProjectProgress> = [
    {
      title: '專案名稱',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: '進度',
      dataIndex: 'progress',
      key: 'progress',
      width: 200,
      render: (progress: number) => (
        <Progress percent={Math.round(progress)} size="small" />
      ),
    },
    {
      title: '任務統計',
      key: 'tasks',
      width: 150,
      render: (_, record) => (
        <span>
          {record.completedTasks} / {record.totalTasks}
        </span>
      ),
    },
    {
      title: '開始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '結束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
  ];

  return (
    <div className="p-6">
      <Card title="專案進度追蹤" className="mb-6">
        <Table
          columns={columns}
          dataSource={progressData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 個專案`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default ProgressPage; 