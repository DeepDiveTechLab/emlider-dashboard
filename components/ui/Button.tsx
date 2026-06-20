/**
 * WAVE Button — TypeScript adaptation of the WAVE Design System Button.
 * Thick ink fence, hard offset shadow, sinks into shadow on press (.wave-press).
 */

import { CSSProperties, ReactNode, ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'teal' | 'violet' | 'yellow' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  block?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
}

const PALETTE: Record<Variant, { bg: string; fg: string; sh: string }> = {
  primary:   { bg: 'var(--coral)',       fg: '#fff',           sh: 'var(--coral-deep)'  },
  secondary: { bg: 'var(--white)',       fg: 'var(--ink)',     sh: 'var(--ink)'         },
  teal:      { bg: 'var(--teal)',        fg: '#fff',           sh: 'var(--teal-deep)'   },
  violet:    { bg: 'var(--violet)',      fg: '#fff',           sh: 'var(--violet-deep)' },
  yellow:    { bg: 'var(--yellow)',      fg: 'var(--ink)',     sh: 'var(--yellow-deep)' },
  ghost:     { bg: 'transparent',       fg: 'var(--ink)',     sh: 'transparent'         },
  danger:    { bg: 'var(--coral-deep)', fg: '#fff',           sh: '#9c1f15'            },
}

const SIZES: Record<Size, { pad: string; fs: string; h: string; off: number }> = {
  sm: { pad: '8px 14px',  fs: 'var(--text-sm)',   h: 'var(--control-sm)', off: 3 },
  md: { pad: '12px 22px', fs: 'var(--text-base)', h: 'var(--control-md)', off: 4 },
  lg: { pad: '16px 30px', fs: 'var(--text-lg)',   h: 'var(--control-lg)', off: 5 },
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  disabled,
  iconLeft,
  iconRight,
  style,
  ...rest
}: ButtonProps) {
  const p = PALETTE[variant]
  const s = SIZES[size]
  const isGhost = variant === 'ghost'

  const buttonStyle: CSSProperties = {
    display: block ? 'flex' : 'inline-flex',
    width: block ? '100%' : 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minHeight: s.h,
    padding: s.pad,
    fontFamily: 'var(--font-sans)',
    fontWeight: 'var(--w-extrabold)' as CSSProperties['fontWeight'],
    fontSize: s.fs,
    letterSpacing: 'var(--track-wide)',
    textTransform: 'uppercase',
    color: p.fg,
    background: p.bg,
    border: isGhost ? 'var(--bw) solid transparent' : 'var(--bw) solid var(--ink)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: isGhost ? 'none' : `${s.off}px ${s.off}px 0 ${p.sh}`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    whiteSpace: 'nowrap',
    ...style,
  }

  return (
    <button
      disabled={disabled}
      className="wave-press"
      style={buttonStyle}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  )
}
