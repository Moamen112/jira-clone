import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Button, Input, Textarea, Text } from '../../base';
import { colors } from '../../../tokens/colors';
import { spacing } from '../../../tokens/spacing';

export interface CreateProjectInput {
  /** Project display name */
  name: string;
  /** Unique project key (e.g. "PROJ") */
  key: string;
  /** Optional project description */
  description?: string;
}

export interface CreateProjectModalProps {
  /** Visibility toggle — drives the underlying Modal */
  visible: boolean;
  /** Fired when the user dismisses the modal */
  onClose: () => void;
  /** Called with the validated payload on confirm. Supports sync or async handlers. */
  onCreate: (input: CreateProjectInput) => void | Promise<void>;
  /** Show a spinner in the Create button while the parent persists the project */
  loading?: boolean;
  /** Modal title */
  title?: string;
  /** Modal subtitle (small mono tag above the title) */
  subtitle?: string;
}

const DEFAULT_TITLE = 'Create Project';
const DEFAULT_SUBTITLE = 'PROJECT';
const NAME_MAX_LENGTH = 120;
const KEY_MAX_LENGTH = 10;
const DESCRIPTION_MAX_LENGTH = 500;
const KEY_PATTERN = /^[A-Z0-9]{2,10}$/;
const ERROR_NAME_REQUIRED = 'Project name cannot be empty.';
const ERROR_NAME_TOO_LONG = `Project name must not exceed ${NAME_MAX_LENGTH} characters.`;
const ERROR_KEY_REQUIRED = 'Project key is required.';
const ERROR_KEY_INVALID =
  'Project key must be 2-10 uppercase alphanumeric characters (e.g. PROJ).';
const GENERIC_SUBMIT_ERROR = 'Something went wrong. Please try again.';

/** Derives a usable key (e.g. "Jira Clone" -> "JIRACLONE") until the user types their own. */
const deriveKey = (name: string): string =>
  name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, KEY_MAX_LENGTH);

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  visible,
  onClose,
  onCreate,
  loading = false,
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
}) => {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [keyManuallyEdited, setKeyManuallyEdited] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [keyError, setKeyError] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const busy = submitting || loading;

  // Fresh form each time the modal opens.
  useEffect(() => {
    if (visible) {
      setName('');
      setKey('');
      setDescription('');
      setKeyManuallyEdited(false);
      setNameError(undefined);
      setKeyError(undefined);
      setFormError(undefined);
      setSubmitting(false);
    }
  }, [visible]);

  const handleNameChange = (text: string) => {
    setName(text);
    setNameError(undefined);
    // Auto-derive the key until the user opts into typing their own.
    if (!keyManuallyEdited) {
      setKey(deriveKey(text));
      setKeyError(undefined);
    }
  };

  const handleKeyChange = (text: string) => {
    setKeyManuallyEdited(true);
    setKey(text.toUpperCase());
    setKeyError(undefined);
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

    const trimmedKey = key.trim();
    if (!trimmedKey) {
      setKeyError(ERROR_KEY_REQUIRED);
      return false;
    }
    if (!KEY_PATTERN.test(trimmedKey)) {
      setKeyError(ERROR_KEY_INVALID);
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (busy || !visible) return;
    if (!validate()) return;

    setFormError(undefined);

    const result = onCreate({
      name: name.trim(),
      key: key.trim().toUpperCase(),
      description: description.trim() || undefined,
    });

    // Async handler: wait for resolution before dismissing the dialog.
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      setSubmitting(true);
      (result as Promise<void>)
        .then(() => {
          setSubmitting(false);
          onClose();
        })
        .catch((err: unknown) => {
          setSubmitting(false);
          setFormError(
            err instanceof Error ? err.message : GENERIC_SUBMIT_ERROR
          );
        });
    } else {
      onClose();
    }
  };

  const handleCancel = () => {
    if (busy) return;
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={handleCancel}
      title={title}
      subtitle={subtitle}
      presentation="dialog"
      footer={
        <View style={styles.footer}>
          <Button
            label="Cancel"
            variant="secondary"
            size="sm"
            disabled={busy}
            onPress={handleCancel}
          />
          <Button
            label="Create Project"
            variant="primary"
            size="sm"
            loading={busy}
            disabled={busy || !name.trim() || !key.trim()}
            onPress={handleSubmit}
          />
        </View>
      }
    >
      <View style={styles.form}>
        <Input
          label="Project name"
          value={name}
          onChangeText={handleNameChange}
          placeholder="e.g. Jira Clone"
          error={nameError}
          maxLength={NAME_MAX_LENGTH}
          returnKeyType="next"
          containerStyle={{ marginBottom: 0 }}
          autoFocus
        />

        <Input
          label="Project key"
          value={key}
          onChangeText={handleKeyChange}
          placeholder="e.g. PROJ"
          error={keyError}
          hint="2-10 uppercase letters and numbers, e.g. PROJ."
          maxLength={KEY_MAX_LENGTH}
          returnKeyType="next"
          containerStyle={{ marginBottom: 0 }}
        />

        <Textarea
          label="Description (optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="What will this project track?"
          showCount
          maxLength={DESCRIPTION_MAX_LENGTH}
          containerStyle={{ marginBottom: 0 }}
        />

        {formError && (
          <Text
            variant="errorText"
            color={colors.light.warn}
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
    gap: spacing[3],
  },
  formError: {
    marginTop: spacing[2],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
    marginBottom: spacing[3]
  },
});

export default CreateProjectModal;