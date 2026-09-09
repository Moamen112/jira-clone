import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { User } from '@jira-clone/shared';
import { Text } from '../../base/typography/Text';
import { Avatar, AvatarSize } from '../../base/avatar/Avatar';
import { AvatarGroup } from '../../base/avatar-group/AvatarGroup';
import { Input } from '../../base/input/Input';
import { Modal } from '../../base/modal/Modal';
import { Button } from '../../base/button/Button';
import { useTheme } from '../../../tokens';
import { radius } from '../../../tokens/radius';
import { spacing } from '../../../tokens/spacing';

export type AssigneeSelectVariant = 'default' | 'compact' | 'avatarOnly';

export interface AssigneeSelectProps {
  /** Visual presentation mode: 'default' (form card), 'compact' (pill), 'avatarOnly' (for card footers) */
  variant?: AssigneeSelectVariant;
  /** Avatar size tier */
  avatarSize?: AvatarSize;
  /** Currently selected user ID (single mode) */
  selectedUserId?: string | null;
  /** Currently selected user IDs (multi-assignee mode) */
  selectedUserIds?: string[];
  /** Whether multiple assignees can be assigned */
  multiple?: boolean;
  /** List of workspace members */
  users?: User[];
  /** Single selection callback */
  onSelect?: (userId: string | null) => void;
  /** Multi-assignee selection callback */
  onSelectMultiple?: (userIds: string[]) => void;
  /** Field label placed above trigger */
  label?: string;
  /** Placeholder when unassigned */
  placeholder?: string;
  /** Read-only or disabled state */
  disabled?: boolean;
  /** Optional helper text below trigger */
  helperText?: string;
  /** Custom style override */
  style?: ViewStyle;
}

