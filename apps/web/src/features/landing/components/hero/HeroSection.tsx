import type { CSSProperties, FC } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '../../../../routes/paths';
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

/**
 * HeroSection — the landing page hero banner (primary page heading).
 *
 * Renders different copy and actions based on the visitor's auth state:
 * - Guest:      marketing headline + "Start Free Trial" (→ sign-up) / "Log in"
 * - Signed in:  workspace headline + "Open Home Dashboard" (→ /home) / "Browse Spaces"
 *
 * Styled entirely with Fieldnotes design tokens so it adapts to
 * `[data-theme='dark']` automatically.
 */
export const HeroSection: FC<HeroSectionProps> = ({
  isAuthenticated = false,
  userName,
  style,
  className = '',
  testID,
}) => {
  const displayName = userName?.trim();

  const eyebrow = isAuthenticated
    ? displayName
      ? `Signed in as ${displayName}`
      : 'Workspace ready'
    : 'Next-Gen Project Management';

  const title = isAuthenticated
    ? 'Good to see you again.'
    : 'Streamline your development workflows from sprint to release.';

  const subtitle = isAuthenticated
    ? 'Your boards, spaces, and team activity are just a click away — jump back in and keep shipping.'
    : 'Fast, keyboard-friendly issue tracking, agile boards, and real-time team collaboration designed for modern product teams.';

  return (
    <section
      className={`${styles.section} ${className}`}
      style={style}
      data-testid={testID}
      aria-label="Hero"
    >
      <span className={styles.eyebrow}>{eyebrow}</span>

      <h1 className={styles.title}>{title}</h1>
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
    </section>
  );
};

export default HeroSection;
