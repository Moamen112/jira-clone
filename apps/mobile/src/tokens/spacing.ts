// base unit: 4px, all spacing is a multiple of it
export const spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  8: 48,
} as const;

export type SpacingToken = keyof typeof spacing;
