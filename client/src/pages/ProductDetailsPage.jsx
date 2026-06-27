import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Zap, Star, ShieldCheck, 
  Minus, Plus, Heart, Share2, AlertCircle, ChevronRight
} from 'lucide-react';
import API from '../services/api';
import { CartContext } from '../context/CartContext';
import { socket } from '../services/socket';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems: cart = [], updateQuantity } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    fetchProductDetails();
    window.scrollTo(0, 0);

    socket.on('product_updated', (updatedProduct) => {
      setProduct((prev) => (prev && prev._id === updatedProduct._id ? updatedProduct : prev));
    });

    return () => {
      socket.off('product_updated');
    };
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/products/${id}`);
      setProduct(res.data);
      
      const relatedRes = await API.get('/products');
      setRelatedProducts(
        relatedRes.data
          .filter((p) => p.category === res.data.category && p._id !== res.data._id)
          .slice(0, 4)
      );
    } catch (err) {
      console.error('Failed to fetch product details', err);
    } finally {
      setLoading(false);
    }
  };

  const cartItem = product ? cart.find(c => c.productId && c.productId._id === product._id) : null;
  const quantity = cartItem ? cartItem.quantity : 0;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-display font-bold text-surface-900 mb-4">Product Not Found</h2>
        <button onClick={() => navigate('/products')} className="btn-secondary">
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-12 min-h-[80vh]">
      
      {/* ── BREADCRUMB ── */}
      <nav className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-surface-500">
        <Link to="/" className="hover:text-surface-900 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-surface-300" />
        <Link to="/products" className="hover:text-surface-900 transition-colors">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5 text-surface-300" />
        <Link to={`/products?category=${product.category}`} className="hover:text-surface-900 transition-colors">{product.category}</Link>
        <ChevronRight className="w-3.5 h-3.5 text-surface-300" />
        <span className="text-surface-900 truncate max-w-[150px]">{product.name}</span>
      </nav>

      <div className="bg-white rounded-2xl shadow-card border border-surface-200 p-4 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        
        {/* Left: Image */}
        <div className="relative aspect-square sm:aspect-auto sm:h-[350px] md:h-[400px] lg:h-[500px] rounded-xl overflow-hidden bg-surface-50 border border-surface-200">
          {!imageLoaded && <div className="absolute inset-0 shimmer" />}
          
          <img 
            src={product.image} 
            alt={product.name}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-contain mix-blend-multiply transition-opacity duration-300 p-4 sm:p-8 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <span className="bg-white border border-surface-200 shadow-sm text-surface-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
              {product.category}
            </span>
            {product.stock > 0 && product.stock < 10 && (
              <span className="bg-rose-50 text-rose-600 border border-rose-200 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
                Only {product.stock} Left!
              </span>
            )}
          </div>
          

        </div>

        {/* Right: Details */}
        <div className="flex flex-col">
          


          <h1 className="text-2xl sm:text-3xl font-display font-black text-surface-900 leading-tight mb-4">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-2 mb-6 text-sm">
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-100">
              4.8 <Star className="w-3.5 h-3.5 fill-emerald-600" />
            </div>
            <span className="text-surface-400">124 Ratings</span>
          </div>
          
          <div className="divider !mt-0" />

          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="price-tag text-3xl sm:text-4xl text-surface-900">₹{product.price.toFixed(0)}</span>
              <p className="text-xs text-surface-400 mt-1">(Inclusive of all taxes)</p>
            </div>

            {/* Add Button */}
            <div className="w-[120px]">
              {product.stock > 0 ? (
                quantity > 0 ? (
                  <div className="flex items-center justify-between w-full h-11 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-2 font-bold shadow-sm">
                    <button onClick={() => updateQuantity(product._id, quantity - 1)} className="p-1 hover:bg-emerald-100 rounded-lg transition-colors"><Minus className="w-5 h-5" /></button>
                    <span className="text-base">{quantity}</span>
                    <button onClick={() => updateQuantity(product._id, quantity + 1)} disabled={quantity >= product.stock} className="p-1 hover:bg-emerald-100 rounded-lg transition-colors disabled:opacity-30"><Plus className="w-5 h-5" /></button>
                  </div>
                ) : (
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full h-11 bg-white border border-emerald-600 text-emerald-600 font-bold text-sm rounded-xl hover:bg-emerald-50 transition-colors shadow-sm"
                  >
                    ADD
                  </button>
                )
              ) : (
                <div className="flex items-center justify-center h-11 bg-surface-100 text-surface-500 font-bold text-xs rounded-xl border border-surface-200 px-2 text-center">
                  Out of Stock
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-surface-900 text-sm">Product Details</h3>
            <p className="text-sm text-surface-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="divider" />

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Star, title: 'Top Rated', desc: 'Highly reviewed' },
              { icon: ShieldCheck, title: 'Best Quality', desc: 'Sourced fresh daily' },
            ].map((g, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface-50 border border-surface-200">
                <g.icon className="w-5 h-5 text-brand-600 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-surface-900">{g.title}</h4>
                  <p className="text-[10px] text-surface-500 mt-0.5">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
          
        </div>
      </div>

    </div>
  );
};

export default ProductDetailsPage;
