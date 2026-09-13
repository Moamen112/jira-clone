import type { CSSProperties, FC } from 'react';
import { Text, Badge, Divider } from '../../base';
import { AvatarGroup } from '../avatar-group/AvatarGroup';
import type { AvatarGroupUser } from '../avatar-group/AvatarGroup';
import type { Project } from '@jira-clone/shared';

export interface ProjectIssueCounts {
  /** Number of cards in the To Do column */
  todo: number;
  /** Number of cards in the In Progress column */
  inProgress: number;
  /** Number of cards in the Done column */
  done: number;
}

export interface ProjectCardProps {
  /** Project to display */
  project: Project;
  /** Team members shown as overlapping avatars */
  members?: AvatarGroupUser[];
  /** Issue counts displayed as todo / active / done pills */
  issueCounts?: ProjectIssueCounts;
  /** Fired when the card is pressed */
  onPress?: () => void;
  /** Container style override */
  style?: CSSProperties;
}

const CARD_STYLE: CSSProperties = {
  padding: 16,
  borderRadius: 'var(--radius-card)',
  border: '1px solid var(--color-line)',
  backgroundColor: 'var(--color-surface)',
};

export const ProjectCard: FC<ProjectCardProps> = ({
  project,
  members,
  issueCounts,
  onPress,
  style,
}) => {
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
          <Badge label={project.key} variant="mono" />
          <Text variant="heading" bold style={{ marginTop: 8, display: 'block' }}>
            {project.name}
          </Text>
        </div>

        {members && members.length > 0 && (
          <AvatarGroup users={members} max={2} size="sm" />
        )}
      </div>

      {project.description && (
        <Text variant="bodySmall" muted style={{ lineHeight: 20 }}>
          {project.description}
        </Text>
      )}

      {issueCounts && (
        <div style={{ marginTop: 4 }}>
          <Divider margin={8} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <Text variant="caption" muted>To Do: </Text>
              <Text variant="caption" bold>{issueCounts.todo}</Text>
            </span>
            <Text variant="caption" color="var(--color-accent)" bold>
              Active: {issueCounts.inProgress}
            </Text>
            <Text variant="caption" color="var(--color-ink-muted)">
              Done: {issueCounts.done}
            </Text>
          </div>
        </div>
      )}
    </div>
  );

  if (onPress) {
    return (
      <button
        type="button"
        onClick={onPress}
        style={{
          ...CARD_STYLE,
          width: '100%',
          textAlign: 'left',
          font: 'inherit',
          color: 'inherit',
          cursor: 'pointer',
          ...style,
        }}
      >
        {content}
      </button>
    );
  }

  return <div style={{ ...CARD_STYLE, ...style }}>{content}</div>;
};

export default ProjectCard;