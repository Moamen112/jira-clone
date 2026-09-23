import { useState, useRef, useEffect } from 'react';
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
  onPress: (query?: string) => void;
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

const ChevronIcon: FC<{ size?: number; isOpen?: boolean }> = ({ size = 14, isOpen = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      flexShrink: 0,
      color: 'var(--color-ink-muted)',
      transform: isOpen ? 'rotate(180deg)' : 'none',
      transition: 'transform 150ms ease',
    }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CheckIcon: FC<{ size?: number; color?: string }> = ({ size = 14, color = 'var(--color-accent)' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

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
  const [hoveredValue, setHoveredValue] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    setHoveredValue(null);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const borderColor = error
    ? 'var(--color-warn)'
    : isOpen
      ? 'var(--color-accent)'
      : 'var(--color-line)';

  return (
    <div
      ref={containerRef}
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
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          minHeight: 40,
          border: `1px solid ${borderColor}`,
          borderRadius: 'var(--radius-input)',
          paddingInline: 12,
          backgroundColor: disabled ? 'var(--color-paper)' : 'var(--color-surface)',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'default' : 'pointer',
          color: 'var(--color-ink)',
          transition: 'border-color 150ms ease, box-shadow 150ms ease',
          boxShadow: isOpen ? '0 0 0 2px var(--color-accent-soft)' : 'none',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          {selectedOption?.icon && (
            <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
              {selectedOption.icon}
            </span>
          )}
          <Text
            variant="body"
            numberOfLines={1}
            color={selectedOption ? 'var(--color-ink)' : 'var(--color-ink-muted)'}
            style={{ flex: 1, minWidth: 0, textAlign: 'left' }}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </span>
        <ChevronIcon size={14} isOpen={isOpen} />
      </button>

      {error && (
        <Text variant="errorText" color="var(--color-warn)" style={{ display: 'block', marginTop: 4 }}>
          {error}
        </Text>
      )}

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1100,
            borderRadius: 'var(--radius-card, 8px)',
            border: '1px solid var(--color-line)',
            backgroundColor: 'var(--color-paper)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            padding: 4,
            maxHeight: 260,
            overflowY: 'auto',
          }}
        >
          {searchable && (
            <div style={{ padding: '2px 4px 6px' }}>
              <Input
                placeholder="Search options..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (filteredOptions.length === 0 && action) {
                      setIsOpen(false);
                      action.onPress(searchQuery.trim());
                    } else if (filteredOptions.length === 1) {
                      handleSelect(filteredOptions[0].value);
                    }
                  }
                }}
                autoFocus
                containerStyle={{ marginBottom: 0 }}
                inputWrapperStyle={{ minHeight: 34, paddingInline: 8 }}
                style={{ fontSize: 12 }}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredOptions.map((opt) => {
              const isSelected = opt.value === value;
              const isHovered = hoveredValue === opt.value;

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={() => setHoveredValue(opt.value)}
                  onMouseLeave={() => setHoveredValue(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '7px 10px',
                    background: isSelected
                      ? 'var(--color-accent-soft)'
                      : isHovered
                        ? 'var(--color-surface)'
                        : 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-input, 6px)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: isSelected ? 'var(--color-accent)' : 'var(--color-ink)',
                    transition: 'background-color 120ms ease',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                    {opt.icon && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                        {opt.icon}
                      </span>
                    )}
                    <span style={{ display: 'block', minWidth: 0, flex: 1 }}>
                      <Text
                        variant="body"
                        bold={isSelected}
                        color={isSelected ? 'var(--color-accent)' : 'var(--color-ink)'}
                        style={{ display: 'block', fontSize: 13 }}
                      >
                        {opt.label}
                      </Text>
                      {opt.description && (
                        <Text variant="caption" muted style={{ display: 'block', fontSize: 11 }}>
                          {opt.description}
                        </Text>
                      )}
                    </span>
                  </span>
                  {isSelected && <CheckIcon size={14} color="var(--color-accent)" />}
                </button>
              );
            })}

            {filteredOptions.length === 0 && (
              action ? (
                <div
                  style={{
                    padding: '10px 6px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    alignItems: 'center',
                  }}
                >
                  <Text variant="caption" muted align="center" style={{ fontSize: 11 }}>
                    {searchQuery.trim()
                      ? `No matches found for "${searchQuery.trim()}"`
                      : 'No options available.'}
                  </Text>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                      action.onPress(searchQuery.trim());
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: 'var(--color-accent-soft)',
                      color: 'var(--color-accent)',
                      border: '1px dashed var(--color-accent)',
                      borderRadius: 'var(--radius-input, 6px)',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                      textAlign: 'center',
                      transition: 'all 150ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-accent)';
                      e.currentTarget.style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-accent-soft)';
                      e.currentTarget.style.color = 'var(--color-accent)';
                    }}
                  >
                    <span style={{ fontSize: 14, lineHeight: 1, fontWeight: 'bold' }}>+</span>
                    <span>{searchQuery.trim() ? `Add "${searchQuery.trim()}"` : action.label}</span>
                    <kbd
                      style={{
                        marginLeft: 'auto',
                        fontSize: 10,
                        padding: '1px 5px',
                        borderRadius: 3,
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-line)',
                        color: 'var(--color-ink-muted)',
                        lineHeight: '14px',
                      }}
                    >
                      ↵ Enter
                    </kbd>
                  </button>
                </div>
              ) : (
                <Text
                  variant="bodySmall"
                  muted
                  align="center"
                  style={{ padding: '16px 8px', display: 'block' }}
                >
                  No matching options found.
                </Text>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;