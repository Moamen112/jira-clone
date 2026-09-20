import { useState } from "react";
import type { FC, FormEvent } from "react";
import { useParams, useNavigate } from "react-router";
import { Button, Input } from "../../components/base";
import { Modal } from "../../components/shared/modal";
import { ProjectHeader } from "../../components/shared/project-header";
import { Board } from "../../components/shared/board";
import { CardDetail } from "../../components/shared/card-detail";
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
  createCard,
  updateCardInList,
  moveCardToColumn,
  deleteCardFromList,
  handleCardTitleChange as processCardTitleChange,
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
  const [newCardTitle, setNewCardTitle] = useState("");
  const [cardTitleError, setCardTitleError] = useState<string | undefined>(
    undefined,
  );

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
    setNewCardTitle("");
    setCardTitleError(undefined);
    setIsCreateCardOpen(true);
  };

  const handleHeaderCreateCard = () => {
    handleOpenCreateCard();
  };

  const handleConfirmCreateCard = () => {
    const validation = processCardTitleChange(newCardTitle);
    if (validation.error) {
      setCardTitleError(validation.error);
      return;
    }

    const chosenColumnId = targetColumnId || columns[0]?.id || "col-todo";
    const newCard = createCard({
      title: validation.title,
      projectId: space.project.id,
      projectKey: space.project.key,
      columnId: chosenColumnId,
      cardIndex: cards.length + 1,
      order: cards.filter((c) => c.columnId === chosenColumnId).length,
    });

    setCards((prev) => [...prev, newCard]);
    setIsCreateCardOpen(false);
    setNewCardTitle("");
    setCardTitleError(undefined);
    setTargetColumnId(null);

    // Opening it will open the card normally
    setSelectedCard(newCard);
  };

  const handleCloseCreateModal = () => {
    setIsCreateCardOpen(false);
    setNewCardTitle("");
    setCardTitleError(undefined);
    setTargetColumnId(null);
  };

  const handleCardPress = (card: Card) => {
    setSelectedCard(card);
  };

  const handleAddCardPress = (columnId?: string) => {
    handleOpenCreateCard(columnId);
  };

  const handleCardMove = (card: Card, toColumnId?: string) => {
    if (!toColumnId) return;
    setCards((prev) => moveCardToColumn(prev, card.id, toColumnId));
  };

  const handleInlineCreateCard = (title: string, columnId: string) => {
    const newCard = createCard({
      title,
      projectId: space.project.id,
      projectKey: space.project.key,
      columnId,
      cardIndex: cards.length + 1,
      order: cards.filter((c) => c.columnId === columnId).length,
    });
    setCards((prev) => [...prev, newCard]);
    setSelectedCard(newCard);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleConfirmCreateCard();
  };

  const handleCardTitleChange = (text: string) => {
    const { title, error } = processCardTitleChange(text);
    setNewCardTitle(title);
    if (cardTitleError && !error) setCardTitleError(undefined);
  };

  const handleCloseCardDetail = () => {
    setSelectedCard(null);
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
          boardTitle={`${space.project.name} Sprint Board`}
          projectKey={space.project.key}
          onCardPress={handleCardPress}
          onAddCardPress={handleAddCardPress}
          onCardMove={handleCardMove}
          onCreateCard={handleInlineCreateCard}
        />
      </section>

      {/* Quick Create Card Dialog */}
      <Modal
        visible={isCreateCardOpen}
        onClose={handleCloseCreateModal}
        title="Create Card"
        subtitle={
          targetColumnId
            ? `${space.project.key} · ${columns.find((c) => c.id === targetColumnId)?.title || targetColumnId}`
            : space.project.key
        }
        presentation="dialog"
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button
              label="Cancel"
              variant="secondary"
              size="sm"
              onPress={handleCloseCreateModal}
            />
            <Button
              label="Create Card"
              variant="primary"
              size="sm"
              disabled={!newCardTitle.trim()}
              onPress={handleConfirmCreateCard}
            />
          </div>
        }
      >
        <form
          onSubmit={handleFormSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <Input
            label="Card name"
            placeholder="e.g. Implement user authentication"
            value={newCardTitle}
            onChangeText={handleCardTitleChange}
            error={cardTitleError}
            autoFocus
            containerStyle={{ marginBottom: 0 }}
          />
        </form>
      </Modal>

      {/* Card Detail Modal */}
      <CardDetail
        visible={Boolean(selectedCard)}
        card={selectedCard}
        columns={columns}
        users={mockUsers}
        comments={mockComments}
        activityLogs={mockActivityLogs}
        currentUserId={mockCurrentUser.id}
        onClose={handleCloseCardDetail}
        onAddStatus={handleAddStatus}
        onSave={handleSaveCardDetail}
        onDelete={handleDeleteCard}
      />
    </div>
  );
}

export default SpaceDetailPage;
