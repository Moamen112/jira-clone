import { useState } from 'react';
import type { CSSProperties, FC, ReactNode } from 'react';
import { Text } from '../typography/Text';
import { Input } from '../input/Input';

export interface DropdownOption {
  label: string;
  value: string;
  icon?: ReactNode;
  description?: string;
}

export interface DropdownAction {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
}

export interface DropdownProps {
  /** Field label placed above the trigger */
  label?: string;
  /** Currently selected option value */
  value?: string;
  /** Available options */
  options: DropdownOption[];
  /** Callback fired when an option is chosen */
  onSelect: (value: string) => void;
  /** Optional action button rendered at the bottom of the options list */
  action?: DropdownAction;
  /** Placeholder when unselected */
  placeholder?: string;
  /** Error message displayed below the trigger */
  error?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Enable a search filter inside the panel */
  searchable?: boolean;
  /** Additional inline styles */
  style?: CSSProperties;
}

export const Dropdown: FC<DropdownProps> = ({
  label,
  value,
  options,
  onSelect,
  action,
  placeholder = 'Select an option...',
  error,
  disabled = false,
  searchable = false,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions =
    searchable && searchQuery
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

  const handleSelect = (val: string) => {
    onSelect(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  const borderColor = error
    ? 'var(--color-warn)'
    : isOpen
      ? 'var(--color-accent)'
      : 'var(--color-line)';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        marginBottom: 12,
        ...style,
      }}
    >
      {label && (
        <Text variant="label" style={{ display: 'block', marginBottom: 4 }}>
          {label}
        </Text>
      )}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          minHeight: 44,
          border: `1px solid ${borderColor}`,
          borderRadius: 'var(--radius-input)',
          paddingInline: 12,
          backgroundColor: disabled ? 'var(--color-paper)' : 'var(--color-surface)',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'default' : 'pointer',
          color: 'var(--color-ink)',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          {selectedOption?.icon && (
            <span style={{ display: 'inline-flex', color: 'var(--color-ink-muted)' }}>
              {selectedOption.icon}
            </span>
          )}
          <Text
            variant="body"
            numberOfLines={1}
            color={selectedOption ? 'var(--color-ink)' : 'var(--color-ink-muted)'}
            style={{ flex: 1, minWidth: 0 }}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </span>
        <span style={{ fontSize: 10, color: 'var(--color-ink-muted)' }} aria-hidden="true">
          ▼
        </span>
      </button>

      {error && (
        <Text variant="errorText" color="var(--color-warn)" style={{ display: 'block', marginTop: 4 }}>
          {error}
        </Text>
      )}

      {isOpen && (
        <>
          {/* Click-away backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 998 }}
            onClick={() => setIsOpen(false)}
          />

          {/* Options panel */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 4,
              zIndex: 999,
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--color-line)',
              backgroundColor: 'var(--color-surface)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.14)',
              padding: 4,
              maxHeight: 260,
              overflowY: 'auto',
            }}
          >
            {searchable && (
              <Input
                placeholder="Search options..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                containerStyle={{ marginBottom: 8 }}
              />
            )}
            {filteredOptions.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 10px',
                    background: isSelected
                      ? 'var(--color-accent-soft)'
                      : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--color-line)',
                    borderRadius: isSelected ? 'var(--radius-input)' : 0,
                    cursor: 'pointer',
                    color: 'inherit',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                    {opt.icon}
                    <span style={{ display: 'block', minWidth: 0 }}>
                      <Text
                        variant="body"
                        bold={isSelected}
                        color={isSelected ? 'var(--color-accent)' : 'var(--color-ink)'}
                        style={{ display: 'block' }}
                      >
                        {opt.label}
                      </Text>
                      {opt.description && (
                        <Text variant="caption" muted style={{ display: 'block' }}>
                          {opt.description}
                        </Text>
                      )}
                    </span>
                  </span>
                  {isSelected && (
                    <Text variant="body" bold color="var(--color-accent)">
                      ✓
                    </Text>
                  )}
                </button>
              );
            })}

            {filteredOptions.length === 0 && (
              <Text
                variant="bodySmall"
                muted
                align="center"
                style={{ padding: 24, display: 'block' }}
              >
                No matching options found.
              </Text>
            )}

            {action && (
              <div
                style={{
                  borderTop: '1px solid var(--color-line)',
                  paddingTop: 4,
                  marginTop: 4,
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    action.onPress();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '8px 10px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-input)',
                    cursor: 'pointer',
                    color: 'var(--color-accent)',
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: 'left',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-accent-soft)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  {action.icon ?? (
                    <span style={{ fontSize: 16, lineHeight: 1, fontWeight: 'bold' }}>+</span>
                  )}
                  <span>{action.label}</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dropdown;