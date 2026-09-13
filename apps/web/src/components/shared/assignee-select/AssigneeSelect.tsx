import { useState } from 'react';
import type { CSSProperties, FC } from 'react';
import type { User } from '@jira-clone/shared';
import { Text, Input, Button } from '../../base';
import { Avatar, type AvatarSize } from '../avatar/Avatar';
import { AvatarGroup } from '../avatar-group/AvatarGroup';
import { Modal } from '../modal/Modal';

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
  /** Single selection callback (userId is null when unassigned) */
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
  style?: CSSProperties;
}

const ChevronDownIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const SearchIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CheckmarkIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const AssigneeSelect: FC<AssigneeSelectProps> = ({
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
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Resolve active selections from props
  const propSelectedIds: string[] = multiple
    ? selectedUserIds || (selectedUserId ? [selectedUserId] : [])
    : selectedUserId
      ? [selectedUserId]
      : [];

  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(propSelectedIds);

  const handleOpen = () => {
    if (disabled) return;
    setLocalSelectedIds(propSelectedIds);
    setSearch('');
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearch('');
  };

  const activeIds = isOpen ? localSelectedIds : propSelectedIds;
  const selectedUsers = users.filter((u) => activeIds.includes(u.id));

  const filteredUsers = search.trim()
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
      handleClose();
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
      handleClose();
    }
  };

  // Render picker modal dialog
  const renderModal = () => (
    <Modal
      visible={isOpen}
      onClose={handleClose}
      title={multiple ? 'Select Assignees' : 'Select Assignee'}
      subtitle="Issue Assignment"
      presentation="dialog"
      footer={
        multiple ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
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
              onPress={handleClose}
            />
          </div>
        ) : undefined
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Search input */}
        <Input
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name or email..."
          leftIcon={<span style={{ color: 'var(--color-ink-muted)', display: 'inline-flex' }}><SearchIcon size={16} /></span>}
          containerStyle={{ marginBottom: 4 }}
          autoFocus
        />

        {/* Member list */}
        <div
          style={{
            maxHeight: 320,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {/* 1. Unassign option */}
          <button
            type="button"
            onClick={handleClearAll}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '8px 12px',
              borderRadius: 'var(--radius-card)',
              border: 'none',
              background: localSelectedIds.length === 0 ? 'var(--color-accent-soft)' : 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background-color 150ms ease',
            }}
          >
            <Avatar unassigned size="sm" />
            <div style={{ marginLeft: 12, flex: 1 }}>
              <Text variant="bodySmall" bold style={{ display: 'block' }}>
                Unassigned
              </Text>
              <Text variant="caption" muted style={{ display: 'block' }}>
                {multiple ? 'Clear all assignees' : 'Remove current assignee'}
              </Text>
            </div>
            {localSelectedIds.length === 0 && (
              <span style={{ color: 'var(--color-accent)', display: 'inline-flex' }}>
                <CheckmarkIcon size={18} />
              </span>
            )}
          </button>

          {/* 2. Workspace members */}
          {filteredUsers.map((user) => {
            const isSelected = localSelectedIds.includes(user.id);
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => handleToggleUser(user.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-card)',
                  border: 'none',
                  background: isSelected ? 'var(--color-accent-soft)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 150ms ease',
                }}
              >
                <Avatar name={user.name} imageUrl={user.avatarUrl} size="sm" />
                <div style={{ marginLeft: 12, flex: 1 }}>
                  <Text variant="bodySmall" bold style={{ display: 'block' }}>
                    {user.name}
                  </Text>
                  <Text variant="caption" muted style={{ display: 'block' }}>
                    {user.email}
                  </Text>
                </div>
                {isSelected && (
                  <span style={{ color: 'var(--color-accent)', display: 'inline-flex' }}>
                    <CheckmarkIcon size={18} />
                  </span>
                )}
              </button>
            );
          })}

          {filteredUsers.length === 0 && (
            <div style={{ padding: '24px 0', textAlign: 'center' }}>
              <Text variant="bodySmall" muted>
                No members found matching &quot;{search}&quot;
              </Text>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );

  // Variant 1: avatarOnly (for card footers)
  if (variant === 'avatarOnly') {
    const defaultAvatarSize = avatarSize || 'xs';

    return (
      <div style={{ display: 'inline-flex', ...style }}>
        <button
          type="button"
          disabled={disabled}
          onClick={handleOpen}
          style={{
            border: 'none',
            background: 'transparent',
            padding: 0,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={`Assignees: ${
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
            <Avatar unassigned size={defaultAvatarSize} />
          )}
        </button>

        {renderModal()}
      </div>
    );
  }

  // Variant 2: compact (inline pill chip)
  if (variant === 'compact') {
    return (
      <div style={{ display: 'inline-flex', ...style }}>
        <button
          type="button"
          disabled={disabled}
          onClick={handleOpen}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: disabled ? 'var(--color-paper)' : 'var(--color-surface)',
            border: '1px solid var(--color-line)',
            borderRadius: 'var(--radius-pill)',
            padding: '2px 8px 2px 2px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
          }}
        >
          {selectedUsers.length > 1 ? (
            <AvatarGroup users={selectedUsers} size="xs" max={2} />
          ) : selectedUsers.length === 1 ? (
            <Avatar
              name={selectedUsers[0].name}
              imageUrl={selectedUsers[0].avatarUrl}
              size="xs"
            />
          ) : (
            <Avatar unassigned size="xs" />
          )}
          <Text
            variant="caption"
            bold={selectedUsers.length > 0}
            color={selectedUsers.length > 0 ? 'var(--color-ink)' : 'var(--color-ink-muted)'}
          >
            {selectedUsers.length > 1
              ? `${selectedUsers.length} Assignees`
              : selectedUsers.length === 1
                ? selectedUsers[0].name
                : placeholder}
          </Text>
          {!disabled && (
            <span style={{ color: 'var(--color-ink-muted)', display: 'inline-flex', marginLeft: 2 }}>
              <ChevronDownIcon size={12} />
            </span>
          )}
        </button>

        {renderModal()}
      </div>
    );
  }

  // Variant 3: default (full form card)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', ...style }}>
      {/* Label */}
      {label && (
        <Text variant="label" bold style={{ display: 'block', marginBottom: 4 }}>
          {label}
        </Text>
      )}

      {/* Main Trigger Card */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          minHeight: 44,
          padding: '8px 12px',
          border: '1px solid var(--color-line)',
          borderRadius: 'var(--radius-input)',
          backgroundColor: disabled ? 'var(--color-paper)' : 'var(--color-surface)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          textAlign: 'left',
          boxSizing: 'border-box',
          transition: 'border-color 150ms ease, background-color 150ms ease',
        }}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, gap: 12 }}>
          {selectedUsers.length > 1 ? (
            <AvatarGroup users={selectedUsers} size={avatarSize || 'sm'} max={3} />
          ) : selectedUsers.length === 1 ? (
            <Avatar
              name={selectedUsers[0].name}
              imageUrl={selectedUsers[0].avatarUrl}
              size={avatarSize || 'sm'}
            />
          ) : (
            <Avatar unassigned size={avatarSize || 'sm'} />
          )}

          <div style={{ flex: 1, minWidth: 0 }}>
            <Text
              variant="bodySmall"
              bold={selectedUsers.length > 0}
              color={selectedUsers.length > 0 ? 'var(--color-ink)' : 'var(--color-ink-muted)'}
              numberOfLines={1}
              style={{ display: 'block' }}
            >
              {selectedUsers.length > 1
                ? `${selectedUsers.length} Assignees`
                : selectedUsers.length === 1
                  ? selectedUsers[0].name
                  : placeholder}
            </Text>
            <Text variant="caption" muted numberOfLines={1} style={{ display: 'block' }}>
              {selectedUsers.length > 1
                ? selectedUsers.map((u) => u.name).join(', ')
                : selectedUsers.length === 1
                  ? selectedUsers[0].email
                  : multiple
                    ? 'Assign one or more members'
                    : 'Assign a member'}
            </Text>
          </div>
        </div>

        {!disabled && (
          <span style={{ color: 'var(--color-ink-muted)', display: 'inline-flex', marginLeft: 8 }}>
            <ChevronDownIcon size={18} />
          </span>
        )}
      </button>

      {/* Helper text */}
      {helperText && (
        <Text variant="caption" muted style={{ display: 'block', marginTop: 4 }}>
          {helperText}
        </Text>
      )}

      {renderModal()}
    </div>
  );
};

export default AssigneeSelect;
