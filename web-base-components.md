# Web Base Components — Developer Guide

The **Base Components** are the low-level, atomic UI primitives for the web app (`apps/web`). Every higher-level component — shared domain components, screens, features — must be composed from these primitives and the Fieldnotes design tokens (`apps/web/src/globals.css`).

> 💡 **Sibling docs**: for the domain-facing shared components (board, card, etc.) see [`shared-components-docs.md`](./shared-components-docs.md).

---

## Table of Contents

1. [How to Import](#how-to-import)
2. [Theming & Design Tokens](#theming--design-tokens)
3. [Text](#text)
4. [Button](#button)
5. [IconButton](#iconbutton)
6. [Input](#input)
7. [Textarea](#textarea)
8. [Badge](#badge)
9. [Divider](#divider)
10. [Spinner](#spinner)
11. [Skeleton](#skeleton)
12. [Dropdown](#dropdown)
13. [Validation](#validation)

---

## How to Import

All base components are re-exported from the base barrel. Use the `@` source alias (configured in `vite.config.ts` and `tsconfig.app.json`):

```tsx
import { Text, Button, Input, Badge, Divider, Spinner, Skeleton, IconButton, Textarea, Dropdown } from '@/components/base';
```

Every component folder also exposes a default export, e.g. `import Badge from '@/components/base/badge';`.

**Folder layout**

```
apps/web/src/components/base/
├── index.ts            ← barrel (re-exports everything below)
├── badge/
├── button/
├── divider/
├── dropdown/
├── icon-button/
├── input/
├── skeleton/           ← includes Skeleton.css (pulse keyframes)
├── spinner/            ← includes Spinner.css (spin keyframes)
├── textarea/
└── typography/
```

---

## Theming & Design Tokens

The web app has **no JS theme hook** — theming is handled entirely by CSS custom properties declared in `apps/web/src/globals.css`. Components reference token variables inline, so they adapt automatically when `[data-theme='dark']` is set on the root element.

**Color tokens** (light ↔ dark)

| Token | Light | Dark |
| :--- | :--- | :--- |
| `--color-paper` | `#EDEBE4` | `#16181A` |
| `--color-surface` | `#F7F6F2` | `#1F2220` |
| `--color-ink` | `#1C1E1B` | `#EDEBE4` |
| `--color-ink-muted` | `#6B6A63` | `#8F8D84` |
| `--color-line` | `#D8D5CB` | `#33352F` |
| `--color-accent` | `#1E6F5C` | `#4FB89B` |
| `--color-accent-soft` | `#DCEAE6` | `#1E3530` |
| `--color-warn` | `#B8460E` | `#E37650` |
| `--color-warn-soft` | `#F5DFD3` | `#3A241C` |

**Other tokens**: `--spacing-{1..8}` (4px unit), `--radius-input` (6) / `--radius-card` (8) / `--radius-sheet` (12) / `--radius-pill` (9999), `--font-sans` / `--font-mono`, `--layout-tap-target` (44), and motion durations.

**Conventions enforced in this set:**

- All colors / fonts reference CSS variables — **no hardcoded hex** (the only exception is white text on colored buttons/badges).
- Spacing and radius use `var(--spacing-*)` / `var(--radius-*)`.
- Components accept a `style?: CSSProperties` prop that merges last, so consumers can override anything.
- `onPress` / `onChangeText` prop names mirror the **mobile base components** so shared components can be ported 1:1 between platforms.

---

## Text

### Overview
The typography primitive. Renders any of the 18 Fieldnotes type styles as a `<span>` with full theming. Supports muting, alignment, bold override, and multi-line ellipsis clamping.

**Location**: `apps/web/src/components/base/typography/Text.tsx`

### Props Specification
```typescript
export interface TextProps {
  variant?: 'display' | 'heading' | 'subheading' | 'sectionLabel' | 'issueTitle'
          | 'body' | 'bodySmall' | 'label' | 'button' | 'input' | 'placeholder'
          | 'link' | 'caption' | 'errorText' | 'badge'
          | 'monoData' | 'monoKey' | 'monoSmall'; // default: 'body'
  color?: string;                                // CSS var or literal override
  muted?: boolean;                               // default: false → --color-ink-muted
  align?: 'left' | 'center' | 'right' | 'justify';
  bold?: boolean;                                // default: false → weight 700
  numberOfLines?: number;                        // ellipsis clamp when set
  children?: ReactNode;
  style?: CSSProperties;
}
```

### Usage Example
```tsx
<Text variant="heading" bold>FIELD-14</Text>
<Text variant="body" muted align="center" numberOfLines={2}>
  Multi-line text that clamps with an ellipsis…
</Text>
<Text variant="monoKey" color="var(--color-accent)">PROJ-142</Text>
```

---

## Button

### Overview
The primary interactive control. Four visual variants, three size tiers, loading (spinner), disabled, optional side icons, and full-width layout. Renders a semantic `<button>`.

**Location**: `apps/web/src/components/base/button/Button.tsx`

### Props Specification
```typescript
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'; // default: 'primary'
export type ButtonSize = 'sm' | 'md' | 'lg';                              // default: 'md'

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;                 // min-heights: sm 32 / md 44 / lg 48
  label?: string;
  loading?: boolean;                 // default: false → renders Spinner
  disabled?: boolean;                // default: false (auto-true while loading)
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;               // default: false
  style?: CSSProperties;
  onPress?: () => void;
  children?: ReactNode;              // alternative to label
}
```

### Usage Example
```tsx
<Button
  variant="primary"
  size="lg"
  label="Create card"
  fullWidth
  leftIcon={<PlusIcon />}
  onPress={() => createCard()}
/>
<Button variant="ghost" size="sm" label="Cancel" onPress={onClose} />
<Button variant="danger" loading={saving} label="Delete" onPress={removeCard} />
```
---

## IconButton

### Overview
A square/pill button holding a single icon. Sizes match the `Button` tiers; perfect for close, trash, and menu affordances. Requires an accessible `label`.

**Location**: `apps/web/src/components/base/icon-button/IconButton.tsx`

### Props Specification
```typescript
export interface IconButtonProps {
  icon: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; // default: 'ghost'
  size?: 'sm' | 'md' | 'lg';                              // default: 'md' (32/44/48)
  rounded?: boolean;                                      // default: false
  disabled?: boolean;                                     // default: false
  label: string;                                          // accessible name (aria-label)
  style?: CSSProperties;
  onPress?: () => void;
}
```

### Usage Example
```tsx
<IconButton icon={<TrashIcon />} variant="danger" label="Delete card" onPress={removeCard} />
<IconButton icon={<CloseIcon />} size="sm" label="Close" onPress={onClose} />
```

---

## Input

### Overview
Single-line text input with label, error, and hint states. Wraps a native `<input>` with a themed border that turns accent on focus and warn on error. Supports optional side icons, controlled/uncontrolled usage, and read-only/disabled states.

**Location**: `apps/web/src/components/base/input/Input.tsx`

### Props Specification
```typescript
export interface InputProps {
  label?: string;
  error?: string;                          // shown below, warn border
  hint?: string;                           // helper text below
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  value?: string;                          // controlled
  defaultValue?: string;                   // uncontrolled
  placeholder?: string;
  type?: string;                           // default: 'text'
  editable?: boolean;                      // default: true
  disabled?: boolean;                      // mobile-parity alias of !editable
  maxLength?: number;
  autoFocus?: boolean;
  onChangeText?: (text: string) => void;   // mobile-style callback
  onFocus?: () => void;
  onBlur?: () => void;
  containerStyle?: CSSProperties;
  inputWrapperStyle?: CSSProperties;
  style?: CSSProperties;                   // applied to the inner <input>
}
```

### Usage Example
```tsx
<Input
  label="Email"
  placeholder="you@example.com"
  value={email}
  onChangeText={setEmail}
  leftIcon={<MailIcon />}
  error={errors.email}
/>
```

---

## Textarea

### Overview
Multi-line text area (native `<textarea>`) with the same label/error/hint lifecycle as `Input`, vertical resize, and an optional live character counter.

**Location**: `apps/web/src/components/base/textarea/Textarea.tsx`

### Props Specification
```typescript
export interface TextareaProps {
  label?: string;
  error?: string;
  hint?: string;
  showCount?: boolean;                     // default: false (requires maxLength)
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  maxLength?: number;
  editable?: boolean;                      // default: true
  disabled?: boolean;
  autoFocus?: boolean;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  containerStyle?: CSSProperties;
  inputWrapperStyle?: CSSProperties;
  style?: CSSProperties;                   // applied to the inner <textarea>
}
```

### Usage Example
```tsx
<Textarea
  label="Description"
  placeholder="Describe the issue..."
  value={description}
  onChangeText={setDescription}
  showCount
  maxLength={1000}
/>
```

---

## Badge

### Overview
A pill/rectangle chip for statuses, keys, and counts. Six variants map directly to the color tokens.

**Location**: `apps/web/src/components/base/badge/Badge.tsx`

### Props Specification
```typescript
export type BadgeVariant = 'default' | 'accent' | 'warn' | 'neutral' | 'mono' | 'done'; // default: 'default'
export type BadgeSize = 'sm' | 'md';                                                    // default: 'md'

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  rounded?: boolean;         // default: true → pill
  icon?: ReactNode;          // e.g. status dot
  backgroundColor?: string;  // override
  textColor?: string;        // override
  style?: CSSProperties;
}
```

### Usage Example
```tsx
<Badge label="FIELD" variant="mono" />
<Badge label={status.title} variant="accent" size="sm" icon={<StatusDot />} />
<Badge label="Published" variant="done" rounded={false} />
```

---

## Divider

### Overview
A hairline separator. Horizontal by default; vertical for stacked/inline layouts. Margin is applied along its orientation axis.

**Location**: `apps/web/src/components/base/divider/Divider.tsx`

### Props Specification
```typescript
export interface DividerProps {
  orientation?: 'horizontal' | 'vertical'; // default: 'horizontal'
  margin?: number;                         // default: 12 (px)
  color?: string;                          // default: --color-line
  thickness?: number;                      // default: 1
  style?: CSSProperties;
}
```

### Usage Example
```tsx
<Divider margin={16} />
<Divider orientation="vertical" thickness={2} color="var(--color-accent)" />
```
---

## Spinner

### Overview
A CSS-animated loading spinner (border rotation) with optional label. Small (20px) and large (36px) tiers, theme-aware color.

**Location**: `apps/web/src/components/base/spinner/Spinner.tsx` (+ `Spinner.css`)

### Props Specification
```typescript
export interface SpinnerProps {
  size?: 'small' | 'large';   // default: 'small'
  color?: string;             // default: --color-accent
  label?: string;
  direction?: 'row' | 'column'; // default: 'column' (label below)
  style?: CSSProperties;
}
```

### Usage Example
```tsx
<Spinner size="large" label="Loading board…" />
<Spinner color="var(--color-warn)" direction="row" label="Saving" />
```

---

## Skeleton

### Overview
A pulsing placeholder block for loading states — identical to the mobile `Skeleton` API. Supports explicit size/radius, or a perfect circle for avatar placeholders.

**Location**: `apps/web/src/components/base/skeleton/Skeleton.tsx` (+ `Skeleton.css`)

### Props Specification
```typescript
export interface SkeletonProps {
  width?: number | string;         // default: '100%'
  height?: number | string;        // default: 20
  borderRadius?: number | string;  // default: 6 (ignored when circle)
  circle?: boolean;                // default: false → 50% radius
  color?: string;                  // default: --color-line
  style?: CSSProperties;
}
```

### Usage Example
```tsx
<Skeleton width={280} height={88} />
<Skeleton circle />                    {/* circle avatar */}
<Skeleton height={14} borderRadius={4} style={{ marginBottom: 8 }} />
```

---

## Dropdown

### Overview
A select-style control: a trigger button that opens a themed options panel (absolute-positioned, with a click-away backdrop). Supports icons/descriptions per option, selected checkmark, error styling, disabled state, and an optional search filter.

**Location**: `apps/web/src/components/base/dropdown/Dropdown.tsx`

### Props Specification
```typescript
export interface DropdownOption {
  label: string;
  value: string;
  icon?: ReactNode;
  description?: string;
}

export interface DropdownProps {
  label?: string;
  value?: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  placeholder?: string;            // default: 'Select an option...'
  error?: string;
  disabled?: boolean;
  searchable?: boolean;            // default: false → shows filter Input
  style?: CSSProperties;
}
```

### Usage Example
```tsx
<Dropdown
  label="Assignee"
  value={assigneeId}
  options={members.map((u) => ({ value: u.id, label: u.name, icon: <Avatar name={u.name} size="xs" /> }))}
  onSelect={setAssigneeId}
  searchable
/>
```

---

## Validation

From the repo root or `apps/web`:

```bash
npm run build --workspace=apps/web   # tsc -b && vite build
# or, just typecheck the web app sources:
npx tsc -p apps/web/tsconfig.app.json --noEmit

# run the dev server
npm run web                          # from the repo root
```