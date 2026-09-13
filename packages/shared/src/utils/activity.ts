import type { ActivityLog } from '../types/activity';

export function formatActivityMessage(log: ActivityLog, actorName: string): string {
  switch (log.action) {
    case 'CARD_CREATED':
      return `${actorName} created this card in ${log.details.to ?? 'To Do'}`;
    case 'STATUS_CHANGED':
      return `${actorName} moved card from ${log.details.from ?? 'Unknown'} to ${log.details.to ?? 'Unknown'}`;
    case 'ASSIGNEE_CHANGED':
      return log.details.to
        ? `${actorName} assigned card to ${log.details.to}`
        : `${actorName} unassigned this card`;
    case 'TITLE_UPDATED':
      return `${actorName} changed the title`;
    case 'DESCRIPTION_UPDATED':
      return `${actorName} updated the description`;
    case 'COMMENT_ADDED':
      return `${actorName} left a comment`;
    case 'WORK_LOGGED':
      return `${actorName} logged work${log.details.message ? `: ${log.details.message}` : ''}`;
    default:
      return `${actorName} updated this card`;
  }
}
