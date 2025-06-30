'use client';

import { Modal, Form, Input, DatePicker, Select, message } from 'antd';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  managerId: number;
  managerName: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectFormData {
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  managerId: number;
}

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ProjectFormData) => Promise<void>;
  initialData?: Project;
}

interface TeamMember {
  id: number;
  name: string;
}

export default function ProjectForm({
  open,
  onClose,
  onSubmit,
  initialData,
}: ProjectFormProps) {
  const [form] = Form.useForm();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);

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
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    if (open && initialData) {
      form.setFieldsValue({
        ...initialData,
        startDate: dayjs(initialData.startDate),
        endDate: dayjs(initialData.endDate),
      });
    } else {
      form.resetFields();
    }
  }, [open, initialData, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      await onSubmit({
        ...values,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
      });
    } catch (error) {
      message.error('請填寫所有必填欄位');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={initialData ? '編輯專案' : '新增專案'}
      open={open}
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="專案名稱"
          rules={[{ required: true, message: '請輸入專案名稱' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item name="description" label="專案描述">
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="managerId"
          label="專案負責人"
          rules={[{ required: true, message: '請選擇專案負責人' }]}
        >
          <Select>
            {teamMembers.map((member) => (
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
            <Select.Option value="pending">待開始</Select.Option>
            <Select.Option value="in_progress">進行中</Select.Option>
            <Select.Option value="completed">已完成</Select.Option>
            <Select.Option value="cancelled">已取消</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="startDate"
          label="開始日期"
          rules={[{ required: true, message: '請選擇開始日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="endDate"
          label="結束日期"
          rules={[{ required: true, message: '請選擇結束日期' }]}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
