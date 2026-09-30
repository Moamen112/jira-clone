import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Button, Text } from '../../base';
import { AssigneeSelect } from '../assignee-select/AssigneeSelect';
import { useTheme } from '../../../tokens';
import { spacing } from '../../../tokens/spacing';
import type { User } from '@jira-clone/shared';

export interface AddMembersModalProps {
  /** Visibility toggle */
  visible: boolean;
  /** Fired when dismissed */
  onClose: () => void;
  /** Called with the selected user IDs to add */
  onAddMembers: (userIds: string[]) => Promise<void> | void;
  /** Name of the current space / project */
  spaceName: string;
  /** Existing member IDs that should be excluded from selection */
  existingMemberIds?: (string | number | undefined)[];
  /** All available workspace members */
  users?: User[];
  /** External loading indicator */
  loading?: boolean;
}

export const AddMembersModal: React.FC<AddMembersModalProps> = ({
  visible,
  onClose,
  onAddMembers,
  spaceName,
  existingMemberIds = [],
  users = [],
  loading = false,
}) => {
  const { colors } = useTheme();
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  // Filter out users who are already members of this space
  const eligibleUsers = useMemo(() => {
    const existingSet = new Set(
      existingMemberIds
        .filter((id): id is string | number => id != null && id !== '')
        .map(String)
    );
    return users.filter((u) => !existingSet.has(String(u.id)));
  }, [users, existingMemberIds]);

  const busy = submitting || loading;

  useEffect(() => {
    if (visible) {
      setSelectedUserIds([]);
      setFormError(undefined);
      setSubmitting(false);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (busy || selectedUserIds.length === 0) return;
    try {
      setSubmitting(true);
      setFormError(undefined);
      await onAddMembers(selectedUserIds);
      setSelectedUserIds([]);
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to add members to space.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={busy ? () => {} : onClose}
      title="Add Members"
      subtitle={spaceName}
      presentation="dialog"
      footer={
        <View style={styles.footer}>
          <Button
            label="Cancel"
            variant="secondary"
            size="sm"
            disabled={busy}
            onPress={onClose}
          />
          <Button
            label={
              selectedUserIds.length > 0
                ? `Add ${selectedUserIds.length} Member${selectedUserIds.length === 1 ? '' : 's'}`
                : 'Add Members'
            }
            variant="primary"
            size="sm"
            loading={busy}
            disabled={busy || selectedUserIds.length === 0}
            onPress={handleSubmit}
          />
        </View>
      }
    >
      <View style={styles.form}>
        {eligibleUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="bodySmall" muted>
              All workspace members are already part of this space.
            </Text>
          </View>
        ) : (
          <AssigneeSelect
            label="Space members"
            placeholder="Select members to add..."
            users={eligibleUsers}
            multiple
            selectedUserIds={selectedUserIds}
            onSelect={(id) => setSelectedUserIds(id ? [id] : [])}
            onSelectMultiple={(ids) => setSelectedUserIds(ids)}
            helperText={`${eligibleUsers.length} user${eligibleUsers.length === 1 ? '' : 's'} available to add.`}
            pickerPresentation="inline"
          />
        )}

        {formError && (
          <Text
            variant="errorText"
            color={colors.warn}
            style={styles.formError}
          >
            {formError}
          </Text>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: spacing[4],
  },
  emptyContainer: {
    paddingVertical: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  formError: {
    marginTop: spacing[1],
  },
});

export default AddMembersModal;
