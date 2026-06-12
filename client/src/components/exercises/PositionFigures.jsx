import React from 'react';

const FigureWrapper = ({ size = 80, color = '#0B4F6C', viewBox, children }) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <g stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
      {children}
    </g>
  </svg>
);

export const LyingFigure = ({ size = 80, color = '#0B4F6C' }) => (
  <FigureWrapper size={size} color={color} viewBox="0 0 120 80">
    <circle cx="18" cy="40" r="8" />
    <line x1="26" y1="40" x2="70" y2="40" />
    <line x1="70" y1="40" x2="88" y2="36" />
    <line x1="88" y1="36" x2="108" y2="38" />
    <line x1="58" y1="40" x2="62" y2="52" />
    <line x1="62" y1="52" x2="78" y2="54" />
  </FigureWrapper>
);

export const ProneFigure = ({ size = 80, color = '#0B4F6C' }) => (
  <FigureWrapper size={size} color={color} viewBox="0 0 120 80">
    <circle cx="18" cy="48" r="8" />
    <line x1="26" y1="48" x2="72" y2="44" />
    <line x1="72" y1="44" x2="90" y2="42" />
    <line x1="90" y1="42" x2="108" y2="44" />
    <line x1="50" y1="44" x2="44" y2="56" />
    <line x1="44" y1="56" x2="58" y2="58" />
    <line x1="58" y1="44" x2="64" y2="54" />
    <line x1="64" y1="54" x2="80" y2="56" />
  </FigureWrapper>
);

export const SittingFigure = ({ size = 80, color = '#0B4F6C' }) => (
  <FigureWrapper size={size} color={color} viewBox="0 0 80 120">
    <circle cx="40" cy="18" r="10" />
    <line x1="40" y1="28" x2="40" y2="62" />
    <line x1="40" y1="38" x2="22" y2="52" />
    <line x1="40" y1="38" x2="58" y2="52" />
    <line x1="40" y1="62" x2="28" y2="78" />
    <line x1="40" y1="62" x2="52" y2="78" />
    <line x1="28" y1="78" x2="28" y2="96" />
    <line x1="52" y1="78" x2="52" y2="96" />
    <line x1="16" y1="78" x2="64" y2="78" />
  </FigureWrapper>
);

export const StandingFigure = ({ size = 80, color = '#0B4F6C' }) => (
  <FigureWrapper size={size} color={color} viewBox="0 0 80 120">
    <circle cx="40" cy="14" r="10" />
    <line x1="40" y1="24" x2="40" y2="68" />
    <line x1="40" y1="36" x2="22" y2="58" />
    <line x1="40" y1="36" x2="58" y2="58" />
    <line x1="40" y1="68" x2="28" y2="104" />
    <line x1="40" y1="68" x2="52" y2="104" />
    <line x1="28" y1="104" x2="24" y2="112" />
    <line x1="52" y1="104" x2="56" y2="112" />
  </FigureWrapper>
);

export const KneelingFigure = ({ size = 80, color = '#0B4F6C' }) => (
  <FigureWrapper size={size} color={color} viewBox="0 0 80 120">
    <circle cx="40" cy="16" r="10" />
    <line x1="40" y1="26" x2="40" y2="62" />
    <line x1="40" y1="38" x2="24" y2="52" />
    <line x1="40" y1="38" x2="56" y2="52" />
    <line x1="40" y1="62" x2="54" y2="88" />
    <line x1="54" y1="88" x2="58" y2="104" />
    <path d="M28 88 Q22 96, 24 104" />
    <line x1="24" y1="96" x2="34" y2="88" />
  </FigureWrapper>
);

export const POSITION_FIGURE_MAP = {
  lying: LyingFigure,
  sitting: SittingFigure,
  standing: StandingFigure,
  prone: ProneFigure,
  kneeling: KneelingFigure,
};

export const getPositionFigure = (position) => POSITION_FIGURE_MAP[position] || StandingFigure;
