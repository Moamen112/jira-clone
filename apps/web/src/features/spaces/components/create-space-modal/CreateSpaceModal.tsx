import { useState } from 'react';
import type { FC } from 'react';
import { Button, Input, Textarea, Text } from '../../../../components/base';
import { Modal } from '../../../../components/shared/modal';
import { AssigneeSelect } from '../../../../components/shared/assignee-select';
import type { User, SpaceMember } from '@jira-clone/shared';
import { mockUsers, mockCurrentUser } from '@jira-clone/shared';
import styles from './CreateSpaceModal.module.css';

export interface CreateSpaceInput {
  /** Space display name */
  name: string;
  /** Unique space key (auto-generated from name) */
  key: string;
  /** Optional space description */
  description?: string;
  /** Space team members */
  members: SpaceMember[];
}

export interface CreateSpaceModalProps {
  /** Visibility toggle — controls modal display */
  visible: boolean;
  /** Fired when the modal is closed or cancelled */
  onClose: () => void;
  /** Fired with the validated space input on confirmation */
  onCreate: (input: CreateSpaceInput) => void | Promise<void>;
  /** Indicates submission in progress */
  loading?: boolean;
  /** Available workspace members to pick from */
  users?: User[];
  /** Pre-selected members on modal open (defaults to current user) */
  initialMembers?: User[];
  /** Modal title override */
  title?: string;
  /** Modal subtitle tag */
  subtitle?: string;
}

const DEFAULT_TITLE = 'Create Space';
const DEFAULT_SUBTITLE = 'SPACE';
const NAME_MAX_LENGTH = 120;
const DESCRIPTION_MAX_LENGTH = 500;

const ERROR_NAME_REQUIRED = 'Space name cannot be empty.';
const ERROR_NAME_TOO_LONG = `Space name must not exceed ${NAME_MAX_LENGTH} characters.`;
const GENERIC_SUBMIT_ERROR = 'Something went wrong. Please try again.';

/** Derives an uppercase space key automatically from name (e.g. "Mobile Dev" -> "MD", "Core" -> "CORE"). */
const deriveKey = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    const initials = words
      .map((w) => w.replace(/[^a-zA-Z0-9]/g, '')[0])
      .filter(Boolean)
      .join('')
      .toUpperCase();
    if (initials.length >= 2) return initials.slice(0, 6);
  }
  const clean = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return clean.slice(0, 5) || 'SPACE';
};

export const CreateSpaceModal: FC<CreateSpaceModalProps> = ({
  visible,
  onClose,
  onCreate,
  loading = false,
  users = mockUsers,
  initialMembers,
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
}) => {
  const getDefaultMemberIds = (): string[] => {
    if (initialMembers) return initialMembers.map((m) => m.id);
    if (mockCurrentUser) return [mockCurrentUser.id];
    return users.slice(0, 1).map((u) => u.id);
  };

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(getDefaultMemberIds);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const busy = submitting || loading;
  const derivedKey = deriveKey(name);

  const resetForm = () => {
    setName('');
    setDescription('');
    setNameError(undefined);
    setFormError(undefined);
    setSubmitting(false);
    setSelectedUserIds(getDefaultMemberIds());
  };

  const handleNameChange = (text: string) => {
    setName(text);
    setNameError(undefined);
  };

  const validate = (): boolean => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError(ERROR_NAME_REQUIRED);
      return false;
    }
    if (trimmedName.length > NAME_MAX_LENGTH) {
      setNameError(ERROR_NAME_TOO_LONG);
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (busy || !visible) return;
    if (!validate()) return;

    setFormError(undefined);

    const spaceMembers: SpaceMember[] = selectedUserIds
      .map((id) => users.find((u) => u.id === id))
      .filter((u): u is User => Boolean(u))
      .map((u) => ({
        id: u.id,
        name: u.name,
        avatarUrl: u.avatarUrl,
      }));

    const result = onCreate({
      name: name.trim(),
      key: derivedKey,
      description: description.trim() || undefined,
      members: spaceMembers,
    });

    if (result && typeof (result as Promise<unknown>).then === 'function') {
      setSubmitting(true);
      (result as Promise<void>)
        .then(() => {
          setSubmitting(false);
          resetForm();
          onClose();
        })
        .catch((err: unknown) => {
          setSubmitting(false);
          setFormError(err instanceof Error ? err.message : GENERIC_SUBMIT_ERROR);
        });
    } else {
      resetForm();
      onClose();
    }
  };

  const handleCancel = () => {
    if (busy) return;
    resetForm();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      onClose={handleCancel}
      title={title}
      subtitle={subtitle}
      presentation="dialog"
      footer={
        <div className={styles.footer}>
          <Button
            label="Cancel"
            variant="secondary"
            size="sm"
            disabled={busy}
            onPress={handleCancel}
          />
          <Button
            label="Create Space"
            variant="primary"
            size="sm"
            loading={busy}
            disabled={busy || !name.trim()}
            onPress={handleSubmit}
          />
        </div>
      }
    >
      <div className={styles.form}>
        {/* 2 Form Inputs: Space Name & Description */}
        <div className={styles.inputsGroup}>
          <Input
            label="Space name"
            value={name}
            onChangeText={handleNameChange}
            placeholder="e.g. Mobile Engineering"
            error={nameError}
            maxLength={NAME_MAX_LENGTH}
            hint={
              name.trim()
                ? `Key: ${derivedKey} (auto-generated)`
                : 'Space key will be generated automatically from the name.'
            }
            autoFocus
            containerStyle={{ marginBottom: 0 }}
          />

          <Textarea
            label="Description (optional)"
            value={description}
            onChangeText={setDescription}
            placeholder="What will this space track or focus on?"
            rows={3}
            showCount
            maxLength={DESCRIPTION_MAX_LENGTH}
            containerStyle={{ marginBottom: 0 }}
          />
        </div>

        {/* Member selection using the exact AssigneeSelect from Card/CardDetail */}
        <AssigneeSelect
          label="Space members"
          placeholder="Select members..."
          users={users}
          multiple
          selectedUserIds={selectedUserIds}
          onSelect={(id) => setSelectedUserIds(id ? [id] : [])}
          onSelectMultiple={(ids) => setSelectedUserIds(ids)}
          helperText="Select team members who will have access to this space."
        />

        {/* Submission Error Banner */}
        {formError && (
          <Text variant="errorText" color="var(--color-warn)">
            {formError}
          </Text>
        )}
      </div>
    </Modal>
  );
};

export default CreateSpaceModal;
