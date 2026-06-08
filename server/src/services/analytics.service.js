import User from '../models/User.model.js';
import DoctorProfile from '../models/DoctorProfile.model.js';
import Appointment from '../models/Appointment.model.js';
import Payment from '../models/Payment.model.js';
import Review from '../models/Review.model.js';

/**
 * getPlatformOverview
 * Top-level dashboard metrics — all 13 hero metric values.
 * Runs 5 independent aggregation queries in parallel.
 */
export const getPlatformOverview = async () => {
  const [userStats, doctorStats, appointmentStats, revenueStats, reviewStats] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    DoctorProfile.aggregate([{ $group: { _id: '$verificationStatus', count: { $sum: 1 } } }]),
    Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Payment.aggregate([
      { $match: { status: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalCommission: { $sum: '$platformCommission' },
          totalDoctorEarnings: { $sum: '$doctorEarnings' },
        },
      },
    ]),
    Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
        },
      },
    ]),
  ]);

  // Map user stats array into { patient: N, doctor: N, admin: N }
  const userMap = {};
  for (const item of userStats) userMap[item._id] = item.count;

  // Map doctor verification stats
  const doctorMap = {};
  for (const item of doctorStats) doctorMap[item._id] = item.count;

  // Map appointment status counts
  const apptMap = {};
  for (const item of appointmentStats) apptMap[item._id] = item.count;

  const revenue = revenueStats[0] || { totalRevenue: 0, totalCommission: 0, totalDoctorEarnings: 0 };
  const reviews = reviewStats[0] || { totalReviews: 0, averageRating: 0 };

  const totalUsers = Object.values(userMap).reduce((a, b) => a + b, 0);
  const totalAppointments = Object.values(apptMap).reduce((a, b) => a + b, 0);

  return {
    totalUsers,
    totalPatients: userMap['patient'] || 0,
    totalDoctors: userMap['doctor'] || 0,
    verifiedDoctors: doctorMap['verified'] || 0,
    pendingVerification: doctorMap['pending'] || 0,
    totalAppointments,
    completedAppointments: apptMap['completed'] || 0,
    cancelledAppointments: apptMap['cancelled'] || 0,
    totalRevenue: revenue.totalRevenue || 0,
    totalCommission: revenue.totalCommission || 0,
    totalDoctorEarnings: revenue.totalDoctorEarnings || 0,
    totalReviews: reviews.totalReviews || 0,
    averagePlatformRating: reviews.averageRating ? parseFloat(reviews.averageRating.toFixed(2)) : 0,
  };
};

/**
 * getRevenueTimeSeries
 * Revenue data grouped by period for the revenue trend chart.
 */
export const getRevenueTimeSeries = async ({ period = 'daily', startDate, endDate }) => {
  const groupByFormat = {
    daily: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
    weekly: { $dateToString: { format: '%Y-W%V', date: '$createdAt' } },
    monthly: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
  };

  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  return Payment.aggregate([
    {
      $match: {
        status: 'paid',
        createdAt: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: groupByFormat[period] || groupByFormat.daily,
        revenue: { $sum: '$amount' },
        commission: { $sum: '$platformCommission' },
        appointments: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: '$_id',
        revenue: 1,
        commission: 1,
        appointments: 1,
      },
    },
  ]);
};

/**
 * getAppointmentStatusBreakdown
 * Appointment count by status — used for the donut/pie chart.
 */
export const getAppointmentStatusBreakdown = async () => {
  const allStatuses = ['confirmed', 'completed', 'cancelled', 'pending'];

  const results = await Appointment.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const countMap = {};
  for (const r of results) countMap[r._id] = r.count;

  const total = Object.values(countMap).reduce((a, b) => a + b, 0);

  return allStatuses.map((status) => {
    const count = countMap[status] || 0;
    const percentage = total > 0 ? parseFloat((count / total * 100).toFixed(1)) : 0;
    return { status, count, percentage };
  });
};

/**
 * getTopDoctors
 * Ranking table of top-performing doctors.
 * metric: 'earnings' | 'appointments' | 'rating'
 */
