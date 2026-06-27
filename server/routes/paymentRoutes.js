import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getRazorpayKey,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '../controllers/paymentController.js';

const router = express.Router();

router.use(protect); // Secure all payment routes

router.get('/key', getRazorpayKey);
router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyRazorpayPayment);

export default router;
