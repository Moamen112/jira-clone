import { useState } from 'react';
import styles from './App.module.css';
import { Text, Badge, Divider } from '@/components/base';
import { CreateCardInline } from '@/components/shared/create-card-inline';

interface DemoCard {
  id: number;
  title: string;
}

export const App = () => {
  const [cards, setCards] = useState<DemoCard[]>([
    { id: 1, title: 'Implement design tokens' },
    { id: 2, title: 'Build the base components' },
  ]);

  // Simulates async persistence so the composer exposes its loading state.
  const handleCreate = async ({ title }: { title: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    setCards((prev) => [...prev, { id: Date.now(), title }]);
  };

  return (
    <div className={styles.container}>
      <div className={styles.column}>
        <div className={styles.columnHeader}>
          <Text variant="sectionLabel" bold>To Do</Text>
          <Badge label={String(cards.length)} variant="neutral" size="sm" />
        </div>

        <Divider margin={12} />

        <div className={styles.cardList}>
          {cards.map((card) => (
            <div key={card.id} className={styles.demoCard}>
              <Text variant="bodySmall" bold numberOfLines={1}>
                {card.title}
              </Text>
            </div>
          ))}
        </div>

        <CreateCardInline
          columnId="col-todo"
          placeholder="What needs to be done?"
          onCreate={handleCreate}
        />
      </div>
    </div>
  );
};
