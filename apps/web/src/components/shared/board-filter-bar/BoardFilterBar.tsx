import type { FC } from 'react';
import { Input, Badge } from '../../base';
import { Avatar } from '../avatar';
import type { BoardFilterBarProps } from './types';

const SearchIcon: FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CloseIcon: FC<{ size?: number }> = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const PersonIcon: FC<{ size?: number }> = ({ size = 13 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CreateIcon: FC<{ size?: number }> = ({ size = 13 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const ChatBubbleIcon: FC<{ size?: number }> = ({ size = 13 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

export const BoardFilterBar: FC<BoardFilterBarProps> = ({
  searchQuery = '',
  onSearchChange,
  assignedToMe = false,
  onToggleAssignedToMe,
  createdByMe = false,
  onToggleCreatedByMe,
  hasComments = false,
  onToggleHasComments,
  selectedUserIds = [],
  onToggleUserId,
  users = [],
  currentUser,
  matchCount,
  totalCount,
  onClearFilters,
  style,
  className,
  testID,
}) => {
  // Count how many filters are actively applied
  const activeFilterCount =
    (searchQuery.trim().length > 0 ? 1 : 0) +
    (assignedToMe ? 1 : 0) +
    (createdByMe ? 1 : 0) +
    (hasComments ? 1 : 0) +
    selectedUserIds.length;

  return (
    <div
      data-testid={testID}
      className={className}
      style={{
        padding: 12,
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--color-line)',
        backgroundColor: 'var(--color-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {/* Search Input Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div style={{ flex: 1 }}>
          <Input
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Filter cards by title, key, or description..."
            leftIcon={<SearchIcon size={16} />}
            rightIcon={
              searchQuery.length > 0 && onSearchChange ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search text"
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'var(--color-ink-muted)',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  <CloseIcon size={16} />
                </button>
              ) : undefined
            }
            containerStyle={{ marginBottom: 0 }}
          />
        </div>

        {/* Counter Badge */}
        {matchCount !== undefined && totalCount !== undefined && (
          <div style={{ flexShrink: 0 }}>
            <Badge
              label={`${matchCount}/${totalCount}`}
              variant={matchCount < totalCount ? 'accent' : 'neutral'}
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Horizontal Filter Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          paddingTop: 2,
        }}
      >
        {/* 1. Only My Issues */}
        {currentUser && onToggleAssignedToMe && (
          <button
            type="button"
            onClick={onToggleAssignedToMe}
            aria-pressed={assignedToMe}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              border: `1px solid ${assignedToMe ? 'var(--color-ink)' : 'var(--color-line)'}`,
              backgroundColor: assignedToMe ? 'var(--color-ink)' : 'var(--color-paper)',
              color: assignedToMe ? 'var(--color-paper)' : 'var(--color-ink)',
              fontSize: 12,
              fontWeight: assignedToMe ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            <PersonIcon size={13} />
            <span>My Issues</span>
          </button>
        )}

        {/* 2. Created By Me */}
        {currentUser && onToggleCreatedByMe && (
          <button
            type="button"
            onClick={onToggleCreatedByMe}
            aria-pressed={createdByMe}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              border: `1px solid ${createdByMe ? 'var(--color-ink)' : 'var(--color-line)'}`,
              backgroundColor: createdByMe ? 'var(--color-ink)' : 'var(--color-paper)',
              color: createdByMe ? 'var(--color-paper)' : 'var(--color-ink)',
              fontSize: 12,
              fontWeight: createdByMe ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            <CreateIcon size={13} />
            <span>Created by Me</span>
          </button>
        )}

        {/* 3. Has Comments */}
        {onToggleHasComments && (
          <button
            type="button"
            onClick={onToggleHasComments}
            aria-pressed={hasComments}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              border: `1px solid ${hasComments ? 'var(--color-ink)' : 'var(--color-line)'}`,
              backgroundColor: hasComments ? 'var(--color-ink)' : 'var(--color-paper)',
              color: hasComments ? 'var(--color-paper)' : 'var(--color-ink)',
              fontSize: 12,
              fontWeight: hasComments ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            <ChatBubbleIcon size={13} />
            <span>Has Comments</span>
          </button>
        )}

        {/* 4. Team Member Facepile Quick Filters */}
        {users.map((user) => {
          const isSelected = selectedUserIds.includes(user.id);
          const firstName = user.name.split(' ')[0];

          return (
            <button
              key={user.id}
              type="button"
              onClick={() => onToggleUserId?.(user.id)}
              aria-pressed={isSelected}
              title={`Filter by ${user.name}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '2px 10px 2px 3px',
                borderRadius: 'var(--radius-pill)',
                border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-line)'}`,
                backgroundColor: isSelected ? 'var(--color-accent)' : 'var(--color-paper)',
                color: isSelected ? '#ffffff' : 'var(--color-ink)',
                fontSize: 12,
                fontWeight: isSelected ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              <Avatar name={user.name} imageUrl={user.avatarUrl} size="xs" />
              <span>{firstName}</span>
            </button>
          );
        })}

        {/* 5. Clear All Active Filters */}
        {activeFilterCount > 0 && onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            aria-label="Clear all filters"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--color-danger, #ef4444)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--color-danger, #ef4444)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            <CloseIcon size={14} />
            <span>Reset ({activeFilterCount})</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default BoardFilterBar;
