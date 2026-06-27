import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart, User as UserIcon, LogOut, ChevronDown, Search, X,
  LayoutDashboard, ShoppingBag, Leaf, Truck, Headphones, Home,
  Package, MapPin, Sun, Moon
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { ThemeContext } from '../context/ThemeContext';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const { getCartCount, getCartTotal } = useContext(CartContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    setDropdownOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
    setSearchOpen(false);
    setSearchQuery('');
  };

  const isActive = (path) => {
    if (path === '/')     return location.pathname === '/';
    if (path === '/home') return location.pathname === '/home';
    return location.pathname.startsWith(path);
  };

  const homeLink = user ? '/home' : '/';

  return (
    <div className="flex flex-col min-h-screen bg-surface-50 relative z-10">

      {/* ── Main Header ───────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass-panel shadow-sm">
        


        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-[72px] gap-4 sm:gap-8">

            {/* Logo */}
            <Link to={homeLink} className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-display font-black tracking-tight text-surface-950 hidden sm:block">
                BasketIQ
              </span>
            </Link>

            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl relative group">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search for groceries, fruits, vegetables..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl text-sm bg-surface-50 border border-surface-200 text-surface-900 outline-none transition-colors focus:bg-white focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                />
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Mobile search toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="md:hidden btn-ghost p-2.5 rounded-xl"
              >
                <Search className="w-6 h-6 text-surface-700" />
              </button>

              {/* Desktop Auth */}
              {user ? (
                <div className="relative hidden sm:block" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-50 transition-colors text-surface-700 font-semibold"
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>{user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 glass-dropdown shadow-elevated rounded-xl z-20 py-2 overflow-hidden animate-slide-up">
                        <div className="px-4 py-2 border-b border-surface-100 mb-1">
                          <p className="text-sm font-bold text-surface-900">{user.name}</p>
                          <p className="text-xs text-surface-500 truncate">{user.email}</p>
                        </div>
                        {[
                          { to: '/profile', icon: UserIcon, label: 'My Profile' },
                          { to: '/orders',  icon: Package,  label: 'My Orders'  },
                        ].map(({ to, icon: Icon, label }) => (
                          <Link key={to} to={to} onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-surface-700 hover:bg-surface-50 transition-colors">
                            <Icon className="w-4 h-4 text-surface-400" /> {label}
                          </Link>
                        ))}
                        {user.role === 'admin' && (
                          <Link to="/admin/dashboard" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50 transition-colors">
                            <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                          </Link>
                        )}
                        {user.role === 'delivery' && (
                          <Link to="/delivery/dashboard" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors">
                            <Truck className="w-4 h-4" /> Delivery Dashboard
                          </Link>
                        )}
                        <div className="border-t border-surface-100 mt-1 pt-1">
                          <button onClick={() => { setDropdownOpen(false); logout(); navigate('/'); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors">
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-3">
                  <Link to="/login" className="text-surface-700 font-semibold hover:text-surface-900 px-2">Login</Link>
                  <Link to="/register" className="btn-secondary rounded-xl">Sign Up</Link>
                </div>
              )}

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl hover:bg-surface-100 transition-colors text-surface-600 hover:text-surface-900"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Cart Button */}
              <Link to="/cart" className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                <div className="hidden sm:flex flex-col items-start leading-none">
                  {getCartCount() > 0 ? (
                    <>
                      <span className="text-[10px] uppercase opacity-80">{getCartCount()} items</span>
                      <span className="text-sm">₹{getCartTotal().toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-sm">My Cart</span>
                  )}
                </div>
              </Link>

            </div>
          </div>
        </div>

        {/* Mobile Search Drawer */}
        {searchOpen && (
          <div className="md:hidden px-4 pb-4 animate-slide-up bg-white">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search groceries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-12 pr-10 py-3 rounded-xl bg-surface-50 border border-surface-200 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
              <button type="button" onClick={() => setSearchOpen(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-700">
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <main className="flex-grow pb-20 lg:pb-0 page-enter">
        {children}
      </main>

      {/* ── Mobile Bottom Navigation ──────────────────────────────── */}
      {!(location.pathname === '/' && !user) && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t-0 pb-safe">
          <div className="flex items-center justify-around px-2 py-2">
            {[
              { to: homeLink, icon: Home,         label: 'Home'  },
              { to: '/products', icon: ShoppingBag, label: 'Shop'  },
              { to: '/cart',     icon: ShoppingCart, label: 'Cart', badge: getCartCount() },
              { to: '/orders',   icon: Package,     label: 'Orders'},
              { to: user ? '/profile' : '/login', icon: UserIcon, label: user ? 'Profile' : 'Login' },
            ].map(({ to, icon: Icon, label, badge }) => (
              <Link
                key={to} to={to}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 transition-colors relative ${
                  isActive(to) ? 'text-surface-900' : 'text-surface-400 hover:text-surface-600'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 ${isActive(to) ? 'stroke-[2.5px]' : ''}`} />
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-1.5 bg-brand-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] ${isActive(to) ? 'font-bold' : 'font-medium'}`}>{label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="hidden lg:block bg-surface-50 border-t border-surface-200 mt-auto">
        <div className="container mx-auto px-8 py-12">
          <div className="grid grid-cols-4 gap-10">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-display font-black text-surface-900">
                  BasketIQ
                </span>
              </div>
              <p className="text-sm text-surface-500 leading-relaxed">
                India's finest app. Get your groceries delivered fast.
              </p>
              <div className="flex gap-4 pt-2">
                <div className="w-32 h-10 bg-surface-800 rounded-lg"></div>
                <div className="w-32 h-10 bg-surface-800 rounded-lg"></div>
              </div>
            </div>

            {/* Shop */}
            <div>
              <h4 className="text-sm font-bold text-surface-900 mb-5">Categories</h4>
              <ul className="space-y-3 text-sm text-surface-500">
                {['Vegetables', 'Fruits', 'Dairy & Eggs', 'Bakery Items', 'Beverages', 'Snacks'].map((cat) => (
                  <li key={cat}>
                    <Link to={`/products?category=${cat.split(' ')[0]}`}
                      className="hover:text-surface-900 transition-colors font-medium">{cat}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-bold text-surface-900 mb-5">Company</h4>
              <ul className="space-y-3 text-sm text-surface-500">
                {['About Us', 'Careers', 'Blog', 'Contact Support', 'Privacy Policy', 'Terms of Use'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-surface-900 transition-colors font-medium">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Features */}
            <div>
              <h4 className="text-sm font-bold text-surface-900 mb-5">Why Choose Us</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-brand-500" />
                  <div><p className="text-sm font-bold text-surface-900">Secure Delivery</p><p className="text-xs text-surface-500">To your doorstep</p></div>
                </li>
                <li className="flex items-center gap-3">
                  <Leaf className="w-5 h-5 text-emerald-500" />
                  <div><p className="text-sm font-bold text-surface-900">100% Fresh</p><p className="text-xs text-surface-500">Farm sourced</p></div>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 flex items-center justify-between border-t border-surface-200">
            <p className="text-xs text-surface-500 font-medium">
              © {new Date().getFullYear()} BasketIQ. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
