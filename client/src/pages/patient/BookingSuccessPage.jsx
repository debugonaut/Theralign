import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, MapPin, Printer, ArrowRight, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';
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
    window.print();
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
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
        }
      `}</style>

      {/* Screen Layout (Hidden when printing) */}
      <div className="no-print min-h-screen bg-neutral-50 py-6 px-6">
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

      {/* Print-Only Layout */}
      <div className="print-only hidden">
        <div className="max-w-[600px] mx-auto p-6 border-2 border-neutral-900 rounded-md font-mono text-neutral-900 bg-white">
          <div className="border-b-2 border-neutral-900 pb-4 mb-6 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900">THERALIGN</h1>
              <p className="text-[9px] uppercase tracking-widest text-neutral-500 mt-1 font-bold">CLINICAL PAYMENT RECEIPT</p>
            </div>
            <div className="text-right">
              <span className="text-[8px] text-neutral-400 block">RECEIPT ID</span>
              <span className="text-xs font-bold font-mono">{paymentId.toUpperCase()}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-y-5 text-xs mb-8">
            <div>
              <span className="text-[8px] uppercase tracking-widest text-neutral-400 block mb-0.5">CLINICIAN</span>
              <span className="font-bold">DR. {docName.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-[8px] uppercase tracking-widest text-neutral-400 block mb-0.5">RECEIPT DATE</span>
              <span className="font-bold">{receiptDateStr.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-[8px] uppercase tracking-widest text-neutral-400 block mb-0.5">APPOINTMENT DATE</span>
              <span className="font-bold">{appointment.date}</span>
            </div>
            <div>
              <span className="text-[8px] uppercase tracking-widest text-neutral-400 block mb-0.5">APPOINTMENT TIME</span>
              <span className="font-bold">{appointment.startTime} – {appointment.endTime}</span>
            </div>
            <div>
              <span className="text-[8px] uppercase tracking-widest text-neutral-400 block mb-0.5">CLINIC ADDRESS</span>
              <span className="font-bold">{clinicAddress.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-[8px] uppercase tracking-widest text-neutral-400 block mb-0.5">PAYMENT GATEWAY</span>
              <span className="font-bold">SECURED BY RAZORPAY</span>
            </div>
          </div>
          
          <div className="bg-neutral-100 p-5 rounded-md mb-8 flex justify-between items-center border border-neutral-200">
            <div>
              <span className="text-[8px] uppercase tracking-widest text-neutral-400 block mb-0.5">FEE CHARGED</span>
              <span className="text-xl font-black">Rs. {fee}</span>
            </div>
            <div className="text-right">
              <span className="text-[8px] uppercase tracking-widest text-neutral-400 block mb-0.5">PLATFORM COMMISSION (10%)</span>
              <span className="text-sm font-bold">Rs. {(fee * 0.1).toFixed(0)}</span>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 pt-6 text-center text-[10px] text-neutral-500 space-y-1">
            <p className="font-bold">Thank you for choosing Theralign clinical networks.</p>
            <p>This is a system-generated receipt and does not require a signature.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingSuccessPage;
