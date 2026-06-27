import { useState, useEffect } from 'react';
import { Package, ShoppingCart, Users, TrendingUp, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import API from '../services/api';
import { socket } from '../services/socket';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, products, orders
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  const stats = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toFixed(0)}`, icon: TrendingUp, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-sky-600', bg: 'bg-sky-50' },
    { label: 'Total Products', value: products.length, icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Users', value: users.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  useEffect(() => {
    fetchData();

    socket.emit('join_room', 'admin');

    socket.on('new_order', (order) => {
      setOrders(prev => [order, ...prev]);
    });

    socket.on('product_created', (product) => {
      setProducts(prev => [product, ...prev]);
    });

    socket.on('product_updated', (updatedProduct) => {
      setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
    });

    socket.on('product_deleted', (productId) => {
      setProducts(prev => prev.filter(p => p._id !== productId));
    });

    return () => {
      socket.off('new_order');
      socket.off('product_created');
      socket.off('product_updated');
      socket.off('product_deleted');
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, orderRes, userRes] = await Promise.all([
        API.get('/products'),
        API.get('/orders/all'),
        API.get('/auth/all')
      ]);
      setProducts(prodRes.data);
      setOrders(orderRes.data);
      setUsers(userRes.data);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await API.put('/orders/status', { orderId, status: newStatus });
      setOrders(orders.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await API.delete(`/products/${productId}`);
        setProducts(products.filter(p => p._id !== productId));
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[80vh]">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-200 pb-6">
        <div>
          <h1 className="display-title text-2xl sm:text-3xl lg:text-4xl">Admin Dashboard</h1>
          <p className="text-surface-500 mt-1 sm:mt-2 text-sm">Manage products, view orders, and track store performance.</p>
        </div>
        <div className="flex bg-surface-100 p-1 rounded-xl w-full sm:w-max border border-surface-200 overflow-x-auto">
          {['overview', 'products', 'orders'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-white text-surface-900 shadow-sm border border-surface-200' 
                  : 'text-surface-500 hover:text-surface-900 hover:bg-surface-50 border border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[1,2,3,4].map(n => <div key={n} className="h-28 sm:h-32 shimmer rounded-2xl border border-surface-200" />)}
        </div>
      ) : (
        <>
          {/* ── OVERVIEW TAB ── */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {stats.map(s => (
                  <div key={s.label} className="bg-white rounded-2xl shadow-card border border-surface-200 p-4 sm:p-6 flex items-center gap-3 sm:gap-5">
                    <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center ${s.bg}`}>
                      <s.icon className={`w-5 h-5 sm:w-7 sm:h-7 ${s.color}`} />
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-bold text-surface-500 uppercase tracking-widest">{s.label}</p>
                      <p className="text-lg sm:text-2xl font-mono font-bold text-surface-900 mt-0.5 sm:mt-1">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl shadow-card border border-surface-200 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-surface-900">Recent Orders</h3>
                    <button onClick={() => setActiveTab('orders')} className="text-sm text-brand-600 hover:text-brand-700 font-bold">View All</button>
                  </div>
                  <div className="space-y-3">
                    {orders.slice(0, 4).map(o => (
                      <div key={o._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-200">
                        <div>
                          <p className="font-mono font-bold text-surface-900 text-sm">#{o._id.slice(-6).toUpperCase()}</p>
                          <p className="text-xs text-surface-500 mt-0.5">{new Date(o.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-brand-600">₹{(o.totalPrice||0).toFixed(2)}</p>
                          <p className="text-xs font-bold text-surface-500 uppercase tracking-widest mt-0.5">{o.orderStatus}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-card border border-rose-200 p-6 space-y-4">
                  <h3 className="font-bold text-lg text-surface-900">Low Stock Alerts</h3>
                  <div className="space-y-3">
                    {products.filter(p => p.stock < 10).slice(0,4).map(p => (
                      <div key={p._id} className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-100">
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-white" />
                          <div>
                            <p className="font-bold text-surface-900 text-sm">{p.name}</p>
                            <p className="text-xs text-surface-600">{p.category}</p>
                          </div>
                        </div>
                        <div className="px-3 py-1 rounded-lg bg-white border border-rose-200 text-rose-600 font-bold text-sm">
                          {p.stock} left
                        </div>
                      </div>
                    ))}
                    {products.filter(p => p.stock < 10).length === 0 && (
                      <p className="text-surface-500 text-sm py-4 text-center">All products are well stocked.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── PRODUCTS TAB ── */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-2xl shadow-card border border-surface-200 overflow-hidden animate-fade-in">
              <div className="p-4 sm:p-6 border-b border-surface-200 flex items-center justify-between bg-surface-50 gap-3">
                <h3 className="font-bold text-lg text-surface-900">Manage Products</h3>
                <button className="btn-primary py-2.5 px-4 text-sm rounded-xl">
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>
              <div className="overflow-x-auto -mx-0">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-white text-xs font-bold text-surface-500 uppercase tracking-widest border-b border-surface-200">
                      <th className="p-4 pl-6">Product</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Stock</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {products.map(p => (
                      <tr key={p._id} className="hover:bg-surface-50 transition-colors">
                        <td className="p-4 pl-6 flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-surface-100 border border-surface-200" />
                          <span className="font-bold text-surface-900 text-sm line-clamp-1">{p.name}</span>
                        </td>
                        <td className="p-4 text-sm text-surface-600">{p.category}</td>
                        <td className="p-4 font-mono font-bold text-surface-900 text-sm">₹{p.price.toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                            p.stock > 10 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : p.stock > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="p-4 pr-6 text-right space-x-2">
                          <button className="p-2 text-surface-400 hover:text-surface-900 hover:bg-surface-100 rounded-lg transition-colors border border-transparent hover:border-surface-200"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteProduct(p._id)} className="p-2 text-surface-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── ORDERS TAB ── */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-card border border-surface-200 overflow-hidden animate-fade-in">
              <div className="p-4 sm:p-6 border-b border-surface-200 flex items-center justify-between bg-surface-50">
                <h3 className="font-bold text-lg text-surface-900">Manage Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-white text-xs font-bold text-surface-500 uppercase tracking-widest border-b border-surface-200">
                      <th className="p-4 pl-6">Order ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {orders.map(o => (
                      <tr key={o._id} className="hover:bg-surface-50 transition-colors">
                        <td className="p-4 pl-6 font-mono text-sm text-surface-600 font-bold">#{o._id.slice(-8).toUpperCase()}</td>
                        <td className="p-4">
                           <p className="font-bold text-surface-900 text-sm">{o.user?.name || 'Guest'}</p>
                        </td>
                        <td className="p-4 text-sm text-surface-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 font-mono font-bold text-surface-900 text-sm">₹{(o.totalPrice||0).toFixed(2)}</td>
                        <td className="p-4">
                          <select 
                            value={o.orderStatus}
                            onChange={(e) => handleStatusChange(o._id, e.target.value)}
                            className="bg-white border border-surface-300 text-surface-900 text-xs font-bold px-3 py-1.5 rounded-lg outline-none cursor-pointer hover:border-brand-500 transition-colors"
                          >
                            {['Pending', 'Processing', 'Packed', 'Out for Delivery', 'Delivered'].map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button className="btn-secondary px-3 py-1.5 text-xs rounded-lg inline-flex items-center gap-1.5 bg-white border border-surface-200 text-surface-700 hover:bg-surface-50">
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
