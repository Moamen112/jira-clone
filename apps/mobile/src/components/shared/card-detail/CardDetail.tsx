import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import {
  DocumentTextIcon,
  PeopleIcon,
  PulseIcon,
  ChatBubblesIcon,
  ChevronBackIcon,
  TrashIcon,
  SunnyIcon,
  MoonIcon,
} from '../../../../assets/icon';
import {
  Card as CardType,
  CardRole,
  CardPriority,
  BoardColumn,
  User,
  ActivityLog as ActivityLogType,
  Comment,
  getCardRole,
  cardPermissions,
  getAllowedStatusesForUser,
  isStatusAllowedForUser,
  getStatusPermissionHint,
  isCardPublisher,
  isCardAssignee,
  columnIdToStatus,
  CardTypeOption,
  createStatusColumn,
  createCardType,
  DEFAULT_CARD_TYPES,
  PRESET_STATUS_COLORS,
  useDebounce,
  taskService,
  taskTypeToCardTypeOption,
} from '@jira-clone/shared';
import { Modal } from '../../base/modal/Modal';
import { Text } from '../../base/typography/Text';
import { Input } from '../../base/input/Input';
import { Textarea } from '../../base/textarea/Textarea';
import { Button } from '../../base/button/Button';
import { Badge } from '../../base/badge/Badge';
import { Dropdown, type DropdownOption } from '../../base/dropdown/Dropdown';
import { Avatar } from '../../base/avatar/Avatar';
import { Divider } from '../../base/divider/Divider';
import { ActivityLog } from '../activity-log/ActivityLog';
import { AssigneeSelect } from '../assignee-select/AssigneeSelect';
import { ConfirmDialog } from '../confirm-dialog/ConfirmDialog';
import { CommentSection } from '../comment-section/CommentSection';
import { Accordion } from '../accordion';
import { useTheme } from '../../../tokens';
import { radius } from '../../../tokens/radius';
import { spacing } from '../../../tokens/spacing';

export interface CardDetailProps {
  /** Visibility toggle (only used when fullScreen is false) */
  visible?: boolean;
  /** The card entity to view or edit */
  card: CardType | null;
  /** Available board columns */
  columns?: BoardColumn[];
  /** Available workspace members */
  users?: User[];
  /** Activity audit logs for this card */
  activityLogs?: ActivityLogType[];
  /** Card discussion comments */
  comments?: Comment[];
  /** Callback fired when a new comment is posted */
  onAddComment?: (content: string, cardId?: string) => void | Promise<void>;
  /** Callback fired when a comment is deleted */
  onDeleteComment?: (commentId: string) => void;
  /** The logged-in user ID (used to compute permissions) */
  currentUserId?: string;
  /** Explicit role override (if precomputed) */
  currentUserRole?: CardRole;
  /** Close or back callback */
  onClose?: () => void;
  /** Callback fired when user saves changes */
  onSave?: (updatedCard: CardType) => void;
  /** Callback fired when user deletes the card */
  onDelete?: (cardId: string) => void;
  /** Callback fired when a new status column is added */
  onAddStatus?: (column: BoardColumn) => void;
  /** Available issue types for the project */
  cardTypes?: CardTypeOption[];
  /** Callback fired when a new issue type is created */
  onAddType?: (type: CardTypeOption) => void | Promise<any>;
  /** Loading state for save action */
  loading?: boolean;
  /** Whether to render as full screen (default: true) instead of modal */
  fullScreen?: boolean;
  style?: any;
}

const PRIORITIES: { label: string; value: CardPriority }[] = [
  { label: 'Lowest', value: 'lowest' },
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Highest', value: 'highest' },
];

