import { colors } from './colors';
import { fonts, fontWeights, typeScale } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { layout } from './layout';
import { motion } from './motion';

// Convenience: full theme object per mode, useful for a ThemeProvider
export const theme = {
  light: {
    colors: colors.light,
    fonts,
    fontWeights,
    typeScale,
    spacing,
    radius,
    layout,
    motion,
  },
  dark: {
    colors: colors.dark,
    fonts,
    fontWeights,
    typeScale,
    spacing,
    radius,
    layout,
    motion,
  },
} as const;

export type Theme = typeof theme.light;
