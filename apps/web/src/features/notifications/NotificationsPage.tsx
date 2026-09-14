import styles from './NotificationsPage.module.css';

export function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      title: 'Sarah Connor assigned FIELD-1 to you',
      time: '15 minutes ago · Fieldnotes Core',
      initials: 'SC',
      isNew: true,
    },
    {
      id: 2,
      title: 'David Kim moved FIELD-2 to In Progress',
      time: '1 hour ago · Fieldnotes Core',
      initials: 'DK',
      isNew: true,
    },
    {
      id: 3,
      title: 'Elena Rostova commented on Mobile Client App',
      time: 'Yesterday at 5:20 PM · Mobile Client App',
      initials: 'ER',
      isNew: false,
    },
  ];

  return (
    <div className={styles.container}>
      <main className={styles.content}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Notifications</h1>
          <p className={styles.subtitle}>Recent mentions, assignments, and updates across your projects.</p>
        </div>

        <div className={styles.notifList}>
          {notifications.map((n) => (
            <div key={n.id} className={styles.notifItem}>
              <div className={styles.notifLeft}>
                <div className={styles.notifIcon}>{n.initials}</div>
                <div>
                  <p className={styles.notifTitle}>{n.title}</p>
                  <p className={styles.notifTime}>{n.time}</p>
                </div>
              </div>
              {n.isNew && <span className={styles.badgeNew}>New</span>}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default NotificationsPage;
