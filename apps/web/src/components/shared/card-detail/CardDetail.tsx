import { useState } from "react";
import type { CSSProperties, FC } from "react";
import {
  type Card as CardType,
  type CardRole,
  type CardPriority,
  type BoardColumn,
  type User,
  type Comment,
  type ActivityLog as ActivityLogType,
  getCardRole,
  cardPermissions,
} from "@jira-clone/shared";
import { Modal } from "../modal/Modal";
import { Text, Input, Textarea, Button, Badge, Dropdown } from "../../base";
import type { DropdownOption } from "../../base";
import { PriorityBadge } from "../priority-badge";
import { AssigneeSelect } from "../assignee-select";
import { PublisherInfo } from "../publisher-info";
import { StatusBar } from "../status-bar";
import { CommentSection } from "../comment-section";
import { ConfirmDialog } from "../confirm-dialog";
import { Accordion } from "../accordion";
import { ActivityLog } from "../activity-log";

export interface CardDetailProps {
  /** Visibility toggle */
  visible?: boolean;
  /** The card entity to view or edit */
  card: CardType | null;
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

export interface CardTypeOption {
  id: string;
  label: string;
  color: string;
}

const DEFAULT_CARD_TYPES: CardTypeOption[] = [
  { id: "task", label: "Task", color: "#3B82F6" },
  { id: "bug", label: "Bug", color: "#EF4444" },
  { id: "story", label: "Story", color: "#10B981" },
  { id: "epic", label: "Epic", color: "#8B5CF6" },
];

const PRESET_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#64748B",
];

