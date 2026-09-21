import { useState } from 'react';
import type { CSSProperties, FC } from 'react';
import { Button } from '../../../../components/base';
import styles from './FeedbackLink.module.css';

export interface FeedbackLinkProps {
  style?: CSSProperties;
  className?: string;
}

export const FeedbackLink: FC<FeedbackLinkProps> = ({ style, className = '' }) => {
  const [feedbackSent, setFeedbackSent] = useState(false);

  return (
    <div className={`${styles.card} ${className}`} style={style}>
      <div className={styles.header}>
        <div className={styles.iconCircle}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div className={styles.titleInfo}>
          <span className={styles.title}>Jira Productivity Tip</span>
          <span className={styles.subtitle}>Keyboard shortcuts & agile tips</span>
        </div>
      </div>

      <div className={styles.tipsList}>
        <div className={styles.tipItem}>
          <kbd className={styles.keyBadge}>Space</kbd>
          <span className={styles.tipDesc}>Open any card directly from your dashboard</span>
        </div>
        <div className={styles.tipItem}>
          <kbd className={styles.keyBadge}>Drag</kbd>
          <span className={styles.tipDesc}>Move tasks between sprint columns in Boards</span>
        </div>
      </div>

      <div className={styles.actionRow}>
        {feedbackSent ? (
          <span className={styles.thankYouMsg}>Thanks for helping improve Jira Home! 🙌</span>
        ) : (
          <Button
            label="Give Home feedback"
            variant="ghost"
            size="sm"
            onPress={() => setFeedbackSent(true)}
            style={{ fontSize: 12, paddingInline: 8 }}
          />
        )}
      </div>
    </div>
  );
};

export default FeedbackLink;
