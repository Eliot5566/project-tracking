'use client';
import { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Spin,
} from 'antd';
import dayjs from 'dayjs';

// interface AuditItem 用來定義稽核項目的資料結構
interface AuditItem {
  id: number;
  startDate: string;
  endDate: string;
  department: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// AuditPage 用來顯示稽核項目列表和新增稽核項目的功能
export default function AuditPage() {
  const [auditList, setAuditList] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [departments, setDepartments] = useState<string[]>([]);
  const [depLoading, setDepLoading] = useState(false);
  A;

  // 取得部門清單
  const fetchDepartments = async () => {
    setDepLoading(true);
    try {
      const res = await fetch('/api/audit/departments');
      const result = await res.json();
      if (result.success) {
        setDepartments(result.data);
      } else {
        setDepartments([]);
      }
    } catch {
      setDepartments([]);
    } finally {
      setDepLoading(false);
    }
  };

  const fetchAuditList = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit');
      const result = await res.json();
      if (result.success) {
        setAuditList(result.data);
      } else {
        message.error(result.error || '取得稽核清單失敗');
      }
    } catch (e) {
      message.error('取得稽核清單失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditList();
    fetchDepartments();
  }, []);

  const handleAddAudit = async (values: any) => {
    try {
      const payload = {
        ...values,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
      };
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        message.success('新增稽核項目成功');
        setModalVisible(false);
        form.resetFields();
        fetchAuditList();
      } else {
        message.error(result.error || '新增失敗');
      }
    } catch (e) {
      message.error('新增失敗');
    }
  };

  const columns = [
    { title: '稽核部門', dataIndex: 'department', key: 'department' },
    {
      title: '起始時間',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (d: string) => dayjs(d).format('YYYY-MM-DD'),
    },
    {
      title: '結束時間',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (d: string) => dayjs(d).format('YYYY-MM-DD'),
    },
    { title: '稽核內容', dataIndex: 'content', key: 'content' },
    {
      title: '建立時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d: string) => dayjs(d).format('YYYY-MM-DD HH:mm'),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card
        title="稽核專區"
        extra={
          <Button type="primary" onClick={() => setModalVisible(true)}>
            新增稽核項目
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={auditList}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
      <Modal
        title="新增稽核項目"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddAudit}>
          <Form.Item
            name="department"
            label="稽核部門"
            rules={[{ required: true, message: '請選擇部門' }]}
          >
            <Select placeholder="選擇部門" loading={depLoading}>
              {departments.map((dep) => (
                <Select.Option key={dep} value={dep}>
                  {dep}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="startDate"
            label="起始時間"
            rules={[{ required: true, message: '請選擇起始時間' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="結束時間"
            rules={[{ required: true, message: '請選擇結束時間' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="content"
            label="稽核內容"
            rules={[{ required: true, message: '請輸入內容' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button
              type="default"
              onClick={() => setModalVisible(false)}
              style={{ marginRight: 8 }}
              block
            >
              取消
            </Button>
            <Button type="primary" htmlType="submit" block>
              確定
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
