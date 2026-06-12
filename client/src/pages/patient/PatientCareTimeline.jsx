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
  Activity,
  ArrowRight,
  X,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

import useAuthStore from '../../store/authStore';
import { getPatientTimeline } from '../../api/sessionRecord.api';
import SectionHeader from '../../components/common/SectionHeader';
import Pagination from '../../components/common/Pagination';

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
      {/* Page Title Area */}
      <SectionHeader
        title="CARE HISTORY"
        subtitle="Your complete treatment journey across all physiotherapists."
        size="lg"
        ruled={true}
        className="mb-6"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-2 select-none">
            {/* Total Sessions Card */}
            <div className="bg-white rounded-[12px] shadow-level-1 p-5 px-6 min-h-[100px] flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-[#6B7C93] uppercase tracking-[0.08em] block" style={{ fontWeight: 600 }}>
                  TOTAL SESSIONS
                </span>
                <span className="text-[11px] text-[#A8B8C8] block mt-0.5 font-normal">
                  Completed appointments
                </span>
              </div>
              <div className="flex items-baseline select-none mt-2">
                <span className="text-[28px] text-[#1C2B3A] leading-none block" style={{ fontWeight: 800 }}>
                  {summary.totalSessions}
                </span>
              </div>
            </div>

            {/* Doctors Seen Card */}
            <div className="bg-white rounded-[12px] shadow-level-1 p-5 px-6 min-h-[100px] flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-[#6B7C93] uppercase tracking-[0.08em] block" style={{ fontWeight: 600 }}>
                  DOCTORS SEEN
                </span>
                <span className="text-[11px] text-[#A8B8C8] block mt-0.5 font-normal">
                  Unique physiotherapists
                </span>
              </div>
              <div className="flex items-baseline select-none mt-2">
                <span className="text-[28px] text-[#1C2B3A] leading-none block" style={{ fontWeight: 800 }}>
                  {summary.doctorsSeen}
                </span>
              </div>
            </div>

            {/* Latest Progress Card */}
            <div className="bg-white rounded-[12px] shadow-level-1 p-5 px-6 min-h-[100px] flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-[#6B7C93] uppercase tracking-[0.08em] block" style={{ fontWeight: 600 }}>
                  LATEST PROGRESS
                </span>
                <span className="text-[11px] text-[#A8B8C8] block mt-0.5 font-normal">
                  Last reported condition
                </span>
              </div>
              <div className="flex items-center mt-2">
                {summary.latestProgressRating ? (
                  (() => {
                    const badge = PROGRESS_RATING_BADGES[summary.latestProgressRating];
                    const isResolved = summary.latestProgressRating === 'resolved';
                    return (
                      <span
                        className={`${badge?.bg || ''} rounded-[4px] text-[10px] uppercase tracking-[0.08em] py-[3px] px-[10px] inline-flex items-center gap-1 font-bold`}
                        style={{ fontWeight: 700 }}
                      >
                        {isResolved && <CheckCircle size={10} />}
                        {badge?.label}
                      </span>
                    );
                  })()
                ) : (
                  <span className="text-[28px] text-[#A8B8C8] leading-none block" style={{ fontWeight: 800 }}>
                    —
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-[12px] shadow-level-1 p-4 px-6 mb-6 flex flex-wrap items-end justify-between gap-4 select-none">
            <div className="flex flex-wrap items-center gap-4 flex-1">
              {/* Doctor Dropdown */}
              <div className="flex flex-col flex-1 min-w-[200px]">
                <label className="text-[12px] text-[#6B7C93] mb-2 block" style={{ fontWeight: 600 }}>
                  Filter by Doctor
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => {
                    setSelectedDoctorId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border-[1.5px] border-[#DDE3EA] rounded-[6px] px-3 h-10 text-[14px] text-[#1C2B3A] bg-white w-full outline-none focus:border-[#0B4F6C] focus:ring-[3px] focus:ring-[#0B4F6C]/12 transition-colors duration-150 ease-swiss cursor-pointer"
                >
                  <option value="">All Doctors</option>
                  {doctorsList.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      {getDoctorNameDisplay(doc)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div className="flex flex-col flex-1 min-w-[150px]">
                <label className="text-[12px] text-[#6B7C93] mb-2 block" style={{ fontWeight: 600 }}>
                  From Date
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border-[1.5px] border-[#DDE3EA] rounded-[6px] px-3 h-10 text-[14px] text-[#1C2B3A] bg-white w-full outline-none focus:border-[#0B4F6C] focus:ring-[3px] focus:ring-[#0B4F6C]/12 transition-colors duration-150 ease-swiss"
                />
              </div>

              {/* Date To */}
              <div className="flex flex-col flex-1 min-w-[150px]">
                <label className="text-[12px] text-[#6B7C93] mb-2 block" style={{ fontWeight: 600 }}>
                  To Date
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border-[1.5px] border-[#DDE3EA] rounded-[6px] px-3 h-10 text-[14px] text-[#1C2B3A] bg-white w-full outline-none focus:border-[#0B4F6C] focus:ring-[3px] focus:ring-[#0B4F6C]/12 transition-colors duration-150 ease-swiss"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {isFilterActive && (
              <button
                onClick={handleClearFilters}
                className="bg-transparent border-[1.5px] border-[#DDE3EA] text-[#6B7C93] rounded-[6px] h-10 px-4 text-[12px] hover:border-[#A8B8C8] hover:text-[#3D5166] hover:bg-[#F7F9FB] flex items-center gap-1.5 transition-colors duration-150 ease-swiss cursor-pointer select-none"
                style={{ fontWeight: 600 }}
              >
                <X size={14} /> Clear Filters
              </button>
            )}
          </div>

          {/* Timeline Cards Container */}
          {records.length === 0 ? (
            <div className="bg-[#FAFBFC] border border-dashed border-[#DDE3EA] rounded-[12px] py-12 px-6 text-center select-none flex flex-col items-center justify-center">
              <ClipboardList size={32} className="text-[#DDE3EA] mb-4" />
              <h3 className="text-[18px] text-[#1C2B3A] mb-2 font-bold" style={{ fontWeight: 700 }}>
                {isFilterActive ? 'No Matching Records' : 'No Care Records Yet'}
              </h3>
              <p className="text-[13px] text-[#6B7C93] font-normal max-w-md">
                {isFilterActive
                  ? 'Adjust or clear your filters to find other completed session notes.'
                  : 'Your session records will appear here after your physiotherapist completes their notes following each appointment.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 select-none">
              {records.map((rec, idx) => {
                const isExpanded = expandedRecordIds.includes(rec._id);
                const docName = getDoctorNameDisplay(rec.doctor);
                const specArray = rec.doctor?.specialization || ['General Physiotherapy'];
                const primarySpec = specArray[0] || 'General Physiotherapy';
                const ratingBadge = PROGRESS_RATING_BADGES[rec.progressRating];
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
                    className="doctor-card-enter flex flex-col bg-white rounded-[12px] overflow-hidden shadow-level-1 select-none mb-4"
                  >
                    {/* Primary Row Summary */}
                    <div className="flex items-stretch select-none">
                      {/* Left identity zone */}
                      <div className="w-[200px] bg-[#0B4F6C] shrink-0 p-5 flex flex-col justify-center items-center text-center gap-2 relative select-none rounded-l-[12px]">
                        <div className="w-11 h-11 rounded-full bg-white/15 border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
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
                            <span className="font-extrabold text-[18px] text-white tracking-tight" style={{ fontWeight: 700 }}>
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

                        <div className="flex flex-col min-w-0 w-full items-center">
                          <h4 className="font-bold text-[14px] text-white leading-snug truncate w-full" style={{ fontWeight: 700 }}>
                            {docName}
                          </h4>
                          <span className="text-[11px] text-white/70 tracking-wide mt-0.5 truncate block w-full" style={{ fontWeight: 500 }}>
                            {primarySpec.toUpperCase()}
                          </span>
                          <span className="text-[11px] text-white/55 block mt-1 font-normal">
                            {formatDate(rec.appointment?.date)}
                          </span>
                        </div>
                      </div>

                      {/* Right summary zone */}
                      <div className="flex-1 p-5 px-6 flex flex-col justify-between gap-[10px] select-none rounded-r-[12px]">
                        {/* Row 1: progress, pain */}
                        <div className="flex items-center justify-between">
                          <div>
                            {ratingBadge && (
                              <span
                                className={`${ratingBadge.bg} rounded-[4px] text-[10px] uppercase tracking-[0.08em] py-[3px] px-[10px] inline-flex items-center gap-1 font-bold`}
                                style={{ fontWeight: 700 }}
                              >
                                {rec.progressRating === 'resolved' && <CheckCircle size={10} />}
                                {ratingBadge.label}
                              </span>
                            )}
                          </div>

                          {rec.painScoreBefore !== null && rec.painScoreAfter !== null && rec.painScoreBefore !== undefined && rec.painScoreAfter !== undefined && (
                            <div className="flex items-center gap-1.5 text-[12px] text-[#6B7C93]" style={{ fontWeight: 500 }}>
                              <span>Pain: {rec.painScoreBefore}/10</span>
                              <ArrowRight
                                size={12}
                                className={
                                  rec.painScoreAfter < rec.painScoreBefore
                                    ? 'text-[#0A7E6E]'
                                    : rec.painScoreAfter > rec.painScoreBefore
                                    ? 'text-[#C0392B]'
                                    : 'text-[#6B7C93]'
                                }
                              />
                              <span>{rec.painScoreAfter}/10</span>
                            </div>
                          )}
                        </div>

                        {/* Row 2: Treatment excerpt */}
                        <p className="text-[#3D5166] text-[13px] font-normal line-clamp-2 leading-relaxed mt-1">
                          {rec.treatmentProvided}
                        </p>

                        {/* Row 3: Exercise, medications, followup */}
                        <div className="flex flex-wrap items-center gap-4 mt-1 select-none">
                          {exCount > 0 && (
                            <span className="inline-flex items-center gap-1.5 text-[12px] text-[#0B4F6C] uppercase tracking-wider" style={{ fontWeight: 500 }}>
                              <Activity size={14} className="text-[#0B4F6C]" />
                              <span>{exCount} exercise{exCount !== 1 ? 's' : ''} prescribed</span>
                            </span>
                          )}

                          {rec.medications?.length > 0 && (
                            (() => {
                              const displayedMeds = rec.medications.slice(0, 2);
                              const extraCount = rec.medications.length - 2;
                              const medsText = displayedMeds.join(', ') + (extraCount > 0 ? ` +${extraCount} more` : '');
                              return (
                                <span className="inline-flex items-center gap-1.5 text-[12px] text-[#6B7C93] font-normal uppercase tracking-wider">
                                  <Pill size={14} className="text-[#6B7C93]" />
                                  <span>{medsText}</span>
                                </span>
                              );
                            })()
                          )}

                          {showFollowup && rec.followUpRecommendation?.suggestedDate && (
                            <div className="border border-[#B3D5E4] bg-[#E8F4F8] rounded-[8px] py-1.5 px-3 inline-flex items-center gap-2 select-none">
                              <span className="inline-flex items-center gap-1 text-[12px] text-[#0B4F6C] uppercase tracking-wider" style={{ fontWeight: 500 }}>
                                <Calendar size={14} className="text-[#0B4F6C]" />
                                <span>Follow-up: {formatDate(rec.followUpRecommendation.suggestedDate)}</span>
                              </span>
                              <span className="text-[#A8B8C8]">·</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/doctors/${rec.doctor?._id || rec.doctor}#book`);
                                }}
                                className="text-[12px] text-[#F4845F] hover:text-[#D96840] hover:underline bg-transparent border-0 cursor-pointer select-none transition-colors duration-150 ease-swiss font-semibold"
                                style={{ fontWeight: 600 }}
                              >
                                Book Now →
                              </button>
                            </div>
                          )}
                        </div>

                        {/* View Full trigger */}
                        <div className="flex justify-end items-center mt-2 select-none">
                          <button
                            onClick={() => toggleExpand(rec._id)}
                            className="inline-flex items-center gap-1 text-[12px] text-[#0B4F6C] hover:text-[#083A52] bg-transparent border-0 cursor-pointer select-none font-semibold"
                            style={{ fontWeight: 600 }}
                          >
                            <span>{isExpanded ? 'Collapse' : 'View Full Record'}</span>
                            <ChevronDown
                              size={14}
                              className={`transition-transform duration-200 ease-swiss ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Inline Expanded Record Details */}
                    {isExpanded && (
                      <div className="border-t border-[#F0F4F7] p-5 px-6 bg-white flex flex-col gap-5 select-none transition-all">
                        
                        {/* Presenting condition */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] text-[#6B7C93] uppercase tracking-[0.06em] mb-1 block" style={{ fontWeight: 600 }}>
                            Presenting Condition
                          </span>
                          <p className="text-[#1C2B3A] text-[13px] font-normal leading-relaxed whitespace-pre-line">
                            {rec.presentingCondition}
                          </p>
                        </div>

                        {/* Treatment Provided */}
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] text-[#6B7C93] uppercase tracking-[0.06em] mb-1 block" style={{ fontWeight: 600 }}>
                            Treatment Provided
                          </span>
                          <p className="text-[#1C2B3A] text-[13px] font-normal leading-relaxed whitespace-pre-line">
                            {rec.treatmentProvided}
                          </p>
                        </div>

                        {/* Clinical Observations */}
                        {rec.clinicalObservations && (
                          <div className="flex flex-col gap-1">
                            <span className="text-[11px] text-[#6B7C93] uppercase tracking-[0.06em] mb-1 block" style={{ fontWeight: 600 }}>
                              Clinical Observations
                            </span>
                            <p className="text-[#1C2B3A] text-[13px] font-normal leading-relaxed whitespace-pre-line">
                              {rec.clinicalObservations}
                            </p>
                          </div>
                        )}

                        {/* Exercises Table */}
                        {exCount > 0 && (
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between select-none">
                              <span className="text-[11px] text-[#6B7C93] uppercase tracking-[0.06em]" style={{ fontWeight: 600 }}>
                                Home Exercise Prescriptions
                              </span>
                              <button
                                onClick={(e) => handlePrintExercisePlan(e, rec)}
                                className="bg-transparent border-[1.5px] border-[#DDE3EA] text-[#1C2B3A] rounded-[6px] h-9 px-3 text-[12px] hover:border-[#A8B8C8] hover:bg-[#F7F9FB] flex items-center gap-1.5 transition-all duration-150 ease-swiss cursor-pointer select-none"
                                style={{ fontWeight: 600 }}
                              >
                                <Download size={14} /> Download Exercise Plan
                              </button>
                            </div>

                            <div className="w-full overflow-hidden border border-[#F0F4F7] rounded-[8px] bg-white select-none">
                              <table className="w-full text-left border-collapse select-none">
                                <thead>
                                  <tr className="bg-[#F0F4F7]">
                                    <th className="px-3 py-2.5 text-[#6B7C93] uppercase text-[11px] tracking-[0.06em]" style={{ fontWeight: 600 }}>EXERCISE</th>
                                    <th className="px-3 py-2.5 text-[#6B7C93] uppercase text-[11px] tracking-[0.06em] text-center" style={{ fontWeight: 600 }}>SETS</th>
                                    <th className="px-3 py-2.5 text-[#6B7C93] uppercase text-[11px] tracking-[0.06em] text-center" style={{ fontWeight: 600 }}>REPS</th>
                                    <th className="px-3 py-2.5 text-[#6B7C93] uppercase text-[11px] tracking-[0.06em]" style={{ fontWeight: 600 }}>FREQUENCY</th>
                                    <th className="px-3 py-2.5 text-[#6B7C93] uppercase text-[11px] tracking-[0.06em]" style={{ fontWeight: 600 }}>DURATION</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F0F4F7]">
                                  {rec.exercisePrescription.map((ex, exIdx) => (
                                    <tr key={ex._id || exIdx} className="h-12 hover:bg-[#F7F9FB] transition-colors duration-150 select-none">
                                      <td className="px-3 py-3 text-[13px] text-[#1C2B3A] font-normal">
                                        <div className="font-medium">{ex.exerciseName}</div>
                                        {ex.notes && (
                                          <div className="text-[11px] text-[#6B7C93] mt-0.5 normal-case font-normal">
                                            {ex.notes}
                                          </div>
                                        )}
                                      </td>
                                      <td className="px-3 py-3 text-center text-[13px] text-[#1C2B3A] font-normal">
                                        {ex.sets || '—'}
                                      </td>
                                      <td className="px-3 py-3 text-center text-[13px] text-[#1C2B3A] font-normal">
                                        {ex.reps || '—'}
                                      </td>
                                      <td className="px-3 py-3 text-[13px] text-[#1C2B3A] font-normal">
                                        {ex.frequency || '—'}
                                      </td>
                                      <td className="px-3 py-3 text-[13px] text-[#1C2B3A] font-normal">
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
                            <span className="text-[11px] text-[#6B7C93] uppercase tracking-[0.06em] mb-1 block" style={{ fontWeight: 600 }}>
                              Prescribed Medications / Supplements
                            </span>
                            <div className="flex flex-wrap gap-1.5 mt-1 select-none">
                              {rec.medications.map((med, medIdx) => (
                                <span
                                  key={medIdx}
                                  className="bg-[#E8F4F8] text-[#0B4F6C] border border-[#B3D5E4] rounded-[4px] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider"
                                  style={{ fontWeight: 700 }}
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
                            <span className="text-[11px] text-[#6B7C93] uppercase tracking-[0.06em] mb-1 block" style={{ fontWeight: 600 }}>
                              Follow-Up Focus & Goal
                            </span>
                            <p className="text-[#1C2B3A] text-[13px] font-normal leading-relaxed">
                              {rec.followUpRecommendation.sessionGoal}
                            </p>
                          </div>
                        )}

                        {/* Audit Details */}
                        <div className="border-t border-[#F0F4F7] pt-3 mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 select-none">
                          <span className="text-[11px] text-[#A8B8C8] font-normal">
                            Signed by Dr. {rec.doctor?.user?.name || 'Physiotherapist'} on {formatMetadataDate(rec.doctorSignedAt)} at {formatMetadataTime(rec.doctorSignedAt)}
                          </span>

                          {rec.editHistory?.length > 0 && (
                            (() => {
                              const lastEdit = rec.editHistory[rec.editHistory.length - 1];
                              return (
                                <span className="text-[11px] text-[#A8B8C8] font-normal">
                                  Last edited: {formatMetadataDate(lastEdit.editedAt)} at {formatMetadataTime(lastEdit.editedAt)}
                                </span>
                              );
                            })()
                          )}
                        </div>

                        {/* Collapse trigger */}
                        <div className="flex justify-end mt-4 select-none">
                          <button
                            onClick={() => toggleExpand(rec._id)}
                            className="inline-flex items-center gap-1 text-[12px] text-[#6B7C93] hover:text-[#3D5166] bg-transparent border-0 cursor-pointer select-none font-semibold"
                            style={{ fontWeight: 600 }}
                          >
                            <span>Collapse</span>
                            <ChevronUp size={14} />
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

