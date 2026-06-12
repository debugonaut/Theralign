import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Calendar,
  Dumbbell,
  Pill,
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

import useAuthStore from '../../store/authStore';
import { getPatientTimeline } from '../../api/sessionRecord.api';
import SectionHeader from '../../components/common/SectionHeader';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';

const PROGRESS_RATING_BADGES = {
  worse: { label: 'Worse', bg: 'bg-[#C0392B] text-white border-[#C0392B]' },
  no_change: { label: 'No Change', bg: 'bg-[#B45309] text-white border-[#B45309]' },
  slight_improvement: { label: 'Slight Improvement', bg: 'bg-[#0B4F6C] text-white border-[#0B4F6C]' },
  significant_improvement: { label: 'Significant Improvement', bg: 'bg-[#0A7E6E] text-white border-[#0A7E6E]' },
  resolved: { label: 'Resolved', bg: 'bg-[#0A7E6E] text-white border-[#0A7E6E]', showCheck: true },
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateString;
  }
};

const formatMetadataDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const formatMetadataTime = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
};

export default function PatientCareTimeline() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();

  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ totalSessions: 0, doctorsSeen: 0, latestProgressRating: null });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Persistent unique list of doctors for dropdown
  const [doctorsList, setDoctorsList] = useState([]);

  // Accordion card expanded row IDs
  const [expandedRecordIds, setExpandedRecordIds] = useState([]);

  const fetchTimeline = async (page = 1, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
      };
      if (selectedDoctorId) params.doctorId = selectedDoctorId;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const res = await getPatientTimeline(params);
      const data = res.data?.data || res.data;
      if (data) {
        setRecords(data.records || []);
        setPagination(data.pagination || { page, limit: 10, total: 0, pages: 1 });
        setSummary(
          data.summary || { totalSessions: 0, doctorsSeen: 0, latestProgressRating: null }
        );

        // Harvest and persist unique doctor list from unfiltered results
        // When there is no doctorId filter active, capture list of all doctors patient has seen
        if (!selectedDoctorId && data.records) {
          setDoctorsList((prev) => {
            const currentList = [...prev];
            data.records.forEach((rec) => {
              if (rec.doctor && rec.doctor._id) {
                if (!currentList.some((d) => d._id === rec.doctor._id)) {
                  currentList.push(rec.doctor);
                }
              }
            });
            return currentList;
          });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your care timeline.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'CARE HISTORY — Theralign';
    fetchTimeline(currentPage, false);
  }, [selectedDoctorId, dateFrom, dateTo, currentPage]);

  const toggleExpand = (recordId) => {
    if (expandedRecordIds.includes(recordId)) {
      setExpandedRecordIds(expandedRecordIds.filter((id) => id !== recordId));
    } else {
      setExpandedRecordIds([...expandedRecordIds, recordId]);
    }
  };

  const handleClearFilters = () => {
    setSelectedDoctorId('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const isFilterActive = selectedDoctorId || dateFrom || dateTo;

  // Print friendly view injection
  const handlePrintExercisePlan = (e, record) => {
    e.stopPropagation();
    const patientName = currentUser?.name || 'Patient';
    const doctorName = record.doctor?.user?.name || 'Physiotherapist';
    const apptDate = formatDate(record.appointment?.date);

    const printContainer = document.createElement('div');
    printContainer.id = 'theralign-print-root';
    printContainer.innerHTML = `
      <div class="print-header">
        <h2>THERALIGN EXERCISE PLAN</h2>
        <div class="print-meta">
          <div><strong>Patient:</strong> ${patientName}</div>
          <div><strong>Date:</strong> ${apptDate}</div>
          <div><strong>Physiotherapist:</strong> Dr. ${doctorName}</div>
          <div><strong>Clinic:</strong> ${record.doctor?.clinicName || 'Theralign Clinic'}</div>
        </div>
      </div>
      <table class="print-table">
        <thead>
          <tr>
            <th>Exercise</th>
            <th>Sets</th>
            <th>Reps</th>
            <th>Frequency</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          ${record.exercisePrescription
            .map(
              (ex) => `
            <tr>
              <td>
                <div class="ex-name">${ex.exerciseName}</div>
                ${ex.notes ? `<div class="ex-notes">${ex.notes}</div>` : ''}
              </td>
              <td>${ex.sets || '—'}</td>
              <td>${ex.reps || '—'}</td>
              <td>${ex.frequency || '—'}</td>
              <td>${ex.duration || '—'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;

    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body > * {
          display: none !important;
        }
        #theralign-print-root {
          display: block !important;
          font-family: 'Inter', sans-serif;
          color: #1C2B3A;
          padding: 20px;
        }
        .print-header {
          border-bottom: 2px solid #1C2B3A;
          padding-bottom: 12px;
          margin-bottom: 20px;
        }
        .print-header h2 {
          margin: 0 0 10px 0;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 0.05em;
        }
        .print-meta {
          display: grid;
          grid-template-cols: 1fr 1fr;
          gap: 8px;
          font-size: 12px;
        }
        .print-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        .print-table th, .print-table td {
          border: 1px solid #EEF2F6;
          padding: 10px;
          text-align: left;
          font-size: 12px;
        }
        .print-table th {
          background-color: #F8FAFC !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          font-weight: 700;
          text-transform: uppercase;
          color: #6B7C93;
        }
        .ex-name {
          font-weight: 700;
        }
        .ex-notes {
          font-size: 10px;
          color: #6b7c93;
          margin-top: 3px;
        }
      }
      #theralign-print-root {
        display: none;
      }
    `;

    document.body.appendChild(printContainer);
    document.head.appendChild(style);

    window.print();

    document.body.removeChild(printContainer);
    document.head.removeChild(style);
  };

  const getPainDeltaInfo = (before, after) => {
    if (before === null || after === null || before === undefined || after === undefined) return null;
    const delta = Math.abs(before - after);
    if (after < before) {
      return { text: `Pain: ${before}/10 → ${after}/10`, color: 'text-[#0A7E6E]', direction: 'better' };
    } else if (after > before) {
      return { text: `Pain: ${before}/10 → ${after}/10`, color: 'text-[#C0392B]', direction: 'worse' };
    } else {
      return { text: `Pain: ${before}/10 → ${after}/10`, color: 'text-[#6B7C93]', direction: 'unchanged' };
    }
  };

  const getDoctorNameDisplay = (doc) => {
    if (!doc?.user?.name) return 'Physiotherapist';
    const name = doc.user.name;
    return name.toLowerCase().startsWith('dr.') ? name : `Dr. ${name}`;
  };

  return (
    <div className="flex flex-col gap-5 select-none text-left bg-[#F7F9FB] min-h-[90vh] pb-24">
      {/* Header */}
      <SectionHeader
        title="Care History"
        subtitle="Your complete treatment journey across all physiotherapists."
        className="mb-0"
      />

      {/* Loading state */}
      {loading && records.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <Loader2 className="animate-spin h-8 w-8 text-[#0B4F6C]" />
          <span className="text-ui-sm font-black uppercase text-neutral-500 tracking-wider">Loading Care Timeline...</span>
        </div>
      ) : (
        <>
          {/* Summary Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2 select-none">
            {/* Total Sessions Card */}
            <div className="p-6 bg-white border border-neutral-200/40 rounded-xl shadow-level-1 hover:shadow-level-2 transition-warm flex flex-col justify-between h-28 select-none">
              <div>
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                  TOTAL SESSIONS
                </span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mt-1">
                  COMPLETED APPOINTMENTS
                </span>
              </div>
              <div className="flex items-baseline select-none">
                <span className="text-display-xs font-black text-neutral-900 select-none leading-none block">
                  {summary.totalSessions}
                </span>
              </div>
            </div>

            {/* Doctors Seen Card */}
            <div className="p-6 bg-white border border-neutral-200/40 rounded-xl shadow-level-1 hover:shadow-level-2 transition-warm flex flex-col justify-between h-28 select-none">
              <div>
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                  DOCTORS SEEN
                </span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mt-1">
                  UNIQUE PHYSIOTHERAPISTS
                </span>
              </div>
              <div className="flex items-baseline select-none">
                <span className="text-display-xs font-black text-neutral-900 select-none leading-none block">
                  {summary.doctorsSeen}
                </span>
              </div>
            </div>

            {/* Latest Progress Card */}
            <div className="p-6 bg-white border border-neutral-200/40 rounded-xl shadow-level-1 hover:shadow-level-2 transition-warm flex flex-col justify-between h-28 select-none">
              <div>
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                  LATEST PROGRESS
                </span>
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mt-1">
                  LAST REPORTED CONDITION
                </span>
              </div>
              <div className="flex items-center mt-2 select-none">
                {summary.latestProgressRating ? (
                  (() => {
                    const badge = PROGRESS_RATING_BADGES[summary.latestProgressRating];
                    return (
                      <span className={`${badge?.bg} border px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-md`}>
                        {badge?.label}
                      </span>
                    );
                  })()
                ) : (
                  <span className="text-display-xs font-black text-neutral-300 leading-none select-none block">
                    —
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-neutral-200/50 rounded-xl p-4 px-6 flex flex-wrap items-center justify-between gap-4 shadow-sm select-none">
            <div className="flex flex-wrap items-center gap-4 flex-1">
              {/* Doctor Dropdown */}
              <div className="flex flex-col gap-1.5 min-w-[200px]">
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                  FILTER BY DOCTOR
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => {
                    setSelectedDoctorId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-neutral-200 rounded-lg p-2 text-ui-xs font-semibold text-neutral-800 focus:outline-none focus:border-[#0B4F6C]"
                >
                  <option value="">ALL DOCTORS</option>
                  {doctorsList.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {getDoctorNameDisplay(doc).toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div className="flex flex-col gap-1.5 min-w-[150px]">
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                  FROM DATE
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-neutral-200 rounded-lg p-1.5 text-ui-xs font-semibold text-neutral-800 focus:outline-none focus:border-[#0B4F6C]"
                />
              </div>

              {/* Date To */}
              <div className="flex flex-col gap-1.5 min-w-[150px]">
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                  TO DATE
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-neutral-200 rounded-lg p-1.5 text-ui-xs font-semibold text-neutral-800 focus:outline-none focus:border-[#0B4F6C]"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {isFilterActive && (
              <button
                onClick={handleClearFilters}
                className="h-10 px-4 border border-neutral-300 hover:border-neutral-800 text-neutral-500 hover:text-neutral-800 font-bold text-ui-xs flex items-center uppercase tracking-widest transition-colors select-none rounded-md bg-transparent cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Timeline Cards Container */}
          {records.length === 0 ? (
            <div className="py-6 select-none bg-white border border-neutral-200/50 rounded-xl">
              <EmptyState
                title="NO CARE RECORDS YET"
                description={
                  isFilterActive
                    ? 'Adjust or clear your filters to find other completed session notes.'
                    : 'Your session records will appear here after your physiotherapist completes their notes following each appointment.'
                }
                context="informational"
                icon={ClipboardList}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-4 select-none">
              {records.map((rec, idx) => {
                const isExpanded = expandedRecordIds.includes(rec._id);
                const docName = getDoctorNameDisplay(rec.doctor);
                const specArray = rec.doctor?.specialization || ['General Physiotherapy'];
                const primarySpec = specArray[0] || 'General Physiotherapy';
                const ratingBadge = PROGRESS_RATING_BADGES[rec.progressRating];
                const painInfo = getPainDeltaInfo(rec.painScoreBefore, rec.painScoreAfter);
                const exCount = rec.exercisePrescription?.length || 0;
                const showFollowup = rec.followUpRecommendation?.recommended;

                // Stagger loading delay style
                const delay = Math.min(idx, 7) * 60;
                const cardStyle = {
                  animationDelay: `${delay}ms`,
                };

                return (
                  <div
                    key={rec._id}
                    style={cardStyle}
                    className="doctor-card-enter flex flex-col bg-white border border-neutral-200/50 rounded-xl overflow-hidden shadow-swiss select-none"
                  >
                    {/* Primary Row Summary */}
                    <div className="flex items-stretch select-none">
                      {/* Left identity zone */}
                      <div className="w-[220px] bg-[#0B4F6C] shrink-0 p-5 flex flex-col justify-center gap-3 relative select-none">
                        <div className="w-12 h-12 rounded-full bg-white/12 border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
                          {rec.doctor?.user?.profileImage ? (
                            <img
                              src={rec.doctor.user.profileImage}
                              alt={docName}
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                e.target.src = 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/default-avatar.png';
                              }}
                            />
                          ) : (
                            <span className="font-extrabold text-[16px] text-white tracking-tight">
                              {docName
                                .replace(/^Dr\.\s+/i, '')
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .substring(0, 2)}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <h4 className="font-bold text-[14px] text-white leading-snug truncate">
                            {docName}
                          </h4>
                          <span className="font-medium text-[10px] text-white/70 tracking-wide mt-0.5 truncate block">
                            {primarySpec.toUpperCase()}
                          </span>
                          <span className="font-semibold text-[10px] text-white/50 tracking-wider font-mono mt-1 block">
                            {formatDate(rec.appointment?.date)}
                          </span>
                        </div>
                      </div>

                      {/* Right summary zone */}
                      <div className="flex-1 p-5 flex flex-col justify-between select-none">
                        {/* Row 1: progress, pain */}
                        <div className="flex items-center justify-between">
                          <div>
                            {ratingBadge && (
                              <span className={`${ratingBadge.bg} border px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded`}>
                                {ratingBadge.label}
                              </span>
                            )}
                          </div>

                          {painInfo && (
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[12px] font-bold ${painInfo.color} uppercase tracking-wider`}>
                                {painInfo.text}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Row 2: Treatment excerpt */}
                        <p className="text-neutral-600 text-ui-sm mt-3 line-clamp-2 leading-relaxed">
                          {rec.treatmentProvided}
                        </p>

                        {/* Row 3: Exercise, medications, followup */}
                        <div className="flex flex-wrap items-center gap-4 mt-4 select-none">
                          {exCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-[#0B4F6C] uppercase tracking-wider">
                              <Dumbbell size={13} />
                              {exCount} exercise{exCount !== 1 ? 's' : ''} prescribed
                            </span>
                          )}

                          {rec.medications?.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-500 uppercase tracking-wider truncate max-w-[200px]">
                              <Pill size={13} />
                              {rec.medications.join(' · ')}
                            </span>
                          )}

                          {showFollowup && rec.followUpRecommendation?.suggestedDate && (
                            <div className="bg-[#E8F4F8] border border-[#B3D5E4] rounded-lg p-1.5 px-3 flex items-center gap-2 select-none">
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0B4F6C] uppercase tracking-wider">
                                <Calendar size={12} />
                                Follow-up: {formatDate(rec.followUpRecommendation.suggestedDate)}
                              </span>
                              <span className="text-[#B3D5E4] text-[10px]">·</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/doctors/${rec.doctor?._id || rec.doctor}#book`);
                                }}
                                className="text-[11px] text-[#F4845F] font-black uppercase tracking-wider bg-transparent border-0 hover:underline cursor-pointer select-none"
                              >
                                Book Now →
                              </button>
                            </div>
                          )}
                        </div>

                        {/* View Full trigger */}
                        <div className="text-right mt-2 select-none">
                          <button
                            onClick={() => toggleExpand(rec._id)}
                            className="text-[12px] text-[#0B4F6C] hover:text-[#083A52] font-black uppercase tracking-wider bg-transparent border-0 cursor-pointer select-none"
                          >
                            {isExpanded ? 'Collapse ↑' : 'View Full Record →'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Inline Expanded Record Details */}
                    {isExpanded && (
                      <div className="border-t border-[#EEF2F6] p-6 bg-[#FAFBFC]/30 flex flex-col gap-6 select-none transition-all">
                        
                        {/* Presenting condition */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                            Presenting Condition
                          </span>
                          <p className="text-[#1C2B3A] text-ui-sm leading-relaxed whitespace-pre-line font-medium">
                            {rec.presentingCondition}
                          </p>
                        </div>

                        {/* Treatment Provided */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                            Treatment Provided
                          </span>
                          <p className="text-[#1C2B3A] text-ui-sm leading-relaxed whitespace-pre-line font-medium">
                            {rec.treatmentProvided}
                          </p>
                        </div>

                        {/* Clinical Observations */}
                        {rec.clinicalObservations && (
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                              Clinical Observations
                            </span>
                            <p className="text-[#1C2B3A] text-ui-sm leading-relaxed whitespace-pre-line font-medium">
                              {rec.clinicalObservations}
                            </p>
                          </div>
                        )}

                        {/* Exercises Table */}
                        {exCount > 0 && (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between select-none">
                              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                                Home Exercise Prescriptions
                              </span>
                              <button
                                onClick={(e) => handlePrintExercisePlan(e, rec)}
                                className="h-8 px-3 border border-neutral-300 hover:border-neutral-900 text-neutral-700 hover:text-neutral-900 font-bold text-[10px] flex items-center gap-1.5 uppercase tracking-widest transition-colors select-none rounded-md bg-white cursor-pointer"
                              >
                                <Download size={12} /> Download Exercise Plan
                              </button>
                            </div>

                            <div className="w-full overflow-hidden border border-neutral-200/50 rounded-lg bg-white select-none">
                              <table className="w-full text-left border-collapse select-none">
                                <thead>
                                  <tr className="border-b border-neutral-100 bg-neutral-50">
                                    <th className="px-4 py-3 text-neutral-500 font-black uppercase text-[9px] tracking-widest">EXERCISE</th>
                                    <th className="px-4 py-3 text-neutral-500 font-black uppercase text-[9px] tracking-widest text-center">SETS</th>
                                    <th className="px-4 py-3 text-neutral-500 font-black uppercase text-[9px] tracking-widest text-center">REPS</th>
                                    <th className="px-4 py-3 text-neutral-500 font-black uppercase text-[9px] tracking-widest">FREQUENCY</th>
                                    <th className="px-4 py-3 text-neutral-500 font-black uppercase text-[9px] tracking-widest">DURATION</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                  {rec.exercisePrescription.map((ex, exIdx) => (
                                    <tr key={ex._id || exIdx} className="h-12 hover:bg-neutral-50/50 select-none">
                                      <td className="px-4 py-2 text-ui-sm font-semibold text-neutral-800">
                                        <div>{ex.exerciseName}</div>
                                        {ex.notes && (
                                          <div className="text-[10px] font-medium text-neutral-400 mt-0.5 normal-case">
                                            {ex.notes}
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-4 py-2 text-center text-ui-sm font-bold text-neutral-700">
                                        {ex.sets || '—'}
                                      </td>
                                      <td className="px-4 py-2 text-center text-ui-sm font-bold text-neutral-700">
                                        {ex.reps || '—'}
                                      </td>
                                      <td className="px-4 py-2 text-ui-sm font-medium text-neutral-600">
                                        {ex.frequency || '—'}
                                      </td>
                                      <td className="px-4 py-2 text-ui-sm font-medium text-neutral-600">
                                        {ex.duration || '—'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Medications */}
                        {rec.medications?.length > 0 && (
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                              Prescribed Medications / Supplements
                            </span>
                            <div className="flex flex-wrap gap-1.5 mt-1 select-none">
                              {rec.medications.map((med, medIdx) => (
                                <span
                                  key={medIdx}
                                  className="bg-[#E8F4F8] text-[#0B4F6C] border border-[#B3D5E4] rounded px-2 py-0.5 text-[11px] font-black uppercase tracking-wider"
                                >
                                  {med}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Follow up goal */}
                        {showFollowup && rec.followUpRecommendation?.sessionGoal && (
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                              Follow-Up Focus & Goal
                            </span>
                            <p className="text-[#1C2B3A] text-ui-sm leading-relaxed font-medium">
                              {rec.followUpRecommendation.sessionGoal}
                            </p>
                          </div>
                        )}

                        {/* Audit Details */}
                        <div className="border-t border-neutral-100 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 select-none">
                          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                            Signed by Dr. {rec.doctor?.user?.name || 'Physiotherapist'} on {formatMetadataDate(rec.doctorSignedAt)} at {formatMetadataTime(rec.doctorSignedAt)}
                          </span>

                          {rec.editHistory?.length > 0 && (
                            (() => {
                              const lastEdit = rec.editHistory[rec.editHistory.length - 1];
                              return (
                                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                                  Last edited: {formatMetadataDate(lastEdit.editedAt)} at {formatMetadataTime(lastEdit.editedAt)}
                                </span>
                              );
                            })()
                          )}
                        </div>

                        {/* Collapse trigger */}
                        <div className="text-right mt-2 select-none">
                          <button
                            onClick={() => toggleExpand(rec._id)}
                            className="text-[12px] text-[#0B4F6C] hover:text-[#083A52] font-black uppercase tracking-wider bg-transparent border-0 cursor-pointer select-none"
                          >
                            Collapse ↑
                          </button>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Footer */}
          {pagination.pages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.pages}
              onPageChange={(p) => setCurrentPage(p)}
            />
          )}
        </>
      )}
    </div>
  );
}
