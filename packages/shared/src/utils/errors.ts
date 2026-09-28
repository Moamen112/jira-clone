/**
 * Formats API errors from Django REST framework and Axios into user-friendly strings.
 */
export function parseErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const data = (err as { response?: { data?: unknown } }).response?.data;
    if (data) {
      if (typeof data === 'string') return data;
      if (typeof data === 'object') {
        const obj = data as Record<string, unknown>;
        if (typeof obj.detail === 'string') return obj.detail;

        // Collect field validation errors (e.g., { name: ['This field is required.'] })
        const messages: string[] = [];
        for (const [key, value] of Object.entries(obj)) {
          if (Array.isArray(value)) {
            messages.push(`${key}: ${value.join(' ')}`);
          } else if (typeof value === 'string') {
            messages.push(`${key}: ${value}`);
          }
        }
        if (messages.length > 0) {
          return messages.join('; ');
        }
      }
    }
  }
  return err instanceof Error ? err.message : 'An error occurred during the request';
}
