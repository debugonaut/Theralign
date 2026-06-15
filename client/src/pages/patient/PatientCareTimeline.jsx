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
  Download,
  Play,
} from 'lucide-react';
import toast from 'react-hot-toast';

import useAuthStore from '../../store/authStore';
import { getPatientTimeline } from '../../api/sessionRecord.api';
import { getExerciseById } from '../../data/exerciseLibrary';
import { getPositionFigure } from '../../components/exercises/PositionFigures';
import ExerciseVideoModal from '../../components/exercises/ExerciseVideoModal';
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

const formatExerciseParamsForPatient = (ex) => {
  const parts = [];
  if (ex.sets) parts.push(`${ex.sets} sets`);
  if (ex.reps) parts.push(`${ex.reps} reps`);
  if (ex.duration) parts.push(ex.duration);
  if (ex.prescriptionDuration) parts.push(`for ${ex.prescriptionDuration}`);
  return parts.join(' · ') || '—';
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

  // Active step/tab index for each expanded record card
  const [activeSteps, setActiveSteps] = useState({});

  const [videoModal, setVideoModal] = useState({
    open: false,
    exerciseId: null,
    exerciseName: '',
    sets: null,
    reps: null,
    duration: null,
    frequency: null,
    doctorName: '',
  });

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
            <th>Hold Time</th>
            <th>Prescribe For</th>
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
              <td>${ex.prescriptionDuration || '—'}</td>
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
          grid-template-columns: 1fr 1fr;
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

    const cleanup = () => {
      if (document.body.contains(printContainer)) document.body.removeChild(printContainer);
      if (document.head.contains(style)) document.head.removeChild(style);
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);
    window.print();
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
            <div className="bg-[#FAFBFC] border-2 border-dashed border-neutral-900 rounded-none py-12 px-6 text-center select-none flex flex-col items-center justify-center">
              <ClipboardList size={64} className="text-[#6B7C93] mb-4" />
              <h3 className="text-[36px] text-[#1C2B3A] mb-2 font-bold" style={{ fontWeight: 700 }}>
                {isFilterActive ? 'No Matching Records' : 'No Care Records Yet'}
              </h3>
              <p className="text-[23px] text-[#6B7C93] font-normal max-w-md">
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
                        <div className="w-10 h-10 rounded-full bg-white/15 border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
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
                            <span className="font-extrabold text-[14px] text-white tracking-tight" style={{ fontWeight: 900 }}>
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
                          <h4 className="font-bold text-[15px] text-white leading-snug truncate w-full" style={{ fontWeight: 700 }}>
                            {docName.toUpperCase()}
                          </h4>
                          {rec.doctor?.doctorType === 'junior' && rec.doctor?.seniorDoctor?.user?.name && (
                            <span 
                              className="block mt-0.5 leading-tight select-none"
                              style={{ color: 'rgba(255,255,255,0.55)', fontSize: '10px', fontWeight: 400 }}
                            >
                              Under supervision of Dr. {rec.doctor.seniorDoctor.user.name}
                            </span>
                          )}
                          <span className="text-[13px] text-white/70 tracking-wide mt-0.5 truncate block w-full" style={{ fontWeight: 700 }}>
                            {primarySpec.toUpperCase()}
                          </span>
                          <span className="text-[13px] text-white/55 block mt-1 font-bold">
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
                        <p className="text-[#3D5166] text-[14px] font-normal line-clamp-2 leading-relaxed mt-1">
                          {rec.treatmentProvided}
                        </p>

                        {/* Row 3: Exercise, medications, followup */}
                        <div className="flex flex-wrap items-center gap-4 mt-1 select-none">
                          {exCount > 0 && (
                            <span className="inline-flex items-center gap-1.5 text-[13px] text-[#0B4F6C] uppercase tracking-wider" style={{ fontWeight: 700 }}>
                              <Activity size={16} className="text-[#0B4F6C]" />
                              <span>{exCount} EXERCISE{exCount !== 1 ? 'S' : ''} PRESCRIBED</span>
                            </span>
                          )}

                          {rec.medications?.length > 0 && (
                            (() => {
                              const displayedMeds = rec.medications.slice(0, 2);
                              const extraCount = rec.medications.length - 2;
                              const medsText = displayedMeds.join(', ') + (extraCount > 0 ? ` +${extraCount} more` : '');
                              return (
                                <span className="inline-flex items-center gap-1.5 text-[13px] text-[#6B7C93] font-bold uppercase tracking-wider">
                                  <Pill size={16} className="text-[#6B7C93]" />
                                  <span>{medsText.toUpperCase()}</span>
                                </span>
                              );
                            })()
                          )}

                          {showFollowup && rec.followUpRecommendation?.suggestedDate && (
                            <div className="border-2 border-neutral-900 bg-[#E8F4F8] rounded-none py-1.5 px-3 inline-flex items-center gap-2 select-none">
                              <span className="inline-flex items-center gap-1 text-[13px] text-[#0B4F6C] uppercase tracking-wider" style={{ fontWeight: 700 }}>
                                <Calendar size={16} className="text-[#0B4F6C]" />
                                <span>FOLLOW-UP: {formatDate(rec.followUpRecommendation.suggestedDate)}</span>
                              </span>
                              <span className="text-[#A8B8C8]">·</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/doctors/${rec.doctor?._id || rec.doctor}#book`);
                                }}
                                className="text-[13px] text-[#F4845F] hover:text-[#D96840] hover:underline bg-transparent border-0 cursor-pointer select-none transition-colors duration-150 ease-swiss font-bold uppercase tracking-wider"
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
                            className="inline-flex items-center gap-1 text-[13px] text-[#0B4F6C] hover:text-[#083A52] bg-transparent border-0 cursor-pointer select-none font-bold uppercase tracking-wider"
                          >
                            <span>{isExpanded ? 'COLLAPSE' : 'VIEW FULL RECORD'}</span>
                            <ChevronDown
                              size={16}
                              className={`transition-transform duration-200 ease-swiss ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Inline Expanded Record Details */}
                    {isExpanded && (
                      <div
                        style={{
                          background: '#FFFFFF',
                          borderTop: '2px solid #000000',
                          borderLeft: '4px solid #0B4F6C',
                          padding: '0',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0'
                        }}
                      >
                        {/* Stepper Wizard Tabs */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(4, 1fr)',
                          borderBottom: '2px solid #000000',
                          background: '#FAFBFC',
                        }}>
                          {[
                            { key: 'present', label: 'PRESENT CONDITION' },
                            { key: 'treatment', label: 'TREATMENT PROVIDED' },
                            { key: 'exercise', label: 'EXERCISE PRESCRIPTION' },
                            { key: 'followup', label: 'FOLLOW UP' },
                          ].map((step, idx) => {
                            const stepActive = (activeSteps[rec._id] ?? 0) === idx;
                            return (
                              <button
                                key={step.key}
                                onClick={() => setActiveSteps(prev => ({ ...prev, [rec._id]: idx }))}
                                style={{
                                  background: stepActive ? '#0B4F6C' : 'transparent',
                                  color: stepActive ? '#FFFFFF' : '#6B7C93',
                                  border: 'none',
                                  borderRight: idx < 3 ? '2px solid #000000' : 'none',
                                  padding: '16px 8px',
                                  cursor: 'pointer',
                                  fontWeight: 900,
                                  fontSize: '15px',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.08em',
                                  textAlign: 'center',
                                  transition: 'background-color 150ms, color 150ms',
                                  outline: 'none',
                                }}
                              >
                                {step.label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Tab Content Viewport */}
                        <div style={{ padding: '32px' }}>
                          {/* TAB 0: PRESENTING CONDITION */}
                          {(activeSteps[rec._id] ?? 0) === 0 && (
                            <div>
                              <p style={{
                                fontSize: '14px',
                                fontWeight: 400,
                                color: '#3D5166',
                                lineHeight: '1.7',
                                margin: 0,
                                whiteSpace: 'pre-line'
                              }}>
                                {rec.presentingCondition}
                              </p>
                            </div>
                          )}

                          {/* TAB 1: TREATMENT PROVIDED */}
                          {(activeSteps[rec._id] ?? 0) === 1 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                              <div>
                                <span style={{
                                  fontSize: '20px',
                                  fontWeight: 900,
                                  color: '#1C2B3A',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.08em',
                                  display: 'block',
                                  marginBottom: '12px'
                                }}>TREATMENT PROVIDED</span>
                                <p style={{
                                  fontSize: '14px',
                                  fontWeight: 400,
                                  color: '#3D5166',
                                  lineHeight: '1.7',
                                  margin: 0,
                                  whiteSpace: 'pre-line'
                                }}>
                                  {rec.treatmentProvided}
                                </p>
                              </div>

                              {rec.clinicalObservations && (
                                <div>
                                  <span style={{
                                    fontSize: '20px',
                                    fontWeight: 900,
                                    color: '#1C2B3A',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    display: 'block',
                                    marginBottom: '12px'
                                  }}>CLINICAL OBSERVATIONS</span>
                                  <p style={{
                                    fontSize: '14px',
                                    fontWeight: 400,
                                    color: '#3D5166',
                                    lineHeight: '1.7',
                                    margin: 0,
                                    whiteSpace: 'pre-line'
                                  }}>
                                    {rec.clinicalObservations}
                                  </p>
                                </div>
                              )}

                              {rec.medications?.length > 0 && (
                                <div>
                                  <span style={{
                                    fontSize: '20px',
                                    fontWeight: 900,
                                    color: '#1C2B3A',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em',
                                    display: 'block',
                                    marginBottom: '12px'
                                  }}>PRESCRIBED MEDICATIONS / SUPPLEMENTS</span>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {rec.medications.map((med, medIdx) => (
                                      <span
                                        key={medIdx}
                                        style={{
                                          background: '#FFFFFF',
                                          border: '2px solid #000000',
                                          borderRadius: '0px',
                                          padding: '6px 14px',
                                          fontSize: '11px',
                                          fontWeight: 700,
                                          color: '#1C2B3A',
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.06em'
                                        }}
                                      >
                                        {med}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* TAB 2: EXERCISE PRESCRIPTION */}
                          {(activeSteps[rec._id] ?? 0) === 2 && (
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <span style={{
                                    fontSize: '20px',
                                    fontWeight: 900,
                                    color: '#1C2B3A',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.08em'
                                  }}>
                                    EXERCISE PRESCRIPTION
                                  </span>
                                  {exCount > 0 && (
                                    <span style={{
                                      fontSize: '10px',
                                      fontWeight: 700,
                                      color: '#6B7C93',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.06em',
                                      border: '2px solid #DDE3EA',
                                      padding: '4px 12px',
                                    }}>
                                      {exCount} EXERCISE{exCount !== 1 ? 'S' : ''} ADDED
                                    </span>
                                  )}
                                </div>
                                {exCount > 0 && (
                                  <button
                                    onClick={(e) => handlePrintExercisePlan(e, rec)}
                                    title="Download Exercise Plan"
                                    style={{
                                      background: 'transparent',
                                      border: '2px solid #000000',
                                      padding: '8px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: '#1C2B3A',
                                      transition: 'background-color 150ms, color 150ms',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#1C2B3A';
                                      e.currentTarget.style.color = '#FFFFFF';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = 'transparent';
                                      e.currentTarget.style.color = '#1C2B3A';
                                    }}
                                  >
                                    <Download size={14} />
                                  </button>
                                )}
                              </div>

                              {exCount === 0 ? (
                                <p style={{
                                  fontSize: '14px',
                                  fontWeight: 400,
                                  color: '#A8B8C8',
                                  fontStyle: 'italic',
                                  margin: 0
                                }}>
                                  No exercises prescribed for this session.
                                </p>
                              ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                  {rec.exercisePrescription.map((ex, exIdx) => {
                                    const libraryMeta = ex.exerciseLibraryId ? getExerciseById(ex.exerciseLibraryId) : null;
                                    const PositionFigure = libraryMeta ? getPositionFigure(libraryMeta.position) : null;
                                    const categoryColor = libraryMeta?.categoryColor || '#0B4F6C';
                                    const targetArea = libraryMeta?.targetArea;

                                    return (
                                      <div
                                        key={ex._id || exIdx}
                                        style={{
                                          border: '2px solid #DDE3EA',
                                          borderRadius: '8px',
                                          background: '#FFFFFF',
                                          padding: '16px',
                                          display: 'flex',
                                          gap: '16px',
                                          alignItems: 'flex-start',
                                        }}
                                      >
                                        {PositionFigure && (
                                          <div style={{
                                            width: '100px',
                                            height: '100px',
                                            background: '#F8F8F6',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                          }}>
                                            <PositionFigure size={80} color={`${categoryColor}B3`} />
                                          </div>
                                        )}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <p style={{ fontSize: '14px', fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
                                            {ex.exerciseName}
                                          </p>
                                          {targetArea && (
                                            <p style={{ fontSize: '11px', fontWeight: 400, color: '#6B7C93', margin: '4px 0 0' }}>
                                              {targetArea}
                                            </p>
                                          )}
                                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#1C2B3A', margin: '8px 0 0' }}>
                                            {formatExerciseParamsForPatient(ex)}
                                          </p>
                                          {ex.frequency && (
                                            <p style={{ fontSize: '11px', fontWeight: 400, color: '#6B7C93', margin: '4px 0 0', textTransform: 'capitalize' }}>
                                              {ex.frequency}
                                            </p>
                                          )}
                                          {ex.notes && (
                                            <p style={{ fontSize: '11px', fontStyle: 'italic', color: '#6B7C93', margin: '6px 0 0' }}>
                                              {ex.notes}
                                            </p>
                                          )}
                                          {ex.exerciseLibraryId && (
                                            <button
                                              type="button"
                                              onClick={() => setVideoModal({
                                                open: true,
                                                exerciseId: ex.exerciseLibraryId,
                                                exerciseName: ex.exerciseName,
                                                sets: ex.sets,
                                                reps: ex.reps,
                                                duration: ex.duration,
                                                frequency: ex.frequency,
                                                prescriptionDuration: ex.prescriptionDuration,
                                                doctorName: docName,
                                              })}
                                              style={{
                                                marginTop: '12px',
                                                background: 'transparent',
                                                border: 'none',
                                                padding: 0,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                color: '#0B4F6C',
                                              }}
                                            >
                                              <Play size={14} /> Watch Demonstration
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}

                          {/* TAB 3: FOLLOW UP */}
                          {(activeSteps[rec._id] ?? 0) === 3 && (
                            <div>
                              {rec.followUpRecommendation?.recommended ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                  <div>
                                    <span style={{
                                      fontSize: '20px',
                                      fontWeight: 900,
                                      color: '#1C2B3A',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.08em',
                                      display: 'block',
                                      marginBottom: '12px'
                                    }}>FOLLOW-UP RECOMMENDATION</span>
                                    <div style={{
                                      padding: '24px',
                                      background: '#E8F4F8',
                                      border: '2px solid #0B4F6C',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      gap: '16px',
                                    }}>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <span style={{
                                          fontSize: '18px',
                                          fontWeight: 900,
                                          color: '#0B4F6C',
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.02em',
                                        }}>
                                          {formatDate(rec.followUpRecommendation.suggestedDate)}
                                        </span>
                                        {rec.followUpRecommendation.sessionGoal && (
                                          <span style={{
                                            fontSize: '14px',
                                            fontWeight: 400,
                                            color: '#3D5166',
                                            lineHeight: '1.5',
                                          }}>
                                            {rec.followUpRecommendation.sessionGoal}
                                          </span>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => navigate(`/doctors/${rec.doctor?._id || rec.doctor}#book`)}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#083A52'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#0B4F6C'}
                                        style={{
                                          background: '#0B4F6C',
                                          color: 'white',
                                          borderRadius: '0px',
                                          border: '2px solid #000000',
                                          height: '40px',
                                          padding: '0 16px',
                                          fontWeight: 900,
                                          fontSize: '13px',
                                          cursor: 'pointer',
                                          whiteSpace: 'nowrap',
                                          transition: '150ms',
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.08em',
                                        }}
                                      >
                                        BOOK NOW →
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <p style={{
                                  fontSize: '14px',
                                  fontWeight: 400,
                                  color: '#A8B8C8',
                                  fontStyle: 'italic',
                                  margin: 0
                                }}>
                                  No follow-up recommendation scheduled.
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* ── FOOTER / SIGNATURE ── */}
                        {(() => {
                          const doctorName = getDoctorNameDisplay(rec.doctor).replace(/^Dr\.\s+/i, '');
                          const formattedSignedDate = rec.doctorSignedAt
                            ? `${formatMetadataDate(rec.doctorSignedAt)} at ${formatMetadataTime(rec.doctorSignedAt)}`
                            : '—';
                          const lastEdit = rec.editHistory?.length > 0 ? rec.editHistory[rec.editHistory.length - 1] : null;
                          const formattedLastEditedDate = lastEdit
                            ? `${formatMetadataDate(lastEdit.editedAt)} at ${formatMetadataTime(lastEdit.editedAt)}`
                            : null;

                          return (
                            <div style={{
                              padding: '20px 28px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              borderTop: '2px solid #000000',
                              background: '#FAFBFC',
                            }}>
                              <span
                                title={formattedLastEditedDate ? `Last edited: ${formattedLastEditedDate}` : undefined}
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 400,
                                  color: '#A8B8C8',
                                  cursor: 'default',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.04em',
                                }}
                              >
                                Signed by Dr. {doctorName} · {formattedSignedDate}
                              </span>
                              <button
                                onClick={() => toggleExpand(rec._id)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#6B7C93',
                                  fontSize: '11px',
                                  fontWeight: 900,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  letterSpacing: '0.06em',
                                  textTransform: 'uppercase',
                                }}
                              >
                                COLLAPSE ↑
                              </button>
                            </div>
                          );
                        })()}

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

      <ExerciseVideoModal
        isOpen={videoModal.open}
        onClose={() => setVideoModal((v) => ({ ...v, open: false, exerciseId: null }))}
        exerciseId={videoModal.exerciseId}
        exerciseName={videoModal.exerciseName}
        sets={videoModal.sets}
        reps={videoModal.reps}
        duration={videoModal.duration}
        frequency={videoModal.frequency}
        prescriptionDuration={videoModal.prescriptionDuration}
        doctorName={videoModal.doctorName}
      />
    </div>
  );
}

