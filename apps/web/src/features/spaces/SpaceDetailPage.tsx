import { useState } from "react";
import type { FC } from "react";
import { useParams, useNavigate } from "react-router";
import { ProjectHeader } from "../../components/shared/project-header";
import { Board } from "../../components/shared/board";
import { CardDetail, type CreateCardData } from "../../components/shared/card-detail";
import {
  mockSpaces,
  mockColumns,
  mockCards,
  mockUsers,
  mockComments,
  mockActivityLogs,
  mockCurrentUser,
  type Card,
  type BoardColumn,
  type CardTypeOption,
  DEFAULT_CARD_TYPES,
  createCard,
  updateCardInList,
  moveCardToColumn,
  deleteCardFromList,
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
  const [columns, setColumns] = useState<BoardColumn[]>(mockColumns);
  const [cards, setCards] = useState<Card[]>(mockCards);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string | null>(null);
  const [cardTypes, setCardTypes] = useState<CardTypeOption[]>(DEFAULT_CARD_TYPES.slice(0, 3));

  const space =
    mockSpaces.find(
      (s) =>
        s.project.id === id ||
        s.project.key.toLowerCase() === id?.toLowerCase(),
    ) ?? mockSpaces[0];

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

  const handleCreateCardSubmit = (formData: CreateCardData) => {
    const chosenColumnId = formData.columnId || targetColumnId || columns[0]?.id || "col-todo";
    const newCard = createCard({
      title: formData.title,
      type: formData.type,
      priority: formData.priority || "medium",
      assigneeId: formData.assigneeId,
      assigneeIds: formData.assigneeIds,
      description: formData.description,
      dueDate: formData.dueDate,
      projectId: space.project.id,
      projectKey: space.project.key,
      columnId: chosenColumnId,
      cardIndex: cards.length + 1,
      order: cards.filter((c) => c.columnId === chosenColumnId).length,
    });

    setCards((prev) => [...prev, newCard]);
    setIsCreateCardOpen(false);
    setTargetColumnId(null);
    setSelectedCard(newCard);
  };

  const handleCardPress = (card: Card) => {
    setIsCreateCardOpen(false);
    setSelectedCard(card);
  };

  const handleAddCardPress = (columnId?: string) => {
    handleOpenCreateCard(columnId);
  };

  const handleCardMove = (card: Card, toColumnId?: string) => {
    if (!toColumnId) return;
    setCards((prev) => moveCardToColumn(prev, card.id, toColumnId));
  };

  const handleCloseCardDetail = () => {
    setSelectedCard(null);
    setIsCreateCardOpen(false);
    setTargetColumnId(null);
  };

  const handleAddStatus = (newCol: BoardColumn) => {
    setColumns((prev) => [...prev, newCol]);
  };

  const handleSaveCardDetail = (updated: Card) => {
    setCards((prev) => updateCardInList(prev, updated));
    setSelectedCard(updated);
  };

  const handleDeleteCard = (cardId: string) => {
    setCards((prev) => deleteCardFromList(prev, cardId));
    setSelectedCard(null);
  };

  return (
    <div className={styles.container}>
      {/* Top action bar: Back button & Theme toggle */}
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

      {/* Space / Project Header with Create card button */}
      <section className={styles.headerSection}>
        <ProjectHeader
          project={space.project}
          members={space.members}
          category={space.category}
          onCreateCard={handleHeaderCreateCard}
        />
      </section>

      {/* Project Board View */}
      <section className={styles.boardSection}>
        <Board
          columns={columns}
          cards={cards}
          users={mockUsers}
          currentUserId={mockCurrentUser.id}
          cardTypes={cardTypes}
          boardTitle={`${space.project.name} Sprint Board`}
          projectKey={space.project.key}
          onCardPress={handleCardPress}
          onAddCardPress={handleAddCardPress}
          onCardMove={handleCardMove}
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
        users={mockUsers}
        comments={mockComments}
        activityLogs={mockActivityLogs}
        currentUserId={mockCurrentUser.id}
        cardTypes={cardTypes}
        onAddType={(newType) => setCardTypes((prev) => [...prev, newType])}
        onClose={handleCloseCardDetail}
        onCreateCard={handleCreateCardSubmit}
        onAddStatus={handleAddStatus}
        onSave={handleSaveCardDetail}
        onDelete={handleDeleteCard}
      />
    </div>
  );
}

export default SpaceDetailPage;
