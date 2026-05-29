import React from 'react';
import { Link } from 'react-router-dom';
import { calculateProfileCompletion } from '../../utils/profileCompletion';

const ProfileCompletionCard = ({ doctorProfile, user, slotCount }) => {
  const profileWithSlots = { ...doctorProfile, hasSlots: slotCount > 0 };
  const { percentage, missing, isComplete } = calculateProfileCompletion(profileWithSlots, user);

  if (isComplete) return null; // Hide the card entirely when profile is 100% complete

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm mb-6 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Complete Your Profile</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            A complete profile gets up to 3× more patient bookings.
          </p>
        </div>
        <span className="text-2xl font-extrabold text-primary select-none">{percentage}%</span>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 mb-5 overflow-hidden">
        <div
          className="bg-primary h-2.5 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Missing Checklist */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Remaining Actions:
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {missing.map((item) => (
            <li key={item.key}>
              <Link
                to={item.link}
                className="flex items-center gap-2.5 p-2 rounded-lg text-sm text-slate-600 hover:text-primary hover:bg-slate-50 border border-slate-100/50 hover:border-primary/20 transition-all group"
              >
                <span className="w-4 h-4 rounded-full border-2 border-slate-300 group-hover:border-primary flex-shrink-0 flex items-center justify-center transition-colors" />
                <span className="truncate">{item.label}</span>
                <span className="text-xs text-slate-400 font-semibold ml-auto flex-shrink-0 bg-slate-100 group-hover:bg-sky-50 group-hover:text-primary px-1.5 py-0.5 rounded transition-all">
                  +{item.weight}%
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProfileCompletionCard;
