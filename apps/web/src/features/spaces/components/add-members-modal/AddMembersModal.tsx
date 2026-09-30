import React, { FC, useState, useEffect, useMemo } from 'react';
import { Button, Text } from '../../../../components/base';
import { Modal } from '../../../../components/shared/modal';
import { AssigneeSelect } from '../../../../components/shared/assignee-select';
import type { User } from '@jira-clone/shared';
import styles from './AddMembersModal.module.css';

export interface AddMembersModalProps {
  visible: boolean;
  onClose: () => void;
  onAddMembers: (userIds: string[]) => Promise<void> | void;
  spaceName: string;
  existingMemberIds?: (string | number | undefined)[];
  users?: User[];
  loading?: boolean;
}

export const AddMembersModal: FC<AddMembersModalProps> = ({
  visible,
  onClose,
  onAddMembers,
  spaceName,
  existingMemberIds = [],
  users = [],
  loading = false,
}) => {
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

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      onClose={busy ? undefined : onClose}
      title="Add members"
      subtitle={spaceName}
      presentation="dialog"
      footer={
        <div className={styles.footer}>
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
        </div>
      }
    >
      <div className={styles.form}>
        {eligibleUsers.length === 0 ? (
          <div className={styles.emptyState}>
            All workspace members are already part of this space.
          </div>
        ) : (
          <AssigneeSelect
            label="Space members"
            placeholder="Search and choose members..."
            users={eligibleUsers}
            multiple
            selectedUserIds={selectedUserIds}
            onSelect={(id) => setSelectedUserIds(id ? [id] : [])}
            onSelectMultiple={(ids) => setSelectedUserIds(ids)}
            helperText={`${eligibleUsers.length} user${eligibleUsers.length === 1 ? '' : 's'} available to add.`}
          />
        )}

        {formError && (
          <Text variant="errorText" color="var(--color-warn)">
            {formError}
          </Text>
        )}
      </div>
    </Modal>
  );
};

export default AddMembersModal;
