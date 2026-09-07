export function validateProjectKey(key: string): { isValid: boolean; error?: string } {
  const trimmed = key.trim().toUpperCase();
  if (!trimmed) {
    return { isValid: false, error: 'Project key is required.' };
  }
  if (!/^[A-Z0-9]{2,10}$/.test(trimmed)) {
    return { isValid: false, error: 'Project key must be 2-10 uppercase alphanumeric characters (e.g. PROJ).' };
  }
  return { isValid: true };
}

export function validateCardTitle(title: string): { isValid: boolean; error?: string } {
  const trimmed = title.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Card title cannot be empty.' };
  }
  if (trimmed.length > 255) {
    return { isValid: false, error: 'Card title must not exceed 255 characters.' };
  }
  return { isValid: true };
}
