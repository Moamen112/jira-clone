import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import {
  Text,
  Badge,
  AvatarGroup,
  AvatarGroupUser,
  Button,
  ButtonVariant,
} from '../../base';
import { colors } from '../../../tokens/colors';
import { spacing } from '../../../tokens/spacing';
import { Project } from '@jira-clone/shared';

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
  style?: ViewStyle;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  members,
  actionLabel,
  onAction,
  actionVariant = 'primary',
  style,
}) => {
  const hasAction = Boolean(actionLabel && onAction);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.topRow}>
        <View style={styles.titleArea}>
          <Badge label={project.key} variant="mono" />
          <Text variant="display" bold style={{ marginTop: spacing[2] }}>
            {project.name}
          </Text>
        </View>

        {members && members.length > 0 && (
          <AvatarGroup users={members} max={2} size="sm" />
        )}
      </View>

      {project.description && (
        <Text variant="bodySmall" muted style={styles.description}>
          {project.description}
        </Text>
      )}

      {hasAction && (
        <View style={styles.actionsRow}>
          <Button
            label={actionLabel}
            variant={actionVariant}
            size="sm"
            onPress={onAction}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing[3],
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleArea: {
    flex: 1,
    marginRight: spacing[2],
  },
  description: {
    lineHeight: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default ProjectHeader;