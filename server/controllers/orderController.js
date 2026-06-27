import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';

// @desc    Create a new order & update stocks & clear cart
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { items, totalPrice, shippingAddress, paymentMethod, paymentStatus } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // Verify stock and update product inventory
    let calculatedTotal = 0;
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, requested: ${item.quantity}`,
        });
      }
      // Decrement stock
      product.stock -= item.quantity;
      await product.save();
      
      const io = req.app.get('io');
      if (io) io.emit('product_updated', product);
      
      // Calculate subtotal for this item
      calculatedTotal += product.price * item.quantity;
    }
    


    // Auto-assign delivery partner
    const deliveryPartners = await User.find({ role: 'delivery' });
    let assignedPartnerId = null;
    if (deliveryPartners.length > 0) {
      const randomIndex = Math.floor(Math.random() * deliveryPartners.length);
      assignedPartnerId = deliveryPartners[randomIndex]._id;
    }

    // Create the order
    const order = await Order.create({
      userId: req.user._id,
      items,
      totalPrice: calculatedTotal,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      paymentStatus: paymentStatus || 'Pending',
      deliveryPartnerId: assignedPartnerId,
    });

    // Clear user's cart
    const cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.products = [];
      await cart.save();
    }

    // Emit new order event to admin
    const io = req.app.get('io');
    if (io) {
      const populatedOrder = await Order.findById(order._id).populate('userId', 'name email');
      io.to('admin').emit('new_order', populatedOrder);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/user
// @access  Private
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get ALL orders (admin only)
// @route   GET /api/orders/all
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, deliveryPartnerId } = req.body;

    if (!['Pending', 'Processing', 'Packed', 'Out for Delivery', 'Delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(orderId);

    if (order) {
      if (req.user.role === 'delivery' && order.deliveryPartnerId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this order' });
      }

      order.orderStatus = status;
      if (req.user.role === 'admin' && deliveryPartnerId !== undefined) {
        order.deliveryPartnerId = deliveryPartnerId || null;
      }

      const updatedOrder = await order.save();
      
      const io = req.app.get('io');
      if (io) {
        io.to(updatedOrder.userId.toString()).emit('order_status_updated', updatedOrder);
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get delivery partner orders
// @route   GET /api/orders/delivery
// @access  Private/Delivery
export const getDeliveryOrders = async (req, res) => {
  try {
    const orders = await Order.find({ deliveryPartnerId: req.user._id })
      .populate('userId', 'name phone address')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
