import type { CSSProperties, FC, ReactNode } from 'react';
import styles from './FeaturesOverview.module.css';

// ============================================================================
// ICONS — inline, theme-aware (inherit currentColor from the badge)
// ============================================================================

interface IconProps {
  size?: number;
}

const KanbanIcon: FC<IconProps> = ({ size = 20 }) => (
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
    <rect x="3" y="4" width="5.5" height="16" rx="1" />
    <rect x="9.25" y="4" width="5.5" height="16" rx="1" />
    <rect x="15.5" y="4" width="5.5" height="16" rx="1" />
  </svg>
);

const TeamIcon: FC<IconProps> = ({ size = 20 }) => (
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
    <circle cx="7" cy="13" r="5.5" />
    <circle cx="12" cy="13" r="5.5" />
    <circle cx="17" cy="13" r="5.5" />
  </svg>
);

const PulseIcon: FC<IconProps> = ({ size = 20 }) => (
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
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const ShieldIcon: FC<IconProps> = ({ size = 20 }) => (
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
    <path d="M12 3 L20 7 L20 17 L12 21 L4 17 L4 7 Z" />
    <polyline points="9 18 13 10 17 18" />
  </svg>
);

const BoltIcon: FC<IconProps> = ({ size = 20 }) => (
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
    <polyline points="10 3 15 7 9 11 15 15 9 19 14 23" />
  </svg>
);

const CheckIcon: FC<IconProps> = ({ size = 20 }) => (
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
    <circle cx="12" cy="12" r="9" />
    <polyline points="8 17 12 8 16 17" />
  </svg>
);

const CommentIcon: FC<IconProps> = ({ size = 20 }) => (
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
    <rect x="3" y="4" width="18" height="13" rx="3" />
    <polyline points="6 17 10 21" />
  </svg>
);

const GridIcon: FC<IconProps> = ({ size = 20 }) => (
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
    <rect x="3" y="4" width="8" height="8" rx="1" />
    <rect x="13" y="4" width="8" height="8" rx="1" />
    <rect x="3" y="13" width="8" height="8" rx="1" />
    <rect x="13" y="13" width="8" height="8" rx="1" />
  </svg>
);
// ============================================================================
// Types & Default Content
// ============================================================================

export interface FeatureItem {
  /** Feature title */
  title: string;
  /** Feature description */
  description: string;
  /** Optional custom icon element (rendered inside the accent badge) */
  icon?: ReactNode;
}

export interface FeaturesOverviewProps {
  /** Whether the current visitor is authenticated (logged in). */
  isAuthenticated?: boolean;
  /** Custom feature list — overrides the built-in guest / signed-in sets. */
  features?: FeatureItem[];
  /** Custom section title (overrides the auth-state default). */
  title?: string;
  /** Custom section subtitle (overrides the auth-state default). */
  subtitle?: string;
  /** Container style override. */
  style?: CSSProperties;
  /** Additional CSS class. */
  className?: string;
  /** Test identifier. */
  testID?: string;
}

const GUEST_FEATURES: FeatureItem[] = [
  {
    icon: <KanbanIcon />,
    title: 'Agile Kanban Boards',
    description:
      'Drag, prioritize, and manage sprint backlogs with real-time status transitions.',
  },
  {
    icon: <TeamIcon />,
    title: 'Team Spaces & Projects',
    description:
      'Organize roadmaps, team permissions, and cross-functional project spaces.',
  },
  {
    icon: <PulseIcon />,
    title: 'Activity & Notifications',
    description:
      'Stay synchronized with instant mentions, audit logs, and priority alert feeds.',
  },
  {
    icon: <ShieldIcon />,
    title: 'Card-level Permissions',
    description:
      'Enforce publisher vs. assignee rules for title edits, reassignments, and deletions.',
  },
  {
    icon: <BoltIcon />,
    title: 'Fast & Keyboard-first',
    description:
      'Move between boards, cards, and filters with your keyboard — no context switching.',
  },
  {
    icon: <CheckIcon />,
    title: 'Free to Start',
    description:
      'Get your whole team going free for 30 days. No credit card required, cancel anytime.',
  },
];

const AUTH_FEATURES: FeatureItem[] = [
  {
    icon: <KanbanIcon />,
    title: 'Your Boards',
    description:
      'Reopen any sprint board and move cards between columns in a single click.',
  },
  {
    icon: <TeamIcon />,
    title: 'Your Team',
    description:
      'Member avatars, roles, and assignments for everyone working in the space.',
  },
  {
    icon: <CommentIcon />,
    title: 'Card Details & Comments',
    description:
      'Discuss issues inline with comments, changelog, and a complete audit trail.',
  },
  {
    icon: <ShieldIcon />,
    title: 'Controlled Permissions',
    description:
      'Publisher, assignee, and viewer roles keep every edit accountable.',
  },
  {
    icon: <PulseIcon />,
    title: 'Activity Logs',
    description:
      'Watch status changes, reassignments, and work logs as they happen.',
  },
  {
    icon: <GridIcon />,
    title: 'Spaces You Use',
    description:
      'Search, filter, and page through every project workspace you belong to.',
  },
];
/**
 * FeaturesOverview — the landing page feature-highlight grid.
 *
 * Renders a different feature set based on the visitor's auth state:
 * - Guest:      marketing highlights (boards, spaces, permissions, speed...)
 * - Signed in:  workspace-oriented highlights (your boards, team, activity...)
 *
 * Styled entirely with Fieldnotes design tokens so it adapts to
 * `[data-theme='dark']` automatically.
 */
export const FeaturesOverview: FC<FeaturesOverviewProps> = ({
  isAuthenticated = false,
  features,
  title,
  subtitle,
  style,
  className = '',
  testID,
}) => {
  const resolvedFeatures = features ?? (isAuthenticated ? AUTH_FEATURES : GUEST_FEATURES);

  const resolvedTitle =
    title ??
    (isAuthenticated
      ? 'Everything you need to keep shipping'
      : 'Everything your team needs to ship');

  const resolvedSubtitle =
    subtitle ??
    (isAuthenticated
      ? 'Quick access to the boards, people, and activity in your workspace — right where you left off.'
      : 'Purpose-built blocks for planning, tracking, and shipping work — from a single sprint to a full program.');

  const eyebrow = isAuthenticated ? 'Your workspace' : 'Why teams choose Jira Clone';

  return (
    <section
      className={`${styles.section} ${className}`}
      style={style}
      data-testid={testID}
      aria-label="Feature highlights"
    >
      <header className={styles.heading}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2 className={styles.title}>{resolvedTitle}</h2>
        <p className={styles.subtitle}>{resolvedSubtitle}</p>
      </header>

      <ul className={styles.grid}>
        {resolvedFeatures.map((feature) => (
          <li key={feature.title} className={styles.card}>
            {feature.icon && (
              <div className={styles.iconBadge} aria-hidden="true">
                {feature.icon}
              </div>
            )}
            <h3 className={styles.cardTitle}>{feature.title}</h3>
            <p className={styles.cardDesc}>{feature.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default FeaturesOverview;
