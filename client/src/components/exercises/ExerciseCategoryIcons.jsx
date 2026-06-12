import React from 'react';

const IconWrapper = ({ size = 48, color = 'currentColor', children, viewBox = '0 0 48 48' }) => (
  <svg width={size} height={size} viewBox={viewBox} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </g>
  </svg>
);

export const SpineIcon = ({ size = 48, color = 'currentColor' }) => (
  <IconWrapper size={size} color={color}>
    <path d="M24 6 C22 10, 26 14, 24 18 C22 22, 26 26, 24 30 C22 34, 26 38, 24 42" />
    {[10, 14, 18, 22, 26, 30, 34, 38].map((y) => (
      <line key={y} x1="18" y1={y} x2="30" y2={y} />
    ))}
  </IconWrapper>
);

export const KneeIcon = ({ size = 48, color = 'currentColor' }) => (
  <IconWrapper size={size} color={color}>
    <line x1="24" y1="8" x2="24" y2="22" />
    <line x1="24" y1="28" x2="24" y2="42" />
    <circle cx="24" cy="25" r="5" fill="none" />
    <circle cx="24" cy="25" r="2.5" fill={color} stroke="none" />
    <line x1="18" y1="8" x2="30" y2="8" />
    <line x1="20" y1="42" x2="28" y2="42" />
  </IconWrapper>
);

export const ShoulderIcon = ({ size = 48, color = 'currentColor' }) => (
  <IconWrapper size={size} color={color}>
    <path d="M16 14 L32 14 L32 28 L16 28 Z" />
    <circle cx="14" cy="18" r="4" fill="none" />
    <line x1="10" y1="18" x2="14" y2="18" />
    <line x1="10" y1="18" x2="10" y2="30" />
    <line x1="10" y1="30" x2="18" y2="30" />
  </IconWrapper>
);

export const HipIcon = ({ size = 48, color = 'currentColor' }) => (
  <IconWrapper size={size} color={color}>
    <path d="M12 16 Q24 8, 36 16 L34 24 Q24 20, 14 24 Z" />
    <circle cx="16" cy="26" r="3.5" fill="none" />
    <circle cx="32" cy="26" r="3.5" fill="none" />
    <line x1="24" y1="20" x2="24" y2="36" />
  </IconWrapper>
);

export const AnkleIcon = ({ size = 48, color = 'currentColor' }) => (
  <IconWrapper size={size} color={color} viewBox="0 0 48 48">
    <line x1="28" y1="8" x2="28" y2="28" />
    <path d="M28 28 L18 32 L14 40 L22 40 L28 34" />
    <circle cx="28" cy="28" r="3" fill="none" />
    <line x1="28" y1="8" x2="32" y2="8" />
  </IconWrapper>
);

export const CoreIcon = ({ size = 48, color = 'currentColor' }) => (
  <IconWrapper size={size} color={color}>
    <path d="M18 10 L30 10 L32 38 L16 38 Z" />
    {[16, 20, 24, 28, 32].map((y) => (
      <line key={y} x1="19" y1={y} x2="29" y2={y} opacity="0.7" />
    ))}
  </IconWrapper>
);

export const NeuroIcon = ({ size = 48, color = 'currentColor' }) => (
  <IconWrapper size={size} color={color}>
    <ellipse cx="24" cy="12" rx="6" ry="8" />
    <path d="M20 20 L20 36 M24 20 L24 40 M28 20 L28 36" />
    <line x1="20" y1="36" x2="16" y2="42" />
    <line x1="28" y1="36" x2="32" y2="42" />
    <line x1="24" y1="22" x2="10" y2="18" />
    <line x1="24" y1="26" x2="38" y2="22" />
    <line x1="24" y1="30" x2="12" y2="32" />
    <line x1="24" y1="34" x2="36" y2="36" />
  </IconWrapper>
);

export const BreathingIcon = ({ size = 48, color = 'currentColor' }) => (
  <IconWrapper size={size} color={color}>
    <path d="M18 12 L30 12 L32 36 L16 36 Z" />
    <path d="M20 18 Q24 14, 28 18 Q24 26, 20 22 Z" fill="none" />
    <path d="M20 24 Q24 20, 28 24 Q24 32, 20 28 Z" fill="none" />
    <path d="M34 20 L38 20 L36 16 M34 28 L38 28 L36 32" />
  </IconWrapper>
);

export const CATEGORY_ICON_MAP = {
  spine: SpineIcon,
  knee: KneeIcon,
  shoulder: ShoulderIcon,
  hip: HipIcon,
  ankle: AnkleIcon,
  core: CoreIcon,
  neuro: NeuroIcon,
  breathing: BreathingIcon,
};

export const getCategoryIcon = (iconKey) => CATEGORY_ICON_MAP[iconKey] || SpineIcon;
