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

// 定義任務的資料結構 
// interface 的使用可以讓我們定義一個物件的結構，這樣在使用時可以更清楚地知道每個屬性是什麼類型 
// 這裡的 Task 介面定義了一個任務的結構，包括 id、標題、描述、狀態、優先級、截止日期、負責人、專案 ID 和名稱、進度、創建和更新時間等屬性
// 這些屬性都是任務所需的基本資訊，並且有明確的類型定義
// 這樣在使用時可以更清楚地知道每個屬性是什麼類型，並且可以在編譯時檢查類型是否正確
// 這樣可以提高程式碼的可讀性和可維護性
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
  open: boolean; // 控制對話框是否顯示的布林值 類似房間裡電燈的開關
  onClose: () => void; // 關閉對話框的函數 void表示此函數不返回任何值
  onSubmit: (values: TaskFormData) => Promise<void>; // 用於提交表單，一個送出的方法，values是表單的資料
  // Promise<void>表示這個函數會返回一個 Promise，並且不會返回任何值 , Promise 是一個表示異步操作的物件 
  // 當這個函數被調用時，它會返回一個 Promise，這個 Promise 會在操作完成後被解析 
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


// TaskForm 組件用於顯示任務的新增和編輯表單
// 這個組件使用了 Ant Design 的 Modal、Form、Input、Select 和 DatePicker 組件來實現表單的功能
// 這個組件的主要功能是用於新增和編輯任務，並且可以選擇專案和負責人
// open 是一個布林值，用於控制對話框是否顯示 onClose 是一個函數，用於關閉對話框 onSubmit 是一個函數，用於提交表單 initialData 是一個任務的資料，用於編輯任務時的初始值
// 後方的 : TaskFormProps 是一個 TypeScript 的介面，用於定義這個組件的 props 的類型 代表這個組件的 props 的類型是 TaskFormProps

// 這個組件使用了 useState 和 useEffect 來管理狀態和副作用
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

  const handleSubmit = async (values: any) => {
    try {
      const taskData = {
        ...values,
        dueDate: values.dueDate.format('YYYY-MM-DD'),
        progress: values.status === 'completed' ? 100 : values.progress || 0,
        ...(initialData?.id ? { id: initialData.id } : {})
      };
      await onSubmit(taskData);
      onClose();
    } catch (error) {
      message.error('任務儲存失敗');
    }
  };

  return (
    <Modal
      title={initialData ? '編輯任務' : '新增任務'}
      open={open}
      onOk={() => form.submit()}
      onCancel={onClose}
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
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