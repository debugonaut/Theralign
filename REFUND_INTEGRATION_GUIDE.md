# Refund System Integration Guide

This guide shows how to integrate the refund system components into your existing appointment pages.

## 1. Patient Appointments Integration

### File: `client/src/pages/patient/PatientAppointments.jsx`

Add import at the top:
```javascript
import CancellationModal from '../../components/booking/CancellationModal.jsx';
import { cancelAppointmentPatientAPI } from '../../api/refund.api.js';
import toast from 'react-hot-toast';
```

Add state management in the component:
```javascript
const [selectedAppointmentForCancel, setSelectedAppointmentForCancel] = useState(null);
const [cancelLoading, setCancelLoading] = useState(false);

// Handler function
const handlePatientCancelAppointment = async (reason) => {
  if (!selectedAppointmentForCancel) return;

  try {
    setCancelLoading(true);
    await cancelAppointmentPatientAPI(selectedAppointmentForCancel._id, reason);
    
    toast.success('Appointment cancelled. Your refund request has been submitted for review.');
    
    // Refresh appointments list
    // Call your existing refetch function here
    
    setSelectedAppointmentForCancel(null);
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    toast.error(error.response?.data?.message || 'Failed to cancel appointment');
  } finally {
    setCancelLoading(false);
  }
};
```

Add modal to JSX:
```javascript
<CancellationModal
  appointment={selectedAppointmentForCancel}
  isOpen={!!selectedAppointmentForCancel}
  onClose={() => setSelectedAppointmentForCancel(null)}
  onSubmit={handlePatientCancelAppointment}
  isLoading={cancelLoading}
/>
```

On each confirmed+paid appointment row, add cancel button:
```javascript
{appointment.status === 'confirmed' && appointment.paymentStatus === 'paid' && (
  <button
    className="cancel-link"
    onClick={() => setSelectedAppointmentForCancel(appointment)}
  >
    CANCEL APPOINTMENT
  </button>
)}
```

CSS for the cancel link:
```css
.cancel-link {
  background: none;
  border: none;
  color: #c0392b;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.2s;
}

.cancel-link:hover {
  color: #a03225;
}
```

## 2. Doctor Appointments Integration

### File: `client/src/pages/doctor/DoctorAppointments.jsx`

Add import at the top:
```javascript
import DoctorCancellationModal from '../../components/appointments/DoctorCancellationModal.jsx';
import { cancelAppointmentDoctorAPI } from '../../api/refund.api.js';
import toast from 'react-hot-toast';
```

Add state management:
```javascript
const [selectedAppointmentForCancel, setSelectedAppointmentForCancel] = useState(null);
const [cancelLoading, setCancelLoading] = useState(false);

// Handler function
const handleDoctorCancelAppointment = async () => {
  if (!selectedAppointmentForCancel) return;

  try {
    setCancelLoading(true);
    await cancelAppointmentDoctorAPI(selectedAppointmentForCancel._id);
    
    toast.success('Appointment cancelled. Patient refund has been initiated automatically.');
    
    // Refresh appointments list
    // Call your existing refetch function here
    
    setSelectedAppointmentForCancel(null);
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    toast.error(error.response?.data?.message || 'Failed to cancel appointment');
  } finally {
    setCancelLoading(false);
  }
};
```

Add modal to JSX:
```javascript
<DoctorCancellationModal
  appointment={selectedAppointmentForCancel}
  isOpen={!!selectedAppointmentForCancel}
  onClose={() => setSelectedAppointmentForCancel(null)}
  onSubmit={handleDoctorCancelAppointment}
  isLoading={cancelLoading}
/>
```

On each confirmed appointment row, add cancel button:
```javascript
{appointment.status === 'confirmed' && (
  <button
    className="cancel-link"
    onClick={() => setSelectedAppointmentForCancel(appointment)}
  >
    CANCEL
  </button>
)}
```

Use the same CSS as Patient Appointments.

## 3. Patient Payment History Integration

### File: `client/src/pages/patient/PatientPayments.jsx` or similar

Display refund status on each payment row:

```javascript
{payment.refundStatus && payment.refundStatus !== 'none' && (
  <>
    <div className="refund-status">
      {payment.refundStatus === 'pending' && (
        <span className="badge pending-badge" title="Your refund request is under review by our team.">
          REFUND PENDING
        </span>
      )}
      
      {(payment.refundStatus === 'processed' || payment.refundStatus === 'approved') && (
        <div>
          <span className="badge refunded-badge" title="Refund processed. Please allow 2-3 business days for it to appear in your account.">
            REFUNDED
          </span>
          <div className="refund-detail">
            ₹{payment.refundAmount?.toFixed(2)} · 2-3 business days
          </div>
        </div>
      )}
      
      {payment.refundStatus === 'rejected' && (
        <span className="badge rejected-badge" title={`Reason: ${payment.adminNote}`}>
          REFUND REJECTED
        </span>
      )}
    </div>

    {payment.cancelledBy === 'doctor' && payment.refundStatus === 'processed' && (
      <div className="cancelled-by-doctor">
        Cancelled by physiotherapist · Full refund issued automatically
      </div>
    )}
  </>
)}
```

CSS for payment history refund indicators:
```css
.refund-status {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  width: fit-content;
}

.badge.pending-badge {
  background-color: #fef3e2;
  color: #b45309;
  border: 1px solid #b45309;
}

.badge.refunded-badge {
  background-color: #f0f9f8;
  color: #0a7e6e;
  border: 1px solid #0a7e6e;
}

.badge.rejected-badge {
  background-color: #f3f4f6;
  color: #6b7c93;
  border: 1px solid #d1d5db;
}

.refund-detail {
  font-size: 12px;
  color: #a8b8c8;
  margin-top: 2px;
}

.cancelled-by-doctor {
  font-size: 12px;
  color: #6b7c93;
  font-style: italic;
  margin-top: 4px;
}
```

