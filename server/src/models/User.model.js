import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ROLES, TOKEN_EXPIRY } from '../utils/constants.js';
import config from '../config/env.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must not exceed 50 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address',
      ],
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // CRITICAL: never returned in queries by default
    },

    role: {
      type: String,
      enum: {
        values: [ROLES.PATIENT, ROLES.DOCTOR, ROLES.ADMIN],
        message: 'Role must be one of: patient, doctor, admin',
      },
      default: ROLES.PATIENT,
      required: true,
    },

    profileImage: {
      type: String,
      default: null, // Cloudinary URL — populated in Phase 3
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true, // Admin can deactivate accounts
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// email unique index is created automatically by the `unique: true` field option
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// ─── Pre-save Hook: Password Hashing ─────────────────────────────────────────
// Runs before every save. Skips re-hashing if password hasn't changed.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Instance Method: Compare Password ───────────────────────────────────────
// Verifies a candidate password against the stored bcrypt hash.
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance Method: Generate Auth Token ────────────────────────────────────
// Returns a signed JWT with minimal payload (id + role only).
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    config.jwtSecret,
    { expiresIn: TOKEN_EXPIRY }
  );
};

const User = mongoose.model('User', userSchema);

export default User;
