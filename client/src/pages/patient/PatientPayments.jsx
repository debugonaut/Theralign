import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getMyPayments, requestRefund } from '../../api/payment.api';
import SectionHeader from '../../components/common/SectionHeader';
import Table, { ActionLink } from '../../components/common/Table';
import Badge from '../../components/common/Badge';

const PatientPayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refundingId, setRefundingId] = useState(null);

  const handleRequestRefund = async (paymentId, cancellationReason) => {
    setRefundingId(paymentId);
    try {
      await requestRefund(paymentId, cancellationReason);
      toast.success('REFUND REQUEST SUBMITTED.');
      await fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'FAILED TO REQUEST REFUND.');
    } finally {
      setRefundingId(null);
    }
  };

  const formatINR = (value) => {
    if (value === undefined || value === null) return '₹0';
    return '₹' + new Intl.NumberFormat('en-IN').format(value);
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await getMyPayments();
      if (res.success && res.data) {
        setPayments(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('FAILED TO FETCH PAYMENT TRANSACTIONS LEDGER.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'PAYMENT HISTORY — Theralign';
    fetchPayments();
  }, []);

  // Compute metrics
  const totalSpent = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const sessionsPaid = payments.length;

  const downloadReceipt = (payment) => {
    if (payment.appointment?.sessionDocument?.url) {
      window.open(payment.appointment.sessionDocument.url, '_blank');
      return;
    }

    const docName = payment.doctor?.user?.name || 'Physiotherapist';
    const apptDate = payment.appointment?.date || 'N/A';
    const apptTime = payment.appointment?.startTime || 'N/A';
    const paymentId = payment.razorpayPaymentId || 'OFFLINE_TXN';
    const receiptDate = new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const pad = 48;

    // Header bar
    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, W, 72, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('THERALIGN', pad, 38);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('CLINICAL PAYMENT RECEIPT', pad, 54);

    // Receipt ID top-right
    doc.setFontSize(7);
    doc.text(`RECEIPT: ${paymentId.slice(-8).toUpperCase()}`, W - pad, 38, { align: 'right' });
    doc.text(receiptDate.toUpperCase(), W - pad, 54, { align: 'right' });

    // Divider
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(pad, 100, W - pad, 100);

    // Section: Clinician
    let y = 128;
    const label = (text, x, yPos) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(140, 140, 140);
      doc.text(text, x, yPos);
    };
    const value = (text, x, yPos, bold = false) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(10);
      doc.setTextColor(15, 15, 15);
      doc.text(text, x, yPos);
    };

    const rows = [
      ['CLINICIAN',       `DR. ${docName.toUpperCase()}`],
      ['APPOINTMENT DATE', String(apptDate)],
      ['APPOINTMENT TIME', String(apptTime)],
      ['TRANSACTION ID',  paymentId],
      ['PAYMENT GATEWAY', 'SECURED BY RAZORPAY'],
      ['STATUS',          'CONFIRMED / PAID'],
    ];

    rows.forEach(([lbl, val]) => {
      label(lbl, pad, y);
      value(val, pad, y + 14);
      y += 40;
    });

    // Amount box
    y += 8;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(pad, y, W - pad * 2, 56, 4, 4, 'F');
    label('FEE CHARGED', pad + 16, y + 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 15, 15);
    doc.text(`Rs. ${payment.amount}`, pad + 16, y + 40);
    label('PLATFORM COMMISSION (10%)', W / 2 + 8, y + 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 15, 15);
    doc.text(`Rs. ${(payment.amount * 0.1).toFixed(0)}`, W / 2 + 8, y + 40);

    // Footer
    doc.setDrawColor(220, 220, 220);
    doc.line(pad, 780, W - pad, 780);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text('Thank you for choosing Theralign clinical networks.', W / 2, 796, { align: 'center' });
    doc.text('This is a system-generated receipt and does not require a signature.', W / 2, 808, { align: 'center' });

    doc.save(`Theralign-RECEIPT-${paymentId.slice(-8)}.pdf`);
    toast.success('RECEIPT DOWNLOADED.');
  };

  return (
    <div className="flex flex-col gap-5 select-none text-left bg-white">
      
      {/* Page Header */}
      <SectionHeader
        title="PAYMENT HISTORY"
        size="lg"
        ruled={true}
        className="mb-0"
      />

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'TOTAL SPENT', val: formatINR(totalSpent) },
          { label: 'SESSIONS PAID', val: sessionsPaid },
        ].map((m) => (
          <div
            key={m.label}
            className="group bg-white border border-neutral-200/40 hover:shadow-level-2 shadow-level-1 p-6 transition-warm select-none rounded-lg text-left"
          >
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">
              {m.label}
            </span>
            <h2 className="text-display-sm font-black text-neutral-900 uppercase tracking-tighter leading-none">
              {loading ? '—' : m.val}
            </h2>
          </div>
        ))}
      </div>

      {/* Payments Ledger Table */}
      {loading ? (
        <div className="py-6 text-center text-ui-xs font-bold text-neutral-500 uppercase tracking-widest">
          LOADING TRANSACTIONS LEDGER...
        </div>
      ) : payments.length === 0 ? (
        <div className="border border-neutral-200 border-dashed p-6 text-center rounded-lg flex flex-col items-center gap-3 max-w-lg mx-auto bg-neutral-50 shadow-level-1">
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
            NO TRANSACTION ENTRIES
          </span>
          <p className="text-ui-md text-neutral-700 font-bold max-w-sm">
            Your billing receipts and clinical payouts history will appear automatically.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-hidden border border-neutral-200/50 rounded-lg shadow-level-1 max-w-[1200px]">
          <Table>
            <Table.Head>
              <tr>
                <Table.Header>DATE</Table.Header>
                <Table.Header>APPOINTMENT</Table.Header>
                <Table.Header numeric>AMOUNT</Table.Header>
                <Table.Header>PAYMENT ID</Table.Header>
                <Table.Header>STATUS</Table.Header>
                <Table.Header actions>ACTIONS</Table.Header>
              </tr>
            </Table.Head>
            <Table.Body>
              {payments.map((payment) => {
                const docName = payment.doctor?.user?.name || 'Physiotherapist';
                const specText = Array.isArray(payment.doctor?.specialization)
                  ? payment.doctor.specialization[0]
                  : payment.doctor?.specialization || 'Clinical';

                const payDateText = new Date(payment.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                }).toUpperCase();

                const shortId = payment.razorpayPaymentId
                  ? payment.razorpayPaymentId.slice(-8)
                  : 'N/A';

                return (
                  <Table.Row key={payment._id} hoverable={true}>
                    <Table.Cell className="font-bold text-neutral-500">
                      {payDateText}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-col text-left">
                        <span className="font-black text-neutral-900 uppercase">
                          DR. {docName.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-accent font-black tracking-widest mt-0.5">
                          {specText.toUpperCase()}
                        </span>
                      </div>
                    </Table.Cell>
                    <Table.Cell numeric className="font-black">
                      {formatINR(payment.amount)}
                    </Table.Cell>
                    <Table.Cell className="font-mono text-ui-xs font-bold text-neutral-500 swiss-numeric">
                      <span title={payment.razorpayPaymentId || 'N/A'}>
                        {shortId}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex flex-col gap-1.5 items-start">
                        <Badge variant="paid" />
                        {payment.refundStatus && payment.refundStatus !== 'none' && (
                          <div className="refund-status">
                            {payment.refundStatus === 'pending' && (
                              <span className="badge pending-badge" title="Your refund request is under review by our team.">
                                REFUND PENDING
                              </span>
                            )}
                            
                            {(payment.refundStatus === 'processed' || payment.refundStatus === 'approved') && (
                              <div className="flex flex-col items-start">
                                <span className="badge refunded-badge" title="Refund processed. Please allow 2-3 business days for it to appear in your account.">
                                  REFUNDED
                                </span>
                                <div className="refund-detail">
                                  ₹{payment.refundAmount?.toFixed(2) || payment.amount?.toFixed(2)} · 2-3 business days
                                </div>
                              </div>
                            )}
                            
                            {payment.refundStatus === 'rejected' && (
                              <span className="badge rejected-badge" title={`Reason: ${payment.adminNote}`}>
                                REFUND REJECTED
                              </span>
                            )}
                          </div>
                        )}
                        {payment.cancelledBy === 'doctor' && (payment.refundStatus === 'processed' || payment.refundStatus === 'approved') && (
                          <div className="cancelled-by-doctor">
                            Cancelled by physiotherapist · Full refund issued automatically
                          </div>
                        )}
                      </div>
                    </Table.Cell>
                    <Table.Cell actions>
                      {payment.status === 'refunded' ? (
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">REFUNDED</span>
                      ) : payment.refundStatus === 'approved' ? (
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">REFUND APPROVED</span>
                      ) : payment.refundStatus === 'requested' ? (
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">REFUND PENDING</span>
                      ) : payment.refundStatus === 'rejected' ? (
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">REFUND REJECTED</span>
                      ) : payment.appointment?.status === 'cancelled' && payment.status === 'paid' ? (
                        <button
                          type="button"
                          onClick={() => handleRequestRefund(payment._id, payment.appointment?.cancellationReason)}
                          disabled={refundingId === payment._id}
                          className="text-[10px] font-black text-accent hover:underline uppercase tracking-widest cursor-pointer bg-transparent border-0 disabled:opacity-50"
                        >
                          {refundingId === payment._id ? 'REQUESTING...' : 'REQUEST REFUND →'}
                        </button>
                      ) : (
                        <ActionLink onClick={() => downloadReceipt(payment)}>DOWNLOAD RECEIPT →</ActionLink>
                      )}
                      <ActionLink onClick={() => navigate('/patient/appointments')}>VIEW APPOINTMENT →</ActionLink>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </div>
      )}

    </div>
  );
};

export default PatientPayments;
