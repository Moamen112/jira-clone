import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ViewStyle,
} from 'react-native';
import {
  SearchIcon,
  CloseCircleIcon,
  PersonIcon,
  CreateIcon,
  ChatBubbleIcon,
  CloseCircleOutlineIcon,
} from '../../../../assets/icon';
import { User } from '@jira-clone/shared';
import { Input } from '../../base/input/Input';
import { Text } from '../../base/typography/Text';
import { Avatar } from '../../base/avatar/Avatar';
import { Badge } from '../../base/badge/Badge';
import { useTheme } from '../../../tokens';
import { radius } from '../../../tokens/radius';
import { spacing } from '../../../tokens/spacing';

export interface BoardFilterBarProps {
  /** Search query text */
  searchQuery?: string;
  /** Search query change handler */
  onSearchChange?: (query: string) => void;
  /** Whether "Only My Issues" filter is active */
  assignedToMe?: boolean;
  /** Toggle "Only My Issues" */
  onToggleAssignedToMe?: () => void;
  /** Whether "Created by Me" filter is active */
  createdByMe?: boolean;
  /** Toggle "Created by Me" */
  onToggleCreatedByMe?: () => void;
  /** Whether "Has Comments" filter is active */
  hasComments?: boolean;
  /** Toggle "Has Comments" */
  onToggleHasComments?: () => void;
  /** Array of selected user IDs for assignee filtering */
  selectedUserIds?: string[];
  /** Toggle selection of a user ID */
  onToggleUserId?: (userId: string) => void;
  /** Available workspace members for user facepile quick filters */
  users?: User[];
  /** Current logged-in user */
  currentUser?: User | null;
  /** Filtered cards count to display */
  matchCount?: number;
  /** Total cards count */
  totalCount?: number;
  /** Callback fired when user clears all filters */
  onClearFilters?: () => void;
  /** Custom container style */
  style?: ViewStyle;
  /** Test identifier */
  testID?: string;
}

