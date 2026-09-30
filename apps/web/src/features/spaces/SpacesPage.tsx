import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { Button, Input, Dropdown } from '../../components/base';
import { ProjectCard } from '../../components/shared/project-card';
import { Pagination } from '../../components/shared/pagination';
import styles from './SpacesPage.module.css';
import {
  useProjects,
  userService,
  mapSortToOrdering,
  mockSpaceSortOptions,
  useDebounce,
  type User,
} from '@jira-clone/shared';
import { CreateSpaceModal } from './components/create-space-modal';
import type { CreateSpaceInput } from './components/create-space-modal';

// ============================================================================
// ICONS & ILLUSTRATIONS
// ============================================================================

const SearchIcon: FC<{ size?: number }> = ({ size = 15 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const PlusIcon: FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const BoardIcon: FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18M15 3v18" />
  </svg>
);

const UsersIcon: FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TasksIcon: FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

/**
 * Rich illustration for the empty spaces state.
 */
const KanbanEmptyIllustration: FC = () => (
  <svg width="96" height="96" viewBox="0 0 96 96" fill="none" aria-hidden="true">
    <circle cx="48" cy="48" r="44" fill="var(--color-accent-soft)" fillOpacity="0.45" />
    <circle cx="48" cy="48" r="36" fill="var(--color-surface)" stroke="var(--color-line)" strokeWidth="1.5" />

    {/* Column 1 */}
    <rect x="25" y="27" width="13" height="36" rx="3" fill="var(--color-paper)" stroke="var(--color-line)" strokeWidth="1" />
    <rect x="27.5" y="31" width="8" height="9" rx="2" fill="var(--color-surface)" stroke="var(--color-line)" strokeWidth="0.8" />
    <rect x="27.5" y="43" width="8" height="13" rx="2" fill="var(--color-surface)" stroke="var(--color-line)" strokeWidth="0.8" />

    {/* Column 2 - Active */}
    <rect x="41.5" y="25" width="13" height="40" rx="3" fill="var(--color-paper)" stroke="var(--color-accent)" strokeWidth="1.5" />
    <rect x="44" y="29" width="8" height="12" rx="2" fill="var(--color-accent-soft)" />
    <rect x="44" y="44" width="8" height="8" rx="2" fill="var(--color-surface)" stroke="var(--color-line)" strokeWidth="0.8" />

    {/* Column 3 */}
    <rect x="58" y="27" width="13" height="36" rx="3" fill="var(--color-paper)" stroke="var(--color-line)" strokeWidth="1" />
    <rect x="60.5" y="31" width="8" height="10" rx="2" fill="var(--color-surface)" stroke="var(--color-line)" strokeWidth="0.8" />

    {/* Floating Plus Badge */}
    <circle cx="68" cy="68" r="14" fill="var(--color-accent)" />
    <path d="M68 62v12M62 68h12" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Illustration for search results not found.
 */
const SearchEmptyIllustration: FC = () => (
  <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true">
    <circle cx="44" cy="44" r="40" fill="var(--color-accent-soft)" fillOpacity="0.35" />
    <circle cx="44" cy="44" r="32" fill="var(--color-surface)" stroke="var(--color-line)" strokeWidth="1.5" />

    <circle cx="40" cy="40" r="13" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="49.5" y1="49.5" x2="60" y2="60" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" />
    <line x1="34" y1="40" x2="46" y2="40" stroke="var(--color-ink-muted)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
  </svg>
);

export function SpacesPage() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState('updated');
  const [currentPage, setCurrentPage] = useState(1);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const pageSize = 36;

  // Reset page to 1 when filters or ordering change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedStatus, selectedSort]);

  // Load available users for the member picker in Create Space modal
  useEffect(() => {
    userService
      .getUsers()
      .then((users) => setAvailableUsers(users))
      .catch(() => {});
  }, []);

  // Fetch projects from the backend API
  const {
    spaces,
    totalCount,
    isLoading,
    error,
    createProject,
    refetch,
  } = useProjects({
    search: debouncedSearchQuery.trim() || undefined,
    status: selectedStatus !== 'all' ? (selectedStatus as 'active' | 'done' | 'archived') : undefined,
    ordering: mapSortToOrdering(selectedSort),
    page: currentPage,
    pageSize,
  });

  const totalItems = totalCount;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const handleCreateSpace = async (input: CreateSpaceInput) => {
    const memberIds = input.members
      ?.map((m) => Number(m.id))
      .filter((id) => !Number.isNaN(id) && id > 0);

    await createProject({
      name: input.name,
      key: input.key,
      description: input.description,
      members: memberIds && memberIds.length > 0 ? memberIds : undefined,
    });
    setCurrentPage(1);
  };

  const isFilterActive = Boolean(debouncedSearchQuery.trim()) || selectedStatus !== 'all';

  return (
    <div className={styles.container}>
      {/* Header Row */}
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Spaces &amp; Projects</h1>
          <p className={styles.subtitle}>
            Browse, filter, and access all team workspaces, boards, and project backlogs.
          </p>
        </div>
        <Button
          label="Create space"
          variant="primary"
          size="md"
          leftIcon={<PlusIcon size={16} />}
          onPress={() => setIsCreateModalOpen(true)}
        />
      </header>

      {/* Top Filter Bar */}
      <section className={styles.filterBar} aria-label="Spaces filters">
        <div className={styles.filtersLeft}>
          {/* Search Input */}
          <div className={styles.searchContainer}>
            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search spaces by name or key..."
              leftIcon={<SearchIcon size={15} />}
              containerStyle={{ marginBottom: 0 }}
              inputWrapperStyle={{ minHeight: 38 }}
            />
          </div>

          {/* Status Dropdown Filter */}
          <div className={styles.filterDropdown}>
            <Dropdown
              value={selectedStatus}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'done', label: 'Done' },
                { value: 'archived', label: 'Archived' },
              ]}
              onSelect={setSelectedStatus}
              placeholder="Filter by status"
            />
          </div>

          {/* Clear Filter Button */}
          {isFilterActive && (
            <Button
              label="Clear filters"
              variant="ghost"
              size="sm"
              onPress={() => {
                setSearchQuery('');
                setSelectedStatus('all');
              }}
            />
          )}
        </div>

        {/* Sort Dropdown */}
        <div className={styles.filtersRight}>
          <div className={styles.sortDropdown}>
            <Dropdown
              value={selectedSort}
              options={mockSpaceSortOptions}
              onSelect={setSelectedSort}
              placeholder="Sort by"
            />
          </div>
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className={styles.errorBanner} role="alert">
          <span>{error}</span>
          <Button
            label="Retry"
            variant="secondary"
            size="sm"
            onPress={() => refetch()}
          />
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && spaces.length === 0 ? (
        <div className={styles.spacesGrid} aria-label="Loading spaces">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={styles.skeletonCard} aria-hidden="true" />
          ))}
        </div>
      ) : !isLoading && spaces.length === 0 ? (
        /* Empty State */
        isFilterActive ? (
          /* Case 1: Search / filter query returned 0 results */
          <div className={styles.emptyCard} role="status">
            <div className={styles.emptyGraphicWrapper}>
              <div className={styles.emptyGraphicGlow} />
              <SearchEmptyIllustration />
            </div>
            <h2 className={styles.emptyTitle}>No spaces found</h2>
            <p className={styles.emptyDescription}>
              We couldn&apos;t find any spaces matching your current filters.
              Try adjusting your search terms or clearing the status filter.
            </p>
            <div className={styles.emptyActions}>
              <Button
                label="Clear filters"
                variant="secondary"
                size="md"
                onPress={() => {
                  setSearchQuery('');
                  setSelectedStatus('all');
                }}
              />
              <Button
                label="Create space"
                variant="primary"
                size="md"
                leftIcon={<PlusIcon size={16} />}
                onPress={() => setIsCreateModalOpen(true)}
              />
            </div>
          </div>
        ) : (
          /* Case 2: Workspace has zero spaces */
          <div className={styles.emptyCard} role="status">
            <div className={styles.emptyGraphicWrapper}>
              <div className={styles.emptyGraphicGlow} />
              <KanbanEmptyIllustration />
            </div>
            <h2 className={styles.emptyTitle}>Create your first space</h2>
            <p className={styles.emptyDescription}>
              Spaces are collaborative workspaces where your team plans sprints, tracks tasks, and organizes Kanban boards.
            </p>

            {/* Feature Highlights Grid */}
            <div className={styles.emptyFeatureList}>
              <div className={styles.emptyFeatureItem}>
                <div className={styles.emptyFeatureIcon}>
                  <BoardIcon size={20} />
                </div>
                <div>
                  <span className={styles.emptyFeatureTitle}>Kanban Boards</span>
                  <span className={styles.emptyFeatureDesc}>Visualize tasks and workflows</span>
                </div>
              </div>
              <div className={styles.emptyFeatureItem}>
                <div className={styles.emptyFeatureIcon}>
                  <UsersIcon size={20} />
                </div>
                <div>
                  <span className={styles.emptyFeatureTitle}>Team Roles</span>
                  <span className={styles.emptyFeatureDesc}>Collaborate across members</span>
                </div>
              </div>
              <div className={styles.emptyFeatureItem}>
                <div className={styles.emptyFeatureIcon}>
                  <TasksIcon size={20} />
                </div>
                <div>
                  <span className={styles.emptyFeatureTitle}>Task Tracking</span>
                  <span className={styles.emptyFeatureDesc}>Keep projects on schedule</span>
                </div>
              </div>
            </div>

            <div className={styles.emptyActions}>
              <Button
                label="Create your first space"
                variant="primary"
                size="md"
                leftIcon={<PlusIcon size={16} />}
                onPress={() => setIsCreateModalOpen(true)}
              />
            </div>
          </div>
        )
      ) : (
        /* Spaces Grid */
        <main className={styles.spacesGrid} aria-label="Spaces list">
          {spaces.map((item) => (
            <ProjectCard
              key={item.project.id}
              project={item.project}
              members={item.members}
              issueCounts={item.issueCounts}
              category={item.category}
              onPress={() => navigate(`/spaces/${item.project.id}`)}
            />
          ))}
        </main>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <footer className={styles.paginationSection}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </footer>
      )}

      {/* Create Space Modal */}
      <CreateSpaceModal
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateSpace}
        users={availableUsers.length > 0 ? availableUsers : undefined}
      />
    </div>
  );
}

export default SpacesPage;
