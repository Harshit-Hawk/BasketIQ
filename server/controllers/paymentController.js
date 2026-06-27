import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';

// @desc    Get Razorpay Key ID
// @route   GET /api/payment/key
// @access  Private
export const getRazorpayKey = (req, res) => {
  res.json({ key: process.env.RAZORPAY_KEY_ID });
};

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // convert INR to paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).json({ message: 'Error creating Razorpay order' });

    res.json(order);
  } catch (error) {
    console.error('Error in createRazorpayOrder:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Razorpay payment and save order
// @route   POST /api/payment/verify
// @access  Private
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      shippingAddress,
      totalPrice,
    } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // 1. Decrement Stock
      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock -= item.quantity;
          await product.save();
          
          const io = req.app.get('io');
          if (io) io.emit('product_updated', product);
        }
      }

      // 2. Create Order in DB
      const newOrder = await Order.create({
        userId: req.user._id,
        items,
        totalPrice,
        shippingAddress,
        paymentMethod: 'Razorpay Online Payment',
        paymentStatus: 'Paid',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      });

      // 3. Clear User Cart
      const cart = await Cart.findOne({ userId: req.user._id });
      if (cart) {
        cart.products = [];
        await cart.save();
      }

      // 4. Broadcast Real-time Event to Admins
      const io = req.app.get('io');
      if (io) {
        const populatedOrder = await Order.findById(newOrder._id).populate('userId', 'name email');
        io.to('admin').emit('new_order', populatedOrder);
      }

      res.status(200).json({ message: 'Payment verified successfully', order: newOrder });
    } else {
      res.status(400).json({ message: 'Invalid payment signature!' });
    }
  } catch (error) {
    console.error('Error in verifyRazorpayPayment:', error);
    res.status(500).json({ message: error.message });
  }
};
