export const fonts = {
  sans: "'IBM Plex Sans', sans-serif",
  mono: "'IBM Plex Mono', monospace",
} as const;

export const fontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  bolder: 800,
} as const;

// size in px, lineHeight in px, weight from fontWeights.
// Covers the type cases that actually recur in a Jira-like app:
// page/screen chrome, issue content, list rows, forms, and status/meta text.
export const typeScale = {
  // --- Screen & section chrome ---
  display: { font: fonts.sans, size: 28, lineHeight: 34, weight: fontWeights.bolder }, // Screen titles ("Sprint 24")
  heading: { font: fonts.sans, size: 20, lineHeight: 26, weight: fontWeights.bold }, // Section headers, modal titles
  subheading: { font: fonts.sans, size: 17, lineHeight: 22, weight: fontWeights.bold }, // Sub-sections, card group titles
  sectionLabel: { font: fonts.sans, size: 13, lineHeight: 16, weight: fontWeights.semibold }, // "To do · 4", "In progress · 2"

  // --- Content ---
  issueTitle: { font: fonts.sans, size: 16, lineHeight: 22, weight: fontWeights.medium }, // Issue/task titles in lists and detail view
  body: { font: fonts.sans, size: 16, lineHeight: 24, weight: fontWeights.regular }, // Descriptions, comments, default text
  bodySmall: { font: fonts.sans, size: 14, lineHeight: 20, weight: fontWeights.regular }, // Secondary text, list row subtext

  // --- UI controls ---
  label: { font: fonts.sans, size: 13, lineHeight: 16, weight: fontWeights.medium }, // Form field labels, tabs
  button: { font: fonts.sans, size: 15, lineHeight: 20, weight: fontWeights.medium }, // Button text
  input: { font: fonts.sans, size: 15, lineHeight: 20, weight: fontWeights.regular }, // Text typed into inputs
  placeholder: { font: fonts.sans, size: 15, lineHeight: 20, weight: fontWeights.regular }, // Input placeholder text (pair with inkMuted)
  link: { font: fonts.sans, size: 14, lineHeight: 20, weight: fontWeights.medium }, // Inline links (pair with accent color)

  // --- Meta, status, feedback ---
  caption: { font: fonts.sans, size: 12, lineHeight: 16, weight: fontWeights.regular }, // Helper text below inputs
  errorText: { font: fonts.sans, size: 12, lineHeight: 16, weight: fontWeights.medium }, // Validation errors (pair with warn color)
  badge: { font: fonts.sans, size: 12, lineHeight: 14, weight: fontWeights.medium }, // Status pills, chips, tags

  // --- Data / mono ---
  monoData: { font: fonts.mono, size: 14, lineHeight: 20, weight: fontWeights.regular }, // Timestamps, counters, general data
  monoKey: { font: fonts.mono, size: 12, lineHeight: 16, weight: fontWeights.regular }, // Issue keys, IDs ("PROJ-142")
  monoSmall: { font: fonts.mono, size: 10, lineHeight: 14, weight: fontWeights.regular }, // Fine-print metadata
} as const;

export type TypeStyleToken = keyof typeof typeScale;
