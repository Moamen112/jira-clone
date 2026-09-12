export type ActivityActionType =
  | 'CARD_CREATED'
  | 'STATUS_CHANGED'
  | 'ASSIGNEE_CHANGED'
  | 'TITLE_UPDATED'
  | 'DESCRIPTION_UPDATED'
  | 'COMMENT_ADDED'
  | 'WORK_LOGGED';

export interface ActivityLog {
  id: string;
  cardId: string;
  actorId: string;
  action: ActivityActionType;
  details: {
    from?: string;
    to?: string;
    message?: string;
  };
  createdAt: string;
}
