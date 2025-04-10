'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Select, Button, List, Tag, Spin, Empty, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { SelectProps } from 'antd';

interface Task {
  id: number;
  title: string;
  projectId: number;
  projectName: string;
}

interface TaskDependency {
  id: number;
  taskId: number;
  dependsOnTaskId: number;
  type: string;
  createdAt: string;
  dependsOnTaskTitle?: string;
  dependentTaskTitle?: string;
}

interface TaskDependencyModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
}

const dependencyTypes = [
  { value: 'finish-to-start', label: '完成到開始 (前一任務結束後才能開始此任務)' },
  { value: 'start-to-start', label: '開始到開始 (前一任務開始後才能開始此任務)' },
  { value: 'finish-to-finish', label: '完成到完成 (前一任務結束後才能完成此任務)' },
  { value: 'start-to-finish', label: '開始到完成 (前一任務開始後才能完成此任務)' },
];

const TaskDependencyModal: React.FC<TaskDependencyModalProps> = ({ visible, task, onClose }) => {
  const [dependencies, setDependencies] = useState<TaskDependency[]>([]);
  const [dependents, setDependents] = useState<TaskDependency[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskOptions, setTaskOptions] = useState<SelectProps['options']>([]);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string>('finish-to-start');

  // 獲取任務依賴關係
  const fetchDependencies = async () => {
    if (!task) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/dependencies?taskId=${task.id}`);
      const result = await response.json();
      
      if (result.success) {
        setDependencies(result.data.dependencies);
        setDependents(result.data.dependents);
      } else {
        message.error('獲取依賴關係失敗');
      }
    } catch (error) {
      console.error('獲取依賴關係錯誤:', error);
      message.error('獲取依賴關係失敗');
    } finally {
      setLoading(false);
    }
  };

  // 獲取可選的任務列表
  const fetchTaskOptions = async () => {
    if (!task) return;
    
    try {
      const response = await fetch('/api/tasks');
      const result = await response.json();
      
      if (result.success) {
        // 過濾掉當前任務和已有依賴關係的任務
        const filteredTasks = result.data.filter((t: Task) => 
          t.id !== task.id && 
          !dependencies.some(d => d.dependsOnTaskId === t.id)
        );
        
        setTaskOptions(filteredTasks.map((t: Task) => ({
          value: t.id,
          label: `${t.title} (專案: ${t.projectName})`
        })));
      } else {
        message.error('獲取任務列表失敗');
      }
    } catch (error) {
      console.error('獲取任務列表錯誤:', error);
      message.error('獲取任務列表失敗');
    }
  };

  // 添加依賴關係
  const addDependency = async () => {
    if (!task || !selectedTask) {
      message.warning('請選擇依賴任務');
      return;
    }
    
    try {
      const response = await fetch('/api/tasks/dependencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          taskId: task.id,
          dependsOnTaskId: selectedTask,
          type: selectedType
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        message.success('添加依賴關係成功');
        fetchDependencies();
        setSelectedTask(null);
      } else {
        message.error(result.error || '添加依賴關係失敗');
      }
    } catch (error) {
      console.error('添加依賴關係錯誤:', error);
      message.error('添加依賴關係失敗');
    }
  };

  // 刪除依賴關係
  const deleteDependency = async (id: number) => {
    try {
      const response = await fetch(`/api/tasks/dependencies?id=${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        message.success('刪除依賴關係成功');
        fetchDependencies();
      } else {
        message.error('刪除依賴關係失敗');
      }
    } catch (error) {
      console.error('刪除依賴關係錯誤:', error);
      message.error('刪除依賴關係失敗');
    }
  };

  // 渲染依賴類型標籤
  const renderDependencyType = (type: string) => {
    const typeInfo = dependencyTypes.find(t => t.value === type);
    return <Tag color="blue">{typeInfo?.label || type}</Tag>;
  };

  useEffect(() => {
    if (visible && task) {
      fetchDependencies();
    }
  }, [visible, task]);

  useEffect(() => {
    if (visible && task) {
      fetchTaskOptions();
    }
  }, [visible, task, dependencies]);

  return (
    <Modal
      title={`任務依賴關係: ${task?.title || ''}`}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Spin spinning={loading}>
        <div style={{ marginBottom: 24 }}>
          <h4>添加依賴任務</h4>
          <div style={{ display: 'flex', marginBottom: 16 }}>
            <Select
              style={{ flex: 3, marginRight: 8 }}
              placeholder="選擇此任務依賴的前置任務"
              options={taskOptions}
              value={selectedTask}
              onChange={setSelectedTask}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
            <Select
              style={{ flex: 2, marginRight: 8 }}
              placeholder="選擇依賴類型"
              options={dependencyTypes}
              value={selectedType}
              onChange={setSelectedType}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={addDependency}
            >
              添加
            </Button>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h4>此任務依賴於 (前置任務)</h4>
          {dependencies.length > 0 ? (
            <List
              size="small"
              bordered
              dataSource={dependencies}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => deleteDependency(item.id)}
                    />
                  ]}
                >
                  <List.Item.Meta
                    title={item.dependsOnTaskTitle}
                    description={renderDependencyType(item.type)}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="無前置任務" />
          )}
        </div>

        <div>
          <h4>依賴於此任務 (後續任務)</h4>
          {dependents.length > 0 ? (
            <List
              size="small"
              bordered
              dataSource={dependents}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.dependentTaskTitle}
                    description={renderDependencyType(item.type)}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="無後續任務" />
          )}
        </div>
      </Spin>
    </Modal>
  );
};

export default TaskDependencyModal;
