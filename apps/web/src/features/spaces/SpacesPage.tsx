import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import { Button, Input, Dropdown } from '../../components/base';
import { ProjectCard } from '../../components/shared/project-card';
import { Pagination } from '../../components/shared/pagination';
import styles from './SpacesPage.module.css';

// ============================================================================
// ICONS
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

import {
  mockSpaces,
  // mockSpaceTypeOptions,
  // mockSpaceOwnerOptions,
  mockSpaceSortOptions,
  useDebounce,
  filterSpaces,
  sortSpaces,
  createSpace,
} from '@jira-clone/shared';
import type { SpaceItem } from '@jira-clone/shared';
import { CreateSpaceModal } from './components/create-space-modal';
import type { CreateSpaceInput } from './components/create-space-modal';

export function SpacesPage() {
  const navigate = useNavigate();
  const [spaces, setSpaces] = useState<SpaceItem[]>(mockSpaces);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  // Filter dropdown states hidden until backend filter specifications are finalized
  // const [selectedType, setSelectedType] = useState('all');
  // const [selectedOwner, setSelectedOwner] = useState('all');
  const [selectedSort, setSelectedSort] = useState('updated');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 36;

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedSort]);

  const filteredSpaces = filterSpaces(spaces, debouncedSearchQuery);
  const sortedSpaces = sortSpaces(filteredSpaces, selectedSort);

  const totalItems = sortedSpaces.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const visibleSpaces = sortedSpaces.slice(startIndex, startIndex + pageSize);

  const handleCreateSpace = (input: CreateSpaceInput) => {
    const newSpace = createSpace(input);
    setSpaces((prev) => [newSpace, ...prev]);
    setCurrentPage(1);
  };


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

          {/* Filter dropdowns (hidden until backend filters are finalized) */}
          {/*
          <div className={styles.filterDropdown}>
            <Dropdown
              value={selectedType}
              options={mockSpaceTypeOptions}
              onSelect={setSelectedType}
              placeholder="Space type"
            />
          </div>

          <div className={styles.filterDropdown}>
            <Dropdown
              value={selectedOwner}
              options={mockSpaceOwnerOptions}
              onSelect={setSelectedOwner}
              placeholder="Owner"
            />
          </div>
          */}
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

      {/* Spaces Grid */}
      <main className={styles.spacesGrid} aria-label="Spaces list">
        {visibleSpaces.map((item) => (
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

      {/* Pagination Footer */}
      <footer className={styles.paginationSection}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </footer>

      {/* Create Space Modal */}
      <CreateSpaceModal
        visible={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateSpace}
      />
    </div>
  );
}

export default SpacesPage;
