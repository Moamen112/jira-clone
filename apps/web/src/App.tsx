import styles from './App.module.css';

export const App = () => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.statusHeader}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>System Online</span>
        </div>

        <h1 className={styles.title}>Welcome to Jira Clone! 👋</h1>
        <p className={styles.description}>
          The web application is successfully initialized and ready for testing. All design tokens,
          base components, and workspace links are active.
        </p>

        <div className={styles.statusBar}>
          <span className={styles.statusLabel}>Status:</span>
          <span className={styles.statusBadge}>Ready to Build</span>
        </div>
      </div>
    </div>
  );
};
