import { useState, useEffect } from 'react';

const REVIEWS = [
  {
    name: 'MICHAEL T.',
    stars: 5.0,
    review: 'Returned to competitive running after just 6 weeks of targeted physiotherapy. The precision of the treatment plan and the clarity of my exercise prescriptions made all the difference.',
    condition: 'POST-ACL RECONSTRUCTION',
    city: 'MUMBAI',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop&q=90'
  },
  {
    name: 'SARAH L.',
    stars: 5.0,
    review: 'Achieved full mobility and complete freedom from pain after years of chronic lower back issues. I genuinely thought surgery was my only option. Theralign proved otherwise.',
    condition: 'CHRONIC LOWER BACK PAIN',
    city: 'NEW DELHI',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&q=90'
  },
  {
    name: 'DAVID K.',
    stars: 5.0,
    review: 'Restored full range of overhead motion without requiring surgical intervention. The session records and follow-up recommendations kept me on track between every visit.',
    condition: 'ROTATOR CUFF INJURY',
    city: 'BANGALORE',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=90'
  },
  {
    name: 'PRIYA M.',
    stars: 5.0,
    review: 'The visual exercise prescriptions showed me exactly what to do and the YouTube demonstrations meant I never performed an exercise incorrectly. My recovery was faster than expected.',
    condition: 'POST-SURGICAL KNEE RECOVERY',
    city: 'PUNE',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&q=90'
  },
  {
    name: 'RAHUL S.',
    stars: 5.0,
    review: 'Booked my first appointment in under three minutes. My physiotherapist was exceptional — verified credentials, clear treatment plan, and genuine clinical expertise from session one.',
    condition: 'SPORTS INJURY — SHOULDER',
    city: 'CHENNAI',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&q=90'
  },
  {
    name: 'ANITA R.',
    stars: 5.0,
    review: 'Finally a platform that treats physiotherapy as serious healthcare and not just another appointment booking service. The care timeline gave me complete visibility into my own recovery.',
    condition: 'NEUROLOGICAL REHABILITATION',
    city: 'HYDERABAD',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&q=90'
  }
];

const PatientReviewsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % REVIEWS.length);
  };

  const handleDotClick = (idx) => {
    setCurrentIndex(idx);
  };

  return (
    <section 
      className="reviews-section" 
      id="testimonials" 
      aria-labelledby="reviews-title"
    >
      {/* Section header: UNCHANGED */}
      <div className="reviews-header">
        <span className="swiss-section-label">05. PATIENT OUTCOMES</span>
        <h2 id="reviews-title" className="reviews-section-title">
          PATIENT OUTCOMES
        </h2>
      </div>

      {/* Slider Container */}
      <div 
        className="testimonial-slider-container"
        role="region"
        aria-label="Patient testimonials"
        aria-live="polite"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className="testimonial-track"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {REVIEWS.map((review, idx) => (
            <div 
              key={idx}
              className="testimonial-card"
              aria-label={`Testimonial from ${review.name} — ${review.condition}`}
            >
              {/* LEFT COLUMN — Person Picture */}
              <div className="testimonial-left-col">
                <div className="testimonial-dashed-ring"></div>
                <img 
                  src={review.photo} 
                  alt={`${review.name} portrait`} 
                  className="testimonial-photo"
                />
              </div>

              {/* RIGHT COLUMN — Name, Stars, Review */}
              <div className="testimonial-right-col">
                <h3 className="testimonial-name">{review.name}</h3>
                <div className="testimonial-name-underline"></div>
                
                <div className="testimonial-stars-row">
                  <div className="testimonial-stars-container" aria-label={`Rating: ${review.stars} out of 5 stars`}>
                    <div className="testimonial-stars-bg">★★★★★</div>
                    <div className="testimonial-stars-fg" style={{ width: `${(review.stars / 5) * 100}%` }}>★★★★★</div>
                  </div>
                  <span className="testimonial-stars-number">{review.stars.toFixed(1)}</span>
                </div>

                <span className="testimonial-quote-open" aria-hidden="true">“</span>
                <blockquote className="testimonial-review-text">
                  {review.review}
                </blockquote>
                <span className="testimonial-quote-close" aria-hidden="true">”</span>

                <span className="testimonial-condition">{review.condition}</span>
                <span className="testimonial-city">{review.city}</span>
              </div>
            </div>
          ))}
        </div>

        {/* NAVIGATION CONTROLS */}
        <button 
          className="testimonial-btn-prev" 
          onClick={handlePrev}
          aria-label="Previous testimonial"
        >
          ←
        </button>
        <button 
          className="testimonial-btn-next" 
          onClick={handleNext}
          aria-label="Next testimonial"
        >
          →
        </button>

        {/* Slide Counter */}
        <div className="testimonial-counter">
          {String(currentIndex + 1).padStart(2, '0')} / {String(REVIEWS.length).padStart(2, '0')}
        </div>

        {/* Progress Indicators */}
        <div className="testimonial-indicators">
          {REVIEWS.map((_, idx) => (
            <div 
              key={idx}
              className={`testimonial-dot ${currentIndex === idx ? 'active' : ''}`}
              onClick={() => handleDotClick(idx)}
              aria-label={`Go to testimonial ${idx + 1}`}
              role="button"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PatientReviewsSection;
