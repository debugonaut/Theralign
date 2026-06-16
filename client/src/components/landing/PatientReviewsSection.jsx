import { useState, useEffect, useCallback } from 'react';

const REVIEWS = [
  {
    name: 'Anita Sharma',
    stars: 5.0,
    review: 'Finally a platform that treats physiotherapy as serious healthcare, not just a booking. My shoulder pain is completely gone and I\'m back to my daily workouts!',
    condition: 'SHOULDER PAIN RECOVERY',
    city: 'HYDERABAD',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=500&fit=crop&q=90',
  },
  {
    name: 'Michael T.',
    stars: 5.0,
    review: 'Returned to competitive running after just 6 weeks of targeted physiotherapy. The precision of the treatment plan and the clarity of my exercise prescriptions made all the difference.',
    condition: 'POST-ACL RECONSTRUCTION',
    city: 'MUMBAI',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&h=500&fit=crop&q=90',
  },
  {
    name: 'Sarah L.',
    stars: 5.0,
    review: 'Achieved full mobility and complete freedom from pain after years of chronic lower back issues. I genuinely thought surgery was my only option. Theralign proved otherwise.',
    condition: 'CHRONIC LOWER BACK PAIN',
    city: 'NEW DELHI',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=500&fit=crop&q=90',
  },
  {
    name: 'David K.',
    stars: 5.0,
    review: 'Restored full range of overhead motion without requiring surgical intervention. The session records and follow-up recommendations kept me on track between every visit.',
    condition: 'ROTATOR CUFF INJURY',
    city: 'BANGALORE',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&q=90',
  },
  {
    name: 'Priya M.',
    stars: 5.0,
    review: 'The visual exercise prescriptions showed me exactly what to do and the YouTube demonstrations meant I never performed an exercise incorrectly. My recovery was faster than expected.',
    condition: 'POST-SURGICAL KNEE RECOVERY',
    city: 'PUNE',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=500&fit=crop&q=90',
  },
  {
    name: 'Rahul S.',
    stars: 5.0,
    review: 'Booked my first appointment in under three minutes. My physiotherapist was exceptional — verified credentials, clear treatment plan, and genuine clinical expertise from session one.',
    condition: 'SPORTS INJURY — SHOULDER',
    city: 'CHENNAI',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&h=500&fit=crop&q=90',
  },
];

const StarRating = ({ rating }) => (
  <div className="pr-star-row" aria-label={`Rating: ${rating} out of 5 stars`}>
    <span className="pr-star">★</span>
    <span className="pr-rating-num">{rating.toFixed(1)}</span>
    <span className="pr-verified-badge">Verified Patient</span>
  </div>
);

const PatientReviewsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const goTo = useCallback((idx) => {
    setCurrentIndex((idx + REVIEWS.length) % REVIEWS.length);
  }, []);

  const handlePrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);
  const handleNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const review = REVIEWS[currentIndex];

  return (
    <section
      className="pr-section"
      id="testimonials"
      aria-labelledby="pr-title"
    >
      {/* Section header */}
      <div className="pr-header">
        <span className="swiss-section-label">08. PATIENT OUTCOMES</span>
        <h2 id="pr-title" className="pr-section-title">
          PATIENT OUTCOMES
        </h2>
      </div>

      {/* Slider */}
      <div
        className="pr-slider"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="region"
        aria-label="Patient testimonials"
        aria-live="polite"
      >
        {/* Left arrow */}
        <button className="pr-arrow pr-arrow--left" onClick={handlePrev} aria-label="Previous testimonial">
          ←
        </button>

        {/* Card */}
        <div className="pr-card" key={currentIndex} aria-label={`Testimonial from ${review.name}`}>
          {/* Left — Photo */}
          <div className="pr-photo-col">
            <div className="pr-photo-ring">
              <img
                src={review.photo}
                alt={`${review.name} portrait`}
                className="pr-photo"
              />
            </div>
          </div>

          {/* Right — Content */}
          <div className="pr-content-col">
            <h3 className="pr-name">{review.name}</h3>
            <div className="pr-name-rule" />
            <StarRating rating={review.stars} />

            <div className="pr-quote-block">
              <span className="pr-quote-mark pr-quote-open" aria-hidden="true">"</span>
              <blockquote className="pr-quote-text">
                {review.review}
              </blockquote>
              <span className="pr-quote-mark pr-quote-close" aria-hidden="true">"</span>
            </div>

            <div className="pr-meta-rule" />
            <p className="pr-city">{review.city}</p>
            <p className="pr-condition">{review.condition}</p>
          </div>
        </div>

        {/* Right arrow */}
        <button className="pr-arrow pr-arrow--right" onClick={handleNext} aria-label="Next testimonial">
          →
        </button>

        {/* Dot indicators */}
        <div className="pr-dots" role="tablist" aria-label="Testimonial indicators">
          {REVIEWS.map((_, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={idx === currentIndex}
              aria-label={`Go to testimonial ${idx + 1}`}
              className={`pr-dot${idx === currentIndex ? ' pr-dot--active' : ''}`}
              onClick={() => goTo(idx)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PatientReviewsSection;
