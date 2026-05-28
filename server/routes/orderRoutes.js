import express from 'express';
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Secure all endpoints in this route file

router.post('/', createOrder);
router.get('/user', getUserOrders);
router.get('/all', admin, getAllOrders);
router.put('/status', admin, updateOrderStatus);

export default router;
