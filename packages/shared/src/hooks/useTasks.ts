import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import {
  getTaskState,
  subscribeTaskState,
  setInternalTaskState,
} from '../store/taskStore';
import { taskService } from '../services/taskService';
import { parseErrorMessage } from '../utils/errors';
import {
  backendTaskToCard,
  createDefaultBoardColumns,
  columnIdToStatus,
  taskTypeToCardTypeOption,
  backendCommentToComment,
  backendActivityToActivityLog,
} from '../utils/tasks';
import type {
  BackendTask,
  BackendTaskStatus,
  BackendTaskType,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskListParams,
  BackendComment,
  BackendActivityEntry,
} from '../types/task';
import type { Card, CardTypeOption } from '../types/card';
import type { BoardColumn } from '../types/board';
import type { Comment } from '../types/comment';
import type { ActivityLog } from '../types/activity';

export interface UseTasksOptions {
  projectId?: string | number;
  projectKey?: string;
  autoFetch?: boolean;
  search?: string;
  status?: string;
  type?: string | number;
  assignee?: string | number;
  reporter?: string | number;
  unassigned?: boolean;
  mine?: boolean;
  ordering?: string;
}

export interface CreateTaskInput {
  title: string;
  typeId?: number | string;
  type?: string;
  description?: string;
  assigneeId?: number | string | null;
  dueDate?: string | null;
  columnId?: string;
}

/**
 * Universal hook for managing tasks, board cards, task types, comments,
 * and activity logs for a project across Web and Mobile.
 */
