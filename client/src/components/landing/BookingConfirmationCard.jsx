import React from 'react';
import { CheckCircle2, BadgeCheck, ShieldCheck } from 'lucide-react';

const BookingConfirmationCard = () => {
  return (
    <div className="relative w-[420px] max-w-[420px] mx-auto select-none" style={{ overflow: 'hidden', borderRadius: '16px' }}>
      {/* Decorative Background Circle */}
      <div 
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '360px',
          height: '360px',
          borderRadius: '50%',
          backgroundColor: '#E8F4F8',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Card Shell */}
      <div 
        className="relative z-[1] hero-card-float"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          boxShadow: '0px 24px 64px rgba(11, 79, 108, 0.14), 0px 8px 24px rgba(11, 79, 108, 0.10), 0px 2px 6px rgba(11, 79, 108, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          border: 'none',
          outline: 'none',
        }}
      >
        {/* Section 1 — The Confirmation Header Bar */}
        <div 
          style={{
            height: '60px',
            backgroundColor: '#0B4F6C',
            borderRadius: '16px 16px 0px 0px',
            padding: '0px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Left Side */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <CheckCircle2 size={20} color="#FFFFFF" strokeWidth={2} />
            <span 
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: '13px',
                color: '#FFFFFF',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              BOOKING CONFIRMED
            </span>
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
            <span 
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: '9px',
                color: 'rgba(255, 255, 255, 0.55)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              REF NO.
            </span>
            <span 
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.90)',
                letterSpacing: '0.06em',
              }}
            >
              #PC-28471
            </span>
          </div>
        </div>

        {/* Section 2 — The Doctor Identity Row */}
        <div 
          style={{
            padding: '20px 24px 16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #EEF2F6',
          }}
        >
          {/* Left Side */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            {/* Avatar Circle */}
            <div 
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#E8F4F8',
                border: '2.5px solid #0B4F6C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span 
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 800,
                  fontSize: '17px',
                  color: '#0B4F6C',
                  letterSpacing: '-0.02em',
                }}
              >
                PS
              </span>
            </div>

            {/* Doctor Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span 
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: '15px',
                  color: '#1C2B3A',
                  letterSpacing: '-0.01em',
                }}
              >
                Dr. Priya Sharma
              </span>
              <span 
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: '10px',
                  color: '#F4845F',
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                }}
              >
                ORTHOPEDIC PHYSIOTHERAPY
              </span>
            </div>
          </div>

          {/* Right Side — Verified Badge */}
          <div 
            style={{
              backgroundColor: '#E8F4F8',
              border: '1px solid #0B4F6C',
              borderRadius: '4px',
              padding: '4px 10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <BadgeCheck size={12} color="#0B4F6C" />
            <span 
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: '10px',
                color: '#0B4F6C',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              VERIFIED
            </span>
          </div>
        </div>

        {/* Section 3 — The Appointment Details Grid */}
        <div 
          style={{
            padding: '16px 24px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            columnGap: '16px',
            rowGap: '14px',
            borderBottom: '1px solid #EEF2F6',
          }}
        >
          {/* Cell 1 — top left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span 
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '10px',
                color: '#6B7C93',
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
              }}
            >
              DATE
            </span>
            <span 
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '14px',
                color: '#1C2B3A',
                letterSpacing: '-0.01em',
              }}
            >
              14 June 2025
            </span>
          </div>

          {/* Cell 2 — top right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span 
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '10px',
                color: '#6B7C93',
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
              }}
            >
              TIME
            </span>
            <span 
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '14px',
                color: '#1C2B3A',
                letterSpacing: '-0.01em',
              }}
            >
              10:30 AM
            </span>
          </div>

          {/* Cell 3 — bottom left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span 
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '10px',
                color: '#6B7C93',
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
              }}
            >
              CLINIC
            </span>
            <span 
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '14px',
                color: '#1C2B3A',
                letterSpacing: '-0.01em',
              }}
            >
              ActiveCare Physio
            </span>
          </div>

          {/* Cell 4 — bottom right */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span 
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '10px',
                color: '#6B7C93',
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
              }}
            >
              SESSION
            </span>
            <span 
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: '14px',
                color: '#1C2B3A',
                letterSpacing: '-0.01em',
              }}
            >
              In-Person
            </span>
          </div>
        </div>

        {/* Section 4 — The Payment Summary */}
        <div 
          style={{
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Row 1 — Consultation Fee */}
          <div 
            style={{
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span 
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: '13px',
                color: '#3D5166',
              }}
            >
              Consultation Fee
            </span>
            <span 
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: '13px',
                color: '#3D5166',
              }}
            >
              ₹800
            </span>
          </div>

          {/* Row 2 — Platform Fee */}
          <div 
            style={{
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span 
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: '13px',
                color: '#A8B8C8',
              }}
            >
              Platform Fee (10%)
            </span>
            <span 
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400,
                fontSize: '13px',
                color: '#A8B8C8',
              }}
            >
              ₹80
            </span>
          </div>

          {/* Row 3 — Total Paid */}
          <div 
            style={{
              height: '28px',
              marginTop: '10px',
              paddingTop: '12px',
              borderTop: '1.5px solid #1C2B3A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxSizing: 'content-box',
            }}
          >
            <span 
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 700,
                fontSize: '14px',
                color: '#1C2B3A',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              TOTAL PAID
            </span>
            <span 
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 800,
                fontSize: '16px',
                color: '#0B4F6C',
                letterSpacing: '-0.02em',
              }}
            >
              ₹800
            </span>
          </div>
        </div>

        {/* Section 5 — The Payment Confirmation Strip */}
        <div 
          style={{
            padding: '14px 24px 20px 24px',
          }}
        >
          <div 
            style={{
              backgroundColor: '#F0FBF8',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            {/* Left Side */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <ShieldCheck size={16} color="#0A7E6E" strokeWidth={2} />
              <span 
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: '12px',
                  color: '#0A7E6E',
                }}
              >
                Payment Secured by Razorpay
              </span>
            </div>

            {/* Right Side */}
            <span 
              style={{
                fontFamily: "'Courier New', Courier, monospace",
                fontWeight: 400,
                fontSize: '11px',
                color: '#6B7C93',
              }}
            >
              pay_8Xk2mNpQ3r
            </span>
          </div>
        </div>
      </div>

      {/* The Card Footer */}
      <div 
        style={{
          marginTop: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Footer Line 1 */}
        <span 
          style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            fontSize: '11px',
            color: '#6B7C93',
            textAlign: 'center',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            columnGap: '6px',
            rowGap: '2px',
          }}
        >
          <span>✓ Instant Confirmation</span><span>·</span><span>✓ Secure Payment</span><span>·</span><span>✓ Free Rescheduling</span>
        </span>

        {/* Footer Line 2 */}
        <span 
          style={{
            marginTop: '6px',
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: '11px',
            color: '#A8B8C8',
            textAlign: 'center',
            letterSpacing: '0.01em',
          }}
        >
          Confirmation sent to patient@email.com
        </span>
      </div>
    </div>
  );
};

export default BookingConfirmationCard;
