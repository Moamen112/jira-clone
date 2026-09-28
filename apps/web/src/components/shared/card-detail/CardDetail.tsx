import { useState, useEffect, useMemo } from "react";
import type { CSSProperties, FC } from "react";
import {
  type Card as CardType,
  type CardRole,
  type CardPriority,
  type BoardColumn,
  type User,
  type Comment,
  type ActivityLog as ActivityLogType,
  type CardTypeOption,
  getCardRole,
  cardPermissions,
  getAllowedStatusesForUser,
  isStatusAllowedForUser,
  getStatusPermissionHint,
  isCardPublisher,
  isCardAssignee,
  PUBLISHER_ALLOWED_STATUSES,
  ALL_TASK_STATUSES,
  columnIdToStatus,
  createStatusColumn,
  createCardType,
  DEFAULT_CARD_TYPES,
  PRESET_STATUS_COLORS,
  handleCardTitleChange,
  useDebounce,
  taskService,
  taskTypeToCardTypeOption,
} from "@jira-clone/shared";
import { Modal } from "../modal/Modal";
import { Text, Input, Textarea, Button, Badge, Dropdown } from "../../base";
import type { DropdownOption } from "../../base";
import { AssigneeSelect } from "../assignee-select";
import { PublisherInfo } from "../publisher-info";
import { CommentSection } from "../comment-section";
import { ConfirmDialog } from "../confirm-dialog";
import { Accordion } from "../accordion";
import { ActivityLog } from "../activity-log";

export interface CreateCardData {
  title: string;
  type: string;
  columnId: string;
  priority?: CardPriority;
  assigneeId?: string | null;
  assigneeIds?: string[];
  description?: string;
  dueDate?: string;
}

export interface CardDetailProps {
  /** Visibility toggle */
  visible?: boolean;
  /** The card entity to view or edit (null when creating a new card) */
  card?: CardType | null;
  /** Whether the modal is in creation mode */
  isCreating?: boolean;
  /** Target column ID when creating a new card */
  targetColumnId?: string | null;
  /** Project key code (e.g. "ENG") */
  projectKey?: string;
  /** Space / Project ID */
  projectId?: string;
  /** Callback fired when creating a new card */
  onCreateCard?: (data: CreateCardData) => void | Promise<void>;
  /** Available board columns */
  columns?: BoardColumn[];
  /** Available workspace members */
  users?: User[];
  /** Card discussion comments */
  comments?: Comment[];
  /** Activity audit logs for this card */
  activityLogs?: ActivityLogType[];
  /** Callback fired when a new comment is posted */
  onAddComment?: (content: string, cardId?: string) => void | Promise<void>;
  /** Callback fired when a comment is deleted */
  onDeleteComment?: (commentId: string) => void;
  /** The logged-in user ID (used to compute permissions) */
  currentUserId?: string;
  /** Explicit role override (if precomputed) */
  currentUserRole?: CardRole;
  /** Callback fired when a new status column is added */
  onAddStatus?: (column: BoardColumn) => void;
  /** Available card types */
  cardTypes?: CardTypeOption[];
  /** Callback fired when a new card type is added */
  onAddType?: (type: CardTypeOption) => void;
  /** Close or back callback */
  onClose?: () => void;
  /** Callback fired when user saves changes */
  onSave?: (updatedCard: CardType) => void | Promise<void>;
  /** Callback fired when user deletes the card */
  onDelete?: (cardId: string) => void | Promise<void>;
  /** Loading state for save action */
  loading?: boolean;
  /** Style override */
  style?: CSSProperties;
}

export type { CardTypeOption };

const toDateInputValue = (dateStr?: string | null): string => {
  if (!dateStr) return "";
  return dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
};

const checkIsOverdue = (dueDateStr?: string | null): boolean => {
  if (!dueDateStr) return false;
  try {
    const d = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !isNaN(d.getTime()) && d < today;
  } catch {
    return false;
  }
};

const PulseIcon: FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const ChatBubblesIcon: FC<{ size?: number }> = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}
  >
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

