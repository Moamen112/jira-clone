import { useState, useRef, useEffect } from 'react';
import type { FC } from 'react';
import { DEFAULT_CARD_TYPES } from '@jira-clone/shared';
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

const ShareIcon: FC<{ size?: number }> = ({ size = 13 }) => (
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
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const ChevronDownIcon: FC<{ size?: number }> = ({ size = 12 }) => (
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
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const PlusIcon: FC<{ size?: number }> = ({ size = 14 }) => (
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
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CheckIcon: FC<{ size?: number; color?: string }> = ({ size = 14, color = 'currentColor' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: 'inline-block', verticalAlign: 'middle' }}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const UnassignedAvatarIcon: FC<{ size?: number; isSelected?: boolean }> = ({
  size = 28,
  isSelected = false,
}) => (
  <span
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      border: isSelected
        ? '2px solid var(--color-accent)'
        : '1.5px dashed var(--color-ink-muted)',
      backgroundColor: isSelected ? 'var(--color-accent-soft)' : 'transparent',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      color: isSelected ? 'var(--color-accent)' : 'var(--color-ink-muted)',
      transition: 'all 150ms ease',
    }}
  >
    <svg
      width={Math.round(size * 0.48)}
      height={Math.round(size * 0.48)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  </span>
);

const renderTypeIcon = (typeId: string, color: string) => {
  const id = typeId.toLowerCase();
  if (id === 'task') {
    return (
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 'var(--radius-sm, 4px)',
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
        }}
      >
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  if (id === 'bug') {
    return (
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 'var(--radius-sm, 4px)',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
        }}
      >
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 4v4M12 16v4M4 12h4M16 12h4M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3" />
        </svg>
      </span>
    );
  }
  if (id === 'story') {
    return (
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 'var(--radius-sm, 4px)',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
        }}
      >
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </span>
    );
  }
  if (id === 'epic') {
    return (
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 'var(--radius-sm, 4px)',
          backgroundColor: 'rgba(139, 92, 246, 0.15)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
        }}
      >
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </span>
    );
  }
  return (
    <span
      style={{
        width: 22,
        height: 22,
        borderRadius: 'var(--radius-sm, 4px)',
        backgroundColor: `${color}20`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        flexShrink: 0,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color }} />
    </span>
  );
};

const getTypeDescription = (typeId: string): string => {
  switch (typeId.toLowerCase()) {
    case 'task':
      return 'General work item';
    case 'bug':
      return 'Problem or defect to fix';
    case 'story':
      return 'User feature or requirement';
    case 'epic':
      return 'Large body of initiative work';
    default:
      return 'Issue category';
  }
};

