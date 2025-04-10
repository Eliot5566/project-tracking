'use client';

import { useState, useEffect } from 'react';
import { Card, List, Tag, Button, Empty, Spin, message, Badge } from 'antd';
import { BellOutlined, CheckOutlined, DeleteOutlined } from '@ant-design/icons';

interface Notification {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const userId = 1; // 假設當前用戶ID為1，實際應從用戶會話中獲取

  // 獲取通知
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications?userId=${userId}`);
      const result = await response.json();
      
      if (result.success) {
        setNotifications(result.data);
      } else {
        message.error('獲取通知失敗');
      }
    } catch (error) {
      console.error('獲取通知錯誤:', error);
      message.error('獲取通知失敗');
    } finally {
      setLoading(false);
    }
  };

  // 標記通知為已讀
  const markAsRead = async (id: number) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, isRead: true })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setNotifications(prev => prev.map(notif => 
          notif.id === id ? { ...notif, isRead: true } : notif
        ));
        message.success('已標記為已讀');
      } else {
        message.error('標記已讀失敗');
      }
    } catch (error) {
      console.error('標記已讀錯誤:', error);
      message.error('標記已讀失敗');
    }
  };

  // 標記所有通知為已讀
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      if (unreadNotifications.length === 0) {
        return message.info('沒有未讀通知');
      }
      
      await Promise.all(unreadNotifications.map(n => 
        fetch('/api/notifications', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id: n.id, isRead: true })
        })
      ));
      
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
      message.success('所有通知已標記為已讀');
    } catch (error) {
      console.error('標記所有已讀錯誤:', error);
      message.error('標記所有已讀失敗');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 获取通知类型标签
  const getNotificationTag = (type: string) => {
    switch (type) {
      case 'task':
        return <Tag color="blue">任務</Tag>;
      case 'project':
        return <Tag color="green">專案</Tag>;
      case 'system':
        return <Tag color="purple">系統</Tag>;
      case 'deadline':
        return <Tag color="red">期限提醒</Tag>;
      default:
        return <Tag>其他</Tag>;
    }
  };

  // 獲取通知日期的格式化顯示
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
      return `${diffMins} 分鐘前`;
    } else if (diffHours < 24) {
      return `${diffHours} 小時前`;
    } else if (diffDays < 30) {
      return `${diffDays} 天前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <BellOutlined style={{ marginRight: 8 }} />
            <span>我的通知</span>
            <Badge 
              count={notifications.filter(n => !n.isRead).length} 
              style={{ marginLeft: 8 }} 
            />
          </div>
        }
        extra={
          <Button type="primary" onClick={markAllAsRead} icon={<CheckOutlined />}>
            全部標記為已讀
          </Button>
        }
      >
        <Spin spinning={loading}>
          {notifications.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={notifications}
              renderItem={(item) => (
                <List.Item
                  style={{ 
                    padding: '16px', 
                    backgroundColor: item.isRead ? 'transparent' : '#f0f7ff',
                    borderBottom: '1px solid #f0f0f0' 
                  }}
                  actions={[
                    !item.isRead && (
                      <Button type="link" onClick={() => markAsRead(item.id)}>
                        標記為已讀
                      </Button>
                    )
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {!item.isRead && (
                          <Badge color="blue" style={{ marginRight: 8 }} />
                        )}
                        {getNotificationTag(item.type)}
                        <span style={{ marginLeft: 8 }}>{item.title}</span>
                      </div>
                    }
                    description={
                      <div>
                        <div>{item.content}</div>
                        <div style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
                          {formatDate(item.createdAt)}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="沒有通知" />
          )}
        </Spin>
      </Card>
    </div>
  );
}