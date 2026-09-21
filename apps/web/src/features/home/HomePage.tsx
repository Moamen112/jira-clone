import { useState, useMemo } from 'react';
import type { FC, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import {
  mockCards,
  mockColumns,
  mockProjects,
  mockUsers,
  mockCurrentUser,
  mockComments,
  mockActivityLogs,
  type Card,
  createCard,
  updateCardInList,
  deleteCardFromList,
  handleCardTitleChange as processCardTitleChange,
} from '@jira-clone/shared';
import { Button, Input, Dropdown } from '../../components/base';
import type { DropdownOption } from '../../components/base';
import { Modal } from '../../components/shared/modal';
import { CardDetail } from '../../components/shared/card-detail';
import { ForYouSection } from './components/for-you';
import { RecommendedSpaces } from './components/recommended-spaces';
import type { SpaceItem } from '@jira-clone/shared';
import { ROUTES } from '../../routes/paths';
import styles from './HomePage.module.css';

// ============================================================================
// ICONS
// ============================================================================

const PlusIcon: FC<{ size?: number }> = ({ size = 15 }) => (
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

const CompassIcon: FC<{ size?: number }> = ({ size = 15 }) => (
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
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const UserCheckIcon: FC<{ size?: number }> = ({ size = 16 }) => (
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
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <polyline points="17 11 19 13 23 9" />
  </svg>
);

const ClockIcon: FC<{ size?: number }> = ({ size = 16 }) => (
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
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const PenToolIcon: FC<{ size?: number }> = ({ size = 16 }) => (
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
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="M2 2l7.586 7.586" />
    <circle cx="11" cy="11" r="2" />
  </svg>
);

const GridIcon: FC<{ size?: number }> = ({ size = 16 }) => (
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
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

function getGreeting(userName: string): string {
  const hour = new Date().getHours();
  const firstName = userName.split(' ')[0] || userName;
  if (hour < 12) return `Good morning, ${firstName} 👋`;
  if (hour < 17) return `Good afternoon, ${firstName} 👋`;
  return `Good evening, ${firstName} 👋`;
}

export function HomePage() {
  const navigate = useNavigate();

  // Local state seeded from shared mock data
  const [cards, setCards] = useState<Card[]>(mockCards);
  const [starredCardIds, setStarredCardIds] = useState<string[]>(['card-1']);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  // Quick Create Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTitleError, setNewTitleError] = useState<string | undefined>(undefined);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(mockProjects[0].id);

  const currentUser = mockCurrentUser;
  const currentUserId = currentUser.id;

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  // Compute live KPIs
  const assignedCount = useMemo(() => {
    return cards.filter(
      (c) =>
        c.assigneeId === currentUserId ||
        (c.assigneeIds && c.assigneeIds.includes(currentUserId))
    ).length;
  }, [cards, currentUserId]);

  const inProgressCount = useMemo(() => {
    return cards.filter((c) => c.columnId.includes('progress')).length;
  }, [cards]);

  const createdCount = useMemo(() => {
    return cards.filter((c) => c.publisherId === currentUserId).length;
  }, [cards, currentUserId]);

  // Derive recommended spaces dynamically from local cards & mockProjects (frontend workaround)
  const recommendedSpaces: SpaceItem[] = useMemo(() => {
    const countsByProject: Record<string, { todo: number; inProgress: number; done: number }> = {};
    cards.forEach((c) => {
      if (!countsByProject[c.projectId]) {
        countsByProject[c.projectId] = { todo: 0, inProgress: 0, done: 0 };
      }
      if (c.columnId.includes('done')) {
        countsByProject[c.projectId].done += 1;
      } else if (c.columnId.includes('progress')) {
        countsByProject[c.projectId].inProgress += 1;
      } else {
        countsByProject[c.projectId].todo += 1;
      }
    });

    return mockProjects.slice(0, 4).map((project, idx) => ({
      project,
      members: mockUsers.slice(0, 3).map((u) => ({ id: u.id, name: u.name })),
      issueCounts: countsByProject[project.id] ?? {
        todo: 4 + (idx % 3),
        inProgress: 2 + (idx % 2),
        done: 5 + idx,
      },
      category: idx % 2 === 0 ? 'software' : 'business',
    }));
  }, [cards]);

  const activeSpacesCount = mockProjects.length;

  const handleToggleStar = (cardId: string) => {
    setStarredCardIds((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId]
    );
  };

  const handleSaveCard = (updatedCard: Card) => {
    setCards((prev) => updateCardInList(prev, updatedCard));
    setSelectedCard(updatedCard);
  };

  const handleDeleteCard = (cardId: string) => {
    setCards((prev) => deleteCardFromList(prev, cardId));
    setStarredCardIds((prev) => prev.filter((id) => id !== cardId));
    setSelectedCard(null);
  };

  const handleOpenCreateModal = () => {
    setNewTitle('');
    setNewTitleError(undefined);
    setIsCreateOpen(true);
  };

  const handleConfirmCreateCard = () => {
    const validation = processCardTitleChange(newTitle);
    if (validation.error) {
      setNewTitleError(validation.error);
      return;
    }

    const targetProject =
      mockProjects.find((p) => p.id === selectedProjectId) ?? mockProjects[0];

    const newCard = createCard({
      title: validation.title,
      projectId: targetProject.id,
      projectKey: targetProject.key,
      columnId: 'col-todo',
      cardIndex: cards.length + 1,
      order: cards.filter((c) => c.columnId === 'col-todo').length,
    });

    setCards((prev) => [newCard, ...prev]);
    setIsCreateOpen(false);
    setNewTitle('');
    setNewTitleError(undefined);
    setSelectedCard(newCard);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleConfirmCreateCard();
  };

  const projectOptions: DropdownOption[] = mockProjects.map((p) => ({
    label: `${p.name} (${p.key})`,
    value: p.id,
  }));

  return (
    <div className={styles.container}>
      <main className={styles.content}>
        {/* Top Header Row */}
        <header className={styles.headerRow}>
          <div className={styles.headerText}>
            <div className={styles.greetingRow}>
              <h1 className={styles.title}>{getGreeting(currentUser.name)}</h1>
            </div>
            <p className={styles.subtitle}>
              {todayFormatted} · Here is your cross-space sprint summary and active work items.
            </p>
          </div>

          <div className={styles.headerActions}>
            <Button
              label="Explore spaces"
              variant="secondary"
              size="md"
              leftIcon={<CompassIcon size={15} />}
              onPress={() => navigate(ROUTES.PROTECTED.SPACES)}
            />
            <Button
              label="Create issue"
              variant="primary"
              size="md"
              leftIcon={<PlusIcon size={15} />}
              onPress={handleOpenCreateModal}
            />
          </div>
        </header>

        {/* Live KPI Metric Cards */}
        <section className={styles.kpiGrid} aria-label="Quick metrics">
          <div
            className={styles.kpiCard}
            onClick={() => {
              const el = document.querySelector('[role="tablist"]');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            role="button"
            tabIndex={0}
          >
            <div className={styles.kpiTop}>
              <span className={styles.kpiLabel}>Assigned to You</span>
              <span className={styles.kpiIcon}>
                <UserCheckIcon size={16} />
              </span>
            </div>
            <span className={styles.kpiValue}>{assignedCount}</span>
            <span className={styles.kpiDesc}>Open tasks requiring your review</span>
          </div>

          <div
            className={styles.kpiCard}
            onClick={() => {
              const el = document.querySelector('[role="tablist"]');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            role="button"
            tabIndex={0}
          >
            <div className={styles.kpiTop}>
              <span className={styles.kpiLabel}>In Progress</span>
              <span className={styles.kpiIcon}>
                <ClockIcon size={16} />
              </span>
            </div>
            <span className={styles.kpiValue}>{inProgressCount}</span>
            <span className={styles.kpiDesc}>Active issues across ongoing sprints</span>
          </div>

          <div
            className={styles.kpiCard}
            onClick={() => {
              const el = document.querySelector('[role="tablist"]');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            role="button"
            tabIndex={0}
          >
            <div className={styles.kpiTop}>
              <span className={styles.kpiLabel}>Created by You</span>
              <span className={styles.kpiIcon}>
                <PenToolIcon size={16} />
              </span>
            </div>
            <span className={styles.kpiValue}>{createdCount}</span>
            <span className={styles.kpiDesc}>Issues and tasks authored by you</span>
          </div>

          <div
            className={styles.kpiCard}
            onClick={() => navigate(ROUTES.PROTECTED.SPACES)}
            role="button"
            tabIndex={0}
          >
            <div className={styles.kpiTop}>
              <span className={styles.kpiLabel}>Active Spaces</span>
              <span className={styles.kpiIcon}>
                <GridIcon size={16} />
              </span>
            </div>
            <span className={styles.kpiValue}>{activeSpacesCount}</span>
            <span className={styles.kpiDesc}>Collaborative team workspaces</span>
          </div>
        </section>

        {/* 2-Column Main Dashboard Layout */}
        <div className={styles.mainGrid}>
          {/* Left Column: Your Work + Team Activity */}
          <div className={styles.leftColumn}>
            {/* Jira Your Work Tabbed Section */}
            <ForYouSection
              cards={cards}
              projects={mockProjects}
              columns={mockColumns}
              users={mockUsers}
              currentUserId={currentUserId}
              starredCardIds={starredCardIds}
              onToggleStar={handleToggleStar}
              onSelectCard={(card) => setSelectedCard(card)}
              onCreateCard={handleOpenCreateModal}
            />
          </div>

          {/* Right Column: Recommended Spaces (Client-derived workaround) */}
          <div className={styles.rightColumn}>
            <RecommendedSpaces spaces={recommendedSpaces} maxItems={4} />
          </div>
        </div>
      </main>

      {/* Card Detail Dialog Modal */}
      {selectedCard && (
        <CardDetail
          visible={Boolean(selectedCard)}
          card={selectedCard}
          columns={mockColumns}
          users={mockUsers}
          comments={mockComments}
          activityLogs={mockActivityLogs}
          currentUserId={currentUserId}
          onClose={() => setSelectedCard(null)}
          onSave={handleSaveCard}
          onDelete={handleDeleteCard}
        />
      )}

      {/* Quick Create Card Modal */}
      <Modal
        visible={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Issue"
        subtitle="Quickly add a task to any workspace"
        presentation="dialog"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button
              label="Cancel"
              variant="secondary"
              size="sm"
              onPress={() => setIsCreateOpen(false)}
            />
            <Button
              label="Create issue"
              variant="primary"
              size="sm"
              disabled={!newTitle.trim()}
              onPress={handleConfirmCreateCard}
            />
          </div>
        }
      >
        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Dropdown
            label="Project Space"
            value={selectedProjectId}
            options={projectOptions}
            onSelect={setSelectedProjectId}
            placeholder="Select project..."
          />

          <Input
            label="Issue Summary"
            placeholder="What needs to be done?"
            value={newTitle}
            onChangeText={(text) => {
              const { title, error } = processCardTitleChange(text);
              setNewTitle(title);
              if (newTitleError && !error) setNewTitleError(undefined);
            }}
            error={newTitleError}
            autoFocus
            containerStyle={{ marginBottom: 0 }}
          />
        </form>
      </Modal>
    </div>
  );
}

export default HomePage;
