import express from 'express';
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getDeliveryOrders,
} from '../controllers/orderController.js';
import { protect, admin, adminOrDelivery } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Secure all endpoints in this route file

router.post('/', createOrder);
router.get('/user', getUserOrders);
router.get('/all', admin, getAllOrders);
router.get('/delivery', adminOrDelivery, getDeliveryOrders);
router.put('/status', adminOrDelivery, updateOrderStatus);

export default router;
