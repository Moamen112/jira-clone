export const motion = {
  screenTransitionMs: 200,
  buttonPressMs: 100,
  sheetOpenMs: 250,
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
} as const;

export type MotionToken = keyof typeof motion;
