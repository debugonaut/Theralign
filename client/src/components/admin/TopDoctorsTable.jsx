import React from 'react';

const RANK_MEDALS = ['🥇', '🥈', '🥉'];
const METRIC_OPTIONS = [
  { key: 'earnings',     label: 'By Earnings' },
  { key: 'appointments', label: 'By Appointments' },
  { key: 'rating',       label: 'By Rating' },
];

const TopDoctorsTable = ({ doctors = [], metric = 'earnings', onMetricChange }) => {
  return (
    <div>
      {/* Sort Toggle */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {METRIC_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onMetricChange?.(opt.key)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              metric === opt.key
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {doctors.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-sm">
          No doctor data available yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider">
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Doctor</th>
                <th className="py-2 px-3 hidden md:table-cell">Specialization</th>
                <th className="py-2 px-3 text-right">Appts</th>
                <th className="py-2 px-3 text-right">Earnings</th>
                <th className="py-2 px-3 text-right">Rating</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc, index) => (
                <tr
                  key={doc.doctorId}
                  className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3 px-3 font-bold text-slate-300 text-base">
                    {index < 3 ? RANK_MEDALS[index] : index + 1}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs shrink-0">
                        {doc.doctorName?.[0]?.toUpperCase() || 'D'}
                      </div>
                      <span className="font-medium text-slate-200 truncate max-w-[120px]">
                        Dr. {doc.doctorName || '—'}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 hidden md:table-cell">
                    <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded truncate">
                      {Array.isArray(doc.specialization)
                        ? doc.specialization[0]
                        : doc.specialization || '—'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-300 font-medium">
                    {doc.totalAppointments ?? 0}
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-400 font-semibold">
                    ₹{(doc.totalEarnings || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-amber-400 font-semibold text-sm">
                      {doc.averageRating ? `${parseFloat(doc.averageRating).toFixed(1)}★` : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TopDoctorsTable;
