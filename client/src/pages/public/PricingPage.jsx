import React, { useState } from 'react';
import SectionHeader from '../../components/common/SectionHeader';
import Card from '../../components/common/Card';

const PricingPage = () => {
  const [fee, setFee] = useState(1000); // Default ₹1,000 fee

  const handleFeeChange = (e) => {
    const val = Number(e.target.value);
    if (isNaN(val)) return;
    // Cap fee between 200 and 10000 for realistic physiotherapist consultation bounds
    setFee(Math.max(0, Math.min(10000, val)));
  };

  const commission = Math.round(fee * 0.1);
  const netPayout = fee - commission;

  return (
    <div className="max-w-page mx-auto py-12 px-6 select-none text-swiss-black bg-swiss-white text-left space-y-12">
      {/* Page Title */}
      <SectionHeader
        number="01."
        title="PRICING & COMMISSIONS"
        subtitle="COMPLETELY TRANSPARENT TRANSACTION SPLITS. NO SIGNUP FEES, NO SOFTWARE SUBSCRIPTIONS."
      />

      {/* Grid: Patient vs Clinician Portals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Patient Pricing Card */}
        <Card className="border-2 border-swiss-black p-8 flex flex-col gap-6 bg-swiss-white">
          <div>
            <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest block mb-2">
              PATIENTS PORTAL
            </span>
            <h3 className="text-display-xs font-black uppercase text-swiss-black tracking-tight mb-4">
              FREE DISCOVERY
            </h3>
            <div className="h-[1px] bg-swiss-gray-200 w-full mb-6" />
          </div>

          <div className="space-y-4 font-medium text-ui-md text-swiss-gray-650 flex-1">
            <p>
              Search, filter, and discover highly specialized certified physiotherapists in your locality at **zero administrative charge**.
            </p>
            <p>
              Pay only the consultation fees set independently by clinicians. No service markup, no platform fee additions, no hidden costs.
            </p>
            <div className="border border-swiss-black p-4 bg-swiss-gray-50 flex items-center justify-between mt-6">
              <span className="text-xs font-black uppercase tracking-wider text-swiss-black">REGISTRATION & BOOKING</span>
              <span className="text-xl font-black text-swiss-teal uppercase leading-none">₹0 FREE</span>
            </div>
          </div>
        </Card>

        {/* Clinician Pricing Card */}
        <Card className="border-2 border-swiss-black p-8 flex flex-col gap-6 bg-swiss-white">
          <div>
            <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest block mb-2">
              CLINICIANS PORTAL
            </span>
            <h3 className="text-display-xs font-black uppercase text-swiss-black tracking-tight mb-4">
              PAY-ON-COMPLETION
            </h3>
            <div className="h-[1px] bg-swiss-gray-200 w-full mb-6" />
          </div>

          <div className="space-y-4 font-medium text-ui-md text-swiss-gray-650 flex-1">
            <p>
              Onboard and gain exposure to patient searches in your area at **no setup cost**. THERALIGN charges no recurring software fees.
            </p>
            <p>
              A single flat commission is withheld only from successfully completed consultations. Cancelled appointments trigger no fees.
            </p>
            <div className="border border-swiss-black p-4 bg-swiss-gray-50 flex items-center justify-between mt-6">
              <span className="text-xs font-black uppercase tracking-wider text-swiss-black">FLAT PLATFORM COMMISSION</span>
              <span className="text-xl font-black text-swiss-black uppercase leading-none">10% FLAT</span>
            </div>
          </div>
        </Card>

      </div>

      {/* Interactive Payout Calculator */}
      <div className="bg-swiss-white border-2 border-swiss-black p-8 rounded-none shadow-none space-y-6">
        <div className="pb-4 border-b border-swiss-gray-200">
          <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest block mb-1">
            INTERACTIVE ESTIMATION
          </span>
          <h3 className="text-ui-lg font-black text-swiss-black uppercase tracking-tight">
            CLINICIAN NET EARNINGS CALCULATOR
          </h3>
          <p className="text-xs text-swiss-gray-600 mt-1 font-medium">
            Enter your custom single-session consultation fee below to calculate your platform splits instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Controls - Slider and input (5 columns) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-swiss-black uppercase tracking-widest">
                CONSULTATION FEE (₹200 - ₹5,000)
              </label>
              <div className="flex items-center gap-4">
                <span className="text-lg font-black text-swiss-black select-none">₹</span>
                <input
                  type="number"
                  min="200"
                  max="10000"
                  value={fee}
                  onChange={handleFeeChange}
                  className="w-full px-4 py-2 border-2 border-swiss-black text-sm font-bold focus:outline-none uppercase rounded-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <input
                type="range"
                min="200"
                max="5000"
                step="50"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                className="w-full h-1 bg-swiss-gray-200 border-none outline-none appearance-none cursor-pointer accent-swiss-black rounded-none"
                style={{
                  background: `linear-gradient(to right, #0F0F0F 0%, #0F0F0F ${((fee - 200) / 4800) * 100}%, #E5E5E5 ${((fee - 200) / 4800) * 100}%, #E5E5E5 100%)`
                }}
              />
            </div>
          </div>

          {/* Outputs - Bordered boxes row (7 columns) */}
          <div className="lg:col-span-7">
            <div className="flex flex-col sm:flex-row border-2 border-swiss-black divide-y sm:divide-y-0 sm:divide-x border-collapse text-center">
              
              {/* Gross Patient Fee */}
              <div className="flex-1 p-5 bg-swiss-gray-50 text-left">
                <span className="text-[9px] font-black text-swiss-gray-400 uppercase tracking-widest block leading-none">PATIENT PAYS</span>
                <span className="text-2xl font-black text-swiss-black swiss-numeric block mt-3 leading-none">₹{fee.toLocaleString('en-IN')}</span>
                <span className="text-[9px] font-bold text-swiss-gray-400 uppercase tracking-wide block mt-2">Gross booking total</span>
              </div>

              {/* Commission split (10%) */}
              <div className="flex-1 p-5 bg-swiss-gray-50 text-left">
                <span className="text-[9px] font-black text-swiss-gray-400 uppercase tracking-widest block leading-none">COMMISSION (10%)</span>
                <span className="text-2xl font-black text-swiss-red swiss-numeric block mt-3 leading-none">₹{commission.toLocaleString('en-IN')}</span>
                <span className="text-[9px] font-bold text-swiss-gray-400 uppercase tracking-wide block mt-2">Platform operational share</span>
              </div>

              {/* Doctor net payout (90%) */}
              <div className="flex-1 p-5 bg-swiss-gray-50 text-left">
                <span className="text-[9px] font-black text-swiss-teal uppercase tracking-widest block leading-none">DOCTOR RECEIVES (90%)</span>
                <span className="text-2xl font-black text-swiss-teal swiss-numeric block mt-3 leading-none">₹{netPayout.toLocaleString('en-IN')}</span>
                <span className="text-[9px] font-bold text-swiss-teal uppercase tracking-wide block mt-2">Direct bank reconciliation</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PricingPage;
