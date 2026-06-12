import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Calendar,
  Dumbbell,
  Pill,
  ChevronDown,
  Loader2,
  Filter,
  Activity,
  X,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

import useAuthStore from '../../store/authStore';
import { getPatientTimeline } from '../../api/sessionRecord.api';
import SectionHeader from '../../components/common/SectionHeader';
import Pagination from '../../components/common/Pagination';

const PROGRESS_RATING_BADGES = {
  worse:                   { label: 'Worse',                  background: '#FDF2F2', color: '#C0392B' },
  no_change:               { label: 'No Change',              background: '#F0F4F7', color: '#6B7C93' },
  slight_improvement:      { label: 'Slight Improvement',     background: '#FEF3E2', color: '#B45309' },
  significant_improvement: { label: 'Significant Improvement',background: '#E8F8F5', color: '#0A7E6E' },
  resolved:                { label: 'Resolved',               background: '#E8F4F8', color: '#0B4F6C' },
};

const progressBadgeStyle = (key) => {
  const c = PROGRESS_RATING_BADGES[key];
  if (!c) return null;
  return {
    background: c.background,
    color: c.color,
    borderRadius: '4px',
    padding: '4px 12px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  };
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

  const getPainChipStyle = (before, after) => {
    if (before == null || after == null) return null;
    const improved = after < before;
    const worsened = after > before;
    return {
      style: {
        background: improved ? '#E8F8F5' : worsened ? '#FDF2F2' : '#F0F4F7',
        color: improved ? '#0A7E6E' : worsened ? '#C0392B' : '#6B7C93',
        borderRadius: '4px',
        padding: '4px 10px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        fontWeight: 600,
      },
      arrow: improved ? '↓' : worsened ? '↑' : '=',
    };
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
            <div className="bg-white rounded-none border-2 border-neutral-900 shadow-none p-5 px-6 min-h-[100px] flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-[#6B7C93] uppercase tracking-[0.08em] block" style={{ fontWeight: 700 }}>
                  TOTAL SESSIONS
                </span>
                <span className="text-[11px] text-[#A8B8C8] block mt-0.5 font-normal uppercase">
                  COMPLETED APPOINTMENTS
                </span>
              </div>
              <div className="flex items-baseline select-none mt-2">
                <span className="text-[28px] text-[#1C2B3A] leading-none block font-black" style={{ fontWeight: 900 }}>
                  {summary.totalSessions}
                </span>
              </div>
            </div>

            {/* Doctors Seen Card */}
            <div className="bg-white rounded-none border-2 border-neutral-900 shadow-none p-5 px-6 min-h-[100px] flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-[#6B7C93] uppercase tracking-[0.08em] block" style={{ fontWeight: 700 }}>
                  DOCTORS SEEN
                </span>
                <span className="text-[11px] text-[#A8B8C8] block mt-0.5 font-normal uppercase">
                  UNIQUE PHYSIOTHERAPISTS
                </span>
              </div>
              <div className="flex items-baseline select-none mt-2">
                <span className="text-[28px] text-[#1C2B3A] leading-none block font-black" style={{ fontWeight: 900 }}>
                  {summary.doctorsSeen}
                </span>
              </div>
            </div>

            {/* Latest Progress Card */}
            <div className="bg-white rounded-none border-2 border-neutral-900 shadow-none p-5 px-6 min-h-[100px] flex flex-col justify-between">
              <div>
                <span className="text-[11px] text-[#6B7C93] uppercase tracking-[0.08em] block" style={{ fontWeight: 700 }}>
                  LATEST PROGRESS
                </span>
                <span className="text-[11px] text-[#A8B8C8] block mt-0.5 font-normal uppercase">
                  LAST REPORTED CONDITION
                </span>
              </div>
              <div className="flex items-center mt-2">
                {summary.latestProgressRating ? (
                  <span style={progressBadgeStyle(summary.latestProgressRating)}>
                    {summary.latestProgressRating === 'resolved' && <CheckCircle size={10} />}
                    {PROGRESS_RATING_BADGES[summary.latestProgressRating]?.label}
                  </span>
                ) : (
                  <span className="text-[28px] text-[#A8B8C8] leading-none block font-black" style={{ fontWeight: 900 }}>
                    —
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-none border-2 border-neutral-900 shadow-none p-4 px-6 mb-6 flex flex-wrap items-end justify-between gap-4 select-none">
            <div className="flex flex-wrap items-center gap-4 flex-1">
              {/* Doctor Dropdown */}
              <div className="flex flex-col flex-1 min-w-[200px]">
                <label className="text-[12px] text-[#6B7C93] mb-2 block uppercase" style={{ fontWeight: 700 }}>
                  FILTER BY DOCTOR
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => {
                    setSelectedDoctorId(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border-2 border-neutral-900 rounded-none px-3 h-10 text-[14px] text-[#1C2B3A] bg-white w-full outline-none focus:border-accent transition-colors duration-150 ease-swiss cursor-pointer uppercase font-bold"
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
              <div className="flex flex-col flex-1 min-w-[150px]">
                <label className="text-[12px] text-[#6B7C93] mb-2 block uppercase" style={{ fontWeight: 700 }}>
                  FROM DATE
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border-2 border-neutral-900 rounded-none px-3 h-10 text-[14px] text-[#1C2B3A] bg-white w-full outline-none focus:border-accent transition-colors duration-150 ease-swiss uppercase font-bold"
                />
              </div>

              {/* Date To */}
              <div className="flex flex-col flex-1 min-w-[150px]">
                <label className="text-[12px] text-[#6B7C93] mb-2 block uppercase" style={{ fontWeight: 700 }}>
                  TO DATE
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border-2 border-neutral-900 rounded-none px-3 h-10 text-[14px] text-[#1C2B3A] bg-white w-full outline-none focus:border-accent transition-colors duration-150 ease-swiss uppercase font-bold"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {isFilterActive && (
              <button
                onClick={handleClearFilters}
                className="bg-transparent border-2 border-neutral-900 text-neutral-900 rounded-none h-10 px-4 text-[12px] hover:bg-neutral-900 hover:text-white flex items-center gap-1.5 transition-colors duration-150 ease-swiss cursor-pointer select-none font-bold uppercase"
              >
                <X size={14} /> CLEAR FILTERS
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
                    className="doctor-card-enter flex flex-col bg-white rounded-none border-2 border-neutral-900 overflow-hidden shadow-none select-none mb-4"
                  >
                    {/* Primary Row Summary */}
                    <div className="flex items-stretch select-none">
                      {/* Left identity zone */}
                      <div className="w-[200px] bg-[#0B4F6C] shrink-0 p-5 flex flex-col justify-center items-center text-center gap-2 relative select-none rounded-none border-r-2 border-neutral-900">
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
                            <span className="font-extrabold text-[18px] text-white tracking-tight" style={{ fontWeight: 900 }}>
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
                            {docName.toUpperCase()}
                          </h4>
                          <span className="text-[11px] text-white/70 tracking-wide mt-0.5 truncate block w-full" style={{ fontWeight: 700 }}>
                            {primarySpec.toUpperCase()}
                          </span>
                          <span className="text-[11px] text-white/55 block mt-1 font-bold">
                            {formatDate(rec.appointment?.date)}
                          </span>
                        </div>
                      </div>

                      {/* Right summary zone */}
                      <div className="flex-1 p-5 px-6 flex flex-col justify-between gap-[10px] select-none rounded-none">
                        {/* Row 1: progress, pain */}
                        <div className="flex items-center justify-between">
                          <div>
                            {rec.progressRating && progressBadgeStyle(rec.progressRating) && (
                              <span style={progressBadgeStyle(rec.progressRating)}>
                                {rec.progressRating === 'resolved' && <CheckCircle size={10} />}
                                {PROGRESS_RATING_BADGES[rec.progressRating]?.label}
                              </span>
                            )}
                          </div>

                          {(() => {
                            const chip = getPainChipStyle(rec.painScoreBefore, rec.painScoreAfter);
                            if (!chip) return null;
                            return (
                              <span style={chip.style}>
                                {chip.arrow} {rec.painScoreBefore}/10 → {rec.painScoreAfter}/10
                              </span>
                            );
                          })()}
                        </div>

                        {/* Row 2: Treatment excerpt */}
                        <p className="text-[#3D5166] text-[13px] font-normal line-clamp-2 leading-relaxed mt-1">
                          {rec.treatmentProvided}
                        </p>

                        {/* Row 3: Exercise, medications, followup */}
                        <div className="flex flex-wrap items-center gap-4 mt-1 select-none">
                          {exCount > 0 && (
                            <span className="inline-flex items-center gap-1.5 text-[12px] text-[#0B4F6C] uppercase tracking-wider" style={{ fontWeight: 700 }}>
                              <Activity size={14} className="text-[#0B4F6C]" />
                              <span>{exCount} EXERCISE{exCount !== 1 ? 'S' : ''} PRESCRIBED</span>
                            </span>
                          )}

                          {rec.medications?.length > 0 && (
                            (() => {
                              const displayedMeds = rec.medications.slice(0, 2);
                              const extraCount = rec.medications.length - 2;
                              const medsText = displayedMeds.join(', ') + (extraCount > 0 ? ` +${extraCount} more` : '');
                              return (
                                <span className="inline-flex items-center gap-1.5 text-[12px] text-[#6B7C93] font-bold uppercase tracking-wider">
                                  <Pill size={14} className="text-[#6B7C93]" />
                                  <span>{medsText.toUpperCase()}</span>
                                </span>
                              );
                            })()
                          )}

                          {showFollowup && rec.followUpRecommendation?.suggestedDate && (
                            <div className="border-2 border-neutral-900 bg-[#E8F4F8] rounded-none py-1.5 px-3 inline-flex items-center gap-2 select-none">
                              <span className="inline-flex items-center gap-1 text-[12px] text-[#0B4F6C] uppercase tracking-wider" style={{ fontWeight: 700 }}>
                                <Calendar size={14} className="text-[#0B4F6C]" />
                                <span>FOLLOW-UP: {formatDate(rec.followUpRecommendation.suggestedDate)}</span>
                              </span>
                              <span className="text-[#A8B8C8]">·</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/doctors/${rec.doctor?._id || rec.doctor}#book`);
                                }}
                                className="text-[12px] text-[#F4845F] hover:text-[#D96840] hover:underline bg-transparent border-0 cursor-pointer select-none transition-colors duration-150 ease-swiss font-bold uppercase tracking-wider"
                              >
                                BOOK NOW →
                              </button>
                            </div>
                          )}
                        </div>

                        {/* View Full trigger */}
                        <div className="flex justify-end items-center mt-2 select-none">
                          <button
                            onClick={() => toggleExpand(rec._id)}
                            className="inline-flex items-center gap-1 text-[12px] text-[#0B4F6C] hover:text-[#083A52] bg-transparent border-0 cursor-pointer select-none font-bold uppercase tracking-wider"
                          >
                            <span>{isExpanded ? 'COLLAPSE' : 'VIEW FULL RECORD'}</span>
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
                      <div className="border-t-2 border-neutral-900 select-none overflow-hidden" style={{ borderRadius: '0 0 0 0' }}>

                        {/* Zone A — What Happened */}
                        <div style={{ background: '#FFFFFF', padding: '24px', borderBottom: '1px solid #EEF2F6' }}>
                          <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '10px', color: '#6B7C93', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
                            WHAT HAPPENED THIS SESSION
                          </span>

                          {/* Progress badge in Zone A header */}
                          {rec.progressRating && progressBadgeStyle(rec.progressRating) && (
                            <div style={{ marginBottom: '16px' }}>
                              <span style={progressBadgeStyle(rec.progressRating)}>
                                {rec.progressRating === 'resolved' && <CheckCircle size={10} />}
                                {PROGRESS_RATING_BADGES[rec.progressRating]?.label}
                              </span>
                            </div>
                          )}

                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                              <span className="text-[19px] text-[#6B7C93] uppercase tracking-[0.06em] mb-1 block" style={{ fontWeight: 700 }}>
                                PRESENTING CONDITION
                              </span>
                              <p className="text-[#1C2B3A] text-[13px] font-normal leading-relaxed whitespace-pre-line">
                                {rec.presentingCondition}
                              </p>
                            </div>

                            <div className="flex flex-col gap-1">
                              <span className="text-[19px] text-[#6B7C93] uppercase tracking-[0.06em] mb-1 block" style={{ fontWeight: 700 }}>
                                TREATMENT PROVIDED
                              </span>
                              <p className="text-[#1C2B3A] text-[13px] font-normal leading-relaxed whitespace-pre-line">
                                {rec.treatmentProvided}
                              </p>
                            </div>

                            {rec.clinicalObservations && (
                              <div className="flex flex-col gap-1">
                                <span className="text-[19px] text-[#6B7C93] uppercase tracking-[0.06em] mb-1 block" style={{ fontWeight: 700 }}>
                                  CLINICAL OBSERVATIONS
                                </span>
                                <p className="text-[#1C2B3A] text-[13px] font-normal leading-relaxed whitespace-pre-line">
                                  {rec.clinicalObservations}
                                </p>
                              </div>
                            )}

                            {rec.medications?.length > 0 && (
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[19px] text-[#6B7C93] uppercase tracking-[0.06em] mb-1 block" style={{ fontWeight: 700 }}>
                                  PRESCRIBED MEDICATIONS / SUPPLEMENTS
                                </span>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {rec.medications.map((med, medIdx) => (
                                    <span key={medIdx} className="bg-[#E8F4F8] text-[#0B4F6C] border-2 border-neutral-900 rounded-none px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">
                                      {med.toUpperCase()}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Zone B — Your Action Plan */}
                        <div style={{ background: '#E8F4F8', padding: '24px', borderRadius: '0 0 12px 12px' }}>
                          <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '10px', color: '#0B4F6C', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
                            YOUR ACTION PLAN
                          </span>

                          <div className="flex flex-col gap-4">
                            {/* Exercise Section */}
                            <div className="flex flex-col gap-1">
                              <span className="text-[19px] text-[#6B7C93] uppercase tracking-[0.06em] mb-2 block" style={{ fontWeight: 700 }}>
                                HOME EXERCISE PRESCRIPTIONS
                              </span>

                              {exCount > 0 ? (
                                <>
                                  {rec.exercisePrescription.map((ex, exIdx) => {
                                    const setsReps = ex.sets && ex.reps
                                      ? `${ex.sets} sets × ${ex.reps} reps`
                                      : ex.sets
                                      ? `${ex.sets} sets`
                                      : ex.reps
                                      ? `${ex.reps} reps`
                                      : '—';
                                    return (
                                      <div
                                        key={ex._id || exIdx}
                                        style={{
                                          background: '#FFFFFF',
                                          border: '1px solid #DDE3EA',
                                          borderRadius: '8px',
                                          padding: '14px 20px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          marginBottom: '10px',
                                        }}
                                      >
                                        {/* Name */}
                                        <div style={{ flex: 1 }}>
                                          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '14px', color: '#1C2B3A', textTransform: 'uppercase' }}>
                                            {ex.exerciseName}
                                          </div>
                                          {ex.notes && (
                                            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '11px', color: '#6B7C93', fontStyle: 'italic', marginTop: '2px' }}>
                                              {ex.notes}
                                            </div>
                                          )}
                                        </div>
                                        {/* Sets × Reps */}
                                        <div style={{ width: '100px', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '13px', color: '#0B4F6C' }}>
                                          {setsReps}
                                        </div>
                                        {/* Frequency */}
                                        <div style={{ width: '120px', textAlign: 'center' }}>
                                          {ex.frequency && (
                                            <span style={{ background: '#F0F4F7', borderRadius: '4px', padding: '4px 10px', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '11px', color: '#6B7C93' }}>
                                              {ex.frequency}
                                            </span>
                                          )}
                                        </div>
                                        {/* Duration */}
                                        <div style={{ width: '100px', textAlign: 'center' }}>
                                          {ex.duration && (
                                            <span style={{ background: '#F0F4F7', borderRadius: '4px', padding: '4px 10px', fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '11px', color: '#6B7C93' }}>
                                              {ex.duration}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                  <button
                                    onClick={(e) => handlePrintExercisePlan(e, rec)}
                                    style={{
                                      width: '100%',
                                      background: 'transparent',
                                      border: '1.5px solid #0B4F6C',
                                      color: '#0B4F6C',
                                      borderRadius: '6px',
                                      height: '40px',
                                      fontFamily: 'Inter, sans-serif',
                                      fontWeight: 600,
                                      fontSize: '13px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '6px',
                                      marginTop: '4px',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#E8F4F8'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                  >
                                    ↓ Download Exercise Plan
                                  </button>
                                </>
                              ) : (
                                <div style={{ border: '1px dashed #DDE3EA', borderRadius: '8px', padding: '20px', textAlign: 'center', color: '#6B7C93', fontSize: '13px' }}>
                                  No exercises prescribed
                                </div>
                              )}
                            </div>

                            {/* Follow-up Goal */}
                            {showFollowup && rec.followUpRecommendation?.sessionGoal && (
                              <div className="flex flex-col gap-1">
                                <span className="text-[19px] text-[#6B7C93] uppercase tracking-[0.06em] mb-1 block" style={{ fontWeight: 700 }}>
                                  FOLLOW-UP FOCUS & GOAL
                                </span>
                                <p className="text-[#1C2B3A] text-[13px] font-normal leading-relaxed">
                                  {rec.followUpRecommendation.sessionGoal}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Footer */}
                        <div style={{ borderTop: '1px solid #EEF2F6', padding: '12px 24px', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: '11px', color: '#A8B8C8' }}>
                          Signed by {getDoctorNameDisplay(rec.doctor)}
                          {' · '}
                          {(() => {
                            const lastEdit = rec.editHistory?.length > 0 ? rec.editHistory[rec.editHistory.length - 1] : null;
                            const signedFormatted = rec.doctorSignedAt
                              ? `${formatMetadataDate(rec.doctorSignedAt)} at ${formatMetadataTime(rec.doctorSignedAt)}`
                              : '—';
                            const editFormatted = lastEdit
                              ? `Last edited: ${formatMetadataDate(lastEdit.editedAt)} at ${formatMetadataTime(lastEdit.editedAt)}`
                              : null;
                            return editFormatted
                              ? <span title={editFormatted}>{signedFormatted}</span>
                              : <span>{signedFormatted}</span>;
                          })()}
                        </div>

                        {/* Collapse trigger */}
                        <div className="flex justify-end px-6 pb-4 bg-white select-none">
                          <button
                            onClick={() => toggleExpand(rec._id)}
                            className="inline-flex items-center gap-1 text-[12px] text-[#6B7C93] hover:text-accent bg-transparent border-0 cursor-pointer select-none font-bold uppercase tracking-wider"
                          >
                            <span>COLLAPSE ↑</span>
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

