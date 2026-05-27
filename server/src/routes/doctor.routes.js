import express from 'express';
const router = express.Router();

router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Doctor routes working correctly'
  });
});

export default router;
