import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, ShieldCheck, Sparkles, Leaf } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import API from '../services/api';

const CartPage = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    getCartCount,
  } = useContext(CartContext);
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchCartRecommendations = async () => {
      if (cartItems.length === 0) return;
      try {
        const seedId = cartItems[0].productId._id || cartItems[0].productId;
        const { data } = await API.get(`/recommendations/${seedId}`);
        setRecommendations(data);
      } catch (err) {
        // Gracefully handle missing recommendation service
      }
    };
    fetchCartRecommendations();
  }, [cartItems]);

  const subtotal = getCartTotal();
  const delivery = subtotal > 30 || subtotal === 0 ? 0 : 4.99;
  const total = subtotal + delivery;

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-xl mx-auto card p-10 text-center shadow-elevated">
          <div className="w-20 h-20 bg-surface-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-surface-300" />
          </div>
          <h2 className="text-2xl font-black text-surface-900">Your Basket is Empty</h2>
          <p className="text-surface-500 text-sm mt-2 max-w-sm mx-auto">
            Add fresh organic fruits, vegetables, bakery essentials, and dairy items to your cart.
          </p>
          <Link
            to="/products"
            className="btn-primary mt-8 inline-flex"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div>
        <h1 className="section-title">Shopping Basket</h1>
        <p className="section-subtitle">Review your fresh groceries before placing order ({getCartCount()} items)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5 space-y-0">
            {cartItems.map((item, index) => {
              const prod = item.productId;
              const id = prod._id || prod;
              const name = prod.name || 'Grocery Item';
              const price = prod.price || 0;
              const image = prod.image || '';
              const category = prod.category || 'Grocery';
              
              return (
                <div
                  key={id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-5 ${
                    index !== cartItems.length - 1 ? 'border-b border-surface-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-surface-50 border border-surface-100 flex-shrink-0">
                      <img src={image} alt={name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="badge-brand text-[10px]">
                        {category}
                      </span>
                      <h3 className="font-bold text-surface-800 text-base mt-1">{name}</h3>
                      <p className="text-surface-500 text-sm">₹{price.toFixed(2)} each</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 self-stretch sm:self-auto">
                    <div className="flex items-center gap-1 bg-surface-50 border border-surface-200 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(id, item.quantity - 1)}
                        className="p-1.5 hover:bg-white rounded-lg text-surface-600 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm text-surface-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(id, item.quantity + 1)}
                        className="p-1.5 hover:bg-white rounded-lg text-surface-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-bold text-surface-900 text-base min-w-[65px] text-right">
                        ₹{(price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeFromCart(id)}
                        className="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <div className="card p-6 shadow-elevated space-y-6 sticky top-28">
            <h3 className="font-bold text-surface-900 text-lg">Order Summary</h3>

            <div className="space-y-3.5 border-b border-surface-100 pb-5 text-sm">
              <div className="flex justify-between text-surface-500">
                <span>Subtotal</span>
                <span className="font-semibold text-surface-800">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-surface-500">
                <span>Delivery</span>
                <span className="font-semibold text-surface-800">
                  {delivery === 0 ? <span className="text-brand-600 font-bold">FREE</span> : `₹${delivery.toFixed(2)}`}
                </span>
              </div>
              {delivery > 0 && (
                <p className="text-[11px] text-brand-600 font-semibold bg-brand-50 p-2.5 rounded-xl">
                  💡 Add ₹{(30 - subtotal).toFixed(2)} more for FREE shipping!
                </p>
              )}
            </div>

            <div className="flex justify-between text-base">
              <span className="font-bold text-surface-900">Total Amount</span>
              <span className="font-black text-brand-600 text-xl">₹{total.toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full py-4"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-surface-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              <span>Secure checkout powered by BasketIQ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {cartItems.length > 0 && recommendations.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-surface-200">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="section-title text-xl sm:text-2xl">You Might Also Need</h2>
              <p className="section-subtitle text-xs">AI-powered recommendations based on your basket</p>
            </div>
          </div>

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
                    onClick={() => updateQuantity(prod._id, 1)}
                    className="p-2 bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white rounded-lg transition-all duration-200 active:scale-95"
                    title="Add to Cart"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CartPage;
