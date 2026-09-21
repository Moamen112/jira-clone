import type { CSSProperties, FC } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '../../../../routes/paths';
import styles from './CtaSection.module.css';

export interface CtaSectionProps {
  /** Whether the current visitor is authenticated (logged in). */
  isAuthenticated?: boolean;
  /** Display name of the authenticated user — personalizes the heading. */
  userName?: string;
  /** Container style override. */
  style?: CSSProperties;
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

const CheckIcon: FC<{ size?: number }> = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const CtaSection: FC<CtaSectionProps> = ({
  isAuthenticated = false,
  userName,
  style,
}) => {
  const displayName = userName?.trim();

  const heading = isAuthenticated
    ? displayName
      ? `Welcome back, ${displayName}!`
      : 'Ready to continue shipping?'
    : 'Ready to modernize your team workflow?';

  const subtitle = isAuthenticated
    ? 'Your sprint boards, assigned cards, and team updates are waiting. Jump in and keep the momentum going.'
    : 'Join agile engineering squads shipping faster with high-performance Kanban boards, card inspection, and live audit trails.';

  return (
    <section className={styles.section} style={style} aria-label="Call to action">
      <div className={styles.card}>
        <span className={styles.eyebrow}>
          {isAuthenticated ? 'Workspace Connected' : 'Get Started in Seconds'}
        </span>

        <h2 className={styles.title}>{heading}</h2>
        <p className={styles.subtitle}>{subtitle}</p>

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
              <span>Log In to Get Started</span>
              <ArrowRightIcon size={16} />
            </Link>
          )}
        </div>

        <div className={styles.trustBadges}>
          <div className={styles.trustItem}>
            <span className={styles.checkIcon}>
              <CheckIcon size={12} />
            </span>
            <span>Free 30-day trial</span>
          </div>
          <div className={styles.trustItem}>
            <span className={styles.checkIcon}>
              <CheckIcon size={12} />
            </span>
            <span>No credit card required</span>
          </div>
          <div className={styles.trustItem}>
            <span className={styles.checkIcon}>
              <CheckIcon size={12} />
            </span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
