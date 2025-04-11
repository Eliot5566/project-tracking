'use client';

import React, { useState, useEffect } from 'react';
import { Table, Upload, Button, Input, Tag, Space, message, Modal, List, Form } from 'antd';
import { Comment } from '@ant-design/compatible';
import { UploadOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';

const DocumentManagementPage: React.FC = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [versionModalVisible, setVersionModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [versionHistory, setVersionHistory] = useState<any[]>([]);
  const [tags, setTags] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error('獲取文件列表失敗');
      }
      
      const data = await response.json();
      const formattedDocs = data.map((doc: any) => ({
        id: doc.id,
        key: doc.id,
        name: doc.originalName,
        type: doc.fileType,
        tags: doc.tags || ['未分類'],
        uploadedAt: new Date(doc.createdAt).toLocaleString(),
        versionCount: doc.versionCount || 1,
        description: doc.description,
        filePath: doc.filePath
      }));
      
      setDocuments(formattedDocs);
    } catch (error) {
      console.error('獲取文件列表失敗:', error);
      message.error('無法獲取文件列表');
    }
  };

  const handleUpload = async (file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadedBy', 'currentUser'); // Replace with actual user info
    formData.append('description', 'Sample description'); // Optional: Replace with actual description
    formData.append('projectId', '1'); // Optional: Replace with actual project ID
    formData.append('taskId', '2'); // Optional: Replace with actual task ID

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('文件上傳失敗');
      }

      const result = await response.json();
      const newDocument = {
        key: documents.length + 1,
        name: result.fileName,
        type: file.type,
        tags: ['未分類'],
        uploadedAt: new Date().toLocaleString(),
      };
      setDocuments([...documents, newDocument]);
      message.success(`${result.fileName} 上傳成功`);
    } catch (error) {
      console.error('上傳失敗:', error);
      message.error('文件上傳失敗');
    }
  };

  const handleVersionControl = async (document: any) => {
    setSelectedDocument(document);
    setVersionModalVisible(true);

    try {
      const response = await fetch(`/api/documents/versions?fileName=${document.name}`);
      if (!response.ok) {
        throw new Error('無法獲取版本歷史');
      }

      const history = await response.json();
      setVersionHistory(history);
    } catch (error) {
      console.error('獲取版本歷史失敗:', error);
      message.error('無法獲取版本歷史');
    }

    // Fetch tags and comments for the document
    fetchTagsAndComments(document.id);
  };

  const fetchTagsAndComments = async (documentId) => {
    try {
      const [tagsResponse, commentsResponse] = await Promise.all([
        fetch(`/api/documents/tags?documentId=${documentId}`),
        fetch(`/api/documents/comments?documentId=${documentId}`),
      ]);

      if (!tagsResponse.ok || !commentsResponse.ok) {
        throw new Error('Failed to fetch tags or comments');
      }

      const tagsData = await tagsResponse.json();
      const commentsData = await commentsResponse.json();

      setTags(tagsData);
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching tags or comments:', error);
      message.error('無法獲取標籤或評論');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`/api/documents/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: selectedDocument.id,
          commentedBy: 'currentUser', // Replace with actual user info
          content: newComment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const addedComment = await response.json();
      setComments([...comments, addedComment]);
      setNewComment('');
      message.success('評論已新增');
    } catch (error) {
      console.error('Error adding comment:', error);
      message.error('無法新增評論');
    }
  };

  const handleUploadNewVersion = async (file: any) => {
    if (!selectedDocument) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/api/documents/upload?fileName=${selectedDocument.name}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('新版本上傳失敗');
      }

      const result = await response.json();
      message.success(`${result.fileName} 新版本上傳成功`);

      // 更新版本歷史
      handleVersionControl(selectedDocument);
    } catch (error) {
      console.error('新版本上傳失敗:', error);
      message.error('新版本上傳失敗');
    }
  };

  const handleDownloadVersion = async (fileName: string, version: number) => {
    try {
      const response = await fetch(`/public/uploads/general/${fileName}_v${version}`);
      if (!response.ok) {
        throw new Error('下載失敗');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${fileName}_v${version}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      message.success('下載成功');
    } catch (error) {
      console.error('下載失敗:', error);
      message.error('下載失敗');
    }
  };

  const columns = [
    {
      title: '文件名稱',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '文件類型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '標籤',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <>{tags.map(tag => <Tag key={tag}>{tag}</Tag>)}</>
      ),
    },
    {
      title: '上傳時間',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleVersionControl(record)}>版本控制</Button>
          <Button type="link" danger>
            刪除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1>文件管理</h1>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索文件"
          prefix={<SearchOutlined />}
          onChange={e => setSearchText(e.target.value)}
        />
        <Upload
          beforeUpload={file => {
            handleUpload(file);
            return false;
          }}
        >
          <Button icon={<UploadOutlined />}>上傳文件</Button>
        </Upload>
      </Space>
      <Table columns={columns} dataSource={documents.filter(doc => doc.name.toLowerCase().includes(searchText.toLowerCase()))} />

      <Modal
        title={`文件詳情 - ${selectedDocument?.name}`}
        visible={versionModalVisible}
        onCancel={() => setVersionModalVisible(false)}
        footer={null}
      >
        <h3>標籤</h3>
        <div>
          {tags.map(tag => (
            <Tag key={tag.id} color={tag.color}>{tag.name}</Tag>
          ))}
        </div>

        <h3>評論</h3>
        <List
          dataSource={comments}
          renderItem={comment => (
            <Comment
              author={comment.commentedBy}
              content={comment.content}
              datetime={comment.createdAt}
            />
          )}
        />
        <Form.Item>
          <Input.TextArea
            rows={4}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="新增評論"
          />
        </Form.Item>
        <Button type="primary" onClick={handleAddComment}>提交評論</Button>

        <h3>版本歷史</h3>
        <ul>
          {versionHistory.map((version, index) => (
            <li key={index}>
              版本 {version.version} - 上傳時間: {version.uploadedAt}
              <Button
                type="link"
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadVersion(selectedDocument.name, version.version)}
              >
                下載
              </Button>
            </li>
          ))}
        </ul>
        <Upload
          beforeUpload={file => {
            handleUploadNewVersion(file);
            return false;
          }}
        >
          <Button icon={<UploadOutlined />}>上傳新版本</Button>
        </Upload>
      </Modal>
    </div>
  );
};

export default DocumentManagementPage;
