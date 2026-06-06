import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, MapPin, Printer, ArrowRight, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { getMyAppointments } from '../../api/appointment.api';
import { getMyPayments } from '../../api/payment.api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

/**
 * BookingSuccessPage — Post-payment confirmation page.
 * Displays booking confirmation, appointment details, print receipt functionality,
 * and handles mobile responsive layouts without sidebars or navbars.
 */
const BookingSuccessPage = () => {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatINR = (value) => {
    if (value === undefined || value === null) return '₹0';
    return '₹' + new Intl.NumberFormat('en-IN').format(value);
  };

  useEffect(() => {
    document.title = 'Appointment Confirmed — Theralign';

    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch appointments to get details
        const apptsRes = await getMyAppointments();
        if (apptsRes.success && apptsRes.data) {
          const matchedAppt = apptsRes.data.find((a) => a._id === id);
          if (matchedAppt) {
            setAppointment(matchedAppt);
          } else {
            toast.error('Appointment details not found.');
          }
        }

        // Fetch payments to find transaction ID
        const paymentsRes = await getMyPayments();
        if (paymentsRes.success && paymentsRes.data) {
          const matchedPayment = paymentsRes.data.find((p) => 
            p.appointment?._id === id || p.appointment === id
          );
          if (matchedPayment) {
            setPayment(matchedPayment);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load transaction confirmation.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handlePrint = () => {
    const docName = appointment.doctor?.user?.name || 'Physiotherapist';
    const paymentId = payment?.razorpayPaymentId || `pay_mock_${id.slice(-8)}`;
    const fee = appointment.consultationFee || 0;
    const receiptDateStr = payment 
      ? new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

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
    doc.text(receiptDateStr.toUpperCase(), W - pad, 54, { align: 'right' });

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
      ['APPOINTMENT DATE', String(appointment.date)],
      ['APPOINTMENT TIME', String(appointment.startTime)],
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
    doc.setFontSize(22);
    doc.setTextColor(15, 15, 15);
    doc.text(`Rs. ${fee}`, pad + 16, y + 40);
    label('PLATFORM COMMISSION (10%)', W - pad - 16, y + 18);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 15, 15);
    doc.text(`Rs. ${(fee * 0.1).toFixed(0)}`, W - pad - 16, y + 40, { align: 'right' });

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

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <div className="text-center font-bold text-neutral-500 uppercase tracking-widest text-ui-xs">
          Verifying payment transaction...
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <Card className="max-w-[480px] w-full p-6 text-center rounded-[12px] shadow-level-1">
          <ShieldAlert className="w-12 h-12 text-danger mx-auto mb-4" />
          <h2 className="text-display-xs font-black text-neutral-900 tracking-tight">Booking Not Found</h2>
          <p className="text-neutral-500 mt-2 text-ui-sm font-semibold">
            We couldn't verify this scheduled slot.
          </p>
          <div className="mt-6">
            <Link to="/patient/appointments">
              <Button variant="primary" fullWidth>
                View My Appointments
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const docName = appointment.doctor?.user?.name || 'Physiotherapist';
  const specText = Array.isArray(appointment.doctor?.specialization)
    ? appointment.doctor.specialization[0]
    : appointment.doctor?.specialization || 'Clinical Specialist';
  const clinicName = appointment.doctor?.clinicName || 'Theralign Clinic Center';
  const clinicAddress = appointment.doctor?.clinicAddress || 'Pune Practice Center';
  const apptDateStr = new Date(appointment.date + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const receiptDateStr = payment 
    ? new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const paymentId = payment?.razorpayPaymentId || `pay_mock_${id.slice(-8)}`;
  const fee = appointment.consultationFee;

  return (
    <>
      {/* Screen Layout */}
      <div className="min-h-screen bg-neutral-50 py-6 px-6">
        <div className="max-w-[560px] mx-auto flex flex-col gap-6">
          
          {/* Header/Success Alert */}
          <div className="text-center flex flex-col items-center gap-3">
            <CheckCircle className="w-16 h-16 text-success animate-scaleIn" />
            <h1 className="text-display-sm font-black text-neutral-900 tracking-tighter uppercase leading-none mt-2">
              Appointment Confirmed
            </h1>
            <p className="text-ui-sm font-semibold text-neutral-500 max-w-sm">
              Your payment has been successfully verified. A confirmation email has been dispatched.
            </p>
          </div>

          {/* Details Card */}
          <Card className="p-6 sm:p-6 rounded-[12px] shadow-level-1 bg-white border border-neutral-200">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-neutral-100">
              <div className="text-left">
                <span className="text-[10px] text-accent font-black tracking-widest uppercase block mb-1">
                  {specText}
                </span>
                <h2 className="text-ui-xl font-black text-neutral-900 uppercase">
                  Dr. {docName}
                </h2>
                <p className="text-ui-sm font-medium text-neutral-500 mt-0.5">
                  {clinicName}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Badge variant="confirmed" />
                <Badge variant="paid" />
              </div>
            </div>

            {/* Timings */}
            <div className="py-6 border-b border-neutral-100 flex flex-col gap-4 text-left">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
                    Date
                  </span>
                  <span className="text-ui-md font-bold text-neutral-900">
                    {apptDateStr}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
                    Scheduled Time
                  </span>
                  <span className="text-ui-md font-bold text-neutral-900">
                    {appointment.startTime} – {appointment.endTime} (30 MIN)
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
                    Location
                  </span>
                  <span className="text-ui-md font-bold text-neutral-900">
                    {clinicAddress}
                  </span>
                </div>
              </div>
            </div>

            {/* Financials & Transaction Info */}
            <div className="py-6 border-b border-neutral-100 flex flex-col gap-3 text-left">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                  Consultation Fee
                </span>
                <span className="text-ui-md font-black text-neutral-900">
                  {formatINR(fee)}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                  Transaction ID
                </span>
                <span className="text-ui-xs font-mono font-bold text-neutral-500">
                  {paymentId}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                  Payment Status
                </span>
                <span className="text-[10px] font-black text-success uppercase tracking-widest">
                  CONFIRMED / PAID
                </span>
              </div>
            </div>

            {/* Action Buttons Stack */}
            <div className="flex flex-col gap-3 mt-6">
              <Button 
                variant="secondary" 
                onClick={handlePrint}
                fullWidth
                className="h-12 font-bold flex items-center justify-center gap-2 border-neutral-300 hover:bg-neutral-50"
              >
                <Printer size={16} />
                <span>Print Receipt</span>
              </Button>
              <Link to="/patient/appointments" className="w-full">
                <Button variant="primary" fullWidth className="h-12 font-bold flex items-center justify-center gap-2">
                  <span>View My Appointments</span>
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default BookingSuccessPage;
