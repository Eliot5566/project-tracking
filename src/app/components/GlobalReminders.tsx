import { useEffect, useState } from 'react';
import { Badge, Dropdown, List, Typography, Empty, Tag, Tooltip } from 'antd';
import { BellOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

export default function GlobalReminders() {
  const [reminders, setReminders] = useState<
    { type: string; title: string; dueDate: string }[]
  >([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const teamMemberId = user.teamMemberId;
    if (!teamMemberId) return;

    Promise.all([
      fetch(`/api/projects?managerId=${teamMemberId}`).then((res) =>
        res.json()
      ),
      fetch(`/api/tasks?assignedTo=${teamMemberId}`).then((res) => res.json()),
    ]).then(([projRes, taskRes]) => {
      const projReminders = (projRes.data || [])
        .filter(
          (p: any) =>
            p.status !== 'completed' &&
            dayjs(p.endDate).diff(dayjs(), 'day') <= 3 &&
            dayjs(p.endDate).diff(dayjs(), 'day') >= 0
        )
        .map((p: any) => ({
          type: '專案',
          title: p.name,
          dueDate: p.endDate,
        }));

      const taskReminders = (taskRes.data || [])
        .filter(
          (t: any) =>
            t.status !== 'completed' &&
            dayjs(t.dueDate).diff(dayjs(), 'day') <= 3 &&
            dayjs(t.dueDate).diff(dayjs(), 'day') >= 0
        )
        .map((t: any) => ({
          type: '任務',
          title: t.title,
          dueDate: t.dueDate,
        }));

      setReminders([...projReminders, ...taskReminders]);
    });
  }, []);

  return (
    <Dropdown
      overlay={
        <div
          style={{
            minWidth: 340,
            maxWidth: 420,
            maxHeight: 400,
            overflowY: 'auto',
            padding: 12,
            background: '#f9fafc',
            borderRadius: 8,
            boxShadow: '0 2px 12px #0001',
          }}
        >
          <Typography.Title
            level={5}
            style={{ margin: 0, marginBottom: 12, color: '#222' }}
          >
            <BellOutlined style={{ marginRight: 8, color: '#faad14' }} />
            到期提醒
          </Typography.Title>
          {reminders.length === 0 ? (
            <Empty
              description="暫無提醒"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              size="small"
              dataSource={reminders}
              renderItem={(item) => (
                <List.Item
                  style={{
                    padding: '10px 0',
                    border: 0,
                    alignItems: 'flex-start',
                  }}
                >
                  <Tag
                    color={item.type === '專案' ? 'blue' : 'orange'}
                    style={{
                      fontWeight: 600,
                      marginRight: 8,
                      fontSize: 13,
                      padding: '2px 8px',
                    }}
                  >
                    <BellOutlined style={{ marginRight: 4 }} />
                    {item.type}
                  </Tag>
                  <Tooltip title={item.title}>
                    <span
                      style={{
                        fontWeight: 500,
                        color: '#222',
                        maxWidth: 160,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'inline-block',
                        verticalAlign: 'middle',
                      }}
                    >
                      {item.title}
                    </span>
                  </Tooltip>
                  <span
                    style={{
                      float: 'right',
                      color: '#888',
                      marginLeft: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: 13,
                    }}
                  >
                    <CalendarOutlined
                      style={{ marginRight: 4, color: '#52c41a' }}
                    />
                    截止日：{dayjs(item.dueDate).format('YYYY-MM-DD')}
                  </span>
                </List.Item>
              )}
            />
          )}
        </div>
      }
      placement="bottomRight"
      trigger={['click']}
    >
      <Badge
        count={reminders.length}
        offset={[-5, 5]}
        style={{ backgroundColor: '#faad14', cursor: 'pointer' }}
      >
        <span style={{ fontWeight: 500, cursor: 'pointer', marginRight: 16 }}>
          <BellOutlined style={{ fontSize: 18, marginRight: 4 }} />
          提醒
        </span>
      </Badge>
    </Dropdown>
  );
}
