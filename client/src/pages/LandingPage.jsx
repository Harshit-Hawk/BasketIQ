import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Truck, ShieldCheck, Star, ShoppingBag, 
  ArrowRight, Clock, MapPin, Zap
} from 'lucide-react';
import TiltCard from '../components/TiltCard';

const CATEGORIES = [
  { name: 'Vegetables & Fruits', image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=500&q=80' },
  { name: 'Dairy & Breakfast',   image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&q=80' },
  { name: 'Munchies',            image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bb087?w=500&q=80' },
  { name: 'Cold Drinks & Juices',image: 'https://images.unsplash.com/photo-1527960656366-ee2a999e3286?w=500&q=80' },
  { name: 'Instant & Frozen',    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80' },
  { name: 'Bakery & Biscuits',   image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&q=80' },
];

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(searchQuery.trim() ? `/products?search=${encodeURIComponent(searchQuery.trim())}` : '/products');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="bg-surface-50 min-h-screen pb-20 overflow-hidden">
      
      {/* ── PREMIUM CINEMATIC HERO ── */}
      <section className="relative pt-16 pb-24 sm:pt-24 sm:pb-32 lg:pt-32 lg:pb-40 overflow-hidden bg-[#020617]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000" 
            alt="Fresh Groceries" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-brand-900/40 to-transparent mix-blend-color"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mb-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-white font-medium text-sm"
          >
            <Star className="w-4 h-4 text-brand-400" />
            <span>Premium Quality Guaranteed</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="font-display font-black text-3xl sm:text-5xl md:text-7xl lg:text-8xl text-white leading-[1.1] tracking-tight max-w-5xl mb-6 sm:mb-8 drop-shadow-2xl"
          >
            Fresh groceries, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-500">
              delivered to your door.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="text-base sm:text-lg md:text-xl text-surface-300 font-medium max-w-2xl mb-8 sm:mb-12 px-2 sm:px-0"
          >
            Skip the supermarket lines. Get farm-fresh produce, daily essentials, and premium quality products right to your door.
          </motion.p>
          
          {/* 3D Tilted Search Bar */}
          <TiltCard className="w-full max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 p-2 md:p-3 rounded-2xl shadow-2xl"
            >
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-white/50" />
                  <input
                    type="text"
                    placeholder="Search for atta, dal, milk..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-12 md:pl-14 pr-4 py-3 md:py-4 bg-white/10 hover:bg-white/20 focus:bg-white/20 transition-colors rounded-xl outline-none text-white placeholder:text-white/50 font-medium text-base md:text-lg border border-transparent focus:border-brand-400 focus:ring-4 focus:ring-brand-400/20"
                  />
                </div>
                <button type="submit" className="bg-brand-600 text-white px-6 md:px-10 py-3 md:py-4 rounded-xl font-black text-base md:text-lg hover:bg-brand-500 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-600/30">
                  Search
                </button>
              </form>
            </motion.div>
          </TiltCard>

        </div>
      </section>

      {/* ── CATEGORIES (3D Tilt Cards) ── */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-20 relative z-20">
        <div className="bg-white/80 glass-panel border border-white rounded-2xl sm:rounded-3xl shadow-elevated p-4 sm:p-6 lg:p-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-6 sm:mb-10">
            <div>
              <h2 className="text-xl sm:text-3xl font-display font-black text-surface-900">Shop by Category</h2>
              <p className="text-surface-500 mt-1 font-medium text-sm">Explore our wide variety of fresh products</p>
            </div>
            <Link to="/products" className="group flex items-center gap-2 text-brand-600 font-bold hover:text-brand-700">
              See All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6"
          >
            {CATEGORIES.map((cat, i) => (
              <motion.div key={i} variants={itemVariants} className="h-full">
                <TiltCard className="h-full">
                  <Link to={`/products?category=${encodeURIComponent(cat.name.split(' ')[0])}`}
                    className="group flex flex-col items-center gap-4 p-3 bg-white rounded-2xl border border-surface-100 shadow-sm hover:shadow-xl hover:border-brand-200 transition-all duration-300 h-full">
                    <div className="w-full aspect-square rounded-xl bg-surface-50 overflow-hidden relative">
                      <div className="absolute inset-0 bg-brand-500/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-overlay"></div>
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" />
                    </div>
                    <p className="text-sm font-bold text-surface-800 text-center leading-tight group-hover:text-brand-600 px-1">{cat.name}</p>
                  </Link>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES (Animated Slide-ups) ── */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-24">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            { icon: Star, title: 'Top Quality Assured', desc: 'Get the freshest, highest quality products delivered safely to your doorstep.' },
            { icon: ShieldCheck, title: 'Best Prices & Offers', desc: 'Cheaper prices than your local supermarket, great cashback offers to top it off.' },
            { icon: Truck, title: 'Wide Assortment', desc: 'Choose from 5000+ products across food, personal care, household, bakery, veg and non-veg & other categories.' },
          ].map((f, i) => (
            <motion.div key={i} variants={itemVariants}>
              <TiltCard>
                <div className="flex flex-col items-center text-center gap-5 p-8 rounded-3xl bg-white border border-surface-200 shadow-sm hover:shadow-elevated transition-all duration-300 h-full">
                  <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center border border-brand-100 shadow-inner">
                    <f.icon className="w-8 h-8 text-brand-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-surface-900 mb-2">{f.title}</h3>
                    <p className="text-surface-500 leading-relaxed font-medium">{f.desc}</p>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

    </div>
  );
}
