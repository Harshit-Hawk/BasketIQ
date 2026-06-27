import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, Minus, Plus, ShieldCheck, Truck, Clock } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import API from '../services/api';


const CartPage = () => {
  const { cartItems: cart = [], removeFromCart, updateQuantity, getCartTotal } = useContext(CartContext);
  const navigate = useNavigate();
  
  const [recommendations, setRecommendations] = useState([]);

  const subtotal = getCartTotal();
  const total = subtotal;

  useEffect(() => {
    if (cart.length > 0) fetchRecommendations();
  }, [cart]);

  const fetchRecommendations = async () => {
    try {
      const res = await API.get('/products');
      const cartIds = cart.map(item => item.productId._id);
      const recs = res.data
        .filter(p => !cartIds.includes(p._id) && p.stock > 0)
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
      setRecommendations(recs);
    } catch (err) {
      console.error('Failed to fetch recommendations', err);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 sm:py-32 flex justify-center min-h-[70vh]">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-32 h-32 mx-auto rounded-full bg-surface-100 flex items-center justify-center">
            <ShoppingCart className="w-16 h-16 text-surface-400" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-black text-surface-900">Your cart is empty</h2>
            <p className="text-surface-500 mt-2 mb-8 text-sm">Add items to it now.</p>
          </div>
          <Link to="/products" className="btn-primary w-full py-4 text-base shadow-sm">
            Shop now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-8 min-h-[80vh]">
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-black text-surface-900">Review your cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
        
        {/* ── LEFT: CART ITEMS ── */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="bg-white rounded-2xl shadow-card border border-surface-200 p-1 divide-y divide-surface-100">


            {cart.map((item) => (
              <div key={item.productId._id} className="p-4 flex flex-row items-center gap-4">
                
                <Link to={`/products/${item.productId._id}`} className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-surface-100 bg-surface-50">
                  <img src={item.productId.image} alt={item.productId.name} className="w-full h-full object-cover mix-blend-multiply" />
                </Link>

                <div className="flex-1 min-w-0 w-full flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
                  <div>
                    <Link to={`/products/${item.productId._id}`}>
                      <h3 className="font-medium text-sm text-surface-900 hover:text-brand-600 transition-colors line-clamp-2">
                        {item.productId.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-surface-500 mt-1">{item.productId.category}</p>
                    <p className="font-bold text-surface-900 text-sm mt-1">₹{item.productId.price.toFixed(0)}</p>
                  </div>
                  
                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 shrink-0">
                    <div className="flex items-center justify-between w-[90px] h-9 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-2 font-bold shadow-sm">
                      <button onClick={() => updateQuantity(item.productId._id, item.quantity - 1)} className="p-1 hover:bg-emerald-100 rounded transition-colors"><Minus className="w-4 h-4" /></button>
                      <span className="text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId._id, item.quantity + 1)} disabled={item.quantity >= item.productId.stock} className="p-1 hover:bg-emerald-100 rounded transition-colors disabled:opacity-30"><Plus className="w-4 h-4" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.productId._id)} className="text-xs font-bold text-surface-400 hover:text-rose-600 transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ── RIGHT: SUMMARY ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-card border border-surface-200 p-5 lg:sticky lg:top-28">
            
            <h3 className="font-bold text-sm text-surface-900 mb-3">Bill Details</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-surface-600">
                <span>Items total</span>
                <span className="text-surface-900">₹{subtotal.toFixed(0)}</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-surface-100">
              <div className="flex justify-between items-center mb-5">
                <span className="text-surface-900 font-bold">Grand Total</span>
                <span className="font-bold text-lg text-surface-900">₹{total.toFixed(0)}</span>
              </div>
              
              <button onClick={() => navigate('/checkout')} className="w-full btn-primary py-3.5 text-base shadow-sm justify-between px-6">
                <span>₹{total.toFixed(0)}</span>
                <span className="flex items-center gap-1">Checkout <ChevronRight className="w-4 h-4" /></span>
              </button>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

// Assuming you want to use ChevronRight in the button
import { ChevronRight } from 'lucide-react';

export default CartPage;
