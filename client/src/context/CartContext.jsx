import { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import API from '../services/api';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch cart items when user logs in
  useEffect(() => {
    const fetchCart = async () => {
      if (user) {
        try {
          setLoading(true);
          const { data } = await API.get('/cart');
          setCartItems((data.products || []).filter((item) => item.productId));
        } catch (error) {
          console.error('Error fetching cart:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // Fallback to local storage for guests
        const localCart = localStorage.getItem('cartItems');
        setCartItems(localCart ? JSON.parse(localCart) : []);
      }
    };
    fetchCart();
  }, [user]);

  // Sync guest cart to localstorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addToCart = async (product, quantity = 1) => {
    if (user) {
      try {
        const { data } = await API.post('/cart/add', {
          productId: product._id,
          quantity,
        });
        setCartItems((data.products || []).filter((item) => item.productId));
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    } else {
      setCartItems((prev) => {
        const exists = prev.find((item) => item.productId._id === product._id || item.productId === product._id);
        if (exists) {
          return prev.map((item) =>
            (item.productId._id === product._id || item.productId === product._id)
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }
        return [...prev, { productId: product, quantity }];
      });
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (user) {
      try {
        const { data } = await API.put('/cart/update', {
          productId,
          quantity,
        });
        setCartItems((data.products || []).filter((item) => item.productId));
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          (item.productId._id === productId || item.productId === productId)
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const removeFromCart = async (productId) => {
    if (user) {
      try {
        const { data } = await API.delete(`/cart/remove?productId=${productId}`);
        setCartItems((data.products || []).filter((item) => item.productId));
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    } else {
      setCartItems((prev) =>
        prev.filter((item) => item.productId._id !== productId && item.productId !== productId)
      );
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    if (user) {
      try {
        await API.delete('/cart/clear'); // Optional API endpoint, we can fallback or implement it.
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    } else {
      localStorage.removeItem('cartItems');
    }
  };

  const getCartCount = () => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = item.productId?.price || 0;
      return acc + price * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartCount,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
