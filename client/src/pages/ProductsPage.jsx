import { useState, useEffect, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, ShoppingBag, X, Info, ChevronRight } from 'lucide-react';
import API from '../services/api';
import { CartContext } from '../context/CartContext';

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Dairy', 'Bakery', 'Beverages', 'Snacks'];

const FALLBACK_PRODUCTS = [
  { _id: '1', name: 'Organic Fresh Bananas', category: 'Fruits', price: 2.99, stock: 50, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=60', description: 'Fresh organic yellow bananas.' },
  { _id: '2', name: 'Fresh Red Strawberries', category: 'Fruits', price: 4.49, stock: 30, image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop&q=60', description: 'Delicious juicy red strawberries.' },
  { _id: '3', name: 'Whole Wheat Bread', category: 'Bakery', price: 3.29, stock: 20, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60', description: 'Freshly baked wheat bread loaf.' },
  { _id: '4', name: 'Fresh Organic Broccoli', category: 'Vegetables', price: 1.99, stock: 40, image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?w=500&auto=format&fit=crop&q=60', description: 'Crisp green organic broccoli.' },
  { _id: '5', name: 'Organic Whole Milk', category: 'Dairy', price: 3.89, stock: 25, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=60', description: 'Fresh organic whole pasteurized milk.' },
  { _id: '6', name: 'Fresh Potato Chips', category: 'Snacks', price: 2.49, stock: 60, image: 'https://images.unsplash.com/photo-1566478989037-eec170784d20?w=500&auto=format&fit=crop&q=60', description: 'Crispy salted potato chips.' },
];

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('name-asc');
  
  const categoryParam = searchParams.get('category') || 'All';
  const searchParam = searchParams.get('search') || '';
  
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let query = '';
        if (categoryParam !== 'All') {
          query += `category=${encodeURIComponent(categoryParam)}&`;
        }
        if (searchParam) {
          query += `search=${encodeURIComponent(searchParam)}&`;
        }
        
        const { data } = await API.get(`/products?${query}`);
        setProducts(data.length > 0 ? data : FALLBACK_PRODUCTS.filter(p => {
          const matchCat = categoryParam === 'All' || p.category === categoryParam;
          const matchSearch = !searchParam || p.name.toLowerCase().includes(searchParam.toLowerCase());
          return matchCat && matchSearch;
        }));
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts(FALLBACK_PRODUCTS.filter(p => {
          const matchCat = categoryParam === 'All' || p.category === categoryParam;
          const matchSearch = !searchParam || p.name.toLowerCase().includes(searchParam.toLowerCase());
          return matchCat && matchSearch;
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryParam, searchParam]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortOption === 'price-asc') return a.price - b.price;
    if (sortOption === 'price-desc') return b.price - a.price;
    if (sortOption === 'name-desc') return b.name.localeCompare(a.name);
    return a.name.localeCompare(b.name);
  });

  const handleCategorySelect = (category) => {
    const params = new URLSearchParams(searchParams);
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-surface-200 pb-6 gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-surface-400 mb-2">
            <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-surface-700 font-medium">Shop</span>
            {categoryParam !== 'All' && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-surface-700 font-medium">{categoryParam}</span>
              </>
            )}
          </div>
          <h1 className="section-title">
            {categoryParam !== 'All' ? categoryParam : 'Fresh Groceries'}
          </h1>
          <p className="section-subtitle">
            {searchParam ? `Showing results for "${searchParam}"` : 'Browse and filter high quality organic ingredients'}
          </p>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <label className="text-xs font-bold text-surface-500 uppercase tracking-wider">Sort by</label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="input-field py-2 px-3 w-auto rounded-xl text-sm"
          >
            <option value="name-asc">A-Z</option>
            <option value="name-desc">Z-A</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card p-5 space-y-4 sticky top-28">
            <h3 className="font-bold text-surface-900 text-base flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-500" />
              <span>Categories</span>
            </h3>
            <div className="flex flex-wrap lg:flex-col gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`w-auto lg:w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    categoryParam === cat
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                      : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {(categoryParam !== 'All' || searchParam) && (
              <button
                onClick={handleClearFilters}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-surface-300 text-surface-500 hover:text-brand-600 hover:border-brand-500 rounded-xl text-sm font-medium transition-colors mt-2"
              >
                <X className="w-4 h-4" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-3 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
              <p className="text-surface-500 text-sm">Fetching fresh items...</p>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="card p-12 text-center max-w-lg mx-auto">
              <Info className="w-12 h-12 text-surface-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-surface-900">No Groceries Found</h3>
              <p className="text-surface-500 text-sm mt-2">We couldn't find any products matching your selection. Try adjusting your search or filters.</p>
              <button
                onClick={handleClearFilters}
                className="btn-primary mt-6 text-sm"
              >
                Browse All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {sortedProducts.map((prod) => (
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
                        <span className="text-surface-400">(24)</span>
                      </div>
                      <Link to={`/products/${prod._id}`} className="block mt-1 font-bold text-surface-800 hover:text-brand-600 text-base truncate transition-colors">
                        {prod.name}
                      </Link>
                      <p className="text-xs text-surface-400 mt-1 line-clamp-2">{prod.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-100">
                    <div className="flex flex-col">
                      <span className="text-lg font-black text-surface-900">₹{prod.price.toFixed(2)}</span>
                      <span className={`text-[10px] font-bold ${prod.stock > 0 ? 'text-brand-600' : 'text-red-500'}`}>
                        {prod.stock > 0 ? `${prod.stock} in stock` : 'Out of stock'}
                      </span>
                    </div>
                    <button
                      onClick={() => addToCart(prod, 1)}
                      disabled={prod.stock === 0}
                      className="p-2.5 bg-brand-50 hover:bg-brand-500 disabled:bg-surface-100 disabled:text-surface-400 text-brand-600 hover:text-white rounded-xl transition-all duration-200 active:scale-95"
                      title={prod.stock > 0 ? "Add to Cart" : "Out of stock"}
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
