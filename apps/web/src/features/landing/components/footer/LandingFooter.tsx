import type { CSSProperties, FC } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '../../../../routes/paths';
import styles from './LandingFooter.module.css';

export interface FooterLink {
  /** Link label */
  label: string;
  /** Destination href (anchor for placeholder marketing links) */
  href: string;
}

export interface FooterColumn {
  /** Column heading */
  title: string;
  /** Column links */
  links: FooterLink[];
}

export interface LandingFooterProps {
  /** Whether the current visitor is authenticated (logged in). */
  isAuthenticated?: boolean;
  /** Container style override. */
  style?: CSSProperties;
  /** Additional CSS class. */
  className?: string;
  /** Test identifier. */
  testID?: string;
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Docs', href: '#docs' },
      { label: 'Changelog', href: '#changelog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Careers', href: '#careers' },
      { label: 'Blog', href: '#blog' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help Center', href: '#help' },
      { label: 'API Docs', href: '#api' },
      { label: 'Status', href: '#status' },
      { label: 'Community', href: '#community' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms', href: '#terms' },
      { label: 'Privacy', href: '#privacy' },
      { label: 'Security', href: '#security' },
    ],
  },
];

/**
 * LandingFooter — the landing page footer.
 * Brand block + four link columns + a bottom bar whose links/CTAs adjust
 * to the visitor's auth state (guest → Log in / Sign up, signed in → Open App).
 *
 * Styled entirely with Fieldnotes design tokens so it adapts to
 * `[data-theme='dark']` automatically.
 */
export const LandingFooter: FC<LandingFooterProps> = ({
  isAuthenticated = false,
  style,
  className = '',
  testID,
}) => {
  const year = new Date().getFullYear();

  return (
    <footer
      className={`${styles.footer} ${className}`}
      style={style}
      data-testid={testID}
      aria-label="Landing page footer"
    >
      <div className={styles.container}>
        <div className={styles.topSection}>
          {/* Brand Block */}
          <div className={styles.brand}>
            <div className={styles.brandLogo} aria-hidden="true">
              J
            </div>
            <div className={styles.brandText}>
              <p className={styles.brandName}>Jira Clone</p>
              <p className={styles.tagline}>
                Plan, track, and ship work your team loves.
              </p>
            </div>
          </div>

          {/* Link Columns */}
          <nav className={styles.columns} aria-label="Footer navigation">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title} className={styles.column}>
                <h3 className={styles.columnTitle}>{column.title}</h3>
                <ul className={styles.linkList}>
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a className={styles.link} href={link.href}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {year} Jira Clone. All rights reserved.
          </p>

          {isAuthenticated ? (
            <Link to={ROUTES.PROTECTED.HOME} className={styles.accentLink}>
              Open App
            </Link>
          ) : (
            <div className={styles.bottomLinks}>
              <Link to={ROUTES.AUTH.SIGN_IN} className={styles.link}>
                Log in
              </Link>
              <Link to={ROUTES.AUTH.SIGN_UP} className={styles.accentLink}>
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
