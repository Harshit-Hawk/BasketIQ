import { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import LandingPage from '../pages/LandingPage';
import HomePage from '../pages/HomePage';
import ProductsPage from '../pages/ProductsPage';
import ProductDetailsPage from '../pages/ProductDetailsPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrdersPage from '../pages/OrdersPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import ProfilePage from '../pages/ProfilePage';
import DeliveryDashboardPage from '../pages/DeliveryDashboardPage';
import Layout from '../layouts/Layout';
import { ProtectedRoute, AdminRoute, DeliveryRoute } from '../components/ProtectedRoute';
import { AuthContext } from '../context/AuthContext';

const AppRoutes = () => {
  const { user } = useContext(AuthContext);

  const location = useLocation();

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Root: Landing page for guests, Home page for logged-in users */}
          <Route
            path="/"
            element={<PageTransition>{user ? <Navigate to="/home" replace /> : <LandingPage />}</PageTransition>}
          />

          {/* Home — post-login dashboard (protected) */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <PageTransition><HomePage /></PageTransition>
              </ProtectedRoute>
            }
          />

          {/* Product Routes */}
          <Route path="/products" element={<PageTransition><ProductsPage /></PageTransition>} />
          <Route path="/products/:id" element={<PageTransition><ProductDetailsPage /></PageTransition>} />

          {/* Auth Routes */}
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route path="/register" element={<PageTransition><RegisterPage /></PageTransition>} />

          {/* Protected Customer Routes */}
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <PageTransition><CartPage /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <PageTransition><CheckoutPage /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <PageTransition><OrdersPage /></PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <PageTransition><ProfilePage /></PageTransition>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <PageTransition><AdminDashboardPage /></PageTransition>
              </AdminRoute>
            }
          />

          {/* Delivery Routes */}
          <Route
            path="/delivery/dashboard"
            element={
              <DeliveryRoute>
                <PageTransition><DeliveryDashboardPage /></PageTransition>
              </DeliveryRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
};

export default AppRoutes;
