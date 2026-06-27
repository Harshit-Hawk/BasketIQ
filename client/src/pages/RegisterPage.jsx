import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const urlParams = new URLSearchParams(location.search);
      const redirect = urlParams.get('redirect') || '/home';
      const from = location.state?.from?.pathname || redirect;
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await register(name, email, password, role);
      if (!res.success) {
        setError(res.error);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-surface-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-card border border-surface-200 p-6 sm:p-8 space-y-5 sm:space-y-6">
        
        <div className="text-center space-y-2 mb-2">
          <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center bg-brand-600 mb-6">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <h2 className="display-title text-2xl">Create Account</h2>
          <p className="text-surface-500 text-sm">Join BasketIQ today</p>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-surface-600 uppercase tracking-widest mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field pl-11 py-2.5"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-600 uppercase tracking-widest mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-11 py-2.5"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-surface-600 uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="password"
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11 py-2.5"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-600 uppercase tracking-widest mb-1.5">
                Confirm
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field pl-11 py-2.5"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-surface-600 uppercase tracking-widest mb-1.5">
              Account Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field py-2.5"
            >
              <option value="customer">Customer (Browse & Buy)</option>
              <option value="delivery">Delivery Partner (Deliver Orders)</option>
              <option value="admin">Admin (Manage Store)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-4 text-base mt-4 shadow-sm justify-center"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">Creating Account...</span>
            ) : (
              <span className="flex items-center gap-2">Create Account <ArrowRight className="w-4 h-4" /></span>
            )}
          </button>
        </form>

        <div className="pt-6 border-t border-surface-100 text-center">
          <p className="text-sm text-surface-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
              Sign In
            </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default RegisterPage;
