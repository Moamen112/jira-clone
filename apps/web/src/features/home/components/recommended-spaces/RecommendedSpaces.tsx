import type { CSSProperties, FC } from 'react';
import { useNavigate } from 'react-router';
import type { SpaceItem } from '@jira-clone/shared';
import { SpaceCard } from './SpaceCard';
import { ROUTES } from '../../../../routes/paths';
import styles from './RecommendedSpaces.module.css';

export interface RecommendedSpacesProps {
  spaces: SpaceItem[];
  maxItems?: number;
  style?: CSSProperties;
  className?: string;
}

export const RecommendedSpaces: FC<RecommendedSpacesProps> = ({
  spaces,
  maxItems = 4,
  style,
  className = '',
}) => {
  const navigate = useNavigate();
  const visibleSpaces = spaces.slice(0, maxItems);

  return (
    <section className={`${styles.section} ${className}`} style={style}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>Recommended spaces</h2>
          <span className={styles.subtitle}>Frequently accessed team boards</span>
        </div>

        <button
          type="button"
          className={styles.viewAllBtn}
          onClick={() => navigate(ROUTES.PROTECTED.SPACES)}
        >
          View all ({spaces.length})
        </button>
      </div>

      <div className={styles.cardsGrid}>
        {visibleSpaces.map((item) => (
          <SpaceCard
            key={item.project.id}
            project={item.project}
            members={item.members}
            issueCounts={item.issueCounts}
            category={item.category}
            onPress={() => navigate(`/spaces/${item.project.id}`)}
          />
        ))}
      </div>
    </section>
  );
};

export default RecommendedSpaces;
