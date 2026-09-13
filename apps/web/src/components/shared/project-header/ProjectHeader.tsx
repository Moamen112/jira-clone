import type { CSSProperties, FC } from 'react';
import { Text, Badge, Button } from '../../base';
import type { ButtonVariant } from '../../base';
import { AvatarGroup } from '../avatar-group/AvatarGroup';
import type { AvatarGroupUser } from '../avatar-group/AvatarGroup';
import type { Project } from '@jira-clone/shared';

export interface ProjectHeaderProps {
  /** Project to display */
  project: Project;
  /** Team members shown as overlapping avatars */
  members?: AvatarGroupUser[];
  /** Optional action button label */
  actionLabel?: string;
  /** Fired when the action button is pressed */
  onAction?: () => void;
  /** Visual variant for the action button */
  actionVariant?: ButtonVariant;
  /** Container style override */
  style?: CSSProperties;
}

export const ProjectHeader: FC<ProjectHeaderProps> = ({
  project,
  members,
  actionLabel,
  onAction,
  actionVariant = 'primary',
  style,
}) => {
  const hasAction = Boolean(actionLabel && onAction);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
          <Badge label={project.key} variant="mono" />
          <Text variant="display" bold style={{ marginTop: 8, display: 'block' }}>
            {project.name}
          </Text>
        </div>

        {members && members.length > 0 && (
          <AvatarGroup users={members} max={2} size="sm" />
        )}
      </div>

      {project.description && (
        <Text variant="bodySmall" muted style={{ lineHeight: 22 }}>
          {project.description}
        </Text>
      )}

      {hasAction && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            label={actionLabel}
            variant={actionVariant}
            size="sm"
            onPress={onAction}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectHeader;