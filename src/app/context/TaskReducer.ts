// context/TaskReducer.ts
export interface Task {
    task_id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    // ... 其他欄位，如 assignee_id, created_at 等
  }
  
  export interface TaskState {
    tasks: Task[];
    loading: boolean;
    error: string | null;
  }
  
  type Action =
    | { type: 'FETCH_TASKS_REQUEST' }
    | { type: 'FETCH_TASKS_SUCCESS'; payload: Task[] }
    | { type: 'FETCH_TASKS_FAILURE'; payload: string }
    | { type: 'ADD_TASK'; payload: Task }
    | { type: 'UPDATE_TASK'; payload: Task }
    | { type: 'DELETE_TASK'; payload: number };
  
  export const initialTaskState: TaskState = {
    tasks: [],
    loading: false,
    error: null,
  };
  
  export function taskReducer(state: TaskState, action: Action): TaskState {
    switch (action.type) {
      case 'FETCH_TASKS_REQUEST':
        return { ...state, loading: true, error: null };
      case 'FETCH_TASKS_SUCCESS':
        return { ...state, loading: false, tasks: action.payload };
      case 'FETCH_TASKS_FAILURE':
        return { ...state, loading: false, error: action.payload };
      case 'ADD_TASK':
        return { ...state, tasks: [...state.tasks, action.payload] };
      case 'UPDATE_TASK':
        return {
          ...state,
          tasks: state.tasks.map((t) => (t.task_id === action.payload.task_id ? action.payload : t)),
        };
      case 'DELETE_TASK':
        return {
          ...state,
          tasks: state.tasks.filter((t) => t.task_id !== action.payload),
        };
      default:
        return state;
    }
  }
  

