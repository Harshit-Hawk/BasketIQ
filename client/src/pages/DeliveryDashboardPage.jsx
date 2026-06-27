import { useState, useEffect } from 'react';
import { Truck, MapPin, Phone, Check, ArrowRight, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { socket } from '../services/socket';

const DeliveryDashboardPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignedOrders();

    socket.on('order_status_updated', (updatedOrder) => {
      setOrders((prev) => prev.map((o) => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => {
      socket.off('order_status_updated');
    };
  }, []);

  const fetchAssignedOrders = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/orders/delivery');
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch delivery orders', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await API.put('/orders/status', { orderId, status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Could not update status');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 border-3 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
        <p className="text-surface-500 text-sm">Loading assigned deliveries...</p>
      </div>
    );
  }

  const activeOrders = orders.filter(o => o.orderStatus !== 'Delivered');
  const pastOrders = orders.filter(o => o.orderStatus === 'Delivered');

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 max-w-4xl">
      <div>
        <h1 className="section-title text-indigo-900">Delivery Dashboard</h1>
        <p className="section-subtitle">Manage and track your assigned deliveries</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card p-6 bg-indigo-50 border-indigo-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Active Deliveries</p>
            <h3 className="text-2xl font-black text-indigo-900">{activeOrders.length}</h3>
          </div>
        </div>
        <div className="card p-6 bg-brand-50 border-brand-100 flex items-center gap-4">
          <div className="p-3 bg-brand-100 rounded-xl text-brand-600">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-brand-500 uppercase tracking-wider">Completed</p>
            <h3 className="text-2xl font-black text-brand-900">{pastOrders.length}</h3>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-surface-800">Active Deliveries</h2>
      {activeOrders.length === 0 ? (
        <div className="card p-10 text-center shadow-elevated">
          <div className="w-20 h-20 bg-surface-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-surface-300">
            <Truck className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-bold text-surface-800">No Active Deliveries</h3>
          <p className="text-surface-500 text-sm mt-2 max-w-sm mx-auto">You have no pending orders assigned right now. Wait for new assignments!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeOrders.map(order => (
            <div key={order._id} className="card p-6 flex flex-col sm:flex-row gap-6 border-l-4 border-l-indigo-500">
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-surface-800 uppercase">
                    Order #{order._id.substring(order._id.length - 8)}
                  </span>
                  <span className="badge-brand text-xs font-bold px-2 py-1 bg-indigo-100 text-indigo-700">
                    {order.orderStatus}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-surface-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-surface-400 mt-0.5 shrink-0" />
                    <span>{order.shippingAddress}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-surface-400 shrink-0" />
                    <span>{order.userId?.name || 'Customer'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-surface-400 shrink-0" />
                    <span>{order.userId?.phone || 'No phone provided'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 justify-center border-t sm:border-t-0 sm:border-l border-surface-100 pt-4 sm:pt-0 sm:pl-6 min-w-[200px]">
                {order.orderStatus === 'Packed' && (
                  <button onClick={() => updateStatus(order._id, 'Out for Delivery')} className="btn-primary bg-indigo-600 hover:bg-indigo-700 justify-center">
                    Mark Out for Delivery <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {order.orderStatus === 'Out for Delivery' && (
                  <button onClick={() => updateStatus(order._id, 'Delivered')} className="btn-primary justify-center">
                    Mark Delivered <Check className="w-4 h-4" />
                  </button>
                )}
                {['Pending', 'Processing'].includes(order.orderStatus) && (
                  <div className="text-center text-sm font-medium text-amber-600 bg-amber-50 py-2 rounded-lg border border-amber-100">
                    Waiting for Shop to Pack
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pastOrders.length > 0 && (
        <div className="pt-8">
          <h2 className="text-xl font-bold text-surface-800 mb-4">Past Deliveries</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {pastOrders.map(order => (
              <div key={order._id} className="card p-4 flex items-center justify-between bg-surface-50">
                <div>
                  <span className="text-xs font-bold text-surface-500 uppercase">
                    #{order._id.substring(order._id.length - 8)}
                  </span>
                  <p className="text-sm text-surface-700 mt-1 truncate max-w-[200px]">{order.shippingAddress}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                  <Check className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryDashboardPage;
