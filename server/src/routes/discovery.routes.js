import express from 'express';
import {
  getDiscoveryListing,
  getNearbyDoctors,
  searchDoctors,
  getFeaturedDoctors,
  getSpecializationList,
  getDoctorPublicProfile,
} from '../controllers/discovery.controller.js';
import {
  discoveryListingValidation,
  nearbyDoctorsValidation,
  searchDoctorsValidation,
} from '../validations/discovery.validation.js';
import validate from '../middleware/validate.middleware.js';

const router = express.Router();

// Order matters — static routes before parameterized routes
router.get('/featured', getFeaturedDoctors);
router.get('/nearby', nearbyDoctorsValidation, validate, getNearbyDoctors);
router.get('/search', searchDoctorsValidation, validate, searchDoctors);
router.get('/specializations', getSpecializationList);
router.get('/', discoveryListingValidation, validate, getDiscoveryListing);
router.get('/:id', getDoctorPublicProfile);

export default router;
