import { Link } from 'react-router';
import styles from './LandingPage.module.css';
import { ROUTES } from '../../routes/paths';

export function LandingPage() {
  return (
    <div className={styles.container}>
      <main className={styles.hero}>
        <span className={styles.badge}>Next-Gen Project Management</span>
        <h1 className={styles.title}>
          Streamline your development workflows from sprint to release.
        </h1>
        <p className={styles.subtitle}>
          Fast, keyboard-friendly issue tracking, agile boards, and real-time team collaboration designed for modern product teams.
        </p>
        <div className={styles.ctaGroup}>
          <Link to={ROUTES.AUTH.SIGN_UP} className={styles.primaryBtn}>
            Start Free Trial
          </Link>
          <Link to={ROUTES.PROTECTED.HOME} className={styles.secondaryBtn}>
            Open Home Dashboard →
          </Link>
        </div>
      </main>

      <section className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Agile Kanban Boards</h2>
          <p className={styles.cardDesc}>
            Drag, prioritize, and manage sprint backlogs with real-time status transitions.
          </p>
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Team Spaces &amp; Projects</h2>
          <p className={styles.cardDesc}>
            Organize roadmaps, team permissions, and cross-functional project spaces.
          </p>
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Activity &amp; Notifications</h2>
          <p className={styles.cardDesc}>
            Stay synchronized with instant mentions, audit logs, and priority alert feeds.
          </p>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
