import { useState, useMemo } from 'react';
import type { CSSProperties, FC } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '../../../../routes/paths';
import { Avatar } from '../../../../components/shared/avatar';
import styles from './HeroSection.module.css';

export interface HeroSectionProps {
  /** Whether the current visitor is authenticated (logged in). */
  isAuthenticated?: boolean;
  /** Display name of the authenticated user — shown in the eyebrow. */
  userName?: string;
  /** Container style override. */
  style?: CSSProperties;
  /** Additional CSS class. */
  className?: string;
  /** Test identifier. */
  testID?: string;
}

interface MockHeroCard {
  id: string;
  key: string;
  title: string;
  column: 'todo' | 'in_progress' | 'done';
  priority: 'urgent' | 'high' | 'medium';
  points: number;
  assigneeName: string;
  isMine: boolean;
  type: 'feature' | 'bug' | 'task';
}

const MOCK_CARDS: MockHeroCard[] = [
  {
    id: 'c1',
    key: 'SPRINT-102',
    title: 'Optimistic UI card drag and status updates',
    column: 'in_progress',
    priority: 'urgent',
    points: 8,
    assigneeName: 'Alex Morgan',
    isMine: true,
    type: 'feature',
  },
  {
    id: 'c2',
    key: 'SPRINT-103',
    title: 'Audit WCAG 2.1 AA keyboard accessibility',
    column: 'in_progress',
    priority: 'medium',
    points: 3,
    assigneeName: 'Sarah Connor',
    isMine: false,
    type: 'task',
  },
  {
    id: 'c3',
    key: 'SPRINT-104',
    title: 'Design token color system & dark theme spec',
    column: 'todo',
    priority: 'high',
    points: 5,
    assigneeName: 'Alex Morgan',
    isMine: true,
    type: 'task',
  },
  {
    id: 'c4',
    key: 'SPRINT-105',
    title: 'Fix optimistic cache invalidation on card drag',
    column: 'todo',
    priority: 'urgent',
    points: 5,
    assigneeName: 'David Kim',
    isMine: false,
    type: 'bug',
  },
  {
    id: 'c5',
    key: 'SPRINT-101',
    title: 'Secure JWT refresh flow & CSRF protection',
    column: 'done',
    priority: 'high',
    points: 5,
    assigneeName: 'David Kim',
    isMine: false,
    type: 'feature',
  },
];

/* ==========================================================================
   ICONS
   ========================================================================== */

