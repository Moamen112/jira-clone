import { mockCurrentUser, mockCards, mockColumns, type Card } from '@jira-clone/shared';
import { useNavigate } from 'react-router';
import { ROUTES } from '../../routes/paths';
import { Button } from '../../components/base';
import { ProfilePhoto } from './components/profile-photo';
import styles from './ProfilePage.module.css';

// ============================================================================
// Mock-data helpers — replaced by real API queries once the backend lands.
// ============================================================================

function isAssignedToUser(card: Card, userId: string): boolean {
  return card.assigneeId === userId || Boolean(card.assigneeIds?.includes(userId));
}

function countCardsInProgress(cards: Card[]): number {
  const activeColumnIds = new Set(
    mockColumns
      .filter((column) => /progress|review/i.test(column.title))
      .map((column) => column.id)
  );
  return cards.filter((card) => activeColumnIds.has(card.columnId)).length;
}

export function ProfilePage() {
  // TODO(backend): replace the mock user with the real session returned by
  // the backend once the auth API is wired up.
  const user = mockCurrentUser;
  const navigate = useNavigate();

  const assignedCount = mockCards.filter((card) => isAssignedToUser(card, user.id)).length;
  const createdCount = mockCards.filter((card) => card.publisherId === user.id).length;
  const activeCount = countCardsInProgress(mockCards);

  return (
    <div className={styles.container}>
      <main className={styles.content}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Profile</h1>
          <p className={styles.subtitle}>Manage your account information, role settings, and preferences.</p>
        </div>

        <div className={styles.profileCard}>
          {/* Identity header */}
          <div className={styles.profileHeader}>
            <div className={styles.profileIdentity}>
              <ProfilePhoto user={user} />
              <div className={styles.identityText}>
                <h2 className={styles.profileName}>{user.name}</h2>
                <p className={styles.profileEmail}>{user.email}</p>
                <div className={styles.chips}>
                  <span className={styles.chip}>Frontend Tech Lead</span>
                  <span className={styles.chipMuted}>Staff</span>
                </div>
              </div>
            </div>

            {/* TODO(backend): clear the session via the auth API once wired up */}
            <Button
              label="Log out"
              variant="danger"
              size="sm"
              onPress={() => navigate(ROUTES.AUTH.SIGN_IN)}
            />
          </div>

          {/* Quick stats — derived from mock cards / columns */} 
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <p className={styles.statValue}>{assignedCount}</p>
              <p className={styles.statLabel}>Assigned to me</p>
              <p className={styles.statHint}>Cards in your queue</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statValue}>{createdCount}</p>
              <p className={styles.statLabel}>Created by me</p>
              <p className={styles.statHint}>Issues you reported</p>
            </div>
            <div className={styles.statCard}>
              <p className={styles.statValue}>{activeCount}</p>
              <p className={styles.statLabel}>In progress</p>
              <p className={styles.statHint}>Moving through the board</p>
            </div>
          </div>

          {/* Account details */}
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Role</span>
              <span className={styles.detailValue}>Frontend Tech Lead</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Default Workspace</span>
              <span className={styles.detailValue}>Fieldnotes Core (FIELD)</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Timezone</span>
              <span className={styles.detailValue}>UTC-05:00 Eastern Time</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Member Since</span>
              <span className={styles.detailValue}>September 2026</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>User ID</span>
              <span className={styles.monoValue}>{user.id}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
