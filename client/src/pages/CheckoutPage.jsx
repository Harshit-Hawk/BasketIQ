import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, CreditCard, CheckCircle2, 
  Truck, ArrowLeft, Loader2, Home, Building2, ChevronRight
} from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';


const CheckoutPage = () => {
  const { cartItems: cart = [], clearCart, getCartTotal } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Success
  const [address, setAddress] = useState('');
  const [addressType, setAddressType] = useState('Home');
  const [paymentMethod, setPaymentMethod] = useState('Razorpay Online Payment');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState(null);

  const subtotal = getCartTotal();
  const total = subtotal;

  useEffect(() => {
    if (cart.length === 0 && step !== 3) {
      navigate('/products');
    }
  }, [cart, navigate, step]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!address) return;
    
    setIsProcessing(true);
    try {
      const items = cart.map((item) => ({
        productId: item.productId._id,
        name: item.productId.name,
        quantity: item.quantity,
        price: item.productId.price,
      }));

      const orderData = {
        items,
        shippingAddress: `${addressType}: ${address}`,
        paymentMethod,
        totalPrice: total,
      };

      if (paymentMethod === 'Cash on Delivery') {
        const res = await API.post('/orders', orderData);
        setOrderSuccessId(res.data._id);
        clearCart();
        setStep(3);
      } else {
        // Razorpay Flow
        const isLoaded = await loadRazorpay();
        if (!isLoaded) {
          alert('Razorpay SDK failed to load. Are you online?');
          setIsProcessing(false);
          return;
        }

        // 1. Get Key
        const { data: { key } } = await API.get('/payment/key');

        // 2. Create Order on Backend
        const { data: order } = await API.post('/payment/create-order', { amount: total });

        // 3. Open Razorpay Modal
        const options = {
          key,
          amount: order.amount,
          currency: order.currency,
          name: 'BasketIQ',
          description: 'Grocery Purchase',
          order_id: order.id,
          handler: async function (response) {
            try {
              // 4. Verify Payment on Backend
              const verifyRes = await API.post('/payment/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                ...orderData, // Pass cart and address to save
              });

              setOrderSuccessId(verifyRes.data.order._id);
              clearCart();
              setStep(3);
            } catch (err) {
              console.error(err);
              alert('Payment verification failed!');
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
            contact: '9999999999', // Added contact to ensure UPI options render
          },
          theme: {
            color: '#059669', // Emerald 600
          },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
        
        // Handle modal close without payment
        paymentObject.on('payment.failed', function (response) {
          alert(`Payment Failed! Reason: ${response.error.description}`);
        });
      }
    } catch (err) {
      console.error('Failed to place order', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // SUCCESS SCREEN
  if (step === 3) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 bg-surface-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-card p-10 text-center border border-surface-200">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-display font-black text-surface-900 mb-2">Order Confirmed!</h2>
          <p className="text-surface-500 text-sm mb-6">Your items will be delivered shortly.</p>
          
          <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 mb-8">
            <p className="text-xs font-bold text-surface-500 uppercase">Order ID</p>
            <p className="font-mono text-surface-900 font-bold">#{orderSuccessId?.slice(-8).toUpperCase()}</p>
          </div>

          <Link to="/orders" className="btn-primary w-full py-4 text-sm shadow-sm justify-center mb-3">Track Order</Link>
          <Link to="/home" className="text-brand-600 font-bold text-sm hover:text-brand-700">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 min-h-[80vh]">
      
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/cart')} className="p-2 rounded-lg hover:bg-surface-100 text-surface-500 hover:text-surface-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-display font-black text-surface-900">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">
        
        {/* ── LEFT: FORM ── */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STEP 1: Address */}
          <div className={`bg-white rounded-2xl shadow-card border border-surface-200 p-6 sm:p-8 transition-opacity ${step !== 1 && 'opacity-50'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">1</div>
              <h2 className="font-bold text-lg text-surface-900">Delivery Address</h2>
            </div>
            
            <div className="space-y-5">
              {/* Type toggle */}
              <div className="flex gap-3">
                <button 
                  onClick={() => setAddressType('Home')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                    addressType === 'Home' ? 'bg-brand-50 border-brand-400 text-brand-700' : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
                  }`}
                >
                  <Home className="w-4 h-4" /> Home
                </button>
                <button 
                  onClick={() => setAddressType('Work')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                    addressType === 'Work' ? 'bg-brand-50 border-brand-400 text-brand-700' : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'
                  }`}
                >
                  <Building2 className="w-4 h-4" /> Work
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-surface-500 uppercase tracking-widest mb-2">
                  Complete Address
                </label>
                <textarea
                  rows="3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House/Flat No., Building Name, Street..."
                  className="input-field resize-none"
                  required
                />
              </div>

              {step === 1 && (
                <button
                  onClick={() => address.trim() ? setStep(2) : alert('Please enter your address')}
                  className="btn-primary w-full sm:w-auto px-8 py-3.5 shadow-sm"
                >
                  Deliver Here
                </button>
              )}
            </div>
          </div>

          {/* STEP 2: Payment */}
          <div className={`bg-white rounded-2xl shadow-card border border-surface-200 p-6 sm:p-8 transition-opacity ${step !== 2 && 'opacity-50 pointer-events-none'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step === 2 ? 'bg-brand-600 text-white' : 'bg-surface-100 text-surface-400'}`}>2</div>
                <h2 className="font-bold text-lg text-surface-900">Payment Method</h2>
              </div>
              {step === 2 && (
                <button onClick={() => setStep(1)} className="text-sm font-bold text-brand-600 hover:text-brand-700">Change Address</button>
              )}
            </div>
            
            <div className="space-y-3">
              {[
                { id: 'Razorpay Online Payment', icon: CreditCard, label: 'Pay Online (Card, UPI, NetBanking)' },
                { id: 'Cash on Delivery',        icon: Truck,      label: 'Cash on Delivery' },
              ].map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-colors ${
                    paymentMethod === method.id 
                      ? 'bg-brand-50 border-brand-400' 
                      : 'bg-white border-surface-200 hover:bg-surface-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="w-4 h-4 text-brand-500 border-surface-300 focus:ring-brand-500"
                  />
                  <div className="flex items-center gap-3 text-surface-900 font-bold text-sm">
                    <method.icon className="w-5 h-5 text-surface-500" />
                    {method.label}
                  </div>
                </label>
              ))}
            </div>

            {step === 2 && (
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="btn-primary w-full py-3.5 sm:py-4 text-base sm:text-lg mt-6 shadow-sm justify-between px-6"
              >
                <span>Pay ₹{total.toFixed(0)}</span>
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT: SUMMARY ── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-card border border-surface-200 p-4 sm:p-5 lg:sticky lg:top-28">
            <h3 className="font-bold text-sm text-surface-900 mb-4 pb-4 border-b border-surface-100">Order Summary</h3>
            
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar mb-4">
              {cart.map((item) => (
                <div key={item.productId._id} className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg bg-surface-50 border border-surface-100 overflow-hidden shrink-0 relative">
                    <img src={item.productId.image} alt={item.productId.name} className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-surface-900 truncate">{item.productId.name}</h4>
                    <p className="text-xs text-surface-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-surface-900 text-sm">
                    ₹{(item.productId.price * item.quantity).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm pt-4 border-t border-surface-100">
              <div className="flex justify-between text-surface-600">
                <span>Items total</span>
                <span className="text-surface-900">₹{subtotal.toFixed(0)}</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-surface-200 flex justify-between items-center">
              <span className="text-surface-900 font-bold">Grand Total</span>
              <span className="font-bold text-xl text-surface-900">₹{total.toFixed(0)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;
