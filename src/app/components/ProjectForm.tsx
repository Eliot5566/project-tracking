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

// 表單數據接口
interface ProjectFormData {
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  managerId: number;
}

// 新增/編輯專案的表單組件 - 包含專案名稱、描述、狀態、開始/結束日期、負責人等欄位
interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ProjectFormData) => Promise<void>;
  initialData?: Project;
}

// 團隊成員接口
interface TeamMember {
  id: number;
  name: string;
}

// 專案表單組件，支持新增和編輯專案，並且會從後端獲取團隊成員列表供選擇專案負責人使用。
// 表單提交時會驗證必填欄位，並將日期格式化後傳遞給父組件處理。
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

  // 當表單打開或初始數據變化時，將初始數據填充到表單中，並將日期字符串轉換為 dayjs 
  // 對象以供 DatePicker 使用。
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

  // 處理表單提交，將日期格式化為 'YYYY-MM-DD' 後傳遞給父組件的 onSubmit 函數。
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
