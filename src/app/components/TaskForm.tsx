'use client';

import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber,
  message 
} from 'antd';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
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
  dueDate: string;
  assignedTo: number;
  projectId: number;
}

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormData) => Promise<void>;
  initialData?: Task;
}

interface Project {
  id: number;
  name: string;
}

interface TeamMember {
  id: number;
  name: string;
}

export default function TaskForm({ open, onClose, onSubmit, initialData }: TaskFormProps) {
  const [form] = Form.useForm();
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);

  // 獲取專案列表
  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const result = await response.json();
      if (result.success) {
        setProjects(result.data);
      }
    } catch (error) {
      console.error('獲取專案列表失敗:', error);
    }
  };

  // 獲取團隊成員列表
  const fetchTeamMembers = async () => {
    try {
      const response = await fetch('/api/team');
      const result = await response.json();
      if (result.success) {
        setTeamMembers(result.data);
      }
    } catch (error) {
      console.error('獲取團隊成員列表失敗:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    if (open && initialData) {
      form.setFieldsValue({
        ...initialData,
        dueDate: dayjs(initialData.dueDate),
      });
    } else {
      form.resetFields();
    }
  }, [open, initialData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      await onSubmit({
        ...values,
        dueDate: values.dueDate.format('YYYY-MM-DD'),
      });
    } catch (error) {
      message.error('請填寫所有必填欄位');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialData ? '編輯任務' : '新增任務'}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="title"
          label="任務名稱"
          rules={[{ required: true, message: '請輸入任務名稱' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="任務描述"
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="projectId"
          label="所屬專案"
          rules={[{ required: true, message: '請選擇所屬專案' }]}
        >
          <Select>
            {projects.map(project => (
              <Select.Option key={project.id} value={project.id}>
                {project.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="assignedTo"
          label="負責人"
          rules={[{ required: true, message: '請選擇負責人' }]}
        >
          <Select>
            {teamMembers.map(member => (
              <Select.Option key={member.id} value={member.id}>
                {member.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="狀態"
          rules={[{ required: true, message: '請選擇狀態' }]}
        >
          <Select>
            <Select.Option value="pending">待處理</Select.Option>
            <Select.Option value="in_progress">進行中</Select.Option>
            <Select.Option value="completed">已完成</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="priority"
          label="優先級"
          rules={[{ required: true, message: '請選擇優先級' }]}
        >
          <Select>
            <Select.Option value="high">高</Select.Option>
            <Select.Option value="medium">中</Select.Option>
            <Select.Option value="low">低</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="dueDate"
          label="截止日期"
          rules={[{ required: true, message: '請選擇截止日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
} 