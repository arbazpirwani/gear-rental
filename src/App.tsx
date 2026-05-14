import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AgreementPage from './pages/AgreementPage';
import AboutPage from './pages/AboutPage';
import ThankYouPage from './pages/ThankYouPage';
import AdminPage from './pages/AdminPage';
import ReportPage from './pages/ReportPage';
import { CartContext } from './lib/cartContext';
import { AuthProvider } from './lib/authContext';
import { loadCart, saveCart } from './lib/storage';
import type { CartItem } from './types';

export default function App() {
  const [cart, setCart] = useState<CartItem[]>(() => loadCart());

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  return (
    <AuthProvider>
      <CartContext.Provider value={{ cart, setCart }}>
        <ScrollToTop />
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/thank-you" element={<ThankYouPage />} />
            <Route path="/agreement" element={<AgreementPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/report" element={<ReportPage />} />
          </Routes>
        </Layout>
      </CartContext.Provider>
    </AuthProvider>
  );
}
