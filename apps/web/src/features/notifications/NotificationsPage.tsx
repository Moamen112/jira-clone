import styles from './NotificationsPage.module.css';
import { UnderDevelopment } from './components/under-development';

export function NotificationsPage() {
  

  return (
    <div className={styles.container}>
      <main className={styles.content}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Notifications</h1>
          <p className={styles.subtitle}>Recent mentions, assignments, and updates across your projects.</p>
        </div>

        <UnderDevelopment />

        <div className={styles.notifList}>
          
        </div>
      </main>
    </div>
  );
}

export default NotificationsPage;
