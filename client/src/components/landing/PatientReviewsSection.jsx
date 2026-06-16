import React from 'react';

const REVIEWS = [
  {
    quote: 'Returned to competitive running after 6 weeks of targeted therapy.',
    name: 'MICHAEL',
    city: 'Mumbai',
    condition: 'POST-ACL RECONSTRUCTION',
  },
  {
    quote: 'Achieved full mobility and zero pain symptoms after years of chronic back issues.',
    name: 'SARAH',
    city: 'Delhi',
    condition: 'CHRONIC LOWER BACK PAIN',
  },
  {
    quote: 'Restored full range of overhead motion without surgery.',
    name: 'DAVID',
    city: 'Bangalore',
    condition: 'ROTATOR CUFF INJURY',
  },
  {
    quote: 'The exercise prescriptions I received actually showed me exactly how to recover.',
    name: 'PRIYA',
    city: 'Pune',
    condition: 'POST-SURGICAL KNEE',
  },
  {
    quote: 'Booked my first appointment in under 3 minutes. My physio was exceptional.',
    name: 'RAHUL',
    city: 'Chennai',
    condition: 'SPORTS INJURY',
  },
  {
    quote: 'Finally a platform that treats physiotherapy as serious healthcare, not just a booking app.',
    name: 'ANITA',
    city: 'Hyderabad',
    condition: 'NEUROLOGICAL REHAB',
  },
];

const PatientReviewsSection = () => {
  return (
    <section className="reviews-section" id="testimonials" aria-labelledby="reviews-title">
      {/* Section header */}
      <div className="reviews-header">
        <span className="swiss-section-label">05. PATIENT OUTCOMES</span>
        <h2 id="reviews-title" className="reviews-section-title">
          PATIENT OUTCOMES
        </h2>
      </div>

      {/* Circular card grid */}
      <div className="reviews-grid">
        {REVIEWS.map((review, idx) => (
          <div key={idx} className="review-card">
            {/* Opening quote mark */}
            <span className="review-quote-mark" aria-hidden="true">&ldquo;</span>

            {/* Quote text */}
            <p className="review-quote">{review.quote}</p>

            {/* Stars */}
            <div className="review-stars" aria-label="5 stars">
              ★★★★★
            </div>

            {/* Name */}
            <p className="review-name">{review.name}</p>

            {/* City */}
            <p className="review-city">{review.city}</p>

            {/* Condition */}
            <p className="review-condition">{review.condition}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PatientReviewsSection;