export function useTasks(options: UseTasksOptions = {}) {
  const {
    projectId,
    projectKey,
    autoFetch = true,
    search,
    status,
    type,
    assignee,
    reporter,
    unassigned,
    mine,
    ordering,
  } = options;

  const state = useSyncExternalStore(
    subscribeTaskState,
    getTaskState,
    getTaskState
  );

  const projKeyStr = projectId ? String(projectId) : '';

  // Get tasks for the current project
  const tasks = useMemo<BackendTask[]>(() => {
    const key = projKeyStr || (projectKey ? projectKey.toLowerCase() : '');
    if (!key) return [];
    return state.tasksByProject[key] || [];
  }, [state.tasksByProject, projKeyStr, projectKey]);

  // Get task types for the current project
  const taskTypes = useMemo<BackendTaskType[]>(() => {
    if (!projKeyStr) return [];
    return state.taskTypesByProject[projKeyStr] || [];
  }, [state.taskTypesByProject, projKeyStr]);

  // Generate frontend BoardColumn objects
  const columns = useMemo<BoardColumn[]>(() => {
    return createDefaultBoardColumns(projKeyStr || 'default');
  }, [projKeyStr]);

  // Transform BackendTask array into frontend Card array
  const cards = useMemo<Card[]>(() => {
    return tasks.map(backendTaskToCard);
  }, [tasks]);

  // Transform BackendTaskType array into CardTypeOption array
  const cardTypeOptions = useMemo<CardTypeOption[]>(() => {
    if (taskTypes.length > 0) {
      return taskTypes.map(taskTypeToCardTypeOption);
    }
    return [
      { id: 'task', label: 'Task', color: '#3B82F6' },
      { id: 'bug', label: 'Bug', color: '#EF4444' },
      { id: 'feature', label: 'Feature', color: '#10B981' },
      { id: 'improvement', label: 'Improvement', color: '#F59E0B' },
    ];
  }, [taskTypes]);

  /**
   * Fetches tasks for the project from backend API.
   */
  const fetchTasks = useCallback(
    async (overrideParams?: TaskListParams): Promise<BackendTask[]> => {
      if (!projectId && !projectKey) return [];
      setInternalTaskState({ isLoading: true, error: null });

      try {
        const numericProjectId = projectId ? Number(projectId) : undefined;
        const params: TaskListParams = {
          project:
            overrideParams?.project !== undefined
              ? overrideParams.project
              : numericProjectId && !isNaN(numericProjectId)
              ? numericProjectId
              : undefined,
          project_key:
            overrideParams?.project_key !== undefined
              ? overrideParams.project_key
              : projectKey || (!numericProjectId ? String(projectId) : undefined),
          search:
            overrideParams?.search !== undefined
              ? overrideParams.search
              : search
              ? search.trim()
              : undefined,
          status: overrideParams?.status !== undefined ? overrideParams.status : status || undefined,
          type:
            overrideParams?.type !== undefined
              ? overrideParams.type
              : type && !isNaN(Number(type))
              ? Number(type)
              : undefined,
          assignee:
            overrideParams?.assignee !== undefined
              ? overrideParams.assignee
              : assignee && !isNaN(Number(assignee))
              ? Number(assignee)
              : undefined,
          reporter:
            overrideParams?.reporter !== undefined
              ? overrideParams.reporter
              : reporter && !isNaN(Number(reporter))
              ? Number(reporter)
              : undefined,
          unassigned:
            overrideParams?.unassigned !== undefined
              ? overrideParams.unassigned
              : unassigned
              ? true
              : undefined,
          mine: overrideParams?.mine !== undefined ? overrideParams.mine : mine ? true : undefined,
          ordering:
            overrideParams?.ordering !== undefined ? overrideParams.ordering : ordering || undefined,
        };

        const cleanedParams = Object.entries(params).reduce<Record<string, unknown>>(
          (acc, [key, value]) => {
            if (value !== undefined && value !== '') {
              acc[key] = value;
            }
            return acc;
          },
          {}
        ) as TaskListParams;

        const data = await taskService.getTasks(cleanedParams);

        const targetKey =
          projKeyStr ||
          (projectKey ? projectKey.toLowerCase() : '') ||
          String(data[0]?.project?.id || 'default');

        // Preserve existing descriptions in store (from card creation or prior detail fetches)
        const existingTasks = getTaskState().tasksByProject[targetKey] || [];
        const existingDescMap = new Map<number, string>();
        for (const t of existingTasks) {
          if (t.description) {
            existingDescMap.set(t.id, t.description);
          }
        }

        const mergedData = data.map((task) => {
          if (!task.description && existingDescMap.has(task.id)) {
            return { ...task, description: existingDescMap.get(task.id) };
          }
          return task;
        });

        setInternalTaskState({
          tasksByProject: {
            ...getTaskState().tasksByProject,
            [targetKey]: mergedData,
          },
          isLoading: false,
          error: null,
        });

        // Background-fetch full task details for each task to get description, comment_count, activity_count
        if (data.length > 0) {
          Promise.allSettled(data.map((t) => taskService.getTask(t.id))).then((results) => {
            const detailedTasks = results.map((res, i) =>
              res.status === 'fulfilled' ? res.value : mergedData[i]
            );
            setInternalTaskState({
              tasksByProject: {
                ...getTaskState().tasksByProject,
                [targetKey]: detailedTasks,
              },
            });
          });
        }

        return mergedData;
      } catch (err: unknown) {
        const errorMsg = parseErrorMessage(err);
        setInternalTaskState({ isLoading: false, error: errorMsg });
        throw new Error(errorMsg);
      }
    },
    [
      projectId,
      projectKey,
      projKeyStr,
      search,
      status,
      type,
      assignee,
      reporter,
      unassigned,
      mine,
      ordering,
    ]
  );

  /**
   * Fetches task types for the project.
   */
  const fetchTaskTypes = useCallback(async (): Promise<BackendTaskType[]> => {
    const numericProjectId = Number(projectId);
    if (!projectId || isNaN(numericProjectId)) return [];

    try {
      const types = await taskService.getTaskTypes(numericProjectId, { limit: 'all' });
      const updatedTypesMap = {
        ...getTaskState().taskTypesByProject,
        [projKeyStr]: types,
      };
      setInternalTaskState({
        taskTypesByProject: updatedTypesMap,
      });
      return types;
    } catch (err: unknown) {
      console.warn('Failed to fetch task types:', err);
      return [];
    }
  }, [projectId, projKeyStr]);

  /**
   * Refreshes all project data (tasks and task types).
   */
  const refetch = useCallback(async () => {
    await Promise.allSettled([fetchTasks(), fetchTaskTypes()]);
  }, [fetchTasks, fetchTaskTypes]);

  // Auto-fetch tasks when project or filters change
  useEffect(() => {
    if (autoFetch && (projectId || projectKey)) {
      void fetchTasks().catch(() => {});
    }
  }, [autoFetch, projectId, projectKey, fetchTasks]);

  // Auto-fetch task types when project changes
  useEffect(() => {
    if (autoFetch && projectId) {
      fetchTaskTypes();
    }
  }, [autoFetch, projectId, fetchTaskTypes]);

  /**
   * Creates a new task.
   */
  const createTask = useCallback(
    async (input: CreateTaskInput): Promise<BackendTask> => {
      const numericProjectId = Number(projectId);
      if (!numericProjectId || isNaN(numericProjectId)) {
        throw new Error('Valid numeric project ID is required to create a task.');
      }

      // Resolve task type ID
      let resolvedTypeId: number | undefined;
      if (input.typeId) {
        resolvedTypeId = Number(input.typeId);
      } else if (input.type) {
        const num = Number(input.type);
        if (!isNaN(num) && num > 0) {
          resolvedTypeId = num;
        } else {
          const found = taskTypes.find(
            (t) =>
              t.name.toLowerCase() === input.type?.toLowerCase() ||
              String(t.id) === String(input.type)
          );
          if (found) resolvedTypeId = found.id;
        }
      }

      if (!resolvedTypeId && taskTypes.length > 0) {
        resolvedTypeId = taskTypes[0].id;
      }

      // If no task types loaded yet, fetch or fallback
      if (!resolvedTypeId) {
        try {
          const fetchedTypes = await fetchTaskTypes();
          if (fetchedTypes.length > 0) {
            if (input.type) {
              const num = Number(input.type);
              if (!isNaN(num) && num > 0) {
                resolvedTypeId = num;
              } else {
                const found = fetchedTypes.find(
                  (t) =>
                    t.name.toLowerCase() === input.type?.toLowerCase() ||
                    String(t.id) === String(input.type)
                );
                if (found) resolvedTypeId = found.id;
              }
            }
            if (!resolvedTypeId) resolvedTypeId = fetchedTypes[0].id;
          }
        } catch {
          // ignore
        }
      }

      if (!resolvedTypeId) {
        resolvedTypeId = 1; // Fallback
      }

      const payload: CreateTaskPayload = {
        project: numericProjectId,
        title: input.title.trim(),
        type: resolvedTypeId,
        description: input.description,
        assignee: input.assigneeId ? Number(input.assigneeId) : null,
        due_date: input.dueDate || null,
      };

      setInternalTaskState({ isLoading: true, error: null });

      try {
        let newTask = await taskService.createTask(payload);
        if (!newTask.description && input.description) {
          newTask.description = input.description.trim();
        }
        if (resolvedTypeId && (!newTask.type || newTask.type.id !== resolvedTypeId)) {
          const matchedType = taskTypes.find((t) => t.id === resolvedTypeId);
          if (matchedType) newTask.type = matchedType;
        }

        // If a non-todo column was requested, move it to that status
        if (input.columnId && input.columnId !== 'col-todo') {
          const targetStatus = columnIdToStatus(input.columnId);
          try {
            newTask = await taskService.updateTask(newTask.id, {
              status: targetStatus,
            });
            if (!newTask.description && input.description) {
              newTask.description = input.description.trim();
            }
          } catch (statusErr) {
            console.warn('Initial status move failed, staying at todo:', statusErr);
          }
        }

        // Add to store
        const existing = getTaskState().tasksByProject[projKeyStr] || [];
        setInternalTaskState({
          tasksByProject: {
            ...getTaskState().tasksByProject,
            [projKeyStr]: [newTask, ...existing],
          },
          isLoading: false,
          error: null,
        });

        return newTask;
      } catch (err: unknown) {
        const errorMsg = parseErrorMessage(err);
        setInternalTaskState({ isLoading: false, error: errorMsg });
        throw new Error(errorMsg);
      }
    },
    [projectId, projKeyStr, taskTypes, fetchTaskTypes]
  );

  /**
   * Updates an existing task's details.
   */
  const updateTask = useCallback(
    async (
      taskId: number | string,
      payload: UpdateTaskPayload
    ): Promise<BackendTask> => {
      setInternalTaskState({ isLoading: true, error: null, statusError: null });

      try {
        const updated = await taskService.updateTask(taskId, payload);
        if (!updated.description && payload.description) {
          updated.description = payload.description.trim();
        }
        if (payload.type && (!updated.type || updated.type.id !== payload.type)) {
          const matchedType = taskTypes.find((t) => t.id === payload.type);
          if (matchedType) {
            updated.type = matchedType;
          }
        }

        const existing = getTaskState().tasksByProject[projKeyStr] || [];
        const index = existing.findIndex((t) => t.id === updated.id);
        const nextList = [...existing];
        if (index !== -1) {
          nextList[index] = updated;
        } else {
          nextList.unshift(updated);
        }

        setInternalTaskState({
          tasksByProject: {
            ...getTaskState().tasksByProject,
            [projKeyStr]: nextList,
          },
          isLoading: false,
          error: null,
        });

        return updated;
      } catch (err: unknown) {
        const errorMsg = parseErrorMessage(err);
        setInternalTaskState({ isLoading: false, error: errorMsg });
        throw new Error(errorMsg);
      }
    },
    [projKeyStr, taskTypes]
  );

  /**
   * Moves a task to a different status or column.
   * Performs an optimistic update and rolls back if permission is denied.
   */
  const updateTaskStatus = useCallback(
    async (
      taskId: number | string,
      newStatusOrColumnId: string
    ): Promise<BackendTask | null> => {
      const idNum = Number(taskId);
      const newStatus = columnIdToStatus(newStatusOrColumnId);

      const existingTasks = getTaskState().tasksByProject[projKeyStr] || [];
      const originalTask = existingTasks.find((t) => t.id === idNum);

      if (!originalTask) return null;
      if (originalTask.status === newStatus) return originalTask;

      // Optimistic update
      const optimisticTask: BackendTask = {
        ...originalTask,
        status: newStatus,
        updated_at: new Date().toISOString(),
      };

      const optimisticList = existingTasks.map((t) =>
        t.id === idNum ? optimisticTask : t
      );

      setInternalTaskState({
        tasksByProject: {
          ...getTaskState().tasksByProject,
          [projKeyStr]: optimisticList,
        },
        statusError: null,
      });

      try {
        const updated = await taskService.updateTask(idNum, {
          status: newStatus,
        });

        const finalList = (getTaskState().tasksByProject[projKeyStr] || []).map(
          (t) => (t.id === idNum ? updated : t)
        );

        setInternalTaskState({
          tasksByProject: {
            ...getTaskState().tasksByProject,
            [projKeyStr]: finalList,
          },
          statusError: null,
        });

        return updated;
      } catch (err: unknown) {
        // Rollback optimistic update
        const rollbackList = (getTaskState().tasksByProject[projKeyStr] || []).map(
          (t) => (t.id === idNum ? originalTask : t)
        );

        const errorMsg = parseErrorMessage(err);
        setInternalTaskState({
          tasksByProject: {
            ...getTaskState().tasksByProject,
            [projKeyStr]: rollbackList,
          },
          statusError: errorMsg,
        });

        throw new Error(errorMsg);
      }
    },
    [projKeyStr]
  );

  /**
   * Deletes a task by ID.
   */
  const deleteTask = useCallback(
    async (taskId: number | string): Promise<void> => {
      const idNum = Number(taskId);
      setInternalTaskState({ isLoading: true, error: null });

      try {
        await taskService.deleteTask(idNum);
        const existing = getTaskState().tasksByProject[projKeyStr] || [];
        setInternalTaskState({
          tasksByProject: {
            ...getTaskState().tasksByProject,
            [projKeyStr]: existing.filter((t) => t.id !== idNum),
          },
          isLoading: false,
          error: null,
        });
      } catch (err: unknown) {
        const errorMsg = parseErrorMessage(err);
        setInternalTaskState({ isLoading: false, error: errorMsg });
        throw new Error(errorMsg);
      }
    },
    [projKeyStr]
  );

  /**
   * Creates a new task type for this project.
   */
  const createTaskType = useCallback(
    async (name: string): Promise<BackendTaskType> => {
      const numericProjectId = Number(projectId);
      if (!numericProjectId || isNaN(numericProjectId)) {
        throw new Error('Valid numeric project ID is required to create a task type.');
      }

      try {
        const created = await taskService.createTaskType(numericProjectId, {
          name: name.trim(),
        });

        const existing = getTaskState().taskTypesByProject[projKeyStr] || [];
        setInternalTaskState({
          taskTypesByProject: {
            ...getTaskState().taskTypesByProject,
            [projKeyStr]: [...existing, created],
          },
        });

        return created;
      } catch (err: unknown) {
        const errorMsg = parseErrorMessage(err);
        throw new Error(errorMsg);
      }
    },
    [projectId, projKeyStr]
  );

  /**
   * Loads comments for a task.
   */
  const loadComments = useCallback(
    async (taskId: number | string): Promise<Comment[]> => {
      try {
        const backendComments = await taskService.getComments(taskId);
        return backendComments.map((bc) =>
          backendCommentToComment(bc, String(taskId))
        );
      } catch (err: unknown) {
        console.warn('Failed to load comments:', err);
        return [];
      }
    },
    []
  );

  /**
   * Adds a comment to a task.
   */
  const addComment = useCallback(
    async (taskId: number | string, content: string): Promise<Comment> => {
      const created = await taskService.addComment(taskId, {
        body: content.trim(),
      });
      return backendCommentToComment(created, String(taskId));
    },
    []
  );

  /**
   * Deletes a comment from a task.
   */
  const deleteComment = useCallback(
    async (
      taskId: number | string,
      commentId: number | string
    ): Promise<void> => {
      await taskService.deleteComment(taskId, commentId);
    },
    []
  );

  /**
   * Loads activity logs for a task.
   */
  const loadActivity = useCallback(
    async (taskId: number | string): Promise<ActivityLog[]> => {
      try {
        const entries = await taskService.getActivity(taskId, { tab: 'all' });
        return entries.map((entry) =>
          backendActivityToActivityLog(entry, String(taskId))
        );
      } catch (err: unknown) {
        console.warn('Failed to load task activity:', err);
        return [];
      }
    },
    []
  );

  return {
    tasks,
    cards,
    columns,
    taskTypes,
    cardTypeOptions,
    isLoading: state.isLoading,
    error: state.error,
    statusError: state.statusError,
    fetchTasks,
    fetchTaskTypes,
    refetch,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    createTaskType,
    loadComments,
    addComment,
    deleteComment,
    loadActivity,
  };
}
