export const radius = {
  input: 6,   // buttons, inputs
  card: 8,    // cards, list rows
  sheet: 12,  // modals, bottom sheets
  pill: 999,  // fully rounded (avatars, tags)
} as const;

export type RadiusToken = keyof typeof radius;