export const CardDetail: FC<CardDetailProps> = ({
  visible = true,
  card,
  isCreating = false,
  targetColumnId,
  projectKey,
  projectId,
  onCreateCard,
  columns = [],
  users = [],
  comments = [],
  activityLogs,
  onAddComment,
  onDeleteComment,
  currentUserId,
  currentUserRole,
  onAddStatus,
  cardTypes: passedCardTypes,
  onAddType,
  onClose,
  onSave,
  onDelete,
  loading = false,
  style,
}) => {
  // Custom columns added locally
  const [customColumns, setCustomColumns] = useState<BoardColumn[]>([]);
  const allColumns = [...(columns || []), ...customColumns];

  // Controlled form draft state
  const [draftTitle, setDraftTitle] = useState(isCreating ? "" : card?.title ?? "");
  const [draftDescription, setDraftDescription] = useState(
    isCreating ? "" : card?.description ?? ""
  );
  const [draftAssigneeId, setDraftAssigneeId] = useState<string | null>(
    isCreating ? null : card?.assigneeId ?? null
  );
  const [draftAssigneeIds, setDraftAssigneeIds] = useState<string[]>(
    isCreating
      ? []
      : card?.assigneeIds && card.assigneeIds.length > 0
        ? card.assigneeIds
        : card?.assigneeId
          ? [card.assigneeId]
          : []
  );
  const [draftColumnId, setDraftColumnId] = useState<string>(
    isCreating
      ? targetColumnId || (columns && columns.length > 0 ? columns[0].id : "")
      : card?.columnId ?? ""
  );
  // Search query for types in dropdown
  const [typeSearch, setTypeSearch] = useState("");
  const debouncedTypeSearch = useDebounce(typeSearch, 300);
  const [isSearchingTypes, setIsSearchingTypes] = useState(false);
  const [apiCardTypes, setApiCardTypes] = useState<CardTypeOption[]>([]);
  // Custom card types added locally
  const [customCardTypes, setCustomCardTypes] = useState<CardTypeOption[]>([]);

  const effectiveProjectId = projectId || card?.projectId;
  const numericProjectId = effectiveProjectId ? Number(effectiveProjectId) : undefined;
  const hasValidNumericProjectId = Boolean(
    numericProjectId && !isNaN(numericProjectId) && numericProjectId > 0
  );

  // Fetch project task types from backend API when modal opens, project changes, or debounced search changes
  useEffect(() => {
    if (!visible || !hasValidNumericProjectId || !numericProjectId) return;

    let isMounted = true;
    setIsSearchingTypes(true);

    taskService
      .getTaskTypes(numericProjectId, {
        search: debouncedTypeSearch.trim() || undefined,
        limit: "all",
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
        console.warn("Failed to fetch task types from API:", err);
      })
      .finally(() => {
        if (isMounted) setIsSearchingTypes(false);
      });

    return () => {
      isMounted = false;
    };
  }, [visible, hasValidNumericProjectId, numericProjectId, debouncedTypeSearch]);

  // Master list of all known task types for resolution & fallback
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

  // Helper to match card type to cardTypes option id
  const resolveTypeId = (typeVal?: string) => {
    if (!typeVal) return "";
    const matched = masterCardTypes.find(
      (c) =>
        c.id === typeVal ||
        c.label.toLowerCase() === typeVal.toLowerCase() ||
        (card?.typeName && c.label.toLowerCase() === card.typeName.toLowerCase())
    );
    return matched ? matched.id : typeVal;
  };

  const [draftType, setDraftType] = useState<string>(() => {
    if (isCreating) return masterCardTypes[0]?.id || "";
    return resolveTypeId(card?.type) || card?.type || "";
  });

  // Displayed types inside the dropdown panel (filtered by API or search)
  const displayedCardTypes = useMemo(() => {
    let result = apiCardTypes.length > 0 ? apiCardTypes : masterCardTypes;
    if (debouncedTypeSearch.trim() && apiCardTypes.length === 0) {
      const q = debouncedTypeSearch.trim().toLowerCase();
      result = masterCardTypes.filter((t) => t.label.toLowerCase().includes(q));
    }
    // Ensure currently selected type is present in options list so trigger can show its label
    if (draftType && !result.some((t) => t.id === draftType)) {
      const currentSelected = masterCardTypes.find((t) => t.id === draftType);
      if (currentSelected) {
        result = [currentSelected, ...result];
      }
    }
    return result;
  }, [apiCardTypes, masterCardTypes, debouncedTypeSearch, draftType]);
  const [draftDueDate, setDraftDueDate] = useState(
    isCreating ? "" : toDateInputValue(card?.dueDate)
  );
  const cardTypesKey = masterCardTypes.map((c) => c.id).join(",");
  const [cardIdTracking, setCardIdTracking] = useState<string | null>(
    isCreating
      ? `__new__:${cardTypesKey}`
      : card
        ? `${card.id}:${card.updatedAt || ""}:${card.description || ""}:${card.type || ""}:${cardTypesKey}`
        : null
  );
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Validation error states
  const [titleError, setTitleError] = useState<string | undefined>(undefined);
  const [typeError, setTypeError] = useState<string | undefined>(undefined);
  const [statusFieldError, setStatusFieldError] = useState<string | undefined>(undefined);

  // Add status modal state
  const [isAddStatusOpen, setIsAddStatusOpen] = useState(false);
  const [newStatusTitle, setNewStatusTitle] = useState("");
  const [newStatusColor, setNewStatusColor] = useState(PRESET_STATUS_COLORS[0]);
  const [statusError, setStatusError] = useState<string | undefined>(undefined);

  // Add type modal state
  const [isAddTypeOpen, setIsAddTypeOpen] = useState(false);
  const [newTypeTitle, setNewTypeTitle] = useState("");
  const [newTypeError, setNewTypeError] = useState<string | undefined>(undefined);

  // Sync state when card or creation mode changes or card details are fetched
  const targetTracking = isCreating
    ? `__new__:${cardTypesKey}`
    : card
      ? `${card.id}:${card.updatedAt || ""}:${card.description || ""}:${card.type || ""}:${cardTypesKey}`
      : null;
  if (targetTracking !== cardIdTracking) {
    setCardIdTracking(targetTracking);
    if (isCreating) {
      setDraftTitle("");
      setDraftDescription("");
      setDraftAssigneeId(null);
      setDraftAssigneeIds([]);
      setDraftColumnId(targetColumnId || (columns && columns.length > 0 ? columns[0].id : ""));
      setDraftType(cardTypes[0]?.id || "");
      setDraftDueDate("");
      setTitleError(undefined);
      setTypeError(undefined);
      setStatusFieldError(undefined);
    } else if (card) {
      setDraftTitle(card.title);
      setDraftDescription(card.description ?? "");
      setDraftAssigneeId(card.assigneeId ?? null);
      setDraftAssigneeIds(card.assigneeId ? [card.assigneeId] : []);
      setDraftColumnId(card.columnId);
      setDraftType(resolveTypeId(card.type) || card.type || "");
      setDraftDueDate(toDateInputValue(card.dueDate));
      setTitleError(undefined);
      setTypeError(undefined);
      setStatusFieldError(undefined);
    }
  }

  // Construct effective card participant info (including current draft assignee)
  const effectiveCard = useMemo(() => {
    if (!card) {
      if (isCreating && currentUserId) {
        return {
          publisherId: currentUserId,
          assigneeId: draftAssigneeId,
          assigneeIds: draftAssigneeIds,
        };
      }
      return null;
    }
    return {
      ...card,
      publisherId: card.publisherId || currentUserId || '',
      assigneeId: draftAssigneeId !== undefined ? draftAssigneeId : card.assigneeId,
      assigneeIds:
        draftAssigneeIds && draftAssigneeIds.length > 0
          ? draftAssigneeIds
          : card.assigneeId
          ? [card.assigneeId]
          : (card.assigneeIds || []),
    };
  }, [card, isCreating, currentUserId, draftAssigneeId, draftAssigneeIds]);

  // Derive allowed destination statuses for the current user
  const allowedStatuses = useMemo(() => {
    if (!effectiveCard) {
      return isCreating ? PUBLISHER_ALLOWED_STATUSES : [];
    }
    return getAllowedStatusesForUser(currentUserId, effectiveCard);
  }, [effectiveCard, isCreating, currentUserId]);

  const statusHint = useMemo(() => {
    if (!effectiveCard) {
      return isCreating
        ? "New tasks start in To Do by default. Publishers can choose To Do or Done."
        : "";
    }
    return getStatusPermissionHint(currentUserId, effectiveCard);
  }, [effectiveCard, isCreating, currentUserId]);

  const isPublisher = isCardPublisher(currentUserId, effectiveCard);
  const isAssignee = isCardAssignee(currentUserId, effectiveCard);

  // Derive permissions
  const role: CardRole =
    currentUserRole ||
    (isPublisher ? 'publisher' : isAssignee ? 'assignee' : 'viewer');

  const canEditTitle = isCreating ? true : cardPermissions.canEditTitle(role);
  const canEditDescription = isCreating ? true : cardPermissions.canEditDescription(role);
  const canMoveStatus = isCreating
    ? true
    : (isPublisher || isAssignee || cardPermissions.canMoveStatus(role)) && allowedStatuses.length > 0;
  const canChangeAssignee = isCreating ? true : cardPermissions.canChangeAssignee(role);
  const canEditDates = isCreating ? true : cardPermissions.canEditDates(role);
  const canDeleteCard = isCreating ? false : cardPermissions.canDeleteCard(role);

  const isOverdue = draftDueDate ? checkIsOverdue(draftDueDate) : false;

  const currentUser = users.find((u) => u.id === currentUserId) || null;
  const publisher =
    users.find((u) => u.id === (card?.publisherId || currentUserId)) ||
    currentUser || {
      id: card?.publisherId || currentUserId || "unknown",
      name: "Current User",
      email: "",
      initials: "CU",
    };

  const relevantLogs =
    !isCreating && card && activityLogs
      ? activityLogs.filter((log) => log.cardId === card.id)
      : [];
  const historyLogs = relevantLogs.filter((log) =>
    [
      "CARD_CREATED",
      "STATUS_CHANGED",
      "ASSIGNEE_CHANGED",
      "TITLE_UPDATED",
      "DESCRIPTION_UPDATED",
    ].includes(log.action)
  );
  const relevantComments =
    !isCreating && card && comments
      ? comments.filter((c) => c.cardId === card.id)
      : [];

  const roleLabel =
    isPublisher && isAssignee
      ? "Publisher & Assignee"
      : role === "publisher"
        ? "Publisher"
        : role === "assignee"
          ? "Assignee"
          : "Viewer";

  const statusOptions: DropdownOption[] = allColumns
    .filter((col) => {
      if (isCreating) {
        const st = columnIdToStatus(col.id);
        return allowedStatuses.includes(st);
      }
      if (!card) return true;
      // Always include current column so it displays in the selector
      if (col.id === draftColumnId || col.id === card.columnId) {
        return true;
      }
      const st = columnIdToStatus(col.id);
      return allowedStatuses.includes(st);
    })
    .map((col) => {
      const colColor =
        col.color ||
        (col.id.includes("done")
          ? "#10B981"
          : col.id.includes("review")
            ? "var(--color-accent)"
            : col.id.includes("progress")
              ? "#3B82F6"
              : "var(--color-ink-muted)");

      const isCurrent = Boolean(card && col.id === card.columnId);
      const st = columnIdToStatus(col.id);
      const isAllowed = allowedStatuses.includes(st);

      let label = col.title;
      if (isCurrent && !isAllowed) {
        label = `${col.title} (Current)`;
      }

      return {
        label,
        value: col.id,
        icon: (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "var(--radius-pill)",
              backgroundColor: colColor,
              display: "inline-block",
              flexShrink: 0,
            }}
          />
        ),
      };
    });

  const typeOptions: DropdownOption[] = displayedCardTypes.map((t) => ({
    label: t.label,
    value: t.id,
  }));

  const currentStatusColumn = allColumns.find((c) => c.id === draftColumnId);
  const currentStatusColor =
    currentStatusColumn?.color ||
    (draftColumnId.includes("done")
      ? "#10B981"
      : draftColumnId.includes("review")
        ? "var(--color-accent)"
        : draftColumnId.includes("progress")
          ? "#3B82F6"
          : "var(--color-ink-muted)");

  const hasChanges =
    !isCreating &&
    Boolean(card) &&
    (draftTitle !== card!.title ||
      draftDescription !== (card!.description ?? "") ||
      draftAssigneeId !== (card!.assigneeId ?? null) ||
      draftColumnId !== card!.columnId ||
      draftType !== (resolveTypeId(card!.type) || card!.type || "") ||
      draftDueDate !== toDateInputValue(card!.dueDate));

  const handleCreateSubmit = async () => {
    if (!onCreateCard) return;

    let isValid = true;
    const titleVal = handleCardTitleChange(draftTitle);
    if (titleVal.error) {
      setTitleError(titleVal.error);
      isValid = false;
    } else {
      setTitleError(undefined);
    }

    if (!draftType) {
      setTypeError("Issue type is required.");
      isValid = false;
    } else {
      setTypeError(undefined);
    }

    if (!draftColumnId) {
      setStatusFieldError("Status is required.");
      isValid = false;
    } else {
      setStatusFieldError(undefined);
    }

    if (!isValid) return;

    try {
      setIsSaving(true);
      await onCreateCard({
        title: draftTitle.trim(),
        type: draftType,
        columnId: draftColumnId,
        priority: "medium",
        assigneeId: draftAssigneeId,
        assigneeIds: draftAssigneeIds,
        description: draftDescription.trim() || undefined,
        dueDate: draftDueDate || undefined,
      });
      onClose?.();
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!onSave || !hasChanges || !card) return;

    if (draftColumnId && card.columnId !== draftColumnId) {
      if (!isStatusAllowedForUser(currentUserId, effectiveCard, draftColumnId)) {
        setStatusFieldError(statusHint || "You are not allowed to transition this card to this status.");
        return;
      }
    }

    try {
      setIsSaving(true);
      const matchedType = cardTypes.find((t) => t.id === draftType);
      const parsedTypeId = !isNaN(Number(draftType)) ? Number(draftType) : card.typeId;
      await onSave({
        ...card,
        title: draftTitle.trim() || card.title,
        description: draftDescription.trim() || undefined,
        assigneeId: draftAssigneeId,
        assigneeIds: draftAssigneeIds,
        columnId: draftColumnId || card.columnId,
        type: draftType || card.type || "task",
        typeId: parsedTypeId,
        typeName: matchedType ? matchedType.label : card.typeName,
        dueDate: draftDueDate ? draftDueDate : undefined,
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddStatus = () => {
    const { column: newCol, error } = createStatusColumn({
      title: newStatusTitle,
      projectId: projectId || card?.projectId || "proj-default",
      color: newStatusColor,
      order: allColumns.length,
    });

    if (error || !newCol) {
      setStatusError(error || "Status name cannot be empty.");
      return;
    }

    setCustomColumns((prev) => [...prev, newCol]);
    setDraftColumnId(newCol.id);
    onAddStatus?.(newCol);
    setIsAddStatusOpen(false);
    setNewStatusTitle("");
    setStatusError(undefined);
    setStatusFieldError(undefined);
  };

  const handleAddType = async () => {
    const trimmedTitle = newTypeTitle.trim();
    if (!trimmedTitle) {
      setNewTypeError("Type name cannot be empty.");
      return;
    }

    try {
      setIsSaving(true);
      let createdOption: CardTypeOption;

      if (hasValidNumericProjectId && numericProjectId) {
        // Direct backend API call to create task type in the project
        const backendType = await taskService.createTaskType(numericProjectId, {
          name: trimmedTitle,
        });
        createdOption = {
          id: String(backendType.id),
          label: backendType.name,
        };
      } else if (onAddType) {
        const res = await onAddType({
          id: "",
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
          setNewTypeError(error || "Failed to create card type.");
          return;
        }
        createdOption = localType;
      }

      setCustomCardTypes((prev) => [...prev, createdOption]);
      setApiCardTypes((prev) => [...prev, createdOption]);
      setDraftType(createdOption.id);
      setIsAddTypeOpen(false);
      setNewTypeTitle("");
      setNewTypeError(undefined);
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
      console.error("Failed to create task type:", err);
      const msg =
        err instanceof Error ? err.message : "Failed to create task type on backend.";
      setNewTypeError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || !card) return;
    await onDelete(card.id);
    setDeleteConfirmVisible(false);
    onClose?.();
  };

  if (!visible || (!isCreating && !card)) return null;

  return (
    <>
      <Modal
        visible={visible}
        onClose={onClose ?? (() => {})}
        presentation="dialog"
        contentStyle={{
          maxWidth: 1040,
          width: "95%",
          maxHeight: "90vh",
          minHeight: isCreating ? "min(680px, 88vh)" : undefined,
          ...style,
        }}
        footer={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div>
              {!isCreating && canDeleteCard && onDelete && (
                <Button
                  label="Delete Card"
                  variant="danger"
                  size="sm"
                  onPress={() => setDeleteConfirmVisible(true)}
                />
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Button
                label="Cancel"
                variant="ghost"
                size="sm"
                onPress={onClose}
              />
              {isCreating ? (
                <Button
                  label="Create Card"
                  variant="primary"
                  size="sm"
                  disabled={!draftTitle.trim() || !draftType || !draftColumnId}
                  loading={isSaving || loading}
                  onPress={handleCreateSubmit}
                />
              ) : (
                <Button
                  label="Save Changes"
                  variant="primary"
                  size="sm"
                  disabled={!hasChanges}
                  loading={isSaving || loading}
                  onPress={handleSave}
                />
              )}
            </div>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Top Header Row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              paddingBottom: 12,
              borderBottom: "1px solid var(--color-line)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Badge
                label={isCreating ? (projectKey ? `${projectKey}-NEW` : "NEW") : (card?.key || "")}
                variant="mono"
                size="md"
              />
              {currentStatusColumn && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "3px 10px",
                    borderRadius: "var(--radius-pill)",
                    backgroundColor: currentStatusColor ? `${currentStatusColor}18` : "var(--color-surface)",
                    color: currentStatusColor || "var(--color-ink)",
                    border: `1px solid ${currentStatusColor ? `${currentStatusColor}35` : "var(--color-line)"}`,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "var(--radius-pill)",
                      backgroundColor: currentStatusColor,
                    }}
                  />
                  {currentStatusColumn.title}
                </span>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Badge
                label={isCreating ? "Publisher" : roleLabel}
                variant={role === "publisher" || isCreating ? "accent" : "neutral"}
                size="sm"
              />
            </div>
          </div>

          {/* Main 2-Column Grid Layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(260px, 320px)",
              gap: 28,
              alignItems: "flex-start",
              minHeight: isCreating ? 500 : undefined,
            }}
          >
            {/* Left Column: Title, Description, Comments & Activity */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Title Input or Text */}
              <div>
                <Text
                  variant="caption"
                  muted
                  bold
                  style={{ display: "block", marginBottom: 4 }}
                >
                  TITLE {canEditTitle ? "" : "(read-only)"}
                </Text>
                {canEditTitle ? (
                  <Input
                    value={draftTitle}
                    onChangeText={(text) => {
                      setDraftTitle(text);
                      if (titleError) setTitleError(undefined);
                    }}
                    error={titleError}
                    placeholder="Enter card title..."
                    containerStyle={{ marginBottom: 0 }}
                    autoFocus={isCreating}
                  />
                ) : (
                  <Text variant="heading" bold style={{ display: "block" }}>
                    {draftTitle}
                  </Text>
                )}
              </div>

              {/* Description Input or Text */}
              <div>
                <Text
                  variant="caption"
                  muted
                  bold
                  style={{ display: "block", marginBottom: 4 }}
                >
                  DESCRIPTION {canEditDescription ? "" : "(read-only)"}
                </Text>
                {canEditDescription ? (
                  <Textarea
                    value={draftDescription}
                    onChangeText={setDraftDescription}
                    placeholder="Add a more detailed description of what needs to be done..."
                    rows={isCreating ? 7 : 4}
                    style={{ minHeight: isCreating ? 160 : undefined }}
                    containerStyle={{ marginBottom: 0 }}
                  />
                ) : (
                  <Text
                    variant="bodySmall"
                    style={{ display: "block", whiteSpace: "pre-wrap" }}
                  >
                    {draftDescription || "No description provided."}
                  </Text>
                )}
              </div>

              {/* Activity Audit Timeline (Only shown when viewing existing card) */}
              {!isCreating && activityLogs && (
                <div
                  style={{
                    paddingTop: 8,
                    borderTop: "1px solid var(--color-line)",
                  }}
                >
                  <Accordion
                    title="Activity History"
                    subtitle="Audit log of status changes and edits"
                    icon={<PulseIcon size={18} />}
                    badge={
                      historyLogs.length > 0 ? historyLogs.length : undefined
                    }
                    defaultExpanded={false}
                  >
                    <ActivityLog
                      logs={historyLogs}
                      users={users}
                      cardId={card?.id || ""}
                      title=""
                      bordered={false}
                    />
                  </Accordion>
                </div>
              )}

              {/* Comments (Only shown when viewing existing card) */}
              {!isCreating && (
                <div
                  style={{
                    paddingTop: 8,
                    borderTop: "1px solid var(--color-line)",
                  }}
                >
                  <Accordion
                    title="Comments"
                    subtitle="Card discussion and notes"
                    icon={<ChatBubblesIcon size={18} />}
                    badge={
                      relevantComments.length > 0
                        ? relevantComments.length
                        : undefined
                    }
                    defaultExpanded={true}
                  >
                    <div style={{ paddingTop: 4 }}>
                      <CommentSection
                        cardId={card?.id || ""}
                        comments={relevantComments}
                        users={users}
                        currentUser={currentUser}
                        title=""
                        style={{ padding: 0 }}
                        onAddComment={onAddComment}
                        onDeleteComment={onDeleteComment}
                      />
                    </div>
                  </Accordion>
                </div>
              )}
            </div>

            {/* Right Column: Properties & Metadata */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                backgroundColor: "var(--color-paper)",
                border: "1px solid var(--color-line)",
                borderRadius: "var(--radius-card)",
                padding: 16,
              }}
            >
              <Text variant="subheading" bold>
                Properties
              </Text>

              {/* Assignee Field */}
              <div>
                <AssigneeSelect
                  label="Assignee"
                  users={users}
                  selectedUserId={draftAssigneeId}
                  multiple={false}
                  disabled={!canChangeAssignee}
                  onSelect={(id) => {
                    setDraftAssigneeId(id);
                    setDraftAssigneeIds(id ? [id] : []);
                  }}
                  helperText={
                    !isCreating && !canChangeAssignee
                      ? "Only publishers can reassign this card."
                      : undefined
                  }
                  placeholder="Unassigned"
                />
              </div>

              {/* Status Selector (Mandatory) */}
              {allColumns.length > 0 && (
                <div>
                  <Dropdown
                    label="Status"
                    value={draftColumnId}
                    options={statusOptions}
                    onSelect={(val) => {
                      if (!isCreating && card && !isStatusAllowedForUser(currentUserId, card, val)) {
                        setStatusFieldError(statusHint || "You do not have permission to choose this status.");
                        return;
                      }
                      setDraftColumnId(val);
                      if (statusFieldError) setStatusFieldError(undefined);
                    }}
                    error={statusFieldError}
                    disabled={!canMoveStatus}
                    placeholder="Select status..."
                    style={{ marginBottom: 0 }}
                  />
                  {statusHint && (
                    <Text
                      variant="caption"
                      muted
                      style={{
                        display: "block",
                        marginTop: 4,
                        fontSize: 11,
                        lineHeight: "14px",
                      }}
                    >
                      {statusHint}
                    </Text>
                  )}
                </div>
              )}

              {/* Type Selector (Mandatory) */}
              <Dropdown
                label="Type"
                value={draftType}
                options={typeOptions}
                onSelect={(val) => {
                  setDraftType(val);
                  if (typeError) setTypeError(undefined);
                }}
                error={typeError}
                disabled={!canEditTitle}
                placeholder="Select type..."
                searchable
                searchPlaceholder="Search or add type..."
                onSearchChange={setTypeSearch}
                isLoading={isSearchingTypes}
                style={{ marginBottom: 0 }}
                action={{
                  label: "Add a new type",
                  onPress: (query) => {
                    setNewTypeTitle(query || "");
                    setNewTypeError(undefined);
                    setIsAddTypeOpen(true);
                  },
                }}
              />

              {/* Due Date (Optional) */}
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <Text variant="label" bold>
                      Due Date
                    </Text>
                    {isOverdue && (
                      <Badge label="Overdue" variant="warn" size="sm" />
                    )}
                  </div>
                  {canEditDates && draftDueDate && (
                    <button
                      type="button"
                      onClick={() => setDraftDueDate("")}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        fontSize: 11,
                        color: "var(--color-ink-muted)",
                        textDecoration: "underline",
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
                {canEditDates ? (
                  <Input
                    type="date"
                    value={draftDueDate}
                    onChangeText={setDraftDueDate}
                    containerStyle={{ marginBottom: 0 }}
                    inputWrapperStyle={{ minHeight: 36, paddingInline: 8 }}
                    style={{ fontSize: 13 }}
                  />
                ) : (
                  <Text
                    variant="bodySmall"
                    color={
                      draftDueDate
                        ? isOverdue
                          ? "var(--color-warn)"
                          : "var(--color-ink)"
                        : "var(--color-ink-muted)"
                    }
                  >
                    {draftDueDate
                      ? new Date(draftDueDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "None"}
                  </Text>
                )}
              </div>

              {/* Publisher Info */}
              <div
                style={{
                  paddingTop: 8,
                  borderTop: "1px solid var(--color-line)",
                }}
              >
                <PublisherInfo
                  publisher={publisher}
                  createdAt={card?.createdAt || new Date().toISOString()}
                  variant="card"
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      {!isCreating && card && (
        <ConfirmDialog
          visible={deleteConfirmVisible}
          title="Delete Card"
          message={`Are you sure you want to permanently delete [${card.key}] "${card.title}"? This cannot be undone.`}
          itemKey={card.key}
          variant="danger"
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmVisible(false)}
        />
      )}

      {/* Add New Type Modal */}
      <Modal
        visible={isAddTypeOpen}
        onClose={() => setIsAddTypeOpen(false)}
        title="Add a new type"
        subtitle="Create a custom card type"
        presentation="dialog"
        contentStyle={{ maxWidth: 440 }}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button
              label="Cancel"
              variant="secondary"
              size="sm"
              onPress={() => setIsAddTypeOpen(false)}
            />
            <Button
              label="Add Type"
              variant="primary"
              size="sm"
              disabled={!newTypeTitle.trim()}
              onPress={handleAddType}
            />
          </div>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddType();
          }}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <Input
            label="Type name"
            placeholder="e.g. Feature, Spike, Defect"
            value={newTypeTitle}
            onChangeText={(text) => {
              setNewTypeTitle(text);
              if (newTypeError) setNewTypeError(undefined);
            }}
            error={newTypeError}
            autoFocus
            containerStyle={{ marginBottom: 0 }}
          />
        </form>
      </Modal>

      {/* Add New Status Modal */}
      <Modal
        visible={isAddStatusOpen}
        onClose={() => setIsAddStatusOpen(false)}
        title="Add a new status"
        subtitle="Create a new status column for your workspace"
        presentation="dialog"
        contentStyle={{ maxWidth: 440 }}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button
              label="Cancel"
              variant="secondary"
              size="sm"
              onPress={() => setIsAddStatusOpen(false)}
            />
            <Button
              label="Add Status"
              variant="primary"
              size="sm"
              disabled={!newStatusTitle.trim()}
              onPress={handleAddStatus}
            />
          </div>
        }
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddStatus();
          }}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
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
            containerStyle={{ marginBottom: 0 }}
          />

          <div>
            <Text variant="label" style={{ display: "block", marginBottom: 8 }}>
              Status Color
            </Text>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PRESET_STATUS_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewStatusColor(c)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "var(--radius-pill)",
                    backgroundColor: c,
                    border:
                      newStatusColor === c
                        ? "2px solid var(--color-ink)"
                        : "2px solid transparent",
                    cursor: "pointer",
                    padding: 0,
                    outline: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label={`Color ${c}`}
                >
                  {newStatusColor === c && (
                    <span
                      style={{
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: "bold",
                      }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default CardDetail;
