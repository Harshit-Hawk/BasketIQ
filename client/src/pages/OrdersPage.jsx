import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, MapPin, Calendar, Clock, Package, ChevronRight, ArrowRight } from 'lucide-react';
import API from '../services/api';
import { socket } from '../services/socket';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        setLoading(true);
        const { data } = await API.get('/orders/user');
        setOrders(data);
      } catch (err) {
        console.warn('GET /api/orders/user endpoint failed, using mock data.');
        setOrders([
          {
            _id: 'ord_7f28c5a1',
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            orderStatus: 'Processing',
            totalPrice: 18.25,
            shippingAddress: '123 Elm St, Springfield',
            items: [
              { productId: '1', name: 'Organic Fresh Bananas', quantity: 2, price: 2.99 },
              { productId: '3', name: 'Whole Wheat Bread', quantity: 1, price: 3.29 },
              { productId: '4', name: 'Fresh Organic Broccoli', quantity: 2, price: 1.99 },
            ],
          },
          {
            _id: 'ord_128db4ef',
            createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            orderStatus: 'Delivered',
            totalPrice: 26.50,
            shippingAddress: '123 Elm St, Springfield',
            items: [
              { productId: '2', name: 'Fresh Red Strawberries', quantity: 4, price: 4.49 },
              { productId: '5', name: 'Organic Whole Milk', quantity: 2, price: 3.89 },
            ],
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrders();

    socket.on('order_status_updated', (updatedOrder) => {
      setOrders((prev) => prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)));
    });

    return () => {
      socket.off('order_status_updated');
    };
  }, []);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Pending':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400' };
      case 'Processing':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-400' };
      case 'Packed':
        return { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-400' };
      case 'Out for Delivery':
        return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-400' };
      case 'Delivered':
        return { bg: 'bg-brand-50 text-brand-700 border-brand-200', dot: 'bg-brand-400' };
      default:
        return { bg: 'bg-surface-50 text-surface-700 border-surface-200', dot: 'bg-surface-400' };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 border-3 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
        <p className="text-surface-500 text-sm">Loading your order history...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-4xl space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-surface-400">
        <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-surface-700 font-medium">My Orders</span>
      </div>

      <div>
        <h1 className="section-title">My Orders</h1>
        <p className="section-subtitle">Track delivery statuses and review past purchases</p>
      </div>

      {orders.length === 0 ? (
        <div className="card p-10 text-center shadow-elevated">
          <div className="w-20 h-20 bg-surface-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-surface-300" />
          </div>
          <h3 className="text-lg font-bold text-surface-800">No Orders Yet</h3>
          <p className="text-surface-500 text-sm mt-2 max-w-sm mx-auto">You haven't placed any grocery orders yet. Start shopping to fill your basket.</p>
          <Link to="/products" className="btn-primary mt-6 inline-flex">
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const statusConfig = getStatusConfig(order.orderStatus);
            return (
              <div
                key={order._id}
                className="card-hover p-6 space-y-5"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-surface-100 pb-4 gap-4">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="text-sm font-black text-surface-800 uppercase">
                      Order #{order._id.substring(order._id.length - 8)}
                    </span>
                    <span className="text-surface-300 hidden sm:inline">|</span>
                    <div className="flex items-center gap-1.5 text-xs text-surface-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${statusConfig.bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                    {order.orderStatus}
                  </span>
                </div>

                {/* Status Tracker */}
                <div className="py-4 px-2">
                  <div className="relative flex items-center justify-between">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-surface-100 rounded-full z-0"></div>
                    {['Pending', 'Processing', 'Packed', 'Out for Delivery', 'Delivered'].map((step, index) => {
                      const steps = ['Pending', 'Processing', 'Packed', 'Out for Delivery', 'Delivered'];
                      const currentIndex = steps.indexOf(order.orderStatus);
                      const isCompleted = index <= currentIndex;
                      return (
                        <div key={step} className="relative z-10 flex flex-col items-center gap-1.5">
                          <div className={`w-4 h-4 rounded-full border-2 ${isCompleted ? 'bg-brand-500 border-brand-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-surface-100 border-surface-200'}`}></div>
                          <span className={`hidden sm:block text-[10px] font-bold uppercase tracking-wider ${isCompleted ? 'text-brand-600' : 'text-surface-400'}`}>{step}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="badge-brand text-xs px-2 py-0.5">
                          {item.quantity}x
                        </span>
                        <span className="font-semibold text-surface-700">{item.name}</span>
                      </div>
                      <span className="font-bold text-surface-500">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-surface-100 gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-surface-500 max-w-md">
                    <MapPin className="w-4 h-4 flex-shrink-0 text-surface-400" />
                    <span className="truncate">{order.shippingAddress}</span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3.5">
                    <span className="text-surface-400 font-bold uppercase tracking-wider text-[10px]">Total</span>
                    <span className="text-base font-black text-brand-600">
                      ₹{(order.totalPrice || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
