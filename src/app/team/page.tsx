"use client";

import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Typography, 
  Card,
  message,
  Modal
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import TeamMemberForm from '../components/TeamMemberForm';

const { Title } = Typography;
const { confirm } = Modal;

interface TeamMember {
  id: number;
  name: string;
  role: string;
  department: string;
  status: string;
  email: string;
  taskCount: number;
  averageProgress: number;
  createdAt: string;
  updatedAt: string;
}

interface TeamMemberFormData {
  name: string;
  role: string;
  department: string;
  email: string;
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | undefined>();
  const [loading, setLoading] = useState(false);

  // 獲取團隊成員列表
  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/team');
      const result = await response.json();
      if (result.success) {
        setTeamMembers(result.data);
      } else {
        message.error('獲取團隊成員列表失敗');
      }
    } catch (error) {
      message.error('獲取團隊成員列表失敗');
      console.error('獲取團隊成員列表失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleOpenDialog = (member?: TeamMember) => {
    setSelectedMember(member);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedMember(undefined);
    setOpenDialog(false);
  };

  const handleCreateMember = async (memberData: TeamMemberFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...memberData,
          status: 'active',
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        setTeamMembers(prev => [...prev, result.data]);
        message.success('團隊成員添加成功');
        handleCloseDialog();
      } else {
        message.error('添加團隊成員失敗');
      }
    } catch (error) {
      message.error('添加團隊成員失敗');
      console.error('添加團隊成員失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMember = async (memberData: TeamMemberFormData) => {
    if (!selectedMember) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/team', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedMember.id,
          ...memberData,
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        setTeamMembers(prev => prev.map(m => m.id === selectedMember.id ? result.data : m));
        message.success('團隊成員更新成功');
        handleCloseDialog();
      } else {
        message.error('更新團隊成員失敗');
      }
    } catch (error) {
      message.error('更新團隊成員失敗');
      console.error('更新團隊成員失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (memberId: number) => {
    confirm({
      title: '確認刪除',
      content: '確定要刪除這個團隊成員嗎？',
      async onOk() {
        setLoading(true);
        try {
          const response = await fetch(`/api/team?id=${memberId}`, {
            method: 'DELETE',
          });
          
          const result = await response.json();
          if (result.success) {
            setTeamMembers(prev => prev.filter(m => m.id !== memberId));
            message.success('團隊成員刪除成功');
          } else {
            message.error('刪除團隊成員失敗');
          }
        } catch (error) {
          message.error('刪除團隊成員失敗');
          console.error('刪除團隊成員失敗:', error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'on_leave':
        return 'warning';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: '成員姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '職位',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '部門',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status === 'active' ? '在職' : 
           status === 'inactive' ? '離職' : 
           status === 'on_leave' ? '請假中' : status}
        </Tag>
      ),
    },
    {
      title: '任務數',
      dataIndex: 'taskCount',
      key: 'taskCount',
    },
    {
      title: '平均進度',
      dataIndex: 'averageProgress',
      key: 'averageProgress',
      render: (progress: number) => `${progress}%`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: TeamMember) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleOpenDialog(record)}
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteMember(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
      <Card>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1rem' 
        }}>
          <Title level={3} style={{ margin: 0 }}>
            團隊管理
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenDialog()}
          >
            新增成員
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={teamMembers}
          rowKey="id"
          loading={loading}
        />

        <TeamMemberForm
          open={openDialog}
          onClose={handleCloseDialog}
          onSubmit={selectedMember ? handleUpdateMember : handleCreateMember}
          initialData={selectedMember}
        />
      </Card>
    </div>
  );
} 