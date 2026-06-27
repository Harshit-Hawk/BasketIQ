import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Clock, Plus, Zap, Percent, ShieldCheck } from 'lucide-react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { socket } from '../services/socket';
import TiltCard from '../components/TiltCard';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { addToCart, cartItems: cart = [] } = useContext(CartContext);

  useEffect(() => {
    fetchFeaturedProducts();

    socket.on('product_updated', (updatedProduct) => {
      setProducts((prev) => 
        prev.map(p => p._id === updatedProduct._id ? updatedProduct : p)
      );
    });

    return () => {
      socket.off('product_updated');
    };
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/products');
      setProducts(res.data.slice(0, 10)); // Show 10 featured items
    } catch (err) {
      console.error('Failed to fetch featured products', err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getProductQuantity = (productId) => {
    const item = cart.find(c => c.productId && c.productId._id === productId);
    return item ? item.quantity : 0;
  };

  const CATEGORIES = [
    { name: 'Vegetables', image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=200&q=80' },
    { name: 'Fruits',     image: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=200&q=80' },
    { name: 'Dairy',      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200&q=80' },
    { name: 'Bakery',     image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&q=80' },
    { name: 'Beverages',  image: 'https://images.unsplash.com/photo-1527960656366-ee2a999e3286?w=200&q=80' },
    { name: 'Snacks',     image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?w=200&q=80' },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-24">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-black text-surface-900">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Guest'}
          </h1>
          <p className="text-surface-500 font-medium mt-1">What would you like to order today?</p>
        </div>
        <div className="flex items-center gap-2 bg-brand-50 text-brand-800 px-4 py-2 rounded-xl font-bold text-sm border border-brand-200">
          <ShieldCheck className="w-4 h-4 text-brand-600" /> Fresh Quality
        </div>
      </div>



      {/* ── CATEGORIES (Horizontal Scroll) ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-black text-surface-900">Explore by Category</h2>
          <Link to="/products" className="text-brand-600 font-bold hover:text-brand-700 text-sm flex items-center">
            See All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.name}
              to={`/products?category=${encodeURIComponent(cat.name.split(' ')[0])}`}
              className="shrink-0 group w-[100px] flex flex-col items-center gap-2"
            >
              <div className="w-[100px] h-[100px] rounded-2xl bg-surface-100 overflow-hidden relative">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="font-semibold text-surface-700 text-xs text-center leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── FEATURED PRODUCTS (Blinkit Style Cards) ── */}
      <div>
        <h2 className="text-xl font-display font-black text-surface-900 mb-6">Trending Near You</h2>

        {loading ? (
          <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 custom-scrollbar">
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} className="shrink-0 w-[160px] h-[240px] rounded-xl border border-surface-200 shimmer" />
            ))}
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 custom-scrollbar">
            {products.map(product => {
              const qty = getProductQuantity(product._id);
              
              return (
                <div key={product._id} className="shrink-0 w-[160px] h-full">
                  <TiltCard>
                    <div className="product-card p-2.5 flex flex-col bg-white h-full">
                  {/* Image */}
                  <Link to={`/products/${product._id}`} className="block relative h-[120px] rounded-lg overflow-hidden bg-surface-50 mb-3">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-10">
                         <span className="text-rose-600 font-bold text-xs bg-white px-2 py-1 rounded shadow-sm border border-rose-100">Out of Stock</span>
                      </div>
                    )}
                  </Link>

                  {/* Content */}
                  <div className="flex-1 flex flex-col">

                    
                    <Link to={`/products/${product._id}`}>
                      <h3 className="font-medium text-surface-900 text-sm leading-tight line-clamp-2 hover:text-brand-600 transition-colors">
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
      </div>

    </div>
  );
};

export default HomePage;