export const AssigneeSelect: React.FC<AssigneeSelectProps> = ({
  variant = 'default',
  avatarSize,
  selectedUserId,
  selectedUserIds,
  multiple = false,
  users = [],
  onSelect,
  onSelectMultiple,
  label = 'Assignee',
  placeholder = 'Unassigned',
  disabled = false,
  helperText,
  style,
}) => {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Resolve active selections from props
  const propSelectedIds: string[] = multiple
    ? selectedUserIds || (selectedUserId ? [selectedUserId] : [])
    : selectedUserId
    ? [selectedUserId]
    : [];

  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(propSelectedIds);

  // Sync internal state with props whenever props change or modal opens
  useEffect(() => {
    setLocalSelectedIds(propSelectedIds);
  }, [selectedUserId, selectedUserIds, isOpen]);

  const activeIds = isOpen ? localSelectedIds : propSelectedIds;
  const selectedUsers = users.filter((u) => activeIds.includes(u.id));

  const filteredUsers = search
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  const handleToggleUser = (userId: string) => {
    if (multiple) {
      const next = localSelectedIds.includes(userId)
        ? localSelectedIds.filter((id) => id !== userId)
        : [...localSelectedIds, userId];
      setLocalSelectedIds(next);
      if (onSelectMultiple) {
        onSelectMultiple(next);
      } else {
        onSelect?.(next[0] || null);
      }
    } else {
      setLocalSelectedIds([userId]);
      onSelect?.(userId);
      onSelectMultiple?.([userId]);
      setIsOpen(false);
    }
  };

  const handleClearAll = () => {
    setLocalSelectedIds([]);
    if (onSelectMultiple) {
      onSelectMultiple([]);
    } else {
      onSelect?.(null);
    }
    if (!multiple) {
      setIsOpen(false);
    }
  };

  // Render bottom sheet picker modal
  const renderModal = () => (
    <Modal
      visible={isOpen}
      onClose={() => setIsOpen(false)}
      title={multiple ? 'Select Assignees' : 'Select Assignee'}
      subtitle="Issue Assignment"
      presentation="bottomSheet"
      maxHeightRatio={0.75}
      footer={
        multiple ? (
          <View style={styles.sheetFooter}>
            <Button
              label="Clear All"
              variant="ghost"
              size="sm"
              disabled={localSelectedIds.length === 0}
              onPress={handleClearAll}
            />
            <Button
              label={`Done (${localSelectedIds.length})`}
              variant="primary"
              size="sm"
              onPress={() => setIsOpen(false)}
            />
          </View>
        ) : undefined
      }
    >
      <View style={styles.sheetContent}>
        {/* Search Input */}
        <Input
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or email..."
          leftIcon={
            <Ionicons
              name="search-outline"
              size={16}
              color={colors.inkMuted}
            />
          }
          containerStyle={styles.searchInput}
        />

        {/* Members List */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={styles.list}
        >
          {/* 1. Unassign Option */}
          <Pressable
            onPress={handleClearAll}
            style={({ pressed }) => [
              styles.memberRow,
              localSelectedIds.length === 0 && { backgroundColor: colors.accentSoft },
              pressed && styles.memberRowPressed,
            ]}
          >
            <View style={[styles.unassignedIconSmall, { backgroundColor: colors.paper, borderColor: colors.line }]}>
              <Ionicons
                name="close-circle-outline"
                size={18}
                color={colors.inkMuted}
              />
            </View>
            <View style={styles.memberInfo}>
              <Text variant="bodySmall" bold>
                Unassigned
              </Text>
              <Text variant="caption" muted>
                {multiple ? 'Clear all assignees' : 'Remove current assignee'}
              </Text>
            </View>
            {localSelectedIds.length === 0 && (
              <Ionicons
                name="checkmark"
                size={18}
                color={colors.accent}
              />
            )}
          </Pressable>

          {/* 2. Workspace Members */}
          {filteredUsers.map((user) => {
            const isSelected = localSelectedIds.includes(user.id);

            return (
              <Pressable
                key={user.id}
                onPress={() => handleToggleUser(user.id)}
                style={({ pressed }) => [
                  styles.memberRow,
                  isSelected && { backgroundColor: colors.accentSoft },
                  pressed && styles.memberRowPressed,
                ]}
              >
                <Avatar
                  name={user.name}
                  imageUrl={user.avatarUrl}
                  size="sm"
                />
                <View style={styles.memberInfo}>
                  <Text variant="bodySmall" bold>
                    {user.name}
                  </Text>
                  <Text variant="caption" muted>
                    {user.email}
                  </Text>
                </View>
                {isSelected && (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={colors.accent}
                  />
                )}
              </Pressable>
            );
          })}

          {filteredUsers.length === 0 && (
            <View style={styles.emptyState}>
              <Text variant="bodySmall" muted>
                No members found matching &quot;{search}&quot;
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );

  // Avatar-only variant (engineered for Card footers)
  if (variant === 'avatarOnly') {
    const defaultAvatarSize = avatarSize || 'xs';

    return (
      <View style={style}>
        <Pressable
          disabled={disabled}
          onPress={() => setIsOpen(true)}
          style={({ pressed }) => [
            styles.avatarOnlyPressable,
            pressed && !disabled && styles.avatarOnlyPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Assignees: ${
            selectedUsers.length > 0
              ? selectedUsers.map((u) => u.name).join(', ')
              : placeholder
          }`}
        >
          {selectedUsers.length > 1 ? (
            <AvatarGroup users={selectedUsers} size={defaultAvatarSize} max={3} />
          ) : selectedUsers.length === 1 ? (
            <Avatar
              name={selectedUsers[0].name}
              imageUrl={selectedUsers[0].avatarUrl}
              size={defaultAvatarSize}
            />
          ) : (
            <View style={[styles.unassignedIconXs, { backgroundColor: colors.paper, borderColor: colors.line }]}>
              <Ionicons
                name="person-outline"
                size={12}
                color={colors.inkMuted}
              />
            </View>
          )}
        </Pressable>

        {renderModal()}
      </View>
    );
  }

  // Default form card trigger
  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <Text variant="label" style={[styles.label, { color: colors.ink }]}>
          {label}
        </Text>
      )}

      {/* Main Trigger Card */}
      <Pressable
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        style={({ pressed }) => [
          styles.trigger,
          { backgroundColor: colors.surface, borderColor: colors.line },
          disabled && { backgroundColor: colors.paper, opacity: 0.6 },
          pressed && !disabled && styles.triggerPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Assignees: ${
          selectedUsers.length > 0
            ? selectedUsers.map((u) => u.name).join(', ')
            : placeholder
        }`}
      >
        <View style={styles.triggerLeft}>
          {selectedUsers.length > 1 ? (
            <AvatarGroup users={selectedUsers} size={avatarSize || 'sm'} max={3} />
          ) : selectedUsers.length === 1 ? (
            <Avatar
              name={selectedUsers[0].name}
              imageUrl={selectedUsers[0].avatarUrl}
              size={avatarSize || 'sm'}
            />
          ) : (
            <View style={[styles.unassignedIcon, { backgroundColor: colors.paper, borderColor: colors.line }]}>
              <Ionicons
                name="person-outline"
                size={16}
                color={colors.inkMuted}
              />
            </View>
          )}

          <View style={styles.triggerInfo}>
            <Text
              variant="bodySmall"
              bold={selectedUsers.length > 0}
              style={{
                color: selectedUsers.length > 0 ? colors.ink : colors.inkMuted,
              }}
              numberOfLines={1}
            >
              {selectedUsers.length > 1
                ? `${selectedUsers.length} Assignees`
                : selectedUsers.length === 1
                ? selectedUsers[0].name
                : placeholder}
            </Text>

            <Text variant="caption" muted numberOfLines={1}>
              {selectedUsers.length > 1
                ? selectedUsers.map((u) => u.name).join(', ')
                : selectedUsers.length === 1
                ? selectedUsers[0].email
                : multiple
                ? 'Assign one or more members'
                : 'Assign a member'}
            </Text>
          </View>
        </View>

        {!disabled && (
          <Ionicons
            name="chevron-down"
            size={18}
            color={colors.inkMuted}
            style={styles.chevron}
          />
        )}
      </Pressable>

      {/* Helper text */}
      {helperText && (
        <Text variant="caption" muted style={styles.helperText}>
          {helperText}
        </Text>
      )}

      {renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[3],
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing[1],
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.input,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  triggerDisabled: {
    opacity: 0.6,
  },
  triggerPressed: {
    opacity: 0.85,
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  unassignedIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unassignedIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  unassignedIconXs: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOnlyPressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOnlyPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  triggerInfo: {
    marginLeft: spacing[3],
    flex: 1,
  },
  chevron: {
    marginLeft: spacing[2],
  },
  helperText: {
    marginTop: 4,
    fontSize: 11,
  },
  sheetContent: {
    paddingBottom: spacing[2],
  },
  searchInput: {
    marginBottom: spacing[3],
  },
  list: {
    maxHeight: 320,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.card,
    marginBottom: 4,
  },
  memberRowSelected: {},
  memberRowPressed: {
    opacity: 0.8,
  },
  memberInfo: {
    marginLeft: spacing[3],
    flex: 1,
  },
  emptyState: {
    paddingVertical: spacing[4],
    alignItems: 'center',
  },
  sheetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing[2],
  },
});

export default AssigneeSelect;
