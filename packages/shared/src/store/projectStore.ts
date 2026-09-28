import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { BackendProject } from '../types/project';

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

let currentProjectState: ProjectState = { ...initialProjectState };
const projectListeners = new Set<() => void>();

export function getProjectState(): ProjectState {
  return currentProjectState;
}

export function subscribeProjectState(listener: () => void): () => void {
  projectListeners.add(listener);
  return () => {
    projectListeners.delete(listener);
  };
}

export function setInternalProjectState(partial: Partial<ProjectState>): void {
  currentProjectState = { ...currentProjectState, ...partial };
  projectListeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error in project state listener', e);
    }
  });
}

export const projectSlice = createSlice({
  name: 'project',
  initialState: initialProjectState,
  reducers: {
    setProjects(
      state,
      action: PayloadAction<{ results: BackendProject[]; count?: number }>
    ) {
      state.projects = action.payload.results;
      state.totalCount = action.payload.count ?? action.payload.results.length;
      state.isLoading = false;
      state.error = null;
      setInternalProjectState({
        projects: state.projects,
        totalCount: state.totalCount,
        isLoading: false,
        error: null,
      });
    },
    addProject(state, action: PayloadAction<BackendProject>) {
      state.projects = [action.payload, ...state.projects];
      state.totalCount += 1;
      setInternalProjectState({
        projects: state.projects,
        totalCount: state.totalCount,
      });
    },
    updateProject(state, action: PayloadAction<BackendProject>) {
      const index = state.projects.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
        setInternalProjectState({ projects: [...state.projects] });
      }
    },
    removeProject(state, action: PayloadAction<number | string>) {
      const idNum = Number(action.payload);
      state.projects = state.projects.filter((p) => p.id !== idNum);
      state.totalCount = Math.max(0, state.totalCount - 1);
      setInternalProjectState({
        projects: state.projects,
        totalCount: state.totalCount,
      });
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
      setInternalProjectState({ isLoading: action.payload });
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
      setInternalProjectState({ error: action.payload, isLoading: false });
    },
    resetProjectState(state) {
      state.projects = [];
      state.totalCount = 0;
      state.isLoading = false;
      state.error = null;
      setInternalProjectState(initialProjectState);
    },
  },
});

export const projectActions = projectSlice.actions;
export const projectReducer = projectSlice.reducer;
