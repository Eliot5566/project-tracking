"use client";

import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, MenuItem } from '@mui/material';

interface TaskFormProps {
  defaultValues?: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
  };
  onSubmit: (data: {
    title: string;
    description: string;
    status: string;
    priority: string;
  }) => void;
  onCancel: () => void;
}

const statusOptions = ['to-do', 'in-progress', 'done'];
const priorityOptions = ['low', 'medium', 'high'];

export default function TaskForm({ defaultValues, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(defaultValues?.title || '');
  const [description, setDescription] = useState(defaultValues?.description || '');
  const [status, setStatus] = useState(defaultValues?.status || 'to-do');
  const [priority, setPriority] = useState(defaultValues?.priority || 'low');

  useEffect(() => {
    // 若父層預設值變動，可同步更新 (編輯時)
    if (defaultValues) {
      setTitle(defaultValues.title || '');
      setDescription(defaultValues.description || '');
      setStatus(defaultValues.status || 'to-do');
      setPriority(defaultValues.priority || 'low');
    }
  }, [defaultValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, status, priority });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        label="任務標題"
        fullWidth
        required
        margin="normal"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <TextField
        label="任務描述"
        fullWidth
        margin="normal"
        multiline
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <TextField
        label="狀態"
        select
        fullWidth
        margin="normal"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        {statusOptions.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="優先級"
        select
        fullWidth
        margin="normal"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        {priorityOptions.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </TextField>

      <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Button variant="outlined" onClick={onCancel} sx={{ mr: 2 }}>
          取消
        </Button>
        <Button variant="contained" type="submit">
          儲存
        </Button>
      </Box>
    </Box>
  );
}
