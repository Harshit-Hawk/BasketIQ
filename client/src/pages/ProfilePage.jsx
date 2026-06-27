import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User as UserIcon, Mail, ShieldCheck, MapPin, CreditCard, Bell, LogOut, ArrowRight, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 max-w-5xl space-y-8 min-h-[80vh]">
      
      {/* ── HEADER ── */}
      <div className="pb-6 border-b border-surface-200">
        <h1 className="display-title text-2xl sm:text-3xl lg:text-4xl">My Profile</h1>
        <p className="text-surface-500 mt-1 sm:mt-2 text-sm">Manage your personal information, address, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* ── LEFT: USER CARD ── */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-card border border-surface-200 p-6 flex flex-col items-center text-center">
            
            <div className="relative group cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-brand-100 border border-brand-200 flex items-center justify-center text-3xl font-black text-brand-700 overflow-hidden">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>

            <h3 className="font-display font-bold text-xl text-surface-900 mt-4">{user.name}</h3>
            <p className="text-sm text-surface-500">{user.email}</p>

            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-100 border border-surface-200 text-xs font-bold text-surface-700 capitalize">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              {user.role}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-surface-200 p-2 space-y-1">
            <button className="w-full flex items-center justify-between p-3 rounded-xl bg-surface-50 text-left text-sm font-bold text-surface-900 transition-colors">
              <span className="flex items-center gap-3"><UserIcon className="w-4 h-4 text-surface-500" /> Personal Info</span>
              <ArrowRight className="w-4 h-4 text-surface-500" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 text-left text-sm font-bold text-surface-600 transition-colors">
              <span className="flex items-center gap-3"><MapPin className="w-4 h-4 text-surface-400" /> Saved Addresses</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 text-left text-sm font-bold text-surface-600 transition-colors">
              <span className="flex items-center gap-3"><CreditCard className="w-4 h-4 text-surface-400" /> Payment Methods</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 text-left text-sm font-bold text-surface-600 transition-colors">
              <span className="flex items-center gap-3"><Bell className="w-4 h-4 text-surface-400" /> Notifications</span>
            </button>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full btn-danger rounded-xl py-3 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        {/* ── RIGHT: DETAILS ── */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-card border border-surface-200 p-6 sm:p-8">
            <h3 className="font-bold text-lg text-surface-900 mb-6">Personal Information</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-surface-600 uppercase tracking-widest mb-2">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input type="text" defaultValue={user.name} className="input-field pl-11" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-surface-600 uppercase tracking-widest mb-2">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 text-sm font-bold">+91</span>
                    <input type="text" placeholder="98765 43210" className="input-field pl-12" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-600 uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input type="email" defaultValue={user.email} className="input-field pl-11 bg-surface-50 cursor-not-allowed text-surface-500" disabled />
                </div>
                <p className="text-xs text-surface-500 mt-2">Email address cannot be changed.</p>
              </div>

              <div className="pt-4 border-t border-surface-100 flex flex-col sm:flex-row justify-end gap-3">
                <button className="btn-secondary px-5 py-2.5 text-sm">Cancel</button>
                <button className="btn-primary px-6 py-2.5 text-sm">Save Changes</button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-card border border-surface-200 p-6 sm:p-8">
            <h3 className="font-bold text-lg text-surface-900 mb-2">Account Preferences</h3>
            <p className="text-sm text-surface-500 mb-6">Manage your email notifications and communications.</p>
            
            <div className="space-y-4">
              {[
                { title: 'Order Updates', desc: 'Receive SMS & emails about your order status.', defaultChecked: true },
                { title: 'Daily Deals', desc: 'Get notified about fresh stock and new items.', defaultChecked: false },
                { title: 'Newsletter', desc: 'Weekly tips on healthy eating and recipes.', defaultChecked: true },
              ].map((pref, i) => (
                <label key={i} className="flex items-start justify-between gap-4 p-4 rounded-xl border border-surface-200 bg-surface-50 cursor-pointer hover:border-surface-300 transition-colors">
                  <div>
                    <h4 className="font-bold text-surface-900 text-sm">{pref.title}</h4>
                    <p className="text-xs text-surface-500 mt-1">{pref.desc}</p>
                  </div>
                  <div className="relative">
                    <input type="checkbox" className="sr-only peer" defaultChecked={pref.defaultChecked} />
                    <div className="w-11 h-6 bg-surface-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-surface-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500 border border-surface-300 peer-checked:border-brand-600"></div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