const ArrowRightIcon: FC<{ size?: number }> = ({ size = 16 }) => (
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
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const SparkleIcon: FC<{ size?: number }> = ({ size = 13 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    aria-hidden="true"
  >
    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z" />
  </svg>
);

const BoltIcon: FC<{ size?: number }> = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    aria-hidden="true"
  >
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

export const HeroSection: FC<HeroSectionProps> = ({
  isAuthenticated = false,
  userName,
  style,
  className = '',
  testID,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'mine' | 'urgent'>('all');

  const displayName = userName?.trim();

  const eyebrow = isAuthenticated
    ? displayName
      ? `Signed in as ${displayName}`
      : 'Workspace Active'
    : 'Modern Agile Issue Tracker';

  const title = isAuthenticated
    ? 'Welcome back to your agile command center.'
    : 'Plan sprints. Track velocity. Ship software faster.';

  const subtitle = isAuthenticated
    ? 'Jump straight into your active boards, track team progress seamlessly, and organize issues with precision.'
    : 'Fast, keyboard-driven issue tracking, interactive Kanban boards, and clean project spaces engineered for high-velocity software squads.';

  // Interactive filtering of mock showcase cards
  const filteredCards = useMemo(() => {
    return MOCK_CARDS.filter((card) => {
      if (activeFilter === 'mine') return card.isMine;
      if (activeFilter === 'urgent') return card.priority === 'urgent' || card.priority === 'high';
      return true;
    });
  }, [activeFilter]);

  const todoCards = filteredCards.filter((c) => c.column === 'todo');
  const progressCards = filteredCards.filter((c) => c.column === 'in_progress');
  const doneCards = filteredCards.filter((c) => c.column === 'done');

  return (
    <section
      className={`${styles.section} ${className}`}
      style={style}
      data-testid={testID}
      aria-label="Hero"
    >
      {/* Background ambient lighting */}
      <div className={styles.glowTop} aria-hidden="true" />

      {/* Top Eyebrow Badge */}
      <div className={styles.eyebrowWrap}>
        <span className={styles.eyebrow}>
          <span className={styles.pulseDot} />
          {eyebrow}
        </span>
      </div>

      {/* Main Hero Headline */}
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>{subtitle}</p>

      {/* Action Buttons */}
      <div className={styles.actions}>
        {isAuthenticated ? (
          <>
            <Link to={ROUTES.PROTECTED.HOME} className={styles.primaryBtn}>
              <span>Open Home Dashboard</span>
              <ArrowRightIcon size={16} />
            </Link>
            <Link to={ROUTES.PROTECTED.SPACES} className={styles.secondaryBtn}>
              Browse Spaces
            </Link>
          </>
        ) : (
          <>
            <Link to={ROUTES.AUTH.SIGN_UP} className={styles.primaryBtn}>
              <span>Start Free — Instant Access</span>
              <ArrowRightIcon size={16} />
            </Link>
            <Link to={ROUTES.AUTH.SIGN_IN} className={styles.secondaryBtn}>
              <span>Sign In</span>
            </Link>
          </>
        )}
      </div>

      {/* Interactive Kanban Board Product Showcase */}
      <div className={styles.previewContainer}>
        {/* Glow halo behind board */}
        <div className={styles.boardGlow} aria-hidden="true" />

        <div className={styles.previewWindow}>
          {/* Window Top Controls Bar */}
          <div className={styles.windowHeader}>
            <div className={styles.trafficLights}>
              <span className={`${styles.lightDot} ${styles.lightRed}`} />
              <span className={`${styles.lightDot} ${styles.lightYellow}`} />
              <span className={`${styles.lightDot} ${styles.lightGreen}`} />
            </div>

            <div className={styles.windowMeta}>
              <span className={styles.spaceBadge}>CORE</span>
              <span className={styles.spaceName}>Sprint 24 &bull; Active Board</span>
            </div>

            {/* Interactive Filter Pills */}
            <div className={styles.boardFilters}>
              <button
                type="button"
                className={`${styles.filterChip} ${activeFilter === 'all' ? styles.filterChipActive : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All ({MOCK_CARDS.length})
              </button>
              <button
                type="button"
                className={`${styles.filterChip} ${activeFilter === 'mine' ? styles.filterChipActive : ''}`}
                onClick={() => setActiveFilter('mine')}
              >
                Assigned to Me
              </button>
              <button
                type="button"
                className={`${styles.filterChip} ${activeFilter === 'urgent' ? styles.filterChipActive : ''}`}
                onClick={() => setActiveFilter('urgent')}
              >
                High Priority
              </button>
            </div>
          </div>

          {/* Kanban Columns Grid */}
          <div className={styles.boardGrid}>
            {/* Column 1: To Do */}
            <div className={styles.boardColumn}>
              <div className={styles.columnHeader}>
                <div className={styles.columnHeaderLeft}>
                  <span className={`${styles.statusPill} ${styles.statusTodo}`} />
                  <span className={styles.columnTitle}>TO DO</span>
                </div>
                <span className={styles.columnCount}>{todoCards.length}</span>
              </div>
              <div className={styles.columnCards}>
                {todoCards.map((card) => (
                  <div key={card.id} className={styles.kanbanCard}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cardKey}>{card.key}</span>
                      <span className={`${styles.priorityBadge} ${styles[card.priority]}`}>
                        {card.priority}
                      </span>
                    </div>
                    <p className={styles.cardTitle}>{card.title}</p>
                    <div className={styles.cardFooter}>
                      <span className={styles.pointsBadge}>{card.points} pts</span>
                      <div className={styles.assigneeWrap}>
                        <Avatar name={card.assigneeName} size="xs" />
                        <span className={styles.assigneeName}>{card.assigneeName.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {todoCards.length === 0 && (
                  <div className={styles.emptyFilterState}>No cards match filter</div>
                )}
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div className={styles.boardColumn}>
              <div className={styles.columnHeader}>
                <div className={styles.columnHeaderLeft}>
                  <span className={`${styles.statusPill} ${styles.statusProgress}`} />
                  <span className={styles.columnTitle}>IN PROGRESS</span>
                </div>
                <span className={styles.columnCount}>{progressCards.length}</span>
              </div>
              <div className={styles.columnCards}>
                {progressCards.map((card) => (
                  <div key={card.id} className={`${styles.kanbanCard} ${styles.cardActive}`}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cardKey}>{card.key}</span>
                      <span className={`${styles.priorityBadge} ${styles[card.priority]}`}>
                        {card.priority}
                      </span>
                    </div>
                    <p className={styles.cardTitle}>{card.title}</p>
                    <div className={styles.cardFooter}>
                      <span className={styles.pointsBadge}>{card.points} pts</span>
                      <div className={styles.assigneeWrap}>
                        <Avatar name={card.assigneeName} size="xs" />
                        <span className={styles.assigneeName}>{card.assigneeName.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {progressCards.length === 0 && (
                  <div className={styles.emptyFilterState}>No cards match filter</div>
                )}
              </div>
            </div>

            {/* Column 3: Done */}
            <div className={styles.boardColumn}>
              <div className={styles.columnHeader}>
                <div className={styles.columnHeaderLeft}>
                  <span className={`${styles.statusPill} ${styles.statusDone}`} />
                  <span className={styles.columnTitle}>DONE</span>
                </div>
                <span className={styles.columnCount}>{doneCards.length}</span>
              </div>
              <div className={styles.columnCards}>
                {doneCards.map((card) => (
                  <div key={card.id} className={styles.kanbanCard}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cardKey}>{card.key}</span>
                      <span className={`${styles.priorityBadge} ${styles[card.priority]}`}>
                        {card.priority}
                      </span>
                    </div>
                    <p className={`${styles.cardTitle} ${styles.cardTitleDone}`}>{card.title}</p>
                    <div className={styles.cardFooter}>
                      <span className={styles.pointsBadge}>{card.points} pts</span>
                      <div className={styles.assigneeWrap}>
                        <Avatar name={card.assigneeName} size="xs" />
                        <span className={styles.assigneeName}>{card.assigneeName.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {doneCards.length === 0 && (
                  <div className={styles.emptyFilterState}>No cards match filter</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Real-time Sync Toast */}
        <div className={styles.floatingSyncToast}>
          <div className={styles.liveIndicator}>
            <span className={styles.liveDot} />
            <BoltIcon size={12} />
          </div>
          <span className={styles.toastText}>
            <strong>Alex Morgan</strong> updated SPRINT-102 (just now)
          </span>
        </div>

      </div>

      {/* Credibility & Metrics Cards Strip */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricValue}>10,000+</span>
          <span className={styles.metricLabel}>Sprints Planned</span>
          <span className={styles.metricSub}>Across 1,200+ squads</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricValue}>&lt; 50ms</span>
          <span className={styles.metricLabel}>Interaction Latency</span>
          <span className={styles.metricSub}>Optimistic UI updates</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricValue}>99.9%</span>
          <span className={styles.metricLabel}>Cloud SLA Uptime</span>
          <span className={styles.metricSub}>Enterprise reliability</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.metricValue}>100%</span>
          <span className={styles.metricLabel}>Theme-Native</span>
          <span className={styles.metricSub}>Fluid Dark &amp; Light modes</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
