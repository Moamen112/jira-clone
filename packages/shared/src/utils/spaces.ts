import type { Project } from '../types/project';
import type { SpaceItem, CreateSpaceInput } from '../types/space';
import { mockCurrentUser } from '../data/mockData';

/**
 * Creates a new SpaceItem based on input, matching the web implementation.
 */
export function createSpace(input: CreateSpaceInput): SpaceItem {
  const now = new Date().toISOString();
  return {
    project: {
      id: `proj-${Date.now()}`,
      name: input.name,
      key: input.key,
      description: input.description,
      ownerId: mockCurrentUser.id,
      createdAt: now,
      updatedAt: now,
    },
    members:
      input.members && input.members.length > 0
        ? input.members
        : [
            {
              id: mockCurrentUser.id,
              name: mockCurrentUser.name,
              avatarUrl: mockCurrentUser.avatarUrl,
            },
          ],
    issueCounts: { todo: 0, inProgress: 0, done: 0 },
    category: 'software',
  };
}


/**
 * Checks if a project matches a search query by name, key, or description.
 */
export function matchesProjectSearch(project: Project, query: string): boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return true;

  return (
    project.name.toLowerCase().includes(trimmed) ||
    project.key.toLowerCase().includes(trimmed) ||
    Boolean(project.description?.toLowerCase().includes(trimmed))
  );
}

/**
 * Filters an array of Projects based on a search query.
 */
export function filterProjects(projects: Project[], query: string): Project[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return projects;
  return projects.filter((project) => matchesProjectSearch(project, trimmed));
}

/**
 * Filters an array of SpaceItems based on a search query.
 */
export function filterSpaces(spaces: SpaceItem[], query: string): SpaceItem[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return spaces;
  return spaces.filter((item) => matchesProjectSearch(item.project, trimmed));
}

/**
 * Compares two projects based on a sort key.
 */
export function compareProjects(a: Project, b: Project, sortBy: string = 'updated'): number {
  if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
  if (sortBy === 'name-desc') return b.name.localeCompare(a.name);

  // 'updated' or default
  const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
  const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
  return timeB - timeA;
}

/**
 * Compares two spaces based on a sort key.
 */
export function compareSpaces(a: SpaceItem, b: SpaceItem, sortBy: string = 'updated'): number {
  if (sortBy === 'issues') {
    const countA = a.issueCounts
      ? a.issueCounts.todo + a.issueCounts.inProgress + a.issueCounts.done
      : 0;
    const countB = b.issueCounts
      ? b.issueCounts.todo + b.issueCounts.inProgress + b.issueCounts.done
      : 0;
    return countB - countA;
  }

  return compareProjects(a.project, b.project, sortBy);
}

/**
 * Sorts an array of Projects.
 */
export function sortProjects(projects: Project[], sortBy: string = 'updated'): Project[] {
  return [...projects].sort((a, b) => compareProjects(a, b, sortBy));
}

/**
 * Sorts an array of SpaceItems.
 */
export function sortSpaces(spaces: SpaceItem[], sortBy: string = 'updated'): SpaceItem[] {
  return [...spaces].sort((a, b) => compareSpaces(a, b, sortBy));
}
