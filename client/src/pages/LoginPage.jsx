import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
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
      const urlParams = new URLSearchParams(location.search);
      const redirect = urlParams.get('redirect') || '/home';
      const from = location.state?.from?.pathname || redirect;
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
    <div className="min-h-[85vh] flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-surface-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-card border border-surface-200 p-6 sm:p-8 space-y-6 sm:space-y-8">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center bg-brand-600 mb-6">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <h2 className="display-title text-2xl">Welcome Back</h2>
          <p className="text-surface-500 text-sm">Sign in to your BasketIQ account</p>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-surface-600 uppercase tracking-widest mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-11"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-surface-600 uppercase tracking-widest">
                Password
              </label>
              <a href="#" className="text-xs font-bold text-brand-600 hover:text-brand-700">Forgot?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-11"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full py-4 text-base mt-2 shadow-sm justify-center"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">Signing In...</span>
            ) : (
              <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>
            )}
          </button>
        </form>

        <div className="pt-6 border-t border-surface-100 text-center">
          <p className="text-sm text-surface-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
              Create one now
            </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default LoginPage;
