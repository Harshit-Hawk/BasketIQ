import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingBag, Plus, Minus, ShieldCheck, Heart, Truck, Sparkles, ChevronRight, Leaf } from 'lucide-react';
import API from '../services/api';
import { CartContext } from '../context/CartContext';

const FALLBACK_PRODUCT = {
  _id: '1',
  name: 'Organic Fresh Bananas',
  category: 'Fruits',
  price: 2.99,
  stock: 50,
  image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&auto=format&fit=crop&q=80',
  description: 'Premium sweet organic bananas sourced from eco-friendly sustainable farms. Excellent source of potassium, vitamin B6, and prebiotic fiber to boost your energy levels and digestive system health throughout the day.',
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);

  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        let prodData;
        try {
          const { data } = await API.get(`/products/${id}`);
          prodData = data;
          setProduct(data);
        } catch (err) {
          console.warn('Backend product endpoint failed, using fallback.');
          prodData = FALLBACK_PRODUCT;
          setProduct(FALLBACK_PRODUCT);
        }

        try {
          const { data } = await API.get(`/recommendations/${id}`);
          setRecommendations(data);
        } catch (recErr) {
          console.warn('Recommendations endpoint failed, fetching same-category fallbacks.');
          const { data: allProds } = await API.get(`/products?category=${encodeURIComponent(prodData.category)}`);
          setRecommendations(allProds.filter(p => p._id !== id).slice(0, 4));
        }

      } catch (err) {
        setError('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
    setQuantity(1);
    setAddedToCart(false);
  }, [id]);

  const handleIncrement = () => {
    if (quantity < (product?.stock || 10)) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-10 h-10 border-3 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
        <p className="text-surface-500 text-sm">Harvesting product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="card p-12 text-center max-w-lg mx-auto">
          <h3 className="text-lg font-bold text-surface-900">Oops! Product Not Found</h3>
          <p className="text-surface-500 text-sm mt-2">{error || 'This grocery item might be out of season or discontinued.'}</p>
          <Link to="/products" className="btn-primary mt-6 text-sm">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-surface-400">
        <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/products" className="hover:text-brand-600 transition-colors">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to={`/products?category=${product.category}`} className="hover:text-brand-600 transition-colors">{product.category}</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-surface-700 font-medium truncate max-w-[200px]">{product.name}</span>
      </div>

      {/* Product Detail Card */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10 card p-6 sm:p-8">
        {/* Image */}
        <div className="aspect-square w-full rounded-2xl overflow-hidden bg-surface-50 relative border border-surface-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <span className="absolute top-4 left-4 badge-brand text-xs px-3 py-1.5">
            {product.category}
          </span>
        </div>

        {/* Details */}
        <div className="flex flex-col justify-between py-2 space-y-6">
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-amber-400" />
                ))}
              </div>
              <span className="font-bold text-surface-800">4.8</span>
              <span className="text-surface-400">|</span>
              <span className="text-surface-500">12 Reviews</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-surface-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            <p className="text-3xl font-black bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">
              ₹{product.price.toFixed(2)}
            </p>

            <p className="text-surface-500 text-sm leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-6 pt-6 border-t border-surface-100">
            {/* Stock & Quantity */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-1.5">
                  Availability
                </span>
                <span className={`badge ${
                  product.stock > 0
                    ? 'bg-brand-50 text-brand-700'
                    : 'bg-red-50 text-red-600'
                }`}>
                  {product.stock > 0 ? `${product.stock} items left` : 'Out of Stock'}
                </span>
              </div>

              {product.stock > 0 && (
                <div>
                  <span className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-1.5">
                    Quantity
                  </span>
                  <div className="flex items-center gap-1 bg-surface-50 border border-surface-200 rounded-xl p-1 max-w-[140px]">
                    <button
                      onClick={handleDecrement}
                      className="p-1.5 hover:bg-white rounded-lg text-surface-600 hover:shadow-sm transition-all"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="flex-1 text-center font-bold text-sm text-surface-800">{quantity}</span>
                    <button
                      onClick={handleIncrement}
                      className="p-1.5 hover:bg-white rounded-lg text-surface-600 hover:shadow-sm transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 btn-primary py-4 text-base ${addedToCart ? 'bg-brand-600' : ''}`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{addedToCart ? '✓ Added to Cart!' : `Add ${quantity} to Cart`}</span>
              </button>
              <button className="p-4 border border-surface-200 hover:bg-surface-50 active:scale-[0.97] rounded-2xl transition-all">
                <Heart className="w-5 h-5 text-surface-400 hover:text-red-400" />
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Truck, text: 'Same day delivery' },
                { icon: ShieldCheck, text: 'Quality guarantee' },
                { icon: Leaf, text: '100% organic' },
                { icon: Sparkles, text: 'AI recommended' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-xs text-surface-500 bg-surface-50 rounded-xl px-3 py-2.5">
                  <item.icon className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recommendations */}
      <section className="space-y-6">
        <div className="flex items-center gap-2.5">
          <span className="p-2 bg-brand-50 text-brand-600 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </span>
          <div>
            <h2 className="section-title text-xl sm:text-2xl">Frequently Bought Together</h2>
            <p className="section-subtitle text-xs">AI-powered recommendations</p>
          </div>
        </div>

        {recommendations.length === 0 ? (
          <p className="text-surface-400 text-sm">No related products found at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {recommendations.map((prod) => (
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
                    <span className="absolute top-2 left-2 badge-brand text-[10px]">
                      {prod.category}
                    </span>
                  </Link>
                  <div>
                    <Link to={`/products/${prod._id}`} className="block font-bold text-surface-800 hover:text-brand-600 text-sm truncate transition-colors">
                      {prod.name}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-100">
                  <span className="text-sm font-black text-surface-900">₹{prod.price.toFixed(2)}</span>
                  <button
                    onClick={() => addToCart(prod, 1)}
                    className="p-2 bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white rounded-lg transition-all duration-200 active:scale-95"
                    title="Add to Cart"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDetailsPage;
