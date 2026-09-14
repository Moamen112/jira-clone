import styles from './HomePage.module.css';

export function HomePage() {
  return (
    <div className={styles.container}>
      <main className={styles.content}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Home Dashboard</h1>
          <p className={styles.subtitle}>Welcome back! Here is a summary of your active tasks and spaces.</p>
        </div>

        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <p className={styles.kpiLabel}>Assigned to You</p>
            <p className={styles.kpiValue}>4</p>
            <p className={styles.kpiDesc}>Open tasks requiring your review</p>
          </div>
          <div className={styles.kpiCard}>
            <p className={styles.kpiLabel}>Active Spaces</p>
            <p className={styles.kpiValue}>3</p>
            <p className={styles.kpiDesc}>Collaborative team workspaces</p>
          </div>
          <div className={styles.kpiCard}>
            <p className={styles.kpiLabel}>Unread Alerts</p>
            <p className={styles.kpiValue}>2</p>
            <p className={styles.kpiDesc}>Mentions and status updates</p>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Recent Activity &amp; Tasks</h2>
          <div className={styles.taskItem}>
            <div className={styles.taskInfo}>
              <span className={styles.badge}>FIELD-1</span>
              <p className={styles.taskText}>Implement design tokens and typography scale</p>
            </div>
            <span className={styles.taskStatus}>Done</span>
          </div>

          <div className={styles.taskItem}>
            <div className={styles.taskInfo}>
              <span className={styles.badge}>FIELD-2</span>
              <p className={styles.taskText}>Build shared Board and BoardColumn components</p>
            </div>
            <span className={styles.taskStatus}>In Progress</span>
          </div>

          <div className={styles.taskItem}>
            <div className={styles.taskInfo}>
              <span className={styles.badge}>FIELD-3</span>
              <p className={styles.taskText}>Audit accessibility and keyboard navigation</p>
            </div>
            <span className={styles.taskStatus}>To Do</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
