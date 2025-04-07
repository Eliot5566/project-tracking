"use client";  

import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { taskReducer, initialTaskState, TaskState, Task } from './TaskReducer';

interface TaskContextProps extends TaskState {
  fetchTasks: () => Promise<void>;
  createTask: (task: Omit<Task, 'task_id'>) => Promise<void>;
  updateTask: (id: number, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
}

const TaskContext = createContext<TaskContextProps | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialTaskState);

  // 取得任務
  const fetchTasks = async () => {
    dispatch({ type: 'FETCH_TASKS_REQUEST' });
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      dispatch({ type: 'FETCH_TASKS_SUCCESS', payload: data.tasks });
    } catch (err) {
      dispatch({ type: 'FETCH_TASKS_FAILURE', payload: '取得任務失敗' });
      console.error(err);
    }
  };

  // 新增任務
  const createTask = async (task: Omit<Task, 'task_id'>) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (!res.ok) throw new Error('新增失敗');
      // 可以再呼叫 fetchTasks() 或根據回傳結果更新 state
      await fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // 更新任務
  const updateTask = async (id: number, updates: Partial<Task>) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('更新失敗');
      await fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // 刪除任務
  const deleteTask = async (id: number) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('刪除失敗');
      await fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // 可以在這裡決定是否一進入頁面就要自動 fetchTasks
  useEffect(() => {
    fetchTasks();
  }, []);

  const value: TaskContextProps = {
    ...state,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTaskContext = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error('useTaskContext 必須在 TaskProvider 中使用');
  }
  return ctx;
};
 