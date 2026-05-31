import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getMyPayments } from '../../api/payment.api';
import SectionHeader from '../../components/common/SectionHeader';
import Table, { ActionLink } from '../../components/common/Table';
import Badge from '../../components/common/Badge';

const PatientPayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

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
    document.title = 'PAYMENT HISTORY — KINETIQ';
    fetchPayments();
  }, []);

  // Compute metrics
  const totalSpent = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const sessionsPaid = payments.length;

  const downloadReceipt = (payment) => {
    // If appointment has a clinical document F3, we can download that
    if (payment.appointment?.sessionDocument) {
      window.open(payment.appointment.sessionDocument, '_blank');
      return;
    }

    // Generate lightweight browser-native text receipt
    const docName = payment.doctor?.user?.name || 'Physiotherapist';
    const apptDate = payment.appointment?.date || 'N/A';
    const apptTime = payment.appointment?.startTime || 'N/A';
    const paymentId = payment.razorpayPaymentId || 'OFFLINE_TXN';

    const content = `
==================================================
              KINETIQ CLINICAL RECEIPT
==================================================
RECEIPT DATE:      ${new Date(payment.createdAt).toLocaleDateString('en-IN')}
TRANSACTION ID:    ${paymentId}
APPOINTMENT DATE:  ${apptDate}
APPOINTMENT TIME:  ${apptTime}
CLINICIAN:         DR. ${docName.toUpperCase()}
FEE CHARGED:       ₹${payment.amount}
COMMISSION (10%):  ₹${(payment.amount * 0.1).toFixed(0)}
PAYMENT SYSTEM:    SECURED BY RAZORPAY GATEWAY
STATUS:            CONFIRMED / PAID

Thank you for choosing Kinetiq clinical networks.
==================================================
`;
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `KINETIQ-RECEIPT-${paymentId.slice(-8)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('RECEIPT GENERATED.');
  };

  return (
    <div className="flex flex-col gap-8 select-none text-left bg-white">
      
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
        <div className="py-12 text-center text-ui-xs font-bold text-neutral-500 uppercase tracking-widest">
          LOADING TRANSACTIONS LEDGER...
        </div>
      ) : payments.length === 0 ? (
        <div className="border border-neutral-200 border-dashed p-12 text-center rounded-lg flex flex-col items-center gap-4 max-w-lg mx-auto bg-neutral-50 shadow-level-1">
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
            NO TRANSACTION ENTRIES
          </span>
          <p className="text-ui-md text-neutral-700 font-bold max-w-sm">
            Your billing receipts and clinical payouts history will appear automatically.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-hidden border border-neutral-200/50 rounded-lg shadow-level-1">
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
                      <Badge variant="paid" />
                    </Table.Cell>
                    <Table.Cell actions>
                      <ActionLink onClick={() => downloadReceipt(payment)}>
                        DOWNLOAD RECEIPT →
                      </ActionLink>
                      <ActionLink onClick={() => navigate('/patient/appointments')}>
                        VIEW APPOINTMENT →
                      </ActionLink>
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