const PRIORITIES: CardPriority[] = [
  "lowest",
  "low",
  "medium",
  "high",
  "highest",
];

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
  columns = [],
  users = [],
  comments = [],
  activityLogs,
  onAddComment,
  onDeleteComment,
  currentUserId,
  currentUserRole,
  onAddStatus,
  onClose,
  onSave,
  onDelete,
  loading = false,
  style,
}) => {
  // Controlled form draft state initialized directly from card
  const [draftTitle, setDraftTitle] = useState(card?.title ?? "");
  const [draftDescription, setDraftDescription] = useState(
    card?.description ?? "",
  );
  const [draftColumnId, setDraftColumnId] = useState(card?.columnId ?? "");
  const [draftAssigneeId, setDraftAssigneeId] = useState<string | null>(
    card?.assigneeId ?? null,
  );
  const [draftAssigneeIds, setDraftAssigneeIds] = useState<string[]>(
    card?.assigneeIds && card.assigneeIds.length > 0
      ? card.assigneeIds
      : card?.assigneeId
        ? [card.assigneeId]
        : [],
  );
  const [draftPriority, setDraftPriority] = useState<CardPriority>(
    card?.priority ?? "medium",
  );
  const [cardTypes, setCardTypes] = useState<CardTypeOption[]>(DEFAULT_CARD_TYPES);
  const [draftType, setDraftType] = useState<string>(card?.type || "task");
  const [draftStartDate, setDraftStartDate] = useState(
    toDateInputValue(card?.startDate),
  );
  const [draftDueDate, setDraftDueDate] = useState(
    toDateInputValue(card?.dueDate),
  );
  const [cardIdTracking, setCardIdTracking] = useState(card?.id);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Dynamic custom columns & modals
  const [customColumns, setCustomColumns] = useState<BoardColumn[]>([]);

  // Add status modal state
  const [isAddStatusOpen, setIsAddStatusOpen] = useState(false);
  const [newStatusTitle, setNewStatusTitle] = useState("");
  const [newStatusColor, setNewStatusColor] = useState("#3B82F6");
  const [statusError, setStatusError] = useState<string | undefined>(undefined);

  // Add type modal state
  const [isAddTypeOpen, setIsAddTypeOpen] = useState(false);
  const [newTypeTitle, setNewTypeTitle] = useState("");
  const [newTypeColor, setNewTypeColor] = useState("#6366F1");
  const [typeError, setTypeError] = useState<string | undefined>(undefined);

  // Sync state when a different card is opened without cascading effects
  if (card && card.id !== cardIdTracking) {
    setCardIdTracking(card.id);
    setDraftTitle(card.title);
    setDraftDescription(card.description ?? "");
    setDraftColumnId(card.columnId);
    setDraftAssigneeId(card.assigneeId ?? null);
    setDraftAssigneeIds(
      card.assigneeIds && card.assigneeIds.length > 0
        ? card.assigneeIds
        : card.assigneeId
          ? [card.assigneeId]
          : [],
    );
    setDraftPriority(card.priority);
    setDraftType(card.type || "task");
    setDraftStartDate(toDateInputValue(card.startDate));
    setDraftDueDate(toDateInputValue(card.dueDate));
  }

  if (!card || !visible) return null;

  // Derive permissions
  const role: CardRole =
    currentUserRole ||
    (currentUserId ? getCardRole(currentUserId, card) : "viewer");

  const canEditTitle = cardPermissions.canEditTitle(role);
  const canEditDescription = cardPermissions.canEditDescription(role);
  const canChangeAssignee = cardPermissions.canChangeAssignee(role);
  const canMoveStatus = cardPermissions.canMoveStatus(role);
  const canEditDates = cardPermissions.canEditDates(role);
  const canDeleteCard = cardPermissions.canDeleteCard(role);

  const isOverdue = draftDueDate ? checkIsOverdue(draftDueDate) : false;

  const publisher = users.find((u) => u.id === card.publisherId) || {
    id: card.publisherId,
    name: "Unknown User",
    email: "",
    initials: "?",
  };

  const currentUser = users.find((u) => u.id === currentUserId) || null;
  const currentColumn = columns.find((c) => c.id === draftColumnId);
  const relevantLogs = activityLogs
    ? activityLogs.filter((log) => log.cardId === card.id)
    : [];
  const relevantComments = comments
    ? comments.filter((c) => c.cardId === card.id)
    : [];

  const roleLabel =
    role === "publisher"
      ? "Publisher"
      : role === "assignee"
        ? "Assignee"
        : "Viewer";

  const allColumns = [
    ...columns,
    ...customColumns.filter((c) => !columns.some((col) => col.id === c.id)),
  ];

  const statusOptions: DropdownOption[] = allColumns.map((col) => ({
    label: col.title,
    value: col.id,
    icon: (
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: "var(--radius-pill)",
          backgroundColor:
            col.color ||
            (col.id.includes("done")
              ? "#10B981"
              : col.id.includes("review")
                ? "var(--color-accent)"
                : col.id.includes("progress")
                  ? "#3B82F6"
                  : "var(--color-ink-muted)"),
          display: "inline-block",
          flexShrink: 0,
        }}
      />
    ),
  }));

  const typeOptions: DropdownOption[] = cardTypes.map((t) => ({
    label: t.label,
    value: t.id,
    icon: (
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: t.id === "bug" ? 999 : 2,
          backgroundColor: t.color,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
    ),
  }));

  const priorityOptions: DropdownOption[] = PRIORITIES.map((p) => ({
    label: p.charAt(0).toUpperCase() + p.slice(1),
    value: p,
    icon: <PriorityBadge priority={p} size="sm" />,
  }));

  const hasChanges =
    draftTitle !== card.title ||
    draftDescription !== (card.description ?? "") ||
    draftColumnId !== card.columnId ||
    draftAssigneeId !== (card.assigneeId ?? null) ||
    draftPriority !== card.priority ||
    draftType !== (card.type || "task") ||
    draftStartDate !== toDateInputValue(card.startDate) ||
    draftDueDate !== toDateInputValue(card.dueDate) ||
    JSON.stringify(draftAssigneeIds) !==
      JSON.stringify(
        card.assigneeIds || (card.assigneeId ? [card.assigneeId] : []),
      );

  const handleSave = async () => {
    if (!onSave || !hasChanges) return;

    try {
      setIsSaving(true);
      await onSave({
        ...card,
        title: draftTitle.trim() || card.title,
        description: draftDescription.trim() || undefined,
        columnId: draftColumnId,
        assigneeId: draftAssigneeId,
        assigneeIds: draftAssigneeIds,
        priority: draftPriority,
        type: draftType,
        startDate: draftStartDate ? draftStartDate : undefined,
        dueDate: draftDueDate ? draftDueDate : undefined,
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddStatus = () => {
    const trimmed = newStatusTitle.trim();
    if (!trimmed) {
      setStatusError("Status name cannot be empty.");
      return;
    }

    const newColId = `col-${Date.now()}`;
    const newCol: BoardColumn = {
      id: newColId,
      projectId: card.projectId,
      title: trimmed,
      color: newStatusColor,
      order: allColumns.length,
    };

    setCustomColumns((prev) => [...prev, newCol]);
    setDraftColumnId(newColId);
    onAddStatus?.(newCol);
    setIsAddStatusOpen(false);
    setNewStatusTitle("");
    setStatusError(undefined);
  };

  const handleAddType = () => {
    const trimmed = newTypeTitle.trim();
    if (!trimmed) {
      setTypeError("Type name cannot be empty.");
      return;
    }

    const newTypeId = trimmed.toLowerCase().replace(/\s+/g, "-");
    const newType: CardTypeOption = {
      id: newTypeId,
      label: trimmed,
      color: newTypeColor,
    };

    setCardTypes((prev) => [...prev, newType]);
    setDraftType(newTypeId);
    setIsAddTypeOpen(false);
    setNewTypeTitle("");
    setTypeError(undefined);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    await onDelete(card.id);
    setDeleteConfirmVisible(false);
    onClose?.();
  };

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
              {canDeleteCard && onDelete && (
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
              <Button
                label="Save Changes"
                variant="primary"
                size="sm"
                disabled={!hasChanges}
                loading={isSaving || loading}
                onPress={handleSave}
              />
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
              <Badge label={card.key} variant="mono" size="md" />
              <PriorityBadge priority={draftPriority} size="md" />
              {currentColumn && <StatusBar status={currentColumn} size="md" />}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Badge
                label={roleLabel}
                variant={role === "publisher" ? "accent" : "neutral"}
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
            }}
          >
            {/* Left Column: Title, Description, Comments */}
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
                    onChangeText={setDraftTitle}
                    placeholder="Enter card title..."
                    containerStyle={{ marginBottom: 0 }}
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
                    rows={3}
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

              {/* Activity Audit Timeline */}
              {activityLogs && (
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
                      relevantLogs.length > 0 ? relevantLogs.length : undefined
                    }
                    defaultExpanded={false}
                  >
                    <ActivityLog
                      logs={relevantLogs}
                      users={users}
                      cardId={card.id}
                      title=""
                      bordered={false}
                      style={{ padding: 0 }}
                    />
                  </Accordion>
                </div>
              )}

              {/* Discussion & Comments */}
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
                      cardId={card.id}
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
                  selectedUserIds={draftAssigneeIds}
                  multiple
                  disabled={!canChangeAssignee}
                  onSelect={(id) => {
                    setDraftAssigneeId(id);
                    setDraftAssigneeIds(id ? [id] : []);
                  }}
                  onSelectMultiple={(ids) => {
                    setDraftAssigneeIds(ids);
                    setDraftAssigneeId(ids[0] || null);
                  }}
                  helperText={
                    canChangeAssignee
                      ? undefined
                      : "Only publishers can reassign this card."
                  }
                />
              </div>

              {/* Status / Column Selector */}
              {allColumns.length > 0 && (
                <Dropdown
                  label="Status"
                  value={draftColumnId}
                  options={statusOptions}
                  onSelect={(val) => setDraftColumnId(val)}
                  disabled={!canMoveStatus}
                  placeholder="Select status..."
                  style={{ marginBottom: 0 }}
                  action={{
                    label: "Add a new status",
                    onPress: () => {
                      setNewStatusTitle("");
                      setStatusError(undefined);
                      setIsAddStatusOpen(true);
                    },
                  }}
                />
              )}

              {/* Type Selector */}
              <Dropdown
                label="Type"
                value={draftType}
                options={typeOptions}
                onSelect={(val) => setDraftType(val)}
                disabled={!canEditTitle}
                placeholder="Select type..."
                style={{ marginBottom: 0 }}
                action={{
                  label: "Add a new type",
                  onPress: () => {
                    setNewTypeTitle("");
                    setTypeError(undefined);
                    setIsAddTypeOpen(true);
                  },
                }}
              />

              {/* Priority Selector */}
              <Dropdown
                label="Priority"
                value={draftPriority}
                options={priorityOptions}
                onSelect={(val) => setDraftPriority(val as CardPriority)}
                disabled={!canEditTitle}
                placeholder="Select priority..."
                style={{ marginBottom: 0 }}
              />

              {/* Dates: Start Date & Due Date */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {/* Start Date */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <Text variant="label" bold>
                      Start Date
                    </Text>
                    {canEditDates && draftStartDate && (
                      <button
                        type="button"
                        onClick={() => setDraftStartDate("")}
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
                      value={draftStartDate}
                      onChangeText={setDraftStartDate}
                      containerStyle={{ marginBottom: 0 }}
                      inputWrapperStyle={{ minHeight: 36, paddingInline: 8 }}
                      style={{ fontSize: 13 }}
                    />
                  ) : (
                    <Text
                      variant="bodySmall"
                      color={
                        draftStartDate
                          ? "var(--color-ink)"
                          : "var(--color-ink-muted)"
                      }
                    >
                      {draftStartDate
                        ? new Date(draftStartDate).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : "None"}
                    </Text>
                  )}
                </div>

                {/* Due Date */}
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
              </div>

              {/* Publisher Info */}
              <div style={{ paddingTop: 8, borderTop: '1px solid var(--color-line)' }}>
                <PublisherInfo publisher={publisher} createdAt={card.createdAt} />
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
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
              {PRESET_COLORS.map((c) => (
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
              if (typeError) setTypeError(undefined);
            }}
            error={typeError}
            autoFocus
            containerStyle={{ marginBottom: 0 }}
          />

          <div>
            <Text variant="label" style={{ display: "block", marginBottom: 8 }}>
              Badge Color
            </Text>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewTypeColor(c)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "var(--radius-pill)",
                    backgroundColor: c,
                    border:
                      newTypeColor === c
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
                  {newTypeColor === c && (
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
