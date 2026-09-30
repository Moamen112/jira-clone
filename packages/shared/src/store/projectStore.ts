import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { BackendProject } from '../types/project';
import { logoutAction } from './authSlice';

export interface ProjectState {
  projects: BackendProject[];
  totalCount: number;
  isLoading: boolean;
  error: string | null;
}

export const initialProjectState: ProjectState = {
  projects: [],
  totalCount: 0,
  isLoading: false,
  error: null,
};

export const projectSlice = createSlice({
  name: 'project',
  initialState: initialProjectState,
  reducers: {
    setProjects(state, action: PayloadAction<{ results: BackendProject[]; count?: number }>) {
      state.projects = action.payload.results;
      state.totalCount = action.payload.count ?? action.payload.results.length;
      state.isLoading = false;
      state.error = null;
    },
    addProject(state, action: PayloadAction<BackendProject>) {
      state.projects.unshift(action.payload);
      state.totalCount += 1;
      state.isLoading = false;
      state.error = null;
    },
    updateProject(state, action: PayloadAction<BackendProject>) {
      const index = state.projects.findIndex((project) => project.id === action.payload.id);
      if (index !== -1) state.projects[index] = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    removeProject(state, action: PayloadAction<number | string>) {
      const id = Number(action.payload);
      state.projects = state.projects.filter((project) => project.id !== id);
      state.totalCount = Math.max(0, state.totalCount - 1);
      state.isLoading = false;
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
      if (action.payload) state.error = null;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
    resetProjectState() {
      return { ...initialProjectState };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutAction, () => ({ ...initialProjectState }));
  },
});

export const projectActions = projectSlice.actions;
export const projectReducer = projectSlice.reducer;
export const selectProjectState = (state: { project: ProjectState }) => state.project;
