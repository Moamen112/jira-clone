import { useState, useEffect } from "react";
import type { FC } from "react";
import { useParams, useNavigate } from "react-router";
import { ProjectHeader } from "../../components/shared/project-header";
import { Board } from "../../components/shared/board";
import { CardDetail, type CreateCardData } from "../../components/shared/card-detail";
import {
  type Card,
  type CardTypeOption,
  type Comment,
  type ActivityLog,
  useSpaceDetail,
  backendTaskToCard,
  columnIdToStatus,
  isStatusAllowedForUser,
  getStatusPermissionHint,
  taskService,
  taskTypeToCardTypeOption,
} from "@jira-clone/shared";
import { ROUTES } from "../../routes/paths";
import styles from "./SpaceDetailPage.module.css";

const ArrowLeftIcon: FC<{ size?: number }> = ({ size = 15 }) => (
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
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export function SpaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null);

  // Comments & activity logs for selected card
  const [selectedCardComments, setSelectedCardComments] = useState<Comment[]>([]);
  const [selectedCardActivity, setSelectedCardActivity] = useState<ActivityLog[]>([]);

  useEffect(() => {
    setSelectedCard(null);
    setIsCreateCardOpen(false);
    setTargetColumnId(null);
    setSelectedCardComments([]);
    setSelectedCardActivity([]);
  }, [id]);

  const {
    space,
    boardUsers,
    currentUserId,
    projectLoading,
    projectError,
    retryProject,
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
    cards,
    columns,
    cardTypeOptions,
    isLoading: tasksLoading,
    error: tasksError,
    fetchTasks,
    statusError,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    createTaskType,
    loadComments,
    addComment,
    deleteComment,
    loadActivity,
  } = useSpaceDetail(id);

  // Load full card details, comments & activity logs whenever a card is selected
  const selectedCardId = selectedCard?.id;
  useEffect(() => {
    if (selectedCardId) {
      loadComments(selectedCardId).then(setSelectedCardComments);
      loadActivity(selectedCardId).then(setSelectedCardActivity);

      const numId = Number(selectedCardId);
      if (!isNaN(numId) && numId > 0) {
        taskService
          .getTask(numId)
          .then((fullBackendTask) => {
            setSelectedCard((prev) => {
              if (!prev || prev.id !== selectedCardId) return prev;
              return backendTaskToCard(fullBackendTask);
            });
          })
          .catch((err) => {
            console.warn("Failed to fetch full task details:", err);
          });
      }
    } else {
      setSelectedCardComments([]);
      setSelectedCardActivity([]);
    }
  }, [selectedCardId, loadComments, loadActivity]);

  // Keep selectedCard in sync when cards array gets updated with full details in background
  useEffect(() => {
    if (selectedCard) {
      const match = cards.find((c) => c.id === selectedCard.id);
      if (
        match &&
        ((match.description && !selectedCard.description) ||
          (match.updatedAt && match.updatedAt !== selectedCard.updatedAt))
      ) {
        setSelectedCard(match);
      }
    }
  }, [cards, selectedCard]);

  const handleBackToSpaces = () => {
    navigate(ROUTES.PROTECTED.SPACES);
  };

  const handleOpenCreateCard = (columnId?: string) => {
    setTargetColumnId(columnId || null);
    setSelectedCard(null);
    setIsCreateCardOpen(true);
  };

  const handleHeaderCreateCard = () => {
    handleOpenCreateCard();
  };

  const handleCreateCardSubmit = async (formData: CreateCardData) => {
    const chosenColumnId =
      formData.columnId || targetColumnId || columns[0]?.id || "col-todo";
    try {
      const createdBackendTask = await createTask({
        title: formData.title,
        type: formData.type,
        description: formData.description,
        assigneeId: formData.assigneeId ? Number(formData.assigneeId) : null,
        dueDate: formData.dueDate,
        columnId: chosenColumnId,
      });

      const newCard = backendTaskToCard(createdBackendTask);
      setIsCreateCardOpen(false);
      setTargetColumnId(null);
      setSelectedCard(newCard);
    } catch (err: unknown) {
      console.error("Failed to create card:", err);
      alert(err instanceof Error ? err.message : "Failed to create card");
    }
  };

  const handleCardPress = (card: Card) => {
    setIsCreateCardOpen(false);
    setSelectedCard(card);
  };

  const handleAddCardPress = (columnId?: string) => {
    handleOpenCreateCard(columnId);
  };

  const handleCardMove = async (card: Card, toColumnId?: string) => {
    if (!toColumnId || card.columnId === toColumnId) return;
    if (!isStatusAllowedForUser(currentUserId, card, toColumnId)) {
      alert(getStatusPermissionHint(currentUserId, card));
      return;
    }
    try {
      await updateTaskStatus(card.id, toColumnId);
    } catch (err: unknown) {
      console.error("Failed to move card:", err);
      alert(
        err instanceof Error
          ? err.message
          : "You do not have permission to transition to this status."
      );
    }
  };

  const handleCloseCardDetail = () => {
    setSelectedCard(null);
    setIsCreateCardOpen(false);
    setTargetColumnId(null);
  };

  const handleSaveCardDetail = async (updated: Card) => {
    try {
      const targetStatus = columnIdToStatus(updated.columnId);

      if (
        selectedCard &&
        columnIdToStatus(selectedCard.columnId) !== targetStatus &&
        !isStatusAllowedForUser(currentUserId, selectedCard, updated.columnId)
      ) {
        alert(getStatusPermissionHint(currentUserId, selectedCard));
        return;
      }

      let resolvedTypeId: number | undefined = updated.typeId;
      if (!resolvedTypeId && updated.type) {
        const num = Number(updated.type);
        if (!isNaN(num) && num > 0) {
          resolvedTypeId = num;
        } else {
          const found = cardTypeOptions.find(
            (t) =>
              t.label.toLowerCase() === updated.type?.toLowerCase() ||
              t.id === updated.type
          );
          if (found && !isNaN(Number(found.id))) {
            resolvedTypeId = Number(found.id);
          }
        }
      }

      const updatedTask = await updateTask(updated.id, {
        title: updated.title,
        description: updated.description,
        assignee: updated.assigneeId ? Number(updated.assigneeId) : null,
        due_date: updated.dueDate || null,
        status: targetStatus,
        type: resolvedTypeId,
      });
      setSelectedCard(backendTaskToCard(updatedTask));
    } catch (err: unknown) {
      console.error("Failed to update card:", err);
      alert(err instanceof Error ? err.message : "Failed to update card");
    }
  };

  const handleCardAssigneeChange = async (userId: string | null, card: Card) => {
    try {
      await updateTask(card.id, {
        assignee: userId ? Number(userId) : null,
      });
    } catch (err: unknown) {
      console.error("Failed to update assignee:", err);
      alert(err instanceof Error ? err.message : "Failed to update assignee");
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await deleteTask(cardId);
      setSelectedCard(null);
    } catch (err: unknown) {
      console.error("Failed to delete card:", err);
      alert(err instanceof Error ? err.message : "Failed to delete card");
    }
  };

  const handleAddComment = async (content: string, cardId?: string) => {
    const targetId = cardId || selectedCard?.id;
    if (!targetId) return;
    try {
      const newComment = await addComment(targetId, content);
      setSelectedCardComments((prev) => [...prev, newComment]);
    } catch (err: unknown) {
      console.error("Failed to add comment:", err);
      alert(err instanceof Error ? err.message : "Failed to post comment");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!selectedCard) return;
    try {
      await deleteComment(selectedCard.id, commentId);
      setSelectedCardComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err: unknown) {
      console.error("Failed to delete comment:", err);
      alert(err instanceof Error ? err.message : "Failed to delete comment");
    }
  };

  const handleAddType = async (newType: CardTypeOption): Promise<CardTypeOption | void> => {
    try {
      const created = await createTaskType(newType.label);
      return taskTypeToCardTypeOption(created);
    } catch (err: unknown) {
      console.error("Failed to create card type:", err);
      alert(err instanceof Error ? err.message : "Failed to create card type");
      throw err;
    }
  };

  if (!space) {
    return (
      <div className={styles.container}>
        <div className={styles.topBar}>
          <button type="button" className={styles.backButton} onClick={handleBackToSpaces}>
            <ArrowLeftIcon size={14} /> Back to Spaces
          </button>
        </div>
        <div className={styles.emptyState} role={projectError ? 'alert' : 'status'}>
          <h2>{projectLoading ? 'Loading project...' : projectError ? 'Could not load project' : 'Project Not Found'}</h2>
          {projectError && <p>{projectError}</p>}
          {projectError && <button type="button" className={styles.backButton} onClick={retryProject}>Retry</button>}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Top action bar: Back button */}
      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.backButton}
          onClick={handleBackToSpaces}
          aria-label="Back to spaces"
        >
          <ArrowLeftIcon size={14} />
          <span>Back to Spaces</span>
        </button>
      </div>

      {/* Permission or transition error banner */}
      {statusError && (
        <div className={styles.errorBanner} role="alert">
          <span>{statusError}</span>
        </div>
      )}

      {projectError && (
        <div className={styles.errorBanner} role="alert">
          <span>{projectError}</span>
          <button type="button" className={styles.backButton} onClick={retryProject}>Retry project</button>
        </div>
      )}

      {tasksError && !tasksLoading && (
        <div className={styles.errorBanner} role="alert">
          <span>Could not load cards: {tasksError}</span>
          <button type="button" className={styles.backButton} onClick={() => { void fetchTasks().catch(() => {}); }}>Retry</button>
        </div>
      )}

      {tasksLoading && cards.length === 0 && <div role="status">Loading cards...</div>}

      {/* Space / Project Header with Create card button */}
      <section className={styles.headerSection}>
        <ProjectHeader
          project={space.project}
          members={boardUsers}
          category={space.category}
          onCreateCard={handleHeaderCreateCard}
        />
      </section>

      {/* Project Board View */}
      <section className={styles.boardSection}>
        <Board
          columns={columns}
          cards={cards}
          users={boardUsers}
          currentUserId={currentUserId}
          cardTypes={filterableTypeOptions}
          boardTitle={`${space.project.name} Board`}
          projectKey={space.project.key}
          searchQuery={boardSearch}
          onSearchChange={setBoardSearch}
          assignedToMe={assignedToMeFilter}
          onToggleAssignedToMe={() => setAssignedToMeFilter((v) => !v)}
          createdByMe={createdByMeFilter}
          onToggleCreatedByMe={() => setCreatedByMeFilter((v) => !v)}
          selectedType={selectedTypeFilter}
          onSelectType={setSelectedTypeFilter}
          selectedUserIds={selectedUserIdsFilter}
          onToggleUserId={toggleUserIdFilter}
          onClearFilters={clearBoardFilters}
          isServerFiltered={true}
          totalCardsCount={space.project.taskCount}
          onCardPress={handleCardPress}
          onAddCardPress={handleAddCardPress}
          onCardMove={handleCardMove}
          onCardAssigneeChange={handleCardAssigneeChange}
          onCreateCard={(_title, columnId) => handleOpenCreateCard(columnId)}
        />
      </section>

      {/* Unified Card Detail Modal (Used for Viewing, Editing, and Creating) */}
      <CardDetail
        visible={Boolean(selectedCard) || isCreateCardOpen}
        card={selectedCard}
        isCreating={isCreateCardOpen}
        targetColumnId={targetColumnId}
        projectKey={space.project.key}
        projectId={space.project.id}
        columns={columns}
        users={boardUsers}
        comments={selectedCardComments}
        activityLogs={selectedCardActivity}
        currentUserId={currentUserId}
        cardTypes={cardTypeOptions}
        onAddType={handleAddType}
        onClose={handleCloseCardDetail}
        onCreateCard={handleCreateCardSubmit}
        onSave={handleSaveCardDetail}
        onDelete={handleDeleteCard}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
      />
    </div>
  );
}

export default SpaceDetailPage;
