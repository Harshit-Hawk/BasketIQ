import { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User as UserIcon, LogOut, ChevronDown, Search, Menu, X, LayoutDashboard, ShoppingBag, Leaf, Clock, Truck, Headphones } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const { getCartCount } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-50">
      {/* Top Announcement Bar */}
      <div className="bg-surface-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-6 py-2 text-xs font-medium">
            <span className="hidden sm:flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-brand-400" />
              Free delivery on ₹500+
            </span>
            <span className="flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-brand-400" />
              100% Fresh & Organic
            </span>
            <span className="hidden md:flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-400" />
              Same-day delivery
            </span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-elevated' 
          : 'bg-white border-b border-surface-100'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-[72px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <span className="p-2 bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-xl shadow-lg shadow-brand-500/25 group-hover:shadow-brand-500/40 transition-shadow duration-300">
                <ShoppingBag className="w-5 h-5" />
              </span>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-surface-900">
                Basket<span className="bg-gradient-to-r from-brand-500 to-brand-600 bg-clip-text text-transparent">IQ</span>
              </span>
            </Link>

            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8 relative group">
              <input
                type="text"
                placeholder="Search for fresh groceries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-11 pr-4 py-2.5 rounded-full bg-surface-50 group-focus-within:bg-white group-focus-within:shadow-md"
              />
              <Search className="absolute left-4 top-3 w-4 h-4 text-surface-400 pointer-events-none" />
              <button type="submit" className="hidden">Search</button>
            </form>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    isActive(link.to) 
                      ? 'text-brand-600 bg-brand-50' 
                      : 'text-surface-600 hover:text-surface-900 hover:bg-surface-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Mobile search */}
              <button
                onClick={() => navigate('/products')}
                className="md:hidden btn-ghost p-2.5 rounded-xl"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative btn-ghost p-2.5 rounded-xl"
              >
                <ShoppingCart className="w-5 h-5" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-brand-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-scale-in">
                    {getCartCount()}
                  </span>
                )}
              </Link>

              {/* User Area */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pr-3 bg-surface-50 hover:bg-surface-100 rounded-full border border-surface-200 transition-all duration-200"
                  >
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-inner">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden sm:inline text-xs font-semibold text-surface-700">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-surface-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-60 bg-white border border-surface-100 rounded-2xl shadow-elevated z-20 py-1.5 animate-slide-down">
                        <div className="px-4 py-3 border-b border-surface-100">
                          <p className="text-sm font-bold text-surface-900">{user.name}</p>
                          <p className="text-xs text-surface-400 truncate mt-0.5">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-colors"
                          >
                            <UserIcon className="w-4 h-4 text-surface-400" />
                            My Profile
                          </Link>
                          <Link
                            to="/orders"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-colors"
                          >
                            <ShoppingBag className="w-4 h-4 text-surface-400" />
                            My Orders
                          </Link>
                          {user.role === 'admin' && (
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-surface-600 hover:bg-surface-50 hover:text-surface-900 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4 text-surface-400" />
                              Admin Dashboard
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-surface-100 pt-1">
                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              logout();
                              navigate('/login');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className="btn-ghost text-sm">
                    Log In
                  </Link>
                  <Link to="/register" className="btn-primary text-sm px-5 py-2.5">
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden btn-ghost p-2.5 rounded-xl"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-white border-t border-surface-100 py-4 px-4 space-y-3">
            <form onSubmit={handleSearch} className="relative w-full md:hidden">
              <input
                type="text"
                placeholder="Search groceries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 py-2.5 rounded-full"
              />
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-surface-400 pointer-events-none" />
            </form>
            <div className="flex flex-col gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive(link.to) ? 'bg-brand-50 text-brand-600' : 'text-surface-600 hover:bg-surface-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-surface-600 hover:bg-surface-50 transition-colors"
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-surface-600 hover:bg-surface-50 transition-colors"
                  >
                    My Orders
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold text-surface-600 hover:bg-surface-50 transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </>
              )}
            </div>
            {!user && (
              <div className="flex flex-col gap-2 pt-2 border-t border-surface-100">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary w-full text-sm"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="page-enter">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-950 text-white">
        {/* Feature Bar */}
        <div className="border-b border-surface-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Truck, title: 'Fast Delivery', desc: 'Same-day delivery' },
                { icon: Leaf, title: '100% Fresh', desc: 'Farm to doorstep' },
                { icon: Headphones, title: '24/7 Support', desc: 'Always here for you' },
                { icon: ShoppingBag, title: 'Easy Returns', desc: 'Hassle-free returns' },
              ].map((feature) => (
                <div key={feature.title} className="flex items-center gap-3">
                  <div className="p-2.5 bg-surface-800 rounded-xl">
                    <feature.icon className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{feature.title}</h4>
                    <p className="text-xs text-surface-400">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-xl">
                  <ShoppingBag className="w-5 h-5" />
                </span>
                <span className="text-lg font-bold tracking-tight">
                  Basket<span className="text-brand-400">IQ</span>
                </span>
              </div>
              <p className="text-sm text-surface-400 leading-relaxed">
                AI-powered premium grocery shopping. Get the freshest products delivered to your doorstep with smart recommendations.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-wider uppercase mb-5 text-brand-400">Shop</h4>
              <ul className="space-y-3 text-sm text-surface-400">
                <li><Link to="/products?category=Vegetables" className="hover:text-white transition-colors duration-200">Fresh Vegetables</Link></li>
                <li><Link to="/products?category=Fruits" className="hover:text-white transition-colors duration-200">Seasonal Fruits</Link></li>
                <li><Link to="/products?category=Dairy" className="hover:text-white transition-colors duration-200">Dairy & Eggs</Link></li>
                <li><Link to="/products?category=Bakery" className="hover:text-white transition-colors duration-200">Bakery Items</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-wider uppercase mb-5 text-brand-400">Company</h4>
              <ul className="space-y-3 text-sm text-surface-400">
                <li><a href="#" className="hover:text-white transition-colors duration-200">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Contact Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-wider uppercase mb-5 text-brand-400">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="text-surface-400">Support Email</li>
                <li className="text-white font-medium">support@basketiq.com</li>
                <li className="text-surface-400 pt-2">Working Hours</li>
                <li className="text-white font-medium">7:00 AM - 10:00 PM</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-surface-800 text-center text-xs text-surface-500">
            &copy; {new Date().getFullYear()} BasketIQ. All rights reserved. Made with 🌿 for fresh grocery shopping.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
