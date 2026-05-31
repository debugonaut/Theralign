import React from 'react';
import { useNavigate } from 'react-router-dom';
import Table, { ActionLink } from '../common/Table';

const RANK_ICONS = ['🥇', '🥈', '🥉'];
const METRIC_OPTIONS = [
  { key: 'earnings',     label: 'BY EARNINGS' },
  { key: 'appointments', label: 'BY APPOINTMENTS' },
  { key: 'rating',       label: 'BY RATING' },
];

const TopDoctorsTable = ({ doctors = [], metric = 'earnings', onMetricChange }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-2 border-neutral-900 rounded-none shadow-none text-left">
      {/* Header with Sort Controls */}
      <div className="p-6 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">
            PERFORMANCE METRICS
          </span>
          <h3 className="text-ui-lg font-black text-neutral-900 uppercase tracking-tight">
            CLINICIAN LEADERBOARD
          </h3>
        </div>

        {/* Flat Text Sort Links with Red Underline */}
        <div className="flex items-center gap-6">
          {METRIC_OPTIONS.map((opt) => {
            const isActive = metric === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => onMetricChange?.(opt.key)}
                className={`text-[11px] font-black uppercase tracking-widest select-none cursor-pointer bg-transparent border-0 pb-1.5 transition-colors duration-fast ${
                  isActive 
                    ? 'text-accent border-b-2 border-accent' 
                    : 'text-neutral-500 hover:text-neutral-900 border-b-2 border-transparent'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {doctors.length === 0 ? (
        <div className="p-12 text-center text-neutral-500 text-ui-sm font-bold uppercase tracking-wider">
          NO CLASSIFIED CLINICIAN RECORDS
        </div>
      ) : (
        <Table>
          <Table.Head>
            <Table.Row>
              <Table.Header className="w-[80px]">Rank</Table.Header>
              <Table.Header>Doctor</Table.Header>
              <Table.Header>Specialization</Table.Header>
              <Table.Header numeric={true}>Appointments</Table.Header>
              <Table.Header numeric={true}>Total Earnings</Table.Header>
              <Table.Header numeric={true} className="w-[100px]">Rating</Table.Header>
              <Table.Header className="w-[120px]"></Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {doctors.map((doc, index) => {
              const docName = doc.doctorName || doc.user?.name || 'Physiotherapist';
              const ratingVal = doc.averageRating ? parseFloat(doc.averageRating).toFixed(1) : '0.0';
              const specText = Array.isArray(doc.specialization)
                ? doc.specialization[0]
                : doc.specialization || 'GENERAL';

              return (
                <Table.Row 
                  key={doc.doctorId || doc._id} 
                  hoverable={true} 
                  className="group"
                >
                  {/* Rank */}
                  <Table.Cell className="font-bold text-neutral-900">
                    {index < 3 ? (
                      <span className="text-lg leading-none" role="img" aria-label="medal">
                        {RANK_ICONS[index]}
                      </span>
                    ) : (
                      <span className="font-mono text-ui-sm">{index + 1}</span>
                    )}
                  </Table.Cell>

                  {/* Doctor Name and Initial circle */}
                  <Table.Cell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs uppercase select-none shrink-0">
                        {docName[0]}
                      </div>
                      <span className="font-bold text-neutral-900 uppercase tracking-wide text-xs">
                        Dr. {docName}
                      </span>
                    </div>
                  </Table.Cell>

                  {/* Specialization tag */}
                  <Table.Cell className="font-bold text-accent uppercase tracking-widest text-[10px]">
                    {specText.toUpperCase()}
                  </Table.Cell>

                  {/* Appointments */}
                  <Table.Cell numeric={true} className="font-bold">
                    {doc.totalAppointments || doc.appointmentsCount || 0}
                  </Table.Cell>

                  {/* Total Earnings */}
                  <Table.Cell numeric={true} className="font-black text-neutral-900">
                    ₹{(doc.totalEarnings || 0).toLocaleString('en-IN')}
                  </Table.Cell>

                  {/* Rating square with zero border radius */}
                  <Table.Cell numeric={true}>
                    <div className="flex justify-end">
                      <div className="w-8 h-8 border-2 border-neutral-900 bg-white flex items-center justify-center text-xs font-black text-neutral-900 rounded-none">
                        {ratingVal}
                      </div>
                    </div>
                  </Table.Cell>

                  {/* Progressive disclosure link - VIEW PROFILE appears on row hover */}
                  <Table.Cell className="text-right">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-fast">
                      <ActionLink
                        onClick={() => navigate(`/admin/doctors/${doc.doctorId || doc._id}`)}
                        className="text-accent hover:underline"
                      >
                        VIEW PROFILE →
                      </ActionLink>
                    </span>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      )}
    </div>
  );
};

export default TopDoctorsTable;