export const getTopDoctors = async ({ limit = 10, metric = 'earnings' }) => {
  const sortField = {
    earnings: 'totalEarnings',
    appointments: 'totalAppointments',
    rating: 'averageRating',
  }[metric] || 'totalEarnings';

  return DoctorProfile.aggregate([
    { $match: { verificationStatus: 'verified' } },
    {
      $lookup: {
        from: 'payments',
        localField: '_id',
        foreignField: 'doctor',
        as: 'payments',
      },
    },
    {
      $lookup: {
        from: 'appointments',
        localField: '_id',
        foreignField: 'doctor',
        as: 'appointmentList',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails',
      },
    },
    {
      $addFields: {
        totalEarnings: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$payments',
                  cond: { $eq: ['$$this.status', 'paid'] },
                },
              },
              in: '$$this.doctorEarnings',
            },
          },
        },
        totalAppointments: { $size: '$appointmentList' },
        doctorName: { $arrayElemAt: ['$userDetails.name', 0] },
        profileImage: { $arrayElemAt: ['$userDetails.profileImage', 0] },
      },
    },
    { $sort: { [sortField]: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        doctorId: '$_id',
        doctorName: 1,
        profileImage: 1,
        specialization: 1,
        totalAppointments: 1,
        totalEarnings: 1,
        averageRating: 1,
        reviewCount: '$totalReviews',
      },
    },
  ]);
};

/**
 * getSpecializationBreakdown
 * Distribution of appointments and revenue across specializations.
 */
export const getSpecializationBreakdown = async () => {
  return Appointment.aggregate([
    { $match: { status: { $in: ['confirmed', 'completed'] } } },
    {
      $lookup: {
        from: 'doctorprofiles',
        localField: 'doctor',
        foreignField: '_id',
        as: 'doctorProfile',
      },
    },
    { $unwind: '$doctorProfile' },
    {
      $group: {
        _id: { $arrayElemAt: ['$doctorProfile.specialization', 0] },
        appointmentCount: { $sum: 1 },
        totalRevenue: { $sum: '$consultationFee' },
        averageFee: { $avg: '$consultationFee' },
        doctorIds: { $addToSet: '$doctor' },
      },
    },
    { $sort: { appointmentCount: -1 } },
    {
      $project: {
        _id: 0,
        specialization: '$_id',
        appointmentCount: 1,
        totalRevenue: 1,
        averageFee: { $round: ['$averageFee', 0] },
        doctorCount: { $size: '$doctorIds' },
      },
    },
  ]);
};

/**
 * getUserGrowthTimeSeries
 * New user registrations over time, grouped by date and role.
 */
export const getUserGrowthTimeSeries = async ({ period = 'daily' }) => {
  const formatMap = {
    daily: '%Y-%m-%d',
    weekly: '%Y-W%V',
    monthly: '%Y-%m',
  };

  const format = formatMap[period] || formatMap.daily;

  const rawResults = await User.aggregate([
    {
      $group: {
        _id: {
          date: { $dateToString: { format, date: '$createdAt' } },
          role: '$role',
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.date': 1 } },
  ]);

  // Pivot: group by date, split into patients/doctors
  const dateMap = {};
  for (const item of rawResults) {
    const { date, role } = item._id;
    if (!dateMap[date]) dateMap[date] = { date, patients: 0, doctors: 0, total: 0 };
    if (role === 'patient') dateMap[date].patients += item.count;
    else if (role === 'doctor') dateMap[date].doctors += item.count;
    dateMap[date].total += item.count;
  }

  return Object.values(dateMap);
};

/**
 * getRecentActivity
 * Recent platform events — merged from appointments, users, payments, reviews.
 */
export const getRecentActivity = async ({ limit = 15 }) => {
  const [appointments, users, payments, reviews] = await Promise.all([
    Appointment.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('patient', 'name')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .lean(),
    User.find({ role: { $ne: 'admin' } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    Payment.find({ status: 'paid' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    Review.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('patient', 'name')
      .lean(),
  ]);

  const events = [];

  for (const appt of appointments) {
    const patientName = appt.patient?.name || 'A patient';
    const doctorName = appt.doctor?.user?.name || 'a doctor';
    events.push({
      type: 'appointment',
      message: `Appointment booked by ${patientName} with Dr. ${doctorName}`,
      timestamp: appt.createdAt,
      metadata: { appointmentId: appt._id, status: appt.status },
    });
  }

  for (const u of users) {
    events.push({
      type: 'registration',
      message: `New ${u.role} registered: ${u.name}`,
      timestamp: u.createdAt,
      metadata: { userId: u._id, role: u.role },
    });
  }

  for (const p of payments) {
    events.push({
      type: 'payment',
      message: `Payment of ₹${p.amount} received`,
      timestamp: p.createdAt,
      metadata: { paymentId: p._id, amount: p.amount },
    });
  }

  for (const r of reviews) {
    const patientName = r.patient?.name || 'A patient';
    events.push({
      type: 'review',
      message: `Review submitted by ${patientName} — ${r.rating}★`,
      timestamp: r.createdAt,
      metadata: { reviewId: r._id, rating: r.rating },
    });
  }

  // Sort all events by timestamp descending, return top `limit`
  events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return events.slice(0, limit);
};
