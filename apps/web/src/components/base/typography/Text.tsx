import type { CSSProperties, FC, ReactNode } from 'react';

export type TypeStyleToken =
  | 'display'
  | 'heading'
  | 'subheading'
  | 'sectionLabel'
  | 'issueTitle'
  | 'body'
  | 'bodySmall'
  | 'label'
  | 'button'
  | 'input'
  | 'placeholder'
  | 'link'
  | 'caption'
  | 'errorText'
  | 'badge'
  | 'monoData'
  | 'monoKey'
  | 'monoSmall';

interface TypeStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
}

const TYPE_SCALE: Record<TypeStyleToken, TypeStyle> = {
  display: { fontFamily: 'var(--font-sans)', fontSize: 28, lineHeight: 34, fontWeight: 800 },
  heading: { fontFamily: 'var(--font-sans)', fontSize: 20, lineHeight: 26, fontWeight: 700 },
  subheading: { fontFamily: 'var(--font-sans)', fontSize: 17, lineHeight: 22, fontWeight: 700 },
  sectionLabel: { fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 16, fontWeight: 600 },
  issueTitle: { fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 22, fontWeight: 500 },
  body: { fontFamily: 'var(--font-sans)', fontSize: 16, lineHeight: 24, fontWeight: 400 },
  bodySmall: { fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 20, fontWeight: 400 },
  label: { fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 16, fontWeight: 500 },
  button: { fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 20, fontWeight: 500 },
  input: { fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 20, fontWeight: 400 },
  placeholder: { fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 20, fontWeight: 400 },
  link: { fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 20, fontWeight: 500 },
  caption: { fontFamily: 'var(--font-sans)', fontSize: 12, lineHeight: 16, fontWeight: 400 },
  errorText: { fontFamily: 'var(--font-sans)', fontSize: 12, lineHeight: 16, fontWeight: 500 },
  badge: { fontFamily: 'var(--font-sans)', fontSize: 12, lineHeight: 14, fontWeight: 500 },
  monoData: { fontFamily: 'var(--font-mono)', fontSize: 14, lineHeight: 20, fontWeight: 400 },
  monoKey: { fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 16, fontWeight: 400 },
  monoSmall: { fontFamily: 'var(--font-mono)', fontSize: 10, lineHeight: 14, fontWeight: 400 },
};

export interface TextProps {
  /** Variant style defined in the Fieldnotes type scale */
  variant?: TypeStyleToken;
  /** Direct color override (supports CSS variables) */
  color?: string;
  /** Convenience flag for muted secondary text */
  muted?: boolean;
  /** Alignment of text */
  align?: 'left' | 'center' | 'right' | 'justify';
  /** Bold weight override */
  bold?: boolean;
  /** Maximum number of lines before ellipsis clamping */
  numberOfLines?: number;
  children?: ReactNode;
  /** Additional inline styles */
  style?: CSSProperties;
}

export const Text: FC<TextProps> = ({
  variant = 'body',
  color,
  muted = false,
  align,
  bold,
  numberOfLines,
  children,
  style,
}) => {
  const token = TYPE_SCALE[variant] || TYPE_SCALE.body;
  const fontColor = color ?? (muted ? 'var(--color-ink-muted)' : 'var(--color-ink)');
  const resolvedWeight = bold ? 700 : token.fontWeight;

  const clampStyle: CSSProperties = numberOfLines
    ? {
        display: '-webkit-box',
        WebkitLineClamp: numberOfLines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }
    : {};

  return (
    <span
      style={{
        fontFamily: token.fontFamily,
        fontSize: token.fontSize,
        lineHeight: `${token.lineHeight}px`,
        fontWeight: resolvedWeight,
        color: fontColor,
        textAlign: align,
        ...clampStyle,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export default Text;