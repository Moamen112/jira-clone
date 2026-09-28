import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { BackendTask, BackendTaskType } from '../types/task';

export interface TaskState {
  tasksByProject: Record<string, BackendTask[]>;
  taskTypesByProject: Record<string, BackendTaskType[]>;
  isLoading: boolean;
  error: string | null;
  statusError: string | null;
}

export const initialTaskState: TaskState = {
  tasksByProject: {},
  taskTypesByProject: {},
  isLoading: false,
  error: null,
  statusError: null,
};

let currentTaskState: TaskState = { ...initialTaskState };
const taskListeners = new Set<() => void>();

export function getTaskState(): TaskState {
  return currentTaskState;
}

export function subscribeTaskState(listener: () => void): () => void {
  taskListeners.add(listener);
  return () => {
    taskListeners.delete(listener);
  };
}

export function setInternalTaskState(partial: Partial<TaskState>): void {
  currentTaskState = { ...currentTaskState, ...partial };
  taskListeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error in task state listener', e);
    }
  });
}

export const taskSlice = createSlice({
  name: 'task',
  initialState: initialTaskState,
  reducers: {
    setProjectTasks(
      state,
      action: PayloadAction<{ projectId: string; tasks: BackendTask[] }>
    ) {
      const { projectId, tasks } = action.payload;
      state.tasksByProject[projectId] = tasks;
      state.isLoading = false;
      state.error = null;
      setInternalTaskState({
        tasksByProject: { ...state.tasksByProject },
        isLoading: false,
        error: null,
      });
    },
    addTask(
      state,
      action: PayloadAction<{ projectId: string; task: BackendTask }>
    ) {
      const { projectId, task } = action.payload;
      const existing = state.tasksByProject[projectId] || [];
      const updated = [task, ...existing.filter((t) => t.id !== task.id)];
      state.tasksByProject[projectId] = updated;
      setInternalTaskState({
        tasksByProject: { ...state.tasksByProject },
      });
    },
    updateTask(
      state,
      action: PayloadAction<{ projectId: string; task: BackendTask }>
    ) {
      const { projectId, task } = action.payload;
      const existing = state.tasksByProject[projectId] || [];
      const index = existing.findIndex((t) => t.id === task.id);
      if (index !== -1) {
        existing[index] = task;
      } else {
        existing.unshift(task);
      }
      state.tasksByProject[projectId] = [...existing];
      setInternalTaskState({
        tasksByProject: { ...state.tasksByProject },
      });
    },
    removeTask(
      state,
      action: PayloadAction<{ projectId: string; taskId: number | string }>
    ) {
      const { projectId, taskId } = action.payload;
      const idNum = Number(taskId);
      const existing = state.tasksByProject[projectId] || [];
      state.tasksByProject[projectId] = existing.filter((t) => t.id !== idNum);
      setInternalTaskState({
        tasksByProject: { ...state.tasksByProject },
      });
    },
    setProjectTaskTypes(
      state,
      action: PayloadAction<{ projectId: string; types: BackendTaskType[] }>
    ) {
      const { projectId, types } = action.payload;
      state.taskTypesByProject[projectId] = types;
      setInternalTaskState({
        taskTypesByProject: { ...state.taskTypesByProject },
      });
    },
    addTaskType(
      state,
      action: PayloadAction<{ projectId: string; taskType: BackendTaskType }>
    ) {
      const { projectId, taskType } = action.payload;
      const existing = state.taskTypesByProject[projectId] || [];
      state.taskTypesByProject[projectId] = [...existing, taskType];
      setInternalTaskState({
        taskTypesByProject: { ...state.taskTypesByProject },
      });
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
      setInternalTaskState({ isLoading: action.payload });
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
      setInternalTaskState({ error: action.payload, isLoading: false });
    },
    setStatusError(state, action: PayloadAction<string | null>) {
      state.statusError = action.payload;
      setInternalTaskState({ statusError: action.payload });
    },
    resetTaskState(state) {
      state.tasksByProject = {};
      state.taskTypesByProject = {};
      state.isLoading = false;
      state.error = null;
      state.statusError = null;
      setInternalTaskState(initialTaskState);
    },
  },
});

export const {
  setProjectTasks,
  addTask,
  updateTask,
  removeTask,
  setProjectTaskTypes,
  addTaskType,
  setLoading,
  setError,
  setStatusError,
  resetTaskState,
} = taskSlice.actions;

export default taskSlice.reducer;
