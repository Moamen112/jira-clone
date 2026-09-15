import { useState } from 'react';
import type { CSSProperties, FC } from 'react';
import { Text, Button, Input } from '../../base';

export interface CreateCardInlineProps {
  /** Column this composer creates cards into — passed through to onCreate */
  columnId?: string;
  /** Placeholder shown inside the title input */
  placeholder?: string;
  /** Start in expanded (composer open) mode */
  autoExpand?: boolean;
  /** Invoked when the user confirms a new card. Supports sync or async handlers. */
  onCreate: (input: { title: string; columnId?: string }) => void | Promise<void>;
  /** Optional custom trigger handler when the collapsed row is clicked */
  onTriggerPress?: () => void;
  /** Show a spinner in the Add button while the parent persists the card */
  loading?: boolean;
  /** Disable the entire composer (collapsed row and inputs) */
  disabled?: boolean;
  /** Container style override */
  style?: CSSProperties;
}

const DEFAULT_PLACEHOLDER = 'What needs to be done?';
const MAX_TITLE_LENGTH = 255;
const EMPTY_TITLE_ERROR = 'Card title cannot be empty.';
const TITLE_TOO_LONG_ERROR = 'Card title must not exceed 255 characters.';
const GENERIC_SUBMIT_ERROR = 'Something went wrong. Please try again.';

export const CreateCardInline: FC<CreateCardInlineProps> = ({
  columnId,
  placeholder = DEFAULT_PLACEHOLDER,
  autoExpand = false,
  onCreate,
  onTriggerPress,
  loading = false,
  disabled = false,
  style,
}) => {
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
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (onTriggerPress) {
            onTriggerPress();
          } else {
            setExpanded(true);
          }
        }}
        aria-label={placeholder}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          minHeight: 40,
          paddingBlock: 8,
          paddingInline: 12,
          border: '1px dashed var(--color-line)',
          borderRadius: 'var(--radius-input)',
          background: 'transparent',
          cursor: disabled ? 'default' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          width: '100%',
          ...style,
        }}
      >
        <Text variant="body" bold color="var(--color-accent)">+</Text>
        <Text variant="caption" muted>Add card</Text>
      </button>
    );
  }

  return (
    <div
      style={{
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-line)',
        backgroundColor: 'var(--color-surface)',
        padding: 12,
        ...style,
      }}
    >
      <div
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            handleSubmit();
          }
        }}
      >
        <Input
          value={title}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          error={error}
          autoFocus
          maxLength={MAX_TITLE_LENGTH}
          editable={!busy && !disabled}
          containerStyle={{ marginBottom: 0 }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 8,
          marginTop: 8,
        }}
      >
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
      </div>
    </div>
  );
};

export default CreateCardInline;