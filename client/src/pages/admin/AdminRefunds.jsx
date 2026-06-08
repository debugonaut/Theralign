import { useState, useEffect } from 'react';
import { getPendingRefundsAPI, getRefundStatsAPI, approveRefundAPI, rejectRefundAPI } from '../../api/refund.api.js';
import PageHeader from '../../components/admin/PageHeader.jsx';
import './AdminRefunds.css';
import toast from 'react-hot-toast';

export default function AdminRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [stats, setStats] = useState({ pendingCount: 0, processedThisMonth: 0, totalRefunded: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedRefund, setExpandedRefund] = useState(null);
  const [noteInput, setNoteInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRefunds();
    fetchStats();
  }, [page]);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const response = await getPendingRefundsAPI({ page, limit: 20 });
      setRefunds(response.data.refunds);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching refunds:', error);
      toast.error('Failed to load refunds');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getRefundStatsAPI();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleApprove = (refundId) => {
    setExpandedRefund({ id: refundId, action: 'approve' });
    setNoteInput('');
  };

  const handleReject = (refundId) => {
    setExpandedRefund({ id: refundId, action: 'reject' });
    setNoteInput('');
  };

  const handleConfirmApprove = async () => {
    if (!expandedRefund || expandedRefund.action !== 'approve') return;

    try {
      setSubmitting(true);
      await approveRefundAPI(expandedRefund.id, noteInput);
      toast.success('Refund approved successfully');
      setExpandedRefund(null);
      fetchRefunds();
      fetchStats();
    } catch (error) {
      console.error('Error approving refund:', error);
      toast.error(error.response?.data?.message || 'Failed to approve refund');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!expandedRefund || expandedRefund.action !== 'reject' || !noteInput.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setSubmitting(true);
      await rejectRefundAPI(expandedRefund.id, noteInput);
      toast.success('Refund rejected successfully');
      setExpandedRefund(null);
      fetchRefunds();
      fetchStats();
    } catch (error) {
      console.error('Error rejecting refund:', error);
      toast.error(error.response?.data?.message || 'Failed to reject refund');
    } finally {
      setSubmitting(false);
    }
  };

  const getPatientInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (time) => {
    if (!time) return 'N/A';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="admin-refunds-page">
      <PageHeader title="REFUND REQUESTS" description="Manage and process customer refund requests" />

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card pending-card">
          <div className="stat-value">{stats.pendingCount}</div>
          <div className="stat-label">PENDING REVIEW</div>
        </div>
        <div className="stat-card processed-card">
          <div className="stat-value">{stats.processedThisMonth}</div>
          <div className="stat-label">PROCESSED THIS MONTH</div>
        </div>
        <div className="stat-card refunded-card">
          <div className="stat-value">₹{(stats.totalRefunded || 0).toLocaleString('en-IN')}</div>
          <div className="stat-label">TOTAL REFUNDED</div>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="refunds-container">
        {loading ? (
          <div className="loading-state">
            <p>Loading refunds...</p>
          </div>
        ) : refunds.length === 0 ? (
          <div className="empty-state">
            <p>No pending refund requests</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="refunds-table">
                <thead>
                  <tr>
                    <th>PATIENT</th>
                    <th>DOCTOR</th>
                    <th>APPOINTMENT DATE</th>
                    <th>AMOUNT</th>
                    <th>REQUESTED</th>
                    <th>REASON</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {refunds.map((refund) => (
                    <tbody key={refund._id}>
                      <tr className="refund-row">
                        <td className="patient-cell">
                          <div className="patient-info">
                            <div className="patient-avatar">{getPatientInitials(refund.appointment?.patient?.name)}</div>
                            <div>
                              <div className="patient-name">{refund.appointment?.patient?.name}</div>
                              <div className="patient-email">{refund.appointment?.patient?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>{refund.appointment?.doctor?.user?.name || 'N/A'}</td>
                        <td>
                          {formatDate(refund.appointment?.date)} at {formatTime(refund.appointment?.startTime)}
                        </td>
                        <td className="amount-cell">₹{refund.refundAmount?.toFixed(2) || '0.00'}</td>
                        <td className="time-cell">{getRelativeTime(refund.refundRequestedAt)}</td>
                        <td className="reason-cell">
                          <span className="reason-text" title={refund.refundReason}>
                            {refund.refundReason?.substring(0, 40)}...
                          </span>
                        </td>
                        <td>
                          <span className="status-badge pending-badge">PENDING</span>
                        </td>
                        <td className="actions-cell">
                          <button
                            className="action-link approve-link"
                            onClick={() => handleApprove(refund._id)}
                          >
                            APPROVE
                          </button>
                          <button
                            className="action-link reject-link"
                            onClick={() => handleReject(refund._id)}
                          >
                            REJECT
                          </button>
                        </td>
                      </tr>

                      {/* Expansion Row */}
                      {expandedRefund?.id === refund._id && (
                        <tr className="expansion-row">
                          <td colSpan="8">
                            <div className="expansion-content">
                              <div className="expansion-summary">
                                <div className="summary-item">
                                  <span className="summary-label">Patient:</span>
                                  <span className="summary-value">{refund.appointment?.patient?.name}</span>
                                </div>
                                <div className="summary-item">
                                  <span className="summary-label">Doctor:</span>
                                  <span className="summary-value">{refund.appointment?.doctor?.user?.name}</span>
                                </div>
                                <div className="summary-item">
                                  <span className="summary-label">Amount:</span>
                                  <span className="summary-value">₹{refund.refundAmount?.toFixed(2)}</span>
                                </div>
                                <div className="summary-item">
                                  <span className="summary-label">Date:</span>
                                  <span className="summary-value">
                                    {formatDate(refund.appointment?.date)} at {formatTime(refund.appointment?.startTime)}
                                  </span>
                                </div>
                              </div>

                              {expandedRefund.action === 'approve' && (
                                <div className="expansion-form">
                                  <label className="form-label">Add a note for the patient (optional)</label>
                                  <textarea
                                    className="form-textarea"
                                    value={noteInput}
                                    onChange={(e) => setNoteInput(e.target.value)}
                                    placeholder="e.g. Refund approved as per our cancellation policy."
                                  />
                                  <div className="expansion-buttons">
                                    <button
                                      className="btn btn-cancel"
                                      onClick={() => setExpandedRefund(null)}
                                      disabled={submitting}
                                    >
                                      CANCEL
                                    </button>
                                    <button
                                      className="btn btn-primary"
                                      onClick={handleConfirmApprove}
                                      disabled={submitting}
                                    >
                                      {submitting ? 'PROCESSING...' : 'CONFIRM APPROVAL →'}
                                    </button>
                                  </div>
                                </div>
                              )}

                              {expandedRefund.action === 'reject' && (
                                <div className="expansion-form">
                                  <label className="form-label">Reason for rejection (required)</label>
                                  <textarea
                                    className="form-textarea"
                                    value={noteInput}
                                    onChange={(e) => setNoteInput(e.target.value)}
                                    placeholder="Please provide a reason for rejecting this refund request."
                                  />
                                  <div className="expansion-buttons">
                                    <button
                                      className="btn btn-cancel"
                                      onClick={() => setExpandedRefund(null)}
                                      disabled={submitting}
                                    >
                                      CANCEL
                                    </button>
                                    <button
                                      className="btn btn-danger"
                                      onClick={handleConfirmReject}
                                      disabled={submitting || !noteInput.trim()}
                                    >
                                      {submitting ? 'PROCESSING...' : 'CONFIRM REJECTION →'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {page} of {totalPages}
              </span>
              <button
                className="pagination-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function getRelativeTime(date) {
  if (!date) return 'N/A';
  const now = new Date();
  const time = new Date(date);
  const diff = Math.floor((now - time) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return `${Math.floor(diff / 604800)} weeks ago`;
}
