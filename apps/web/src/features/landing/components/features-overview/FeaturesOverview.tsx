import type { CSSProperties, FC, ReactNode } from 'react';
import styles from './FeaturesOverview.module.css';

// ============================================================================
// ICONS
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
// Types & Content
// ============================================================================

export interface FeatureItem {
  title: string;
  category: string;
  description: string;
  icon?: ReactNode;
}

export interface FeaturesOverviewProps {
  isAuthenticated?: boolean;
  features?: FeatureItem[];
  title?: string;
  subtitle?: string;
  style?: CSSProperties;
  className?: string;
  testID?: string;
}

const GUEST_FEATURES: FeatureItem[] = [
  {
    category: 'WORKFLOW',
    icon: <KanbanIcon />,
    title: 'Agile Kanban Boards',
    description:
      'Drag, prioritize, and manage sprint backlogs with customizable columns and real-time status transitions.',
  },
  {
    category: 'COLLABORATION',
    icon: <TeamIcon />,
    title: 'Team Spaces & Projects',
    description:
      'Organize roadmaps, team member permissions, and project workspaces with visual completion metrics.',
  },
  {
    category: 'REAL-TIME AUDIT',
    icon: <PulseIcon />,
    title: 'Audit Logs & Timeline',
    description:
      'Stay in sync with instant changelogs, status movement tracking, and complete activity history on every card.',
  },
  {
    category: 'GOVERNANCE',
    icon: <ShieldIcon />,
    title: 'Role-Based Permissions',
    description:
      'Enforce granular publisher vs. assignee permissions for issue edits, reassignments, and column transitions.',
  },
  {
    category: 'EFFICIENCY',
    icon: <BoltIcon />,
    title: 'Keyboard-First Speed',
    description:
      'Move swiftly between boards, issues, and filters with fluid interactions and sub-50ms render latency.',
  },
  {
    category: 'ZERO CONFIG',
    icon: <CheckIcon />,
    title: 'Native Light & Dark Mode',
    description:
      'Beautiful tokenized design built to adapt seamlessly to your operating system theme preference.',
  },
];

const AUTH_FEATURES: FeatureItem[] = [
  {
    category: 'BOARDS',
    icon: <KanbanIcon />,
    title: 'Sprint Boards',
    description:
      'Reopen any active project board and transition cards between columns with zero friction.',
  },
  {
    category: 'TEAMS',
    icon: <TeamIcon />,
    title: 'Workspace Members',
    description:
      'Member avatars, roles, and assignments for everyone collaborating across your projects.',
  },
  {
    category: 'DISCUSSIONS',
    icon: <CommentIcon />,
    title: 'Card Details & Notes',
    description:
      'Inspect cards, log time, comment on issues, and review full timestamped audit trails.',
  },
  {
    category: 'SECURITY',
    icon: <ShieldIcon />,
    title: 'Controlled Access',
    description:
      'Publisher, assignee, and viewer roles keep every card modification accountable and transparent.',
  },
  {
    category: 'HISTORY',
    icon: <PulseIcon />,
    title: 'Activity Feed',
    description:
      'Watch status transitions, reassignments, and work logs stream in as they happen.',
  },
  {
    category: 'SPACES',
    icon: <GridIcon />,
    title: 'Multi-Space Directory',
    description:
      'Search, filter, and access all team workspaces and project backlogs from one central place.',
  },
];

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
      : 'Engineered for modern agile engineering teams');

  const resolvedSubtitle =
    subtitle ??
    (isAuthenticated
      ? 'Quick access to the boards, teammates, and activity in your workspace — right where you left off.'
      : 'Purpose-built blocks for planning, tracking, and shipping work — from a single sprint to enterprise program roadmaps.');

  const eyebrow = isAuthenticated ? 'Your Workspace Capabilities' : 'Why Teams Choose Jira Clone';

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
            <div className={styles.cardTop}>
              {feature.icon && (
                <div className={styles.iconBadge} aria-hidden="true">
                  {feature.icon}
                </div>
              )}
              <span className={styles.categoryBadge}>{feature.category}</span>
            </div>
            <h3 className={styles.cardTitle}>{feature.title}</h3>
            <p className={styles.cardDesc}>{feature.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default FeaturesOverview;
