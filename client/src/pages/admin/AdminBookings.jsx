import React from 'react';
import { CalendarRange } from 'lucide-react';
import AppointmentsTable from '../../components/admin/AppointmentsTable';

const AdminBookings = () => {
  return (
    <div className="p-8 space-y-8 select-none">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <CalendarRange className="text-primary" size={24} />
          Appointments Audit Registry
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review, analyze, and paginate through every scheduled clinical visit registered on the platform.
        </p>
      </div>

      {/* Full Paginated Appointments Table */}
      <AppointmentsTable limit={10} />
    </div>
  );
};

export default AdminBookings;
