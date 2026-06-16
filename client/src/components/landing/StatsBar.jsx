import React, { useEffect, useRef, useState } from 'react';

const STATS = [
  {
    value: 500,
    suffix: '+',
    label: 'VERIFIED DOCTORS',
    subLabel: 'Across 12 cities',
    barColor: '#FF3000',
    chartData: [38, 55, 72, 88, 95, 100], // % growth points
    chartLabel: 'Doctor onboarding growth (6 months)',
  },
  {
    value: 15,
    suffix: '+',
    label: 'SPECIALISATIONS',
    subLabel: 'Covered end-to-end',
    barColor: '#0057FF',
    chartData: [60, 65, 70, 80, 90, 100],
    chartLabel: 'Specialisation coverage %',
  },
  {
    value: 4.8,
    suffix: '★',
    label: 'AVERAGE RATING',
    subLabel: 'From 4,200+ reviews',
    barColor: '#059669',
    chartData: [75, 80, 83, 87, 92, 96], // rating index
    chartLabel: 'Patient satisfaction score',
  },
  {
    value: 100,
    suffix: '%',
    label: 'SECURE PAYMENTS',
    subLabel: 'PCI-DSS compliant',
    barColor: '#6D28D9',
    chartData: [70, 80, 85, 90, 96, 100],
    chartLabel: 'Payment success rate',
  },
];

/* ── Animated Counter ─────────────────────── */
const useCounter = (target, duration = 1400, start = false) => {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const isDecimal = target % 1 !== 0;
    const raf = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(isDecimal ? parseFloat((eased * target).toFixed(1)) : Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [start, target, duration]);
  return current;
};

/* ── Mini Bar Chart ───────────────────────── */
const MiniBarChart = ({ data, color, label, animate }) => {
  const max = Math.max(...data);
  return (
    <div className="stats-chart-wrap">
      <p className="stats-chart-label">{label}</p>
      <div className="stats-chart-bars">
        {data.map((val, i) => (
          <div key={i} className="stats-chart-bar-col">
            <div
              className="stats-chart-bar"
              style={{
                background: color,
                height: animate ? `${(val / max) * 100}%` : '0%',
                transitionDelay: animate ? `${i * 80}ms` : '0ms',
                transition: 'height 700ms cubic-bezier(0.25, 0, 0, 1)',
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Stat Card ────────────────────────────── */
const StatCard = ({ stat, animate }) => {
  const count = useCounter(stat.value, 1400, animate);
  return (
    <div className="stats-card">
      <div className="stats-card-top">
        <div className="stats-card-value-row">
          <span className="stats-card-value">{count}</span>
          <span className="stats-card-suffix" style={{ color: stat.barColor }}>{stat.suffix}</span>
        </div>
        <div className="stats-card-label">{stat.label}</div>
        <div className="stats-card-sublabel">{stat.subLabel}</div>
      </div>
      <div className="stats-card-divider" style={{ background: stat.barColor }} />
      <MiniBarChart
        data={stat.chartData}
        color={stat.barColor}
        label={stat.chartLabel}
        animate={animate}
      />
    </div>
  );
};

/* ── Main Section ─────────────────────────── */
const StatsBar = () => {
  const [animate, setAnimate] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimate(true); },
      { threshold: 0.25 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="stats-section"
      id="platform-scale"
      ref={sectionRef}
      aria-labelledby="stats-title"
    >
      <div className="stats-header">
        <span className="swiss-section-label">06. PLATFORM SCALE</span>
        <h2 id="stats-title" className="stats-heading">
          THE NUMBERS<br />
          <span className="stats-heading-accent">SPEAK FOR THEMSELVES.</span>
        </h2>
      </div>

      <div className="stats-grid">
        {STATS.map((stat, i) => (
          <StatCard key={i} stat={stat} animate={animate} />
        ))}
      </div>
    </section>
  );
};

export default StatsBar;
