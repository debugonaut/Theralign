import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bone, Zap, Brain, Activity, Baby, UserPlus, Link as LinkIcon, Heart } from 'lucide-react';

const SPECIALIZATIONS = [
  {
    name: 'ORTHOPEDIC',
    subtitle: 'Bones, Joints & Muscles',
    icon: Bone,
    query: 'Orthopedic Physiotherapy',
    accent: '#FF3000',
    bg: '#FFF5F3',
    desc: 'Treatment for fractures, arthritis, joint replacements, and chronic musculoskeletal conditions.',
  },
  {
    name: 'SPORTS',
    subtitle: 'Athletic Performance',
    icon: Zap,
    query: 'Sports Physiotherapy',
    accent: '#0057FF',
    bg: '#F0F4FF',
    desc: 'Recovery from sports injuries, ACL tears, rotator cuff damage, and performance optimisation.',
  },
  {
    name: 'NEUROLOGICAL',
    subtitle: 'Brain & Nerve Conditions',
    icon: Brain,
    query: 'Neurological Physiotherapy',
    accent: '#6D28D9',
    bg: '#F5F0FF',
    desc: 'Rehabilitation for stroke, Parkinson\'s disease, multiple sclerosis, and nerve injuries.',
  },
  {
    name: 'POST-SURGICAL',
    subtitle: 'Surgical Recovery',
    icon: Activity,
    query: 'Post-Surgical Rehabilitation',
    accent: '#059669',
    bg: '#F0FFF8',
    desc: 'Structured recovery protocols after orthopaedic, spinal, or joint replacement surgeries.',
  },
  {
    name: 'PEDIATRIC',
    subtitle: 'Children\'s Health',
    icon: Baby,
    query: 'Pediatric Physiotherapy',
    accent: '#D97706',
    bg: '#FFFBF0',
    desc: 'Developmental delay, cerebral palsy, scoliosis, and childhood movement disorders.',
  },
  {
    name: 'GERIATRIC',
    subtitle: 'Senior Mobility Care',
    icon: UserPlus,
    query: 'Geriatric Physiotherapy',
    accent: '#0891B2',
    bg: '#F0FAFE',
    desc: 'Fall prevention, balance training, and mobility restoration for older adults.',
  },
  {
    name: 'SPINAL',
    subtitle: 'Back & Postural Health',
    icon: LinkIcon,
    query: 'Postural & Spinal Rehabilitation',
    accent: '#DC2626',
    bg: '#FFF5F5',
    desc: 'Disc herniation, spondylosis, postural correction, and chronic lower back pain.',
  },
  {
    name: "WOMEN'S HEALTH",
    subtitle: 'Pelvic & Maternal Care',
    icon: Heart,
    query: "Women's Health Physiotherapy",
    accent: '#DB2777',
    bg: '#FFF0F7',
    desc: 'Pre/post-natal physiotherapy, pelvic floor rehabilitation, and hormonal condition management.',
  },
];

const VISIBLE_SIDE = 2; // cards visible on each side

