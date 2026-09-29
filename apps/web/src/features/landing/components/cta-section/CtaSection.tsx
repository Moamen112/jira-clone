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

export const CtaSection: FC<CtaSectionProps> = ({
  isAuthenticated = false,
  userName,
  style,
}) => {
  const displayName = userName?.trim();

  const heading = isAuthenticated
    ? displayName
      ? `Ready to jump back in, ${displayName}?`
      : 'Ready to continue shipping?'
    : 'Supercharge your team sprint velocity today.';

  const subtitle = isAuthenticated
    ? 'Your sprint boards, assigned cards, and live team activity logs are up to date. Pick up right where you left off.'
    : 'Experience lightning-fast Kanban boards, fluid backlog planning, and zero-friction collaboration designed for high-performance squads.';

  return (
    <section className={styles.section} style={style} aria-label="Call to action">
      <div className={styles.card}>
        {/* Ambient decorative glow backdrop */}
        <div className={styles.glowSpotlight} aria-hidden="true" />

        {/* Social proof team badges */}
        <div className={styles.socialProof}>
          <div className={styles.avatarStack} aria-hidden="true">
            <span className={`${styles.miniAvatar} ${styles.avatar1}`}>AK</span>
            <span className={`${styles.miniAvatar} ${styles.avatar2}`}>MR</span>
            <span className={`${styles.miniAvatar} ${styles.avatar3}`}>SL</span>
            <span className={`${styles.miniAvatar} ${styles.avatar4}`}>JD</span>
          </div>
          <span className={styles.socialProofText}>
            Loved by <strong>1,200+</strong> engineering squads
          </span>
        </div>

        {/* Eyebrow Pill */}
        <div className={styles.eyebrow}>
          <SparkleIcon size={12} />
          <span>{isAuthenticated ? 'Active Workspace' : 'Zero Setup Required'}</span>
        </div>

        {/* Main Headings */}
        <h2 className={styles.title}>{heading}</h2>
        <p className={styles.subtitle}>{subtitle}</p>

        {/* Primary & Secondary Actions */}
        <div className={styles.actions}>
          {isAuthenticated ? (
            <>
              <Link to={ROUTES.PROTECTED.HOME} className={styles.primaryBtn}>
                <span>Open Home Dashboard</span>
                <ArrowRightIcon size={16} />
              </Link>
              <Link to={ROUTES.PROTECTED.SPACES} className={styles.secondaryBtn}>
                Browse Project Spaces
              </Link>
            </>
          ) : (
            <>
              <Link to={ROUTES.AUTH.SIGN_UP} className={styles.primaryBtn}>
                <span>Start Free — Instant Access</span>
                <ArrowRightIcon size={16} />
              </Link>
              <Link to={ROUTES.AUTH.SIGN_IN} className={styles.secondaryBtn}>
                Sign In to Existing Workspace
              </Link>
            </>
          )}
        </div>

        {/* Trust Badges Strip */}
        <div className={styles.trustBadges}>
          <div className={styles.trustItem}>
            <span className={styles.checkIcon}>
              <CheckIcon size={13} />
            </span>
            <span>Free forever tier</span>
          </div>
          <span className={styles.bulletSeparator} aria-hidden="true">&bull;</span>
          <div className={styles.trustItem}>
            <span className={styles.checkIcon}>
              <CheckIcon size={13} />
            </span>
            <span>No credit card required</span>
          </div>
          <span className={styles.bulletSeparator} aria-hidden="true">&bull;</span>
          <div className={styles.trustItem}>
            <span className={styles.checkIcon}>
              <CheckIcon size={13} />
            </span>
            <span>Theme-native (Dark/Light)</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
