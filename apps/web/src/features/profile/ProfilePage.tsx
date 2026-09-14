import styles from './ProfilePage.module.css';

export function ProfilePage() {
  return (
    <div className={styles.container}>
      <main className={styles.content}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>User Profile</h1>
          <p className={styles.subtitle}>Manage your account information, role settings, and preferences.</p>
        </div>

        <div className={styles.profileCard}>
          <div className={styles.profileTop}>
            <div className={styles.largeAvatar}>AM</div>
            <div>
              <h2 className={styles.profileName}>Alex Morgan</h2>
              <p className={styles.profileEmail}>alex@fieldnotes.dev</p>
            </div>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Role</span>
              <span className={styles.detailValue}>Frontend Tech Lead</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Default Workspace</span>
              <span className={styles.detailValue}>Fieldnotes Core (FIELD)</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Timezone</span>
              <span className={styles.detailValue}>UTC-05:00 Eastern Time</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Member Since</span>
              <span className={styles.detailValue}>September 2026</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
