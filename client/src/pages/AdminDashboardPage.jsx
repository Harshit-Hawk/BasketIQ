import { useState, useEffect } from 'react';
import { LayoutDashboard, ShoppingBag, Truck, AlertTriangle, Plus, Edit, Trash2, Check, RefreshCw, X, Save, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { socket } from '../services/socket';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    _id: '',
    name: '',
    category: 'Vegetables',
    price: 0,
    stock: 0,
    image: '',
    description: '',
  });
  const [showProductModal, setShowProductModal] = useState(false);

  const [editingStockId, setEditingStockId] = useState(null);
  const [tempStockValue, setTempStockValue] = useState(0);

  useEffect(() => {
    fetchDashboardData();

    socket.on('new_order', (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
    });

    return () => {
      socket.off('new_order');
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [prodRes, orderRes] = await Promise.all([
        API.get('/products'),
        API.get('/orders/all'),
      ]);
      setProducts(prodRes.data || []);
      setOrders(orderRes.data || []);
    } catch (err) {
      console.warn('Dashboard endpoints failed, setting up mock dashboard context.');
      setProducts([
        { _id: '1', name: 'Organic Fresh Bananas', category: 'Fruits', price: 2.99, stock: 50, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=60', description: 'Fresh bananas' },
        { _id: '2', name: 'Whole Wheat Bread', category: 'Bakery', price: 3.29, stock: 0, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60', description: 'Freshly baked wheat loaf' },
        { _id: '3', name: 'Fresh Red Strawberries', category: 'Fruits', price: 4.49, stock: 3, image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop&q=60', description: 'Juicy strawberries' },
      ]);
      setOrders([
        {
          _id: 'ord_7f28c5a1',
          createdAt: new Date().toISOString(),
          orderStatus: 'Pending',
          totalPrice: 18.25,
          shippingAddress: '123 Elm St, Springfield',
          userId: { name: 'John Doe', email: 'john@example.com' },
          items: [{ name: 'Organic Fresh Bananas', quantity: 2, price: 2.99 }],
        },
        {
          _id: 'ord_128db4ef',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          orderStatus: 'Delivered',
          totalPrice: 26.50,
          shippingAddress: '456 Oak Ave, Riverside',
          userId: { name: 'Jane Smith', email: 'jane@example.com' },
          items: [{ name: 'Fresh Red Strawberries', quantity: 4, price: 4.49 }],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
  const totalSales = orders.reduce((acc, order) => acc + (order.orderStatus === 'Delivered' ? (order.totalPrice || 0) : 0), 0);
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 10).length;

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        try {
          await API.put(`/products/${currentProduct._id}`, currentProduct);
        } catch (apiErr) {}
        setProducts((prev) =>
          prev.map((p) => (p._id === currentProduct._id ? currentProduct : p))
        );
      } else {
        const newProduct = {
          ...currentProduct,
          _id: currentProduct._id || 'prod_' + Math.random().toString(36).substr(2, 9),
        };
        try {
          await API.post('/products', newProduct);
        } catch (apiErr) {}
        setProducts((prev) => [...prev, newProduct]);
      }
      setShowProductModal(false);
      resetProductForm();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleEditProduct = (prod) => {
    setIsEditing(true);
    setCurrentProduct(prod);
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await API.delete(`/products/${id}`);
      } catch (err) {}
      setProducts((prev) => prev.filter((p) => p._id !== id));
    }
  };

  const resetProductForm = () => {
    setCurrentProduct({
      _id: '',
      name: '',
      category: 'Vegetables',
      price: 0,
      stock: 0,
      image: '',
      description: '',
    });
    setIsEditing(false);
  };

  const saveQuickStock = (productId) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === productId ? { ...p, stock: Number(tempStockValue) } : p))
    );
    setEditingStockId(null);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      try {
        await API.put('/orders/status', { orderId, status: newStatus });
      } catch (err) {}
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'products', label: 'Products' },
    { id: 'orders', label: 'Orders' },
    { id: 'inventory', label: 'Inventory' },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-surface-400">
        <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-surface-700 font-medium">Admin Dashboard</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-surface-200 pb-6 gap-4">
        <div>
          <h1 className="section-title">Admin Dashboard</h1>
          <p className="section-subtitle">Manage catalog, inventory, and orders</p>
        </div>

        <button
          onClick={() => {
            resetProductForm();
            setShowProductModal(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3.5 px-6 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'border-brand-500 text-brand-600' : 'border-transparent text-surface-500 hover:text-surface-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: TrendingUp, label: 'Total Revenue', value: `₹${totalRevenue.toFixed(2)}`, color: 'from-brand-500 to-brand-600', bg: 'bg-brand-50', iconColor: '#1abf5f' },
            { icon: ShoppingBag, label: 'Total Orders', value: orders.length, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', iconColor: '#3b82f6' },
            { icon: AlertTriangle, label: 'Low Stock Items', value: lowStockCount, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', iconColor: '#f59e0b' },
            { icon: AlertTriangle, label: 'Out of Stock', value: outOfStockCount, color: 'from-red-500 to-red-600', bg: 'bg-red-50', iconColor: '#ef4444' },
          ].map((stat) => (
            <div key={stat.label} className="card p-6 flex items-center gap-4">
              <span className={`p-3.5 ${stat.bg} rounded-2xl`}>
                <stat.icon className="w-6 h-6" style={{ color: stat.iconColor }} />
              </span>
              <div>
                <p className="text-xs font-bold text-surface-500 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-black text-surface-800 mt-1">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-100 text-xs font-bold text-surface-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-50 border border-surface-100 flex-shrink-0">
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-surface-800">{prod.name}</p>
                        <p className="text-xs text-surface-400 truncate max-w-[200px]">{prod.description}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-surface-600">{prod.category}</td>
                    <td className="py-4 px-6 font-bold text-surface-800">₹{prod.price.toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <span className={`badge ${
                        prod.stock === 0 ? 'bg-red-50 text-red-600' : prod.stock < 10 ? 'bg-amber-50 text-amber-700' : 'bg-brand-50 text-brand-700'
                      }`}>
                        {prod.stock} left
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditProduct(prod)}
                          className="p-2 text-surface-400 hover:text-brand-500 hover:bg-brand-50 rounded-xl transition-all"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod._id)}
                          className="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-100 text-xs font-bold text-surface-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Address</th>
                  <th className="py-4 px-6">Value</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-surface-800 uppercase">
                      #{order._id.substring(order._id.length - 8)}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-surface-800 text-sm">
                        {order.userId?.name || 'Customer'}
                      </p>
                      <p className="text-xs text-surface-400 truncate max-w-[140px]">
                        {order.userId?.email || ''}
                      </p>
                    </td>
                    <td className="py-4 px-6 text-surface-600 max-w-[160px] truncate">{order.shippingAddress}</td>
                    <td className="py-4 px-6 font-black text-brand-600">₹{(Number(order.totalPrice) || 0).toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <span className={`badge border ${
                        order.orderStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        order.orderStatus === 'Processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        order.orderStatus === 'Packed' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        order.orderStatus === 'Out for Delivery' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        'bg-brand-50 text-brand-700 border-brand-200'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="input-field py-1.5 px-2 w-auto text-xs rounded-lg"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Packed">Packed</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-100 text-xs font-bold text-surface-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Item</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6">Adjust</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-50 flex-shrink-0 border border-surface-100">
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-surface-800">{prod.name}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`badge ${
                        prod.stock === 0 ? 'bg-red-50 text-red-600' : prod.stock < 10 ? 'bg-amber-50 text-amber-700' : 'bg-brand-50 text-brand-700'
                      }`}>
                        {prod.stock} units
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {editingStockId === prod._id ? (
                        <input
                          type="number"
                          value={tempStockValue}
                          onChange={(e) => setTempStockValue(e.target.value)}
                          className="input-field w-20 py-1.5 px-2 text-sm text-center rounded-lg"
                          min="0"
                        />
                      ) : (
                        <span className="text-surface-400 text-xs">Click adjust</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {editingStockId === prod._id ? (
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => saveQuickStock(prod._id)}
                            className="p-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
                            title="Save"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingStockId(null)}
                            className="p-1.5 bg-surface-100 hover:bg-surface-200 text-surface-500 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingStockId(prod._id);
                            setTempStockValue(prod.stock);
                          }}
                          className="px-3 py-1.5 bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white rounded-lg text-xs font-bold transition-all"
                        >
                          Adjust
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-surface-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card w-full max-w-lg overflow-hidden shadow-elevated animate-scale-in">
            <div className="flex justify-between items-center bg-surface-50 px-6 py-4 border-b border-surface-100">
              <h3 className="font-black text-surface-900 text-lg">
                {isEditing ? 'Modify Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="btn-ghost p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-1.5">Product Name</label>
                <input
                  type="text"
                  value={currentProduct.name}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                  placeholder="e.g. Fresh Red Apples"
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={currentProduct.category}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-1.5">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentProduct.price}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })}
                    className="input-field"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-1.5">Stock Qty</label>
                  <input
                    type="number"
                    value={currentProduct.stock}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, stock: Number(e.target.value) })}
                    className="input-field"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-1.5">Image URL</label>
                  <input
                    type="text"
                    value={currentProduct.image}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  rows="3"
                  value={currentProduct.description}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                  placeholder="Organic product details..."
                  className="input-field resize-none"
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn-primary w-full py-3">
                {isEditing ? 'Save Changes' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
