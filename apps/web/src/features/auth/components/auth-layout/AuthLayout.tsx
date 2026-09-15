import type { CSSProperties, FC, ReactNode } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '../../../../routes/paths';
import styles from './AuthLayout.module.css';

export interface AuthFeature {
  /** Feature bullet title */
  title: string;
  /** Feature bullet description */
  description: string;
}

export interface AuthLayoutProps {
  /** Card heading (e.g. "Welcome back") */
  title: string;
  /** Card subtitle (e.g. "Enter your credentials to access your account") */
  subtitle?: string;
  /** The form(s) rendered inside the card */
  children: ReactNode;
  /** Footer content below the card body (e.g. an account mode-switch link) */
  footer?: ReactNode;
  /** Brand panel heading override */
  panelTitle?: string;
  /** Brand panel copy override */
  panelText?: string;
  /** Brand panel feature bullets (defaults to a built-in set) */
  features?: AuthFeature[];
  /** Container style override. */
  style?: CSSProperties;
  /** Additional CSS class. */
  className?: string;
  /** Test identifier. */
  testID?: string;
}

const DEFAULT_FEATURES: AuthFeature[] = [
  {
    title: 'Agile boards & sprints',
    description: 'Move cards, track backlog, and stay aligned from planning to release.',
  },
  {
    title: 'Team spaces & permissions',
    description: 'Projects, roles, and member controls that scale with your org.',
  },
  {
    title: 'Real-time activity',
    description: 'Comments, mentions, and audit logs — everything in one feed.',
  },
];

/**
 * AuthLayout — shared shell for the auth pages (sign-in / sign-up).
 *
 * Renders a split-screen layout:
 * - Left:  brand panel — logo, tagline, and feature highlights
 * - Right: form card — title/subtitle, the form (children), and an optional
 *          footer action (e.g. the "Don't have an account? Sign up" switch)
 *
 * Styled entirely with Fieldnotes design tokens so it adapts to
 * `[data-theme='dark']` automatically. On narrow screens the brand panel
 * is hidden and the form card centers on its own.
 */
export const AuthLayout: FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  footer,
  panelTitle = 'Plan, track, and ship work your team loves.',
  panelText = 'Jira Clone brings agile boards, project spaces, and real-time collaboration to one place for your whole team.',
  features = DEFAULT_FEATURES,
  style,
  className = '',
  testID,
}) => {
  return (
    <div
      className={`${styles.container} ${className}`}
      style={style}
      data-testid={testID}
    >
      <div className={styles.split}>
        {/* Brand / Marketing Panel */}
        <aside className={styles.brandPanel}>
          <Link to={ROUTES.LANDING} className={styles.brandLink} aria-label="Back to landing page">
            <div className={styles.brandLogo} aria-hidden="true">
              J
            </div>
            <span className={styles.brandName}>Jira Clone</span>
          </Link>

          <div className={styles.panelBody}>
            <h2 className={styles.panelTitle}>{panelTitle}</h2>
            <p className={styles.panelText}>{panelText}</p>

            <ul className={styles.featureList}>
              {features.map((feature) => (
                <li key={feature.title} className={styles.featureItem}>
                  <span className={styles.checkIcon} aria-hidden="true">
                    ✓
                  </span>
                  <div className={styles.featureText}>
                    <p className={styles.featureTitle}>{feature.title}</p>
                    <p className={styles.featureDesc}>{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Form Card */}
        <main className={styles.card}>
          <div className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>{title}</h1>
            {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
          </div>

          <div className={styles.cardBody}>{children}</div>

          {footer && <div className={styles.cardFooter}>{footer}</div>}
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;