const SpecializationsSection = () => {
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const containerRef = useRef(null);
  const total = SPECIALIZATIONS.length;

  const goTo = useCallback(
    (idx) => setActive(((idx % total) + total) % total),
    [total]
  );
  const goPrev = () => goTo(active - 1);
  const goNext = () => goTo(active + 1);

  /* ── Touch / Drag support ─────────────────────── */
  const onPointerDown = (e) => {
    dragStart.current = e.clientX;
    setDragging(false);
  };
  const onPointerMove = (e) => {
    if (dragStart.current === null) return;
    if (Math.abs(e.clientX - dragStart.current) > 5) setDragging(true);
  };
  const onPointerUp = (e) => {
    if (dragStart.current === null) return;
    const delta = e.clientX - dragStart.current;
    if (Math.abs(delta) > 50) {
      delta < 0 ? goNext() : goPrev();
    }
    dragStart.current = null;
  };

  /* ── Keyboard support ─────────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  /* ── Card positioning helper ──────────────────── */
  const getCardStyle = (idx) => {
    let offset = idx - active;
    // wrap around for shorter path
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    const absOffset = Math.abs(offset);
    if (absOffset > VISIBLE_SIDE) return { display: 'none' };

    const sign = offset === 0 ? 0 : offset / absOffset;
    const translateX = offset * 320; // px spacing
    const scale = offset === 0 ? 1 : 0.78 - absOffset * 0.04;
    const opacity = offset === 0 ? 1 : 0.55 - absOffset * 0.08;
    const rotateY = offset === 0 ? 0 : sign * (18 + absOffset * 4);
    const zIndex = 10 - absOffset;

    return {
      transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
      opacity,
      zIndex,
      pointerEvents: offset === 0 ? 'auto' : 'none',
      transition: 'transform 500ms cubic-bezier(0.25, 0, 0, 1), opacity 500ms ease',
    };
  };

  const activeSpec = SPECIALIZATIONS[active];

  return (
    <section className="spec-section" id="specializations" aria-labelledby="spec-title">
      {/* Section Header */}
      <div className="spec-header">
        <span className="swiss-section-label">01. AREAS OF CARE</span>
        <h2 id="spec-title" className="spec-heading">
          FIND YOUR<br />
          <span className="spec-heading-accent">SPECIALISATION.</span>
        </h2>
      </div>

      {/* Coverflow Stage */}
      <div
        className="spec-stage"
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        style={{ perspective: '1200px' }}
      >
        {SPECIALIZATIONS.map((spec, idx) => {
          const Icon = spec.icon;
          const style = getCardStyle(idx);
          if (style.display === 'none') return null;
          const isCenter = idx === active;
          return (
            <div
              key={idx}
              className={`spec-card ${isCenter ? 'spec-card--active' : ''}`}
              style={style}
              onClick={() => !dragging && setActive(idx)}
              aria-label={spec.name}
            >
              {/* Card accent bar */}
              <div
                className="spec-card-accent-bar"
                style={{ background: spec.accent }}
              />

              {/* Icon block */}
              <div
                className="spec-card-icon-wrap"
                style={{
                  background: isCenter ? spec.bg : '#F5F5F5',
                  border: `2px solid ${isCenter ? spec.accent : '#E0E0E0'}`,
                }}
              >
                <Icon
                  size={isCenter ? 36 : 28}
                  style={{ color: isCenter ? spec.accent : '#888888' }}
                />
              </div>

              <h3 className="spec-card-name">{spec.name}</h3>
              <p className="spec-card-subtitle">{spec.subtitle}</p>

              {/* Desc + CTA only on active */}
              {isCenter && (
                <>
                  <p className="spec-card-desc">{spec.desc}</p>
                  <Link
                    to={`/doctors?specialization=${encodeURIComponent(spec.query)}`}
                    className="spec-card-cta"
                    style={{ background: spec.accent }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    EXPLORE SPECIALISTS →
                  </Link>
                </>
              )}

              {/* Card number */}
              <span className="spec-card-number">
                {String(idx + 1).padStart(2, '0')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Controls row */}
      <div className="spec-controls">
        <button className="spec-arrow spec-arrow--left" onClick={goPrev} aria-label="Previous">←</button>

        {/* Dot indicators */}
        <div className="spec-dots" role="tablist">
          {SPECIALIZATIONS.map((_, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={idx === active}
              className={`spec-dot${idx === active ? ' spec-dot--active' : ''}`}
              onClick={() => setActive(idx)}
              aria-label={`Go to ${SPECIALIZATIONS[idx].name}`}
            />
          ))}
        </div>

        <button className="spec-arrow spec-arrow--right" onClick={goNext} aria-label="Next">→</button>
      </div>

      {/* Active label beneath controls */}
      <p className="spec-active-label" aria-live="polite">
        <span style={{ color: activeSpec.accent }}>■</span>{' '}
        {activeSpec.name} — {activeSpec.subtitle}
      </p>
    </section>
  );
};

export default SpecializationsSection;
