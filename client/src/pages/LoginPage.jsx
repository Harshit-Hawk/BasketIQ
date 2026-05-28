import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, ShoppingBag } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await login(email, password);
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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <span className="p-2.5 bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-xl shadow-lg shadow-brand-500/25">
              <ShoppingBag className="w-6 h-6" />
            </span>
            <span className="text-2xl font-bold tracking-tight text-surface-900">
              Basket<span className="bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">IQ</span>
            </span>
          </Link>
          <h2 className="text-3xl font-black text-surface-900 tracking-tight">Welcome Back</h2>
          <p className="text-surface-400 mt-2 text-sm">Sign in to your account to continue</p>
        </div>

        <div className="card p-8 shadow-elevated">
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11"
                  required
                />
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-surface-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11"
                  required
                />
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-surface-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3.5"
            >
              <LogIn className="w-5 h-5" />
              <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-surface-100">
            <p className="text-sm text-surface-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700 transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
