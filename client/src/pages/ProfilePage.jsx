import { useState, useContext, useEffect } from 'react';
import { User as UserIcon, Lock, MapPin, Phone, Mail, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const ProfilePage = () => {
  const { user, updateUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: '',
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.password && passwordData.password !== passwordData.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const updatePayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      };

      if (passwordData.password) {
        updatePayload.password = passwordData.password;
      }

      const { data } = await API.put('/auth/profile', updatePayload);
      updateUser(data);
      
      setStatus({ type: 'success', message: 'Profile updated successfully!' });
      setPasswordData({ password: '', confirmPassword: '' });
      
      setTimeout(() => setStatus({ type: '', message: '' }), 5000);
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to update profile.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-4xl space-y-8">
      <div>
        <h1 className="section-title">My Profile</h1>
        <p className="section-subtitle">Manage your personal information and security settings</p>
      </div>

      {status.message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-brand-50 text-brand-700 border border-brand-200'
        }`}>
          {status.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span className="text-sm font-semibold">{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="card p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold text-4xl shadow-inner mb-4">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h2 className="font-bold text-lg text-surface-900">{user?.name}</h2>
            <p className="text-sm text-surface-500">{user?.role === 'admin' ? 'Administrator' : 'Customer'}</p>
            <div className="w-full border-t border-surface-100 my-4"></div>
            <div className="w-full space-y-3 text-sm text-left">
              <div className="flex items-center gap-3 text-surface-600">
                <Mail className="w-4 h-4 text-brand-500" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-surface-600">
                <Phone className="w-4 h-4 text-brand-500" />
                <span className="truncate">{user?.phone || 'No phone added'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-8">
            {/* Personal Details */}
            <div className="space-y-5">
              <h3 className="font-bold text-lg text-surface-900 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-brand-500" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-5 border-t border-surface-100 pt-8">
              <h3 className="font-bold text-lg text-surface-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-500" />
                Default Delivery Address
              </h3>
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider">Street Address</label>
                <textarea
                  name="address"
                  rows="3"
                  placeholder="E.g., 123 Main Street, Apt 4B, City, State, ZIP"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-field resize-none"
                ></textarea>
              </div>
            </div>

            {/* Security */}
            <div className="space-y-5 border-t border-surface-100 pt-8">
              <h3 className="font-bold text-lg text-surface-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-brand-500" />
                Change Password
              </h3>
              <p className="text-xs text-surface-500 -mt-2">Leave blank if you don't want to change your password.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter new password"
                    value={passwordData.password}
                    onChange={handlePasswordChange}
                    className="input-field"
                    minLength="6"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="input-field"
                    minLength="6"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary min-w-[150px]"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