## 4. Admin Sidebar Integration

### File: `client/src/components/admin/AdminSidebar.jsx` or similar

Add navigation link:
```javascript
import { getRefundStatsAPI } from '../../api/refund.api.js';

// In component state
const [refundBadgeCount, setRefundBadgeCount] = useState(0);

// Fetch stats on mount
useEffect(() => {
  const fetchStats = async () => {
    try {
      const response = await getRefundStatsAPI();
      setRefundBadgeCount(response.data.pendingCount);
    } catch (error) {
      console.error('Error fetching refund stats:', error);
    }
  };
  
  fetchStats();
  // Optional: refresh every 30 seconds
  const interval = setInterval(fetchStats, 30000);
  return () => clearInterval(interval);
}, []);

// In navigation items
{
  icon: '💸',
  label: 'Refunds',
  href: '/admin/refunds',
  badge: refundBadgeCount > 0 ? refundBadgeCount : null,
}
```

Badge CSS:
```css
.nav-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #fef3e2;
  color: #b45309;
  border: 1px solid #b45309;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}
```

## 5. Routing Integration

### File: `client/src/App.jsx` or `client/src/router/index.jsx`

Add route for admin refunds page:
```javascript
import AdminRefunds from './pages/admin/AdminRefunds.jsx';

// In your route definitions
{
  path: '/admin/refunds',
  element: <AdminRefunds />,
  meta: { requireAuth: true, requireRole: 'admin' }
}
```

## 6. Notification Display

The notification system should already be displaying notifications. If you're using a custom notification component, ensure it shows:

**For Patients:**
- `REFUND_PENDING` - Your refund request is under review
- `REFUND_APPROVED` - Your refund has been approved
- `REFUND_REJECTED` - Your refund request was reviewed (check details)
- `DOCTOR_CANCELLED` - Doctor cancelled your appointment
- `CANCELLATION_CONFIRMED` - Your cancellation is confirmed

**For Doctors:**
- `CANCELLATION_CONFIRMED` - Appointment cancelled, patient refunded

**For Admin:**
- `REFUND_REQUEST` - New refund request needs review

## Testing Integration

After integrating all components, test the following:

### Patient Flow
1. ✅ Book and pay for appointment
2. ✅ Navigate to appointments page
3. ✅ Click CANCEL APPOINTMENT on confirmed+paid appointment
4. ✅ Modal appears with all required elements
5. ✅ Character counter works
6. ✅ Reason validation enforces 10-character minimum
7. ✅ Submit disables button and shows loading
8. ✅ Appointment updates to CANCELLED status
9. ✅ REFUND PENDING badge appears
10. ✅ Notification received

### Doctor Flow
1. ✅ Book appointment as patient, pay
2. ✅ Login as doctor
3. ✅ Navigate to doctor appointments
4. ✅ Click CANCEL on confirmed appointment
5. ✅ Modal appears with auto-refund warning
6. ✅ Confirm cancellation
7. ✅ Appointment updates to CANCELLED
8. ✅ REFUND AUTO-ISSUED chip appears
9. ✅ Patient sees notification about auto-refund
10. ✅ Payment shows REFUNDED badge immediately

### Admin Flow
1. ✅ Navigate to /admin/refunds
2. ✅ See pending refund badge on sidebar
3. ✅ See refund statistics cards
4. ✅ See pending refunds in table
5. ✅ Click APPROVE on a refund
6. ✅ Inline expansion appears with summary
7. ✅ Add optional note
8. ✅ Confirm approval
9. ✅ Row changes to PROCESSED
10. ✅ Patient receives notification

## Troubleshooting

### Refund API 404 Errors
- Verify routes are added to `appointment.routes.js` and `admin.routes.js`
- Check route order (named routes before parameterized routes)
- Verify imports in route files

### Modal Not Appearing
- Check state management for `selectedAppointmentForCancel`
- Verify modal props are being passed correctly
- Check z-index doesn't conflict with other modals

### Notifications Not Showing
- Verify `createNotification()` calls complete without errors
- Check Notification model exists and has proper schema
- Verify notification display component is monitoring the right subscription/events

### Razorpay Refund Failures
- Check `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are valid
- Verify payment `razorpayPaymentId` exists before calling refund
- Check Razorpay account has refund permissions enabled
- Review Razorpay error message in server logs

## Performance Optimization

1. **Lazy Load Admin Refunds Page:**
```javascript
const AdminRefunds = lazy(() => import('./pages/admin/AdminRefunds.jsx'));
```

2. **Pagination:** Already implemented with limit=20 per page

3. **Caching:** Consider caching stats on client with 30-second TTL

4. **Debouncing:** Admin notes input already auto-saves in expandable rows

## Security Considerations

✅ **Already Implemented:**
- Patient can only cancel their own appointments
- Doctor can only cancel their own appointments
- Admin-only refund approval/rejection endpoints
- Admin note required for rejection (no silent rejections)
- Role-based access control on all routes

⚠️ **For Manual Review:**
- Validate refund amounts match appointment fees before calling Razorpay
- Monitor for duplicate refund API calls (idempotency)
- Log all refund operations for audit trail

## Support

For issues or questions about the implementation:
1. Check REFUND_IMPLEMENTATION.md for technical details
2. Review the test scenarios to ensure all flows work
3. Check browser console for frontend errors
4. Check server logs for backend errors
