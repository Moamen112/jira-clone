import { useEffect, useMemo, useState } from 'react';
import { useAuth } from './useAuth';
import { useProjects } from './useProjects';
import { useTasks } from './useTasks';
import { useDebounce } from './useDebounce';
import { projectService } from '../services/projectService';
import { backendProjectToSpaceItem } from '../utils/spaces';
import { parseErrorMessage } from '../utils/errors';
import type { BackendProject } from '../types/project';
import type { User } from '../types/user';

/** Project detail and board state shared by the web and mobile Spaces pages. */
export function useSpaceDetail(id?: string) {
  const { user } = useAuth();
  const { spaces } = useProjects({ autoFetch: false });
  const [request, setRequest] = useState<{
    id: string;
    project: BackendProject | null;
    loading: boolean;
    error: string | null;
  }>({ id: '', project: null, loading: false, error: null });
  const [retryCount, setRetryCount] = useState(0);

  const listedSpace = useMemo(() => spaces.find((space) =>
    space.project.id === id || space.project.key.toLowerCase() === id?.toLowerCase()
  ) || null, [spaces, id]);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setRequest({ id, project: null, loading: true, error: null });
    projectService.getProject(id)
      .then((project) => {
        if (active) setRequest({ id, project, loading: false, error: null });
      })
      .catch((error: unknown) => {
        if (active) setRequest({ id, project: null, loading: false, error: parseErrorMessage(error) });
      });
    return () => { active = false; };
  }, [id, retryCount]);

  const loadedProject = request.id === id ? request.project : null;
  const space = useMemo(() => loadedProject
    ? backendProjectToSpaceItem(loadedProject)
    : listedSpace, [loadedProject, listedSpace]);
  const project = space?.project || null;
  const currentUserId = user ? String(user.id) : undefined;
  const projectLoading = !space && Boolean(id) && (request.id !== id || request.loading);
  const projectError = request.id === id ? request.error : null;

  const boardUsers = useMemo<User[]>(() => {
    if (space?.members.length) return space.members.map((member) => ({
      id: String(member.id),
      name: member.name,
      email: member.email || '',
      initials: (member.name || 'U').slice(0, 2).toUpperCase(),
      avatarUrl: member.avatarUrl,
    }));
    if (!user) return [];
    return [{
      id: String(user.id),
      name: user.full_name || user.email,
      email: user.email,
      initials: (user.full_name || user.email).slice(0, 2).toUpperCase(),
      avatarUrl: user.avatar || undefined,
    }];
  }, [space?.members, user]);

  const [boardSearch, setBoardSearch] = useState('');
  const search = useDebounce(boardSearch, 300).trim() || undefined;
  const [assignedToMeFilter, setAssignedToMeFilter] = useState(false);
  const [createdByMeFilter, setCreatedByMeFilter] = useState(false);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  const [selectedUserIdsFilter, setSelectedUserIdsFilter] = useState<string[]>([]);

  useEffect(() => {
    setBoardSearch('');
    setAssignedToMeFilter(false);
    setCreatedByMeFilter(false);
    setSelectedTypeFilter('all');
    setSelectedUserIdsFilter([]);
  }, [id]);
  const selectedAssignee = selectedUserIdsFilter.length === 1 ? Number(selectedUserIdsFilter[0]) : 0;
  const assignee = selectedAssignee > 0 ? selectedAssignee : undefined;
  const selectedType = Number(selectedTypeFilter);
  const type = selectedType > 0 ? selectedType : undefined;

  const tasks = useTasks({
    projectId: project?.id,
    projectKey: project?.key,
    autoFetch: Boolean(project),
    search,
    mine: assignedToMeFilter || undefined,
    assignee,
    unassigned: selectedUserIdsFilter.includes('unassigned') || undefined,
    type,
  });
  const filterableTypeOptions = useMemo(() => tasks.cardTypeOptions.filter(
    (option) => Number(option.id) > 0
  ), [tasks.cardTypeOptions]);

  const clearBoardFilters = () => {
    setBoardSearch('');
    setAssignedToMeFilter(false);
    setCreatedByMeFilter(false);
    setSelectedTypeFilter('all');
    setSelectedUserIdsFilter([]);
  };

  const toggleUserIdFilter = (userId: string) => {
    setSelectedUserIdsFilter((ids) => ids.includes(userId)
      ? ids.filter((id) => id !== userId)
      : [...ids, userId]
    );
  };

  const addMembers = async (userIds: (string | number)[]) => {
    if (!project?.id) throw new Error('Project is not loaded.');
    const numericIds = userIds
      .map((id) => Number(id))
      .filter((id) => !isNaN(id) && id > 0);
    if (numericIds.length === 0) return [];
    const newMemberships = await projectService.addProjectMembers(project.id, numericIds);
    setRetryCount((count) => count + 1);
    return newMemberships;
  };

  const removeMember = async (userId: string | number) => {
    if (!project?.id) throw new Error('Project is not loaded.');
    await projectService.removeProjectMember(project.id, userId);
    setRetryCount((count) => count + 1);
  };

  return {
    space,
    project,
    boardUsers,
    currentUserId,
    projectLoading,
    projectError,
    retryProject: () => setRetryCount((count) => count + 1),
    addMembers,
    removeMember,
    boardSearch,
    setBoardSearch,
    assignedToMeFilter,
    setAssignedToMeFilter,
    createdByMeFilter,
    setCreatedByMeFilter,
    selectedTypeFilter,
    setSelectedTypeFilter,
    filterableTypeOptions,
    selectedUserIdsFilter,
    clearBoardFilters,
    toggleUserIdFilter,
    ...tasks,
  };
}
