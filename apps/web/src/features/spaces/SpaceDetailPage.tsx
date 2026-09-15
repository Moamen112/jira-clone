import { useState } from 'react';
import type { FC } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ProjectHeader } from '../../components/shared/project-header';
import { Board } from '../../components/shared/board';
import { CardDetail } from '../../components/shared/card-detail';
import {
  mockSpaces,
  mockColumns,
  mockCards,
  mockUsers,
  mockComments,
  mockActivityLogs,
  mockCurrentUser,
  type Card,
} from '@jira-clone/shared';
import { ROUTES } from '../../routes/paths';
import styles from './SpaceDetailPage.module.css';

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

  const space =
    mockSpaces.find(
      (s) => s.project.id === id || s.project.key.toLowerCase() === id?.toLowerCase()
    ) ?? mockSpaces[0];

  return (
    <div className={styles.container}>
      {/* Back button */}
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

      {/* Space / Project Header */}
      <section className={styles.headerSection}>
        <ProjectHeader
          project={space.project}
          members={space.members}
          category={space.category}
          actionLabel="Project Settings"
          onAction={() => navigate(ROUTES.PROTECTED.PROFILE)}
        />
      </section>

      {/* Project Board View */}
      <section className={styles.boardSection}>
        <Board
          columns={mockColumns}
          cards={mockCards}
          users={mockUsers}
          currentUserId={mockCurrentUser.id}
          boardTitle={`${space.project.name} Sprint Board`}
          projectKey={space.project.key}
          onCardPress={(card) => setSelectedCard(card)}
        />
      </section>

      {/* Card Detail Modal */}
      <CardDetail
        visible={Boolean(selectedCard)}
        card={selectedCard}
        columns={mockColumns}
        users={mockUsers}
        comments={mockComments}
        activityLogs={mockActivityLogs}
        currentUserId={mockCurrentUser.id}
        onClose={() => setSelectedCard(null)}
        onSave={(updated) => {
          setSelectedCard(updated);
        }}
      />
    </div>
  );
}

export default SpaceDetailPage;
