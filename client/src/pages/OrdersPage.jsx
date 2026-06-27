import { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle2, ChevronRight, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { socket } from '../services/socket';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();

    socket.on('order_status_updated', (updatedOrder) => {
      setOrders((prev) => 
        prev.map(o => o._id === updatedOrder._id ? updatedOrder : o)
      );
    });

    return () => {
      socket.off('order_status_updated');
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get('/orders/user');
      setOrders(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Delivered':
        return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
      case 'Out for Delivery':
        return { icon: Truck, color: 'text-brand-600', bg: 'bg-brand-50', border: 'border-brand-200' };
      case 'Processing':
      case 'Packed':
        return { icon: Package, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200' };
      default:
        return { icon: Clock, color: 'text-surface-600', bg: 'bg-surface-50', border: 'border-surface-200' };
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 max-w-4xl min-h-[80vh]">
      
      <h1 className="text-2xl font-display font-black text-surface-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card border border-surface-200 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-surface-50 border border-surface-100 flex items-center justify-center mb-6">
            <Package className="w-10 h-10 text-surface-400" />
          </div>
          <h3 className="text-xl font-display font-bold text-surface-900">No orders yet</h3>
          <p className="text-surface-500 mt-2 max-w-sm mx-auto text-sm">
            Looks like you haven't placed an order yet. Discover our fresh groceries today!
          </p>
          <Link to="/products" className="btn-primary px-8 py-3 rounded-xl mt-8">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const StatusIcon = getStatusConfig(order.orderStatus).icon;
            const statusStyle = getStatusConfig(order.orderStatus);

            return (
              <div key={order._id} className="bg-white rounded-2xl shadow-card border border-surface-200 overflow-hidden">
                
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-surface-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-surface-900">#{order._id.slice(-8).toUpperCase()}</span>
                      <span className="text-surface-300">•</span>
                      <span className="text-sm text-surface-500">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <p className="text-sm font-bold text-surface-900">Total: ₹{order.totalPrice?.toFixed(0) || 0}</p>
                  </div>
                  
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${statusStyle.bg} ${statusStyle.border} ${statusStyle.color} text-sm font-bold w-fit`}>
                    <StatusIcon className="w-4 h-4" />
                    {order.orderStatus}
                  </div>
                </div>

                {/* Items */}
                <div className="p-4 sm:p-6 bg-surface-50">
                  <h4 className="text-xs font-bold text-surface-500 uppercase tracking-widest mb-4">Order Items</h4>
                  <div className="flex flex-wrap gap-4">
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-surface-200 w-full sm:w-auto min-w-[200px]">
                        <div className="w-12 h-12 rounded-lg bg-surface-50 border border-surface-100 overflow-hidden shrink-0 flex items-center justify-center">
                          <Package className="w-6 h-6 text-surface-300" />
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-sm font-medium text-surface-900 truncate">{item.name}</p>
                          <p className="text-xs text-surface-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
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
