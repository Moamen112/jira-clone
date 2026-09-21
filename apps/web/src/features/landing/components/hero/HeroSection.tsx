import { useState } from 'react';
import type { CSSProperties, FC } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '../../../../routes/paths';
import { Badge } from '../../../../components/base';
import { PriorityBadge } from '../../../../components/shared/priority-badge';
import { StatusBar } from '../../../../components/shared/status-bar';
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

const SparkleIcon: FC<{ size?: number }> = ({ size = 14 }) => (
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

export const HeroSection: FC<HeroSectionProps> = ({
  isAuthenticated = false,
  userName,
  style,
  className = '',
  testID,
}) => {
  const [activeBoardFilter, setActiveBoardFilter] = useState<'all' | 'mine' | 'recent'>('all');

  const displayName = userName?.trim();

  const eyebrow = isAuthenticated
    ? displayName
      ? `Signed in as ${displayName}`
      : 'Workspace Ready'
    : '✦ Next-Gen Agile Project Tracker';

  const title = isAuthenticated
    ? 'Welcome back to your workspace.'
    : 'Plan sprints. Track issues. Ship world-class software.';

  const subtitle = isAuthenticated
    ? 'Jump back into your active sprint boards, view pending assignments, and collaborate with your team.'
    : 'Fast, keyboard-friendly issue tracking, real-time Kanban boards, and streamlined team collaboration designed for modern product squads.';

  return (
    <section
      className={`${styles.section} ${className}`}
      style={style}
      data-testid={testID}
      aria-label="Hero"
    >
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
          <Link to={ROUTES.AUTH.SIGN_IN} className={styles.primaryBtn}>
            <span>Log In to Workspace</span>
            <ArrowRightIcon size={16} />
          </Link>
        )}
      </div>

      {/* Interactive Kanban Board Product Showcase */}
      <div className={styles.previewContainer}>
        <div className={styles.previewWindow}>
          {/* Window Top Controls Bar */}
          <div className={styles.windowHeader}>
            <div className={styles.trafficLights}>
              <span className={`${styles.lightDot} ${styles.lightRed}`} />
              <span className={`${styles.lightDot} ${styles.lightYellow}`} />
              <span className={`${styles.lightDot} ${styles.lightGreen}`} />
            </div>

            <div className={styles.windowTitle}>
              <span className={styles.spaceName}>Fieldnotes Core Sprint</span>
              <span className={styles.versionTag}>v2.4 active</span>
            </div>

            <div className={styles.boardFilters}>
              <button
                type="button"
                className={`${styles.filterChip} ${activeBoardFilter === 'all' ? styles.filterChipActive : ''}`}
                onClick={() => setActiveBoardFilter('all')}
              >
                All Cards
              </button>
              <button
                type="button"
                className={`${styles.filterChip} ${activeBoardFilter === 'mine' ? styles.filterChipActive : ''}`}
                onClick={() => setActiveBoardFilter('mine')}
              >
                Assigned to Me
              </button>
            </div>
          </div>

          {/* Kanban Columns Showcase */}
          <div className={styles.boardGrid}>
            {/* Column 1: To Do */}
            <div className={styles.boardColumn}>
              <div className={styles.columnHeader}>
                <span className={styles.columnTitle}>TO DO</span>
                <span className={styles.columnCount}>1</span>
              </div>
              <div className={styles.columnCards}>
                <div className={styles.mockCard}>
                  <div className={styles.cardHeader}>
                    <Badge label="FIELD-3" variant="mono" size="sm" />
                    <PriorityBadge priority="medium" size="sm" showLabel={false} />
                  </div>
                  <p className={styles.cardTitle}>Audit accessibility &amp; keyboard navigation</p>
                  <div className={styles.cardFooter}>
                    <StatusBar status={{ id: 'col-todo', projectId: 'proj-1', title: 'To Do', order: 0 }} size="sm" />
                    <Avatar name="David Kim" size="xs" />
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div className={styles.boardColumn}>
              <div className={styles.columnHeader}>
                <span className={`${styles.columnTitle} ${styles.columnActive}`}>IN PROGRESS</span>
                <span className={styles.columnCount}>1</span>
              </div>
              <div className={styles.columnCards}>
                <div className={`${styles.mockCard} ${styles.mockCardHighlight}`}>
                  <div className={styles.cardHeader}>
                    <Badge label="FIELD-2" variant="mono" size="sm" />
                    <PriorityBadge priority="highest" size="sm" showLabel={false} />
                  </div>
                  <p className={styles.cardTitle}>Design card-level permission system</p>
                  <div className={styles.cardFooter}>
                    <StatusBar status={{ id: 'col-progress', projectId: 'proj-1', title: 'In Progress', order: 1 }} size="sm" />
                    <Avatar name="Alex Morgan" size="xs" />
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Done */}
            <div className={styles.boardColumn}>
              <div className={styles.columnHeader}>
                <span className={`${styles.columnTitle} ${styles.columnDone}`}>DONE</span>
                <span className={styles.columnCount}>1</span>
              </div>
              <div className={styles.columnCards}>
                <div className={styles.mockCard}>
                  <div className={styles.cardHeader}>
                    <Badge label="FIELD-1" variant="mono" size="sm" />
                    <PriorityBadge priority="high" size="sm" showLabel={false} />
                  </div>
                  <p className={styles.cardTitle}>Implement design tokens &amp; typography scale</p>
                  <div className={styles.cardFooter}>
                    <StatusBar status={{ id: 'col-done', projectId: 'proj-1', title: 'Done', order: 2 }} size="sm" />
                    <Avatar name="Sarah Connor" size="xs" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Accent Badge */}
        <div className={styles.floatingTag}>
          <SparkleIcon size={14} />
          <span>Real-time Kanban Sync</span>
        </div>
      </div>

      {/* Credibility & Metrics Strip */}
      <div className={styles.metricsStrip}>
        <div className={styles.metricItem}>
          <span className={styles.metricValue}>10,000+</span>
          <span className={styles.metricLabel}>Sprints Planned</span>
        </div>
        <div className={styles.metricDivider} />
        <div className={styles.metricItem}>
          <span className={styles.metricValue}>&lt; 50ms</span>
          <span className={styles.metricLabel}>Interaction Latency</span>
        </div>
        <div className={styles.metricDivider} />
        <div className={styles.metricItem}>
          <span className={styles.metricValue}>99.9%</span>
          <span className={styles.metricLabel}>Cloud Availability</span>
        </div>
        <div className={styles.metricDivider} />
        <div className={styles.metricItem}>
          <span className={styles.metricValue}>100%</span>
          <span className={styles.metricLabel}>Theme-Native (Dark/Light)</span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
