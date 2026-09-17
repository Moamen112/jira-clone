import { useState } from "react";
import type { FC } from "react";
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

  const handleOpenCreateCard = (columnId?: string) => {
    setTargetColumnId(columnId || null);
    setNewCardTitle("");
    setCardTitleError(undefined);
    setIsCreateCardOpen(true);
  };

  const handleConfirmCreateCard = () => {
    const trimmed = newCardTitle.trim();
    if (!trimmed) {
      setCardTitleError("Card name cannot be empty.");
      return;
    }

    const chosenColumnId = targetColumnId || columns[0]?.id || "col-todo";
    const newCard: Card = {
      id: `card-${Date.now()}`,
      key: `${space.project.key}-${cards.length + 1}`,
      title: trimmed,
      projectId: space.project.id,
      columnId: chosenColumnId,
      publisherId: mockCurrentUser.id,
      priority: "medium",
      order: cards.filter((c) => c.columnId === chosenColumnId).length,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

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

  return (
    <div className={styles.container}>
      {/* Top action bar: Back button & Theme toggle */}
      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate(ROUTES.PROTECTED.SPACES)}
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
          onCreateCard={() => handleOpenCreateCard()}
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
          onCardPress={(card) => setSelectedCard(card)}
          onAddCardPress={(columnId) => handleOpenCreateCard(columnId)}
          onCardMove={(card, toColumnId) => {
            if (!toColumnId) return;
            setCards((prev) =>
              prev.map((c) =>
                c.id === card.id
                  ? {
                      ...c,
                      columnId: toColumnId,
                      updatedAt: new Date().toISOString(),
                    }
                  : c,
              ),
            );
          }}
          onCreateCard={(title, columnId) => {
            const newCard: Card = {
              id: `card-${Date.now()}`,
              key: `${space.project.key}-${cards.length + 1}`,
              title: title.trim(),
              projectId: space.project.id,
              columnId,
              publisherId: mockCurrentUser.id,
              priority: "medium",
              order: cards.filter((c) => c.columnId === columnId).length,
              commentCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setCards((prev) => [...prev, newCard]);
            setSelectedCard(newCard);
          }}
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
          onSubmit={(e) => {
            e.preventDefault();
            handleConfirmCreateCard();
          }}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <Input
            label="Card name"
            placeholder="e.g. Implement user authentication"
            value={newCardTitle}
            onChangeText={(text) => {
              setNewCardTitle(text);
              if (cardTitleError) setCardTitleError(undefined);
            }}
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
        onClose={() => setSelectedCard(null)}
        onAddStatus={(newCol) => setColumns((prev) => [...prev, newCol])}
        onSave={(updated) => {
          setCards((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c)),
          );
          setSelectedCard(updated);
        }}
        onDelete={(cardId) => {
          setCards((prev) => prev.filter((c) => c.id !== cardId));
          setSelectedCard(null);
        }}
      />
    </div>
  );
}

export default SpaceDetailPage;
