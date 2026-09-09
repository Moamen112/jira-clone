import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import {
  Text,
  Badge,
  AvatarGroup,
  AvatarGroupUser,
  Divider,
} from '../../base';
import { useTheme } from '../../../tokens';
import { radius } from '../../../tokens/radius';
import { spacing } from '../../../tokens/spacing';
import { Project } from '@jira-clone/shared';

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
  style?: ViewStyle;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  members,
  issueCounts,
  onPress,
  style,
}) => {
  const { colors } = useTheme();
  const content = (
    <View style={styles.cardInner}>
      <View style={styles.cardHeader}>
        <View style={styles.titleArea}>
          <Badge label={project.key} variant="mono" />
          <Text variant="heading" bold style={{ marginTop: spacing[2] }}>
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

      {issueCounts && (
        <View style={styles.countsSection}>
          <Divider margin={2} color={colors.line} />

          <View style={styles.countsRow}>
            <View style={styles.countPill}>
              <Text variant="caption" muted>To Do: </Text>
              <Text variant="caption" bold>{issueCounts.todo}</Text>
            </View>
            <View style={styles.countPill}>
              <Text variant="caption" color={colors.accent} bold>
                Active: {issueCounts.inProgress}
              </Text>
            </View>
            <View style={styles.countPill}>
              <Text variant="caption" color={colors.inkMuted}>
                Done: {issueCounts.done}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: pressed ? colors.paper : colors.surface,
            borderColor: pressed ? colors.accent : colors.line,
          },
          style,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.line,
        },
        style,
      ]}
    >
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing[4],
    borderRadius: radius.card,
    borderWidth: 1,
  },
  cardInner: {
    gap: spacing[2],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleArea: {
    flex: 1,
    marginRight: spacing[2],
  },
  description: {
    marginTop: spacing[1],
    lineHeight: 20,
  },
  countsSection: {
    marginTop: spacing[1],
  },
  countsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ProjectCard;