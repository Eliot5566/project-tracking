'use client';
import { useEffect } from 'react';

import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  message 
} from 'antd';

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
  status: string; // 添加 status 欄位
}

interface TeamMemberFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TeamMemberFormData) => Promise<void>;
  initialData?: TeamMember;
}

export default function TeamMemberForm({ open, onClose, onSubmit, initialData }: TeamMemberFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open && initialData) {
      form.setFieldsValue(initialData);
    } else {
      form.resetFields();
    }
  }, [open, initialData, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
    } catch (error) {
      message.error('請填寫所有必填欄位');
    }
  };

  return (
    <Modal
      title={initialData ? '編輯團隊成員' : '新增團隊成員'}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="姓名"
          rules={[{ required: true, message: '請輸入姓名' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="email"
          label="電子郵件"
          rules={[
            { required: true, message: '請輸入電子郵件' },
            { type: 'email', message: '請輸入有效的電子郵件地址' }
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="role"
          label="職位"
          rules={[{ required: true, message: '請選擇職位' }]}
        >
          <Select>
            <Select.Option value="project_manager">專案經理</Select.Option>
            <Select.Option value="frontend_developer">前端開發</Select.Option>
            <Select.Option value="backend_developer">後端開發</Select.Option>
            <Select.Option value="ui_designer">UI設計師</Select.Option>
            <Select.Option value="qa_engineer">QA工程師</Select.Option>
            <Select.Option value="devops_engineer">DevOps工程師</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="department"
          label="部門"
          rules={[{ required: true, message: '請選擇部門' }]}
        >
          <Select
            options={[
              { value: 'management', label: '管理部' },
              { value: 'development', label: '技術部' },
              { value: 'design', label: '設計部' },
              { value: 'qa', label: '品質保證部' },
              { value: 'operations', label: '運維部' }
            ]}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="狀態"
          rules={[{ required: true, message: '請選擇成員狀態' }]}
        >
          <Select
            options={[
              { value: 'active', label: '活躍' },
              { value: 'inactive', label: '非活躍' }
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}