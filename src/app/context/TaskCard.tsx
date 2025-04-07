"use client";

import React from 'react';
import { Box, Card, CardContent, CardActions, Typography, Button } from '@mui/material';
import { Task } from './TaskReducer';
import { useRouter } from 'next/navigation';

interface TaskCardProps {
  task: Task;
  onDelete: (id: number) => void;
}

export default function TaskCard({ task, onDelete }: TaskCardProps) {
  const router = useRouter();

  const handleView = () => {
    router.push(`/tasks/${task.task_id}`);
  };

  const handleDelete = () => {
    onDelete(task.task_id);
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6">{task.title}</Typography>
        <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
          {task.description}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          狀態：{task.status}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          優先級：{task.priority}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end' }}>
        <Button size="small" onClick={handleView}>
          查看
        </Button>
        <Button size="small" color="error" onClick={handleDelete}>
          刪除
        </Button>
      </CardActions>
    </Card>
  );
}
