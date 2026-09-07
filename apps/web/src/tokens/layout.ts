export const layout = {
  screenMargin: 16,
  tapTarget: 44, // minimum tap target height for buttons/inputs
} as const;

export type LayoutToken = keyof typeof layout;
