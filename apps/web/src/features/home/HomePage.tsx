import { useState, useMemo, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router';
import {
  mockCards,
  mockProjects,
  mockUsers,
  mockCurrentUser,
  type Card,
  type Project,
  type User,
  type Comment,
  type ActivityLog,
  type CardTypeOption,
  type SpaceItem,
  type DashboardStats,
  updateCardInList,
  deleteCardFromList,
  useAuth,
  useProjects,
  userService,
  taskService,
  backendTaskToCard,
  backendCommentToComment,
  backendActivityToActivityLog,
  columnIdToStatus,
  isStatusAllowedForUser,
  getStatusPermissionHint,
  createDefaultBoardColumns,
  taskTypeToCardTypeOption,
} from '@jira-clone/shared';
import { Button } from '../../components/base';
import { CardDetail } from '../../components/shared/card-detail';
import { ForYouSection } from './components/for-you';
import { RecommendedSpaces } from './components/recommended-spaces';
import { ROUTES } from '../../routes/paths';
import styles from './HomePage.module.css';

// ============================================================================
// ICONS
// ============================================================================

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
  const { user } = useAuth();
  const { spaces, plainProjects } = useProjects();

  const [cards, setCards] = useState<Card[]>(mockCards);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  // Selected card detail data
  const [selectedCardComments, setSelectedCardComments] = useState<Comment[]>([]);
  const [selectedCardActivity, setSelectedCardActivity] = useState<ActivityLog[]>([]);
  const [selectedCardTypes, setSelectedCardTypes] = useState<CardTypeOption[]>([]);

  // Fetch live tasks and dashboard summary from backend
  useEffect(() => {
    let isMounted = true;

    // Fetch dashboard stats
    userService
      .getDashboard()
      .then((data) => {
        if (!isMounted) return;
        if (data?.stats) {
          setDashboardStats(data.stats);
        }
      })
      .catch(() => {});

    // Fetch all tasks across member projects, newest first
    taskService
      .getTasks({ ordering: '-updated_at' })
      .then((backendTasks) => {
        if (!isMounted) return;
        if (backendTasks && backendTasks.length > 0) {
          setCards(backendTasks.map(backendTaskToCard));
        }
      })
      .catch(() => {});

    // Fetch users for assignees
    userService
      .getUsers()
      .then((loadedUsers) => {
        if (!isMounted) return;
        if (loadedUsers && loadedUsers.length > 0) {
          setUsers(loadedUsers);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const currentUserName = user?.full_name || mockCurrentUser.name;
  const currentUserId = user ? String(user.id) : mockCurrentUser.id;

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  // Compute live KPIs (prioritizing backend /api/users/me/dashboard/)
  const assignedCount = useMemo(() => {
    if (dashboardStats?.assigned_tasks !== undefined) {
      return dashboardStats.assigned_tasks;
    }
    return cards.filter(
      (c) =>
        c.assigneeId === currentUserId ||
        (c.assigneeIds && c.assigneeIds.includes(currentUserId))
    ).length;
  }, [dashboardStats, cards, currentUserId]);

  const inProgressCount = useMemo(() => {
    if (dashboardStats?.tasks_by_status?.in_progress !== undefined) {
      return dashboardStats.tasks_by_status.in_progress;
    }
    return cards.filter((c) => c.columnId.includes('progress')).length;
  }, [dashboardStats, cards]);

  const createdCount = useMemo(() => {
    if (dashboardStats?.reported_tasks !== undefined) {
      return dashboardStats.reported_tasks;
    }
    return cards.filter((c) => c.publisherId === currentUserId).length;
  }, [dashboardStats, cards, currentUserId]);

  const activeSpacesCount = useMemo(() => {
    if (dashboardStats?.active_projects !== undefined) {
      return dashboardStats.active_projects;
    }
    return spaces.length;
  }, [dashboardStats, spaces.length]);

  // Recommend only projects returned by the API.
  const recommendedSpaces: SpaceItem[] = useMemo(() => {
    return spaces.slice(0, 4);
  }, [spaces]);

  // Complete list of projects (from store + any project referenced in tasks)
  const allProjects: Project[] = useMemo(() => {
    const map = new Map<string, Project>();
    plainProjects.forEach((p) => map.set(p.id, p));
    if (map.size === 0) {
      mockProjects.forEach((p) => map.set(p.id, p));
    }
    cards.forEach((c) => {
      if (c.projectId && !map.has(c.projectId)) {
        map.set(c.projectId, {
          id: c.projectId,
          name: c.key.split('-')[0] || 'Project',
          key: c.key.split('-')[0] || 'PROJ',
          description: '',
          ownerId: '',
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        });
      }
    });
    return Array.from(map.values());
  }, [plainProjects, cards]);

  // Load comments, activity and task types when a card is selected
  useEffect(() => {
    if (!selectedCard) {
      setSelectedCardComments([]);
      setSelectedCardActivity([]);
      setSelectedCardTypes([]);
      return;
    }

    const cardId = selectedCard.id;
    const numericCardId = Number(cardId);

    // 1. Comments
    taskService
      .getComments(cardId)
      .then((backendComments) => {
        setSelectedCardComments(
          backendComments.map((bc) => backendCommentToComment(bc, cardId))
        );
      })
      .catch(() => setSelectedCardComments([]));

    // 2. Activity
    taskService
      .getActivity(cardId)
      .then((backendEntries) => {
        setSelectedCardActivity(
          backendEntries.map((ba) => backendActivityToActivityLog(ba, cardId))
        );
      })
      .catch(() => setSelectedCardActivity([]));

    // 3. Full task details for fresh permissions and descriptions
    if (!isNaN(numericCardId) && numericCardId > 0) {
      taskService
        .getTask(numericCardId)
        .then((fullTask) => {
          setSelectedCard((prev) => {
            if (!prev || prev.id !== cardId) return prev;
            return backendTaskToCard(fullTask);
          });
        })
        .catch(() => {});
    }

    // 4. Task types
    const projId = selectedCard.projectId;
    if (projId && !isNaN(Number(projId))) {
      taskService
        .getTaskTypes(projId)
        .then((types) => {
          if (types && types.length > 0) {
            setSelectedCardTypes(types.map(taskTypeToCardTypeOption));
          }
        })
        .catch(() => {});
    }
  }, [selectedCard?.id]);

  const handleSaveCard = async (updatedCard: Card) => {
    const targetStatus = columnIdToStatus(updatedCard.columnId);

    if (
      selectedCard &&
      columnIdToStatus(selectedCard.columnId) !== targetStatus &&
      !isStatusAllowedForUser(currentUserId, selectedCard, updatedCard.columnId)
    ) {
      alert(getStatusPermissionHint(currentUserId, selectedCard));
      return;
    }

    // Optimistic update
    setCards((prev) => updateCardInList(prev, updatedCard));
    setSelectedCard(updatedCard);

    const numId = Number(updatedCard.id);
    if (!isNaN(numId) && numId > 0) {
      try {
        let resolvedTypeId: number | undefined = updatedCard.typeId;
        if (!resolvedTypeId && updatedCard.type) {
          const num = Number(updatedCard.type);
          if (!isNaN(num) && num > 0) {
            resolvedTypeId = num;
          } else {
            const found = selectedCardTypes.find(
              (t) =>
                t.label.toLowerCase() === updatedCard.type?.toLowerCase() ||
                t.id === updatedCard.type
            );
            if (found && !isNaN(Number(found.id))) {
              resolvedTypeId = Number(found.id);
            }
          }
        }

        const updatedTask = await taskService.updateTask(numId, {
          title: updatedCard.title,
          description: updatedCard.description,
          assignee: updatedCard.assigneeId ? Number(updatedCard.assigneeId) : null,
          due_date: updatedCard.dueDate || null,
          status: targetStatus,
          type: resolvedTypeId,
        });

        const syncedCard = backendTaskToCard(updatedTask);
        setCards((prev) => updateCardInList(prev, syncedCard));
        setSelectedCard(syncedCard);
      } catch (err: unknown) {
        console.error('Failed to update card on server:', err);
        alert(err instanceof Error ? err.message : 'Failed to update task');
      }
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    setCards((prev) => deleteCardFromList(prev, cardId));
    setSelectedCard(null);

    const numId = Number(cardId);
    if (!isNaN(numId) && numId > 0) {
      try {
        await taskService.deleteTask(numId);
      } catch (err) {
        console.error('Failed to delete card on server:', err);
      }
    }
  };

  const handleAddComment = async (content: string, cardId?: string) => {
    const targetId = cardId || selectedCard?.id;
    if (!targetId) return;

    const numId = Number(targetId);
    if (!isNaN(numId) && numId > 0) {
      try {
        const backendComment = await taskService.addComment(numId, { body: content });
        const frontendComment = backendCommentToComment(backendComment, targetId);
        setSelectedCardComments((prev) => [...prev, frontendComment]);
      } catch (err: unknown) {
        console.error('Failed to add comment:', err);
        alert(err instanceof Error ? err.message : 'Failed to post comment');
      }
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedCard) return;
    const numTaskId = Number(selectedCard.id);
    const numCommentId = Number(commentId);
    if (!isNaN(numTaskId) && !isNaN(numCommentId)) {
      try {
        await taskService.deleteComment(numTaskId, numCommentId);
        setSelectedCardComments((prev) => prev.filter((c) => c.id !== commentId));
      } catch (err: unknown) {
        console.error('Failed to delete comment:', err);
        alert(err instanceof Error ? err.message : 'Failed to delete comment');
      }
    }
  };


  return (
    <div className={styles.container}>
      <main className={styles.content}>
        {/* Top Header Row */}
        <header className={styles.headerRow}>
          <div className={styles.headerText}>
            <div className={styles.greetingRow}>
              <h1 className={styles.title}>{getGreeting(currentUserName)}</h1>
            </div>
            <p className={styles.subtitle}>
              {todayFormatted} · Here is your cross-space sprint summary and active work items.
            </p>
          </div>

          <div className={styles.headerActions}>
            <Button
              label="Explore spaces"
              variant="primary"
              size="md"
              leftIcon={<CompassIcon size={15} />}
              onPress={() => navigate(ROUTES.PROTECTED.SPACES)}
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
              projects={allProjects}
              columns={createDefaultBoardColumns('default')}
              users={users.length > 0 ? users : mockUsers}
              currentUserId={currentUserId}
              onSelectCard={(card) => setSelectedCard(card)}
              onCreateCard={() => navigate(ROUTES.PROTECTED.SPACES)}
            />
          </div>

          {/* Right Column: Recommended Spaces */}
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
          projectId={selectedCard.projectId}
          columns={createDefaultBoardColumns(selectedCard.projectId || 'default')}
          users={users.length > 0 ? users : mockUsers}
          comments={selectedCardComments}
          activityLogs={selectedCardActivity}
          cardTypes={selectedCardTypes}
          currentUserId={currentUserId}
          onClose={() => setSelectedCard(null)}
          onSave={handleSaveCard}
          onDelete={handleDeleteCard}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
        />
      )}
    </div>
  );
}

export default HomePage;
