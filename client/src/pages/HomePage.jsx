import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Truck, ShieldCheck, RefreshCw, Star, ShoppingBag, ArrowRight, Sparkles, Leaf } from 'lucide-react';
import API from '../services/api';
import { CartContext } from '../context/CartContext';

const FALLBACK_PRODUCTS = [
  {
    _id: '1',
    name: 'Organic Fresh Bananas',
    category: 'Fruits',
    price: 2.99,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    description: 'Fresh organic yellow bananas imported from premium farms.',
  },
  {
    _id: '2',
    name: 'Fresh Red Strawberries',
    category: 'Fruits',
    price: 4.49,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    description: 'Delicious juicy red strawberries, freshly hand-picked.',
  },
  {
    _id: '3',
    name: 'Whole Wheat Bread',
    category: 'Bakery',
    price: 3.29,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    description: 'Freshly baked 100% whole wheat bread loaf.',
  },
  {
    _id: '4',
    name: 'Fresh Organic Broccoli',
    category: 'Vegetables',
    price: 1.99,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    description: 'Crisp green organic broccoli heads rich in nutrients.',
  },
];

const CATEGORIES = [
  { name: 'Vegetables', emoji: '🥬', image: 'https://images.unsplash.com/photo-1566385101042-1a010c42c58f?w=150&auto=format&fit=crop&q=60' },
  { name: 'Fruits', emoji: '🍎', image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=150&auto=format&fit=crop&q=60' },
  { name: 'Dairy', emoji: '🥛', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=150&auto=format&fit=crop&q=60' },
  { name: 'Bakery', emoji: '🥖', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=150&auto=format&fit=crop&q=60' },
  { name: 'Beverages', emoji: '🧃', image: 'https://images.unsplash.com/photo-1527960656366-ee2a999e3286?w=150&auto=format&fit=crop&q=60' },
  { name: 'Snacks', emoji: '🍿', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?w=150&auto=format&fit=crop&q=60' },
];

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data } = await API.get('/products');
        setProducts(data.length > 0 ? data.slice(0, 4) : FALLBACK_PRODUCTS);
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts(FALLBACK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-0">
      {/* Hero Section - Full Bleed */}
      <section className="relative overflow-hidden bg-gradient-to-br from-surface-950 via-surface-900 to-surface-800">
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-gradient-to-bl from-brand-500/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute left-0 bottom-0 w-[400px] h-[400px] bg-gradient-to-tr from-brand-500/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-brand-300 rounded-full text-xs font-bold uppercase tracking-wider border border-white/10">
              <Leaf className="w-3.5 h-3.5" />
              <span>Fresh & Organic Daily</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
              Your Groceries,{' '}
              <span className="bg-gradient-to-r from-brand-400 to-brand-300 bg-clip-text text-transparent">
                Smarter & Fresh
              </span>
            </h1>
            <p className="text-surface-300 text-base sm:text-lg max-w-lg leading-relaxed">
              Shop premium vegetables, fresh fruits, daily bakery essentials, and dairy items curated just for you by AI.
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 max-w-lg bg-white/10 p-1.5 rounded-2xl sm:rounded-full border border-white/15 backdrop-blur-md">
              <div className="flex-1 relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-surface-400" />
                <input
                  type="text"
                  placeholder="What are you looking for today?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-transparent text-white placeholder-surface-400 outline-none text-sm font-medium"
                />
              </div>
              <button
                type="submit"
                className="btn-primary rounded-xl sm:rounded-full px-8"
              >
                Search Shop
              </button>
            </form>

            {/* Trust stats */}
            <div className="flex flex-wrap gap-6 pt-4 text-sm text-surface-400">
              <div className="flex items-center gap-2">
                <span className="text-brand-400 font-black text-lg">500+</span>
                <span>Products</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand-400 font-black text-lg">24hr</span>
                <span>Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-brand-400 font-black text-lg">100%</span>
                <span>Fresh</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Truck, title: 'Fast Free Delivery', desc: 'Free delivery on orders above ₹500 in 2 hours.', color: 'from-brand-500 to-brand-600' },
            { icon: ShieldCheck, title: '100% Fresh & Organic', desc: 'Sourced directly from local farms for quality.', color: 'from-blue-500 to-blue-600' },
            { icon: RefreshCw, title: 'Easy Returns', desc: 'Not happy with quality? Refund instantly.', color: 'from-amber-500 to-amber-600' },
          ].map((item) => (
            <div key={item.title} className="card-hover p-6 flex items-start gap-4">
              <span className={`p-3 bg-gradient-to-br ${item.color} text-white rounded-xl shadow-lg`}>
                <item.icon className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-surface-900 text-base">{item.title}</h3>
                <p className="text-sm text-surface-500 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="section-title">Browse by Category</h2>
            <p className="section-subtitle">Pick fresh groceries by top categories</p>
          </div>
          <Link to="/products" className="group flex items-center gap-1.5 text-brand-600 text-sm font-bold hover:text-brand-700 transition-colors">
            <span>View All</span>
            <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="card-hover p-5 text-center flex flex-col items-center gap-3 group"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface-50 relative ring-2 ring-surface-100 group-hover:ring-brand-200 transition-all">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div>
                <span className="text-sm font-bold text-surface-800 group-hover:text-brand-600 transition-colors">{cat.name}</span>
                <span className="block text-lg mt-0.5">{cat.emoji}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white border-y border-surface-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="section-title">Featured Groceries</h2>
              <p className="section-subtitle">Fresh items recommended for you today</p>
            </div>
            <Link to="/products" className="group flex items-center gap-1.5 text-brand-600 text-sm font-bold hover:text-brand-700 transition-colors">
              <span>View Shop</span>
              <ChevronRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-3 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
              <p className="text-surface-500 text-sm">Loading fresh items...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((prod) => (
                <div
                  key={prod._id}
                  className="card-hover p-4 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <Link to={`/products/${prod._id}`} className="block aspect-square w-full rounded-xl overflow-hidden bg-surface-50 relative">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2.5 left-2.5 badge-brand">
                        {prod.category}
                      </span>
                    </Link>
                    <div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-bold">4.8</span>
                        <span className="text-surface-400">(45)</span>
                      </div>
                      <Link to={`/products/${prod._id}`} className="block mt-1 font-bold text-surface-800 hover:text-brand-600 text-base truncate transition-colors">
                        {prod.name}
                      </Link>
                      <p className="text-xs text-surface-400 mt-1 line-clamp-2">{prod.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-100">
                    <span className="text-lg font-black text-surface-900">₹{prod.price.toFixed(2)}</span>
                    <button
                      onClick={() => addToCart(prod, 1)}
                      className="p-2.5 bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white rounded-xl transition-all duration-200 active:scale-95"
                      title="Add to Cart"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-700 rounded-3xl p-8 sm:p-12 lg:p-16">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="absolute right-0 top-0 w-80 h-80 bg-brand-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-xs font-bold text-white/90">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Savings
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Earn 5% cashback on your weekly grocery list
              </h2>
              <p className="text-sm text-brand-100/80 leading-relaxed">
                BasketIQ learns your shopping habits to recommend smart alternatives and save on your bills automatically.
              </p>
            </div>
            <Link
              to="/products"
              className="flex items-center gap-2 bg-white hover:bg-surface-50 text-brand-700 font-bold px-8 py-4 rounded-2xl shadow-lg shadow-brand-900/20 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] flex-shrink-0"
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
