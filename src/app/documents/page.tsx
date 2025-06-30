"use client";
import { useRouter } from 'next/navigation';


import React, { useState, useEffect } from 'react';
import { Table, Button, Upload, Modal, Form, Input, message, Tag, Space } from 'antd';
import { UploadOutlined, DownloadOutlined, HistoryOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface Document {
  id: number;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  description: string;
  uploadedBy: string;
  projectId: number;
  taskId: number;
  isLatestVersion: boolean;
  parentDocumentId: number | null;
  versionNumber: number;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLogin = localStorage.getItem('isLogin') === '1';
      if (!isLogin) {
        router.replace('/login');
      }
    }
  }, []);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyVersions, setHistoryVersions] = useState<Document[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTitle, setHistoryTitle] = useState('');

  // 撈取文件列表
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/documents');
      const result = await response.json();
      if (result.success) {
        // 僅顯示每組 parentDocumentId 或 id 的最新版本
        const docs: Document[] = result.data;
        // 以 parentDocumentId 或 id 分組，取 versionNumber 最大的那筆
        const latestMap = new Map<number, Document>();
        for (const doc of docs) {
          // 主檔案 id
          const mainId = doc.parentDocumentId || doc.id;
          const exist = latestMap.get(mainId);
          if (!exist || doc.versionNumber > exist.versionNumber) {
            latestMap.set(mainId, doc);
          }
        }
        setDocuments(Array.from(latestMap.values()));
      } else {
        message.error('無法加載文件列表');
      }
    } catch (error) {
      console.error('獲取文件列表失敗:', error);
      message.error('無法加載文件列表');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // 處理上傳，重點取出 Upload 組件傳入的檔案 (從檔案陣列中取得 originFileObj)
  const handleUpload = async (values: any) => {
    try {
      const formData = new FormData();

      // 若 values.file 為陣列則取第一筆資料，並從中取出 originFileObj
      const fileItem = Array.isArray(values.file) ? values.file[0] : values.file;
      const fileObj = fileItem && fileItem.originFileObj ? fileItem.originFileObj : fileItem;

      if (!fileObj) {
        message.error('文件格式不正確，請重新選擇');
        return;
      }

      formData.append('file', fileObj);
      formData.append('description', values.description || '');
      formData.append('password', values.password || '');

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        message.success('文件上傳成功');
        setUploadModalVisible(false);
        form.resetFields();
        fetchDocuments();
      } else {
        message.error('文件上傳失敗：' + (result.error || '未知錯誤'));
      }
    } catch (error) {
      console.error('文件上傳錯誤:', error);
      message.error('文件上傳失敗');
    }
  };

  // 下載功能：呼叫後端下載 API，並以 Blob 建立 object URL 供瀏覽器下載
  // 下載功能：需輸入密碼
  const handleDownload = async (filePath: string) => {
    let password = '';
    await new Promise((resolve) => {
      Modal.confirm({
        title: '下載驗證',
        content: (
          <Input.Password
            placeholder="請輸入文件密碼"
            onChange={e => (password = e.target.value)}
            onPressEnter={() => { Modal.destroyAll(); resolve(null); }}
          />
        ),
        onOk: () => resolve(null),
        onCancel: () => resolve(null),
        okText: '確定',
        cancelText: '取消',
      });
    });
    if (!password) return;
    try {
      const response = await fetch(
        `/api/documents/download?filePath=${encodeURIComponent(filePath)}&password=${encodeURIComponent(password)}`
      );
      if (!response.ok) {
        const res = await response.json().catch(() => ({}));
        message.error(res.error || '下載失敗');
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop() || 'file';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下載錯誤:', error);
      message.error('下載失敗');
    }
  };

  // 歷史版本查詢
  const showHistory = async (record: Document) => {
    setHistoryModalVisible(true);
    setHistoryLoading(true);
    setHistoryTitle(record.originalName);
    try {
      const parentId = record.parentDocumentId || record.id;
      const res = await fetch(`/api/documents/history?parentId=${parentId}`);
      const result = await res.json();
      if (result.success) {
        setHistoryVersions(result.data);
      } else {
        setHistoryVersions([]);
        message.error('查詢歷史版本失敗');
      }
    } catch (e) {
      setHistoryVersions([]);
      message.error('查詢歷史版本失敗');
    } finally {
      setHistoryLoading(false);
    }
  };

  const columns = [
    {
      title: '文件名稱',
      dataIndex: 'originalName',
      key: 'originalName',
    },
    {
      title: '文件類型',
      dataIndex: 'fileType',
      key: 'fileType',
    },
    {
      title: '版本',
      dataIndex: 'versionNumber',
      key: 'versionNumber',
      render: (version: number) => <Tag>{`v${version}`}</Tag>,
    },
    {
      title: '上傳者',
      dataIndex: 'uploadedBy',
      key: 'uploadedBy',
    },
    {
      title: '上傳時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Document) => (
        <Space>
          <Button icon={<DownloadOutlined />} onClick={() => handleDownload(record.filePath)}>
            下載
          </Button>
          <Button icon={<HistoryOutlined />} onClick={() => showHistory(record)}>
            歷史版本
          </Button>
          <Button danger onClick={() => handleDelete(record)}>
            刪除
          </Button>
        </Space>
      ),
    },
  ];

  // 刪除功能：需輸入密碼
  const handleDelete = (record: Document) => {
    let password = '';
    Modal.confirm({
      title: '刪除驗證',
      content: (
        <Input.Password
          placeholder="請輸入文件密碼"
          onChange={e => (password = e.target.value)}
          onPressEnter={() => { Modal.destroyAll(); doDelete(); }}
        />
      ),
      onOk: () => doDelete(),
      onCancel: () => {},
      okText: '確定',
      cancelText: '取消',
    });
    async function doDelete() {
      if (!password) return;
      try {
        const res = await fetch(`/api/documents?id=${record.id}&password=${encodeURIComponent(password)}`, {
          method: 'DELETE',
        });
        const result = await res.json();
        if (result.success) {
          message.success('刪除成功');
          fetchDocuments();
        } else {
          message.error(result.error || '刪除失敗');
        }
      } catch (error) {
        message.error('刪除失敗');
      }
    }
  };

  // 歷史版本 Modal 內容
  const [uploadingVersion, setUploadingVersion] = useState(false);
  const [versionForm] = Form.useForm();

  const handleUploadVersion = async (values: any) => {
    try {
      setUploadingVersion(true);
      const formData = new FormData();
      const fileItem = Array.isArray(values.file) ? values.file[0] : values.file;
      const fileObj = fileItem && fileItem.originFileObj ? fileItem.originFileObj : fileItem;
      if (!fileObj) {
        message.error('文件格式不正確，請重新選擇');
        return;
      }
      formData.append('file', fileObj);
      formData.append('description', values.description || '');
      // 決定主檔案 id：如果 parentDocumentId 有值就用它，否則用 id
      const mainId = historyVersions.find(v => v.parentDocumentId === null)?.id || historyVersions[0]?.parentDocumentId || historyVersions[0]?.id;
      formData.append('parentDocumentId', String(mainId));
      formData.append('versionNumber', String((Math.max(...historyVersions.map(v => v.versionNumber)) || 1) + 1));
      // 其餘欄位如需 projectId、taskId 可自行補充
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (result.success) {
        message.success('新版本上傳成功');
        versionForm.resetFields();
        setHistoryModalVisible(false);
        fetchDocuments();
      } else {
        message.error('新版本上傳失敗：' + (result.error || '未知錯誤'));
      }
    } catch (error) {
      message.error('新版本上傳失敗');
    } finally {
      setUploadingVersion(false);
    }
  };

  // 歷史版本 Modal 內容
  const historyColumns = [
    { title: '版本', dataIndex: 'versionNumber', key: 'versionNumber', render: (v: number) => <Tag>v{v}</Tag> },
    { title: '上傳時間', dataIndex: 'createdAt', key: 'createdAt', render: (d: string) => dayjs(d).format('YYYY-MM-DD HH:mm:ss') },
    { title: '上傳者', dataIndex: 'uploadedBy', key: 'uploadedBy' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '操作', key: 'action', render: (_: any, rec: Document) => (
      <Button icon={<DownloadOutlined />} onClick={() => handleDownload(rec.filePath)} size="small">下載</Button>
    ) },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Button
        type="primary"
        icon={<UploadOutlined />}
        onClick={() => setUploadModalVisible(true)}
        style={{ marginBottom: '16px' }}
      >
        上傳文件
      </Button>

      <Table columns={columns} dataSource={documents} rowKey="id" loading={loading} />
      {/* 歷史版本 Modal */}
      <Modal
        title={`歷史版本 - ${historyTitle}`}
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={null}
        width={700}
      >
        <Table
          columns={historyColumns}
          dataSource={historyVersions}
          rowKey="id"
          loading={historyLoading}
          size="small"
          pagination={false}
        />
        <div style={{ marginTop: 24 }}>
          <Form form={versionForm} layout="vertical" onFinish={handleUploadVersion}>
            <Form.Item
              name="file"
              label="上傳新版本"
              valuePropName="fileList"
              getValueFromEvent={e => (Array.isArray(e) ? e : e && e.fileList)}
              rules={[{ required: true, message: '請選擇文件' }]}
            >
              <Upload beforeUpload={() => false} maxCount={1}>
                <Button icon={<UploadOutlined />}>選擇文件</Button>
              </Upload>
            </Form.Item>
            <Form.Item name="description" label="版本描述">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={uploadingVersion} block>
                上傳新版本
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      <Modal
        title="上傳文件"
        open={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpload}>
          <Form.Item
            name="file"
            label="選擇文件"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
            rules={[{ required: true, message: '請選擇文件' }]}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>選擇文件</Button>
            </Upload>
          </Form.Item>

          <Form.Item name="description" label="文件描述">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="password"
            label="下載密碼"
            rules={[{ required: true, message: '請輸入下載密碼' }]}
          >
            <Input.Password placeholder="請輸入密碼，下載/歷史版本需驗證" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              上傳
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