export const BoardFilterBar: React.FC<BoardFilterBarProps> = ({
  searchQuery = '',
  onSearchChange,
  assignedToMe = false,
  onToggleAssignedToMe,
  createdByMe = false,
  onToggleCreatedByMe,
  hasComments = false,
  onToggleHasComments,
  selectedUserIds = [],
  onToggleUserId,
  users = [],
  currentUser,
  matchCount,
  totalCount,
  onClearFilters,
  style,
  testID,
}) => {
  const { colors } = useTheme();

  // Count how many filters are actively applied
  const activeFilterCount =
    (searchQuery.trim().length > 0 ? 1 : 0) +
    (assignedToMe ? 1 : 0) +
    (createdByMe ? 1 : 0) +
    (hasComments ? 1 : 0) +
    selectedUserIds.length;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.line }, style]} testID={testID}>
      {/* Search Input Row */}
      <View style={styles.searchRow}>
        <View style={styles.inputWrapper}>
          <Input
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Filter cards by title or key..."
            leftIcon={
              <SearchIcon
                size={16}
                color={colors.inkMuted}
              />
            }
            rightIcon={
              searchQuery.length > 0 && onSearchChange ? (
                <Pressable
                  onPress={() => onSearchChange('')}
                  hitSlop={8}
                  accessibilityLabel="Clear search text"
                >
                  <CloseCircleIcon
                    size={16}
                    color={colors.inkMuted}
                  />
                </Pressable>
              ) : undefined
            }
            containerStyle={styles.searchInput}
          />
        </View>

        {/* Counter Badge */}
        {matchCount !== undefined && totalCount !== undefined && (
          <View style={styles.counterBadgeWrapper}>
            <Badge
              label={`${matchCount}/${totalCount}`}
              variant={matchCount < totalCount ? 'accent' : 'neutral'}
              size="sm"
            />
          </View>
        )}
      </View>

      {/* Horizontal Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsScroll}
      >
        {/* 1. Only My Issues */}
        {currentUser && onToggleAssignedToMe && (
          <Pressable
            onPress={onToggleAssignedToMe}
            style={({ pressed }) => [
              styles.filterPill,
              { backgroundColor: colors.paper, borderColor: colors.line },
              assignedToMe && { backgroundColor: colors.ink, borderColor: colors.ink },
              pressed && styles.filterPillPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Filter by only my issues"
          >
            <PersonIcon
              size={13}
              color={assignedToMe ? colors.paper : colors.inkMuted}
            />
            <Text
              variant="caption"
              bold={assignedToMe}
              style={[
                styles.filterPillText,
                { color: colors.ink },
                assignedToMe && { color: colors.paper },
              ]}
            >
              My Issues
            </Text>
          </Pressable>
        )}

        {/* 2. Created By Me */}
        {currentUser && onToggleCreatedByMe && (
          <Pressable
            onPress={onToggleCreatedByMe}
            style={({ pressed }) => [
              styles.filterPill,
              { backgroundColor: colors.paper, borderColor: colors.line },
              createdByMe && { backgroundColor: colors.ink, borderColor: colors.ink },
              pressed && styles.filterPillPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Filter by cards created by me"
          >
            <CreateIcon
              size={13}
              color={createdByMe ? colors.paper : colors.inkMuted}
            />
            <Text
              variant="caption"
              bold={createdByMe}
              style={[
                styles.filterPillText,
                { color: colors.ink },
                createdByMe && { color: colors.paper },
              ]}
            >
              Created by Me
            </Text>
          </Pressable>
        )}

        {/* 3. Has Comments */}
        {onToggleHasComments && (
          <Pressable
            onPress={onToggleHasComments}
            style={({ pressed }) => [
              styles.filterPill,
              { backgroundColor: colors.paper, borderColor: colors.line },
              hasComments && { backgroundColor: colors.ink, borderColor: colors.ink },
              pressed && styles.filterPillPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Filter by cards with comments"
          >
            <ChatBubbleIcon
              size={13}
              color={hasComments ? colors.paper : colors.inkMuted}
            />
            <Text
              variant="caption"
              bold={hasComments}
              style={[
                styles.filterPillText,
                { color: colors.ink },
                hasComments && { color: colors.paper },
              ]}
            >
              Has Comments
            </Text>
          </Pressable>
        )}

        {/* 4. Team Member Facepile Quick Filters */}
        {users.map((user) => {
          const isSelected = selectedUserIds.includes(user.id);

          return (
            <Pressable
              key={user.id}
              onPress={() => onToggleUserId?.(user.id)}
              style={({ pressed }) => [
                styles.userPill,
                { backgroundColor: colors.paper, borderColor: colors.line },
                isSelected && { backgroundColor: colors.accent, borderColor: colors.accent },
                pressed && styles.filterPillPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${user.name}`}
            >
              <Avatar
                name={user.name}
                imageUrl={user.avatarUrl}
                size="xs"
              />
              <Text
                variant="caption"
                bold={isSelected}
                style={[
                  styles.filterPillText,
                  { color: colors.ink },
                  isSelected && { color: colors.paper },
                ]}
              >
                {user.name.split(' ')[0]}
              </Text>
            </Pressable>
          );
        })}

        {/* 5. Clear All Active Filters */}
        {activeFilterCount > 0 && onClearFilters && (
          <Pressable
            onPress={onClearFilters}
            style={({ pressed }) => [
              styles.clearPill,
              { backgroundColor: colors.warnSoft, borderColor: colors.warn },
              pressed && styles.filterPillPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Clear all filters"
          >
            <CloseCircleOutlineIcon
              size={14}
              color={colors.warn}
            />
            <Text variant="caption" bold style={[styles.clearPillText, { color: colors.warn }]}>
              Reset ({activeFilterCount})
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing[3],
    borderRadius: radius.card,
    borderWidth: 1,
    marginBottom: spacing[3],
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  inputWrapper: {
    flex: 1,
  },
  searchInput: {
    marginBottom: 0,
  },
  counterBadgeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[1],
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing[3],
    paddingVertical: 5,
  },
  filterPillActive: {},
  filterPillPressed: {
    opacity: 0.8,
  },
  filterPillText: {
    fontSize: 12,
  },
  filterPillTextActive: {},
  userPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingLeft: 3,
    paddingRight: spacing[3],
    paddingVertical: 3,
  },
  userPillActive: {},
  clearPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing[3],
    paddingVertical: 5,
  },
  clearPillText: {
    fontSize: 12,
  },
});

export default BoardFilterBar;
