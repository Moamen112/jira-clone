import type { CSSProperties, FC } from 'react';
import styles from './ForYouTabs.module.css';

export type ForYouTabKey = 'latest' | 'worked_on' | 'assigned' | 'starred' | 'created';

export interface ForYouTabItem {
  key: ForYouTabKey;
  label: string;
  count: number;
}

export interface ForYouTabsProps {
  tabs: ForYouTabItem[];
  activeTab: ForYouTabKey;
  onChangeTab: (tab: ForYouTabKey) => void;
  style?: CSSProperties;
  className?: string;
}

export const ForYouTabs: FC<ForYouTabsProps> = ({
  tabs,
  activeTab,
  onChangeTab,
  style,
  className = '',
}) => {
  return (
    <div
      className={`${styles.tabBar} ${className}`}
      style={style}
      role="tablist"
      aria-label="Your work categories"
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${styles.tabBtn} ${isActive ? styles.tabActive : ''}`}
            onClick={() => onChangeTab(tab.key)}
          >
            <span>{tab.label}</span>
            <span
              className={`${styles.counter} ${isActive ? styles.counterActive : ''}`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ForYouTabs;
