import React, { useState } from 'react';
import { Modal, Upload, Button, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

interface ImportTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ImportTaskModal: React.FC<ImportTaskModalProps> = ({ open, onClose, onSuccess }) => {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (options: any) => {
    setUploading(true);
    const { file } = options;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/tasks/import', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (result.success) {
        message.success('匯入成功');
        onSuccess();
        onClose();
      } else {
        message.error(result.message || '匯入失敗');
      }
    } catch (e) {
      message.error('匯入失敗');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      title="批次匯入專案與任務"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Spin spinning={uploading}>
        <Upload.Dragger
          accept=".csv,.xlsx"
          customRequest={handleUpload}
          showUploadList={false}
          disabled={uploading}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">點擊或拖曳檔案上傳（支援 Excel/CSV）</p>
        </Upload.Dragger>
        <div style={{ marginTop: 16, color: '#888' }}>
          請下載範例檔案，依格式填寫後上傳。<br />
          <a href="/uploads/general/import_sample.xlsx" download style={{
             color: '#1890ff', fontSize: 20, textDecoration: 'underline', cursor: 'pointer', opacity: 0.8    
           }}>下載 Excel 範例</a>
        </div>
      </Spin>
    </Modal>
  );
};

export default ImportTaskModal;

