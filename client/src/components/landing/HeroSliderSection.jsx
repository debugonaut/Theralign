import React, { useState, useEffect, useRef, useCallback } from 'react';

const SLIDES = [
  {
    id: 1,
    imageId: '1571019613454-1cb2f99b2d8b',
    punchline: 'PRECISION CARE.\nVERIFIED EXPERTISE.',
    description:
      "Connect with India's most rigorously vetted physiotherapists. Evidence-based treatment, booked in minutes.",
  },
  {
    id: 2,
    imageId: '1559757148-5c350d0d3c56',
    punchline: 'MOVE WITHOUT\nLIMITATION.',
    description:
      'From post-surgical recovery to sports rehabilitation — expert care matched to your exact condition.',
  },
  {
    id: 3,
    imageId: '1576091160399-112ba8d25d1d',
    punchline: 'YOUR RECOVERY.\nYOUR TIMELINE.',
    description:
      'Personalised exercise prescriptions, real-time session records, and clinical continuity across every visit.',
  },
  {
    id: 4,
    imageId: '1506126613408-eca07ce68773',
    punchline: 'TRUSTED BY THOUSANDS.\nVERIFIED BY DESIGN.',
    description:
      'Every practitioner on Theralign passes our multi-stage clinical verification. No compromises.',
  },
  {
    id: 5,
    imageId: '1571019614242-c5c5dee9f50b',
    punchline: 'BOOK. TREAT.\nRECOVER. REPEAT.',
    description:
      'A complete physiotherapy management platform — from first consultation to full mobility restored.',
  },
];

const HeroSliderSection = () => {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);

  const goTo = useCallback((index) => {
    setCurrent((index + SLIDES.length) % SLIDES.length);
  }, []);

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Auto-advance
  useEffect(() => {
    if (isHovered) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [isHovered]);

  return (
    <section
      className="hero-slider-root"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Theralign feature highlights"
    >
      {/* Slide track */}
      <div
        className="hero-slider-track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((slide, idx) => (
          <div
            key={slide.id}
            className="hero-slider-slide"
            aria-hidden={idx !== current}
          >
            {/* Background image */}
            <img
              src={`https://images.unsplash.com/photo-${slide.imageId}?w=1920&q=90&fit=crop`}
              alt=""
              className="hero-slider-img"
              loading={idx === 0 ? 'eager' : 'lazy'}
            />

            {/* Dark gradient overlay */}
            <div className="hero-slider-overlay" />

            {/* Content */}
            <div className="hero-slider-content">
              {/* Swiss Red label */}
              <span className="hero-slider-label">
                THERALIGN — VERIFIED PHYSIOTHERAPY PLATFORM
              </span>

              {/* Punchline */}
              <h2 className="hero-slider-punchline">
                {slide.punchline.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < slide.punchline.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h2>

              {/* Description */}
              <p className="hero-slider-description">{slide.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Left arrow */}
      <button
        className="hero-slider-arrow hero-slider-arrow--left"
        onClick={goPrev}
        aria-label="Previous slide"
      >
        ←
      </button>

      {/* Right arrow */}
      <button
        className="hero-slider-arrow hero-slider-arrow--right"
        onClick={goNext}
        aria-label="Next slide"
      >
        →
      </button>

      {/* Dot indicators */}
      <div className="hero-slider-dots" role="tablist" aria-label="Slide indicators">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            role="tab"
            aria-selected={idx === current}
            aria-label={`Go to slide ${idx + 1}`}
            className={`hero-slider-dot${idx === current ? ' hero-slider-dot--active' : ''}`}
            onClick={() => goTo(idx)}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSliderSection;