export const BoardFilterBar: FC<BoardFilterBarProps> = ({
  searchQuery = '',
  onSearchChange,
  assignedToMe = false,
  onToggleAssignedToMe,
  sharedWithMe = false,
  onToggleSharedWithMe,
  selectedType = 'all',
  onSelectType,
  cardTypes = DEFAULT_CARD_TYPES,
  createdByMe = false,
  onToggleCreatedByMe,
  hasComments = false,
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [typeSearch, setTypeSearch] = useState('');
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDropdownOpen && !isTypeDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen, isTypeDropdownOpen]);

  // Show only two members initially as requested, plus any extra members selected via dropdown
  const primaryUsers = users.slice(0, 2);
  const extraSelectedUsers = users.slice(2).filter((u) => selectedUserIds.includes(u.id));
  const displayedUsers = [...primaryUsers, ...extraSelectedUsers];

  const isUnassignedSelected = selectedUserIds.includes('unassigned');
  const isSharedActive = sharedWithMe || createdByMe;
  const isTypeActive = Boolean(selectedType && selectedType !== 'all');
  const currentTypeOption = cardTypes.find(
    (t) => t.id.toLowerCase() === selectedType?.toLowerCase()
  );

  // Search filter for member dropdown
  const filteredDropdownMembers = users.filter((u) => {
    const term = memberSearch.trim().toLowerCase();
    if (!term) return true;
    return (
      u.name.toLowerCase().includes(term) ||
      (u.email && u.email.toLowerCase().includes(term))
    );
  });

  // Search filter for type dropdown
  const filteredCardTypes = cardTypes.filter((t) => {
    const term = typeSearch.trim().toLowerCase();
    if (!term) return true;
    return (
      t.label.toLowerCase().includes(term) ||
      getTypeDescription(t.id).toLowerCase().includes(term)
    );
  });

  // Count active filters
  const activeFilterCount =
    (searchQuery.trim().length > 0 ? 1 : 0) +
    (assignedToMe ? 1 : 0) +
    (isSharedActive ? 1 : 0) +
    (isTypeActive ? 1 : 0) +
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

      {/* Horizontal Filter Pills, Type Filter & Assignee Quick Filters */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          paddingTop: 2,
        }}
      >
        {/* 1. Assigned to me */}
        {currentUser && (onToggleAssignedToMe || onToggleCreatedByMe) && (
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
              border: `1px solid ${assignedToMe ? 'var(--color-accent)' : 'var(--color-line)'}`,
              backgroundColor: assignedToMe ? 'var(--color-accent-soft)' : 'var(--color-paper)',
              color: assignedToMe ? 'var(--color-accent)' : 'var(--color-ink)',
              fontSize: 12,
              fontWeight: assignedToMe ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            <PersonIcon size={13} />
            <span>Assigned to me</span>
          </button>
        )}

        {/* 2. Shared with me */}
        {currentUser && (onToggleSharedWithMe || onToggleCreatedByMe) && (
          <button
            type="button"
            onClick={onToggleSharedWithMe || onToggleCreatedByMe}
            aria-pressed={isSharedActive}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              border: `1px solid ${isSharedActive ? 'var(--color-accent)' : 'var(--color-line)'}`,
              backgroundColor: isSharedActive ? 'var(--color-accent-soft)' : 'var(--color-paper)',
              color: isSharedActive ? 'var(--color-accent)' : 'var(--color-ink)',
              fontSize: 12,
              fontWeight: isSharedActive ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            <ShareIcon size={13} />
            <span>Shared with me</span>
          </button>
        )}

        {/* 3. Dropdown filter for types (designed matching the members dropdown) */}
        <div style={{ position: 'relative' }} ref={typeDropdownRef}>
          <button
            type="button"
            onClick={() => {
              setIsTypeDropdownOpen((v) => !v);
              setTypeSearch('');
            }}
            aria-expanded={isTypeDropdownOpen}
            aria-label="Filter by card type"
            onMouseEnter={() => setHoveredUserId('type-filter')}
            onMouseLeave={() => setHoveredUserId(null)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              border: `1px solid ${isTypeActive ? 'var(--color-accent)' : 'var(--color-line)'}`,
              backgroundColor: isTypeActive ? 'var(--color-accent-soft)' : 'var(--color-paper)',
              color: isTypeActive ? 'var(--color-accent)' : 'var(--color-ink)',
              fontSize: 12,
              fontWeight: isTypeActive ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
          >
            {isTypeActive && currentTypeOption ? (
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: currentTypeOption.color,
                  display: 'inline-block',
                }}
              />
            ) : null}
            <span>
              {isTypeActive && currentTypeOption ? `Type: ${currentTypeOption.label}` : 'Type'}
            </span>
            <ChevronDownIcon size={12} />
          </button>

          {hoveredUserId === 'type-filter' && !isTypeDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 6px)',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'var(--color-ink)',
                color: 'var(--color-paper)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm, 4px)',
                fontSize: 11,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 50,
                boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
              }}
            >
              Filter by type
            </div>
          )}

          {/* Type Dropdown Popover matching Member Dropdown */}
          {isTypeDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                width: 230,
                maxHeight: 320,
                backgroundColor: 'var(--color-paper)',
                border: '1px solid var(--color-line)',
                borderRadius: 'var(--radius-card, 8px)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Search Input Box */}
              <div
                style={{
                  padding: '8px 10px',
                  borderBottom: '1px solid var(--color-line)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <SearchIcon size={14} />
                <input
                  type="text"
                  value={typeSearch}
                  onChange={(e) => setTypeSearch(e.target.value)}
                  placeholder="Search types..."
                  autoFocus
                  style={{
                    border: 'none',
                    outline: 'none',
                    fontSize: 12,
                    color: 'var(--color-ink)',
                    backgroundColor: 'transparent',
                    width: '100%',
                  }}
                />
                {typeSearch && (
                  <button
                    type="button"
                    onClick={() => setTypeSearch('')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      color: 'var(--color-ink-muted)',
                      display: 'flex',
                    }}
                  >
                    <CloseIcon size={12} />
                  </button>
                )}
              </div>

              {/* Types List */}
              <div style={{ overflowY: 'auto', maxHeight: 260, padding: '4px 0' }}>
                {/* All types option */}
                {(!typeSearch || 'all types'.includes(typeSearch.toLowerCase())) && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectType?.('all');
                      setIsTypeDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 12px',
                      background: !isTypeActive
                        ? 'var(--color-accent-soft)'
                        : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: 12,
                      color: !isTypeActive ? 'var(--color-accent)' : 'var(--color-ink)',
                    }}
                  >
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 'var(--radius-sm, 4px)',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-line)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-ink-muted)',
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width={12}
                        height={12}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                      </svg>
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: !isTypeActive ? 600 : 400 }}>All types</div>
                      <div style={{ fontSize: 10, color: 'var(--color-ink-muted)' }}>
                        Show all issue types
                      </div>
                    </div>
                    {!isTypeActive && <CheckIcon size={14} color="var(--color-accent)" />}
                  </button>
                )}

                {filteredCardTypes.length > 0 ? (
                  filteredCardTypes.map((typeOption) => {
                    const isSelected = selectedType?.toLowerCase() === typeOption.id.toLowerCase();
                    return (
                      <button
                        key={typeOption.id}
                        type="button"
                        onClick={() => {
                          onSelectType?.(typeOption.id);
                          setIsTypeDropdownOpen(false);
                        }}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 12px',
                          background: isSelected
                            ? 'var(--color-accent-soft)'
                            : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: 12,
                          color: isSelected ? 'var(--color-accent)' : 'var(--color-ink)',
                        }}
                      >
                        {renderTypeIcon(typeOption.id, typeOption.color)}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: isSelected ? 600 : 400 }}>
                            {typeOption.label}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--color-ink-muted)' }}>
                            {getTypeDescription(typeOption.id)}
                          </div>
                        </div>
                        {isSelected && <CheckIcon size={14} color="var(--color-accent)" />}
                      </button>
                    );
                  })
                ) : (
                  !typeSearch || !'all types'.includes(typeSearch.toLowerCase()) ? (
                    <div
                      style={{
                        padding: '12px 16px',
                        fontSize: 12,
                        color: 'var(--color-ink-muted)',
                        textAlign: 'center',
                      }}
                    >
                      No types found
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider between pill buttons and member facepile */}
        {users.length > 0 && (
          <div
            style={{
              width: 1,
              height: 20,
              backgroundColor: 'var(--color-line)',
              margin: '0 4px',
            }}
          />
        )}

        {/* Member Facepile: 2 members only by default, hovering icon shows name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {displayedUsers.map((user) => {
            const isSelected = selectedUserIds.includes(user.id);
            const isHovered = hoveredUserId === user.id;

            return (
              <div key={user.id} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => onToggleUserId?.(user.id)}
                  aria-pressed={isSelected}
                  title={user.name}
                  onMouseEnter={() => setHoveredUserId(user.id)}
                  onMouseLeave={() => setHoveredUserId(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    outline: 'none',
                    boxShadow: isSelected
                      ? '0 0 0 2px var(--color-paper), 0 0 0 4px var(--color-accent)'
                      : '0 0 0 1px var(--color-line)',
                    transform: isSelected ? 'scale(1.05)' : 'none',
                    transition: 'all 150ms ease',
                  }}
                >
                  <Avatar name={user.name} imageUrl={user.avatarUrl} size={28} />
                </button>

                {/* Hover Tooltip showing member name */}
                {isHovered && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 'calc(100% + 6px)',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'var(--color-ink)',
                      color: 'var(--color-paper)',
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm, 4px)',
                      fontSize: 11,
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      zIndex: 50,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                    }}
                  >
                    {user.name}
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty Icon with "Unassigned" title */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => onToggleUserId?.('unassigned')}
              aria-pressed={isUnassignedSelected}
              title="Unassigned"
              onMouseEnter={() => setHoveredUserId('unassigned')}
              onMouseLeave={() => setHoveredUserId(null)}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                outline: 'none',
                boxShadow: isUnassignedSelected
                  ? '0 0 0 2px var(--color-paper), 0 0 0 4px var(--color-accent)'
                  : 'none',
                transform: isUnassignedSelected ? 'scale(1.05)' : 'none',
                transition: 'all 150ms ease',
              }}
            >
              <UnassignedAvatarIcon size={28} isSelected={isUnassignedSelected} />
            </button>

            {/* Hover Tooltip for Unassigned */}
            {hoveredUserId === 'unassigned' && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 6px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'var(--color-ink)',
                  color: 'var(--color-paper)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm, 4px)',
                  fontSize: 11,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 50,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                }}
              >
                Unassigned
              </div>
            )}
          </div>

          {/* Searchable Dropdown Button to add more members */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen((v) => !v);
                setMemberSearch('');
              }}
              aria-expanded={isDropdownOpen}
              title="Add more members to filter"
              onMouseEnter={() => setHoveredUserId('add-member')}
              onMouseLeave={() => setHoveredUserId(null)}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '1px dashed var(--color-line-dark, #94a3b8)',
                backgroundColor: isDropdownOpen
                  ? 'var(--color-accent-soft)'
                  : 'var(--color-paper)',
                color: isDropdownOpen ? 'var(--color-accent)' : 'var(--color-ink-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 150ms ease',
              }}
            >
              <PlusIcon size={14} />
            </button>

            {hoveredUserId === 'add-member' && !isDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 6px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'var(--color-ink)',
                  color: 'var(--color-paper)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm, 4px)',
                  fontSize: 11,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 50,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                }}
              >
                Add members
              </div>
            )}

            {/* Dropdown Popover */}
            {isDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  width: 240,
                  maxHeight: 320,
                  backgroundColor: 'var(--color-paper)',
                  border: '1px solid var(--color-line)',
                  borderRadius: 'var(--radius-card, 8px)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                {/* Search Input Box */}
                <div
                  style={{
                    padding: '8px 10px',
                    borderBottom: '1px solid var(--color-line)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: 'var(--color-surface)',
                  }}
                >
                  <SearchIcon size={14} />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search members..."
                    autoFocus
                    style={{
                      border: 'none',
                      outline: 'none',
                      fontSize: 12,
                      color: 'var(--color-ink)',
                      backgroundColor: 'transparent',
                      width: '100%',
                    }}
                  />
                  {memberSearch && (
                    <button
                      type="button"
                      onClick={() => setMemberSearch('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        color: 'var(--color-ink-muted)',
                        display: 'flex',
                      }}
                    >
                      <CloseIcon size={12} />
                    </button>
                  )}
                </div>

                {/* Dropdown List */}
                <div style={{ overflowY: 'auto', maxHeight: 260, padding: '4px 0' }}>
                  {/* Unassigned Item in Dropdown */}
                  {(!memberSearch || 'unassigned'.includes(memberSearch.toLowerCase())) && (
                    <button
                      type="button"
                      onClick={() => onToggleUserId?.('unassigned')}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 12px',
                        background: isUnassignedSelected
                          ? 'var(--color-accent-soft)'
                          : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: 12,
                        color: isUnassignedSelected ? 'var(--color-accent)' : 'var(--color-ink)',
                      }}
                    >
                      <UnassignedAvatarIcon size={22} isSelected={isUnassignedSelected} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: isUnassignedSelected ? 600 : 400 }}>
                          Unassigned
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--color-ink-muted)' }}>
                          No people selected
                        </div>
                      </div>
                      {isUnassignedSelected && <CheckIcon size={14} color="var(--color-accent)" />}
                    </button>
                  )}

                  {filteredDropdownMembers.length > 0 ? (
                    filteredDropdownMembers.map((u) => {
                      const isSelected = selectedUserIds.includes(u.id);
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => onToggleUserId?.(u.id)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 12px',
                            background: isSelected
                              ? 'var(--color-accent-soft)'
                              : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: 12,
                            color: isSelected ? 'var(--color-accent)' : 'var(--color-ink)',
                          }}
                        >
                          <Avatar name={u.name} imageUrl={u.avatarUrl} size={22} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: isSelected ? 600 : 400,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {u.name}
                            </div>
                            {u.email && (
                              <div
                                style={{
                                  fontSize: 10,
                                  color: 'var(--color-ink-muted)',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {u.email}
                              </div>
                            )}
                          </div>
                          {isSelected && <CheckIcon size={14} color="var(--color-accent)" />}
                        </button>
                      );
                    })
                  ) : (
                    <div
                      style={{
                        padding: '12px 16px',
                        fontSize: 12,
                        color: 'var(--color-ink-muted)',
                        textAlign: 'center',
                      }}
                    >
                      No members found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Clear All Active Filters */}
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
              marginLeft: 'auto',
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
