import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
      unique: true, // One review per appointment — enforced at schema level
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DoctorProfile',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
      trim: true,
    },
    isVisible: {
      type: Boolean,
      default: true, // Admin can hide reviews without deleting them
    },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// One review per appointment — schema-level unique already covers this,
// but an explicit index makes the constraint visible and queryable
reviewSchema.index({ appointment: 1 }, { unique: true });

// Primary query pattern: all reviews for a doctor
reviewSchema.index({ doctor: 1, isVisible: 1 });

// Check if patient has reviewed a specific appointment
reviewSchema.index({ patient: 1, appointment: 1 });

// ─── Post-Save Hook — Update Doctor Average Rating ────────────────────────────
// After every review is saved, recalculate the doctor's averageRating and
// totalReviews. This denormalization keeps the doctor listing page fast.
reviewSchema.post('save', async function () {
  const Review = this.constructor;
  const DoctorProfile = mongoose.model('DoctorProfile');

  const stats = await Review.aggregate([
    { $match: { doctor: this.doctor, isVisible: true } },
    {
      $group: {
        _id: '$doctor',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await DoctorProfile.findByIdAndUpdate(this.doctor, {
      averageRating: parseFloat(stats[0].averageRating.toFixed(1)),
      totalReviews: stats[0].totalReviews,
    });
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
