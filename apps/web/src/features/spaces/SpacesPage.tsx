import styles from './SpacesPage.module.css';

export function SpacesPage() {
  const spaces = [
    {
      id: 'proj-1',
      name: 'Fieldnotes Core',
      key: 'FIELD',
      desc: 'Central web & mobile design system tokens, primitives, and component architecture.',
      members: 5,
      tasks: 12,
    },
    {
      id: 'proj-2',
      name: 'Mobile Client App',
      key: 'MOB',
      desc: 'React Native & Expo cross-platform mobile client for Android and iOS devices.',
      members: 3,
      tasks: 8,
    },
    {
      id: 'proj-3',
      name: 'Backend Microservices',
      key: 'API',
      desc: 'NestJS REST APIs, database schemas, and real-time WebSocket communication layer.',
      members: 4,
      tasks: 15,
    },
  ];

  return (
    <div className={styles.container}>
      <main className={styles.content}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Spaces &amp; Projects</h1>
          <p className={styles.subtitle}>Browse and manage all team workspaces, boards, and project repos.</p>
        </div>

        <div className={styles.spacesGrid}>
          {spaces.map((space) => (
            <div key={space.id} className={styles.spaceCard}>
              <div className={styles.spaceHeader}>
                <h2 className={styles.spaceName}>{space.name}</h2>
                <span className={styles.spaceKey}>{space.key}</span>
              </div>
              <p className={styles.spaceDesc}>{space.desc}</p>
              <div className={styles.spaceMeta}>
                <span>{space.members} team members</span>
                <span>{space.tasks} active issues</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default SpacesPage;