export const CardDetail: React.FC<CardDetailProps> = ({
  visible = true,
  card,
  columns = [],
  users = [],
  activityLogs,
  comments,
  onAddComment,
  onDeleteComment,
  currentUserId,
  currentUserRole,
  onClose,
  onSave,
  onDelete,
  onAddStatus,
  cardTypes: passedCardTypes,
  onAddType,
  loading = false,
  fullScreen = true,
  style,
}) => {
  const { colors, isDark, toggleTheme } = useTheme();

  // Form draft state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [priority, setPriority] = useState<CardPriority>('medium');
  const [hasChanges, setHasChanges] = useState(false);

  // Status & Custom Columns state
  const [customColumns, setCustomColumns] = useState<BoardColumn[]>([]);
  const allColumns = useMemo(() => {
    const ids = new Set(columns.map((c) => c.id));
    return [...columns, ...customColumns.filter((c) => !ids.has(c.id))];
  }, [columns, customColumns]);

  const [isAddStatusOpen, setIsAddStatusOpen] = useState(false);
  const [newStatusTitle, setNewStatusTitle] = useState('');
  const [newStatusColor, setNewStatusColor] = useState(PRESET_STATUS_COLORS[0]);
  const [statusError, setStatusError] = useState<string | undefined>();

  // Search query for types in dropdown
  const [typeSearch, setTypeSearch] = useState('');
  const debouncedTypeSearch = useDebounce(typeSearch, 300);
  const [isSearchingTypes, setIsSearchingTypes] = useState(false);
  const [apiCardTypes, setApiCardTypes] = useState<CardTypeOption[]>([]);
  const [customCardTypes, setCustomCardTypes] = useState<CardTypeOption[]>([]);

  const numericProjectId = card?.projectId ? Number(card.projectId) : undefined;
  const hasValidNumericProjectId = Boolean(
    numericProjectId && !isNaN(numericProjectId) && numericProjectId > 0
  );

  // Fetch project task types when modal opens, project changes, or debounced search changes
  useEffect(() => {
    if (!visible || !hasValidNumericProjectId || !numericProjectId) return;

    let isMounted = true;
    setIsSearchingTypes(true);

    taskService
      .getTaskTypes(numericProjectId, {
        search: debouncedTypeSearch.trim() || undefined,
        limit: 'all',
      })
      .then((backendTypes) => {
        if (!isMounted) return;
        if (backendTypes && backendTypes.length > 0) {
          setApiCardTypes(backendTypes.map(taskTypeToCardTypeOption));
        } else if (!debouncedTypeSearch.trim()) {
          setApiCardTypes([]);
        } else {
          setApiCardTypes([]);
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch task types from API:', err);
      })
      .finally(() => {
        if (isMounted) setIsSearchingTypes(false);
      });

    return () => {
      isMounted = false;
    };
  }, [visible, hasValidNumericProjectId, numericProjectId, debouncedTypeSearch]);

  // Master list of all known task types
  const masterCardTypes = useMemo(() => {
    const list: CardTypeOption[] = [];
    const seen = new Set<string>();

    const addType = (t: CardTypeOption) => {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        list.push(t);
      }
    };

    apiCardTypes.forEach(addType);
    if (passedCardTypes) passedCardTypes.forEach(addType);
    customCardTypes.forEach(addType);

    if (list.length === 0) {
      DEFAULT_CARD_TYPES.slice(0, 4).forEach(addType);
    }
    return list;
  }, [apiCardTypes, passedCardTypes, customCardTypes]);

  const cardTypes = masterCardTypes;

  const resolveTypeId = (typeVal?: string) => {
    if (!typeVal) return '';
    const matched = masterCardTypes.find(
      (c) =>
        c.id === typeVal ||
        c.label.toLowerCase() === typeVal.toLowerCase() ||
        (card?.typeName && c.label.toLowerCase() === card.typeName.toLowerCase())
    );
    return matched ? matched.id : typeVal;
  };

  const [type, setType] = useState<string>(card?.type || 'task');

  const displayedCardTypes = useMemo(() => {
    let result = apiCardTypes.length > 0 ? apiCardTypes : masterCardTypes;
    if (debouncedTypeSearch.trim() && apiCardTypes.length === 0) {
      const q = debouncedTypeSearch.trim().toLowerCase();
      result = masterCardTypes.filter((t) => t.label.toLowerCase().includes(q));
    }
    if (type && !result.some((t) => t.id === type)) {
      const currentSelected = masterCardTypes.find((t) => t.id === type);
      if (currentSelected) {
        result = [currentSelected, ...result];
      }
    }
    return result;
  }, [apiCardTypes, masterCardTypes, debouncedTypeSearch, type]);
  const [isAddTypeOpen, setIsAddTypeOpen] = useState(false);
  const [newTypeTitle, setNewTypeTitle] = useState('');
  const [typeError, setTypeError] = useState<string | undefined>();

  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  // Sync draft state whenever card opens or card/cardTypes changes
  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setColumnId(card.columnId);
      setAssigneeId(card.assigneeId || null);
      setAssigneeIds(
        card.assigneeIds && card.assigneeIds.length > 0
          ? card.assigneeIds
          : card.assigneeId
          ? [card.assigneeId]
          : []
      );
      setPriority(card.priority);
      setType(resolveTypeId(card.type) || card.type || 'task');
      setHasChanges(false);
      setDeleteConfirmVisible(false);
    }
  }, [card, visible, cardTypes]);

  // Construct effective card participant info (including current draft assignee)
  const effectiveCard = useMemo(() => {
    if (!card) return null;
    return {
      ...card,
      publisherId: card.publisherId || currentUserId || '',
      assigneeId: assigneeId !== undefined ? assigneeId : card.assigneeId,
      assigneeIds:
        assigneeIds && assigneeIds.length > 0
          ? assigneeIds
          : card.assigneeId
          ? [card.assigneeId]
          : (card.assigneeIds || []),
    };
  }, [card, currentUserId, assigneeId, assigneeIds]);

  const allowedStatuses = useMemo(() => {
    if (!effectiveCard) return [];
    return getAllowedStatusesForUser(currentUserId, effectiveCard);
  }, [effectiveCard, currentUserId]);

  const statusHint = useMemo(() => {
    if (!effectiveCard) return '';
    return getStatusPermissionHint(currentUserId, effectiveCard);
  }, [effectiveCard, currentUserId]);

  const isPublisher = isCardPublisher(currentUserId, effectiveCard);
  const isAssignee = isCardAssignee(currentUserId, effectiveCard);

  const role: CardRole =
    currentUserRole ||
    (isPublisher ? 'publisher' : isAssignee ? 'assignee' : 'viewer');

  const canEditTitle = cardPermissions.canEditTitle(role);
  const canEditDescription = cardPermissions.canEditDescription(role);
  const canChangeAssignee = cardPermissions.canChangeAssignee(role);
  const canMoveStatus =
    (isPublisher || isAssignee || cardPermissions.canMoveStatus(role)) && allowedStatuses.length > 0;
  const canDeleteCard = cardPermissions.canDeleteCard(role);

  const statusOptions: DropdownOption[] = useMemo(() => {
    const filtered = allColumns.filter((col) => {
      if (!card) return true;
      if (col.id === columnId || col.id === card.columnId) return true;
      const st = columnIdToStatus(col.id);
      return allowedStatuses.includes(st);
    });

    const opts: DropdownOption[] = filtered.map((col) => {
      const isCurrent = Boolean(card && col.id === card.columnId);
      const st = columnIdToStatus(col.id);
      const isAllowed = allowedStatuses.includes(st);
      return {
        label: isCurrent && !isAllowed ? `${col.title} (Current)` : col.title,
        value: col.id,
      };
    });

    if (role === 'publisher') {
      opts.push({
        label: '+ Add new status...',
        value: '__add_status__',
      });
    }

    return opts;
  }, [allColumns, card, columnId, allowedStatuses, role]);

  const typeOptions: DropdownOption[] = useMemo(() => [
    ...displayedCardTypes.map((t) => ({
      label: t.label,
      value: t.id,
    })),
    {
      label: '+ Add new type...',
      value: '__add_type__',
    },
  ], [displayedCardTypes]);

  const handleStatusSelect = (val: string) => {
    if (val === '__add_status__') {
      setIsAddStatusOpen(true);
      return;
    }
    if (card && val !== card.columnId && !isStatusAllowedForUser(currentUserId, effectiveCard, val)) {
      return;
    }
    handleColumnSelect(val);
  };

  const handleTypeSelect = (val: string) => {
    if (val === '__add_type__') {
      setIsAddTypeOpen(true);
      return;
    }
    setType(val);
    setHasChanges(true);
  };

  const handleConfirmAddStatus = () => {
    if (!card) return;
    const { column: newCol, error } = createStatusColumn({
      title: newStatusTitle,
      projectId: card.projectId,
      color: newStatusColor,
      order: allColumns.length,
    });

    if (error || !newCol) {
      setStatusError(error || 'Status name cannot be empty.');
      return;
    }

    setCustomColumns((prev) => [...prev, newCol]);
    setColumnId(newCol.id);
    setHasChanges(true);
    onAddStatus?.(newCol);
    setIsAddStatusOpen(false);
    setNewStatusTitle('');
    setStatusError(undefined);
  };

  const handleTypeAction = (queryText?: string) => {
    if (queryText) {
      setNewTypeTitle(queryText);
    }
    setIsAddTypeOpen(true);
  };

  const handleConfirmAddType = async () => {
    const trimmedTitle = newTypeTitle.trim();
    if (!trimmedTitle) {
      setTypeError('Type name cannot be empty.');
      return;
    }

    try {
      let createdOption: CardTypeOption;

      if (hasValidNumericProjectId && numericProjectId) {
        // Direct backend API call to create task type in the project
        const backendType = await taskService.createTaskType(numericProjectId, {
          name: trimmedTitle,
        });
        createdOption = taskTypeToCardTypeOption(backendType);
      } else if (onAddType) {
        const res = await onAddType({
          id: '',
          label: trimmedTitle,
        });
        if (res && res.id) {
          createdOption = res;
        } else {
          createdOption = {
            id: trimmedTitle.toLowerCase(),
            label: trimmedTitle,
          };
        }
      } else {
        const { cardType: localType, error } = createCardType({
          label: trimmedTitle,
        });
        if (error || !localType) {
          setTypeError(error || 'Failed to create card type.');
          return;
        }
        createdOption = localType;
      }

      setCustomCardTypes((prev) => [...prev, createdOption]);
      setApiCardTypes((prev) => [...prev, createdOption]);
      setType(createdOption.id);
      setHasChanges(true);
      setIsAddTypeOpen(false);
      setNewTypeTitle('');
      setTypeError(undefined);

      // Notify parent callback if onAddType was passed and we called taskService directly
      if (onAddType && hasValidNumericProjectId) {
        try {
          await onAddType(createdOption);
        } catch {
          // Parent notification non-blocking
        }
      }
    } catch (err: unknown) {
      console.error('Failed to create task type:', err);
      const msg = err instanceof Error ? err.message : 'Failed to create task type on backend.';
      setTypeError(msg);
    }
  };

  const publisher = users.find((u) => u.id === card?.publisherId);
  const currentAssignee = users.find((u) => u.id === assigneeId);
  const currentUser = users.find((u) => u.id === currentUserId) || null;

  const relevantLogs = useMemo(() => {
    if (!activityLogs || !card) return [];
    const matched = activityLogs.filter((log) => log.cardId === card.id);
    return matched.length > 0 ? matched : activityLogs;
  }, [activityLogs, card?.id]);

  const handleTitleChange = (text: string) => {
    setTitle(text);
    setHasChanges(true);
  };

  const handleDescriptionChange = (text: string) => {
    setDescription(text);
    setHasChanges(true);
  };

  const handleColumnSelect = (colId: string) => {
    if (!canMoveStatus) return;
    if (card && colId !== card.columnId && !isStatusAllowedForUser(currentUserId, effectiveCard, colId)) {
      return;
    }
    setColumnId(colId);
    setHasChanges(true);
  };

  const handlePrioritySelect = (p: CardPriority) => {
    if (!canEditTitle) return; // Priority change tied to publisher rights
    setPriority(p);
    setHasChanges(true);
  };

  const handleAssigneeSelect = (userId: string | null) => {
    if (!canChangeAssignee) return;
    setAssigneeId(userId);
    setAssigneeIds(userId ? [userId] : []);
    setHasChanges(true);
  };

  const handleAssigneesChange = (userIds: string[]) => {
    if (!canChangeAssignee) return;
    setAssigneeIds(userIds);
    setAssigneeId(userIds[0] || null);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!card) return;
    if (columnId !== card.columnId && !isStatusAllowedForUser(currentUserId, effectiveCard, columnId)) {
      return;
    }
    const matchedType = cardTypes.find((t) => t.id === type);
    const parsedTypeId = !isNaN(Number(type)) ? Number(type) : card.typeId;

    const updated: CardType = {
      ...card,
      title: title.trim() || card.title,
      description: description.trim(),
      columnId,
      assigneeId,
      assigneeIds,
      priority,
      type: type || card.type || 'task',
      typeId: parsedTypeId,
      typeName: matchedType ? matchedType.label : card.typeName,
      updatedAt: new Date().toISOString(),
    };
    onSave?.(updated);
  };

  const handleDeletePress = () => {
    setDeleteConfirmVisible(true);
  };

  const handleConfirmDelete = () => {
    setDeleteConfirmVisible(false);
    if (!card) return;
    onDelete?.(card.id);
  };

  // Role pill styling
  const roleConfig = isPublisher && isAssignee
    ? {
        label: 'Publisher & Assignee',
        variant: 'accent' as const,
        hint: 'You are both publisher and assignee. You can set any status.',
      }
    : {
        publisher: {
          label: 'Publisher',
          variant: 'accent' as const,
          hint: 'You are the creator. You have full edit and delete permissions.',
        },
        assignee: {
          label: 'Assignee',
          variant: 'warn' as const,
          hint: 'You are assigned. You can update the status.',
        },
        viewer: {
          label: 'Viewer',
          variant: 'neutral' as const,
          hint: 'Read-only access. You cannot edit this card.',
        },
      }[role];

  if (!card) return null;

  const cardBody = (
    <View style={styles.content}>
      {/* Role & Permissions Banner */}
      <View style={[styles.roleBanner, { backgroundColor: colors.surface, borderColor: colors.line }]}>
        <View style={styles.roleBannerTop}>
          <Text variant="caption" muted style={{ fontWeight: '600' }}>
            Your Role:
          </Text>
          <Badge
            label={roleConfig.label}
            variant={roleConfig.variant}
            size="sm"
          />
        </View>
        <Text variant="caption" muted style={{ marginTop: 4 }}>
          {roleConfig.hint}
        </Text>
      </View>

      <Divider style={{ marginVertical: spacing[3] }} />

      {/* Status & Issue Type Dropdowns */}
      <View style={styles.dropdownsRow}>
        <View style={styles.dropdownColumn}>
          <Dropdown
            label="Status"
            value={columnId}
            options={statusOptions}
            onSelect={handleStatusSelect}
            placeholder="Select status..."
            disabled={!canMoveStatus}
          />
          {statusHint ? (
            <Text variant="caption" muted style={styles.helperText}>
              {statusHint}
            </Text>
          ) : null}
        </View>

        <View style={styles.dropdownColumn}>
          <Dropdown
            label="Issue Type"
            value={type}
            options={typeOptions}
            onSelect={handleTypeSelect}
            placeholder="Select type..."
            disabled={!canEditTitle}
            searchable
            searchPlaceholder="Search or add type..."
            onSearchChange={setTypeSearch}
            isLoading={isSearchingTypes}
            action={{
              label: 'Add a new type...',
              onPress: handleTypeAction,
            }}
          />
        </View>
      </View>

      {/* Accordion: Title & Description */}
      <Accordion
        title="Title & Description"
        subtitle="Summary and details"
        icon={
          <DocumentTextIcon
            size={18}
            color={colors.accent}
          />
        }
        defaultExpanded={true}
        style={{ marginBottom: spacing[3] }}
      >
        {/* Title Field */}
        <View style={styles.fieldSection}>
          <Input
            label="Title"
            value={title}
            onChangeText={handleTitleChange}
            editable={canEditTitle}
            placeholder="Issue summary..."
          />
          {!canEditTitle && (
            <Text variant="caption" muted style={styles.helperText}>
              Only the publisher can edit the card title.
            </Text>
          )}
        </View>

        {/* Description Field */}
        <View style={[styles.fieldSection, { marginBottom: 0 }]}>
          <Textarea
            label="Description"
            value={description}
            onChangeText={handleDescriptionChange}
            editable={canEditDescription}
            placeholder="Add details, acceptance criteria, or technical notes..."
            numberOfLines={4}
          />
          {!canEditDescription && (
            <Text variant="caption" muted style={styles.helperText}>
              Only the publisher can update the description.
            </Text>
          )}
        </View>
      </Accordion>

      {/* Priority Selector */}
      <View style={styles.fieldSection}>
        <Text variant="label" style={[styles.fieldLabel, { color: colors.ink }]}>
          Priority
        </Text>
        <View style={styles.pillRow}>
          {PRIORITIES.map((p) => {
            const isSelected = p.value === priority;
            return (
              <Pressable
                key={p.value}
                disabled={!canEditTitle}
                onPress={() => handlePrioritySelect(p.value)}
                style={[
                  styles.priorityPill,
                  { backgroundColor: colors.surface, borderColor: colors.line },
                  isSelected && { backgroundColor: colors.ink, borderColor: colors.ink },
                  !canEditTitle && styles.disabledField,
                ]}
              >
                <Text
                  variant="caption"
                  bold={isSelected}
                  style={{
                    color: isSelected ? colors.paper : colors.ink,
                  }}
                >
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Accordion: People & Audit */}
      <Accordion
        title="People & Audit"
        subtitle="Assignee, reporter, and creation details"
        icon={
          <PeopleIcon
            size={18}
            color={colors.accent}
          />
        }
        badge={assigneeId ? 1 : undefined}
        defaultExpanded={true}
        style={{ marginBottom: spacing[3] }}
      >
        {/* Assignee Selection */}
        <AssigneeSelect
          label="Assignee"
          multiple={false}
          selectedUserId={assigneeId}
          users={users}
          disabled={!canChangeAssignee}
          helperText={
            !canChangeAssignee
              ? 'Only the publisher can reassign this card.'
              : undefined
          }
          onSelect={(newUserId) => handleAssigneeSelect(newUserId)}
        />

        {/* Reporter / Publisher */}
        <View style={[styles.personRow, { marginTop: spacing[3] }]}>
          <View>
            <Text variant="caption" muted>
              Reporter (Publisher)
            </Text>
            <View style={styles.userDisplay}>
              <Avatar
                name={publisher?.name || 'Unknown'}
                imageUrl={publisher?.avatarUrl}
                size="xs"
              />
              <Text variant="bodySmall" bold style={{ marginLeft: spacing[2] }}>
                {publisher?.name || 'Creator'}
              </Text>
            </View>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text variant="caption" muted>
              Created
            </Text>
            <Text variant="caption" muted style={{ marginTop: 2 }}>
              {card.createdAt.split('T')[0]}
            </Text>
          </View>
        </View>
      </Accordion>

      {/* Accordion: Activity Audit Timeline */}
      {activityLogs && (
        <Accordion
          title="Activity Timeline"
          subtitle="Audit log of status changes and edits"
          icon={
            <PulseIcon
              size={18}
              color={colors.accent}
            />
          }
          badge={relevantLogs.length > 0 ? relevantLogs.length : undefined}
          defaultExpanded={false}
          style={{ marginBottom: spacing[3] }}
        >
          <ActivityLog
            logs={relevantLogs}
            users={users}
            cardId={card.id}
            title=""
            style={{ borderWidth: 0, padding: 0, backgroundColor: 'transparent' }}
          />
        </Accordion>
      )}

      {/* Accordion: Comments Discussion (Last Section) */}
      {comments && (
        <Accordion
          title="Comments"
          subtitle="Card discussion and notes"
          icon={
            <ChatBubblesIcon
              size={18}
              color={colors.accent}
            />
          }
          badge={comments.length > 0 ? comments.length : undefined}
          defaultExpanded={true}
          style={{ marginBottom: spacing[3] }}
        >
          <CommentSection
            cardId={card.id}
            comments={comments}
            users={users}
            currentUser={currentUser}
            onAddComment={onAddComment}
            onDeleteComment={onDeleteComment}
            title=""
            style={{ borderWidth: 0, padding: 0, backgroundColor: 'transparent' }}
          />
        </Accordion>
      )}
    </View>
  );

  const confirmDialog = (
    <ConfirmDialog
      visible={deleteConfirmVisible}
      title="Delete Issue?"
      itemKey={card.key}
      message={`Are you sure you want to permanently delete "${card.title}"? This action cannot be undone and will remove all comments.`}
      variant="danger"
      confirmLabel="Delete"
      cancelLabel="Keep Issue"
      onConfirm={handleConfirmDelete}
      onCancel={() => setDeleteConfirmVisible(false)}
    />
  );

  const addStatusModal = (
    <Modal
      visible={isAddStatusOpen}
      onClose={() => {
        setIsAddStatusOpen(false);
        setNewStatusTitle('');
        setStatusError(undefined);
      }}
      title="Add a new status"
      subtitle="Create a custom board column"
      presentation="dialog"
      footer={
        <View style={styles.modalFooter}>
          <Button
            label="Cancel"
            variant="ghost"
            size="sm"
            onPress={() => {
              setIsAddStatusOpen(false);
              setNewStatusTitle('');
              setStatusError(undefined);
            }}
          />
          <Button
            label="Add Status"
            variant="primary"
            size="sm"
            disabled={!newStatusTitle.trim()}
            onPress={handleConfirmAddStatus}
          />
        </View>
      }
    >
      <View style={{ gap: spacing[3] }}>
        <Input
          label="Status name"
          placeholder="e.g. In QA, Blocked, Ready"
          value={newStatusTitle}
          onChangeText={(text) => {
            setNewStatusTitle(text);
            if (statusError) setStatusError(undefined);
          }}
          error={statusError}
          autoFocus
        />

        <View>
          <Text variant="label" style={[styles.fieldLabel, { color: colors.ink }]}>
            Status Color
          </Text>
          <View style={styles.colorPalette}>
            {PRESET_STATUS_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setNewStatusColor(c)}
                accessibilityRole="button"
                accessibilityLabel={`Color ${c}`}
                style={[
                  styles.colorSwatch,
                  {
                    backgroundColor: c,
                    borderColor: newStatusColor === c ? colors.ink : 'transparent',
                  },
                ]}
              >
                {newStatusColor === c && (
                  <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
                    ✓
                  </Text>
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  const addTypeModal = (
    <Modal
      visible={isAddTypeOpen}
      onClose={() => {
        setIsAddTypeOpen(false);
        setNewTypeTitle('');
        setTypeError(undefined);
      }}
      title="Add a new type"
      subtitle="Create a custom issue type"
      presentation="dialog"
      footer={
        <View style={styles.modalFooter}>
          <Button
            label="Cancel"
            variant="ghost"
            size="sm"
            onPress={() => {
              setIsAddTypeOpen(false);
              setNewTypeTitle('');
              setTypeError(undefined);
            }}
          />
          <Button
            label="Add Type"
            variant="primary"
            size="sm"
            disabled={!newTypeTitle.trim()}
            onPress={handleConfirmAddType}
          />
        </View>
      }
    >
      <View style={{ gap: spacing[3] }}>
        <Input
          label="Type name"
          placeholder="e.g. Feature, Spike, Defect"
          value={newTypeTitle}
          onChangeText={(text) => {
            setNewTypeTitle(text);
            if (typeError) setTypeError(undefined);
          }}
          error={typeError}
          autoFocus
        />
      </View>
    </Modal>
  );

  // 1. Full Screen Layout (Default)
  if (fullScreen) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.paper }, style]}>
        {/* Top Navigation Bar */}
        <View style={[styles.topBar, { backgroundColor: colors.paper, borderBottomColor: colors.line }]}>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: pressed ? colors.surface : 'transparent' },
            ]}
          >
            <ChevronBackIcon size={22} color={colors.ink} />
            <Text variant="bodySmall" bold style={{ color: colors.ink }}>
              Back
            </Text>
          </Pressable>

          <View style={styles.topBarCenter}>
            <Badge label={card.key} variant="mono" />
          </View>

          <View style={styles.topBarRight}>
            <Pressable
              onPress={toggleTheme}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              style={({ pressed }) => [
                styles.iconActionBtn,
                { backgroundColor: pressed ? colors.surface : 'transparent' },
              ]}
            >
              {isDark ? (
                <SunnyIcon size={20} color={colors.accent} />
              ) : (
                <MoonIcon size={20} color={colors.ink} />
              )}
            </Pressable>

            {canDeleteCard && (
              <Pressable
                onPress={handleDeletePress}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Delete issue"
                style={({ pressed }) => [
                  styles.iconActionBtn,
                  { backgroundColor: pressed ? colors.warnSoft : 'transparent' },
                ]}
              >
                <TrashIcon size={20} color={colors.warn} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Scrollable Form Body */}
        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {cardBody}
        </ScrollView>

        {/* Bottom Actions Bar */}
        {(canEditTitle || canEditDescription || canMoveStatus || canChangeAssignee) && (
          <View style={[styles.bottomBar, { borderTopColor: colors.line, backgroundColor: colors.surface }]}>
            {onClose && (
              <Button
                label="Cancel"
                variant="ghost"
                size="sm"
                onPress={onClose}
              />
            )}
            <Button
              label="Save Changes"
              variant="primary"
              size="sm"
              loading={loading}
              disabled={!hasChanges}
              onPress={handleSave}
            />
          </View>
        )}

        {confirmDialog}
        {addStatusModal}
        {addTypeModal}
      </View>
    );
  }

  // 2. Modal Layout (Fallback)
  return (
    <>
      <Modal
        visible={Boolean(visible)}
        onClose={onClose || (() => {})}
        presentation="bottomSheet"
        title={card.key}
        subtitle="Issue Details"
        maxHeightRatio={0.9}
        footer={
          <View style={styles.footerActions}>
            {canDeleteCard && (
              <Button
                label="Delete"
                variant="danger"
                size="sm"
                onPress={handleDeletePress}
                style={{ marginRight: 'auto' }}
              />
            )}

            {onClose && (
              <Button
                label="Cancel"
                variant="ghost"
                size="sm"
                onPress={onClose}
              />
            )}

            {(canEditTitle || canEditDescription || canMoveStatus || canChangeAssignee) && (
              <Button
                label="Save Changes"
                variant="primary"
                size="sm"
                loading={loading}
                disabled={!hasChanges}
                onPress={handleSave}
              />
            )}
          </View>
        }
      >
        {cardBody}
      </Modal>

      {confirmDialog}
      {addStatusModal}
      {addTypeModal}
    </>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.pill,
    gap: 2,
  },
  topBarCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    minWidth: 44,
    justifyContent: 'flex-end',
  },
  iconActionBtn: {
    padding: spacing[2],
    borderRadius: radius.pill,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[2],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
  },
  content: {
    paddingBottom: spacing[4],
  },
  roleBanner: {
    padding: spacing[3],
    borderRadius: radius.card,
    borderWidth: 1,
  },
  roleBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  fieldSection: {
    marginBottom: spacing[3],
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing[1],
  },
  helperText: {
    marginTop: 4,
    fontSize: 11,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  statusPill: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1] + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  statusPillSelected: {},
  priorityPill: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1] + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  priorityPillSelected: {},
  disabledField: {
    opacity: 0.5,
  },
  peopleSection: {
    padding: spacing[3],
    borderRadius: radius.card,
    borderWidth: 1,
  },
  sectionHeading: {
    letterSpacing: 0.8,
    marginBottom: spacing[3],
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  assigneePicker: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSelectPill: {
    padding: 2,
    borderRadius: radius.pill,
    marginRight: spacing[1],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarSelectPillActive: {},
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  dropdownsRow: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  dropdownColumn: {
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing[2],
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  colorSwatch: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CardDetail;
