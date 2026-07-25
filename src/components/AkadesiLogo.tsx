import React from 'react'

export interface AkadesiLogoProps {
  /** Size of the logo icon badge in pixels (default: 34) */
  size?: number
  /** Logo variant: 'icon' (badge only), 'full' (badge + text), 'minimal' (icon without background badge) */
  variant?: 'icon' | 'full' | 'minimal'
  /** Whether to display subtitle ("SIAKAD YARSI") in full variant */
  showSubtitle?: boolean
  /** Enable hover animations */
  animated?: boolean
  /** Custom container class */
  className?: string
  /** Custom inline styles */
  style?: React.CSSProperties
  /** Optional click handler */
  onClick?: () => void
}

/**
 * Modern Academic Logo Icon for Akadesi (SIAKAD YARSI)
 * Integrates:
 * 1. Graduation Cap (Toga) - High academic honor & pursuit of wisdom
 * 2. Open Book of Knowledge - Foundation of learning & research
 * 3. 4-Point Golden Star of Excellence - Illuminating academic success
 * 4. Academic Crest Badge - Deep Sea Ink & Lagoon Teal gradient with subtle gold accents
 */
export function AkadesiLogoIcon({
  size = 34,
  variant = 'icon',
  animated = true,
  className = '',
  style = {},
}: {
  size?: number
  variant?: 'icon' | 'minimal'
  animated?: boolean
  className?: string
  style?: React.CSSProperties
}) {
  const isMinimal = variant === 'minimal'

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${
        animated ? 'transition-transform duration-300 hover:scale-105 active:scale-95' : ''
      } ${className}`}
      style={{
        width: size,
        height: size,
        ...style,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        <defs>
          {/* Main Shield Gradient: Deep Sea Ink to Rich Dark Lagoon */}
          <linearGradient id="akadesi-shield-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#173A40" />
            <stop offset="50%" stopColor="#1D4F57" />
            <stop offset="100%" stopColor="#0E272B" />
          </linearGradient>

          {/* Golden Star & Accent Gradient */}
          <linearGradient id="akadesi-gold-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="45%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Lagoon Teal Glow Gradient for Book & Highlights */}
          <linearGradient id="akadesi-teal-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A7F3D0" />
            <stop offset="50%" stopColor="#4FB8B2" />
            <stop offset="100%" stopColor="#2F6A4A" />
          </linearGradient>

          {/* Book Page Pure Ivory Gradient */}
          <linearGradient id="akadesi-book-grad" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E7F0E8" />
          </linearGradient>

          {/* Subtle Outer Border Gradient */}
          <linearGradient id="akadesi-border-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
            <stop offset="50%" stopColor="rgba(79, 184, 178, 0.5)" />
            <stop offset="100%" stopColor="rgba(245, 158, 11, 0.4)" />
          </linearGradient>

          {/* Inner Glow Shadow filter */}
          <filter id="akadesi-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.25" />
          </filter>
        </defs>

        {!isMinimal && (
          <>
            {/* Outer Rounded Squircle Badge Base */}
            <rect
              x="3"
              y="3"
              width="94"
              height="94"
              rx="26"
              fill="url(#akadesi-shield-bg)"
            />

            {/* Subtle Metallic Highlight Rim */}
            <rect
              x="4"
              y="4"
              width="92"
              height="92"
              rx="25"
              fill="none"
              stroke="url(#akadesi-border-grad)"
              strokeWidth="2.5"
              opacity="0.8"
            />
          </>
        )}

        {/* --- ACADEMIC SYMBOLS GROUP --- */}
        <g filter={!isMinimal ? 'url(#akadesi-glow)' : undefined}>
          
          {/* 1. ILLUMINATING 4-POINT ACADEMIC STAR OF EXCELLENCE (Top Center) */}
          <path
            d="M50 11 L52.2 16.5 L57.5 18.5 L52.2 20.5 L50 26 L47.8 20.5 L42.5 18.5 L47.8 16.5 Z"
            fill="url(#akadesi-gold-grad)"
          />

          {/* 2. GRADUATION CAP (TOGA) */}
          {/* Cap Diamond Top Board */}
          <polygon
            points="50,25 80,36 50,47 20,36"
            fill="url(#akadesi-teal-grad)"
            stroke="url(#akadesi-gold-grad)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Under-Cap Skullcap Dome */}
          <path
            d="M32 41.5 V48 C32 53.5 68 53.5 68 48 V41.5"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.95"
          />

          {/* Graduation Tassel & Golden Bead */}
          <path
            d="M74 38.5 C76 43 78 48 78 54"
            fill="none"
            stroke="url(#akadesi-gold-grad)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="78" cy="55.5" r="2.8" fill="url(#akadesi-gold-grad)" />

          {/* 3. OPEN BOOK OF KNOWLEDGE (Forming Monogram Base) */}
          {/* Left Book Page */}
          <path
            d="M50 54 C40 48 27 48 19 52.5 V73.5 C27 69 40 69 50 75 Z"
            fill="url(#akadesi-book-grad)"
            stroke="url(#akadesi-teal-grad)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Right Book Page */}
          <path
            d="M50 54 C60 48 73 48 81 52.5 V73.5 C73 69 60 69 50 75 Z"
            fill="url(#akadesi-book-grad)"
            stroke="url(#akadesi-teal-grad)"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Book Center Spine */}
          <line
            x1="50"
            y1="54"
            x2="50"
            y2="75"
            stroke="url(#akadesi-gold-grad)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* Left Page Text Lines Accent */}
          <path
            d="M27 59.5 C34 56.5 42 56.5 45 58"
            fill="none"
            stroke="#328F97"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.75"
          />
          <path
            d="M27 65.5 C34 62.5 42 62.5 45 64"
            fill="none"
            stroke="#328F97"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* Right Page Text Lines Accent */}
          <path
            d="M55 58 C58 56.5 66 56.5 73 59.5"
            fill="none"
            stroke="#328F97"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.75"
          />
          <path
            d="M55 64 C58 62.5 66 62.5 73 65.5"
            fill="none"
            stroke="#328F97"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* 4. BASE ACADEMIC SHIELD EMBLEM PEDESTAL */}
          <path
            d="M38 78.5 C44 81 56 81 62 78.5"
            fill="none"
            stroke="url(#akadesi-gold-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

        </g>
      </svg>
    </div>
  )
}

export default function AkadesiLogo({
  size = 34,
  variant = 'full',
  showSubtitle = true,
  animated = true,
  className = '',
  style = {},
  onClick,
}: AkadesiLogoProps) {
  if (variant === 'icon' || variant === 'minimal') {
    return (
      <AkadesiLogoIcon
        size={size}
        variant={variant}
        animated={animated}
        className={className}
        style={style}
      />
    )
  }

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 no-underline select-none cursor-pointer group ${className}`}
      style={{ textDecoration: 'none', ...style }}
    >
      <AkadesiLogoIcon size={size} animated={animated} />
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1">
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 800,
              fontSize: Math.max(16, Math.round(size * 0.52)),
              color: 'var(--sea-ink)',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
            className="transition-colors group-hover:text-[var(--lagoon-deep)]"
          >
            Akadesi
          </span>
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              backgroundColor: '#F59E0B',
              display: 'inline-block',
              marginBottom: 1,
            }}
          />
        </div>
        {showSubtitle && (
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: Math.max(9, Math.round(size * 0.28)),
              color: 'var(--sea-ink-soft)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: 2,
              opacity: 0.85,
            }}
          >
            SIAKAD YARSI
          </span>
        )}
      </div>
    </div>
  )
}
