import React, { useState } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Text, Button, Input } from '../../base';
import { useTheme } from '../../../tokens';
import { radius } from '../../../tokens/radius';
import { spacing } from '../../../tokens/spacing';

export interface CreateCardInlineProps {
  /** Column this composer creates cards into — passed through to onCreate */
  columnId?: string;
  /** Placeholder shown inside the title input */
  placeholder?: string;
  /** Start in expanded (composer open) mode */
  autoExpand?: boolean;
  /** Invoked when the user confirms a new card. Supports sync or async handlers. */
  onCreate: (input: { title: string; columnId?: string }) => void | Promise<void>;
  /** Show a spinner in the Add button while the parent persists the card */
  loading?: boolean;
  /** Disable the entire composer (collapsed row and inputs) */
  disabled?: boolean;
  /** Container style override */
  style?: ViewStyle;
}

const DEFAULT_PLACEHOLDER = 'What needs to be done?';
const MAX_TITLE_LENGTH = 255;
const EMPTY_TITLE_ERROR = 'Card title cannot be empty.';
const TITLE_TOO_LONG_ERROR = 'Card title must not exceed 255 characters.';
const GENERIC_SUBMIT_ERROR = 'Something went wrong. Please try again.';

export const CreateCardInline: React.FC<CreateCardInlineProps> = ({
  columnId,
  placeholder = DEFAULT_PLACEHOLDER,
  autoExpand = false,
  onCreate,
  loading = false,
  disabled = false,
  style,
}) => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(autoExpand);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const busy = submitting || loading;

  const handleSubmit = () => {
    if (busy || disabled) return;

    const trimmed = title.trim();
    if (!trimmed) {
      setError(EMPTY_TITLE_ERROR);
      return;
    }
    if (trimmed.length > MAX_TITLE_LENGTH) {
      setError(TITLE_TOO_LONG_ERROR);
      return;
    }

    setError(undefined);

    const result = onCreate({ title: trimmed, columnId });

    // Async handler: wait for resolution before clearing the composer.
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      setSubmitting(true);
      (result as Promise<void>)
        .then(() => {
          setSubmitting(false);
          setTitle('');
          setExpanded(false);
        })
        .catch((err: unknown) => {
          setSubmitting(false);
          setError(err instanceof Error ? err.message : GENERIC_SUBMIT_ERROR);
        });
    } else {
      setTitle('');
      setExpanded(false);
    }
  };

  const handleCancel = () => {
    if (busy) return;
    setTitle('');
    setError(undefined);
    setExpanded(false);
  };

  const handleChangeText = (text: string) => {
    setTitle(text);
    if (error) setError(undefined);
  };

  if (!expanded) {
    return (
      <Pressable
        onPress={() => setExpanded(true)}
        disabled={disabled}
        style={({ pressed }) => [
          styles.addRow,
          { borderColor: colors.line },
          disabled && styles.addRowDisabled,
          pressed && !disabled && {
            backgroundColor: colors.surface,
            borderColor: colors.accent,
          },
          style,
        ]}
        accessibilityRole="button"
        accessibilityLabel={placeholder}
      >
        <Text variant="body" bold color={colors.accent}>
          +
        </Text>
        <Text variant="caption" muted>
          Add card
        </Text>
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.composerContainer,
        {
          backgroundColor: colors.surface,
          borderColor: colors.line,
        },
        style,
      ]}
    >
      <Input
        value={title}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        error={error}
        autoFocus
        maxLength={MAX_TITLE_LENGTH}
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        editable={!busy && !disabled}
        containerStyle={{ marginBottom: 0 }}
      />

      <View style={styles.actionsRow}>
        <Button
          label="Cancel"
          variant="ghost"
          size="sm"
          disabled={busy || disabled}
          onPress={handleCancel}
        />
        <Button
          label="Add card"
          variant="primary"
          size="sm"
          loading={busy}
          disabled={busy || disabled || !title.trim()}
          onPress={handleSubmit}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    minHeight: 40,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: radius.input,
  },
  addRowDisabled: {
    opacity: 0.5,
  },
  composerContainer: {
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing[3],
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing[2],
    marginTop: spacing[2],
  },
});

export default CreateCardInline;