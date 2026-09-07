export const colors = {
  light: {
    paper: '#EDEBE4',       // App background
    surface: '#F7F6F2',     // Cards, sheets, input fields
    ink: '#1C1E1B',         // Primary text, icons
    inkMuted: '#6B6A63',    // Secondary text, placeholders
    line: '#D8D5CB',        // Borders, dividers
    accent: '#1E6F5C',      // Primary actions, links, selected states
    accentSoft: '#DCEAE6',  // Accent backgrounds (chips, highlights)
    warn: '#B8460E',        // Errors, destructive actions
    warnSoft: '#F5DFD3',    // Error backgrounds
  },
  dark: {
    paper: '#16181A',
    surface: '#1F2220',
    ink: '#EDEBE4',
    inkMuted: '#8F8D84',
    line: '#33352F',
    accent: '#4FB89B',
    accentSoft: '#1E3530',
    warn: '#E37650',
    warnSoft: '#3A241C',
  },
} as const;

export type ColorMode = keyof typeof colors;
export type ColorToken = keyof typeof colors.light;
