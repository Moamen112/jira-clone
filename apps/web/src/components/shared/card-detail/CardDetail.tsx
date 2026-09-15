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
import { Text, Input, Textarea, Button, Badge } from "../../base";
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
  const [draftStartDate, setDraftStartDate] = useState(
    toDateInputValue(card?.startDate),
  );
  const [draftDueDate, setDraftDueDate] = useState(
    toDateInputValue(card?.dueDate),
  );
  const [cardIdTracking, setCardIdTracking] = useState(card?.id);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const hasChanges =
    draftTitle !== card.title ||
    draftDescription !== (card.description ?? "") ||
    draftColumnId !== card.columnId ||
    draftAssigneeId !== (card.assigneeId ?? null) ||
    draftPriority !== card.priority ||
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
        startDate: draftStartDate ? draftStartDate : undefined,
        dueDate: draftDueDate ? draftDueDate : undefined,
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setIsSaving(false);
    }
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
              {columns.length > 0 && (
                <div>
                  <Text
                    variant="label"
                    bold
                    style={{ display: "block", marginBottom: 6 }}
                  >
                    Status
                  </Text>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {columns.map((col) => {
                      const isSelected = draftColumnId === col.id;
                      return (
                        <button
                          key={col.id}
                          type="button"
                          disabled={!canMoveStatus}
                          onClick={() => setDraftColumnId(col.id)}
                          style={{
                            border: `1px solid ${isSelected ? "var(--color-accent)" : "var(--color-line)"}`,
                            backgroundColor: isSelected
                              ? "var(--color-accent-soft)"
                              : "var(--color-surface)",
                            borderRadius: "var(--radius-pill)",
                            padding: "4px 10px",
                            cursor: canMoveStatus ? "pointer" : "not-allowed",
                            opacity: canMoveStatus ? 1 : 0.6,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "var(--radius-pill)",
                              backgroundColor:
                                col.color || "var(--color-accent)",
                            }}
                          />
                          <Text
                            variant="caption"
                            bold={isSelected}
                            color={
                              isSelected
                                ? "var(--color-accent)"
                                : "var(--color-ink)"
                            }
                          >
                            {col.title}
                          </Text>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Priority Selector */}
              <div>
                <Text
                  variant="label"
                  bold
                  style={{ display: "block", marginBottom: 6 }}
                >
                  Priority
                </Text>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {PRIORITIES.map((p) => {
                    const isSelected = draftPriority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        disabled={!canEditTitle}
                        onClick={() => setDraftPriority(p)}
                        style={{
                          border: `1px solid ${isSelected ? "var(--color-accent)" : "var(--color-line)"}`,
                          backgroundColor: isSelected
                            ? "var(--color-accent-soft)"
                            : "var(--color-surface)",
                          borderRadius: "var(--radius-pill)",
                          padding: "2px 4px",
                          cursor: canEditTitle ? "pointer" : "not-allowed",
                          opacity: canEditTitle ? 1 : 0.6,
                        }}
                      >
                        <PriorityBadge priority={p} size="sm" />
                      </button>
                    );
                  })}
                </div>
              </div>

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
    </>
  );
};

export default CardDetail;
