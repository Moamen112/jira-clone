import type { CSSProperties, FC, ReactNode } from 'react';
import styles from './UnderDevelopment.module.css';

interface IconProps {
  size?: number;
}

const WarningIcon: FC<IconProps> = ({ size = 28 }) => (
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
    <polygon points="12 2 20 16 4 16" />
    <circle cx="12" cy="9" r="1.5" />
    <line x1="12" y1="13" x2="12" y2="16" />
  </svg>
);

export interface UnderDevelopmentProps {
  /** Banner heading (default: "This area is still under construction.") */
  title?: string;
  /** Supporting description rendered under the heading */
  description?: string;
  /** Custom icon element overriding the built-in warning glyph */
  icon?: ReactNode;
  /** Render the indeterminate progress bar (banner variant only, default: true) */
  showProgress?: boolean;
  /** Presentation: 'banner' (full panel) or 'compact' (pill badge) */
  variant?: 'banner' | 'compact';
  /** Container style override. */
  style?: CSSProperties;
  /** Additional CSS class. */
  className?: string;
  /** Test identifier. */
  testID?: string;
}

/**
 * UnderDevelopment — an animated "work in progress" notice.
 *
 * - `banner`:  a full-width panel with a bobbing warning icon, a pulsing
 *   `UNDER DEVELOPMENT` pill, heading/description, and an indeterminate
 *   accent progress bar.
 * - `compact`: a small pill with a pulsing dot — for inline placement.
 *
 * Animations are defined via token-friendly CSS keyframes and are disabled
 * automatically for users who prefer reduced motion.
 */
export const UnderDevelopment: FC<UnderDevelopmentProps> = ({
  title = 'This area is still under construction.',
  description = 'We are actively building this experience — the sample data below will be replaced with live updates once the backend is wired up.',
  icon,
  showProgress = true,
  variant = 'banner',
  style,
  className = '',
  testID,
}) => {
  if (variant === 'compact') {
    return (
      <span
        className={`${styles.compact} ${className}`}
        style={style}
        data-testid={testID}
      >
        <span className={styles.compactDot} aria-hidden="true" />
        Under development
      </span>
    );
  }

  return (
    <section
      className={`${styles.banner} ${className}`}
      style={style}
      data-testid={testID}
      aria-label="Under development"
    >
      <div className={styles.iconWrap} aria-hidden="true">
        {icon ?? <WarningIcon size={28} />}
      </div>

      <span className={styles.pill}>UNDER DEVELOPMENT</span>

      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>

      {showProgress && (
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-label="In progress"
        >
          <div className={styles.progressBar} />
        </div>
      )}
    </section>
  );
};

export default UnderDevelopment;