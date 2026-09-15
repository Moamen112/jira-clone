import type { CSSProperties, FC } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '../../../../routes/paths';
import styles from './CtaSection.module.css';

export interface CtaSectionProps {
  /** Whether the current visitor is authenticated (logged in). */
  isAuthenticated?: boolean;
  /** Display name of the authenticated user — personalizes the heading (e.g. "Welcome back, Alex!"). */
  userName?: string;
  /** Container style override. */
  style?: CSSProperties;
}

/**
 * CtaSection — the landing page call-to-action band.
 *
 * Renders different copy and actions based on the visitor's auth state:
 * - Guest:      "Start Free Trial" (→ sign-up) + "Log in" (→ sign-in)
 * - Signed in:  "Open Home Dashboard" (→ /home) + "Browse Spaces" (→ /spaces)
 *
 * Styled entirely with Fieldnotes design tokens so it adapts to
 * `[data-theme='dark']` automatically.
 */
export const CtaSection: FC<CtaSectionProps> = ({
  isAuthenticated = false,
  userName,
  style,
}) => {
  const displayName = userName?.trim();

  const heading = isAuthenticated
    ? displayName
      ? `Welcome back, ${displayName}!`
      : 'Welcome back!'
    : 'Ready to streamline your workflow?';

  const subtitle = isAuthenticated
    ? 'Your boards, issues, and team activity are waiting for you. Jump right in and pick up where you left off.'
    : 'Join modern product teams tracking sprints, issues, and releases — together, in one place.';

  const finePrint = isAuthenticated
    ? 'Your workspace is synced and ready.'
    : 'Free 30-day trial · No credit card required · Cancel anytime';

  return (
    <section
      className={styles.section}
      style={style}
      aria-label="Call to action"
    >
      <span className={styles.eyebrow}>
        {isAuthenticated ? 'Good to see you again' : 'Start shipping today'}
      </span>

      <h2 className={styles.title}>{heading}</h2>
      <p className={styles.subtitle}>{subtitle}</p>

      <div className={styles.actions}>
        {isAuthenticated ? (
          <>
            <Link to={ROUTES.PROTECTED.HOME} className={styles.primaryBtn}>
              Open Home Dashboard
            </Link>
            <Link to={ROUTES.PROTECTED.SPACES} className={styles.secondaryBtn}>
              Browse Spaces
            </Link>
          </>
        ) : (
          <>
            <Link to={ROUTES.AUTH.SIGN_UP} className={styles.primaryBtn}>
              Start Free Trial
            </Link>
            <Link to={ROUTES.AUTH.SIGN_IN} className={styles.secondaryBtn}>
              Log in
            </Link>
          </>
        )}
      </div>

      <p className={styles.finePrint}>{finePrint}</p>
    </section>
  );
};

export default CtaSection;
