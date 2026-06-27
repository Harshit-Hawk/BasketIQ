import { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, Star, X, ChevronDown, SlidersHorizontal, PackageOpen, Zap } from 'lucide-react';
import API from '../services/api';
import { CartContext } from '../context/CartContext';
import { socket } from '../services/socket';
import TiltCard from '../components/TiltCard';

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Dairy', 'Bakery', 'Beverages', 'Snacks'];
const SORTS = [
  { id: 'newest', label: 'Newest Arrivals' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
];

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart, cartItems: cart = [] } = useContext(CartContext);

  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    fetchProducts();

    socket.on('product_created', (product) => {
      setProducts((prev) => [product, ...prev]);
    });

    socket.on('product_updated', (updatedProduct) => {
      setProducts((prev) => 
        prev.map(p => p._id === updatedProduct._id ? updatedProduct : p)
      );
    });

    socket.on('product_deleted', (productId) => {
      setProducts((prev) => prev.filter(p => p._id !== productId));
    });

    return () => {
      socket.off('product_created');
      socket.off('product_updated');
      socket.off('product_deleted');
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  const getProductQuantity = (productId) => {
    const item = cart.find(c => c.productId && c.productId._id === productId);
    return item ? item.quantity : 0;
  };

  const updateFilters = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  let filteredProducts = products;
  if (currentCategory !== 'All') {
    filteredProducts = filteredProducts.filter((p) => p.category === currentCategory);
  }
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  filteredProducts.sort((a, b) => {
    if (currentSort === 'price-low') return a.price - b.price;
    if (currentSort === 'price-high') return b.price - a.price;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex flex-col lg:flex-row gap-8 min-h-[80vh]">
      
      {/* ── MOBILE FILTER TOGGLE ── */}
      <div className="lg:hidden flex items-center justify-between mb-2">
        <h1 className="text-2xl font-display font-black text-surface-900">Shop</h1>
        <button 
          onClick={() => setShowMobileFilters(true)}
          className="bg-white border border-surface-200 text-surface-800 font-semibold px-4 py-2 text-sm rounded-xl flex items-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* ── SIDEBAR (Filters) ── */}
      <aside className={`
        fixed inset-0 z-50 lg:static lg:block lg:w-64 lg:shrink-0
        ${showMobileFilters ? 'block' : 'hidden'}
      `}>
        {/* Mobile Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setShowMobileFilters(false)} />
        
        {/* Sidebar Content */}
        <div className={`
          absolute inset-y-0 right-0 w-80 max-w-full bg-white lg:static lg:w-full lg:bg-transparent lg:border-none lg:shadow-none lg:backdrop-blur-none
          p-6 lg:p-0 flex flex-col lg:block h-full lg:h-auto overflow-y-auto lg:overflow-visible transition-transform
          ${showMobileFilters ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex items-center justify-between lg:hidden mb-8">
            <h2 className="font-display font-black text-xl text-surface-900">Filters</h2>
            <button onClick={() => setShowMobileFilters(false)} className="p-2 rounded-lg text-surface-500 hover:bg-surface-50">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-8 lg:sticky lg:top-28">
            {/* Search */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-surface-500 mb-3">Search</h3>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  placeholder="Find products..."
                  value={currentSearch}
                  onChange={(e) => updateFilters('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-white text-surface-900 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-surface-500 mb-3">Categories</h3>
              <div className="space-y-1 border-l-2 border-surface-200 pl-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => updateFilters('category', cat)}
                    className={`w-full text-left py-1.5 text-sm font-medium transition-colors ${
                      currentCategory === cat 
                        ? 'text-brand-600 font-bold relative before:absolute before:-left-[18px] before:top-1/2 before:-translate-y-1/2 before:w-[2px] before:h-full before:bg-brand-500' 
                        : 'text-surface-500 hover:text-surface-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Sort */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-surface-500 mb-3">Sort By</h3>
              <div className="space-y-2">
                {SORTS.map((s) => (
                  <label key={s.id} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="sort"
                      className="hidden"
                      checked={currentSort === s.id}
                      onChange={() => updateFilters('sort', s.id)}
                    />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                      currentSort === s.id ? 'border-brand-500 bg-brand-50' : 'border-surface-300 group-hover:border-surface-400'
                    }`}>
                      {currentSort === s.id && <div className="w-2 h-2 rounded-full bg-brand-500" />}
                    </div>
                    <span className={`text-sm ${currentSort === s.id ? 'font-bold text-surface-900' : 'text-surface-600 group-hover:text-surface-900'}`}>
                      {s.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear Filters (Mobile) */}
            <div className="mt-auto pt-8 lg:hidden">
              <button 
                onClick={() => { setSearchParams({}); setShowMobileFilters(false); }}
                className="w-full bg-white border border-surface-200 text-surface-800 font-bold py-3 rounded-xl hover:bg-surface-50"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT (Grid) ── */}
      <main className="flex-1">
        
        {/* Desktop Header */}
        <div className="hidden lg:flex items-end justify-between mb-6">
          <div>
            <h1 className="text-3xl font-display font-black text-surface-900">{currentCategory === 'All' ? 'All Products' : currentCategory}</h1>
            <p className="text-surface-500 mt-1 text-sm">Showing {filteredProducts.length} items</p>
          </div>
          
          {(currentCategory !== 'All' || currentSearch) && (
            <button 
              onClick={() => setSearchParams({})}
              className="text-brand-600 font-bold hover:text-brand-700 text-sm flex items-center gap-1"
            >
              Clear Filters <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="product-card p-2.5 h-[240px] shimmer border-none" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-surface-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center py-24 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-surface-50 border border-surface-100 flex items-center justify-center mb-6">
              <PackageOpen className="w-10 h-10 text-surface-400" />
            </div>
            <h3 className="text-xl font-display font-bold text-surface-900">No products found</h3>
            <p className="text-surface-500 mt-2 max-w-sm mx-auto text-sm">
              We couldn't find any products matching your current filters.
            </p>
            <button onClick={() => setSearchParams({})} className="bg-white border border-surface-200 text-surface-800 font-bold px-6 py-2.5 rounded-xl mt-6 hover:bg-surface-50">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredProducts.map(product => {
              const qty = getProductQuantity(product._id);
              
              return (
                <div key={product._id} className="h-full">
                  <TiltCard>
                    <div className="product-card p-2.5 flex flex-col h-full bg-white">
                  {/* Image */}
                  <Link to={`/products/${product._id}`} className="block relative h-[120px] sm:h-[140px] rounded-lg overflow-hidden bg-surface-50 mb-3 shrink-0">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
                        <span className="text-rose-600 font-bold text-xs bg-white px-2 py-1 rounded shadow-sm border border-rose-100">Out of Stock</span>
                      </div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 flex flex-col">

                    
                    <Link to={`/products/${product._id}`}>
                      <h3 className="font-medium text-surface-900 text-sm leading-snug line-clamp-2 hover:text-brand-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                      <div className="font-bold text-surface-900 text-sm">
                        ₹{product.price.toFixed(0)}
                      </div>
                      
                      {qty > 0 ? (
                        <div className="flex items-center justify-between w-[70px] h-8 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-1 font-bold">
                           <span className="w-5 text-center text-xs opacity-50">-</span>
                           <span className="text-sm">{qty}</span>
                           <span className="w-5 text-center text-xs opacity-50">+</span>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.preventDefault(); addToCart(product); }}
                          disabled={product.stock === 0}
                          className="w-[70px] h-8 bg-white border border-emerald-600 text-emerald-600 font-bold text-xs rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:border-surface-200 disabled:text-surface-400 disabled:bg-surface-50"
                        >
                          ADD
                        </button>
                      )}
                    </div>
                  </div>
                  </div>
                  </TiltCard>
                </div>
              );
            })}
          </div>
        )}
      </main>

    </div>
  );
};

export default ProductsPage;
